"use client";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <div style={{
          display:"flex",alignItems:"center",gap:6,padding:"4px 12px",
          borderRadius:99,background:"rgba(0,229,160,0.06)",
          border:"1px solid rgba(0,229,160,0.15)",
          fontSize:11,fontFamily:"DM Mono,monospace",color:"var(--green)",letterSpacing:"0.05em"
        }}>
          <span style={{width:5,height:5,borderRadius:"50%",background:"var(--green)",
            boxShadow:"0 0 6px var(--green)",display:"inline-block",
            animation:"pulse-dot 2s ease-in-out infinite"}}/>
          LIVE · ARBITRUM
        </div>
        <Link href="/about" style={{fontSize:13,color:"var(--muted2)",textDecoration:"none",fontWeight:600}}>About</Link>
        <ConnectButton />
      </div>
    </nav>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────
function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={{
      position:"relative",zIndex:10,
      maxWidth:960,margin:"0 auto",padding:"100px 24px",
      ...style,
    }}>
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display:"inline-flex",alignItems:"center",gap:8,
      fontSize:11,fontFamily:"DM Mono,monospace",color:"var(--accent)",
      letterSpacing:"0.1em",textTransform:"uppercase" as const,
      marginBottom:18,opacity:0.85,
    }}>
      <span style={{width:16,height:1,background:"var(--accent)",opacity:0.6,display:"inline-block"}}/>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize:"clamp(28px,4vw,42px)",fontWeight:800,
      letterSpacing:"-0.035em",lineHeight:1.1,marginBottom:16,
    }}>
      {children}
    </h2>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "What is a soul-bound NFT credential?",
    a: "A soul-bound NFT is a non-transferable token permanently tied to a specific wallet address. VerifyChain mints one for each verified supplier — it cannot be sold, transferred, or faked. It lives on Arbitrum forever.",
  },
  {
    q: "How long does verification take?",
    a: "After submitting your application and documents, our admin team reviews within 24 hours. Once approved, your on-chain credential is minted in under 60 seconds via Arbitrum.",
  },
  {
    q: "How do buyers verify a supplier?",
    a: "Buyers visit the Buyer Portal and enter the supplier's wallet address, tax ID, or company name. Results are fetched directly from the Arbitrum blockchain — no login, no middleman, cryptographically verified.",
  },
  {
    q: "What documents do I need to apply?",
    a: "You'll need: (1) CAC / Business Registration Certificate, (2) Tax Clearance Certificate, (3) Bank Confirmation Letter on official letterhead, and (4) Director / Owner ID Document.",
  },
  {
    q: "Is my data secure?",
    a: "Your documents are stored on Filecoin/IPFS — a decentralized storage network with content-addressing. Only the document hash (CID) is stored on-chain. No centralised server can delete or alter your records.",
  },
  {
    q: "What countries are supported?",
    a: "All 190+ countries. VerifyChain is chain-native, not jurisdiction-native. Any business with a government-issued registration document can apply. Current coverage is especially strong in Nigeria, Ghana, Kenya, and the UAE.",
  },
  {
    q: "How much does it cost?",
    a: "Supplier verification is free during the beta. Enterprise buyer API access is $499/month for unlimited queries. Gas fees on Arbitrum are typically under $0.01 per transaction.",
  },
  {
    q: "What happens if I get rejected?",
    a: "You'll receive a detailed rejection email explaining exactly what needs to be fixed. You have up to 3 application attempts. Most rejections are due to missing or expired documents — fix and reapply.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number|null>(null);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      {FAQS.map((f,i)=>(
        <div key={i} style={{
          borderBottom:"1px solid var(--border)",
          overflow:"hidden",
        }}>
          <button
            onClick={()=>setOpen(open===i?null:i)}
            style={{
              width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"22px 0",background:"none",border:"none",cursor:"pointer",
              textAlign:"left" as const,gap:16,fontFamily:"Syne,sans-serif",
            }}
          >
            <span style={{fontSize:15,fontWeight:700,color:"var(--text)",lineHeight:1.4}}>{f.q}</span>
            <span style={{
              width:24,height:24,borderRadius:8,flexShrink:0,
              background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",
              display:"flex",alignItems:"center",justifyContent:"center",
              color:"var(--muted2)",fontSize:14,transition:"transform 0.2s",
              transform:open===i?"rotate(45deg)":"rotate(0deg)",
            }}>+</span>
          </button>
          {open===i&&(
            <div style={{
              paddingBottom:22,fontSize:14,color:"var(--muted2)",
              lineHeight:1.75,maxWidth:700,
            }}>{f.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Contact section ─────────────────────────────────────────────
function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !message.trim())
      return toast.error("Please fill in all fields");
    setSending(true);
    try {
      await axios.post(`${API}/api/contact`, { name, email, message });
      setSent(true);
      toast.success("Message sent!");
    } catch {
      toast.error("Failed to send — try emailing us directly");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position:"relative",zIndex:10,
      borderTop:"1px solid var(--border)",
    }}>
      <Section>
        <SectionLabel>Get in touch</SectionLabel>
        <SectionTitle>Let's talk<br/><span style={{color:"var(--accent)"}}>supply chain trust.</span></SectionTitle>
        <p style={{fontSize:15,color:"var(--muted2)",lineHeight:1.75,maxWidth:480,marginBottom:52}}>
          Whether you're a buyer, a supplier, or an investor — we'd love to hear from you.
        </p>

        {/* Email cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:48}}>
          {[
            {
              icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="4" width="16" height="11" rx="2" stroke="var(--accent)" strokeWidth="1.4"/><path d="M1 6.5L9 11L17 6.5" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round"/></svg>,
              label:"General inquiries",
              email:"support@verifychain.io",
              desc:"Help with applications, buyer verification, or technical issues.",
            },
            {
              icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="4" width="16" height="11" rx="2" stroke="var(--purple)" strokeWidth="1.4"/><path d="M1 6.5L9 11L17 6.5" stroke="var(--purple)" strokeWidth="1.4" strokeLinecap="round"/></svg>,
              label:"Partnerships & investment",
              email:"invest@verifychain.io",
              desc:"Enterprise pilots, strategic partnerships, and investor inquiries.",
            },
          ].map(c=>(
            <div key={c.email} style={{
              padding:"24px",borderRadius:16,
              background:"var(--surface)",border:"1px solid var(--border)",
            }}>
              <div style={{
                width:40,height:40,borderRadius:11,marginBottom:16,
                display:"flex",alignItems:"center",justifyContent:"center",
                background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",
              }}>{c.icon}</div>
              <div style={{fontSize:11,color:"var(--muted)",fontFamily:"DM Mono,monospace",letterSpacing:"0.06em",marginBottom:6}}>{c.label.toUpperCase()}</div>
              <a href={`mailto:${c.email}`} style={{
                display:"block",fontWeight:700,fontSize:14,color:"var(--accent)",
                textDecoration:"none",marginBottom:8,
              }}>{c.email}</a>
              <div style={{fontSize:13,color:"var(--muted2)",lineHeight:1.65}}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div style={{
          background:"var(--surface)",border:"1px solid var(--border)",
          borderRadius:20,padding:"36px",maxWidth:640,
        }}>
          {sent ? (
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{
                width:56,height:56,borderRadius:16,margin:"0 auto 16px",
                background:"rgba(0,229,160,0.1)",border:"1px solid rgba(0,229,160,0.2)",
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13L9 17L19 7" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{fontWeight:800,fontSize:18,marginBottom:8}}>Message sent!</div>
              <div style={{fontSize:14,color:"var(--muted2)"}}>We'll get back to you within 24 hours.</div>
            </div>
          ) : (
            <>
              <div style={{fontWeight:700,fontSize:18,marginBottom:6}}>Send a message</div>
              <div style={{fontSize:14,color:"var(--muted2)",marginBottom:24,lineHeight:1.65}}>
                Fill in the form and we'll get back to you within 24 hours.
              </div>
              <div style={{display:"flex",flexDirection:"column" as const,gap:14}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>
                    <div style={{fontSize:11,color:"var(--muted)",fontFamily:"DM Mono,monospace",marginBottom:6}}>YOUR NAME</div>
                    <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Jane Smith"/>
                  </div>
                  <div>
                    <div style={{fontSize:11,color:"var(--muted)",fontFamily:"DM Mono,monospace",marginBottom:6}}>EMAIL ADDRESS</div>
                    <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="jane@company.com"/>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:11,color:"var(--muted)",fontFamily:"DM Mono,monospace",marginBottom:6}}>MESSAGE</div>
                  <textarea className="input" rows={5} value={message} onChange={e=>setMessage(e.target.value)}
                    placeholder="Tell us about your project, use case, or how we can help…"
                    style={{resize:"vertical",minHeight:100}}
                  />
                </div>
                <button onClick={submit} disabled={sending} className="btn btn-primary" style={{width:"fit-content",padding:"12px 28px",fontSize:14}}>
                  {sending ? <span className="spinner"/> : "Send message →"}
                </button>
              </div>
            </>
          )}
        </div>
      </Section>
    </div>
  );
}

// ─── Footer ──────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      position:"relative",zIndex:10,
      borderTop:"1px solid var(--border)",
      background:"rgba(5,8,15,0.95)",
    }}>
      <div style={{maxWidth:960,margin:"0 auto",padding:"60px 24px 40px"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:40,marginBottom:48,
          flexWrap:"wrap" as const}}>
          {/* Brand col */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <div className="logo-mark" style={{width:32,height:32,borderRadius:9}}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L12.5 4V10L7 13L1.5 10V4L7 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
                  <circle cx="7" cy="7" r="2.2" fill="white"/>
                </svg>
              </div>
              <span style={{fontWeight:800,fontSize:17,letterSpacing:"-0.02em"}}>
                Verify<span style={{color:"var(--accent)"}}>Chain</span>
              </span>
            </div>
            <p style={{fontSize:13,color:"var(--muted2)",lineHeight:1.7,maxWidth:280,marginBottom:20}}>
              The world's first on-chain supplier verification network. Powered by Arbitrum, Filecoin, and Circle USDC.
            </p>
            <div style={{
              display:"inline-flex",alignItems:"center",gap:6,padding:"5px 14px",
              borderRadius:99,background:"rgba(0,229,160,0.06)",
              border:"1px solid rgba(0,229,160,0.15)",
              fontSize:11,fontFamily:"DM Mono,monospace",color:"var(--green)",letterSpacing:"0.05em"
            }}>
              <span style={{width:5,height:5,borderRadius:"50%",background:"var(--green)",
                boxShadow:"0 0 6px var(--green)",display:"inline-block"}}/>
              LIVE · ARBITRUM SEPOLIA
            </div>
          </div>

          {/* Links col */}
          <div>
            <div style={{fontSize:10,fontFamily:"DM Mono,monospace",color:"var(--muted)",
              letterSpacing:"0.08em",marginBottom:16}}>NAVIGATE</div>
            {[
              {label:"Home", href:"/"},
              {label:"Supplier Portal", href:"/supplier"},
              {label:"Buyer Portal", href:"/buyer"},
              {label:"Admin Dashboard", href:"/admin"},
              {label:"About", href:"/about"},
            ].map(l=>(
              <div key={l.href} style={{marginBottom:10}}>
                <Link href={l.href} style={{
                  fontSize:14,color:"var(--muted2)",textDecoration:"none",
                  fontWeight:600,transition:"color 0.15s",
                }}
                onMouseEnter={e=>(e.currentTarget.style.color="var(--text)")}
                onMouseLeave={e=>(e.currentTarget.style.color="var(--muted2)")}>
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Stack col */}
          <div>
            <div style={{fontSize:10,fontFamily:"DM Mono,monospace",color:"var(--muted)",
              letterSpacing:"0.08em",marginBottom:16}}>TECH STACK</div>
            {["Arbitrum","Filecoin","Circle USDC","Solidity / ERC-721","FastAPI","Next.js 14"].map(t=>(
              <div key={t} style={{
                fontSize:13,color:"var(--muted2)",marginBottom:8,
                display:"flex",alignItems:"center",gap:6,
              }}>
                <span style={{width:4,height:4,borderRadius:"50%",
                  background:"var(--accent)",opacity:0.6,flexShrink:0}}/>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Divider + bottom bar */}
        <div style={{borderTop:"1px solid var(--border)",paddingTop:28}}>
          <div style={{
            display:"flex",alignItems:"center",justifyContent:"space-between",
            flexWrap:"wrap" as const,gap:12,marginBottom:14,
          }}>
            <div style={{
              fontSize:11,fontFamily:"DM Mono,monospace",color:"var(--muted)",
              letterSpacing:"0.04em",
            }}>
              Built on Arbitrum · Documents on Filecoin · Payments in USDC
            </div>
            <div style={{
              fontSize:11,fontFamily:"DM Mono,monospace",color:"var(--muted)",
              letterSpacing:"0.04em",
            }}>
              Aleph Hackathon 2026 · Built by Brown
            </div>
          </div>
          <div style={{
            fontSize:11,color:"rgba(160,180,220,0.3)",
            fontFamily:"DM Mono,monospace",lineHeight:1.6,
          }}>
            ⚠ Currently running on Arbitrum Sepolia testnet for demonstration purposes. Not for production use. No real funds involved.
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main page ───────────────────────────────────────────────────
export default function HomePage() {
  const [mouse, setMouse] = useState({x:0,y:0});
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{
    setMounted(true);
    const fn=(e:MouseEvent)=>setMouse({x:e.clientX,y:e.clientY});
    window.addEventListener("mousemove",fn);
    return()=>window.removeEventListener("mousemove",fn);
  },[]);

  const cards = [
    {
      href:"/supplier", icon:"▲", label:"Supplier",
      sub:"Verify your business once. Mint a global trust credential on Arbitrum.",
      cta:"Apply for verification",
      border:"rgba(0,212,255,0.18)", hborder:"rgba(0,212,255,0.5)",
      glow:"rgba(0,212,255,0.06)", ctaColor:"var(--accent)",
      bg:"rgba(0,212,255,0.03)",
    },
    {
      href:"/buyer", icon:"◉", label:"Buyer",
      sub:"Verify any supplier worldwide in 10 seconds. Straight from the blockchain.",
      cta:"Verify a supplier",
      border:"rgba(0,212,255,0.35)", hborder:"rgba(0,212,255,0.7)",
      glow:"rgba(0,212,255,0.1)", ctaColor:"var(--accent)",
      bg:"linear-gradient(145deg,rgba(0,212,255,0.07),rgba(0,85,255,0.05))",
      featured:true,
    },
    {
      href:"/admin", icon:"◈", label:"Admin",
      sub:"Review applications, approve credentials, manage the global registry.",
      cta:"Open dashboard",
      border:"rgba(167,139,250,0.18)", hborder:"rgba(167,139,250,0.45)",
      glow:"rgba(167,139,250,0.06)", ctaColor:"var(--purple)",
      bg:"rgba(167,139,250,0.03)",
    },
  ];

  const stats = [
    {n:"$300B",  l:"Vendor fraud per year",    c:"var(--red)"},
    {n:"3 wks",  l:"Old onboarding time",       c:"var(--muted)"},
    {n:"10 sec", l:"With VerifyChain",          c:"var(--green)"},
    {n:"190+",   l:"Countries supported",       c:"var(--accent)"},
  ];

  const tech = ["Arbitrum","Filecoin","Circle USDC","Solidity","Chainlink"];

  const steps = [
    {
      num:"01",
      title:"Submit your documents",
      desc:"Suppliers upload their business registration, tax certificate, bank letter, and director ID through the secure portal. Documents are stored on Filecoin/IPFS.",
      icon:(
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M4 3C4 2.45 4.45 2 5 2H13L18 7V19C18 19.55 17.55 20 17 20H5C4.45 20 4 19.55 4 19V3Z"
            stroke="var(--accent)" strokeWidth="1.4" fill="none"/>
          <path d="M13 2V7H18" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M8 12H14M8 15H12" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      num:"02",
      title:"VerifyChain reviews & mints",
      desc:"Our admin team verifies the documents against official records. On approval, a soul-bound NFT credential is minted directly on the Arbitrum blockchain — permanent and immutable.",
      icon:(
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 2L20 6.5V15.5L11 20L2 15.5V6.5L11 2Z" stroke="var(--green)" strokeWidth="1.4" fill="none"/>
          <path d="M7 11L10 14L15 8.5" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      num:"03",
      title:"Buyers verify in 10 seconds",
      desc:"Any buyer worldwide enters the supplier's wallet address, tax ID, or company name. The blockchain returns a cryptographically verified result instantly — no calls, no middleman.",
      icon:(
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="9" stroke="var(--purple)" strokeWidth="1.4"/>
          <path d="M11 6V11L14 13" stroke="var(--purple)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  const users = [
    {
      icon:"🌍",
      title:"SMEs in emerging markets",
      desc:"Small and medium businesses in Nigeria, Ghana, Kenya, UAE, and 190+ countries can establish a globally recognised trust credential for the first time — without expensive auditors or lengthy paperwork.",
      accent:"rgba(0,212,255,0.15)",
      border:"rgba(0,212,255,0.18)",
    },
    {
      icon:"🏢",
      title:"Enterprise procurement teams",
      desc:"Global buyers can verify any new supplier in 10 seconds before signing a contract. Replace 3-week onboarding flows with a single blockchain query. Works with any ERP via our REST API.",
      accent:"rgba(0,229,160,0.12)",
      border:"rgba(0,229,160,0.2)",
    },
    {
      icon:"🏛️",
      title:"Governments & trade bodies",
      desc:"Build trusted supplier registries for public procurement. Issue tamper-proof vendor licenses on-chain. Instantly share verified data with partner agencies without maintaining shared databases.",
      accent:"rgba(167,139,250,0.12)",
      border:"rgba(167,139,250,0.2)",
    },
  ];

  const whyBlockchain = [
    {
      label:"Cannot be forged",
      desc:"Every credential is a soul-bound NFT on Arbitrum. It cannot be duplicated, altered, or transferred. The blockchain is the single source of truth.",
      color:"var(--green)",
    },
    {
      label:"No middleman needed",
      desc:"Buyers query the blockchain directly — no API key, no account, no monthly fee. The data is public, permanent, and verifiable by anyone on earth.",
      color:"var(--accent)",
    },
    {
      label:"Permanent and global",
      desc:"Unlike paper certificates that expire, get lost, or mean nothing abroad, an on-chain credential is valid everywhere, forever, accessible in 10 seconds from any country.",
      color:"var(--purple)",
    },
  ];

  return (
    <div className="page" style={{background:"var(--bg)"}}>
      {/* Background effects */}
      {mounted && (
        <div style={{
          position:"fixed",inset:0,pointerEvents:"none",zIndex:0,
          background:`radial-gradient(800px circle at ${mouse.x}px ${mouse.y}px,rgba(0,212,255,0.03),transparent 60%)`,
        }}/>
      )}
      <div style={{
        position:"fixed",inset:0,pointerEvents:"none",zIndex:0,opacity:0.12,
        backgroundImage:"linear-gradient(rgba(0,212,255,0.06)1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.06)1px,transparent 1px)",
        backgroundSize:"80px 80px",
      }}/>
      <div style={{
        position:"fixed",top:"-10%",left:"50%",transform:"translateX(-50%)",
        width:900,height:600,borderRadius:"50%",pointerEvents:"none",zIndex:0,
        background:"radial-gradient(ellipse,rgba(0,68,255,0.08),transparent 65%)",
        filter:"blur(80px)",
      }}/>

      <Nav/>

      {/* ── Hero ──────────────────────────────── */}
      <section style={{
        position:"relative",zIndex:10,
        display:"flex",flexDirection:"column",alignItems:"center",
        textAlign:"center",padding:"110px 24px 80px",gap:36,
      }}>
        <div className="animate-in" style={{
          display:"inline-flex",alignItems:"center",gap:8,padding:"5px 16px",
          borderRadius:99,background:"rgba(0,212,255,0.04)",
          border:"1px solid rgba(0,212,255,0.15)",
          fontSize:11,fontFamily:"DM Mono,monospace",
          color:"rgba(0,212,255,0.7)",letterSpacing:"0.08em",textTransform:"uppercase" as const,
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 0.5L9.5 3V7L5 9.5L0.5 7V3L5 0.5Z" stroke="currentColor" strokeWidth="1"/>
          </svg>
          Aleph Hackathon 2026 · Global Supplier Trust Network
        </div>

        <h1 className="animate-in-1" style={{
          fontSize:"clamp(46px,7.5vw,88px)",fontWeight:800,
          letterSpacing:"-0.045em",lineHeight:1.0,maxWidth:860,
        }}>
          The world's supplier
          <br/>
          <span style={{
            background:"linear-gradient(90deg,#00d4ff 0%,#4499ff 45%,#00d4ff 100%)",
            backgroundSize:"200% auto",WebkitBackgroundClip:"text",
            backgroundClip:"text",color:"transparent",
            animation:"shimmer 5s linear infinite",
          }}>trust layer.</span>
        </h1>

        <p className="animate-in-2" style={{
          fontSize:18,maxWidth:520,lineHeight:1.75,
          color:"rgba(160,180,220,0.7)",fontWeight:400,
        }}>
          Suppliers verify once and receive an unforgeable on-chain credential.
          Any company anywhere confirms legitimacy in{" "}
          <span style={{color:"var(--text)",fontWeight:600}}>10 seconds</span> — no calls, no paperwork, no fraud.
        </p>

        {/* Role cards */}
        <div className="animate-in-3" style={{
          display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",
          gap:14,width:"100%",maxWidth:820,marginTop:8,
        }}>
          {cards.map(c=>(
            <Link key={c.href} href={c.href} style={{textDecoration:"none"}}>
              <div style={{
                position:"relative",display:"flex",flexDirection:"column",
                gap:14,padding:"26px 22px",borderRadius:20,height:"100%",
                background:c.bg,border:`1px solid ${c.border}`,
                backdropFilter:"blur(12px)",transition:"all 0.2s",cursor:"pointer",
              }}
              onMouseEnter={e=>{
                const el=e.currentTarget as HTMLElement;
                el.style.transform="translateY(-5px)";
                el.style.borderColor=c.hborder;
                el.style.boxShadow=`0 20px 60px ${c.glow}`;
              }}
              onMouseLeave={e=>{
                const el=e.currentTarget as HTMLElement;
                el.style.transform="translateY(0)";
                el.style.borderColor=c.border;
                el.style.boxShadow="none";
              }}>
                {c.featured && (
                  <div style={{
                    position:"absolute",top:14,right:14,
                    fontSize:10,fontFamily:"DM Mono,monospace",
                    padding:"2px 8px",borderRadius:99,
                    background:"rgba(0,212,255,0.1)",color:"var(--accent)",
                    border:"1px solid rgba(0,212,255,0.2)",letterSpacing:"0.05em",
                  }}>POPULAR</div>
                )}
                <div style={{
                  fontSize:22,width:44,height:44,borderRadius:12,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",
                  color:c.ctaColor,
                }}>{c.icon}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:16,color:"var(--text)",marginBottom:7}}>{c.label}</div>
                  <div style={{fontSize:13,lineHeight:1.65,color:"var(--muted2)"}}>{c.sub}</div>
                </div>
                <div style={{
                  display:"flex",alignItems:"center",gap:4,marginTop:"auto",
                  fontSize:12,fontFamily:"DM Mono,monospace",color:c.ctaColor,
                }}>
                  {c.cta}
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6H9.5M7 3.5L9.5 6L7 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Tech pills */}
        <div className="animate-in-4" style={{
          display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" as const,justifyContent:"center",
        }}>
          <span style={{fontSize:11,color:"var(--muted)",fontFamily:"DM Mono,monospace",letterSpacing:"0.05em",marginRight:4}}>BUILT WITH</span>
          {tech.map(t=>(
            <span key={t} style={{
              fontSize:11,fontFamily:"DM Mono,monospace",padding:"3px 10px",
              borderRadius:99,background:"rgba(255,255,255,0.04)",
              border:"1px solid var(--border)",color:"var(--muted2)",
            }}>{t}</span>
          ))}
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────── */}
      <div style={{
        position:"relative",zIndex:10,
        borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)",
        display:"grid",gridTemplateColumns:"repeat(4,1fr)",
        background:"rgba(10,14,24,0.6)",backdropFilter:"blur(20px)",
      }}>
        {stats.map((s,i)=>(
          <div key={s.l} style={{
            display:"flex",flexDirection:"column",alignItems:"center",
            justifyContent:"center",padding:"40px 16px",gap:8,
            borderRight:i<3?"1px solid var(--border)":"none",
          }}>
            <div style={{fontSize:34,fontWeight:800,letterSpacing:"-0.04em",color:s.c}}>{s.n}</div>
            <div style={{
              fontSize:10,color:"var(--muted)",textAlign:"center",
              fontFamily:"DM Mono,monospace",letterSpacing:"0.06em",textTransform:"uppercase" as const,
            }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── How it works ──────────────────────── */}
      <Section>
        <SectionLabel>How it works</SectionLabel>
        <SectionTitle>Three steps to<br/><span style={{color:"var(--accent)"}}>permanent verification.</span></SectionTitle>
        <p style={{fontSize:15,color:"var(--muted2)",marginBottom:52,lineHeight:1.7,maxWidth:520}}>
          From document submission to on-chain credential in under 24 hours. Then verifiable anywhere, forever.
        </p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20}}>
          {steps.map((s,i)=>(
            <div key={i} style={{
              background:"var(--surface)",border:"1px solid var(--border)",
              borderRadius:20,padding:"32px 28px",position:"relative",
              transition:"border-color 0.2s,transform 0.2s",
            }}
            onMouseEnter={e=>{
              (e.currentTarget as HTMLElement).style.borderColor="var(--border2)";
              (e.currentTarget as HTMLElement).style.transform="translateY(-4px)";
            }}
            onMouseLeave={e=>{
              (e.currentTarget as HTMLElement).style.borderColor="var(--border)";
              (e.currentTarget as HTMLElement).style.transform="translateY(0)";
            }}>
              <div style={{
                position:"absolute",top:24,right:24,
                fontSize:11,fontFamily:"DM Mono,monospace",color:"var(--muted)",
                letterSpacing:"0.06em",
              }}>{s.num}</div>
              <div style={{
                width:48,height:48,borderRadius:14,marginBottom:20,
                background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>
                {s.icon}
              </div>
              <div style={{fontWeight:700,fontSize:16,marginBottom:10}}>{s.title}</div>
              <div style={{fontSize:13,color:"var(--muted2)",lineHeight:1.7}}>{s.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Who uses ──────────────────────────── */}
      <div style={{position:"relative",zIndex:10,background:"rgba(10,14,24,0.5)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
        <Section>
          <SectionLabel>Who uses VerifyChain</SectionLabel>
          <SectionTitle>Built for the<br/><span style={{color:"var(--accent)"}}>global supply chain.</span></SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,marginTop:44}}>
            {users.map((u,i)=>(
              <div key={i} style={{
                background:`linear-gradient(145deg,${u.accent},transparent)`,
                border:`1px solid ${u.border}`,
                borderRadius:20,padding:"32px 28px",
              }}>
                <div style={{fontSize:32,marginBottom:20}}>{u.icon}</div>
                <div style={{fontWeight:700,fontSize:17,marginBottom:12,lineHeight:1.3}}>{u.title}</div>
                <div style={{fontSize:13,color:"var(--muted2)",lineHeight:1.75}}>{u.desc}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── Why blockchain ────────────────────── */}
      <Section>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center"}}>
          <div>
            <SectionLabel>Why blockchain</SectionLabel>
            <SectionTitle>Trust without<br/><span style={{color:"var(--green)"}}>a middleman.</span></SectionTitle>
            <p style={{fontSize:15,color:"var(--muted2)",lineHeight:1.75,maxWidth:400}}>
              Traditional supplier verification relies on centralized databases that can be hacked, databases that go offline, and PDFs that can be faked. Blockchain changes all of that.
            </p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {whyBlockchain.map((w,i)=>(
              <div key={i} style={{
                background:"var(--surface)",border:"1px solid var(--border)",
                borderRadius:16,padding:"22px 24px",
                display:"flex",gap:18,alignItems:"flex-start",
              }}>
                <div style={{
                  width:32,height:32,borderRadius:10,flexShrink:0,
                  background:`rgba(${w.color==="var(--green)"?"0,229,160":w.color==="var(--accent)"?"0,212,255":"167,139,250"},0.1)`,
                  border:`1px solid rgba(${w.color==="var(--green)"?"0,229,160":w.color==="var(--accent)"?"0,212,255":"167,139,250"},0.2)`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:14,color:w.color,fontWeight:800,
                }}>{i+1}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:15,marginBottom:6,color:w.color}}>{w.label}</div>
                  <div style={{fontSize:13,color:"var(--muted2)",lineHeight:1.65}}>{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── FAQ ───────────────────────────────── */}
      <div style={{position:"relative",zIndex:10,background:"rgba(10,14,24,0.5)",borderTop:"1px solid var(--border)"}}>
        <Section>
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:60,alignItems:"flex-start"}}>
            <div style={{position:"sticky",top:80}}>
              <SectionLabel>FAQ</SectionLabel>
              <SectionTitle>Common<br/>questions.</SectionTitle>
              <p style={{fontSize:14,color:"var(--muted2)",lineHeight:1.7,marginBottom:28}}>
                Everything you need to know before applying or verifying.
              </p>
              <Link href="/about" className="btn btn-ghost" style={{fontSize:13}}>
                Learn more about us →
              </Link>
            </div>
            <FAQ/>
          </div>
        </Section>
      </div>

      {/* ── CTA strip ─────────────────────────── */}
      <div style={{
        position:"relative",zIndex:10,
        borderTop:"1px solid var(--border)",
        background:"linear-gradient(135deg,rgba(0,68,255,0.06),rgba(0,212,255,0.03))",
      }}>
        <Section style={{padding:"80px 24px",textAlign:"center"}}>
          <div className="eyebrow" style={{marginBottom:16}}>Ready to get started?</div>
          <h2 style={{
            fontSize:"clamp(28px,4vw,48px)",fontWeight:800,
            letterSpacing:"-0.035em",marginBottom:16,lineHeight:1.1,
          }}>
            Join the global trust network.
          </h2>
          <p style={{fontSize:16,color:"var(--muted2)",marginBottom:36,lineHeight:1.7,maxWidth:480,margin:"0 auto 36px"}}>
            Whether you're a supplier looking for recognition or a buyer protecting your supply chain — start today.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" as const}}>
            <Link href="/supplier" className="btn btn-primary" style={{padding:"14px 28px",fontSize:15}}>
              Apply as supplier →
            </Link>
            <Link href="/buyer" className="btn btn-ghost" style={{padding:"14px 28px",fontSize:15}}>
              Verify a supplier
            </Link>
          </div>
        </Section>
      </div>

      <ContactSection/>

      <Footer/>

      <style>{`
        @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .animate-in{animation:fadeUp .45s ease both}
        .animate-in-1{animation:fadeUp .45s ease .06s both}
        .animate-in-2{animation:fadeUp .45s ease .12s both}
        .animate-in-3{animation:fadeUp .45s ease .18s both}
        .animate-in-4{animation:fadeUp .45s ease .24s both}
        *{box-sizing:border-box}
      `}</style>
    </div>
  );
}
