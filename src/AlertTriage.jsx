import { useEffect, useState, useCallback, useRef } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — ALERT TRIAGE RUSH
// 60-second SOC analyst simulator based on the SIEM article. Alerts stream in
// one at a time. Some scary-looking alerts are noise; some innocuous ones are
// real attacks. User has 60 seconds to accept (investigate) or dismiss (FP).
// Precision / recall + breakdown of what was missed at the end.
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
  title: "This Is How I Explain SIEM To a Beginner",
  slug: "this-is-how-i-explain-siem-to-a-beginner",
};

const GAME_SECONDS = 60;

// -----------------------------------------------------------------------------
// Alert catalogue — 20 total, ~10 TP and ~10 FP, mix of obvious and subtle.
// `truth: "accept"` means REAL THREAT (should be investigated).
// `truth: "dismiss"` means FALSE POSITIVE (should be closed).
// -----------------------------------------------------------------------------

const ALERTS = [
  {
    id: "ps-enc-hidden",
    severity: "high",
    title: "Encoded PowerShell — hidden window",
    source: "EDR · finance-ws-14",
    timestamp: "14:32:07",
    logs: [
      "14:32:07  process_start  parent=explorer.exe user=finance-admin",
      "14:32:07  cmdline        powershell.exe -w hidden -enc SQBFAFgAIAAoAE4A...",
      "14:32:08  network        outbound tcp 45.61.174.19:443",
    ],
    context: null,
    truth: "accept",
    reasoning: "Base64 encoding + hidden window + immediate outbound to a rare IP = obfuscated payload calling home. Textbook malware execution.",
  },
  {
    id: "vuln-scan-ssh",
    severity: "high",
    title: "SSH brute-force — 50 failures / 30s",
    source: "IDS · fw-01",
    timestamp: "09:15:03",
    logs: [
      "09:15:01  auth  FAIL  user=root  src=10.5.1.14",
      "09:15:02  auth  FAIL  user=admin src=10.5.1.14",
      "09:15:03  ids   ALERT rate: 50 failed SSH in 30s from 10.5.1.14",
    ],
    context: "10.5.1.14 is your monthly vulnerability scanner (security-team-runbook §3.2).",
    truth: "dismiss",
    reasoning: "The source is your own scheduled vuln scanner. Loud in the logs, harmless. Accepting this = a ticket for your own tooling.",
  },
  {
    id: "svc-interactive-logon",
    severity: "medium",
    title: "Service account interactive logon at console",
    source: "Windows security · dc-prod-02",
    timestamp: "02:47:11",
    logs: [
      "02:47:11  event 4624  logon_type=2 (Interactive)",
      "02:47:11  account     svc_backup",
      "02:47:11  computer    dc-prod-02  (console)",
    ],
    context: null,
    truth: "accept",
    reasoning: "Service accounts should only do batch/network logons. Interactive logon type 2 at 2:47 AM from a service account means someone got the creds and is using them by hand.",
  },
  {
    id: "edr-quarantined-coinminer",
    severity: "critical",
    title: "Malware detected and quarantined",
    source: "EDR · sales-ws-08",
    timestamp: "11:04:22",
    logs: [
      "11:04:22  detection  Trojan.Win32.Coinminer",
      "11:04:22  file       C:\\Users\\public\\svchost.exe",
      "11:04:22  action     QUARANTINED · execution blocked",
    ],
    context: null,
    truth: "dismiss",
    reasoning: "The EDR already handled it — file quarantined, execution blocked. Detection worked as designed. Loop back if you see repeated attempts, but this instance is closed.",
  },
  {
    id: "ntdsutil-dc",
    severity: "high",
    title: "ntdsutil.exe executed on domain controller",
    source: "Windows sysmon · dc-prod-01",
    timestamp: "22:11:44",
    logs: [
      '22:11:44  cmdline  ntdsutil.exe "ac i ntds" "ifm" "create full C:\\temp"',
      "22:11:44  user     admin-svc",
      "22:11:44  parent   cmd.exe (session id: 4)",
    ],
    context: null,
    truth: "accept",
    reasoning: "The `ifm` command extracts NTDS.dit — the full Active Directory database, including every password hash in the domain. Classic credential dump precursor. If this isn't a scheduled DR test, it's an active attack.",
  },
  {
    id: "impossible-travel-calendar",
    severity: "high",
    title: "Impossible travel — NYC to Tokyo in 4h",
    source: "identity provider",
    timestamp: "13:02:19",
    logs: [
      "09:00:00  auth  ok  user=jsmith@corp  src=NYC (74.6.x.x)",
      "13:00:12  auth  ok  user=jsmith@corp  src=Tokyo (110.44.x.x)",
      "13:02:19  ipa   ALERT geo-velocity impossible (11,000 km / 4h)",
    ],
    context: "jsmith's calendar shows a business trip to Tokyo starting today. Local proxy egress explains NYC→Tokyo pattern.",
    truth: "dismiss",
    reasoning: "Calendar confirms the trip. Big global companies route traffic through their nearest regional gateway, which explains the geographic hop. Verified normal.",
  },
  {
    id: "defender-exclusion",
    severity: "medium",
    title: "Windows Defender exclusion added programmatically",
    source: "EDR audit · eng-ws-22",
    timestamp: "16:18:57",
    logs: [
      "16:18:57  cmdline  Add-MpPreference -ExclusionPath 'C:\\temp\\svc\\'",
      "16:18:57  user     SYSTEM",
      "16:18:57  parent   powershell.exe (non-interactive)",
    ],
    context: null,
    truth: "accept",
    reasoning: "Attackers routinely disable defenses before staging payloads. Legit exclusions go through GPO. A scripted Add-MpPreference by SYSTEM from an unattended shell is a classic pre-attack step.",
  },
  {
    id: "expired-cert-internal",
    severity: "low",
    title: "TLS certificate expired",
    source: "monitoring",
    timestamp: "08:00:04",
    logs: [
      "08:00:04  tls  ERR  internal-tool.corp.local",
      "08:00:04  detail  certificate expired 3 days ago",
    ],
    context: null,
    truth: "dismiss",
    reasoning: "Internal cert lapsed. Ops ticket, not a security incident. Someone in infra forgot to renew — send it to ITSM.",
  },
  {
    id: "dns-known-c2",
    severity: "critical",
    title: "DNS query to known-bad domain",
    source: "DNS + threat intel",
    timestamp: "10:44:03",
    logs: [
      "10:44:03  dns  query  tsobjxzokrxbhwqbenxxq.info  type=A",
      "10:44:03  src           workstation-42",
      "10:44:03  ioc match     Threat Feed: APT41 · C2 beacon",
    ],
    context: null,
    truth: "accept",
    reasoning: "DGA-style domain matched an active threat intel feed. There is no legitimate reason a corporate workstation queries a randomly-generated .info domain. Live C2 beacon.",
  },
  {
    id: "backup-egress",
    severity: "high",
    title: "500 MB outbound to S3 from backup-01",
    source: "firewall",
    timestamp: "23:15:00",
    logs: [
      "23:15:00  fw  ALLOW  backup-01 → s3.amazonaws.com  HTTPS",
      "23:45:12  fw  total  500 MB over 30 min",
    ],
    context: "Nightly backup window is 23:00–01:00. Runbook confirms S3 as the offsite target.",
    truth: "dismiss",
    reasoning: "This is your own backup job doing exactly what the runbook says. Time window matches, destination is your documented target, source is the backup host. Text-book noise.",
  },
  {
    id: "scheduled-task-dc",
    severity: "medium",
    title: "Scheduled task created on DC with misleading name",
    source: "Windows event · dc-prod-01",
    timestamp: "18:52:33",
    logs: [
      '18:52:33  schtasks  /create /tn "MicrosoftUpdate" /tr "cmd.exe /c C:\\temp\\x.ps1"',
      "18:52:33  user      backup-svc",
      "18:52:33  runs as   SYSTEM  every hour",
    ],
    context: null,
    truth: "accept",
    reasoning: "Legit scheduled tasks have meaningful names and go through change management. A task called \"MicrosoftUpdate\" that runs a script out of C:\\temp as SYSTEM every hour is persistence. Same pattern as most commodity malware.",
  },
  {
    id: "user-forgot-password",
    severity: "high",
    title: "Bruteforce — 12 failed logins on admin",
    source: "auth logs",
    timestamp: "08:22:11",
    logs: [
      "08:22:03  auth  FAIL  user=jsmith-admin  src=10.4.7.55",
      "08:22:11  auth  ok    user=jsmith-admin  src=10.4.7.55",
      "08:22:11  helpdesk ticket #4488 — password reset for jsmith-admin",
    ],
    context: "Source IP 10.4.7.55 is jsmith's usual workstation. Helpdesk ticket for the reset is linked.",
    truth: "dismiss",
    reasoning: "Same workstation, same user, followed by a linked helpdesk password reset. Real bruteforce doesn't file its own tickets. Verified benign.",
  },
  {
    id: "spooler-restart-multi-dc",
    severity: "medium",
    title: "Print spooler restart across multiple DCs",
    source: "Windows service manager",
    timestamp: "14:07:19",
    logs: [
      "14:07:19  service  Spooler restart  dc-01",
      "14:07:32  service  Spooler restart  dc-02",
      "14:07:41  service  Spooler restart  dc-03",
    ],
    context: null,
    truth: "accept",
    reasoning: "PrintNightmare exploitation restarts the spooler service. Multiple DCs restarting within 30 seconds isn't coincidence — it's coordinated exploitation. Escalate immediately.",
  },
  {
    id: "google-dns-drops",
    severity: "medium",
    title: "Multiple firewall drops from 8.8.8.8",
    source: "firewall",
    timestamp: "12:00:00",
    logs: [
      "12:00:00  fw  DROP  100 UDP  8.8.8.8:53 → dns-int-01",
      "12:00:00  detail  return traffic without matching state",
    ],
    context: null,
    truth: "dismiss",
    reasoning: "8.8.8.8 is Google Public DNS. This is legitimate DNS response traffic being dropped by a stateless rule. Fix the firewall config — not a security incident.",
  },
  {
    id: "kerberoast-rc4",
    severity: "high",
    title: "RC4 Kerberos TGS in AES-only domain",
    source: "Windows security · dc-prod-01",
    timestamp: "19:44:02",
    logs: [
      "19:44:02  event 4769  TGS-REQ service=MSSQLSvc/db-prod-01",
      "19:44:02  encryption  RC4-HMAC (0x17)",
      "19:44:02  domain policy AES128/AES256 only",
    ],
    context: null,
    truth: "accept",
    reasoning: "Kerberoasting — attacker requests service tickets encrypted with RC4 so they can crack them offline. Legitimate services in an AES-only domain never request RC4. Live attack.",
  },
  {
    id: "onboarding-admin",
    severity: "high",
    title: "New member added to Domain Admins",
    source: "AD audit",
    timestamp: "10:15:00",
    logs: [
      "10:15:00  event 4728  member added: jsmith → Domain Admins",
      "10:15:00  added by    IT-approver-01",
      "10:15:00  ticket link ITSM #4429 — new hire onboarding",
    ],
    context: "HR onboarding ticket #4429 shows jsmith joined the IT infrastructure team today.",
    truth: "dismiss",
    reasoning: "Onboarding ticket exists, approver is legitimate, timing matches HR's start date. Standard IT lifecycle event.",
  },
  {
    id: "off-hours-cross-domain-rdp",
    severity: "medium",
    title: "IT admin RDP into finance server at 3:47 AM",
    source: "RDP logs",
    timestamp: "03:47:21",
    logs: [
      "03:47:21  rdp  ok  user=it-sysadmin  dst=finance-db-01",
      "03:47:21  session length ongoing",
      "03:47:21  change tickets  none",
    ],
    context: null,
    truth: "accept",
    reasoning: "IT admins have permissions across the environment but rarely touch finance systems. Cross-domain access at 4 AM with no change ticket is either malicious use of a legit admin account, or the admin is doing something they'll regret. Investigate immediately.",
  },
  {
    id: "pentest-portscan",
    severity: "medium",
    title: "Port scan — 1000 ports from partner network",
    source: "IDS",
    timestamp: "15:22:04",
    logs: [
      "15:22:04  ids  ALERT  1000 ports scanned by 203.0.113.44 → DMZ",
      "15:22:04  duration  under 60 seconds",
    ],
    context: "203.0.113.44 belongs to your contracted pentest firm. Scan window scheduled 15:00–17:00 today.",
    truth: "dismiss",
    reasoning: "Contracted pentester, scheduled window, expected activity. Silence the alert for the window and let them work.",
  },
  {
    id: "tor-exit-vpn-login",
    severity: "medium",
    title: "Successful VPN login from Tor exit node",
    source: "threat intel + auth logs",
    timestamp: "01:23:44",
    logs: [
      "01:23:44  auth  ok  user=hr-manager  src=185.220.101.42",
      "01:23:44  intel        185.220.101.42 = active Tor exit",
      "01:23:44  device       unmanaged, first seen today",
    ],
    context: null,
    truth: "accept",
    reasoning: "Real users don't route through Tor to reach the corporate VPN. First-seen unmanaged device from a Tor exit at 1:23 AM = almost certainly credential compromise. Force MFA re-auth and investigate.",
  },
  {
    id: "legacy-tls-public",
    severity: "low",
    title: "Legacy TLS 1.0 connections observed",
    source: "web application firewall",
    timestamp: "12:00:00",
    logs: [
      "12:00:00  waf  info  3 clients using TLSv1.0 → api.corp.com",
      "12:00:00  detail  client user-agents indicate legacy browsers",
    ],
    context: null,
    truth: "dismiss",
    reasoning: "Old customers with old browsers hitting a public API. Not an incident — a backlog item for the deprecation calendar.",
  },
];

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const sevStyle = (sev) => {
  switch (sev) {
    case "critical": return { bg: "rgba(230,72,51,0.15)", fg: "#ff8877", border: "#e64833" };
    case "high":     return { bg: "rgba(232,161,42,0.14)", fg: "#f2b656", border: "#e8a12a" };
    case "medium":   return { bg: "rgba(250,204,21,0.10)", fg: "#e0c14f", border: "#a68e3a" };
    case "low":      return { bg: "rgba(136,136,136,0.10)", fg: "#aaaaaa", border: "#555" };
    default:         return { bg: "transparent", fg: "#aaa", border: "#444" };
  }
};

