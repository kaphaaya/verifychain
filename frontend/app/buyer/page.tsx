"use client";
import { useState } from "react";
import { useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { CONTRACT_ABI, CONTRACT_ADDRESS, TIER_NAMES } from "../../lib/web3";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

function ResultCard({ data, wallet }: { data: any; wallet: string }) {
  const isValid = data?.isValid;
  const cred = data?.cred;
  const tier = cred ? Number(cred[8]) : 0;
  const tierNames = ["","Basic","Standard","Premium"];
  const tierColors = ["","var(--muted2)","var(--accent)","var(--purple)"];
  const expires = cred ? new Date(Number(cred[6])*1000).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}) : null;
  const issued  = cred ? new Date(Number(cred[5])*1000).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}) : null;

  if (!isValid) return (
    <div className="card animate-in" style={{
      border:"1px solid rgba(255,77,106,0.25)",
      background:"rgba(255,77,106,0.04)",textAlign:"center",padding:"44px 32px",
    }}>
      <div style={{
        width:56,height:56,borderRadius:16,margin:"0 auto 18px",
        display:"flex",alignItems:"center",justifyContent:"center",
        background:"rgba(255,77,106,0.1)",border:"1px solid rgba(255,77,106,0.2)",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="var(--red)" strokeWidth="1.5"/>
          <path d="M8 8L16 16M16 8L8 16" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{fontWeight:800,fontSize:20,color:"var(--red)",marginBottom:8}}>Not Verified</div>
      <div style={{fontSize:14,color:"var(--muted2)",lineHeight:1.65,marginBottom:20}}>
        No active credential found on Arbitrum for this address.<br/>
        Do not proceed with this supplier.
      </div>
      <div style={{
        fontFamily:"DM Mono,monospace",fontSize:12,padding:"10px 16px",
        borderRadius:10,background:"var(--surface2)",color:"var(--muted)",
        wordBreak:"break-all" as const,
      }}>{wallet}</div>
    </div>
  );

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
            <div style={{fontWeight:800,fontSize:20}}>{cred[1]}</div>
            <div style={{fontSize:13,color:"var(--green)",marginTop:2}}>Verified · Credential active on Arbitrum</div>
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
            {l:"Company",   v:cred[1]},
            {l:"Tax ID",    v:cred[2]},
            {l:"Country",   v:cred[3]},
            {l:"Issued",    v:issued},
            {l:"Expires",   v:expires},
            {l:"Network",   v:"Arbitrum"},
          ].map(({l,v})=>(
            <div key={l} className="card-sm">
              <div style={{fontSize:10,color:"var(--muted)",fontFamily:"DM Mono,monospace",marginBottom:4}}>{l.toUpperCase()}</div>
              <div style={{fontSize:13,fontWeight:600}}>{v}</div>
            </div>
          ))}
        </div>

        {/* IPFS CID */}
        {cred[4] && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,color:"var(--muted)",fontFamily:"DM Mono,monospace",marginBottom:6}}>VERIFIED DOCUMENTS (FILECOIN CID)</div>
            <div style={{
              fontFamily:"DM Mono,monospace",fontSize:11,padding:"10px 14px",
              borderRadius:10,background:"var(--surface2)",color:"var(--accent)",
              wordBreak:"break-all" as const,border:"1px solid var(--border)",
            }}>{cred[4]}</div>
          </div>
        )}

        {/* Actions */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap" as const}}>
          <button className="btn btn-ghost" style={{fontSize:13}} onClick={()=>{
            const txt = `VERIFYCHAIN VERIFICATION REPORT\n${"─".repeat(40)}\nCompany: ${cred[1]}\nTax ID: ${cred[2]}\nCountry: ${cred[3]}\nTier: ${tierNames[tier]}\nIssued: ${issued}\nExpires: ${expires}\nWallet: ${wallet}\nNetwork: Arbitrum\nVerified at: ${new Date().toISOString()}\n`;
            const url=URL.createObjectURL(new Blob([txt],{type:"text/plain"}));
            const a=document.createElement("a"); a.href=url; a.download=`verifychain_${cred[1].replace(/ /g,"_")}.txt`; a.click();
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V9M7 9L4 6.5M7 9L10 6.5M1 11V13H13V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Download report
          </button>
          <button className="btn btn-ghost" style={{fontSize:13}} onClick={()=>{navigator.clipboard.writeText(wallet); toast.success("Copied!");}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M4 10H2C1.45 10 1 9.55 1 9V2C1 1.45 1.45 1 2 1H9C9.55 1 10 1.45 10 2V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Copy wallet
          </button>
          <a href={`https://sepolia.arbiscan.io/address/${wallet}`} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{fontSize:13}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 2H2C1.45 2 1 2.45 1 3V12C1 12.55 1.45 13 2 13H11C11.55 13 12 12.55 12 12V8.5M8 1H13M13 1V6M13 1L6 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            View on Arbiscan
          </a>
        </div>
      </div>
    </div>
  );
}

export default function BuyerPage() {
  const { address, isConnected } = useAccount();
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState<"wallet"|"taxid">("wallet");
  const [target, setTarget] = useState<`0x${string}`|null>(null);
  const [apiKey, setApiKey] = useState<string|null>(null);
  const [company, setCompany] = useState("");
  const [apiLoading, setApiLoading] = useState(false);

  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "verifySupplier",
    args: target ? [target] : undefined,
    query: { enabled: !!target && searchBy==="wallet" },
  });

  const search = () => {
    const v = query.trim();
    if (!v) return toast.error("Enter a value to search");
    if (searchBy==="wallet") {
      if (!v.startsWith("0x")||v.length!==42) return toast.error("Enter a valid wallet address (0x... 42 chars)");
      setTarget(v as `0x${string}`);
    }
  };

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
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {(["wallet","taxid"] as const).map(t=>(
              <button key={t}
                onClick={()=>{setSearchBy(t);setQuery("");setTarget(null);}}
                className="btn"
                style={{
                  padding:"8px 16px",fontSize:13,
                  background:searchBy===t?"rgba(0,212,255,0.1)":"var(--surface2)",
                  color:searchBy===t?"var(--accent)":"var(--muted2)",
                  border:`1px solid ${searchBy===t?"rgba(0,212,255,0.3)":"var(--border)"}`,
                }}>
                {t==="wallet" ? "By wallet address" : "By Tax ID"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <input
              className="input input-mono" style={{flex:1}}
              value={query} onChange={e=>setQuery(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&search()}
              placeholder={searchBy==="wallet" ? "0x1a2b3c...4d5e6f (42 characters)" : "e.g. CAC-123456 or EIN-98-7654321"}
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
            Query is read directly from Arbitrum — results are cryptographically verified
          </div>
        </div>

        {/* Result */}
        {isLoading && (
          <div className="card" style={{textAlign:"center",padding:"44px"}}>
            <div className="spinner" style={{width:28,height:28,margin:"0 auto 14px",borderWidth:3}}/>
            <div style={{color:"var(--muted2)",fontSize:14}}>Querying Arbitrum blockchain...</div>
          </div>
        )}
        {!isLoading && data && target && (
          <ResultCard data={{isValid:data[0],cred:data[1]}} wallet={target}/>
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
