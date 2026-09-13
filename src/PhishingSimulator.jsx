import { useEffect, useState } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — PHISHING SIMULATOR
// Companion tool to "The Psychology of Hacking: Why Smart People Fall for
// Dumb Scams." Two-stage per message: (1) LEGITIMATE or PHISHING? (2) If
// phishing, pick every red flag you spotted. Multi-select "select all that
// apply" so users can't rely on picking one obvious tell. Ten messages —
// seven phishing (one per psychological trick from the article) and three
// legitimate — so users learn nuance, not just paranoia.
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

const SOURCE_ARTICLE = {
  title: "The Psychology of Hacking: Why Smart People Fall for Dumb Scams",
  slug: "the-psychology-of-hacking-why-smart",
};

// -----------------------------------------------------------------------------
// The red-flag catalogue. `tactic` maps flags back to the article's 7 tricks
// so the result page can identify a user's weakest tactic.
// -----------------------------------------------------------------------------

const FLAGS = {
  urgency:            { label: "Artificial urgency",      short: "Urgency",       tactic: "Urgency",       desc: "\"Act in 24 hours,\" \"today only,\" \"90 minutes.\" Real companies rarely give you a timer." },
  authority:          { label: "Impersonated authority",  short: "Authority",     tactic: "Authority",     desc: "IRS, bank, Microsoft, CEO. Official titles and logos trigger deference." },
  suspicious_sender:  { label: "Suspicious sender address", short: "Bad sender",  tactic: "N/A",           desc: "Domain doesn't match the claimed organization. Look-alike TLDs, extra hyphens, or subdomains masquerading as real ones." },
  suspicious_link:    { label: "Suspicious link / URL mismatch", short: "Bad link", tactic: "N/A",         desc: "The visible link text and the actual destination don't match. Shortened URLs hide the real destination." },
  intimidation:       { label: "Intimidation / threat",   short: "Intimidation",  tactic: "Intimidation",  desc: "Legal action, account closure, frozen funds. Fear switches your brain from thinking to reacting." },
  scarcity:           { label: "Manufactured scarcity",   short: "Scarcity",      tactic: "Scarcity",      desc: "\"Only 2 hours left,\" \"expiring tonight,\" \"last chance.\" Fear of missing out overrides caution." },
  fake_consensus:     { label: "Fake social proof",       short: "Consensus",     tactic: "Consensus",     desc: "\"94% of your team already completed this.\" You don't want to be the holdout." },
  fake_help:          { label: "Solves a problem you didn't know you had", short: "Fake help", tactic: "Trust", desc: "They created the crisis and the solution simultaneously. You feel grateful someone \"caught this in time.\"" },
  unusual_request:    { label: "Unusual money / data request", short: "Odd ask",  tactic: "N/A",           desc: "Wire transfers, gift cards, credentials, verification codes. Real workflows don't route through email surprises." },
  familiarity:        { label: "Mimicked familiar tone",  short: "Familiarity",   tactic: "Familiarity",   desc: "Casual phrasing that mirrors someone you know. Emojis, first names, references to \"last week.\"" },
  wrong_channel:      { label: "Wrong channel for the ask", short: "Wrong channel", tactic: "N/A",         desc: "Your bank doesn't email you a link to reset MFA. The IRS never calls to demand payment. If the channel is odd, the message is probably odd too." },
  spoof_display:      { label: "Spoofed display name",    short: "Spoof",         tactic: "N/A",           desc: "The display name matches a person you know, but the actual email address is unrelated. Always check the address, not the name." },
};

// -----------------------------------------------------------------------------
// The message catalogue. `truth` is "phish" or "legit". `flags` lists every
// red flag actually present (for phish) — empty array for legit.
// -----------------------------------------------------------------------------

