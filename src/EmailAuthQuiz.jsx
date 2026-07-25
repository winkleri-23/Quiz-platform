import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — SPF, DKIM, DMARC (ARTICLE QUIZ)
// Email authentication fundamentals for CISSP Domain 4. Result page includes
// an interactive domain-check helper and a comments CTA.
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
  title: "Anyone Can Send an Email as Your CEO. Here Is What Actually Stops Them",
  slug: "anyone-can-send-an-email-as-your",
};

const QUIZ = {
  title: "SPF, DKIM, DMARC — Email Authentication",
  subtitle: "Why email spoofing is possible and what actually stops it. The three mechanisms every cybersecurity interview asks about — and the one detail most people miss.",
  certs: "CC  ·  CISSP D4  ·  SECURITY+",
  questions: [
    {
      q: "Why is email spoofing technically possible in the first place?",
      options: [
        "SMTP was designed with weak encryption that has since been broken.",
        "SMTP was designed in 1982 without any built-in authentication of the sender.",
        "Modern email clients disable SPF and DKIM by default.",
        "DNS records for email are not cached long enough.",
      ],
      correct: 1,
      explanation: "SMTP was created in 1982 for a small trusted network of researchers, so nobody built in sender authentication. The protocol happily delivers an email claiming to be from anyone. SPF, DKIM, and DMARC were bolted on decades later to close that gap.",
    },
    {
      q: "Every email has two sender addresses. Which pair correctly identifies them?",
      options: [
        "The From header (visible) and the To header (recipient).",
        "The envelope sender (used for routing) and the From header (visible in inbox).",
        "The IP address and the domain name.",
        "The subject line and the body signature.",
      ],
      correct: 1,
      explanation: "Every email has an ENVELOPE SENDER used by mail servers to route the message (you never see it) and a FROM HEADER shown in your inbox. These two do NOT have to match — the envelope can say attacker@evil.com while the visible From says ceo@yourcompany.com. That mismatch is the entire basis for email spoofing.",
    },
    {
      q: "Which of the following best describes SPF (Sender Policy Framework)?",
      options: [
        "A cryptographic signature added to each email.",
        "A DNS record that lists which servers are allowed to send email on behalf of a domain.",
        "An enforcement policy telling receivers what to do with failed messages.",
        "A hashing algorithm used to verify email attachments.",
      ],
      correct: 1,
      explanation: "SPF is a DNS record — the domain owner's \"guest list\" of servers authorized to send email on its behalf. The receiving mail server checks whether the sender is on that list. (A) describes DKIM; (C) describes DMARC.",
    },
    {
      q: "Which address does SPF actually check against the domain's guest list?",
      options: [
        "The From header shown in the inbox.",
        "The envelope sender used for routing.",
        "The subject line's stated organization.",
        "The DKIM signing domain.",
      ],
      correct: 1,
      explanation: "SPF checks the ENVELOPE sender's domain — not the From header. An attacker can spoof a legitimate-looking From header while using their own domain (which they control) as the envelope sender. SPF passes because it's their own guest list. This is exactly why SPF alone does not stop spoofing.",
    },
    {
      q: "Which of the following best describes DKIM (DomainKeys Identified Mail)?",
      options: [
        "A list of IP addresses authorized to send email for a domain.",
        "A cryptographic signature added by the sending server and verified via a public key published in DNS.",
        "A DMARC policy field controlling enforcement.",
        "A protocol replacement for SMTP.",
      ],
      correct: 1,
      explanation: "DKIM adds a digital signature to the message. The sending server signs with a private key; the receiver fetches the matching public key from DNS and verifies it. A valid DKIM signature proves the message really was signed by that domain AND the content was not modified in transit.",
    },
    {
      q: "Why does DKIM alone still fail to stop spoofing?",
      options: [
        "DKIM signatures are trivial to forge.",
        "DKIM proves the message was signed by SOME domain — not that it was signed by the domain shown in the From header.",
        "DKIM only works if the recipient uses the same email client as the sender.",
        "DKIM requires SPF to be disabled to function.",
      ],
      correct: 1,
      explanation: "A valid DKIM signature only proves the message was signed by whatever domain generated the signature. An attacker can legitimately sign their message with a valid DKIM signature from evil.com while the From header still displays your bank's domain. Valid seal, wrong sender.",
    },
    {
      q: "What key check does DMARC add that SPF and DKIM alone do not perform?",
      options: [
        "It encrypts the message body.",
        "It requires that the SPF or DKIM domain aligns with the visible From header domain.",
        "It scans attachments for malware.",
        "It blocks all emails without a subject line.",
      ],
      correct: 1,
      explanation: "DMARC adds the alignment check that was missing. It requires that at least one of SPF (envelope domain) or DKIM (signing domain) matches the visible From header domain. This is the missing piece — DMARC is what actually protects the address a human sees.",
    },
    {
      q: "A domain publishes a DMARC record with `p=reject`. What happens to a message that fails DMARC alignment?",
      options: [
        "It is delivered to the recipient with a warning banner.",
        "It is delivered to the recipient's spam or junk folder.",
        "It is refused by the receiving server and never reaches the recipient's inbox.",
        "It is delivered normally, and the failure is logged silently.",
      ],
      correct: 2,
      explanation: "DMARC has three policies. `p=none` means \"watch and report but don't block\" (monitoring only). `p=quarantine` sends failed messages to spam. `p=reject` refuses them entirely — they never reach the inbox. Reject is the strongest policy and the only one that fully blocks spoofed messages.",
    },
    {
      q: "Which statement correctly maps each mechanism to its role in the email authentication stack?",
      options: [
        "SPF signs the message; DKIM lists allowed servers; DMARC routes email.",
        "SPF lists allowed servers; DKIM signs the message; DMARC enforces alignment with the visible From header.",
        "SPF encrypts the message; DKIM authenticates the recipient; DMARC scans attachments.",
        "All three do exactly the same check under different names.",
      ],
      correct: 1,
      explanation: "The three-part model: SPF is the guest list (WHO is allowed to send). DKIM is the wax seal (was the message signed and unmodified). DMARC is the enforcer (does any of this match the sender the user SEES). All three together — that's the modern anti-spoofing stack.",
    },
    {
      q: "You audit a domain and find valid SPF and DKIM records but no DMARC record. What is the primary risk?",
      options: [
        "The domain cannot send email at all until DMARC is configured.",
        "An attacker can send spoofed emails with a From header showing this domain while passing SPF and DKIM checks using their own domain.",
        "All emails from this domain will be delivered to spam by default.",
        "The domain's DNS records will expire faster.",
      ],
      correct: 1,
      explanation: "Without DMARC there is no alignment check. An attacker sends an email with envelope sender attacker@evil.com (passes evil.com's SPF and DKIM) and a From header showing your bank. Both mechanisms return \"PASS\" — receiving servers have no requirement to match them against the visible From, so the spoof lands in the inbox. DMARC is the piece that fills the gap.",
    },
  ],
};

