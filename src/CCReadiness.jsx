import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics/react";
import { CC_DOMAINS, CC_QUESTIONS } from "./ccReadinessQuestions.js";

// =============================================================================
// DECODED SECURITY: CC READINESS TEST (v1)
// 25 original questions on the ISC2 CC outline effective 2026-09-01.
// Exam-style: no feedback during the test, full review at the end.
//
// Two modes, same questions:
//   mode="public"  → /cc-readiness        Lead magnet. Results page offers the
//                                          free CC Week 1 Kit and the paid plan.
//   mode="buyer"   → /cc-readiness/start  Day 1 baseline inside the paid plan.
//                                          No offers. Score log + Discord + Day 2.
// =============================================================================

// ---- LAUNCH SETTINGS --------------------------------------------------------
// Leave a URL as null until the product is live. While null, the button
// falls back to the newsletter so nothing on the page is ever a dead link.
const WEEK1_KIT_URL = null; // $0 Gumroad product: CC Week 1 Kit
const PLAN_URL = null; // Gumroad: 30-Day CC First-Try Pass Plan
const PLAN_PRICE = "$27"; // founding price; change to $37 / $47 as it rises
const PLAN_FULL_PRICE = "$47";
const DISCORD_URL = "https://discord.gg/H4qhSTqd9p"; // CC study channel invite (buyer mode)
// -----------------------------------------------------------------------------

const COLORS = {
  red: "#e64833",
  green: "#3ab676",
  amber: "#e6a833",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

const BASE_URL = "https://www.decodedsecurity.com/p/";
const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";
const READY_PCT = 80;

// Shuffle answer order on every attempt so the correct letter carries no pattern.
function shuffleQuestion(q) {
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...q, options: order.map((i) => q.options[i]), correct: order.indexOf(q.correct) };
}

function band(pct) {
  if (pct >= READY_PCT) return { label: "ON TRACK", color: COLORS.green };
  if (pct >= 60) return { label: "CLOSE, WITH GAPS", color: COLORS.amber };
  return { label: "NOT READY YET", color: COLORS.red };
}

