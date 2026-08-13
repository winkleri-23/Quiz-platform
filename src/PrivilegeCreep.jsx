import { useEffect, useState } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — PRIVILEGE CREEP SIMULATOR
// You are the manager. Watch Alex Chen move through the company for 5 years.
// At every year, decide: run an access review, or skip. Skip too many and
// stale permissions accumulate. At year 5 the audit lands — you see the
// findings, the breach scenario if any critical perms slipped through, and
// exactly what privilege creep looks like when nobody owns the middle phase.
// Companion to "CISSP Identity Lifecycle Management: The Account You Forgot
// Is the One That Gets You."
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
  title: "CISSP Identity Lifecycle Management: The Account You Forgot Is the One That Gets You",
  slug: "cissp-identity-lifecycle-management",
};

const EMPLOYEE = { name: "Alex Chen" };

// -----------------------------------------------------------------------------
// Permission catalogue. `staleAfter: null` means permanent for its role;
// a number means the perm becomes stale at the end of that year (project ended,
// role changed, etc.) and should be caught in a subsequent review.
// -----------------------------------------------------------------------------

const PERM = {
  MARKETING_TOOLS:          { label: "Marketing tools",       desc: "Standard marketing tools (email platform, social scheduler)." },
  CRM_READ:                 { label: "CRM read",              desc: "Read-only access to the customer CRM." },
  CONTENT_CMS:              { label: "Content CMS",           desc: "Edit blog posts and landing pages." },
  SALES_CRM_WRITE:          { label: "Sales CRM write",       desc: "Write access to the Sales pipeline objects." },
  DEAL_PIPELINE:            { label: "Deal pipeline",         desc: "Modify sales deal stages and forecast data." },
  LEAD_SCORING:             { label: "Lead scoring",          desc: "Edit lead scoring rules and score history." },
  MARKETING_BUDGET:         { label: "Marketing budget",      desc: "Approve marketing spend up to $50k." },
  TEAM_MGMT:                { label: "Team management",       desc: "Manage direct reports (approve time, review perf)." },
  REPORTS_ADMIN:            { label: "Reports admin",         desc: "Build and share reports in the analytics tool." },
  EXEC_DASHBOARD_READ:      { label: "Exec dashboard read",   desc: "View the executive KPI dashboard." },
  FINANCE_REPORTS_READ:     { label: "Finance reports read",  desc: "View finance-owned reports (P&L, cash flow)." },
  BUDGET_TRANSFER_APPROVE:  { label: "Budget transfer approve", desc: "Approve inter-department budget transfers up to $250k." },
  MARKETING_GLOBAL_ADMIN:   { label: "Marketing global admin",  desc: "Full admin of all marketing systems." },
  BUDGET_APPROVE_500K:      { label: "Budget approve $500k",   desc: "Approve marketing spend up to $500k." },
  DIRECTOR_TEAM:            { label: "Director team access",   desc: "Manage the entire marketing organization." },
};

