"use client";
import { useState, useEffect } from "react";

export default function DemoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("vc_banner_dismissed");
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("vc_banner_dismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position:"sticky", top:0, zIndex:200,
      background:"linear-gradient(90deg,rgba(255,181,71,0.08),rgba(255,181,71,0.04))",
      borderBottom:"1px solid rgba(255,181,71,0.18)",
      display:"flex", alignItems:"center", justifyContent:"center",
      gap:10, padding:"8px 20px",
      backdropFilter:"blur(12px)",
    }}>
      <span style={{
        width:6, height:6, borderRadius:"50%", background:"#ffb547",
        boxShadow:"0 0 8px #ffb547", flexShrink:0,
        animation:"pulse-dot 2s ease-in-out infinite",
      }}/>
      <span style={{
        fontSize:12, fontFamily:"DM Mono,monospace",
        color:"rgba(255,181,71,0.9)", letterSpacing:"0.02em",
        textAlign:"center" as const,
      }}>
        ⚡ Testnet Demo — Running on Arbitrum Sepolia · Not real money · For demonstration purposes only
      </span>
      <button onClick={dismiss} style={{
        marginLeft:8, background:"none", border:"none", cursor:"pointer",
        color:"rgba(255,181,71,0.5)", fontSize:16, lineHeight:1,
        padding:"2px 6px", borderRadius:4, flexShrink:0,
        transition:"color 0.15s",
      }}
      onMouseEnter={e=>(e.currentTarget.style.color="rgba(255,181,71,0.9)")}
      onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,181,71,0.5)")}>
        ×
      </button>
    </div>
  );
}
