import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — BACKUP STRATEGIES (ARTICLE QUIZ)
// Full, incremental, differential + electronic vaulting, remote journaling,
// remote mirroring + the 3-2-1 rule. Maps to CC, CISSP D7, and Security+.
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

// TODO: Update slug once the article is published.
const SOURCE_ARTICLE = {
  title: "Backup Strategies: Full, Incremental, Differential, and the 3-2-1 Rule",
  slug: "backup-strategies-3-2-1-rule",
};

const QUIZ = {
  title: "Backup Strategies for CISSP",
  subtitle: "Full · incremental · differential · electronic vaulting · remote journaling · remote mirroring · the 3-2-1 rule. Every backup scenario the exam and the hiring manager will throw at you.",
  certs: "CC  ·  CISSP D7  ·  SECURITY+",
  questions: [
    {
      q: "Which of the following best describes a full backup?",
      options: [
        "Only files changed since the last backup are copied.",
        "All data is copied, regardless of what changed.",
        "Only files changed since the last full backup are copied.",
        "Only transaction logs are transmitted continuously.",
      ],
      correct: 1,
      explanation: "A full backup copies all data every time it runs. That makes it the safest and simplest to restore — one backup set is all you need — but also the largest and slowest to produce. (A) describes an incremental; (C) a differential; (D) remote journaling.",
    },
    {
      q: "What is the key difference between incremental and differential backups?",
      options: [
        "Incremental backs up since the last full backup; differential backs up since the last backup of any type.",
        "Incremental backs up since the last backup of any type; differential backs up since the last full backup only.",
        "Incremental copies only files; differential copies only databases.",
        "Incremental runs weekly; differential runs monthly.",
      ],
      correct: 1,
      explanation: "This is the classic exam trap. Incremental captures everything changed since the LAST BACKUP OF ANY TYPE (a full or another incremental). Differential captures everything changed since the LAST FULL BACKUP only. Mix these two up and this question is a guaranteed loss.",
    },
    {
      q: "Your organization uses a weekly full backup followed by daily incremental backups. A disaster occurs on Friday. What must be restored, and in what order?",
      options: [
        "Only the most recent incremental backup.",
        "Only the last full backup.",
        "The last full backup, followed by every incremental in order.",
        "The last full backup, followed by the most recent incremental only.",
      ],
      correct: 2,
      explanation: "Incremental restore requires the last full backup PLUS every incremental applied in the correct order. One corrupted incremental in the chain, and everything after it is unusable. That's why incremental is the cheapest to run and the riskiest to restore. (D) describes differential restore.",
    },
    {
      q: "Your organization uses a weekly full backup followed by daily differential backups. A disaster occurs on Friday. What must be restored?",
      options: [
        "The last full backup, plus every differential taken since.",
        "The last full backup, plus the most recent differential.",
        "Only the last full backup.",
        "Only the most recent differential backup.",
      ],
      correct: 1,
      explanation: "Differential restore is simple — last full backup + latest differential. Each differential captures everything changed since the last full, so only the most recent one is needed. This is the fast, simpler alternative to incremental — bigger backups over time, but no fragile chain of dependencies.",
    },
    {
      q: "An organization automatically transfers bulk backup data to an offsite location on a nightly schedule. Which enterprise technique is this?",
      options: [
        "Remote journaling",
        "Remote mirroring",
        "Electronic vaulting",
        "Differential backup",
      ],
      correct: 2,
      explanation: "Electronic vaulting is scheduled, automated bulk transfer to an offsite location — essentially a scheduled backup job over the network. The catch: it moves in batches, so any data written between transfers is lost if disaster hits mid-cycle. Remote journaling sends transaction logs continuously; remote mirroring maintains a live duplicate.",
    },
    {
      q: "A financial system must be recoverable to any point in time within the last day. Transaction logs are continuously transmitted to an offsite location. Which enterprise technique is being used?",
      options: [
        "Electronic vaulting",
        "Remote journaling",
        "Remote mirroring",
        "Full backup with daily incrementals",
      ],
      correct: 1,
      explanation: "Remote journaling continuously transmits transaction logs (not bulk data) in near real time, enabling point-in-time recovery. Electronic vaulting is batch-based and only captures state at scheduled intervals. Remote mirroring is a live duplicate of the entire system. Full-plus-incremental only provides recovery at backup granularity.",
    },
    {
      q: "The business requires zero data loss (RPO = 0) for a critical transactional system. Which option is the only one that meets this requirement?",
      options: [
        "Electronic vaulting",
        "Remote journaling",
        "Remote mirroring",
        "Weekly full backups with hourly incrementals",
      ],
      correct: 2,
      explanation: "Only remote mirroring — a live, synchronized duplicate of the system at another site — can meet an RPO of zero. Every write is captured at both locations. Electronic vaulting and remote journaling both have latency between an event and its capture. Traditional backup schedules can never achieve zero data loss.",
    },
    {
      q: "According to the 3-2-1 backup rule, what should an organization maintain?",
      options: [
        "3 backup copies, on 2 different media types, with 1 stored offsite.",
        "3 backup copies, all on the same medium, tested weekly.",
        "3 backup schedules (full, incremental, differential), with 2 offsite locations, and 1 recovery test per year.",
        "3 different backup tools, on 2 vendors, with 1 encryption method.",
      ],
      correct: 0,
      explanation: "3-2-1: THREE copies (original plus two backups), TWO different media types (so one failure mode can't wipe everything), ONE stored offsite (so a local disaster can't wipe everything either). It's the baseline compliance frameworks expect and the first answer expected in any backup strategy conversation.",
    },
    {
      q: "Why does the 3-2-1 rule require the two backup copies to be on DIFFERENT types of media?",
      options: [
        "To satisfy vendor licensing requirements.",
        "Because different media types have different retention periods by law.",
        "Because copies on the same media type share the same failure mode — one firmware bug or ransomware strain can wipe both.",
        "Because compression ratios differ across media.",
      ],
      correct: 2,
      explanation: "Two copies on the same media type share the same failure mode — a firmware bug, a ransomware strain targeting that media, or a technology-specific flaw can wipe both simultaneously. Diverse media eliminates that single point of failure. The 3-2-1 rule removes all three single points of failure (single copy, single media, single location) in one move.",
    },
    {
      q: "Your organization has a well-designed backup strategy — 3-2-1 storage, daily incremental backups — but has never performed a full restore test. Which risk is greatest?",
      options: [
        "Compliance violations for excessive testing.",
        "The backups may be silently corrupted or misconfigured — you won't find out until you actually need them.",
        "Excessive network utilization during the tests.",
        "The backup team may burn out from too much testing.",
      ],
      correct: 1,
      explanation: "Untested backups fail exactly when you need them. Silent corruption, misconfigured schedules, unusable formats, missing credentials, or broken restore procedures all remain invisible until an actual disaster forces the test. Test regularly, or you're operating on faith. The exam frames this as an operational maturity issue.",
    },
  ],
};

