import { useEffect } from "react";
import { track } from "@vercel/analytics/react";
import { CISSP_DOMAINS, isDomainLive } from "./cisspDomains.js";

// =============================================================================
// DECODED SECURITY — CATEGORY PAGE: CISSP
// 8 domain cards + 1 all-domains mixed card.
// Domain cards route to per-domain topic pages (/cissp/domain-N).
// =============================================================================

const COLORS = {
  red: "#e64833",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

export default function CisspCategory() {
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
  const handlePick = (quiz) => track("chooser_quiz_picked", { quiz, from: "category_cissp" });

  const cardBase = {
    display: "block",
    border: `1px solid ${COLORS.border}`,
    padding: 20,
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
        <header style={{ marginBottom: 48, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // CISSP</div>
          </div>
          <a href="/" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2, transition: "color 150ms, border-color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            ← BACK TO HUB
          </a>
        </header>

        <div style={{ animation: "fadeIn 600ms ease-out", marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; CATEGORY_02</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
            Prepare for the <span style={{ color: COLORS.red }}>CISSP</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", maxWidth: 640 }}>
            Pick a domain to see the quizzes tied to its topics — or take the all-domains mixed quiz to simulate the real exam.
          </p>
        </div>

        {/* ALL DOMAINS MIXED CARD */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3 }}>
              &gt; EXAM SIMULATOR
            </div>
            <div style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
          </div>
          <div style={{ ...cardBase, cursor: "default", opacity: 0.55, padding: 24 }}>
            <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 10 }}>CISSP_ALL_MIXED</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Coming soon</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5, color: "#aaa" }}>
              All 8 domains mixed
            </h2>
            <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.55, marginBottom: 14 }}>
              Draws questions from every domain. Same experience as an exam readiness check — random, mixed, no warnings on topic.
            </p>
            <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.muted, border: `1px solid ${COLORS.border}`, padding: "12px 20px" }}>
              SUBSCRIBE FOR LAUNCH →
            </div>
          </div>
        </section>

        {/* THE 8 DOMAINS */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3 }}>
              &gt; THE 8 DOMAINS
            </div>
            <div style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
          </div>
          <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 20, lineHeight: 1.5 }}>
            Each domain page lists the mixed quiz and the topic-specific article quizzes available for it.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {CISSP_DOMAINS.map((d) => {
              const live = isDomainLive(d);
              const contentCount = (d.mixed ? 1 : 0) + d.articles.length;
              const contentLabel =
                !live ? "COMING SOON" :
                contentCount === 1 ? (d.mixed ? "MIXED QUIZ" : "1 ARTICLE QUIZ") :
                `${d.mixed ? "MIXED + " : ""}${d.articles.length} ARTICLE QUIZ${d.articles.length > 1 ? "ZES" : ""}`;

              const CardTag = live ? "a" : "div";
              const cardProps = live
                ? { href: `/cissp/domain-${d.n}`, onClick: () => handlePick(`cissp_domain_${d.n}`), onMouseEnter: cardHover, onMouseLeave: cardUnhover }
                : {};

              return (
                <CardTag key={d.n} {...cardProps} style={{ ...cardBase, cursor: live ? "pointer" : "default", opacity: live ? 1 : 0.55 }}>
                  <div style={{ fontSize: 11, color: live ? COLORS.red : COLORS.muted, letterSpacing: 3, marginBottom: 8 }}>
                    CISSP_D{String(d.n).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>
                    {contentLabel}
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2, marginBottom: 8, letterSpacing: -0.3, color: live ? COLORS.white : "#aaa" }}>
                    Domain {d.n}: {d.title}
                  </h2>
                  <p style={{ fontSize: 12, color: live ? "#bbbbbb" : COLORS.muted, lineHeight: 1.55, marginBottom: 14 }}>
                    {d.short}
                  </p>
                  <div style={{ display: "inline-block", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: live ? COLORS.white : COLORS.muted, backgroundColor: live ? COLORS.red : "transparent", border: live ? "none" : `1px solid ${COLORS.border}`, padding: "10px 16px" }}>
                    {live ? "OPEN DOMAIN →" : "COMING SOON"}
                  </div>
                </CardTag>
              );
            })}
          </div>
        </section>

        <footer style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // CISSP</div>
          <div>BUILT FOR CISSP CANDIDATES</div>
        </footer>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
