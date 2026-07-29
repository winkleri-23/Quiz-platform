import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — URL TRACE
// Animated walkthrough of what happens when you open a website. Advances
// stage-by-stage through URL parse → DNS → TCP → TLS → HTTP → Rendering.
// Uses real DNS-over-HTTPS lookups for the DNS step. Other stages are
// educational visualizations since the browser doesn't expose them to JS.
// Based on "What Actually Happens When You Open a Website".
// =============================================================================

const COLORS = {
  red: "#e64833",
  green: "#3ab676",
  amber: "#e8a12a",
  blue: "#5aa9e6",
  purple: "#a78bfa",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

const BASE_URL = "https://www.decodedsecurity.com/p/";
const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";

const SOURCE_ARTICLE = {
  title: "What Actually Happens When You Open a Website",
  slug: "what-actually-happens-when-you-open",
};

const PRESETS = ["google.com", "github.com", "decodedsecurity.com", "example.com"];

const STEPS = [
  { id: "url", label: "URL Parse", color: COLORS.blue },
  { id: "dns", label: "DNS", color: COLORS.purple },
  { id: "tcp", label: "TCP", color: COLORS.amber },
  { id: "tls", label: "TLS", color: COLORS.green },
  { id: "http", label: "HTTP", color: COLORS.red },
  { id: "render", label: "Render", color: COLORS.white },
];

// -----------------------------------------------------------------------------
// URL parsing (permissive — accept "example.com" without protocol)
// -----------------------------------------------------------------------------

function parseUserUrl(input) {
  const raw = (input || "").trim();
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    return {
      scheme: u.protocol.replace(":", ""),
      host: u.hostname.replace(/^www\./, ""),
      hostRaw: u.hostname,
      path: u.pathname || "/",
      query: u.search || "",
      full: u.toString(),
    };
  } catch (e) {
    return null;
  }
}

// -----------------------------------------------------------------------------
// DNS-over-HTTPS via Cloudflare (fallback to Google)
// -----------------------------------------------------------------------------

