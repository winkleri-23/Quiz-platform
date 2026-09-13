import { useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — CATEGORY HUB (Homepage)
// Redesigned for accessibility: category cards sit immediately below a tight
// hero so the main navigation is visible without scrolling. Flashcards promo,
// "how to use" tips, and newsletter live below.
// =============================================================================

const COLORS = {
  red: "#e64833",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";

const CATEGORIES = [
  {
    id: "diagnostics",
    href: "/diagnostics",
    num: "01",
    title: (c) => <>Find your <span style={{ color: c.red }}>direction</span></>,
    blurb: "Two 60-second diagnostics. Study path and career direction, with a personalized reading list at the end.",
    meta: "STUDY PATH · DIRECTION FINDER",
  },
  {
    id: "cissp",
    href: "/cissp",
    num: "02",
    title: (c) => <>Prepare for <span style={{ color: c.red }}>CISSP</span></>,
    blurb: "Knowledge quizzes by CISSP domain. Every wrong answer links back to the article that covers it.",
    meta: "DOMAIN 1 LIVE · MORE COMING",
  },
  {
    id: "articles",
    href: "/articles",
    num: "03",
    title: (c) => <><span style={{ color: c.red }}>Article</span> quizzes</>,
    blurb: "Every quiz pairs one-for-one with a Decoded Security article. Read it, prove it stuck.",
    meta: "10 QUIZZES LIVE · NEW ONE PER ARTICLE",
  },
  {
    id: "tools",
    href: "/tools",
    num: "04",
    title: (c) => <><span style={{ color: c.red }}>Tools</span> and calculators</>,
    blurb: "Type real inputs, see real results. Subnet, spoof-check, URL trace, PKI, port scan, and more.",
    meta: "14 TOOLS LIVE · NEW ONE PER ARTICLE",
  },
  {
    id: "guest",
    href: "/guest",
    num: "05",
    title: (c) => <><span style={{ color: c.red }}>Special guest</span> content</>,
    blurb: "Guest quizzes from other cybersecurity creators I trust. Fresh perspectives, same standards.",
    meta: "1 GUEST QUIZ LIVE",
  },
];

export default function CategoryHub() {
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
  const handlePick = (category) => track("category_picked", { category });

  const cardBase = {
    display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 12,
    minHeight: 200,
    border: `1px solid ${COLORS.border}`,
    padding: 20,
    textDecoration: "none",
    color: COLORS.white,
    transition: "all 180ms ease-out",
    backgroundColor: "transparent",
  };
  const cardHover = (e) => {
    e.currentTarget.style.borderColor = COLORS.red;
    e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.05)";
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
        padding: "20px 16px",
        backgroundImage: `radial-gradient(circle at 20% 0%, rgba(230, 72, 51, 0.08), transparent 50%), radial-gradient(circle at 80% 100%, rgba(230, 72, 51, 0.05), transparent 50%)`,
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* Compact header */}
        <header style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // INTERACTIVE PLATFORM</div>
          </div>
          <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer"
            onClick={() => track("subscribe_clicked", { source: "hub_header" })}
            style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            NEWSLETTER ↗
          </a>
        </header>

        {/* TIGHT HERO — three lines total */}
        <div style={{ animation: "fadeIn 500ms ease-out", marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>
            &gt; WELCOME
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4.5vw, 44px)", fontWeight: 700, lineHeight: 1.08, marginBottom: 8, letterSpacing: -0.8 }}>
            Cybersecurity, <span style={{ color: COLORS.red }}>made interactive.</span>
          </h1>
          <p style={{ fontSize: 13, color: COLORS.muted, letterSpacing: 0.5, margin: 0 }}>
            Free · No account · Nothing installed · Runs in your browser
          </p>
        </div>

        {/* CATEGORIES — above the fold, primary navigation */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
            marginBottom: 32,
          }}
        >
          {CATEGORIES.map((cat) => (
            <a key={cat.id} href={cat.href} onClick={() => handlePick(cat.id)}
              style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: COLORS.red, letterSpacing: 2.5 }}>CATEGORY_{cat.num}</div>
                  <div style={{ fontSize: 16, color: COLORS.red }}>→</div>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, marginBottom: 10, letterSpacing: -0.4 }}>
                  {cat.title(COLORS)}
                </h2>
                <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.5, margin: 0 }}>
                  {cat.blurb}
                </p>
              </div>
              <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.5 }}>
                {cat.meta}
              </div>
            </a>
          ))}
        </div>

        {/* FLASHCARDS PROMO — compact link to the dedicated page */}
        <a href="/flashcards"
          onClick={() => track("flashcards_promo_clicked")}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
            border: `1px solid ${COLORS.border}`, borderLeft: `2px solid ${COLORS.red}`,
            padding: "18px 22px", marginBottom: 32,
            backgroundColor: "rgba(230, 72, 51, 0.04)",
            textDecoration: "none", color: COLORS.white,
            flexWrap: "wrap",
            transition: "all 150ms",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.08)"; e.currentTarget.style.borderColor = COLORS.red; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; e.currentTarget.style.borderColor = COLORS.border; }}
        >
          <div style={{ flex: "1 1 320px" }}>
            <div style={{ fontSize: 10, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>QUICK STUDY</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>
              20 cybersecurity flashcards — the essentials every beginner needs cold.
            </div>
            <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>
              CIA, AAA, encryption, SIEM, incident response, and 15 more. Five minutes.
            </div>
          </div>
          <div style={{
            fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white,
            backgroundColor: COLORS.red, padding: "10px 18px",
            whiteSpace: "nowrap",
          }}>
            OPEN FLASHCARDS →
          </div>
        </a>

        {/* HOW TO USE — collapsed onto one row of compact hints */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 2, marginBottom: 10 }}>NEW HERE? THREE-STEP FLOW:</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {[
              { n: "01", t: "Take a diagnostic", d: "→ Category 01. Find where to focus." },
              { n: "02", t: "Test what you know", d: "→ Category 02 · 03. Quizzes with instant feedback." },
              { n: "03", t: "Practice with tools", d: "→ Category 04. Actually use what you learned." },
            ].map((s) => (
              <div key={s.n} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.red, lineHeight: 1, minWidth: 22 }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.white, marginBottom: 2 }}>{s.t}</div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NEWSLETTER CTA */}
        <div style={{
          border: `1px solid ${COLORS.red}`,
          backgroundColor: "rgba(230, 72, 51, 0.05)",
          padding: 24, marginBottom: 32,
        }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>THE SOURCE</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, lineHeight: 1.25, letterSpacing: -0.4 }}>
            Everything here is built around the Decoded Security newsletter.
          </div>
          <p style={{ fontSize: 13, color: "#cccccc", marginBottom: 16, lineHeight: 1.55, maxWidth: 640 }}>
            Free weekly cybersecurity breakdowns. AI security, secure coding, exam prep, and the fundamentals nobody explains clearly. 1,450+ readers.
          </p>
          <a
            href={SUBSCRIBE_URL}
            target="_blank" rel="noopener noreferrer"
            onClick={() => track("subscribe_clicked", { source: "hub_cta" })}
            style={{
              display: "inline-block", fontFamily: fontStack, fontSize: 13, fontWeight: 600,
              letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
              textDecoration: "none", padding: "12px 24px",
            }}
          >
            SUBSCRIBE — IT'S FREE →
          </a>
        </div>

        <footer style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // INTERACTIVE_PLATFORM_v6</div>
          <div>BUILT FOR PEOPLE WHO LEARN BY DOING</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
