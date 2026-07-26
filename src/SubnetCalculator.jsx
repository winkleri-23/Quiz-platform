import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — SUBNET CALCULATOR
// Interactive tool inspired by "This is how I explain subnetting to a beginner"
// Takes IP + CIDR, returns network / broadcast / usable range + a binary view
// with the network / host boundary highlighted.
// =============================================================================

const COLORS = {
  red: "#e64833",
  green: "#3ab676",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

const BASE_URL = "https://www.decodedsecurity.com/p/";
const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";

const SOURCE_ARTICLE = {
  title: "This Is How I Explain Subnetting to a Beginner",
  slug: "this-is-how-i-explain-subnetting",
};

const PRESETS = [
  { label: "Home LAN", ip: "192.168.1.0", cidr: 24 },
  { label: "Small subnet", ip: "192.168.1.0", cidr: 27 },
  { label: "Half split", ip: "192.168.1.0", cidr: 25 },
  { label: "Point-to-point", ip: "10.0.0.0", cidr: 30 },
  { label: "Class A private", ip: "10.0.0.0", cidr: 8 },
];

// -----------------------------------------------------------------------------
// IP helpers — all 32-bit unsigned math
// -----------------------------------------------------------------------------

function parseIp(str) {
  const parts = (str || "").trim().split(".");
  if (parts.length !== 4) return null;
  let ip = 0;
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null;
    const n = parseInt(p, 10);
    if (n < 0 || n > 255) return null;
    ip = (ip << 8) | n;
  }
  return ip >>> 0;
}

function intToIp(n) {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join(".");
}

function cidrToMask(cidr) {
  if (cidr === 0) return 0;
  return (0xffffffff << (32 - cidr)) >>> 0;
}

