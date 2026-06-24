import { useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — CATEGORY PAGE: DIAGNOSTICS
// Study Path + Direction quizzes.
// =============================================================================

const COLORS = {
  red: "#e64833",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

export default function DiagnosticsCategory() {
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
  const handlePick = (quiz) => track("chooser_quiz_picked", { quiz, from: "category_diagnostics" });

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
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // DIAGNOSTICS</div>
          </div>
          <a href="/" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2, transition: "color 150ms, border-color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            ← BACK TO HUB
          </a>
        </header>

        <div style={{ animation: "fadeIn 600ms ease-out", marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; CATEGORY_01</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
            Find your <span style={{ color: COLORS.red }}>direction</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", maxWidth: 640 }}>
            Diagnostic quizzes that route you to where you should focus — based on your goals and your background. Pick the one that matches where you are.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 64 }}>
          <a href="/path" onClick={() => handlePick("path")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>QUIZ_01</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Still figuring out cyber</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
              Find your <span style={{ color: COLORS.red }}>study path</span>
            </h2>
            <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
              For people exploring the field, switching in, studying for CC or CISSP, or feeling stuck.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
              FOUNDATION BUILDER · CAREER SWITCHER · CC CANDIDATE · CISSP CANDIDATE · GRC SPECIALIST · STUCK PROFESSIONAL
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              TAKE THIS QUIZ →
            </div>
          </a>

          <a href="/direction" onClick={() => handlePick("direction")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>QUIZ_02</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Committed, picking a lane</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
              Find your <span style={{ color: COLORS.red }}>direction</span>
            </h2>
            <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
              For people who know cyber is for them and are choosing between the five career lanes.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
              OFFENSIVE OPERATOR · SOC DEFENDER · BUILDER · GRC TRANSLATOR · SECURITY LEADER
            </div>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
              TAKE THIS QUIZ →
            </div>
          </a>
        </div>

        <footer style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // DIAGNOSTICS</div>
          <div>BUILT FOR PEOPLE WHO WANT DIRECTION</div>
        </footer>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
