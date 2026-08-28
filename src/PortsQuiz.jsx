import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — PORTS & SCANNING (ARTICLE QUIZ)
// What a port is, the three scan states, well-known ports, and the myth that
// "open port = vulnerability." Maps to CC, CISSP D4, and Security+.
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

// TODO: Update slug once article publishes with its final URL.
const SOURCE_ARTICLE = {
  title: "What Is a Port? (And Why Every Cybersecurity Beginner Needs to Understand Scanning)",
  slug: "what-is-a-port",
};

const QUIZ = {
  title: "Ports and Scanning",
  subtitle: "The 8 port questions every interviewer, SOC lead, and CISSP exam will throw at you. Includes the trap most beginners fail: what does \"open port\" actually mean?",
  certs: "CC  ·  CISSP D4  ·  SECURITY+",
  questions: [
    {
      q: "What does a port number actually identify on a host?",
      options: [
        "The IP address of the destination machine.",
        "The specific service or application the incoming traffic is meant for.",
        "The physical network interface (the NIC).",
        "The MAC address used for delivery on the local network.",
      ],
      correct: 1,
      explanation: "The IP identifies the building; the port identifies the door — i.e., which service on that host the traffic is for. A single machine can run a web server, a mail server, and an SSH daemon at the same time, distinguished only by port number.",
    },
    {
      q: "A port scan returns \"22/tcp filtered.\" What is the correct interpretation?",
      options: [
        "SSH is running and reachable.",
        "The host is reachable but nothing is listening on port 22.",
        "The scanner received no reply — usually because a firewall silently dropped the probe.",
        "Port 22 is reserved by the operating system.",
      ],
      correct: 2,
      explanation: "Filtered means silence. The scanner cannot tell whether a service is there or not because something (usually a firewall) blocked the knock. This is different from closed, which means the host actively replied \"nobody home.\"",
    },
    {
      q: "A scan of a server returns \"3389/tcp closed.\" What can you conclude?",
      options: [
        "A firewall is blocking access to RDP from your network.",
        "The host is reachable but no service is listening on port 3389.",
        "RDP is open but requires authentication before responding.",
        "The scan tool timed out before receiving a response.",
      ],
      correct: 1,
      explanation: "Closed = the host itself replied \"nothing here.\" That is different from filtered (silence, blocked by a firewall) and different from open (a service replied). Closed and filtered are not the same, and the CISSP loves to trap people who conflate them.",
    },
    {
      q: "Which statement most accurately reflects the relationship between open ports and vulnerabilities?",
      options: [
        "Every open port is a vulnerability by definition.",
        "A port is only a vulnerability if it should not be open, or if the service behind it is outdated or misconfigured.",
        "Ports higher than 1024 are safe; ports below 1024 are always dangerous.",
        "Open ports are only vulnerabilities on legacy operating systems.",
      ],
      correct: 1,
      explanation: "Open port ≠ vulnerability. Your web server is supposed to have 443 open — that is not a finding. It becomes a finding when the port should not be exposed, when the service behind it is unpatched, or when the service is misconfigured (no auth, default creds, etc.).",
    },
    {
      q: "A penetration tester and a defensive SOC analyst both run Nmap against the same host and get identical output. What actually differs between the two activities?",
      options: [
        "The pentester's scan is technically more accurate.",
        "The defender uses a different set of protocols under the hood.",
        "Only intent and permission — the tool and technique are identical.",
        "The pentester sees more ports because the defender's firewall silently blocks their own scans.",
      ],
      correct: 2,
      explanation: "Same tool. Same technique. Same output. The only difference is intent (finding a way in vs finding what needs protecting) and permission (an authorized engagement vs an unauthorized scan). A flashlight in a burglar's hand and a homeowner's hand is still a flashlight.",
    },
    {
      q: "A colleague says \"we need to open port 22 so the mail server can send email.\" What is wrong with that statement?",
      options: [
        "Port 22 is only for inbound traffic; email needs outbound.",
        "Port 22 is for SSH — email is delivered over SMTP-family ports (25, 587, 465), not 22.",
        "Port 22 must be paired with port 21 (FTP) for email to work.",
        "Port 22 has to be closed at the firewall for regulatory compliance.",
      ],
      correct: 1,
      explanation: "22 is SSH — secure remote shell, not mail. Mail servers use 25 (server-to-server SMTP), 587 (client submission with TLS), or 465 (legacy SMTPS). Confusing the well-known port map is one of the most common beginner mistakes and one interviewers routinely test.",
    },
    {
      q: "You discover port 3389 (RDP) is open on a public-facing server. What is the mature response?",
      options: [
        "File a critical vulnerability finding immediately.",
        "Verify whether RDP is intentionally exposed with a documented justification, whether the service is patched and MFA-enforced, and whether access is IP-restricted — the port being open alone is not a finding.",
        "Recommend closing all non-web ports on the server without further investigation.",
        "Ignore it — RDP is only dangerous when hosted on Windows domain controllers.",
      ],
      correct: 1,
      explanation: "The mature answer is always context. \"Is this port supposed to be open?\" and \"Is the thing behind it properly locked?\" are the two real questions. Auto-flagging every open port as critical is what makes junior analysts drown in false positives and get ignored by engineering teams.",
    },
    {
      q: "True or false: \"Port 443 must always run HTTPS traffic.\"",
      options: [
        "True — port numbers are protocol-bound by design.",
        "True — the IANA port registry technically enforces which service runs on which port.",
        "False — port numbers are conventions, not rules. Any service can be configured to listen on any port, including running HTTPS on a non-standard port or non-HTTPS traffic on 443.",
        "False — port 443 is officially reserved for VPN traffic.",
      ],
      correct: 2,
      explanation: "Port numbers are conventions maintained by IANA, not enforcement. Nothing in the network stack stops you from running SSH on port 8443 or a web server on port 22. Attackers know this — malware routinely uses uncommon ports precisely because defenders assume \"port 443 = HTTPS.\"",
    },
  ],
};

