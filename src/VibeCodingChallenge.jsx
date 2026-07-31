import { useState, useEffect, useRef } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — VIBE CODING CHALLENGE
// 6-round "fix the AI's vulnerability" challenge for the article on
// AI-generated (vibe-coded) apps. Each round shows a buggy code snippet
// and asks the reader to REWRITE the bad line(s) with a real fix.
// Validators use lenient pattern matching so several correct approaches pass.
// A checklist sidebar unlocks the article's three fix principles as they go.
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

// TODO: Update slug once the article publishes.
const SOURCE_ARTICLE = {
  title: "Vibe Coding: The Hidden Security Cost of Letting AI Write Your Code",
  slug: "vibe-coding-security",
};

const VULN_TYPES = {
  hardcoded_secret: {
    label: "Hardcoded Secret",
    short: "Hardcoded secret",
    fix: "Secrets belong in environment variables or a secrets manager. Never in code. Search your codebase for \"key\", \"password\", \"token\", \"secret\" before every deploy.",
  },
  missing_auth: {
    label: "Missing Authorization",
    short: "Missing authorization",
    fix: "For every endpoint, answer two questions: who can call this, and what exactly are they allowed to see or change?",
  },
  input_validation: {
    label: "Poor Input Validation",
    short: "Poor input validation",
    fix: "Treat every input as hostile. Validate on the server, not just in the browser. Use parameterized queries, always.",
  },
};

// -----------------------------------------------------------------------------
// Rounds. Each round shows a snippet and asks the reader to rewrite the
// highlighted line(s). Validators return { ok, hint } — hints are specific
// so wrong answers guide the reader toward the fix without giving it away.
// -----------------------------------------------------------------------------

