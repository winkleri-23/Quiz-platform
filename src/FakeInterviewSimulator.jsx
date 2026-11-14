import { useEffect, useState } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — FAKE INTERVIEW SIMULATOR
// Based on the Lazarus Group attack vector that cost Binance $6.3B.
// 4 job offers, 13 red flags, 4 decisions. One offer is real — don't flag it.
// Perfect play = 210/210. Everyone can win if they read carefully.
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

const BASE_URL = "https://www.decodedsecurity.com/p/";
const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";

const POINTS_PER_FLAG = 10;
const POINTS_PER_DECISION = 20;

// -----------------------------------------------------------------------------
// OFFERS: each has sections with items. `flag: true` items are red flags.
// correctDecision: "proceed" | "verify" | "decline"
// -----------------------------------------------------------------------------

const OFFERS = [
  {
    id: "quantumyield",
    company: "QuantumYield Capital",
    recruiter: "Sarah M.",
    tagline: "Warm-up round. The obvious scam.",
    correctDecision: "decline",
    verdict: "FAKE",
    sections: [
      {
        title: "LINKEDIN INMAIL",
        items: [
          { id: "q-1", text: "URGENT opportunity — respond within 24 hours", flag: true, note: "Artificial urgency is attacker 101. Real recruiters don't need to pressure you in the first message." },
          { id: "q-2", text: "$280,000/year for a Junior Developer role", flag: true, note: "Salaries 3x market rate are the oldest scam hook. If it looks too good to be true, it is." },
          { id: "q-3", text: "Fully remote worldwide", flag: false, note: "Common and legitimate perk." },
        ],
      },
      {
        title: "SENDER'S LINKEDIN PROFILE",
        items: [
          { id: "q-4", text: "47 connections", flag: true, note: "A real recruiter has hundreds or thousands of connections. 47 is a throwaway account." },
          { id: "q-5", text: "Account created: October 2026", flag: true, note: "A brand-new account for a 'senior' recruiter is a huge red flag." },
          { id: "q-6", text: "No posts, no activity history", flag: true, note: "Combined with the new account, this is a throwaway profile built for a single scam." },
        ],
      },
    ],
  },
  {
    id: "lazarus",
    company: "Lazarus Trading Systems",
    recruiter: "Jennifer Walsh",
    tagline: "Looks real. Only two subtle flags. This is how Binance lost $6.3B.",
    correctDecision: "verify",
    verdict: "FAKE",
    sections: [
      {
        title: "EMAIL",
        items: [
          { id: "l-1", text: "From: jennifer.walsh@lazarus-trading.co", flag: true, note: "Lookalike domain. The real company would use .com. Attackers register .co, .io, .net variants that look identical at a glance." },
          { id: "l-2", text: "Salary range: $180,000 to $220,000", flag: false, note: "Realistic market rate for a senior role." },
          { id: "l-3", text: "3-week structured interview with 4 stages", flag: false, note: "Professional process." },
        ],
      },
      {
        title: "SENDER'S LINKEDIN PROFILE",
        items: [
          { id: "l-4", text: "2,400+ LinkedIn connections, active since 2019", flag: false, note: "Strong, authentic-looking profile — this is why the attack is hard to spot." },
          { id: "l-5", text: "Head of Talent at Lazarus Trading (5 years)", flag: false, note: "Long tenure. Not a flag on its own — attackers invest in cover." },
        ],
      },
      {
        title: "TECHNICAL TASK EMAIL",
        items: [
          { id: "l-6", text: "Please install our dev environment: npm install @lazarus-trading/dev-env", flag: true, note: "This is the attack. Installing a package from an unverified source runs arbitrary code on your machine. This is exactly how the Binance attackers deployed their malware." },
          { id: "l-7", text: "Deadline: 5 business days", flag: false, note: "Reasonable timeline." },
        ],
      },
    ],
  },
  {
    id: "meridian",
    company: "Meridian Technologies",
    recruiter: "David Chen",
    tagline: "This one is real. Don't flag anything.",
    correctDecision: "proceed",
    verdict: "REAL",
    sections: [
      {
        title: "EMAIL",
        items: [
          { id: "m-1", text: "From: david.chen@meridiantech.com", flag: false, note: "Domain matches the company website exactly." },
          { id: "m-2", text: "Saw your GitHub project on distributed caching", flag: false, note: "Specific, personalized. Real recruiters do research." },
          { id: "m-3", text: "No task before the first call — just a chat", flag: false, note: "Legitimate recruiters don't make you work before they introduce themselves." },
        ],
      },
      {
        title: "SENDER'S LINKEDIN PROFILE",
        items: [
          { id: "m-4", text: "10 years at Meridian, 850+ connections", flag: false, note: "Long tenure at the company he's recruiting for." },
          { id: "m-5", text: "Endorsements from Meridian engineers", flag: false, note: "Social proof from inside the company." },
        ],
      },
      {
        title: "COMPANY PAGE",
        items: [
          { id: "m-6", text: "Series C, 200 employees, 4.2★ Glassdoor (380 reviews)", flag: false, note: "Established, well-funded, with a deep review history you can verify." },
        ],
      },
    ],
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
        title: "TELEGRAM MESSAGE",
        items: [
          { id: "p-1", text: "Contacted via Telegram first (no email)", flag: true, note: "Legitimate recruiters use LinkedIn or corporate email first. Telegram as first contact for a corporate role is suspicious." },
          { id: "p-2", text: "\"Let's continue on my Gmail: alex.p.dev@gmail.com\"", flag: true, note: "Real recruiters use corporate email. Switching to personal Gmail avoids corporate email security monitoring." },
        ],
      },
      {
        title: "SENDER'S LINKEDIN PROFILE",
        items: [
          { id: "p-3", text: "\"Technical Recruiter at Stealth Startup\"", flag: true, note: "'Stealth' with no verifiable employer link is a classic cover. You can't verify what doesn't exist." },
          { id: "p-4", text: "112 connections, account 8 months old", flag: true, note: "Thin network for a 'recruiter' plus recent account." },
        ],
      },
      {
        title: "COMPANY PAGE",
        items: [
          { id: "p-5", text: "Domain registered 3 months ago, uses .xyz TLD", flag: true, note: "A 'well-funded startup' with a 3-month-old domain on a cheap TLD often abused by throwaway sites." },
        ],
      },
      {
        title: "TECHNICAL CHALLENGE",
        items: [
          { id: "p-6", text: "Clone this repo from Alex's personal GitHub and run npm install", flag: true, note: "This is the attack. Running unknown code from a personal account (not a company org) is how systems get compromised." },
        ],
      },
    ],
  },
];

