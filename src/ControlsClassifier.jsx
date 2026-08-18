import { useEffect, useState } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — SECURITY CONTROLS CLASSIFIER
// Two-tap classifier for the "Cybersecurity Controls from Zero to Hero" article.
// Every real security control has TWO classifications: HOW it works
// (Administrative / Technical / Physical) and WHY it exists (Preventive /
// Detective / Corrective / Deterrent / Recovery / Compensating). This tool
// forces the reader to make both decisions on 20 realistic controls, one
// after another, with instant reasoning per round.
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
  title: "Cybersecurity Controls from Zero to Hero",
  slug: "cybersecurity-controls-from-zero",
};

const HOW = ["administrative", "technical", "physical"];
const HOW_LABEL = {
  administrative: "Administrative",
  technical:      "Technical",
  physical:       "Physical",
};

const WHY = ["preventive", "detective", "corrective", "deterrent", "recovery", "compensating"];
const WHY_LABEL = {
  preventive:    "Preventive",
  detective:     "Detective",
  corrective:    "Corrective",
  deterrent:     "Deterrent",
  recovery:      "Recovery",
  compensating:  "Compensating",
};

// -----------------------------------------------------------------------------
// The catalogue. `how` is a single canonical answer. `why` is an array of
// accepted answers (many real controls fit two functional types — the article
// says so; the tool honors it and calls out the alternate in the reasoning).
// -----------------------------------------------------------------------------