export default function PortsQuiz() {
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
    track("quiz_started", { quiz: "article_ports" });
    setStage("question");
    setCurrentQ(0);
    setSelectedIdx(null);
    setAnswers([]);
  };

  const handleAnswer = (idx) => {
    if (selectedIdx !== null) return;
    const correct = QUIZ.questions[currentQ].correct;
    track("question_answered", {
      quiz: "article_ports",
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
      track("quiz_completed", { quiz: "article_ports", score, total: totalQ });
      setStage("result");
    }
  };

  const restart = () => {
    track("quiz_restarted", { quiz: "article_ports" });
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
            <a href="/" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2 }}
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
              onClick={() => track("source_article_clicked", { quiz: "article_ports", from: "welcome" })}
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
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4, letterSpacing: 0.5 }}>Read it first. Then come back and see if the closed-vs-filtered and "open ≠ vulnerable" traps catch you.</div>
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
                  onClick={() => track("article_clicked", { quiz: "article_ports", question: currentQ + 1 })}
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
              {score === totalQ && "Perfect. You'd handle the port and scanning questions in any SOC interview or CISSP exam cleanly."}
              {score >= totalQ - 1 && score < totalQ && "Almost perfect. The one that slipped is worth re-reading before exam day."}
              {score >= totalQ * 0.7 && score < totalQ - 1 && "Solid. You've got the shape — patch the gaps below and retake."}
              {score >= totalQ * 0.5 && score < totalQ * 0.7 && "Mixed. Closed-vs-filtered and \"open port ≠ vulnerability\" are where most people stumble. Re-read those sections, then retake."}
              {score < totalQ * 0.5 && "Worth re-reading the article end-to-end. Ports come up in almost every networking-adjacent interview — the details matter."}
            </p>

            {missed.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; REVISIT THE ARTICLE</div>
                <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20, lineHeight: 1.5 }}>
                  {missed.length === 1 ? "One question slipped" : `${missed.length} questions slipped`}. The article walks through each of these.
                </p>
                <a href={articleUrl} target="_blank" rel="noopener noreferrer"
                  onClick={() => track("revisit_article_clicked", { quiz: "article_ports" })}
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

            {/* PORT SCANNER TOOL cross-promo */}
            <div style={{ border: `1px solid ${COLORS.red}`, backgroundColor: "rgba(230,72,51,0.04)", padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>NOW SEE IT LIVE</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>Try the Port Scanner Visualizer</div>
              <p style={{ fontSize: 13, color: "#cccccc", marginBottom: 14, lineHeight: 1.55 }}>
                Every host is a building. Every port is a door. Knock any door and see what opens, what stays shut, and what the firewall silently blocks. Six real target scenarios.
              </p>
              <a href="/tools/port-scanner"
                onClick={() => track("cross_promo_clicked", { from: "article_ports", to: "port_scanner" })}
                style={{
                  display: "inline-block", fontFamily: fontStack, fontSize: 13, fontWeight: 600,
                  letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
                  textDecoration: "none", padding: "12px 22px",
                }}
              >
                OPEN THE SCANNER →
              </a>
            </div>

            <div style={{ border: `1px solid ${COLORS.border}`, padding: 28, marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 12 }}>NEWSLETTER</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>Get one practical breakdown like this every week.</div>
              <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 20, lineHeight: 1.5 }}>1,450+ readers preparing for CC, CISSP, and Security+. No fluff.</p>
              <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer"
                onClick={() => track("subscribe_clicked", { quiz: "article_ports" })}
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
          <div>PORTS & SCANNING · CISSP D4</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
