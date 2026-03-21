"""
Database setup using SQLAlchemy async + SQLite for hackathon speed.
Swap to PostgreSQL for production: change DATABASE_URL in .env
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Boolean, Float, DateTime, Text, ForeignKey, Enum
from datetime import datetime
from typing import Optional, List
import enum
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./verifychain.db")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


# ─────────────────────────────────────────────────────────────────
# ENUMS
# ─────────────────────────────────────────────────────────────────

class ApplicationStatus(str, enum.Enum):
    PENDING  = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class SupplierTier(int, enum.Enum):
    BASIC    = 1
    STANDARD = 2
    PREMIUM  = 3


# ─────────────────────────────────────────────────────────────────
# MODELS
# ─────────────────────────────────────────────────────────────────

class Supplier(Base):
    __tablename__ = "suppliers"

    id:             Mapped[int]           = mapped_column(Integer, primary_key=True, autoincrement=True)
    wallet:         Mapped[str]           = mapped_column(String(42), index=True)          # no unique — multiple businesses per wallet
    company_name:   Mapped[str]           = mapped_column(String(255))
    tax_id:         Mapped[str]           = mapped_column(String(100), unique=True, index=True)
    country:        Mapped[str]           = mapped_column(String(100))
    email:          Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status:         Mapped[str]           = mapped_column(String(20), default=ApplicationStatus.PENDING)
    tier:           Mapped[int]           = mapped_column(Integer, default=1)
    validity_days:  Mapped[Optional[int]] = mapped_column(Integer, nullable=True)          # from pricing plan
    token_id:       Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    docs_ipfs:      Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at:     Mapped[datetime]      = mapped_column(DateTime, default=datetime.utcnow)
    approved_at:    Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    expires_at:     Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    documents:    Mapped[List["Document"]]   = relationship("Document", back_populates="supplier")
    queries:      Mapped[List["VerifyQuery"]] = relationship("VerifyQuery", back_populates="supplier")


class Document(Base):
    __tablename__ = "documents"

    id:          Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    supplier_id: Mapped[int] = mapped_column(Integer, ForeignKey("suppliers.id"))
    doc_type:    Mapped[str] = mapped_column(String(100))   # e.g. "cac_cert", "tax_cert", "bank_details"
    filename:    Mapped[str] = mapped_column(String(255))
    ipfs_cid:    Mapped[str] = mapped_column(String(255))
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    supplier: Mapped["Supplier"] = relationship("Supplier", back_populates="documents")


class Buyer(Base):
    __tablename__ = "buyers"

    id:           Mapped[int]           = mapped_column(Integer, primary_key=True, autoincrement=True)
    wallet:       Mapped[str]           = mapped_column(String(42), unique=True, index=True)
    company_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    email:        Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    api_key:      Mapped[str]           = mapped_column(String(64), unique=True, index=True)
    plan:         Mapped[str]           = mapped_column(String(20), default="free")  # free | pro | enterprise
    query_count:  Mapped[int]           = mapped_column(Integer, default=0)
    created_at:   Mapped[datetime]      = mapped_column(DateTime, default=datetime.utcnow)

    queries: Mapped[List["VerifyQuery"]] = relationship("VerifyQuery", back_populates="buyer")


class VerifyQuery(Base):
    __tablename__ = "verify_queries"

    id:              Mapped[int]           = mapped_column(Integer, primary_key=True, autoincrement=True)
    buyer_id:        Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("buyers.id"), nullable=True)
    supplier_id:     Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("suppliers.id"), nullable=True)
    queried_wallet:  Mapped[str]           = mapped_column(String(42))
    result_valid:    Mapped[bool]          = mapped_column(Boolean)
    source:          Mapped[str]           = mapped_column(String(20))  # "portal" | "api"
    queried_at:      Mapped[datetime]      = mapped_column(DateTime, default=datetime.utcnow)

    buyer:    Mapped[Optional["Buyer"]]    = relationship("Buyer", back_populates="queries")
    supplier: Mapped[Optional["Supplier"]] = relationship("Supplier", back_populates="queries")


class Payment(Base):
    __tablename__ = "payments"

    id:         Mapped[int]           = mapped_column(Integer, primary_key=True, autoincrement=True)
    from_addr:  Mapped[str]           = mapped_column(String(42))
    amount:     Mapped[float]         = mapped_column(Float)
    currency:   Mapped[str]           = mapped_column(String(10), default="USDC")
    tx_hash:    Mapped[Optional[str]] = mapped_column(String(66), nullable=True)
    pay_type:   Mapped[str]           = mapped_column(String(30))  # "supplier_verification" | "buyer_subscription"
    created_at: Mapped[datetime]      = mapped_column(DateTime, default=datetime.utcnow)


class User(Base):
    """Email-authenticated user account (optional wallet link)."""
    __tablename__ = "users"

    id:            Mapped[int]           = mapped_column(Integer, primary_key=True, autoincrement=True)
    email:         Mapped[str]           = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str]           = mapped_column(String(128))
    salt:          Mapped[str]           = mapped_column(String(32))
    wallet:        Mapped[Optional[str]] = mapped_column(String(42), nullable=True, index=True)
    session_token: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    created_at:    Mapped[datetime]      = mapped_column(DateTime, default=datetime.utcnow)


# ─────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────

async def init_db():
    from sqlalchemy import text
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Idempotent column migrations for SQLite
        _migrations = [
            "ALTER TABLE suppliers ADD COLUMN validity_days INTEGER",
            "ALTER TABLE suppliers ADD COLUMN token_id INTEGER",
            "ALTER TABLE suppliers ADD COLUMN approved_at DATETIME",
            "ALTER TABLE suppliers ADD COLUMN expires_at DATETIME",
        ]
        for sql in _migrations:
            try:
                await conn.execute(text(sql))
            except Exception:
                pass  # Column already exists


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
