# VerifyChain

Built at Aleph Hackathon 2026 by Brown (Nigerian/Ghanaian, making the world better one step at a time).

Live: https://verifychain-zeta.vercel.app
Contract: 0xAcB992cdc988Dc4B7071480b3Bb24fe8686b5D35 on Arbitrum Sepolia

---

## Why I built this

People are untrustworthy. Scams are everywhere. And when you are trying to do real business across borders, you have no way of knowing if the supplier you are about to send money to is actually legit.

Every company that wants to work with a new supplier has to verify them from scratch. Call their bank. Request their registration certificate. Check government records. This takes 2 to 4 weeks every single time, for every company, even if that same supplier was already verified by 50 other companies before them.

And fraud still happens anyway because documents get forged.

I wanted to fix that. Not just for Nigeria or Ghana. For the world.

---

## What VerifyChain does

A supplier verifies once. We check their documents. When everything checks out, we mint a soul-bound NFT credential on the Arbitrum blockchain permanently tied to their wallet. It cannot be faked. It cannot be transferred. It lives on the blockchain forever.

Any buyer anywhere in the world types the supplier wallet address. 10 seconds later they get the answer straight from the blockchain. Verified or not. No middleman. No paperwork. No fraud.

Think of it like a passport for businesses. One verification. Accepted everywhere.

---

## Who it is for

**Suppliers** anywhere in the world who are tired of proving themselves over and over again to every new client. Verify once. Use everywhere.

**Procurement teams and buyers** who need to onboard new suppliers fast without getting scammed. Get a verified answer in 10 seconds instead of waiting weeks.

**Governments and trade bodies** who want a trusted registry of verified businesses for public procurement. Reduce corruption. Reduce ghost supplier fraud.

**Any platform** connecting buyers and suppliers that wants to offer verified supplier status via API.

---

## How it works

1. Supplier submits their business registration, tax certificate, bank confirmation and director ID through the portal
2. Admin reviews the documents
3. On approval, a soul-bound NFT credential is minted on Arbitrum permanently tied to the supplier wallet
4. Any buyer types the wallet address and gets a verified result in 10 seconds directly from the blockchain
5. Supplier receives a downloadable credential card they can share with any buyer worldwide

---

## Features

- Soul-bound ERC-721 NFT credentials on Arbitrum (non-transferable, permanent)
- Multi-business support: one wallet can hold credentials for multiple businesses
- Rejection with reason: suppliers see exactly what to fix and can reapply up to 3 times
- Email notifications: approval and rejection emails sent automatically via Resend
- Shareable verification page: every verified supplier gets a public URL buyers can bookmark
- Downloadable credential card with QR code
- Admin dashboard with password protection, document viewer, and search
- Buyer portal with instant blockchain verification and demo wallets to test
- REST API for ERP and procurement system integration
- Documents stored on Filecoin via web3.storage

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Smart contract | Solidity + Hardhat on Arbitrum Sepolia |
| Blockchain | Arbitrum ERC-721 soul-bound NFT |
| Backend | Python FastAPI on Render |
| Database | PostgreSQL on Render |
| Frontend | Next.js 14 on Vercel |
| Wallet | MetaMask + RainbowKit + Wagmi |
| Documents | Filecoin via web3.storage |
| Email | Resend |
| Payments | Circle USDC |

---

## Run it locally
```bash
# Contract
cd contracts
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network arbitrumSepolia

# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
python main.py

# Frontend
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

---

## Environment variables

Backend:
```
CONTRACT_ADDRESS=
ADMIN_PRIVATE_KEY=
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
DATABASE_URL=
WEB3_STORAGE_TOKEN=
RESEND_API_KEY=
ADMIN_SECRET=
```

Frontend:
```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_ADMIN_SECRET=
NEXT_PUBLIC_ADMIN_PASSWORD=
```

---

## What comes next

Right now a human reviews the documents. That is fine for an MVP but it does not scale.

The next version automates everything. Computer vision to detect forged documents. Government API integrations to verify company registration in real time against official registries in 50+ countries. Chainlink oracles to record that verification on-chain so it is cryptographically tied to the source data. Facial recognition to match the director passport. A dynamic trust score based on verification history and buyer feedback.

The end goal is simple. Any company anywhere in the world should be able to verify any supplier in 10 seconds and trust that result completely. No humans in the loop. No room for fraud. Just truth on the blockchain.

---

## Business model

| Plan | Price |
|------|-------|
| Monthly verification | $29/month |
| Quarterly | $79/quarter |
| Semi-annual | $149/6 months |
| Annual | $199/year |
| Enterprise buyer API | $499/month |

---

## Contact

General: aziz.kafayat@gmail.com
Investment: aziz.kafayat@gmail.com

---

## Disclaimer

Currently running on Arbitrum Sepolia testnet for demonstration purposes. Not real money.

