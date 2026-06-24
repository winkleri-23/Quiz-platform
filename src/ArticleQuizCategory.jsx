import { useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — CATEGORY PAGE: ARTICLE QUIZZES
// Three States of Data + Recovery Metrics. Add new cards as new articles ship.
// =============================================================================

const COLORS = {
  red: "#e64833",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

export default function ArticleQuizCategory() {
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
  const handlePick = (quiz) => track("chooser_quiz_picked", { quiz, from: "category_articles" });

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
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // ARTICLE QUIZZES</div>
          </div>
          <a href="/" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2, transition: "color 150ms, border-color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            ← BACK TO HUB
          </a>
        </header>

        <div style={{ animation: "fadeIn 600ms ease-out", marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; CATEGORY_03</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
            <span style={{ color: COLORS.red }}>Article</span> quizzes
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", maxWidth: 640 }}>
            Each quiz pairs with a single Decoded Security article. Read the article, then test whether it stuck. Wrong answers route you back to the section you missed.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 64 }}>
          <a href="/article/three-states-of-data" onClick={() => handlePick("article_three_states_of_data")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>ARTICLE_QUIZ_01</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>CC · CISSP D2 · Security+</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
              The <span style={{ color: COLORS.red }}>Three States</span> of Data
            </h2>
            <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
              Data at rest, in transit, in use — and the controls that protect each. Test whether the article stuck.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
              08 QUESTIONS · ~5 MIN · INSTANT FEEDBACK
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              START QUIZ →
            </div>
          </a>

          <a href="/article/recovery-metrics" onClick={() => handlePick("article_recovery_metrics")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>ARTICLE_QUIZ_02</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>CC · CISSP D7 · Security+</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
              <span style={{ color: COLORS.red }}>Recovery Metrics</span><br />
              RTO · RPO · MTD · WRT
            </h2>
            <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
              The backup metrics that separate beginners from professionals. Math traps the exam loves.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
              10 QUESTIONS · ~6 MIN · INSTANT FEEDBACK
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              START QUIZ →
            </div>
          </a>
        </div>

        <footer style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // ARTICLE QUIZZES</div>
          <div>ONE QUIZ PER ARTICLE</div>
        </footer>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
