import { useEffect, useState } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — FAKE INTERVIEW SIMULATOR
// Based on the Lazarus Group attack vector that cost Binance $6.3B.
// Simple mechanic: read each offer, make ONE decision. Review reveals the
// red flags with explanations. 4/4 correct = HIRED.
// =============================================================================

const COLORS = {
  red: "#e64833",
  green: "#3ab676",
  amber: "#e8a12a",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
  codeBg: "#0e0e0e",
};

const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";

// -----------------------------------------------------------------------------
// OFFERS: each has sections of readable content, plus a list of red flags
// found inside it (with explanations shown in the review).
// correctDecision: "proceed" | "verify" | "decline"
// -----------------------------------------------------------------------------

const OFFERS = [
  {
    id: "quantumyield",
    company: "QuantumYield Capital",
    recruiter: "Sarah M.",
    tagline: "Warm-up round.",
    correctDecision: "decline",
    verdict: "FAKE",
    sections: [
      {
        title: "LINKEDIN INMAIL — SARAH M. → YOU",
        lines: [
          "Hi,",
          "URGENT opportunity — we're hiring Junior Developers at QuantumYield Capital.",
          "$280,000/year, fully remote worldwide.",
          "You must respond within 24 hours or the role closes.",
          "Sarah M. · Talent Acquisition Lead",
        ],
      },
      {
        title: "SARAH'S LINKEDIN PROFILE",
        lines: [
          "47 connections",
          "Account created: October 2026",
          "No posts, no activity history",
          "Generic headshot, no employer links",
        ],
      },
    ],
    flags: [
      { text: "Artificial 24-hour deadline", note: "Attacker 101. Real recruiters don't need to pressure you in the first message." },
      { text: "$280K for a Junior role (3x market rate)", note: "If a salary looks too good to be true, it is. Oldest scam hook." },
      { text: "47 connections", note: "A real recruiter has hundreds or thousands of connections." },
      { text: "Account created last month", note: "A brand-new LinkedIn for a 'senior' recruiter is a throwaway account." },
      { text: "Zero posts or activity", note: "Combined with the new account, this is a profile built for a single scam." },
    ],
    explanation: "Everything points to a disposable scam account. The urgency, inflated salary, and empty profile are red flags you should catch in under 10 seconds. Decline and report.",
  },
  {
    id: "lazarus",
    company: "Lazarus Trading Systems",
    recruiter: "Jennifer Walsh",
    tagline: "Looks real. This is how Binance lost $6.3B.",
    correctDecision: "verify",
    verdict: "FAKE",
    sections: [
      {
        title: "EMAIL — JENNIFER WALSH → YOU",
        lines: [
          "From: jennifer.walsh@lazarus-trading.co",
          "Subject: Senior Blockchain Engineer — $180K to $220K",
          "",
          "Hi,",
          "We'd love to talk to you about a Senior Blockchain Engineer role.",
          "Salary: $180,000 to $220,000. 3-week structured process, 4 interview stages.",
          "Round 2 is with our CTO, Martin Chen.",
          "",
          "Jennifer Walsh · Head of Talent, Lazarus Trading",
        ],
      },
      {
        title: "JENNIFER'S LINKEDIN PROFILE",
        lines: [
          "2,400+ connections, active since 2019",
          "Head of Talent at Lazarus Trading (5 years)",
          "47 endorsements for Technical Recruiting",
          "Posts about hiring every 2 weeks",
        ],
      },
      {
        title: "TECHNICAL TASK (EMAILED 3 DAYS LATER)",
        lines: [
          "Build a simple price-feed aggregator.",
          "To use our internal types, please install our dev environment:",
          "    npm install @lazarus-trading/dev-env",
          "Submit within 5 business days.",
        ],
      },
    ],
    flags: [
      { text: "Email domain is .co, not .com", note: "Lookalike domain. The real company would use .com. Attackers register .co, .io, .net variants that look identical at a glance." },
      { text: "npm install from an unverified package", note: "This IS the attack. Installing a package from an unverified source runs arbitrary code on your machine. Exactly how the Binance attackers deployed their malware." },
    ],
    explanation: "This one looks almost perfect. The recruiter profile is real-looking, the salary is realistic, the process is professional. Two subtle flags give it away: the lookalike domain and the unverified npm package. The right move isn't to decline immediately — it's to VERIFY by calling the company through their real website (not the email's domain). This is the exact pattern that compromised a developer at Binance.",
  },
  {
    id: "meridian",
    company: "Meridian Technologies",
    recruiter: "David Chen",
    tagline: "This one is real.",
    correctDecision: "proceed",
    verdict: "REAL",
    sections: [
      {
        title: "EMAIL — DAVID CHEN → YOU",
        lines: [
          "From: david.chen@meridiantech.com",
          "Subject: Open to chatting about an engineering role at Meridian?",
          "",
          "Hi,",
          "I saw your GitHub project on distributed caching — nice work on the LRU eviction policy.",
          "We're growing the platform team at Meridian and I think you'd be a good fit.",
          "No task before the first call — just a chat. Our Careers page is here if you want to research us first.",
          "",
          "David Chen · Engineering Recruiter, Meridian Technologies",
        ],
      },
      {
        title: "DAVID'S LINKEDIN PROFILE",
        lines: [
          "10 years at Meridian Technologies",
          "850+ connections, many from Meridian engineering",
          "Endorsements from Meridian engineers",
          "Regular posts about engineering culture",
        ],
      },
      {
        title: "MERIDIAN COMPANY PAGE",
        lines: [
          "Founded 2015 · 200 employees · Series C",
          "4.2★ Glassdoor (380 reviews)",
          "Press: TechCrunch, The Verge, Wired",
          "Offices: Austin, Berlin, Toronto",
        ],
      },
    ],
    flags: [],
    explanation: "Every signal is consistent. Matching domain, long-tenure recruiter with internal connections, personalized pitch referencing your actual work, no pressure, no pre-interview task, verifiable company history. These are the patterns to trust. Proceed.",
  },
  {
    id: "prometheus",
    company: "Prometheus Labs",
    recruiter: "Alex P.",
    tagline: "The scammer plays it smoother this time.",
    correctDecision: "decline",
    verdict: "FAKE",
    sections: [
      {
        title: "TELEGRAM MESSAGE — ALEX P. → YOU",
        lines: [
          "Hi, saw your resume online.",
          "We're hiring blockchain developers at Prometheus Labs.",
          "Let's continue on my Gmail for convenience: alex.p.dev@gmail.com",
        ],
      },
      {
        title: "ALEX'S LINKEDIN PROFILE",
        lines: [
          "112 connections",
          "Account joined: 8 months ago",
          "Current role: 'Technical Recruiter at Stealth Startup'",
          "No profile photo",
        ],
      },
      {
        title: "PROMETHEUS LABS WEBSITE",
        lines: [
          "Domain: prometheuslabs.xyz",
          "Domain registered 3 months ago (per WHOIS)",
          "Generic stock photos, no team page",
          "Contact: info@prometheuslabs.xyz",
        ],
      },
      {
        title: "TECHNICAL CHALLENGE",
        lines: [
          "Clone our GitHub repo and run `npm install` to explore our codebase.",
          "The repo is in Alex's personal GitHub, not a company org.",
          "Interview via Google Meet on his personal account.",
          "Deliver in 3 days.",
        ],
      },
    ],
    flags: [
      { text: "First contact via Telegram", note: "Legitimate recruiters use LinkedIn or corporate email first. Telegram as first contact for a corporate role is suspicious." },
      { text: "Switch to personal Gmail", note: "Real recruiters use corporate email. Switching to personal Gmail avoids corporate email security monitoring." },
      { text: "'Stealth Startup' with no verifiable employer", note: "A classic cover. You can't verify what doesn't exist." },
      { text: "Thin, young LinkedIn profile", note: "112 connections and an 8-month-old account for a 'recruiter' is a red flag by itself." },
      { text: "3-month-old .xyz domain", note: "A 'well-funded startup' with a 3-month-old domain on a cheap TLD often abused by throwaway sites." },
      { text: "npm install from a personal GitHub", note: "Running unknown code from a personal account (not a company org) is how systems get compromised." },
    ],
    explanation: "Six red flags. The attacker switched to a messaging app, moved off corporate email, hid behind a 'stealth' company, and is trying to run code on your machine. Decline and report — don't even verify, this one has no chance of being real.",
  },
];

