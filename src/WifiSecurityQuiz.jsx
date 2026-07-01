import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — WI-FI SECURITY (ARTICLE QUIZ)
// CISSP Domain 4. Tests understanding of the source article. All "read more"
// links route back to the article itself.
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

const SOURCE_ARTICLE = {
  title: "Wi-Fi Security for the CISSP Candidates: Here Is What Actually Matters",
  slug: "wi-fi-security-for-the-cissp-candidates",
};

const QUIZ = {
  title: "Wi-Fi Security for CISSP",
  subtitle: "WEP, WPA, WPA2, WPA3, PSK, SAE, 802.1X. What the CISSP actually tests on wireless security — and how to pick the right combination in any scenario.",
  certs: "CISSP D4",
  questions: [
    {
      q: "Which of the following correctly lists the Wi-Fi security standards in the order they were introduced?",
      options: [
        "WEP → WPA2 → WPA → WPA3",
        "WEP → WPA → WPA2 → WPA3",
        "WPA → WEP → WPA2 → WPA3",
        "WEP → WPA → WPA3 → WPA2",
      ],
      correct: 1,
      explanation: "WEP came first (deprecated 2004). WPA replaced it as an emergency patch. WPA2 was the real upgrade (TKIP → CCMP). WPA3 is the current best practice (PSK → SAE). Each standard replaced the one before it because the previous had a serious security flaw — the CISSP expects you to know this progression.",
    },
    {
      q: "Which encryption protocol does WPA2 use?",
      options: [
        "TKIP",
        "WEP-RC4",
        "CCMP (AES-128)",
        "SAE",
      ],
      correct: 2,
      explanation: "WPA2 replaced WPA's TKIP with CCMP, which uses AES-128. TKIP was a patch on the original WEP-RC4 implementation — better than WEP but still weak. SAE (A) is an authentication method for WPA3-Personal, not an encryption protocol. Memorize: WEP (broken) → TKIP (weak) → CCMP (current standard).",
    },
    {
      q: "What is the minimum acceptable Wi-Fi encryption standard for an enterprise environment?",
      options: [
        "WEP",
        "WPA with TKIP",
        "WPA2 with CCMP",
        "Open network with a captive portal",
      ],
      correct: 2,
      explanation: "WPA2 with CCMP is the minimum acceptable. WEP is broken; WPA-TKIP is weak; a captive portal is access control, not encryption. WPA3 is the current best practice — but WPA2 is the floor an enterprise scenario can sit at without being marked insecure.",
    },
    {
      q: "What primary security weakness does SAE (Simultaneous Authentication of Equals) address compared to the older PSK handshake?",
      options: [
        "Slow connection establishment",
        "Offline dictionary attacks against captured handshakes",
        "Weak encryption of data after authentication",
        "Lack of compatibility with older hardware",
      ],
      correct: 1,
      explanation: "SAE uses the Dragonfly Key Exchange — both parties prove they know the password without ever sending it. This eliminates offline dictionary attacks (where an attacker captures the handshake and brute-forces it offline with no limit and no detection) and adds forward secrecy. That's the headline difference vs PSK.",
    },
    {
      q: "In a WPA2-PSK network, what is the primary risk of using a weak password?",
      options: [
        "The access point cannot encrypt traffic at all.",
        "An attacker can capture the 4-way handshake and run an offline dictionary attack against it.",
        "All users must change their password every 30 days.",
        "The network becomes incompatible with newer devices.",
      ],
      correct: 1,
      explanation: "PSK's biggest weakness is offline attacks. An attacker captures the handshake passively, then guesses passwords against it offline — no rate limiting, no detection. A weak password makes this trivial. This is exactly why WPA3 replaces PSK with SAE.",
    },
    {
      q: "What is 802.1X in the context of Wi-Fi security?",
      options: [
        "A new wireless encryption standard replacing CCMP.",
        "An authentication framework that uses a RADIUS server to verify individual credentials.",
        "A type of access point hardware required for WPA3.",
        "A password complexity requirement for personal Wi-Fi networks.",
      ],
      correct: 1,
      explanation: "802.1X is NOT a Wi-Fi protocol. It's an authentication FRAMEWORK. The access point blocks all traffic, asks for credentials, forwards them to a RADIUS server, and grants access only if the server approves. Encryption (WPA2/WPA3) is separate from authentication (802.1X) — Erich's table makes this distinction explicit.",
    },
    {
      q: "A company needs Wi-Fi for 5,000 employees, each requiring individual accountability for their network access. Which combination is most appropriate?",
      options: [
        "WPA2-PSK with a shared password",
        "Open network with a captive portal",
        "WPA2-Enterprise with 802.1X",
        "WEP with MAC filtering",
      ],
      correct: 2,
      explanation: "Individual accountability requires per-user credentials. PSK is shared — no accountability. Open + captive portal doesn't encrypt traffic. WEP is broken. WPA2-Enterprise with 802.1X gives each user their own credentials authenticated against a RADIUS server — exactly what 'individual accountability' demands.",
    },
    {
      q: "You're configuring secure guest Wi-Fi for visitors, with no requirement to manage individual user accounts. Which approach gives the best security without enterprise infrastructure?",
      options: [
        "Open network (no password)",
        "WPA2-PSK with a strong shared password",
        "WPA3-SAE",
        "Captive portal alone with no encryption",
      ],
      correct: 2,
      explanation: "WPA3-SAE is the right answer. Strong encryption, no offline dictionary attacks, forward secrecy, and no individual user accounts required. WPA2-PSK is acceptable but vulnerable to offline attacks if the password is weak. Open networks and captive-portal-only setups don't protect traffic in transit at all.",
    },
    {
      q: "A network administrator implements MAC address filtering as the primary access control for a sensitive wireless network. What is the main weakness of this approach?",
      options: [
        "MAC filtering is computationally expensive.",
        "MAC addresses are transmitted in cleartext and can be spoofed in minutes.",
        "MAC filtering interferes with WPA2 encryption.",
        "MAC addresses change every time a device reconnects.",
      ],
      correct: 1,
      explanation: "MAC addresses travel in cleartext even inside WPA2. Any attacker on the network can sniff a valid MAC address and spoof it on their own device in under a minute. MAC filtering is a Layer 2 control — trivial to bypass and never a substitute for encryption. CISSP exam loves this one.",
    },
    {
      q: "A scenario asks what security property a captive portal provides. Which is correct?",
      options: [
        "Confidentiality of all traffic between client and access point.",
        "Integrity of data transmitted across the network.",
        "Access control — gating internet access behind acceptance, authentication, or payment.",
        "Encryption of the wireless handshake.",
      ],
      correct: 2,
      explanation: "Captive portals provide access control ONLY. They sit in front of internet access, not in front of the wireless connection. The Wi-Fi traffic itself isn't protected by the portal — if the underlying encryption is weak or absent, traffic is still exposed. The CISSP loves testing whether you understand the scope: access control, not confidentiality, not integrity.",
    },
  ],
};

