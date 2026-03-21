"use client";
import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

export interface CredentialData {
  companyName: string;
  country: string;
  countryFlag?: string;
  tier: number;
  tokenId?: number | null;
  expiresAt?: string | null;
  wallet: string;
  issuedAt?: string | null;
}

const TIER_NAMES: Record<number, string> = { 1: "Basic", 2: "Standard", 3: "Premium" };
const TIER_COLORS: Record<number, string> = {
  1: "#60a5fa",
  2: "#00d4ff",
  3: "#a78bfa",
};

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://verifychain-zeta.vercel.app";

function ArbitrumStamp() {
  return (
    <div style={{
      position: "absolute",
      bottom: 52,
      right: 20,
      width: 72,
      height: 72,
    }}>
      <svg viewBox="0 0 72 72" width="72" height="72">
        {/* Outer circle */}
        <circle cx="36" cy="36" r="34" fill="none" stroke="rgba(0,229,160,0.35)" strokeWidth="1.5" strokeDasharray="3 2"/>
        {/* Inner circle */}
        <circle cx="36" cy="36" r="27" fill="none" stroke="rgba(0,229,160,0.2)" strokeWidth="1"/>
        {/* Centre fill */}
        <circle cx="36" cy="36" r="24" fill="rgba(0,229,160,0.05)"/>
        {/* VERIFIED text in center */}
        <text x="36" y="33" textAnchor="middle" fill="#00e5a0"
          fontSize="7" fontWeight="800" fontFamily="monospace" letterSpacing="1">
          VERIFIED
        </text>
        {/* ON ARBITRUM text in center line 2 */}
        <text x="36" y="42" textAnchor="middle" fill="rgba(0,229,160,0.7)"
          fontSize="5.5" fontFamily="monospace" letterSpacing="0.5">
          ON ARBITRUM
        </text>
        {/* Curved text around the circle */}
        <defs>
          <path id="top-arc" d="M 6,36 A 30,30 0 0,1 66,36"/>
          <path id="bot-arc" d="M 10,42 A 30,30 0 0,0 62,42"/>
        </defs>
        <text fontSize="5" fill="rgba(0,229,160,0.5)" fontFamily="monospace" letterSpacing="2">
          <textPath href="#top-arc" startOffset="50%" textAnchor="middle">SEPOLIA TESTNET · 2026</textPath>
        </text>
        {/* Star decorations */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = 36 + 30.5 * Math.cos(rad);
          const y = 36 + 30.5 * Math.sin(rad);
          return <circle key={i} cx={x} cy={y} r="1.5" fill="rgba(0,229,160,0.4)"/>;
        })}
      </svg>
    </div>
  );
}