// =============================================================================
// Component
// =============================================================================

export default function AlertTriage() {
  const [stage, setStage] = useState("welcome"); // welcome | play | done
  const [queue, setQueue] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState([]);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [copied, setCopied] = useState(false);
  const [openedTracked, setOpenedTracked] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  useEffect(() => {
    if (!openedTracked) {
      track("alert_triage_opened");
      setOpenedTracked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const articleUrl = `${BASE_URL}${SOURCE_ARTICLE.slug}`;

  const finish = useCallback((finalResponses) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const tp = finalResponses.filter((r) => r.truth === "accept" && r.response === "accept").length;
    const fpDismissed = finalResponses.filter((r) => r.truth === "dismiss" && r.response === "dismiss").length;
    const wasted = finalResponses.filter((r) => r.truth === "dismiss" && r.response === "accept").length;
    const missed = finalResponses.filter((r) => r.truth === "accept" && r.response === "dismiss").length;
    track("alert_triage_completed", { handled: finalResponses.length, tp, fpDismissed, wasted, missed });
    setStage("done");
  }, []);

  // Start game
  const startGame = () => {
    const shuffled = shuffle(ALERTS);
    setQueue(shuffled);
    setCurrentIdx(0);
    setResponses([]);
    setTimeLeft(GAME_SECONDS);
    setStage("play");
    track("alert_triage_started");
  };

  // Timer
  useEffect(() => {
    if (stage !== "play") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          // finish with whatever responses are captured — use latest via functional style
          setResponses((r) => { finish(r); return r; });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const respond = useCallback((response) => {
    if (stage !== "play") return;
    const alert = queue[currentIdx];
    if (!alert) return;
    const entry = { id: alert.id, response, truth: alert.truth, reasoning: alert.reasoning, title: alert.title, severity: alert.severity };
    const newResponses = [...responses, entry];
    setResponses(newResponses);
    track("alert_triage_response", { id: alert.id, response, correct: response === alert.truth });

    // Advance
    if (currentIdx + 1 >= queue.length) {
      // Ran through the whole deck before time ran out
      finish(newResponses);
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  }, [stage, queue, currentIdx, responses, finish]);

  // Keyboard shortcuts
  useEffect(() => {
    if (stage !== "play") return;
    const onKey = (e) => {
      if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") { e.preventDefault(); respond("accept"); }
      if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") { e.preventDefault(); respond("dismiss"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, respond]);

  const restart = () => {
    setStage("welcome");
    setCopied(false);
  };

  // Score calculations
  const tp = responses.filter((r) => r.truth === "accept" && r.response === "accept").length;
  const fpDismissed = responses.filter((r) => r.truth === "dismiss" && r.response === "dismiss").length;
  const wasted = responses.filter((r) => r.truth === "dismiss" && r.response === "accept").length;
  const missed = responses.filter((r) => r.truth === "accept" && r.response === "dismiss").length;
  const totalReal = tp + missed;
  const totalHandled = responses.length;
  const accuracy = totalHandled === 0 ? 0 : Math.round(((tp + fpDismissed) / totalHandled) * 100);
  const recall = totalReal === 0 ? null : Math.round((tp / totalReal) * 100);

  const buildShareLine = () => {
    const parts = [`I scored ${accuracy}% on Alert Triage Rush`];
    if (totalReal > 0) parts.push(`caught ${tp}/${totalReal} real attacks in 60s`);
    return `🚨 ${parts.join(" — ")}. Try it: quiz.decodedsecurity.com/tools/alert-triage #AlertTriageRush`;
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
      track("alert_triage_share_copied", { accuracy });
    } catch (e) {}
  };

  const currentAlert = queue[currentIdx];
  const missedAlerts = responses.filter((r) => r.truth === "accept" && r.response === "dismiss");
  const wastedAlerts = responses.filter((r) => r.truth === "dismiss" && r.response === "accept");

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
        <header style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}`, animation: stage === "play" ? "pulse 1.4s ease-in-out infinite" : "none" }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // ALERT TRIAGE RUSH</div>
          </div>
          <a href="/tools" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2, transition: "color 150ms, border-color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            ← ALL TOOLS
          </a>
        </header>

        {/* WELCOME */}
        {stage === "welcome" && (
          <div style={{ animation: "fadeIn 500ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; 60-SECOND SOC ANALYST SIMULATOR</div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.08, marginBottom: 20, letterSpacing: -1 }}>
              20 alerts. 60 seconds. <span style={{ color: COLORS.red }}>How many real attacks can you catch?</span>
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 16, maxWidth: 680 }}>
              You're a SOC analyst on shift. Alerts stream in one at a time. Some look scary but are just noise. Some look boring but are active attacks hiding in the logs. You have to hit ACCEPT (investigate) or DISMISS (false positive) as fast as you can.
            </p>
            <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 28, maxWidth: 680, lineHeight: 1.55 }}>
              You won't get feedback during the game — only at the end. That's the point. Real SOC work is: make the call, move on, find out in the postmortem.
            </p>

            <a href={articleUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => track("source_article_clicked", { tool: "alert_triage" })}
              style={{
                display: "block", borderLeft: `2px solid ${COLORS.red}`, paddingLeft: 16,
                marginBottom: 28, maxWidth: 680, textDecoration: "none", color: COLORS.white,
                transition: "all 150ms ease-out",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "20px"; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "16px"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>BASED ON THE ARTICLE</div>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span></div>
            </a>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 28 }}>
              {[
                { num: "20", label: "REALISTIC ALERTS", body: "Half real threats, half noise. Shuffled every run." },
                { num: "60s", label: "ONE MINUTE", body: "You'll handle 8–15 alerts. Fast wins more attempts." },
                { num: "A / D", label: "KEYBOARD", body: "A = ACCEPT · D = DISMISS. Faster than clicking." },
              ].map((x) => (
                <div key={x.label} style={{ border: `1px solid ${COLORS.border}`, padding: 14, backgroundColor: "rgba(255,255,255,0.02)" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.red, marginBottom: 4 }}>{x.num}</div>
                  <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 6 }}>{x.label}</div>
                  <div style={{ fontSize: 12, color: "#bbbbbb", lineHeight: 1.5 }}>{x.body}</div>
                </div>
              ))}
            </div>

            <button
              onClick={startGame}
              style={primaryBtn(fontStack)}
            >
              START — 60-SECOND SHIFT →
            </button>
          </div>
        )}

        {/* PLAY */}
        {stage === "play" && currentAlert && (
          <div>
            {/* Timer + progress bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 2 }}>
                  ALERT {String(currentIdx + 1).padStart(2, "0")} / {String(queue.length).padStart(2, "0")}
                </div>
                <div style={{
                  fontSize: 44, fontWeight: 700, letterSpacing: -2,
                  color: timeLeft <= 10 ? COLORS.red : COLORS.white,
                  animation: timeLeft <= 10 ? "pulse 0.8s ease-in-out infinite" : "none",
                  lineHeight: 1,
                }}>
                  {String(timeLeft).padStart(2, "0")}<span style={{ fontSize: 18, color: COLORS.muted, marginLeft: 4 }}>s</span>
                </div>
              </div>
              <div style={{ height: 3, backgroundColor: COLORS.border, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(timeLeft / GAME_SECONDS) * 100}%`,
                  backgroundColor: timeLeft <= 10 ? COLORS.red : COLORS.green,
                  transition: "width 1s linear, background-color 300ms",
                }} />
              </div>
            </div>

            {/* Alert card */}
            <AlertCard alert={currentAlert} key={currentAlert.id} />

            {/* Action buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
              <button onClick={() => respond("accept")}
                style={{
                  fontFamily: fontStack, fontSize: 14, fontWeight: 700, letterSpacing: 1.5,
                  color: COLORS.white,
                  backgroundColor: "rgba(230,72,51,0.08)",
                  border: `2px solid ${COLORS.red}`,
                  padding: "18px 20px", cursor: "pointer",
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(230,72,51,0.2)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(230,72,51,0.08)"}
              >
                ⚠ ACCEPT — INVESTIGATE <span style={{ color: COLORS.muted, fontSize: 10, marginLeft: 6 }}>[A]</span>
              </button>
              <button onClick={() => respond("dismiss")}
                style={{
                  fontFamily: fontStack, fontSize: 14, fontWeight: 700, letterSpacing: 1.5,
                  color: COLORS.white,
                  backgroundColor: "transparent",
                  border: `2px solid ${COLORS.border}`,
                  padding: "18px 20px", cursor: "pointer",
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.muted; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                ✕ DISMISS — FALSE POSITIVE <span style={{ color: COLORS.muted, fontSize: 10, marginLeft: 6 }}>[D]</span>
              </button>
            </div>

            <div style={{ marginTop: 14, fontSize: 10, color: COLORS.muted, letterSpacing: 1, textAlign: "center" }}>
              KEYBOARD: A = ACCEPT · D = DISMISS
            </div>
          </div>
        )}

        {/* DONE */}
        {stage === "done" && (
          <div style={{ animation: "fadeIn 500ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; SHIFT OVER</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, marginBottom: 8 }}>ACCURACY ON ALERTS YOU HANDLED</div>
            <h1 style={{ fontSize: "clamp(48px, 9vw, 88px)", fontWeight: 700, lineHeight: 1, marginBottom: 8, letterSpacing: -2 }}>
              <span style={{ color: accuracy >= 80 ? COLORS.green : accuracy >= 60 ? COLORS.amber : COLORS.red }}>{accuracy}</span>
              <span style={{ color: COLORS.muted, fontSize: "0.35em", marginLeft: 6 }}>%</span>
            </h1>

            <ScoreBoard tp={tp} totalReal={totalReal} missed={missed} wasted={wasted} fpDismissed={fpDismissed} handled={totalHandled} totalDeck={queue.length} />

            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", margin: "24px 0 32px", maxWidth: 640 }}>
              {accuracy >= 90 && "Elite. You'd cut it in a real SOC. Precision and recall both strong — you're catching the real stuff without wasting the team's time on noise."}
              {accuracy >= 70 && accuracy < 90 && "Solid. Real analysts miss things too — the target isn't perfection, it's a stable low miss rate. Keep the ones you missed in mind and try again."}
              {accuracy >= 50 && accuracy < 70 && "This is why SOC analysts train for months. The signal-to-noise ratio is brutal. Read the article on SIEM, then come back."}
              {accuracy < 50 && "Close to coin-flip territory. That's not an insult — real SOCs shadow new analysts for weeks before they touch alerts alone. The patterns take time."}
              {totalReal > 0 && recall !== null && ` You caught ${recall}% of the real attacks that appeared.`}
            </p>

            {/* SHARE */}
            <div style={{ border: `2px solid ${COLORS.red}`, backgroundColor: "rgba(230,72,51,0.06)", padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>CHALLENGE SOMEONE</div>
              <div style={{
                padding: 12, backgroundColor: COLORS.codeBg,
                border: `1px solid ${COLORS.border}`, marginBottom: 12,
                fontSize: 13, color: COLORS.white, wordBreak: "break-word", lineHeight: 1.5,
              }}>
                {buildShareLine()}
              </div>
              <button onClick={copyShare}
                style={{
                  fontFamily: fontStack, fontSize: 13, fontWeight: 600, letterSpacing: 1.5,
                  color: copied ? COLORS.green : COLORS.white,
                  backgroundColor: "transparent",
                  border: `1px solid ${copied ? COLORS.green : COLORS.white}`,
                  padding: "12px 22px", cursor: "pointer", transition: "all 150ms",
                }}
              >
                {copied ? "COPIED ✓" : "COPY & SHARE"}
              </button>
            </div>

            {/* Missed real attacks */}
            {missedAlerts.length > 0 && (
              <BreakdownList
                title="WHAT YOU MISSED"
                subtitle={`${missedAlerts.length} real attack${missedAlerts.length === 1 ? "" : "s"} slipped through. These are the ones that mattered.`}
                items={missedAlerts}
                accent={COLORS.red}
                verdict="REAL ATTACK · You dismissed it"
              />
            )}

            {/* Wasted investigations */}
            {wastedAlerts.length > 0 && (
              <BreakdownList
                title="WASTED INVESTIGATIONS"
                subtitle={`${wastedAlerts.length} false positive${wastedAlerts.length === 1 ? "" : "s"} you accepted. In a real SOC, each one is 30–60 minutes an analyst didn't spend on real work.`}
                items={wastedAlerts}
                accent={COLORS.amber}
                verdict="FALSE POSITIVE · You accepted it"
              />
            )}

            {/* Article CTA */}
            <div style={{ border: `1px solid ${COLORS.red}`, backgroundColor: "rgba(230, 72, 51, 0.04)", padding: 24, marginBottom: 20, marginTop: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>KEEP GOING</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>
                The article breaks down why triage is this hard — and what a good SIEM does about it.
              </div>
              <a href={articleUrl} target="_blank" rel="noopener noreferrer"
                onClick={() => track("comments_cta_clicked", { tool: "alert_triage" })}
                style={{
                  display: "inline-block", fontFamily: fontStack, fontSize: 13, fontWeight: 600,
                  letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
                  textDecoration: "none", padding: "12px 22px",
                }}
              >
                READ THE ARTICLE →
              </a>
            </div>

            {/* Newsletter */}
            <div style={{ border: `1px solid ${COLORS.border}`, padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 10 }}>NEWSLETTER</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>Free weekly cybersecurity breakdowns.</div>
              <p style={{ fontSize: 13, color: "#bbbbbb", marginBottom: 16, lineHeight: 1.5 }}>SOC prep, exam material, secure coding. 1,450+ readers.</p>
              <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer"
                onClick={() => track("subscribe_clicked", { tool: "alert_triage" })}
                style={{
                  display: "inline-block", fontFamily: fontStack, fontSize: 13, fontWeight: 600,
                  letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
                  textDecoration: "none", padding: "12px 22px",
                }}
              >
                SUBSCRIBE →
              </a>
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <button onClick={startGame} style={primaryBtn(fontStack)}>
                ↻ PLAY AGAIN — RESHUFFLED
              </button>
              <button onClick={restart} style={{
                fontFamily: fontStack, fontSize: 13, color: COLORS.muted,
                backgroundColor: "transparent", border: `1px solid ${COLORS.border}`,
                padding: "14px 22px", cursor: "pointer", letterSpacing: 1.5,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.white; e.currentTarget.style.borderColor = COLORS.muted; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderColor = COLORS.border; }}
              >
                BACK TO WELCOME
              </button>
            </div>
          </div>
        )}

        <footer style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // ALERT_TRIAGE_v1</div>
          <div>SIGNAL VS NOISE</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function AlertCard({ alert }) {
  const sev = sevStyle(alert.severity);
  return (
    <div style={{
      border: `1px solid ${sev.border}`,
      backgroundColor: "rgba(255,255,255,0.02)",
      padding: 20,
      animation: "slideIn 200ms ease-out",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{
          fontSize: 10, letterSpacing: 2, fontWeight: 700,
          padding: "3px 10px",
          backgroundColor: sev.bg, color: sev.fg,
          border: `1px solid ${sev.border}`,
        }}>
          SEV: {alert.severity.toUpperCase()}
        </div>
        <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1 }}>
          {alert.source} · {alert.timestamp}
        </div>
      </div>

      <h2 style={{ fontSize: "clamp(18px, 3vw, 22px)", fontWeight: 700, marginBottom: 14, lineHeight: 1.3, color: COLORS.white }}>
        {alert.title}
      </h2>

      <pre style={{
        margin: "0 0 12px",
        backgroundColor: COLORS.codeBg,
        border: `1px solid ${COLORS.border}`,
        padding: 12,
        fontSize: 11.5, lineHeight: 1.65,
        color: "#cccccc", overflowX: "auto",
        fontFamily: "inherit", whiteSpace: "pre-wrap",
      }}>
        {alert.logs.join("\n")}
      </pre>

      {alert.context && (
        <div style={{
          borderLeft: `2px solid ${COLORS.muted}`,
          paddingLeft: 12,
          fontSize: 12, color: "#bbbbbb", lineHeight: 1.5,
        }}>
          <span style={{ color: COLORS.muted, fontSize: 10, letterSpacing: 1.5, marginRight: 6 }}>CONTEXT ·</span>
          {alert.context}
        </div>
      )}
    </div>
  );
}

function ScoreBoard({ tp, totalReal, missed, wasted, fpDismissed, handled, totalDeck }) {
  const boxes = [
    { label: "REAL ATTACKS CAUGHT", value: tp, subtext: totalReal > 0 ? `of ${totalReal} that appeared` : "none appeared", color: COLORS.green },
    { label: "MISSED BREACHES", value: missed, subtext: missed === 0 ? "clean sweep" : "real attacks you dismissed", color: COLORS.red },
    { label: "NOISE CORRECTLY DISMISSED", value: fpDismissed, subtext: "false positives you closed", color: COLORS.green },
    { label: "WASTED INVESTIGATIONS", value: wasted, subtext: wasted === 0 ? "no false alarms" : "FPs you escalated", color: COLORS.amber },
  ];
  return (
    <div>
      <div style={{ fontSize: 11, letterSpacing: 2, color: COLORS.muted, marginBottom: 10 }}>
        HANDLED {handled} / {totalDeck} ALERTS
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        {boxes.map((b) => (
          <div key={b.label} style={{ border: `1px solid ${COLORS.border}`, padding: 14, backgroundColor: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: b.color, lineHeight: 1, marginBottom: 6 }}>{b.value}</div>
            <div style={{ fontSize: 10, letterSpacing: 1.5, color: COLORS.muted, marginBottom: 4 }}>{b.label}</div>
            <div style={{ fontSize: 11, color: "#999", lineHeight: 1.4 }}>{b.subtext}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BreakdownList({ title, subtitle, items, accent, verdict }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: accent, letterSpacing: 3, marginBottom: 8 }}>&gt; {title}</div>
      <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 14, lineHeight: 1.55 }}>{subtitle}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => (
          <div key={item.id} style={{ border: `1px solid ${COLORS.border}`, borderLeft: `2px solid ${accent}`, padding: 14, backgroundColor: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.white }}>{item.title}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: accent }}>{verdict}</div>
            </div>
            <p style={{ fontSize: 12, color: "#cccccc", margin: 0, lineHeight: 1.55 }}>{item.reasoning}</p>
          </div>
        ))}
      </div>
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