export default function WifiSecurityQuiz() {
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
    track("quiz_started", { quiz: "article_wifi_security" });
    setStage("question");
    setCurrentQ(0);
    setSelectedIdx(null);
    setAnswers([]);
  };

  const handleAnswer = (idx) => {
    if (selectedIdx !== null) return;
    const correct = QUIZ.questions[currentQ].correct;
    track("question_answered", {
      quiz: "article_wifi_security",
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
      track("quiz_completed", { quiz: "article_wifi_security", score, total: totalQ });
      setStage("result");
    }
  };

  const restart = () => {
    track("quiz_restarted", { quiz: "article_wifi_security" });
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
              onClick={() => track("source_article_clicked", { quiz: "article_wifi_security", from: "welcome" })}
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
                Read the article first. Then come back and test what stuck.
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
                  onClick={() => track("article_clicked", { quiz: "article_wifi_security", question: currentQ + 1 })}
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
              {score === totalQ && "Perfect. Wi-Fi security on Domain 4 is fully covered. Any scenario question will be a quick decision."}
              {score >= totalQ - 1 && score < totalQ && "Almost perfect. The one you missed is worth re-reading before exam day."}
              {score >= totalQ * 0.7 && score < totalQ - 1 && "Solid. You've got the framework — close the gaps below and retake."}
              {score >= totalQ * 0.5 && score < totalQ * 0.7 && "Mixed results. Re-read the article focusing on what you missed, then retake."}
              {score < totalQ * 0.5 && "Worth re-reading the article end-to-end. The CISSP loves scenario questions on Wi-Fi — they're either free points or free losses."}
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
                  onClick={() => track("revisit_article_clicked", { quiz: "article_wifi_security" })}
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
                onClick={() => track("subscribe_clicked", { quiz: "article_wifi_security" })}
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
          <div>WI-FI SECURITY · CISSP D4</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
