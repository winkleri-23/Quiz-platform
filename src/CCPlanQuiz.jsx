import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics/react";
import { PLAN_QUIZZES, DISCORD_URL } from "./ccPlanQuizzes.js";

// =============================================================================
// DECODED SECURITY: 30-DAY CC PLAN QUIZ (buyer-only, unlisted)
// Reached only through links inside the paid plan. Never linked from any
// page, excluded from search engines (meta robots + X-Robots-Tag header).
//   mode "practice": feedback after every question (daily quizzes)
//   mode "exam":     no feedback until the end, 80% target (domain quizzes)
//   mode "mock":     exam mode + 2-hour timer + scores by domain (mock exams)
// =============================================================================

const COLORS = { red: "#e64833", green: "#3ab676", amber: "#e6a833", black: "#000000", white: "#FFFFFF", border: "#2a2a2a", muted: "#888888" };
const BASE_URL = "https://www.decodedsecurity.com/p/";
const DOMAINS = {
  1: { name: "Security Principles", weight: 24 },
  2: { name: "Security Governance", weight: 17.3 },
  3: { name: "Identity and Access Management", weight: 20 },
  4: { name: "Networking and Cloud Security", weight: 21.3 },
  5: { name: "Security Operations and Incident Response", weight: 17.3 },
};

function shuffleQuestion(q) {
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...q, options: order.map((i) => q.options[i]), correct: order.indexOf(q.correct) };
}

