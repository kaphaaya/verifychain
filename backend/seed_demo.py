"""
seed_demo.py — Insert 4 pre-verified demo suppliers for hackathon judges.

Run from the backend directory:
    python seed_demo.py

These suppliers will appear as "approved" in the DB immediately.
To make them verifiable on the blockchain, log in to /admin and click
"Approve & mint" for each one (or re-run this script after configuring
ADMIN_PRIVATE_KEY and CONTRACT_ADDRESS in .env).
"""
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
import os, sys

# Allow running from any directory
sys.path.insert(0, os.path.dirname(__file__))
from database import Base, Supplier, Document

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./verifychain.db")

DEMO_SUPPLIERS = [
    {
        "wallet":       "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
        "company_name": "Amara Global Trading Ltd",
        "tax_id":       "NG-CAC-2019-881234",
        "country":      "Nigeria",
        "email":        "compliance@amaraglobal.ng",
        "tier":         2,
        "token_id":     101,
        "docs_ipfs":    "local:amara_global_cac.pdf",
        "documents": [
            {"doc_type": "cac_cert",     "filename": "amara_global_cac.pdf",    "ipfs_cid": "local:amara_global_cac.pdf"},
            {"doc_type": "tax_cert",     "filename": "amara_tax_2024.pdf",      "ipfs_cid": "local:amara_tax_2024.pdf"},
            {"doc_type": "bank_details", "filename": "amara_bank_letter.pdf",   "ipfs_cid": "local:amara_bank_letter.pdf"},
            {"doc_type": "id_doc",       "filename": "amara_director_id.pdf",   "ipfs_cid": "local:amara_director_id.pdf"},
        ],
    },
    {
        "wallet":       "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
        "company_name": "Ashanti Exports Ghana",
        "tax_id":       "GH-RGD-2020-445512",
        "country":      "Ghana",
        "email":        "info@ashantiexports.gh",
        "tier":         1,
        "token_id":     102,
        "docs_ipfs":    "local:ashanti_registration.pdf",
        "documents": [
            {"doc_type": "cac_cert",     "filename": "ashanti_registration.pdf",  "ipfs_cid": "local:ashanti_registration.pdf"},
            {"doc_type": "tax_cert",     "filename": "ashanti_tax_clearance.pdf", "ipfs_cid": "local:ashanti_tax_clearance.pdf"},
            {"doc_type": "bank_details", "filename": "ashanti_bank.pdf",          "ipfs_cid": "local:ashanti_bank.pdf"},
        ],
    },
    {
        "wallet":       "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaA",
        "company_name": "Nairobi Logistics Ltd",
        "tax_id":       "KE-BRS-2021-778900",
        "country":      "Kenya",
        "email":        "ops@nairobilogistics.co.ke",
        "tier":         3,
        "token_id":     103,
        "docs_ipfs":    "local:nairobi_cert_of_incorporation.pdf",
        "documents": [
            {"doc_type": "cac_cert",     "filename": "nairobi_cert_of_incorporation.pdf", "ipfs_cid": "local:nairobi_cert_of_incorporation.pdf"},
            {"doc_type": "tax_cert",     "filename": "nairobi_kra_cert.pdf",              "ipfs_cid": "local:nairobi_kra_cert.pdf"},
            {"doc_type": "bank_details", "filename": "nairobi_equity_letter.pdf",         "ipfs_cid": "local:nairobi_equity_letter.pdf"},
            {"doc_type": "id_doc",       "filename": "nairobi_director_id.pdf",           "ipfs_cid": "local:nairobi_director_id.pdf"},
        ],
    },
    {
        "wallet":       "0x617F2E2fD72FD9D5503197092aC168c91465E7f3",
        "company_name": "Dubai Trade Partners FZE",
        "tax_id":       "AE-DMCC-2022-019834",
        "country":      "United Arab Emirates",
        "email":        "legal@dubaitradeparts.ae",
        "tier":         3,
        "token_id":     104,
        "docs_ipfs":    "local:dubai_trade_license.pdf",
        "documents": [
            {"doc_type": "cac_cert",     "filename": "dubai_trade_license.pdf",     "ipfs_cid": "local:dubai_trade_license.pdf"},
            {"doc_type": "tax_cert",     "filename": "dubai_tax_registration.pdf",  "ipfs_cid": "local:dubai_tax_registration.pdf"},
            {"doc_type": "bank_details", "filename": "dubai_emirates_nbd.pdf",      "ipfs_cid": "local:dubai_emirates_nbd.pdf"},
            {"doc_type": "id_doc",       "filename": "dubai_passport_director.pdf", "ipfs_cid": "local:dubai_passport_director.pdf"},
        ],
    },
]


async def seed():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(engine, expire_on_commit=False)
    now = datetime.utcnow()

    async with Session() as db:
        inserted = 0
        skipped  = 0

        for data in DEMO_SUPPLIERS:
            existing = await db.execute(
                select(Supplier).where(Supplier.wallet.ilike(data["wallet"]))
            )
            if existing.scalar_one_or_none():
                print(f"  skip  {data['company_name']} (already exists)")
                skipped += 1
                continue

            # Also skip if tax_id already used
            existing_tax = await db.execute(
                select(Supplier).where(Supplier.tax_id == data["tax_id"])
            )
            if existing_tax.scalar_one_or_none():
                print(f"  skip  {data['company_name']} (tax ID collision)")
                skipped += 1
                continue

            supplier = Supplier(
                wallet=data["wallet"],
                company_name=data["company_name"],
                tax_id=data["tax_id"],
                country=data["country"],
                email=data["email"],
                tier=data["tier"],
                status="approved",
                token_id=data["token_id"],
                docs_ipfs=data["docs_ipfs"],
                approved_at=now,
                expires_at=now + timedelta(days=365),
            )
            try:
                supplier.attempt_count = 1
                supplier.rejection_reason = None
            except Exception:
                pass

            db.add(supplier)
            await db.flush()  # get supplier.id

            for doc in data["documents"]:
                db.add(Document(
                    supplier_id=supplier.id,
                    doc_type=doc["doc_type"],
                    filename=doc["filename"],
                    ipfs_cid=doc["ipfs_cid"],
                    uploaded_at=now,
                ))

            await db.commit()
            inserted += 1
            print(f"  added {data['company_name']} ({data['country']}) — wallet {data['wallet'][:10]}...")

        print(f"\nDone. {inserted} inserted, {skipped} skipped.")
        print("\nDemo wallet addresses for the buyer page:")
        for d in DEMO_SUPPLIERS:
            print(f"  {d['wallet']}  —  {d['company_name']} ({d['country']})")
        print("\nNote: To make these verifiable on Arbitrum, go to /admin and")
        print("click 'Approve & mint' for each supplier. The DB already shows")
        print("them as approved but blockchain verification requires minting.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
