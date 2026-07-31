import { useEffect, useState } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — PKI SANDBOX
// Three-act interactive that plays out the PKI-as-trust story from the article
// "This Is How I Explain PKI To a Beginner."
//   ACT 1 — THE ATTACKER: try to impersonate yourbank.com. Get rejected.
//   ACT 2 — THE REAL BANK: same flow, but you actually own the domain. Cert issued.
//   ACT 3 — THE BROWSER: validate 5 incoming certs, trust or reject each.
// Uses the real Web Crypto API for keypair generation — keys and fingerprints
// are legitimate, not mocked.
// =============================================================================

const COLORS = {
  red: "#e64833",
  green: "#3ab676",
  amber: "#e8a12a",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
  codeBg: "#0e0e0e",
};

const BASE_URL = "https://www.decodedsecurity.com/p/";
const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";

const SOURCE_ARTICLE = {
  title: "This Is How I Explain PKI To a Beginner",
  slug: "this-is-how-i-explain-pki-to-a-beginner",
};

const TARGETS = ["yourbank.com", "paypal.com", "gmail.com", "amazon.com"];

const CAS = [
  { id: "digicert",      name: "DigiCert",       root: "DigiCert Global Root G2" },
  { id: "letsencrypt",   name: "Let's Encrypt",  root: "ISRG Root X1" },
  { id: "sectigo",       name: "Sectigo",        root: "USERTrust RSA Certification Authority" },
  { id: "globalsign",    name: "GlobalSign",     root: "GlobalSign Root CA" },
];

const CHALLENGES = [
  { id: "http",  label: "HTTP-01",  desc: "CA fetches a file you place at http://<domain>/.well-known/acme-challenge/..." },
  { id: "dns",   label: "DNS-01",   desc: "CA looks up a TXT record you add to <domain>'s DNS zone." },
  { id: "email", label: "Email",    desc: "CA emails admin@<domain> — you click a link to prove you can read it." },
];

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const bufToHex = (buf) =>
  Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");

const colonize = (hex, groupSize = 2) => {
  const chunks = [];
  for (let i = 0; i < hex.length; i += groupSize) chunks.push(hex.slice(i, i + groupSize));
  return chunks.join(":");
};

async function generateRealKeypair() {
  const kp = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );
  const pubBytes = await crypto.subtle.exportKey("spki", kp.publicKey);
  const privBytes = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
  const pubHex = bufToHex(pubBytes);
  const privHex = bufToHex(privBytes);
  const fpBytes = await crypto.subtle.digest("SHA-256", pubBytes);
  const fpHex = bufToHex(fpBytes);
  return {
    pubTruncated: pubHex.slice(0, 40) + "..." + pubHex.slice(-8),
    privTruncated: privHex.slice(0, 24) + "..." + privHex.slice(-6),
    fingerprint: colonize(fpHex.slice(0, 32).toUpperCase()),
    bits: 2048,
  };
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const plusDaysISO = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
const minusYearsISO = (years) => new Date(Date.now() - years * 365 * 86400000).toISOString().slice(0, 10);

// -----------------------------------------------------------------------------
// Act 3 detective scenarios — five certificates, trust or reject each
// -----------------------------------------------------------------------------