const MESSAGES = [
  {
    id: "boa-romania",
    format: "email",
    from: { name: "Bank of America Security", addr: "alerts@bankofamerica-security-team.com" },
    subject: "URGENT: Unauthorized login detected on your account",
    body: `We detected unauthorized access to your Bank of America account from an IP address in Romania. Your account has been temporarily locked for your protection.\n\nTo restore access and verify your identity, click the link below within 24 hours:\n\nhttps://boa-verify-account.secure-login.link\n\nFailure to verify will result in permanent account closure.`,
    truth: "phish",
    flags: ["urgency", "authority", "suspicious_sender", "suspicious_link", "intimidation", "fake_help"],
    tactic: "Trust + Intimidation",
    explanation: "Classic \"trust + intimidation\" combo. They invented the Romania login (nothing actually happened) and are selling you the fix. Real banks never send verification links by email — they tell you to log in through the app. The domain \"bankofamerica-security-team.com\" is not Bank of America, and the destination \"secure-login.link\" is nowhere near a bank.",
  },
  {
    id: "irs-final-notice",
    format: "email",
    from: { name: "IRS Compliance", addr: "notice@tax-gov-processing.us" },
    subject: "FINAL NOTICE: IRS Case #94728-B",
    body: `Your 2023 tax return has been flagged for audit under Case #94728-B.\n\nFailure to respond within 24 hours will result in legal action, wage garnishment, and asset seizure.\n\nCall immediately: 1-800-555-0912`,
    truth: "phish",
    flags: ["urgency", "authority", "suspicious_sender", "intimidation", "wrong_channel"],
    tactic: "Authority + Urgency + Intimidation",
    explanation: "The IRS communicates by mail. Not email. Not phone calls. Definitely not with 24-hour deadlines threatening asset seizure. The \"tax-gov-processing.us\" domain is nothing to do with the IRS (irs.gov). Any pressure to \"call immediately\" is the entire attack.",
  },
  {
    id: "m365-consensus",
    format: "email",
    from: { name: "Microsoft 365 Security", addr: "security@microsoft365-updates.co" },
    subject: "Mandatory password verification · 3 users remaining",
    body: `Microsoft 365 Security Update: 94% of your organization has completed the mandatory password verification.\n\nYou are one of 3 remaining users. Complete now to maintain access to your account:\n\nhttps://ms365-verify.updates-portal.net`,
    truth: "phish",
    flags: ["fake_consensus", "urgency", "authority", "suspicious_sender", "suspicious_link"],
    tactic: "Consensus + Urgency",
    explanation: "The \"94% of your organization has completed\" line is fake consensus — you imagine your coworkers already did this and you're the holdout. The real Microsoft never mails from microsoft365-updates.co, and password verification is initiated by you inside your account, not by an inbound email.",
  },
  {
    id: "usps-sms",
    format: "sms",
    from: { name: "USPS Alerts", addr: "+1 (472) 555-0198" },
    subject: null,
    body: `USPS: Your package delivery failed due to incomplete address information. Redelivery scheduled for TODAY ONLY. Confirm your address within the next 90 minutes: usps-track.link/x9\n\nMsg&Data rates may apply.`,
    truth: "phish",
    flags: ["urgency", "scarcity", "authority", "suspicious_link", "wrong_channel"],
    tactic: "Urgency + Scarcity",
    explanation: "USPS doesn't text you address-confirmation links with 90-minute timers. Shortened links on SMS are the whole point — you can't see where they lead until you tap. \"TODAY ONLY\" is manufactured scarcity built around the plausible fact that you probably do have a package coming.",
  },
  {
    id: "amazon-prime-expiring",
    format: "email",
    from: { name: "Amazon Prime Billing", addr: "prime-billing@amazon-services-billing.com" },
    subject: "Your Amazon Prime expires in 2 hours",
    body: `Your Amazon Prime membership will expire tonight at midnight.\n\nRenew now to keep your benefits at your current pricing. After expiration, this pricing is no longer available.\n\nRenew: https://amazon-prime-renew.link/renew\n\nThank you for being a Prime member.`,
    truth: "phish",
    flags: ["scarcity", "urgency", "suspicious_sender", "suspicious_link", "authority"],
    tactic: "Scarcity + Intimidation",
    explanation: "Amazon's real Prime billing lives inside your account — never on external \"amazon-services-billing.com\" domains. The scarcity move (\"expires tonight, current pricing gone after\") is designed to make you click before you think. Real Amazon renewals auto-renew or fail quietly. They don't panic you.",
  },
  {
    id: "coworker-slack",
    format: "slack",
    from: { name: "Jenna K. (marketing)", addr: "external, not on your team" },
    subject: null,
    body: `Hey! Long time no chat 😊\n\nQuick question about that vendor invoice you mentioned last week — can you verify this payment went through? Just want to make sure we're all set before EOY. Thanks!\n\n[link to \"invoice.pdf\"]`,
    truth: "phish",
    flags: ["familiarity", "fake_help", "unusual_request", "spoof_display"],
    tactic: "Familiarity + Trust",
    explanation: "You don't remember mentioning an invoice \"last week.\" You don't remember Jenna. The casual tone and emoji do heavy lifting to mirror internal culture. Real coworkers don't send you PDFs of invoices out of nowhere in Slack. Verify through a channel you trust before opening anything — call the person, walk over, or ask in a public channel.",
  },
  {
    id: "ceo-wire",
    format: "email",
    from: { name: "Erich Winkler (CEO)", addr: "erichwinklier@decodedsecurity-mail.net" },
    subject: "Need this handled today · confidential",
    body: `I'm in back-to-back meetings with the acquisition team.\n\nWe need to wire $47,000 to our legal counsel by EOD for the NDA filing. Can you handle this urgently? I'll send the wire details via text — my phone is dying so please use the new number 555-0117 for follow-ups.\n\nKeep this quiet until the deal closes.\n\nErich`,
    truth: "phish",
    flags: ["urgency", "unusual_request", "wrong_channel", "authority", "spoof_display", "suspicious_sender"],
    tactic: "Whaling",
    explanation: "Textbook CEO fraud. Display name looks right, address is wrong (misspelled \"winklier\" + wrong domain). \"Confidential, don't tell anyone\" bypasses your normal verification. \"My phone is dying\" is why you can't call them back on the number you have. The right move is always: verify through a channel you already trust (walk over, call the saved number). Never trust the number in the email.",
  },
  {
    id: "github-notification",
    format: "email",
    from: { name: "GitHub", addr: "notifications@github.com" },
    subject: "[decoded-security/quiz-platform] Pull request #47 opened",
    body: `A pull request was opened by @jsmith in decoded-security/quiz-platform.\n\nTitle: Fix subnet calculator edge case for /31\n\nView on GitHub: https://github.com/decoded-security/quiz-platform/pull/47\n\n—\nYou are receiving this because you are a reviewer on this repository.\nManage notification preferences at https://github.com/settings/notifications`,
    truth: "legit",
    flags: [],
    tactic: null,
    explanation: "Real GitHub notification. Sender is notifications@github.com (real domain). Link goes to github.com directly, no shortener. No urgency, no threats, no unusual asks — just a routine \"you have a PR\" notification. Standard footer explaining why you're getting it. This is what boring, legitimate email looks like.",
  },
  {
    id: "amazon-shipped-legit",
    format: "email",
    from: { name: "Amazon.com", addr: "shipment-tracking@amazon.com" },
    subject: "Your Amazon order has shipped",
    body: `Hi Erich,\n\nYour order of 1 item has shipped and is expected to arrive Tuesday, Nov 25.\n\nOrder #114-3927104-8811045\nSony WH-1000XM5 Headphones\n\nTrack: https://www.amazon.com/gp/your-account/order-details?orderID=114-3927104-8811045\n\nYou can also track your package in the Amazon app.`,
    truth: "legit",
    flags: [],
    tactic: null,
    explanation: "Real Amazon shipping notification. Sender is @amazon.com (not a look-alike). Link goes to amazon.com directly. Order number and item name match something you actually ordered. No urgency, no threats. The give-yourself-away test: does this match an order you actually placed? If yes, it's almost certainly real. If no, it's phishing.",
  },
  {
    id: "substack-reset",
    format: "email",
    from: { name: "Substack", addr: "no-reply@substack.com" },
    subject: "Reset your Substack password",
    body: `You requested a password reset for your Substack account.\n\nClick the link below to choose a new password. This link expires in 1 hour.\n\nhttps://substack.com/password-reset?token=8f3c...\n\nIf you didn't request this, you can safely ignore this email. Your password won't change until you access the link above and create a new one.`,
    truth: "legit",
    flags: [],
    tactic: null,
    explanation: "Real password reset. Sender is @substack.com. Link goes to substack.com. The 1-hour expiration is a standard security practice (not artificial urgency — reset tokens have to expire). Critically: it says \"if you didn't request this, ignore it\" — real password resets tell you it's fine to do nothing. Phishing versions demand action. Ask yourself: did I click \"forgot password\" in the last few minutes? If yes, real. If no, suspicious.",
  },
];

