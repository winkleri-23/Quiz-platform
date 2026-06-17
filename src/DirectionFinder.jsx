import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — DIRECTION FINDER QUIZ
// A diagnostic for people who've committed to cybersecurity but haven't picked
// which of the five career lanes from "How to Choose the Right Cybersecurity
// Role" fits them. Routes to: Offensive, SOC, Builder, GRC, Leader.
// =============================================================================

const COLORS = {
  red: "#e64833",
  black: "#000000",
  white: "#FFFFFF",
  dim: "#1a1a1a",
  border: "#2a2a2a",
  muted: "#888888",
};

const BASE_URL = "https://www.decodedsecurity.com/p/";
const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";
const GUMROAD_LEAD_MAGNET = "https://decodedsecurity.gumroad.com/l/CybersecurityBlueprint";
const SOURCE_ARTICLE_URL = "https://www.decodedsecurity.com/p/how-to-choose-the-right-cybersecurity";

const QUESTIONS = [
  {
    question: "It's a regular Tuesday. What does your ideal work day look like?",
    options: [
      { text: "Trying to break into a specific system. Looking for the weakness no one else found.", w: { offensive: 3 } },
      { text: "Watching the SIEM, hunting through logs, deciding what's real and what's noise.", w: { soc: 3 } },
      { text: "Designing how a new service will be built securely from day one.", w: { builder: 3 } },
      { text: "Reading a regulation, mapping it to reality, finding the gaps.", w: { grc: 3 } },
      { text: "Running 1:1s, unblocking the team, deciding what we ship next quarter.", w: { leader: 3 } },
    ],
  },
  {
    question: "Which sentence sounds most like you?",
    options: [
      { text: "I love finding the assumption everyone else missed.", w: { offensive: 3 } },
      { text: "I love patterns. Especially when one doesn't fit.", w: { soc: 3 } },
      { text: "I love drawing systems. Then making them real.", w: { builder: 3 } },
      { text: "I love translating between worlds — tech and business, rules and reality.", w: { grc: 3 } },
      { text: "I love getting smart people to do their best work.", w: { leader: 3 } },
    ],
  },
  {
    question: "How do you feel about being on call?",
    options: [
      { text: "Fine. When something's actually happening, I want to be there.", w: { soc: 3, offensive: 1 } },
      { text: "Sometimes — but I'd rather be doing focused work most days.", w: { builder: 2, offensive: 2 } },
      { text: "Hard pass. I want to control my time and work on long-horizon problems.", w: { grc: 3, leader: 2, builder: 1 } },
      { text: "I'd rather be the one deciding who's on call.", w: { leader: 3 } },
      { text: "Not sure yet — I haven't done it.", w: { soc: 1, builder: 1 } },
    ],
  },
  {
    question: "Pick the project that excites you most.",
    options: [
      { text: "A 6-week engagement against a critical app, ending in a breach scenario.", w: { offensive: 3 } },
      { text: "A detection rule that catches an attacker behavior nobody's flagging yet.", w: { soc: 3 } },
      { text: "Redesigning the cloud identity model — federation down to roles.", w: { builder: 3 } },
      { text: "Leading the ISO 27001 readiness program — certified in 9 months.", w: { grc: 3 } },
      { text: "Building a security team from scratch. Hiring plan, budget, year-one roadmap.", w: { leader: 3 } },
    ],
  },
  {
    question: "What kind of feedback loop do you want from your work?",
    options: [
      { text: "Instant. Did the exploit land or didn't it.", w: { offensive: 3, soc: 1 } },
      { text: "Daily. Did we catch what we were looking for.", w: { soc: 3 } },
      { text: "Quarterly. Did the design scale and stay secure.", w: { builder: 3 } },
      { text: "Annual. Did the audit pass. Did the program mature.", w: { grc: 3, leader: 1 } },
      { text: "Multi-year. Did the team grow. Did the strategy hold.", w: { leader: 3 } },
    ],
  },
  {
    question: "Looking five years out, what does success look like?",
    options: [
      { text: "I'm a respected pentester or red teamer. I find break-ins others can't.", w: { offensive: 3 } },
      { text: "I'm a senior SOC engineer or threat hunter. I shaped detection at my company.", w: { soc: 3 } },
      { text: "I'm a principal security architect or cloud security lead. My designs run the place.", w: { builder: 3 } },
      { text: "I'm head of GRC, risk, or compliance. Leadership trusts me on regulatory calls.", w: { grc: 3 } },
      { text: "I'm a CISO or security director. I run an org.", w: { leader: 3 } },
    ],
  },
];