const ACT3_SCENARIOS = [
  {
    id: "legit",
    presentedFor: "yourbank.com",
    subject: "CN=yourbank.com, O=Your Bank Inc, C=US",
    issuer: "DigiCert Global CA G2",
    chain: "DigiCert Global Root G2 → DigiCert Global CA G2 → yourbank.com",
    validFrom: minusYearsISO(0.1),
    validTo: plusDaysISO(60),
    correct: "trust",
    reasoning: "Chain traces to a trusted root, dates are valid, subject matches the domain being visited. Everything checks out.",
  },
  {
    id: "untrusted_ca",
    presentedFor: "yourbank.com",
    subject: "CN=yourbank.com, O=Your Bank Inc, C=US",
    issuer: "PhishCA Trust Services",
    chain: "PhishCA Root → PhishCA Trust Services → yourbank.com",
    validFrom: todayISO(),
    validTo: plusDaysISO(90),
    correct: "reject",
    reasoning: "The chain terminates at a root your browser doesn't trust. Anyone can spin up a CA; only the ~150 in the browser's trust store count. No root of trust = no trust.",
  },
  {
    id: "self_signed",
    presentedFor: "yourbank.com",
    subject: "CN=yourbank.com, O=Your Bank Inc, C=US",
    issuer: "CN=yourbank.com, O=Your Bank Inc, C=US",
    chain: "yourbank.com (self-signed — no chain)",
    validFrom: todayISO(),
    validTo: plusDaysISO(365),
    correct: "reject",
    reasoning: "Subject and issuer are identical — it signed itself. No third party has vouched for this identity. Same category of trust as \"I'm the CEO, my LinkedIn says so.\"",
  },
  {
    id: "expired",
    presentedFor: "yourbank.com",
    subject: "CN=yourbank.com, O=Your Bank Inc, C=US",
    issuer: "DigiCert Global CA G2",
    chain: "DigiCert Global Root G2 → DigiCert Global CA G2 → yourbank.com",
    validFrom: minusYearsISO(3),
    validTo: minusYearsISO(2),
    correct: "reject",
    reasoning: "Signed by a real CA with a valid chain — but the expiration date is in the past. Certs expire so a compromised private key can't be misused forever. Expired = untrusted.",
  },
  {
    id: "domain_mismatch",
    presentedFor: "yourbank.com",
    subject: "CN=totally-different-site.com, O=Other Corp, C=US",
    issuer: "DigiCert Global CA G2",
    chain: "DigiCert Global Root G2 → DigiCert Global CA G2 → totally-different-site.com",
    validFrom: todayISO(),
    validTo: plusDaysISO(90),
    correct: "reject",
    reasoning: "The cert is real, signed by a trusted CA, and not expired — but its subject says totally-different-site.com. You asked for yourbank.com. A cert for site A is not proof of identity for site B.",
  },
];

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function PkiSandbox() {
  const [act, setAct] = useState("welcome");
  const [act1Step, setAct1Step] = useState(0);
  const [act2Step, setAct2Step] = useState(0);
  const [target] = useState("yourbank.com");
  const [selectedCA, setSelectedCA] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [attackerKey, setAttackerKey] = useState(null);
  const [bankKey, setBankKey] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [act3Answers, setAct3Answers] = useState({}); // { id: "trust" | "reject" }
  const [act3Revealed, setAct3Revealed] = useState({}); // { id: true }
  const [startedTracked, setStartedTracked] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  useEffect(() => {
    if (!startedTracked) {
      track("pki_sandbox_opened");
      setStartedTracked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const articleUrl = `${BASE_URL}${SOURCE_ARTICLE.slug}`;

  const generateFor = async (who) => {
    setGenerating(true);
    try {
      const kp = await generateRealKeypair();
      if (who === "attacker") setAttackerKey(kp);
      else setBankKey(kp);
      track("pki_keypair_generated", { who });
    } catch (e) {
      // Web Crypto should exist in any modern browser; failsafe.
      alert("Your browser's Web Crypto API isn't available. Try a different browser.");
    } finally {
      setGenerating(false);
    }
  };

  const startAct1 = () => {
    track("pki_act_started", { act: 1 });
    setAct("act1");
    setAct1Step(0);
  };
  const startAct2 = () => {
    track("pki_act_started", { act: 2 });
    setAct("act2");
    setAct2Step(0);
    setSelectedCA(null);
    setChallenge(null);
  };
  const startAct3 = () => {
    track("pki_act_started", { act: 3 });
    setAct("act3");
    setAct3Answers({});
    setAct3Revealed({});
  };
  const finish = () => {
    track("pki_sandbox_completed", {
      act3_correct: Object.entries(act3Answers).filter(([id, ans]) => ans === ACT3_SCENARIOS.find(s => s.id === id).correct).length,
      act3_total: Object.keys(act3Answers).length,
    });
    setAct("complete");
  };
  const restart = () => {
    track("pki_sandbox_restarted");
    setAct("welcome");
    setAct1Step(0);
    setAct2Step(0);
    setSelectedCA(null);
    setChallenge(null);
    setAttackerKey(null);
    setBankKey(null);
    setAct3Answers({});
    setAct3Revealed({});
  };

  const act3Correct = Object.entries(act3Answers).filter(
    ([id, ans]) => ans === ACT3_SCENARIOS.find((s) => s.id === id).correct
  ).length;
  const act3Complete = Object.keys(act3Answers).length === ACT3_SCENARIOS.length;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.black,
        color: COLORS.white,
        fontFamily: fontStack,
        padding: "24px 16px",
        backgroundImage: `radial-gradient(circle at 20% 0%, rgba(230, 72, 51, 0.08), transparent 50%), radial-gradient(circle at 80% 100%, rgba(230, 72, 51, 0.05), transparent 50%)`,
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <header style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // PKI SANDBOX</div>
          </div>
          <a href="/tools" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2, transition: "color 150ms, border-color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            ← ALL TOOLS
          </a>
        </header>

        {/* WELCOME */}
        {act === "welcome" && (
          <div style={{ animation: "fadeIn 500ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; PKI SANDBOX</div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.08, marginBottom: 20, letterSpacing: -1 }}>
              Try to <span style={{ color: COLORS.red }}>impersonate</span> a bank.<br />
              Then try to <span style={{ color: COLORS.red }}>be</span> one.
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", marginBottom: 12, maxWidth: 680 }}>
              PKI isn't about encryption — it's about trust. This sandbox puts you in three roles, so you feel exactly where trust breaks and where it holds.
            </p>
            <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 32, maxWidth: 680, lineHeight: 1.5 }}>
              Real cryptography runs in your browser. The keys are legit, generated with the Web Crypto API. Nothing leaves your machine.
            </p>

            <a href={articleUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => track("source_article_clicked", { tool: "pki_sandbox" })}
              style={{
                display: "block", borderLeft: `2px solid ${COLORS.red}`, paddingLeft: 16,
                marginBottom: 32, maxWidth: 640, textDecoration: "none", color: COLORS.white,
                transition: "all 150ms ease-out",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "20px"; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "16px"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>BASED ON THE ARTICLE</div>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span></div>
            </a>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 32 }}>
              {[
                { num: "ACT 1", title: "The Attacker", body: "Impersonate yourbank.com. See exactly why every CA on Earth refuses to sign your cert." },
                { num: "ACT 2", title: "The Real Bank", body: "Same flow, same tools — but you actually own the domain. Cert issued in minutes." },
                { num: "ACT 3", title: "The Browser", body: "Five certs arrive. Trust or reject each. Bonus round — optional." },
              ].map((a) => (
                <div key={a.num} style={{ border: `1px solid ${COLORS.border}`, padding: 16, backgroundColor: "rgba(230, 72, 51, 0.03)" }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: COLORS.red, marginBottom: 8 }}>{a.num}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: "#bbbbbb", lineHeight: 1.5 }}>{a.body}</div>
                </div>
              ))}
            </div>

            <button
              onClick={startAct1}
              style={{
                fontFamily: fontStack, fontSize: 15, fontWeight: 600, letterSpacing: 1.5,
                color: COLORS.white, backgroundColor: COLORS.red, border: "none",
                padding: "18px 36px", cursor: "pointer", transition: "transform 150ms, box-shadow 150ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(230, 72, 51, 0.3)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              START ACT 1 — BECOME THE ATTACKER →
            </button>
          </div>
        )}

        {/* ACT 1 — THE ATTACKER */}
        {act === "act1" && (
          <Act1
            step={act1Step} setStep={setAct1Step}
            target={target}
            attackerKey={attackerKey}
            generating={generating}
            generate={() => generateFor("attacker")}
            selectedCA={selectedCA} setSelectedCA={setSelectedCA}
            challenge={challenge} setChallenge={setChallenge}
            onFinish={startAct2}
            fontStack={fontStack}
          />
        )}

        {/* ACT 2 — THE REAL BANK */}
        {act === "act2" && (
          <Act2
            step={act2Step} setStep={setAct2Step}
            target={target}
            bankKey={bankKey}
            generating={generating}
            generate={() => generateFor("bank")}
            selectedCA={selectedCA} setSelectedCA={setSelectedCA}
            challenge={challenge} setChallenge={setChallenge}
            onFinish={startAct3}
            onSkip={finish}
            fontStack={fontStack}
          />
        )}

        {/* ACT 3 — THE BROWSER (detective mode) */}
        {act === "act3" && (
          <Act3
            answers={act3Answers}
            revealed={act3Revealed}
            onAnswer={(id, ans) => {
              const correct = ACT3_SCENARIOS.find((s) => s.id === id).correct;
              track("pki_act3_answered", { id, answer: ans, correct: ans === correct });
              setAct3Answers((prev) => ({ ...prev, [id]: ans }));
              setAct3Revealed((prev) => ({ ...prev, [id]: true }));
            }}
            correct={act3Correct}
            total={ACT3_SCENARIOS.length}
            complete={act3Complete}
            onFinish={finish}
            fontStack={fontStack}
          />
        )}

        {/* COMPLETE */}
        {act === "complete" && (
          <Complete
            act3Correct={act3Correct}
            act3Total={Object.keys(act3Answers).length}
            fontStack={fontStack}
            articleUrl={articleUrl}
            onRestart={restart}
          />
        )}

        <footer style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // PKI_SANDBOX_v1</div>
          <div>TRUST, NOT ENCRYPTION</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}

// =============================================================================
// ACT 1 — THE ATTACKER
// Steps: 0 setup+keys, 1 pick CA, 2 challenge, 3 rejected, 4 self-sign attempt, 5 insight
// =============================================================================

function Act1({ step, setStep, target, attackerKey, generating, generate, selectedCA, setSelectedCA, challenge, setChallenge, onFinish, fontStack }) {
  const totalSteps = 6;
  return (
    <div style={{ animation: "fadeIn 300ms ease-out" }}>
      <ActHeader label="ACT 1 · THE ATTACKER" step={step + 1} total={totalSteps} tint={COLORS.red} />

      {step === 0 && (
        <div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, marginBottom: 14, letterSpacing: -0.5 }}>
            Your target: <span style={{ color: COLORS.red }}>{target}</span>
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 22, maxWidth: 640 }}>
            You want to phish their customers. Set up a lookalike site with a padlock in the browser. First step of any legit HTTPS setup: generate a keypair.
          </p>
          <RolePlate role="ATTACKER" line="You do not own yourbank.com. You have no legal claim to it." tint={COLORS.red} />

          {!attackerKey ? (
            <button
              onClick={generate}
              disabled={generating}
              style={primaryBtn(fontStack, generating)}
            >
              {generating ? "GENERATING…" : "GENERATE MY KEYPAIR →"}
            </button>
          ) : (
            <div>
              <KeyBlock label="ATTACKER'S KEYPAIR (real, generated in your browser)" kp={attackerKey} fontStack={fontStack} />
              <button onClick={() => setStep(1)} style={primaryBtn(fontStack)}>
                CONTINUE — SUBMIT TO A CA →
              </button>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 700, marginBottom: 12 }}>Pick a Certificate Authority</h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#cccccc", marginBottom: 22, maxWidth: 640 }}>
            You need someone trusted to sign your cert. Browsers ship with ~150 pre-approved CAs in their trust store. Pick one and submit your signing request.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 24 }}>
            {CAS.map((ca) => (
              <button
                key={ca.id}
                onClick={() => setSelectedCA(ca.id)}
                style={{
                  fontFamily: fontStack, fontSize: 13, textAlign: "left",
                  color: COLORS.white,
                  backgroundColor: selectedCA === ca.id ? "rgba(230,72,51,0.08)" : "transparent",
                  border: `1px solid ${selectedCA === ca.id ? COLORS.red : COLORS.border}`,
                  padding: 14, cursor: "pointer", transition: "all 150ms",
                }}
                onMouseEnter={(e) => { if (selectedCA !== ca.id) e.currentTarget.style.borderColor = COLORS.red; }}
                onMouseLeave={(e) => { if (selectedCA !== ca.id) e.currentTarget.style.borderColor = COLORS.border; }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{ca.name}</div>
                <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 0.5 }}>ROOT: {ca.root}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} disabled={!selectedCA} style={primaryBtn(fontStack, !selectedCA)}>
            {selectedCA ? `SUBMIT TO ${CAS.find(c=>c.id===selectedCA).name.toUpperCase()} →` : "PICK A CA TO CONTINUE"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 700, marginBottom: 12 }}>
            {CAS.find(c=>c.id===selectedCA).name} responds:
          </h2>
          <div style={{ border: `1px solid ${COLORS.amber}`, backgroundColor: "rgba(232,161,42,0.05)", padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: COLORS.amber, letterSpacing: 2, marginBottom: 10 }}>&gt; DOMAIN CONTROL VALIDATION</div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#dddddd", margin: 0 }}>
              "We won't sign a certificate that says you're <strong style={{ color: COLORS.white }}>{target}</strong> unless you prove you control that domain. Pick a challenge:"
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {CHALLENGES.map((c) => (
              <button
                key={c.id}
                onClick={() => setChallenge(c.id)}
                style={{
                  fontFamily: fontStack, fontSize: 13, textAlign: "left",
                  color: COLORS.white,
                  backgroundColor: challenge === c.id ? "rgba(230,72,51,0.08)" : "transparent",
                  border: `1px solid ${challenge === c.id ? COLORS.red : COLORS.border}`,
                  padding: 14, cursor: "pointer", transition: "all 150ms",
                }}
                onMouseEnter={(e) => { if (challenge !== c.id) e.currentTarget.style.borderColor = COLORS.red; }}
                onMouseLeave={(e) => { if (challenge !== c.id) e.currentTarget.style.borderColor = COLORS.border; }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: "#bbbbbb", lineHeight: 1.5 }}>{c.desc}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(3)} disabled={!challenge} style={primaryBtn(fontStack, !challenge)}>
            {challenge ? "ATTEMPT THIS CHALLENGE →" : "PICK A CHALLENGE"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 700, marginBottom: 12 }}>
            {CAS.find(c=>c.id===selectedCA).name} runs the check…
          </h2>
          <div style={{ border: `1px solid ${COLORS.red}`, backgroundColor: "rgba(230,72,51,0.06)", padding: 22, marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 10 }}>&gt; CERTIFICATE REQUEST REJECTED</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>
              You could not prove control of {target}.
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "#dddddd", margin: "0 0 10px" }}>
              <strong style={{ color: COLORS.white }}>{CHALLENGES.find(c=>c.id===challenge).label} failed.</strong>{" "}
              {challenge === "http" && `The CA fetched http://${target}/.well-known/acme-challenge/... and got someone else's server. You do not control the DNS or the hosting.`}
              {challenge === "dns" && `The CA queried ${target}'s authoritative DNS for a TXT record. You cannot add records to a zone you don't own.`}
              {challenge === "email" && `The CA sent verification to admin@${target}. You cannot read email at a domain you don't own.`}
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "#cccccc", margin: 0 }}>
              No trusted CA on Earth will sign this. Not for any price. Domain control validation is the entire point of the CA's existence.
            </p>
          </div>
          <button onClick={() => setStep(4)} style={primaryBtn(fontStack)}>
            OK — WHAT IF I SELF-SIGN INSTEAD? →
          </button>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 700, marginBottom: 12 }}>You self-sign your certificate.</h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#cccccc", marginBottom: 20, maxWidth: 640 }}>
            No CA needed — you just sign it with your own private key. Technically valid X.509. You install it on your fake server. A victim clicks your phishing link…
          </p>
          <BrowserMock
            url={`https://${target}/login`}
            state="warning"
            title="Your connection is not private"
            body={`This server could not prove that it is ${target}; its security certificate is not trusted by your browser. This may be caused by a misconfiguration or an attacker intercepting your connection.`}
            fingerprint={attackerKey?.fingerprint}
          />
          <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.55, marginBottom: 24, maxWidth: 640 }}>
            The browser walked your certificate's chain of trust. It ended at… yourself. Since no trusted CA vouched for you, the browser refuses. 99% of users bounce right here.
          </p>
          <button onClick={() => setStep(5)} style={primaryBtn(fontStack)}>
            SEE THE INSIGHT →
          </button>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 700, marginBottom: 16, letterSpacing: -0.5 }}>
            PKI defeated your attack. <span style={{ color: COLORS.red }}>Twice.</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            <InsightRow num="01" title="CAs won't sign what you can't prove you own."
              body="Every trusted CA runs a domain-control-validation challenge before signing. You control the domain or you don't. No amount of money changes that." />
            <InsightRow num="02" title="Browsers won't trust what a real CA didn't sign."
              body="Chain of trust ends at a root CA baked into the browser. Your self-signed cert has no chain — the browser refuses before the user can read a single form field." />
          </div>
          <div style={{ border: `1px solid ${COLORS.border}`, borderLeft: `2px solid ${COLORS.red}`, padding: 18, marginBottom: 28, backgroundColor: "rgba(230,72,51,0.03)" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 8 }}>THE PATTERN</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: "#dddddd" }}>
              PKI isn't about the math of encryption. The math worked fine for you — you generated a valid keypair, made a valid X.509 cert, signed it correctly. PKI defeated you at the <em style={{ color: COLORS.white }}>trust</em> layer. Trust is what makes the system work, and trust requires a party both sides agree on.
            </div>
          </div>
          <button onClick={onFinish} style={primaryBtn(fontStack)}>
            NOW BECOME THE REAL BANK → ACT 2
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// ACT 2 — THE REAL BANK
// Steps: 0 setup+keys, 1 pick CA, 2 challenge succeeds, 3 cert issued, 4 browser padlock, 5 insight
// =============================================================================

