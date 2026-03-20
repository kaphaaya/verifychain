"""
VerifyChain Backend — FastAPI
Handles: supplier applications, document upload to IPFS/Filecoin,
         admin review queue, on-chain credential minting via web3.py,
         public REST API for buyers to query credentials.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from routes.supplier  import router as supplier_router
from routes.admin     import router as admin_router
from routes.verify    import router as verify_router
from routes.analytics import router as analytics_router
from database         import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="VerifyChain API",
    description="On-chain supplier verification network",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(supplier_router,  prefix="/api/supplier",  tags=["Supplier"])
app.include_router(admin_router,     prefix="/api/admin",     tags=["Admin"])
app.include_router(verify_router,    prefix="/api/v1",        tags=["Verify (Public)"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])


@app.get("/")
async def root():
    return {
        "name":    "VerifyChain API",
        "version": "1.0.0",
        "docs":    "/docs",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
