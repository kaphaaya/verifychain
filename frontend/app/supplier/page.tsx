"use client";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import NFTCredentialCard from "../../components/CredentialCard";

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

function DropZone({ label, hint, required, file, onDrop, error }: {
  label: string; hint: string; required?: boolean;
  file: File | null; onDrop: (f: File) => void; error?: string;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      if (!files[0]) return;
      if (files[0].type !== "application/pdf") { toast.error(`${label} must be a PDF`); return; }
      onDrop(files[0]);
    },
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1, maxSize: 10 * 1024 * 1024,
  });

  return (
    <div>
      <div {...getRootProps()} style={{
        border: `1.5px dashed ${file ? "rgba(0,229,160,0.4)" : isDragActive ? "rgba(0,212,255,0.5)" : error ? "rgba(255,77,106,0.4)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 14, padding: "16px 18px", cursor: "pointer",
        background: file ? "rgba(0,229,160,0.04)" : isDragActive ? "rgba(0,212,255,0.04)" : "var(--surface2)",
        transition: "all 0.2s", display: "flex", alignItems: "center", gap: 14,
      }}>
        <input {...getInputProps()} />
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: file ? "rgba(0,229,160,0.1)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${file ? "rgba(0,229,160,0.2)" : "rgba(255,255,255,0.08)"}`,
        }}>
          {file
            ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9L7.5 12.5L14 6" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3V12M9 3L6 6M9 3L12 6M3 15H15" stroke="rgba(160,180,220,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: file ? "var(--green)" : "var(--text)" }}>
            {label} {required && <span style={{ color: "var(--red)" }}>*</span>}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
            {file ? `✓ ${file.name} (${(file.size / 1024).toFixed(0)}KB)` : hint}
          </div>
        </div>
      </div>
      {error && <div style={{fontSize:11,color:"var(--red)",marginTop:4}}>⚠ {error}</div>}
    </div>
  );
}

// Time-based pricing plans
const PLANS = [
  {
    value: "30",   tier: 1, label: "Monthly",      price: "$29",  period: "/month",
    desc: "Try it out", savings: null,
    features: ["Soul-bound NFT", "Business verified", "30-day validity"],
  },
  {
    value: "90",   tier: 1, label: "Quarterly",    price: "$79",  period: "/quarter",
    desc: "Most popular", savings: "Save 9%",
    features: ["Soul-bound NFT", "Business verified", "90-day validity"],
  },
  {
    value: "180",  tier: 2, label: "Semi-annual",  price: "$149", period: "/6 months",
    desc: "Best value", savings: "Save 14%",
    features: ["All Basic features", "Bank verified", "180-day validity", "Standard badge"],
    hot: true,
  },
  {
    value: "365",  tier: 3, label: "Annual",       price: "$199", period: "/year",
    desc: "Enterprise", savings: "Save 43% vs monthly",
    features: ["All Standard features", "Priority review", "365-day validity", "Premium badge"],
  },
];

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Angola","Argentina","Australia","Austria","Bangladesh",
  "Belgium","Benin","Bolivia","Botswana","Brazil","Cameroon","Canada","Chile","China",
  "Colombia","Congo","Côte d'Ivoire","Croatia","Czech Republic","Denmark","Ecuador","Egypt",
  "Ethiopia","Finland","France","Germany","Ghana","Greece","Guatemala","India","Indonesia",
  "Iran","Iraq","Ireland","Israel","Italy","Japan","Jordan","Kazakhstan","Kenya","Kuwait",
  "Lebanon","Libya","Malaysia","Mali","Mexico","Morocco","Mozambique","Myanmar","Nepal",
  "Netherlands","New Zealand","Nigeria","Norway","Pakistan","Peru","Philippines","Poland",
  "Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia",
  "Singapore","Somalia","South Africa","South Korea","Spain","Sri Lanka","Sudan","Sweden",
  "Switzerland","Syria","Tanzania","Thailand","Togo","Tunisia","Turkey","Uganda","Ukraine",
  "United Arab Emirates","United Kingdom","United States","Uruguay","Venezuela","Vietnam",
  "Yemen","Zambia","Zimbabwe","Other"
];

