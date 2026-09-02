import { useEffect } from "react";
import { track } from "@vercel/analytics/react";
import Flashcards from "./Flashcards.jsx";

// =============================================================================
// DECODED SECURITY — FLASHCARDS PAGE
// Dedicated home for the 20 essential cybersecurity flashcards. The Flashcards
// component itself is the reusable widget; this page gives it a proper
// full-width home with a hero, category breakdown, and study tips.
// =============================================================================

const COLORS = {
  red: "#e64833",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";

export default function FlashcardsPage() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    track("flashcards_page_opened");
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";

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
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <header style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // FLASHCARDS</div>
          </div>
          <a href="/" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            ← BACK TO HUB
          </a>
        </header>

        {/* Hero */}
        <div style={{ animation: "fadeIn 500ms ease-out", marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; 20-CARD ESSENTIALS DECK</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.08, marginBottom: 18, letterSpacing: -1 }}>
            The 20 cybersecurity terms every beginner needs <span style={{ color: COLORS.red }}>cold.</span>
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 14, maxWidth: 720 }}>
            Not 200. Not 50. Twenty. The concepts that come up in every SOC interview, every CC / CISSP / Security+ exam, and every conversation with a real security team. Filter by category, flip through, shuffle when you feel confident.
          </p>
          <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 0, lineHeight: 1.55 }}>
            Click a card to flip. No account. Works offline once loaded. Come back tomorrow.
          </p>
        </div>

        {/* The widget itself */}
        <Flashcards />

        {/* Category breakdown */}
        <div style={{ marginTop: 48, marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>&gt; WHAT'S IN THE DECK</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { label: "Fundamentals", count: 5, body: "CIA, Defense in Depth, Zero Trust, Vulnerability vs Exploit, Risk = Threat × Vulnerability." },
              { label: "IAM", count: 3, body: "AAA, Least Privilege, MFA." },
              { label: "Cryptography", count: 2, body: "Encryption (symmetric vs asymmetric), Hashing." },
              { label: "Network", count: 3, body: "Firewall, VPN, IDS vs IPS." },
              { label: "Attack", count: 3, body: "Phishing, DDoS, Ransomware." },
              { label: "Defense", count: 1, body: "Patch Management." },
              { label: "Operations", count: 3, body: "SIEM, SOC, Incident Response." },
            ].map((cat) => (
              <div key={cat.label} style={{ border: `1px solid ${COLORS.border}`, borderLeft: `2px solid ${COLORS.red}`, padding: 14, backgroundColor: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 4 }}>{cat.label.toUpperCase()} · {cat.count}</div>
                <div style={{ fontSize: 12.5, color: "#cccccc", lineHeight: 1.5 }}>{cat.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How to use */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>&gt; HOW TO USE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <Tip num="01" title="First pass — front only.">
              Read only the term. Say the definition out loud. Flip to check. Move on.
            </Tip>
            <Tip num="02" title="Second pass — shuffle.">
              Hit shuffle. Recognition is easier than recall. Random order forces recall.
            </Tip>
            <Tip num="03" title="Third pass — filter.">
              Weakest category? Filter to that one, flip only that mini-deck until it clicks.
            </Tip>
          </div>
        </div>

        {/* Newsletter */}
        <div style={{ border: `1px solid ${COLORS.border}`, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 10 }}>NEWSLETTER</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>Free weekly cybersecurity breakdowns.</div>
          <p style={{ fontSize: 13, color: "#bbbbbb", marginBottom: 16, lineHeight: 1.5 }}>Each term in this deck has an article behind it. 1,450+ readers.</p>
          <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer"
            onClick={() => track("subscribe_clicked", { page: "flashcards" })}
            style={{
              display: "inline-block", fontFamily: fontStack, fontSize: 13, fontWeight: 600,
              letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
              textDecoration: "none", padding: "12px 22px",
            }}
          >
            SUBSCRIBE →
          </a>
        </div>

        <footer style={{ marginTop: 60, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // FLASHCARDS_v1</div>
          <div>20 CONCEPTS · FIVE MINUTES</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}

function Tip({ num, title, children }) {
  return (
    <div style={{ border: `1px solid ${COLORS.border}`, padding: 16, backgroundColor: "rgba(255,255,255,0.02)" }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.red, lineHeight: 1, marginBottom: 8, letterSpacing: -1 }}>{num}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.white, marginBottom: 6, lineHeight: 1.3 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: "#bbbbbb", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}
