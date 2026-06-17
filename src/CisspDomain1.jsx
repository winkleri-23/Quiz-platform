import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — CISSP DOMAIN 1 KNOWLEDGE QUIZ
// Security and Risk Management. Tests fundamentals from Domain 1, gives
// instant feedback with article links so wrong answers turn into learning.
// =============================================================================

const COLORS = {
  red: "#e64833",
  green: "#3ab676",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

const BASE_URL = "https://www.decodedsecurity.com/p/";
const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";

const DOMAIN = {
  number: 1,
  title: "Security and Risk Management",
  subtitle: "Foundational concepts: CIA Triad, risk treatment, governance, control types, legal frameworks.",
  questions: [
    {
      q: "Which of the following best describes 'Integrity' in the CIA Triad?",
      options: [
        "Ensuring data is accessible to authorized users when needed.",
        "Ensuring data is not disclosed to unauthorized parties.",
        "Ensuring data is not modified or destroyed by unauthorized parties.",
        "Ensuring data is encrypted at rest and in transit.",
      ],
      correct: 2,
      explanation: "Integrity ensures data hasn't been altered without authorization. Availability covers accessibility (A). Confidentiality covers disclosure (B). Encryption (D) is a control that supports integrity and confidentiality — not the definition itself.",
      article: { title: "The 8 Security Principles Every CISSP Must Know", slug: "the-8-security-principles-every-cissp" },
    },
    {
      q: "A SQL injection flaw in a web application is best classified as a:",
      options: ["Threat", "Risk", "Vulnerability", "Asset"],
      correct: 2,
      explanation: "A vulnerability is a weakness in a system. The threat would be the attacker (or attacker group) who could exploit it. The risk is the combination of likelihood and impact. Confuse these three on the exam and you lose easy points.",
      article: { title: "Threat ≠ Risk ≠ Vulnerability", slug: "threat-risk-vulnerability-why-cissp" },
    },
    {
      q: "A company decides not to operate in a region because of regulatory complexity. Which risk treatment strategy is this?",
      options: ["Mitigation", "Acceptance", "Avoidance", "Transfer"],
      correct: 2,
      explanation: "Avoidance means eliminating the risk by not engaging in the risky activity. Mitigation reduces risk through controls; acceptance keeps the risk; transfer shifts it to another party (insurance, contract).",
      article: { title: "How Risk Management Frameworks Keep Systems Secure", slug: "how-risk-management-frameworks-keep" },
    },
    {
      q: "A data breach has SLE = $50,000 and ARO = 0.2. What is the Annualized Loss Expectancy (ALE)?",
      options: ["$5,000", "$10,000", "$25,000", "$50,000"],
      correct: 1,
      explanation: "ALE = SLE × ARO. So $50,000 × 0.2 = $10,000. Memorize this formula — it shows up in multiple Domain 1 questions on the exam.",
      article: { title: "Quantitative Risk Analysis: Let The Numbers Do All The Talking", slug: "quantitative-risk-analysis-let-the" },
    },
    {
      q: "Identifying that your company needs an incident response plan but not yet building one is an example of:",
      options: ["Due care", "Due diligence", "Acceptance", "Avoidance"],
      correct: 1,
      explanation: "Due diligence is identifying what needs to be done — research and awareness. Due care is actually doing the work to address it. The exam will pair them in tricky ways.",
      article: { title: "3 Things That Surprised Me About CISSP Domain 1", slug: "3-things-that-surprise-me-about-cissp" },
    },
    {
      q: "A document that mandates all passwords must be at least 12 characters is a:",
      options: ["Policy", "Standard", "Procedure", "Guideline"],
      correct: 1,
      explanation: "Standards specify mandatory technical requirements (e.g., minimum 12 chars). Policies state high-level intent. Procedures describe step-by-step actions. Guidelines are recommendations, not mandates.",
      article: { title: "Security Policies, Standards, and Procedures", slug: "security-policies-standards-and-procedures" },
    },
    {
      q: "Which law primarily protects health information in the United States?",
      options: ["GDPR", "SOX", "HIPAA", "GLBA"],
      correct: 2,
      explanation: "HIPAA — Health Insurance Portability and Accountability Act. GDPR is EU privacy; SOX is financial reporting; GLBA is financial privacy.",
      article: { title: "15 Laws Every CISSP Candidate Must Know", slug: "15-laws-every-cissp-candidate-must" },
    },
    {
      q: "A firewall is primarily what type of security control?",
      options: ["Preventive", "Detective", "Corrective", "Compensating"],
      correct: 0,
      explanation: "Firewalls prevent unauthorized access. Detective controls (IDS, logs) identify incidents in progress. Corrective controls remediate. Compensating controls substitute for required controls when those can't be implemented directly.",
      article: { title: "Cybersecurity Controls from Zero to Hero", slug: "cybersecurity-controls-from-zero" },
    },
  ],
};

export default function CisspDomain1() {
  const [stage, setStage] = useState("welcome"); // welcome | question | result
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [answers, setAnswers] = useState([]); // array of selected indices

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
  const totalQ = DOMAIN.questions.length;

  const startQuiz = () => {
    track("quiz_started", { quiz: "cissp_domain_1" });
    setStage("question");
    setCurrentQ(0);
    setSelectedIdx(null);
    setAnswers([]);
  };

  const handleAnswer = (idx) => {
    if (selectedIdx !== null) return; // already answered this question
    const correct = DOMAIN.questions[currentQ].correct;
    track("question_answered", {
      quiz: "cissp_domain_1",
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
      const score = newAnswers.filter((a, i) => a === DOMAIN.questions[i].correct).length;
      track("quiz_completed", { quiz: "cissp_domain_1", score, total: totalQ });
      setStage("result");
    }
  };

  const restart = () => {
    track("quiz_restarted", { quiz: "cissp_domain_1" });
    setStage("welcome");
    setCurrentQ(0);
    setSelectedIdx(null);
    setAnswers([]);
  };

  const progress = (currentQ / totalQ) * 100;

  // Result calculation
  const score = answers.filter((a, i) => a === DOMAIN.questions[i].correct).length;
  const missed = answers.map((a, i) => ({ idx: i, correct: a === DOMAIN.questions[i].correct, q: DOMAIN.questions[i] })).filter((x) => !x.correct);

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
        {/* HEADER */}
        <header style={{ marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // CISSP D{DOMAIN.number}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <a
              href="/"
              style={{
                fontSize: 11,
                letterSpacing: 1.5,
                color: COLORS.muted,
                textDecoration: "none",
                borderBottom: `1px solid ${COLORS.border}`,
                paddingBottom: 2,
                transition: "color 150ms, border-color 150ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
            >
              ← QUIZ MENU
            </a>
            {stage === "question" && (
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5 }}>
                {String(currentQ + 1).padStart(2, "0")} / {String(totalQ).padStart(2, "0")}
              </div>
            )}
          </div>
        </header>

        {/* PROGRESS BAR */}
        {stage === "question" && (
          <div style={{ height: 2, backgroundColor: COLORS.border, marginBottom: 48, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, backgroundColor: COLORS.red, transition: "width 400ms ease-out" }} />
          </div>
        )}

        {/* WELCOME */}
        {stage === "welcome" && (
          <div style={{ animation: "fadeIn 600ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 24 }}>
              &gt; CISSP // DOMAIN_{String(DOMAIN.number).padStart(2, "0")}
            </div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 18, letterSpacing: -1 }}>
              {DOMAIN.title}
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", marginBottom: 16, maxWidth: 600 }}>
              {DOMAIN.subtitle}
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#bbbbbb", marginBottom: 36, maxWidth: 600 }}>
              {totalQ} questions. After each one you'll see what was right, why, and a link to the article that covers it. Get one wrong and you'll know exactly what to study.
            </p>

            <div style={{ display: "flex", gap: 32, marginBottom: 48, flexWrap: "wrap", fontSize: 13, color: COLORS.muted }}>
              <div><span style={{ color: COLORS.red }}>{String(totalQ).padStart(2, "0")}</span> questions</div>
              <div><span style={{ color: COLORS.red }}>~5min</span> to complete</div>
              <div><span style={{ color: COLORS.red }}>Free</span></div>
            </div>

            <button
              onClick={startQuiz}
              style={{
                fontFamily: fontStack,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: 1.5,
                color: COLORS.white,
                backgroundColor: COLORS.red,
                border: "none",
                padding: "18px 36px",
                cursor: "pointer",
                transition: "transform 150ms, box-shadow 150ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 24px rgba(230, 72, 51, 0.3)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              START THE QUIZ →
            </button>

            {/* DOMAINS 2-8 NOTE */}
            <div
              style={{
                marginTop: 40,
                padding: "18px 20px",
                border: `1px solid ${COLORS.border}`,
                fontSize: 13,
                color: COLORS.muted,
                maxWidth: 560,
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 4 }}>
                COMING SOON
              </div>
              Domain 2 (Asset Security) through Domain 8 (Software Development Security) are next. Start here.
            </div>
          </div>
        )}

        {/* QUESTION */}
        {stage === "question" && (
          <div key={currentQ} style={{ animation: "fadeIn 300ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>
              QUESTION_{String(currentQ + 1).padStart(2, "0")}
            </div>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 600, lineHeight: 1.3, marginBottom: 28, letterSpacing: -0.3 }}>
              {DOMAIN.questions[currentQ].q}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {DOMAIN.questions[currentQ].options.map((opt, idx) => {
                const correctIdx = DOMAIN.questions[currentQ].correct;
                const isAnswered = selectedIdx !== null;
                const isSelected = selectedIdx === idx;
                const isCorrect = idx === correctIdx;

                let borderColor = COLORS.border;
                let bgColor = "transparent";
                let letterColor = COLORS.red;

                if (isAnswered) {
                  if (isCorrect) {
                    borderColor = COLORS.green;
                    bgColor = "rgba(58, 182, 118, 0.08)";
                    letterColor = COLORS.green;
                  } else if (isSelected) {
                    borderColor = COLORS.red;
                    bgColor = "rgba(230, 72, 51, 0.08)";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={isAnswered}
                    style={{
                      fontFamily: fontStack,
                      fontSize: 15,
                      color: COLORS.white,
                      backgroundColor: bgColor,
                      border: `1px solid ${borderColor}`,
                      padding: "16px 18px",
                      textAlign: "left",
                      cursor: isAnswered ? "default" : "pointer",
                      transition: "all 150ms ease-out",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      lineHeight: 1.4,
                    }}
                    onMouseEnter={(e) => {
                      if (!isAnswered) {
                        e.currentTarget.style.borderColor = COLORS.red;
                        e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.06)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isAnswered) {
                        e.currentTarget.style.borderColor = COLORS.border;
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <span style={{ color: letterColor, fontSize: 12, fontWeight: 600, minWidth: 14 }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span style={{ flex: 1 }}>{opt}</span>
                    {isAnswered && isCorrect && (
                      <span style={{ color: COLORS.green, fontSize: 16, flexShrink: 0 }}>✓</span>
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <span style={{ color: COLORS.red, fontSize: 16, flexShrink: 0 }}>✗</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* FEEDBACK */}
            {selectedIdx !== null && (
              <div style={{ animation: "fadeIn 300ms ease-out" }}>
                <div
                  style={{
                    borderLeft: `2px solid ${selectedIdx === DOMAIN.questions[currentQ].correct ? COLORS.green : COLORS.red}`,
                    paddingLeft: 18,
                    marginBottom: 24,
                  }}
                >
                  <div style={{ fontSize: 11, color: selectedIdx === DOMAIN.questions[currentQ].correct ? COLORS.green : COLORS.red, letterSpacing: 2, marginBottom: 8 }}>
                    {selectedIdx === DOMAIN.questions[currentQ].correct ? "CORRECT ✓" : "NOT QUITE"}
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.55, color: "#dddddd", margin: 0 }}>
                    {DOMAIN.questions[currentQ].explanation}
                  </p>
                </div>

                {/* ARTICLE LINK */}
                <a
                  href={`${BASE_URL}${DOMAIN.questions[currentQ].article.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("article_clicked", { quiz: "cissp_domain_1", question: currentQ + 1, slug: DOMAIN.questions[currentQ].article.slug })}
                  style={{
                    display: "block",
                    padding: "16px 18px",
                    border: `1px solid ${COLORS.border}`,
                    textDecoration: "none",
                    color: COLORS.white,
                    marginBottom: 28,
                    transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.red;
                    e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 4 }}>
                    READ MORE
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>
                    {DOMAIN.questions[currentQ].article.title} <span style={{ color: COLORS.red }}>↗</span>
                  </div>
                </a>

                <button
                  onClick={handleNext}
                  style={{
                    fontFamily: fontStack,
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    color: COLORS.white,
                    backgroundColor: COLORS.red,
                    border: "none",
                    padding: "14px 28px",
                    cursor: "pointer",
                    transition: "transform 150ms, box-shadow 150ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 8px 24px rgba(230, 72, 51, 0.3)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {currentQ + 1 < totalQ ? "NEXT QUESTION →" : "SEE MY SCORE →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESULT */}
        {stage === "result" && (
          <div style={{ animation: "fadeIn 700ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>
              &gt; QUIZ COMPLETE
            </div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, marginBottom: 12 }}>
              YOUR SCORE:
            </div>
            <h1 style={{ fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 8, letterSpacing: -2 }}>
              <span style={{ color: COLORS.red }}>{score}</span>
              <span style={{ color: COLORS.muted, fontSize: "0.55em", marginLeft: 8 }}>/ {totalQ}</span>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.55, color: "#cccccc", marginBottom: 36, maxWidth: 560 }}>
              {score === totalQ && "Perfect. You've got Domain 1 down — move on to Domain 2 when it's available."}
              {score >= totalQ - 1 && score < totalQ && "Almost perfect. The one you missed is worth re-reading carefully."}
              {score >= totalQ * 0.7 && score < totalQ - 1 && "Solid. You've got the framework — close the gaps below before exam day."}
              {score >= totalQ * 0.5 && score < totalQ * 0.7 && "Mixed results. Domain 1 is foundational — worth a focused re-read before moving on."}
              {score < totalQ * 0.5 && "Domain 1 is where everything else builds from. Don't skip rebuilding the basics here."}
            </p>

            {/* TOPICS TO REVISIT */}
            {missed.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>
                  &gt; TOPICS TO REVISIT
                </div>
                <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20, lineHeight: 1.5 }}>
                  {missed.length === 1 ? "One question slipped." : `${missed.length} questions slipped.`} Each links to the article that covers it.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {missed.map((m, idx) => (
                    <a
                      key={idx}
                      href={`${BASE_URL}${m.q.article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track("revisit_article_clicked", { quiz: "cissp_domain_1", slug: m.q.article.slug })}
                      style={{
                        display: "block",
                        padding: "18px 0",
                        borderBottom: `1px solid ${COLORS.border}`,
                        textDecoration: "none",
                        color: COLORS.white,
                        transition: "padding-left 150ms",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "12px"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "0px"; }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>
                            QUESTION_{String(m.idx + 1).padStart(2, "0")}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>
                            {m.q.article.title}
                          </div>
                        </div>
                        <div style={{ color: COLORS.red, fontSize: 18, flexShrink: 0, marginTop: 4 }}>↗</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* SUBSCRIBE CTA */}
            <div
              style={{
                border: `1px solid ${COLORS.border}`,
                padding: 28,
                marginBottom: 32,
              }}
            >
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 12 }}>
                NEWSLETTER
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                One CISSP-relevant article every week.
              </div>
              <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 20, lineHeight: 1.5 }}>
                Built for candidates studying for the exam. No fluff.
              </p>
              <a
                href={SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("subscribe_clicked", { quiz: "cissp_domain_1" })}
                style={{
                  display: "inline-block",
                  fontFamily: fontStack,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  color: COLORS.white,
                  backgroundColor: COLORS.red,
                  textDecoration: "none",
                  padding: "14px 28px",
                }}
              >
                SUBSCRIBE →
              </a>
            </div>

            <button
              onClick={restart}
              style={{
                fontFamily: fontStack,
                fontSize: 12,
                color: COLORS.muted,
                backgroundColor: "transparent",
                border: "none",
                padding: "8px 0",
                cursor: "pointer",
                letterSpacing: 1.5,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; }}
            >
              ↻ RESTART QUIZ
            </button>

            <div
              style={{
                marginTop: 32,
                padding: "18px 20px",
                border: `1px solid ${COLORS.border}`,
                fontSize: 13,
                color: COLORS.muted,
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 4 }}>
                NEXT
              </div>
              Domain 2 (Asset Security) is coming next. Subscribe to be notified when it lands.
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // CISSP_DOMAIN_{String(DOMAIN.number).padStart(2, "0")}_v1</div>
          <div>BUILT FOR CISSP CANDIDATES</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
