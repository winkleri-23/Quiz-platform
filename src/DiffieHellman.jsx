import { useEffect, useState } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — DIFFIE-HELLMAN VISUALIZATION
// Interactive walkthrough of the colored-water analogy from Erich's article
// "Diffie-Hellman Explained Like You're 12." Alice and Bob converge on a shared
// secret color through public mixing; Eve intercepts every transmission but
// cannot reproduce the secret. Ends with a hard push to read the article for
// the math behind why this actually works.
// =============================================================================

const COLORS = {
  red: "#e64833",
  green: "#3ab676",
  amber: "#e8a12a",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

const BASE_URL = "https://www.decodedsecurity.com/p/";
const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";

const SOURCE_ARTICLE = {
  title: "Diffie-Hellman Explained Like You're 12 (And Why Interviewers Love Asking About It)",
  slug: "diffie-hellman-explained-like-youre",
};

// Preset color palettes — user can shuffle. First is the article's example.
const PALETTES = [
  { name: "Article default", public: "#f9d423", alice: "#4b7fd7", bob: "#e64833" }, // yellow / blue / red
  { name: "Forest",          public: "#8fd67c", alice: "#a557d7", bob: "#e88e12" }, // green / purple / orange
  { name: "Ocean",           public: "#7ce0e0", alice: "#e648b3", bob: "#f2c73e" }, // cyan / magenta / gold
  { name: "Sunset",          public: "#ffb84d", alice: "#7c4de0", bob: "#e04d4d" }, // amber / violet / crimson
];

// -----------------------------------------------------------------------------
// Color mixing — RGB average with slight darkening for paint-like feel.
// Not physically accurate, but symmetric: mix(a, b, c) === mix(c, b, a),
// which is the only property that actually matters for the visualization
// (Alice and Bob must converge on the same color).
// -----------------------------------------------------------------------------

const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
};

