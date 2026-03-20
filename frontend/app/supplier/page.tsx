"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

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

function DropZone({ label, hint, required, file, onDrop }: {
  label: string; hint: string; required?: boolean;
  file: File | null; onDrop: (f: File) => void;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      if (!files[0]) return;
      if (files[0].type !== "application/pdf") {
        toast.error(`${label} must be a PDF`);
        return;
      }
      onDrop(files[0]);
    },
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div {...getRootProps()} style={{
      border: `1.5px dashed ${file ? "rgba(0,229,160,0.4)" : isDragActive ? "rgba(0,212,255,0.5)" : "rgba(255,255,255,0.1)"}`,
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
  );
}

const TIERS = [
  { value: "1", name: "Basic",    price: "$99/yr",  desc: "Small businesses", features: ["Business reg. verified", "Soul-bound NFT", "Annual renewal"] },
  { value: "2", name: "Standard", price: "$199/yr", desc: "Established companies", features: ["Everything in Basic", "Bank verified", "Standard badge"], hot: true },
  { value: "3", name: "Premium",  price: "$399/yr", desc: "Enterprise", features: ["Everything in Standard", "Chainlink-verified", "Priority support"] },
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

function StatusTimeline({ status }: { status: any }) {
  const steps = [
    { key: "submitted", label: "Application submitted", done: true },
    { key: "reviewing", label: "Under review",          done: status.status !== "pending" },
    { key: "decision",  label: status.status === "approved" ? "Approved & minted" : status.status === "rejected" ? "Not approved" : "Decision pending",
      done: ["approved","rejected","revoked"].includes(status.status),
      approved: status.status === "approved",
      rejected: status.status === "rejected",
    },
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      {steps.map((step, i) => (
        <div key={step.key} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
            <div style={{
              width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
              background: step.done
                ? step.rejected ? "rgba(255,77,106,0.15)" : "rgba(0,229,160,0.15)"
                : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${step.done ? step.rejected ? "rgba(255,77,106,0.4)" : "rgba(0,229,160,0.4)" : "rgba(255,255,255,0.1)"}`,
            }}>
              {step.done
                ? step.rejected
                  ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3L9 9M9 3L3 9" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 4" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <div style={{width:6,height:6,borderRadius:"50%",background:"rgba(255,255,255,0.2)"}}/>
              }
            </div>
            {i < steps.length - 1 && (
              <div style={{width:1.5,height:24,background:step.done?"rgba(0,229,160,0.2)":"rgba(255,255,255,0.06)",margin:"2px 0"}}/>
            )}
          </div>
          <div style={{paddingTop:4,paddingBottom:i<steps.length-1?24:0}}>
            <div style={{
              fontSize:13,fontWeight:600,
              color: step.done ? step.rejected ? "var(--red)" : "var(--green)" : "var(--muted)",
            }}>{step.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SupplierPage() {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState<"form"|"done"|"status">("form");
  const [loading, setLoading] = useState(false);
  const [appStatus, setAppStatus] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string,string>>({});

  const [form, setForm] = useState({
    company_name:"", registration_number:"", tax_id:"",
    country_of_registration:"", country_of_operation:"",
    email:"", phone:"", website:"", linkedin:"",
    director_name:"", national_id:"", tier:"2",
  });

  const [files, setFiles] = useState<{
    business_reg:File|null; tax_doc:File|null; bank_doc:File|null; id_doc:File|null;
  }>({ business_reg:null, tax_doc:null, bank_doc:null, id_doc:null });

  const set = (k:string, v:string) => {
    setForm(f=>({...f,[k]:v}));
    setErrors(e=>({...e,[k]:""}));
  };

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
    if (!form.director_name.trim())      e.director_name = "Required";
    if (!form.national_id.trim())        e.national_id = "Required";
    if (!files.business_reg)             e.business_reg = "Required";
    if (!files.tax_doc)                  e.tax_doc = "Required";
    if (!files.bank_doc)                 e.bank_doc = "Required";
    if (!files.id_doc)                   e.id_doc = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const checkStatus = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/supplier/${address}`);
      setAppStatus(data);
      setStep("status");
    } catch {
      toast.error("No application found for this wallet.");
    } finally { setLoading(false); }
  };

  const submit = async () => {
    if (!isConnected) return toast.error("Connect your wallet first");
    if (!validate()) return toast.error("Please fix the errors below");
    setLoading(true);
    const fd = new FormData();
    fd.append("wallet", address!);
    fd.append("company_name", form.company_name);
    fd.append("tax_id", form.tax_id);
    fd.append("country", form.country_of_registration);
    fd.append("email", form.email);
    fd.append("tier", form.tier);
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
      setStep("done");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Submission failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <Nav/>
      <div style={{maxWidth:700,margin:"0 auto",padding:"48px 24px 80px"}}>

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

        {!isConnected && (
          <div className="card animate-in" style={{textAlign:"center",padding:"52px 32px"}}>
            <div style={{width:56,height:56,borderRadius:16,margin:"0 auto 20px",display:"flex",
              alignItems:"center",justifyContent:"center",background:"rgba(0,212,255,0.08)",
              border:"1px solid rgba(0,212,255,0.2)"}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="6" width="20" height="14" rx="3" stroke="var(--accent)" strokeWidth="1.5"/>
                <path d="M16 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" fill="var(--accent)"/>
                <path d="M2 10h20" stroke="var(--accent)" strokeWidth="1.5"/>
              </svg>
            </div>
            <div style={{fontWeight:700,fontSize:18,marginBottom:8}}>Connect your business wallet</div>
            <div style={{color:"var(--muted2)",fontSize:14,marginBottom:24}}>
              Your credential will be permanently issued to this wallet address
            </div>
            <ConnectButton/>
          </div>
        )}

        {isConnected && step==="form" && (
          <div style={{display:"flex",flexDirection:"column",gap:20}}>

            <div className="card-sm animate-in" style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:10,background:"rgba(0,229,160,0.08)",
                border:"1px solid rgba(0,229,160,0.2)",display:"flex",alignItems:"center",
                justifyContent:"center",flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L13 4V12L8 15L3 12V4L8 1Z" stroke="var(--green)" strokeWidth="1.2" fill="none"/>
                  <circle cx="8" cy="8" r="2" fill="var(--green)"/>
                </svg>
              </div>
              <div>
                <div style={{fontSize:11,color:"var(--muted)",fontFamily:"DM Mono,monospace",marginBottom:2}}>
                  CREDENTIAL WILL BE ISSUED TO
                </div>
                <div style={{fontFamily:"DM Mono,monospace",fontSize:12,color:"var(--text)"}}>{address}</div>
              </div>
            </div>

            <div className="card animate-in-1">
              <div style={{fontWeight:700,fontSize:16,marginBottom:20}}>🏢 Business information</div>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
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

            <div className="card animate-in-2">
              <div style={{fontWeight:700,fontSize:16,marginBottom:20}}>👤 Director / Owner identity</div>
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
            </div>

            <div className="card animate-in-2">
              <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>⭐ Verification tier</div>
              <div style={{fontSize:13,color:"var(--muted)",marginBottom:20}}>Payment in USDC at approval.</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                {TIERS.map(t=>{
                  const sel=form.tier===t.value;
                  return (
                    <div key={t.value} onClick={()=>set("tier",t.value)} style={{
                      position:"relative",padding:"18px 16px",borderRadius:14,cursor:"pointer",
                      border:`1.5px solid ${sel?"rgba(0,212,255,0.5)":"rgba(255,255,255,0.08)"}`,
                      background:sel?"rgba(0,212,255,0.05)":"var(--surface2)",transition:"all 0.15s",
                    }}>
                      {t.hot&&(<div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",
                        fontSize:9,fontFamily:"DM Mono,monospace",padding:"2px 8px",borderRadius:99,
                        background:"var(--accent)",color:"#05080f",fontWeight:700,whiteSpace:"nowrap" as const}}>
                        MOST POPULAR</div>)}
                      <div style={{fontWeight:700,fontSize:14,marginBottom:2}}>{t.name}</div>
                      <div style={{fontSize:16,fontWeight:800,fontFamily:"DM Mono,monospace",
                        color:sel?"var(--accent)":"var(--muted2)",marginBottom:4}}>{t.price}</div>
                      <div style={{fontSize:11,color:"var(--muted)",marginBottom:10}}>{t.desc}</div>
                      {t.features.map(f=>(
                        <div key={f} style={{display:"flex",alignItems:"center",gap:6,
                          fontSize:11,color:"var(--muted2)",marginBottom:4}}>
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

            <div className="card animate-in-3">
              <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>📄 Verification documents</div>
              <div style={{fontSize:13,color:"var(--muted)",marginBottom:20}}>
                PDF only. Max 10MB each. Stored on Filecoin — only the hash goes on-chain.
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <DropZone label="Business registration certificate" required
                  hint="CAC, Articles of Incorporation, or equivalent — PDF only"
                  file={files.business_reg} onDrop={f=>setFiles(p=>({...p,business_reg:f}))}/>
                {errors.business_reg&&<div style={{fontSize:11,color:"var(--red)",marginTop:-6}}>⚠ {errors.business_reg}</div>}
                <DropZone label="Tax clearance or TIN certificate" required
                  hint="Current year tax clearance or VAT certificate — PDF only"
                  file={files.tax_doc} onDrop={f=>setFiles(p=>({...p,tax_doc:f}))}/>
                {errors.tax_doc&&<div style={{fontSize:11,color:"var(--red)",marginTop:-6}}>⚠ {errors.tax_doc}</div>}
                <DropZone label="Bank account confirmation" required
                  hint="Bank letter or statement header — PDF only"
                  file={files.bank_doc} onDrop={f=>setFiles(p=>({...p,bank_doc:f}))}/>
                {errors.bank_doc&&<div style={{fontSize:11,color:"var(--red)",marginTop:-6}}>⚠ {errors.bank_doc}</div>}
                <DropZone label="Director ID — passport or national ID" required
                  hint="International passport bio page or government ID — PDF only"
                  file={files.id_doc} onDrop={f=>setFiles(p=>({...p,id_doc:f}))}/>
                {errors.id_doc&&<div style={{fontSize:11,color:"var(--red)",marginTop:-6}}>⚠ {errors.id_doc}</div>}
              </div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <button onClick={submit} disabled={loading} className="btn btn-primary"
                style={{width:"100%",padding:"15px",fontSize:15}}>
                {loading?<><span className="spinner"/>&nbsp;Submitting...</>:"Submit for verification →"}
              </button>
              <button onClick={checkStatus} style={{background:"none",border:"none",cursor:"pointer",
                color:"var(--muted)",fontSize:13,fontFamily:"Syne,sans-serif"}}>
                Already applied? Check your application status
              </button>
            </div>
          </div>
        )}

        {step==="done" && (
          <div className="card animate-in" style={{textAlign:"center",padding:"52px 32px"}}>
            <div style={{width:64,height:64,borderRadius:20,margin:"0 auto 24px",display:"flex",
              alignItems:"center",justifyContent:"center",background:"rgba(0,229,160,0.1)",
              border:"1px solid rgba(0,229,160,0.25)"}}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M5 14L11 20L23 8" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{fontWeight:800,fontSize:22,marginBottom:10}}>Application submitted!</div>
            <div style={{color:"var(--muted2)",fontSize:14,lineHeight:1.7,maxWidth:400,margin:"0 auto 28px"}}>
              Documents uploaded. Our team reviews within 24 hours. You will receive an email once a decision is made.
            </div>
            <button onClick={checkStatus} className="btn btn-primary">Check my status</button>
          </div>
        )}

        {step==="status" && appStatus && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>

            {/* Approved — congratulations */}
            {appStatus.status==="approved" && (
              <div className="card animate-in" style={{
                border:"1px solid rgba(0,229,160,0.3)",
                background:"linear-gradient(145deg,rgba(0,229,160,0.05),rgba(0,212,255,0.03))",
                padding:0,overflow:"hidden",
              }}>
                <div style={{padding:"28px 28px 24px",borderBottom:"1px solid rgba(0,229,160,0.15)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                    <div style={{width:52,height:52,borderRadius:14,background:"rgba(0,229,160,0.12)",
                      border:"1px solid rgba(0,229,160,0.3)",display:"flex",alignItems:"center",
                      justifyContent:"center",flexShrink:0}}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L21 6.5V17.5L12 22L3 17.5V6.5L12 2Z" stroke="var(--green)" strokeWidth="1.5" fill="none"/>
                        <path d="M8 12L11 15L16 9" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{fontWeight:800,fontSize:20,color:"var(--green)",marginBottom:2}}>
                        Congratulations, {appStatus.companyName}!
                      </div>
                      <div style={{fontSize:13,color:"var(--muted2)"}}>
                        Your business is permanently verified on the Arbitrum blockchain
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize:14,color:"rgba(160,180,220,0.8)",lineHeight:1.7,
                    padding:"14px 16px",borderRadius:10,background:"rgba(0,0,0,0.15)"}}>
                    Your soul-bound NFT credential has been minted and <strong style={{color:"var(--text)"}}>cannot be faked, transferred, or removed</strong>. It will remain valid until <strong style={{color:"var(--text)"}}>{appStatus.expiresAt ? new Date(appStatus.expiresAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}) : "renewal"}</strong>. To make changes, you can apply for an updated credential below.
                  </div>
                </div>
                <div style={{padding:"20px 28px"}}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
                    {[
                      {l:"Token ID",  v:`#${appStatus.tokenId||"—"}`},
                      {l:"Tier",      v:["","Basic","Standard","Premium"][appStatus.tier]||"—"},
                      {l:"Network",   v:"Arbitrum"},
                      {l:"Tax ID",    v:appStatus.taxId},
                      {l:"Country",   v:appStatus.country},
                      {l:"Valid until",v:appStatus.expiresAt?new Date(appStatus.expiresAt).toLocaleDateString():"—"},
                    ].map(({l,v})=>(
                      <div key={l} className="card-sm">
                        <div style={{fontSize:10,color:"var(--muted)",fontFamily:"DM Mono,monospace",marginBottom:4}}>{l.toUpperCase()}</div>
                        <div style={{fontSize:13,fontWeight:600}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{padding:"14px 16px",borderRadius:10,background:"rgba(0,212,255,0.05)",
                    border:"1px solid rgba(0,212,255,0.12)",marginBottom:16}}>
                    <div style={{fontSize:12,fontWeight:600,color:"var(--accent)",marginBottom:4}}>How buyers verify you</div>
                    <div style={{fontSize:12,color:"var(--muted2)",lineHeight:1.65}}>
                      Share your wallet address with any buyer. They go to VerifyChain, enter your wallet, and get a verified result in 10 seconds — straight from Arbitrum.
                    </div>
                    <div style={{fontFamily:"DM Mono,monospace",fontSize:11,color:"var(--muted)",
                      marginTop:8,padding:"6px 10px",borderRadius:8,background:"rgba(0,0,0,0.2)"}}>
                      {appStatus.wallet}
                    </div>
                  </div>
                  <button onClick={()=>setStep("form")} className="btn btn-ghost" style={{fontSize:13}}>
                    Apply for credential update →
                  </button>
                </div>
              </div>
            )}

            {/* Rejected */}
            {appStatus.status==="rejected" && (
              <div className="card animate-in" style={{border:"1px solid rgba(255,77,106,0.25)"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",
                  marginBottom:20,flexWrap:"wrap" as const,gap:12}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>{appStatus.companyName}</div>
                    <div style={{fontFamily:"DM Mono,monospace",fontSize:11,color:"var(--muted)"}}>{appStatus.wallet}</div>
                  </div>
                  <span className="badge badge-rejected">REJECTED</span>
                </div>

                {appStatus.rejectionReason && (
                  <div style={{padding:"14px 16px",borderRadius:10,marginBottom:20,
                    background:"rgba(255,77,106,0.06)",border:"1px solid rgba(255,77,106,0.15)"}}>
                    <div style={{fontSize:11,color:"var(--red)",fontFamily:"DM Mono,monospace",
                      marginBottom:6,fontWeight:600,letterSpacing:"0.04em"}}>REASON FOR REJECTION</div>
                    <div style={{fontSize:14,color:"var(--text)",lineHeight:1.6}}>{appStatus.rejectionReason}</div>
                  </div>
                )}

                <StatusTimeline status={appStatus}/>

                {appStatus.canReapply && (
                  <div style={{marginTop:20}}>
                    <div style={{padding:"12px 16px",borderRadius:10,marginBottom:14,
                      background:"rgba(255,181,71,0.06)",border:"1px solid rgba(255,181,71,0.15)"}}>
                      <div style={{fontSize:13,color:"var(--amber)",lineHeight:1.65}}>
                        You have <strong>{appStatus.attemptsLeft} attempt{appStatus.attemptsLeft!==1?"s":""} remaining</strong>.
                        Please address the rejection reason above before reapplying.
                      </div>
                    </div>
                    <button onClick={()=>setStep("form")} className="btn btn-primary" style={{fontSize:13}}>
                      Reapply now →
                    </button>
                  </div>
                )}

                {!appStatus.canReapply && (
                  <div style={{marginTop:20,padding:"14px 16px",borderRadius:10,
                    background:"rgba(160,180,220,0.04)",border:"1px solid rgba(160,180,220,0.1)"}}>
                    <div style={{fontSize:13,color:"var(--muted2)",lineHeight:1.65}}>
                      You have used all 3 application attempts. Please contact{" "}
                      <a href="mailto:support@verifychain.io" style={{color:"var(--accent)"}}>
                        support@verifychain.io
                      </a>{" "}for assistance.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pending */}
            {appStatus.status==="pending" && (
              <div className="card animate-in">
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",
                  marginBottom:20,flexWrap:"wrap" as const,gap:12}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>{appStatus.companyName}</div>
                    <div style={{fontFamily:"DM Mono,monospace",fontSize:11,color:"var(--muted)"}}>{appStatus.wallet}</div>
                  </div>
                  <span className="badge badge-pending">UNDER REVIEW</span>
                </div>
                <StatusTimeline status={appStatus}/>
                <div style={{marginTop:20,padding:"14px 16px",borderRadius:10,
                  background:"rgba(255,181,71,0.05)",border:"1px solid rgba(255,181,71,0.12)"}}>
                  <div style={{fontSize:13,color:"var(--amber)",lineHeight:1.65}}>
                    Your application is being reviewed. You will receive an email within 24 hours. Attempt {appStatus.attemptCount} of 3.
                  </div>
                </div>
              </div>
            )}

            <button onClick={()=>setStep("form")} style={{background:"none",border:"none",
              cursor:"pointer",color:"var(--muted)",fontSize:13,fontFamily:"Syne,sans-serif"}}>
              ← Back to application form
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