// Career events — each year's role change and the permissions granted for it.
// `stale` is the array of granted permission IDs that become stale at end of year.
const CAREER = [
  {
    year: 1,
    role: "Marketing Coordinator",
    event: `${EMPLOYEE.name} joins the company as a Marketing Coordinator. Onboarding provisions the marketing role.`,
    grants: ["MARKETING_TOOLS", "CRM_READ", "CONTENT_CMS"],
    stale: [],
    reviewNote: "First year in role. Everything just granted matches the job. Nothing to remove yet. Skipping is fine here.",
  },
  {
    year: 2,
    role: "Marketing Coordinator (+ Sales Ops rotation)",
    event: `${EMPLOYEE.name} did a 6-month rotation with Sales Ops. That rotation ended two months ago. ${EMPLOYEE.name} is back in Marketing full-time.`,
    grants: ["SALES_CRM_WRITE", "DEAL_PIPELINE", "LEAD_SCORING"],
    stale: ["SALES_CRM_WRITE", "DEAL_PIPELINE", "LEAD_SCORING"],
    reviewNote: "The Sales Ops rotation is over. All three sales permissions should come off — they don't belong to a marketing role.",
  },
  {
    year: 3,
    role: "Marketing Manager",
    event: `${EMPLOYEE.name} is promoted to Marketing Manager. Also inherited Exec Dashboard access from an analytics project that ended six months ago.`,
    grants: ["MARKETING_BUDGET", "TEAM_MGMT", "REPORTS_ADMIN", "EXEC_DASHBOARD_READ"],
    stale: ["EXEC_DASHBOARD_READ"],
    reviewNote: "The manager permissions are legitimate for the new role. But the Exec Dashboard read is a leftover from an ended project.",
  },
  {
    year: 4,
    role: "Marketing Manager (+ Finance cross-project)",
    event: `${EMPLOYEE.name} co-led a 3-month cross-functional project with Finance to design a joint budget dashboard. Project wrapped last month.`,
    grants: ["FINANCE_REPORTS_READ", "BUDGET_TRANSFER_APPROVE"],
    stale: ["FINANCE_REPORTS_READ", "BUDGET_TRANSFER_APPROVE"],
    reviewNote: "The Finance project is over. Both Finance permissions should come off. The transfer-approve is especially dangerous to leave — it's a SOX segregation-of-duties issue.",
  },
  {
    year: 5,
    role: "Director of Marketing",
    event: `${EMPLOYEE.name} is promoted to Director of Marketing. Full department authority granted.`,
    grants: ["MARKETING_GLOBAL_ADMIN", "BUDGET_APPROVE_500K", "DIRECTOR_TEAM"],
    stale: [],
    reviewNote: "New director permissions are legitimate. This is your last chance to catch anything you missed from earlier years.",
  },
];

// Which permissions are LEGIT at end of career (Director of Marketing).
// Everything else in the final set is privilege creep.
const LEGIT_FINAL = new Set([
  "MARKETING_TOOLS", "CRM_READ", "CONTENT_CMS",
  "MARKETING_BUDGET", "TEAM_MGMT", "REPORTS_ADMIN",
  "MARKETING_GLOBAL_ADMIN", "BUDGET_APPROVE_500K", "DIRECTOR_TEAM",
]);

// Audit findings triggered per stale perm that survives to year 5.
const AUDIT_FINDING = {
  SALES_CRM_WRITE:         { sev: "MEDIUM",   msg: "Sales system write access retained without a role justification." },
  DEAL_PIPELINE:           { sev: "LOW",      msg: "Sales pipeline access retained across role change." },
  LEAD_SCORING:            { sev: "LOW",      msg: "Sales lead scoring access retained past project end." },
  EXEC_DASHBOARD_READ:     { sev: "MEDIUM",   msg: "Executive dashboard access without an executive role." },
  FINANCE_REPORTS_READ:    { sev: "MEDIUM",   msg: "Finance data access retained by non-Finance employee. Potential SOX issue." },
  BUDGET_TRANSFER_APPROVE: { sev: "CRITICAL", msg: "Inter-department budget-transfer authority retained by non-Finance employee. SOX segregation-of-duties violation." },
};

const SEV_COLOR = { CRITICAL: COLORS.red, MEDIUM: COLORS.amber, LOW: COLORS.muted };

// =============================================================================
// Component
// =============================================================================

