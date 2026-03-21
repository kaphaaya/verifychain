from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime
import hashlib, secrets, os

from database import get_db, Supplier, Document, User
from services.ipfs import upload_multiple
from services.blockchain import verify_supplier_onchain

router = APIRouter()
MAX_ATTEMPTS = 3

# ─────────────────────────────────────────────────────────────────
# AUTH HELPERS
# ─────────────────────────────────────────────────────────────────

def _hash_password(password: str, salt: str) -> str:
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()

def _new_token() -> str:
    return secrets.token_hex(32)


# ─────────────────────────────────────────────────────────────────
# AUTH ROUTES
# ─────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str
    wallet: str | None = None

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/auth/register")
async def auth_register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Email already registered")
    salt  = secrets.token_hex(16)
    phash = _hash_password(body.password, salt)
    token = _new_token()
    user  = User(
        email=body.email.lower(),
        password_hash=phash,
        salt=salt,
        wallet=body.wallet,
        session_token=token,
    )
    db.add(user)
    await db.commit()
    return {"ok": True, "sessionToken": token, "email": user.email, "wallet": user.wallet}

@router.post("/auth/login")
async def auth_login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email.lower()))
    user   = result.scalar_one_or_none()
    if not user:
        raise HTTPException(401, "Invalid email or password")
    if _hash_password(body.password, user.salt) != user.password_hash:
        raise HTTPException(401, "Invalid email or password")
    token = _new_token()
    user.session_token = token
    await db.commit()
    return {"ok": True, "sessionToken": token, "email": user.email, "wallet": user.wallet}

@router.patch("/auth/link-wallet")
async def link_wallet(
    session_token: str = Query(...),
    wallet: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.session_token == session_token))
    user   = result.scalar_one_or_none()
    if not user:
        raise HTTPException(401, "Invalid session")
    user.wallet = wallet
    await db.commit()
    return {"ok": True, "wallet": wallet}


# ─────────────────────────────────────────────────────────────────
# SEARCH
# ─────────────────────────────────────────────────────────────────

@router.get("/search")
async def search_suppliers(q: str = Query(..., min_length=1), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Supplier)
        .where(Supplier.company_name.ilike(f"%{q}%"))
        .order_by(Supplier.company_name)
        .limit(10)
    )
    suppliers = result.scalars().all()
    return [
        {"wallet": s.wallet, "companyName": s.company_name, "country": s.country,
         "tier": s.tier, "status": s.status}
        for s in suppliers
    ]


# ─────────────────────────────────────────────────────────────────
# APPLY — supports multiple businesses per wallet
# ─────────────────────────────────────────────────────────────────