const PATHS = {
  offensive: {
    label: "OFFENSIVE_OPERATOR",
    title: "The Offensive Operator",
    tagline: "You think in attacks. Your edge is finding the assumption everyone else trusts and proving it wrong.",
    diagnosis: "Offensive isn't a beginner lane. The good operators have ruthless networking and Linux depth before they touch a single exploit. Start there.",
    articles: [
      { title: "7 Networking Questions That Instantly Show Your Level", slug: "7-networking-questions-that-instantly", why: "Offensive work starts with network depth. Test where you are." },
      { title: "Top 5 Most Important Network Protocols", slug: "top-5-most-important-network-protocols", why: "Every attack rides on these. Know them cold." },
      { title: "This Is How I Explain Subnetting", slug: "this-is-how-i-explain-subnetting", why: "Subnetting is the networking topic that scares everyone — until you nail it." },
      { title: "This Is How I Explain DNS To Beginners", slug: "this-is-how-i-explain-dns-to-beginners", why: "DNS is the layer most attackers abuse. Know it cold." },
      { title: "What Are The Things That Keep Our Networks Safe", slug: "what-are-the-things-that-keep-our", why: "If you don't know what's protecting it, you won't know what to bypass." },
      { title: "Threat ≠ Risk ≠ Vulnerability", slug: "threat-risk-vulnerability-why-cissp", why: "The three words you'll need before any vuln chain makes sense." },
      { title: "Most Cybersecurity Beginners Study Wrong", slug: "most-cybersecurity-beginners-study", why: "Offensive isn't beginner-friendly. Don't approach it like one." },
    ],
  },
  soc: {
    label: "SOC_DEFENDER",
    title: "The SOC Defender",
    tagline: "You're built for the room where alarms go off. You like patterns, pressure, and the moment of figuring out what's real.",
    diagnosis: "The SOC is the best entry into operational cyber. The trick isn't memorizing tools — it's learning to read network conversations and tell signal from noise.",
    articles: [
      { title: "The Incident Response Mistakes That Cost Careers", slug: "the-incident-response-mistakes-that", why: "Make these mistakes in training, not in production." },
      { title: "The AAA Framework", slug: "the-aaa-framework-can-your-cowokers", why: "Authentication, authorization, accounting. The model every alert assumes." },
      { title: "7 Networking Questions That Instantly Show Your Level", slug: "7-networking-questions-that-instantly", why: "If you can't read a network conversation, you can't read an attack." },
      { title: "This Is How I Explain Subnetting", slug: "this-is-how-i-explain-subnetting", why: "Subnetting underpins every IP-based alert. Don't skip it." },
      { title: "Cybersecurity Controls from Zero to Hero", slug: "cybersecurity-controls-from-zero", why: "Controls are what fired the alert. Know which one and why." },
      { title: "Threat ≠ Risk ≠ Vulnerability", slug: "threat-risk-vulnerability-why-cissp", why: "Triage means knowing which one the alert represents." },
      { title: "Shadow AI Is the New Shadow IT", slug: "shadow-ai-is-the-new-shadow-it-only", why: "The next generation of weird alerts you'll have to make sense of." },
    ],
  },
  builder: {
    label: "BUILDER",
    title: "The Builder",
    tagline: "You don't react to security problems. You design them out. Architect, engineer, cloud — same lane, different altitudes.",
    diagnosis: "Builders make security invisible. Your edge is reasoning across systems — identity, network, data, code — and writing the patterns the rest of the org follows.",
    articles: [
      { title: "The 8 Security Principles Every CISSP Must Know", slug: "the-8-security-principles-every-cissp", why: "The principles every good design has to satisfy." },
      { title: "Cybersecurity Controls from Zero to Hero", slug: "cybersecurity-controls-from-zero", why: "The vocabulary for everything you're going to build." },
      { title: "The AAA Framework", slug: "the-aaa-framework-can-your-cowokers", why: "Identity and access is half the architect's job." },
      { title: "The Data Lifecycle: From Creation to Secure Destruction", slug: "the-data-lifecycle-from-creation", why: "Data isn't a feature. It's a system. Design for it." },
      { title: "5 Specific Steps For Software Developers To Get a Job in Cybersecurity", slug: "5-specific-steps-for-software-developers", why: "The crossover playbook if you're coming from engineering." },
      { title: "7 Networking Questions That Instantly Show Your Level", slug: "7-networking-questions-that-instantly", why: "Architects design across the network. Know it cold." },
      { title: "Security Policies, Standards, and Procedures", slug: "security-policies-standards-and-procedures", why: "What the org expects from the systems you'll design." },
    ],
  },
  grc: {
    label: "GRC_TRANSLATOR",
    title: "The GRC Translator",
    tagline: "You operate in the gap between tech and the business. The job is to make sure security actually reflects what's required and what's real.",
    diagnosis: "GRC isn't paperwork. It's leverage. Your job is to translate, prioritize, and decide — less code, more impact.",
    articles: [
      { title: "GRC for Beginners: The Exact Study Plan", slug: "grc-for-beginners-the-exact-study", why: "The roadmap, in order." },
      { title: "Security Policies, Standards, and Procedures", slug: "security-policies-standards-and-procedures", why: "The boring stuff that actually runs companies." },
      { title: "How Risk Management Frameworks Keep Systems Secure", slug: "how-risk-management-frameworks-keep", why: "The frameworks every GRC role expects you to know." },
      { title: "Audit Process: Planning, Execution", slug: "audit-process-planning-execution", why: "If CISA is on your list, start here." },
      { title: "15 Laws Every CISSP Candidate Must Know", slug: "15-laws-every-cissp-candidate-must", why: "Compliance lives or dies on these." },
      { title: "The Data Lifecycle: From Creation to Secure Destruction", slug: "the-data-lifecycle-from-creation", why: "Data governance, simplified." },
      { title: "Quantitative Risk Analysis: Let The Numbers Do All The Talking", slug: "quantitative-risk-analysis-let-the", why: "How to turn risk gut-feels into numbers that move budgets." },
    ],
  },
  leader: {
    label: "SECURITY_LEADER",
    title: "The Security Leader",
    tagline: "You're not measured by what you build or break. You're measured by what the team gets done.",
    diagnosis: "Security leadership is a translation job — risk to budget, threat to strategy, technical to executive. Learn the language of the room before you walk into it.",
    articles: [
      { title: "What Actually Makes a Cybersecurity Pro Stand Out", slug: "what-actually-makes-a-cybersecurity", why: "The traits that mark senior people. The same ones you'll hire for." },
      { title: "15 Laws Every CISSP Candidate Must Know", slug: "15-laws-every-cissp-candidate-must", why: "Leaders set policy. Policy comes from law." },
      { title: "How Risk Management Frameworks Keep Systems Secure", slug: "how-risk-management-frameworks-keep", why: "Risk is the lens leadership uses to allocate." },
      { title: "Security Policies, Standards, and Procedures", slug: "security-policies-standards-and-procedures", why: "Your org's defensive perimeter, in writing." },
      { title: "The 8 Security Principles Every CISSP Must Know", slug: "the-8-security-principles-every-cissp", why: "The foundation under every strategic call you'll make." },
      { title: "The Incident Response Mistakes That Cost Careers", slug: "the-incident-response-mistakes-that", why: "Leadership owns the incidents. Know what goes wrong." },
      { title: "What Does CEO Have To Do With Cybersecurity", slug: "what-does-ceo-have-to-do-with-cybersecurity", why: "How security fits into a C-suite. Who actually owns what." },
      { title: "Quantitative Risk Analysis: Let The Numbers Do All The Talking", slug: "quantitative-risk-analysis-let-the", why: "Numbers move budgets. Learn to speak in them." },
    ],
  },
};

