import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — GUEST QUIZ: AUTHENTICATED vs NON-AUTHENTICATED SCANS
// Guest content by DrawnToCyber. Questions and article both hers — this is
// the on-platform interactive companion, with prominent attribution and a
// direct link to her Substack.
// =============================================================================

const COLORS = {
  red: "#e64833",
  green: "#3ab676",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";

const GUEST = {
  author: "DrawnToCyber",
  authorProfile: "https://drawntocyber.substack.com/",
  articleTitle: "Authenticated vs Non-Authenticated Scans",
  articleSubtitle: "The difference between \"looking from outside\" and \"checking with the keys\"",
  articleUrl: "https://drawntocyber.substack.com/p/authenticated-vs-non-authenticated",
};

const QUIZ = {
  title: "Authenticated vs Non-Authenticated Scans",
  subtitle: "The difference between \"looking from outside\" and \"checking with the keys.\" Ten questions on scan depth, visibility, and when to use which.",
  certs: "SECURITY+  ·  CISSP  ·  VULNERABILITY MANAGEMENT",
  questions: [
    {
      q: "What is the main difference between authenticated and non-authenticated scans?",
      options: [
        "The number of vulnerabilities they find.",
        "The level of access and visibility they have.",
        "The type of operating system they scan.",
        "The time of day the scan runs.",
      ],
      correct: 1,
      explanation: "Not all scans can see the same things. Authenticated scans use credentials to gain deeper visibility into the system.",
    },
    {
      q: "Does a non-authenticated scan require login credentials?",
      options: [
        "Yes, always.",
        "Only for servers.",
        "Only when vulnerabilities are found.",
        "No.",
      ],
      correct: 3,
      explanation: "A non-authenticated scan does not use login credentials and checks the system from the outside.",
    },
    {
      q: "What does a non-authenticated scan help simulate?",
      options: [
        "What an administrator sees.",
        "What an external attacker would see.",
        "What installed software sees.",
        "What an internal user sees.",
      ],
      correct: 1,
      explanation: "Non-authenticated scans help show what is externally visible without logging into the system.",
    },
    {
      q: "Which of these is an authenticated scan more likely to detect?",
      options: [
        "Only exposed services.",
        "Only externally visible vulnerabilities.",
        "Missing patches and weak configurations.",
        "Nothing that a non-authenticated scan cannot detect.",
      ],
      correct: 2,
      explanation: "With valid credentials, authenticated scans can detect missing patches, weak configurations, and internal risks.",
    },
    {
      q: "In the article's building analogy, what does an authenticated scan give the security guard?",
      options: [
        "A map.",
        "A flashlight.",
        "A keycard.",
        "A security camera.",
      ],
      correct: 2,
      explanation: "The keycard represents valid credentials that allow the scanner to look inside the system.",
    },
    {
      q: "A server looks completely fine from the outside but is running outdated software on the inside. Which scan can surface this hidden gap?",
      options: [
        "Non-authenticated scan.",
        "Authenticated scan.",
        "Neither scan.",
        "Both always see the same information.",
      ],
      correct: 1,
      explanation: "Authenticated scans can reveal internal issues that may not be visible from the outside.",
    },
    {
      q: "Which statement best describes a non-authenticated scan?",
      options: [
        "Quick to set up, but limited in depth.",
        "Requires valid credentials.",
        "Checks the system from the inside out.",
        "Provides the deepest possible visibility.",
      ],
      correct: 0,
      explanation: "Non-authenticated scans are quick to set up because they do not require credentials, but they are limited in depth.",
    },
    {
      q: "What additional requirement comes with authenticated scanning?",
      options: [
        "The system must be publicly accessible.",
        "No preparation is required.",
        "Proper access management.",
        "External attacker access.",
      ],
      correct: 2,
      explanation: "Authenticated scans use valid credentials, so proper access management is required.",
    },
    {
      q: "Why do organizations use both authenticated and non-authenticated scans?",
      options: [
        "Because authenticated scans cannot find vulnerabilities.",
        "Because non-authenticated scans are always more accurate.",
        "Because the two scans always produce identical results.",
        "Because they provide different kinds of visibility.",
      ],
      correct: 3,
      explanation: "Non-authenticated scans show what attackers might discover, while authenticated scans provide deeper visibility into what defenders might be missing.",
    },
    {
      q: "What is the main lesson about vulnerability scanning?",
      options: [
        "Always use authenticated scanning instead of other scan types.",
        "The goal is to find as many vulnerabilities as possible.",
        "Understand what your tools can access and observe.",
        "External scanning is enough for most organizations.",
      ],
      correct: 2,
      explanation: "Scanning is not only about finding vulnerabilities. It is also about understanding what your tools can access and observe.",
    },
  ],
};

export default function GuestAuthScansQuiz() {
  const [stage, setStage] = useState("welcome");
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const totalQ = QUIZ.questions.length;

  const startQuiz = () => {
    track("quiz_started", { quiz: "guest_auth_scans" });
    setStage("question");
    setCurrentQ(0);
    setSelectedIdx(null);
    setAnswers([]);
  };

  const handleAnswer = (idx) => {
    if (selectedIdx !== null) return;
    const correct = QUIZ.questions[currentQ].correct;
    track("question_answered", {
      quiz: "guest_auth_scans",
      question: currentQ + 1,
      answer: idx,
      correct: idx === correct,
    });
    setSelectedIdx(idx);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selectedIdx];
    if (currentQ + 1 < totalQ) {
      setAnswers(newAnswers);
      setCurrentQ(currentQ + 1);
      setSelectedIdx(null);
    } else {
      setAnswers(newAnswers);
      const score = newAnswers.filter((a, i) => a === QUIZ.questions[i].correct).length;
      track("quiz_completed", { quiz: "guest_auth_scans", score, total: totalQ });
      setStage("result");
    }
  };

  const restart = () => {
    track("quiz_restarted", { quiz: "guest_auth_scans" });
    setStage("welcome");
    setCurrentQ(0);
    setSelectedIdx(null);
    setAnswers([]);
  };

  const progress = (currentQ / totalQ) * 100;
  const score = answers.filter((a, i) => a === QUIZ.questions[i].correct).length;
  const missed = answers.map((a, i) => ({ idx: i, correct: a === QUIZ.questions[i].correct })).filter((x) => !x.correct);

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
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <header style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // GUEST QUIZ</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <a href="/guest" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
            >
              ← GUEST MENU
            </a>
            {stage === "question" && (
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5 }}>
                {String(currentQ + 1).padStart(2, "0")} / {String(totalQ).padStart(2, "0")}
              </div>
            )}
          </div>
        </header>

        {/* Guest attribution banner — always visible */}
        <div style={{
          border: `1px solid ${COLORS.red}`, borderLeft: `2px solid ${COLORS.red}`,
          backgroundColor: "rgba(230, 72, 51, 0.05)",
          padding: "12px 16px", marginBottom: 32,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
        }}>
          <div>
            <div style={{ fontSize: 10, color: COLORS.red, letterSpacing: 2, marginBottom: 4 }}>GUEST CONTENT</div>
            <div style={{ fontSize: 13, color: COLORS.white }}>
              Original article and questions by <strong>{GUEST.author}</strong>.
            </div>
          </div>
          <a href={GUEST.authorProfile} target="_blank" rel="noopener noreferrer"
            onClick={() => track("guest_author_clicked", { quiz: "guest_auth_scans", location: "header" })}
            style={{
              fontSize: 11, letterSpacing: 1.5, color: COLORS.white,
              backgroundColor: COLORS.red, padding: "8px 14px",
              textDecoration: "none", fontWeight: 600,
            }}
          >
            FOLLOW ↗
          </a>
        </div>

        {stage === "question" && (
          <div style={{ height: 2, backgroundColor: COLORS.border, marginBottom: 40, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, backgroundColor: COLORS.red, transition: "width 400ms ease-out" }} />
          </div>
        )}

        {stage === "welcome" && (
          <div style={{ animation: "fadeIn 600ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 20 }}>&gt; GUEST QUIZ_01</div>
            <h1 style={{ fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.6 }}>{QUIZ.title}</h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 16, maxWidth: 600, fontStyle: "italic" }}>
              {GUEST.articleSubtitle}
            </p>
            <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 2, marginBottom: 32 }}>MAPS TO: {QUIZ.certs}</div>

            <a href={GUEST.articleUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => track("source_article_clicked", { quiz: "guest_auth_scans", from: "welcome" })}
              style={{
                display: "block", borderLeft: `2px solid ${COLORS.red}`, paddingLeft: 16,
                marginBottom: 40, maxWidth: 600, textDecoration: "none", color: COLORS.white,
                transition: "all 150ms ease-out",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "20px"; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "16px"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>READ {GUEST.author.toUpperCase()}'S ARTICLE FIRST</div>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>
                {GUEST.articleTitle}: {GUEST.articleSubtitle} <span style={{ color: COLORS.red }}>↗</span>
              </div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4, letterSpacing: 0.5 }}>
                Then come back and see if the depth-vs-visibility trap catches you.
              </div>
            </a>

            <div style={{ display: "flex", gap: 32, marginBottom: 40, flexWrap: "wrap", fontSize: 13, color: COLORS.muted }}>
              <div><span style={{ color: COLORS.red }}>{String(totalQ).padStart(2, "0")}</span> questions</div>
              <div><span style={{ color: COLORS.red }}>~5min</span> to complete</div>
              <div><span style={{ color: COLORS.red }}>Free</span></div>
            </div>

            <button onClick={startQuiz}
              style={{
                fontFamily: fontStack, fontSize: 15, fontWeight: 600, letterSpacing: 1.5,
                color: COLORS.white, backgroundColor: COLORS.red, border: "none",
                padding: "18px 36px", cursor: "pointer",
                transition: "transform 150ms, box-shadow 150ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(230, 72, 51, 0.3)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              START THE QUIZ →
            </button>
          </div>
        )}

        {stage === "question" && (
          <div key={currentQ} style={{ animation: "fadeIn 300ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>QUESTION_{String(currentQ + 1).padStart(2, "0")}</div>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 600, lineHeight: 1.3, marginBottom: 28, letterSpacing: -0.3 }}>{QUIZ.questions[currentQ].q}</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {QUIZ.questions[currentQ].options.map((opt, idx) => {
                const correctIdx = QUIZ.questions[currentQ].correct;
                const isAnswered = selectedIdx !== null;
                const isSelected = selectedIdx === idx;
                const isCorrect = idx === correctIdx;
                let borderColor = COLORS.border;
                let bgColor = "transparent";
                let letterColor = COLORS.red;
                if (isAnswered) {
                  if (isCorrect) { borderColor = COLORS.green; bgColor = "rgba(58, 182, 118, 0.08)"; letterColor = COLORS.green; }
                  else if (isSelected) { borderColor = COLORS.red; bgColor = "rgba(230, 72, 51, 0.08)"; }
                }
                return (
                  <button key={idx} onClick={() => handleAnswer(idx)} disabled={isAnswered}
                    style={{
                      fontFamily: fontStack, fontSize: 15, color: COLORS.white,
                      backgroundColor: bgColor, border: `1px solid ${borderColor}`,
                      padding: "16px 18px", textAlign: "left",
                      cursor: isAnswered ? "default" : "pointer",
                      transition: "all 150ms ease-out",
                      display: "flex", alignItems: "center", gap: 14, lineHeight: 1.4,
                    }}
                    onMouseEnter={(e) => { if (!isAnswered) { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.06)"; } }}
                    onMouseLeave={(e) => { if (!isAnswered) { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.backgroundColor = "transparent"; } }}
                  >
                    <span style={{ color: letterColor, fontSize: 12, fontWeight: 600, minWidth: 14 }}>{String.fromCharCode(65 + idx)}</span>
                    <span style={{ flex: 1 }}>{opt}</span>
                    {isAnswered && isCorrect && <span style={{ color: COLORS.green, fontSize: 16 }}>✓</span>}
                    {isAnswered && isSelected && !isCorrect && <span style={{ color: COLORS.red, fontSize: 16 }}>✗</span>}
                  </button>
                );
              })}
            </div>

            {selectedIdx !== null && (
              <div style={{ animation: "fadeIn 300ms ease-out" }}>
                <div style={{ borderLeft: `2px solid ${selectedIdx === QUIZ.questions[currentQ].correct ? COLORS.green : COLORS.red}`, paddingLeft: 18, marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: selectedIdx === QUIZ.questions[currentQ].correct ? COLORS.green : COLORS.red, letterSpacing: 2, marginBottom: 8 }}>
                    {selectedIdx === QUIZ.questions[currentQ].correct ? "CORRECT ✓" : "NOT QUITE"}
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.55, color: "#dddddd", margin: 0 }}>{QUIZ.questions[currentQ].explanation}</p>
                </div>

                <a href={GUEST.articleUrl} target="_blank" rel="noopener noreferrer"
                  onClick={() => track("article_clicked", { quiz: "guest_auth_scans", question: currentQ + 1 })}
                  style={{
                    display: "block", padding: "16px 18px", border: `1px solid ${COLORS.border}`,
                    textDecoration: "none", color: COLORS.white, marginBottom: 28,
                    transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 4 }}>READ {GUEST.author.toUpperCase()}'S ARTICLE</div>
                  <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{GUEST.articleTitle} <span style={{ color: COLORS.red }}>↗</span></div>
                </a>

                <button onClick={handleNext}
                  style={{
                    fontFamily: fontStack, fontSize: 14, fontWeight: 600, letterSpacing: 1.5,
                    color: COLORS.white, backgroundColor: COLORS.red, border: "none",
                    padding: "14px 28px", cursor: "pointer",
                    transition: "transform 150ms, box-shadow 150ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(230, 72, 51, 0.3)`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {currentQ + 1 < totalQ ? "NEXT QUESTION →" : "SEE MY SCORE →"}
                </button>
              </div>
            )}
          </div>
        )}

        {stage === "result" && (
          <div style={{ animation: "fadeIn 700ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; QUIZ COMPLETE</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, marginBottom: 12 }}>YOUR SCORE:</div>
            <h1 style={{ fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 8, letterSpacing: -2 }}>
              <span style={{ color: COLORS.red }}>{score}</span>
              <span style={{ color: COLORS.muted, fontSize: "0.55em", marginLeft: 8 }}>/ {totalQ}</span>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.55, color: "#cccccc", marginBottom: 36, maxWidth: 560 }}>
              {score === totalQ && "Perfect. You'd handle the scanning-depth questions cleanly in any interview or exam."}
              {score >= totalQ - 1 && score < totalQ && "Almost perfect. The one that slipped is worth re-reading before exam day."}
              {score >= totalQ * 0.7 && score < totalQ - 1 && "Solid. You've got the shape — patch the gaps below."}
              {score >= totalQ * 0.5 && score < totalQ * 0.7 && "Mixed. Depth-vs-visibility is where most people stumble. Re-read the article and retake."}
              {score < totalQ * 0.5 && "Worth reading DrawnToCyber's article end-to-end before trying again. Vulnerability scanning is a fundamental."}
            </p>

            {/* Follow the author — prominent */}
            <div style={{ border: `1px solid ${COLORS.red}`, backgroundColor: "rgba(230, 72, 51, 0.05)", padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>SUPPORT THE AUTHOR</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
                This quiz was contributed by {GUEST.author}.
              </div>
              <p style={{ fontSize: 13, color: "#cccccc", marginBottom: 16, lineHeight: 1.55 }}>
                If the material landed for you, follow her on Substack. Her writing on cybersecurity fundamentals is worth your inbox space.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href={GUEST.authorProfile} target="_blank" rel="noopener noreferrer"
                  onClick={() => track("guest_author_clicked", { quiz: "guest_auth_scans", location: "result" })}
                  style={{
                    display: "inline-block", fontFamily: fontStack, fontSize: 13, fontWeight: 600,
                    letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
                    textDecoration: "none", padding: "12px 22px",
                  }}
                >
                  FOLLOW {GUEST.author.toUpperCase()} ↗
                </a>
                <a href={GUEST.articleUrl} target="_blank" rel="noopener noreferrer"
                  onClick={() => track("revisit_article_clicked", { quiz: "guest_auth_scans" })}
                  style={{
                    display: "inline-block", fontFamily: fontStack, fontSize: 13, fontWeight: 600,
                    letterSpacing: 1.5, color: COLORS.white, backgroundColor: "transparent",
                    border: `1px solid ${COLORS.white}`,
                    textDecoration: "none", padding: "12px 22px",
                  }}
                >
                  READ THE ARTICLE ↗
                </a>
              </div>
            </div>

            {missed.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>&gt; REVISIT THE ARTICLE</div>
                <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12, lineHeight: 1.5 }}>
                  {missed.length === 1 ? "One question slipped" : `${missed.length} questions slipped`}. {GUEST.author}'s article covers each of these.
                </p>
              </div>
            )}

            <div style={{ border: `1px solid ${COLORS.border}`, padding: 24, marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 10 }}>DECODED SECURITY NEWSLETTER</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>Get a practical breakdown like this every week.</div>
              <p style={{ fontSize: 13, color: "#bbbbbb", marginBottom: 16, lineHeight: 1.5 }}>1,450+ readers preparing for CC, CISSP, and Security+.</p>
              <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer"
                onClick={() => track("subscribe_clicked", { quiz: "guest_auth_scans" })}
                style={{
                  display: "inline-block", fontFamily: fontStack, fontSize: 13, fontWeight: 600,
                  letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
                  textDecoration: "none", padding: "12px 22px",
                }}
              >
                SUBSCRIBE →
              </a>
            </div>

            <button onClick={restart}
              style={{
                fontFamily: fontStack, fontSize: 12, color: COLORS.muted,
                backgroundColor: "transparent", border: "none",
                padding: "8px 0", cursor: "pointer", letterSpacing: 1.5,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; }}
            >
              ↻ RESTART QUIZ
            </button>
          </div>
        )}

        <footer style={{ marginTop: 60, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // GUEST_QUIZ_v1</div>
          <div>QUIZ BY {GUEST.author.toUpperCase()}</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