export default function BackupStrategiesQuiz() {
  const [stage, setStage] = useState("welcome");
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
  const totalQ = QUIZ.questions.length;
  const articleUrl = `${BASE_URL}${SOURCE_ARTICLE.slug}`;

  const startQuiz = () => {
    track("quiz_started", { quiz: "article_backup_strategies" });
    setStage("question");
    setCurrentQ(0);
    setSelectedIdx(null);
    setAnswers([]);
  };

  const handleAnswer = (idx) => {
    if (selectedIdx !== null) return;
    const correct = QUIZ.questions[currentQ].correct;
    track("question_answered", {
      quiz: "article_backup_strategies",
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
      track("quiz_completed", { quiz: "article_backup_strategies", score, total: totalQ });
      setStage("result");
    }
  };

  const restart = () => {
    track("quiz_restarted", { quiz: "article_backup_strategies" });
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

        {stage === "question" && (
          <div style={{ height: 2, backgroundColor: COLORS.border, marginBottom: 48, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, backgroundColor: COLORS.red, transition: "width 400ms ease-out" }} />
          </div>
        )}

        {/* WELCOME */}
        {stage === "welcome" && (
          <div style={{ animation: "fadeIn 600ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 24 }}>
              &gt; ARTICLE QUIZ
            </div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 18, letterSpacing: -1 }}>
              {QUIZ.title}
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", marginBottom: 16, maxWidth: 600 }}>
              {QUIZ.subtitle}
            </p>
            <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 2, marginBottom: 32 }}>
              MAPS TO: {QUIZ.certs}
            </div>

            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("source_article_clicked", { quiz: "article_backup_strategies", from: "welcome" })}
              style={{
                display: "block",
                borderLeft: `2px solid ${COLORS.red}`,
                paddingLeft: 16,
                marginBottom: 40,
                maxWidth: 560,
                textDecoration: "none",
                color: COLORS.white,
                transition: "all 150ms ease-out",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "20px"; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "16px"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>
                BASED ON THE ARTICLE
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>
                {SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span>
              </div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4, letterSpacing: 0.5 }}>
                Read the article first. Then come back and see if the incremental-vs-differential trap catches you.
              </div>
            </a>

            <div style={{ display: "flex", gap: 32, marginBottom: 48, flexWrap: "wrap", fontSize: 13, color: COLORS.muted }}>
              <div><span style={{ color: COLORS.red }}>{String(totalQ).padStart(2, "0")}</span> questions</div>
              <div><span style={{ color: COLORS.red }}>~6min</span> to complete</div>
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
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(230, 72, 51, 0.3)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              START THE QUIZ →
            </button>
          </div>
        )}

        {/* QUESTION */}
        {stage === "question" && (
          <div key={currentQ} style={{ animation: "fadeIn 300ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>
              QUESTION_{String(currentQ + 1).padStart(2, "0")}
            </div>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 600, lineHeight: 1.3, marginBottom: 28, letterSpacing: -0.3 }}>
              {QUIZ.questions[currentQ].q}
            </h2>

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
                    {isAnswered && isCorrect && <span style={{ color: COLORS.green, fontSize: 16 }}>✓</span>}
                    {isAnswered && isSelected && !isCorrect && <span style={{ color: COLORS.red, fontSize: 16 }}>✗</span>}
                  </button>
                );
              })}
            </div>

            {selectedIdx !== null && (
              <div style={{ animation: "fadeIn 300ms ease-out" }}>
                <div
                  style={{
                    borderLeft: `2px solid ${selectedIdx === QUIZ.questions[currentQ].correct ? COLORS.green : COLORS.red}`,
                    paddingLeft: 18,
                    marginBottom: 24,
                  }}
                >
                  <div style={{ fontSize: 11, color: selectedIdx === QUIZ.questions[currentQ].correct ? COLORS.green : COLORS.red, letterSpacing: 2, marginBottom: 8 }}>
                    {selectedIdx === QUIZ.questions[currentQ].correct ? "CORRECT ✓" : "NOT QUITE"}
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.55, color: "#dddddd", margin: 0 }}>
                    {QUIZ.questions[currentQ].explanation}
                  </p>
                </div>

                <a
                  href={articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("article_clicked", { quiz: "article_backup_strategies", question: currentQ + 1 })}
                  style={{
                    display: "block",
                    padding: "16px 18px",
                    border: `1px solid ${COLORS.border}`,
                    textDecoration: "none",
                    color: COLORS.white,
                    marginBottom: 28,
                    transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 4 }}>
                    REVISIT THIS SECTION
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>
                    {SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span>
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
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(230, 72, 51, 0.3)`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
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
              {score === totalQ && "Perfect. You've internalized backup strategy — the exam won't catch you on this topic, and neither will the hiring manager."}
              {score >= totalQ - 1 && score < totalQ && "Almost perfect. The one you missed is worth re-reading before exam day."}
              {score >= totalQ * 0.7 && score < totalQ - 1 && "Solid. You've got the framework — close the gaps below and retake."}
              {score >= totalQ * 0.5 && score < totalQ * 0.7 && "Mixed results. Re-read the article focusing on what you missed, then retake."}
              {score < totalQ * 0.5 && "Worth re-reading the article end-to-end. This topic shows up in almost every SOC and GRC interview — don't leave it half-learned."}
            </p>

            {missed.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>
                  &gt; REVISIT THE ARTICLE
                </div>
                <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20, lineHeight: 1.5 }}>
                  {missed.length === 1 ? "One question slipped" : `${missed.length} questions slipped`}. The article walks through each of these.
                </p>
                <a
                  href={articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("revisit_article_clicked", { quiz: "article_backup_strategies" })}
                  style={{
                    display: "block",
                    padding: "20px 22px",
                    border: `1px solid ${COLORS.red}`,
                    backgroundColor: "rgba(230, 72, 51, 0.04)",
                    textDecoration: "none",
                    color: COLORS.white,
                    transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
                >
                  <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>
                    READ THE SOURCE
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>
                    {SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 6, letterSpacing: 0.5 }}>
                    Then come back and retake the quiz.
                  </div>
                </a>
              </div>
            )}

            <div style={{ border: `1px solid ${COLORS.border}`, padding: 28, marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 12 }}>NEWSLETTER</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                Get one practical breakdown like this every week.
              </div>
              <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 20, lineHeight: 1.5 }}>
                1,300+ readers preparing for CC, CISSP, and Security+. No fluff.
              </p>
              <a
                href={SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("subscribe_clicked", { quiz: "article_backup_strategies" })}
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
          </div>
        )}

        <footer style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // ARTICLE_QUIZ_v1</div>
          <div>BACKUP STRATEGIES · CISSP D7</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
