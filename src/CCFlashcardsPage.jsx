import { useEffect } from "react";
import { track } from "@vercel/analytics/react";
import Flashcards from "./Flashcards.jsx";
import { CC_CARDS, CC_CARD_CATEGORIES } from "./ccFlashcards.js";
import { DISCORD_URL, PLAN_URL } from "./ccPlanQuizzes.js";

// =============================================================================
// DECODED SECURITY: CC FLASHCARDS (unlisted, noindex)
//   free=false: /cc/<PLAN_TOKEN>/flashcards, all key terms of the 30-day plan
//   free=true:  /cc/week1/flashcards, the 25 Domain 1 terms of the Week 1 Kit
// Same cards as the printable flashcard PDFs, generated from the plan.
// =============================================================================

const COLORS = { red: "#e64833", black: "#000000", white: "#FFFFFF", border: "#2a2a2a", muted: "#888888" };

export default function CCFlashcardsPage({ free = false }) {
  const cards = free ? CC_CARDS.filter((c) => c.category === "d1") : CC_CARDS;
  const categories = free ? { d1: CC_CARD_CATEGORIES.d1 } : CC_CARD_CATEGORIES;
  const deckId = free ? "cc_week1" : "cc_plan";

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    track("cc_flashcards_opened", { deck: deckId });
    return () => { try { document.head.removeChild(link); document.head.removeChild(robots); } catch (e) {} };
  }, [deckId]);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const btn = { display: "inline-block", fontFamily: fontStack, fontSize: 13, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, padding: "12px 20px", textDecoration: "none", fontWeight: 600 };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.black, color: COLORS.white, fontFamily: fontStack, padding: "24px 16px",
      backgroundImage: `radial-gradient(circle at 20% 0%, rgba(230, 72, 51, 0.08), transparent 50%), radial-gradient(circle at 80% 100%, rgba(230, 72, 51, 0.05), transparent 50%)` }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <header style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
          <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // CC_FLASHCARDS</div>
        </header>

        <div style={{ animation: "fadeIn 500ms ease-out", marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>
            &gt; {free ? "CC WEEK 1 KIT · DOMAIN 1 DECK" : "30-DAY CC FIRST-TRY PASS PLAN · FULL DECK"}
          </div>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 18, letterSpacing: -1 }}>
            {cards.length} CC terms. <span style={{ color: COLORS.red }}>Flip until they're boring.</span>
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 12, maxWidth: 720 }}>
            {free
              ? "Every key term from Days 2 to 6 of your Week 1 Kit. The same cards as the printable pages in your PDF, on your phone."
              : "Every key term from every lesson in your plan, grouped by domain. The same cards as your printable flashcard PDF, on your phone."}
          </p>
          <p style={{ fontSize: 13, color: COLORS.muted, margin: 0, lineHeight: 1.55 }}>
            Say the answer out loud before you flip. Filter to today's domain, or to your weakest one. Shuffle once a domain feels easy.
          </p>
        </div>

        <Flashcards cards={cards} categories={categories} deckId={deckId} />

        <div style={{ marginTop: 40, border: `1px solid ${COLORS.border}`, padding: 22, backgroundColor: "rgba(255,255,255,0.02)" }}>
          {free ? (
            <>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 10 }}>WANT ALL 5 DOMAINS?</div>
              <p style={{ fontSize: 14, color: "#cccccc", lineHeight: 1.65, margin: "0 0 16px" }}>
                The full 30-Day CC First-Try Pass Plan comes with the complete deck: every key term from all 5 domains, here and as a printable PDF.
              </p>
              {PLAN_URL
                ? <a href={PLAN_URL} target="_blank" rel="noopener noreferrer" onClick={() => track("cc_plan_clicked", { from: "flashcards_week1" })} style={btn}>GET THE FULL PLAN →</a>
                : <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>The link is on the last page of your Week 1 Kit.</p>}
            </>
          ) : (
            <>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 10 }}>STUCK ON A TERM?</div>
              <p style={{ fontSize: 14, color: "#cccccc", lineHeight: 1.65, margin: "0 0 16px" }}>
                Each card belongs to a day in your plan. Reread that day's lesson, then ask in the CC study channel. Someone has had the same question.
              </p>
              {DISCORD_URL && <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" onClick={() => track("cc_discord_clicked", { from: "flashcards" })} style={btn}>OPEN DISCORD →</a>}
            </>
          )}
        </div>

        <footer style={{ marginTop: 60, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // {free ? "FREE CC WEEK 1 KIT" : "FOR PLAN MEMBERS"}</div>
          <div>NOT AFFILIATED WITH ISC2</div>
        </footer>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
