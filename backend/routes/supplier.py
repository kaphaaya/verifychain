from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import os

from database import get_db, Supplier, Document
from services.ipfs import upload_multiple
from services.blockchain import verify_supplier_onchain

router = APIRouter()
MAX_ATTEMPTS = 3

@router.post("/apply")
async def apply(
    wallet: str = Form(...), company_name: str = Form(...),
    tax_id: str = Form(...), country: str = Form(...),
    email: str = Form(None), tier: int = Form(2),
    metadata: str = Form(None),
    cac_cert: UploadFile = File(...), tax_cert: UploadFile = File(...),
    bank_details: UploadFile = File(...), id_doc: UploadFile = File(None),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(Supplier).where(Supplier.wallet.ilike(wallet)))
    existing_supplier = existing.scalar_one_or_none()

    if existing_supplier:
        status = existing_supplier.status
        if status == "pending":
            raise HTTPException(400, "You already have a pending application under review.")
        if status == "approved":
            raise HTTPException(400, "Your business is already verified. Contact support to update credentials.")
        attempt_count = getattr(existing_supplier, "attempt_count", 1)
        if attempt_count >= MAX_ATTEMPTS:
            raise HTTPException(400, f"Maximum {MAX_ATTEMPTS} attempts reached. Contact support.")

        files_to_upload = [cac_cert, tax_cert, bank_details]
        if id_doc:
            files_to_upload.append(id_doc)
        files_map = await upload_multiple(files_to_upload)
        combined_cid = list(files_map.values())[0]

        existing_supplier.company_name = company_name
        existing_supplier.tax_id = tax_id
        existing_supplier.country = country
        existing_supplier.email = email
        existing_supplier.tier = tier
        existing_supplier.status = "pending"
        existing_supplier.docs_ipfs = combined_cid
        existing_supplier.created_at = datetime.utcnow()
        try:
            existing_supplier.rejection_reason = None
            existing_supplier.attempt_count = attempt_count + 1
            existing_supplier.extra_metadata = metadata
        except:
            pass
        await db.commit()
        return {
            "success": True, "supplierId": existing_supplier.id,
            "status": "pending", "attemptCount": attempt_count + 1,
            "attemptsLeft": MAX_ATTEMPTS - (attempt_count + 1),
            "message": f"Reapplication submitted (attempt {attempt_count + 1} of {MAX_ATTEMPTS}).",
        }

    files_to_upload = [cac_cert, tax_cert, bank_details]
    if id_doc:
        files_to_upload.append(id_doc)
    files_map = await upload_multiple(files_to_upload)
    combined_cid = list(files_map.values())[0]

    supplier = Supplier(
        wallet=wallet, company_name=company_name, tax_id=tax_id,
        country=country, email=email, tier=tier,
        status="pending", docs_ipfs=combined_cid,
    )
    try:
        supplier.attempt_count = 1
        supplier.extra_metadata = metadata
        supplier.rejection_reason = None
    except:
        pass

    db.add(supplier)
    await db.flush()

    doc_types = ["cac_cert", "tax_cert", "bank_details", "id_doc"]
    for (filename, cid), doc_type in zip(files_map.items(), doc_types):
        db.add(Document(supplier_id=supplier.id, doc_type=doc_type, filename=filename, ipfs_cid=cid))

    await db.commit()
    return {
        "success": True, "supplierId": supplier.id, "status": "pending",
        "attemptCount": 1, "attemptsLeft": MAX_ATTEMPTS - 1,
        "message": "Application submitted. Review takes up to 24 hours.",
    }

@router.get("/{wallet}")
async def get_status(wallet: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).where(Supplier.wallet.ilike(wallet)))
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(404, "No application found for this wallet")

    attempt_count = getattr(supplier, "attempt_count", 1)
    rejection_reason = getattr(supplier, "rejection_reason", None)

    return {
        "wallet": supplier.wallet, "companyName": supplier.company_name,
        "taxId": supplier.tax_id, "country": supplier.country,
        "email": supplier.email, "status": supplier.status, "tier": supplier.tier,
        "tokenId": supplier.token_id, "attemptCount": attempt_count,
        "attemptsLeft": MAX_ATTEMPTS - attempt_count,
        "canReapply": supplier.status in ("rejected", "revoked") and attempt_count < MAX_ATTEMPTS,
        "rejectionReason": rejection_reason,
        "expiresAt": supplier.expires_at.isoformat() if supplier.expires_at else None,
        "approvedAt": supplier.approved_at.isoformat() if supplier.approved_at else None,
    }

@router.get("/{wallet}/credential")
async def get_credential(wallet: str):
    try:
        data = verify_supplier_onchain(wallet)
    except Exception as e:
        raise HTTPException(500, f"Chain query failed: {str(e)}")
    from datetime import timezone
    def ts(t):
        return datetime.fromtimestamp(t, tz=timezone.utc).isoformat() if t else None
    return {
        "isValid": data["isValid"], "companyName": data["companyName"],
        "taxId": data["taxId"], "country": data["country"], "tier": data["tier"],
        "issuedAt": ts(data["issuedAt"]), "expiresAt": ts(data["expiresAt"]),
        "docsIPFSHash": data["docsIPFSHash"], "supplier": data["supplier"], "onChain": True,
    }


from fastapi.responses import FileResponse
from pathlib import Path

@router.get("/docs/{filename}")
async def serve_document(filename: str):
    """Serve locally stored documents."""
    file_path = Path("./uploads") / filename.replace("..", "").replace("/", "")
    if not file_path.exists():
        raise HTTPException(404, "Document not found")
    return FileResponse(
        path=str(file_path),
        media_type="application/pdf",
        filename=filename,
    )
