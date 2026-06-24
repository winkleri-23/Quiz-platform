import { useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — CATEGORY HUB
// Homepage. A crossroads. Three big cards, each leading to a category page.
// =============================================================================

const COLORS = {
  red: "#e64833",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

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
        <header style={{ marginBottom: 48, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
          <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // QUIZ HUB</div>
        </header>

        <div style={{ animation: "fadeIn 600ms ease-out", marginBottom: 56 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 20 }}>
            &gt; WHAT ARE YOU TRYING TO DO?
          </div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 20, letterSpacing: -1 }}>
            Find your path in<br />
            <span style={{ color: COLORS.red }}>cybersecurity.</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "#cccccc", maxWidth: 640 }}>
            Three categories of quizzes, organized by what you need. Pick where you want to start.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 64,
          }}
        >
          {/* CATEGORY 1: DIAGNOSTICS */}
          <a href="/diagnostics" onClick={() => handlePick("diagnostics")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 14 }}>CATEGORY_01</div>
            <h2 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginBottom: 14, letterSpacing: -0.5 }}>
              Find your <span style={{ color: COLORS.red }}>direction</span>
            </h2>
            <p style={{ fontSize: 14, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 18 }}>
              Diagnostic quizzes that route you to where you should focus — based on your goals and your background.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.7, marginBottom: 22 }}>
              STUDY PATH QUIZ<br />
              DIRECTION QUIZ
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
              Knowledge quizzes by CISSP domain. Each wrong answer routes you to the article that covers it.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.7, marginBottom: 22 }}>
              DOMAIN 1 LIVE<br />
              DOMAINS 2 — 8 COMING
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
              Each quiz pairs with a single Decoded Security article. Read, then test if it stuck.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.7, marginBottom: 22 }}>
              THE THREE STATES OF DATA<br />
              RECOVERY METRICS<br />
              MORE WITH EACH ARTICLE
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              OPEN CATEGORY →
            </div>
          </a>
        </div>

        <footer style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // QUIZ_HUB_v4</div>
          <div>BUILT FOR PEOPLE WHO WANT DIRECTION</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
