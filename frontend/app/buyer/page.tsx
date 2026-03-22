"use client";
import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { CONTRACT_ABI, CONTRACT_ADDRESS, TIER_NAMES } from "../../lib/web3";
import CredentialCard from "../../components/CredentialCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://verifychain-zeta.vercel.app";

function Nav() {
  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        <div className="logo-mark">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L12.5 4V10L7 13L1.5 10V4L7 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
            <circle cx="7" cy="7" r="2.2" fill="white"/>
          </svg>
        </div>
        Verify<span style={{color:"var(--accent)"}}>Chain</span>
      </Link>
      <ConnectButton />
    </nav>
  );
}

// Registry-approved card (DB approved, not yet on-chain)
function RegistryCard({ db, wallet }: { db: any; wallet: string }) {
  const tierNames = ["","Basic","Standard","Premium"];
  const tier = Number(db.tier || 0);
  const expires = db.expiresAt ? new Date(db.expiresAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}) : "—";
  return (
    <div className="card animate-in" style={{border:"1px solid rgba(255,181,71,0.3)",padding:0,overflow:"hidden"}}>
      <div style={{
        padding:"24px 28px",borderBottom:"1px solid rgba(255,181,71,0.15)",
        background:"rgba(255,181,71,0.04)",
        display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap" as const,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{
            width:48,height:48,borderRadius:14,background:"rgba(255,181,71,0.1)",
            border:"1px solid rgba(255,181,71,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L20 6.5V15.5L11 20L2 15.5V6.5L11 2Z" stroke="#ffb547" strokeWidth="1.5" fill="none"/>
              <path d="M11 7V12M11 14.5V15" stroke="#ffb547" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{fontWeight:800,fontSize:20}}>{db.companyName}</div>
            <div style={{fontSize:13,color:"#ffb547",marginTop:2}}>Registry Approved · On-chain mint pending</div>
          </div>
        </div>
        <div style={{
          padding:"6px 14px",borderRadius:99,
          background:"rgba(255,181,71,0.1)",border:"1px solid rgba(255,181,71,0.3)",
          fontSize:12,fontFamily:"DM Mono,monospace",color:"#ffb547",fontWeight:600,
        }}>
          TIER {tier} · {(tierNames[tier]||"—").toUpperCase()}
        </div>
      </div>
      <div style={{padding:"24px 28px"}}>
        <div style={{
          padding:"12px 16px",borderRadius:10,marginBottom:20,
          background:"rgba(255,181,71,0.06)",border:"1px solid rgba(255,181,71,0.15)",
          fontSize:13,color:"#ffb547",lineHeight:1.65,
        }}>
          This supplier is <strong>approved in the VerifyChain registry</strong> and their documents have been verified. The blockchain credential is being minted — full on-chain verification will be available shortly.
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          {[
            {l:"Company",  v:db.companyName},
            {l:"Tax ID",   v:db.taxId||"—"},
            {l:"Country",  v:db.country||"—"},
            {l:"Tier",     v:tierNames[tier]||"—"},
            {l:"Expires",  v:expires},
            {l:"Status",   v:"Registry Approved"},
          ].map(({l,v})=>(
            <div key={l} className="card-sm">
              <div style={{fontSize:10,color:"var(--muted)",fontFamily:"DM Mono,monospace",marginBottom:4}}>{l.toUpperCase()}</div>
              <div style={{fontSize:13,fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap" as const}}>
          <button className="btn btn-ghost" style={{fontSize:13}} onClick={()=>{
            navigator.clipboard.writeText(`${APP_URL}/verify/${wallet}`);
            toast.success("Share link copied!");
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="10.5" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="10.5" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="3.5" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6.1L9.1 3.4M5 7.9L9.1 10.6" stroke="currentColor" strokeWidth="1.3"/></svg>
            Share verification
          </button>
          <a href={`https://sepolia.arbiscan.io/address/${wallet}`} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{fontSize:13}}>
            View on Arbiscan →
          </a>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ data, wallet, dbSupplier }: { data: any; wallet: string; dbSupplier?: any }) {
  const isValid = data?.isValid;
  const cred = data?.cred;
  const tier = cred ? Number(cred.tier) : 0;
  const tierNames = ["","Basic","Standard","Premium"];
  const expires = cred && Number(cred.expiresAt) > 0
    ? new Date(Number(cred.expiresAt)*1000).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})
    : null;
  const issued  = cred && Number(cred.issuedAt) > 0
    ? new Date(Number(cred.issuedAt)*1000).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})
    : null;

  // Show registry card if not on-chain but DB has approved record
  if (!isValid && dbSupplier?.status === "approved") {
    return <RegistryCard db={dbSupplier} wallet={wallet}/>;
  }

  if (!isValid) return (
    <div className="card animate-in" style={{
      border:"1px solid rgba(255,77,106,0.25)",
      background:"rgba(255,77,106,0.04)",padding:"40px 32px",
    }}>
      <div style={{display:"flex",gap:20,alignItems:"flex-start",marginBottom:24}}>
        <div style={{
          width:52,height:52,borderRadius:14,flexShrink:0,
          display:"flex",alignItems:"center",justifyContent:"center",
          background:"rgba(255,77,106,0.1)",border:"1px solid rgba(255,77,106,0.2)",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="var(--red)" strokeWidth="1.5"/>
            <path d="M8 8L16 16M16 8L8 16" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <div style={{fontWeight:800,fontSize:20,color:"var(--red)",marginBottom:8}}>No verified credential found</div>
          <div style={{fontSize:14,color:"var(--muted2)",lineHeight:1.7}}>
            This wallet address has no active VerifyChain credential on Arbitrum. This could mean the supplier has not applied, their application is pending, or their credential has expired.
          </div>
        </div>
      </div>

      <div style={{
        padding:"16px 18px",borderRadius:12,marginBottom:20,
        background:"rgba(255,255,255,0.02)",border:"1px solid var(--border)",
      }}>
        <div style={{fontSize:12,fontWeight:700,color:"var(--muted2)",marginBottom:12}}>Before proceeding, encourage the supplier to verify through official registries:</div>
        <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
          {[
            {label:"Nigeria — CAC",       href:"https://www.cac.gov.ng",            flag:"🇳🇬"},
            {label:"Ghana — Registrar General", href:"https://www.rgd.gov.gh",      flag:"🇬🇭"},
            {label:"Kenya — BRS",         href:"https://www.businessregistration.go.ke", flag:"🇰🇪"},
            {label:"UK — Companies House", href:"https://www.gov.uk/get-information-about-a-company", flag:"🇬🇧"},
            {label:"Dun & Bradstreet",    href:"https://www.dnb.com",               flag:"🌍"},
          ].map(r=>(
            <a key={r.href} href={r.href} target="_blank" rel="noreferrer" style={{
              display:"flex",alignItems:"center",gap:10,padding:"8px 12px",
              borderRadius:8,background:"rgba(255,255,255,0.02)",
              border:"1px solid rgba(255,255,255,0.06)",
              color:"var(--muted2)",textDecoration:"none",fontSize:13,fontWeight:600,
              transition:"all 0.15s",
            }}
            onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(0,212,255,0.2)")}
            onMouseLeave={e=>(e.currentTarget.style.borderColor="rgba(255,255,255,0.06)")}>
              <span>{r.flag}</span>
              <span>{r.label}</span>
              <span style={{marginLeft:"auto",color:"var(--accent)",fontSize:11}}>→</span>
            </a>
          ))}
        </div>
      </div>

      <div style={{
        fontFamily:"DM Mono,monospace",fontSize:11,padding:"10px 14px",
        borderRadius:10,background:"var(--surface2)",color:"var(--muted)",
        wordBreak:"break-all" as const,border:"1px solid var(--border)",
      }}>
        <span style={{color:"var(--muted)",marginRight:8,fontSize:10}}>QUERIED WALLET</span>
        {wallet}
      </div>

      <div style={{marginTop:14,fontSize:12,color:"var(--muted)",lineHeight:1.7}}>
        If this supplier claims to be verified, ask them to share their VerifyChain wallet address and apply at{" "}
        <Link href="/supplier" style={{color:"var(--accent)"}}>verifychain.io/supplier</Link>.
      </div>
    </div>
  );

  const tokenId = dbSupplier?.tokenId;

  return (
    <div className="card animate-in" style={{border:"1px solid rgba(0,229,160,0.25)",padding:0,overflow:"hidden"}}>
      {/* Header */}
      <div style={{
        padding:"24px 28px",borderBottom:"1px solid rgba(0,229,160,0.15)",
        background:"rgba(0,229,160,0.04)",
        display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap" as const,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{
            width:48,height:48,borderRadius:14,background:"rgba(0,229,160,0.1)",
            border:"1px solid rgba(0,229,160,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L20 6.5V15.5L11 20L2 15.5V6.5L11 2Z" stroke="var(--green)" strokeWidth="1.5" fill="none"/>
              <path d="M7 11L10 14L15 8.5" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{fontWeight:800,fontSize:20}}>{cred.companyName}</div>
            <div style={{fontSize:13,color:"var(--green)",marginTop:2}}>
              Verified on-chain · Credential active on Arbitrum
              {tokenId && <span style={{marginLeft:8,fontFamily:"DM Mono,monospace",opacity:0.75}}>#{tokenId}</span>}
            </div>
          </div>
        </div>
        <div style={{
          padding:"6px 14px",borderRadius:99,
          background:"rgba(0,229,160,0.1)",border:"1px solid rgba(0,229,160,0.25)",
          fontSize:12,fontFamily:"DM Mono,monospace",color:"var(--green)",
          fontWeight:600,
        }}>
          TIER {tier} · {tierNames[tier]?.toUpperCase()}
        </div>
      </div>

      {/* Details */}
      <div style={{padding:"24px 28px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          {[
            {l:"Company",   v:cred.companyName},
            {l:"Tax ID",    v:cred.taxId},
            {l:"Country",   v:cred.country},
            {l:"Issued",    v:issued||"—"},
            {l:"Expires",   v:expires||"—"},
            {l:"Token ID",  v:tokenId ? `#${tokenId}` : "On-chain"},
          ].map(({l,v})=>(
            <div key={l} className="card-sm">
              <div style={{fontSize:10,color:"var(--muted)",fontFamily:"DM Mono,monospace",marginBottom:4}}>{l.toUpperCase()}</div>
              <div style={{fontSize:13,fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>

        {/* IPFS CID */}
        {cred.docsIPFSHash && !cred.docsIPFSHash.startsWith("local:") && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,color:"var(--muted)",fontFamily:"DM Mono,monospace",marginBottom:6}}>VERIFIED DOCUMENTS (FILECOIN CID)</div>
            <div style={{
              fontFamily:"DM Mono,monospace",fontSize:11,padding:"10px 14px",
              borderRadius:10,background:"var(--surface2)",color:"var(--accent)",
              wordBreak:"break-all" as const,border:"1px solid var(--border)",
            }}>{cred.docsIPFSHash}</div>
          </div>
        )}

        {/* Actions */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap" as const}}>
          <button className="btn btn-ghost" style={{fontSize:13}} onClick={()=>{
            navigator.clipboard.writeText(`${APP_URL}/verify/${wallet}`);
            toast.success("Share link copied!");
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="10.5" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="10.5" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="3.5" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6.1L9.1 3.4M5 7.9L9.1 10.6" stroke="currentColor" strokeWidth="1.3"/></svg>
            Share verification
          </button>
          <button className="btn btn-ghost" style={{fontSize:13}} onClick={()=>{
            const txt = `VERIFYCHAIN VERIFICATION REPORT\n${"─".repeat(40)}\nCompany: ${cred.companyName}\nTax ID: ${cred.taxId}\nCountry: ${cred.country}\nTier: ${tierNames[tier]}\nIssued: ${issued}\nExpires: ${expires}\nWallet: ${wallet}\nNetwork: Arbitrum\nVerified at: ${new Date().toISOString()}\n`;
            const url=URL.createObjectURL(new Blob([txt],{type:"text/plain"}));
            const a=document.createElement("a"); a.href=url; a.download=`verifychain_${cred.companyName.replace(/ /g,"_")}.txt`; a.click();
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V9M7 9L4 6.5M7 9L10 6.5M1 11V13H13V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Download report
          </button>
          <a href={`https://sepolia.arbiscan.io/address/${wallet}`} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{fontSize:13}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 2H2C1.45 2 1 2.45 1 3V12C1 12.55 1.45 13 2 13H11C11.55 13 12 12.55 12 12V8.5M8 1H13M13 1V6M13 1L6 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            View on Arbiscan →
          </a>
          {tokenId && (
            <a
              href={`https://sepolia.arbiscan.io/token/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}?a=${tokenId}`}
              target="_blank" rel="noreferrer" className="btn btn-ghost" style={{fontSize:13}}
            >
              View credential NFT →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Demo wallets — pre-verified suppliers seeded for judges
const DEMO_WALLETS = [
  { wallet:"0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", company:"Amara Global Trading", flag:"🇳🇬" },
  { wallet:"0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db", company:"Ashanti Exports",       flag:"🇬🇭" },
  { wallet:"0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaA", company:"Nairobi Logistics",    flag:"🇰🇪" },
  { wallet:"0x617F2E2fD72FD9D5503197092aC168c91465E7f3", company:"Dubai Trade Partners",  flag:"🇦🇪" },
];

type SearchMode = "wallet" | "taxid" | "company";

export default function BuyerPage() {
  const { address, isConnected } = useAccount();
  const [query, setQuery]               = useState("");
  const [searchBy, setSearchBy]         = useState<SearchMode>("wallet");
  // wallet search
  const [target, setTarget]             = useState<`0x${string}`|null>(null);
  // tax-id search
  const [taxIdTarget, setTaxIdTarget]   = useState<string|null>(null);
  // company-name search
  const [companyResults, setCompanyResults] = useState<any[]|null>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  // DB fallback for non-on-chain suppliers
  const [dbSupplier, setDbSupplier] = useState<any>(null);
  // direct company-click result (bypasses chain query)
  const [directResult, setDirectResult] = useState<{wallet:string; db:any}|null>(null);
  // api key
  const [apiKey, setApiKey]   = useState<string|null>(null);
  const [company, setCompany] = useState("");
  const [apiLoading, setApiLoading] = useState(false);

  // --- Contract reads ---
  const { data: walletData, isLoading: walletLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "verifySupplier",
    args: target ? [target] : undefined,
    query: { enabled: !!target },
  });

  const { data: taxidData, isLoading: taxidLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "verifyByTaxId",
    args: taxIdTarget ? [taxIdTarget] : undefined,
    query: { enabled: !!taxIdTarget },
  });

  const isLoading = walletLoading || taxidLoading || companyLoading;

  // Fetch DB record (for tokenId and registry fallback)
  // Runs when target changes (covers chip click) and also when walletData arrives
  useEffect(() => {
    if (!target) { setDbSupplier(null); return; }
    axios.get(`${API}/api/supplier/${target}`)
      .then(r => setDbSupplier(r.data))
      .catch(() => setDbSupplier(null));
  }, [target, walletData]);

  useEffect(() => {
    if (!taxidData) { setDbSupplier(null); return; }
    if (!taxIdTarget) return;
    const w = taxidData[2] as string;
    if (!w || w === "0x0000000000000000000000000000000000000000") { setDbSupplier(null); return; }
    axios.get(`${API}/api/supplier/${w}`)
      .then(r => setDbSupplier(r.data))
      .catch(() => setDbSupplier(null));
  }, [taxidData, taxIdTarget]);

  const clearResults = () => {
    setTarget(null);
    setTaxIdTarget(null);
    setCompanyResults(null);
    setDbSupplier(null);
    setDirectResult(null);
  };

  const search = async () => {
    const v = query.trim();
    if (!v) return toast.error("Enter a value to search");

    if (searchBy === "wallet") {
      if (!v.startsWith("0x") || v.length !== 42)
        return toast.error("Enter a valid wallet address (0x… 42 chars)");
      setTarget(v as `0x${string}`);
      setTaxIdTarget(null);
      setCompanyResults(null);
    } else if (searchBy === "taxid") {
      setTaxIdTarget(v);
      setTarget(null);
      setCompanyResults(null);
    } else {
      // company name — hit DB
      setCompanyLoading(true);
      setTarget(null);
      setTaxIdTarget(null);
      setCompanyResults(null);
      setDirectResult(null);
      try {
        const { data: res } = await axios.get(`${API}/api/supplier/search`, { params: { q: v } });
        if (!res?.length) toast.error("No suppliers found with that name");
        setCompanyResults(res || []);
      } catch { toast.error("Search failed"); }
      finally { setCompanyLoading(false); }
    }
  };

  const TABS: { k: SearchMode; label: string }[] = [
    { k: "wallet",  label: "By wallet address" },
    { k: "taxid",   label: "By Tax ID" },
    { k: "company", label: "By company name" },
  ];

  const placeholders: Record<SearchMode, string> = {
    wallet:  "0x1a2b3c...4d5e6f (42 characters)",
    taxid:   "e.g. CAC-123456 or EIN-98-7654321",
    company: "e.g. Acme Global Ltd",
  };

  // Resolved result wallet (for taxid, comes from chain data)
  const taxidWallet = taxidData ? (taxidData[2] as string) : "";

  const getApiKey = async () => {
    if (!company) return toast.error("Enter your company name");
    setApiLoading(true);
    try {
      const {data:d} = await axios.post(`${API}/api/v1/buyers/register`,{wallet:address,companyName:company});
      setApiKey(d.apiKey); toast.success("API key generated!");
    } catch(e:any) { toast.error(e?.response?.data?.detail||"Registration failed"); }
    finally { setApiLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <Nav/>
      <div style={{maxWidth:720,margin:"0 auto",padding:"48px 24px 80px",display:"flex",flexDirection:"column",gap:24}}>

        {/* Header */}
        <div className="animate-in">
          <div className="eyebrow" style={{marginBottom:10}}>Buyer Portal</div>
          <h1 style={{fontSize:36,fontWeight:800,letterSpacing:"-0.035em",lineHeight:1.1}}>
            Verify any supplier.<br/>
            <span style={{color:"var(--accent)"}}>Anywhere in the world.</span>
          </h1>
          <p style={{fontSize:15,color:"var(--muted2)",marginTop:12,lineHeight:1.7}}>
            Results come directly from the Arbitrum blockchain — no middleman, no trust required.
          </p>
        </div>

        {/* Search box */}
        <div className="card animate-in-1">
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap" as const}}>
            {TABS.map(t=>(
              <button key={t.k}
                onClick={()=>{setSearchBy(t.k);setQuery("");clearResults();}}
                className="btn"
                style={{
                  padding:"8px 16px",fontSize:13,
                  background:searchBy===t.k?"rgba(0,212,255,0.1)":"var(--surface2)",
                  color:searchBy===t.k?"var(--accent)":"var(--muted2)",
                  border:`1px solid ${searchBy===t.k?"rgba(0,212,255,0.3)":"var(--border)"}`,
                }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <input
              className={searchBy==="wallet" ? "input input-mono" : "input"}
              style={{flex:1}}
              value={query}
              onChange={e=>setQuery(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&search()}
              placeholder={placeholders[searchBy]}
            />
            <button onClick={search} className="btn btn-primary" style={{flexShrink:0}}>
              {isLoading ? <span className="spinner"/> : "Verify →"}
            </button>
          </div>
          <div style={{marginTop:12,fontSize:12,color:"var(--muted)",display:"flex",alignItems:"center",gap:6}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1"/>
              <path d="M6 5.5V8.5M6 3.5V4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {searchBy==="company"
              ? "Matches suppliers by name from our registry, then verifies on-chain"
              : "Query is read directly from Arbitrum — results are cryptographically verified"}
          </div>

          {/* Demo wallet chips */}
          {searchBy==="wallet" && (
            <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid var(--border)"}}>
              <div style={{fontSize:10,color:"var(--muted)",fontFamily:"DM Mono,monospace",
                letterSpacing:"0.06em",marginBottom:8}}>TRY A DEMO WALLET</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap" as const}}>
                {DEMO_WALLETS.map(d=>(
                  <button key={d.wallet} onClick={()=>{
                    setQuery(d.wallet);
                    setTarget(d.wallet as `0x${string}`);
                    setTaxIdTarget(null);
                    setCompanyResults(null);
                  }} style={{
                    display:"flex",alignItems:"center",gap:6,
                    padding:"6px 12px",borderRadius:99,cursor:"pointer",
                    background:"rgba(0,212,255,0.05)",
                    border:"1px solid rgba(0,212,255,0.15)",
                    color:"var(--accent)",fontSize:12,fontWeight:600,
                    fontFamily:"Syne,sans-serif",transition:"all 0.15s",
                  }}
                  onMouseEnter={e=>{
                    (e.currentTarget as HTMLElement).style.background="rgba(0,212,255,0.1)";
                    (e.currentTarget as HTMLElement).style.borderColor="rgba(0,212,255,0.3)";
                  }}
                  onMouseLeave={e=>{
                    (e.currentTarget as HTMLElement).style.background="rgba(0,212,255,0.05)";
                    (e.currentTarget as HTMLElement).style.borderColor="rgba(0,212,255,0.15)";
                  }}>
                    <span>{d.flag}</span>
                    <span>{d.company}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {(walletLoading || taxidLoading) && (
          <div className="card" style={{textAlign:"center",padding:"44px"}}>
            <div className="spinner" style={{width:28,height:28,margin:"0 auto 14px",borderWidth:3}}/>
            <div style={{color:"var(--muted2)",fontSize:14}}>Querying Arbitrum blockchain...</div>
          </div>
        )}

        {/* Company name results list */}
        {!companyLoading && companyResults && companyResults.length > 0 && (
          <div className="card animate-in" style={{padding:0,overflow:"hidden"}}>
            <div style={{
              padding:"14px 22px",background:"var(--surface2)",
              borderBottom:"1px solid var(--border)",
              fontSize:11,color:"var(--muted)",fontFamily:"DM Mono,monospace",letterSpacing:"0.05em",
            }}>
              {companyResults.length} RESULT{companyResults.length>1?"S":""} FOUND — CLICK TO VERIFY ON-CHAIN
            </div>
            {companyResults.map((r,i)=>(
              <button key={r.wallet} onClick={async ()=>{
                setCompanyResults(null);
                setDirectResult(null);
                setTarget(null);
                // Fetch full DB record immediately — no chain wait
                try {
                  const { data: db } = await axios.get(`${API}/api/supplier/${r.wallet}`);
                  setDirectResult({ wallet: r.wallet, db });
                } catch {
                  // Fallback: show what we have from search result
                  setDirectResult({ wallet: r.wallet, db: { ...r, companyName: r.companyName, status: r.status } });
                }
              }} style={{
                width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"16px 22px",cursor:"pointer",textAlign:"left" as const,
                background:"transparent",border:"none",
                borderBottom:i<companyResults.length-1?"1px solid var(--border)":"none",
                transition:"background 0.15s",fontFamily:"Syne,sans-serif",
              }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="rgba(0,212,255,0.04)"}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="transparent"}>
                <div>
                  <div style={{fontWeight:700,fontSize:15,color:"var(--text)",marginBottom:3}}>{r.companyName}</div>
                  <div style={{fontSize:12,color:"var(--muted2)",display:"flex",gap:12}}>
                    <span>🌍 {r.country||"—"}</span>
                    <span style={{fontFamily:"DM Mono,monospace"}}>{r.wallet.slice(0,6)}...{r.wallet.slice(-4)}</span>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                  <span style={{
                    fontSize:10,fontFamily:"DM Mono,monospace",padding:"3px 10px",borderRadius:99,
                    background:r.status==="approved"?"rgba(0,229,160,0.1)":"rgba(160,180,220,0.08)",
                    color:r.status==="approved"?"var(--green)":"var(--muted)",
                    border:`1px solid ${r.status==="approved"?"rgba(0,229,160,0.2)":"rgba(160,180,220,0.1)"}`,
                  }}>{r.status?.toUpperCase()}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{color:"var(--muted)"}}>
                    <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Direct company-click result — shown immediately from DB, no chain wait */}
        {directResult && (
          <ResultCard
            data={{ isValid: false, cred: null }}
            wallet={directResult.wallet}
            dbSupplier={directResult.db}
          />
        )}

        {/* Wallet / Tax-ID results */}
        {!walletLoading && walletData && target && (
          <>
            <ResultCard data={{isValid:walletData[0],cred:walletData[1]}} wallet={target} dbSupplier={dbSupplier}/>
            {walletData[0] && walletData[1] && (
              <CredentialCard data={{
                companyName: walletData[1].companyName,
                country: walletData[1].country,
                tier: Number(walletData[1].tier),
                tokenId: dbSupplier?.tokenId,
                expiresAt: Number(walletData[1].expiresAt) > 0
                  ? new Date(Number(walletData[1].expiresAt)*1000).toISOString()
                  : null,
                issuedAt: Number(walletData[1].issuedAt) > 0
                  ? new Date(Number(walletData[1].issuedAt)*1000).toISOString()
                  : null,
                wallet: target,
              }}/>
            )}
          </>
        )}
        {!taxidLoading && taxidData && taxIdTarget && (
          <>
            <ResultCard data={{isValid:taxidData[0],cred:taxidData[1]}} wallet={taxidWallet} dbSupplier={dbSupplier}/>
            {taxidData[0] && taxidData[1] && (
              <CredentialCard data={{
                companyName: taxidData[1].companyName,
                country: taxidData[1].country,
                tier: Number(taxidData[1].tier),
                expiresAt: Number(taxidData[1].expiresAt) > 0
                  ? new Date(Number(taxidData[1].expiresAt)*1000).toISOString()
                  : null,
                issuedAt: Number(taxidData[1].issuedAt) > 0
                  ? new Date(Number(taxidData[1].issuedAt)*1000).toISOString()
                  : null,
                wallet: taxidWallet,
              }}/>
            )}
          </>
        )}

        {/* API Access */}
        {isConnected && (
          <div className="card animate-in-2">
            <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>API access</div>
            <div style={{fontSize:13,color:"var(--muted2)",marginBottom:20,lineHeight:1.65}}>
              Integrate supplier verification into your ERP, procurement system, or internal tools.
              <span style={{color:"var(--accent)",fontFamily:"DM Mono,monospace",marginLeft:6}}>$499/mo · Unlimited queries</span>
            </div>

            {!apiKey ? (
              <div style={{display:"flex",gap:10}}>
                <input className="input" placeholder="Your company name" value={company} onChange={e=>setCompany(e.target.value)} style={{flex:1}}/>
                <button onClick={getApiKey} disabled={apiLoading} className="btn btn-primary" style={{flexShrink:0}}>
                  {apiLoading ? <span className="spinner"/> : "Get API key →"}
                </button>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{
                  padding:"12px 16px",borderRadius:12,
                  background:"rgba(0,229,160,0.05)",border:"1px solid rgba(0,229,160,0.2)",
                }}>
                  <div style={{fontSize:10,color:"var(--green)",fontFamily:"DM Mono,monospace",marginBottom:4,fontWeight:600}}>YOUR API KEY — SAVE THIS NOW</div>
                  <div style={{fontFamily:"DM Mono,monospace",fontSize:13,wordBreak:"break-all" as const}}>{apiKey}</div>
                </div>
                <button className="btn btn-ghost" style={{width:"fit-content",fontSize:13}} onClick={()=>{navigator.clipboard.writeText(apiKey);toast.success("Copied!");}}>Copy key</button>
              </div>
            )}

            {/* Code example */}
            <div style={{marginTop:20}}>
              <div style={{fontSize:11,color:"var(--muted)",fontFamily:"DM Mono,monospace",marginBottom:8,letterSpacing:"0.05em"}}>EXAMPLE REQUEST</div>
              <pre style={{
                background:"#080d18",borderRadius:12,padding:"16px 18px",
                fontSize:12,fontFamily:"DM Mono,monospace",color:"#7dd3fc",
                overflowX:"auto" as const,border:"1px solid rgba(255,255,255,0.06)",
                lineHeight:1.7,
              }}>{`curl https://api.verifychain.io/v1/verify/0xSUPPLIER_WALLET \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Response:
{
  "verified": true,
  "company": "Acme Global Ltd",
  "tier": 2,
  "tierName": "Standard",
  "country": "Nigeria",
  "expiresAt": "2027-03-20T00:00:00Z",
  "blockchain": "arbitrum"
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