const rgbStr = ({ r, g, b }) => `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

const mix = (...hexes) => {
  const rgbs = hexes.map(hexToRgb);
  const n = rgbs.length;
  const r = rgbs.reduce((s, c) => s + c.r, 0) / n;
  const g = rgbs.reduce((s, c) => s + c.g, 0) / n;
  const b = rgbs.reduce((s, c) => s + c.b, 0) / n;
  // Slight darkening — paint-like feel
  return rgbStr({ r: r * 0.92, g: g * 0.92, b: b * 0.92 });
};

// -----------------------------------------------------------------------------
// Steps — each defines the current state of Alice, Bob, and Eve
// -----------------------------------------------------------------------------

function computeState(step, palette) {
  const { public: pub, alice: a, bob: b } = palette;
  const aliceMix = mix(pub, a);      // yellow + blue
  const bobMix = mix(pub, b);        // yellow + red
  const shared = mix(pub, a, b);     // yellow + blue + red

  switch (step) {
    case 1: // Public parameter agreed
      return {
        alice: pub, bob: pub,
        aliceLabel: "PUBLIC",
        bobLabel: "PUBLIC",
        eveKnows: [{ color: pub, label: "PUBLIC" }],
        arrows: [],
      };
    case 2: // Add private colors
      return {
        alice: aliceMix, bob: bobMix,
        aliceLabel: "PUBLIC + ALICE PRIVATE",
        bobLabel: "PUBLIC + BOB PRIVATE",
        eveKnows: [{ color: pub, label: "PUBLIC" }],
        arrows: [],
      };
    case 3: // Exchange mixtures publicly
      return {
        alice: aliceMix, bob: bobMix,
        aliceLabel: "PUBLIC + ALICE",
        bobLabel: "PUBLIC + BOB",
        eveKnows: [
          { color: pub, label: "PUBLIC" },
          { color: aliceMix, label: "ALICE'S MIX" },
          { color: bobMix, label: "BOB'S MIX" },
        ],
        arrows: [
          { from: "alice", to: "bob", color: aliceMix, label: "ALICE'S MIX" },
          { from: "bob", to: "alice", color: bobMix, label: "BOB'S MIX" },
        ],
      };
    case 4: // Final mix — both converge
      return {
        alice: shared, bob: shared,
        aliceLabel: "SHARED SECRET",
        bobLabel: "SHARED SECRET",
        aliceSame: true, bobSame: true,
        eveKnows: [
          { color: pub, label: "PUBLIC" },
          { color: aliceMix, label: "ALICE'S MIX" },
          { color: bobMix, label: "BOB'S MIX" },
        ],
        arrows: [],
        showShared: true, shared,
      };
    default:
      return { alice: null, bob: null, aliceLabel: "", bobLabel: "", eveKnows: [], arrows: [] };
  }
}

const STEP_COPY = {
  1: {
    title: "Step 1 — Agree on a public parameter",
    body: "Alice and Bob need something to start with. So they pick a color together, in public, where everyone including Eve can see it. This is the public parameter. In real Diffie-Hellman it's a large prime number and a generator — but the principle is identical.",
    note: "No secrecy yet. Nothing to hide.",
  },
  2: {
    title: "Step 2 — Each picks a secret private color",
    body: "Alice picks a color she tells nobody. Bob does the same. Each mixes their private color into a beaker of the public color. In real DH this is a private random number, and the \"mixing\" is modular exponentiation.",
    note: "Alice's mix is her PUBLIC KEY. Bob's mix is his. These are safe to share.",
  },
  3: {
    title: "Step 3 — Exchange the mixtures publicly",
    body: "Alice sends her mixture to Bob. Bob sends his to Alice. They send them in the open — Eve intercepts both. But mixing is one-way: you can combine colors, but you cannot separate them. Eve has three colors now. She still cannot compute the secret.",
    note: "Eve intercepted everything. That's fine.",
  },
  4: {
    title: "Step 4 — Mix again with your own private color",
    body: "Alice takes the mixture she received from Bob and adds her private color back in. Bob does the same with Alice's mixture. Both end up with the exact same combination: public + Alice's private + Bob's private. That's the shared secret.",
    note: "Same secret, never transmitted. Eve is stuck.",
  },
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function DiffieHellman() {
  const [stage, setStage] = useState("welcome"); // welcome | walk | done
  const [step, setStep] = useState(1);
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [startedTracked, setStartedTracked] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  useEffect(() => {
    if (!startedTracked) {
      track("dh_viz_opened");
      setStartedTracked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const articleUrl = `${BASE_URL}${SOURCE_ARTICLE.slug}`;
  const palette = PALETTES[paletteIdx];
  const state = computeState(step, palette);
  const totalSteps = 4;

  const startWalk = () => {
    track("dh_viz_started");
    setStage("walk");
    setStep(1);
  };
  const nextStep = () => {
    if (step < totalSteps) {
      const ns = step + 1;
      track("dh_step_advanced", { step: ns });
      setStep(ns);
    } else {
      track("dh_viz_completed");
      setStage("done");
    }
  };
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };
  const shufflePalette = () => {
    const next = (paletteIdx + 1) % PALETTES.length;
    setPaletteIdx(next);
    track("dh_palette_shuffled", { name: PALETTES[next].name });
  };
  const restart = () => {
    track("dh_viz_restarted");
    setStage("walk");
    setStep(1);
  };

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
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <header style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // DIFFIE-HELLMAN</div>
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
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; DIFFIE-HELLMAN, VISUALIZED</div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.08, marginBottom: 20, letterSpacing: -1 }}>
              How do two strangers create a <span style={{ color: COLORS.red }}>secret</span> without ever sharing the secret?
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", marginBottom: 16, maxWidth: 720 }}>
              This is the question Diffie and Hellman solved in 1976. Their answer runs every TLS handshake, every VPN tunnel, every secure message you send. Watch it play out with colors, then read the article for the math behind it.
            </p>
            <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 32, maxWidth: 720, lineHeight: 1.55 }}>
              Four steps. Two minutes. You'll watch Alice and Bob converge on a shared secret color while Eve watches every message and can't reproduce it.
            </p>

            <a href={articleUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => track("source_article_clicked", { tool: "diffie_hellman" })}
              style={{
                display: "block", borderLeft: `2px solid ${COLORS.red}`, paddingLeft: 16,
                marginBottom: 32, maxWidth: 720, textDecoration: "none", color: COLORS.white,
                transition: "all 150ms ease-out",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "20px"; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "16px"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>THE FULL ARTICLE</div>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span></div>
            </a>

            <button
              onClick={startWalk}
              style={primaryBtn(fontStack)}
            >
              START THE WALKTHROUGH →
            </button>
          </div>
        )}

        {/* WALKTHROUGH */}
        {stage === "walk" && (
          <div>
            <StepHeader step={step} total={totalSteps} tint={COLORS.red} />

            <div style={{ animation: "fadeIn 250ms ease-out" }}>
              <h2 style={{ fontSize: "clamp(22px, 3.6vw, 30px)", fontWeight: 700, marginBottom: 12, letterSpacing: -0.5 }}>
                {STEP_COPY[step].title}
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 20, maxWidth: 780 }}>
                {STEP_COPY[step].body}
              </p>
            </div>

            {/* MAIN VISUALIZATION */}
            <VizStage state={state} palette={palette} step={step} />

            {/* Eve panel */}
            <EvePanel eveKnows={state.eveKnows} shared={state.shared} showShared={state.showShared} palette={palette} step={step} />

            {/* Note under viz */}
            <div style={{
              borderLeft: `2px solid ${step === 4 ? COLORS.green : COLORS.amber}`,
              backgroundColor: step === 4 ? "rgba(58,182,118,0.05)" : "rgba(232,161,42,0.04)",
              padding: "12px 16px", marginBottom: 28, fontSize: 13, color: "#dddddd",
            }}>
              <span style={{ fontSize: 10, color: step === 4 ? COLORS.green : COLORS.amber, letterSpacing: 2, marginRight: 10 }}>
                {step === 4 ? "OUTCOME" : "OBSERVE"}
              </span>
              {STEP_COPY[step].note}
            </div>

            {/* Nav buttons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={prevStep}
                disabled={step === 1}
                style={{
                  fontFamily: fontStack, fontSize: 13, letterSpacing: 1.5,
                  color: step === 1 ? "#555" : COLORS.muted,
                  backgroundColor: "transparent",
                  border: `1px solid ${step === 1 ? "#333" : COLORS.border}`,
                  padding: "13px 22px", cursor: step === 1 ? "not-allowed" : "pointer",
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => { if (step > 1) { e.currentTarget.style.color = COLORS.white; e.currentTarget.style.borderColor = COLORS.muted; } }}
                onMouseLeave={(e) => { if (step > 1) { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderColor = COLORS.border; } }}
              >
                ← BACK
              </button>
              <button onClick={nextStep} style={primaryBtn(fontStack)}>
                {step < totalSteps ? "NEXT STEP →" : "SEE THE INSIGHT →"}
              </button>
              <button
                onClick={shufflePalette}
                style={{
                  fontFamily: fontStack, fontSize: 11, letterSpacing: 1.5,
                  color: COLORS.muted, backgroundColor: "transparent",
                  border: "none", cursor: "pointer",
                  padding: "13px 6px", marginLeft: "auto",
                  transition: "color 150ms",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = COLORS.red}
                onMouseLeave={(e) => e.currentTarget.style.color = COLORS.muted}
                title="Cycle through color palettes"
              >
                ↻ SHUFFLE COLORS ({palette.name})
              </button>
            </div>
          </div>
        )}

        {/* DONE — insight + article CTA */}
        {stage === "done" && (
          <Done articleUrl={articleUrl} fontStack={fontStack} onRestart={restart} />
        )}

        <footer style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // DIFFIE_HELLMAN_v1</div>
          <div>SHARED SECRET · NEVER TRANSMITTED</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(58, 182, 118, 0.6); } 50% { transform: scale(1.03); box-shadow: 0 0 0 12px rgba(58, 182, 118, 0); } }
        @keyframes fly-right { 0% { transform: translateX(-30%) scale(0.8); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateX(30%) scale(1); opacity: 1; } }
        @keyframes fly-left { 0% { transform: translateX(30%) scale(0.8); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateX(-30%) scale(1); opacity: 1; } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function VizStage({ state, palette, step }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      gap: 20,
      alignItems: "center",
      padding: "28px 16px",
      border: `1px solid ${COLORS.border}`,
      backgroundColor: "rgba(255,255,255,0.02)",
      marginBottom: 20,
    }}>
      {/* Alice */}
      <PartyCard
        name="ALICE"
        color={state.alice}
        label={state.aliceLabel}
        privateColor={step >= 2 ? palette.alice : null}
        matched={state.aliceSame}
      />

      {/* Middle — channel + arrows */}
      <div style={{ minWidth: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: COLORS.muted }}>PUBLIC CHANNEL</div>
        {state.arrows.length === 0 && (
          <div style={{
            width: 4, height: 90,
            background: `linear-gradient(180deg, ${COLORS.border}, transparent, ${COLORS.border})`,
          }} />
        )}
        {state.arrows.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", alignItems: "center" }}>
            {state.arrows.map((a, i) => (
              <FlyingSwatch key={i} color={a.color} label={a.label} direction={a.from === "alice" ? "right" : "left"} />
            ))}
          </div>
        )}
        {step === 4 && (
          <div style={{
            marginTop: 8, fontSize: 10, letterSpacing: 2, color: COLORS.green,
            padding: "4px 10px", border: `1px solid ${COLORS.green}`, backgroundColor: "rgba(58,182,118,0.05)",
          }}>
            SAME ✓
          </div>
        )}
      </div>

      {/* Bob */}
      <PartyCard
        name="BOB"
        color={state.bob}
        label={state.bobLabel}
        privateColor={step >= 2 ? palette.bob : null}
        matched={state.bobSame}
      />
    </div>
  );
}

function PartyCard({ name, color, label, privateColor, matched }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.white, fontWeight: 700 }}>{name}</div>
      <div style={{
        width: 130, height: 130, borderRadius: "50%",
        backgroundColor: color || "transparent",
        border: `2px solid ${matched ? COLORS.green : COLORS.border}`,
        boxShadow: color ? `0 8px 32px rgba(0,0,0,0.4), inset 0 -8px 16px rgba(0,0,0,0.15), inset 0 8px 16px rgba(255,255,255,0.12)` : "none",
        transition: "background-color 500ms ease-out, border-color 300ms",
        position: "relative",
        animation: matched ? "pulse 1.8s ease-in-out infinite" : "none",
      }} />
      <div style={{ fontSize: 10, letterSpacing: 1.5, color: COLORS.muted, textAlign: "center", minHeight: 14 }}>
        {label}
      </div>
      {privateColor && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: COLORS.muted, letterSpacing: 1 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: privateColor, border: `1px solid ${COLORS.border}` }} />
          PRIVATE (secret)
        </div>
      )}
    </div>
  );
}

function FlyingSwatch({ color, label, direction }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      animation: `fly-${direction} 900ms ease-out`,
    }}>
      {direction === "right" ? (
        <>
          <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: color, border: `1px solid ${COLORS.border}` }} />
          <div style={{ fontSize: 16, color: COLORS.muted }}>→</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 16, color: COLORS.muted }}>←</div>
          <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: color, border: `1px solid ${COLORS.border}` }} />
        </>
      )}
      <div style={{ fontSize: 9, color: COLORS.muted, letterSpacing: 1, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
}

function EvePanel({ eveKnows, shared, showShared, palette, step }) {
  return (
    <div style={{
      border: `1px solid ${COLORS.border}`,
      borderLeft: `2px solid ${COLORS.amber}`,
      padding: 18, marginBottom: 20, backgroundColor: "rgba(232,161,42,0.02)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: COLORS.amber, fontWeight: 700 }}>EVE · THE ATTACKER</div>
          <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1 }}>listening to the public channel</div>
        </div>
        <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1 }}>
          INTERCEPTED: {eveKnows.length}
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        {eveKnows.map((k, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              backgroundColor: k.color,
              border: `1px solid ${COLORS.border}`,
              boxShadow: `inset 0 -3px 6px rgba(0,0,0,0.15), inset 0 3px 6px rgba(255,255,255,0.1)`,
            }} />
            <div style={{ fontSize: 9, color: COLORS.muted, letterSpacing: 1 }}>{k.label}</div>
          </div>
        ))}
        {step === 4 && showShared && (
          <>
            <div style={{ margin: "0 8px", color: COLORS.muted, fontSize: 20 }}>≠</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                backgroundColor: shared,
                border: `2px dashed ${COLORS.red}`,
                opacity: 0.7,
              }} />
              <div style={{ fontSize: 9, color: COLORS.red, letterSpacing: 1 }}>CAN'T COMPUTE</div>
            </div>
          </>
        )}
      </div>
      {step === 4 && (
        <p style={{ fontSize: 12, color: "#bbbbbb", margin: "14px 0 0", lineHeight: 1.55 }}>
          Eve has three colors, but no way to reach the shared secret. Mixing colors is a one-way operation — she can combine but cannot separate. That asymmetry (easy one way, hard the other way) is what makes the whole thing work. In real DH, this asymmetry is the discrete logarithm problem.
        </p>
      )}
    </div>
  );
}

function StepHeader({ step, total, tint }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 11, color: tint, letterSpacing: 3 }}>THE COLOR-MIXING ANALOGY</div>
        <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5 }}>
          STEP {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
      </div>
      <div style={{ height: 3, backgroundColor: COLORS.border, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(step / total) * 100}%`, backgroundColor: tint, transition: "width 400ms ease-out" }} />
      </div>
    </div>
  );
}