@router.post("/apply")
async def apply(
    wallet: str = Form(...), company_name: str = Form(...),
    tax_id: str = Form(...), country: str = Form(...),
    email: str = Form(None), tier: int = Form(2),
    validity_days: int = Form(365),
    metadata: str = Form(None),
    cac_cert: UploadFile = File(...), tax_cert: UploadFile = File(...),
    bank_details: UploadFile = File(...), id_doc: UploadFile = File(None),
    db: AsyncSession = Depends(get_db),
):
    # Check tax_id uniqueness across all records (a company's tax ID must be globally unique)
    existing_tax = await db.execute(select(Supplier).where(Supplier.tax_id == tax_id))
    existing_record = existing_tax.scalar_one_or_none()

    if existing_record:
        status = existing_record.status
        if existing_record.wallet.lower() != wallet.lower():
            raise HTTPException(400, "This tax ID is already registered to a different wallet.")
        # Same wallet, same tax_id = reapplication
        if status == "pending":
            raise HTTPException(400, "This business already has a pending application under review.")
        if status == "approved":
            raise HTTPException(400, "This business is already verified. Contact support to update credentials.")
        attempt_count = getattr(existing_record, "attempt_count", 1)
        if attempt_count >= MAX_ATTEMPTS:
            raise HTTPException(400, f"Maximum {MAX_ATTEMPTS} attempts reached for this business. Contact support.")

        files_to_upload = [cac_cert, tax_cert, bank_details]
        if id_doc:
            files_to_upload.append(id_doc)
        files_map = await upload_multiple(files_to_upload)
        combined_cid = list(files_map.values())[0] if files_map else "local:unknown"

        existing_record.company_name  = company_name
        existing_record.country       = country
        existing_record.email         = email
        existing_record.tier          = tier
        existing_record.validity_days = validity_days
        existing_record.status        = "pending"
        existing_record.docs_ipfs     = combined_cid
        existing_record.created_at    = datetime.utcnow()
        try:
            existing_record.rejection_reason = None
            existing_record.attempt_count    = attempt_count + 1
            existing_record.extra_metadata   = metadata
        except Exception:
            pass
        await db.commit()
        return {
            "success": True, "supplierId": existing_record.id,
            "status": "pending", "attemptCount": attempt_count + 1,
            "attemptsLeft": MAX_ATTEMPTS - (attempt_count + 1),
            "message": f"Reapplication submitted (attempt {attempt_count + 1} of {MAX_ATTEMPTS}).",
        }

    # Brand-new tax ID — create a fresh application (allowed even if wallet has others)
    files_to_upload = [cac_cert, tax_cert, bank_details]
    if id_doc:
        files_to_upload.append(id_doc)
    files_map = await upload_multiple(files_to_upload)
    combined_cid = list(files_map.values())[0]

    supplier = Supplier(
        wallet=wallet, company_name=company_name, tax_id=tax_id,
        country=country, email=email, tier=tier,
        validity_days=validity_days,
        status="pending", docs_ipfs=combined_cid,
    )
    try:
        supplier.attempt_count    = 1
        supplier.extra_metadata   = metadata
        supplier.rejection_reason = None
    except Exception:
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


# ─────────────────────────────────────────────────────────────────
# ALL APPLICATIONS FOR A WALLET (dashboard)
# ─────────────────────────────────────────────────────────────────

@router.get("/all/{wallet}")
async def get_all_for_wallet(wallet: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Supplier)
        .where(Supplier.wallet.ilike(wallet))
        .order_by(Supplier.created_at.desc())
    )
    suppliers = result.scalars().all()
    if not suppliers:
        raise HTTPException(404, "No applications found for this wallet")

    def _fmt(s: Supplier):
        attempt_count = getattr(s, "attempt_count", 1)
        rejection_reason = getattr(s, "rejection_reason", None)
        return {
            "id": s.id,
            "wallet": s.wallet,
            "companyName": s.company_name,
            "taxId": s.tax_id,
            "country": s.country,
            "email": s.email,
            "status": s.status,
            "tier": s.tier,
            "validityDays": s.validity_days,
            "tokenId": s.token_id,
            "attemptCount": attempt_count,
            "attemptsLeft": MAX_ATTEMPTS - attempt_count,
            "canReapply": s.status in ("rejected", "revoked") and attempt_count < MAX_ATTEMPTS,
            "rejectionReason": rejection_reason,
            "expiresAt": s.expires_at.isoformat() if s.expires_at else None,
            "approvedAt": s.approved_at.isoformat() if s.approved_at else None,
            "createdAt": s.created_at.isoformat() if s.created_at else None,
        }

    return [_fmt(s) for s in suppliers]


# ─────────────────────────────────────────────────────────────────
# SINGLE LOOKUP — returns latest application for wallet
# ─────────────────────────────────────────────────────────────────

@router.get("/{wallet}")
async def get_status(wallet: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Supplier)
        .where(Supplier.wallet.ilike(wallet))
        .order_by(Supplier.created_at.desc())
        .limit(1)
    )
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(404, "No application found for this wallet")

    attempt_count    = getattr(supplier, "attempt_count", 1)
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
    file_path = Path("./uploads") / filename.replace("..", "").replace("/", "")
    if not file_path.exists():
        raise HTTPException(404, "Document not found")
    return FileResponse(path=str(file_path), media_type="application/pdf", filename=filename)