async function dohLookup(host, type = "A") {
  const endpoints = [
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=${type}`,
    `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=${type}`,
  ];
  let lastErr = null;
  for (const url of endpoints) {
    try {
      const t0 = performance.now();
      const res = await fetch(url, { headers: { Accept: "application/dns-json" } });
      const t1 = performance.now();
      if (!res.ok) { lastErr = new Error(`HTTP ${res.status}`); continue; }
      const data = await res.json();
      if (data.Status !== 0 && data.Status !== 3) { lastErr = new Error(`DNS status ${data.Status}`); continue; }
      const answers = (data.Answer || []).filter((a) => a.type === 1 || a.type === 28);
      return { answers, elapsedMs: Math.round(t1 - t0), nxdomain: data.Status === 3, source: url.includes("cloudflare") ? "Cloudflare" : "Google" };
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("DNS lookup failed");
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function UrlTraceTool() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState(null);
  const [step, setStep] = useState(-1);  // -1 = input, 0..5 = steps, 6 = summary
  const [dnsResult, setDnsResult] = useState(null);
  const [dnsLoading, setDnsLoading] = useState(false);
  const [dnsError, setDnsError] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const articleUrl = `${BASE_URL}${SOURCE_ARTICLE.slug}`;

  const startTrace = async (raw) => {
    const p = parseUserUrl(raw);
    if (!p) return;
    track("url_trace_started", { host: p.host });
    setParsed(p);
    setStep(0);
    setDnsResult(null);
    setDnsError(null);
    // Prefetch DNS in the background
    setDnsLoading(true);
    try {
      const result = await dohLookup(p.host);
      setDnsResult(result);
    } catch (e) {
      setDnsError("DNS lookup failed. This is usually a browser extension or corporate firewall blocking DNS-over-HTTPS.");
    } finally {
      setDnsLoading(false);
    }
  };

  const onSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    startTrace(input);
  };

  const usePreset = (host) => {
    track("url_trace_preset", { host });
    setInput(host);
    startTrace(host);
  };

  const next = () => {
    if (step === 5) {
      setStep(6);
      track("url_trace_completed", { host: parsed?.host });
    } else if (step < 5) {
      setStep(step + 1);
    }
  };

  const back = () => { if (step > 0) setStep(step - 1); };

  const restart = () => {
    setStep(-1);
    setInput("");
    setParsed(null);
    setDnsResult(null);
    setDnsError(null);
    setDnsLoading(false);
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
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
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
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; URL TRACE</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
            What actually happens<br />
            when you <span style={{ color: COLORS.red }}>open a website?</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", maxWidth: 640 }}>
            Type a URL. Watch the request travel through the six stages of the chain — URL parse, DNS, TCP, TLS, HTTP, rendering — with real DNS data and plain-English explanations at every step.
          </p>
        </div>

        <a
          href={articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("source_article_clicked", { tool: "url_trace" })}
          style={{
            display: "block",
            borderLeft: `2px solid ${COLORS.red}`,
            paddingLeft: 16,
            marginBottom: 32,
            maxWidth: 640,
            textDecoration: "none",
            color: COLORS.white,
            transition: "all 150ms ease-out",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "20px"; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "16px"; e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>BASED ON THE ARTICLE</div>
          <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span></div>
        </a>

        {/* INPUT STATE */}
        {step === -1 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>Try a URL</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => usePreset(p)}
                    style={{
                      fontFamily: fontStack, fontSize: 12, letterSpacing: 1,
                      color: COLORS.white, backgroundColor: "transparent",
                      border: `1px solid ${COLORS.border}`, padding: "8px 14px",
                      cursor: "pointer", transition: "all 150ms",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={onSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="https://www.example.com/login?user=admin"
                style={{
                  flex: "1 1 280px", boxSizing: "border-box", fontFamily: fontStack,
                  fontSize: 16, color: COLORS.white, backgroundColor: "transparent",
                  border: `1px solid ${COLORS.border}`, padding: "14px 16px",
                  outline: "none", transition: "border-color 150ms",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.red; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = COLORS.border; }}
              />
              <button
                type="submit"
                style={{
                  fontFamily: fontStack, fontSize: 14, fontWeight: 600, letterSpacing: 1.5,
                  color: COLORS.white, backgroundColor: COLORS.red,
                  border: "none", padding: "14px 28px", cursor: "pointer",
                  transition: "transform 150ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                TRACE →
              </button>
            </form>
          </div>
        )}

        {/* WALKTHROUGH STATE */}
        {step >= 0 && step <= 5 && parsed && (
          <div>
            {/* PROGRESS DOTS */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                {STEPS.map((s, i) => (
                  <div
                    key={s.id}
                    style={{
                      flex: "1 1 90px",
                      display: "flex", flexDirection: "column", alignItems: "center",
                      opacity: i > step ? 0.35 : 1,
                    }}
                  >
                    <div
                      style={{
                        width: "100%", height: 3,
                        backgroundColor: i === step ? s.color : i < step ? s.color : COLORS.border,
                        transition: "background-color 300ms",
                      }}
                    />
                    <div style={{ fontSize: 10, color: i === step ? s.color : COLORS.muted, letterSpacing: 1.2, marginTop: 6, textTransform: "uppercase" }}>
                      {String(i + 1).padStart(2, "0")} · {s.label}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1 }}>
                Tracing: <span style={{ color: COLORS.white }}>{parsed.full}</span>
              </div>
            </div>

            {/* CURRENT PANEL */}
            <div key={step} style={{ animation: "fadeIn 300ms ease-out", marginBottom: 32 }}>
              {step === 0 && <PanelUrlParse parsed={parsed} />}
              {step === 1 && <PanelDns parsed={parsed} result={dnsResult} loading={dnsLoading} error={dnsError} />}
              {step === 2 && <PanelTcp />}
              {step === 3 && <PanelTls parsed={parsed} />}
              {step === 4 && <PanelHttp parsed={parsed} />}
              {step === 5 && <PanelRender />}
            </div>

            {/* NAVIGATION */}
            <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
              <button
                onClick={back}
                disabled={step === 0}
                style={{
                  fontFamily: fontStack, fontSize: 13, letterSpacing: 1.5, fontWeight: 600,
                  color: step === 0 ? COLORS.muted : COLORS.white,
                  backgroundColor: "transparent",
                  border: `1px solid ${COLORS.border}`, padding: "12px 22px",
                  cursor: step === 0 ? "not-allowed" : "pointer",
                  opacity: step === 0 ? 0.4 : 1, transition: "all 150ms",
                }}
                onMouseEnter={(e) => { if (step !== 0) e.currentTarget.style.borderColor = COLORS.red; }}
                onMouseLeave={(e) => { if (step !== 0) e.currentTarget.style.borderColor = COLORS.border; }}
              >
                ← BACK
              </button>
              <button
                onClick={next}
                style={{
                  fontFamily: fontStack, fontSize: 13, fontWeight: 600, letterSpacing: 1.5,
                  color: COLORS.white, backgroundColor: COLORS.red,
                  border: "none", padding: "12px 28px", cursor: "pointer",
                  transition: "transform 150ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {step === 5 ? "SEE THE SUMMARY →" : "CONTINUE →"}
              </button>
              <button
                onClick={restart}
                style={{
                  fontFamily: fontStack, fontSize: 12, letterSpacing: 1.2, color: COLORS.muted,
                  backgroundColor: "transparent", border: `1px solid ${COLORS.border}`,
                  padding: "12px 16px", cursor: "pointer", marginLeft: "auto",
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.color = COLORS.red; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.muted; }}
              >
                RESTART
              </button>
            </div>
          </div>
        )}

        {/* SUMMARY STATE */}
        {step === 6 && parsed && (
          <div style={{ animation: "fadeIn 400ms ease-out", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; TRACE COMPLETE</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
              You just traced <span style={{ color: COLORS.red }}>{parsed.host}</span> through all six stages.
            </h2>
            <p style={{ fontSize: 15, color: "#cccccc", lineHeight: 1.6, marginBottom: 28, maxWidth: 640 }}>
              Everything you just walked through happens automatically, in under a second, every time you open any website. Next time an interviewer asks "walk me through what happens when you open a URL" — you can answer it end to end.
            </p>

            <div style={{ border: `1px solid ${COLORS.border}`, padding: 24, marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 14 }}>QUICK RECAP</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {STEPS.map((s, i) => (
                  <div key={s.id} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: s.color, color: COLORS.black, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.white, marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>{SUMMARY[i]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COMMENTS CTA */}
            <div style={{ border: `1px solid ${COLORS.red}`, backgroundColor: "rgba(230, 72, 51, 0.04)", padding: 28, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>THE CHALLENGE</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                Which step surprised you the most?
              </div>
              <p style={{ fontSize: 14, color: "#cccccc", marginBottom: 20, lineHeight: 1.55 }}>
                Post it in the article comments. Decoded Security reads every one and will tell you which step catches most people out (spoiler: it's usually TLS).
              </p>
              <a
                href={articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("comments_cta_clicked", { tool: "url_trace" })}
                style={{
                  display: "inline-block", fontFamily: fontStack, fontSize: 14, fontWeight: 600,
                  letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
                  textDecoration: "none", padding: "14px 28px",
                }}
              >
                OPEN THE ARTICLE →
              </a>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
              <button
                onClick={restart}
                style={{
                  fontFamily: fontStack, fontSize: 13, fontWeight: 600, letterSpacing: 1.5,
                  color: COLORS.white, backgroundColor: "transparent",
                  border: `1px solid ${COLORS.border}`, padding: "12px 22px", cursor: "pointer",
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; }}
              >
                ↻ TRACE ANOTHER URL
              </button>
            </div>

            {/* NEWSLETTER */}
            <div style={{ border: `1px solid ${COLORS.border}`, padding: 28, marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 12 }}>NEWSLETTER</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                One practical breakdown of how the internet actually works every week.
              </div>
              <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 20, lineHeight: 1.5 }}>
                Networking, protocols, security — 1,420+ readers building interview-ready fluency.
              </p>
              <a
                href={SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("subscribe_clicked", { tool: "url_trace" })}
                style={{
                  display: "inline-block", fontFamily: fontStack, fontSize: 14, fontWeight: 600,
                  letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
                  textDecoration: "none", padding: "14px 28px",
                }}
              >
                SUBSCRIBE →
              </a>
            </div>
          </div>
        )}

        <footer style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // URL_TRACE_v1</div>
          <div>DNS · TCP · TLS · HTTP · RENDER</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideRight { from { transform: translateX(-40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideLeft { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        button:focus-visible, a:focus-visible, input:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Summary sentences for the recap panel
// -----------------------------------------------------------------------------
const SUMMARY = [
  "Broke your URL into scheme, host, path, and query — decided which protocols to use.",
  "Asked DNS for the IP address of the host. Real lookup returned the server's location.",
  "Opened a reliable TCP connection with a three-way handshake: SYN, SYN-ACK, ACK.",
  "Negotiated TLS: exchanged Client Hello / Server Hello, verified the certificate, derived session keys.",
  "Sent an HTTP request over the encrypted channel. Server responded with the HTML.",
  "Browser parsed HTML, loaded CSS, executed JavaScript. Only now did you see the page.",
];

// -----------------------------------------------------------------------------
// Individual step panels
// -----------------------------------------------------------------------------

function PanelWrapper({ number, title, color, children }) {
  return (
    <div style={{ border: `1px solid ${COLORS.border}`, padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 6, backgroundColor: color,
          color: COLORS.black, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700,
        }}>{number}</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

function PanelUrlParse({ parsed }) {
  const rows = [
    { label: "Scheme", value: parsed.scheme, color: COLORS.blue, note: parsed.scheme === "https" ? "HTTP over TLS over TCP" : "HTTP over TCP (no encryption)" },
    { label: "Host", value: parsed.hostRaw, color: COLORS.purple, note: "The domain your browser needs to look up next." },
    { label: "Path", value: parsed.path, color: COLORS.amber, note: "Which resource on the server to request." },
    { label: "Query", value: parsed.query || "(none)", color: COLORS.green, note: "Extra parameters sent with the request." },
  ];
  return (
    <PanelWrapper number={1} title="URL Parse" color={COLORS.blue}>
      <p style={{ fontSize: 14, color: "#cccccc", lineHeight: 1.6, marginBottom: 20 }}>
        Before any packet is sent, the browser breaks your URL into pieces. The scheme (https / http) decides the whole communication stack that will be used.
      </p>
      <div style={{ backgroundColor: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.border}`, padding: "12px 14px", fontFamily: "inherit", fontSize: 14, marginBottom: 20, overflowX: "auto", whiteSpace: "nowrap" }}>
        <code style={{ color: COLORS.blue }}>{parsed.scheme}://</code>
        <code style={{ color: COLORS.purple }}>{parsed.hostRaw}</code>
        <code style={{ color: COLORS.amber }}>{parsed.path}</code>
        <code style={{ color: COLORS.green }}>{parsed.query}</code>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map((r) => (
          <div key={r.label} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 14, alignItems: "flex-start" }}>
            <div style={{ fontSize: 11, color: r.color, letterSpacing: 1.5, textTransform: "uppercase", paddingTop: 3 }}>{r.label}</div>
            <div>
              <div style={{ fontSize: 14, color: COLORS.white, wordBreak: "break-all", marginBottom: 2 }}><code>{r.value}</code></div>
              <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>{r.note}</div>
            </div>
          </div>
        ))}
      </div>
    </PanelWrapper>
  );
}

