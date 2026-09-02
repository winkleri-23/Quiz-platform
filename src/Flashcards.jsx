import { useState, useMemo } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — FLASHCARDS
// Compact flashcard widget for the homepage. 20 essential cybersecurity terms.
// Term on the front, plain-English definition on the back. Flip, prev, next,
// shuffle. Optional category filter for narrowing the deck.
// =============================================================================

const COLORS = {
  red: "#e64833",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
  codeBg: "#0e0e0e",
};

const CATEGORIES = {
  fundamentals: "Fundamentals",
  iam:          "IAM",
  crypto:       "Cryptography",
  network:      "Network",
  attack:       "Attack",
  defense:      "Defense",
  operations:   "Operations",
};

// -----------------------------------------------------------------------------
// The 20 essentials. Ordered roughly from broadest to most specific.
// -----------------------------------------------------------------------------
const CARDS = [
  {
    id: "cia",
    term: "CIA Triad",
    category: "fundamentals",
    def: "The three core objectives of every security control. Confidentiality: only authorized parties can read the data. Integrity: the data has not been altered. Availability: the data is reachable when needed.",
  },
  {
    id: "aaa",
    term: "AAA",
    category: "iam",
    def: "Authentication (who are you?), Authorization (what are you allowed to do?), and Accounting (what did you actually do?). Every access decision in security walks this same three-step path.",
  },
  {
    id: "least-privilege",
    term: "Least Privilege",
    category: "iam",
    def: "Grant users and systems only the minimum access needed to do their job — nothing more. Excess access is a risk on day one and grows worse over time as roles change.",
  },
  {
    id: "defense-in-depth",
    term: "Defense in Depth",
    category: "fundamentals",
    def: "Layered security. If one control fails, others behind it still protect the asset. Never rely on a single control — combine perimeter, network, endpoint, application, and data controls.",
  },
  {
    id: "zero-trust",
    term: "Zero Trust",
    category: "fundamentals",
    def: "Never trust, always verify. No implicit trust based on network location, device ownership, or previous authentication. Every request is verified as if it came from an untrusted network.",
  },
  {
    id: "phishing",
    term: "Phishing",
    category: "attack",
    def: "Social engineering attack using deceptive messages (email, SMS, calls) to trick users into revealing credentials, clicking malicious links, or opening infected attachments. Still the #1 attack vector.",
  },
  {
    id: "mfa",
    term: "MFA (Multi-Factor Authentication)",
    category: "iam",
    def: "Requires two or more verification factors from different categories: something you know (password), something you have (phone or token), something you are (fingerprint). Blocks the vast majority of credential attacks.",
  },
  {
    id: "encryption",
    term: "Encryption",
    category: "crypto",
    def: "Converting data into an unreadable form so only parties with the key can read it. Symmetric = one shared key (fast, key-exchange problem). Asymmetric = public/private key pair (slower, solves key exchange).",
  },
  {
    id: "hashing",
    term: "Hashing",
    category: "crypto",
    def: "One-way transformation of data into a fixed-size fingerprint. Cannot be reversed. Used to store passwords safely and to verify data integrity — if one bit changes, the hash changes completely.",
  },
  {
    id: "firewall",
    term: "Firewall",
    category: "network",
    def: "Network security device that filters traffic based on defined rules. Can be a physical appliance, a software feature of an OS, or a cloud service. It is the classic \"which doors are allowed to open?\" control.",
  },
  {
    id: "vpn",
    term: "VPN (Virtual Private Network)",
    category: "network",
    def: "Encrypted tunnel over an untrusted network like the public internet. Lets remote users securely reach internal resources as if they were physically on the internal network.",
  },
  {
    id: "vuln-vs-exploit",
    term: "Vulnerability vs Exploit",
    category: "fundamentals",
    def: "A vulnerability is a weakness in a system. An exploit is the actual technique or code that takes advantage of it. A vulnerability with no known exploit is theoretical; with an exploit, it is actionable.",
  },
  {
    id: "risk-formula",
    term: "Risk = Threat × Vulnerability",
    category: "fundamentals",
    def: "Risk exists only when a threat can act on a vulnerability. Remove either and the risk drops. This is why patching (removing vulnerabilities) and threat intel (understanding attackers) both reduce risk.",
  },
  {
    id: "siem",
    term: "SIEM",
    category: "operations",
    def: "Security Information and Event Management. Correlates logs from many sources — firewalls, endpoints, apps — to detect suspicious patterns across the whole organization. Log management just stores; SIEM correlates.",
  },
  {
    id: "soc",
    term: "SOC (Security Operations Center)",
    category: "operations",
    def: "The team responsible for continuously monitoring, detecting, and responding to security incidents. Typically staffed 24/7 because attackers don't work office hours. SOC analysts sit closest to the alert firehose.",
  },
  {
    id: "ids-vs-ips",
    term: "IDS vs IPS",
    category: "network",
    def: "Intrusion Detection System = detects suspicious activity and alerts a human. Intrusion Prevention System = detects AND actively blocks. IDS is passive (safer, no false positives break things); IPS is active (stronger protection, higher risk of blocking legit traffic).",
  },
  {
    id: "ddos",
    term: "DDoS",
    category: "attack",
    def: "Distributed Denial of Service. Attack that floods a target with traffic from many sources to make it unavailable. Distinct from DoS (single-source) because \"distributed\" makes it much harder to block.",
  },
  {
    id: "ransomware",
    term: "Ransomware",
    category: "attack",
    def: "Malware that encrypts the victim's data and demands payment for the decryption key. Modern variants also exfiltrate data first and threaten to publish it — double extortion. Tested backups are the single best defense.",
  },
  {
    id: "patch-management",
    term: "Patch Management",
    category: "defense",
    def: "The process of applying security updates to fix known vulnerabilities. One of the highest-impact defensive practices — most breaches exploit vulnerabilities that had patches available for months.",
  },
  {
    id: "incident-response",
    term: "Incident Response",
    category: "operations",
    def: "Structured process for handling security incidents. Standard six phases: Preparation → Identification → Containment → Eradication → Recovery → Lessons Learned. The exam and real life both test that order.",
  },
];