export default function CCReadiness({ mode = "public" }) {
  const isBuyer = mode === "buyer";
  const quizId = isBuyer ? "cc_readiness_buyer" : "cc_readiness";

  const [stage, setStage] = useState("welcome"); // welcome | question | result
  const [questions, setQuestions] = useState(() => CC_QUESTIONS.map(shuffleQuestion));
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [answers, setAnswers] = useState([]);

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
  const totalQ = questions.length;

  const start = () => {
    track("quiz_started", { quiz: quizId });
    setQuestions(CC_QUESTIONS.map(shuffleQuestion));
    setStage("question");
    setCurrentQ(0);
    setSelectedIdx(null);
    setAnswers([]);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const next = () => {
    if (selectedIdx === null) return;
    const newAnswers = [...answers, selectedIdx];
    setAnswers(newAnswers);
    if (currentQ + 1 < totalQ) {
      setCurrentQ(currentQ + 1);
      setSelectedIdx(null);
    } else {
      const score = newAnswers.filter((a, i) => a === questions[i].correct).length;
      track("quiz_completed", { quiz: quizId, score, total: totalQ, pct: Math.round((score / totalQ) * 100) });
      setStage("result");
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // ---- Results -----------------------------------------------------------------
  const results = useMemo(() => {
    if (stage !== "result") return null;
    const byDomain = CC_DOMAINS.map((d) => {
      const idxs = questions.map((q, i) => (q.domain === d.id ? i : -1)).filter((i) => i >= 0);
      const right = idxs.filter((i) => answers[i] === questions[i].correct).length;
      return { ...d, right, total: idxs.length, pct: Math.round((right / idxs.length) * 100) };
    });
    const score = byDomain.reduce((s, d) => s + d.right, 0);
    const pct = Math.round((score / totalQ) * 100);
    // Weakest = lowest %; ties go to the domain with more exam weight (costs more points).
    const weakest = [...byDomain].sort((a, b) => a.pct - b.pct || b.weight - a.weight)[0];
    const missed = questions
      .map((q, i) => ({ q, i, picked: answers[i] }))
      .filter((m) => m.picked !== m.q.correct);
    return { byDomain, score, pct, weakest, missed };
  }, [stage, answers, questions, totalQ]);

  useEffect(() => {
    if (results) track("cc_weakest_domain", { quiz: quizId, domain: results.weakest.short, pct: results.pct });
  }, [results, quizId]);

  // ---- Shared styles -----------------------------------------------------------
  const kicker = { fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 };
  const primaryBtn = {
    display: "inline-block",
    fontFamily: fontStack,
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: 1.5,
    color: COLORS.white,
    backgroundColor: COLORS.red,
    border: "none",
    textDecoration: "none",
    padding: "16px 28px",
    cursor: "pointer",
    transition: "transform 150ms, box-shadow 150ms",
  };
  const lift = (e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(230, 72, 51, 0.3)"; };
  const drop = (e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; };
  const box = { border: `1px solid ${COLORS.border}`, padding: 28, marginBottom: 24 };

  const progress = (currentQ / totalQ) * 100;
  const q = questions[currentQ];
  const domainOf = (id) => CC_DOMAINS.find((d) => d.id === id);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.black,
        color: COLORS.white,
        fontFamily: fontStack,
        padding: "24px 16px",
        backgroundImage: "radial-gradient(circle at 20% 0%, rgba(230, 72, 51, 0.08), transparent 50%), radial-gradient(circle at 80% 100%, rgba(230, 72, 51, 0.05), transparent 50%)",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* HEADER */}
        <header style={{ marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>
              DECODED_SECURITY // {isBuyer ? "CC_DAY_01_BASELINE" : "CC_READINESS"}
            </div>
          </div>
          {stage === "question" ? (
            <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5 }}>
              {String(currentQ + 1).padStart(2, "0")} / {String(totalQ).padStart(2, "0")} · {domainOf(q.domain).short}
            </div>
          ) : !isBuyer ? (
            <a href="/diagnostics" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2 }}>
              ← ALL DIAGNOSTICS
            </a>
          ) : null}
        </header>

        {stage === "question" && (
          <div style={{ height: 2, backgroundColor: COLORS.border, marginBottom: 48, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, backgroundColor: COLORS.red, transition: "width 400ms ease-out" }} />
          </div>
        )}

        {/* ============================== WELCOME ============================== */}
        {stage === "welcome" && (
          <div style={{ animation: "fadeIn 600ms ease-out" }}>
            <div style={kicker}>&gt; ISC2 CC // NEW 2026 OUTLINE</div>
            {isBuyer ? (
              <>
                <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 18, letterSpacing: -1 }}>
                  Day 1: take your <span style={{ color: COLORS.red }}>baseline</span>.
                </h1>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", marginBottom: 16, maxWidth: 600 }}>
                  Don't study first. This score isn't a grade. It's your starting line, and it tells you which week of the plan needs the most attention.
                </p>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "#bbbbbb", marginBottom: 36, maxWidth: 600 }}>
                  Already took the free Readiness Test before you joined? Use that score as your baseline and go straight to booking your exam.
                </p>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 18, letterSpacing: -1 }}>
                  Would you pass the CC <span style={{ color: COLORS.red }}>today</span>?
                </h1>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", marginBottom: 16, maxWidth: 600 }}>
                  25 questions across all 5 domains of the new ISC2 CC outline, weighted like the real exam. You get a score for every domain and the one most likely to fail you.
                </p>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "#bbbbbb", marginBottom: 36, maxWidth: 600 }}>
                  The CC now costs $199. Find your weak spot before you pay for the exam, not after.
                </p>
              </>
            )}

            <div style={{ display: "flex", gap: 32, marginBottom: 40, flexWrap: "wrap", fontSize: 13, color: COLORS.muted }}>
              <div><span style={{ color: COLORS.red }}>25</span> questions</div>
              <div><span style={{ color: COLORS.red }}>~10min</span></div>
              <div><span style={{ color: COLORS.red }}>5</span> domain scores</div>
              <div><span style={{ color: COLORS.red }}>Free</span>, no signup</div>
            </div>

            <div style={{ ...box, padding: "18px 20px", maxWidth: 600, fontSize: 13, color: "#bbbbbb", lineHeight: 1.6 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>EXAM RULES</div>
              Like the real exam, you won't see if you were right until the end, and you can't go back. Answer, then move on. Every answer is explained at the end.
            </div>

            <button onClick={start} style={{ ...primaryBtn, fontSize: 15, padding: "18px 36px" }} onMouseEnter={lift} onMouseLeave={drop}>
              {isBuyer ? "START MY BASELINE →" : "START THE TEST →"}
            </button>
          </div>
        )}

        {/* ============================== QUESTION ============================= */}
        {stage === "question" && (
          <div key={currentQ} style={{ animation: "fadeIn 300ms ease-out" }}>
            <div style={kicker}>
              QUESTION_{String(currentQ + 1).padStart(2, "0")} · {domainOf(q.domain).name.toUpperCase()}
            </div>
            <h2 style={{ fontSize: "clamp(20px, 3.2vw, 26px)", fontWeight: 600, lineHeight: 1.35, marginBottom: 28, letterSpacing: -0.3 }}>
              {q.q}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {q.options.map((opt, idx) => {
                const isSelected = selectedIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedIdx(idx)}
                    aria-pressed={isSelected}
                    style={{
                      fontFamily: fontStack,
                      fontSize: 15,
                      color: COLORS.white,
                      backgroundColor: isSelected ? "rgba(230, 72, 51, 0.12)" : "transparent",
                      border: `1px solid ${isSelected ? COLORS.red : COLORS.border}`,
                      padding: "16px 18px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 150ms ease-out",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ color: COLORS.red, fontSize: 12, fontWeight: 600, minWidth: 14 }}>{String.fromCharCode(65 + idx)}</span>
                    <span style={{ flex: 1 }}>{opt}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={next}
              disabled={selectedIdx === null}
              style={{ ...primaryBtn, opacity: selectedIdx === null ? 0.35 : 1, cursor: selectedIdx === null ? "not-allowed" : "pointer" }}
            >
              {currentQ + 1 < totalQ ? "LOCK IN, NEXT →" : "SEE MY RESULTS →"}
            </button>
          </div>
        )}

        {/* ============================== RESULT =============================== */}
        {stage === "result" && results && (
          <div style={{ animation: "fadeIn 700ms ease-out" }}>
            <div style={kicker}>&gt; {isBuyer ? "BASELINE LOGGED" : "TEST COMPLETE"}</div>

            {/* Score */}
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, marginBottom: 12 }}>{isBuyer ? "YOUR BASELINE:" : "YOUR SCORE:"}</div>
            <h1 style={{ fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 8, letterSpacing: -2 }}>
              <span style={{ color: COLORS.red }}>{results.pct}%</span>
              <span style={{ color: COLORS.muted, fontSize: "0.4em", marginLeft: 12 }}>{results.score} / {totalQ}</span>
            </h1>
            <div style={{ display: "inline-block", fontSize: 11, letterSpacing: 2, color: isBuyer ? COLORS.muted : band(results.pct).color, border: `1px solid ${isBuyer ? COLORS.border : band(results.pct).color}`, padding: "4px 10px", marginBottom: 20 }}>
              {isBuyer ? "DAY 1 · STARTING LINE" : band(results.pct).label}
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", marginBottom: 40, maxWidth: 600 }}>
              {isBuyer
                ? "Write this number in the score log on Day 1 of your plan. On Day 27 you'll take the second mock exam and see how far you've moved."
                : results.pct >= READY_PCT
                ? "Strong start. But 25 questions is a snapshot, and the real exam gives you up to 125. The question is whether you can hold this across every domain."
                : results.pct >= 60
                ? "You know more than you think, but there are gaps the real exam will find. The good news: they're specific, and specific gaps are fixable."
                : "Right now the exam would likely beat you. That's fine. You found out for free, not for $199. Here's exactly where the points are leaking."}
            </p>

            {/* Domain breakdown */}
            <div style={kicker}>&gt; SCORE BY DOMAIN</div>
            <div style={{ marginBottom: 32 }}>
              {results.byDomain.map((d) => {
                const isWeakest = d.id === results.weakest.id;
                return (
                  <div key={d.id} style={{ padding: "14px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
                        <span style={{ color: COLORS.muted, fontWeight: 400, marginRight: 8 }}>{d.short}</span>
                        {d.name}
                        {isWeakest && <span style={{ fontSize: 10, color: COLORS.red, letterSpacing: 1.5, marginLeft: 10 }}>WEAKEST</span>}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: band(d.pct).color, whiteSpace: "nowrap" }}>
                        {d.right}/{d.total}
                      </div>
                    </div>
                    <div style={{ height: 6, backgroundColor: COLORS.border }}>
                      <div style={{ height: "100%", width: `${Math.max(d.pct, 2)}%`, backgroundColor: band(d.pct).color, transition: "width 800ms ease-out" }} />
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 6 }}>{d.weight}% of the exam</div>
                  </div>
                );
              })}
            </div>

            {/* Weakest domain callout */}
            <div style={{ ...box, borderColor: COLORS.red, backgroundColor: "rgba(230, 72, 51, 0.05)" }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 10 }}>
                {isBuyer ? "YOUR FOCUS AREA" : "THE DOMAIN THAT WOULD FAIL YOU TODAY"}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, marginBottom: 10 }}>{results.weakest.name}</div>
              <p style={{ fontSize: 14, color: "#cccccc", lineHeight: 1.6, margin: 0 }}>
                {isBuyer
                  ? `You scored ${results.weakest.right}/${results.weakest.total} here. It's covered on ${results.weakest.days} of your plan. Give those days your full 45 minutes, and redo every quiz question you miss there.`
                  : `You scored ${results.weakest.right}/${results.weakest.total} here, and it's ${results.weakest.weight}% of the exam. The exam tests all five domains, so a gap this size costs points you can't win back somewhere else. Fix this one first.`}
              </p>
            </div>

            {/* ---------- PUBLIC MODE: the offer ---------- */}
            {!isBuyer && (
              <>
                {/* Free Week 1 Kit: email capture via Gumroad */}
                <div style={box}>
                  <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 12 }}>FREE · STEP 1</div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.25 }}>
                    Get Week 1 of the plan free.
                  </div>
                  <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 16, lineHeight: 1.6 }}>
                    The first 7 days of the 30-Day CC First-Try Pass Plan: one 30 to 45 minute task a day, plus the Domain 1 cheat sheet. Domain 1 is the biggest domain on the exam (24%), so this is where to start whatever your score.
                  </p>
                  <a
                    href={WEEK1_KIT_URL || SUBSCRIBE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("cc_week1_kit_clicked", { quiz: quizId, pct: results.pct, weakest: results.weakest.short, live: !!WEEK1_KIT_URL })}
                    style={primaryBtn}
                    onMouseEnter={lift}
                    onMouseLeave={drop}
                  >
                    {WEEK1_KIT_URL ? "SEND ME WEEK 1 →" : "GET NOTIFIED WHEN IT'S READY →"}
                  </a>
                </div>

                {/* Paid plan */}
                <div style={{ ...box, borderColor: "#444" }}>
                  <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>THE FULL PLAN</div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.25 }}>
                    The 30-Day CC First-Try Pass Plan
                  </div>
                  <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 14, lineHeight: 1.6 }}>
                    30 days, 30 to 45 minutes a day, built on the new September 2026 outline. Most free material still teaches the old one.
                  </p>
                  <ul style={{ fontSize: 14, color: "#dddddd", lineHeight: 1.8, paddingLeft: 18, margin: "0 0 18px" }}>
                    <li>A daily plan that fits around a full-time job</li>
                    <li>Domain quizzes and 2 full timed mock exams</li>
                    <li>The 6 rules for answering ISC2's BEST, FIRST and MOST questions</li>
                    <li>A CC study channel in Discord</li>
                  </ul>
                  <div style={{ fontSize: 14, color: COLORS.white, lineHeight: 1.6, marginBottom: 18, borderLeft: `2px solid ${COLORS.green}`, paddingLeft: 14 }}>
                    <strong>Pass or paid back.</strong>{" "}
                    <span style={{ color: "#bbbbbb" }}>Do the plan, score 80% on both mocks, sit the exam within 60 days, and if you don't pass, you get every dollar back.</span>
                  </div>
                  {PLAN_URL ? (
                    <a
                      href={PLAN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track("cc_plan_clicked", { quiz: quizId, pct: results.pct, weakest: results.weakest.short })}
                      style={primaryBtn}
                      onMouseEnter={lift}
                      onMouseLeave={drop}
                    >
                      GET THE PLAN · {PLAN_PRICE}
                      {PLAN_PRICE !== PLAN_FULL_PRICE && (
                        <span style={{ textDecoration: "line-through", opacity: 0.6, marginLeft: 8, fontWeight: 400 }}>{PLAN_FULL_PRICE}</span>
                      )}{" "}→
                    </a>
                  ) : (
                    <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1.5 }}>OPENING SOON · FOUNDING PRICE FOR THE FIRST 50</div>
                  )}
                </div>
              </>
            )}

            {/* ---------- BUYER MODE: next steps, no offers ---------- */}
            {isBuyer && (
              <div style={box}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 14 }}>&gt; FINISH DAY 1</div>
                <ol style={{ fontSize: 14, color: "#dddddd", lineHeight: 1.8, paddingLeft: 20, margin: "0 0 20px" }}>
                  <li>Write <strong>{results.pct}%</strong> and your weakest domain in the score log.</li>
                  <li>Book your exam for Day 30, if you haven't yet.</li>
                  <li>
                    Post your baseline in the CC study channel on Discord
                    {DISCORD_URL ? "" : " (the invite is in your welcome email)"}. One line is enough.
                  </li>
                  <li>Tomorrow: Day 2, the CIA triad.</li>
                </ol>
                {DISCORD_URL && (
                  <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" onClick={() => track("cc_discord_clicked", { quiz: quizId })} style={primaryBtn} onMouseEnter={lift} onMouseLeave={drop}>
                    POST IN DISCORD →
                  </a>
                )}
              </div>
            )}

            {/* Answer review */}
            {results.missed.length > 0 && (
              <div style={{ marginTop: 48, marginBottom: 32 }}>
                <div style={kicker}>&gt; WHAT YOU MISSED ({results.missed.length})</div>
                <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 8, lineHeight: 1.5 }}>
                  Every miss, with the right answer, why, and the article that covers it.
                </p>
                {results.missed.map((m) => (
                  <div key={m.i} style={{ padding: "22px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                    <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 8 }}>
                      QUESTION_{String(m.i + 1).padStart(2, "0")} · {domainOf(m.q.domain).short}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, marginBottom: 12 }}>{m.q.q}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 4 }}>
                      <span style={{ color: COLORS.red }}>✗ You:</span> <span style={{ color: "#bbbbbb" }}>{m.q.options[m.picked]}</span>
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
                      <span style={{ color: COLORS.green }}>✓ Answer:</span> <span style={{ color: COLORS.white }}>{m.q.options[m.q.correct]}</span>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "#cccccc", margin: "0 0 10px", borderLeft: `2px solid ${COLORS.border}`, paddingLeft: 14 }}>
                      {m.q.explanation}
                    </p>
                    {m.q.article && (
                      <a
                        href={`${BASE_URL}${m.q.article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track("revisit_article_clicked", { quiz: quizId, slug: m.q.article.slug })}
                        style={{ fontSize: 13, color: COLORS.red, textDecoration: "none" }}
                      >
                        Read: {m.q.article.title} ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Newsletter (public only, below the offers) */}
            {!isBuyer && (
              <div style={{ ...box, padding: "18px 20px", marginTop: 32 }}>
                <div style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.6, marginBottom: 12 }}>
                  Not ready to commit? Get one practical cybersecurity article a week, from someone who hires in security.
                </div>
                <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer" onClick={() => track("subscribe_clicked", { quiz: quizId })} style={{ fontSize: 13, color: COLORS.red, textDecoration: "none", letterSpacing: 1 }}>
                  SUBSCRIBE TO DECODED SECURITY ↗
                </a>
              </div>
            )}

            <button
              onClick={start}
              style={{ fontFamily: fontStack, fontSize: 12, color: COLORS.muted, backgroundColor: "transparent", border: "none", padding: "8px 0", cursor: "pointer", letterSpacing: 1.5, marginTop: 8 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; }}
            >
              ↻ RETAKE THE TEST
            </button>

            <p style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.6, marginTop: 24 }}>
              All questions are original and follow the ISC2 CC exam outline effective September 1, 2026. This is a 25-question snapshot, not a prediction of your exam score. Not affiliated with ISC2.
            </p>
          </div>
        )}

        {/* FOOTER */}
        <footer style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // CC_READINESS_v1</div>
          <div>BUILT FOR FIRST-TRY PASSES</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
