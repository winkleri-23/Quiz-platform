// =============================================================================
// CISSP domain metadata + article-quiz mapping.
// Single source of truth for the CISSP category and per-domain topic pages.
//
// To wire a new article quiz to a domain: add an entry to that domain's
// `articles` array. To flip a domain's mixed quiz to live: set `mixed: true`
// (and ensure the route in App.jsx maps to a real component).
// =============================================================================

export const CISSP_DOMAINS = [
  {
    n: 1,
    title: "Security and Risk Management",
    short: "CIA Triad, risk treatment, governance, control types, legal frameworks",
    mixed: true,
    articles: [],
  },
  {
    n: 2,
    title: "Asset Security",
    short: "Data classification, states, ownership, lifecycle, protection",
    mixed: false,
    articles: [
      {
        title: "The Three States of Data",
        blurb: "Data at rest, in transit, in use — and the controls that protect each.",
        route: "/article/three-states-of-data",
        certs: "CC · CISSP D2 · Security+",
        questions: 8,
      },
    ],
  },
  {
    n: 3,
    title: "Security Architecture and Engineering",
    short: "Secure design, cryptography, physical security",
    mixed: false,
    articles: [],
  },
  {
    n: 4,
    title: "Communication and Network Security",
    short: "Protocols, network design, wireless security",
    mixed: false,
    articles: [
      {
        title: "Wi-Fi Security for CISSP",
        blurb: "WEP · WPA · WPA2 · WPA3 · PSK · SAE · 802.1X — every wireless scenario the exam will throw at you.",
        route: "/article/wifi-security",
        certs: "CISSP D4",
        questions: 10,
      },
      {
        title: "Top 5 Network Attacks",
        blurb: "SYN Flood, Smurf, Ping of Death, Teardrop, Land — scenario-based questions that mirror how these show up on the exam.",
        route: "/article/network-attacks",
        certs: "CC · CISSP D4 · Security+",
        questions: 10,
      },
    ],
  },
  {
    n: 5,
    title: "Identity and Access Management",
    short: "Authentication, authorization, federation, IAM lifecycle",
    mixed: false,
    articles: [],
  },
  {
    n: 6,
    title: "Security Assessment and Testing",
    short: "Vulnerability assessments, penetration tests, audits, KPIs",
    mixed: false,
    articles: [],
  },
  {
    n: 7,
    title: "Security Operations",
    short: "BC/DR, incident response, recovery metrics, forensics",
    mixed: false,
    articles: [
      {
        title: "Recovery Metrics: RTO, RPO, MTD, WRT",
        blurb: "The backup metrics that separate beginners from professionals. Math traps the exam loves.",
        route: "/article/recovery-metrics",
        certs: "CC · CISSP D7 · Security+",
        questions: 10,
      },
    ],
  },
  {
    n: 8,
    title: "Software Development Security",
    short: "Secure SDLC, code security, APIs, vulnerabilities",
    mixed: false,
    articles: [],
  },
];

// A domain is live if it has anything to show
export const isDomainLive = (d) => d.mixed || d.articles.length > 0;

// Fetch a domain by number (1-based)
export const getDomain = (n) => CISSP_DOMAINS.find((d) => d.n === n);
