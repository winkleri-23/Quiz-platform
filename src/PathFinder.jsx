import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — PATH FINDER QUIZ
// A diagnostic tool that turns visitors into subscribers by routing them to
// the right articles based on where they are in their cybersecurity journey.
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
const GUMROAD_LEAD_MAGNET = "https://decodedsecurity.gumroad.com/l/Top10_Cybersecurity_Concepts";
const SOURCE_ARTICLE_URL = "https://www.decodedsecurity.com/p/how-to-choose-the-right-cybersecurity";

const QUESTIONS = [
  {
    question: "Where are you in your cybersecurity journey?",
    options: [
      { text: "Just exploring. Curious about the field.", w: { foundation: 3, switcher: 1, cc: 1 } },
      { text: "Actively planning to switch careers into cyber.", w: { switcher: 3, foundation: 1, cc: 1 } },
      { text: "Junior cyber role (0–2 years in).", w: { stuck: 2, grc: 1, cissp: 1 } },
      { text: "Mid-level pro looking for the next step.", w: { stuck: 2, cissp: 2 } },
      { text: "Senior, ready for advanced specialization.", w: { cissp: 3, stuck: 1 } },
    ],
  },
  {
    question: "What's your biggest frustration right now?",
    options: [
      { text: "I have no idea where to even start.", w: { foundation: 3, cc: 1 } },
      { text: "I'm overwhelmed by too many options.", w: { switcher: 2, foundation: 2, cc: 1 } },
      { text: "I keep starting things and never finishing.", w: { switcher: 2, stuck: 1 } },
      { text: "I know the basics but feel stuck at my level.", w: { stuck: 3, cissp: 1 } },
      { text: "I want to specialize but don't know in what.", w: { grc: 2, cissp: 2 } },
    ],
  },
  {
    question: "When you imagine your ideal cybersecurity work, you're...",
    options: [
      { text: "Reading policies, assessing risks, advising leadership.", w: { grc: 3 } },
      { text: "In a SOC, hunting threats, working with logs.", w: { foundation: 1, stuck: 2 } },
      { text: "Auditing systems, checking compliance.", w: { grc: 3 } },
      { text: "Architecting secure systems and controls.", w: { cissp: 3 } },
      { text: "Honestly, I'm still figuring it out.", w: { switcher: 2, foundation: 2, cc: 1 } },
    ],
  },
  {
    question: "How comfortable are you with networking fundamentals (TCP/IP, DNS, subnetting)?",
    options: [
      { text: "I've never heard most of these terms.", w: { foundation: 3, cc: 2 } },
      { text: "I recognize them but couldn't explain them.", w: { foundation: 2, switcher: 1, cc: 1 } },
      { text: "I can use them in conversation.", w: { grc: 1, stuck: 2 } },
      { text: "I can explain them in detail.", w: { cissp: 2, stuck: 1 } },
      { text: "I could teach this stuff.", w: { cissp: 3 } },
    ],
  },
  {
    question: "Which certification feels most relevant to your next 12 months?",
    options: [
      { text: "ISC2 CC (Certified in Cybersecurity).", w: { cc: 4, foundation: 1 } },
      { text: "Security+ (or none yet).", w: { foundation: 2, switcher: 2 } },
      { text: "CISA or another GRC cert.", w: { grc: 3 } },
      { text: "CISSP.", w: { cissp: 3 } },
      { text: "A specialized cert (cloud, offensive, etc.).", w: { stuck: 2, cissp: 1 } },
      { text: "I'm not focused on certs right now.", w: { foundation: 1, switcher: 1, stuck: 1 } },
    ],
  },
  {
    question: "What does success look like 12 months from now?",
    options: [
      { text: "I've chosen a clear direction in cyber.", w: { foundation: 3, switcher: 1, cc: 1 } },
      { text: "I've landed my first cybersecurity job.", w: { switcher: 3 } },
      { text: "I've passed a major certification.", w: { cissp: 2, grc: 1, cc: 3 } },
      { text: "I've grown into a more senior role.", w: { stuck: 3, cissp: 1 } },
      { text: "I'm the go-to GRC person at my company.", w: { grc: 3 } },
    ],
  },
];