function PanelDns({ parsed, result, loading, error }) {
  return (
    <PanelWrapper number={2} title="DNS Resolution" color={COLORS.purple}>
      <p style={{ fontSize: 14, color: "#cccccc", lineHeight: 1.6, marginBottom: 20 }}>
        Your browser has a name (<code style={{ color: COLORS.white }}>{parsed.host}</code>) but not an IP address. DNS is the phone book that translates names into numbers. This lookup is <strong>actually happening right now</strong> from your browser to Cloudflare's DNS-over-HTTPS resolver.
      </p>

      {/* Conceptual chain */}
      <div style={{ backgroundColor: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.border}`, padding: 16, marginBottom: 20, fontSize: 12, color: COLORS.muted, lineHeight: 1.7 }}>
        <div style={{ marginBottom: 6, color: COLORS.red, letterSpacing: 1.5 }}>LOOKUP CHAIN</div>
        Your device <span style={{ color: COLORS.muted }}>→</span> Recursive resolver <span style={{ color: COLORS.muted }}>→</span> Root <span style={{ color: COLORS.muted }}>→</span> TLD (.com) <span style={{ color: COLORS.muted }}>→</span> Authoritative
        <div style={{ marginTop: 6, fontStyle: "italic" }}>Most lookups stop at the resolver's cache and never reach the root.</div>
      </div>

      {/* Live result */}
      <div style={{ border: `1px solid ${COLORS.border}`, padding: 16 }}>
        <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 1.5, marginBottom: 10 }}>LIVE LOOKUP RESULT</div>
        {loading && <div style={{ color: COLORS.muted, fontSize: 13, animation: "pulse 1.2s infinite" }}>Resolving {parsed.host}…</div>}
        {error && <div style={{ color: COLORS.red, fontSize: 13, lineHeight: 1.5 }}>{error}</div>}
        {result && !loading && (
          <div>
            {result.answers.length === 0 ? (
              <div style={{ color: COLORS.red, fontSize: 13 }}>{result.nxdomain ? "NXDOMAIN — this domain doesn't exist." : "No A or AAAA records returned."}</div>
            ) : (
              <>
                <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>
                  Resolved via {result.source} in {result.elapsedMs} ms
                </div>
                {result.answers.map((a, i) => (
                  <div key={i} style={{ fontSize: 14, marginBottom: 4 }}>
                    <span style={{ color: COLORS.muted }}>{a.type === 1 ? "A" : "AAAA"}</span>
                    <span style={{ color: COLORS.muted, margin: "0 10px" }}>·</span>
                    <code style={{ color: COLORS.white }}>{a.data}</code>
                    <span style={{ color: COLORS.muted, margin: "0 10px" }}>·</span>
                    <span style={{ color: COLORS.muted, fontSize: 12 }}>TTL {a.TTL}s</span>
                  </div>
                ))}
                <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 10, lineHeight: 1.5 }}>
                  Your browser now knows where to send the request.
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </PanelWrapper>
  );
}

function PanelTcp() {
  return (
    <PanelWrapper number={3} title="TCP Handshake" color={COLORS.amber}>
      <p style={{ fontSize: 14, color: "#cccccc", lineHeight: 1.6, marginBottom: 20 }}>
        You have an IP address. Before sending any data, the browser opens a reliable TCP connection using a three-way handshake. Three packets, in order, tell both sides "I'm here, I'm ready, let's start."
      </p>
      <div style={{ backgroundColor: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.border}`, padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 80px", gap: 12, alignItems: "center", fontFamily: "inherit", fontSize: 13 }}>
          <div style={{ color: COLORS.amber, fontWeight: 600, letterSpacing: 1 }}>CLIENT</div>
          <div />
          <div style={{ color: COLORS.amber, fontWeight: 600, letterSpacing: 1, textAlign: "right" }}>SERVER</div>

          <div />
          <div style={{ animation: "slideRight 500ms ease-out both", color: COLORS.white, textAlign: "center", padding: "8px 12px", border: `1px solid ${COLORS.amber}`, borderRadius: 4 }}>
            <span style={{ color: COLORS.amber }}>→</span> SYN
          </div>
          <div />

          <div />
          <div style={{ animation: "slideLeft 500ms ease-out 500ms both", color: COLORS.white, textAlign: "center", padding: "8px 12px", border: `1px solid ${COLORS.amber}`, borderRadius: 4 }}>
            SYN-ACK <span style={{ color: COLORS.amber }}>←</span>
          </div>
          <div />

          <div />
          <div style={{ animation: "slideRight 500ms ease-out 1000ms both", color: COLORS.white, textAlign: "center", padding: "8px 12px", border: `1px solid ${COLORS.amber}`, borderRadius: 4 }}>
            <span style={{ color: COLORS.amber }}>→</span> ACK
          </div>
          <div />
        </div>
        <div style={{ marginTop: 20, padding: "10px 14px", borderLeft: `2px solid ${COLORS.green}`, animation: "fadeIn 500ms ease-out 1600ms both" }}>
          <div style={{ fontSize: 12, color: COLORS.green, letterSpacing: 1.5, marginBottom: 4 }}>ESTABLISHED ✓</div>
          <div style={{ fontSize: 12, color: COLORS.muted }}>Both sides now agree they can exchange data reliably. Any lost packet will be retransmitted.</div>
        </div>
      </div>
    </PanelWrapper>
  );
}

function PanelTls({ parsed }) {
  const steps = [
    { n: 1, name: "Client Hello",     desc: "Browser sends supported TLS versions, cipher suites, and random data." },
    { n: 2, name: "Server Hello + Certificate", desc: "Server picks a cipher suite and returns its digital certificate (signed by a trusted CA)." },
    { n: 3, name: "Certificate Verification",   desc: "Browser checks: signed by a trusted CA? Not expired? Domain matches?" },
    { n: 4, name: "Key Exchange (ECDHE)",       desc: "Both sides derive a shared session key without ever sending it over the wire." },
    { n: 5, name: "Secure Channel Established", desc: "From here on: all data encrypted, all data integrity-protected." },
  ];
  return (
    <PanelWrapper number={4} title="TLS Handshake" color={COLORS.green}>
      <p style={{ fontSize: 14, color: "#cccccc", lineHeight: 1.6, marginBottom: 20 }}>
        TCP gives you a connection. TLS gives you a <strong>trusted, encrypted, tamper-proof</strong> connection. Five steps, all before the first byte of your actual request leaves your machine.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{
            display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, alignItems: "flex-start",
            padding: "12px 14px", border: `1px solid ${COLORS.border}`,
            animation: `slideRight 400ms ease-out ${i * 150}ms both`,
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 4, backgroundColor: COLORS.green,
              color: COLORS.black, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
            }}>{s.n}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.white, marginBottom: 2 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.55 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: "10px 14px", borderLeft: `2px solid ${COLORS.green}`, fontSize: 12, color: COLORS.muted, lineHeight: 1.55 }}>
        You can watch a real TLS handshake yourself by running <code style={{ color: COLORS.white }}>curl -v https://{parsed.host}</code> in your terminal — the article's hands-on lab walks through it.
      </div>
    </PanelWrapper>
  );
}