export default function CredentialCard({ data }: { data: CredentialData }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tier = Number(data.tier) || 2;
  const tierName = TIER_NAMES[tier] || "Standard";
  const tierColor = TIER_COLORS[tier] || "#00d4ff";

  const expires = data.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";
  const issued = data.issuedAt
    ? new Date(data.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const shortWallet = data.wallet
    ? `${data.wallet.slice(0, 10)}...${data.wallet.slice(-8)}`
    : "—";

  const tokenIdDisplay = data.tokenId
    ? `#${String(data.tokenId).padStart(4, "0")}`
    : "—";

  const verifyUrl = `${APP_URL}/verify/${data.wallet}`;
  const shortContract = CONTRACT_ADDRESS
    ? `${CONTRACT_ADDRESS.slice(0, 8)}...${CONTRACT_ADDRESS.slice(-6)}`
    : "";

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `verifychain_${(data.companyName || "credential").replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-start", gap: 12 }}>
      {/* Holographic shimmer keyframes */}
      <style>{`
        @keyframes holoshimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .vc-card-border {
          padding: 1.5px;
          border-radius: 21px;
          background: linear-gradient(
            135deg,
            rgba(0,212,255,0.6) 0%,
            rgba(0,68,255,0.5) 20%,
            rgba(167,139,250,0.6) 40%,
            rgba(0,229,160,0.5) 60%,
            rgba(0,212,255,0.6) 80%,
            rgba(0,68,255,0.5) 100%
          );
          background-size: 300% 300%;
          animation: holoshimmer 4s ease infinite;
          box-shadow: 0 0 40px rgba(0,212,255,0.15), 0 0 80px rgba(0,68,255,0.08);
        }
      `}</style>

      <div className="vc-card-border">
        {/* Card */}
        <div
          ref={cardRef}
          style={{
            width: 600,
            height: 360,
            maxWidth: "100%",
            position: "relative",
            background: "#05080f",
            borderRadius: 20,
            overflow: "hidden",
            fontFamily: "'Syne', sans-serif",
            padding: "26px 28px 0",
          }}
        >
          {/* Grid background */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "linear-gradient(rgba(0,212,255,0.04)1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.04)1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}/>

          {/* Radial glow top-left */}
          <div style={{
            position: "absolute", top: -60, left: -60,
            width: 300, height: 300, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(0,212,255,0.08),transparent 65%)",
            pointerEvents: "none",
          }}/>

          {/* Radial glow bottom-right */}
          <div style={{
            position: "absolute", bottom: -80, right: -40,
            width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(0,85,255,0.06),transparent 65%)",
            pointerEvents: "none",
          }}/>

          {/* ── Row 1: Logo + Badge ─────────────────────── */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 18, position: "relative", zIndex: 1,
          }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: "linear-gradient(135deg,rgba(0,212,255,0.18),rgba(0,68,255,0.18))",
                border: "1px solid rgba(0,212,255,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L12.5 4V10L7 13L1.5 10V4L7 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
                  <circle cx="7" cy="7" r="2.2" fill="white"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em", color: "#f0f4ff", lineHeight: 1.1 }}>
                  Verify<span style={{ color: "#00d4ff" }}>Chain</span>
                </div>
                <div style={{ fontSize: 9, color: "rgba(160,180,220,0.5)", fontFamily: "monospace", letterSpacing: "0.06em" }}>
                  SUPPLIER REGISTRY
                </div>
              </div>
            </div>

            {/* Token ID + Verified badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {data.tokenId && (
                <div style={{
                  fontFamily: "monospace",
                  fontSize: 22,
                  fontWeight: 800,
                  color: tierColor,
                  letterSpacing: "-0.02em",
                  textShadow: `0 0 20px ${tierColor}55`,
                }}>
                  {tokenIdDisplay}
                </div>
              )}
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 13px", borderRadius: 99,
                background: "rgba(0,229,160,0.08)",
                border: "1px solid rgba(0,229,160,0.3)",
              }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 0.5L9.5 3V7L5 9.5L0.5 7V3L5 0.5Z" stroke="#00e5a0" strokeWidth="1.2" fill="none"/>
                  <path d="M3 5L4.5 6.5L7 4" stroke="#00e5a0" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#00e5a0", fontFamily: "monospace", letterSpacing: "0.08em" }}>
                  VERIFIED SUPPLIER
                </span>
              </div>
            </div>
          </div>

          {/* ── Company name ─────────────────────────────── */}
          <div style={{ position: "relative", zIndex: 1, marginBottom: 14 }}>
            <div style={{
              fontSize: 26, fontWeight: 800, color: "#ffffff",
              letterSpacing: "-0.03em", lineHeight: 1.1,
              textShadow: "0 2px 20px rgba(0,212,255,0.15)",
            }}>
              {data.companyName || "Company Name"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 7 }}>
              <span style={{ fontSize: 15 }}>{data.countryFlag || "🌍"}</span>
              <span style={{ fontSize: 13, color: "rgba(160,180,220,0.75)", fontWeight: 500 }}>{data.country || "—"}</span>
              <div style={{
                padding: "2px 10px", borderRadius: 99,
                background: `rgba(${tier === 3 ? "167,139,250" : tier === 1 ? "96,165,250" : "0,212,255"},0.1)`,
                border: `1px solid ${tierColor}44`,
                fontSize: 10, fontWeight: 700, color: tierColor,
                fontFamily: "monospace", letterSpacing: "0.08em",
              }}>
                {tierName.toUpperCase()}
              </div>
            </div>
          </div>

          {/* ── Details grid + QR ─────────────────────────── */}
          <div style={{ display: "flex", gap: 14, position: "relative", zIndex: 1, marginBottom: 20 }}>
            <div style={{
              flex: 1,
              display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8,
            }}>
              {[
                { l: "VALID UNTIL", v: expires },
                { l: "ISSUED",      v: issued },
                { l: "NETWORK",     v: "Arbitrum" },
              ].map(({ l, v }) => (
                <div key={l} style={{
                  padding: "8px 10px", borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div style={{ fontSize: 8, color: "rgba(160,180,220,0.45)", fontFamily: "monospace", letterSpacing: "0.08em", marginBottom: 4 }}>
                    {l}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#f0f4ff", lineHeight: 1.2 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* QR code */}
            <div style={{
              padding: 6, borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4,
              flexShrink: 0,
            }}>
              <QRCodeSVG
                value={verifyUrl}
                size={64}
                bgColor="transparent"
                fgColor="rgba(160,200,255,0.85)"
                level="M"
              />
              <div style={{ fontSize: 7, color: "rgba(160,180,220,0.4)", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                SCAN TO VERIFY
              </div>
            </div>
          </div>

          {/* ── Bottom bar ──────────────────────────────── */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "10px 28px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            zIndex: 1,
          }}>
            <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(160,180,220,0.45)", letterSpacing: "0.04em" }}>
              {shortWallet}
            </div>
            <div style={{
              display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 1,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 9, color: "rgba(160,180,220,0.35)", fontFamily: "monospace",
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L11 4V8L6 11L1 8V4L6 1Z" stroke="rgba(160,180,220,0.4)" strokeWidth="1" fill="none"/>
                </svg>
                Permanently recorded on Arbitrum blockchain
              </div>
              {shortContract && (
                <div style={{ fontSize: 8, color: "rgba(160,180,220,0.25)", fontFamily: "monospace", letterSpacing: "0.03em" }}>
                  {shortContract}
                </div>
              )}
            </div>
          </div>

          {/* Cyan gradient line at very bottom */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg,transparent,#00d4ff,#0044ff,#00d4ff,transparent)",
            zIndex: 2,
          }}/>

          {/* Arbitrum stamp */}
          <ArbitrumStamp/>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={downloadCard}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 18px", borderRadius: 10, cursor: "pointer",
          background: "rgba(0,212,255,0.06)",
          border: "1px solid rgba(0,212,255,0.2)",
          color: "var(--accent)", fontSize: 13, fontWeight: 600,
          fontFamily: "Syne, sans-serif", transition: "all 0.15s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.1)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.4)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = "rgba(0,212,255,0.06)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.2)";
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1V9M7 9L4 6.5M7 9L10 6.5M1 11V13H13V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Download credential card as PNG
      </button>
    </div>
  );
}