const PATHS = {
  foundation: {
    label: "FOUNDATION_BUILDER",
    title: "The Foundation Builder",
    tagline: "You're early on the path. Your edge is building rock-solid fundamentals before chasing certifications or specializations.",
    diagnosis: "Most beginners skip the basics and pay for it later. Don't be one of them. Get the fundamentals right first, then everything else compounds.",
    articles: [
      { title: "Start Here: The Decoded Security Roadmap", slug: "start-here-decoded-security-roadmap", why: "The map of where you're going." },
      { title: "Cybersecurity Controls from Zero to Hero", slug: "cybersecurity-controls-from-zero", why: "The single concept that anchors everything else." },
      { title: "The AAA Framework", slug: "the-aaa-framework-can-your-cowokers", why: "Authentication, authorization, accounting. Explained for real people." },
      { title: "Threat ≠ Risk ≠ Vulnerability", slug: "threat-risk-vulnerability-why-cissp", why: "The three words everyone confuses. Stop being one of them." },
      { title: "7 Networking Questions That Instantly Show Your Level", slug: "7-networking-questions-that-instantly", why: "Self-test before you waste money on a course." },
      { title: "This Is How I Explain Subnetting", slug: "this-is-how-i-explain-subnetting", why: "The networking topic that scares everyone, demystified." },
    ],
  },
  cc: {
    label: "CC_CANDIDATE",
    title: "The CC Candidate",
    tagline: "You're going for ISC2's Certified in Cybersecurity — the cleanest entry into the field. The cert that gets you taken seriously before you've worked a day in cyber.",
    diagnosis: "The CC isn't a vocab test. It's a structured proof that you understand how security actually works. Treat it like a roadmap, not a cram. Cover all five domains, not just the ones that feel easy.",
    articles: [
      { title: "Start Here: The Decoded Security Roadmap", slug: "start-here-decoded-security-roadmap", why: "Orient yourself before opening a single CC study guide." },
      { title: "Cybersecurity Controls from Zero to Hero", slug: "cybersecurity-controls-from-zero", why: "The concept that anchors Domain 1." },
      { title: "Threat ≠ Risk ≠ Vulnerability", slug: "threat-risk-vulnerability-why-cissp", why: "The three words the CC exam tests over and over." },
      { title: "The 8 Security Principles Every CISSP Must Know", slug: "the-8-security-principles-every-cissp", why: "Tagged CISSP, but these principles are foundational — CC tests them too." },
      { title: "The AAA Framework", slug: "the-aaa-framework-can-your-cowokers", why: "Domain 3 (Access Controls) in one article." },
      { title: "7 Networking Questions That Instantly Show Your Level", slug: "7-networking-questions-that-instantly", why: "Self-test before tackling Domain 4." },
      { title: "This Is How I Explain Subnetting", slug: "this-is-how-i-explain-subnetting", why: "The Domain 4 topic that scares everyone." },
      { title: "Security Policies, Standards, and Procedures", slug: "security-policies-standards-and-procedures", why: "Governance basics — light on the CC but they show up." },
      { title: "The Data Lifecycle: From Creation to Secure Destruction", slug: "the-data-lifecycle-from-creation", why: "Domain 5 (Security Operations) anchor for data handling." },
    ],
  },
  switcher: {
    label: "CAREER_SWITCHER",
    title: "The Career Switcher",
    tagline: "You're transitioning into cyber. Your biggest risk isn't lack of skill. It's wasting months on the wrong path.",
    diagnosis: "The market doesn't reward effort. It rewards positioning. Pick the right role for your background, then go deep on what makes you hireable.",
    articles: [
      { title: "How to Choose the Right Cybersecurity Role", slug: "how-to-choose-the-right-cybersecurity", why: "Choose right or burn 12 months figuring it out the hard way." },
      { title: "Start Here: The Decoded Security Roadmap", slug: "start-here-decoded-security-roadmap", why: "Your structured path from zero to hired." },
      { title: "What Actually Makes a Cybersecurity Pro Stand Out", slug: "what-actually-makes-a-cybersecurity", why: "What hiring managers really look for." },
      { title: "Most Cybersecurity Beginners Study Wrong", slug: "most-cybersecurity-beginners-study", why: "Don't burn 6 months on the wrong methods." },
      { title: "You Can't Learn Cybersecurity Just by Watching", slug: "you-cant-learn-cybersecurity-just", why: "Why YouTube alone won't get you hired." },
    ],
  },
  grc: {
    label: "GRC_SPECIALIST",
    title: "The GRC Specialist",
    tagline: "You're built for governance, risk, and compliance. The path with the highest leverage and the lowest competition for non-technical backgrounds.",
    diagnosis: "GRC is where business and security meet. Your job is to translate, prioritize, and decide. Less code. More impact.",
    articles: [
      { title: "GRC for Beginners: The Exact Study Plan", slug: "grc-for-beginners-the-exact-study", why: "The full roadmap, in order." },
      { title: "Security Policies, Standards, and Procedures", slug: "security-policies-standards-and-procedures", why: "The boring stuff that actually saves companies." },
      { title: "How Risk Management Frameworks Keep Systems Secure", slug: "how-risk-management-frameworks-keep", why: "The frameworks every GRC role expects you to know." },
      { title: "Audit Process: Planning, Execution", slug: "audit-process-planning-execution", why: "If CISA is on your list, start here." },
      { title: "15 Laws Every CISSP Candidate Must Know", slug: "15-laws-every-cissp-candidate-must", why: "Compliance lives or dies on these." },
      { title: "The Data Lifecycle: From Creation to Secure Destruction", slug: "the-data-lifecycle-from-creation", why: "Data governance, simplified." },
    ],
  },
  cissp: {
    label: "CISSP_CANDIDATE",
    title: "The CISSP Candidate",
    tagline: "You're going for the big one. The CISSP rewards depth across 8 domains and punishes anyone who memorizes instead of understanding.",
    diagnosis: "The CISSP isn't a knowledge test. It's a thinking test. Your study plan should mirror that.",
    articles: [
      { title: "How I Passed the CISSP Exam in 3 Months", slug: "how-i-passed-the-cissp-exam-in-3", why: "The exact playbook from someone who did it." },
      { title: "The 8 Security Principles Every CISSP Must Know", slug: "the-8-security-principles-every-cissp", why: "These show up everywhere on the exam." },
      { title: "15 Laws Every CISSP Candidate Must Know", slug: "15-laws-every-cissp-candidate-must", why: "Don't lose easy points on the legal questions." },
      { title: "Threat ≠ Risk ≠ Vulnerability", slug: "threat-risk-vulnerability-why-cissp", why: "Get this wrong and the exam will punish you." },
      { title: "3 Things That Surprised Me About CISSP Domain 1", slug: "3-things-that-surprise-me-about-cissp", why: "What candidates underestimate." },
      { title: "3 Things You Need to Know for Your CISSP", slug: "3-things-you-need-to-know-for-your", why: "Final-stretch insights that raise scores." },
    ],
  },
  stuck: {
    label: "STUCK_PROFESSIONAL",
    title: "The Stuck Professional",
    tagline: "You're already in cybersecurity but feel like you've plateaued. The next move isn't more knowledge. It's the right knowledge applied differently.",
    diagnosis: "Most stuck pros don't need another cert. They need to operate at a higher level: thinking strategically, owning incidents, and being the person leadership trusts.",
    articles: [
      { title: "What Actually Makes a Cybersecurity Pro Stand Out", slug: "what-actually-makes-a-cybersecurity", why: "The traits that separate seniors from juniors." },
      { title: "You Can't Learn Cybersecurity Just by Watching", slug: "you-cant-learn-cybersecurity-just", why: "Stop consuming. Start producing." },
      { title: "The Incident Response Mistakes That Cost Careers", slug: "the-incident-response-mistakes-that", why: "Owning incidents is how you get noticed." },
      { title: "Most Cybersecurity Beginners Study Wrong", slug: "most-cybersecurity-beginners-study", why: "The lessons apply to mid-career too." },
      { title: "Shadow AI Is the New Shadow IT", slug: "shadow-ai-is-the-new-shadow-it-only", why: "Get ahead of the next big risk category." },
    ],
  },
};

