import { useEffect, useState } from "react";
import { track } from "@vercel/analytics/react";
import { PLAN_QUIZZES } from "./ccPlanQuizzes.js";

// =============================================================================
// DECODED SECURITY: 30-DAY CC PLAN QUIZ (buyer-only, unlisted)
// Reached only through links inside the paid plan. Never linked from any
// page, excluded from search engines (meta robots + X-Robots-Tag header).
//   mode "practice": feedback after every question (daily quizzes)
//   mode "exam":     no feedback until the end, target score (domain quizzes)
// =============================================================================

const COLORS = { red: "#e64833", green: "#3ab676", amber: "#e6a833", black: "#000000", white: "#FFFFFF", border: "#2a2a2a", muted: "#888888" };
const BASE_URL = "https://www.decodedsecurity.com/p/";

function shuffleQuestion(q) {
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...q, options: order.map((i) => q.options[i]), correct: order.indexOf(q.correct) };
}

export default function CCPlanQuiz({ quizId }) {
  const quiz = PLAN_QUIZZES[quizId];
  const isExam = quiz?.mode === "exam";
  const target = quiz?.target ?? 80;

  const [stage, setStage] = useState("welcome");
  const [questions, setQuestions] = useState(() => (quiz ? quiz.questions.map(shuffleQuestion) : []));
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    if (quiz) document.title = `${quiz.title} | Decoded Security`;
    return () => {
      try { document.head.removeChild(link); document.head.removeChild(robots); } catch (e) {}
    };
  }, [quiz]);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const page = {
    minHeight: "100vh", backgroundColor: COLORS.black, color: COLORS.white, fontFamily: fontStack, padding: "24px 16px",
    backgroundImage: "radial-gradient(circle at 20% 0%, rgba(230, 72, 51, 0.08), transparent 50%), radial-gradient(circle at 80% 100%, rgba(230, 72, 51, 0.05), transparent 50%)",
  };
  const kicker = { fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 };
  const btn = { display: "inline-block", fontFamily: fontStack, fontSize: 14, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, border: "none", textDecoration: "none", padding: "16px 28px", cursor: "pointer" };

  if (!quiz) {
    return (
      <div style={page}>
        <div style={{ maxWidth: 720, margin: "0 auto", paddingTop: 80 }}>
          <div style={kicker}>&gt; NOT FOUND</div>
          <p style={{ color: "#cccccc", lineHeight: 1.6 }}>This quiz link isn't valid. Open the quiz from the link in your plan.</p>
        </div>
      </div>
    );
  }

  const totalQ = questions.length;
  const q = questions[currentQ];
  const trackId = `ccplan_${quizId}`;

  const start = () => {
    track("quiz_started", { quiz: trackId });
    setQuestions(quiz.questions.map(shuffleQuestion));
    setStage("question"); setCurrentQ(0); setSelectedIdx(null); setLocked(false); setAnswers([]);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const choose = (idx) => {
    if (locked) return;
    setSelectedIdx(idx);
    if (!isExam) setLocked(true); // practice: answer is final and feedback shows
  };

  const next = () => {
    if (selectedIdx === null) return;
    const newAnswers = [...answers, selectedIdx];
    setAnswers(newAnswers);
    if (currentQ + 1 < totalQ) {
      setCurrentQ(currentQ + 1); setSelectedIdx(null); setLocked(false);
    } else {
      const score = newAnswers.filter((a, i) => a === questions[i].correct).length;
      track("quiz_completed", { quiz: trackId, score, total: totalQ, pct: Math.round((score / totalQ) * 100) });
      setStage("result");
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const score = answers.filter((a, i) => a === questions[i]?.correct).length;
  const pct = totalQ ? Math.round((score / totalQ) * 100) : 0;
  const missed = answers.map((a, i) => ({ i, picked: a, q: questions[i] })).filter((m) => m.picked !== m.q.correct);
  const passed = pct >= target;

  return (
    <div style={page}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <header style={{ marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // CC_30_DAY_PLAN</div>
          </div>
          {stage === "question" && (
            <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5 }}>
              {String(currentQ + 1).padStart(2, "0")} / {String(totalQ).padStart(2, "0")}
            </div>
          )}
        </header>

        {stage === "question" && (
          <div style={{ height: 2, backgroundColor: COLORS.border, marginBottom: 48, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(currentQ / totalQ) * 100}%`, backgroundColor: COLORS.red, transition: "width 400ms ease-out" }} />
          </div>
        )}

        {/* WELCOME */}
        {stage === "welcome" && (
          <div style={{ animation: "fadeIn 600ms ease-out" }}>
            <div style={kicker}>&gt; ISC2 CC // DOMAIN {quiz.domain}{isExam ? " // CHECKPOINT" : ""}</div>
            <h1 style={{ fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 18, letterSpacing: -1 }}>{quiz.title}</h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 32, maxWidth: 600 }}>
              {isExam
                ? `${totalQ} questions in exam conditions: no feedback until the end, no going back. Target: ${target}%. Every answer is explained when you finish.`
                : `${totalQ} questions. Don't look anything up first. After each answer you'll see why it's right or wrong. Wrong answers are the point: they show you what to review.`}
            </p>
            <button onClick={start} style={{ ...btn, fontSize: 15, padding: "18px 36px" }}>START →</button>
          </div>
        )}

        {/* QUESTION */}
        {stage === "question" && q && (
          <div key={currentQ} style={{ animation: "fadeIn 300ms ease-out" }}>
            <div style={kicker}>QUESTION_{String(currentQ + 1).padStart(2, "0")}</div>
            <h2 style={{ fontSize: "clamp(20px, 3.2vw, 26px)", fontWeight: 600, lineHeight: 1.35, marginBottom: 28, letterSpacing: -0.3 }}>{q.q}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {q.options.map((opt, idx) => {
                const isSel = selectedIdx === idx;
                const showFeedback = !isExam && locked;
                const isCorrect = idx === q.correct;
                let border = isSel ? COLORS.red : COLORS.border;
                let bg = isSel ? "rgba(230, 72, 51, 0.12)" : "transparent";
                if (showFeedback && isCorrect) { border = COLORS.green; bg = "rgba(58, 182, 118, 0.08)"; }
                return (
                  <button key={idx} onClick={() => choose(idx)} disabled={showFeedback} aria-pressed={isSel}
                    style={{ fontFamily: fontStack, fontSize: 15, color: COLORS.white, backgroundColor: bg, border: `1px solid ${border}`, padding: "16px 18px", textAlign: "left", cursor: showFeedback ? "default" : "pointer", display: "flex", alignItems: "center", gap: 14, lineHeight: 1.4 }}>
                    <span style={{ color: showFeedback && isCorrect ? COLORS.green : COLORS.red, fontSize: 12, fontWeight: 600, minWidth: 14 }}>{String.fromCharCode(65 + idx)}</span>
                    <span style={{ flex: 1 }}>{opt}</span>
                    {showFeedback && isCorrect && <span style={{ color: COLORS.green }}>✓</span>}
                    {showFeedback && isSel && !isCorrect && <span style={{ color: COLORS.red }}>✗</span>}
                  </button>
                );
              })}
            </div>

            {!isExam && locked && (
              <div style={{ animation: "fadeIn 300ms ease-out", borderLeft: `2px solid ${selectedIdx === q.correct ? COLORS.green : COLORS.red}`, paddingLeft: 18, marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: selectedIdx === q.correct ? COLORS.green : COLORS.red, letterSpacing: 2, marginBottom: 8 }}>
                  {selectedIdx === q.correct ? "CORRECT ✓" : "NOT QUITE"}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.55, color: "#dddddd", margin: "0 0 10px" }}>{q.explanation}</p>
                {q.article && (
                  <a href={`${BASE_URL}${q.article.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: COLORS.red, textDecoration: "none" }}>
                    Go deeper: {q.article.title} ↗
                  </a>
                )}
              </div>
            )}

            <button onClick={next} disabled={selectedIdx === null}
              style={{ ...btn, opacity: selectedIdx === null ? 0.35 : 1, cursor: selectedIdx === null ? "not-allowed" : "pointer" }}>
              {currentQ + 1 < totalQ ? (isExam ? "LOCK IN, NEXT →" : "NEXT QUESTION →") : "SEE MY SCORE →"}
            </button>
          </div>
        )}

        {/* RESULT */}
        {stage === "result" && (
          <div style={{ animation: "fadeIn 700ms ease-out" }}>
            <div style={kicker}>&gt; {isExam ? "CHECKPOINT COMPLETE" : "QUIZ COMPLETE"}</div>
            <h1 style={{ fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 8, letterSpacing: -2 }}>
              <span style={{ color: passed ? COLORS.green : COLORS.red }}>{pct}%</span>
              <span style={{ color: COLORS.muted, fontSize: "0.4em", marginLeft: 12 }}>{score} / {totalQ}</span>
            </h1>
            {isExam && (
              <div style={{ display: "inline-block", fontSize: 11, letterSpacing: 2, color: passed ? COLORS.green : COLORS.amber, border: `1px solid ${passed ? COLORS.green : COLORS.amber}`, padding: "4px 10px", marginBottom: 20 }}>
                {passed ? `TARGET MET (${target}%)` : `TARGET: ${target}%`}
              </div>
            )}
            <div style={{ border: `1px solid ${COLORS.border}`, padding: 24, margin: "16px 0 32px" }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 10 }}>NEXT STEP</div>
              <ol style={{ fontSize: 14, color: "#dddddd", lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
                <li>Write <strong>{pct}%</strong> in the score log of your plan.</li>
                {missed.length > 0 && <li>Turn every miss below into a flashcard.</li>}
                {isExam && !passed && quiz.retry && <li>{quiz.retry}</li>}
                {quiz.next && <li>{quiz.next}</li>}
              </ol>
            </div>

            {missed.length > 0 ? (
              <div style={{ marginBottom: 32 }}>
                <div style={kicker}>&gt; WHAT YOU MISSED ({missed.length})</div>
                {missed.map((m) => (
                  <div key={m.i} style={{ padding: "20px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                    <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, marginBottom: 10 }}>{m.q.q}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6 }}><span style={{ color: COLORS.red }}>✗ You:</span> <span style={{ color: "#bbbbbb" }}>{m.q.options[m.picked]}</span></div>
                    <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}><span style={{ color: COLORS.green }}>✓ Answer:</span> {m.q.options[m.q.correct]}</div>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "#cccccc", margin: "0 0 8px", borderLeft: `2px solid ${COLORS.border}`, paddingLeft: 14 }}>{m.q.explanation}</p>
                    {m.q.article && (
                      <a href={`${BASE_URL}${m.q.article.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: COLORS.red, textDecoration: "none" }}>
                        Go deeper: {m.q.article.title} ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 15, color: "#cccccc", lineHeight: 1.6, marginBottom: 32 }}>Perfect score. Move on with confidence.</p>
            )}

            <button onClick={start} style={{ fontFamily: fontStack, fontSize: 12, color: COLORS.muted, backgroundColor: "transparent", border: "none", padding: "8px 0", cursor: "pointer", letterSpacing: 1.5 }}>
              ↻ RETAKE (ANSWERS ARE SHUFFLED)
            </button>
          </div>
        )}

        <footer style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // 30-DAY CC FIRST-TRY PASS PLAN</div>
          <div>FOR PLAN MEMBERS</div>
        </footer>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
