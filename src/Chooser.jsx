import { useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — QUIZ CHOOSER
// Landing page. Lets the visitor pick between the two diagnostics.
// =============================================================================

const COLORS = {
  red: "#e64833",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

const SOURCE_ARTICLE_URL = "https://www.decodedsecurity.com/p/how-to-choose-the-right-cybersecurity";

export default function Chooser() {
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

  const handlePick = (quiz) => {
    track("chooser_quiz_picked", { quiz });
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
        {/* HEADER */}
        <header style={{ marginBottom: 48, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
          <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // DIAGNOSTIC</div>
        </header>

        {/* HERO */}
        <div style={{ animation: "fadeIn 600ms ease-out", marginBottom: 56 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 20 }}>
            &gt; PICK YOUR DIAGNOSTIC
          </div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 20, letterSpacing: -1 }}>
            Find your path in<br />
            <span style={{ color: COLORS.red }}>cybersecurity.</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "#cccccc", maxWidth: 640, marginBottom: 12 }}>
            Two diagnostics. They answer different questions. Pick the one that matches where you are right now.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: COLORS.muted, maxWidth: 640 }}>
            Not sure? Start with the study path quiz — it asks where you are first.
          </p>
        </div>

        {/* TWO QUIZ CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            marginBottom: 48,
          }}
        >
          {/* QUIZ 1: STUDY PATH */}
          <a
            href="#/path"
            onClick={() => handlePick("path")}
            style={{
              display: "block",
              border: `1px solid ${COLORS.border}`,
              padding: 28,
              textDecoration: "none",
              color: COLORS.white,
              transition: "all 200ms ease-out",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.red;
              e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.border;
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>
              QUIZ_01
            </div>
            <div style={{ fontSize: 13, color: COLORS.muted, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>
              Start here if you're still figuring out cyber
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.15, marginBottom: 14, letterSpacing: -0.5 }}>
              Find your<br />
              <span style={{ color: COLORS.red }}>study path</span>
            </h2>
            <p style={{ fontSize: 14, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 18 }}>
              For people exploring the field, switching careers in, or feeling stuck at their current level. Tells you where to focus your reading next.
            </p>
            <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 24 }}>
              ROUTES TO ONE OF:<br />
              FOUNDATION BUILDER · CAREER SWITCHER · CC CANDIDATE · CISSP CANDIDATE · GRC SPECIALIST · STUCK PROFESSIONAL
            </div>
            <div
              style={{
                display: "inline-block",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 1.5,
                color: COLORS.white,
                backgroundColor: COLORS.red,
                padding: "14px 24px",
              }}
            >
              TAKE THIS QUIZ →
            </div>
          </a>

          {/* QUIZ 2: DIRECTION */}
          <a
            href="#/direction"
            onClick={() => handlePick("direction")}
            style={{
              display: "block",
              border: `1px solid ${COLORS.border}`,
              padding: 28,
              textDecoration: "none",
              color: COLORS.white,
              transition: "all 200ms ease-out",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.red;
              e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.border;
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>
              QUIZ_02
            </div>
            <div style={{ fontSize: 13, color: COLORS.muted, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>
              Start here if you've committed to cyber
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.15, marginBottom: 14, letterSpacing: -0.5 }}>
              Find your<br />
              <span style={{ color: COLORS.red }}>direction</span>
            </h2>
            <p style={{ fontSize: 14, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 18 }}>
              For people who know cyber is for them and are picking between the five career lanes. Tells you which one fits.
            </p>
            <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 24 }}>
              ROUTES TO ONE OF:<br />
              OFFENSIVE OPERATOR · SOC DEFENDER · BUILDER · GRC TRANSLATOR · SECURITY LEADER
            </div>
            <div
              style={{
                display: "inline-block",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 1.5,
                color: COLORS.white,
                backgroundColor: COLORS.red,
                padding: "14px 24px",
              }}
            >
              TAKE THIS QUIZ →
            </div>
          </a>
        </div>

        {/* BASED ON THE ARTICLE */}
        <a
          href={SOURCE_ARTICLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("source_article_clicked", { from: "chooser" })}
          style={{
            display: "block",
            borderLeft: `2px solid ${COLORS.red}`,
            paddingLeft: 16,
            marginBottom: 48,
            maxWidth: 600,
            textDecoration: "none",
            color: COLORS.white,
            transition: "all 150ms ease-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.paddingLeft = "20px";
            e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.paddingLeft = "16px";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>
            BASED ON THE ARTICLE
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, color: COLORS.white }}>
            How to Choose the Right Cybersecurity Role <span style={{ color: COLORS.red }}>↗</span>
          </div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4, letterSpacing: 0.5 }}>
            Quiz 2 maps directly to the five paths in this piece. Read the full breakdown.
          </div>
        </a>

        {/* FOOTER */}
        <footer style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // DIAGNOSTIC_HUB</div>
          <div>BUILT FOR PEOPLE WHO WANT DIRECTION</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