const CONTROLS = [
  {
    id: "fw-rdp",
    name: "Firewall rule blocking inbound RDP from the internet",
    desc: "The perimeter firewall drops any packet destined for TCP 3389 from a public source.",
    how: "technical",
    why: ["preventive"],
    reasoning: "Technical because it is enforced by a piece of software running on network hardware. Preventive because it stops the connection before it ever reaches an internal host.",
  },
  {
    id: "awareness-training",
    name: "Quarterly employee security awareness training on phishing",
    desc: "Every employee completes a 30-minute training on how to spot phishing emails.",
    how: "administrative",
    why: ["deterrent", "preventive"],
    reasoning: "Administrative because it is a people-and-process control, not a tool. It is Deterrent (employees become less likely to click a suspicious link) and reasonably Preventive (fewer clicks means fewer breaches). Both are accepted.",
  },
  {
    id: "perimeter-fence",
    name: "Chain-link fence around the data center",
    desc: "A 3-meter fence surrounds the physical perimeter of the facility.",
    how: "physical",
    why: ["deterrent", "preventive"],
    reasoning: "Physical because you can touch it. Deterrent (its visible presence discourages the casual intruder) and Preventive (it physically blocks access). Both are accepted.",
  },
  {
    id: "db-encryption",
    name: "AES-256 encryption of the customer database at rest",
    desc: "Every row of the customer database is encrypted before it hits disk.",
    how: "technical",
    why: ["preventive"],
    reasoning: "Technical because it is done by software using cryptographic algorithms. Preventive because even if an attacker exfiltrates the database file, it is unreadable without the key.",
  },
  {
    id: "siem-correlation",
    name: "SIEM correlation rule alerting on unusual admin login patterns",
    desc: "The SIEM fires an alert when an admin logs in from a new country combined with a privilege change.",
    how: "technical",
    why: ["detective"],
    reasoning: "Technical because the SIEM is a software system. Detective because it does not stop the login — it flags it so a human can investigate. Corrective would be if it also disabled the account.",
  },
  {
    id: "backup-restore",
    name: "Restoring the file server from last night's backup after ransomware",
    desc: "Ransomware encrypted the file share. You wipe the server and restore from the previous night's backup.",
    how: "technical",
    why: ["recovery"],
    reasoning: "Technical because the backup and restore are done by backup software. Recovery because it restores operations after an incident. Not corrective — corrective fixes the underlying issue; recovery restores the state.",
  },
  {
    id: "ir-policy",
    name: "Written incident response policy signed by the CISO",
    desc: "A formal policy document defining who does what when an incident is declared.",
    how: "administrative",
    why: ["preventive"],
    reasoning: "Administrative because it is a policy — a people-and-process artifact. Preventive in the sense that having a clear plan prevents chaos and slow response. Some CISSP material also counts this as Corrective (it drives corrective action later); the primary CISSP answer is Preventive.",
  },
  {
    id: "cctv",
    name: "CCTV cameras at every building entrance",
    desc: "24/7 cameras monitored by security staff and recorded for 30 days.",
    how: "physical",
    why: ["detective", "deterrent"],
    reasoning: "Physical because it is a physical device in the environment. Detective because it captures who came and went. Deterrent because visible cameras discourage bad behavior. Both are accepted.",
  },
  {
    id: "motion-lights",
    name: "Motion-activated floodlights around the parking lot",
    desc: "Bright lights snap on when anyone enters the lot at night.",
    how: "physical",
    why: ["deterrent", "detective"],
    reasoning: "Physical device. Deterrent (would-be trespassers hate being lit up) and Detective (security notices the light and looks). Both are accepted.",
  },
  {
    id: "av-quarantine",
    name: "Antivirus quarantining a malicious file on download",
    desc: "The endpoint agent detects a known-bad signature and moves the file to quarantine before execution.",
    how: "technical",
    why: ["corrective", "preventive"],
    reasoning: "Technical because it is enforced by endpoint software. Corrective because it takes an action to fix the situation (isolates the file). Also arguably Preventive because execution never happens. Both accepted.",
  },
  {
    id: "background-check",
    name: "Reference and criminal background check on new hires",
    desc: "Every candidate goes through a third-party background screen before an offer letter is signed.",
    how: "administrative",
    why: ["preventive"],
    reasoning: "Administrative — it is an HR process. Preventive because it stops known-bad hires from joining in the first place.",
  },
  {
    id: "isolated-legacy",
    name: "Isolated network segment for a legacy system that cannot be patched",
    desc: "A 15-year-old app can't be updated. It's placed on its own VLAN with no internet access as a workaround.",
    how: "technical",
    why: ["compensating"],
    reasoning: "Technical because it's a network configuration. Compensating because it substitutes for the control you actually want (patching), which isn't feasible. Compensating always signals \"we can't do the ideal thing, so here is a reasonable alternative.\"",
  },
  {
    id: "warning-banner",
    name: "Login warning banner: \"Unauthorized access is prosecuted\"",
    desc: "Every login screen shows a warning that unauthorized access is a criminal offense and may be prosecuted.",
    how: "administrative",
    why: ["deterrent"],
    reasoning: "Administrative because it is a policy statement, not a technical block or a physical barrier. Deterrent because its whole purpose is to discourage — the banner does not actually prevent anything.",
  },
  {
    id: "lockout",
    name: "Account lockout after 5 failed login attempts in 15 minutes",
    desc: "After five wrong password attempts, the account is locked for 30 minutes.",
    how: "technical",
    why: ["preventive", "deterrent"],
    reasoning: "Technical because it is enforced by the auth system. Preventive because it stops brute-force attempts from succeeding, and Deterrent because attackers know it exists. Both accepted.",
  },
  {
    id: "guard-dog",
    name: "Security dog patrolling the warehouse at night",
    desc: "A trained dog and handler walk the warehouse floor between 10 PM and 6 AM.",
    how: "physical",
    why: ["deterrent", "detective"],
    reasoning: "Physical presence. Deterrent (would-be intruders reconsider) and Detective (the dog notices someone before a human would). Both accepted.",
  },
  {
    id: "access-review",
    name: "Quarterly access review to catch privilege creep",
    desc: "Every quarter, managers review their team's access and remove permissions that no longer fit.",
    how: "administrative",
    why: ["detective"],
    reasoning: "Administrative because it is a governance process. Detective because it finds inappropriate access that already exists. A future removal is technically corrective — but the review itself is the detection.",
  },
  {
    id: "ups",
    name: "Uninterruptible power supply for the server room",
    desc: "A UPS provides bridge power for 15 minutes when grid power drops, giving generators time to kick in.",
    how: "physical",
    why: ["recovery"],
    reasoning: "Physical hardware. Recovery because it restores/maintains operations after (or during) a power event. Not preventive — it doesn't prevent the power outage from happening.",
  },
  {
    id: "bollards",
    name: "Concrete bollards preventing vehicles from ramming the lobby",
    desc: "Reinforced concrete posts in front of the ground-floor entrance.",
    how: "physical",
    why: ["preventive", "deterrent"],
    reasoning: "Physical structures. Preventive (they physically block a vehicle attack) and Deterrent (their presence discourages the attempt). Both accepted.",
  },
  {
    id: "fim",
    name: "File integrity monitoring alerting on changes to /etc/passwd",
    desc: "An FIM agent hashes system files and fires an alert when the hash changes unexpectedly.",
    how: "technical",
    why: ["detective"],
    reasoning: "Technical because it is a software agent. Detective because it notices unauthorized changes after they happen. It does not prevent the change and does not roll it back.",
  },
  {
    id: "fire-suppression",
    name: "Fire suppression system that activates on smoke detection",
    desc: "An FM-200 or water mist system automatically discharges when smoke is detected in the server room.",
    how: "physical",
    why: ["corrective"],
    reasoning: "Physical system. Corrective because it takes action to fix a bad state (fire in progress). Not preventive — the fire has already started; the system limits the damage.",
  },
];

