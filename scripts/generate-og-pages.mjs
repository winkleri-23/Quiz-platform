// =============================================================================
// Post-build: generate per-route static HTML files with route-specific OG meta.
// Runs after `vite build`. Reads dist/index.html as the template, writes
// dist/<route>/index.html with the OG image/title/description swapped out.
// Vercel serves these static files first, so social crawlers see the right
// meta when they scrape /path, /direction, /cissp/domain-1, etc.
// =============================================================================

import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve("dist");
const BASE = fs.readFileSync(path.join(DIST, "index.html"), "utf-8");

const ROUTES = [
  {
    path: "path",
    title: "Find Your Study Path | Decoded Security",
    description: "A 60-second diagnostic that tells you exactly where to focus your cybersecurity study, with a personalized reading list.",
    image: "/og-study-path.png",
    imageAlt: "Decoded Security study path quiz — find where you are, then where to focus.",
  },
  {
    path: "direction",
    title: "Find Your Cybersecurity Direction | Decoded Security",
    description: "Find which of the five cybersecurity career lanes fits you — offensive, SOC, builder, GRC, or leadership. 60-second diagnostic.",
    image: "/og-direction.png",
    imageAlt: "Decoded Security direction quiz — which cybersecurity lane fits you.",
  },
  {
    path: "cissp/domain-1",
    title: "CISSP Domain 1: Security and Risk Management | Decoded Security",
    description: "Domain 1 topic page — mixed quiz plus article quizzes on risk, controls, laws, and governance. Instant feedback, article links, free.",
    image: "/og-cissp-d1.png",
    imageAlt: "CISSP Domain 1 — Security and Risk Management.",
  },
  {
    path: "cissp/domain-1/mixed",
    title: "CISSP Domain 1 Mixed Quiz | Decoded Security",
    description: "Test your CISSP Domain 1 knowledge across all topics. 8 questions, instant feedback, article links for everything you miss.",
    image: "/og-cissp-d1.png",
    imageAlt: "CISSP Domain 1 mixed knowledge quiz.",
  },
  {
    path: "article/three-states-of-data",
    title: "The Three States of Data — Quiz | Decoded Security",
    description: "Test your understanding of data at rest, in transit, and in use. Maps to CC, CISSP Domain 2, and Security+. 8 questions, instant feedback.",
    image: "/og-three-states.png",
    imageAlt: "Quiz: The Three States of Data — at rest, in transit, in use.",
  },
  {
    path: "article/recovery-metrics",
    title: "Recovery Metrics Quiz: RTO, RPO, MTD, WRT | Decoded Security",
    description: "Test your understanding of the backup metrics that separate beginners from professionals. Maps to CC, CISSP Domain 7, and Security+. 10 questions, instant feedback.",
    image: "/og-recovery-metrics.png",
    imageAlt: "Quiz: RTO, RPO, MTD, WRT — the recovery metrics that drive every backup decision.",
  },
  {
    path: "article/wifi-security",
    title: "Wi-Fi Security Quiz for CISSP | Decoded Security",
    description: "Test your CISSP Domain 4 knowledge of Wi-Fi security. WEP, WPA, WPA2, WPA3, PSK, SAE, 802.1X. 10 questions with detailed scenario explanations.",
    image: "/og-wifi-security.png",
    imageAlt: "Quiz: Wi-Fi security for the CISSP — WEP, WPA, WPA2, WPA3, PSK, SAE, 802.1X.",
  },
  {
    path: "article/network-attacks",
    title: "Top 5 Network Attacks — Scenario Quiz | Decoded Security",
    description: "Scenario-based quiz on SYN Flood, Smurf, Ping of Death, Teardrop, and Land attacks. 10 exam-style questions. Maps to CC, CISSP Domain 4, and Security+.",
    image: "/og-network-attacks.png",
    imageAlt: "Quiz: Top 5 network attacks — SYN Flood, Smurf, Ping of Death, Teardrop, Land.",
  },
  {
    path: "article/backup-strategies",
    title: "Backup Strategies Quiz for CISSP | Decoded Security",
    description: "Test your knowledge of backup strategies — full, incremental, differential, electronic vaulting, remote journaling, remote mirroring, and the 3-2-1 rule. Maps to CC, CISSP Domain 7, and Security+.",
    image: "/og-backup-strategies.png",
    imageAlt: "Quiz: Backup strategies for CISSP — full, incremental, differential, and the 3-2-1 rule.",
  },
  {
    path: "article/containers-vs-vms",
    title: "Containers vs Virtual Machines — CISSP Quiz | Decoded Security",
    description: "Test your virtualization knowledge — VM vs container architecture, hypervisor types, isolation vs efficiency, and when to pick each. Maps to CC, CISSP Domain 3, and Security+.",
    image: "/og-containers-vs-vms.png",
    imageAlt: "Quiz: Containers vs Virtual Machines for CISSP.",
  },
  {
    path: "article/email-authentication",
    title: "SPF, DKIM, DMARC — Email Authentication Quiz | Decoded Security",
    description: "Test your knowledge of email authentication. Why spoofing is possible, what each mechanism actually verifies, and why only DMARC alignment stops it. Includes a live domain-checker.",
    image: "/og-email-auth.png",
    imageAlt: "Quiz: SPF, DKIM, DMARC — email authentication for CISSP Domain 4.",
  },
  {
    path: "tools",
    title: "Tools & Calculators | Decoded Security",
    description: "Interactive calculators tied to Decoded Security articles. Type in your values, get the answer, understand why. First tool: subnet calculator.",
    image: "/og-tools.png",
    imageAlt: "Decoded Security tools and calculators.",
  },
  {
    path: "tools/subnet-calculator",
    title: "Subnet Calculator | Decoded Security",
    description: "Type any IP and CIDR. Get the subnet mask, network, broadcast, first and last host — plus a binary view that shows exactly where the network / host boundary sits. Based on \"This Is How I Explain Subnetting.\"",
    image: "/og-subnet-calculator.png",
    imageAlt: "Subnet Calculator — IP, CIDR, network, broadcast, host range, binary view.",
  },
  {
    path: "tools/spoof-check",
    title: "Domain Spoof-Check — Can This Domain Be Spoofed? | Decoded Security",
    description: "Type any domain. Live DNS lookup returns an A-F grade based on SPF and DMARC — telling you whether an attacker could forge the visible sender. Fully client-side.",
    image: "/og-spoof-check.png",
    imageAlt: "Domain Spoof-Check — grade any domain's email security A through F.",
  },
  {
    path: "tools/linux-sandbox",
    title: "Linux Sandbox — Practice ls, cd, cp, mv, rm, cat | Decoded Security",
    description: "A real (fake) filesystem in your browser. Six guided challenges to practice the top 5 Linux commands. Nothing on your machine gets touched.",
    image: "/og-linux-sandbox.png",
    imageAlt: "Linux Sandbox — practice ls, cd, cp, mv, rm, cat with six guided challenges.",
  },
  {
    path: "tools/risk-calculator",
    title: "Quantitative Risk Calculator | Decoded Security",
    description: "Turn cybersecurity risk into dollars. Compute SLE, ARO, and ALE. See instantly whether a safeguard pays for itself. CISSP Domain 1 math, in plain English.",
    image: "/og-risk-calculator.png",
    imageAlt: "Quantitative Risk Calculator — SLE, ARO, ALE, cost-benefit verdict.",
  },
  {
    path: "tools/url-trace",
    title: "URL Trace — What Happens When You Open a Website | Decoded Security",
    description: "Type a URL. Walk through the six-stage chain — URL parse, DNS, TCP, TLS, HTTP, rendering — with real DNS resolution and plain-English explanations at each step.",
    image: "/og-url-trace.png",
    imageAlt: "URL Trace — six-stage animated walkthrough of what happens when you open a website.",
  },
  {
    path: "tools/pki-sandbox",
    title: "PKI Sandbox — Impersonate a Bank, Then Be One | Decoded Security",
    description: "Three-act interactive: play the attacker trying to impersonate a bank, then the real bank getting a legit certificate, then the browser deciding who to trust. Real keys generated in your browser.",
    image: "/og-pki-sandbox.png",
    imageAlt: "PKI Sandbox — three roles, one lesson: trust is what makes the internet work.",
  },
  {
    path: "tools/vibe-coding-challenge",
    title: "Vibe Coding Challenge — Fix the AI's Security Bugs | Decoded Security",
    description: "Six broken AI-written code snippets, one vulnerability each. Rewrite the bad line to fix it. Instant feedback, hints when you're stuck. Complete the challenge and claim a free month of Decoded Security Premium.",
    image: "/og-vibe-coding.png",
    imageAlt: "Vibe Coding Challenge — rewrite the bad line in AI-generated code to fix it.",
  },
];

const swap = (html, attr, value, contentVal) =>
  html.replace(
    new RegExp(`<meta ${attr}="${value}" content="[^"]*"`, "g"),
    `<meta ${attr}="${value}" content="${contentVal}"`,
  );

const swapTitle = (html, newTitle) => html.replace(/<title>[^<]*<\/title>/, `<title>${newTitle}</title>`);

for (const route of ROUTES) {
  let html = BASE;
  html = swapTitle(html, route.title);
  html = swap(html, "name", "title", route.title);
  html = swap(html, "name", "description", route.description);
  html = swap(html, "property", "og:title", route.title);
  html = swap(html, "property", "og:description", route.description);
  html = swap(html, "property", "og:image", route.image);
  html = swap(html, "property", "og:image:alt", route.imageAlt);
  html = swap(html, "property", "twitter:title", route.title);
  html = swap(html, "property", "twitter:description", route.description);
  html = swap(html, "property", "twitter:image", route.image);

  const outDir = path.join(DIST, route.path);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
  console.log(`  ✓ ${route.path}/index.html  →  OG: ${route.image}`);
}

console.log(`Generated ${ROUTES.length} per-route static HTML pages with custom OG meta.`);
