"""
Analytics routes for admin dashboard:
  GET /api/analytics/overview   — top-level platform stats
  GET /api/analytics/queries    — query volume over time
"""
from fastapi              import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy           import select, func, and_
from datetime             import datetime, timezone, timedelta
import os

from database import get_db, Supplier, Buyer, VerifyQuery, Payment, ApplicationStatus
from services.blockchain import get_total_suppliers

router = APIRouter()
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "verifychain-admin-secret-change-me")


def require_admin(x_admin_secret: str = Header(...)):
    if x_admin_secret != ADMIN_SECRET:
        raise HTTPException(401, "Unauthorized")


@router.get("/overview", dependencies=[Depends(require_admin)])
async def analytics_overview(db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Total verified suppliers
    verified = await db.execute(
        select(func.count()).where(Supplier.status == ApplicationStatus.APPROVED)
    )
    total_verified = verified.scalar() or 0

    # Pending
    pending = await db.execute(
        select(func.count()).where(Supplier.status == ApplicationStatus.PENDING)
    )
    total_pending = pending.scalar() or 0

    # Queries today
    q_today = await db.execute(
        select(func.count(VerifyQuery.id)).where(
            VerifyQuery.queried_at >= today_start
        )
    )
    queries_today = q_today.scalar() or 0

    # Total queries
    q_all = await db.execute(select(func.count(VerifyQuery.id)))
    total_queries = q_all.scalar() or 0

    # Active buyers (with API keys)
    buyers = await db.execute(select(func.count(Buyer.id)))
    total_buyers = buyers.scalar() or 0

    # On-chain total (source of truth)
    try:
        onchain_total = get_total_suppliers()
    except Exception:
        onchain_total = total_verified

    # Revenue estimate (simplified: $99/supplier + $499/buyer/month)
    monthly_revenue = (total_verified * 99 / 12) + (total_buyers * 499)

    return {
        "totalVerified":   total_verified,
        "totalPending":    total_pending,
        "totalBuyers":     total_buyers,
        "queriesToday":    queries_today,
        "totalQueries":    total_queries,
        "onchainTotal":    onchain_total,
        "monthlyRevenue":  round(monthly_revenue, 2),
        "asOf":            now.isoformat(),
    }


@router.get("/queries-by-day", dependencies=[Depends(require_admin)])
async def queries_by_day(db: AsyncSession = Depends(get_db)):
    """Returns query counts for the last 7 days."""
    now   = datetime.now(timezone.utc)
    days  = []
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end   = day_start + timedelta(days=1)
        count_r   = await db.execute(
            select(func.count(VerifyQuery.id)).where(
                and_(
                    VerifyQuery.queried_at >= day_start,
                    VerifyQuery.queried_at < day_end,
                )
            )
        )
        days.append({
            "date":   day_start.strftime("%b %d"),
            "count":  count_r.scalar() or 0,
        })
    return days


@router.get("/suppliers-by-country", dependencies=[Depends(require_admin)])
async def suppliers_by_country(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Supplier.country, func.count(Supplier.id))
        .where(Supplier.status == ApplicationStatus.APPROVED)
        .group_by(Supplier.country)
        .order_by(func.count(Supplier.id).desc())
    )
    return [{"country": row[0], "count": row[1]} for row in result.fetchall()]