function Field({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display:"block", fontSize:11, fontFamily:"DM Mono,monospace",
        letterSpacing:"0.05em", color:"var(--muted)", marginBottom:6 }}>
        {label.toUpperCase()} {required && <span style={{color:"var(--red)"}}>*</span>}
      </label>
      {children}
      {hint && !error && <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>{hint}</div>}
      {error && <div style={{fontSize:11,color:"var(--red)",marginTop:4}}>⚠ {error}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string; border: string }> = {
    approved: { color: "var(--green)",   bg: "rgba(0,229,160,0.08)",   border: "rgba(0,229,160,0.2)" },
    pending:  { color: "#ffb547",        bg: "rgba(255,181,71,0.08)",  border: "rgba(255,181,71,0.2)" },
    rejected: { color: "var(--red)",     bg: "rgba(255,77,106,0.08)",  border: "rgba(255,77,106,0.2)" },
  };
  const c = config[status] || config.pending;
  return (
    <span style={{
      fontSize:10,fontFamily:"DM Mono,monospace",padding:"3px 10px",borderRadius:99,fontWeight:700,
      color:c.color, background:c.bg, border:`1px solid ${c.border}`,letterSpacing:"0.05em",
    }}>{status.toUpperCase()}</span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Existing credentials dashboard card
// ─────────────────────────────────────────────────────────────────
function CredentialCard({ app, onReapply }: { app: any; onReapply: () => void }) {
  const tierNames = ["","Basic","Standard","Premium"];
  const expires = app.expiresAt ? new Date(app.expiresAt).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}) : "—";

  if (app.status === "approved") return (
    <div style={{
      padding:"20px 22px",borderRadius:16,
      border:"1px solid rgba(0,229,160,0.25)",background:"rgba(0,229,160,0.03)",
    }}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:14}}>
        <div>
          <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{app.companyName}</div>
          <div style={{fontSize:12,color:"var(--muted2)"}}>{app.country} · {app.taxId}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{
            fontSize:11,fontFamily:"DM Mono,monospace",padding:"3px 10px",borderRadius:99,fontWeight:700,
            color:"var(--green)",background:"rgba(0,229,160,0.08)",border:"1px solid rgba(0,229,160,0.2)",
          }}>VERIFIED</span>
          {app.tokenId && (
            <span style={{
              fontSize:11,fontFamily:"DM Mono,monospace",padding:"3px 10px",borderRadius:99,
              color:"var(--accent)",background:"rgba(0,212,255,0.06)",border:"1px solid rgba(0,212,255,0.15)",
            }}>#{app.tokenId}</span>
          )}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
        {[
          {l:"Tier",    v:tierNames[app.tier]||"—"},
          {l:"Expires", v:expires},
          {l:"Network", v:"Arbitrum"},
        ].map(({l,v})=>(
          <div key={l} style={{padding:"8px 10px",borderRadius:8,background:"var(--surface2)",border:"1px solid var(--border)"}}>
            <div style={{fontSize:9,color:"var(--muted)",fontFamily:"DM Mono,monospace",marginBottom:3}}>{l}</div>
            <div style={{fontSize:12,fontWeight:600}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap" as const,marginBottom:16}}>
        <button className="btn btn-ghost" style={{fontSize:12,padding:"6px 12px"}} onClick={()=>{
          navigator.clipboard.writeText(`${APP_URL}/verify/${app.wallet}`);
          toast.success("Share link copied!");
        }}>
          Share verification
        </button>
        <a href={`https://sepolia.arbiscan.io/address/${app.wallet}`} target="_blank" rel="noreferrer"
          className="btn btn-ghost" style={{fontSize:12,padding:"6px 12px"}}>
          View on Arbiscan →
        </a>
      </div>
      {/* NFT Credential Card */}
      <div style={{margin:"8px -6px 0"}}>
        <NFTCredentialCard data={{
          companyName: app.companyName,
          country: app.country,
          tier: app.tier,
          tokenId: app.tokenId,
          expiresAt: app.expiresAt,
          wallet: app.wallet,
        }}/>
      </div>
    </div>
  );

  if (app.status === "pending") return (
    <div style={{padding:"20px 22px",borderRadius:16,border:"1px solid rgba(255,181,71,0.2)",background:"rgba(255,181,71,0.03)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
        <div>
          <div style={{fontWeight:700,fontSize:15,marginBottom:3}}>{app.companyName}</div>
          <div style={{fontSize:12,color:"var(--muted2)"}}>{app.country}</div>
        </div>
        <StatusBadge status="pending"/>
      </div>
      <div style={{marginTop:12,fontSize:13,color:"#ffb547",lineHeight:1.6}}>
        Under review — you'll receive an email within 24 hours.
      </div>
    </div>
  );

  if (app.status === "rejected") return (
    <div style={{padding:"20px 22px",borderRadius:16,border:"1px solid rgba(255,77,106,0.2)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:10}}>
        <div>
          <div style={{fontWeight:700,fontSize:15,marginBottom:3}}>{app.companyName}</div>
          <div style={{fontSize:12,color:"var(--muted2)"}}>{app.country}</div>
        </div>
        <StatusBadge status="rejected"/>
      </div>
      {app.rejectionReason && (
        <div style={{padding:"10px 12px",borderRadius:8,marginBottom:12,background:"rgba(255,77,106,0.06)",border:"1px solid rgba(255,77,106,0.12)"}}>
          <div style={{fontSize:10,color:"var(--red)",fontFamily:"DM Mono,monospace",marginBottom:4}}>REJECTION REASON</div>
          <div style={{fontSize:13,lineHeight:1.6}}>{app.rejectionReason}</div>
        </div>
      )}
      {app.canReapply && (
        <button onClick={onReapply} className="btn btn-primary" style={{fontSize:13}}>
          Reapply ({app.attemptsLeft} attempt{app.attemptsLeft!==1?"s":""} left) →
        </button>
      )}
    </div>
  );

  return null;
}

// ─────────────────────────────────────────────────────────────────
// Email Auth Panel
// ─────────────────────────────────────────────────────────────────
function AuthPanel({ onAuth }: { onAuth: (token: string, email: string, wallet: string|null) => void }) {
  const [mode, setMode]     = useState<"login"|"register">("login");
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !pass) return toast.error("Fill in email and password");
    setLoading(true);
    try {
      const endpoint = mode === "register" ? "/api/supplier/auth/register" : "/api/supplier/auth/login";
      const { data } = await axios.post(`${API}${endpoint}`, { email, password: pass });
      onAuth(data.sessionToken, data.email, data.wallet);
      toast.success(mode === "register" ? "Account created!" : "Welcome back!");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || (mode === "register" ? "Registration failed" : "Invalid credentials"));
    } finally { setLoading(false); }
  };

  return (
    <div className="card animate-in" style={{padding:"28px"}}>
      <div style={{fontWeight:700,fontSize:17,marginBottom:6}}>
        {mode === "register" ? "Create account" : "Sign in with email"}
      </div>
      <div style={{fontSize:13,color:"var(--muted2)",marginBottom:20}}>
        {mode === "register"
          ? "Create an account to track your applications across sessions."
          : "Sign in to see your existing applications and track status."}
      </div>
      <div style={{display:"flex",flexDirection:"column" as const,gap:12}}>
        <input className="input" type="email" placeholder="your@email.com"
          value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        <input className="input" type="password" placeholder="Password"
          value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        <button onClick={submit} disabled={loading} className="btn btn-primary" style={{fontSize:14}}>
          {loading ? <span className="spinner"/> : mode === "register" ? "Create account →" : "Sign in →"}
        </button>
        <button onClick={()=>setMode(m=>m==="login"?"register":"login")}
          style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:"var(--accent)",fontFamily:"Syne,sans-serif"}}>
          {mode === "login" ? "No account? Create one →" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function SupplierPage() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<Record<string,string>>({});

  // Auth state
  const [authMode, setAuthMode]     = useState<"wallet"|"email"|null>(null);
  const [emailToken, setEmailToken] = useState<string|null>(null);
  const [emailUser, setEmailUser]   = useState<string|null>(null);

  // Effective wallet: MetaMask or from email account
  const effectiveWallet = isConnected ? address! : null;

  // All applications for wallet
  const [allApps, setAllApps]     = useState<any[]|null>(null);
  const [appsLoading, setAppsLoading] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [personalCollapsed, setPersonalCollapsed] = useState(false);

  const [form, setForm] = useState({
    company_name:"", registration_number:"", tax_id:"",
    country_of_registration:"", country_of_operation:"",
    email:"", phone:"", website:"", linkedin:"",
    director_name:"", national_id:"",
  });
  const [selectedPlan, setSelectedPlan] = useState(PLANS[3]); // default Annual

  const [files, setFiles] = useState<{
    business_reg:File|null; tax_doc:File|null; bank_doc:File|null; id_doc:File|null;
  }>({ business_reg:null, tax_doc:null, bank_doc:null, id_doc:null });

  const set = (k:string, v:string) => {
    setForm(f=>({...f,[k]:v}));
    setErrors(e=>({...e,[k]:""}));
  };

  // Load all applications when wallet connects
  useEffect(() => {
    if (!effectiveWallet) { setAllApps(null); setShowForm(false); return; }
    setAppsLoading(true);
    axios.get(`${API}/api/supplier/all/${effectiveWallet}`)
      .then(r => {
        setAllApps(r.data);
        // Pre-fill personal info from most recent application
        const last = r.data[0];
        if (last) {
          try {
            const meta = last.extraMetadata ? JSON.parse(last.extraMetadata) : {};
            if (meta.director_name) {
              setForm(f => ({ ...f, director_name: meta.director_name || "", national_id: meta.national_id || "" }));
              setPersonalCollapsed(true);
            }
          } catch {}
        }
        // If no approved apps, auto-open the form
        if (!r.data.some((a:any) => a.status === "approved")) {
          setShowForm(true);
        }
      })
      .catch(() => {
        setAllApps([]);
        setShowForm(true);
      })
      .finally(() => setAppsLoading(false));
  }, [effectiveWallet]);

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.company_name.trim())        e.company_name = "Required";
    if (!form.registration_number.trim()) e.registration_number = "Required";
    if (!form.tax_id.trim())              e.tax_id = "Required";
    if (!form.country_of_registration)   e.country_of_registration = "Required";
    if (!form.country_of_operation)      e.country_of_operation = "Required";
    if (!form.email.trim())              e.email = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim())              e.phone = "Required";
    if (!personalCollapsed) {
      if (!form.director_name.trim())    e.director_name = "Required";
      if (!form.national_id.trim())      e.national_id = "Required";
    }
    if (!files.business_reg)             e.business_reg = "Required";
    if (!files.tax_doc)                  e.tax_doc = "Required";
    if (!files.bank_doc)                 e.bank_doc = "Required";
    if (!files.id_doc)                   e.id_doc = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!effectiveWallet) return toast.error("Connect your wallet first");
    if (!validate()) return toast.error("Please fix the errors below");
    setLoading(true);
    const fd = new FormData();
    fd.append("wallet",         effectiveWallet);
    fd.append("company_name",   form.company_name);
    fd.append("tax_id",         form.tax_id);
    fd.append("country",        form.country_of_registration);
    fd.append("email",          form.email);
    fd.append("tier",           String(selectedPlan.tier));
    fd.append("validity_days",  selectedPlan.value);
    fd.append("metadata", JSON.stringify({
      registration_number: form.registration_number,
      country_of_operation: form.country_of_operation,
      phone: form.phone, website: form.website,
      linkedin: form.linkedin, director_name: form.director_name,
      national_id: form.national_id,
    }));
    fd.append("cac_cert",     files.business_reg!);
    fd.append("tax_cert",     files.tax_doc!);
    fd.append("bank_details", files.bank_doc!);
    fd.append("id_doc",       files.id_doc!);
    try {
      await axios.post(`${API}/api/supplier/apply`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Application submitted!");
      setShowForm(false);
      // Reload all apps
      const r = await axios.get(`${API}/api/supplier/all/${effectiveWallet}`);
      setAllApps(r.data);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Submission failed");
    } finally { setLoading(false); }
  };

  const handleReapply = (app: any) => {
    setForm(f => ({ ...f, company_name: app.companyName, tax_id: app.taxId, country_of_registration: app.country }));
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
  };

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <Nav/>
      <div style={{maxWidth:700,margin:"0 auto",padding:"48px 24px 100px"}}>

        {/* Hero */}
        <div className="animate-in" style={{marginBottom:36}}>
          <div className="eyebrow" style={{marginBottom:10}}>Supplier Portal</div>
          <h1 style={{fontSize:36,fontWeight:800,letterSpacing:"-0.035em",lineHeight:1.1}}>
            Get verified.<br/>
            <span style={{color:"var(--accent)"}}>Build global trust.</span>
          </h1>
          <p style={{fontSize:15,color:"var(--muted2)",marginTop:12,lineHeight:1.7}}>
            One verification. One soul-bound credential on Arbitrum. Trusted by enterprises worldwide.
          </p>
        </div>

        {/* Connect options */}
        {!isConnected && !emailToken && (
          <div className="card animate-in" style={{marginBottom:0}}>
            <div style={{fontWeight:700,fontSize:17,marginBottom:6}}>Connect to get started</div>
            <div style={{fontSize:13,color:"var(--muted2)",marginBottom:24,lineHeight:1.65}}>
              Connect your wallet to verify your business and receive an on-chain credential.
              Or sign in with email to track existing applications.
            </div>
            <div style={{display:"flex",flexDirection:"column" as const,gap:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <ConnectButton/>
                <span style={{fontSize:13,color:"var(--muted)"}}>— recommended</span>
              </div>
              <div style={{
                display:"flex",alignItems:"center",gap:12,color:"var(--muted)",fontSize:12,
                fontFamily:"DM Mono,monospace",margin:"4px 0",
              }}>
                <span style={{flex:1,height:1,background:"var(--border)"}}/>
                OR
                <span style={{flex:1,height:1,background:"var(--border)"}}/>
              </div>
              <button
                onClick={()=>setAuthMode("email")}
                className="btn btn-ghost"
                style={{fontSize:13,justifyContent:"center"}}>
                Sign in with email
              </button>
            </div>

            {authMode === "email" && (
              <div style={{marginTop:20,paddingTop:20,borderTop:"1px solid var(--border)"}}>
                <AuthPanel onAuth={(token, email, wallet) => {
                  setEmailToken(token);
                  setEmailUser(email);
                  setAuthMode(null);
                }}/>
              </div>
            )}
          </div>
        )}

        {/* Email-only logged in — prompt to connect wallet */}
        {!isConnected && emailToken && (
          <div className="card animate-in" style={{
            padding:"20px 22px",marginBottom:20,
            border:"1px solid rgba(0,212,255,0.2)",background:"rgba(0,212,255,0.04)",
          }}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:3}}>Signed in as {emailUser}</div>
                <div style={{fontSize:13,color:"var(--muted2)"}}>Connect your wallet to submit a new application</div>
              </div>
              <ConnectButton/>
            </div>
          </div>
        )}

        {/* Wallet connected — show dashboard */}
        {isConnected && (
          <>
            {/* Wallet address pill */}
            <div className="card-sm animate-in" style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <div style={{width:36,height:36,borderRadius:10,background:"rgba(0,229,160,0.08)",
                border:"1px solid rgba(0,229,160,0.2)",display:"flex",alignItems:"center",
                justifyContent:"center",flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L13 4V12L8 15L3 12V4L8 1Z" stroke="var(--green)" strokeWidth="1.2" fill="none"/>
                  <circle cx="8" cy="8" r="2" fill="var(--green)"/>
                </svg>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:"var(--muted)",fontFamily:"DM Mono,monospace",marginBottom:2}}>
                  CREDENTIAL WALLET
                </div>
                <div style={{fontFamily:"DM Mono,monospace",fontSize:12,color:"var(--text)"}}>{address}</div>
              </div>
            </div>

            {/* Existing applications */}
            {appsLoading && (
              <div className="card" style={{textAlign:"center",padding:"32px",marginBottom:20}}>
                <div className="spinner" style={{width:24,height:24,margin:"0 auto 10px",borderWidth:2}}/>
                <div style={{fontSize:13,color:"var(--muted2)"}}>Loading your applications…</div>
              </div>
            )}

            {!appsLoading && allApps && allApps.length > 0 && (
              <div className="card animate-in" style={{padding:0,overflow:"hidden",marginBottom:20}}>
                <div style={{
                  padding:"16px 22px",background:"var(--surface2)",
                  borderBottom:"1px solid var(--border)",
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                }}>
                  <div>
                    <div style={{fontSize:11,color:"var(--muted)",fontFamily:"DM Mono,monospace",letterSpacing:"0.05em"}}>
                      YOUR BUSINESSES — {allApps.length} REGISTRATION{allApps.length!==1?"S":""}
                    </div>
                  </div>
                  <button
                    onClick={()=>setShowForm(v=>!v)}
                    className="btn btn-primary"
                    style={{fontSize:12,padding:"6px 14px"}}>
                    {showForm ? "Close form" : "+ Register new business"}
                  </button>
                </div>
                <div style={{padding:"16px 22px",display:"flex",flexDirection:"column" as const,gap:14}}>
                  {allApps.map(app => (
                    <CredentialCard key={app.id} app={app} onReapply={()=>handleReapply(app)}/>
                  ))}
                </div>
              </div>
            )}

            {!appsLoading && allApps && allApps.length === 0 && !showForm && (
              <div style={{textAlign:"center",marginBottom:20}}>
                <button onClick={()=>setShowForm(true)} className="btn btn-primary" style={{fontSize:14,padding:"12px 24px"}}>
                  Register your first business →
                </button>
              </div>
            )}

            {/* Application form */}
            {showForm && (
              <div style={{display:"flex",flexDirection:"column" as const,gap:20}}>

                {/* Personal info — collapsible for returning wallets */}
                <div className="card animate-in-1">
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:personalCollapsed?0:20}}>
                    <div style={{fontWeight:700,fontSize:16}}>👤 Director / Owner identity</div>
                    {allApps && allApps.length > 0 && (
                      <button
                        onClick={()=>setPersonalCollapsed(v=>!v)}
                        className="btn btn-ghost"
                        style={{fontSize:12,padding:"5px 12px"}}>
                        {personalCollapsed ? "Edit personal info" : "Same as previous ▲"}
                      </button>
                    )}
                  </div>
                  {personalCollapsed ? (
                    <div style={{
                      padding:"12px 14px",borderRadius:10,marginTop:12,
                      background:"rgba(0,229,160,0.04)",border:"1px solid rgba(0,229,160,0.15)",
                      fontSize:13,color:"var(--muted2)",
                    }}>
                      Using director info from previous application:{" "}
                      <strong style={{color:"var(--text)"}}>{form.director_name || "—"}</strong>
                      {" "}· ID: <strong style={{color:"var(--text)"}}>{form.national_id || "—"}</strong>
                    </div>
                  ) : (
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                      <Field label="Full name of director or owner" required error={errors.director_name}>
                        <input className="input" placeholder="Amara Okonkwo"
                          value={form.director_name} onChange={e=>set("director_name",e.target.value)}/>
                      </Field>
                      <Field label="Passport or national ID number" required hint="International passport or national ID" error={errors.national_id}>
                        <input className="input" placeholder="A12345678"
                          value={form.national_id} onChange={e=>set("national_id",e.target.value)}/>
                      </Field>
                    </div>
                  )}
                </div>

                <div className="card animate-in-1">
                  <div style={{fontWeight:700,fontSize:16,marginBottom:20}}>🏢 Business information</div>
                  <div style={{display:"flex",flexDirection:"column" as const,gap:16}}>
                    <Field label="Legal company name" required error={errors.company_name}>
                      <input className="input" placeholder="Acme Global Supplies Ltd"
                        value={form.company_name} onChange={e=>set("company_name",e.target.value)}/>
                    </Field>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                      <Field label="Company registration number" required error={errors.registration_number}>
                        <input className="input" placeholder="RC-1234567"
                          value={form.registration_number} onChange={e=>set("registration_number",e.target.value)}/>
                      </Field>
                      <Field label="Tax identification number" required hint="VAT, EIN, TIN or equivalent" error={errors.tax_id}>
                        <input className="input" placeholder="1234567890"
                          value={form.tax_id} onChange={e=>set("tax_id",e.target.value)}/>
                      </Field>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                      <Field label="Country of registration" required error={errors.country_of_registration}>
                        <select className="input" value={form.country_of_registration}
                          onChange={e=>set("country_of_registration",e.target.value)}
                          style={{appearance:"none",cursor:"pointer"}}>
                          <option value="">Select country...</option>
                          {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                      </Field>
                      <Field label="Country of operation" required error={errors.country_of_operation}>
                        <select className="input" value={form.country_of_operation}
                          onChange={e=>set("country_of_operation",e.target.value)}
                          style={{appearance:"none",cursor:"pointer"}}>
                          <option value="">Select country...</option>
                          {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                      </Field>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                      <Field label="Business email" required error={errors.email}>
                        <input className="input" type="email" placeholder="ops@company.com"
                          value={form.email} onChange={e=>set("email",e.target.value)}/>
                      </Field>
                      <Field label="Phone number" required hint="+1 555 000 0000" error={errors.phone}>
                        <input className="input" placeholder="+234 801 234 5678"
                          value={form.phone} onChange={e=>set("phone",e.target.value)}/>
                      </Field>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                      <Field label="Website" hint="Optional">
                        <input className="input" placeholder="https://company.com"
                          value={form.website} onChange={e=>set("website",e.target.value)}/>
                      </Field>
                      <Field label="LinkedIn company page" hint="Optional">
                        <input className="input" placeholder="https://linkedin.com/company/..."
                          value={form.linkedin} onChange={e=>set("linkedin",e.target.value)}/>
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Pricing plans */}
                <div className="card animate-in-2">
                  <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>⭐ Verification plan</div>
                  <div style={{fontSize:13,color:"var(--muted)",marginBottom:20}}>
                    Choose your validity period. Payment in USDC at approval.
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
                    {PLANS.map(plan => {
                      const sel = selectedPlan.value === plan.value;
                      return (
                        <div key={plan.value} onClick={()=>setSelectedPlan(plan)} style={{
                          position:"relative",padding:"18px 16px",borderRadius:14,cursor:"pointer",
                          border:`1.5px solid ${sel?"rgba(0,212,255,0.5)":"rgba(255,255,255,0.08)"}`,
                          background:sel?"rgba(0,212,255,0.05)":"var(--surface2)",transition:"all 0.15s",
                        }}>
                          {plan.hot && (
                            <div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",
                              fontSize:9,fontFamily:"DM Mono,monospace",padding:"2px 8px",borderRadius:99,
                              background:"var(--accent)",color:"#05080f",fontWeight:700,whiteSpace:"nowrap" as const}}>
                              BEST VALUE
                            </div>
                          )}
                          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                            <div style={{fontWeight:700,fontSize:14}}>{plan.label}</div>
                            {plan.savings && (
                              <div style={{
                                fontSize:9,fontFamily:"DM Mono,monospace",padding:"2px 6px",borderRadius:4,
                                background:"rgba(0,229,160,0.1)",color:"var(--green)",border:"1px solid rgba(0,229,160,0.2)",
                              }}>{plan.savings}</div>
                            )}
                          </div>
                          <div style={{fontWeight:800,fontSize:20,fontFamily:"DM Mono,monospace",
                            color:sel?"var(--accent)":"var(--muted2)",marginBottom:2}}>
                            {plan.price}
                            <span style={{fontSize:12,fontWeight:400,color:"var(--muted)"}}>{plan.period}</span>
                          </div>
                          <div style={{fontSize:11,color:"var(--muted)",marginBottom:10}}>{plan.desc}</div>
                          {plan.features.map(f=>(
                            <div key={f} style={{display:"flex",alignItems:"center",gap:6,
                              fontSize:11,color:"var(--muted2)",marginBottom:3}}>
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5L4 7L8 3" stroke={sel?"var(--accent)":"var(--muted)"}
                                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {f}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Documents */}
                <div className="card animate-in-3">
                  <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>📄 Verification documents</div>
                  <div style={{fontSize:13,color:"var(--muted)",marginBottom:20}}>
                    PDF only. Max 10MB each. Stored on Filecoin — only the hash goes on-chain.
                  </div>
                  <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
                    <DropZone label="Business registration certificate" required
                      hint="CAC, Articles of Incorporation, or equivalent — PDF only"
                      file={files.business_reg} onDrop={f=>setFiles(p=>({...p,business_reg:f}))}
                      error={errors.business_reg}/>
                    <DropZone label="Tax clearance or TIN certificate" required
                      hint="Current year tax clearance or VAT certificate — PDF only"
                      file={files.tax_doc} onDrop={f=>setFiles(p=>({...p,tax_doc:f}))}
                      error={errors.tax_doc}/>
                    <DropZone label="Bank account confirmation" required
                      hint="Bank letter or statement header — PDF only"
                      file={files.bank_doc} onDrop={f=>setFiles(p=>({...p,bank_doc:f}))}
                      error={errors.bank_doc}/>
                    <DropZone label="Director ID — passport or national ID" required
                      hint="International passport bio page or government ID — PDF only"
                      file={files.id_doc} onDrop={f=>setFiles(p=>({...p,id_doc:f}))}
                      error={errors.id_doc}/>
                  </div>
                </div>

                <button onClick={submit} disabled={loading} className="btn btn-primary"
                  style={{width:"100%",padding:"15px",fontSize:15}}>
                  {loading ? <><span className="spinner"/>&nbsp;Submitting…</> : "Submit for verification →"}
                </button>

              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .animate-in{animation:fadeUp .45s ease both}
        .animate-in-1{animation:fadeUp .45s ease .06s both}
        .animate-in-2{animation:fadeUp .45s ease .12s both}
        .animate-in-3{animation:fadeUp .45s ease .18s both}
        *{box-sizing:border-box}
      `}</style>
    </div>
  );
}
