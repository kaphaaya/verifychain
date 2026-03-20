"use client";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";

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
        <ConnectButton />
      </div>
    </nav>
  );
}

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

  return (
    <div className="page" style={{background:"var(--bg)"}}>
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

      <section style={{
        position:"relative",zIndex:10,
        display:"flex",flexDirection:"column",alignItems:"center",
        textAlign:"center",padding:"110px 24px 80px",gap:36,
      }}>

        {/* Eyebrow */}
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

        {/* Headline */}
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

        {/* Sub */}
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
              <div
                style={{
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
                }}
              >
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
                  <div style={{fontWeight:700,fontSize:16,color:"var(--text)",marginBottom:7}}>
                    {c.label}
                  </div>
                  <div style={{fontSize:13,lineHeight:1.65,color:"var(--muted2)"}}>
                    {c.sub}
                  </div>
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

        {/* Tech stack pills */}
        <div className="animate-in-4" style={{
          display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" as const,
          justifyContent:"center",
        }}>
          <span style={{fontSize:11,color:"var(--muted)",fontFamily:"DM Mono,monospace",letterSpacing:"0.05em",marginRight:4}}>
            BUILT WITH
          </span>
          {tech.map(t=>(
            <span key={t} style={{
              fontSize:11,fontFamily:"DM Mono,monospace",padding:"3px 10px",
              borderRadius:99,background:"rgba(255,255,255,0.04)",
              border:"1px solid var(--border)",color:"var(--muted2)",
            }}>{t}</span>
          ))}
        </div>
      </section>

      {/* Stats */}
      <div style={{
        position:"relative",zIndex:10,
        borderTop:"1px solid var(--border)",
        display:"grid",gridTemplateColumns:"repeat(4,1fr)",
        background:"rgba(10,14,24,0.6)",backdropFilter:"blur(20px)",
      }}>
        {stats.map((s,i)=>(
          <div key={s.l} style={{
            display:"flex",flexDirection:"column",alignItems:"center",
            justifyContent:"center",padding:"40px 16px",gap:8,
            borderRight:i<3?"1px solid var(--border)":"none",
          }}>
            <div style={{fontSize:34,fontWeight:800,letterSpacing:"-0.04em",color:s.c}}>
              {s.n}
            </div>
            <div style={{
              fontSize:10,color:"var(--muted)",textAlign:"center",
              fontFamily:"DM Mono,monospace",letterSpacing:"0.06em",textTransform:"uppercase" as const,
            }}>{s.l}</div>
          </div>
        ))}
      </div>

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
