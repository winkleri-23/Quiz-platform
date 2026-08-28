import { useEffect, useState, useRef } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — PORT SCANNER VISUALIZER
// Interactive port-scan tool for "What Is a Port?" article. Renders a host as
// a "building" with 16 numbered doors. Click a door (or type a port and knock)
// to see what state it's in — Open, Closed, or Filtered — with an animated
// envelope reaching the door. Six preset target scenarios teach the common
// real-world port patterns. Terminal-style output alongside the visual so
// readers see the classic Nmap-style result too.
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
  wall: "#1a1a1a",
  roof: "#2a2a2a",
};

const BASE_URL = "https://www.decodedsecurity.com/p/";
const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";

// TODO: Update slug once article publishes with its final URL.
const SOURCE_ARTICLE = {
  title: "What Is a Port? (And Why Every Cybersecurity Beginner Needs to Understand Scanning)",
  slug: "what-is-a-port",
};

// -----------------------------------------------------------------------------
// The 16 doors (ports). Order matters — this is the display order in the grid.
// -----------------------------------------------------------------------------
const PORTS = [
  { port: 21,   service: "FTP",         desc: "File transfer — unencrypted, legacy" },
  { port: 22,   service: "SSH",         desc: "Secure remote shell" },
  { port: 23,   service: "Telnet",      desc: "Legacy remote login — unencrypted" },
  { port: 25,   service: "SMTP",        desc: "Mail server-to-server delivery" },
  { port: 53,   service: "DNS",         desc: "Name resolution" },
  { port: 80,   service: "HTTP",        desc: "Unencrypted web" },
  { port: 110,  service: "POP3",        desc: "Legacy mail retrieval" },
  { port: 143,  service: "IMAP",        desc: "Mail retrieval" },
  { port: 443,  service: "HTTPS",       desc: "Encrypted web" },
  { port: 445,  service: "SMB",         desc: "Windows file sharing" },
  { port: 587,  service: "Submission",  desc: "Mail submission (TLS)" },
  { port: 993,  service: "IMAPS",       desc: "Mail retrieval (TLS)" },
  { port: 3306, service: "MySQL",       desc: "Database" },
  { port: 3389, service: "RDP",         desc: "Windows Remote Desktop" },
  { port: 5432, service: "PostgreSQL",  desc: "Database" },
  { port: 8080, service: "HTTP-alt",    desc: "Alt web / proxy" },
];

const PORT_META = Object.fromEntries(PORTS.map((p) => [p.port, p]));

// -----------------------------------------------------------------------------
// Six target scenarios. Each defines which ports are open/filtered — every
// other port is closed by default. `note` is shown once the target is fully
// scanned.
// -----------------------------------------------------------------------------
const TARGETS = [
  {
    id: "web-server",
    name: "DMZ web server",
    ip: "203.0.113.42",
    hostname: "web.decodedsecurity.com",
    role: "Public-facing e-commerce site.",
    open: [22, 80, 443],
    filtered: [3389],
    note: "Textbook DMZ web server. 80 and 443 are supposed to be public. 22 open is common but IP-whitelisting is recommended. 3389 is filtered — someone smart configured that firewall.",
  },
  {
    id: "database",
    name: "Internal database",
    ip: "10.4.7.55",
    hostname: "db-prod-01.internal.corp",
    role: "Production PostgreSQL database.",
    open: [5432],
    filtered: [22],
    note: "Database server done right. Only the DB port is open (and only to specific internal hosts). SSH is filtered from most sources, allowed only from the jump-host.",
  },
  {
    id: "laptop",
    name: "Employee laptop",
    ip: "10.4.7.201",
    hostname: "laptop-jsmith.corp.local",
    role: "Marketing team laptop.",
    open: [],
    filtered: [22, 80, 443, 445, 3389],
    note: "Personal firewall in front of the endpoint. Nothing listening on public interfaces (as it should be for a workstation). Everything shows filtered — you cannot even tell what would be behind it.",
  },
  {
    id: "legacy",
    name: "Legacy misconfigured host",
    ip: "10.4.8.13",
    hostname: "legacy-app.corp.local",
    role: "Nobody wants to touch this box.",
    open: [21, 23, 80, 3389, 8080],
    filtered: [],
    note: "Every red flag at once. FTP (21) and Telnet (23) send credentials in cleartext. HTTP (80) with no HTTPS at all. RDP (3389) reachable. Textbook \"schedule the decommission.\"",
  },
  {
    id: "mail",
    name: "Mail server",
    ip: "203.0.113.88",
    hostname: "mail.decodedsecurity.com",
    role: "Company email infrastructure.",
    open: [25, 143, 443, 587, 993],
    filtered: [22],
    note: "Normal mail-server exposure. Note the pairs: 25 (server-to-server delivery) + 587 (client submission), 143 (legacy IMAP) + 993 (IMAPS). Admin SSH filtered from the internet.",
  },
  {
    id: "hardened",
    name: "Hardened production server",
    ip: "203.0.113.7",
    hostname: "api.decodedsecurity.com",
    role: "Public API. Everything else locked down.",
    open: [443],
    filtered: [22],
    note: "Textbook hardening. Only the required service (HTTPS 443) is exposed to the internet. Admin access filtered to specific IPs — visible in the scan but unreachable. This is what \"least exposure\" looks like.",
  },
];

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function computeStates(target) {
  // Returns { [port]: "open" | "closed" | "filtered" } for all 16 known ports.
  const states = {};
  for (const p of PORTS) {
    if (target.open.includes(p.port)) states[p.port] = "open";
    else if (target.filtered.includes(p.port)) states[p.port] = "filtered";
    else states[p.port] = "closed";
  }
  return states;
}