const DECISIONS = [
  { id: "proceed", label: "PROCEED", sub: "Move forward with the interview process." },
  { id: "verify", label: "VERIFY FIRST", sub: "Call the company via official number before proceeding." },
  { id: "decline", label: "DECLINE & REPORT", sub: "Walk away and report the account." },
];

// -----------------------------------------------------------------------------
// COMPONENT
// -----------------------------------------------------------------------------

export default function FakeInterviewSimulator() {
  const [stage, setStage] = useState("intro"); // intro | play | review | results
  const [offerIdx, setOfferIdx] = useState(0);
  const [decisions, setDecisions] = useState({}); // { offerId: decisionId }

  // Load IBM Plex Mono
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const currentOffer = OFFERS[offerIdx];
  const isLastOffer = offerIdx === OFFERS.length - 1;

  const startGame = () => {
    track("fake_interview_started");
    setStage("play");
    setOfferIdx(0);
    setDecisions({});
  };

  const chooseDecision = (decisionId) => {
    setDecisions((prev) => ({ ...prev, [currentOffer.id]: decisionId }));
    track("fake_interview_decision", {
      offer: currentOffer.id,
      decision: decisionId,
      correct: decisionId === currentOffer.correctDecision,
    });
    setStage("review");
  };

  const nextOffer = () => {
    if (isLastOffer) {
      track("fake_interview_completed", { correct: countCorrect() });
      setStage("results");
    } else {
      setOfferIdx(offerIdx + 1);
      setStage("play");
    }
  };

  const countCorrect = () =>
    OFFERS.filter((o) => decisions[o.id] === o.correctDecision).length;

  const getRank = (correct) => {
    if (correct === OFFERS.length) return { label: "HIRED", color: COLORS.green, desc: "Perfect. You caught every attack and recognized the real opportunity. You'd keep your job and your company's crypto." };
    if (correct >= 3) return { label: "CLOSE CALL", color: COLORS.amber, desc: "You caught most of it, but missed just enough. In a real attack, that gap is all it takes." };
    if (correct >= 2) return { label: "COMPROMISED", color: COLORS.amber, desc: "Half right, half wrong. Any of the misses could have been the one that cost you everything." };
    return { label: "HACKED", color: COLORS.red, desc: "You just ran attacker code on a work machine. That's how Binance lost $6.3B. Read the newsletter. Don't be next." };
  };

  const buildShareText = () => {
    const c = countCorrect();
    return `I got ${c}/${OFFERS.length} right on the Fake Interview Simulator by Decoded Security. Can you spot the fake offer before it hacks you? decodedsecurity.com/tools/fake-interview`;
  };

  const handleShare = async () => {
    track("fake_interview_shared");
    const text = buildShareText();
    try {
      if (navigator.share) {
        await navigator.share({ title: "Fake Interview Simulator", text });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Share text copied to clipboard.");
      }
    } catch (e) {}
  };

  // -----------------------------------------------------------------------------
  // STYLES
  // -----------------------------------------------------------------------------

  const primaryBtn = {
    fontFamily: fontStack,
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: COLORS.white,
    backgroundColor: COLORS.red,
    border: "none",
    padding: "16px 28px",
    cursor: "pointer",
    transition: "transform 150ms, box-shadow 150ms",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.black,
        color: COLORS.white,
        fontFamily: fontStack,
        padding: "24px 16px 60px",
        backgroundImage: `radial-gradient(circle at 20% 0%, rgba(230, 72, 51, 0.08), transparent 50%), radial-gradient(circle at 80% 100%, rgba(230, 72, 51, 0.05), transparent 50%)`,
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // FAKE_INTERVIEW_SIM</div>
          </div>
          <a href="/tools" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            ← BACK TO TOOLS
          </a>
        </header>

        {/* INTRO */}
        {stage === "intro" && (
          <div style={{ animation: "fadeIn 500ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; 4 OFFERS · ONE IS REAL · ONE DECISION EACH</div>
            <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 700, lineHeight: 1.08, marginBottom: 20, letterSpacing: -0.8 }}>
              Can you spot the fake offer <span style={{ color: COLORS.red }}>before it hacks you?</span>
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 14, maxWidth: 680 }}>
              In 2026, attackers stole <strong style={{ color: COLORS.white }}>$6.3B from Binance</strong>. They didn't crack any code. They sent fake job offers. One developer ran a technical task on a work machine. That was enough.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 14, maxWidth: 680 }}>
              You'll review 4 job offers. One is real. Three are fake. For each one, you make a single call:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28, maxWidth: 680 }}>
              {DECISIONS.map((d) => (
                <div key={d.id} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 13, color: COLORS.red, letterSpacing: 2, fontWeight: 700, minWidth: 130 }}>{d.label}</div>
                  <div style={{ fontSize: 14, color: "#cccccc", lineHeight: 1.5 }}>{d.sub}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.55, marginBottom: 28, maxWidth: 680 }}>
              After each decision, you'll see the red flags and why each one matters. Get all 4 right = HIRED.
            </p>

            <button onClick={startGame} style={primaryBtn}>START THE SIMULATION →</button>
          </div>
        )}

        {/* PLAY */}
        {stage === "play" && currentOffer && (
          <div style={{ animation: "fadeIn 300ms ease-out" }}>
            {/* Progress */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3 }}>OFFER {offerIdx + 1} / {OFFERS.length}</div>
                <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5 }}>READ · DECIDE</div>
              </div>
              <div style={{ height: 3, backgroundColor: COLORS.border, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(offerIdx / OFFERS.length) * 100}%`, backgroundColor: COLORS.red, transition: "width 400ms ease-out" }} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: "clamp(26px, 4.5vw, 36px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 6, letterSpacing: -0.5 }}>
                {currentOffer.company}
              </h2>
              <div style={{ fontSize: 14, color: COLORS.muted, fontStyle: "italic" }}>
                {currentOffer.tagline}
              </div>
            </div>

            {/* Sections (read-only) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
              {currentOffer.sections.map((section) => (
                <div key={section.title} style={{ border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.codeBg }}>
                  <div style={{
                    padding: "12px 18px",
                    borderBottom: `1px solid ${COLORS.border}`,
                    fontSize: 11,
                    color: COLORS.red,
                    letterSpacing: 2,
                    fontWeight: 600,
                  }}>
                    {section.title}
                  </div>
                  <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6, fontSize: 14, lineHeight: 1.55, color: "#e4e4e4" }}>
                    {section.lines.map((line, i) => (
                      <div key={i} style={{ minHeight: line === "" ? 8 : "auto", whiteSpace: "pre-wrap" }}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Decision buttons */}
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 14 }}>&gt; YOUR DECISION</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {DECISIONS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => chooseDecision(d.id)}
                  style={{
                    fontFamily: fontStack,
                    fontSize: 14,
                    color: COLORS.white,
                    backgroundColor: "transparent",
                    border: `1px solid ${COLORS.border}`,
                    padding: "18px 22px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.red;
                    e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: COLORS.red, letterSpacing: 1 }}>{d.label}</div>
                  <div style={{ color: "#bbbbbb", fontSize: 13 }}>{d.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* REVIEW */}
        {stage === "review" && currentOffer && (
          <ReviewPanel
            offer={currentOffer}
            userDecision={decisions[currentOffer.id]}
            onNext={nextOffer}
            isLast={isLastOffer}
            primaryBtn={primaryBtn}
          />
        )}

        {/* RESULTS */}
        {stage === "results" && (
          <ResultsPanel
            correct={countCorrect()}
            total={OFFERS.length}
            decisions={decisions}
            getRank={getRank}
            onShare={handleShare}
            onReplay={startGame}
            fontStack={fontStack}
            primaryBtn={primaryBtn}
          />
        )}

        {/* Footer */}
        <footer style={{ marginTop: 72, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // FAKE_INTERVIEW_SIM</div>
          <div>BASED ON THE LAZARUS GROUP ATTACK VECTOR</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// =============================================================================
// REVIEW PANEL
// =============================================================================

function ReviewPanel({ offer, userDecision, onNext, isLast, primaryBtn }) {
  const correct = userDecision === offer.correctDecision;
  const correctLabel = DECISIONS.find((d) => d.id === offer.correctDecision)?.label;
  const userLabel = DECISIONS.find((d) => d.id === userDecision)?.label;

  return (
    <div style={{ animation: "fadeIn 300ms ease-out" }}>
      <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>
        &gt; REVIEW: {offer.company.toUpperCase()}
      </div>
      <div style={{ fontSize: 11, color: offer.verdict === "REAL" ? COLORS.green : COLORS.red, letterSpacing: 2, marginBottom: 20, fontWeight: 600 }}>
        VERDICT: {offer.verdict}
      </div>

      {/* Decision result */}
      <div style={{
        border: `1px solid ${correct ? COLORS.green : COLORS.red}`,
        padding: 18,
        marginBottom: 28,
        backgroundColor: correct ? "rgba(58,182,118,0.06)" : "rgba(230,72,51,0.06)",
      }}>
        <div style={{ fontSize: 11, color: correct ? COLORS.green : COLORS.red, letterSpacing: 2, marginBottom: 8, fontWeight: 600 }}>
          {correct ? "✓ CORRECT DECISION" : "✗ WRONG DECISION"}
        </div>
        <div style={{ fontSize: 14, color: "#e4e4e4", lineHeight: 1.6 }}>
          You chose <strong style={{ color: COLORS.white }}>{userLabel}</strong>.{" "}
          {correct ? (
            <>That was the right call.</>
          ) : (
            <>The right call was <strong style={{ color: COLORS.green }}>{correctLabel}</strong>.</>
          )}
        </div>
      </div>

      {/* Explanation */}
      <div style={{ borderLeft: `3px solid ${COLORS.red}`, paddingLeft: 16, marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>WHY</div>
        <div style={{ fontSize: 14, color: "#e4e4e4", lineHeight: 1.6 }}>
          {offer.explanation}
        </div>
      </div>

      {/* Red flags (if any) */}
      {offer.flags.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 14 }}>&gt; RED FLAGS IN THIS OFFER</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {offer.flags.map((f, i) => (
              <div key={i} style={{
                border: `1px solid ${COLORS.border}`,
                padding: 14,
                backgroundColor: COLORS.codeBg,
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: COLORS.red }}>⚑ {f.text}</div>
                <div style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.5 }}>{f.note}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <button onClick={onNext} style={primaryBtn}>
        {isLast ? "SEE FINAL RESULTS →" : "NEXT OFFER →"}
      </button>
    </div>
  );
}

// =============================================================================
// RESULTS PANEL
// =============================================================================

function ResultsPanel({ correct, total, decisions, getRank, onShare, onReplay, fontStack, primaryBtn }) {
  const { label, color, desc } = getRank(correct);

  return (
    <div style={{ animation: "fadeIn 500ms ease-out" }}>
      <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; SIMULATION COMPLETE</div>

      <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, marginBottom: 12 }}>CORRECT DECISIONS</div>
      <div style={{ fontSize: "clamp(72px, 14vw, 120px)", fontWeight: 700, lineHeight: 1, letterSpacing: -3, marginBottom: 8 }}>
        {correct}
        <span style={{ fontSize: "clamp(20px, 4vw, 32px)", color: COLORS.muted, marginLeft: 12 }}>/ {total}</span>
      </div>

      <div style={{ fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 700, color, letterSpacing: -1, marginBottom: 12 }}>
        {label}
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 32, maxWidth: 600 }}>
        {desc}
      </p>

      {/* Per-offer recap */}
      <div style={{ border: `1px solid ${COLORS.border}`, padding: 18, marginBottom: 32 }}>
        <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 2, marginBottom: 12 }}>YOUR CALLS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {OFFERS.map((o) => {
            const chosen = decisions[o.id];
            const ok = chosen === o.correctDecision;
            return (
              <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontSize: 13 }}>
                <span style={{ color: "#e4e4e4" }}>{o.company}</span>
                <span style={{ color: ok ? COLORS.green : COLORS.red, fontWeight: 600, letterSpacing: 1 }}>
                  {ok ? "✓" : "✗"} {DECISIONS.find((d) => d.id === chosen)?.label || "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* The One Rule */}
      <div style={{ borderLeft: `3px solid ${COLORS.red}`, paddingLeft: 18, marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>THE ONE RULE TO REMEMBER</div>
        <div style={{ fontSize: 16, lineHeight: 1.5, fontWeight: 600 }}>
          Never run anything from someone you haven't verified, on a machine that can reach company systems.
        </div>
      </div>

      <button onClick={onShare} style={{ ...primaryBtn, marginBottom: 32 }}>
        SHARE YOUR SCORE ↗
      </button>

      <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 14 }}>&gt; NEXT STEPS</div>

      <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer"
        onClick={() => track("fake_interview_subscribe_click")}
        style={{ display: "block", textDecoration: "none", color: COLORS.white, border: `1px solid ${COLORS.red}`, padding: 22, marginBottom: 12, backgroundColor: "rgba(230, 72, 51, 0.04)" }}
      >
        <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 6 }}>NEWSLETTER</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Decoded Security — Free Weekly</div>
        <div style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.5 }}>One practical cybersecurity article every week. →</div>
      </a>

      <a href="/tools" style={{ display: "block", textDecoration: "none", color: COLORS.white, border: `1px solid ${COLORS.border}`, padding: 22, marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 6 }}>MORE TOOLS</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Try another interactive tool</div>
        <div style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.5 }}>14 hands-on tools in the Decoded Security library. →</div>
      </a>

      <button onClick={onReplay} style={{ fontFamily: fontStack, fontSize: 12, color: COLORS.muted, backgroundColor: "transparent", border: "none", padding: "8px 0", cursor: "pointer", letterSpacing: 1.5 }}>
        ↻ REPLAY SIMULATION
      </button>
    </div>
  );
}