// Tie-break priority: prefer more specialized paths when scores are equal
const PATH_PRIORITY = ["offensive", "soc", "builder", "grc", "leader"];

function buildExportText(pathKey) {
  const path = PATHS[pathKey];
  const sep = "=".repeat(56);
  const sub = "-".repeat(56);
  const lines = [];
  lines.push("DECODED SECURITY // YOUR CYBERSECURITY DIRECTION");
  lines.push(sep);
  lines.push("");
  lines.push(`DIRECTION: ${path.title}`);
  lines.push(`CODE:      [${path.label}]`);
  lines.push("");
  lines.push(path.tagline);
  lines.push("");
  lines.push("DIAGNOSIS");
  lines.push(sub);
  lines.push(path.diagnosis);
  lines.push("");
  lines.push("YOUR READING LIST");
  lines.push(sub);
  lines.push("");
  path.articles.forEach((article, idx) => {
    lines.push(`${String(idx + 1).padStart(2, "0")}. ${article.title}`);
    lines.push(`    ${article.why}`);
    lines.push(`    ${BASE_URL}${article.slug}`);
    lines.push("");
  });
  lines.push(sub);
  lines.push(`Based on:    ${SOURCE_ARTICLE_URL}`);
  lines.push(`Newsletter:  ${SUBSCRIBE_URL}`);
  lines.push("");
  return lines.join("\n");
}