function Done({ articleUrl, fontStack, onRestart }) {
  return (
    <div style={{ animation: "fadeIn 500ms ease-out" }}>
      <div style={{ fontSize: 11, color: COLORS.green, letterSpacing: 3, marginBottom: 16 }}>&gt; SHARED SECRET ESTABLISHED</div>
      <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 700, lineHeight: 1.08, marginBottom: 20, letterSpacing: -1 }}>
        You just watched two strangers agree on a secret <span style={{ color: COLORS.red }}>without ever sharing it.</span>
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 28, maxWidth: 720 }}>
        Colors are the analogy. The real thing runs every TLS handshake in your browser, every VPN tunnel your work laptop uses, every message you send on Signal and WhatsApp. When an interviewer asks you to explain Diffie-Hellman, this is the shape of the answer they want.
      </p>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>WHAT THE ARTICLE COVERS THAT THIS TOOL DIDN'T</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
          {[
            { t: "The real math", b: "Why modular exponentiation is the actual \"mixing\" — and why nobody can practically \"unmix\" it (discrete log)." },
            { t: "Where it runs", b: "TLS handshakes, VPNs (IPsec, WireGuard), SSH, Signal — every one uses Diffie-Hellman or a variant." },
            { t: "The catch: MITM", b: "DH by itself doesn't authenticate. If Eve becomes an active attacker (not just watching), she can trick both sides. That's what certificates are for." },
            { t: "Interview answers", b: "The exact framing to use when an interviewer asks. Fits in 30 seconds." },
          ].map((x, i) => (
            <div key={i} style={{ border: `1px solid ${COLORS.border}`, padding: 14, backgroundColor: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.white, marginBottom: 6 }}>{x.t}</div>
              <div style={{ fontSize: 12, color: "#bbbbbb", lineHeight: 1.55 }}>{x.b}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ARTICLE CTA — big and unmissable */}
      <div style={{ border: `2px solid ${COLORS.red}`, backgroundColor: "rgba(230, 72, 51, 0.06)", padding: 28, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>READ THE FULL EXPLANATION</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, lineHeight: 1.2, letterSpacing: -0.5 }}>
          Diffie-Hellman Explained Like You're 12 (And Why Interviewers Love Asking About It)
        </div>
        <p style={{ fontSize: 14, color: "#cccccc", marginBottom: 20, lineHeight: 1.55 }}>
          You've seen the mechanic. The article gives you the interview-ready answer plus the reason it actually works — no calculus, still concrete. Ten-minute read.
        </p>
        <a href={articleUrl} target="_blank" rel="noopener noreferrer"
          onClick={() => track("comments_cta_clicked", { tool: "diffie_hellman" })}
          style={{
            display: "inline-block", fontFamily: fontStack, fontSize: 14, fontWeight: 600,
            letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
            textDecoration: "none", padding: "14px 28px",
          }}
        >
          READ THE ARTICLE →
        </a>
      </div>

      {/* Newsletter */}
      <div style={{ border: `1px solid ${COLORS.border}`, padding: 28, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 12 }}>NEWSLETTER</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
          Free weekly cybersecurity breakdowns.
        </div>
        <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 20, lineHeight: 1.5 }}>
          Cryptography, exam prep, secure coding, the fundamentals nobody explains clearly. 1,450+ readers.
        </p>
        <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer"
          onClick={() => track("subscribe_clicked", { tool: "diffie_hellman" })}
          style={{
            display: "inline-block", fontFamily: fontStack, fontSize: 14, fontWeight: 600,
            letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
            textDecoration: "none", padding: "14px 28px",
          }}
        >
          SUBSCRIBE →
        </a>
      </div>

      <button onClick={onRestart} style={{
        fontFamily: fontStack, fontSize: 12, color: COLORS.muted,
        backgroundColor: "transparent", border: "none", padding: "8px 0",
        cursor: "pointer", letterSpacing: 1.5,
      }}
        onMouseEnter={(e) => e.currentTarget.style.color = COLORS.red}
        onMouseLeave={(e) => e.currentTarget.style.color = COLORS.muted}
      >
        ↻ WATCH IT AGAIN
      </button>
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
