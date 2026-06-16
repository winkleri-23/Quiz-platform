import { useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — DIAGNOSTIC HUB
// Landing page organized by goal. Each section groups related tools.
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
        {/* HEADER */}
        <header style={{ marginBottom: 48, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
          <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // DIAGNOSTIC HUB</div>
        </header>

        {/* HERO */}
        <div style={{ animation: "fadeIn 600ms ease-out", marginBottom: 56 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 20 }}>
            &gt; WHAT ARE YOU TRYING TO DO?
          </div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 20, letterSpacing: -1 }}>
            Find your path in<br />
            <span style={{ color: COLORS.red }}>cybersecurity.</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "#cccccc", maxWidth: 640 }}>
            Free diagnostic tools, organized by what you're trying to figure out. Pick the section that matches your goal.
          </p>
        </div>

        {/* SECTION 1: FIND YOUR DIRECTION */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3 }}>
              &gt; FIND YOUR DIRECTION
            </div>
            <div style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
          </div>
          <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 20, lineHeight: 1.5 }}>
            Diagnostic quizzes that route you to where you should focus — based on your goals and your background.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {/* QUIZ 1 */}
            <a href="#/path" onClick={() => handlePick("path")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>QUIZ_01</div>
              <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>
                Still figuring out cyber
              </div>
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

            {/* QUIZ 2 */}
            <a href="#/direction" onClick={() => handlePick("direction")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>QUIZ_02</div>
              <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>
                Committed, picking a lane
              </div>
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
        </section>

        {/* SECTION 2: TEST YOUR KNOWLEDGE — CISSP */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3 }}>
              &gt; TEST YOUR KNOWLEDGE // CISSP
            </div>
            <div style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
          </div>
          <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 20, lineHeight: 1.5 }}>
            Knowledge quizzes that test what you actually know, one CISSP domain at a time. Each wrong answer routes you to the article that covers it.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {/* CISSP D1 */}
            <a href="#/cissp/domain-1" onClick={() => handlePick("cissp_domain_1")} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>CISSP_D01</div>
              <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>
                Foundational concepts
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
                <span style={{ color: COLORS.red }}>Domain 1</span><br />
                Security & Risk Management
              </h2>
              <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
                CIA Triad, risk treatment, governance, control types, legal frameworks. Eight questions with instant feedback.
              </p>
              <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
                08 QUESTIONS · ~5 MIN · INSTANT FEEDBACK · ARTICLE LINKS
              </div>
              <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
                START QUIZ →
              </div>
            </a>

            {/* COMING SOON CARD */}
            <div style={{ ...cardBase, cursor: "default", opacity: 0.55 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 10 }}>CISSP_D02 — D08</div>
              <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>
                Coming soon
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, marginBottom: 12, letterSpacing: -0.5, color: "#aaa" }}>
                Domains 2 through 8
              </h2>
              <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.55, marginBottom: 14 }}>
                Asset Security · Security Architecture · Communication Security · IAM · Assessment · Operations · Software Development Security
              </p>
              <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
                SAME FORMAT · ONE DOMAIN AT A TIME
              </div>
              <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.muted, border: `1px solid ${COLORS.border}`, padding: "12px 20px" }}>
                SUBSCRIBE FOR LAUNCH →
              </div>
            </div>
          </div>
        </section>

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
            The Direction Quiz maps directly to the five paths in this piece.
          </div>
        </a>

        {/* FOOTER */}
        <footer style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // DIAGNOSTIC_HUB_v3</div>
          <div>BUILT FOR PEOPLE WHO WANT DIRECTION</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