const ROUNDS = [
  {
    lang: "python",
    code: `@app.route("/api/customers")
def get_customers():
    api_key = "sk-live-1a2b3c4d5e6f7g8h9i0j"
    resp = requests.get(
        "https://api.stripe.com/v1/customers",
        headers={"Authorization": f"Bearer {api_key}"}
    )
    return resp.json()`,
    editLines: [3],
    prefill: `    api_key = "sk-live-1a2b3c4d5e6f7g8h9i0j"`,
    multiline: false,
    task: "Rewrite line 3 so the API key comes from an environment variable, not the source.",
    context: [
      "The Stripe key is set as an environment variable named `STRIPE_API_KEY` in production.",
      "Python's `os` module is already imported at the top of this file.",
    ],
    usage: {
      lang: "python",
      code: `# Read a secret from an environment variable:
api_key = os.environ["STRIPE_API_KEY"]     # raises KeyError if missing
api_key = os.getenv("STRIPE_API_KEY")      # returns None if missing`,
      note: "os.environ is a dict of env vars. os.getenv is the safer variant when a missing value shouldn't crash.",
    },
    correctFix: `    api_key = os.environ["STRIPE_API_KEY"]`,
    vulnType: "hardcoded_secret",
    validate: (input) => {
      const text = input.trim();
      if (text === "") return { ok: false, hint: "Empty. Try again." };
      if (/sk-(live|test)-/.test(text)) {
        return { ok: false, hint: "Your line still contains the literal Stripe key. The key needs to live outside the code." };
      }
      if (/process\.env/.test(text)) {
        return { ok: false, hint: "That's the Node.js syntax. This snippet is Python — try `os.environ[...]` or `os.getenv(...)`." };
      }
      if (/os\.(environ|getenv)/.test(text)) return { ok: true };
      if (/=\s*["'][^"']+["']\s*$/.test(text)) {
        return { ok: false, hint: "You're still assigning a hardcoded string. Read from the environment instead." };
      }
      return { ok: false, hint: "Try `os.environ[\"STRIPE_API_KEY\"]` or `os.getenv(\"STRIPE_API_KEY\")`." };
    },
    explanation: "Line 3 had a live Stripe API key hardcoded into the source. Anyone with repo access — leaked backup, old branch, curious contractor — can now bill your account. `os.environ` reads the key from the runtime environment, so it never touches git.",
  },
  {
    lang: "python",
    code: `@app.route("/invoice/<int:invoice_id>")
@login_required
def view_invoice(invoice_id):
    invoice = db.query(Invoice).get(invoice_id)
    return render_template("invoice.html", invoice=invoice)`,
    editLines: [4],
    prefill: `    invoice = db.query(Invoice).get(invoice_id)`,
    multiline: true,
    task: "Rewrite line 4 (or add lines) so only the invoice's owner can view it.",
    context: [
      "`current_user` (from Flask-Login) references the logged-in user. It has `.id` and `.email`.",
      "The `Invoice` model has these fields: `.id`, `.user_id`, `.amount`.",
      "`abort(status_code)` from Flask is imported — call `abort(403)` to return Forbidden.",
    ],
    usage: {
      lang: "python",
      code: `# Option A — restrict the query to only records the user owns:
invoice = db.query(Invoice).filter_by(
    id=invoice_id, user_id=current_user.id
).first_or_404()

# Option B — fetch first, then reject if they don't own it:
invoice = db.query(Invoice).get(invoice_id)
if invoice.user_id != current_user.id:
    abort(403)`,
      note: "Either approach works. filter_by narrows the query; abort short-circuits with a Forbidden response.",
    },
    correctFix: `    invoice = db.query(Invoice).filter_by(id=invoice_id, user_id=current_user.id).first_or_404()`,
    vulnType: "missing_auth",
    validate: (input) => {
      const text = input.trim();
      if (text === "") return { ok: false, hint: "Empty. Try again." };
      const unchanged = /\.get\(invoice_id\)/.test(text) && !/filter_by|filter\(|current_user|user_id\s*[=!]=/.test(text);
      if (unchanged) return { ok: false, hint: "You're still fetching the invoice by ID alone. Any logged-in user can still request any invoice. Restrict it to the owner." };
      const referencesUser = /current_user|request\.user|g\.user/.test(text);
      if (!referencesUser) return { ok: false, hint: "You need to reference the current user somewhere. In Flask that's `current_user`." };
      const blocksAccess = /filter_by\s*\([^)]*user_id/.test(text) || /abort\s*\(\s*40[34]/.test(text) || /!=\s*current_user\.id|!=\s*current_user/.test(text) || /raise/.test(text);
      if (!blocksAccess) return { ok: false, hint: "You mentioned the user, but you're not actually blocking access. Either query with a `user_id=current_user.id` filter or `abort(403)` on mismatch." };
      return { ok: true };
    },
    explanation: "The `@login_required` decorator only asks \"are you logged in?\" It never asks \"is this invoice yours?\" — so URL-tweaking (/invoice/1042 → /invoice/1043) reads someone else's data. This exact pattern is called IDOR (Insecure Direct Object Reference), one of the most common real-world vulnerabilities.",
  },
  {
    lang: "python",
    code: `@app.route("/search")
def search():
    q = request.args.get("q")
    results = db.execute(
        f"SELECT * FROM products WHERE name LIKE '%{q}%'"
    )
    return jsonify(results.fetchall())`,
    editLines: [5],
    prefill: `        f"SELECT * FROM products WHERE name LIKE '%{q}%'"`,
    multiline: true,
    task: "Rewrite line 5 so `q` is passed as a parameter, not concatenated into the SQL string.",
    context: [
      "`db.execute()` accepts two arguments: a SQL string, and an optional tuple of parameters.",
      "This driver supports two placeholder styles inside the SQL string: `?` and `%s`.",
      "The placeholder is where the parameter value goes — the driver handles escaping.",
    ],
    usage: {
      lang: "python",
      code: `# Parameterized query — the driver escapes the value for you:
db.execute(
    "SELECT * FROM products WHERE name LIKE ?",
    (f"%{q}%",)
)

# Same idea with %s (psycopg2, mysql-connector):
db.execute(
    "SELECT * FROM products WHERE name LIKE %s",
    (f"%{q}%",)
)`,
      note: "The value is passed separately from the query string, so it's treated as data — never as SQL. Injection becomes impossible.",
    },
    correctFix: `        "SELECT * FROM products WHERE name LIKE ?", (f"%{q}%",)`,
    vulnType: "input_validation",
    validate: (input) => {
      const text = input.trim();
      if (text === "") return { ok: false, hint: "Empty. Try again." };
      if (/f["'][^"']*\{q\}/.test(text)) {
        return { ok: false, hint: "Your query is still an f-string with `{q}` interpolated. That's exactly the injection point — the value must be passed as a parameter." };
      }
      if (/%\s*q|\+\s*q\s*\+|\.format\s*\(/.test(text)) {
        return { ok: false, hint: "You're still concatenating `q` into the SQL string. Use a placeholder (`?` or `%s`) and pass `q` as a parameter tuple." };
      }
      const hasPlaceholder = /LIKE\s+\?|LIKE\s+%s/i.test(text);
      const hasParamTuple = /\([^)]*q[^)]*\)|\(f?["'][^"']*%[^"']*["']\s*,/.test(text);
      if (hasPlaceholder && hasParamTuple) return { ok: true };
      if (hasPlaceholder && !hasParamTuple) {
        return { ok: false, hint: "Placeholder is there, but you still need to pass the value — add `, (f\"%{q}%\",)` after the query." };
      }
      return { ok: false, hint: "Replace the interpolated value with a `?` or `%s` placeholder, then pass `q` as a parameter." };
    },
    explanation: "The f-string glued the user's search text directly into SQL. Send `q='; DROP TABLE products;--` and the query is destructive. Parameterized queries make the driver treat `q` as a value, never as SQL — the oldest vuln in the book, and AI still generates it.",
  },
  {
    lang: "javascript",
    code: `// db.config.js
export const dbConfig = {
  host: "prod-db-01.internal.company.com",
  user: "admin",
  password: "P@ssw0rd_2026!",
  database: "customers",
};`,
    editLines: [3, 4, 5],
    prefill: `  host: "prod-db-01.internal.company.com",
  user: "admin",
  password: "P@ssw0rd_2026!",`,
    multiline: true,
    task: "Rewrite lines 3–5 so all three values come from environment variables instead of the file.",
    context: [
      "In production, these environment variables are set: `DB_HOST`, `DB_USER`, `DB_PASSWORD`.",
      "In Node.js, `process.env` exposes all env vars as a plain object at runtime.",
    ],
    usage: {
      lang: "javascript",
      code: `// Read secrets from Node's environment:
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,`,
      note: "process.env.VARIABLE_NAME reads the value at boot. Set the values in a .env file (loaded by the dotenv package) or your host's env config.",
    },
    correctFix: `  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,`,
    vulnType: "hardcoded_secret",
    validate: (input) => {
      const text = input.trim();
      if (text === "") return { ok: false, hint: "Empty. Try again." };
      if (/"P@ssw0rd|'P@ssw0rd/.test(text)) return { ok: false, hint: "The password is still hardcoded. Read it from an environment variable." };
      if (/"admin"|'admin'/.test(text)) return { ok: false, hint: "The user is still hardcoded. Read it from an environment variable." };
      if (/"prod-db-01|'prod-db-01/.test(text)) return { ok: false, hint: "The host is still hardcoded. Read it from an environment variable." };
      const envHits = (text.match(/process\.env\.[A-Z_]+/g) || []).length;
      if (envHits >= 3) return { ok: true };
      if (envHits >= 1) return { ok: false, hint: "Good start — but all three values (host, user, password) need to come from `process.env`, not just one." };
      return { ok: false, hint: "In Node.js, read secrets with `process.env.YOUR_VARIABLE_NAME`." };
    },
    explanation: "Production credentials — host, admin user, password — all committed to a file that ships to git. AI generates configs like this because tutorials treat them as placeholders \"you'll replace later.\" Nobody replaces them. `process.env` reads them from the environment at boot.",
  },
  {
    lang: "javascript",
    code: `app.post("/api/admin/delete-user", authenticate, async (req, res) => {
  const { userId } = req.body;
  await db.users.delete({ where: { id: userId } });
  res.json({ success: true });
});`,
    editLines: [1],
    prefill: `app.post("/api/admin/delete-user", authenticate, async (req, res) => {`,
    multiline: true,
    task: "The `authenticate` middleware confirms the user is logged in, but not that they're an admin. Add an admin-only check.",
    context: [
      "`authenticate` populates `req.user`. `req.user.role` is either `'user'` or `'admin'`.",
      "A `requireAdmin` middleware exists in the codebase — it 403s any non-admin request.",
      "Express: `res.status(N).json({...})` sets the response status and returns JSON.",
    ],
    usage: {
      lang: "javascript",
      code: `// Option A — add another middleware after authenticate:
app.post("/api/admin/delete-user", authenticate, requireAdmin, async (req, res) => {
  // ...
});

// Option B — check the role inside the handler:
if (req.user.role !== "admin") {
  return res.status(403).json({ error: "Forbidden" });
}`,
      note: "Middleware chain runs left to right — anything after authenticate has req.user available. Either approach works.",
    },
    correctFix: `app.post("/api/admin/delete-user", authenticate, requireAdmin, async (req, res) => {`,
    vulnType: "missing_auth",
    validate: (input) => {
      const text = input.trim();
      if (text === "") return { ok: false, hint: "Empty. Try again." };
      const unchanged = text === `app.post("/api/admin/delete-user", authenticate, async (req, res) => {`;
      if (unchanged) return { ok: false, hint: "Nothing has changed. Add an admin check — either as another middleware or inside the handler." };
      const hasAdminKeyword = /admin/i.test(text);
      const hasRoleOrAdminMiddleware = /requireAdmin|isAdmin|checkAdmin|adminOnly|authorize\s*\(|role/i.test(text);
      const hasInlineRoleCheck = /req\.user\.(role|isAdmin|admin)/i.test(text);
      if (!hasAdminKeyword) return { ok: false, hint: "You need to reference \"admin\" somewhere — either a middleware name (`requireAdmin`) or a role check on `req.user`." };
      if (hasRoleOrAdminMiddleware || hasInlineRoleCheck) return { ok: true };
      return { ok: false, hint: "You mentioned admin — but there's no actual check. Try middleware like `requireAdmin` or `if (req.user.role !== \"admin\") return res.status(403).json(...)`." };
    },
    explanation: "The `authenticate` middleware checks WHO the user is. It does not check whether they're allowed to do THIS. Any logged-in user could POST to this endpoint and delete anyone. Authentication asks \"who are you?\" — authorization asks \"are you allowed to do this?\"",
  },
  {
    lang: "python",
    code: `@app.route("/download")
def download():
    filename = request.args.get("file")
    path = f"/var/uploads/{filename}"
    return send_file(path)`,
    editLines: [4],
    prefill: `    path = f"/var/uploads/{filename}"`,
    multiline: true,
    task: "Rewrite line 4 (or add lines) to prevent path traversal. `../../etc/passwd` must not escape /var/uploads/.",
    context: [
      "Python's `os.path` module is already imported. It exposes `os.path.basename`, `os.path.join`, `os.path.abspath`, and others.",
      "`abort(status_code)` from Flask is imported.",
      "The attacker's input is any string — including `../../etc/passwd`, `..\\..\\Windows\\...`, absolute paths, etc.",
    ],
    usage: {
      lang: "python",
      code: `# Option A — strip any directory components with basename():
path = os.path.join("/var/uploads", os.path.basename(filename))

# Option B — reject filenames that try to escape:
if ".." in filename or "/" in filename:
    abort(400)
path = f"/var/uploads/{filename}"`,
      note: "os.path.basename('../../etc/passwd') returns just 'passwd' — the escape components are stripped. Safest single-line fix.",
    },
    correctFix: `    path = os.path.join("/var/uploads", os.path.basename(filename))`,
    vulnType: "input_validation",
    validate: (input) => {
      const text = input.trim();
      if (text === "") return { ok: false, hint: "Empty. Try again." };
      const unchanged = /^path\s*=\s*f["']\/var\/uploads\/\{filename\}["']$/.test(text.replace(/^\s+/, ""));
      if (unchanged) return { ok: false, hint: "Unchanged. The user-supplied `filename` still goes straight into the path — `../../../etc/passwd` gets through." };
      const usesBasename = /os\.path\.basename\s*\(/.test(text);
      const hasTraversalCheck = /\.\.["']|["']\.\.["']/.test(text) && /if\s|abort|raise|return/.test(text);
      const usesSafeJoin = /os\.path\.(abspath|realpath|commonpath)/.test(text) && /\.\.["']|startswith|commonpath/.test(text);
      if (usesBasename || hasTraversalCheck || usesSafeJoin) return { ok: true };
      if (/os\.path\.join/.test(text) && !usesBasename) {
        return { ok: false, hint: "`os.path.join` alone doesn't help — join gives you the same escape. Strip directory components with `os.path.basename(filename)`." };
      }
      return { ok: false, hint: "Sanitize the filename. Easiest fix: wrap it with `os.path.basename(filename)` — that strips any `../` before joining." };
    },
    explanation: "The user's `filename` was stuck into a filesystem path unchanged. Request `?file=../../etc/passwd` and you get the server's password file. `os.path.basename()` strips any directory components, so `../../etc/passwd` becomes just `passwd`.",
  },
];

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function VibeCodingChallenge() {
  const [stage, setStage] = useState("round"); // "round" | "result" — no welcome
  const [currentRound, setCurrentRound] = useState(0);
  const [inputValue, setInputValue] = useState(ROUNDS[0].prefill);
  const [wrongHint, setWrongHint] = useState(null);
  const [roundStatus, setRoundStatus] = useState("editing"); // "editing" | "solved" | "revealed"
  const [results, setResults] = useState([]); // [{ status: "solved"|"revealed", vulnType, finalText }]
  const [unlockedTypes, setUnlockedTypes] = useState(new Set());
  const [copied, setCopied] = useState(false);
  const [showUsage, setShowUsage] = useState(false);
  const [startedTracked, setStartedTracked] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  // Fire the "started" analytic once, on first mount — matches "skip welcome" flow.
  useEffect(() => {
    if (!startedTracked) {
      track("vibe_challenge_started");
      setStartedTracked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const articleUrl = `${BASE_URL}${SOURCE_ARTICLE.slug}`;
  const totalRounds = ROUNDS.length;
  const round = ROUNDS[currentRound];

  const tryFix = () => {
    if (roundStatus !== "editing") return;
    const result = round.validate(inputValue);
    track("vibe_challenge_attempt", { round: currentRound + 1, ok: result.ok });
    if (result.ok) {
      setRoundStatus("solved");
      setWrongHint(null);
      if (!unlockedTypes.has(round.vulnType)) {
        const next = new Set(unlockedTypes);
        next.add(round.vulnType);
        setUnlockedTypes(next);
        track("vibe_challenge_unlocked", { type: round.vulnType });
      }
    } else {
      setWrongHint(result.hint);
    }
  };

  const revealFix = () => {
    if (roundStatus !== "editing") return;
    track("vibe_challenge_revealed", { round: currentRound + 1 });
    setRoundStatus("revealed");
    setWrongHint(null);
    setInputValue(round.correctFix);
    // Reveal still unlocks the checklist item — the point is education, not gatekeeping.
    if (!unlockedTypes.has(round.vulnType)) {
      const next = new Set(unlockedTypes);
      next.add(round.vulnType);
      setUnlockedTypes(next);
    }
  };

  const nextRound = () => {
    const newResult = {
      status: roundStatus,
      vulnType: round.vulnType,
      finalText: inputValue,
    };
    const newResults = [...results, newResult];
    if (currentRound + 1 < totalRounds) {
      setResults(newResults);
      setCurrentRound(currentRound + 1);
      setInputValue(ROUNDS[currentRound + 1].prefill);
      setRoundStatus("editing");
      setWrongHint(null);
      setShowUsage(false);
    } else {
      setResults(newResults);
      const solved = newResults.filter((r) => r.status === "solved").length;
      const revealed = newResults.filter((r) => r.status === "revealed").length;
      track("vibe_challenge_completed", { solved, revealed, total: totalRounds });
      setStage("result");
    }
  };

  const restart = () => {
    track("vibe_challenge_restarted");
    setStage("round");
    setCurrentRound(0);
    setInputValue(ROUNDS[0].prefill);
    setRoundStatus("editing");
    setWrongHint(null);
    setResults([]);
    setUnlockedTypes(new Set());
    setCopied(false);
    setShowUsage(false);
  };

  const solvedCount = results.filter((r) => r.status === "solved").length;
  const revealedCount = results.filter((r) => r.status === "revealed").length;
  const allUnlockedLive = unlockedTypes.size === 3 && revealedCount === 0;

  // Weakest spot: which vulnerability type they revealed most often
  const weakestSpot = (() => {
    const typeStats = {};
    for (const t of Object.keys(VULN_TYPES)) typeStats[t] = { attempted: 0, solved: 0 };
    for (const r of results) {
      typeStats[r.vulnType].attempted++;
      if (r.status === "solved") typeStats[r.vulnType].solved++;
    }
    let worst = null;
    let worstRatio = Infinity;
    for (const [t, s] of Object.entries(typeStats)) {
      if (s.attempted === 0) continue;
      const ratio = s.solved / s.attempted;
      if (ratio < worstRatio) { worstRatio = ratio; worst = t; }
    }
    if (worst === null) return null;
    if (worstRatio === 1) return null;
    return VULN_TYPES[worst].label;
  })();

  const buildRewardLine = () => {
    if (solvedCount === totalRounds && revealedCount === 0) {
      return `I fixed all ${totalRounds} vibe-coding bugs — no reveals. #VibeCoded`;
    }
    if (weakestSpot) {
      return `I fixed ${solvedCount}/${totalRounds} vibe-coding bugs. Weakest spot: ${weakestSpot}. #VibeCoded`;
    }
    return `I fixed ${solvedCount}/${totalRounds} vibe-coding bugs. #VibeCoded`;
  };

  const copyRewardLine = async () => {
    const text = buildRewardLine();
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
      track("vibe_challenge_reward_copied", { solved: solvedCount, total: totalRounds });
    } catch (e) {}
  };

  // Compute the code display for the current round — show the user's fix
  // once they've solved or revealed, so they see the "fixed" version.
  const codeToDisplay = (() => {
    if (roundStatus === "editing") return round.code;
    // Replace the edit lines with the current input
    const codeLines = round.code.split("\n");
    const inputLines = inputValue.split("\n");
    const [firstEdit, ...restEdits] = round.editLines;
    const before = codeLines.slice(0, firstEdit - 1);
    const after = codeLines.slice(firstEdit - 1 + round.editLines.length);
    return [...before, ...inputLines, ...after].join("\n");
  })();

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
      <div style={{ maxWidth: 1020, margin: "0 auto" }}>
        <header style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // VIBE CODING CHALLENGE</div>
          </div>
          <a href="/tools" style={{ fontSize: 11, letterSpacing: 1.5, color: COLORS.muted, textDecoration: "none", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 2, transition: "color 150ms, border-color 150ms" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
          >
            ← ALL TOOLS
          </a>
        </header>

        {/* ROUND */}
        {stage === "round" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3 }}>
                  SNIPPET {String(currentRound + 1).padStart(2, "0")} / {String(totalRounds).padStart(2, "0")}
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5 }}>{unlockedTypes.size} / 3 FIXES UNLOCKED</div>
              </div>
              <div style={{ height: 3, backgroundColor: COLORS.border, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${((currentRound + (roundStatus !== "editing" ? 1 : 0)) / totalRounds) * 100}%`,
                  backgroundColor: COLORS.red, transition: "width 400ms ease-out",
                }} />
              </div>
            </div>

            <div className="vc-layout">
              {/* MAIN — code + fix editor */}
              <div className="vc-main">
                <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase" }}>
                  Buggy snippet · {round.lang} · this AI-written code has a vulnerability
                </div>
                <pre style={{
                  margin: "0 0 20px",
                  backgroundColor: COLORS.codeBg,
                  border: `1px solid ${roundStatus === "solved" ? COLORS.green : roundStatus === "revealed" ? COLORS.amber : COLORS.border}`,
                  padding: 20,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "#dddddd",
                  overflowX: "auto",
                  fontFamily: fontStack,
                }}>
                  {codeToDisplay.split("\n").map((line, i) => {
                    const lineNum = i + 1;
                    // Only highlight in "editing" state — after solve/reveal the fix replaces the line
                    const isHl = roundStatus === "editing" && round.editLines.includes(lineNum);
                    // In "solved"/"revealed" state, highlight the swapped-in lines
                    const [firstEdit] = round.editLines;
                    const inputLines = inputValue.split("\n").length;
                    const isFixLine = roundStatus !== "editing" && lineNum >= firstEdit && lineNum < firstEdit + inputLines;
                    const bg = isHl ? "rgba(230, 72, 51, 0.12)"
                              : isFixLine && roundStatus === "solved" ? "rgba(58, 182, 118, 0.10)"
                              : isFixLine && roundStatus === "revealed" ? "rgba(232, 161, 42, 0.10)"
                              : "transparent";
                    const bd = isHl ? `2px solid ${COLORS.red}`
                              : isFixLine && roundStatus === "solved" ? `2px solid ${COLORS.green}`
                              : isFixLine && roundStatus === "revealed" ? `2px solid ${COLORS.amber}`
                              : "2px solid transparent";
                    return (
                      <div key={i} style={{
                        display: "flex", gap: 12,
                        backgroundColor: bg, borderLeft: bd,
                        paddingLeft: 8, marginLeft: -10,
                      }}>
                        <span style={{ color: COLORS.muted, minWidth: 22, textAlign: "right", userSelect: "none" }}>{lineNum}</span>
                        <span style={{ whiteSpace: "pre" }}>{line || " "}</span>
                      </div>
                    );
                  })}
                </pre>

                {/* TASK + EDITOR */}
                {roundStatus === "editing" && (
                  <div>
                    <div style={{ borderLeft: `2px solid ${COLORS.red}`, paddingLeft: 14, marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>YOUR TASK</div>
                      <p style={{ fontSize: 14, lineHeight: 1.55, color: "#dddddd", margin: 0 }}>{round.task}</p>
                    </div>

                    {/* WHAT YOU HAVE — facts always visible: what's imported, what env vars exist,
                        what attributes are on the models. Enough context to solve without giving syntax. */}
                    {round.context && round.context.length > 0 && (
                      <div style={{
                        border: `1px solid ${COLORS.border}`,
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        padding: 16, marginBottom: 16,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <div style={{ width: 4, height: 12, backgroundColor: "#e6e6e6" }} />
                          <div style={{ fontSize: 11, color: "#e6e6e6", letterSpacing: 2 }}>WHAT YOU HAVE</div>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.65, color: "#cccccc" }}>
                          {round.context.map((line, i) => (
                            <li key={i} style={{ marginBottom: i < round.context.length - 1 ? 6 : 0 }}
                                dangerouslySetInnerHTML={{
                                  __html: line.replace(/`([^`]+)`/g, '<code style="background-color:rgba(255,255,255,0.06);padding:1px 6px;border-radius:2px;font-size:12px;color:#e6e6e6;">$1</code>'),
                                }} />
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* USAGE — hidden by default. Reveals syntax examples on request.
                        The context above should be enough; this is an escape hatch, not the default view. */}
                    {round.usage && (
                      <div style={{ marginBottom: 20 }}>
                        {!showUsage ? (
                          <button
                            onClick={() => { setShowUsage(true); track("vibe_challenge_usage_shown", { round: currentRound + 1 }); }}
                            style={{
                              fontFamily: fontStack, fontSize: 12, letterSpacing: 1.5,
                              color: COLORS.muted, backgroundColor: "transparent",
                              border: "none", borderBottom: `1px dashed ${COLORS.border}`,
                              padding: "6px 0", cursor: "pointer", transition: "color 150ms, border-color 150ms",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#e6e6e6"; e.currentTarget.style.borderBottomColor = "#e6e6e6"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
                          >
                            ? SHOW USAGE EXAMPLES
                          </button>
                        ) : (
                          <div style={{
                            border: `1px solid ${COLORS.border}`,
                            backgroundColor: "rgba(255,255,255,0.02)",
                            padding: 16, animation: "fadeIn 250ms ease-out",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 10 }}>
                              <div style={{ fontSize: 11, color: "#e6e6e6", letterSpacing: 2 }}>USAGE EXAMPLES · {round.usage.lang}</div>
                              <button
                                onClick={() => setShowUsage(false)}
                                style={{ background: "none", border: "none", color: COLORS.muted, fontSize: 11, letterSpacing: 1, cursor: "pointer" }}
                              >
                                HIDE ✕
                              </button>
                            </div>
                            <pre style={{
                              margin: "0 0 10px",
                              backgroundColor: COLORS.codeBg,
                              border: `1px solid ${COLORS.border}`,
                              padding: 14, fontSize: 12, lineHeight: 1.6,
                              color: "#cccccc", overflowX: "auto",
                              fontFamily: fontStack, whiteSpace: "pre",
                            }}>{round.usage.code}</pre>
                            <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.55 }}>
                              {round.usage.note}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase" }}>
                      Your fix
                    </div>

                    {round.multiline ? (
                      <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => { setInputValue(e.target.value); if (wrongHint) setWrongHint(null); }}
                        onKeyDown={(e) => {
                          // Ctrl/Cmd+Enter submits
                          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); tryFix(); }
                        }}
                        spellCheck={false}
                        autoCapitalize="none"
                        autoCorrect="off"
                        rows={Math.max(3, inputValue.split("\n").length)}
                        style={{
                          width: "100%", boxSizing: "border-box",
                          backgroundColor: COLORS.codeBg, color: COLORS.white,
                          border: `1px solid ${wrongHint ? COLORS.red : COLORS.border}`,
                          padding: 14, fontFamily: fontStack, fontSize: 13, lineHeight: 1.6,
                          resize: "vertical", outline: "none", transition: "border-color 200ms",
                        }}
                      />
                    ) : (
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => { setInputValue(e.target.value); if (wrongHint) setWrongHint(null); }}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); tryFix(); } }}
                        spellCheck={false}
                        autoCapitalize="none"
                        autoCorrect="off"
                        style={{
                          width: "100%", boxSizing: "border-box",
                          backgroundColor: COLORS.codeBg, color: COLORS.white,
                          border: `1px solid ${wrongHint ? COLORS.red : COLORS.border}`,
                          padding: 14, fontFamily: fontStack, fontSize: 13,
                          outline: "none", transition: "border-color 200ms",
                        }}
                      />
                    )}

                    {wrongHint && (
                      <div style={{
                        marginTop: 12, padding: "12px 14px",
                        borderLeft: `2px solid ${COLORS.red}`,
                        backgroundColor: "rgba(230, 72, 51, 0.06)",
                        fontSize: 13, color: "#ffd0c8", lineHeight: 1.55,
                        animation: "shake 400ms ease-out",
                      }}>
                        <div style={{ fontSize: 10, color: COLORS.red, letterSpacing: 2, marginBottom: 4 }}>NOT QUITE</div>
                        {wrongHint}
                      </div>
                    )}

                    <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        onClick={tryFix}
                        style={{
                          fontFamily: fontStack, fontSize: 14, fontWeight: 600, letterSpacing: 1.5,
                          color: COLORS.white, backgroundColor: COLORS.red, border: "none",
                          padding: "14px 28px", cursor: "pointer",
                          transition: "transform 150ms, box-shadow 150ms",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(230, 72, 51, 0.3)`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        TRY FIX →
                      </button>
                      <button
                        onClick={revealFix}
                        style={{
                          fontFamily: fontStack, fontSize: 13, letterSpacing: 1.5,
                          color: COLORS.muted, backgroundColor: "transparent",
                          border: `1px solid ${COLORS.border}`,
                          padding: "13px 22px", cursor: "pointer",
                          transition: "all 150ms",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.amber; e.currentTarget.style.borderColor = COLORS.amber; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderColor = COLORS.border; }}
                      >
                        SHOW ME THE FIX
                      </button>
                    </div>
                    {round.multiline && (
                      <div style={{ marginTop: 8, fontSize: 10, color: COLORS.muted, letterSpacing: 1 }}>
                        TIP · CMD/CTRL + ENTER TO SUBMIT
                      </div>
                    )}
                  </div>
                )}

                {/* SOLVED / REVEALED — feedback + next */}
                {roundStatus !== "editing" && (
                  <div style={{ animation: "fadeIn 300ms ease-out" }}>
                    <div
                      style={{
                        borderLeft: `2px solid ${roundStatus === "solved" ? COLORS.green : COLORS.amber}`,
                        paddingLeft: 18, marginBottom: 24,
                      }}
                    >
                      <div style={{ fontSize: 11, color: roundStatus === "solved" ? COLORS.green : COLORS.amber, letterSpacing: 2, marginBottom: 8 }}>
                        {roundStatus === "solved" ? "FIXED ✓" : "REVEALED"}
                      </div>
                      {roundStatus === "revealed" && (
                        <p style={{ fontSize: 13, color: COLORS.amber, marginBottom: 10, lineHeight: 1.5, fontStyle: "italic" }}>
                          Shown above: one working fix. Read it — you'll recognize the pattern next time.
                        </p>
                      )}
                      <p style={{ fontSize: 14, lineHeight: 1.6, color: "#dddddd", margin: "0 0 8px" }}>
                        <strong style={{ color: COLORS.white }}>{VULN_TYPES[round.vulnType].label}.</strong> {round.explanation}
                      </p>
                    </div>

                    <button
                      onClick={nextRound}
                      style={{
                        fontFamily: fontStack, fontSize: 14, fontWeight: 600, letterSpacing: 1.5,
                        color: COLORS.white, backgroundColor: COLORS.red, border: "none",
                        padding: "14px 28px", cursor: "pointer",
                        transition: "transform 150ms, box-shadow 150ms",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(230, 72, 51, 0.3)`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      {currentRound + 1 < totalRounds ? "NEXT SNIPPET →" : "SEE MY RESULT →"}
                    </button>
                  </div>
                )}
              </div>

              {/* SIDEBAR — checklist */}
              <div className="vc-checklist">
                <ChecklistPanel unlockedTypes={unlockedTypes} allUnlocked={unlockedTypes.size === 3} />
              </div>
            </div>
          </div>
        )}

        {/* RESULT */}
        {stage === "result" && (
          <div style={{ animation: "fadeIn 700ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; CHALLENGE COMPLETE</div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, marginBottom: 12 }}>FIXED WITHOUT REVEAL:</div>
            <h1 style={{ fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 8, letterSpacing: -2 }}>
              <span style={{ color: COLORS.red }}>{solvedCount}</span>
              <span style={{ color: COLORS.muted, fontSize: "0.55em", marginLeft: 8 }}>/ {totalRounds}</span>
            </h1>
            {revealedCount > 0 && (
              <div style={{ fontSize: 13, color: COLORS.amber, letterSpacing: 1, marginBottom: 24 }}>
                + {revealedCount} revealed
              </div>
            )}
            <p style={{ fontSize: 16, lineHeight: 1.55, color: "#cccccc", marginBottom: 32, maxWidth: 640 }}>
              {solvedCount === totalRounds && revealedCount === 0 && "Clean sweep — every fix from scratch. You'd catch and fix these in a real code review, AI-generated or not."}
              {solvedCount === totalRounds && revealedCount > 0 && "All fixed. A couple you peeked at, but the patterns are yours now."}
              {solvedCount >= totalRounds - 1 && solvedCount < totalRounds && "Sharp. One bug tripped you up — check the fix below and it'll stick."}
              {solvedCount >= totalRounds * 0.5 && solvedCount < totalRounds - 1 && "Solid. You've got the shapes — the ones you revealed are worth reading again."}
              {solvedCount < totalRounds * 0.5 && solvedCount > 0 && "Good start. The three fixes below are worth memorizing — try the challenge again in a week."}
              {solvedCount === 0 && "Read the three fixes below. Come back and try again — pattern recognition is exactly what this trains."}
            </p>

            {/* CHECKLIST — full result with any locked items auto-revealed */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 14 }}>&gt; THE THREE FIXES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Object.entries(VULN_TYPES).map(([id, v]) => {
                  const unlocked = unlockedTypes.has(id);
                  const solvedType = results.some((r) => r.vulnType === id && r.status === "solved");
                  return (
                    <div key={id} style={{
                      border: `1px solid ${solvedType ? COLORS.green : unlocked ? COLORS.amber : COLORS.border}`,
                      backgroundColor: solvedType ? "rgba(58,182,118,0.04)" : unlocked ? "rgba(232,161,42,0.04)" : "rgba(255,255,255,0.02)",
                      padding: 18,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: 4,
                          border: `1px solid ${solvedType ? COLORS.green : unlocked ? COLORS.amber : COLORS.muted}`,
                          backgroundColor: solvedType ? COLORS.green : unlocked ? COLORS.amber : "transparent",
                          color: solvedType || unlocked ? COLORS.black : COLORS.muted,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700, flexShrink: 0,
                        }}>
                          {solvedType ? "✓" : unlocked ? "!" : "?"}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.white }}>{v.label}</div>
                        {!solvedType && unlocked && <div style={{ fontSize: 10, color: COLORS.amber, letterSpacing: 1.5, marginLeft: "auto" }}>REVEALED</div>}
                      </div>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "#cccccc" }}>{v.fix}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* REWARD CTA */}
            <div style={{ border: `2px solid ${COLORS.red}`, backgroundColor: "rgba(230, 72, 51, 0.06)", padding: 28, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>CLAIM YOUR REWARD</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                One month of Decoded Security Premium — on the house.
              </div>
              <p style={{ fontSize: 14, color: "#cccccc", marginBottom: 18, lineHeight: 1.6 }}>
                Copy the line below, paste it into the article comments, and Decoded Security will DM you a promo code.
              </p>
              <div style={{
                padding: 14, backgroundColor: COLORS.codeBg,
                border: `1px solid ${COLORS.border}`, marginBottom: 14,
                fontSize: 13, color: COLORS.white, wordBreak: "break-word", lineHeight: 1.5,
              }}>
                {buildRewardLine()}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={copyRewardLine}
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
                <a
                  href={articleUrl}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => track("comments_cta_clicked", { tool: "vibe_coding_challenge", solved: solvedCount, revealed: revealedCount, total: totalRounds })}
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

            {/* NEWSLETTER */}
            <div style={{ border: `1px solid ${COLORS.border}`, padding: 28, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 12 }}>NEWSLETTER</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                Free weekly cybersecurity breakdowns.
              </div>
              <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 20, lineHeight: 1.5 }}>
                AI security, secure coding, exam prep — 1,450+ readers.
              </p>
              <a
                href={SUBSCRIBE_URL}
                target="_blank" rel="noopener noreferrer"
                onClick={() => track("subscribe_clicked", { tool: "vibe_coding_challenge" })}
                style={{
                  display: "inline-block", fontFamily: fontStack, fontSize: 14, fontWeight: 600,
                  letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
                  textDecoration: "none", padding: "14px 28px",
                }}
              >
                SUBSCRIBE →
              </a>
            </div>

            <button
              onClick={restart}
              style={{
                fontFamily: fontStack, fontSize: 12, color: COLORS.muted,
                backgroundColor: "transparent", border: "none",
                padding: "8px 0", cursor: "pointer", letterSpacing: 1.5,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; }}
            >
              ↻ RETRY THE CHALLENGE
            </button>
          </div>
        )}

        <footer style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // VIBE_CODING_v2</div>
          <div>REWRITE THE FIX</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0% { transform: translateX(0); } 20% { transform: translateX(-4px); } 40% { transform: translateX(4px); } 60% { transform: translateX(-2px); } 80% { transform: translateX(2px); } 100% { transform: translateX(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
        textarea:focus, input:focus { border-color: ${COLORS.red} !important; }

        .vc-layout { display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start; }
        .vc-main { flex: 1 1 400px; order: 1; min-width: 0; }
        .vc-checklist { flex: 0 0 280px; order: 2; position: sticky; top: 20px; }
        @media (max-width: 800px) {
          .vc-checklist { flex: 1 1 100%; order: 1; position: static; }
          .vc-main { flex: 1 1 100%; order: 2; }
        }
      `}</style>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sidebar checklist
// -----------------------------------------------------------------------------

function ChecklistPanel({ unlockedTypes, allUnlocked }) {
  const COLORS = {
    red: "#e64833", green: "#3ab676", white: "#FFFFFF",
    border: "#2a2a2a", muted: "#888888",
  };
  return (
    <div style={{ border: `1px solid ${allUnlocked ? COLORS.green : COLORS.border}`, backgroundColor: allUnlocked ? "rgba(58,182,118,0.05)" : "transparent", padding: 18 }}>
      <div style={{ fontSize: 11, color: allUnlocked ? COLORS.green : COLORS.red, letterSpacing: 3, marginBottom: 6 }}>
        &gt; WHAT YOU'VE LEARNED
      </div>
      <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1, marginBottom: 14 }}>
        {unlockedTypes.size} of 3 fixes unlocked
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {Object.entries(VULN_TYPES).map(([id, v]) => {
          const unlocked = unlockedTypes.has(id);
          return (
            <div key={id} style={{
              padding: 12,
              border: `1px solid ${unlocked ? COLORS.green : COLORS.border}`,
              backgroundColor: unlocked ? "rgba(58,182,118,0.06)" : "transparent",
              opacity: unlocked ? 1 : 0.55,
              transition: "all 300ms",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: unlocked ? 8 : 0 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 3,
                  border: `1px solid ${unlocked ? COLORS.green : COLORS.border}`,
                  backgroundColor: unlocked ? COLORS.green : "transparent",
                  color: unlocked ? "#000" : COLORS.muted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
                  {unlocked ? "✓" : ""}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: unlocked ? COLORS.white : "#aaa", letterSpacing: 0.5, textTransform: "uppercase" }}>
                  {v.short}
                </div>
              </div>
              {unlocked && (
                <div style={{ fontSize: 11, color: "#bbbbbb", lineHeight: 1.55, animation: "fadeIn 400ms ease-out", paddingLeft: 30 }}>
                  {v.fix}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {allUnlocked && (
        <div style={{
          marginTop: 12, padding: "8px 10px",
          border: `1px solid ${COLORS.green}`, backgroundColor: "rgba(58,182,118,0.1)",
          fontSize: 11, color: COLORS.green, letterSpacing: 1, textAlign: "center", fontWeight: 600,
        }}>
          ✓ ALL THREE FIXES UNLOCKED
        </div>
      )}
    </div>
  );
}
