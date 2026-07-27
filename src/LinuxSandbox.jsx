import { useState, useEffect, useRef, useCallback } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — LINUX SANDBOX
// In-browser sandbox for practicing the article's top 5 Linux commands.
// Fake filesystem in JS state, five guided challenges, localStorage persistence.
// Supported commands: ls, cd, cp, mv, rm, cat, pwd, clear, help
// =============================================================================

const COLORS = {
  red: "#e64833",
  green: "#3ab676",
  amber: "#e8a12a",
  blue: "#5aa9e6",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
  terminalBg: "#0a0a0a",
};

const BASE_URL = "https://www.decodedsecurity.com/p/";
const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";
const STORAGE_KEY = "decoded_linux_sandbox_v1";

const SOURCE_ARTICLE = {
  title: "Top 5 Linux Commands for an Entry-Level Cybersecurity Role",
  slug: "top-5-linux-command-for-an-entry",
};

// -----------------------------------------------------------------------------
// Initial filesystem — realistic enough that `cat` returns something meaningful
// -----------------------------------------------------------------------------

const INITIAL_FS = () => ({
  type: "dir",
  children: {
    home: {
      type: "dir",
      children: {
        user: {
          type: "dir",
          children: {
            "notes.txt": {
              type: "file",
              content: "Reminders:\n- Rotate the SSH key\n- Check the auth log for failed logins from last week\n- Update the firewall rules\n",
            },
            "suspicious.log": {
              type: "file",
              content: "[2026-11-24 03:14:22] SSH login attempt from 192.0.2.147 - FAILED\n[2026-11-24 03:14:23] SSH login attempt from 192.0.2.147 - FAILED\n[2026-11-24 03:14:24] SSH login attempt from 192.0.2.147 - FAILED\n[2026-11-24 03:14:25] SSH login attempt from 192.0.2.147 - SUCCESS\n[2026-11-24 03:14:31] Unusual outbound connection to 198.51.100.99:4444\n",
            },
            ".bashrc": {
              type: "file",
              content: "# .bashrc — Decoded Security sandbox\nexport PATH=$PATH:/usr/local/bin\nalias ll='ls -la'\nalias ..='cd ..'\n",
            },
          },
        },
      },
    },
    etc: {
      type: "dir",
      children: {
        ssh: {
          type: "dir",
          children: {
            sshd_config: {
              type: "file",
              content: "# /etc/ssh/sshd_config\n\nPort 22\nProtocol 2\nPermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nChallengeResponseAuthentication no\nUsePAM yes\nX11Forwarding no\n",
            },
          },
        },
        passwd: {
          type: "file",
          content: "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nuser:x:1000:1000:User:/home/user:/bin/bash\nsshd:x:104:65534::/run/sshd:/usr/sbin/nologin\n",
        },
      },
    },
    var: {
      type: "dir",
      children: {
        log: {
          type: "dir",
          children: {
            syslog: {
              type: "file",
              content: "Nov 24 09:11:03 host systemd[1]: Started Daily apt upgrade and clean activities.\nNov 24 09:11:12 host sshd[8412]: Accepted publickey for user from 203.0.113.42 port 51022 ssh2\nNov 24 09:12:41 host cron[2044]: (user) CMD (/home/user/bin/backup.sh)\n",
            },
            "auth.log": {
              type: "file",
              content: "Nov 24 03:14:22 host sshd[9081]: Failed password for root from 192.0.2.147 port 44210 ssh2\nNov 24 03:14:23 host sshd[9081]: Failed password for root from 192.0.2.147 port 44212 ssh2\nNov 24 03:14:24 host sshd[9081]: Failed password for root from 192.0.2.147 port 44214 ssh2\nNov 24 03:14:25 host sshd[9081]: Accepted password for root from 192.0.2.147 port 44216 ssh2\nNov 24 03:14:31 host sshd[9081]: pam_unix(sshd:session): session opened for user root\n",
            },
            analysis: {
              type: "dir",
              children: {},
            },
          },
        },
      },
    },
    tmp: {
      type: "dir",
      children: {
        "test_copy.log": {
          type: "file",
          content: "This is a test file created for practice.\nDelete it with rm -i test_copy.log to complete the challenge.\n",
        },
      },
    },
    root: { type: "dir", children: {} },
  },
});

