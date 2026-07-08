import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — TOP 5 NETWORK ATTACKS (ARTICLE QUIZ)
// Scenario-based. Tests identification, countermeasures, DoS/DDoS distinction,
// and CIA triad framing. Maps to CC, Security+, CISSP Domain 4.
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
  title: "Top 5 Network Attacks You Will Meet on the Exam and in Real Logs",
  slug: "top-5-network-attacks-every-cybersecurity",
};

const QUIZ = {
  title: "Top 5 Network Attacks",
  subtitle: "SYN Flood, Smurf, Ping of Death, Teardrop, Land — scenario questions that mirror how these attacks show up on the exam and in real network logs.",
  certs: "CC  ·  CISSP D4  ·  SECURITY+",
  questions: [
    {
      q: "A server becomes unresponsive. Its logs show thousands of connection attempts, each stuck waiting for a final acknowledgment that never arrives. Which attack is this?",
      options: ["Smurf", "SYN Flood", "Land", "Teardrop"],
      correct: 1,
      explanation: "Half-open TCP handshakes with no final ACK is the SYN Flood signature — the attacker sends SYNs and never completes the handshake, so the server holds resources open for connections that never finish. Smurf uses ICMP broadcast + spoofed source; Land uses identical source/dest IP+port; Teardrop uses fragmented packets with overlapping offsets.",
    },
    {
      q: "A packet capture shows a single ICMP echo request going to a network's broadcast address, followed by hundreds of ICMP echo replies flooding one host. What attack is in progress?",
      options: ["Ping of Death", "Fraggle", "Smurf", "SYN Flood"],
      correct: 2,
      explanation: "ICMP to a broadcast address with the target's IP spoofed as the source produces this fan-out pattern — one packet from the attacker turns into hundreds of replies at the victim. That's Smurf. Fraggle is the same play but uses UDP, not ICMP. Ping of Death is a single oversized packet. SYN Flood is TCP, not ICMP.",
    },
    {
      q: "An attacker directs UDP packets to a network's broadcast address, spoofing the victim's IP as the source. Which attack is this?",
      options: ["Smurf", "Fraggle", "Ping of Death", "Land"],
      correct: 1,
      explanation: "The setup is identical to Smurf, but Smurf uses ICMP. UDP to a broadcast address with a spoofed source is Fraggle. This is the exact trap the exam loves — one word (UDP vs ICMP) decides the correct answer.",
    },
    {
      q: "A single incoming ICMP echo request causes a legacy server to crash instantly. Packet analysis shows the request exceeds the maximum size defined by the IP standard. Which attack has been performed?",
      options: ["Smurf", "SYN Flood", "Ping of Death", "Teardrop"],
      correct: 2,
      explanation: "One oversized packet causing a crash is the Ping of Death signature — the packet overflows the reassembly buffer on unpatched systems. Smurf requires broadcast amplification; SYN Flood is a flood of TCP handshakes; Teardrop uses overlapping fragments, not oversize.",
    },
    {
      q: "A system crashes after receiving a series of IP fragments whose offsets overlap each other. Which attack is this?",
      options: ["Ping of Death", "Land", "SYN Flood", "Teardrop"],
      correct: 3,
      explanation: "Overlapping fragment offsets that break reassembly is the Teardrop signature. Ping of Death is a single oversized packet, not overlapping fragments. Land uses identical source/destination IP+port. SYN Flood is TCP handshakes, not fragmentation.",
    },
    {
      q: "A packet capture on a target host reveals inbound TCP packets whose source IP and source port are identical to the destination IP and destination port. A vulnerable stack begins looping. What attack has occurred?",
      options: ["Fraggle", "Land", "SYN Flood", "Smurf"],
      correct: 1,
      explanation: "Source = Destination on both IP and port is exclusively the Land attack signature. Nothing else looks like this. The stack sees a packet apparently sent by itself, replies to itself, processes the reply, and loops until it freezes.",
    },
    {
      q: "You need to protect a TCP-based service from SYN floods. Which control most directly addresses the attack's mechanism?",
      options: [
        "Disable IP-directed broadcasts on the router.",
        "Patch the OS to fix a TCP reassembly bug.",
        "Enable SYN cookies on the server.",
        "Configure the firewall to drop packets whose source equals destination.",
      ],
      correct: 2,
      explanation: "SYN cookies delay server-side resource commitment until the handshake completes — the entire point of a SYN Flood is to exhaust half-open connection state, so SYN cookies close exactly that gap. (A) defends against Smurf, (B) addresses Ping of Death / Teardrop bugs, (D) blocks Land attacks.",
    },
    {
      q: "Which of the following is the most direct countermeasure against a Smurf attack targeting your network?",
      options: [
        "Enable SYN cookies on all servers.",
        "Patch systems to the latest kernel version.",
        "Disable IP-directed broadcasts on the router.",
        "Enable disk-level encryption on the servers.",
      ],
      correct: 2,
      explanation: "Smurf works because a router forwards a ping addressed to a network's broadcast to every host on that network — the amplifier. Disabling IP-directed broadcasts stops the amplification at the source. SYN cookies protect against SYN Flood; patching addresses Ping of Death / Teardrop; disk encryption is unrelated to availability attacks.",
    },
    {
      q: "You need to defend a public web service against a large-scale attack originating from thousands of hosts across the internet. Which characteristic makes a DDoS attack fundamentally harder to mitigate than a single-source DoS?",
      options: [
        "DDoS attacks always use encrypted traffic.",
        "DDoS attacks target the confidentiality of data.",
        "DDoS attacks have no single source IP to block or rate-limit.",
        "DDoS attacks require physical access to network hardware.",
      ],
      correct: 2,
      explanation: "The distributed nature is the whole problem — traffic comes from thousands of sources at once, so classic block-the-attacker defenses (IP blocklists, single-source rate limits) don't work. DDoS still targets availability, not confidentiality. Encryption and physical access are unrelated.",
    },
    {
      q: "Which pillar of the CIA triad is directly targeted by all five of the attacks in this article (SYN Flood, Smurf, Ping of Death, Teardrop, Land)?",
      options: ["Confidentiality", "Integrity", "Availability", "Authenticity"],
      correct: 2,
      explanation: "Denial-of-service attacks target availability — making the system unavailable to legitimate users. They don't steal data (confidentiality) or modify it (integrity). Framing scenario questions by \"which pillar is under attack\" is often the fastest path to the correct answer.",
    },
  ],
};