// =============================================================================
// Component
// =============================================================================

export default function ControlsClassifier() {
  const [stage, setStage] = useState("welcome"); // welcome | play | done
  const [queue, setQueue] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [pickedHow, setPickedHow] = useState(null);
  const [pickedWhy, setPickedWhy] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState([]);
  const [copied, setCopied] = useState(false);
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
      track("controls_classifier_opened");
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
    track("controls_classifier_started");
    setQueue(shuffle(CONTROLS));
    setCurrentIdx(0);
    setPickedHow(null);
    setPickedWhy(null);
    setSubmitted(false);
    setResponses([]);
    setStage("play");
  };

  const submit = () => {
    if (!pickedHow || !pickedWhy || submitted) return;
    const control = queue[currentIdx];
    const howOK = pickedHow === control.how;
    const whyOK = control.why.includes(pickedWhy);
    track("controls_classifier_answered", {
      id: control.id,
      picked_how: pickedHow, picked_why: pickedWhy,
      how_ok: howOK, why_ok: whyOK,
    });
    setSubmitted(true);
    setResponses([...responses, {
      id: control.id, name: control.name,
      pickedHow, pickedWhy, howOK, whyOK,
      correctHow: control.how, correctWhy: control.why[0],
      reasoning: control.reasoning,
    }]);
  };

  const next = () => {
    if (currentIdx + 1 >= queue.length) {
      const scoreHow = responses.filter((r) => r.howOK).length;
      const scoreWhy = responses.filter((r) => r.whyOK).length;
      track("controls_classifier_completed", {
        score_how: scoreHow, score_why: scoreWhy, total: queue.length,
      });
      setStage("done");
    } else {
      setCurrentIdx(currentIdx + 1);
      setPickedHow(null);
      setPickedWhy(null);
      setSubmitted(false);
    }
  };

  const restart = () => {
    track("controls_classifier_restarted");
    setStage("welcome");
  };

  const scoreHow = responses.filter((r) => r.howOK).length;
  const scoreWhy = responses.filter((r) => r.whyOK).length;
  const total = queue.length || CONTROLS.length;
  const combined = total === 0 ? 0 : Math.round(100 * (scoreHow + scoreWhy) / (total * 2));

  // Weakest WHY type (for the result-page feedback)
  const weakestWhy = (() => {
    if (responses.length === 0) return null;
    const stats = {};
    for (const w of WHY) stats[w] = { seen: 0, correct: 0 };
    for (const r of responses) {
      const canonical = r.correctWhy;
      stats[canonical].seen++;
      if (r.whyOK) stats[canonical].correct++;
    }
    let worst = null, worstRatio = Infinity;
    for (const [w, s] of Object.entries(stats)) {
      if (s.seen === 0) continue;
      const ratio = s.correct / s.seen;
      if (ratio < worstRatio) { worstRatio = ratio; worst = w; }
    }
    if (worst === null || worstRatio === 1) return null;
    return WHY_LABEL[worst];
  })();

  const buildShareLine = () => {
    const first = `I scored ${combined}% on the Security Controls Classifier.`;
    const second = ` Got HOW right on ${scoreHow}/${total} and WHY right on ${scoreWhy}/${total}.`;
    return `🎯 ${first}${second} #ControlsClassifier`;
  };

  const copyShare = async () => {
    const text = buildShareLine();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.left = "-9999px";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      track("controls_classifier_share_copied", { combined });
    } catch (e) {}
  };

  const currentControl = queue[currentIdx];
  const currentResponse = submitted ? responses[responses.length - 1] : null;

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
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // CONTROLS CLASSIFIER</div>
          </div>
          <a href="/tools" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            ← ALL TOOLS
          </a>
        </header>

        {/* WELCOME */}
        {stage === "welcome" && (
          <div style={{ animation: "fadeIn 500ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; TWO-TAP CONTROL CLASSIFIER</div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.08, marginBottom: 20, letterSpacing: -1 }}>
              Every security control has <span style={{ color: COLORS.red }}>two</span> classifications. Can you get both right?
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 14, maxWidth: 700 }}>
              20 real controls will appear one at a time. For each, pick <strong style={{ color: COLORS.white }}>HOW</strong> it works (Administrative, Technical, Physical) and <strong style={{ color: COLORS.white }}>WHY</strong> it exists (Preventive, Detective, Corrective, Deterrent, Recovery, Compensating).
            </p>
            <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 28, maxWidth: 700, lineHeight: 1.55 }}>
              Some controls fit more than one WHY. Either accepted answer is correct. The reasoning gets shown after every round.
            </p>

            <a href={articleUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => track("source_article_clicked", { tool: "controls_classifier" })}
              style={{
                display: "block", borderLeft: `2px solid ${COLORS.red}`, paddingLeft: 16,
                marginBottom: 28, maxWidth: 700, textDecoration: "none", color: COLORS.white,
                transition: "all 150ms ease-out",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "20px"; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "16px"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>BASED ON THE ARTICLE</div>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span></div>
            </a>

            <button onClick={startGame} style={primaryBtn(fontStack)}>
              START CLASSIFYING →
            </button>
          </div>
        )}

        {/* PLAY */}
        {stage === "play" && currentControl && (
          <div>
            {/* Progress */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3 }}>CONTROL {String(currentIdx + 1).padStart(2, "0")} / {String(queue.length).padStart(2, "0")}</div>
                <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5 }}>HOW · WHY</div>
              </div>
              <div style={{ height: 3, backgroundColor: COLORS.border, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${((currentIdx + (submitted ? 1 : 0)) / queue.length) * 100}%`, backgroundColor: COLORS.red, transition: "width 400ms ease-out" }} />
              </div>
            </div>

            {/* Control card */}
            <div style={{
              border: `1px solid ${submitted ? (currentResponse.howOK && currentResponse.whyOK ? COLORS.green : COLORS.red) : COLORS.border}`,
              backgroundColor: "rgba(255,255,255,0.02)",
              padding: 22, marginBottom: 22,
              animation: "fadeIn 200ms ease-out",
            }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: COLORS.muted, marginBottom: 8 }}>THE CONTROL</div>
              <h2 style={{ fontSize: "clamp(18px, 3vw, 22px)", fontWeight: 700, lineHeight: 1.3, marginBottom: 10 }}>{currentControl.name}</h2>
              <p style={{ fontSize: 13, color: "#bbbbbb", lineHeight: 1.6, margin: 0 }}>{currentControl.desc}</p>
            </div>

            {/* HOW row */}
            <SectionLabel>HOW · Category</SectionLabel>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {HOW.map((h) => {
                const isPicked = pickedHow === h;
                const isCorrect = submitted && h === currentControl.how;
                const isWrongPicked = submitted && isPicked && !isCorrect;
                return (
                  <button key={h}
                    onClick={() => !submitted && setPickedHow(h)}
                    disabled={submitted}
                    style={{
                      fontFamily: fontStack, fontSize: 13, fontWeight: 600, letterSpacing: 1,
                      color: COLORS.white,
                      backgroundColor: isCorrect ? "rgba(58,182,118,0.14)"
                                     : isWrongPicked ? "rgba(230,72,51,0.14)"
                                     : isPicked ? "rgba(230,72,51,0.08)"
                                     : "transparent",
                      border: `1px solid ${isCorrect ? COLORS.green
                                        : isWrongPicked ? COLORS.red
                                        : isPicked ? COLORS.red
                                        : COLORS.border}`,
                      padding: "12px 20px",
                      cursor: submitted ? "default" : "pointer",
                      transition: "all 150ms",
                      flex: "1 1 140px",
                    }}
                    onMouseEnter={(e) => { if (!submitted && !isPicked) { e.currentTarget.style.borderColor = COLORS.red; } }}
                    onMouseLeave={(e) => { if (!submitted && !isPicked) { e.currentTarget.style.borderColor = COLORS.border; } }}
                  >
                    {HOW_LABEL[h]}
                    {isCorrect && <span style={{ marginLeft: 8, color: COLORS.green }}>✓</span>}
                    {isWrongPicked && <span style={{ marginLeft: 8, color: COLORS.red }}>✗</span>}
                  </button>
                );
              })}
            </div>

            {/* WHY row */}
            <SectionLabel>WHY · Function</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 20 }}>
              {WHY.map((w) => {
                const isPicked = pickedWhy === w;
                const isAccepted = submitted && currentControl.why.includes(w);
                const isWrongPicked = submitted && isPicked && !isAccepted;
                return (
                  <button key={w}
                    onClick={() => !submitted && setPickedWhy(w)}
                    disabled={submitted}
                    style={{
                      fontFamily: fontStack, fontSize: 13, fontWeight: 600, letterSpacing: 1,
                      color: COLORS.white,
                      backgroundColor: isAccepted ? "rgba(58,182,118,0.14)"
                                     : isWrongPicked ? "rgba(230,72,51,0.14)"
                                     : isPicked ? "rgba(230,72,51,0.08)"
                                     : "transparent",
                      border: `1px solid ${isAccepted ? COLORS.green
                                        : isWrongPicked ? COLORS.red
                                        : isPicked ? COLORS.red
                                        : COLORS.border}`,
                      padding: "12px 16px",
                      cursor: submitted ? "default" : "pointer",
                      transition: "all 150ms",
                    }}
                    onMouseEnter={(e) => { if (!submitted && !isPicked) { e.currentTarget.style.borderColor = COLORS.red; } }}
                    onMouseLeave={(e) => { if (!submitted && !isPicked) { e.currentTarget.style.borderColor = COLORS.border; } }}
                  >
                    {WHY_LABEL[w]}
                    {isAccepted && <span style={{ marginLeft: 6, color: COLORS.green }}>✓</span>}
                    {isWrongPicked && <span style={{ marginLeft: 6, color: COLORS.red }}>✗</span>}
                  </button>
                );
              })}
            </div>

            {/* Submit or feedback + next */}
            {!submitted ? (
              <div>
                <button onClick={submit} disabled={!pickedHow || !pickedWhy} style={primaryBtn(fontStack, !pickedHow || !pickedWhy)}>
                  {pickedHow && pickedWhy ? "SUBMIT ANSWER →" : "PICK BOTH TO SUBMIT"}
                </button>
                <div style={{ marginTop: 12, fontSize: 11, color: COLORS.muted, letterSpacing: 1 }}>
                  Some controls have more than one valid WHY. Either accepted answer counts.
                </div>
              </div>
            ) : (
              <div style={{ animation: "fadeIn 250ms ease-out" }}>
                <div style={{
                  borderLeft: `2px solid ${currentResponse.howOK && currentResponse.whyOK ? COLORS.green : COLORS.red}`,
                  paddingLeft: 18, marginBottom: 20,
                }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, marginBottom: 8, color: currentResponse.howOK && currentResponse.whyOK ? COLORS.green : COLORS.red }}>
                    {currentResponse.howOK && currentResponse.whyOK ? "BOTH CORRECT ✓"
                     : currentResponse.howOK ? "HOW correct · WHY wrong"
                     : currentResponse.whyOK ? "WHY correct · HOW wrong"
                     : "BOTH WRONG"}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "#dddddd", margin: 0 }}>
                    {currentResponse.reasoning}
                  </p>
                </div>
                <button onClick={next} style={primaryBtn(fontStack)}>
                  {currentIdx + 1 < queue.length ? "NEXT CONTROL →" : "SEE MY RESULT →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* DONE */}
        {stage === "done" && (
          <div style={{ animation: "fadeIn 600ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; ALL 20 CLASSIFIED</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, marginBottom: 8 }}>COMBINED ACCURACY</div>
            <h1 style={{ fontSize: "clamp(48px, 9vw, 88px)", fontWeight: 700, lineHeight: 1, marginBottom: 8, letterSpacing: -2 }}>
              <span style={{ color: combined >= 80 ? COLORS.green : combined >= 60 ? COLORS.amber : COLORS.red }}>{combined}</span>
              <span style={{ color: COLORS.muted, fontSize: "0.35em", marginLeft: 6 }}>%</span>
            </h1>

            {/* Score breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 24 }}>
              <div style={{ border: `1px solid ${COLORS.border}`, padding: 14, backgroundColor: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: scoreHow >= total * 0.8 ? COLORS.green : scoreHow >= total * 0.6 ? COLORS.amber : COLORS.red, lineHeight: 1, marginBottom: 6 }}>
                  {scoreHow}<span style={{ fontSize: 14, color: COLORS.muted, marginLeft: 4 }}>/ {total}</span>
                </div>
                <div style={{ fontSize: 10, letterSpacing: 1.5, color: COLORS.muted }}>HOW CORRECT</div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>Administrative · Technical · Physical</div>
              </div>
              <div style={{ border: `1px solid ${COLORS.border}`, padding: 14, backgroundColor: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: scoreWhy >= total * 0.8 ? COLORS.green : scoreWhy >= total * 0.6 ? COLORS.amber : COLORS.red, lineHeight: 1, marginBottom: 6 }}>
                  {scoreWhy}<span style={{ fontSize: 14, color: COLORS.muted, marginLeft: 4 }}>/ {total}</span>
                </div>
                <div style={{ fontSize: 10, letterSpacing: 1.5, color: COLORS.muted }}>WHY CORRECT</div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>Preventive · Detective · Corrective · Deterrent · Recovery · Compensating</div>
              </div>
            </div>

            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 24, maxWidth: 700 }}>
              {combined >= 90 && "Nailed it. Both axes are internalized. The CISSP will not catch you on this and neither will an interviewer."}
              {combined >= 75 && combined < 90 && "Strong. You have the 2D structure. A couple of the multi-valid ones might have thrown you."}
              {combined >= 60 && combined < 75 && "You have HOW down but WHY is where CISSP loves to trip people up. Re-read the article's six-type section."}
              {combined < 60 && "This is exactly why the article uses examples — the abstract definitions are hard to memorize until you classify a few dozen real controls."}
              {weakestWhy && ` Your weakest function type: ${weakestWhy}.`}
            </p>

            {/* REWARD CTA — same pattern as Vibe Coding / Alert Triage */}
            <div style={{ border: `2px solid ${COLORS.red}`, backgroundColor: "rgba(230, 72, 51, 0.06)", padding: 28, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>CLAIM YOUR REWARD</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                One month of Decoded Security Premium, on the house.
              </div>
              <p style={{ fontSize: 14, color: "#cccccc", marginBottom: 18, lineHeight: 1.6 }}>
                Copy the line below, paste it into the article comments, and Decoded Security will DM you a promo code.
              </p>
              <div style={{
                padding: 14, backgroundColor: COLORS.codeBg,
                border: `1px solid ${COLORS.border}`, marginBottom: 14,
                fontSize: 13, color: COLORS.white, wordBreak: "break-word", lineHeight: 1.5,
              }}>
                {buildShareLine()}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={copyShare}
                  style={{
                    fontFamily: fontStack, fontSize: 13, fontWeight: 600, letterSpacing: 1.5,
                    color: copied ? COLORS.green : COLORS.white,
                    backgroundColor: "transparent",
                    border: `1px solid ${copied ? COLORS.green : COLORS.white}`,
                    padding: "12px 22px", cursor: "pointer", transition: "all 150ms",
                  }}
                >
                  {copied ? "COPIED ✓" : "COPY THIS LINE"}
                </button>
                <a href={articleUrl} target="_blank" rel="noopener noreferrer"
                  onClick={() => track("comments_cta_clicked", { tool: "controls_classifier", combined })}
                  style={{
                    display: "inline-block", fontFamily: fontStack, fontSize: 13, fontWeight: 600,
                    letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
                    textDecoration: "none", padding: "12px 22px",
                  }}
                >
                  OPEN THE ARTICLE →
                </a>
              </div>
            </div>

            {/* Newsletter */}
            <div style={{ border: `1px solid ${COLORS.border}`, padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 10 }}>NEWSLETTER</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>Free weekly cybersecurity breakdowns.</div>
              <p style={{ fontSize: 13, color: "#bbbbbb", marginBottom: 16, lineHeight: 1.5 }}>Controls, IAM, SOC prep, secure design. 1,450+ readers.</p>
              <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer"
                onClick={() => track("subscribe_clicked", { tool: "controls_classifier" })}
                style={{
                  display: "inline-block", fontFamily: fontStack, fontSize: 13, fontWeight: 600,
                  letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
                  textDecoration: "none", padding: "12px 22px",
                }}
              >
                SUBSCRIBE →
              </a>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={startGame} style={primaryBtn(fontStack)}>
                ↻ PLAY AGAIN · RESHUFFLED
              </button>
              <button onClick={restart}
                style={{
                  fontFamily: fontStack, fontSize: 13, color: COLORS.muted,
                  backgroundColor: "transparent", border: `1px solid ${COLORS.border}`,
                  padding: "14px 22px", cursor: "pointer", letterSpacing: 1.5,
                }}
              >
                BACK TO WELCOME
              </button>
            </div>
          </div>
        )}

        <footer style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // CONTROLS_CLASSIFIER_v1</div>
          <div>TWO CLASSIFICATIONS · ONE CONTROL</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, letterSpacing: 2, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase" }}>
      {children}
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
