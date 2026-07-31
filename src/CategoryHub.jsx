import { useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — CATEGORY HUB (Homepage)
// Introduces the platform, explains the four categories, gives a step-by-step
// path for first-time visitors. The four category cards remain the primary
// call-to-action.
// =============================================================================

const COLORS = {
  red: "#e64833",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";

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

  const handlePick = (category) => {
    track("category_picked", { category });
  };

  const cardBase = {
    display: "block",
    border: `1px solid ${COLORS.border}`,
    padding: 28,
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

  const STEPS = [
    {
      num: "01",
      title: "Start with a diagnostic",
      body: "Not sure where to focus? Two short quizzes (2 minutes each) route you to your study path or your best-fit cybersecurity career lane. You get a personalized reading list at the end.",
      hint: "→ Category 01",
    },
    {
      num: "02",
      title: "Test what you know",
      body: "CISSP knowledge quizzes if you're prepping for the exam. Article-paired quizzes if you want to check whether a specific Decoded Security post actually stuck. Every wrong answer links back to the article that covers it.",
      hint: "→ Category 02 · 03",
    },
    {
      num: "03",
      title: "Practice with tools",
      body: "Actually use what you've learned. Calculate a subnet, check if a domain can be spoofed, walk through what happens when you open a URL, or fix AI-generated code bugs to claim a free month of Premium.",
      hint: "→ Category 04",
    },
  ];

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
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <header style={{ marginBottom: 48, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // INTERACTIVE PLATFORM</div>
          </div>
          <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer"
            onClick={() => track("subscribe_clicked", { source: "hub_header" })}
            style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2, transition: "color 150ms, border-color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            NEWSLETTER ↗
          </a>
        </header>

        {/* HERO */}
        <div style={{ animation: "fadeIn 600ms ease-out", marginBottom: 64 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 20 }}>
            &gt; WELCOME TO DECODED SECURITY
          </div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 24, letterSpacing: -1 }}>
            Cybersecurity,<br />
            <span style={{ color: COLORS.red }}>made interactive.</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "#cccccc", marginBottom: 12, maxWidth: 720 }}>
            The companion platform to the Decoded Security newsletter. Diagnostics that route you to what to study, knowledge quizzes for CISSP prep, article-paired quizzes that test what stuck, and hands-on tools that let you actually try what you've read about.
          </p>
          <p style={{ fontSize: 14, color: COLORS.muted, letterSpacing: 0.5, maxWidth: 720 }}>
            Free · No account · Nothing installed · Runs in your browser
          </p>
        </div>

        {/* HOW TO USE — step-by-step */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 8 }}>
            &gt; HOW TO USE THIS PLATFORM
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 28, lineHeight: 1.2, letterSpacing: -0.5 }}>
            Three steps. Any order.
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}>
            {STEPS.map((s) => (
              <div key={s.num} style={{
                border: `1px solid ${COLORS.border}`,
                borderLeft: `2px solid ${COLORS.red}`,
                padding: 22,
                backgroundColor: "rgba(230, 72, 51, 0.03)",
              }}>
                <div style={{
                  fontSize: 40, fontWeight: 700, color: COLORS.red,
                  lineHeight: 1, marginBottom: 12, letterSpacing: -2,
                }}>
                  {s.num}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.white, marginBottom: 10, lineHeight: 1.3 }}>
                  {s.title}
                </div>
                <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
                  {s.body}
                </p>
                <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2 }}>
                  {s.hint}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CATEGORIES — the actual entry points */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 8 }}>
            &gt; PICK A CATEGORY
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, lineHeight: 1.2, letterSpacing: -0.5 }}>
            Four ways in.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 56,
          }}
        >
          {/* CATEGORY 1: DIAGNOSTICS */}
          <a href="/diagnostics" onClick={() => handlePick("diagnostics")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 14 }}>CATEGORY_01</div>
            <h2 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginBottom: 14, letterSpacing: -0.5 }}>
              Find your <span style={{ color: COLORS.red }}>direction</span>
            </h2>
            <p style={{ fontSize: 14, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 18 }}>
              Two 60-second diagnostics — one tells you your best-fit study path, the other tells you which cybersecurity career lane suits you. Personalized reading list at the end.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.7, marginBottom: 22 }}>
              STUDY PATH · DIRECTION FINDER
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              OPEN CATEGORY →
            </div>
          </a>

          {/* CATEGORY 2: CISSP */}
          <a href="/cissp" onClick={() => handlePick("cissp")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 14 }}>CATEGORY_02</div>
            <h2 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginBottom: 14, letterSpacing: -0.5 }}>
              Prepare for <span style={{ color: COLORS.red }}>CISSP</span>
            </h2>
            <p style={{ fontSize: 14, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 18 }}>
              Knowledge quizzes by CISSP domain. Every wrong answer routes you to the article that covers what you missed.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.7, marginBottom: 22 }}>
              DOMAIN 1 LIVE · DOMAINS 2–8 COMING
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              OPEN CATEGORY →
            </div>
          </a>

          {/* CATEGORY 3: ARTICLE QUIZZES */}
          <a href="/articles" onClick={() => handlePick("articles")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 14 }}>CATEGORY_03</div>
            <h2 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginBottom: 14, letterSpacing: -0.5 }}>
              <span style={{ color: COLORS.red }}>Article</span> quizzes
            </h2>
            <p style={{ fontSize: 14, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 18 }}>
              Every quiz pairs one-for-one with a Decoded Security article. Read the article, then prove it stuck. Instant feedback with the "why" for every question.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.7, marginBottom: 22 }}>
              7 QUIZZES LIVE · NEW ONE PER ARTICLE
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              OPEN CATEGORY →
            </div>
          </a>

          {/* CATEGORY 4: TOOLS */}
          <a href="/tools" onClick={() => handlePick("tools")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 14 }}>CATEGORY_04</div>
            <h2 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginBottom: 14, letterSpacing: -0.5 }}>
              <span style={{ color: COLORS.red }}>Tools</span> & calculators
            </h2>
            <p style={{ fontSize: 14, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 18 }}>
              Type real inputs, see real results. Subnet a network, spoof-check a domain, walk through a URL trace, fix AI-generated code, or play three roles in a PKI attack scenario.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.7, marginBottom: 22 }}>
              7 TOOLS LIVE · NEW ONE PER ARTICLE
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              OPEN CATEGORY →
            </div>
          </a>
        </div>

        {/* NEWSLETTER CTA */}
        <div style={{
          border: `1px solid ${COLORS.red}`,
          backgroundColor: "rgba(230, 72, 51, 0.05)",
          padding: 28, marginBottom: 40,
        }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>
            THE SOURCE
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, lineHeight: 1.2, letterSpacing: -0.5 }}>
            Everything here is built around the Decoded Security newsletter.
          </div>
          <p style={{ fontSize: 14, color: "#cccccc", marginBottom: 20, lineHeight: 1.55, maxWidth: 640 }}>
            Free weekly cybersecurity breakdowns — AI security, secure coding, exam prep, and the fundamentals nobody explains clearly. 1,450+ readers.
          </p>
          <a
            href={SUBSCRIBE_URL}
            target="_blank" rel="noopener noreferrer"
            onClick={() => track("subscribe_clicked", { source: "hub_cta" })}
            style={{
              display: "inline-block", fontFamily: fontStack, fontSize: 14, fontWeight: 600,
              letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
              textDecoration: "none", padding: "14px 28px",
            }}
          >
            SUBSCRIBE — IT'S FREE →
          </a>
        </div>

        <footer style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // INTERACTIVE_PLATFORM_v5</div>
          <div>BUILT FOR PEOPLE WHO LEARN BY DOING</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
