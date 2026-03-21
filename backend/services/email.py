import resend
import os

resend.api_key = os.getenv("RESEND_API_KEY", "")

FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")

def send_rejection_email(to_email: str, company_name: str, reason: str, attempts_left: int):
    if not resend.api_key or not to_email:
        return None
    try:
        return resend.Emails.send({
            "from": FROM_EMAIL,
            "to": [to_email],
            "cc": ["aziz.kafayat@gmail.com"],
            "subject": f"Your VerifyChain application was not approved — {company_name}",
            "html": f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#05080f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <div style="margin-bottom:32px;">
      <span style="font-size:20px;font-weight:800;color:#f0f4ff;letter-spacing:-0.03em;">
        Verify<span style="color:#00d4ff;">Chain</span>
      </span>
    </div>

    <div style="background:#0c1120;border:1px solid rgba(255,77,106,0.25);border-radius:16px;padding:32px;margin-bottom:24px;">
      <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,77,106,0.1);border:1px solid rgba(255,77,106,0.2);display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
        <span style="font-size:22px;">✗</span>
      </div>
      <h1 style="color:#f0f4ff;font-size:22px;font-weight:800;margin:0 0 8px;letter-spacing:-0.03em;">
        Application not approved
      </h1>
      <p style="color:rgba(160,180,220,0.75);font-size:15px;margin:0 0 24px;line-height:1.6;">
        Hi {company_name}, your verification application has been reviewed and was not approved at this time.
      </p>

      <div style="background:rgba(255,77,106,0.06);border:1px solid rgba(255,77,106,0.15);border-radius:10px;padding:16px 18px;margin-bottom:24px;">
        <div style="font-size:11px;color:#ff4d6a;font-family:monospace;letter-spacing:0.05em;margin-bottom:6px;font-weight:600;">REASON FOR REJECTION</div>
        <div style="color:#f0f4ff;font-size:14px;line-height:1.6;">{reason}</div>
      </div>

      {"<div style='background:rgba(255,181,71,0.06);border:1px solid rgba(255,181,71,0.15);border-radius:10px;padding:14px 18px;margin-bottom:24px;'><div style='color:#ffb547;font-size:13px;line-height:1.6;'><strong>You can reapply.</strong> You have <strong>" + str(attempts_left) + " attempt" + ("s" if attempts_left != 1 else "") + "</strong> remaining. Please address the reason above before reapplying.</div></div>" if attempts_left > 0 else "<div style='background:rgba(160,180,220,0.04);border:1px solid rgba(160,180,220,0.1);border-radius:10px;padding:14px 18px;margin-bottom:24px;'><div style='color:rgba(160,180,220,0.7);font-size:13px;line-height:1.6;'>You have used all 3 application attempts. Please contact <a href='mailto:aziz.kafayat@gmail.com' style='color:#00d4ff;'>aziz.kafayat@gmail.com</a> for assistance.</div></div>"}

      <a href="https://verifychain.io/supplier" style="display:inline-block;background:linear-gradient(135deg,#00d4ff,#0066ff);color:#05080f;font-size:14px;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;">
        {"Reapply now →" if attempts_left > 0 else "Contact support →"}
      </a>
    </div>

    <p style="color:rgba(160,180,220,0.4);font-size:12px;text-align:center;margin:0;">
      VerifyChain · On-chain supplier verification · Built on Arbitrum
    </p>
  </div>
</body>
</html>
            """,
        })
    except Exception as e:
        print(f"Email send failed: {e}")
        return None


def send_approval_email(to_email: str, company_name: str, token_id: int, tier: int, expires_at: str, wallet: str):
    if not resend.api_key or not to_email:
        return None
    tier_names = ["", "Basic", "Standard", "Premium"]
    tier_name = tier_names[tier] if tier < len(tier_names) else "Standard"
    try:
        return resend.Emails.send({
            "from": FROM_EMAIL,
            "to": [to_email],
            "cc": ["aziz.kafayat@gmail.com"],
            "subject": f"🎉 {company_name} is now verified on VerifyChain",
            "html": f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#05080f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

    <div style="margin-bottom:32px;">
      <span style="font-size:20px;font-weight:800;color:#f0f4ff;letter-spacing:-0.03em;">
        Verify<span style="color:#00d4ff;">Chain</span>
      </span>
    </div>

    <div style="background:#0c1120;border:1px solid rgba(0,229,160,0.25);border-radius:16px;padding:32px;margin-bottom:24px;">
      <div style="width:56px;height:56px;border-radius:14px;background:rgba(0,229,160,0.1);border:1px solid rgba(0,229,160,0.25);display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
        <span style="font-size:26px;">✓</span>
      </div>

      <h1 style="color:#f0f4ff;font-size:24px;font-weight:800;margin:0 0 8px;letter-spacing:-0.03em;">
        Congratulations, {company_name}!
      </h1>
      <p style="color:rgba(160,180,220,0.75);font-size:15px;margin:0 0 24px;line-height:1.6;">
        Your business is now <strong style="color:#00e5a0;">permanently verified</strong> on the Arbitrum blockchain. Your soul-bound credential NFT has been minted and cannot be faked, transferred, or removed.
      </p>

      <div style="background:rgba(0,229,160,0.05);border:1px solid rgba(0,229,160,0.15);border-radius:10px;padding:18px;margin-bottom:24px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <div style="font-size:10px;color:rgba(160,180,220,0.5);font-family:monospace;letter-spacing:0.05em;margin-bottom:3px;">TOKEN ID</div>
            <div style="color:#f0f4ff;font-size:14px;font-weight:700;">#{token_id}</div>
          </div>
          <div>
            <div style="font-size:10px;color:rgba(160,180,220,0.5);font-family:monospace;letter-spacing:0.05em;margin-bottom:3px;">TIER</div>
            <div style="color:#00d4ff;font-size:14px;font-weight:700;">{tier_name}</div>
          </div>
          <div>
            <div style="font-size:10px;color:rgba(160,180,220,0.5);font-family:monospace;letter-spacing:0.05em;margin-bottom:3px;">VALID UNTIL</div>
            <div style="color:#f0f4ff;font-size:14px;font-weight:700;">{expires_at}</div>
          </div>
          <div>
            <div style="font-size:10px;color:rgba(160,180,220,0.5);font-family:monospace;letter-spacing:0.05em;margin-bottom:3px;">NETWORK</div>
            <div style="color:#f0f4ff;font-size:14px;font-weight:700;">Arbitrum</div>
          </div>
        </div>
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.06);">
          <div style="font-size:10px;color:rgba(160,180,220,0.5);font-family:monospace;letter-spacing:0.05em;margin-bottom:4px;">YOUR WALLET ADDRESS</div>
          <div style="font-family:monospace;font-size:12px;color:rgba(160,180,220,0.7);word-break:break-all;">{wallet}</div>
        </div>
      </div>

      <div style="background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.12);border-radius:10px;padding:14px 18px;margin-bottom:24px;">
        <div style="color:#00d4ff;font-size:13px;font-weight:600;margin-bottom:4px;">How buyers verify you</div>
        <div style="color:rgba(160,180,220,0.7);font-size:13px;line-height:1.65;">
          Share your wallet address with any buyer worldwide. They go to VerifyChain, enter your wallet address, and get a verified result in 10 seconds — straight from the Arbitrum blockchain.
        </div>
      </div>

      <div style="background:rgba(160,180,220,0.04);border:1px solid rgba(160,180,220,0.08);border-radius:10px;padding:14px 18px;margin-bottom:24px;">
        <div style="color:rgba(160,180,220,0.6);font-size:13px;line-height:1.65;">
          <strong style="color:rgba(160,180,220,0.9);">Want to update your credentials?</strong> If your business details change, you can apply for an updated credential. Your current credential remains valid until it expires on <strong>{expires_at}</strong>.
        </div>
      </div>

      <a href="https://verifychain.io/supplier" style="display:inline-block;background:linear-gradient(135deg,#00d4ff,#0066ff);color:#05080f;font-size:14px;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;">
        View my credential →
      </a>
    </div>

    <p style="color:rgba(160,180,220,0.4);font-size:12px;text-align:center;margin:0;">
      VerifyChain · On-chain supplier verification · Built on Arbitrum
    </p>
  </div>
</body>
</html>
            """,
        })
    except Exception as e:
        print(f"Email send failed: {e}")
        return None


def send_contact_email(name: str, email: str, message: str):
    if not resend.api_key:
        print(f"[contact] {name} <{email}>: {message}")
        return None
    try:
        return resend.Emails.send({
            "from": FROM_EMAIL,
            "to": ["aziz.kafayat@gmail.com"],
            "reply_to": email,
            "subject": f"[VerifyChain Contact] Message from {name}",
            "html": f"""
<!DOCTYPE html><html><body style="margin:0;padding:32px;background:#05080f;font-family:Arial,sans-serif;color:#f0f4ff;">
<h2 style="margin:0 0 16px;color:#00d4ff;">New contact form submission</h2>
<p><strong>From:</strong> {name} &lt;{email}&gt;</p>
<div style="background:#0c1120;border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:20px;margin-top:12px;">
<pre style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:1.65;white-space:pre-wrap;">{message}</pre>
</div>
</body></html>
            """,
        })
    except Exception as e:
        print(f"Contact email failed: {e}")
        return None
