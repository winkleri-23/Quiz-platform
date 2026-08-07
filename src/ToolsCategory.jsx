import { useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — CATEGORY PAGE: TOOLS
// Interactive calculators and utilities. First tool: Subnet Calculator.
// =============================================================================

const COLORS = {
  red: "#e64833",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

export default function ToolsCategory() {
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
  const handlePick = (tool) => track("chooser_quiz_picked", { quiz: tool, from: "category_tools" });

  const cardBase = {
    display: "block",
    border: `1px solid ${COLORS.border}`,
    padding: 24,
    textDecoration: "none",
    color: COLORS.white,
    transition: "all 200ms ease-out",
    backgroundColor: "transparent",
  };
  const cardHover = (e) => {
    e.currentTarget.style.borderColor = COLORS.red;
    e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)";
    e.currentTarget.style.transform = "translateY(-2px)";
  };
  const cardUnhover = (e) => {
    e.currentTarget.style.borderColor = COLORS.border;
    e.currentTarget.style.backgroundColor = "transparent";
    e.currentTarget.style.transform = "translateY(0)";
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
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <header style={{ marginBottom: 48, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // TOOLS</div>
          </div>
          <a href="/" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2, transition: "color 150ms, border-color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            ← BACK TO HUB
          </a>
        </header>

        <div style={{ animation: "fadeIn 600ms ease-out", marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; CATEGORY_04</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
            <span style={{ color: COLORS.red }}>Tools</span> and calculators
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", maxWidth: 640 }}>
            Interactive calculators tied to the concepts in the Decoded Security archive. Type in your values, get the answer, understand why.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 64 }}>
          <a href="/tools/subnet-calculator" onClick={() => handlePick("subnet_calculator")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>TOOL_01</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Networking fundamentals</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
              <span style={{ color: COLORS.red }}>Subnet</span> Calculator
            </h2>
            <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
              Type an IP and CIDR. Get the mask, network, broadcast, first and last host — plus a binary view that shows exactly where the network / host boundary sits.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
              LIVE INPUTS · PRESETS · BINARY VIEW · COPY-READY VALUES
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              OPEN CALCULATOR →
            </div>
          </a>

          <a href="/tools/spoof-check" onClick={() => handlePick("spoof_check")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>TOOL_02</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Email security</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
              <span style={{ color: COLORS.red }}>Domain</span> Spoof-Check
            </h2>
            <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
              Type any domain. Get a live SPF + DMARC verdict — grade A through F — telling you whether an attacker could forge the visible sender.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
              LIVE DNS LOOKUP · LETTER GRADE · CLIENT-SIDE ONLY
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              CHECK A DOMAIN →
            </div>
          </a>

          <a href="/tools/linux-sandbox" onClick={() => handlePick("linux_sandbox")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>TOOL_03</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Linux basics</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
              <span style={{ color: COLORS.red }}>Linux</span> Sandbox
            </h2>
            <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
              A real (fake) filesystem in your browser. Six guided challenges to practice ls, cd, cp, mv, rm, and cat. rm -rf is safe here.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
              LIVE TERMINAL · 6 CHALLENGES · SAVES YOUR PROGRESS
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              OPEN SANDBOX →
            </div>
          </a>

          <a href="/tools/risk-calculator" onClick={() => handlePick("risk_calculator")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>TOOL_04</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>CISSP D1 · Risk math</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
              <span style={{ color: COLORS.red }}>Risk</span> Calculator
            </h2>
            <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
              Quantitative risk analysis in plain English. Type asset value, exposure, and frequency — get SLE, ALE, and a verdict on whether a safeguard is worth buying.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
              LIVE MATH · IMPLEMENT/SKIP VERDICT · CISSP-STYLE
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              OPEN CALCULATOR →
            </div>
          </a>

          <a href="/tools/url-trace" onClick={() => handlePick("url_trace")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>TOOL_05</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Networking · Interview prep</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
              <span style={{ color: COLORS.red }}>URL</span> Trace
            </h2>
            <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
              Walk through what happens when you open a website — URL parse, DNS, TCP, TLS, HTTP, rendering. Real DNS resolution and plain-English explanation at every stage.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
              6 STAGES · REAL DNS · ANIMATED HANDSHAKES
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              TRACE A URL →
            </div>
          </a>

          <a href="/tools/alert-triage" onClick={() => handlePick("alert_triage")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>TOOL_09</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>SOC · SIEM triage · Game</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
              <span style={{ color: COLORS.red }}>Alert Triage</span><br />Rush
            </h2>
            <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
              60 seconds. 20 alerts. You're the SOC analyst. Accept the real attacks, dismiss the noise. Feel what triage under pressure actually is.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
              60-SEC TIMER · KEYBOARD SHORTCUTS · SHAREABLE SCORE
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              START YOUR SHIFT →
            </div>
          </a>

          <a href="/tools/diffie-hellman" onClick={() => handlePick("diffie_hellman")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>TOOL_08</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Cryptography · Key exchange</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
              <span style={{ color: COLORS.red }}>Diffie-Hellman</span><br />Visualization
            </h2>
            <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
              Watch Alice and Bob agree on a secret color without ever sharing it. Eve intercepts everything and can't reproduce it. The color-mixing analogy, made visual and interactive.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
              4 STEPS · LIVE COLOR MIXING · ~2 MIN
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              WATCH IT →
            </div>
          </a>

          <a href="/tools/pki-sandbox" onClick={() => handlePick("pki_sandbox")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>TOOL_07</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>PKI · Trust systems</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
              <span style={{ color: COLORS.red }}>PKI</span><br />Sandbox
            </h2>
            <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
              Play three roles: the attacker impersonating a bank, the real bank getting a legit cert, and the browser deciding who to trust. Real keys generated in your browser.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
              3 ACTS · REAL WEB CRYPTO · ~5 MIN
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              OPEN THE SANDBOX →
            </div>
          </a>

          <a href="/tools/vibe-coding-challenge" onClick={() => handlePick("vibe_coding_challenge")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>TOOL_06</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Secure coding · Reward inside</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
              <span style={{ color: COLORS.red }}>Vibe Coding</span><br />Challenge
            </h2>
            <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
              Six broken AI-written snippets. Rewrite the bad line in each to fix it. Real code editor, instant feedback, hints if you're stuck. Complete the challenge → free month of Premium.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
              6 SNIPPETS · REWRITE THE FIX · REWARD ON COMPLETE
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              TAKE THE CHALLENGE →
            </div>
          </a>
        </div>

        <footer style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // TOOLS</div>
          <div>BUILT FOR HANDS-ON LEARNING</div>
        </footer>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
