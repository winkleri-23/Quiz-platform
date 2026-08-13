import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — IDENTITY LIFECYCLE MANAGEMENT (ARTICLE QUIZ)
// Ownership, least privilege, privilege creep, access reviews, and
// automated deprovisioning. Maps to CC, CISSP D5, and Security+.
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

// TODO: Update slug once the article is published with its final URL.
const SOURCE_ARTICLE = {
  title: "CISSP Identity Lifecycle Management: The Account You Forgot Is the One That Gets You",
  slug: "cissp-identity-lifecycle-management",
};

const QUIZ = {
  title: "Identity Lifecycle Management",
  subtitle: "Ownership, least privilege, privilege creep, access reviews, and automated deprovisioning. The IAM questions every SOC and GRC interview asks — and the exam traps most beginners fall for.",
  certs: "CC  ·  CISSP D5  ·  SECURITY+",
  questions: [
    {
      q: "Your organization is investigating a data leak. Investigators find that the offending employee left the company 8 months ago, but their AD account was still active. Under a standard governance framework, who is responsible for having flagged that account for deprovisioning?",
      options: [
        "The IT team, because they manage all account infrastructure.",
        "The employee's former manager, because access accountability sits with the manager or data owner.",
        "The security operations center, because they monitor all account activity.",
        "HR, because HR handled the termination paperwork.",
      ],
      correct: 1,
      explanation: "IT configures access based on the rules they are given. HR triggers the workflow. Accountability for whether the access should still exist sits with the manager or data owner. This is the \"everyone assumed someone else would handle it\" trap the article calls out — and the reason forgotten accounts are the number one identity lifecycle failure.",
    },
    {
      q: "A new junior analyst joins your team. The security engineer notes that granting the analyst full read/write access to the production database is technically functional, but broader than the role actually needs. For CISSP purposes, what is the correct approach?",
      options: [
        "Grant the broader access and revoke unused permissions in the next quarterly review.",
        "Grant only the access the role actually requires, following least privilege from day one.",
        "Grant the same access level as the analyst's manager for consistency.",
        "Grant temporary full access and audit usage before deciding what to keep.",
      ],
      correct: 1,
      explanation: "The CISSP answer favors restricting from the start, never granting broadly and correcting later. Excess access on day one is a risk on day one — you can't retroactively unread a database, and the correction step is the one that most often gets forgotten.",
    },
    {
      q: "An employee has moved through three departments in five years. Every role change added new permissions. No role change removed old ones. On paper they work in Operations. In practice they can still access Finance, HR, and legacy systems from previous roles. What is this pattern called?",
      options: [
        "Access sprawl.",
        "Privilege creep.",
        "Role explosion.",
        "Insider risk.",
      ],
      correct: 1,
      explanation: "Privilege creep is the accumulation of unnecessary access over time as people change roles or projects without their old permissions being removed. Periodic access reviews are the one control that catches this before it shows up in an audit or a breach postmortem.",
    },
    {
      q: "Your organization runs quarterly access reviews to catch privilege creep. Under CISSP best practice, who should actually perform the review for a given employee?",
      options: [
        "The employee, who knows their own access needs best.",
        "The IT team, since they provisioned the access.",
        "The employee's manager or the data owner.",
        "The internal auditor, since access reviews are a compliance activity.",
      ],
      correct: 2,
      explanation: "Reviews must be conducted by the manager or the data owner — the person accountable for whether the access is still justified. Never the user, because the user has an incentive to keep whatever access they have collected. IT provisions; auditors verify; managers decide.",
    },
    {
      q: "A team lead argues that letting employees self-attest to their own access needs would save time and reduce workload on managers. What is the strongest counter-argument grounded in the identity lifecycle model?",
      options: [
        "Self-attestation violates most data privacy regulations.",
        "Users have both convenience bias and job-preservation incentives to keep whatever access they have accumulated, so self-review does not catch privilege creep.",
        "Users are not technically qualified to interpret their own permissions.",
        "Regulations require every access review to be signed by two independent parties.",
      ],
      correct: 1,
      explanation: "The problem is not qualification — it's incentive. Users benefit from keeping every permission they have. Managers and data owners are the only parties with a business incentive to remove access that is no longer needed.",
    },
    {
      q: "An employee is terminated at 9 AM. Two weeks later, an audit discovers the employee still had active access to email and internal systems the entire time. Which control most directly addresses this failure?",
      options: [
        "More frequent access reviews of terminated employees.",
        "A manual checklist the IT team runs whenever HR notifies them.",
        "Automated deprovisioning triggered by the HR termination record.",
        "A stricter background check policy for new hires.",
      ],
      correct: 2,
      explanation: "When a scenario describes a terminated employee who still has access, the CISSP answer is almost always automated deprovisioning tied to HR. Manual steps depend on someone remembering — and someone always forgets. Automation removes the human failure mode entirely.",
    },
    {
      q: "A contractor completes their 6-month project and leaves. No one tells IT. Six months later, the contractor's account is still active with the same access it had on project day one. This is an example of what?",
      options: [
        "An orphaned account.",
        "A shadow account.",
        "A service account misconfiguration.",
        "A privilege escalation.",
      ],
      correct: 0,
      explanation: "An orphaned account belongs to a user or purpose that no longer exists in the organization but still has active credentials. Contractor engagements are one of the most common sources — the HR system usually doesn't track when a contractor's project ends, so nothing triggers deprovisioning automatically. Periodic orphaned-account sweeps are the safety net.",
    },
    {
      q: "Which phase of the identity lifecycle is the most consistently neglected in real organizations, and why?",
      options: [
        "Provisioning, because IT teams underinvest in onboarding automation.",
        "The maintenance middle (access reviews, role changes, ongoing deprovisioning triggers), because it is boring, never-ending, and no single team owns it.",
        "Deprovisioning, because HR does not know when contractors leave.",
        "Authentication, because MFA rollout is complicated in legacy environments.",
      ],
      correct: 1,
      explanation: "Provisioning gets attention because it has a clear trigger and a happy stakeholder — a new hire waiting to work. Formal termination triggers some deprovisioning attention. The middle — the years-long maintenance phase — is where privilege creep happens, and it goes neglected because the work is repetitive, never done, and owned by \"everyone\" (which in practice means no one).",
    },
  ],
};