const TOTAL_FLAGS = OFFERS.reduce(
  (sum, o) => sum + o.sections.reduce((s, sec) => s + sec.items.filter((i) => i.flag).length, 0),
  0
);
const TOTAL_DECISIONS = OFFERS.length;
const MAX_SCORE = TOTAL_FLAGS * POINTS_PER_FLAG + TOTAL_DECISIONS * POINTS_PER_DECISION;

const DECISIONS = [
  { id: "proceed", label: "PROCEED", sub: "Looks legit. Move forward with the process." },
  { id: "verify", label: "VERIFY FIRST", sub: "Call the company via official number before proceeding." },
  { id: "decline", label: "DECLINE & REPORT", sub: "Too many flags. Walk away and report the account." },
];

// -----------------------------------------------------------------------------
// COMPONENT
// -----------------------------------------------------------------------------

export default function FakeInterviewSimulator() {
  const [stage, setStage] = useState("intro"); // intro | play | decision | review | results
  const [offerIdx, setOfferIdx] = useState(0);
  const [taps, setTaps] = useState({}); // { itemId: true }
  const [decisions, setDecisions] = useState({}); // { offerId: decisionId }
  const [shake, setShake] = useState(null);

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
    setTaps({});
    setDecisions({});
  };

  const handleTap = (item) => {
    if (item.flag) {
      setTaps((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
    } else {
      setShake(item.id);
      setTimeout(() => setShake(null), 400);
    }
  };

  const goToDecision = () => setStage("decision");

  const chooseDecision = (decisionId) => {
    setDecisions((prev) => ({ ...prev, [currentOffer.id]: decisionId }));
    track("fake_interview_decision", { offer: currentOffer.id, decision: decisionId, correct: decisionId === currentOffer.correctDecision });
    setStage("review");
  };

  const nextOffer = () => {
    if (isLastOffer) {
      track("fake_interview_completed", { score: calcScore().total });
      setStage("results");
    } else {
      setOfferIdx(offerIdx + 1);
      setStage("play");
    }
  };

  const allItems = (offer) => offer.sections.flatMap((s) => s.items);
  const flagsInOffer = (offer) => allItems(offer).filter((i) => i.flag).length;
  const flagsFoundInOffer = (offer) => allItems(offer).filter((i) => i.flag && taps[i.id]).length;

  const calcScore = () => {
    const flagsFound = OFFERS.reduce((sum, o) => sum + flagsFoundInOffer(o), 0);
    const correctDecisions = OFFERS.filter((o) => decisions[o.id] === o.correctDecision).length;
    const flagPoints = flagsFound * POINTS_PER_FLAG;
    const decisionPoints = correctDecisions * POINTS_PER_DECISION;
    return {
      flagsFound,
      correctDecisions,
      flagPoints,
      decisionPoints,
      total: flagPoints + decisionPoints,
    };
  };

  const getRank = (score) => {
    const pct = score / MAX_SCORE;
    if (pct === 1) return { label: "HIRED", color: COLORS.green, desc: "Perfect score. You caught every attack and recognized the real opportunity. You would have kept your job and your company's crypto." };
    if (pct >= 0.7) return { label: "CLOSE CALL", color: COLORS.amber, desc: "You caught most of it, but missed just enough. In a real attack, that gap is all it takes." };
    return { label: "HACKED", color: COLORS.red, desc: "You just ran attacker code on a work machine. That is how Binance lost $6.3B. Read the newsletter. Don't be next." };
  };

  const buildShareText = () => {
    const { total, flagsFound } = calcScore();
    return `I scored ${total}/${MAX_SCORE} on the Fake Interview Simulator by Decoded Security. Found ${flagsFound}/${TOTAL_FLAGS} red flags. Can you beat me? decodedsecurity.com/tools/fake-interview`;
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
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; 4 OFFERS · {TOTAL_FLAGS} RED FLAGS · ONE IS REAL</div>
            <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 700, lineHeight: 1.08, marginBottom: 20, letterSpacing: -0.8 }}>
              Can you spot the fake offer <span style={{ color: COLORS.red }}>before it hacks you?</span>
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 14, maxWidth: 680 }}>
              In 2026, attackers stole <strong style={{ color: COLORS.white }}>$6.3B from Binance</strong>. They didn't crack any code. They sent fake job offers. One developer ran a technical task on a work machine. That was enough.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 14, maxWidth: 680 }}>
              You'll review 4 job offers. One is real. Three are fake. For each one: tap every red flag you can find, then make a decision — <strong style={{ color: COLORS.white }}>Proceed</strong>, <strong style={{ color: COLORS.white }}>Verify first</strong>, or <strong style={{ color: COLORS.white }}>Decline and report</strong>.
            </p>
            <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.55, marginBottom: 28, maxWidth: 680 }}>
              Tapping a safe item costs you nothing — it just dismisses. Perfect play = {MAX_SCORE} points. The game is winnable if you read carefully.
            </p>

            <div style={{ border: `1px solid ${COLORS.border}`, padding: 18, marginBottom: 28, maxWidth: 680 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 2, marginBottom: 10 }}>SCORING</div>
              <div style={{ fontSize: 13, color: "#cccccc", lineHeight: 1.7 }}>
                <div>+{POINTS_PER_FLAG} per red flag found ({TOTAL_FLAGS} total)</div>
                <div>+{POINTS_PER_DECISION} per correct decision (4 offers)</div>
                <div style={{ color: COLORS.red, marginTop: 6 }}>Max score: {MAX_SCORE}</div>
              </div>
            </div>

            <button onClick={startGame} style={primaryBtn}>START THE SIMULATION →</button>
          </div>
        )}

        {/* PLAY */}
        {stage === "play" && currentOffer && (
          <div style={{ animation: "fadeIn 300ms ease-out" }}>
            {/* Progress */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3 }}>OFFER {offerIdx + 1} / {OFFERS.length}</div>
                <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5 }}>
                  FLAGS: {flagsFoundInOffer(currentOffer)} / {flagsInOffer(currentOffer)}
                </div>
              </div>
              <div style={{ height: 3, backgroundColor: COLORS.border, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(offerIdx / OFFERS.length) * 100}%`, backgroundColor: COLORS.red, transition: "width 400ms ease-out" }} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: "clamp(26px, 4.5vw, 36px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 8, letterSpacing: -0.5 }}>
                {currentOffer.company}
              </h2>
              <div style={{ fontSize: 14, color: COLORS.muted, fontStyle: "italic" }}>
                {currentOffer.tagline}
              </div>
            </div>

            {/* Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 32 }}>
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
                  <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                    {section.items.map((item) => {
                      const isTapped = !!taps[item.id];
                      const isShaking = shake === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleTap(item)}
                          style={{
                            cursor: "pointer",
                            fontSize: 14,
                            lineHeight: 1.5,
                            color: isTapped ? COLORS.red : COLORS.white,
                            padding: "11px 14px",
                            border: `1px solid ${isTapped ? COLORS.red : COLORS.border}`,
                            backgroundColor: isTapped ? "rgba(230, 72, 51, 0.08)" : "transparent",
                            transition: "all 150ms",
                            userSelect: "none",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 10,
                            animation: isShaking ? "fakeShake 400ms" : "none",
                          }}
                          onMouseEnter={(e) => { if (!isTapped) e.currentTarget.style.borderColor = COLORS.muted; }}
                          onMouseLeave={(e) => { if (!isTapped) e.currentTarget.style.borderColor = COLORS.border; }}
                        >
                          <span>{item.text}</span>
                          <span style={{
                            color: COLORS.red,
                            fontSize: 18,
                            minWidth: 22,
                            textAlign: "right",
                            opacity: isTapped ? 1 : 0,
                            transition: "opacity 150ms",
                            fontWeight: 700,
                          }}>
                            ⚑
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div style={{ fontSize: 12, color: COLORS.muted, maxWidth: 400 }}>
                Tap anything suspicious. When you're done, make your decision.
              </div>
              <button onClick={goToDecision} style={primaryBtn}>
                MAKE DECISION →
              </button>
            </div>
          </div>
        )}

        {/* DECISION */}
        {stage === "decision" && currentOffer && (
          <div style={{ animation: "fadeIn 300ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; DECISION TIME</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
              What do you do about <span style={{ color: COLORS.red }}>{currentOffer.company}</span>?
            </h2>
            <p style={{ fontSize: 14, color: "#cccccc", marginBottom: 28 }}>
              +{POINTS_PER_DECISION} points for the right call.
            </p>

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
            taps={taps}
            userDecision={decisions[currentOffer.id]}
            onNext={nextOffer}
            isLast={isLastOffer}
            primaryBtn={primaryBtn}
          />
        )}

        {/* RESULTS */}
        {stage === "results" && (
          <ResultsPanel
            score={calcScore()}
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
        @keyframes fakeShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

// =============================================================================
// REVIEW PANEL
// =============================================================================

function ReviewPanel({ offer, taps, userDecision, onNext, isLast, primaryBtn }) {
  const allItems = offer.sections.flatMap((s) => s.items);
  const flagsTotal = allItems.filter((i) => i.flag).length;
  const flagsFound = allItems.filter((i) => i.flag && taps[i.id]).length;
  const decisionCorrect = userDecision === offer.correctDecision;
  const correctDecisionLabel = DECISIONS.find((d) => d.id === offer.correctDecision)?.label;

  return (
    <div style={{ animation: "fadeIn 300ms ease-out" }}>
      <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>
        &gt; REVIEW: {offer.company.toUpperCase()}
      </div>
      <div style={{ fontSize: 11, color: offer.verdict === "REAL" ? COLORS.green : COLORS.red, letterSpacing: 2, marginBottom: 20, fontWeight: 600 }}>
        VERDICT: {offer.verdict}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
        <div style={{ flex: 1, minWidth: 160, border: `1px solid ${COLORS.border}`, padding: 14 }}>
          <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 4 }}>FLAGS FOUND</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: flagsFound === flagsTotal ? COLORS.green : COLORS.amber }}>
            {flagsFound} / {flagsTotal}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 160, border: `1px solid ${COLORS.border}`, padding: 14 }}>
          <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 4 }}>DECISION</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: decisionCorrect ? COLORS.green : COLORS.red }}>
            {decisionCorrect ? "✓ CORRECT" : `✗ should be ${correctDecisionLabel}`}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 14 }}>&gt; BREAKDOWN</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {allItems.filter((i) => i.flag).map((item) => {
          const found = !!taps[item.id];
          return (
            <div key={item.id} style={{
              borderLeft: `3px solid ${found ? COLORS.green : COLORS.red}`,
              paddingLeft: 14,
              paddingTop: 6,
              paddingBottom: 6,
            }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: found ? COLORS.green : COLORS.red, marginBottom: 4 }}>
                {found ? "✓ FOUND" : "✗ MISSED"}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.text}</div>
              <div style={{ fontSize: 12, color: "#bbbbbb", lineHeight: 1.5 }}>{item.note}</div>
            </div>
          );
        })}
        {offer.verdict === "REAL" && (
          <div style={{
            borderLeft: `3px solid ${COLORS.green}`,
            paddingLeft: 14,
            paddingTop: 6,
            paddingBottom: 6,
          }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: COLORS.green, marginBottom: 4 }}>REAL OFFER</div>
            <div style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.5 }}>
              This one was genuine. The signals are all consistent — a long-tenure recruiter, a matching domain, a personalized pitch, no pressure, and verifiable company history. These are the patterns to trust.
            </div>
          </div>
        )}
      </div>

      <button onClick={onNext} style={primaryBtn}>
        {isLast ? "SEE FINAL RESULTS →" : "NEXT OFFER →"}
      </button>
    </div>
  );
}

// =============================================================================
// RESULTS PANEL
// =============================================================================

function ResultsPanel({ score, getRank, onShare, onReplay, fontStack, primaryBtn }) {
  const { total, flagsFound, correctDecisions, flagPoints, decisionPoints } = score;
  const { label, color, desc } = getRank(total);

  return (
    <div style={{ animation: "fadeIn 500ms ease-out" }}>
      <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; SIMULATION COMPLETE</div>

      <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, marginBottom: 12 }}>YOUR SCORE</div>
      <div style={{ fontSize: "clamp(64px, 12vw, 108px)", fontWeight: 700, lineHeight: 1, letterSpacing: -3, marginBottom: 8 }}>
        {total}
        <span style={{ fontSize: "clamp(20px, 4vw, 30px)", color: COLORS.muted, marginLeft: 12 }}>/ {MAX_SCORE}</span>
      </div>

      <div style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 700, color, letterSpacing: -1, marginBottom: 12 }}>
        {label}
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 32, maxWidth: 600 }}>
        {desc}
      </p>

      <div style={{ border: `1px solid ${COLORS.border}`, padding: 18, marginBottom: 32 }}>
        <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 2, marginBottom: 12 }}>SCORE BREAKDOWN</div>
        <div style={{ fontSize: 13, color: "#cccccc", lineHeight: 1.9 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Red flags found ({flagsFound} / {TOTAL_FLAGS})</span>
            <span style={{ color: COLORS.white }}>+{flagPoints}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Correct decisions ({correctDecisions} / {TOTAL_DECISIONS})</span>
            <span style={{ color: COLORS.white }}>+{decisionPoints}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${COLORS.border}`, paddingTop: 8, marginTop: 8, fontWeight: 700 }}>
            <span style={{ color: COLORS.white }}>TOTAL</span>
            <span style={{ color: COLORS.red }}>{total} / {MAX_SCORE}</span>
          </div>
        </div>
      </div>

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