// =============================================================================
// Component
// =============================================================================

export default function Flashcards() {
  const [filter, setFilter] = useState("all");
  const [order, setOrder] = useState(() => CARDS.map((_, i) => i));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [flippedTracked, setFlippedTracked] = useState(false);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";

  // Filtered order (respect current filter)
  const filteredOrder = useMemo(
    () => order.filter((i) => filter === "all" || CARDS[i].category === filter),
    [order, filter]
  );

  const safeIdx = filteredOrder.length === 0 ? 0 : Math.min(idx, filteredOrder.length - 1);
  const card = filteredOrder.length > 0 ? CARDS[filteredOrder[safeIdx]] : null;

  const next = () => {
    if (filteredOrder.length === 0) return;
    setFlipped(false);
    setIdx((n) => (n + 1) % filteredOrder.length);
  };
  const prev = () => {
    if (filteredOrder.length === 0) return;
    setFlipped(false);
    setIdx((n) => (n - 1 + filteredOrder.length) % filteredOrder.length);
  };
  const shuffle = () => {
    const shuffled = [...order];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setOrder(shuffled);
    setIdx(0);
    setFlipped(false);
    track("flashcards_shuffled");
  };
  const flip = () => {
    setFlipped((f) => !f);
    if (!flippedTracked) {
      track("flashcards_first_flip");
      setFlippedTracked(true);
    }
  };
  const pickFilter = (f) => {
    if (f === filter) return;
    setFilter(f);
    setIdx(0);
    setFlipped(false);
    track("flashcards_filtered", { category: f });
  };

  return (
    <div style={{ maxWidth: 640, fontFamily: fontStack }}>
      {/* Category filter */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        <FilterChip label="All" active={filter === "all"} onClick={() => pickFilter("all")} count={CARDS.length} />
        {Object.entries(CATEGORIES).map(([id, label]) => {
          const count = CARDS.filter((c) => c.category === id).length;
          return (
            <FilterChip key={id} label={label} active={filter === id} onClick={() => pickFilter(id)} count={count} />
          );
        })}
      </div>

      {/* Card */}
      {card ? (
        <div
          onClick={flip}
          style={{
            position: "relative",
            width: "100%",
            minHeight: 240,
            perspective: 1200,
            cursor: "pointer",
            marginBottom: 12,
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } }}
        >
          <div style={{
            position: "relative", width: "100%", minHeight: 240,
            transformStyle: "preserve-3d",
            transition: "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
          }}>
            {/* FRONT */}
            <CardFace flipped={false}>
              <CategoryTag category={card.category} />
              <div style={{
                fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, letterSpacing: -0.5,
                lineHeight: 1.2, color: COLORS.white,
                textAlign: "center", padding: "0 20px",
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {card.term}
              </div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: COLORS.muted, textAlign: "center" }}>
                CLICK TO FLIP →
              </div>
            </CardFace>

            {/* BACK */}
            <CardFace flipped={true}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <CategoryTag category={card.category} />
                <div style={{ fontSize: 12, color: COLORS.white, fontWeight: 700, letterSpacing: 0.5 }}>
                  {card.term}
                </div>
              </div>
              <div style={{
                fontSize: "clamp(13px, 1.9vw, 15px)", lineHeight: 1.6, color: "#dddddd",
                padding: "12px 8px",
                flex: 1, display: "flex", alignItems: "center",
              }}>
                {card.def}
              </div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: COLORS.muted, textAlign: "center" }}>
                ← CLICK TO FLIP BACK
              </div>
            </CardFace>
          </div>
        </div>
      ) : (
        <div style={{
          padding: 40, border: `1px solid ${COLORS.border}`, textAlign: "center",
          color: COLORS.muted, fontSize: 13, marginBottom: 12,
        }}>
          No cards in this category.
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <button onClick={prev} disabled={filteredOrder.length === 0}
          style={navBtn(fontStack, filteredOrder.length === 0)}
          aria-label="Previous card"
        >
          ← PREV
        </button>
        <div style={{
          flex: 1, textAlign: "center", fontSize: 12, letterSpacing: 2, color: COLORS.muted,
          minWidth: 80,
        }}>
          {filteredOrder.length === 0 ? "0 / 0" : `${safeIdx + 1} / ${filteredOrder.length}`}
        </div>
        <button onClick={next} disabled={filteredOrder.length === 0}
          style={navBtn(fontStack, filteredOrder.length === 0)}
          aria-label="Next card"
        >
          NEXT →
        </button>
        <button onClick={shuffle}
          style={{
            fontFamily: fontStack, fontSize: 11, letterSpacing: 1.5,
            color: COLORS.muted, backgroundColor: "transparent",
            border: `1px solid ${COLORS.border}`, padding: "10px 14px", cursor: "pointer",
            transition: "all 150ms",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderColor = COLORS.red; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderColor = COLORS.border; }}
        >
          ↻ SHUFFLE
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function CardFace({ flipped, children }) {
  return (
    <div style={{
      position: flipped ? "absolute" : "relative",
      top: flipped ? 0 : undefined,
      left: flipped ? 0 : undefined,
      width: "100%",
      minHeight: 240,
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
      border: `1px solid ${COLORS.border}`,
      borderLeft: `2px solid ${COLORS.red}`,
      backgroundColor: "rgba(255,255,255,0.02)",
      padding: 20,
      display: "flex", flexDirection: "column", gap: 12,
      boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
    }}>
      {children}
    </div>
  );
}

function CategoryTag({ category }) {
  return (
    <div style={{
      display: "inline-block",
      fontSize: 9, letterSpacing: 2, color: COLORS.red,
      border: `1px solid ${COLORS.red}`,
      padding: "3px 8px",
      alignSelf: "flex-start",
      textTransform: "uppercase",
    }}>
      {CATEGORIES[category] || category}
    </div>
  );
}

function FilterChip({ label, count, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        fontFamily: "inherit", fontSize: 11, letterSpacing: 1,
        color: active ? COLORS.white : COLORS.muted,
        backgroundColor: active ? "rgba(230,72,51,0.12)" : "transparent",
        border: `1px solid ${active ? COLORS.red : COLORS.border}`,
        padding: "6px 10px", cursor: "pointer",
        transition: "all 150ms",
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.color = COLORS.white; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.muted; } }}
    >
      {label} <span style={{ color: COLORS.muted, marginLeft: 4 }}>({count})</span>
    </button>
  );
}

function navBtn(fontStack, disabled) {
  return {
    fontFamily: fontStack, fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
    color: COLORS.white,
    backgroundColor: disabled ? "#3a2724" : COLORS.red,
    border: "none", padding: "10px 18px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "opacity 150ms",
  };
}