function PanelHttp({ parsed }) {
  const request = [
    `${parsed.path === "/" ? "GET / HTTP/1.1" : `GET ${parsed.path}${parsed.query} HTTP/1.1`}`,
    `Host: ${parsed.host}`,
    `User-Agent: Mozilla/5.0`,
    `Accept: text/html`,
  ].join("\n");
  const response = [
    "HTTP/1.1 200 OK",
    "Content-Type: text/html; charset=utf-8",
    "Content-Length: 12456",
    "Server: cloudflare",
    "",
    "<!doctype html>",
    "<html>",
    "  <head>...</head>",
    "  <body>...</body>",
    "</html>",
  ].join("\n");
  return (
    <PanelWrapper number={5} title="HTTP Request / Response" color={COLORS.red}>
      <p style={{ fontSize: 14, color: "#cccccc", lineHeight: 1.6, marginBottom: 20 }}>
        The secure channel is open. Now — finally — the browser sends the actual request and the server sends back the content. Everything until now was <em>setup</em>.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 1.5, marginBottom: 6 }}>REQUEST (browser → server)</div>
          <pre style={{ margin: 0, backgroundColor: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.border}`, padding: 14, fontSize: 12, color: "#dddddd", overflowX: "auto", fontFamily: "'IBM Plex Mono', ui-monospace, Menlo, monospace" }}>
            {request}
          </pre>
        </div>
        <div>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 1.5, marginBottom: 6 }}>RESPONSE (server → browser)</div>
          <pre style={{ margin: 0, backgroundColor: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.border}`, padding: 14, fontSize: 12, color: "#dddddd", overflowX: "auto", fontFamily: "'IBM Plex Mono', ui-monospace, Menlo, monospace" }}>
            {response}
          </pre>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: "10px 14px", borderLeft: `2px solid ${COLORS.red}`, fontSize: 12, color: COLORS.muted, lineHeight: 1.55 }}>
        The response body is HTML — text that tells the browser what to draw. It's <strong>not</strong> the finished page yet.
      </div>
    </PanelWrapper>
  );
}