export default function PrivilegeCreep() {
  const [stage, setStage] = useState("welcome"); // welcome | year | review | done
  const [yearIdx, setYearIdx] = useState(0);
  const [currentPerms, setCurrentPerms] = useState(new Set());
  const [markedForRemoval, setMarkedForRemoval] = useState(new Set());
  const [reviewsRun, setReviewsRun] = useState(0);
  const [legitRemoved, setLegitRemoved] = useState(0);
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
      track("privilege_creep_opened");
      setOpenedTracked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const articleUrl = `${BASE_URL}${SOURCE_ARTICLE.slug}`;

  // Legitimate perms for the CURRENT year's role (accumulated permanent grants).
  const legitAtYear = (yr) => {
    const set = new Set();
    for (let i = 0; i <= yr; i++) {
      const year = CAREER[i];
      if (!year) continue;
      for (const g of year.grants) {
        if (!year.stale.includes(g)) set.add(g);
      }
    }
    return set;
  };

  const startGame = () => {
    track("privilege_creep_started");
    const first = new Set(CAREER[0].grants);
    setCurrentPerms(first);
    setYearIdx(0);
    setReviewsRun(0);
    setLegitRemoved(0);
    setMarkedForRemoval(new Set());
    setStage("year");
  };

  const advance = (nextYearIdx, permsAfter) => {
    if (nextYearIdx >= CAREER.length) {
      // Finished year 5 — go to done
      track("privilege_creep_completed", {
        reviews_run: reviewsRun + (stage === "review" ? 1 : 0),
        stale_remaining: [...permsAfter].filter((p) => !LEGIT_FINAL.has(p)).length,
        legit_removed_wrong: legitRemoved,
      });
      setStage("done");
      return;
    }
    // Grant next year's new perms
    const nextYear = CAREER[nextYearIdx];
    const newSet = new Set(permsAfter);
    for (const g of nextYear.grants) newSet.add(g);
    setCurrentPerms(newSet);
    setYearIdx(nextYearIdx);
    setMarkedForRemoval(new Set());
    setStage("year");
  };

  const skipReview = () => {
    track("privilege_creep_year_skipped", { year: CAREER[yearIdx].year });
    advance(yearIdx + 1, currentPerms);
  };

  const openReview = () => {
    track("privilege_creep_review_opened", { year: CAREER[yearIdx].year });
    setMarkedForRemoval(new Set());
    setStage("review");
  };

  const toggleMark = (permId) => {
    const next = new Set(markedForRemoval);
    if (next.has(permId)) next.delete(permId);
    else next.add(permId);
    setMarkedForRemoval(next);
  };

  const finalizeReview = () => {
    // Apply removals
    const newPerms = new Set(currentPerms);
    let wrongThisReview = 0;
    const legitNow = legitAtYear(yearIdx);
    for (const p of markedForRemoval) {
      newPerms.delete(p);
      if (legitNow.has(p)) wrongThisReview++;
    }
    track("privilege_creep_review_finalized", {
      year: CAREER[yearIdx].year,
      removed: markedForRemoval.size,
      legit_removed_wrong: wrongThisReview,
    });
    setLegitRemoved((n) => n + wrongThisReview);
    setReviewsRun((n) => n + 1);
    advance(yearIdx + 1, newPerms);
  };

  const restart = () => {
    track("privilege_creep_restarted");
    setStage("welcome");
    setYearIdx(0);
    setCurrentPerms(new Set());
    setMarkedForRemoval(new Set());
    setReviewsRun(0);
    setLegitRemoved(0);
  };

  // Final-scoring calculations
  const finalStale = [...currentPerms].filter((p) => !LEGIT_FINAL.has(p));
  const finalLegit = [...currentPerms].filter((p) => LEGIT_FINAL.has(p));
  const totalLegitExpected = LEGIT_FINAL.size;
  const cleanliness = totalLegitExpected + finalStale.length === 0
    ? 100
    : Math.round(100 * finalLegit.length / (finalLegit.length + finalStale.length));
  const findings = finalStale
    .map((p) => ({ id: p, ...AUDIT_FINDING[p] }))
    .filter((f) => f.msg)
    .sort((a, b) => {
      const rank = { CRITICAL: 0, MEDIUM: 1, LOW: 2 };
      return rank[a.sev] - rank[b.sev];
    });
  const criticalCount = findings.filter((f) => f.sev === "CRITICAL").length;
  const mediumCount = findings.filter((f) => f.sev === "MEDIUM").length;
  const lowCount = findings.filter((f) => f.sev === "LOW").length;

  const currentYear = CAREER[yearIdx];
  const currentLegit = currentYear ? legitAtYear(yearIdx) : null;

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
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <header style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // PRIVILEGE CREEP SIMULATOR</div>
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
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; YOU ARE THE MANAGER</div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.08, marginBottom: 20, letterSpacing: -1 }}>
              5 years. 5 role changes. <span style={{ color: COLORS.red }}>How clean can you keep Alex's access?</span>
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 14, maxWidth: 700 }}>
              Alex Chen just joined your team. Over 5 years they'll get promoted, rotate through other departments, and pick up permissions from projects that end. At every year you'll be asked: run an access review, or skip.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "#cccccc", marginBottom: 28, maxWidth: 700 }}>
              Skip too many and the year-5 audit will find you. Skip the wrong ones and Alex ends up with cross-department budget authority they shouldn't have. That is privilege creep, made visible.
            </p>

            <a href={articleUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => track("source_article_clicked", { tool: "privilege_creep" })}
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
              HIRE ALEX. START THE 5-YEAR CLOCK →
            </button>
          </div>
        )}

        {/* YEAR — event + new perms + choose review or skip */}
        {stage === "year" && currentYear && (
          <div>
            <TimelineHeader year={currentYear.year} />
            <div style={{ animation: "fadeIn 250ms ease-out" }}>
              <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, marginBottom: 6 }}>NEW ROLE</div>
              <h2 style={{ fontSize: "clamp(22px, 3.6vw, 30px)", fontWeight: 700, marginBottom: 14, letterSpacing: -0.5 }}>
                {currentYear.role}
              </h2>
              <p style={{ fontSize: 14, color: "#cccccc", lineHeight: 1.6, marginBottom: 20 }}>{currentYear.event}</p>

              <SectionLabel>PERMISSIONS GRANTED THIS YEAR</SectionLabel>
              <ChipGrid>
                {currentYear.grants.map((p) => (
                  <PermChip key={p} id={p} tone="new" />
                ))}
              </ChipGrid>

              <div style={{ marginTop: 22 }}>
                <SectionLabel>ALEX'S CURRENT ACCESS ({currentPerms.size} PERMISSIONS)</SectionLabel>
                <ChipGrid>
                  {[...currentPerms].map((p) => (
                    <PermChip key={p} id={p} tone={currentYear.grants.includes(p) ? "new-in-current" : "current"} />
                  ))}
                </ChipGrid>
              </div>

              <div style={{
                marginTop: 24, padding: 16,
                border: `1px solid ${COLORS.border}`, backgroundColor: "rgba(255,255,255,0.02)",
              }}>
                <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 2, marginBottom: 8 }}>DECISION</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Run an access review for Alex this year?</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={openReview} style={primaryBtn(fontStack)}>
                    RUN ACCESS REVIEW
                  </button>
                  <button onClick={skipReview}
                    style={{
                      fontFamily: fontStack, fontSize: 13, letterSpacing: 1.5,
                      color: COLORS.muted, backgroundColor: "transparent",
                      border: `1px solid ${COLORS.border}`, padding: "14px 22px", cursor: "pointer",
                      transition: "all 150ms",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.white; e.currentTarget.style.borderColor = COLORS.muted; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderColor = COLORS.border; }}
                  >
                    SKIP THIS YEAR
                  </button>
                </div>
                <div style={{ marginTop: 12, fontSize: 11, color: COLORS.muted, letterSpacing: 0.5, lineHeight: 1.5 }}>
                  A review takes ~20 minutes of your time. Skipping saves the time now — but stale permissions carry forward.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REVIEW — click chips to mark for removal */}
        {stage === "review" && currentYear && currentLegit && (
          <div>
            <TimelineHeader year={currentYear.year} />
            <div style={{ animation: "fadeIn 250ms ease-out" }}>
              <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, marginBottom: 6 }}>ACCESS REVIEW · YEAR {currentYear.year}</div>
              <h2 style={{ fontSize: "clamp(20px, 3.2vw, 26px)", fontWeight: 700, marginBottom: 12, letterSpacing: -0.5 }}>
                Which of these no longer belong with Alex's role?
              </h2>
              <p style={{ fontSize: 13, color: "#cccccc", lineHeight: 1.6, marginBottom: 8 }}>
                Alex's current role: <strong style={{ color: COLORS.white }}>{currentYear.role.split(" (")[0]}</strong>. Click any permission that no longer fits. Marked ones will be removed when you finish the review.
              </p>
              <p style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.55, marginBottom: 20 }}>
                Hint: hover a permission to see when it was granted and why. Watch for permissions from projects that have ended or roles Alex no longer holds.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10, marginBottom: 22 }}>
                {[...currentPerms].map((p) => (
                  <ReviewChip
                    key={p} id={p}
                    marked={markedForRemoval.has(p)}
                    onToggle={() => toggleMark(p)}
                  />
                ))}
              </div>

              <div style={{
                padding: 14, border: `1px solid ${markedForRemoval.size > 0 ? COLORS.red : COLORS.border}`,
                backgroundColor: markedForRemoval.size > 0 ? "rgba(230,72,51,0.04)" : "transparent",
                marginBottom: 20, fontSize: 13, color: "#cccccc",
              }}>
                {markedForRemoval.size === 0
                  ? "No permissions marked. Finishing the review with zero removals is the same as skipping it."
                  : `${markedForRemoval.size} permission${markedForRemoval.size === 1 ? "" : "s"} marked for removal.`}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={finalizeReview} style={primaryBtn(fontStack)}>
                  FINISH REVIEW · ADVANCE TO YEAR {currentYear.year + 1 <= 5 ? currentYear.year + 1 : "END"} →
                </button>
                <button onClick={() => setMarkedForRemoval(new Set())}
                  style={{
                    fontFamily: fontStack, fontSize: 12, letterSpacing: 1.5,
                    color: COLORS.muted, backgroundColor: "transparent",
                    border: `1px solid ${COLORS.border}`, padding: "14px 18px", cursor: "pointer",
                  }}
                >
                  CLEAR SELECTIONS
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DONE — final result */}
        {stage === "done" && (
          <div style={{ animation: "fadeIn 600ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; 5 YEARS LATER · AUDIT DAY</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, marginBottom: 8 }}>ALEX'S ACCESS PROFILE</div>
            <h1 style={{ fontSize: "clamp(48px, 9vw, 88px)", fontWeight: 700, lineHeight: 1, marginBottom: 8, letterSpacing: -2 }}>
              <span style={{ color: cleanliness >= 90 ? COLORS.green : cleanliness >= 60 ? COLORS.amber : COLORS.red }}>{cleanliness}</span>
              <span style={{ color: COLORS.muted, fontSize: "0.35em", marginLeft: 6 }}>% CLEAN</span>
            </h1>
            <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 24, letterSpacing: 0.5 }}>
              {finalLegit.length} legitimate · {finalStale.length} stale · {reviewsRun}/5 reviews run · {legitRemoved > 0 ? `${legitRemoved} legit removal${legitRemoved === 1 ? "" : "s"} to grant back` : "no legit access broken"}
            </p>

            {/* Verdict message */}
            <div style={{
              padding: "18px 20px",
              borderLeft: `2px solid ${cleanliness >= 90 ? COLORS.green : cleanliness >= 60 ? COLORS.amber : COLORS.red}`,
              backgroundColor: cleanliness >= 90 ? "rgba(58,182,118,0.05)" : cleanliness >= 60 ? "rgba(232,161,42,0.05)" : "rgba(230,72,51,0.06)",
              marginBottom: 28, fontSize: 14, color: "#dddddd", lineHeight: 1.6, maxWidth: 720,
            }}>
              {cleanliness >= 95 && "Textbook. Every stale permission caught. This is what identity governance looks like when someone actually owns it."}
              {cleanliness >= 80 && cleanliness < 95 && "Strong. A couple slipped through — an auditor would raise minor findings, easily fixed. You'd be the manager the CISO holds up as an example."}
              {cleanliness >= 60 && cleanliness < 80 && "Where most real organizations sit. Enough legit findings to worry an auditor and enough stale access to enable a breach if one credential leaks."}
              {cleanliness >= 40 && cleanliness < 60 && "Serious privilege creep. Alex has more access than three of your average employees combined. First real incident here becomes the postmortem's opening paragraph."}
              {cleanliness < 40 && "Textbook worst case. Five years of skipped reviews. If you handed an attacker Alex's credentials, they'd own marketing, finance approval authority, and the sales pipeline. This is not hypothetical — this is what breaches look like."}
            </div>

            {/* Access panels split */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginBottom: 28 }}>
              <div style={{ border: `1px solid ${COLORS.green}`, padding: 16, backgroundColor: "rgba(58,182,118,0.04)" }}>
                <div style={{ fontSize: 11, color: COLORS.green, letterSpacing: 2, marginBottom: 10 }}>LEGITIMATE ACCESS · {finalLegit.length}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {finalLegit.length === 0 ? (
                    <div style={{ fontSize: 12, color: COLORS.muted }}>You removed everything. Alex can't do their job.</div>
                  ) : finalLegit.map((p) => (
                    <div key={p} style={{ fontSize: 12, color: "#dddddd", padding: "6px 10px", border: `1px solid ${COLORS.border}`, backgroundColor: "rgba(58,182,118,0.06)" }}>
                      {PERM[p].label}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ border: `1px solid ${finalStale.length > 0 ? COLORS.red : COLORS.border}`, padding: 16, backgroundColor: finalStale.length > 0 ? "rgba(230,72,51,0.04)" : "transparent" }}>
                <div style={{ fontSize: 11, color: finalStale.length > 0 ? COLORS.red : COLORS.green, letterSpacing: 2, marginBottom: 10 }}>
                  STALE ACCESS · {finalStale.length}
                </div>
                {finalStale.length === 0 ? (
                  <div style={{ fontSize: 12, color: COLORS.green }}>Clean sweep. Nothing left over.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {finalStale.map((p) => (
                      <div key={p} style={{ fontSize: 12, color: "#ffcbc4", padding: "6px 10px", border: `1px solid ${COLORS.red}`, backgroundColor: "rgba(230,72,51,0.08)" }}>
                        {PERM[p].label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Audit findings */}
            {findings.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>&gt; AUDIT FINDINGS</div>
                <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 14 }}>
                  {criticalCount > 0 && `${criticalCount} critical · `}
                  {mediumCount > 0 && `${mediumCount} medium · `}
                  {lowCount > 0 && `${lowCount} low · `}
                  {`total: ${findings.length}`}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {findings.map((f) => (
                    <div key={f.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${SEV_COLOR[f.sev]}`, backgroundColor: "rgba(255,255,255,0.02)" }}>
                      <div style={{ fontSize: 10, letterSpacing: 1.5, color: SEV_COLOR[f.sev], fontWeight: 700, minWidth: 60 }}>{f.sev}</div>
                      <div style={{ fontSize: 13, color: "#dddddd", lineHeight: 1.5 }}>
                        <strong style={{ color: COLORS.white }}>{PERM[f.id].label}.</strong> {f.msg}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Breach scenario if any CRITICAL survived */}
            {criticalCount > 0 && (
              <div style={{ padding: 20, border: `2px solid ${COLORS.red}`, backgroundColor: "rgba(230,72,51,0.06)", marginBottom: 28 }}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>THE BREACH SCENARIO</div>
                <p style={{ fontSize: 14, color: "#dddddd", lineHeight: 1.6, margin: 0 }}>
                  An attacker phishes Alex's credentials. Because Alex still holds <strong style={{ color: COLORS.white }}>{PERM.BUDGET_TRANSFER_APPROVE.label}</strong> from a Finance project that ended over a year ago, the attacker can approve inter-department budget transfers of up to $250k. This is the exact pattern of the Business Email Compromise cases that cost mid-sized companies millions per incident. The finding was preventable in your Year 4 review.
                </p>
              </div>
            )}

            {/* Article CTA */}
            <div style={{ border: `1px solid ${COLORS.red}`, backgroundColor: "rgba(230,72,51,0.04)", padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 10 }}>THE FULL BREAKDOWN</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{SOURCE_ARTICLE.title}</div>
              <p style={{ fontSize: 13, color: "#cccccc", marginBottom: 14, lineHeight: 1.55 }}>
                The article covers what you just played — ownership, periodic reviews, and automated deprovisioning — with the CISSP exam framing.
              </p>
              <a href={articleUrl} target="_blank" rel="noopener noreferrer"
                onClick={() => track("comments_cta_clicked", { tool: "privilege_creep" })}
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
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>Free weekly cybersecurity breakdowns.</div>
              <p style={{ fontSize: 13, color: "#bbbbbb", marginBottom: 16, lineHeight: 1.5 }}>IAM, exam prep, secure design. 1,450+ readers.</p>
              <a href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer"
                onClick={() => track("subscribe_clicked", { tool: "privilege_creep" })}
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
                ↻ PLAY AGAIN
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
          <div>DECODED_SECURITY // PRIVILEGE_CREEP_v1</div>
          <div>THE ACCOUNT YOU FORGET IS THE ONE THAT GETS YOU</div>
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
// Sub-components
// =============================================================================

function TimelineHeader({ year }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3 }}>YEAR {year} / 5</div>
        <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5 }}>ALEX'S JOURNEY</div>
      </div>
      <div style={{ height: 3, backgroundColor: COLORS.border, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(year / 5) * 100}%`, backgroundColor: COLORS.red, transition: "width 400ms ease-out" }} />
      </div>
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

function ChipGrid({ children }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {children}
    </div>
  );
}

function PermChip({ id, tone }) {
  const meta = PERM[id];
  if (!meta) return null;
  let borderColor = COLORS.border;
  let bgColor = "rgba(255,255,255,0.03)";
  let textColor = "#dddddd";
  if (tone === "new") { borderColor = COLORS.green; bgColor = "rgba(58,182,118,0.08)"; textColor = "#c8f0d5"; }
  if (tone === "new-in-current") { borderColor = COLORS.green; bgColor = "rgba(58,182,118,0.05)"; textColor = "#c8f0d5"; }
  return (
    <span
      title={meta.desc}
      style={{
        fontSize: 12, padding: "5px 10px",
        border: `1px solid ${borderColor}`, backgroundColor: bgColor,
        color: textColor, letterSpacing: 0.3,
      }}
    >
      {meta.label}
    </span>
  );
}

function ReviewChip({ id, marked, onToggle }) {
  const meta = PERM[id];
  if (!meta) return null;
  return (
    <button
      onClick={onToggle}
      title={meta.desc}
      style={{
        fontFamily: "inherit", fontSize: 12, textAlign: "left", cursor: "pointer",
        padding: "12px 14px",
        border: `1px solid ${marked ? COLORS.red : COLORS.border}`,
        backgroundColor: marked ? "rgba(230,72,51,0.1)" : "rgba(255,255,255,0.02)",
        color: COLORS.white,
        transition: "all 150ms",
        display: "flex", flexDirection: "column", gap: 4,
        opacity: marked ? 0.65 : 1,
      }}
      onMouseEnter={(e) => { if (!marked) { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.backgroundColor = "rgba(230,72,51,0.05)"; } }}
      onMouseLeave={(e) => { if (!marked) { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)"; } }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14, color: marked ? COLORS.red : COLORS.muted, minWidth: 12 }}>
          {marked ? "✕" : "○"}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, textDecoration: marked ? "line-through" : "none" }}>
          {meta.label}
        </span>
      </div>
      <div style={{ fontSize: 10.5, color: COLORS.muted, lineHeight: 1.4, paddingLeft: 20 }}>
        {meta.desc}
      </div>
    </button>
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
