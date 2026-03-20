"""
Public Verify API — what enterprise buyers and their ERP systems call.

  GET  /api/v1/verify/:wallet    — verify by wallet address
  GET  /api/v1/verify/taxid/:id  — verify by tax ID
  POST /api/v1/buyers/register   — register buyer + get API key
  GET  /api/v1/buyers/me         — get buyer profile + usage stats
"""
from fastapi              import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy           import select, func
from pydantic             import BaseModel
from datetime             import datetime, timezone
import secrets

from database             import get_db, Supplier, Buyer, VerifyQuery, ApplicationStatus
from services.blockchain  import verify_supplier_onchain, verify_by_taxid_onchain

router = APIRouter()

TIER_NAMES = {1: "Basic", 2: "Standard", 3: "Premium"}


# ─────────────────────────────────────────────────────────────────
# API KEY AUTH
# ─────────────────────────────────────────────────────────────────

async def get_buyer_from_key(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> Buyer:
    """Extract Bearer token and look up buyer."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authorization header must be 'Bearer <api_key>'")

    api_key = authorization.removeprefix("Bearer ").strip()
    result  = await db.execute(select(Buyer).where(Buyer.api_key == api_key))
    buyer   = result.scalar_one_or_none()

    if not buyer:
        raise HTTPException(401, "Invalid API key")

    # Rate limiting — free plan: 100 queries/day (simplified)
    if buyer.plan == "free" and buyer.query_count >= 100:
        raise HTTPException(429, "Free plan limit reached. Upgrade to Pro.")

    return buyer


# ─────────────────────────────────────────────────────────────────
# GET /verify/:wallet
# ─────────────────────────────────────────────────────────────────

@router.get("/verify/{wallet}")
async def verify_by_wallet(
    wallet: str,
    buyer:  Buyer = Depends(get_buyer_from_key),
    db:     AsyncSession = Depends(get_db),
):
    """
    Primary enterprise endpoint.
    Returns structured credential data from the Arbitrum blockchain.
    """
    # Hit the chain — this is the ground truth
    try:
        chain_data = verify_supplier_onchain(wallet)
    except Exception as e:
        raise HTTPException(500, f"Chain query error: {str(e)}")

    # Fetch DB record for extra metadata
    db_result  = await db.execute(select(Supplier).where(Supplier.wallet == wallet.lower()))
    db_supplier = db_result.scalar_one_or_none()

    # Log query
    query_log = VerifyQuery(
        buyer_id=buyer.id,
        supplier_id=db_supplier.id if db_supplier else None,
        queried_wallet=wallet,
        result_valid=chain_data["isValid"],
        source="api",
    )
    db.add(query_log)
    buyer.query_count += 1
    await db.commit()

    # Format response
    def ts(t):
        if not t: return None
        return datetime.fromtimestamp(t, tz=timezone.utc).isoformat()

    return {
        "verified":    chain_data["isValid"],
        "wallet":      wallet,
        "companyName": chain_data["companyName"] or None,
        "taxId":       chain_data["taxId"] or None,
        "country":     chain_data["country"] or None,
        "tier":        chain_data["tier"],
        "tierName":    TIER_NAMES.get(chain_data["tier"], "Unknown"),
        "issuedAt":    ts(chain_data["issuedAt"]),
        "expiresAt":   ts(chain_data["expiresAt"]),
        "isActive":    chain_data["isActive"],
        "onChain":     True,
        "network":     "arbitrum-sepolia",
        "queriedAt":   datetime.now(timezone.utc).isoformat(),
    }


# ─────────────────────────────────────────────────────────────────
# GET /verify/taxid/:tax_id
# ─────────────────────────────────────────────────────────────────

@router.get("/verify/taxid/{tax_id}")
async def verify_by_tax_id(
    tax_id: str,
    buyer:  Buyer = Depends(get_buyer_from_key),
    db:     AsyncSession = Depends(get_db),
):
    try:
        data = verify_by_taxid_onchain(tax_id)
    except Exception as e:
        raise HTTPException(500, f"Chain query error: {str(e)}")

    buyer.query_count += 1
    await db.commit()

    def ts(t):
        if not t: return None
        return datetime.fromtimestamp(t, tz=timezone.utc).isoformat()

    return {
        "verified":      data["isValid"],
        "taxId":         tax_id,
        "wallet":        data.get("supplierWallet"),
        "companyName":   data.get("companyName"),
        "country":       data.get("country"),
        "tier":          data.get("tier"),
        "tierName":      TIER_NAMES.get(data.get("tier", 0), "Unknown"),
        "issuedAt":      ts(data.get("issuedAt")),
        "expiresAt":     ts(data.get("expiresAt")),
        "queriedAt":     datetime.now(timezone.utc).isoformat(),
    }


# ─────────────────────────────────────────────────────────────────
# POST /buyers/register
# ─────────────────────────────────────────────────────────────────

class BuyerRegister(BaseModel):
    wallet:      str
    companyName: str = ""
    email:       str = ""


@router.post("/buyers/register")
async def register_buyer(body: BuyerRegister, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Buyer).where(Buyer.wallet == body.wallet))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Wallet already registered")

    api_key = "vc_live_" + secrets.token_hex(24)

    buyer = Buyer(
        wallet=body.wallet,
        company_name=body.companyName,
        email=body.email,
        api_key=api_key,
        plan="free",
    )
    db.add(buyer)
    await db.commit()

    return {
        "success":  True,
        "apiKey":   api_key,
        "plan":     "free",
        "message":  "Save your API key — it won't be shown again.",
        "docsUrl":  "https://verifychain.io/docs",
    }


# ─────────────────────────────────────────────────────────────────
# GET /buyers/me
# ─────────────────────────────────────────────────────────────────

@router.get("/buyers/me")
async def get_buyer_profile(buyer: Buyer = Depends(get_buyer_from_key)):
    return {
        "wallet":       buyer.wallet,
        "companyName":  buyer.company_name,
        "plan":         buyer.plan,
        "queryCount":   buyer.query_count,
        "memberSince":  buyer.created_at.isoformat(),
    }
