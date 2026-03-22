from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
import os

from database import get_db, Supplier, Document
from services.blockchain import mint_credential, revoke_credential, verify_supplier_onchain
from services.email import send_rejection_email, send_approval_email

router = APIRouter()
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "verifychain-admin-secret-change-me")
MAX_ATTEMPTS = 3

def require_admin(x_admin_secret: str = Header(...)):
    if x_admin_secret != ADMIN_SECRET:
        raise HTTPException(401, "Unauthorized")

@router.get("/queue", dependencies=[Depends(require_admin)])
async def get_queue(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Supplier).where(Supplier.status == "pending").order_by(Supplier.created_at.asc())
    )
    suppliers = result.scalars().all()
    return [
        {
            "id": s.id, "wallet": s.wallet, "companyName": s.company_name,
            "taxId": s.tax_id, "country": s.country, "tier": s.tier,
            "docsIPFS": s.docs_ipfs, "submittedAt": s.created_at.isoformat(),
            "attemptCount": getattr(s, "attempt_count", 1),
            "rejectionReason": getattr(s, "rejection_reason", None),
            "email": s.email,
        }
        for s in suppliers
    ]

@router.get("/suppliers", dependencies=[Depends(require_admin)])
async def get_all_suppliers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).order_by(Supplier.created_at.desc()))
    suppliers = result.scalars().all()
    return [
        {
            "id": s.id, "wallet": s.wallet, "companyName": s.company_name,
            "taxId": s.tax_id, "country": s.country, "status": s.status,
            "tier": s.tier, "tokenId": s.token_id, "email": s.email,
            "attemptCount": getattr(s, "attempt_count", 1),
            "rejectionReason": getattr(s, "rejection_reason", None),
            "expiresAt": s.expires_at.isoformat() if s.expires_at else None,
            "createdAt": s.created_at.isoformat(),
        }
        for s in suppliers
    ]

class ApproveBody(BaseModel):
    tier: int = 2

@router.post("/approve/{supplier_id}", dependencies=[Depends(require_admin)])
async def approve_supplier(supplier_id: int, body: ApproveBody, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(404, "Supplier not found")
    if supplier.status == "approved":
        raise HTTPException(400, "Already approved")

    # ISSUE 5: Check if wallet already has a credential on-chain — skip mint if so
    tx_hash = "already_on_chain"
    already_on_chain = False
    try:
        onchain = verify_supplier_onchain(supplier.wallet)
        if onchain.get("isValid"):
            already_on_chain = True
    except Exception:
        pass

    if not already_on_chain:
        # Sanitise docs hash: strip local: prefix before storing on-chain
        docs_ipfs_hash = supplier.docs_ipfs or "ipfs://none"
        if docs_ipfs_hash.startswith("local:"):
            docs_ipfs_hash = "ipfs://local"
        try:
            tx_hash, success, token_id = mint_credential(
                supplier_wallet=supplier.wallet, company_name=supplier.company_name,
                tax_id=supplier.tax_id, country=supplier.country,
                docs_ipfs_hash=docs_ipfs_hash, tier=body.tier,
            )
        except Exception as e:
            raise HTTPException(500, f"Blockchain mint failed: {str(e)}")
        if not success:
            raise HTTPException(500, "Transaction reverted on-chain")
        if token_id is not None:
            supplier.token_id = token_id

    supplier.status = "approved"
    supplier.tier = body.tier
    supplier.approved_at = datetime.utcnow()
    validity = supplier.validity_days if supplier.validity_days else 365
    supplier.expires_at = datetime.utcnow() + timedelta(days=validity)
    try:
        supplier.rejection_reason = None
    except:
        pass
    await db.commit()
    expires_str = supplier.expires_at.strftime("%B %d, %Y") if supplier.expires_at else "1 year"
    send_approval_email(
        to_email=supplier.email or "",
        company_name=supplier.company_name,
        token_id=supplier.token_id or 0,
        tier=body.tier,
        expires_at=expires_str,
        wallet=supplier.wallet,
    )
    return {"success": True, "txHash": tx_hash, "supplierId": supplier_id}

class RejectBody(BaseModel):
    reason: str = "Does not meet verification requirements"

@router.post("/reject/{supplier_id}", dependencies=[Depends(require_admin)])
async def reject_supplier(supplier_id: int, body: RejectBody, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(404, "Supplier not found")
    attempt = getattr(supplier, "attempt_count", 1)
    attempts_left = MAX_ATTEMPTS - attempt
    supplier.status = "rejected"
    try:
        supplier.rejection_reason = body.reason
    except:
        pass
    await db.commit()
    send_rejection_email(
        to_email=supplier.email or "",
        company_name=supplier.company_name,
        reason=body.reason,
        attempts_left=attempts_left,
    )
    return {
        "success": True, "reason": body.reason,
        "attemptCount": attempt, "canReapply": attempts_left > 0,
        "attemptsLeft": attempts_left,
    }

class RevokeBody(BaseModel):
    reason: str
    token_id: int

@router.post("/revoke/{supplier_id}", dependencies=[Depends(require_admin)])
async def revoke_supplier(supplier_id: int, body: RevokeBody, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).where(Supplier.id == supplier_id))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(404, "Supplier not found")
    try:
        tx_hash, success = revoke_credential(body.token_id, body.reason)
    except Exception as e:
        raise HTTPException(500, f"Revoke failed: {str(e)}")
    supplier.status = "revoked"
    await db.commit()
    return {"success": True, "txHash": tx_hash}


API_BASE = os.getenv("API_BASE_URL", "")

@router.get("/supplier/{supplier_id}/documents", dependencies=[Depends(require_admin)])
async def get_supplier_documents(supplier_id: int, db: AsyncSession = Depends(get_db)):
    """Return all uploaded documents for a supplier so admin can view/download each one."""
    result = await db.execute(
        select(Document).where(Document.supplier_id == supplier_id).order_by(Document.uploaded_at)
    )
    docs = result.scalars().all()
    doc_labels = {
        "cac_cert":     "CAC / Business Registration",
        "tax_cert":     "Tax Clearance Certificate",
        "bank_details": "Bank Confirmation Letter",
        "id_doc":       "Director / ID Document",
    }
    return [
        {
            "id":         d.id,
            "docType":    d.doc_type,
            "label":      doc_labels.get(d.doc_type, d.doc_type),
            "filename":   d.filename,
            "cid":        d.ipfs_cid,
            "isLocal":    d.ipfs_cid.startswith("local:"),
            "localName":  d.ipfs_cid[6:] if d.ipfs_cid.startswith("local:") else None,
            "ipfsUrl":    f"https://w3s.link/ipfs/{d.ipfs_cid}" if not d.ipfs_cid.startswith("local:") else None,
            "uploadedAt": d.uploaded_at.isoformat() if d.uploaded_at else None,
        }
        for d in docs
    ]
