import { useEffect } from "react";
import { track } from "@vercel/analytics/react";
import { getDomain } from "./cisspDomains.js";

// =============================================================================
// DECODED SECURITY — CISSP DOMAIN TOPIC PAGE (generic)
// Given a domain number, renders:
//   - the domain's mixed quiz card (if the mixed quiz is ready)
//   - a card per article quiz mapped to that domain
// =============================================================================

const COLORS = {
  red: "#e64833",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

export default function CisspDomainTopics({ domainNumber }) {
  const domain = getDomain(domainNumber);

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
  const handlePick = (quiz) => track("chooser_quiz_picked", { quiz, from: `cissp_domain_${domainNumber}` });

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

  const hasAnything = domain.mixed || domain.articles.length > 0;

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
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>
              DECODED_SECURITY // CISSP // DOMAIN {String(domain.n).padStart(2, "0")}
            </div>
          </div>
          <a href="/cissp" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2, transition: "color 150ms, border-color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            ← ALL CISSP DOMAINS
          </a>
        </header>

        <div style={{ animation: "fadeIn 600ms ease-out", marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; CISSP // DOMAIN_{String(domain.n).padStart(2, "0")}</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
            {domain.title}
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", maxWidth: 640 }}>
            {domain.short}
          </p>
        </div>

        {!hasAnything && (
          <div
            style={{
              border: `1px solid ${COLORS.border}`,
              padding: 40,
              marginBottom: 64,
              textAlign: "center",
              color: COLORS.muted,
            }}
          >
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>COMING SOON</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.white, marginBottom: 8 }}>
              Domain {domain.n} content is on its way.
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.55, maxWidth: 480, margin: "0 auto" }}>
              Subscribe to be notified when the mixed quiz and article quizzes for this domain drop.
            </p>
          </div>
        )}

        {/* MIXED QUIZ SECTION */}
        {domain.mixed && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3 }}>
                &gt; MIXED QUIZ
              </div>
              <div style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
            </div>
            <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 20, lineHeight: 1.5 }}>
              A broad test on Domain {domain.n}. Questions drawn from every topic in the domain.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
              <a href={`/cissp/domain-${domain.n}/mixed`} onClick={() => handlePick(`cissp_domain_${domain.n}_mixed`)} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>CISSP_D{String(domain.n).padStart(2, "0")}_MIXED</div>
                <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Broad-domain test</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
                  <span style={{ color: COLORS.red }}>Domain {domain.n}</span> Mixed
                </h2>
                <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
                  Test yourself across the whole domain — {domain.short.toLowerCase()}.
                </p>
                <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
                  INSTANT FEEDBACK · ARTICLE LINKS
                </div>
                <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
                  START QUIZ →
                </div>
              </a>
            </div>
          </section>
        )}

        {/* ARTICLE QUIZZES SECTION */}
        {domain.articles.length > 0 && (
          <section style={{ marginBottom: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3 }}>
                &gt; ARTICLE QUIZZES
              </div>
              <div style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
            </div>
            <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 20, lineHeight: 1.5 }}>
              Topic-specific quizzes based on individual articles. Wrong answers route you back to the article.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
              {domain.articles.map((a, i) => (
                <a key={i} href={a.route} onClick={() => handlePick(`domain_${domain.n}_article_${i}`)} style={cardBase} onMouseEnter={cardHover} onMouseLeave={cardUnhover}>
                  <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>ARTICLE_QUIZ</div>
                  <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>{a.certs}</div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
                    <span style={{ color: COLORS.red }}>{a.title}</span>
                  </h2>
                  <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.55, marginBottom: 14 }}>
                    {a.blurb}
                  </p>
                  <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.2, lineHeight: 1.6, marginBottom: 18 }}>
                    {String(a.questions).padStart(2, "0")} QUESTIONS · INSTANT FEEDBACK
                  </div>
                  <div style={{ display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px" }}>
                    START QUIZ →
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* MISSING PIECES NOTE (if only one of mixed/articles present) */}
        {hasAnything && (!domain.mixed || domain.articles.length === 0) && (
          <div
            style={{
              padding: "18px 20px",
              border: `1px solid ${COLORS.border}`,
              fontSize: 13,
              color: COLORS.muted,
              lineHeight: 1.5,
              marginBottom: 40,
            }}
          >
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 4 }}>COMING SOON</div>
            {!domain.mixed && "The Domain " + domain.n + " mixed quiz is on the roadmap. "}
            {domain.articles.length === 0 && "More topic-specific article quizzes for this domain will land as new articles ship. "}
            Subscribe to be notified.
          </div>
        )}

        <footer style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // CISSP // D{String(domain.n).padStart(2, "0")}</div>
          <div>BUILT FOR CISSP CANDIDATES</div>
        </footer>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