function calculate(ip, cidr) {
  const mask = cidrToMask(cidr);
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const total = cidr === 0 ? 4294967296 : 2 ** (32 - cidr);
  const usable = cidr === 32 ? 1 : cidr === 31 ? 2 : total - 2;
  const firstHost = cidr >= 31 ? network : network + 1;
  const lastHost = cidr >= 31 ? broadcast : broadcast - 1;
  return { mask, network, broadcast, total, usable, firstHost, lastHost };
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function SubnetCalculator() {
  const [ipInput, setIpInput] = useState("192.168.1.42");
  const [cidrInput, setCidrInput] = useState("24");
  const [copiedField, setCopiedField] = useState(null);

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

  const ip = parseIp(ipInput);
  const cidrNum = parseInt(cidrInput, 10);
  const cidrValid = !isNaN(cidrNum) && cidrNum >= 0 && cidrNum <= 32;
  const ipValid = ip !== null;

  const valid = ipValid && cidrValid;
  const result = valid ? calculate(ip, cidrNum) : null;

  const applyPreset = (preset) => {
    track("subnet_preset_used", { preset: preset.label });
    setIpInput(preset.ip);
    setCidrInput(String(preset.cidr));
  };

  const copyValue = async (key, text) => {
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
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 1500);
    } catch (e) {
      // silent
    }
  };

  // Binary view — network bits in white/bold, host bits in muted, boundary in red
  const renderBinary = (n) => {
    if (!valid) return null;
    const bits = n.toString(2).padStart(32, "0");
    const els = [];
    for (let i = 0; i < 32; i++) {
      if (i > 0 && i % 8 === 0) {
        els.push(<span key={`d${i}`} style={{ color: COLORS.muted }}>.</span>);
      }
      if (i === cidrNum) {
        els.push(<span key={`b${i}`} style={{ color: COLORS.red, fontWeight: 700, margin: "0 2px" }}>|</span>);
      }
      const isNetwork = i < cidrNum;
      els.push(
        <span
          key={`bit${i}`}
          style={{ color: isNetwork ? COLORS.white : COLORS.muted, fontWeight: isNetwork ? 600 : 400 }}
        >
          {bits[i]}
        </span>
      );
    }
    return <span>{els}</span>;
  };

  // Render one result row with a copyable value
  const ResultRow = ({ label, value, fieldKey, mono = true }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: `1px solid ${COLORS.border}`,
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, textTransform: "uppercase", minWidth: 130 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, justifyContent: "flex-end" }}>
        <code style={{ fontSize: mono ? 15 : 14, color: COLORS.white, fontWeight: 500 }}>{value}</code>
        <button
          onClick={() => copyValue(fieldKey, String(value))}
          style={{
            fontFamily: fontStack,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 1,
            color: copiedField === fieldKey ? COLORS.green : COLORS.muted,
            backgroundColor: "transparent",
            border: `1px solid ${copiedField === fieldKey ? COLORS.green : COLORS.border}`,
            padding: "4px 10px",
            cursor: "pointer",
            transition: "all 150ms",
          }}
          onMouseEnter={(e) => { if (copiedField !== fieldKey) e.currentTarget.style.borderColor = COLORS.red; }}
          onMouseLeave={(e) => { if (copiedField !== fieldKey) e.currentTarget.style.borderColor = COLORS.border; }}
        >
          {copiedField === fieldKey ? "✓" : "COPY"}
        </button>
      </div>
    </div>
  );

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
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; SUBNETTING CALCULATOR</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
            Subnet <span style={{ color: COLORS.red }}>Calculator</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", maxWidth: 640 }}>
            Type an IP address and a CIDR prefix. See every property of the network — plus the binary view that shows exactly where the network / host boundary sits.
          </p>
        </div>

        {/* SOURCE ARTICLE */}
        <a
          href={articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("source_article_clicked", { tool: "subnet_calculator" })}
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
          <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>Try a preset</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                style={{
                  fontFamily: fontStack,
                  fontSize: 11,
                  letterSpacing: 1.2,
                  color: COLORS.white,
                  backgroundColor: "transparent",
                  border: `1px solid ${COLORS.border}`,
                  padding: "8px 12px",
                  cursor: "pointer",
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {p.label.toUpperCase()} · {p.ip}/{p.cidr}
              </button>
            ))}
          </div>
        </div>

        {/* INPUTS */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <div style={{ flex: "3 1 240px" }}>
            <label style={{ display: "block", fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" }}>
              IP address
            </label>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="192.168.1.0"
              style={{
                width: "100%",
                boxSizing: "border-box",
                fontFamily: fontStack,
                fontSize: 16,
                color: COLORS.white,
                backgroundColor: "transparent",
                border: `1px solid ${ipInput && !ipValid ? COLORS.red : COLORS.border}`,
                padding: "14px 16px",
                outline: "none",
                transition: "border-color 150ms",
              }}
              onFocus={(e) => { if (ipValid || !ipInput) e.currentTarget.style.borderColor = COLORS.red; }}
              onBlur={(e) => { if (ipValid || !ipInput) e.currentTarget.style.borderColor = COLORS.border; }}
            />
          </div>
          <div style={{ flex: "1 1 100px" }}>
            <label style={{ display: "block", fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" }}>
              CIDR /
            </label>
            <input
              type="number"
              min="0"
              max="32"
              value={cidrInput}
              onChange={(e) => setCidrInput(e.target.value)}
              placeholder="24"
              style={{
                width: "100%",
                boxSizing: "border-box",
                fontFamily: fontStack,
                fontSize: 16,
                color: COLORS.white,
                backgroundColor: "transparent",
                border: `1px solid ${cidrInput && !cidrValid ? COLORS.red : COLORS.border}`,
                padding: "14px 16px",
                outline: "none",
                transition: "border-color 150ms",
              }}
              onFocus={(e) => { if (cidrValid || !cidrInput) e.currentTarget.style.borderColor = COLORS.red; }}
              onBlur={(e) => { if (cidrValid || !cidrInput) e.currentTarget.style.borderColor = COLORS.border; }}
            />
          </div>
        </div>

        {/* ERROR STATE */}
        {ipInput && !ipValid && (
          <div style={{ fontSize: 12, color: COLORS.red, marginBottom: 12, marginTop: -4 }}>
            Enter a valid IPv4 address (four octets, each 0-255). Example: 192.168.1.0
          </div>
        )}
        {cidrInput && !cidrValid && (
          <div style={{ fontSize: 12, color: COLORS.red, marginBottom: 12, marginTop: -4 }}>
            CIDR must be a number between 0 and 32.
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div style={{ marginTop: 32, animation: "fadeIn 300ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 20 }}>&gt; RESULT</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 32 }}>
              {/* LEFT: addressing */}
              <div>
                <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 12, textTransform: "uppercase" }}>Addressing</div>
                <ResultRow label="Subnet mask" value={intToIp(result.mask)} fieldKey="mask" />
                <ResultRow label="CIDR" value={`/${cidrNum}`} fieldKey="cidr" />
                <ResultRow label="Network address" value={intToIp(result.network)} fieldKey="network" />
                <ResultRow label="Broadcast" value={intToIp(result.broadcast)} fieldKey="broadcast" />
                <ResultRow label="First host" value={intToIp(result.firstHost)} fieldKey="firsthost" />
                <ResultRow label="Last host" value={intToIp(result.lastHost)} fieldKey="lasthost" />
              </div>

              {/* RIGHT: counts */}
              <div>
                <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 12, textTransform: "uppercase" }}>Capacity</div>
                <ResultRow label="Total addresses" value={result.total.toLocaleString()} fieldKey="total" />
                <ResultRow label="Usable hosts" value={result.usable.toLocaleString()} fieldKey="usable" />
                {cidrNum === 32 && (
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 12, lineHeight: 1.5 }}>
                    <span style={{ color: COLORS.red, fontWeight: 600 }}>Note:</span> /32 is a single-host address (a specific device, not a range).
                  </div>
                )}
                {cidrNum === 31 && (
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 12, lineHeight: 1.5 }}>
                    <span style={{ color: COLORS.red, fontWeight: 600 }}>Note:</span> /31 has 2 addresses, both usable — designed for point-to-point links (RFC 3021).
                  </div>
                )}
                {cidrNum < 31 && (
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 12, lineHeight: 1.5 }}>
                    Usable = total − 2 (subtracting the network address and the broadcast address).
                  </div>
                )}
              </div>
            </div>

            {/* BINARY VIEW */}
            <div style={{ marginTop: 40, border: `1px solid ${COLORS.border}`, padding: 24 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 8 }}>
                &gt; BINARY VIEW
              </div>
              <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20, lineHeight: 1.55 }}>
                <span style={{ color: COLORS.white, fontWeight: 600 }}>White bits</span> are the network portion (fixed). <span style={{ color: COLORS.muted }}>Muted bits</span> are the host portion (variable). The red <span style={{ color: COLORS.red, fontWeight: 700 }}>|</span> marks the network / host boundary.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowX: "auto" }}>
                <BinaryRow label="Your IP" ip={ip} render={renderBinary} decimal={intToIp(ip)} />
                <BinaryRow label="Subnet mask" ip={result.mask} render={renderBinary} decimal={intToIp(result.mask)} />
                <BinaryRow label="Network" ip={result.network} render={renderBinary} decimal={intToIp(result.network)} />
                <BinaryRow label="Broadcast" ip={result.broadcast} render={renderBinary} decimal={intToIp(result.broadcast)} />
              </div>
            </div>

            {/* COMMENTS CTA */}
            <div
              style={{
                marginTop: 32,
                border: `1px solid ${COLORS.red}`,
                backgroundColor: "rgba(230, 72, 51, 0.04)",
                padding: 28,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>
                LEARN BY DOING
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                The article has exercises. Try them and post your answers.
              </div>
              <p style={{ fontSize: 14, color: "#cccccc", marginBottom: 20, lineHeight: 1.55 }}>
                The Decoded Security article ends with three subnetting problems — <code style={{ color: "#dddddd" }}>192.168.1.0/25</code>, <code style={{ color: "#dddddd" }}>/12</code>, and <code style={{ color: "#dddddd" }}>/27</code>. Work them out on paper, check yourself with this calculator, then drop your answers in the comments. Decoded Security will give you personal feedback.
              </p>
              <a
                href={`${articleUrl}/comments`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("comments_cta_clicked", { tool: "subnet_calculator" })}
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
            <div style={{ marginTop: 20, border: `1px solid ${COLORS.border}`, padding: 28, marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 12 }}>NEWSLETTER</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                One practical networking breakdown every week.
              </div>
              <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 20, lineHeight: 1.5 }}>
                Subnetting, DNS, protocols, and the topics most beginners spend months on for no reason. 1,420+ readers.
              </p>
              <a
                href={SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("subscribe_clicked", { tool: "subnet_calculator" })}
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
          <div>DECODED_SECURITY // SUBNET_CALCULATOR_v1</div>
          <div>NETWORKING FUNDAMENTALS</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible, input:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
        input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none; margin: 0;
        }
        input[type="number"] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}

// Helper subcomponent for a labeled row in the binary view
function BinaryRow({ label, ip, render, decimal }) {
  const COLORS = { muted: "#888888", white: "#FFFFFF" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr auto", gap: 12, alignItems: "center", fontFamily: "'IBM Plex Mono', ui-monospace, Menlo, monospace" }}>
      <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 13, whiteSpace: "nowrap", overflowX: "auto" }}>{render(ip)}</div>
      <div style={{ fontSize: 13, color: COLORS.white, whiteSpace: "nowrap", fontWeight: 500 }}>{decimal}</div>
    </div>
  );
}