// Tie-break priority: prefer more specific paths when scores are equal
const PATH_PRIORITY = ["cissp", "grc", "stuck", "cc", "switcher", "foundation"];

function buildExportText(pathKey) {
  const path = PATHS[pathKey];
  const sep = "=".repeat(56);
  const sub = "-".repeat(56);
  const lines = [];
  lines.push("DECODED SECURITY // YOUR CYBERSECURITY PATH");
  lines.push(sep);
  lines.push("");
  lines.push(`PATH:      ${path.title}`);
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
  lines.push(`Quiz based on:  ${SOURCE_ARTICLE_URL}`);
  lines.push(`Newsletter:     ${SUBSCRIBE_URL}`);
  lines.push("");
  return lines.join("\n");
}

function calculatePath(answers) {
  const scores = { foundation: 0, switcher: 0, grc: 0, cissp: 0, stuck: 0, cc: 0 };
  answers.forEach((answerIdx, qIdx) => {
    const weights = QUESTIONS[qIdx].options[answerIdx].w;
    Object.entries(weights).forEach(([path, points]) => {
      scores[path] += points;
    });
  });
  let best = "foundation";
  let bestScore = -1;
  PATH_PRIORITY.forEach((p) => {
    if (scores[p] > bestScore) {
      bestScore = scores[p];
      best = p;
    }
  });
  return { winner: best, scores };
}