function fmtTime(sec) {
  const s = Math.max(0, sec);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

// The encouragement the buyer sees after every attempt, by mode and score.
function verdict(mode, pct, target) {
  if (mode === "practice") {
    if (pct === 100) return { color: COLORS.green, head: "Perfect score.", body: "You know this topic cold. Don't skip tomorrow because today felt easy: the exam rewards steady coverage of all five domains, not one strong day." };
    if (pct >= 80) return { color: COLORS.green, head: "Strong work.", body: "You've got this topic. Turn the miss below into a flashcard tonight, and it stops being a miss." };
    if (pct >= 60) return { color: COLORS.amber, head: "Good start, with gaps to close.", body: "That's normal on a first pass. Read every explanation below, reread today's core section once, and retake this quiz tomorrow before the next lesson. The second attempt is where it sticks." };
    return { color: COLORS.red, head: "This is exactly why we test.", body: "A low score today costs you nothing. A low score on exam day costs $199. Reread today's core section, go through every explanation below, and retake the quiz tomorrow. You're not behind. You found the gap early, which is the point." };
  }
  if (pct >= target) return { color: COLORS.green, head: mode === "mock" ? "You're ready." : "Checkpoint passed.", body: mode === "mock"
    ? "80% or higher on a full 125-question exam is the signal you've been working toward. Log it and protect your routine until exam day. Don't start cramming new material now."
    : "You hit the 80% target for this domain. Log it, post it in Discord, and keep the streak going. Consistency is what gets people through the CC on the first try." };
  if (pct >= 70) return { color: COLORS.amber, head: "Close. Not there yet.", body: mode === "mock"
    ? "You're within reach. Do one more repair cycle (the Day 25 method) on your two weakest domains below, then retake. If your exam date allows, move it a few days rather than gamble."
    : "You're within a few questions of 80%. Do one short repair session on the topics below, then retake this quiz before you move on." };
  return { color: COLORS.red, head: mode === "mock" ? "Not ready yet, and that's fine." : "Time for a repair session.", body: mode === "mock"
    ? "Better to learn this now than in the test center. If you can, move your exam date, repeat Week 4, and post your domain scores in Discord so I can see where you're stuck."
    : "This is the plan working: better to find the gaps now than on exam day. Follow the repair step below, then come back and retake." };
}

export default function CCPlanQuiz({ quizId }) {
  const quiz = PLAN_QUIZZES[quizId];
  const mode = quiz?.mode || "practice";
  const isExam = mode !== "practice";
  const target = quiz?.target ?? 80;

  const [stage, setStage] = useState("welcome");
  const [questions, setQuestions] = useState(() => (quiz ? quiz.questions.map(shuffleQuestion) : []));
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState((quiz?.minutes || 0) * 60);
  const deadline = useRef(null);
  const answersRef = useRef([]);

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

  // Mock exam timer
  useEffect(() => {
    if (mode !== "mock" || stage !== "question") return;
    const id = setInterval(() => {
      const left = Math.round((deadline.current - Date.now()) / 1000);
      setSecondsLeft(left);
      if (left <= 0) {
        clearInterval(id);
        finish(answersRef.current, true);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [mode, stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const page = {
    minHeight: "100vh", backgroundColor: COLORS.black, color: COLORS.white, fontFamily: fontStack, padding: "24px 16px",
    backgroundImage: "radial-gradient(circle at 20% 0%, rgba(230, 72, 51, 0.08), transparent 50%), radial-gradient(circle at 80% 100%, rgba(230, 72, 51, 0.05), transparent 50%)",
  };
  const kicker = { fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 };
  const btn = { display: "inline-block", fontFamily: fontStack, fontSize: 14, fontWeight: 600, letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red, border: "none", textDecoration: "none", padding: "16px 28px", cursor: "pointer" };
  const box = { border: `1px solid ${COLORS.border}`, padding: 24, marginBottom: 20 };

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
  const day = quiz.day;

  function finish(finalAnswers, timedOut = false) {
    const padded = [...finalAnswers];
    while (padded.length < totalQ) padded.push(null);
    setAnswers(padded);
    const score = padded.filter((a, i) => a === questions[i].correct).length;
    track("quiz_completed", { quiz: trackId, score, total: totalQ, pct: Math.round((score / totalQ) * 100), timedOut });
    setStage("result");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  const start = () => {
    track("quiz_started", { quiz: trackId });
    setQuestions(quiz.questions.map(shuffleQuestion));
    setStage("question"); setCurrentQ(0); setSelectedIdx(null); setLocked(false); setAnswers([]);
    answersRef.current = [];
    if (mode === "mock") { deadline.current = Date.now() + quiz.minutes * 60 * 1000; setSecondsLeft(quiz.minutes * 60); }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const choose = (idx) => {
    if (locked) return;
    setSelectedIdx(idx);
    if (!isExam) setLocked(true);
  };

  const next = () => {
    if (selectedIdx === null) return;
    const newAnswers = [...answers, selectedIdx];
    setAnswers(newAnswers);
    answersRef.current = newAnswers;
    if (currentQ + 1 < totalQ) {
      setCurrentQ(currentQ + 1); setSelectedIdx(null); setLocked(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    } else {
      finish(newAnswers);
    }
  };

  const score = answers.filter((a, i) => a === questions[i]?.correct).length;
  const pct = totalQ ? Math.round((score / totalQ) * 100) : 0;
  const missed = answers.map((a, i) => ({ i, picked: a, q: questions[i] })).filter((m) => m.q && m.picked !== m.q.correct);
  const v = verdict(mode, pct, target);
  const byDomain = mode === "mock"
    ? [1, 2, 3, 4, 5].map((d) => {
        const idx = questions.map((qq, i) => (qq.domain === d ? i : -1)).filter((i) => i >= 0);
        const right = idx.filter((i) => answers[i] === questions[i].correct).length;
        return { d, right, total: idx.length, pct: idx.length ? Math.round((right / idx.length) * 100) : 0 };
      })
    : [];
  const weakest = [...byDomain].sort((a, b) => a.pct - b.pct).slice(0, 2);

  const DayBar = () => day ? (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 6 }}>
        <span>DAY {day} OF 30</span><span>{Math.round((day / 30) * 100)}% OF THE PLAN</span>
      </div>
      <div style={{ height: 4, backgroundColor: COLORS.border }}>
        <div style={{ height: "100%", width: `${(day / 30) * 100}%`, backgroundColor: COLORS.red }} />
      </div>
    </div>
  ) : null;

  return (
    <div style={page}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <header style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // CC_30_DAY_PLAN</div>
          </div>
          {stage === "question" && (
            <div style={{ fontSize: 11, color: mode === "mock" && secondsLeft < 600 ? COLORS.red : COLORS.muted, letterSpacing: 1.5 }}>
              {mode === "mock" && <span style={{ marginRight: 14 }}>⏱ {fmtTime(secondsLeft)}</span>}
              {String(currentQ + 1).padStart(2, "0")} / {String(totalQ).padStart(2, "0")}
            </div>
          )}
        </header>

        {stage === "question" && (
          <div style={{ height: 2, backgroundColor: COLORS.border, marginBottom: 48, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(currentQ / totalQ) * 100}%`, backgroundColor: COLORS.red, transition: "width 400ms ease-out" }} />
          </div>
        )}

        {/* ======================= WELCOME ======================= */}
        {stage === "welcome" && (
          <div style={{ animation: "fadeIn 600ms ease-out" }}>
            <DayBar />
            <div style={kicker}>&gt; ISC2 CC {quiz.domain ? `// DOMAIN ${quiz.domain}` : "// ALL 5 DOMAINS"}{mode === "exam" ? " // CHECKPOINT" : mode === "mock" ? " // FULL MOCK EXAM" : ""}</div>
            <h1 style={{ fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 18, letterSpacing: -1 }}>{quiz.title}</h1>

            {mode === "practice" && (
              <p style={{ fontSize: 16, lineHeight: 1.65, color: "#cccccc", marginBottom: 24, maxWidth: 620 }}>
                You've read today's lesson. Now let's find out what actually stuck. {totalQ} questions, about 5 minutes. After each answer you'll see why it's right or wrong, so even a wrong answer teaches you something.
              </p>
            )}
            {mode === "exam" && (
              <p style={{ fontSize: 16, lineHeight: 1.65, color: "#cccccc", marginBottom: 24, maxWidth: 620 }}>
                This is a checkpoint, not a lesson. {totalQ} questions in exam conditions: no feedback until the end, no going back, no notes. It tells you honestly whether this domain is ready, or whether it needs one more pass before you move on. Target: {target}%.
              </p>
            )}
            {mode === "mock" && (
              <p style={{ fontSize: 16, lineHeight: 1.65, color: "#cccccc", marginBottom: 24, maxWidth: 620 }}>
                This is the closest thing to exam day you'll get before exam day. {totalQ} questions, {quiz.minutes / 60} hours, weighted across the five domains like the real exam. The clock starts when you press start and doesn't pause. Target: {target}%.
              </p>
            )}

            <div style={{ ...box, maxWidth: 620 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 10 }}>BEFORE YOU START</div>
              <ul style={{ fontSize: 14, color: "#dddddd", lineHeight: 1.8, paddingLeft: 18, margin: 0 }}>
                {mode === "practice" && <><li>Close your notes. Looking things up turns a test into reading.</li><li>Go with your first reasoned answer, not a gut guess.</li><li>Write your score in the score log when you finish.</li></>}
                {mode === "exam" && <><li>Close your notes and put your phone away.</li><li>Read every question twice and find the qualifier: BEST, FIRST, MOST.</li><li>Answer, lock it in, move on. The real exam won't let you go back either.</li></>}
                {mode === "mock" && <><li>Block {quiz.minutes / 60} quiet hours. One sitting, no notes, phone in another room.</li><li>Pace yourself at about one minute per question.</li><li>If time runs out, unanswered questions count as wrong, just like the real exam.</li><li>You'll get a score for each domain at the end. That's your repair list.</li></>}
              </ul>
            </div>

            <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6, marginBottom: 28, maxWidth: 620, fontStyle: "italic" }}>
              {mode === "practice"
                ? "Every day you show up for 30 minutes, you're doing what most CC candidates don't: studying in order, and testing yourself honestly. That's how first-try passes happen."
                : "Whatever your score, this is useful. A gap found today is a gap you close before exam day."}
            </p>

            <button onClick={start} style={{ ...btn, fontSize: 15, padding: "18px 36px" }}>{mode === "mock" ? "START THE CLOCK →" : "START →"}</button>
          </div>
        )}

        {/* ======================= QUESTION ======================= */}
        {stage === "question" && q && (
          <div key={currentQ} style={{ animation: "fadeIn 300ms ease-out" }}>
            <div style={kicker}>QUESTION_{String(currentQ + 1).padStart(2, "0")}{mode === "mock" && q.domain ? ` · D${q.domain}` : ""}</div>
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
                  {selectedIdx === q.correct ? "CORRECT ✓" : "NOT QUITE. HERE'S WHY:"}
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
              {currentQ + 1 < totalQ ? (isExam ? "LOCK IN, NEXT →" : "NEXT QUESTION →") : "SEE MY RESULT →"}
            </button>
          </div>
        )}

        {/* ======================= RESULT ======================= */}
        {stage === "result" && (
          <div style={{ animation: "fadeIn 700ms ease-out" }}>
            <DayBar />
            <div style={kicker}>&gt; {mode === "practice" ? `DAY ${day} QUIZ COMPLETE` : mode === "exam" ? "CHECKPOINT COMPLETE" : "MOCK EXAM COMPLETE"}</div>
            <h1 style={{ fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 8, letterSpacing: -2 }}>
              <span style={{ color: v.color }}>{pct}%</span>
              <span style={{ color: COLORS.muted, fontSize: "0.4em", marginLeft: 12 }}>{score} / {totalQ}</span>
            </h1>
            {isExam && (
              <div style={{ display: "inline-block", fontSize: 11, letterSpacing: 2, color: pct >= target ? COLORS.green : COLORS.amber, border: `1px solid ${pct >= target ? COLORS.green : COLORS.amber}`, padding: "4px 10px", marginBottom: 8 }}>
                {pct >= target ? `TARGET MET (${target}%)` : `TARGET: ${target}%`}
              </div>
            )}

            {/* Encouragement */}
            <div style={{ borderLeft: `3px solid ${v.color}`, paddingLeft: 18, margin: "24px 0 32px" }}>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, lineHeight: 1.25 }}>{v.head}</div>
              <p style={{ fontSize: 15, color: "#cccccc", lineHeight: 1.65, margin: 0 }}>{v.body}</p>
              <p style={{ fontSize: 13, color: COLORS.muted, margin: "10px 0 0" }}>Erich</p>
            </div>

            {/* Domain breakdown for mocks */}
            {mode === "mock" && (
              <div style={{ marginBottom: 32 }}>
                <div style={kicker}>&gt; SCORE BY DOMAIN</div>
                {byDomain.map((b) => {
                  const c = b.pct >= 80 ? COLORS.green : b.pct >= 70 ? COLORS.amber : COLORS.red;
                  return (
                    <div key={b.d} style={{ padding: "12px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6, fontSize: 14 }}>
                        <span><span style={{ color: COLORS.muted, marginRight: 8 }}>D{b.d}</span>{DOMAINS[b.d].name}</span>
                        <span style={{ color: c, fontWeight: 600, whiteSpace: "nowrap" }}>{b.pct}% · {b.right}/{b.total}</span>
                      </div>
                      <div style={{ height: 6, backgroundColor: COLORS.border }}><div style={{ height: "100%", width: `${Math.max(b.pct, 2)}%`, backgroundColor: c }} /></div>
                    </div>
                  );
                })}
                <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.6, marginTop: 14 }}>
                  Your repair list: <strong style={{ color: COLORS.white }}>{weakest.map((w) => DOMAINS[w.d].name).join(" and ")}</strong>.
                </p>
              </div>
            )}

            {/* Next steps / CTAs */}
            <div style={box}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 12 }}>DO THIS NOW</div>
              <ol style={{ fontSize: 14, color: "#dddddd", lineHeight: 1.85, paddingLeft: 20, margin: "0 0 18px" }}>
                <li>Write <strong>{pct}%</strong> in the score log of your plan{mode === "mock" ? ", with your five domain scores" : ""}.</li>
                {missed.length > 0 && <li>Turn {missed.length === 1 ? "the miss" : `the ${missed.length} misses`} below into flashcards. Write the right answer and the reason in your own words.</li>}
                {isExam && pct < target && quiz.retry && <li>{quiz.retry}</li>}
                <li>
                  Post your score in the CC study channel on Discord{DISCORD_URL ? "" : " (the invite is in your welcome email)"}. One line is enough: the day, your score and one thing you learned. Saying it out loud keeps you accountable.
                </li>
                {quiz.next && <li>{quiz.next}</li>}
              </ol>
              {DISCORD_URL && (
                <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" onClick={() => track("cc_discord_clicked", { quiz: trackId })} style={btn}>POST IN DISCORD →</a>
              )}
            </div>

            {isExam && (
              <div style={{ ...box, borderColor: "#444" }}>
                <div style={{ fontSize: 11, color: COLORS.green, letterSpacing: 2, marginBottom: 8 }}>PASS-OR-PAID-BACK PROMISE</div>
                <p style={{ fontSize: 14, color: "#cccccc", lineHeight: 1.65, margin: 0 }}>
                  {mode === "mock"
                    ? "Scoring 80% or higher on both mock exams is one of the three conditions of your Pass-or-Paid-Back Promise. Log this score, so it counts if you ever need it."
                    : "Every checkpoint you log builds the record behind your Pass-or-Paid-Back Promise. Keep ticking the days and logging the scores."}
                </p>
              </div>
            )}

            {missed.length > 0 ? (
              <div style={{ margin: "36px 0 32px" }}>
                <div style={kicker}>&gt; WHAT YOU MISSED ({missed.length})</div>
                <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.5, marginBottom: 6 }}>Every miss, with the right answer and why. This is the most valuable part of the quiz.</p>
                {missed.map((m) => (
                  <div key={m.i} style={{ padding: "20px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                    {mode === "mock" && m.q.domain && <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 6 }}>D{m.q.domain} · {DOMAINS[m.q.domain].name.toUpperCase()}</div>}
                    <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, marginBottom: 10 }}>{m.q.q}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6 }}><span style={{ color: COLORS.red }}>✗ You:</span> <span style={{ color: "#bbbbbb" }}>{m.picked === null ? "Not answered (time ran out)" : m.q.options[m.picked]}</span></div>
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
              <p style={{ fontSize: 15, color: "#cccccc", lineHeight: 1.6, margin: "32px 0" }}>No misses to review. Enjoy that for a minute, then get some rest.</p>
            )}

            <button onClick={start} style={{ fontFamily: fontStack, fontSize: 12, color: COLORS.muted, backgroundColor: "transparent", border: "none", padding: "8px 0", cursor: "pointer", letterSpacing: 1.5 }}>
              ↻ RETAKE (ANSWER ORDER IS SHUFFLED)
            </button>
          </div>
        )}

        <footer style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // 30-DAY CC FIRST-TRY PASS PLAN</div>
          <div>FOR PLAN MEMBERS · NOT AFFILIATED WITH ISC2</div>
        </footer>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
