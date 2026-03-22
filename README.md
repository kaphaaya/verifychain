# VerifyChain

**VerifyChain is the blockchain-based supplier verification network that makes vendor fraud impossible.**

Live: **https://verifychain-zeta.vercel.app**
Contract: `0xAcB992cdc988Dc4B7071480b3Bb24fe8686b5D35` on Arbitrum Sepolia
Built at Aleph Hackathon 2026

---

## The problem

Global supply chains lose over $300 billion every year to vendor fraud. And most of it is preventable.

A procurement manager at a European company wants to onboard a new supplier in Nigeria. So they start the process. They request a business registration certificate. A tax clearance letter. A bank confirmation. Director IDs. They email back and forth for two weeks. They hire a third-party verification firm. They pay $800 to get a report that is three weeks old by the time it arrives. And they still cannot be sure the documents are real, because documents get forged every day and there is no way to cross-check them instantly against a source of truth.

Now multiply that by every supplier, every buyer, every deal. Every company does this independently. A supplier who has been verified by 40 buyers still has to go through the same process with buyer number 41. The same documents. The same waiting. The same cost. The same risk of fraud slipping through anyway.

For suppliers in emerging markets, this is even worse. A small trading company in Ghana or a logistics firm in Kenya has no brand recognition to fall back on. No institutional credit history. No shortcut. They are legitimate businesses doing real work, but they spend months just trying to prove they exist. International buyers walk away. Deals die. The gap between global commerce and the businesses that could benefit from it stays wide open.

---

## The solution

VerifyChain fixes this once.

A supplier submits their documents through the portal. We verify them. When everything checks out, we mint a soul-bound NFT credential on the Arbitrum blockchain, permanently tied to the supplier's wallet. It cannot be faked. It cannot be transferred. It cannot be deleted. It lives on the blockchain forever.

Any buyer, anywhere in the world, types the supplier's wallet address into the buyer portal. Ten seconds later they have the answer straight from the blockchain. No middleman. No paperwork. No phone calls. No waiting two weeks.

Think of it as a passport for businesses. One verification. Trusted everywhere.

---

## Try it right now

Go to **https://verifychain-zeta.vercel.app/buyer**

These suppliers are already verified on-chain. Click any chip or paste the wallet address:

| Company | Country | Wallet |
|---------|---------|--------|
| Amara Global Trading Ltd | Nigeria | `0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2` |
| Ashanti Exports Ghana | Ghana | `0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db` |
| Nairobi Logistics Ltd | Kenya | `0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaA` |
| Dubai Trade Partners FZE | UAE | `0x617F2E2fD72FD9D5503197092aC168c91465E7f3` |

**No wallet connection required.** Open the page, click a demo chip, see the verified credential pulled directly from Arbitrum in seconds.

Want to test the full supplier flow? Go to **https://verifychain-zeta.vercel.app/supplier** and submit an application. Admin dashboard is at **https://verifychain-zeta.vercel.app/admin**.

---

## How it works

**Step 1 — Supplier applies.** They submit their business registration, tax certificate, bank confirmation, and director ID through the supplier portal. Documents are stored on Filecoin via web3.storage.

**Step 2 — Admin reviews.** The admin dashboard shows all pending applications with document previews. Approve or reject with a reason. Rejected suppliers see exactly what to fix and can reapply.

**Step 3 — NFT mints on Arbitrum.** Approval triggers an on-chain transaction. A soul-bound ERC-721 credential is minted to the supplier's wallet, encoding their company name, tax ID, country, tier, issue date, and expiry date. The supplier gets an email with their credential card.

**Step 4 — Any buyer verifies instantly.** Wallet address in. Verified result out. No trust required. The blockchain is the source of truth.

---

## Who benefits

**Suppliers in emerging markets** who are tired of proving themselves from scratch to every new buyer. One verification, used across every deal, forever. No more losing contracts because you cannot afford a month-long verification process.

**Enterprise procurement teams** who need to move fast without getting burned. Skip the weeks of due diligence. Get a cryptographically verified answer in seconds. Onboard new suppliers the same day you find them.

**Governments and trade bodies** who want a trusted, tamper-proof registry for public procurement. Every verified supplier is publicly queryable. Ghost supplier fraud becomes impossible when every supplier credential lives on a public blockchain.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Smart contract | Solidity + Hardhat, deployed on Arbitrum Sepolia |
| Blockchain | Arbitrum ERC-721 soul-bound NFT |
| Backend | Python FastAPI, hosted on Render |
| Database | PostgreSQL on Render |
| Frontend | Next.js 14, deployed on Vercel |
| Wallet | MetaMask + RainbowKit + Wagmi |
| Document storage | Filecoin via web3.storage |
| Email | Resend |
| Payments | Circle USDC |

---

## Hackathon tracks

**Best Projects by PL_Genesis** — $2,000 USDC prize pool. VerifyChain is a Web3/crypto project solving real-world vendor fraud at global scale.

---

## Business model

| Plan | Price |
|------|-------|
| Monthly | $29/month |
| Quarterly | $79/quarter |
| Semi-annual | $149/6 months |
| Annual | $199/year |
| Enterprise API | $499/month, unlimited queries |

The API is the long-term play. Every ERP, every procurement platform, every trade finance system needs verified supplier data. We become the trust layer they all plug into.

---

## What comes next

Right now a human reviews documents. That is fine for an MVP. It does not scale.

The next version removes the human. Computer vision to detect forged documents before they hit the queue. Government API integrations to verify company registrations in real time against official registries in 50+ countries. Chainlink oracles to record that external verification on-chain so it is cryptographically tied to the source data, not just our word for it. A dynamic trust score built from verification history, buyer feedback, and transaction volume.

The end goal: any buyer, anywhere in the world, verifies any supplier in 10 seconds and trusts that result completely. No humans in the loop. No room for fraud. Just truth on the blockchain.

---

## Run it locally

```bash
# Smart contract
cd contracts
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network arbitrumSepolia

# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env        # fill in your keys
python main.py

# Frontend
cd frontend
npm install
cp .env.local.example .env.local   # fill in your keys
npm run dev
```

**Backend env vars:**
```
CONTRACT_ADDRESS=
ADMIN_PRIVATE_KEY=
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
DATABASE_URL=
WEB3_STORAGE_TOKEN=
RESEND_API_KEY=
ADMIN_SECRET=
```

**Frontend env vars:**
```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_ADMIN_SECRET=
NEXT_PUBLIC_ADMIN_PASSWORD=
```

---

## Hackathon Submission

Aleph Hackathon 2026

Track: Best Projects by PL_Genesis (Web3/Crypto category)
Prize pool: $2,000 USDC

Live demo: https://verifychain-zeta.vercel.app
GitHub: https://github.com/kaphaaya/verifychain
Contract: 0xAcB992cdc988Dc4B7071480b3Bb24fe8686b5D35
Arbiscan: https://sepolia.arbiscan.io/address/0xAcB992cdc988Dc4B7071480b3Bb24fe8686b5D35

---

## Built by

Brown. Nigerian and Ghanaian. Solo builder. Making the world better one step at a time.

**Contact:** aziz.kafayat@gmail.com

---

*Running on Arbitrum Sepolia testnet for demonstration. No real money involved.*
