import { useState, useEffect, useRef } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — DOMAIN SPOOF-CHECK
// Client-side DNS-over-HTTPS lookup (Cloudflare, fallback to Google). Parses
// SPF and DMARC and assigns a plain-English verdict + letter grade.
// Deep-links to the email-auth article for the "what does this mean" read.
// =============================================================================

const COLORS = {
  red: "#e64833",
  green: "#3ab676",
  amber: "#e8a12a",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

const BASE_URL = "https://www.decodedsecurity.com/p/";
const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";

const SOURCE_ARTICLE = {
  title: "Anyone Can Send an Email as Your CEO. Here Is What Actually Stops Them",
  slug: "anyone-can-send-an-email-as-your",
};

const PRESETS = [
  "google.com",
  "paypal.com",
  "microsoft.com",
  "decodedsecurity.com",
  "substack.com",
];

// -----------------------------------------------------------------------------
// DNS-over-HTTPS
// -----------------------------------------------------------------------------

async function dohLookup(name) {
  const endpoints = [
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=TXT`,
    `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=TXT`,
  ];
  let lastErr = null;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { headers: { Accept: "application/dns-json" } });
      if (!res.ok) { lastErr = new Error(`HTTP ${res.status}`); continue; }
      const data = await res.json();
      // Status: 0 = NOERROR, 3 = NXDOMAIN
      if (data.Status !== 0 && data.Status !== 3) { lastErr = new Error(`DNS status ${data.Status}`); continue; }
      const answers = (data.Answer || [])
        .filter((a) => a.type === 16) // TXT
        .map((a) => normalizeTxt(a.data));
      return { answers, nxdomain: data.Status === 3 };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("DNS lookup failed");
}

// TXT records come back as quoted strings, sometimes split into multiple quoted
// parts joined by whitespace (long records). Normalize to a plain string.
function normalizeTxt(raw) {
  return String(raw)
    .replace(/^"|"$/g, "")
    .replace(/"\s+"/g, "")
    .trim();
}

// -----------------------------------------------------------------------------
// Parsers
// -----------------------------------------------------------------------------

function parseSPF(records) {
  const raw = records.find((r) => r.toLowerCase().startsWith("v=spf1"));
  if (!raw) return null;
  const parts = raw.split(/\s+/);
  const includes = parts.filter((p) => /^include:/i.test(p)).length;
  const ip4 = parts.filter((p) => /^ip4:/i.test(p)).length;
  const ip6 = parts.filter((p) => /^ip6:/i.test(p)).length;
  const a = parts.filter((p) => /^a(:.*)?$/i.test(p)).length;
  const mx = parts.filter((p) => /^mx(:.*)?$/i.test(p)).length;
  let allQualifier = null;
  for (const p of parts) {
    if (/^[-+~?]all$/i.test(p)) { allQualifier = p.toLowerCase(); break; }
  }
  return {
    raw,
    includes,
    ip4,
    ip6,
    a,
    mx,
    approvedSenderCount: includes + ip4 + ip6 + a + mx,
    allQualifier, // "-all" | "~all" | "?all" | "+all" | null
  };
}

function parseDMARC(records) {
  const raw = records.find((r) => r.toLowerCase().startsWith("v=dmarc1"));
  if (!raw) return null;
  const tags = {};
  raw.split(";").forEach((part) => {
    const [k, v] = part.trim().split("=").map((s) => (s || "").trim());
    if (k) tags[k.toLowerCase()] = v || "";
  });
  return {
    raw,
    policy: (tags.p || "").toLowerCase() || null,       // none | quarantine | reject
    subdomainPolicy: (tags.sp || "").toLowerCase() || null,
    pct: tags.pct ? parseInt(tags.pct, 10) : 100,
    ruaPresent: !!tags.rua,
    rufPresent: !!tags.ruf,
  };
}

// -----------------------------------------------------------------------------
// Grading
// -----------------------------------------------------------------------------

function grade(spf, dmarc) {
  const p = dmarc?.policy;
  const pct = dmarc?.pct ?? 100;

  // No records at all
  if (!spf && !dmarc) {
    return {
      letter: "F",
      verdict: "Spoofable",
      color: COLORS.red,
      summary: "No SPF and no DMARC records. Anyone can send email claiming to be this domain and receiving servers have no way to know it's fake.",
    };
  }

  // DMARC p=reject at full pct — strongest
  if (p === "reject" && pct >= 100) {
    return {
      letter: "A",
      verdict: "Protected",
      color: COLORS.green,
      summary: "DMARC policy is REJECT at 100%. Spoofed emails claiming to be this domain will be refused by receiving mail servers.",
    };
  }
  // DMARC p=reject but partial rollout
  if (p === "reject") {
    return {
      letter: "B",
      verdict: "Protected",
      color: COLORS.green,
      summary: `DMARC policy is REJECT but only enforced on ${pct}% of failing mail. Full protection kicks in when pct=100.`,
    };
  }
  // DMARC p=quarantine
  if (p === "quarantine") {
    return {
      letter: "B",
      verdict: "Protected",
      color: COLORS.green,
      summary: `DMARC policy is QUARANTINE${pct < 100 ? ` (${pct}%)` : ""}. Spoofed emails go to spam instead of the inbox. Reject would be stronger.`,
    };
  }
  // DMARC p=none — monitoring only
  if (p === "none") {
    return {
      letter: "C",
      verdict: "Partially protected",
      color: COLORS.amber,
      summary: "DMARC is set to NONE (monitoring only). Reports are collected, but spoofed emails are still delivered. This is a starting posture, not a defense.",
    };
  }
  // SPF present, no DMARC
  if (spf && !dmarc) {
    return {
      letter: "D",
      verdict: "Partially protected",
      color: COLORS.amber,
      summary: "SPF is configured but there is no DMARC record. SPF alone does not stop From-header spoofing — an attacker can forge the visible sender freely.",
    };
  }
  // DMARC exists but no valid policy (rare)
  return {
    letter: "F",
    verdict: "Spoofable",
    color: COLORS.red,
    summary: "The DMARC record is present but has no valid policy directive. Treat this as no protection.",
  };
}

function cleanDomain(input) {
  return (input || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .split(":")[0];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function SpoofCheckTool() {
  const [domainInput, setDomainInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const cache = useRef(new Map());

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => {
      try { document.head.removeChild(link); } catch (e) {}
    };
  }, []);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const articleUrl = `${BASE_URL}${SOURCE_ARTICLE.slug}`;

  const runCheck = async (raw) => {
    const domain = cleanDomain(raw);
    if (!domain || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(domain)) {
      setStatus("error");
      setError("That doesn't look like a valid domain. Try something like google.com.");
      setResult(null);
      return;
    }
    // Cache hit
    if (cache.current.has(domain)) {
      const cached = cache.current.get(domain);
      setResult(cached);
      setStatus("success");
      setError(null);
      return;
    }
    setStatus("loading");
    setError(null);
    setResult(null);
    try {
      const [spfLookup, dmarcLookup] = await Promise.all([
        dohLookup(domain),
        dohLookup(`_dmarc.${domain}`),
      ]);
      const spf = parseSPF(spfLookup.answers);
      const dmarc = parseDMARC(dmarcLookup.answers);
      const g = grade(spf, dmarc);
      const output = { domain, spf, dmarc, g, spfRecords: spfLookup.answers, dmarcRecords: dmarcLookup.answers, spfNx: spfLookup.nxdomain };
      cache.current.set(domain, output);
      setResult(output);
      setStatus("success");
      track("spoof_check_run", { domain, grade: g.letter });
    } catch (e) {
      setStatus("error");
      setError(`DNS lookup failed. This is usually a browser blocker (ad-blocker, corporate firewall) intercepting DNS-over-HTTPS. Try disabling extensions or a different network.`);
      setResult(null);
    }
  };

  const onSubmit = (e) => {
    e?.preventDefault();
    runCheck(domainInput);
  };

  const usePreset = (d) => {
    track("spoof_check_preset", { domain: d });
    setDomainInput(d);
    runCheck(d);
  };

  const copyResult = async () => {
    if (!result) return;
    const lines = [];
    lines.push(`DOMAIN SPOOF-CHECK — ${result.domain}`);
    lines.push(`Grade: ${result.g.letter} — ${result.g.verdict}`);
    lines.push(result.g.summary);
    lines.push("");
    lines.push(`SPF: ${result.spf ? result.spf.raw : "(none)"}`);
    lines.push(`DMARC: ${result.dmarc ? result.dmarc.raw : "(none)"}`);
    lines.push("");
    lines.push(`Checked at https://quiz.decodedsecurity.com/tools/spoof-check`);
    const text = lines.join("\n");
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      track("spoof_check_result_copied", { domain: result.domain, grade: result.g.letter });
      setCopiedField("result");
      setTimeout(() => setCopiedField(null), 1800);
    } catch (e) {
      // silent
    }
  };

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
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <header style={{ marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // TOOLS</div>
          </div>
          <a href="/tools" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2, transition: "color 150ms, border-color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            ← ALL TOOLS
          </a>
        </header>

        <div style={{ animation: "fadeIn 600ms ease-out", marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; DOMAIN SPOOF-CHECK</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
            Can this domain be <span style={{ color: COLORS.red }}>spoofed?</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", maxWidth: 640 }}>
            Type any domain. We check its SPF and DMARC records live and return a grade — A through F — plus a plain-English verdict on whether an attacker could forge the visible sender.
          </p>
        </div>

        <a
          href={articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("source_article_clicked", { tool: "spoof_check" })}
          style={{
            display: "block",
            borderLeft: `2px solid ${COLORS.red}`,
            paddingLeft: 16,
            marginBottom: 36,
            maxWidth: 640,
            textDecoration: "none",
            color: COLORS.white,
            transition: "all 150ms ease-out",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "20px"; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "16px"; e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>
            BASED ON THE ARTICLE
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>
            {SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span>
          </div>
        </a>

        {/* PRESETS */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>Try a domain</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PRESETS.map((d) => (
              <button
                key={d}
                onClick={() => usePreset(d)}
                style={{
                  fontFamily: fontStack,
                  fontSize: 12,
                  letterSpacing: 1,
                  color: COLORS.white,
                  backgroundColor: "transparent",
                  border: `1px solid ${COLORS.border}`,
                  padding: "8px 14px",
                  cursor: "pointer",
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT */}
        <form onSubmit={onSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="your-employer.com  ·  your-bank.com  ·  your-school.edu"
            style={{
              flex: "1 1 260px",
              boxSizing: "border-box",
              fontFamily: fontStack,
              fontSize: 16,
              color: COLORS.white,
              backgroundColor: "transparent",
              border: `1px solid ${COLORS.border}`,
              padding: "14px 16px",
              outline: "none",
              transition: "border-color 150ms",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.red; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = COLORS.border; }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              fontFamily: fontStack,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 1.5,
              color: COLORS.white,
              backgroundColor: COLORS.red,
              border: "none",
              padding: "14px 28px",
              cursor: status === "loading" ? "wait" : "pointer",
              opacity: status === "loading" ? 0.7 : 1,
              transition: "transform 150ms",
            }}
            onMouseEnter={(e) => { if (status !== "loading") e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {status === "loading" ? "CHECKING…" : "CHECK →"}
          </button>
        </form>

        {status === "error" && error && (
          <div style={{ fontSize: 13, color: COLORS.red, lineHeight: 1.5, marginBottom: 12, borderLeft: `2px solid ${COLORS.red}`, paddingLeft: 14 }}>
            {error}
          </div>
        )}

        {/* RESULT */}
        {status === "success" && result && (
          <div style={{ marginTop: 32, animation: "fadeIn 300ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; RESULT FOR <span style={{ color: COLORS.white }}>{result.domain}</span></div>

            {/* GRADE BOX */}
            <div
              style={{
                border: `2px solid ${result.g.color}`,
                backgroundColor: `${result.g.color}0f`,
                padding: 32,
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 32,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  fontSize: 96,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: result.g.color,
                  letterSpacing: -4,
                  minWidth: 90,
                  textAlign: "center",
                }}
              >
                {result.g.letter}
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: 11, color: result.g.color, letterSpacing: 2, marginBottom: 6 }}>
                  VERDICT
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 10, lineHeight: 1.2, color: COLORS.white }}>
                  {result.g.verdict}
                </div>
                <p style={{ fontSize: 14, color: "#dddddd", lineHeight: 1.55, margin: 0 }}>
                  {result.g.summary}
                </p>
              </div>
            </div>

            {/* PARSED DETAILS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 24 }}>
              {/* SPF */}
              <div style={{ border: `1px solid ${COLORS.border}`, padding: 20 }}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 10 }}>SPF</div>
                {result.spf ? (
                  <>
                    <div style={{ fontSize: 14, marginBottom: 10, lineHeight: 1.5, color: "#dddddd" }}>
                      <strong style={{ color: COLORS.white }}>{result.spf.approvedSenderCount}</strong> approved sender source{result.spf.approvedSenderCount === 1 ? "" : "s"}{" "}
                      ({result.spf.includes} include, {result.spf.ip4} ip4, {result.spf.ip6} ip6, {result.spf.a} a, {result.spf.mx} mx).
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: "#bbbbbb" }}>
                      Final qualifier:{" "}
                      {result.spf.allQualifier === "-all" && <><span style={{ color: COLORS.green, fontWeight: 600 }}>-all</span> (hard fail — strongest)</>}
                      {result.spf.allQualifier === "~all" && <><span style={{ color: COLORS.amber, fontWeight: 600 }}>~all</span> (soft fail — mark as suspicious)</>}
                      {result.spf.allQualifier === "?all" && <><span style={{ color: COLORS.amber, fontWeight: 600 }}>?all</span> (neutral — no opinion)</>}
                      {result.spf.allQualifier === "+all" && <><span style={{ color: COLORS.red, fontWeight: 600 }}>+all</span> (permissive — accept all, broken)</>}
                      {!result.spf.allQualifier && <span style={{ color: COLORS.muted }}>none specified</span>}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 14, color: COLORS.red, lineHeight: 1.5 }}>
                    No SPF record found.
                  </div>
                )}
              </div>

              {/* DMARC */}
              <div style={{ border: `1px solid ${COLORS.border}`, padding: 20 }}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 10 }}>DMARC</div>
                {result.dmarc ? (
                  <>
                    <div style={{ fontSize: 14, marginBottom: 10, lineHeight: 1.5, color: "#dddddd" }}>
                      Policy:{" "}
                      {result.dmarc.policy === "reject" && <span style={{ color: COLORS.green, fontWeight: 600 }}>reject</span>}
                      {result.dmarc.policy === "quarantine" && <span style={{ color: COLORS.green, fontWeight: 600 }}>quarantine</span>}
                      {result.dmarc.policy === "none" && <span style={{ color: COLORS.amber, fontWeight: 600 }}>none</span>}
                      {!result.dmarc.policy && <span style={{ color: COLORS.red, fontWeight: 600 }}>missing</span>}
                      {result.dmarc.policy && result.dmarc.pct !== 100 && (
                        <span style={{ color: COLORS.muted }}> ({result.dmarc.pct}% enforced)</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.5 }}>
                      Aggregate reports (<code style={{ color: "#dddddd" }}>rua</code>):{" "}
                      {result.dmarc.ruaPresent ? <span style={{ color: COLORS.green }}>configured</span> : <span style={{ color: COLORS.muted }}>not set</span>}
                      {result.dmarc.subdomainPolicy && (
                        <>
                          <br />
                          Subdomain policy (<code style={{ color: "#dddddd" }}>sp</code>): <span style={{ color: COLORS.white }}>{result.dmarc.subdomainPolicy}</span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 14, color: COLORS.red, lineHeight: 1.5 }}>
                    No DMARC record found. Without DMARC, the visible From header is not protected.
                  </div>
                )}
              </div>
            </div>

            {/* RAW RECORDS */}
            <details style={{ marginBottom: 24, border: `1px solid ${COLORS.border}`, padding: "14px 20px" }}>
              <summary style={{ cursor: "pointer", fontSize: 12, color: COLORS.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>
                Show raw DNS records
              </summary>
              <div style={{ marginTop: 14, fontFamily: fontStack, fontSize: 12, color: "#cccccc", lineHeight: 1.55 }}>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ color: COLORS.muted, marginBottom: 4 }}>TXT records at <code style={{ color: "#dddddd" }}>{result.domain}</code>:</div>
                  {result.spfRecords.length === 0 && <div style={{ color: COLORS.muted, fontStyle: "italic" }}>(no records)</div>}
                  {result.spfRecords.map((r, i) => (
                    <div key={i} style={{ paddingLeft: 8, borderLeft: `1px solid ${COLORS.border}`, marginBottom: 4, wordBreak: "break-all" }}>{r}</div>
                  ))}
                </div>
                <div>
                  <div style={{ color: COLORS.muted, marginBottom: 4 }}>TXT records at <code style={{ color: "#dddddd" }}>_dmarc.{result.domain}</code>:</div>
                  {result.dmarcRecords.length === 0 && <div style={{ color: COLORS.muted, fontStyle: "italic" }}>(no records)</div>}
                  {result.dmarcRecords.map((r, i) => (
                    <div key={i} style={{ paddingLeft: 8, borderLeft: `1px solid ${COLORS.border}`, marginBottom: 4, wordBreak: "break-all" }}>{r}</div>
                  ))}
                </div>
              </div>
            </details>

            {/* DKIM note */}
            <div style={{ padding: "14px 18px", border: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.muted, lineHeight: 1.6, marginBottom: 24 }}>
              <span style={{ color: COLORS.red, fontWeight: 600 }}>Note on DKIM:</span> DKIM records live at{" "}
              <code style={{ color: "#dddddd" }}>{`{selector}._domainkey.{domain}`}</code>{" "}
              where the selector is chosen by each sender (google, s1, mailjet, k1, …). Without knowing which selectors this domain uses, DKIM can't be verified generically — so this checker grades on SPF + DMARC, which are the two enforcement mechanisms anyway.
            </div>

            {/* ACTION BAR */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
              <button
                onClick={copyResult}
                style={{
                  fontFamily: fontStack,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  color: copiedField === "result" ? COLORS.green : COLORS.white,
                  backgroundColor: "transparent",
                  border: `1px solid ${copiedField === "result" ? COLORS.green : COLORS.border}`,
                  padding: "12px 22px",
                  cursor: "pointer",
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => { if (copiedField !== "result") e.currentTarget.style.borderColor = COLORS.red; }}
                onMouseLeave={(e) => { if (copiedField !== "result") e.currentTarget.style.borderColor = COLORS.border; }}
              >
                {copiedField === "result" ? "COPIED ✓" : "COPY RESULT"}
              </button>
              <a
                href={articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("article_clicked", { tool: "spoof_check", grade: result.g.letter })}
                style={{
                  fontFamily: fontStack,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  color: COLORS.white,
                  backgroundColor: "transparent",
                  border: `1px solid ${COLORS.border}`,
                  padding: "12px 22px",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; }}
              >
                WHAT DOES THIS MEAN? →
              </a>
            </div>

            {/* SHARE / COMMENTS CTA */}
            <div
              style={{
                border: `1px solid ${COLORS.red}`,
                backgroundColor: "rgba(230, 72, 51, 0.04)",
                padding: 28,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>
                SHARE YOUR FINDINGS
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                Post <code style={{ color: "#dddddd" }}>{result.domain}</code> and its grade in the article comments.
              </div>
              <p style={{ fontSize: 14, color: "#cccccc", marginBottom: 20, lineHeight: 1.55 }}>
                Compare notes with other readers. What's your bank's grade? Your employer's? Decoded Security reads every comment.
              </p>
              <a
                href={`${articleUrl}/comments`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("comments_cta_clicked", { tool: "spoof_check", grade: result.g.letter })}
                style={{
                  display: "inline-block",
                  fontFamily: fontStack,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  color: COLORS.white,
                  backgroundColor: COLORS.red,
                  textDecoration: "none",
                  padding: "14px 28px",
                }}
              >
                OPEN THE ARTICLE COMMENTS →
              </a>
            </div>

            {/* NEWSLETTER */}
            <div style={{ border: `1px solid ${COLORS.border}`, padding: 28, marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 12 }}>NEWSLETTER</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                One practical email-security breakdown every week.
              </div>
              <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 20, lineHeight: 1.5 }}>
                SPF, DKIM, DMARC, phishing, network attacks. 1,420+ readers. No fluff.
              </p>
              <a
                href={SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("subscribe_clicked", { tool: "spoof_check" })}
                style={{
                  display: "inline-block",
                  fontFamily: fontStack,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  color: COLORS.white,
                  backgroundColor: COLORS.red,
                  textDecoration: "none",
                  padding: "14px 28px",
                }}
              >
                SUBSCRIBE →
              </a>
            </div>
          </div>
        )}

        <footer style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // SPOOF_CHECK_v1</div>
          <div>DNS-OVER-HTTPS · CLIENT-SIDE ONLY</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible, input:focus-visible, summary:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
