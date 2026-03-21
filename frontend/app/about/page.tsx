"use client";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

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
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <Link href="/" style={{fontSize:13,color:"var(--muted2)",textDecoration:"none",fontWeight:600}}>Home</Link>
        <ConnectButton />
      </div>
    </nav>
  );
}

const STACK = [
  { name:"Arbitrum", role:"L2 blockchain for credential minting", color:"var(--accent)" },
  { name:"Solidity / ERC-721", role:"Soul-bound NFT smart contract", color:"var(--amber)" },
  { name:"Filecoin / IPFS", role:"Decentralized document storage", color:"var(--green)" },
  { name:"Circle USDC", role:"Stable payment layer", color:"#5AE3A7" },
  { name:"FastAPI (Python)", role:"Backend API & admin logic", color:"var(--purple)" },
  { name:"Next.js 14", role:"Frontend — App Router + TypeScript", color:"var(--text)" },
  { name:"wagmi + viem", role:"Blockchain hooks & contract reads", color:"var(--accent)" },
  { name:"SQLAlchemy + SQLite", role:"Application database", color:"var(--muted2)" },
];

const ROADMAP = [
  {
    version:"V1",
    status:"done",
    label:"Current — Live on Arbitrum Sepolia",
    items:[
      "Soul-bound NFT credential minting on Arbitrum",
      "Supplier application portal with document upload to IPFS",
      "Admin review queue with approve / reject / revoke",
      "Buyer portal: verify by wallet, tax ID, or company name",
      "Email notifications via Resend",
      "REST API with API-key auth for enterprise buyers",
      "Analytics dashboard for admin",
    ],
  },
  {
    version:"V2",
    status:"coming",
    label:"Next — Mainnet & Scale",
    items:[
      "Arbitrum One mainnet deployment",
      "ZK-proof document verification (no raw doc upload)",
      "Multi-chain support — Base, Optimism, Polygon",
      "Mobile app for suppliers",
      "API marketplace — resell verification data to ERPs",
      "Chainlink oracle integration for real-time cert validation",
      "DAO governance for verification standards",
    ],
  },
];

