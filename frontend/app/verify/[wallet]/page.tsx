"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://verifychain-zeta.vercel.app";

function Nav() {
  return (
    <nav style={{
      position:"sticky",top:0,zIndex:100,
      display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"0 24px",height:60,
      background:"rgba(5,8,15,0.85)",backdropFilter:"blur(16px)",
      borderBottom:"1px solid rgba(255,255,255,0.06)",
    }}>
      <Link href="/" style={{
        display:"flex",alignItems:"center",gap:10,textDecoration:"none",
        fontWeight:800,fontSize:16,letterSpacing:"-0.02em",color:"var(--text)",
      }}>
        <div style={{
          width:30,height:30,borderRadius:8,
          background:"linear-gradient(135deg,rgba(0,212,255,0.15),rgba(0,85,255,0.15))",
          border:"1px solid rgba(0,212,255,0.25)",
          display:"flex",alignItems:"center",justifyContent:"center",
        }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L12.5 4V10L7 13L1.5 10V4L7 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
            <circle cx="7" cy="7" r="2.2" fill="white"/>
          </svg>
        </div>
        Verify<span style={{color:"var(--accent)"}}>Chain</span>
      </Link>
      <div style={{display:"flex",gap:10}}>
        <Link href="/buyer" className="btn btn-ghost" style={{fontSize:13,padding:"7px 14px"}}>
          Verify another supplier
        </Link>
        <Link href="/supplier" className="btn btn-primary" style={{fontSize:13,padding:"7px 14px"}}>
          Get verified →
        </Link>
      </div>
    </nav>
  );
}

type CredResult =
  | { status: "loading" }
  | { status: "onchain"; cred: any; tokenId?: number }
  | { status: "registry"; db: any }
  | { status: "notfound" }
  | { status: "error"; msg: string };

export default function VerifyWalletPage() {
  const { wallet } = useParams<{ wallet: string }>();
  const [result, setResult] = useState<CredResult>({ status: "loading" });

  useEffect(() => {
    if (!wallet) return;
    let cancelled = false;

    async function load() {
      try {
        // 1. Try on-chain via backend proxy
        const { data: chain } = await axios.get(`${API}/api/supplier/${wallet}/credential`);
        if (cancelled) return;
        if (chain.isValid) {
          // also fetch DB for tokenId
          let tokenId: number | undefined;
          try {
            const { data: db } = await axios.get(`${API}/api/supplier/${wallet}`);
            tokenId = db.tokenId;
          } catch {}
          setResult({ status: "onchain", cred: chain, tokenId });
          return;
        }
      } catch {}
      if (cancelled) return;

      // 2. Fallback to DB
      try {
        const { data: db } = await axios.get(`${API}/api/supplier/${wallet}`);
        if (cancelled) return;
        if (db.status === "approved") {
          setResult({ status: "registry", db });
          return;
        }
        setResult({ status: "notfound" });
      } catch (e: any) {
        if (cancelled) return;
        if (e?.response?.status === 404) {
          setResult({ status: "notfound" });
        } else {
          setResult({ status: "error", msg: "Unable to query verification status." });
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [wallet]);

  const tierNames = ["","Basic","Standard","Premium"];
  const shareUrl = `${APP_URL}/verify/${wallet}`;

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <Nav/>
      <div style={{maxWidth:640,margin:"0 auto",padding:"60px 24px 100px",display:"flex",flexDirection:"column",gap:24}}>

        {/* Header */}
        <div>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",marginBottom:14,
            borderRadius:99,background:"rgba(0,212,255,0.04)",border:"1px solid rgba(0,212,255,0.15)",
            fontSize:11,fontFamily:"DM Mono,monospace",color:"rgba(0,212,255,0.7)",letterSpacing:"0.08em",
          }}>
            SUPPLIER VERIFICATION REPORT
          </div>
          <h1 style={{fontSize:28,fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.15,marginBottom:8}}>
            Blockchain Verification
          </h1>
          <div style={{
            fontFamily:"DM Mono,monospace",fontSize:12,color:"var(--muted2)",
            padding:"8px 12px",borderRadius:8,background:"var(--surface2)",
            border:"1px solid var(--border)",wordBreak:"break-all" as const,
          }}>
            {wallet}
          </div>
        </div>

        {/* Loading */}
        {result.status === "loading" && (
          <div className="card" style={{textAlign:"center",padding:"60px"}}>
            <div className="spinner" style={{width:32,height:32,margin:"0 auto 16px",borderWidth:3}}/>
            <div style={{color:"var(--muted2)",fontSize:14}}>Querying Arbitrum blockchain…</div>
          </div>
        )}

        {/* On-chain verified */}
        {result.status === "onchain" && (() => {
          const c = result.cred;
          const tier = Number(c.tier || 0);
          const issued = c.issuedAt ? new Date(c.issuedAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}) : "—";
          const expires = c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}) : "—";
          return (
            <div className="card animate-in" style={{border:"1px solid rgba(0,229,160,0.3)",padding:0,overflow:"hidden"}}>
              {/* Status banner */}
              <div style={{
                padding:"28px",background:"rgba(0,229,160,0.05)",
                borderBottom:"1px solid rgba(0,229,160,0.15)",
                display:"flex",alignItems:"center",gap:16,
              }}>
                <div style={{
                  width:56,height:56,borderRadius:16,flexShrink:0,
                  background:"rgba(0,229,160,0.12)",border:"1px solid rgba(0,229,160,0.3)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}>
                  <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
                    <path d="M11 2L20 6.5V15.5L11 20L2 15.5V6.5L11 2Z" stroke="var(--green)" strokeWidth="1.5" fill="none"/>
                    <path d="M7 11L10 14L15 8.5" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:22,lineHeight:1.2,marginBottom:4}}>{c.companyName}</div>
                  <div style={{color:"var(--green)",fontSize:13,fontWeight:600}}>
                    Verified on-chain · Arbitrum Sepolia
                    {result.tokenId && <span style={{marginLeft:8,fontFamily:"DM Mono,monospace",opacity:0.75}}>#{result.tokenId}</span>}
                  </div>
                </div>
                <div style={{
                  padding:"7px 16px",borderRadius:99,flexShrink:0,
                  background:"rgba(0,229,160,0.1)",border:"1px solid rgba(0,229,160,0.25)",
                  fontSize:12,fontFamily:"DM Mono,monospace",color:"var(--green)",fontWeight:700,
                }}>
                  TIER {tier} · {(tierNames[tier]||"").toUpperCase()}
                </div>
              </div>

              {/* Details grid */}
              <div style={{padding:"28px"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:24}}>
                  {[
                    {l:"Company",  v:c.companyName},
                    {l:"Country",  v:c.country},
                    {l:"Tax ID",   v:c.taxId},
                    {l:"Token ID", v:result.tokenId ? `#${result.tokenId}` : "On-chain"},
                    {l:"Issued",   v:issued},
                    {l:"Expires",  v:expires},
                  ].map(({l,v})=>(
                    <div key={l} className="card-sm">
                      <div style={{fontSize:10,color:"var(--muted)",fontFamily:"DM Mono,monospace",marginBottom:4}}>{l.toUpperCase()}</div>
                      <div style={{fontSize:14,fontWeight:700}}>{v}</div>
                    </div>
                  ))}
                </div>

                <div style={{display:"flex",gap:10,flexWrap:"wrap" as const}}>
                  <button className="btn btn-primary" style={{fontSize:13}} onClick={()=>{
                    navigator.clipboard.writeText(shareUrl);
                    // simple feedback via title flash
                    document.title = "Link copied!";
                    setTimeout(()=>document.title="VerifyChain Verification",1500);
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="10.5" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="10.5" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="3.5" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6.1L9.1 3.4M5 7.9L9.1 10.6" stroke="currentColor" strokeWidth="1.3"/></svg>
                    Share this verification
                  </button>
                  <a href={`https://sepolia.arbiscan.io/address/${wallet}`} target="_blank" rel="noreferrer"
                    className="btn btn-ghost" style={{fontSize:13}}>
                    View on Arbiscan →
                  </a>
                  {result.tokenId && (
                    <a href={`https://sepolia.arbiscan.io/token/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}?a=${result.tokenId}`}
                      target="_blank" rel="noreferrer" className="btn btn-ghost" style={{fontSize:13}}>
                      View credential NFT →
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Registry approved (pending on-chain) */}
        {result.status === "registry" && (() => {
          const db = result.db;
          const tier = Number(db.tier || 0);
          const expires = db.expiresAt ? new Date(db.expiresAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}) : "—";
          return (
            <div className="card animate-in" style={{border:"1px solid rgba(255,181,71,0.3)",padding:0,overflow:"hidden"}}>
              <div style={{
                padding:"28px",background:"rgba(255,181,71,0.04)",
                borderBottom:"1px solid rgba(255,181,71,0.15)",
                display:"flex",alignItems:"center",gap:16,
              }}>
                <div style={{
                  width:56,height:56,borderRadius:16,flexShrink:0,
                  background:"rgba(255,181,71,0.1)",border:"1px solid rgba(255,181,71,0.3)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}>
                  <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
                    <path d="M11 2L20 6.5V15.5L11 20L2 15.5V6.5L11 2Z" stroke="#ffb547" strokeWidth="1.5" fill="none"/>
                    <path d="M11 7V12M11 14.5V15" stroke="#ffb547" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:22,lineHeight:1.2,marginBottom:4}}>{db.companyName}</div>
                  <div style={{color:"#ffb547",fontSize:13,fontWeight:600}}>Registry Approved · On-chain mint pending</div>
                </div>
                <div style={{
                  padding:"7px 16px",borderRadius:99,flexShrink:0,
                  background:"rgba(255,181,71,0.1)",border:"1px solid rgba(255,181,71,0.25)",
                  fontSize:12,fontFamily:"DM Mono,monospace",color:"#ffb547",fontWeight:700,
                }}>
                  TIER {tier} · {(tierNames[tier]||"—").toUpperCase()}
                </div>
              </div>
              <div style={{padding:"28px"}}>
                <div style={{
                  padding:"14px 16px",borderRadius:10,marginBottom:20,
                  background:"rgba(255,181,71,0.06)",border:"1px solid rgba(255,181,71,0.15)",
                  fontSize:13,color:"#ffb547",lineHeight:1.65,
                }}>
                  Approved in the VerifyChain registry — blockchain credential pending.
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:24}}>
                  {[
                    {l:"Company", v:db.companyName},
                    {l:"Country", v:db.country||"—"},
                    {l:"Tax ID",  v:db.taxId||"—"},
                    {l:"Tier",    v:tierNames[tier]||"—"},
                    {l:"Expires", v:expires},
                    {l:"Status",  v:"Registry Approved"},
                  ].map(({l,v})=>(
                    <div key={l} className="card-sm">
                      <div style={{fontSize:10,color:"var(--muted)",fontFamily:"DM Mono,monospace",marginBottom:4}}>{l.toUpperCase()}</div>
                      <div style={{fontSize:14,fontWeight:700}}>{v}</div>
                    </div>
                  ))}
                </div>
                <a href={`https://sepolia.arbiscan.io/address/${wallet}`} target="_blank" rel="noreferrer"
                  className="btn btn-ghost" style={{fontSize:13}}>
                  View on Arbiscan →
                </a>
              </div>
            </div>
          );
        })()}

        {/* Not found */}
        {result.status === "notfound" && (
          <div className="card animate-in" style={{
            border:"1px solid rgba(255,77,106,0.25)",
            background:"rgba(255,77,106,0.04)",padding:"48px 32px",textAlign:"center" as const,
          }}>
            <div style={{
              width:56,height:56,borderRadius:16,margin:"0 auto 20px",
              display:"flex",alignItems:"center",justifyContent:"center",
              background:"rgba(255,77,106,0.1)",border:"1px solid rgba(255,77,106,0.2)",
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="var(--red)" strokeWidth="1.5"/>
                <path d="M8 8L16 16M16 8L8 16" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{fontWeight:800,fontSize:22,color:"var(--red)",marginBottom:10}}>No verified credential found</div>
            <div style={{fontSize:14,color:"var(--muted2)",lineHeight:1.7,maxWidth:420,margin:"0 auto 24px"}}>
              No active VerifyChain credential exists for this wallet address. The supplier may not have applied or their credential may have expired.
            </div>
            <Link href="/buyer" className="btn btn-primary" style={{fontSize:14}}>
              Verify another supplier
            </Link>
          </div>
        )}

        {/* Error */}
        {result.status === "error" && (
          <div className="card animate-in" style={{
            border:"1px solid rgba(255,181,71,0.25)",padding:"40px 32px",textAlign:"center" as const,
          }}>
            <div style={{fontSize:14,color:"var(--muted2)",marginBottom:16}}>{(result as any).msg}</div>
            <button className="btn btn-ghost" onClick={()=>setResult({status:"loading"})}>Retry</button>
          </div>
        )}

        {/* Footer note */}
        <div style={{
          fontSize:12,color:"var(--muted)",textAlign:"center" as const,lineHeight:1.65,
          fontFamily:"DM Mono,monospace",
        }}>
          Results verified on Arbitrum Sepolia · VerifyChain · Aleph Hackathon 2026
        </div>
      </div>

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .animate-in{animation:fadeUp .4s ease both}
        *{box-sizing:border-box}
      `}</style>
    </div>
  );
}
