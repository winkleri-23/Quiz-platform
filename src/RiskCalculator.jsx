import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — QUANTITATIVE RISK CALCULATOR
// Interactive tool for the article "Quantitative Risk Analysis: Let The
// Numbers Do All The Talking." Live SLE / ALE / cost-benefit computation
// with a verdict box (Implement / Break-even / Skip) that turns the CISSP
// Domain 1 math into a decision.
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
  title: "Quantitative Risk Analysis: Let The Numbers Do All The Talking",
  slug: "quantitative-risk-analysis-let-the",
};

// The exact scenario from the article
const ARTICLE_PRESET = {
  assetValue: 100000,
  ef: 70,
  aro: 0.2,
  safeguardCost: 4000,
  reduction: 50,
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const parseNum = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(String(v).replace(/,/g, ""));
  return isNaN(n) ? null : n;
};

const money = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  return sign + "$" + abs.toLocaleString(undefined, { maximumFractionDigits: 0 });
};

const pct = (n) => (n === null || isNaN(n) ? "—" : `${n}%`);

// Human-readable ARO description
const aroDescription = (aro) => {
  if (aro === null || isNaN(aro) || aro <= 0) return "";
  if (aro === 1) return "≈ once per year";
  if (aro > 1) return `≈ ${aro.toFixed(1).replace(/\.0$/, "")}× per year`;
  const years = 1 / aro;
  const rounded = years >= 100 ? Math.round(years) : Math.round(years * 10) / 10;
  return `≈ once every ${rounded.toString().replace(/\.0$/, "")} year${rounded === 1 ? "" : "s"}`;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function RiskCalculator() {
  const [assetValue, setAssetValue] = useState("");
  const [ef, setEf] = useState("");
  const [aro, setAro] = useState("");
  const [safeguardCost, setSafeguardCost] = useState("");
  const [reduction, setReduction] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const articleUrl = `${BASE_URL}${SOURCE_ARTICLE.slug}`;

  // Parse all inputs
  const av = parseNum(assetValue);
  const efNum = parseNum(ef);
  const aroNum = parseNum(aro);
  const sgCost = parseNum(safeguardCost);
  const redNum = parseNum(reduction);

  const efValid = efNum !== null && efNum >= 0 && efNum <= 100;
  const aroValid = aroNum !== null && aroNum >= 0;
  const redValid = redNum === null || (redNum >= 0 && redNum <= 100);

  // Core calculations (only compute when inputs are valid)
  const canComputeRisk = av !== null && av >= 0 && efValid && aroValid;
  const sle = canComputeRisk ? av * (efNum / 100) : null;
  const currentAle = canComputeRisk ? sle * aroNum : null;

  const canComputeSafeguard = canComputeRisk && sgCost !== null && sgCost >= 0 && redNum !== null && redValid;
  const newAro = canComputeSafeguard ? aroNum * (1 - redNum / 100) : null;
  const newAle = canComputeSafeguard ? sle * newAro : null;
  const savings = canComputeSafeguard ? currentAle - newAle : null;
  const netValue = canComputeSafeguard ? savings - sgCost : null;

  // Verdict
  const verdict = netValue === null ? null
    : netValue > 0 ? { text: "IMPLEMENT IT", color: COLORS.green, tone: "Positive value — the safeguard pays for itself." }
    : netValue < 0 ? { text: "SKIP IT", color: COLORS.red, tone: "Negative value — you'd spend more than you'd save." }
    : { text: "BREAK EVEN", color: COLORS.amber, tone: "Exactly zero. The safeguard covers its cost but doesn't save anything." };

  const applyPreset = () => {
    track("risk_calc_preset_used", { preset: "article_example" });
    setAssetValue(String(ARTICLE_PRESET.assetValue));
    setEf(String(ARTICLE_PRESET.ef));
    setAro(String(ARTICLE_PRESET.aro));
    setSafeguardCost(String(ARTICLE_PRESET.safeguardCost));
    setReduction(String(ARTICLE_PRESET.reduction));
  };

  const clearAll = () => {
    setAssetValue(""); setEf(""); setAro(""); setSafeguardCost(""); setReduction("");
  };

  const copyResult = async () => {
    if (!canComputeRisk) return;
    const lines = [
      "QUANTITATIVE RISK ANALYSIS",
      "=".repeat(40),
      "",
      `Asset value:    ${money(av)}`,
      `Exposure factor: ${pct(efNum)}`,
      `ARO:            ${aroNum} (${aroDescription(aroNum)})`,
      "",
      `SLE (Single Loss Expectancy):     ${money(sle)}`,
      `ALE (Current Annual Loss):        ${money(currentAle)}/year`,
    ];
    if (canComputeSafeguard) {
      lines.push("", "SAFEGUARD");
      lines.push(`Annual cost:      ${money(sgCost)}`);
      lines.push(`Probability cut:  ${pct(redNum)}`);
      lines.push(`New ARO:          ${newAro.toFixed(3)}`);
      lines.push(`New ALE:          ${money(newAle)}/year`);
      lines.push(`Annual savings:   ${money(savings)}`);
      lines.push(`Net value:        ${money(netValue)}/year`);
      lines.push("", `VERDICT: ${verdict.text}`);
    }
    lines.push("", "Calculated at https://quiz.decodedsecurity.com/tools/risk-calculator");
    const text = lines.join("\n");
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      track("risk_calc_copied", { verdict: verdict?.text || "incomplete" });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const inputStyle = (invalid) => ({
    width: "100%",
    boxSizing: "border-box",
    fontFamily: fontStack,
    fontSize: 15,
    color: COLORS.white,
    backgroundColor: "transparent",
    border: `1px solid ${invalid ? COLORS.red : COLORS.border}`,
    padding: "12px 14px",
    outline: "none",
    transition: "border-color 150ms",
  });

  const labelStyle = { display: "block", fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" };
  const hintStyle = { fontSize: 11, color: COLORS.muted, marginTop: 6, lineHeight: 1.5 };

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
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <header style={{ marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // TOOLS</div>
          </div>
          <a href="/tools" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2, transition: "color 150ms, border-color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            ← ALL TOOLS
          </a>
        </header>

        <div style={{ animation: "fadeIn 600ms ease-out", marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; QUANTITATIVE RISK CALCULATOR</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
            Turn risk into <span style={{ color: COLORS.red }}>dollars.</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", maxWidth: 640 }}>
            Type your asset value, exposure factor, and how often the threat hits. Add a safeguard and see whether it pays for itself. Same math the CISSP Domain 1 tests — and the math executives actually understand.
          </p>
        </div>

        <a
          href={articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("source_article_clicked", { tool: "risk_calculator" })}
          style={{
            display: "block",
            borderLeft: `2px solid ${COLORS.red}`,
            paddingLeft: 16,
            marginBottom: 32,
            maxWidth: 640,
            textDecoration: "none",
            color: COLORS.white,
            transition: "all 150ms ease-out",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "20px"; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "16px"; e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>BASED ON THE ARTICLE</div>
          <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span></div>
        </a>

        {/* PRESET / CLEAR */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
          <button
            onClick={applyPreset}
            style={{
              fontFamily: fontStack, fontSize: 11, letterSpacing: 1.2, color: COLORS.white,
              backgroundColor: "transparent", border: `1px solid ${COLORS.border}`,
              padding: "9px 14px", cursor: "pointer", transition: "all 150ms",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            TRY THE ARTICLE'S EXAMPLE
          </button>
          <button
            onClick={clearAll}
            style={{
              fontFamily: fontStack, fontSize: 11, letterSpacing: 1.2, color: COLORS.muted,
              backgroundColor: "transparent", border: `1px solid ${COLORS.border}`,
              padding: "9px 14px", cursor: "pointer", transition: "all 150ms",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.color = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.muted; }}
          >
            CLEAR
          </button>
        </div>

        {/* SECTION 1: YOUR RISK */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 14 }}>&gt; STEP 1 · YOUR RISK</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <div>
              <label style={labelStyle}>Asset value ($)</label>
              <input type="text" inputMode="decimal" value={assetValue} onChange={(e) => setAssetValue(e.target.value)} placeholder="100000"
                style={inputStyle(assetValue !== "" && (av === null || av < 0))}
                onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.red; }}
                onBlur={(e) => { if (av !== null && av >= 0 || assetValue === "") e.currentTarget.style.borderColor = COLORS.border; }}
              />
              <div style={hintStyle}>What the asset is worth (data, hardware, business impact).</div>
            </div>
            <div>
              <label style={labelStyle}>Exposure Factor (%)</label>
              <input type="text" inputMode="decimal" value={ef} onChange={(e) => setEf(e.target.value)} placeholder="70"
                style={inputStyle(ef !== "" && !efValid)}
                onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.red; }}
                onBlur={(e) => { if (efValid || ef === "") e.currentTarget.style.borderColor = COLORS.border; }}
              />
              <div style={hintStyle}>How much of the asset is lost in one incident. 100% = total loss.</div>
            </div>
            <div>
              <label style={labelStyle}>ARO (per year)</label>
              <input type="text" inputMode="decimal" value={aro} onChange={(e) => setAro(e.target.value)} placeholder="0.2"
                style={inputStyle(aro !== "" && !aroValid)}
                onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.red; }}
                onBlur={(e) => { if (aroValid || aro === "") e.currentTarget.style.borderColor = COLORS.border; }}
              />
              <div style={hintStyle}>
                How often per year. 1 = yearly · 0.5 = every 2 yrs · 0.2 = every 5 yrs · 2 = twice/yr
                {aroNum !== null && aroValid && (
                  <span style={{ display: "block", color: COLORS.red, marginTop: 4 }}>{aroDescription(aroNum)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Live risk math */}
          <div style={{ marginTop: 20, padding: 20, border: `1px solid ${COLORS.border}`, backgroundColor: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              <ResultTile label="SLE (Single Loss Expectancy)" value={sle !== null ? money(sle) : "—"} formula="SLE = Asset × EF" />
              <ResultTile label="Current ALE (per year)" value={currentAle !== null ? money(currentAle) : "—"} formula="ALE = SLE × ARO" emphasized />
            </div>
            {currentAle !== null && (
              <div style={{ marginTop: 14, fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>
                Without any safeguard, you expect to lose <strong style={{ color: COLORS.white }}>{money(currentAle)}/year</strong> to this threat.
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: SAFEGUARD */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 14 }}>&gt; STEP 2 · YOUR SAFEGUARD</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <div>
              <label style={labelStyle}>Annual cost of safeguard ($)</label>
              <input type="text" inputMode="decimal" value={safeguardCost} onChange={(e) => setSafeguardCost(e.target.value)} placeholder="4000"
                style={inputStyle(safeguardCost !== "" && (sgCost === null || sgCost < 0))}
                onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.red; }}
                onBlur={(e) => { if ((sgCost !== null && sgCost >= 0) || safeguardCost === "") e.currentTarget.style.borderColor = COLORS.border; }}
              />
              <div style={hintStyle}>Total yearly cost — license + maintenance + labor.</div>
            </div>
            <div>
              <label style={labelStyle}>Reduction in probability (%)</label>
              <input type="text" inputMode="decimal" value={reduction} onChange={(e) => setReduction(e.target.value)} placeholder="50"
                style={inputStyle(reduction !== "" && !redValid)}
                onFocus={(e) => { e.currentTarget.style.borderColor = COLORS.red; }}
                onBlur={(e) => { if (redValid || reduction === "") e.currentTarget.style.borderColor = COLORS.border; }}
              />
              <div style={hintStyle}>How much the safeguard cuts the frequency. 50% = ARO halved. 100% = fully prevents.</div>
            </div>
          </div>

          {/* Live safeguard math */}
          <div style={{ marginTop: 20, padding: 20, border: `1px solid ${COLORS.border}`, backgroundColor: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <ResultTile label="New ARO" value={newAro !== null ? newAro.toFixed(3).replace(/\.?0+$/, "") : "—"} formula="ARO × (1 − reduction)" />
              <ResultTile label="New ALE (per year)" value={newAle !== null ? money(newAle) : "—"} formula="SLE × new ARO" />
              <ResultTile label="Annual savings" value={savings !== null ? money(savings) : "—"} formula="Old ALE − New ALE" />
            </div>
          </div>
        </section>

        {/* VERDICT */}
        {verdict && (
          <section style={{ marginBottom: 32, animation: "fadeIn 300ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 14 }}>&gt; STEP 3 · THE DECISION</div>
            <div
              style={{
                border: `2px solid ${verdict.color}`,
                backgroundColor: `${verdict.color}10`,
                padding: 28,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: verdict.color, letterSpacing: 2, marginBottom: 8 }}>VERDICT</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: verdict.color, letterSpacing: -1, lineHeight: 1 }}>
                    {verdict.text}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase" }}>Net value / year</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: verdict.color, letterSpacing: -1, lineHeight: 1 }}>
                    {netValue > 0 ? "+" : ""}{money(netValue)}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: "#dddddd", lineHeight: 1.55, margin: 0 }}>
                {verdict.tone}{" "}
                {netValue !== 0 && (
                  <>Formula: <code style={{ color: COLORS.white }}>({money(currentAle)} − {money(newAle)}) − {money(sgCost)} = {money(netValue)}</code></>
                )}
              </p>
            </div>
          </section>
        )}

        {/* ACTIONS */}
        {canComputeRisk && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            <button
              onClick={copyResult}
              style={{
                fontFamily: fontStack, fontSize: 13, fontWeight: 600, letterSpacing: 1.5,
                color: copied ? COLORS.green : COLORS.white,
                backgroundColor: "transparent",
                border: `1px solid ${copied ? COLORS.green : COLORS.border}`,
                padding: "12px 22px", cursor: "pointer", transition: "all 150ms",
              }}
              onMouseEnter={(e) => { if (!copied) e.currentTarget.style.borderColor = COLORS.red; }}
              onMouseLeave={(e) => { if (!copied) e.currentTarget.style.borderColor = COLORS.border; }}
            >
              {copied ? "COPIED ✓" : "COPY RESULT"}
            </button>
          </div>
        )}

        {/* COMMENTS CTA */}
        <div style={{ border: `1px solid ${COLORS.red}`, backgroundColor: "rgba(230, 72, 51, 0.04)", padding: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>THE CHALLENGE</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
            Try a scenario and post your verdict in the article comments.
          </div>
          <p style={{ fontSize: 14, color: "#cccccc", marginBottom: 20, lineHeight: 1.55 }}>
            Use the article's example, invent a scenario, or make one up on the spot. Post the SLE, ALE, and your final verdict in the comments — Decoded Security reads every one and will tell you if your reasoning would hold up on the CISSP exam.
          </p>
          <a
            href={articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("comments_cta_clicked", { tool: "risk_calculator", verdict: verdict?.text || "none" })}
            style={{
              display: "inline-block", fontFamily: fontStack, fontSize: 14, fontWeight: 600,
              letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
              textDecoration: "none", padding: "14px 28px",
            }}
          >
            OPEN THE ARTICLE →
          </a>
        </div>

        {/* NEWSLETTER */}
        <div style={{ border: `1px solid ${COLORS.border}`, padding: 28, marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 12 }}>NEWSLETTER</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
            One practical CISSP-relevant breakdown every week.
          </div>
          <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 20, lineHeight: 1.5 }}>
            Risk management, controls, cryptography, and the concepts the exam actually tests. 1,420+ readers.
          </p>
          <a
            href={SUBSCRIBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("subscribe_clicked", { tool: "risk_calculator" })}
            style={{
              display: "inline-block", fontFamily: fontStack, fontSize: 14, fontWeight: 600,
              letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
              textDecoration: "none", padding: "14px 28px",
            }}
          >
            SUBSCRIBE →
          </a>
        </div>

        <footer style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // RISK_CALC_v1</div>
          <div>SLE · ARO · ALE · COST-BENEFIT</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible, input:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Small subcomponent: a result tile with formula subtitle
// -----------------------------------------------------------------------------

function ResultTile({ label, value, formula, emphasized }) {
  const COLORS = { red: "#e64833", white: "#FFFFFF", muted: "#888888" };
  return (
    <div>
      <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: emphasized ? 28 : 22, fontWeight: 700, color: emphasized ? COLORS.red : COLORS.white, lineHeight: 1.2, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "'IBM Plex Mono', ui-monospace, Menlo, monospace" }}>{formula}</div>
    </div>
  );
}