function PanelRender() {
  const stages = [
    { name: "Parse HTML", desc: "Build the Document Object Model (DOM)." },
    { name: "Fetch resources", desc: "CSS, JavaScript, images, fonts — each may kick off its own DNS → TCP → TLS → HTTP chain." },
    { name: "Apply styles", desc: "Compute what everything looks like." },
    { name: "Execute JavaScript", desc: "Run any scripts. They can modify the DOM, fetch more data, add interactivity." },
    { name: "Paint pixels", desc: "Only now does anything appear on your screen." },
  ];
  return (
    <PanelWrapper number={6} title="Browser Rendering" color={COLORS.white}>
      <p style={{ fontSize: 14, color: "#cccccc", lineHeight: 1.6, marginBottom: 20 }}>
        The HTML arrives. The browser reads it, downloads whatever else the page needs (each with its own tiny chain), executes the JavaScript, and paints pixels. Only now — after every step above completed successfully — do you actually <em>see</em> the page.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {stages.map((s, i) => (
          <div key={s.name} style={{
            display: "grid", gridTemplateColumns: "20px 140px 1fr", gap: 12, alignItems: "flex-start",
            padding: "8px 0", borderBottom: i < stages.length - 1 ? `1px solid ${COLORS.border}` : "none",
          }}>
            <div style={{ color: COLORS.muted, fontSize: 12 }}>{i + 1}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.white }}>{s.name}</div>
            <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.55 }}>{s.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, padding: "14px 16px", border: `2px solid ${COLORS.green}`, backgroundColor: "rgba(58,182,118,0.05)" }}>
        <div style={{ fontSize: 12, color: COLORS.green, letterSpacing: 1.5, marginBottom: 4 }}>PAGE LOADED ✓</div>
        <div style={{ fontSize: 13, color: "#dddddd" }}>
          Everything above happens automatically, in under a second, every time. And almost every step is attackable if any single link in the chain is misconfigured.
        </div>
      </div>
    </PanelWrapper>
  );
}