export default function IdentityLifecycleQuiz() {
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
  const articleUrl = `${BASE_URL}${SOURCE_ARTICLE.slug}`;

  const startQuiz = () => {
    track("quiz_started", { quiz: "article_identity_lifecycle" });
    setStage("question");
    setCurrentQ(0);
    setSelectedIdx(null);
    setAnswers([]);
  };

  const handleAnswer = (idx) => {
    if (selectedIdx !== null) return;
    const correct = QUIZ.questions[currentQ].correct;
    track("question_answered", {
      quiz: "article_identity_lifecycle",
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
      track("quiz_completed", { quiz: "article_identity_lifecycle", score, total: totalQ });
      setStage("result");
    }
  };

  const restart = () => {
    track("quiz_restarted", { quiz: "article_identity_lifecycle" });
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
        <header style={{ marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // ARTICLE QUIZ</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <a href="/" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2, transition: "color 150ms, border-color 150ms" }}
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

        {stage === "question" && (
          <div style={{ height: 2, backgroundColor: COLORS.border, marginBottom: 48, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, backgroundColor: COLORS.red, transition: "width 400ms ease-out" }} />
          </div>
        )}

        {stage === "welcome" && (
          <div style={{ animation: "fadeIn 600ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 24 }}>&gt; ARTICLE QUIZ</div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 18, letterSpacing: -1 }}>{QUIZ.title}</h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", marginBottom: 16, maxWidth: 600 }}>{QUIZ.subtitle}</p>
            <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 2, marginBottom: 32 }}>MAPS TO: {QUIZ.certs}</div>

            <a href={articleUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => track("source_article_clicked", { quiz: "article_identity_lifecycle", from: "welcome" })}
              style={{
                display: "block", borderLeft: `2px solid ${COLORS.red}`, paddingLeft: 16,
                marginBottom: 40, maxWidth: 560, textDecoration: "none", color: COLORS.white,
                transition: "all 150ms ease-out",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "20px"; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "16px"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>BASED ON THE ARTICLE</div>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span></div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4, letterSpacing: 0.5 }}>Read it first. Then come back and see if the ownership and privilege-creep traps catch you.</div>
            </a>

            <div style={{ display: "flex", gap: 32, marginBottom: 48, flexWrap: "wrap", fontSize: 13, color: COLORS.muted }}>
              <div><span style={{ color: COLORS.red }}>{String(totalQ).padStart(2, "0")}</span> questions</div>
              <div><span style={{ color: COLORS.red }}>~5min</span> to complete</div>
              <div><span style={{ color: COLORS.red }}>Free</span></div>
            </div>

            <button onClick={startQuiz}
              style={{
                fontFamily: fontStack, fontSize: 15, fontWeight: 600, letterSpacing: 1.5,
                color: COLORS.white, backgroundColor: COLORS.red, border: "none",
                padding: "18px 36px", cursor: "pointer", transition: "transform 150ms, box-shadow 150ms",
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

                <a href={articleUrl} target="_blank" rel="noopener noreferrer"
                  onClick={() => track("article_clicked", { quiz: "article_identity_lifecycle", question: currentQ + 1 })}
                  style={{
                    display: "block", padding: "16px 18px", border: `1px solid ${COLORS.border}`,
                    textDecoration: "none", color: COLORS.white, marginBottom: 28,
                    transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 4 }}>REVISIT THIS SECTION</div>
                  <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span></div>
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
              {score === totalQ && "Perfect. You'd handle the identity lifecycle questions in any CISSP or GRC interview cleanly — ownership, least privilege, and creep are internalized."}
              {score >= totalQ - 1 && score < totalQ && "Almost perfect. The one that slipped is worth re-reading before exam day."}
              {score >= totalQ * 0.7 && score < totalQ - 1 && "Solid. You've got the shape — patch the gaps below and retake."}
              {score >= totalQ * 0.5 && score < totalQ * 0.7 && "Mixed. Ownership and \"who reviews\" are where most people stumble. Re-read those sections, then retake."}
              {score < totalQ * 0.5 && "Worth re-reading the article end-to-end. IAM is the CISSP domain most interview panels probe hardest — the details matter."}
            </p>

            {missed.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; REVISIT THE ARTICLE</div>
                <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20, lineHeight: 1.5 }}>
                  {missed.length === 1 ? "One question slipped" : `${missed.length} questions slipped`}. The article walks through each of these.
                </p>
                <a href={articleUrl} target="_blank" rel="noopener noreferrer"
                  onClick={() => track("revisit_article_clicked", { quiz: "article_identity_lifecycle" })}
                  style={{
                    display: "block", padding: "20px 22px",
                    border: `1px solid ${COLORS.red}`, backgroundColor: "rgba(230, 72, 51, 0.04)",
                    textDecoration: "none", color: COLORS.white, transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
                >
                  <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>READ THE SOURCE</div>
                  <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>{SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span></div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 6, letterSpacing: 0.5 }}>Then come back and retake the quiz.</div>
                </a>
              </div>
            )}

            {/* PRIVILEGE CREEP TOOL cross-promo */}
            <div style={{ border: `1px solid ${COLORS.red}`, backgroundColor: "rgba(230,72,51,0.04)", padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>NOW FEEL IT</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>Play the Privilege Creep Simulator</div>
              <p style={{ fontSize: 13, color: "#cccccc", marginBottom: 14, lineHeight: 1.55 }}>
                Watch an employee move through your company for 5 years. Skip too many access reviews and the audit will find you.
              </p>
              <a href="/tools/privilege-creep"
                onClick={() => track("cross_promo_clicked", { from: "article_identity_lifecycle", to: "privilege_creep" })}
                style={{
                  display: "inline-block", fontFamily: fontStack, fontSize: 13, fontWeight: 600,
                  letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
                  textDecoration: "none", padding: "12px 22px",
                }}
              >
                OPEN THE SIMULATOR →
              </a>
            </div>

            <div style={{ border: `1px solid ${COLORS.border}`, padding: 28, marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 12 }}>NEWSLETTER</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>Get one practical breakdown like this every week.</div>
              <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 20, lineHeight: 1.5 }}>1,450+ readers preparing for CC, CISSP, and Security+. No fluff.</p>
              <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer"
                onClick={() => track("subscribe_clicked", { quiz: "article_identity_lifecycle" })}
                style={{
                  display: "inline-block", fontFamily: fontStack, fontSize: 14, fontWeight: 600,
                  letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
                  textDecoration: "none", padding: "14px 28px",
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

        <footer style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // ARTICLE_QUIZ_v1</div>
          <div>IDENTITY LIFECYCLE · CISSP D5</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