const STATE_COLOR = {
  open:     COLORS.green,
  closed:   COLORS.muted,
  filtered: COLORS.amber,
  unknown:  "#3a3a3a",
};

const STATE_LABEL = {
  open:     "OPEN",
  closed:   "CLOSED",
  filtered: "FILTERED",
};

// =============================================================================
// Component
// =============================================================================

export default function PortScanner() {
  const [targetId, setTargetId] = useState(TARGETS[0].id);
  const [revealed, setRevealed] = useState(new Set()); // ports whose state has been revealed
  const [knocking, setKnocking] = useState(null); // port currently being knocked (for animation)
  const [portInput, setPortInput] = useState("");
  const [lastResult, setLastResult] = useState(null); // { port, state } — for the "just knocked" callout
  const [scanning, setScanning] = useState(false);
  const [openedTracked, setOpenedTracked] = useState(false);
  const scanTimerRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  useEffect(() => {
    if (!openedTracked) {
      track("port_scanner_opened");
      setOpenedTracked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const articleUrl = `${BASE_URL}${SOURCE_ARTICLE.slug}`;
  const target = TARGETS.find((t) => t.id === targetId);
  const states = computeStates(target);

  // Reset when target changes
  const selectTarget = (id) => {
    if (scanTimerRef.current) { clearTimeout(scanTimerRef.current); scanTimerRef.current = null; }
    setTargetId(id);
    setRevealed(new Set());
    setKnocking(null);
    setLastResult(null);
    setScanning(false);
    track("port_scanner_target_selected", { target: id });
  };

  // Single port knock (used by both door click and manual input)
  const knockPort = (port) => {
    if (scanning) return;
    if (!PORT_META[port]) {
      // Unknown port — still fun, tell them it's not on the map
      setLastResult({ port, state: "unknown", unknown: true });
      track("port_scanner_unknown_knocked", { port });
      return;
    }
    setKnocking(port);
    track("port_scanner_knocked", { target: targetId, port, state: states[port] });
    // Simulate the "envelope flight" delay
    setTimeout(() => {
      setRevealed((prev) => {
        const next = new Set(prev);
        next.add(port);
        return next;
      });
      setLastResult({ port, state: states[port] });
      setKnocking(null);
    }, 600);
  };

  // Full sweep — knock every door in sequence
  const scanAll = () => {
    if (scanning) return;
    setScanning(true);
    track("port_scanner_scan_all", { target: targetId });
    const queue = PORTS.map((p) => p.port).filter((p) => !revealed.has(p));
    const step = (idx) => {
      if (idx >= queue.length) {
        setScanning(false);
        setKnocking(null);
        return;
      }
      const port = queue[idx];
      setKnocking(port);
      scanTimerRef.current = setTimeout(() => {
        setRevealed((prev) => {
          const next = new Set(prev);
          next.add(port);
          return next;
        });
        setLastResult({ port, state: states[port] });
        step(idx + 1);
      }, 250);
    };
    step(0);
  };

  const reset = () => {
    if (scanTimerRef.current) { clearTimeout(scanTimerRef.current); scanTimerRef.current = null; }
    setRevealed(new Set());
    setKnocking(null);
    setLastResult(null);
    setScanning(false);
  };

  const submitInput = (e) => {
    e.preventDefault();
    const n = parseInt(portInput.trim(), 10);
    if (isNaN(n) || n < 1 || n > 65535) return;
    knockPort(n);
    setPortInput("");
  };

  // Derived stats for the sidebar
  const openCount = PORTS.filter((p) => revealed.has(p.port) && states[p.port] === "open").length;
  const closedCount = PORTS.filter((p) => revealed.has(p.port) && states[p.port] === "closed").length;
  const filteredCount = PORTS.filter((p) => revealed.has(p.port) && states[p.port] === "filtered").length;
  const totalRevealed = revealed.size;
  const fullyScanned = totalRevealed === PORTS.length;

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
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <header style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // PORT SCANNER</div>
          </div>
          <a href="/tools" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            ← ALL TOOLS
          </a>
        </header>

        {/* Intro */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>&gt; KNOCK ON DOORS. SEE WHAT ANSWERS.</div>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 12, letterSpacing: -0.5 }}>
            Every host is a building. Every door is a port. <span style={{ color: COLORS.red }}>Some open. Some don't.</span>
          </h1>
          <p style={{ fontSize: 14, color: "#cccccc", lineHeight: 1.6, marginBottom: 10, maxWidth: 780 }}>
            Pick a target below. Click any door to knock a single port, or hit SCAN ALL to knock them all. Each knock returns one of three answers: Open (a service replied), Closed (no service listening), or Filtered (a firewall silently blocked you).
          </p>
        </div>

        {/* Target selector */}
        <TargetPicker targetId={targetId} onSelect={selectTarget} />

        {/* Main layout — building + right panel */}
        <div className="ps-layout" style={{ marginTop: 20 }}>
          <div className="ps-visual">
            <BuildingSVG
              target={target}
              states={states}
              revealed={revealed}
              knocking={knocking}
              onDoorClick={knockPort}
              scanning={scanning}
            />
          </div>

          <div className="ps-panel">
            {/* Controls */}
            <div style={{ border: `1px solid ${COLORS.border}`, padding: 16, marginBottom: 12, backgroundColor: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase" }}>Knock a port</div>
              <form onSubmit={submitInput} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={portInput}
                  onChange={(e) => setPortInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 5))}
                  placeholder="e.g. 443"
                  disabled={scanning}
                  style={{
                    flex: 1, minWidth: 0,
                    fontFamily: fontStack, fontSize: 14,
                    backgroundColor: COLORS.codeBg, color: COLORS.white,
                    border: `1px solid ${COLORS.border}`,
                    padding: "10px 12px", outline: "none",
                  }}
                />
                <button type="submit" disabled={!portInput || scanning}
                  style={{
                    fontFamily: fontStack, fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
                    color: COLORS.white,
                    backgroundColor: portInput && !scanning ? COLORS.red : "#3a2724",
                    border: "none", padding: "10px 16px",
                    cursor: portInput && !scanning ? "pointer" : "not-allowed",
                  }}
                >
                  KNOCK
                </button>
              </form>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={scanAll} disabled={scanning || fullyScanned}
                  style={{
                    flex: 1, minWidth: 120,
                    fontFamily: fontStack, fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
                    color: COLORS.white,
                    backgroundColor: scanning || fullyScanned ? "#3a2724" : COLORS.red,
                    border: "none", padding: "12px 16px",
                    cursor: scanning || fullyScanned ? "not-allowed" : "pointer",
                    opacity: scanning || fullyScanned ? 0.6 : 1,
                  }}
                >
                  {scanning ? "SCANNING..." : fullyScanned ? "ALL DOORS KNOCKED" : "SCAN ALL DOORS →"}
                </button>
                <button onClick={reset} disabled={totalRevealed === 0 || scanning}
                  style={{
                    fontFamily: fontStack, fontSize: 11, letterSpacing: 1.5,
                    color: COLORS.muted, backgroundColor: "transparent",
                    border: `1px solid ${COLORS.border}`, padding: "12px 14px",
                    cursor: totalRevealed === 0 || scanning ? "not-allowed" : "pointer",
                    opacity: totalRevealed === 0 || scanning ? 0.5 : 1,
                  }}
                >
                  RESET
                </button>
              </div>
            </div>

            {/* Legend */}
            <Legend />

            {/* Terminal output */}
            <TerminalOutput target={target} states={states} revealed={revealed} lastResult={lastResult} fontStack={fontStack} />

            {/* Educational note on fully scanned */}
            {fullyScanned && (
              <div style={{
                border: `1px solid ${COLORS.red}`, borderLeft: `2px solid ${COLORS.red}`,
                backgroundColor: "rgba(230,72,51,0.05)",
                padding: 14, marginTop: 12,
                animation: "fadeIn 300ms ease-out",
              }}>
                <div style={{ fontSize: 10, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>WHAT YOU'RE LOOKING AT</div>
                <p style={{ fontSize: 12.5, color: "#dddddd", lineHeight: 1.55, margin: 0 }}>{target.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: article CTA + newsletter */}
        <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
          <div style={{ border: `1px solid ${COLORS.red}`, backgroundColor: "rgba(230,72,51,0.04)", padding: 22 }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>THE FULL BREAKDOWN</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{SOURCE_ARTICLE.title}</div>
            <p style={{ fontSize: 12.5, color: "#cccccc", marginBottom: 14, lineHeight: 1.55 }}>
              The article covers why an open port is not automatically a vulnerability, and why attackers and defenders scan the exact same way.
            </p>
            <a href={articleUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => track("source_article_clicked", { tool: "port_scanner" })}
              style={{
                display: "inline-block", fontFamily: fontStack, fontSize: 12, fontWeight: 600,
                letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
                textDecoration: "none", padding: "10px 20px",
              }}
            >
              READ THE ARTICLE →
            </a>
          </div>
          <div style={{ border: `1px solid ${COLORS.border}`, padding: 22 }}>
            <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 10 }}>NEWSLETTER</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>Free weekly cybersecurity breakdowns.</div>
            <p style={{ fontSize: 12.5, color: "#bbbbbb", marginBottom: 14, lineHeight: 1.55 }}>Networking, SOC, exam prep. 1,450+ readers.</p>
            <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer"
              onClick={() => track("subscribe_clicked", { tool: "port_scanner" })}
              style={{
                display: "inline-block", fontFamily: fontStack, fontSize: 12, fontWeight: 600,
                letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
                textDecoration: "none", padding: "10px 20px",
              }}
            >
              SUBSCRIBE →
            </a>
          </div>
        </div>

        <footer style={{ marginTop: 60, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // PORT_SCANNER_v1</div>
          <div>OPEN · CLOSED · FILTERED</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes envelopeFlight {
          0% { transform: translate(var(--start-x, 0px), var(--start-y, 0px)) scale(0.6); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translate(var(--end-x, 0px), var(--end-y, 0px)) scale(1); opacity: 1; }
        }
        @keyframes doorShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        @keyframes firewallDrop {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes doorOpen {
          from { transform: scaleX(1); opacity: 1; }
          to { transform: scaleX(0.15); opacity: 0.5; }
        }
        @keyframes serviceIconIn {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        button:focus-visible, a:focus-visible, input:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
        input:focus { border-color: ${COLORS.red} !important; }

        .ps-layout { display: grid; grid-template-columns: minmax(0, 520px) minmax(0, 1fr); gap: 24px; }
        @media (max-width: 860px) {
          .ps-layout { grid-template-columns: 1fr; }
          .ps-visual { max-width: 520px; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function TargetPicker({ targetId, onSelect }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: 2, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase" }}>Target host</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {TARGETS.map((t) => {
          const active = t.id === targetId;
          return (
            <button key={t.id} onClick={() => onSelect(t.id)}
              style={{
                fontFamily: "inherit", fontSize: 12, fontWeight: 600, letterSpacing: 1,
                color: active ? COLORS.white : "#bbbbbb",
                backgroundColor: active ? "rgba(230,72,51,0.12)" : "transparent",
                border: `1px solid ${active ? COLORS.red : COLORS.border}`,
                padding: "8px 12px",
                cursor: "pointer",
                transition: "all 150ms",
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.color = COLORS.white; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = "#bbbbbb"; } }}
            >
              {t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { label: "Open", color: COLORS.green, desc: "Service replied. Live entry point." },
    { label: "Closed", color: COLORS.muted, desc: "Host reachable, nothing listening." },
    { label: "Filtered", color: COLORS.amber, desc: "Silence. Firewall blocked the knock." },
  ];
  return (
    <div style={{ border: `1px solid ${COLORS.border}`, padding: 14, marginBottom: 12, backgroundColor: "rgba(255,255,255,0.02)" }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: COLORS.muted, marginBottom: 10, textTransform: "uppercase" }}>Legend</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((i) => (
          <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 12, height: 12, backgroundColor: i.color, borderRadius: 2, flexShrink: 0 }} />
            <div style={{ fontSize: 11.5, color: "#dddddd" }}>
              <strong style={{ color: i.color }}>{i.label}</strong>
              <span style={{ color: COLORS.muted }}> — {i.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TerminalOutput({ target, states, revealed, lastResult, fontStack }) {
  const revealedPorts = PORTS.filter((p) => revealed.has(p.port));
  return (
    <div style={{ border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.codeBg, padding: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase" }}>Scan output</div>
      <div style={{ fontFamily: fontStack, fontSize: 12, color: "#cccccc", lineHeight: 1.6, minHeight: 200 }}>
        <div style={{ color: COLORS.muted }}>$ nmap -sV {target.ip}</div>
        <div style={{ color: COLORS.muted, marginBottom: 8 }}>Host is up: {target.hostname}</div>
        {revealedPorts.length === 0 ? (
          <div style={{ color: COLORS.muted, fontStyle: "italic" }}>
            (No ports knocked yet. Click a door or hit SCAN ALL.)
          </div>
        ) : (
          <>
            <div style={{ color: COLORS.muted, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 4, marginBottom: 4 }}>
              PORT      STATE     SERVICE
            </div>
            {revealedPorts.map((p) => {
              const state = states[p.port];
              const isLast = lastResult && lastResult.port === p.port && !lastResult.unknown;
              return (
                <div key={p.port} style={{
                  color: STATE_COLOR[state],
                  backgroundColor: isLast ? "rgba(230,72,51,0.08)" : "transparent",
                  padding: isLast ? "2px 4px" : 0,
                  margin: isLast ? "0 -4px" : 0,
                }}>
                  <span style={{ color: "#dddddd", display: "inline-block", minWidth: 90 }}>{p.port}/tcp</span>
                  <span style={{ display: "inline-block", minWidth: 90 }}>{state}</span>
                  <span style={{ color: "#999" }}>{p.service.toLowerCase()}</span>
                </div>
              );
            })}
            {lastResult && lastResult.unknown && (
              <div style={{ marginTop: 6, color: COLORS.amber }}>
                {lastResult.port}/tcp — not in this scanner's catalogue (real Nmap knows ~1000+).
              </div>
            )}
            <div style={{ marginTop: 10, color: COLORS.muted, fontSize: 11 }}>
              {revealedPorts.filter((p) => states[p.port] === "open").length} open ·{" "}
              {revealedPorts.filter((p) => states[p.port] === "filtered").length} filtered ·{" "}
              {revealedPorts.filter((p) => states[p.port] === "closed").length} closed
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// The building — the star of the show
// -----------------------------------------------------------------------------

function BuildingSVG({ target, states, revealed, knocking, onDoorClick, scanning }) {
  // Grid: 4 cols × 4 rows, 16 doors
  const ROWS = 4, COLS = 4;
  const VIEW_W = 500, VIEW_H = 620;
  const BUILDING_X = 30, BUILDING_Y = 90, BUILDING_W = 440, BUILDING_H = 500;

  const DOOR_W = 88, DOOR_H = 96;
  const H_PAD = (BUILDING_W - COLS * DOOR_W) / (COLS + 1);
  const V_PAD = (BUILDING_H - ROWS * DOOR_H - 30) / (ROWS + 1); // 30 for address plate area
  const GRID_START_Y = BUILDING_Y + 60;

  // Envelope: for animation, we compute the destination door's center
  const knockingDoor = knocking !== null ? PORTS.findIndex((p) => p.port === knocking) : -1;
  const knockingRow = knockingDoor >= 0 ? Math.floor(knockingDoor / COLS) : 0;
  const knockingCol = knockingDoor >= 0 ? knockingDoor % COLS : 0;
  const knockingDoorX = BUILDING_X + H_PAD + knockingCol * (DOOR_W + H_PAD) + DOOR_W / 2;
  const knockingDoorY = GRID_START_Y + V_PAD + knockingRow * (DOOR_H + V_PAD) + DOOR_H / 2;
  const envStartX = VIEW_W / 2;
  const envStartY = VIEW_H - 20;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ width: "100%", height: "auto", display: "block" }} xmlns="http://www.w3.org/2000/svg">
        {/* Ground line */}
        <line x1={0} y1={VIEW_H - 12} x2={VIEW_W} y2={VIEW_H - 12} stroke={COLORS.border} strokeWidth={1} strokeDasharray="4 6" />

        {/* Roof */}
        <polygon points={`${VIEW_W / 2},20 ${BUILDING_X - 10},${BUILDING_Y} ${BUILDING_X + BUILDING_W + 10},${BUILDING_Y}`}
          fill={COLORS.roof} stroke={COLORS.border} strokeWidth={2} />

        {/* Building body */}
        <rect x={BUILDING_X} y={BUILDING_Y} width={BUILDING_W} height={BUILDING_H}
          fill={COLORS.wall} stroke={COLORS.border} strokeWidth={2} />

        {/* Address plate */}
        <rect x={BUILDING_X + 20} y={BUILDING_Y + 12} width={BUILDING_W - 40} height={40}
          fill="rgba(0,0,0,0.4)" stroke={COLORS.border} strokeWidth={1} />
        <text x={VIEW_W / 2} y={BUILDING_Y + 30} textAnchor="middle" fill={COLORS.muted}
          fontFamily="'IBM Plex Mono', monospace" fontSize="11" letterSpacing="2">
          IP ADDRESS
        </text>
        <text x={VIEW_W / 2} y={BUILDING_Y + 46} textAnchor="middle" fill={COLORS.white}
          fontFamily="'IBM Plex Mono', monospace" fontSize="15" fontWeight="700">
          {target.ip}
        </text>

        {/* Doors */}
        {PORTS.map((p, idx) => {
          const row = Math.floor(idx / COLS);
          const col = idx % COLS;
          const x = BUILDING_X + H_PAD + col * (DOOR_W + H_PAD);
          const y = GRID_START_Y + V_PAD + row * (DOOR_H + V_PAD);
          const state = states[p.port];
          const isRevealed = revealed.has(p.port);
          const isKnocking = knocking === p.port;
          return (
            <Door key={p.port}
              x={x} y={y} w={DOOR_W} h={DOOR_H}
              port={p.port} service={p.service}
              state={state} revealed={isRevealed} knocking={isKnocking}
              onClick={() => onDoorClick(p.port)}
              clickable={!scanning}
            />
          );
        })}

        {/* Hostname label at bottom */}
        <text x={VIEW_W / 2} y={VIEW_H - 24} textAnchor="middle" fill={COLORS.muted}
          fontFamily="'IBM Plex Mono', monospace" fontSize="11" letterSpacing="1">
          {target.hostname} · {target.role}
        </text>
      </svg>

      {/* Envelope — CSS-animated absolutely-positioned dot */}
      {knocking !== null && knockingDoor >= 0 && (
        <div
          key={`env-${knocking}-${Date.now()}`}
          style={{
            position: "absolute", left: 0, top: 0, pointerEvents: "none",
            width: 20, height: 20,
            borderRadius: "50%",
            backgroundColor: COLORS.red,
            boxShadow: `0 0 12px ${COLORS.red}`,
            animation: `envelopeFlight 550ms ease-out forwards`,
            "--start-x": `${(envStartX / VIEW_W) * 100}%`,
            "--start-y": `${(envStartY / VIEW_H) * 100}%`,
            "--end-x": `${(knockingDoorX / VIEW_W) * 100}%`,
            "--end-y": `${(knockingDoorY / VIEW_H) * 100}%`,
            transform: `translate(${(knockingDoorX / VIEW_W) * 100}%, ${(knockingDoorY / VIEW_H) * 100}%)`,
          }}
        />
      )}
    </div>
  );
}

function Door({ x, y, w, h, port, service, state, revealed, knocking, onClick, clickable }) {
  const label = String(port);

  // Colors
  const revealedColor = STATE_COLOR[state];
  const fillColor = revealed
    ? state === "open" ? "rgba(58,182,118,0.15)"
      : state === "filtered" ? "rgba(232,161,42,0.15)"
      : "rgba(136,136,136,0.10)"
    : "#242424";
  const strokeColor = revealed ? revealedColor : "#3a3a3a";
  const strokeWidth = revealed ? 2 : 1.5;

  return (
    <g style={{ cursor: clickable ? "pointer" : "default" }}
       onClick={clickable ? onClick : undefined}>
      <title>{`Port ${port} (${service}) — ${revealed ? STATE_LABEL[state] : "not knocked"}`}</title>
      {/* Door frame */}
      <rect x={x} y={y} width={w} height={h}
        fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} rx={2} />

      {/* Doorknob */}
      <circle cx={x + w - 10} cy={y + h / 2} r={2.5} fill={revealed ? revealedColor : "#555"} />

      {/* Port label — top */}
      <text x={x + w / 2} y={y + 22} textAnchor="middle"
        fill={revealed ? "#ffffff" : "#aaaaaa"}
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="18" fontWeight="700" letterSpacing="0.5">
        {label}
      </text>

      {/* Service label OR state */}
      {revealed ? (
        <>
          <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle"
            fill={revealedColor}
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="11" fontWeight="700" letterSpacing="1">
            {state === "open" ? service.toUpperCase() : STATE_LABEL[state]}
          </text>
          <text x={x + w / 2} y={y + h - 12} textAnchor="middle"
            fill={revealedColor} opacity="0.7"
            fontFamily="'IBM Plex Mono', monospace" fontSize="9" letterSpacing="1.5">
            {state === "open" ? "▲ OPEN" : state === "filtered" ? "▶ FILTERED" : "◇ CLOSED"}
          </text>
        </>
      ) : (
        <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle"
          fill="#666"
          fontFamily="'IBM Plex Mono', monospace"
          fontSize="10" letterSpacing="1">
          {service}
        </text>
      )}

      {/* Filtered overlay — diagonal hash pattern */}
      {revealed && state === "filtered" && (
        <g style={{ animation: "firewallDrop 300ms ease-out" }}>
          <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4}
            fill="url(#firewall-hash)" opacity="0.35" />
          <text x={x + w / 2} y={y - 4} textAnchor="middle"
            fill={COLORS.amber}
            fontFamily="'IBM Plex Mono', monospace" fontSize="9" fontWeight="700" letterSpacing="1">
            🛡 FIREWALL
          </text>
        </g>
      )}

      {/* Knocking indicator — pulse ring */}
      {knocking && (
        <circle cx={x + w / 2} cy={y + h / 2} r={w / 2 + 4}
          fill="none" stroke={COLORS.red} strokeWidth={2} opacity="0.6">
          <animate attributeName="r" from={w / 2 + 4} to={w / 2 + 14} dur="0.55s" repeatCount="1" />
          <animate attributeName="opacity" from="0.6" to="0" dur="0.55s" repeatCount="1" />
        </circle>
      )}

      {/* Hash pattern defs (only once but harmless to repeat) */}
      <defs>
        <pattern id="firewall-hash" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="transparent" />
          <line x1="0" y1="0" x2="0" y2="8" stroke={COLORS.amber} strokeWidth="2" />
        </pattern>
      </defs>
    </g>
  );
}