export default function PathFinder() {
  const [stage, setStage] = useState("welcome"); // welcome | quiz | result
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitState, setEmailSubmitState] = useState("idle"); // idle | submitting | success | error
  const [emailErrorMsg, setEmailErrorMsg] = useState("");

  // Inject IBM Plex Mono
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
    track("question_answered", { question: currentQ + 1, answer: optionIdx });
    const newAnswers = [...answers, optionIdx];
    setTransitioning(true);
    setTimeout(() => {
      if (currentQ + 1 < QUESTIONS.length) {
        setAnswers(newAnswers);
        setCurrentQ(currentQ + 1);
        setTransitioning(false);
      } else {
        const r = calculatePath(newAnswers);
        track("quiz_completed", { path: r.winner });
        setResult(r);
        setAnswers(newAnswers);
        setStage("result");
        setTransitioning(false);
      }
    }, 220);
  };

  const restart = () => {
    track("quiz_restarted", { from_path: result?.winner ?? null });
    setStage("welcome");
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
  };

  const startQuiz = () => {
    track("quiz_started");
    setStage("quiz");
    setCurrentQ(0);
    setAnswers([]);
  };

  const handleDownload = () => {
    if (!result) return;
    track("reading_list_exported", { path: result.winner });
    const text = buildExportText(result.winner);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decoded-security-${result.winner}-reading-list.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simple RFC-5322-ish email validation. Not perfect, but catches typos.
  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!result) return;
    const cleanEmail = email.trim();
    if (!isValidEmail(cleanEmail)) {
      setEmailErrorMsg("That doesn't look like a valid email.");
      setEmailSubmitState("error");
      return;
    }
    setEmailSubmitState("submitting");
    setEmailErrorMsg("");
    track("reading_list_emailed", { path: result.winner });

    const endpoint = import.meta.env.VITE_EMAIL_ENDPOINT;
    try {
      if (endpoint) {
        // Backend is configured — POST email + path + reading list text
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            path: result.winner,
            pathTitle: PATHS[result.winner].title,
            readingList: buildExportText(result.winner),
          }),
        });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
      } else {
        // No backend yet — still feel responsive, and hand them the file
        await new Promise((r) => setTimeout(r, 500));
        handleDownload();
      }
      setEmailSubmitState("success");
    } catch (err) {
      setEmailErrorMsg("Something went wrong. Try the download instead.");
      setEmailSubmitState("error");
    }
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
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY</div>
          </div>
          {stage === "quiz" && (
            <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5 }}>
              {String(currentQ + 1).padStart(2, "0")} / {String(QUESTIONS.length).padStart(2, "0")}
            </div>
          )}
        </header>

        {/* PROGRESS BAR (quiz only) */}
        {stage === "quiz" && (
          <div style={{ height: 2, backgroundColor: COLORS.border, marginBottom: 48, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                backgroundColor: COLORS.red,
                transition: "width 400ms ease-out",
              }}
            />
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
              <span style={{ color: COLORS.red }}>cybersecurity path.</span>
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: "#cccccc", marginBottom: 12, maxWidth: 560 }}>
              Most people drift through cybersecurity without a plan. They watch random YouTube videos. They start certs they never finish. They burn months going nowhere.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: "#cccccc", marginBottom: 32, maxWidth: 560 }}>
              This 60-second diagnostic tells you exactly where to focus, with a personalized reading list pulled from the Decoded Security archive.
            </p>

            {/* SOURCE ARTICLE REFERENCE */}
            <a
              href={SOURCE_ARTICLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("source_article_clicked")}
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
                Read the full piece on Decoded Security
              </div>
            </a>

            <div style={{ display: "flex", gap: 32, marginBottom: 48, flexWrap: "wrap", fontSize: 13, color: COLORS.muted }}>
              <div><span style={{ color: COLORS.red }}>06</span> questions</div>
              <div><span style={{ color: COLORS.red }}>06</span> possible paths</div>
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
              START THE DIAGNOSTIC →
            </button>
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
              YOUR PATH:
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
                    onClick={() => track("article_clicked", { path: result.winner, slug: article.slug, position: idx + 1 })}
                    style={{
                      display: "block",
                      padding: "20px 0",
                      borderBottom: `1px solid ${COLORS.border}`,
                      textDecoration: "none",
                      color: COLORS.white,
                      transition: "all 150ms",
                      animation: `fadeInUp 500ms ease-out ${idx * 80}ms both`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.paddingLeft = "12px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.paddingLeft = "0px";
                    }}
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

            {/* EXPORT READING LIST */}
            <div
              style={{
                border: `1px solid ${COLORS.border}`,
                padding: 24,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 10 }}>
                SAVE YOUR LIST
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>
                Email me my reading list
              </div>
              <p style={{ fontSize: 13, color: "#aaaaaa", marginBottom: 18, lineHeight: 1.5 }}>
                Get it in your inbox so you actually come back to it. No spam, no signup — just your list.
              </p>

              {emailSubmitState !== "success" ? (
                <form onSubmit={handleEmailSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailSubmitState === "error") {
                        setEmailSubmitState("idle");
                        setEmailErrorMsg("");
                      }
                    }}
                    placeholder="you@example.com"
                    required
                    disabled={emailSubmitState === "submitting"}
                    style={{
                      flex: "1 1 220px",
                      fontFamily: fontStack,
                      fontSize: 14,
                      color: COLORS.white,
                      backgroundColor: "transparent",
                      border: `1px solid ${emailSubmitState === "error" ? COLORS.red : COLORS.border}`,
                      padding: "12px 14px",
                      outline: "none",
                      transition: "border-color 150ms",
                    }}
                    onFocus={(e) => { if (emailSubmitState !== "error") e.currentTarget.style.borderColor = COLORS.red; }}
                    onBlur={(e) => { if (emailSubmitState !== "error") e.currentTarget.style.borderColor = COLORS.border; }}
                  />
                  <button
                    type="submit"
                    disabled={emailSubmitState === "submitting"}
                    style={{
                      fontFamily: fontStack,
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: 1.5,
                      color: COLORS.white,
                      backgroundColor: COLORS.red,
                      border: "none",
                      padding: "12px 20px",
                      cursor: emailSubmitState === "submitting" ? "wait" : "pointer",
                      opacity: emailSubmitState === "submitting" ? 0.7 : 1,
                      transition: "all 150ms ease-out",
                    }}
                  >
                    {emailSubmitState === "submitting" ? "SENDING…" : "EMAIL IT TO ME →"}
                  </button>
                </form>
              ) : (
                <div
                  style={{
                    fontSize: 14,
                    color: COLORS.red,
                    borderLeft: `2px solid ${COLORS.red}`,
                    paddingLeft: 14,
                    lineHeight: 1.5,
                  }}
                >
                  Sent to <strong style={{ color: COLORS.white }}>{email}</strong>. Check your inbox in a minute.
                </div>
              )}

              {emailSubmitState === "error" && emailErrorMsg && (
                <div style={{ fontSize: 12, color: COLORS.red, marginTop: 10 }}>
                  {emailErrorMsg}
                </div>
              )}

              <div style={{ marginTop: 16, fontSize: 12, color: COLORS.muted }}>
                Prefer offline?{" "}
                <button
                  onClick={handleDownload}
                  style={{
                    fontFamily: fontStack,
                    fontSize: 12,
                    color: COLORS.muted,
                    backgroundColor: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textDecoration: "underline",
                    letterSpacing: 0.5,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; }}
                >
                  Download as .txt instead ↓
                </button>
              </div>
            </div>

            {/* CTA: FREE LEAD MAGNET */}
            <div
              style={{
                border: `1px solid ${COLORS.red}`,
                padding: 28,
                marginBottom: 20,
                backgroundColor: "rgba(230, 72, 51, 0.04)",
              }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>
                FREE DOWNLOAD
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                The 10 Cybersecurity Concepts That Get You Through 90% of Interviews
              </div>
              <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 20, lineHeight: 1.5 }}>
                The fundamentals every employer expects, in one PDF. No fluff.
              </p>
              <a
                href={GUMROAD_LEAD_MAGNET}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("lead_magnet_clicked", { path: result.winner })}
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
                DOWNLOAD FREE →
              </a>
            </div>

            {/* CTA: SUBSCRIBE */}
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
                1,000+ readers. No fluff. Built for people serious about the path you just chose.
              </p>
              <a
                href={SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("subscribe_clicked", { path: result.winner })}
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
          </div>
        )}

        {/* FOOTER */}
        <footer style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // PATH_FINDER_v1</div>
          <div>BUILT FOR PEOPLE WHO WANT DIRECTION</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        button:focus-visible, a:focus-visible {
          outline: 2px solid ${COLORS.red};
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