function calculatePath(answers) {
  const scores = { offensive: 0, soc: 0, builder: 0, grc: 0, leader: 0 };
  answers.forEach((answerIdx, qIdx) => {
    const weights = QUESTIONS[qIdx].options[answerIdx].w;
    Object.entries(weights).forEach(([path, points]) => {
      scores[path] += points;
    });
  });
  let best = "soc";
  let bestScore = -1;
  PATH_PRIORITY.forEach((p) => {
    if (scores[p] > bestScore) {
      bestScore = scores[p];
      best = p;
    }
  });
  return { winner: best, scores };
}

export default function DirectionFinder() {
  const [stage, setStage] = useState("welcome"); // welcome | quiz | result
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

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

  const handleAnswer = (optionIdx) => {
    track("question_answered", { quiz: "direction", question: currentQ + 1, answer: optionIdx });
    const newAnswers = [...answers, optionIdx];
    setTransitioning(true);
    setTimeout(() => {
      if (currentQ + 1 < QUESTIONS.length) {
        setAnswers(newAnswers);
        setCurrentQ(currentQ + 1);
        setTransitioning(false);
      } else {
        const r = calculatePath(newAnswers);
        track("quiz_completed", { quiz: "direction", path: r.winner });
        setResult(r);
        setAnswers(newAnswers);
        setStage("result");
        setTransitioning(false);
      }
    }, 220);
  };

  const restart = () => {
    track("quiz_restarted", { quiz: "direction", from_path: result?.winner ?? null });
    setStage("welcome");
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
  };

  const startQuiz = () => {
    track("quiz_started", { quiz: "direction" });
    setStage("quiz");
    setCurrentQ(0);
    setAnswers([]);
  };

  const handleDownload = () => {
    if (!result) return;
    track("reading_list_exported", { quiz: "direction", path: result.winner });
    const text = buildExportText(result.winner);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decoded-security-${result.winner}-direction.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const progress = ((currentQ) / QUESTIONS.length) * 100;

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
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // QUIZ_02: DIRECTION</div>
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
            {stage === "quiz" && (
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5 }}>
                {String(currentQ + 1).padStart(2, "0")} / {String(QUESTIONS.length).padStart(2, "0")}
              </div>
            )}
          </div>
        </header>

        {/* PROGRESS BAR */}
        {stage === "quiz" && (
          <div style={{ height: 2, backgroundColor: COLORS.border, marginBottom: 48, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, backgroundColor: COLORS.red, transition: "width 400ms ease-out" }} />
          </div>
        )}

        {/* WELCOME */}
        {stage === "welcome" && (
          <div style={{ animation: "fadeIn 600ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 24 }}>
              &gt; SYSTEM INITIATED
            </div>
            <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 24, letterSpacing: -1 }}>
              Find your<br />
              <span style={{ color: COLORS.red }}>cybersecurity direction.</span>
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: "#cccccc", marginBottom: 12, maxWidth: 560 }}>
              You've committed to cyber. The next decision is which of the five career lanes is yours — and that decision shapes every cert, every course, every job application from here on.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: "#cccccc", marginBottom: 32, maxWidth: 560 }}>
              This 60-second diagnostic picks one of the five paths and gives you a reading list to start moving toward it today.
            </p>

            <a
              href={SOURCE_ARTICLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("source_article_clicked", { quiz: "direction" })}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.paddingLeft = "20px";
                e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.paddingLeft = "16px";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>
                BASED ON THE ARTICLE
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, color: COLORS.white }}>
                How to Choose the Right Cybersecurity Role <span style={{ color: COLORS.red }}>↗</span>
              </div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4, letterSpacing: 0.5 }}>
                Read the full breakdown of the five paths on Decoded Security
              </div>
            </a>

            <div style={{ display: "flex", gap: 32, marginBottom: 48, flexWrap: "wrap", fontSize: 13, color: COLORS.muted }}>
              <div><span style={{ color: COLORS.red }}>06</span> questions</div>
              <div><span style={{ color: COLORS.red }}>05</span> possible directions</div>
              <div><span style={{ color: COLORS.red }}>~60s</span> to complete</div>
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
              FIND MY DIRECTION →
            </button>

            {/* CROSS-QUIZ NAV */}
            <a
              href="/path"
              style={{
                display: "block",
                marginTop: 40,
                padding: "18px 20px",
                border: `1px solid ${COLORS.border}`,
                textDecoration: "none",
                color: COLORS.white,
                maxWidth: 560,
                transition: "all 150ms ease-out",
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
                WRONG QUIZ?
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.45, color: COLORS.white }}>
                If you're still figuring out where you are in your cyber journey (exploring, switching in, or stuck at your level), take the <span style={{ color: COLORS.red, fontWeight: 600 }}>Study Path Quiz →</span>
              </div>
            </a>
          </div>
        )}

        {/* QUIZ */}
        {stage === "quiz" && (
          <div
            key={currentQ}
            style={{
              opacity: transitioning ? 0 : 1,
              transform: transitioning ? "translateY(8px)" : "translateY(0)",
              transition: "opacity 200ms ease-out, transform 200ms ease-out",
            }}
          >
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>
              QUESTION_{String(currentQ + 1).padStart(2, "0")}
            </div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 600, lineHeight: 1.25, marginBottom: 36, letterSpacing: -0.5 }}>
              {QUESTIONS[currentQ].question}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {QUESTIONS[currentQ].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  style={{
                    fontFamily: fontStack,
                    fontSize: 15,
                    color: COLORS.white,
                    backgroundColor: "transparent",
                    border: `1px solid ${COLORS.border}`,
                    padding: "18px 20px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 150ms ease-out",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    lineHeight: 1.4,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.red;
                    e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.06)";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <span style={{ color: COLORS.red, fontSize: 12, fontWeight: 600 }}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span style={{ flex: 1 }}>{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RESULT */}
        {stage === "result" && result && (
          <div style={{ animation: "fadeIn 700ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>
              &gt; DIAGNOSTIC COMPLETE
            </div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, marginBottom: 12 }}>
              YOUR DIRECTION:
            </div>
            <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 8, letterSpacing: -1 }}>
              <span style={{ color: COLORS.red }}>{PATHS[result.winner].title}</span>
            </h1>
            <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 2, marginBottom: 28 }}>
              [{PATHS[result.winner].label}]
            </div>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: "#cccccc", marginBottom: 16, maxWidth: 600 }}>
              {PATHS[result.winner].tagline}
            </p>
            <div
              style={{
                borderLeft: `2px solid ${COLORS.red}`,
                paddingLeft: 20,
                marginBottom: 48,
                marginTop: 24,
                fontSize: 16,
                lineHeight: 1.55,
                color: COLORS.white,
                fontStyle: "italic",
              }}
            >
              {PATHS[result.winner].diagnosis}
            </div>

            {/* READING LIST */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 24 }}>
                &gt; YOUR READING LIST
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {PATHS[result.winner].articles.map((article, idx) => (
                  <a
                    key={idx}
                    href={`${BASE_URL}${article.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("article_clicked", { quiz: "direction", path: result.winner, slug: article.slug, position: idx + 1 })}
                    style={{
                      display: "block",
                      padding: "20px 0",
                      borderBottom: `1px solid ${COLORS.border}`,
                      textDecoration: "none",
                      color: COLORS.white,
                      transition: "all 150ms",
                      animation: `fadeInUp 500ms ease-out ${idx * 80}ms both`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "12px"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "0px"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>
                          ARTICLE_{String(idx + 1).padStart(2, "0")}
                        </div>
                        <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>
                          {article.title}
                        </div>
                        <div style={{ fontSize: 13, color: "#aaaaaa", lineHeight: 1.5 }}>
                          {article.why}
                        </div>
                      </div>
                      <div style={{ color: COLORS.red, fontSize: 18, flexShrink: 0, marginTop: 4 }}>↗</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* EXPORT */}
            <div
              style={{
                border: `1px solid ${COLORS.border}`,
                padding: 24,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 10 }}>
                EXPORT
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>
                Save your reading list
              </div>
              <p style={{ fontSize: 13, color: "#aaaaaa", marginBottom: 18, lineHeight: 1.5 }}>
                Take it with you. Paste it into Notes, Notion, or your inbox so you actually come back to it.
              </p>
              <button
                onClick={handleDownload}
                style={{
                  fontFamily: fontStack,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  color: COLORS.white,
                  backgroundColor: "transparent",
                  border: `1px solid ${COLORS.border}`,
                  padding: "12px 20px",
                  cursor: "pointer",
                  transition: "all 150ms ease-out",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; }}
              >
                DOWNLOAD .TXT ↓
              </button>
            </div>

            {/* LEAD MAGNET */}
            <div
              style={{
                border: `1px solid ${COLORS.red}`,
                padding: 28,
                marginBottom: 20,
                backgroundColor: "rgba(230, 72, 51, 0.04)",
              }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>
                90-DAY BLUEPRINT
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                The 90-Day Cybersecurity Job Blueprint
              </div>
              <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 20, lineHeight: 1.5 }}>
                A 90-day plan for each of the five paths. Stop figuring it out yourself. 4.8 stars, 14-day refund.
              </p>
              <a
                href={GUMROAD_LEAD_MAGNET}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("lead_magnet_clicked", { quiz: "direction", path: result.winner })}
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
                GET THE BLUEPRINT →
              </a>
            </div>

            {/* SUBSCRIBE */}
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
                Get one practical cybersecurity article every week.
              </div>
              <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 20, lineHeight: 1.5 }}>
                1,000+ readers. Built for people serious about the direction you just picked.
              </p>
              <a
                href={SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("subscribe_clicked", { quiz: "direction", path: result.winner })}
                style={{
                  display: "inline-block",
                  fontFamily: fontStack,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  color: COLORS.white,
                  backgroundColor: "transparent",
                  textDecoration: "none",
                  padding: "14px 28px",
                  border: `1px solid ${COLORS.white}`,
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
              ↻ RESTART DIAGNOSTIC
            </button>

            {/* CROSS-QUIZ NAV */}
            <a
              href="/path"
              style={{
                display: "block",
                marginTop: 32,
                padding: "18px 20px",
                border: `1px solid ${COLORS.border}`,
                textDecoration: "none",
                color: COLORS.white,
                transition: "all 150ms ease-out",
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
                NOT SURE WHERE YOU ARE?
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.45, color: COLORS.white }}>
                If you want a reading list matched to your current level instead, take the <span style={{ color: COLORS.red, fontWeight: 600 }}>Study Path Quiz →</span>
              </div>
            </a>
          </div>
        )}

        {/* FOOTER */}
        <footer style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // DIRECTION_FINDER_v1</div>
          <div>BUILT FOR PEOPLE WHO'VE PICKED CYBER</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