export default function AboutPage() {
  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      {/* Background */}
      <div style={{
        position:"fixed",top:"-10%",left:"50%",transform:"translateX(-50%)",
        width:800,height:500,borderRadius:"50%",pointerEvents:"none",zIndex:0,
        background:"radial-gradient(ellipse,rgba(0,68,255,0.07),transparent 65%)",
        filter:"blur(80px)",
      }}/>

      <Nav/>

      <div style={{maxWidth:860,margin:"0 auto",padding:"80px 24px 120px",position:"relative",zIndex:10}}>

        {/* Hero */}
        <div style={{marginBottom:80}}>
          <div className="eyebrow" style={{marginBottom:14}}>About VerifyChain</div>
          <h1 style={{
            fontSize:"clamp(36px,5vw,60px)",fontWeight:800,
            letterSpacing:"-0.04em",lineHeight:1.05,marginBottom:20,
          }}>
            Fixing global trust<br/>
            <span style={{
              background:"linear-gradient(90deg,#00d4ff,#4499ff)",
              WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent",
            }}>one credential at a time.</span>
          </h1>
          <p style={{fontSize:17,color:"var(--muted2)",lineHeight:1.8,maxWidth:620}}>
            VerifyChain is an on-chain supplier verification network built for Aleph Hackathon 2026. It solves a $300B fraud problem by replacing paper certificates with permanent, blockchain-native credentials.
          </p>
        </div>

        {/* Problem */}
        <div style={{
          background:"rgba(255,77,106,0.04)",border:"1px solid rgba(255,77,106,0.15)",
          borderRadius:20,padding:"36px 36px",marginBottom:60,
        }}>
          <div className="eyebrow" style={{color:"var(--red)",marginBottom:14}}>The problem</div>
          <h2 style={{fontSize:24,fontWeight:800,letterSpacing:"-0.03em",marginBottom:16}}>
            Global supplier fraud costs $300B every year.
          </h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
            {[
              "Fake registration certificates are trivial to produce in Photoshop.",
              "Verification databases are centralised, siloed, and don't talk to each other.",
              "Onboarding a new supplier takes 2–3 weeks of back-and-forth emails.",
              "SMEs in emerging markets have no credible way to prove legitimacy to global buyers.",
            ].map((p,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{color:"var(--red)",fontSize:16,flexShrink:0,marginTop:1}}>✗</span>
                <span style={{fontSize:14,color:"var(--muted2)",lineHeight:1.65}}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Solution */}
        <div style={{
          background:"rgba(0,229,160,0.04)",border:"1px solid rgba(0,229,160,0.15)",
          borderRadius:20,padding:"36px 36px",marginBottom:60,
        }}>
          <div className="eyebrow" style={{color:"var(--green)",marginBottom:14}}>Our solution</div>
          <h2 style={{fontSize:24,fontWeight:800,letterSpacing:"-0.03em",marginBottom:16}}>
            On-chain credentials that cannot be faked.
          </h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
            {[
              "Soul-bound NFTs are non-transferable — tied to the supplier's wallet address forever.",
              "Any buyer anywhere verifies directly from the Arbitrum blockchain in 10 seconds.",
              "Documents stored on Filecoin/IPFS — decentralised, permanent, tamper-proof.",
              "Works for 190+ countries. No jurisdiction boundaries. No centralised gatekeeper.",
            ].map((p,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{color:"var(--green)",fontSize:16,flexShrink:0,marginTop:1}}>✓</span>
                <span style={{fontSize:14,color:"var(--muted2)",lineHeight:1.65}}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={{marginBottom:80}}>
          <div className="eyebrow" style={{marginBottom:14}}>How it works</div>
          <h2 style={{fontSize:28,fontWeight:800,letterSpacing:"-0.035em",marginBottom:36}}>
            Three steps. One permanent credential.
          </h2>
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {[
              {step:"01",title:"Supplier submits application",desc:"Company uploads registration docs, tax cert, bank letter, and director ID through the web portal. Files are stored on Filecoin/IPFS and the content hash goes on-chain."},
              {step:"02",title:"Admin reviews and mints NFT",desc:"VerifyChain's admin team verifies documents against official records. On approval, a soul-bound ERC-721 NFT is minted on Arbitrum — permanently tied to the supplier's wallet."},
              {step:"03",title:"Buyers verify in 10 seconds",desc:"Any buyer worldwide queries verifySupplier(walletAddress) on Arbitrum. They get back company name, tax ID, country, tier, and expiry — cryptographically verified, no middleman."},
            ].map((s,i,arr)=>(
              <div key={i} style={{
                display:"flex",gap:24,padding:"28px 0",
                borderBottom:i<arr.length-1?"1px solid var(--border)":"none",
                alignItems:"flex-start",
              }}>
                <div style={{
                  width:44,height:44,borderRadius:12,flexShrink:0,
                  background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.15)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:12,fontFamily:"DM Mono,monospace",color:"var(--accent)",fontWeight:600,
                }}>{s.step}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>{s.title}</div>
                  <div style={{fontSize:14,color:"var(--muted2)",lineHeight:1.7}}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={{marginBottom:80}}>
          <div className="eyebrow" style={{marginBottom:14}}>The team</div>
          <h2 style={{fontSize:28,fontWeight:800,letterSpacing:"-0.035em",marginBottom:36}}>
            Solo builder. Full-stack vision.
          </h2>
          <div style={{
            background:"var(--surface)",border:"1px solid var(--border)",
            borderRadius:20,padding:"32px",
            display:"flex",alignItems:"center",gap:28,flexWrap:"wrap" as const,
          }}>
            <div style={{
              width:72,height:72,borderRadius:20,flexShrink:0,
              background:"linear-gradient(135deg,rgba(0,212,255,0.2),rgba(0,68,255,0.2))",
              border:"1px solid rgba(0,212,255,0.25)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:28,fontWeight:800,color:"var(--accent)",
            }}>B</div>
            <div style={{flex:1,minWidth:200}}>
              <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Brown</div>
              <div style={{fontSize:13,color:"var(--accent)",fontFamily:"DM Mono,monospace",marginBottom:10}}>
                Solo Builder · Full-Stack Developer
              </div>
              <div style={{fontSize:14,color:"var(--muted2)",lineHeight:1.7,maxWidth:500}}>
                Built VerifyChain end-to-end — smart contracts, backend API, frontend, and everything in between. Passionate about using blockchain technology to solve real-world problems in emerging markets.
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <a href="https://github.com/kaphaaya/verifychain" target="_blank" rel="noreferrer"
                className="btn btn-ghost" style={{fontSize:13}}>
                GitHub →
              </a>
              <a href={`https://sepolia.arbiscan.io/address/0xDb3442b2A6F337d75b56219c3900ce075E2FBF98`}
                target="_blank" rel="noreferrer"
                className="btn btn-ghost" style={{fontSize:13}}>
                Contract →
              </a>
            </div>
          </div>
        </div>

        {/* Tech stack */}
        <div style={{marginBottom:80}}>
          <div className="eyebrow" style={{marginBottom:14}}>Tech stack</div>
          <h2 style={{fontSize:28,fontWeight:800,letterSpacing:"-0.035em",marginBottom:36}}>
            Built on battle-tested infrastructure.
          </h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
            {STACK.map(s=>(
              <div key={s.name} style={{
                background:"var(--surface)",border:"1px solid var(--border)",
                borderRadius:14,padding:"18px 20px",
                transition:"border-color 0.2s",
              }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor="var(--border2)"}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor="var(--border)"}>
                <div style={{
                  fontSize:13,fontWeight:700,color:s.color,marginBottom:4,
                }}>{s.name}</div>
                <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.5}}>{s.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div style={{marginBottom:80}}>
          <div className="eyebrow" style={{marginBottom:14}}>Roadmap</div>
          <h2 style={{fontSize:28,fontWeight:800,letterSpacing:"-0.035em",marginBottom:36}}>
            Where we are. Where we're going.
          </h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            {ROADMAP.map(r=>(
              <div key={r.version} style={{
                background:"var(--surface)",border:`1px solid ${r.status==="done"?"rgba(0,229,160,0.2)":"var(--border)"}`,
                borderRadius:20,padding:"28px 28px",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
                  <div style={{
                    fontSize:18,fontWeight:800,color:r.status==="done"?"var(--green)":"var(--muted2)",
                    fontFamily:"DM Mono,monospace",
                  }}>{r.version}</div>
                  <span style={{
                    fontSize:10,fontFamily:"DM Mono,monospace",padding:"2px 10px",borderRadius:99,
                    background:r.status==="done"?"rgba(0,229,160,0.1)":"rgba(160,180,220,0.08)",
                    color:r.status==="done"?"var(--green)":"var(--muted)",
                    border:`1px solid ${r.status==="done"?"rgba(0,229,160,0.2)":"rgba(160,180,220,0.1)"}`,
                  }}>{r.status==="done"?"✓ COMPLETE":"COMING NEXT"}</span>
                </div>
                <div style={{
                  fontSize:11,color:"var(--muted)",fontFamily:"DM Mono,monospace",
                  marginBottom:14,letterSpacing:"0.04em",
                }}>{r.label}</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {r.items.map((item,i)=>(
                    <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                      <span style={{
                        color:r.status==="done"?"var(--green)":"var(--muted)",
                        fontSize:13,flexShrink:0,marginTop:1,
                      }}>{r.status==="done"?"✓":"○"}</span>
                      <span style={{fontSize:13,color:"var(--muted2)",lineHeight:1.5}}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div style={{
          background:"var(--surface)",border:"1px solid var(--border)",
          borderRadius:20,padding:"36px",textAlign:"center",
        }}>
          <div className="eyebrow" style={{marginBottom:14}}>Links</div>
          <h2 style={{fontSize:24,fontWeight:800,letterSpacing:"-0.03em",marginBottom:24}}>
            Explore the project
          </h2>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" as const}}>
            <a href="https://github.com/kaphaaya/verifychain" target="_blank" rel="noreferrer"
              className="btn btn-ghost" style={{fontSize:14}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </a>
            <a href="https://sepolia.arbiscan.io/address/0xDb3442b2A6F337d75b56219c3900ce075E2FBF98"
              target="_blank" rel="noreferrer"
              className="btn btn-ghost" style={{fontSize:14}}>
              Smart Contract on Arbiscan →
            </a>
            <Link href="/supplier" className="btn btn-primary" style={{fontSize:14}}>
              Apply for verification →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