function Act2({ step, setStep, target, bankKey, generating, generate, selectedCA, setSelectedCA, challenge, setChallenge, onFinish, onSkip, fontStack }) {
  const totalSteps = 6;
  return (
    <div style={{ animation: "fadeIn 300ms ease-out" }}>
      <ActHeader label="ACT 2 · THE REAL BANK" step={step + 1} total={totalSteps} tint={COLORS.green} />

      {step === 0 && (
        <div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, marginBottom: 14, letterSpacing: -0.5 }}>
            You're the security team at <span style={{ color: COLORS.green }}>Your Bank Inc.</span>
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 22, maxWidth: 640 }}>
            You bought <strong>{target}</strong>. You own the DNS. You control the servers. You need HTTPS. Same flow as the attacker just tried — same protocol, same CAs, same challenges. Different outcome.
          </p>
          <RolePlate role="LEGITIMATE OWNER" line={`You own ${target}. You control its DNS, its servers, and admin@ email.`} tint={COLORS.green} />

          {!bankKey ? (
            <button
              onClick={generate}
              disabled={generating}
              style={primaryBtn(fontStack, generating)}
            >
              {generating ? "GENERATING…" : "GENERATE OUR KEYPAIR →"}
            </button>
          ) : (
            <div>
              <KeyBlock label="YOUR BANK'S KEYPAIR (real, generated in your browser)" kp={bankKey} fontStack={fontStack} />
              <button onClick={() => setStep(1)} style={primaryBtn(fontStack)}>
                CONTINUE — SUBMIT TO A CA →
              </button>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 700, marginBottom: 12 }}>Pick a Certificate Authority</h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#cccccc", marginBottom: 22, maxWidth: 640 }}>
            Same list as before. Same trust store in every browser. Pick one.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 24 }}>
            {CAS.map((ca) => (
              <button
                key={ca.id}
                onClick={() => setSelectedCA(ca.id)}
                style={{
                  fontFamily: fontStack, fontSize: 13, textAlign: "left",
                  color: COLORS.white,
                  backgroundColor: selectedCA === ca.id ? "rgba(58,182,118,0.08)" : "transparent",
                  border: `1px solid ${selectedCA === ca.id ? COLORS.green : COLORS.border}`,
                  padding: 14, cursor: "pointer", transition: "all 150ms",
                }}
                onMouseEnter={(e) => { if (selectedCA !== ca.id) e.currentTarget.style.borderColor = COLORS.green; }}
                onMouseLeave={(e) => { if (selectedCA !== ca.id) e.currentTarget.style.borderColor = COLORS.border; }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{ca.name}</div>
                <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 0.5 }}>ROOT: {ca.root}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} disabled={!selectedCA} style={primaryBtn(fontStack, !selectedCA)}>
            {selectedCA ? `SUBMIT TO ${CAS.find(c=>c.id===selectedCA).name.toUpperCase()} →` : "PICK A CA TO CONTINUE"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 700, marginBottom: 12 }}>
            Prove domain control
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#cccccc", marginBottom: 22, maxWidth: 640 }}>
            Same three challenges the CA offered the attacker. This time you actually control {target}, so any of them will work.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {CHALLENGES.map((c) => (
              <button
                key={c.id}
                onClick={() => setChallenge(c.id)}
                style={{
                  fontFamily: fontStack, fontSize: 13, textAlign: "left",
                  color: COLORS.white,
                  backgroundColor: challenge === c.id ? "rgba(58,182,118,0.08)" : "transparent",
                  border: `1px solid ${challenge === c.id ? COLORS.green : COLORS.border}`,
                  padding: 14, cursor: "pointer", transition: "all 150ms",
                }}
                onMouseEnter={(e) => { if (challenge !== c.id) e.currentTarget.style.borderColor = COLORS.green; }}
                onMouseLeave={(e) => { if (challenge !== c.id) e.currentTarget.style.borderColor = COLORS.border; }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: "#bbbbbb", lineHeight: 1.5 }}>{c.desc}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(3)} disabled={!challenge} style={primaryBtn(fontStack, !challenge)}>
            {challenge ? "COMPLETE THE CHALLENGE →" : "PICK A CHALLENGE"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 700, marginBottom: 12 }}>Certificate issued.</h2>
          <div style={{ border: `1px solid ${COLORS.green}`, backgroundColor: "rgba(58,182,118,0.05)", padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: COLORS.green, letterSpacing: 2, marginBottom: 10 }}>&gt; DOMAIN CONTROL VALIDATION PASSED</div>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: "#dddddd", margin: 0 }}>
              <strong style={{ color: COLORS.white }}>{CHALLENGES.find(c=>c.id===challenge).label} succeeded.</strong> {CAS.find(c=>c.id===selectedCA).name} verified you control {target} and signed your certificate with their intermediate CA.
            </p>
          </div>
          <CertificateCard
            subject={`CN=${target}, O=Your Bank Inc, C=US`}
            issuer={`${CAS.find(c=>c.id===selectedCA).name} TLS RSA CA G2`}
            validFrom={todayISO()}
            validTo={plusDaysISO(90)}
            fingerprint={bankKey?.fingerprint}
            publicKey={`RSA ${bankKey?.bits}-bit`}
            sans={[target, `www.${target}`]}
            chain={`${CAS.find(c=>c.id===selectedCA).root} → ${CAS.find(c=>c.id===selectedCA).name} TLS RSA CA G2 → ${target}`}
          />
          <button onClick={() => setStep(4)} style={primaryBtn(fontStack)}>
            INSTALL ON SERVER, THEN WATCH THE BROWSER →
          </button>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 700, marginBottom: 12 }}>A customer visits your site.</h2>
          <BrowserMock
            url={`https://${target}/login`}
            state="secure"
            title="Connection is secure"
            body={`Your information is private when it is sent to this site. Certificate issued to ${target} by ${CAS.find(c=>c.id===selectedCA).name} TLS RSA CA G2.`}
            fingerprint={bankKey?.fingerprint}
          />
          <p style={{ fontSize: 13, color: "#cccccc", lineHeight: 1.55, marginBottom: 24, maxWidth: 640 }}>
            The browser walked the chain: your cert → {CAS.find(c=>c.id===selectedCA).name}'s intermediate → {CAS.find(c=>c.id===selectedCA).root} (in the trust store). Chain terminates at a trusted root. Dates valid. Subject matches. <strong style={{ color: COLORS.white }}>Padlock.</strong>
          </p>
          <button onClick={() => setStep(5)} style={primaryBtn(fontStack)}>
            SEE THE INSIGHT →
          </button>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 700, marginBottom: 16, letterSpacing: -0.5 }}>
            Same tools. <span style={{ color: COLORS.green }}>Opposite outcome.</span>
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 22, maxWidth: 640 }}>
            You used the same protocol, same CAs, same challenges as the attacker. The only difference: you could prove you actually own {target}. That single proof is what turned identical math into a trusted connection.
          </p>

          <div style={{ border: `1px solid ${COLORS.border}`, borderLeft: `2px solid ${COLORS.green}`, padding: 18, marginBottom: 20, backgroundColor: "rgba(58,182,118,0.03)" }}>
            <div style={{ fontSize: 11, color: COLORS.green, letterSpacing: 2, marginBottom: 8 }}>THE PASSPORT ANALOGY</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: "#dddddd" }}>
              <strong style={{ color: COLORS.white }}>CA</strong> = the government that issued the passport.{" "}
              <strong style={{ color: COLORS.white }}>Certificate</strong> = the passport itself.{" "}
              <strong style={{ color: COLORS.white }}>Public key</strong> = your name and photo (anyone can see).{" "}
              <strong style={{ color: COLORS.white }}>Private key</strong> = your fingerprint (proves you're really the person in the photo).
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={onFinish} style={primaryBtn(fontStack)}>
              PLAY THE BROWSER → ACT 3
            </button>
            <button onClick={onSkip} style={{
              fontFamily: fontStack, fontSize: 13, letterSpacing: 1.5,
              color: COLORS.muted, backgroundColor: "transparent",
              border: `1px solid ${COLORS.border}`, padding: "14px 22px", cursor: "pointer",
              transition: "all 150ms",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.white; e.currentTarget.style.borderColor = COLORS.muted; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderColor = COLORS.border; }}
            >
              SKIP TO END
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// ACT 3 — THE BROWSER (detective mode)
// =============================================================================

function Act3({ answers, revealed, onAnswer, correct, total, complete, onFinish, fontStack }) {
  return (
    <div style={{ animation: "fadeIn 300ms ease-out" }}>
      <ActHeader label="ACT 3 · THE BROWSER" step={Object.keys(answers).length} total={ACT3_SCENARIOS.length} tint={COLORS.white} />
      <h2 style={{ fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 700, marginBottom: 12, letterSpacing: -0.5 }}>
        Five certificates arrive. <span style={{ color: COLORS.red }}>Trust or reject?</span>
      </h2>
      <p style={{ fontSize: 14, color: "#cccccc", lineHeight: 1.6, marginBottom: 26, maxWidth: 640 }}>
        You're the browser now. Every time you load an HTTPS site, you make this decision in milliseconds. Do it consciously — you'll never look at a padlock the same way.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
        {ACT3_SCENARIOS.map((s, i) => {
          const answered = revealed[s.id];
          const userAnswer = answers[s.id];
          const isCorrect = answered && userAnswer === s.correct;
          return (
            <div key={s.id} style={{
              border: `1px solid ${answered ? (isCorrect ? COLORS.green : COLORS.red) : COLORS.border}`,
              padding: 20,
              backgroundColor: answered
                ? (isCorrect ? "rgba(58,182,118,0.04)" : "rgba(230,72,51,0.04)")
                : "transparent",
            }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: COLORS.muted, marginBottom: 8 }}>
                CERT {String(i + 1).padStart(2, "0")} · PRESENTED FOR <span style={{ color: COLORS.white }}>{s.presentedFor}</span>
              </div>
              <CertFactRow label="Subject" value={s.subject} />
              <CertFactRow label="Issuer" value={s.issuer} />
              <CertFactRow label="Chain" value={s.chain} />
              <CertFactRow label="Valid" value={`${s.validFrom} → ${s.validTo}`} />

              {!answered ? (
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button onClick={() => onAnswer(s.id, "trust")}
                    style={{
                      fontFamily: fontStack, fontSize: 12, fontWeight: 600, letterSpacing: 1.5,
                      color: COLORS.white, backgroundColor: "transparent",
                      border: `1px solid ${COLORS.green}`, padding: "10px 20px", cursor: "pointer",
                      transition: "all 150ms",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(58,182,118,0.15)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    ✓ TRUST
                  </button>
                  <button onClick={() => onAnswer(s.id, "reject")}
                    style={{
                      fontFamily: fontStack, fontSize: 12, fontWeight: 600, letterSpacing: 1.5,
                      color: COLORS.white, backgroundColor: "transparent",
                      border: `1px solid ${COLORS.red}`, padding: "10px 20px", cursor: "pointer",
                      transition: "all 150ms",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(230,72,51,0.15)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    ✗ REJECT
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 14, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
                  <div style={{ fontSize: 11, color: isCorrect ? COLORS.green : COLORS.red, letterSpacing: 2, marginBottom: 6 }}>
                    {isCorrect ? `CORRECT · You said ${userAnswer.toUpperCase()}, browser says ${s.correct.toUpperCase()}` : `WRONG · You said ${userAnswer.toUpperCase()}, browser says ${s.correct.toUpperCase()}`}
                  </div>
                  <p style={{ fontSize: 13, color: "#dddddd", lineHeight: 1.55, margin: 0 }}>{s.reasoning}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {complete && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, marginBottom: 8 }}>YOU SCORED</div>
          <div style={{ fontSize: 40, fontWeight: 700, marginBottom: 12, letterSpacing: -1 }}>
            <span style={{ color: COLORS.red }}>{correct}</span>
            <span style={{ color: COLORS.muted, fontSize: 20, marginLeft: 8 }}>/ {total}</span>
          </div>
          <button onClick={onFinish} style={primaryBtn(fontStack)}>
            FINISH THE SANDBOX →
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COMPLETE
// =============================================================================

function Complete({ act3Correct, act3Total, fontStack, articleUrl, onRestart }) {
  return (
    <div style={{ animation: "fadeIn 500ms ease-out" }}>
      <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; SANDBOX COMPLETE</div>
      <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 20, letterSpacing: -1 }}>
        You've been the <span style={{ color: COLORS.red }}>attacker</span>,<br />
        the <span style={{ color: COLORS.red }}>bank</span>, and the <span style={{ color: COLORS.red }}>browser</span>.
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 32, maxWidth: 680 }}>
        Now you understand what the article says: PKI is a trust system, not an encryption system. The math is a small part. The trust — grounded in root CAs your browser vendor pre-approved, and domain control the CA verifies — is what keeps the internet honest.
      </p>

      {act3Total > 0 && (
        <div style={{ border: `1px solid ${COLORS.border}`, padding: 20, marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: COLORS.muted, marginBottom: 6 }}>DETECTIVE ROUND</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            <span style={{ color: COLORS.red }}>{act3Correct}</span>
            <span style={{ color: COLORS.muted, fontSize: 16, marginLeft: 6 }}>/ {act3Total} correct</span>
          </div>
        </div>
      )}

      <div style={{ border: `2px solid ${COLORS.red}`, backgroundColor: "rgba(230, 72, 51, 0.06)", padding: 28, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>KEEP GOING</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
          The article breaks down every concept you just played with.
        </div>
        <p style={{ fontSize: 14, color: "#cccccc", marginBottom: 18, lineHeight: 1.55 }}>
          Certificate authorities, chains of trust, digital signatures — the passport analogy in full. If any part of the sandbox felt hand-wavy, the article makes it concrete.
        </p>
        <a href={articleUrl} target="_blank" rel="noopener noreferrer"
          onClick={() => track("comments_cta_clicked", { tool: "pki_sandbox" })}
          style={{
            display: "inline-block", fontFamily: fontStack, fontSize: 14, fontWeight: 600,
            letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
            textDecoration: "none", padding: "14px 28px",
          }}
        >
          READ THE ARTICLE →
        </a>
      </div>

      <div style={{ border: `1px solid ${COLORS.border}`, padding: 28, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 12 }}>NEWSLETTER</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
          Free weekly cybersecurity breakdowns.
        </div>
        <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 20, lineHeight: 1.5 }}>
          AI security, secure coding, exam prep — 1,450+ readers.
        </p>
        <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer"
          onClick={() => track("subscribe_clicked", { tool: "pki_sandbox" })}
          style={{
            display: "inline-block", fontFamily: fontStack, fontSize: 14, fontWeight: 600,
            letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
            textDecoration: "none", padding: "14px 28px",
          }}
        >
          SUBSCRIBE →
        </a>
      </div>

      <button onClick={onRestart} style={{
        fontFamily: fontStack, fontSize: 12, color: COLORS.muted,
        backgroundColor: "transparent", border: "none", padding: "8px 0",
        cursor: "pointer", letterSpacing: 1.5,
      }}
        onMouseEnter={(e) => e.currentTarget.style.color = COLORS.red}
        onMouseLeave={(e) => e.currentTarget.style.color = COLORS.muted}
      >
        ↻ RUN THE SANDBOX AGAIN
      </button>
    </div>
  );
}

// =============================================================================
// Small reusable UI pieces
// =============================================================================

function ActHeader({ label, step, total, tint }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 11, color: tint, letterSpacing: 3 }}>{label}</div>
        <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5 }}>
          STEP {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
      </div>
      <div style={{ height: 3, backgroundColor: COLORS.border, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(step / total) * 100}%`, backgroundColor: tint, transition: "width 400ms ease-out" }} />
      </div>
    </div>
  );
}

function RolePlate({ role, line, tint }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 12,
      border: `1px solid ${tint}`, padding: "10px 16px", marginBottom: 24,
      backgroundColor: "rgba(255,255,255,0.02)",
    }}>
      <div style={{ width: 8, height: 8, backgroundColor: tint, borderRadius: "50%", animation: "pulse 2s ease-in-out infinite" }} />
      <div style={{ fontSize: 11, color: tint, letterSpacing: 2, fontWeight: 700 }}>ROLE · {role}</div>
      <div style={{ fontSize: 12, color: "#cccccc" }}>{line}</div>
    </div>
  );
}

function KeyBlock({ label, kp, fontStack }) {
  return (
    <div style={{ border: `1px solid ${COLORS.border}`, padding: 18, marginBottom: 20, backgroundColor: "rgba(255,255,255,0.02)" }}>
      <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 2, marginBottom: 12 }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px", fontSize: 12, lineHeight: 1.6 }}>
        <div style={{ color: COLORS.muted }}>ALGORITHM</div><div>RSASSA-PKCS1-v1_5, {kp.bits}-bit, SHA-256</div>
        <div style={{ color: COLORS.muted }}>PUBLIC KEY</div><div style={{ fontFamily: fontStack, wordBreak: "break-all", color: "#dddddd" }}>{kp.pubTruncated}</div>
        <div style={{ color: COLORS.muted }}>PRIVATE KEY</div><div style={{ fontFamily: fontStack, wordBreak: "break-all", color: "#dddddd" }}>{kp.privTruncated} <span style={{ color: COLORS.muted, fontSize: 10 }}>(never shared — stays in your browser)</span></div>
        <div style={{ color: COLORS.muted }}>SHA-256 FP</div><div style={{ fontFamily: fontStack, color: "#dddddd" }}>{kp.fingerprint}</div>
      </div>
    </div>
  );
}

function CertificateCard({ subject, issuer, validFrom, validTo, fingerprint, publicKey, sans, chain }) {
  return (
    <div style={{ border: `1px solid ${COLORS.green}`, padding: 20, marginBottom: 20, backgroundColor: "rgba(58,182,118,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 4, height: 16, backgroundColor: COLORS.green }} />
        <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.green, fontWeight: 700 }}>X.509 CERTIFICATE · ISSUED</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px", fontSize: 12, lineHeight: 1.6 }}>
        <div style={{ color: COLORS.muted }}>SUBJECT</div><div style={{ color: "#eeeeee" }}>{subject}</div>
        <div style={{ color: COLORS.muted }}>ISSUER</div><div style={{ color: "#eeeeee" }}>{issuer}</div>
        <div style={{ color: COLORS.muted }}>VALID FROM</div><div>{validFrom}</div>
        <div style={{ color: COLORS.muted }}>VALID TO</div><div>{validTo} (~90 days)</div>
        <div style={{ color: COLORS.muted }}>PUBLIC KEY</div><div>{publicKey}</div>
        <div style={{ color: COLORS.muted }}>SHA-256 FP</div><div style={{ wordBreak: "break-all", color: "#dddddd" }}>{fingerprint}</div>
        <div style={{ color: COLORS.muted }}>SAN</div><div>{sans.join(", ")}</div>
        <div style={{ color: COLORS.muted }}>CHAIN</div><div style={{ color: "#eeeeee" }}>{chain}</div>
      </div>
    </div>
  );
}

function BrowserMock({ url, state, title, body, fingerprint }) {
  const isSecure = state === "secure";
  const barColor = isSecure ? COLORS.green : COLORS.red;
  return (
    <div style={{ border: `1px solid ${COLORS.border}`, marginBottom: 18, backgroundColor: "#1a1a1a" }}>
      {/* fake browser chrome */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}`, backgroundColor: "#0a0a0a" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#3a3a3a" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#3a3a3a" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#3a3a3a" }} />
        </div>
        <div style={{
          flex: 1, backgroundColor: "#1c1c1c", padding: "6px 12px",
          border: `1px solid ${barColor}`, fontSize: 12, color: "#dddddd",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ color: barColor, fontSize: 14 }}>{isSecure ? "🔒" : "⚠"}</span>
          <span>{url}</span>
        </div>
      </div>
      {/* fake browser body */}
      <div style={{ padding: 22, backgroundColor: isSecure ? "#0e2018" : "#1e0e0e" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: barColor, marginBottom: 10 }}>{isSecure ? "🔒" : "⚠"} {title}</div>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "#dddddd", margin: "0 0 12px", maxWidth: 640 }}>{body}</p>
        {fingerprint && (
          <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1 }}>
            CERT FINGERPRINT: <span style={{ color: "#bbbbbb" }}>{fingerprint}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CertFactRow({ label, value }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12, fontSize: 12, lineHeight: 1.6, marginBottom: 3 }}>
      <div style={{ color: COLORS.muted, letterSpacing: 1 }}>{label.toUpperCase()}</div>
      <div style={{ color: "#dddddd", wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}

function InsightRow({ num, title, body }) {
  return (
    <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.red, letterSpacing: -1, minWidth: 34 }}>{num}</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.white, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: "#cccccc", lineHeight: 1.6 }}>{body}</div>
      </div>
    </div>
  );
}

function primaryBtn(fontStack, disabled = false) {
  return {
    fontFamily: fontStack, fontSize: 14, fontWeight: 600, letterSpacing: 1.5,
    color: COLORS.white,
    backgroundColor: disabled ? "#3a2724" : COLORS.red,
    border: "none", padding: "14px 28px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
    transition: "transform 150ms, box-shadow 150ms",
  };
}