export default function NetworkAttacksQuiz() {
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
    track("quiz_started", { quiz: "article_network_attacks" });
    setStage("question");
    setCurrentQ(0);
    setSelectedIdx(null);
    setAnswers([]);
  };

  const handleAnswer = (idx) => {
    if (selectedIdx !== null) return;
    const correct = QUIZ.questions[currentQ].correct;
    track("question_answered", {
      quiz: "article_network_attacks",
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
      track("quiz_completed", { quiz: "article_network_attacks", score, total: totalQ });
      setStage("result");
    }
  };

  const restart = () => {
    track("quiz_restarted", { quiz: "article_network_attacks" });
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
              onClick={() => track("source_article_clicked", { quiz: "article_network_attacks", from: "welcome" })}
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
                Read the article first. Then come back and see if you can spot each attack from the scenario alone.
              </div>
            </a>

            <div style={{ display: "flex", gap: 32, marginBottom: 48, flexWrap: "wrap", fontSize: 13, color: COLORS.muted }}>
              <div><span style={{ color: COLORS.red }}>{String(totalQ).padStart(2, "0")}</span> scenarios</div>
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
              SCENARIO_{String(currentQ + 1).padStart(2, "0")}
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
                  onClick={() => track("article_clicked", { quiz: "article_network_attacks", question: currentQ + 1 })}
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
                  {currentQ + 1 < totalQ ? "NEXT SCENARIO →" : "SEE MY SCORE →"}
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
              {score === totalQ && "Perfect. You can spot each of these attacks from a scenario alone — that's the level the exam expects."}
              {score >= totalQ - 1 && score < totalQ && "Almost perfect. The one you missed is worth re-reading before exam day."}
              {score >= totalQ * 0.7 && score < totalQ - 1 && "Solid. You've got the framework — close the gaps below and retake."}
              {score >= totalQ * 0.5 && score < totalQ * 0.7 && "Mixed results. Re-read the article focusing on what you missed, then retake."}
              {score < totalQ * 0.5 && "Worth re-reading the article end-to-end. Scenario recognition is exactly what the exam tests here — spot the detail, spot the attack."}
            </p>

            {missed.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>
                  &gt; REVISIT THE ARTICLE
                </div>
                <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20, lineHeight: 1.5 }}>
                  {missed.length === 1 ? "One scenario slipped" : `${missed.length} scenarios slipped`}. The article breaks down each attack's identifying detail.
                </p>
                <a
                  href={articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("revisit_article_clicked", { quiz: "article_network_attacks" })}
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

            {/* CHEAT SHEET CTA */}
            <div
              style={{
                border: `1px solid ${COLORS.red}`,
                backgroundColor: "rgba(230, 72, 51, 0.04)",
                padding: 28,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>
                FREE CHEAT SHEET
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                Drop your score in the article comments.
              </div>
              <p style={{ fontSize: 14, color: "#cccccc", marginBottom: 20, lineHeight: 1.55 }}>
                Comment your score under the article and Erich will reach out directly with a free Network Attacks cheat sheet — the identifying detail and the countermeasure for each attack, on one page.
              </p>
              <a
                href={`${articleUrl}/comments`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("cheat_sheet_cta_clicked", { quiz: "article_network_attacks", score, total: totalQ })}
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
                OPEN THE ARTICLE COMMENTS →
              </a>
            </div>

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
                onClick={() => track("subscribe_clicked", { quiz: "article_network_attacks" })}
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
          <div>NETWORK ATTACKS · CISSP D4</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
