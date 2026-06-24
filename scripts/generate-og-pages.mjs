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
    title: "CISSP Domain 1 Quiz: Security and Risk Management | Decoded Security",
    description: "Test your CISSP Domain 1 knowledge. 8 questions, instant feedback, article links for everything you miss.",
    image: "/og-cissp-d1.png",
    imageAlt: "CISSP Domain 1 knowledge quiz — Security and Risk Management.",
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