// Sanitize a user-typed domain into just the hostname
const cleanDomain = (input) =>
  (input || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .split(":")[0];

export default function EmailAuthQuiz() {
  const [stage, setStage] = useState("welcome");
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [domainInput, setDomainInput] = useState("");
  const [copiedCmd, setCopiedCmd] = useState(null);

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
  const commentsUrl = `${articleUrl}/comments`;

  const startQuiz = () => {
    track("quiz_started", { quiz: "article_email_auth" });
    setStage("question");
    setCurrentQ(0);
    setSelectedIdx(null);
    setAnswers([]);
  };

  const handleAnswer = (idx) => {
    if (selectedIdx !== null) return;
    const correct = QUIZ.questions[currentQ].correct;
    track("question_answered", {
      quiz: "article_email_auth",
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
      track("quiz_completed", { quiz: "article_email_auth", score, total: totalQ });
      setStage("result");
    }
  };

  const restart = () => {
    track("quiz_restarted", { quiz: "article_email_auth" });
    setStage("welcome");
    setCurrentQ(0);
    setSelectedIdx(null);
    setAnswers([]);
  };

  const copyCommand = async (cmdKey, text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      track("domain_check_copied", { quiz: "article_email_auth", cmd: cmdKey });
      setCopiedCmd(cmdKey);
      setTimeout(() => setCopiedCmd(null), 2000);
    } catch (e) {
      // silent
    }
  };

  const progress = (currentQ / totalQ) * 100;
  const score = answers.filter((a, i) => a === QUIZ.questions[i].correct).length;
  const missed = answers.map((a, i) => ({ idx: i, correct: a === QUIZ.questions[i].correct })).filter((x) => !x.correct);

  const domain = cleanDomain(domainInput) || "example.com";
  const hasDomain = cleanDomain(domainInput).length > 0;

  const commands = [
    { key: "dig-spf",       label: "Mac / Linux — SPF and other TXT records", text: `dig +short TXT ${domain}` },
    { key: "dig-dmarc",     label: "Mac / Linux — DMARC record",              text: `dig +short TXT _dmarc.${domain}` },
    { key: "nslookup-spf",  label: "Windows — SPF and other TXT records",     text: `nslookup -type=TXT ${domain}` },
    { key: "nslookup-dmarc",label: "Windows — DMARC record",                  text: `nslookup -type=TXT _dmarc.${domain}` },
  ];

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
              onClick={() => track("source_article_clicked", { quiz: "article_email_auth", from: "welcome" })}
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
                Read the article first. Then come back and test if you can explain each mechanism the way the exam expects.
              </div>
            </a>

            <div style={{ display: "flex", gap: 32, marginBottom: 48, flexWrap: "wrap", fontSize: 13, color: COLORS.muted }}>
              <div><span style={{ color: COLORS.red }}>{String(totalQ).padStart(2, "0")}</span> questions</div>
              <div><span style={{ color: COLORS.red }}>~6min</span> to complete</div>
              <div><span style={{ color: COLORS.red }}>Free</span></div>
              <div><span style={{ color: COLORS.red }}>+</span> live domain checker</div>
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
                  onClick={() => track("article_clicked", { quiz: "article_email_auth", question: currentQ + 1 })}
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
              {score === totalQ && "Perfect. You now understand something most IT professionals only pretend to."}
              {score >= totalQ - 1 && score < totalQ && "Almost perfect. The one you missed is worth re-reading — email auth questions come up in every interview."}
              {score >= totalQ * 0.7 && score < totalQ - 1 && "Solid. You've got the framework — close the gaps below and retake."}
              {score >= totalQ * 0.5 && score < totalQ * 0.7 && "Mixed results. The article makes each mechanism crisp — re-read and retake."}
              {score < totalQ * 0.5 && "Worth re-reading the article. SPF, DKIM, and DMARC come up in every SOC and IT interview — this topic is high-leverage."}
            </p>

            {missed.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>
                  &gt; REVISIT THE ARTICLE
                </div>
                <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20, lineHeight: 1.5 }}>
                  {missed.length === 1 ? "One question slipped" : `${missed.length} questions slipped`}. The article walks through each mechanism.
                </p>
                <a
                  href={articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("revisit_article_clicked", { quiz: "article_email_auth" })}
                  style={{
                    display: "block",
                    padding: "20px 22px",
                    border: `1px solid ${COLORS.border}`,
                    textDecoration: "none",
                    color: COLORS.white,
                    transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>
                    READ THE SOURCE
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>
                    {SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span>
                  </div>
                </a>
              </div>
            )}

            {/* INTERACTIVE DOMAIN CHECKER */}
            <div
              style={{
                border: `1px solid ${COLORS.border}`,
                padding: 24,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>
                &gt; TRY IT YOURSELF
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.25 }}>
                Check any domain's email security.
              </div>
              <p style={{ fontSize: 13, color: "#bbbbbb", marginBottom: 18, lineHeight: 1.55 }}>
                Type a domain — your employer's, your bank's, your school's. Copy the command, paste it into your terminal, and look at what comes back.
              </p>

              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="e.g. google.com or your-employer.com"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  fontFamily: fontStack,
                  fontSize: 15,
                  color: COLORS.white,
                  backgroundColor: "transparent",
                  border: `1px solid ${hasDomain ? COLORS.red : COLORS.border}`,
                  padding: "12px 14px",
                  outline: "none",
                  marginBottom: 20,
                  transition: "border-color 150ms",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.red; }}
                onBlur={(e) => { if (!hasDomain) e.currentTarget.style.borderColor = COLORS.border; }}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {commands.map((cmd) => (
                  <div key={cmd.key}>
                    <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" }}>
                      {cmd.label}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "stretch",
                        border: `1px solid ${COLORS.border}`,
                        backgroundColor: "rgba(255, 255, 255, 0.02)",
                      }}
                    >
                      <code
                        style={{
                          flex: 1,
                          padding: "10px 14px",
                          fontFamily: fontStack,
                          fontSize: 13,
                          color: hasDomain ? COLORS.white : COLORS.muted,
                          overflowX: "auto",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cmd.text}
                      </code>
                      <button
                        onClick={() => copyCommand(cmd.key, cmd.text)}
                        style={{
                          fontFamily: fontStack,
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: 1.5,
                          color: copiedCmd === cmd.key ? COLORS.green : COLORS.white,
                          backgroundColor: "transparent",
                          border: "none",
                          borderLeft: `1px solid ${COLORS.border}`,
                          padding: "10px 16px",
                          cursor: "pointer",
                          transition: "background-color 150ms, color 150ms",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => { if (copiedCmd !== cmd.key) e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.08)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                        {copiedCmd === cmd.key ? "COPIED ✓" : "COPY"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 18, fontSize: 12, color: COLORS.muted, lineHeight: 1.6 }}>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ color: COLORS.red, fontWeight: 600 }}>What to look for:</span> lines starting with <code style={{ color: "#dddddd" }}>v=spf1</code>, <code style={{ color: "#dddddd" }}>v=DKIM1</code>, or <code style={{ color: "#dddddd" }}>v=DMARC1</code>.
                </div>
                <div>
                  <span style={{ color: COLORS.red, fontWeight: 600 }}>The DMARC verdict is the</span> <code style={{ color: "#dddddd" }}>p=</code> value:{" "}
                  <code style={{ color: "#dddddd" }}>none</code> = watching only,{" "}
                  <code style={{ color: "#dddddd" }}>quarantine</code> = spam,{" "}
                  <code style={{ color: "#dddddd" }}>reject</code> = never delivered.
                </div>
              </div>
            </div>

            {/* COMMENTS CTA */}
            <div
              style={{
                border: `1px solid ${COLORS.red}`,
                backgroundColor: "rgba(230, 72, 51, 0.04)",
                padding: 28,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>
                SHARE YOUR FINDINGS
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                Drop the domain and its DMARC policy in the comments.
              </div>
              <p style={{ fontSize: 14, color: "#cccccc", marginBottom: 20, lineHeight: 1.55 }}>
                What did your employer's domain reveal? Your bank's? Your school's? Comment the domain and the <code style={{ color: "#dddddd" }}>p=</code> value on the article — Erich reads every one and will tell you if the setup would hold up in an interview.
              </p>
              <a
                href={commentsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("comments_cta_clicked", { quiz: "article_email_auth", score, total: totalQ })}
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
                1,420+ readers preparing for CC, CISSP, and Security+. No fluff.
              </p>
              <a
                href={SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("subscribe_clicked", { quiz: "article_email_auth" })}
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
          <div>SPF · DKIM · DMARC · CISSP D4</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible, input:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