const HOME = ["home", "user"];

// -----------------------------------------------------------------------------
// Path helpers
// -----------------------------------------------------------------------------

function pathToSegments(path, cwd) {
  if (!path) return cwd.slice();
  if (path === "~") return HOME.slice();
  if (path.startsWith("~/")) return [...HOME, ...path.slice(2).split("/").filter(Boolean)];
  if (path.startsWith("/")) return path.slice(1).split("/").filter(Boolean);
  return [...cwd, ...path.split("/").filter(Boolean)];
}

function resolveDots(segments) {
  const out = [];
  for (const s of segments) {
    if (s === "." || s === "") continue;
    if (s === "..") { out.pop(); continue; }
    out.push(s);
  }
  return out;
}

function resolve(path, cwd) {
  return resolveDots(pathToSegments(path, cwd));
}

function getNode(fs, segments) {
  let node = fs;
  for (const s of segments) {
    if (!node || node.type !== "dir") return null;
    node = node.children[s];
    if (!node) return null;
  }
  return node;
}

function nodeExists(fs, segments) {
  return getNode(fs, segments) !== null;
}

function displayPath(cwd) {
  if (arraysEqual(cwd, HOME)) return "~";
  if (cwd.length >= 2 && cwd[0] === "home" && cwd[1] === "user") {
    return "~/" + cwd.slice(2).join("/");
  }
  if (cwd.length === 0) return "/";
  return "/" + cwd.join("/");
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function cloneFs(fs) {
  return JSON.parse(JSON.stringify(fs));
}

// -----------------------------------------------------------------------------
// Command parser — handles combined flags like -la
// -----------------------------------------------------------------------------

function parseCommand(input) {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;
  const cmd = tokens[0];
  const args = [];
  const flags = new Set();
  for (const t of tokens.slice(1)) {
    if (/^-[a-zA-Z]+$/.test(t)) {
      for (const c of t.slice(1)) flags.add(c);
    } else {
      args.push(t);
    }
  }
  return { cmd, args, flags };
}

// -----------------------------------------------------------------------------
// ls formatting helpers
// -----------------------------------------------------------------------------

function formatSize(bytes, human) {
  if (!human) return String(bytes);
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

function nodeSize(node) {
  if (node.type === "file") return node.content.length;
  return 4096;
}

function longFormat(name, node, isHidden, humanReadable) {
  const type = node.type === "dir" ? "d" : "-";
  let perms;
  if (node.type === "dir") perms = "rwxr-xr-x";
  else if (isHidden) perms = "rw-------";
  else perms = "rw-r--r--";
  const links = node.type === "dir" ? 2 : 1;
  const owner = "user user";
  const size = formatSize(nodeSize(node), humanReadable);
  const date = "Nov 24 09:12";
  return `${type}${perms}  ${links} ${owner} ${size.padStart(6)} ${date} ${name}`;
}

// -----------------------------------------------------------------------------
// Command implementations
// -----------------------------------------------------------------------------

function execLs(state, args, flags) {
  const showAll = flags.has("a");
  const longMode = flags.has("l");
  const human = flags.has("h");
  const targetPath = args[0] || ".";
  const segments = resolve(targetPath, state.cwd);
  const node = getNode(state.fs, segments);
  if (!node) return { output: `ls: cannot access '${targetPath}': No such file or directory`, isError: true };
  if (node.type === "file") {
    if (longMode) return { output: longFormat(segments[segments.length - 1] || targetPath, node, false, human) };
    return { output: targetPath };
  }
  const names = Object.keys(node.children).sort();
  const visible = showAll ? names : names.filter((n) => !n.startsWith("."));
  if (longMode) {
    const lines = [];
    if (showAll) {
      lines.push(longFormat(".", node, false, human));
      lines.push(longFormat("..", { type: "dir", children: {} }, false, human));
    }
    for (const n of visible) lines.push(longFormat(n, node.children[n], n.startsWith("."), human));
    return { output: lines.join("\n") };
  }
  if (visible.length === 0) return { output: "" };
  return { output: visible.join("  ") };
}

function execCd(state, args) {
  let target = args[0];
  let newCwd;
  if (!target || target === "~") newCwd = HOME.slice();
  else if (target === "-") newCwd = state.prevCwd ? state.prevCwd.slice() : state.cwd.slice();
  else newCwd = resolve(target, state.cwd);
  const node = getNode(state.fs, newCwd);
  if (!node) return { output: `cd: no such file or directory: ${target}`, isError: true, stateUpdates: {} };
  if (node.type !== "dir") return { output: `cd: not a directory: ${target}`, isError: true, stateUpdates: {} };
  return { output: "", stateUpdates: { cwd: newCwd, prevCwd: state.cwd.slice() } };
}

function execPwd(state) {
  return { output: state.cwd.length === 0 ? "/" : "/" + state.cwd.join("/") };
}

function execCat(state, args, flags) {
  if (args.length === 0) return { output: "cat: missing file operand", isError: true };
  const lines = [];
  let hadError = false;
  for (const arg of args) {
    const segments = resolve(arg, state.cwd);
    const node = getNode(state.fs, segments);
    if (!node) { lines.push(`cat: ${arg}: No such file or directory`); hadError = true; continue; }
    if (node.type === "dir") { lines.push(`cat: ${arg}: Is a directory`); hadError = true; continue; }
    if (flags.has("n")) {
      const numbered = node.content.split("\n").map((line, i, arr) =>
        (i === arr.length - 1 && line === "") ? "" : `${String(i + 1).padStart(6)}\t${line}`
      ).join("\n");
      lines.push(numbered.replace(/\n$/, ""));
    } else {
      lines.push(node.content.replace(/\n$/, ""));
    }
  }
  return { output: lines.join("\n"), isError: hadError };
}

function execRm(state, args, flags) {
  if (args.length === 0) return { output: "rm: missing operand", isError: true, stateUpdates: {} };
  const recursive = flags.has("r") || flags.has("R");
  const newFs = cloneFs(state.fs);
  const messages = [];
  let anyError = false;
  for (const arg of args) {
    const segments = resolve(arg, state.cwd);
    if (segments.length === 0) { messages.push("rm: refusing to remove '/' (root)"); anyError = true; continue; }
    const parent = getNode(newFs, segments.slice(0, -1));
    const name = segments[segments.length - 1];
    if (!parent || parent.type !== "dir" || !parent.children[name]) {
      messages.push(`rm: cannot remove '${arg}': No such file or directory`);
      anyError = true;
      continue;
    }
    const node = parent.children[name];
    if (node.type === "dir" && !recursive) {
      messages.push(`rm: cannot remove '${arg}': Is a directory`);
      anyError = true;
      continue;
    }
    delete parent.children[name];
  }
  return { output: messages.join("\n"), isError: anyError, stateUpdates: { fs: newFs } };
}

function execCp(state, args, flags) {
  if (args.length < 2) return { output: "cp: missing file operand", isError: true, stateUpdates: {} };
  const recursive = flags.has("r") || flags.has("R");
  const srcArg = args[0];
  const dstArg = args[args.length - 1];
  const srcSegs = resolve(srcArg, state.cwd);
  const srcNode = getNode(state.fs, srcSegs);
  if (!srcNode) return { output: `cp: cannot stat '${srcArg}': No such file or directory`, isError: true, stateUpdates: {} };
  if (srcNode.type === "dir" && !recursive) {
    return { output: `cp: -r not specified; omitting directory '${srcArg}'`, isError: true, stateUpdates: {} };
  }
  const newFs = cloneFs(state.fs);
  const dstSegs = resolve(dstArg, state.cwd);
  const dstNode = getNode(newFs, dstSegs);
  let parent, name;
  if (dstNode && dstNode.type === "dir") {
    parent = dstNode;
    name = srcSegs[srcSegs.length - 1];
  } else {
    parent = getNode(newFs, dstSegs.slice(0, -1));
    name = dstSegs[dstSegs.length - 1];
    if (!parent || parent.type !== "dir") return { output: `cp: cannot create '${dstArg}': No such file or directory`, isError: true, stateUpdates: {} };
  }
  parent.children[name] = JSON.parse(JSON.stringify(srcNode));
  return { output: "", stateUpdates: { fs: newFs } };
}

function execMv(state, args) {
  if (args.length < 2) return { output: "mv: missing file operand", isError: true, stateUpdates: {} };
  const srcArg = args[0];
  const dstArg = args[args.length - 1];
  const srcSegs = resolve(srcArg, state.cwd);
  const srcNode = getNode(state.fs, srcSegs);
  if (!srcNode) return { output: `mv: cannot stat '${srcArg}': No such file or directory`, isError: true, stateUpdates: {} };
  const newFs = cloneFs(state.fs);
  const srcParent = getNode(newFs, srcSegs.slice(0, -1));
  const srcName = srcSegs[srcSegs.length - 1];
  const dstSegs = resolve(dstArg, state.cwd);
  const dstNode = getNode(newFs, dstSegs);
  let dstParent, dstName;
  if (dstNode && dstNode.type === "dir") {
    dstParent = dstNode;
    dstName = srcName;
  } else {
    dstParent = getNode(newFs, dstSegs.slice(0, -1));
    dstName = dstSegs[dstSegs.length - 1];
    if (!dstParent || dstParent.type !== "dir") return { output: `mv: cannot move '${srcArg}' to '${dstArg}': No such file or directory`, isError: true, stateUpdates: {} };
  }
  dstParent.children[dstName] = srcParent.children[srcName];
  delete srcParent.children[srcName];
  return { output: "", stateUpdates: { fs: newFs } };
}

function execHelp() {
  return {
    output: `Supported commands (the article's top 5 + a few utilities):

  ls [-l] [-a] [-h]      List files. -a shows hidden, -l is long format, -h is human-readable size.
  cd [path|..|~|-]       Change directory. No arg goes home. - goes to previous directory.
  cp [-r] src dst        Copy files. -r for directories.
  mv src dst             Move or rename.
  rm [-i] [-r] file      Delete. -i is safe (ask), -r is recursive.
  cat [-n] file          Display file contents. -n adds line numbers.
  pwd                    Print current directory.
  clear                  Clear the terminal.
  help                   This message.

Everything else responds with "command not found" — the article's whole point is that you don't need 1,000 commands.`,
  };
}

// -----------------------------------------------------------------------------
// Challenges
// -----------------------------------------------------------------------------

const CHALLENGES = [
  {
    id: "ls-hidden",
    command: "ls",
    title: "Show ALL files in your home directory",
    hint: "Files starting with '.' are hidden. Use the flag that includes them. Run it from your home directory (~).",
    check: (state) => {
      const last = state.lastCommand;
      return last && last.cmd === "ls" && last.flags.has("a") && arraysEqual(state.cwdAtLast, HOME);
    },
  },
  {
    id: "cd-varlog",
    command: "cd",
    title: "Navigate to the /var/log directory",
    hint: "cd takes an absolute path. Try /var/log directly.",
    check: (state) => arraysEqual(state.cwd, ["var", "log"]),
  },
  {
    id: "cat-sshd",
    command: "cat",
    title: "Read the SSH config at /etc/ssh/sshd_config",
    hint: "cat can take an absolute path, so you don't have to cd first.",
    check: (state) => state.commandHistory.some((c) => {
      if (c.cmd !== "cat") return false;
      for (const a of c.args) {
        const segs = resolve(a, c.cwdAtRun);
        if (arraysEqual(segs, ["etc", "ssh", "sshd_config"])) return true;
      }
      return false;
    }),
  },
  {
    id: "cp-backup",
    command: "cp",
    title: "Copy /etc/ssh/sshd_config to /tmp/ (make a backup)",
    hint: "cp <source> <destination>. If the destination is a directory, the file keeps its name.",
    check: (state) => nodeExists(state.fs, ["tmp", "sshd_config"]),
  },
  {
    id: "mv-suspicious",
    command: "mv",
    title: "Move suspicious.log from /home/user/ to /var/log/analysis/",
    hint: "mv works like cp but moves instead of copies. Use absolute paths, or cd first.",
    check: (state) =>
      !nodeExists(state.fs, ["home", "user", "suspicious.log"]) &&
      nodeExists(state.fs, ["var", "log", "analysis", "suspicious.log"]),
  },
  {
    id: "rm-safe",
    command: "rm",
    title: "Delete /tmp/test_copy.log using the flag that asks for confirmation",
    hint: "The -i flag makes rm 'interactive' — safer for beginners. Combine it with the file path.",
    check: (state) =>
      !nodeExists(state.fs, ["tmp", "test_copy.log"]) &&
      state.commandHistory.some((c) => {
        if (c.cmd !== "rm" || !c.flags.has("i")) return false;
        for (const a of c.args) {
          const segs = resolve(a, c.cwdAtRun);
          if (arraysEqual(segs, ["tmp", "test_copy.log"])) return true;
        }
        return false;
      }),
  },
];

// -----------------------------------------------------------------------------
// Persistence
// -----------------------------------------------------------------------------

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      fs: state.fs, cwd: state.cwd, prevCwd: state.prevCwd,
      commandHistory: state.commandHistory,
      completed: [...state.completed],
    }));
  } catch (e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      fs: parsed.fs || INITIAL_FS(),
      cwd: parsed.cwd || HOME.slice(),
      prevCwd: parsed.prevCwd || null,
      commandHistory: parsed.commandHistory || [],
      completed: new Set(parsed.completed || []),
    };
  } catch (e) {
    return null;
  }
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function LinuxSandbox() {
  const loaded = typeof window !== "undefined" ? loadState() : null;

  const [fs, setFs] = useState(loaded?.fs || INITIAL_FS());
  const [cwd, setCwd] = useState(loaded?.cwd || HOME.slice());
  const [prevCwd, setPrevCwd] = useState(loaded?.prevCwd || null);
  const [history, setHistory] = useState([
    {
      output: "Welcome to the Decoded Security Linux Sandbox. Type 'help' for available commands.\nWork through the challenges above using ls, cd, cp, mv, rm, cat.\n",
      isError: false,
      isSystem: true,
    },
  ]);
  const [commandHistory, setCommandHistory] = useState(loaded?.commandHistory || []);
  const [completed, setCompleted] = useState(loaded?.completed || new Set());
  const [input, setInput] = useState("");
  const [logIndex, setLogIndex] = useState(-1);
  const [expandedHints, setExpandedHints] = useState(new Set());

  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const articleUrl = `${BASE_URL}${SOURCE_ARTICLE.slug}`;

  const focusInput = () => { if (inputRef.current) inputRef.current.focus(); };

  const execute = useCallback((raw) => {
    const parsed = parseCommand(raw);
    const promptStr = `user@decoded-security:${displayPath(cwd)}$ ${raw}`;
    if (!parsed) {
      setHistory((h) => [...h, { prompt: promptStr, output: "", isError: false }]);
      return;
    }
    track("linux_sandbox_command", { cmd: parsed.cmd });

    const state = { fs, cwd, prevCwd };
    let result = { output: "", isError: false, stateUpdates: {} };

    switch (parsed.cmd) {
      case "ls":    result = execLs(state, parsed.args, parsed.flags); break;
      case "cd":    result = execCd(state, parsed.args); break;
      case "pwd":   result = execPwd(state); break;
      case "cat":   result = execCat(state, parsed.args, parsed.flags); break;
      case "cp":    result = execCp(state, parsed.args, parsed.flags); break;
      case "mv":    result = execMv(state, parsed.args); break;
      case "rm":    result = execRm(state, parsed.args, parsed.flags); break;
      case "help":  result = execHelp(); break;
      case "clear":
        setHistory([]);
        setInput("");
        setCommandHistory((ch) => [...ch, { ...parsed, cwdAtRun: cwd.slice() }]);
        return;
      default:
        result = { output: `bash: ${parsed.cmd}: command not found`, isError: true };
    }

    const updates = result.stateUpdates || {};
    const newFs = updates.fs !== undefined ? updates.fs : fs;
    const newCwd = updates.cwd !== undefined ? updates.cwd : cwd;
    const newPrevCwd = updates.prevCwd !== undefined ? updates.prevCwd : prevCwd;
    const cmdEntry = { ...parsed, cwdAtRun: cwd.slice() };
    const newCommandHistory = [...commandHistory, cmdEntry];

    // Check challenges
    const snapshot = {
      fs: newFs, cwd: newCwd,
      lastCommand: parsed, cwdAtLast: cwd.slice(),
      commandHistory: newCommandHistory,
    };
    let newCompleted = completed;
    let newlyCompleted = [];
    for (const ch of CHALLENGES) {
      if (!newCompleted.has(ch.id) && ch.check(snapshot)) {
        if (newCompleted === completed) newCompleted = new Set(completed);
        newCompleted.add(ch.id);
        newlyCompleted.push(ch);
      }
    }

    setFs(newFs);
    setCwd(newCwd);
    setPrevCwd(newPrevCwd);
    setCommandHistory(newCommandHistory);
    setCompleted(newCompleted);
    setLogIndex(-1);

    setHistory((h) => {
      const next = [...h, { prompt: promptStr, output: result.output, isError: !!result.isError }];
      for (const ch of newlyCompleted) {
        next.push({ output: `✓ Challenge complete: ${ch.title}`, isChallenge: true });
        track("linux_sandbox_challenge_complete", { id: ch.id });
      }
      if (newlyCompleted.length > 0 && newCompleted.size === CHALLENGES.length) {
        next.push({ output: `\n🎉 All ${CHALLENGES.length} challenges complete. You've now used every one of the article's top 5 commands.`, isChallenge: true });
        track("linux_sandbox_all_complete");
      }
      return next;
    });

    saveState({ fs: newFs, cwd: newCwd, prevCwd: newPrevCwd, commandHistory: newCommandHistory, completed: newCompleted });
    setInput("");
  }, [fs, cwd, prevCwd, commandHistory, completed]);

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      execute(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const cmds = commandHistory.map((c) => reassembleCommand(c));
      if (cmds.length === 0) return;
      const next = logIndex < 0 ? cmds.length - 1 : Math.max(0, logIndex - 1);
      setLogIndex(next);
      setInput(cmds[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const cmds = commandHistory.map((c) => reassembleCommand(c));
      if (cmds.length === 0 || logIndex < 0) return;
      const next = logIndex + 1;
      if (next >= cmds.length) { setLogIndex(-1); setInput(""); }
      else { setLogIndex(next); setInput(cmds[next]); }
    }
  };

  const resetFilesystem = () => {
    if (!confirm("Reset the filesystem to its starting state? Your challenge progress will be kept.")) return;
    track("linux_sandbox_reset_fs");
    const initial = INITIAL_FS();
    setFs(initial);
    setCwd(HOME.slice());
    setPrevCwd(null);
    setHistory((h) => [...h, { output: "Filesystem reset to initial state.", isSystem: true }]);
    saveState({ fs: initial, cwd: HOME.slice(), prevCwd: null, commandHistory, completed });
    focusInput();
  };

  const resetChallenges = () => {
    if (!confirm("Reset your challenge progress? Filesystem will also reset.")) return;
    track("linux_sandbox_reset_all");
    const initial = INITIAL_FS();
    setFs(initial);
    setCwd(HOME.slice());
    setPrevCwd(null);
    setCommandHistory([]);
    setCompleted(new Set());
    setExpandedHints(new Set());
    setHistory([{ output: "Everything reset. All challenges available again.", isSystem: true }]);
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    focusInput();
  };

  const toggleHint = (id) => {
    setExpandedHints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else { next.add(id); track("linux_sandbox_hint_shown", { id }); }
      return next;
    });
  };

  const progress = completed.size;
  const total = CHALLENGES.length;
  const allDone = progress === total;

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
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>&gt; LINUX SANDBOX</div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
            Practice the <span style={{ color: COLORS.red }}>top 5</span> Linux commands.
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", maxWidth: 640 }}>
            A real (fake) filesystem in your browser. Work through six challenges using <code style={{ color: COLORS.white }}>ls</code>, <code style={{ color: COLORS.white }}>cd</code>, <code style={{ color: COLORS.white }}>cp</code>, <code style={{ color: COLORS.white }}>mv</code>, <code style={{ color: COLORS.white }}>rm</code>, and <code style={{ color: COLORS.white }}>cat</code>. Nothing on your machine gets touched. <code style={{ color: COLORS.white }}>rm -rf</code> is safe here.
          </p>
        </div>

        <a
          href={articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("source_article_clicked", { tool: "linux_sandbox" })}
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

        {/* CHALLENGES PANEL */}
        <div style={{ border: `1px solid ${allDone ? COLORS.green : COLORS.border}`, padding: 20, marginBottom: 20, backgroundColor: allDone ? "rgba(58,182,118,0.06)" : "transparent" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 11, color: allDone ? COLORS.green : COLORS.red, letterSpacing: 3 }}>
              &gt; CHALLENGES · {progress} / {total} {allDone && "· COMPLETE"}
            </div>
            <button
              onClick={resetChallenges}
              style={{
                fontFamily: fontStack, fontSize: 10, letterSpacing: 1.2, color: COLORS.muted,
                backgroundColor: "transparent", border: `1px solid ${COLORS.border}`,
                padding: "6px 12px", cursor: "pointer", transition: "all 150ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.color = COLORS.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.muted; }}
            >
              RESET ALL
            </button>
          </div>
          <div style={{ height: 4, backgroundColor: COLORS.border, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(progress / total) * 100}%`, backgroundColor: allDone ? COLORS.green : COLORS.red, transition: "width 400ms ease-out" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CHALLENGES.map((ch, i) => {
              const isDone = completed.has(ch.id);
              const isHintOpen = expandedHints.has(ch.id);
              return (
                <div key={ch.id} style={{ padding: "10px 12px", border: `1px solid ${isDone ? COLORS.green : COLORS.border}`, backgroundColor: isDone ? "rgba(58,182,118,0.04)" : "transparent" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 4,
                      border: `1px solid ${isDone ? COLORS.green : COLORS.border}`,
                      backgroundColor: isDone ? COLORS.green : "transparent",
                      color: isDone ? COLORS.black : COLORS.muted,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, lineHeight: 1.45, color: isDone ? "#dddddd" : COLORS.white, textDecoration: isDone ? "line-through" : "none" }}>
                        <span style={{ color: COLORS.red, fontFamily: fontStack, marginRight: 8 }}>[{ch.command}]</span>
                        {ch.title}
                      </div>
                      {!isDone && (
                        <button
                          onClick={() => toggleHint(ch.id)}
                          style={{
                            marginTop: 6, fontFamily: fontStack, fontSize: 10, letterSpacing: 1,
                            color: COLORS.muted, backgroundColor: "transparent", border: "none",
                            padding: 0, cursor: "pointer", textDecoration: "underline",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; }}
                        >
                          {isHintOpen ? "HIDE HINT" : "SHOW HINT"}
                        </button>
                      )}
                      {!isDone && isHintOpen && (
                        <div style={{ marginTop: 8, fontSize: 12, color: COLORS.muted, lineHeight: 1.5, borderLeft: `1px solid ${COLORS.border}`, paddingLeft: 10 }}>
                          {ch.hint}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TERMINAL */}
        <div
          onClick={focusInput}
          style={{
            border: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.terminalBg,
            fontFamily: fontStack,
            fontSize: 13,
            padding: 0,
            marginBottom: 16,
            cursor: "text",
          }}
        >
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: COLORS.muted, letterSpacing: 1.5 }}>
            <div>TERMINAL · sandbox</div>
            <button
              onClick={(e) => { e.stopPropagation(); resetFilesystem(); }}
              style={{
                fontFamily: fontStack, fontSize: 10, letterSpacing: 1.2, color: COLORS.muted,
                backgroundColor: "transparent", border: `1px solid ${COLORS.border}`,
                padding: "4px 10px", cursor: "pointer", transition: "all 150ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.color = COLORS.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.muted; }}
            >
              RESET FILESYSTEM
            </button>
          </div>
          <div ref={scrollRef} style={{ maxHeight: 420, overflowY: "auto", padding: "12px 16px" }}>
            {history.map((entry, i) => (
              <div key={i} style={{ marginBottom: entry.isSystem || entry.isChallenge ? 12 : 4 }}>
                {entry.prompt && (
                  <div style={{ lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                    <Prompt line={entry.prompt} />
                  </div>
                )}
                {entry.output && (
                  <pre style={{
                    margin: 0, fontFamily: fontStack, fontSize: 13, lineHeight: 1.5,
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                    color: entry.isError ? COLORS.red : entry.isSystem ? COLORS.muted : entry.isChallenge ? COLORS.green : "#dddddd",
                  }}>
                    {entry.output}
                  </pre>
                )}
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span>
                <span style={{ color: COLORS.green }}>user@decoded-security</span>
                <span style={{ color: COLORS.muted }}>:</span>
                <span style={{ color: COLORS.blue }}>{displayPath(cwd)}</span>
                <span style={{ color: COLORS.red }}>$</span>
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                style={{
                  flex: 1, fontFamily: fontStack, fontSize: 13,
                  color: COLORS.white, backgroundColor: "transparent",
                  border: "none", outline: "none", padding: 0,
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 32, lineHeight: 1.55 }}>
          Tip: use <kbd style={kbdStyle}>↑</kbd> and <kbd style={kbdStyle}>↓</kbd> to cycle through past commands. Type <code style={{ color: COLORS.white }}>help</code> for the full command reference.
        </div>

        {/* COMMENTS CTA */}
        <div style={{ border: `1px solid ${COLORS.red}`, backgroundColor: "rgba(230, 72, 51, 0.04)", padding: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 12 }}>THE CHALLENGE</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
            Post which challenge tripped you up in the article comments.
          </div>
          <p style={{ fontSize: 14, color: "#cccccc", marginBottom: 20, lineHeight: 1.55 }}>
            Which of the six felt hardest — the flag combinations, the paths, the mv vs cp distinction? Decoded Security reads every comment and will point you at the next thing to try.
          </p>
          <a
            href={articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("comments_cta_clicked", { tool: "linux_sandbox", progress, total })}
            style={{
              display: "inline-block", fontFamily: fontStack, fontSize: 14, fontWeight: 600,
              letterSpacing: 1.5, color: COLORS.white, backgroundColor: COLORS.red,
              textDecoration: "none", padding: "14px 28px",
            }}
          >
            OPEN THE ARTICLE →
          </a>
        </div>

        <div style={{ border: `1px solid ${COLORS.border}`, padding: 28, marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 12 }}>NEWSLETTER</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
            One practical breakdown every week.
          </div>
          <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 20, lineHeight: 1.5 }}>
            Linux, networking, protocols, and the concepts most beginners spend months on for no reason. 1,420+ readers.
          </p>
          <a
            href={SUBSCRIBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("subscribe_clicked", { tool: "linux_sandbox" })}
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
          <div>DECODED_SECURITY // LINUX_SANDBOX_v1</div>
          <div>NO REAL FILESYSTEM WAS HARMED</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible, input:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}

const kbdStyle = {
  display: "inline-block",
  fontFamily: "inherit",
  fontSize: 10,
  padding: "1px 6px",
  border: "1px solid #2a2a2a",
  borderRadius: 3,
  color: "#dddddd",
  backgroundColor: "rgba(255,255,255,0.02)",
};

// Reassemble a stored parsed command back into a shell string for arrow-key nav
function reassembleCommand(c) {
  const parts = [c.cmd];
  const flags = [...c.flags];
  if (flags.length > 0) parts.push("-" + flags.join(""));
  for (const a of c.args) parts.push(a);
  return parts.join(" ");
}

// Prompt renderer — parses "user@decoded-security:PATH$ COMMAND" for coloring
function Prompt({ line }) {
  const m = line.match(/^(user@decoded-security):([^$]+)\$ ?(.*)$/);
  if (!m) return <span>{line}</span>;
  return (
    <span>
      <span style={{ color: "#3ab676" }}>{m[1]}</span>
      <span style={{ color: "#888" }}>:</span>
      <span style={{ color: "#5aa9e6" }}>{m[2]}</span>
      <span style={{ color: "#e64833" }}>$</span>
      <span style={{ color: "#ffffff" }}> {m[3]}</span>
    </span>
  );
}