// =============================================================================
// Component
// =============================================================================

export default function PhishingSimulator() {
  const [stage, setStage] = useState("welcome"); // welcome | play | done
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("verdict"); // verdict | flags | revealed
  const [pickedVerdict, setPickedVerdict] = useState(null);
  const [pickedFlags, setPickedFlags] = useState(new Set());
  const [responses, setResponses] = useState([]);
  const [openedTracked, setOpenedTracked] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  useEffect(() => {
    if (!openedTracked) {
      track("phishing_sim_opened");
      setOpenedTracked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const articleUrl = `${BASE_URL}${SOURCE_ARTICLE.slug}`;

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const startGame = () => {
    track("phishing_sim_started");
    setQueue(shuffle(MESSAGES));
    setIdx(0);
    setPhase("verdict");
    setPickedVerdict(null);
    setPickedFlags(new Set());
    setResponses([]);
    setStage("play");
  };

  const submitVerdict = (verdict) => {
    if (phase !== "verdict") return;
    const msg = queue[idx];
    setPickedVerdict(verdict);
    track("phishing_sim_verdict", { id: msg.id, verdict, correct: verdict === msg.truth });
    if (verdict === "phish" && msg.truth === "phish") {
      // Correct call — proceed to flag picker
      setPhase("flags");
    } else {
      // Either wrong verdict, or correctly identified as legit
      finalizeResponse(verdict, new Set());
    }
  };

  const toggleFlag = (fid) => {
    if (phase !== "flags") return;
    const next = new Set(pickedFlags);
    if (next.has(fid)) next.delete(fid);
    else next.add(fid);
    setPickedFlags(next);
  };

  const submitFlags = () => {
    if (phase !== "flags") return;
    finalizeResponse(pickedVerdict, pickedFlags);
  };

  const finalizeResponse = (verdict, flagsSet) => {
    const msg = queue[idx];
    const present = new Set(msg.flags || []);
    const flagsCaught = [...flagsSet].filter((f) => present.has(f)).length;
    const flagsMissed = [...present].filter((f) => !flagsSet.has(f)).length;
    const flagsWrong = [...flagsSet].filter((f) => !present.has(f)).length;
    const entry = {
      id: msg.id, truth: msg.truth, verdict,
      verdictCorrect: verdict === msg.truth,
      flagsPicked: [...flagsSet],
      flagsPresent: [...present],
      flagsCaught, flagsMissed, flagsWrong,
      tactic: msg.tactic,
    };
    track("phishing_sim_response", {
      id: msg.id,
      verdict_correct: entry.verdictCorrect,
      flags_caught: flagsCaught,
      flags_missed: flagsMissed,
      flags_wrong: flagsWrong,
    });
    setResponses([...responses, entry]);
    setPhase("revealed");
  };

  const next = () => {
    if (idx + 1 >= queue.length) {
      const correct = responses.filter((r) => r.verdictCorrect).length;
      const totalFlagsPresent = responses.reduce((s, r) => s + r.flagsPresent.length, 0);
      const totalFlagsCaught = responses.reduce((s, r) => s + r.flagsCaught, 0);
      track("phishing_sim_completed", { verdict_correct: correct, flags_caught: totalFlagsCaught, flags_present: totalFlagsPresent });
      setStage("done");
      return;
    }
    setIdx(idx + 1);
    setPhase("verdict");
    setPickedVerdict(null);
    setPickedFlags(new Set());
  };

  const restart = () => {
    track("phishing_sim_restarted");
    setStage("welcome");
  };

  const msg = queue[idx];
  const lastResponse = responses[responses.length - 1];

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
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <header style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // PHISHING SIMULATOR</div>
          </div>
          <a href="/tools" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            ← ALL TOOLS
          </a>
        </header>

        {stage === "welcome" && <Welcome onStart={startGame} articleUrl={articleUrl} fontStack={fontStack} />}

        {stage === "play" && msg && (
          <Play
            msg={msg} idx={idx} total={queue.length}
            phase={phase} pickedVerdict={pickedVerdict} pickedFlags={pickedFlags}
            lastResponse={lastResponse}
            onVerdict={submitVerdict} onToggleFlag={toggleFlag}
            onSubmitFlags={submitFlags} onNext={next}
            fontStack={fontStack}
          />
        )}

        {stage === "done" && (
          <Done responses={responses} onRestart={restart} articleUrl={articleUrl} fontStack={fontStack} />
        )}

        <footer style={{ marginTop: 60, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // PHISHING_SIM_v1</div>
          <div>SPOT THE FLAGS · NOT ONLY THE VERDICT</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}

// =============================================================================
// Welcome
// =============================================================================

function Welcome({ onStart, articleUrl, fontStack }) {
  return (
    <div style={{ animation: "fadeIn 500ms ease-out" }}>
      <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; 10 MESSAGES · SPOT THE PHISH</div>
      <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 700, lineHeight: 1.08, marginBottom: 20, letterSpacing: -0.8 }}>
        You have 10 new messages. <span style={{ color: COLORS.red }}>How many can you spot?</span>
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 14, maxWidth: 700 }}>
        Each message is a real-shaped email, SMS, or Slack DM. For each one you make two decisions: first, is it <strong style={{ color: COLORS.white }}>LEGITIMATE</strong> or <strong style={{ color: COLORS.white }}>PHISHING</strong>? Then, if you called it phishing, pick every red flag you actually spotted.
      </p>
      <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.55, marginBottom: 28, maxWidth: 700 }}>
        Some messages are real. Some are phishing. The article's whole point is that catching them isn't about being paranoid — it's about spotting the specific psychological trick that's trying to work on you. This tool trains that specific spot.
      </p>

      <a href={articleUrl} target="_blank" rel="noopener noreferrer"
        onClick={() => track("source_article_clicked", { tool: "phishing_sim" })}
        style={{
          display: "block", borderLeft: `2px solid ${COLORS.red}`, paddingLeft: 16,
          marginBottom: 28, maxWidth: 700, textDecoration: "none", color: COLORS.white,
          transition: "all 150ms ease-out",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "20px"; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "16px"; e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>BASED ON THE ARTICLE</div>
        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>The Psychology of Hacking: Why Smart People Fall for Dumb Scams <span style={{ color: COLORS.red }}>↗</span></div>
      </a>

      <button onClick={onStart} style={primaryBtn(fontStack)}>
        OPEN THE INBOX →
      </button>
    </div>
  );
}

// =============================================================================
// Play — message + verdict + flag picker + reveal
// =============================================================================

function Play({ msg, idx, total, phase, pickedVerdict, pickedFlags, lastResponse, onVerdict, onToggleFlag, onSubmitFlags, onNext, fontStack }) {
  return (
    <div style={{ animation: "fadeIn 300ms ease-out" }}>
      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3 }}>MESSAGE {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
          <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5 }}>
            {phase === "verdict" && "LEGIT OR PHISH?"}
            {phase === "flags" && "PICK EVERY RED FLAG"}
            {phase === "revealed" && "REVEAL"}
          </div>
        </div>
        <div style={{ height: 3, backgroundColor: COLORS.border, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${((idx + (phase === "revealed" ? 1 : 0)) / total) * 100}%`, backgroundColor: COLORS.red, transition: "width 400ms ease-out" }} />
        </div>
      </div>

      {/* Message card */}
      <MessageCard msg={msg} />

      {/* Verdict phase */}
      {phase === "verdict" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
          <button onClick={() => onVerdict("legit")}
            style={{
              fontFamily: fontStack, fontSize: 14, fontWeight: 700, letterSpacing: 1.5,
              color: COLORS.white,
              backgroundColor: "transparent",
              border: `2px solid ${COLORS.green}`,
              padding: "18px 16px", cursor: "pointer",
              transition: "all 150ms",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(58,182,118,0.12)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            ✓ LEGITIMATE
          </button>
          <button onClick={() => onVerdict("phish")}
            style={{
              fontFamily: fontStack, fontSize: 14, fontWeight: 700, letterSpacing: 1.5,
              color: COLORS.white,
              backgroundColor: "rgba(230,72,51,0.08)",
              border: `2px solid ${COLORS.red}`,
              padding: "18px 16px", cursor: "pointer",
              transition: "all 150ms",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(230,72,51,0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(230,72,51,0.08)"}
          >
            ⚠ PHISHING
          </button>
        </div>
      )}

      {/* Flag picker phase */}
      {phase === "flags" && (
        <div style={{ marginTop: 20, animation: "fadeIn 250ms ease-out" }}>
          <div style={{
            padding: "12px 16px", marginBottom: 16,
            border: `1px solid ${COLORS.red}`, backgroundColor: "rgba(230,72,51,0.06)",
            fontSize: 13, color: "#dddddd",
          }}>
            <div style={{ fontSize: 10, color: COLORS.red, letterSpacing: 2, marginBottom: 4 }}>PICK ALL THAT APPLY</div>
            You called it phishing — good. Now show your work: pick every red flag you actually spotted in the message above.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8, marginBottom: 16 }}>
            {Object.entries(FLAGS).map(([fid, f]) => {
              const isPicked = pickedFlags.has(fid);
              return (
                <button key={fid} onClick={() => onToggleFlag(fid)}
                  title={f.desc}
                  style={{
                    fontFamily: "inherit", fontSize: 12, textAlign: "left", cursor: "pointer",
                    padding: "10px 12px",
                    border: `1px solid ${isPicked ? COLORS.red : COLORS.border}`,
                    backgroundColor: isPicked ? "rgba(230,72,51,0.08)" : "rgba(255,255,255,0.02)",
                    color: COLORS.white,
                    transition: "all 150ms",
                    display: "flex", alignItems: "flex-start", gap: 8,
                  }}
                  onMouseEnter={(e) => { if (!isPicked) e.currentTarget.style.borderColor = COLORS.red; }}
                  onMouseLeave={(e) => { if (!isPicked) e.currentTarget.style.borderColor = COLORS.border; }}
                >
                  <span style={{ fontSize: 12, color: isPicked ? COLORS.red : COLORS.muted, minWidth: 12 }}>
                    {isPicked ? "✓" : "○"}
                  </span>
                  <span style={{ flex: 1, lineHeight: 1.4 }}>{f.label}</span>
                </button>
              );
            })}
          </div>

          <button onClick={onSubmitFlags} style={primaryBtn(fontStack)}>
            {pickedFlags.size === 0 ? "SUBMIT WITHOUT FLAGS" : `SUBMIT ${pickedFlags.size} FLAG${pickedFlags.size === 1 ? "" : "S"} →`}
          </button>
        </div>
      )}

      {/* Reveal phase */}
      {phase === "revealed" && lastResponse && (
        <RevealPanel msg={msg} response={lastResponse} onNext={onNext} isLast={idx + 1 >= total} fontStack={fontStack} />
      )}
    </div>
  );
}

function RevealPanel({ msg, response, onNext, isLast, fontStack }) {
  const verdictCorrect = response.verdictCorrect;
  const truth = msg.truth;
  const verdictColor = verdictCorrect ? COLORS.green : COLORS.red;
  const verdictLabel = verdictCorrect
    ? (truth === "phish" ? "CORRECT · IT'S PHISHING" : "CORRECT · IT'S LEGITIMATE")
    : (truth === "phish" ? "MISSED · IT WAS PHISHING" : "FALSE ALARM · IT WAS LEGITIMATE");

  return (
    <div style={{ marginTop: 20, animation: "fadeIn 300ms ease-out" }}>
      <div style={{ borderLeft: `2px solid ${verdictColor}`, paddingLeft: 18, marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: verdictColor, marginBottom: 8 }}>{verdictLabel}</div>
        {msg.tactic && (
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>
            Attack tactic: <strong style={{ color: COLORS.white }}>{msg.tactic}</strong>
          </div>
        )}
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#dddddd", margin: 0 }}>{msg.explanation}</p>
      </div>

      {/* Flag breakdown — only if this was a phish */}
      {truth === "phish" && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: COLORS.muted, marginBottom: 10 }}>
            RED FLAGS · {response.flagsCaught} caught · {response.flagsMissed} missed{response.flagsWrong > 0 ? ` · ${response.flagsWrong} false-flagged` : ""}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {msg.flags.map((fid) => {
              const f = FLAGS[fid];
              const caught = response.flagsPicked.includes(fid);
              return (
                <div key={fid} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "10px 12px",
                  border: `1px solid ${caught ? COLORS.green : COLORS.red}`,
                  backgroundColor: caught ? "rgba(58,182,118,0.05)" : "rgba(230,72,51,0.05)",
                  fontSize: 12, lineHeight: 1.5,
                }}>
                  <div style={{ fontSize: 12, color: caught ? COLORS.green : COLORS.red, minWidth: 20, marginTop: 1 }}>
                    {caught ? "✓" : "✗"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.white, marginBottom: 3 }}>
                      {f.label} {!caught && <span style={{ color: COLORS.red, fontSize: 10, letterSpacing: 1, marginLeft: 6 }}>MISSED</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#bbbbbb" }}>{f.desc}</div>
                  </div>
                </div>
              );
            })}
            {response.flagsPicked.filter((fid) => !msg.flags.includes(fid)).map((fid) => {
              const f = FLAGS[fid];
              return (
                <div key={fid} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "10px 12px",
                  border: `1px solid ${COLORS.amber}`,
                  backgroundColor: "rgba(232,161,42,0.05)",
                  fontSize: 12, lineHeight: 1.5,
                }}>
                  <div style={{ fontSize: 12, color: COLORS.amber, minWidth: 20, marginTop: 1 }}>!</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.white, marginBottom: 3 }}>
                      {f.label} <span style={{ color: COLORS.amber, fontSize: 10, letterSpacing: 1, marginLeft: 6 }}>NOT REALLY PRESENT</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "#bbbbbb" }}>You picked this, but this message didn't actually have that pattern. Overtagging is normal on hard cases.</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button onClick={onNext} style={primaryBtn(fontStack)}>
        {isLast ? "SEE MY RESULT →" : "NEXT MESSAGE →"}
      </button>
    </div>
  );
}

// =============================================================================
// Message card — visual variants per format
// =============================================================================

function MessageCard({ msg }) {
  if (msg.format === "sms") return <SmsCard msg={msg} />;
  if (msg.format === "slack") return <SlackCard msg={msg} />;
  return <EmailCard msg={msg} />;
}

function EmailCard({ msg }) {
  return (
    <div style={{
      border: `1px solid ${COLORS.border}`,
      backgroundColor: "rgba(255,255,255,0.02)",
      animation: "fadeIn 200ms ease-out",
    }}>
      <div style={{ padding: "10px 14px", backgroundColor: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 2 }}>EMAIL</div>
        <div style={{ fontSize: 13, color: "#dddddd", marginBottom: 2 }}>
          <span style={{ color: COLORS.muted }}>From: </span>
          <strong>{msg.from.name}</strong> <span style={{ color: COLORS.muted, fontSize: 11 }}>&lt;{msg.from.addr}&gt;</span>
        </div>
        {msg.subject && (
          <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.white, marginTop: 4 }}>
            {msg.subject}
          </div>
        )}
      </div>
      <div style={{ padding: "18px 16px", fontSize: 14, color: "#dddddd", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
        {msg.body}
      </div>
    </div>
  );
}

function SmsCard({ msg }) {
  return (
    <div style={{
      border: `1px solid ${COLORS.border}`,
      backgroundColor: "rgba(255,255,255,0.02)",
      padding: 16,
      animation: "fadeIn 200ms ease-out",
    }}>
      <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 8 }}>SMS · TEXT MESSAGE</div>
      <div style={{ fontSize: 12, color: "#dddddd", marginBottom: 10 }}>
        <span style={{ color: COLORS.muted }}>From: </span>{msg.from.addr}
      </div>
      <div style={{
        padding: "12px 14px", borderRadius: 12,
        backgroundColor: "#242c33",
        maxWidth: "80%",
        fontSize: 14, color: COLORS.white, lineHeight: 1.5,
        whiteSpace: "pre-wrap",
      }}>
        {msg.body}
      </div>
    </div>
  );
}

function SlackCard({ msg }) {
  const initials = (msg.from.name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      border: `1px solid ${COLORS.border}`,
      backgroundColor: "rgba(255,255,255,0.02)",
      padding: 16,
      animation: "fadeIn 200ms ease-out",
    }}>
      <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 12 }}>SLACK · DIRECT MESSAGE</div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 6,
          backgroundColor: "#5a3a99", color: COLORS.white,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 700, flexShrink: 0,
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.white, marginBottom: 2 }}>
            {msg.from.name}
          </div>
          <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 8 }}>
            {msg.from.addr}
          </div>
          <div style={{ fontSize: 14, color: "#dddddd", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {msg.body}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Done — results
// =============================================================================

function Done({ responses, onRestart, articleUrl, fontStack }) {
  const total = responses.length;
  const correct = responses.filter((r) => r.verdictCorrect).length;
  const missedPhish = responses.filter((r) => r.truth === "phish" && !r.verdictCorrect).length;
  const falseAlarms = responses.filter((r) => r.truth === "legit" && !r.verdictCorrect).length;

  const totalFlagsPresent = responses.reduce((s, r) => s + r.flagsPresent.length, 0);
  const totalFlagsCaught = responses.reduce((s, r) => s + r.flagsCaught, 0);
  const flagRate = totalFlagsPresent === 0 ? 100 : Math.round((totalFlagsCaught / totalFlagsPresent) * 100);

  const overallPercent = Math.round((correct / total) * 100);

  // Weakest tactic — which of the article's 7 tricks tripped the user most
  const tacticStats = {};
  for (const r of responses) {
    if (r.truth !== "phish") continue;
    const t = r.tactic || "Other";
    if (!tacticStats[t]) tacticStats[t] = { seen: 0, verdictOk: 0, flagsCaught: 0, flagsPresent: 0 };
    tacticStats[t].seen++;
    if (r.verdictCorrect) tacticStats[t].verdictOk++;
    tacticStats[t].flagsCaught += r.flagsCaught;
    tacticStats[t].flagsPresent += r.flagsPresent.length;
  }
  let weakestTactic = null, weakestScore = 2;
  for (const [t, s] of Object.entries(tacticStats)) {
    const score = (s.verdictOk / s.seen) * 0.5 + (s.flagsPresent > 0 ? s.flagsCaught / s.flagsPresent : 1) * 0.5;
    if (score < weakestScore) { weakestScore = score; weakestTactic = t; }
  }

  return (
    <div style={{ animation: "fadeIn 500ms ease-out" }}>
      <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; INBOX CLOSED</div>
      <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, marginBottom: 8 }}>MESSAGES CALLED CORRECTLY</div>
      <h1 style={{ fontSize: "clamp(48px, 9vw, 84px)", fontWeight: 700, lineHeight: 1, marginBottom: 8, letterSpacing: -2 }}>
        <span style={{ color: overallPercent >= 90 ? COLORS.green : overallPercent >= 70 ? COLORS.amber : COLORS.red }}>{correct}</span>
        <span style={{ color: COLORS.muted, fontSize: "0.35em", marginLeft: 6 }}>/ {total}</span>
      </h1>

      {/* Score breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
        <StatBox label="MISSED PHISH" value={missedPhish} color={missedPhish === 0 ? COLORS.green : COLORS.red} subtext="Phish you called legit" />
        <StatBox label="FALSE ALARMS" value={falseAlarms} color={falseAlarms === 0 ? COLORS.green : COLORS.amber} subtext="Legit you called phish" />
        <StatBox label="FLAGS CAUGHT" value={`${flagRate}%`} color={flagRate >= 70 ? COLORS.green : flagRate >= 50 ? COLORS.amber : COLORS.red} subtext={`${totalFlagsCaught} of ${totalFlagsPresent}`} />
      </div>

      {/* Verdict text */}
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 20, maxWidth: 720 }}>
        {overallPercent >= 90 && "Elite. You would not have fallen for these on a distracted Tuesday. Your instincts are tuned."}
        {overallPercent >= 70 && overallPercent < 90 && "Solid. You catch most of the traps. The ones that slipped are worth re-reading — those are the ones a real attacker will get you with."}
        {overallPercent >= 50 && overallPercent < 70 && "You're at the average — which the article says is exactly what attackers count on. Read the psychological tricks section again and try once more."}
        {overallPercent < 50 && "This is where most people land the first time. The article's whole thesis: it's not intelligence, it's awareness. Read it, retry, and you'll jump."}
        {weakestTactic && ` Your weakest tactic to spot: ${weakestTactic}.`}
      </p>

      {/* Article + defense checklist CTA */}
      <div style={{ border: `2px solid ${COLORS.red}`, backgroundColor: "rgba(230, 72, 51, 0.06)", padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>KEEP GOING</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
          The article has a 5-item defense checklist — do those five things this week.
        </div>
        <p style={{ fontSize: 13, color: "#cccccc", marginBottom: 16, lineHeight: 1.55 }}>
          MFA on every account that matters. Verify urgent financial requests through a second channel. Hover before you click. Set up a family code word. Share this simulator with one person who needs it.
        </p>
        <a href={articleUrl} target="_blank" rel="noopener noreferrer"
          onClick={() => track("phishing_sim_article_clicked")}
          style={{
            display: "inline-block", fontFamily: fontStack, fontSize: 13, fontWeight: 600,
            letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
            textDecoration: "none", padding: "12px 22px",
          }}
        >
          READ THE ARTICLE →
        </a>
      </div>

      <div style={{ border: `1px solid ${COLORS.border}`, padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 10 }}>NEWSLETTER</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>Free weekly cybersecurity breakdowns.</div>
        <p style={{ fontSize: 13, color: "#bbbbbb", marginBottom: 14, lineHeight: 1.5 }}>Social engineering, AI security, exam prep. 1,590+ readers.</p>
        <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer"
          onClick={() => track("subscribe_clicked", { tool: "phishing_sim" })}
          style={{
            display: "inline-block", fontFamily: fontStack, fontSize: 13, fontWeight: 600,
            letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
            textDecoration: "none", padding: "12px 22px",
          }}
        >
          SUBSCRIBE →
        </a>
      </div>

      <button onClick={onRestart} style={primaryBtn(fontStack)}>
        ↻ NEW INBOX · RESHUFFLED
      </button>
    </div>
  );
}

function StatBox({ label, value, color, subtext }) {
  return (
    <div style={{ border: `1px solid ${COLORS.border}`, padding: 14, backgroundColor: "rgba(255,255,255,0.02)" }}>
      <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 10, letterSpacing: 1.5, color: COLORS.muted, marginBottom: 4 }}>{label}</div>
      {subtext && <div style={{ fontSize: 11, color: "#999" }}>{subtext}</div>}
    </div>
  );
}

function primaryBtn(fontStack, disabled = false) {
  return {
    fontFamily: fontStack, fontSize: 14, fontWeight: 600, letterSpacing: 1.5,
    color: COLORS.white,
    backgroundColor: disabled ? "#3a2724" : COLORS.red,
    border: "none", padding: "14px 28px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
    transition: "transform 150ms, box-shadow 150ms",
  };
}
