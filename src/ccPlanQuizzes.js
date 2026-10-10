// =============================================================================
// DECODED SECURITY: 30-DAY CC FIRST-TRY PASS PLAN, QUIZ BANK
// Buyer-only quizzes, reached only through links inside the paid plan.
// Routes: /cc/<PLAN_TOKEN>/<quiz id>, never linked from any page, noindex.
// All questions are original (ISC2 exam content is under NDA).
// =============================================================================

import { GENERATED_QUIZZES } from "./ccPlanQuizBank.js";

export const PLAN_TOKEN = "03mxwkm7";

// Invite link to the CC study channel. Leave null until it exists:
// the pages then point people to the invite in their welcome email.
export const DISCORD_URL = "https://discord.gg/H4qhSTqd9p";

const A = (title, slug) => ({ title, slug });

const WEEK1_QUIZZES = {
  // --------------------------------------------------------------- DAY 2
  "day-2": {
    day: 2,
    title: "Day 2 quiz: CIA, non-repudiation and privacy",
    domain: 1,
    mode: "practice",
    next: "Tomorrow: Day 3, authentication, authorization and accounting.",
    questions: [
      {
        q: "A hospital employee looks up a celebrity patient's record out of curiosity. Nothing is changed or deleted. Which principle is violated?",
        options: ["Integrity", "Availability", "Confidentiality", "Non-repudiation"],
        correct: 2,
        explanation: "Someone without a need to see the record saw it. Nothing was altered (integrity) and nobody lost access (availability).",
        article: A("The 8 Security Principles Every CISSP Candidate Thinks They Understand", "the-8-security-principles-every-cissp"),
      },
      {
        q: "Which control MOST directly supports integrity?",
        options: ["Encrypting a laptop's disk", "Comparing a file's hash before and after transfer", "Adding a second internet connection", "Locking the server room"],
        correct: 1,
        explanation: "Matching hashes prove the file wasn't changed. Disk encryption protects confidentiality, a second connection supports availability, and a locked room is a physical control.",
        article: A("Hashing: Why It's Not the Same as Encryption", "hashing-what-it-is-and-why-its-not"),
      },
      {
        q: "A DDoS attack makes an online shop unreachable for six hours. No data is stolen or changed. Which principle is affected?",
        options: ["Availability", "Confidentiality", "Integrity", "Privacy"],
        correct: 0,
        explanation: "Customers couldn't reach the service. That's availability. The question rules out confidentiality and integrity by saying nothing was stolen or changed.",
        article: A("The 8 Security Principles Every CISSP Candidate Thinks They Understand", "the-8-security-principles-every-cissp"),
      },
      {
        q: "A company emails a signed contract to a supplier. What gives the company non-repudiation?",
        options: ["Sending the email over TLS", "Signing the contract with the sender's private key", "Compressing the file before sending", "Saving a copy in a shared folder"],
        correct: 1,
        explanation: "Only the sender holds their private key, so a valid signature proves who sent it. TLS protects the connection, not proof of origin, and a shared copy proves nothing about who sent it.",
        article: A("Symmetric vs Asymmetric Encryption", "symmetric-vs-asymmetric-encryption"),
      },
      {
        q: "A company collects every customer's date of birth \"just in case\", although no service needs it. The data is encrypted and access-controlled. Which concern does this MOST raise?",
        options: ["Availability", "Integrity", "Privacy", "Non-repudiation"],
        correct: 2,
        explanation: "Collecting more personal data than you need breaks data minimization, a core privacy principle. Encryption keeps it confidential, but it doesn't make collecting it acceptable.",
        article: A("GDPR Explained", "gdpr-explained-the-privacy-law-that"),
      },
    ],
  },

  // --------------------------------------------------------------- DAY 3
  "day-3": {
    day: 3,
    title: "Day 3 quiz: authentication, authorization and accounting",
    domain: 1,
    mode: "practice",
    next: "Tomorrow: Day 4, risk management.",
    questions: [
      {
        q: "Which pair is true multi-factor authentication?",
        options: ["A password and a PIN", "A smart card and a PIN", "A fingerprint and a retina scan", "Two different passwords"],
        correct: 1,
        explanation: "A smart card is something you have and a PIN is something you know: two different factor types. The other pairs repeat the same type.",
        article: A("Methods of Authentication", "cybersecurity-101-methods-of-authentication"),
      },
      {
        q: "A system records that user jsmith opened the payroll file at 09:14. Which part of AAA is this?",
        options: ["Identification", "Authentication", "Authorization", "Accounting"],
        correct: 3,
        explanation: "Recording who did what, and when, is accounting. It's what makes people answerable for their actions.",
        article: A("The AAA Framework", "the-aaa-framework-can-your-cowokers"),
      },
      {
        q: "You type your employee ID into a login screen. What is this step?",
        options: ["Identification", "Authentication", "Authorization", "Accounting"],
        correct: 0,
        explanation: "Typing an ID is a claim of identity. Proving it, with a password or another factor, is authentication.",
        article: A("The AAA Framework", "the-aaa-framework-can-your-cowokers"),
      },
      {
        q: "A user logs in successfully but can't approve invoices above 10,000 EUR. What is deciding this?",
        options: ["Identification", "Authentication", "Authorization", "Accounting"],
        correct: 2,
        explanation: "The user is already authenticated. What they're allowed to do once inside is authorization.",
        article: A("Access Controls: Who Gets the Keys?", "access-controls"),
      },
      {
        q: "What is the MAIN security problem with several administrators sharing one admin account?",
        options: ["The password is harder to remember", "Actions can't be traced to an individual", "Logins take longer", "It needs more licenses"],
        correct: 1,
        explanation: "Shared accounts break accountability: the logs show the account, not the person. That's why every user needs their own account.",
        article: A("The AAA Framework", "the-aaa-framework-can-your-cowokers"),
      },
    ],
  },

  // --------------------------------------------------------------- DAY 4
  "day-4": {
    day: 4,
    title: "Day 4 quiz: risk management",
    domain: 1,
    mode: "practice",
    next: "Tomorrow: Day 5, governance: laws, frameworks and policies.",
    questions: [
      {
        q: "An unpatched web server is an example of a:",
        options: ["Threat", "Vulnerability", "Risk", "Control"],
        correct: 1,
        explanation: "It's a weakness a threat could use. The threat would be the attacker or the malware, and the risk is the chance and impact of them meeting.",
        article: A("Threat ≠ Risk ≠ Vulnerability", "threat-risk-vulnerability-why-cissp"),
      },
      {
        q: "A company buys cyber insurance to cover the cost of a data breach. Which risk response is this?",
        options: ["Avoidance", "Acceptance", "Transference", "Mitigation"],
        correct: 2,
        explanation: "Part of the financial impact moves to the insurer. The company is still accountable for protecting the data.",
        article: A("Risk Management in Cybersecurity, Explained for Beginners", "risk-management-in-cybersecurity"),
      },
      {
        q: "After new controls are in place, some risk remains. What is this called?",
        options: ["Inherent risk", "Residual risk", "Total risk", "Risk appetite"],
        correct: 1,
        explanation: "Residual risk is what's left after controls. It should fall within the organization's risk appetite.",
        article: A("Risk Management in Cybersecurity, Explained for Beginners", "risk-management-in-cybersecurity"),
      },
      {
        q: "Who should formally accept a risk on behalf of the organization?",
        options: ["Whichever employee spots it", "The IT help desk", "A manager with authority over the affected business area", "The external auditor"],
        correct: 2,
        explanation: "Accepting a risk is a business decision. It belongs to someone with the authority and accountability for that area, and it should be documented.",
        article: A("Risk Management in Cybersecurity, Explained for Beginners", "risk-management-in-cybersecurity"),
      },
      {
        q: "A team rates each risk as high, medium or low. What kind of analysis is this?",
        options: ["Quantitative", "Qualitative", "Statistical", "Financial"],
        correct: 1,
        explanation: "Ratings and categories are qualitative. Quantitative analysis puts money and numbers on likelihood and impact.",
        article: A("Threat ≠ Risk ≠ Vulnerability", "threat-risk-vulnerability-why-cissp"),
      },
    ],
  },

  // --------------------------------------------------------------- DAY 5
  "day-5": {
    day: 5,
    title: "Day 5 quiz: governance, laws and policies",
    domain: 1,
    mode: "practice",
    next: "Tomorrow: Day 6, security controls and professional ethics.",
    questions: [
      {
        q: "Which of these documents is optional?",
        options: ["Policy", "Standard", "Procedure", "Guideline"],
        correct: 3,
        explanation: "Guidelines are recommendations. Policies, standards and procedures are mandatory.",
        article: A("Security Policies, Standards, and Procedures", "security-policies-standards-and-procedures"),
      },
      {
        q: "\"All passwords must be at least 14 characters long.\" What type of document does this line most likely come from?",
        options: ["Policy", "Standard", "Procedure", "Guideline"],
        correct: 1,
        explanation: "It's a specific, mandatory requirement. A policy states intent at a higher level, and a procedure would give step-by-step instructions.",
        article: A("Security Policies, Standards, and Procedures", "security-policies-standards-and-procedures"),
      },
      {
        q: "Who should approve an organization's information security policy?",
        options: ["The security analyst who wrote it", "Senior management", "The IT help desk", "Every employee"],
        correct: 1,
        explanation: "Policies carry management's authority. Senior management approves them and owns them.",
        article: A("Security Policies, Standards, and Procedures", "security-policies-standards-and-procedures"),
      },
      {
        q: "GDPR is an example of a:",
        options: ["Framework", "Regulation", "Guideline", "Procedure"],
        correct: 1,
        explanation: "GDPR is an EU regulation with legal force. Organizations that process EU residents' personal data must comply.",
        article: A("GDPR Explained", "gdpr-explained-the-privacy-law-that"),
      },
      {
        q: "A company decides to structure its security program around NIST CSF. What is NIST CSF?",
        options: ["A law", "A framework", "A procedure", "A firewall product"],
        correct: 1,
        explanation: "NIST CSF is a framework: a structure an organization chooses to follow, or is asked to follow by a contract or regulator.",
        article: A("How Risk Management Frameworks Keep Systems Secure", "how-risk-management-frameworks-keep"),
      },
    ],
  },

  // --------------------------------------------------------------- DAY 6
  "day-6": {
    day: 6,
    title: "Day 6 quiz: security controls and ethics",
    domain: 1,
    mode: "practice",
    next: "Tomorrow: Day 7, review and the Domain 1 quiz.",
    questions: [
      {
        q: "Background checks before hiring are which type of control?",
        options: ["Technical", "Physical", "Administrative", "Corrective"],
        correct: 2,
        explanation: "Background checks are a people and process control, so they're administrative. Corrective is a function, not a type.",
        article: A("Cybersecurity Controls from Zero to Hero", "cybersecurity-controls-from-zero"),
      },
      {
        q: "After a theft, the security team reviews the camera footage. What function is the review performing?",
        options: ["Preventive", "Detective", "Deterrent", "Directive"],
        correct: 1,
        explanation: "Reviewing footage identifies what happened, which is detective. The visible camera itself also deters, but the review detects.",
        article: A("Cybersecurity Controls from Zero to Hero", "cybersecurity-controls-from-zero"),
      },
      {
        q: "Restoring files from a backup after a ransomware attack is which function of control?",
        options: ["Preventive", "Detective", "Corrective", "Deterrent"],
        correct: 2,
        explanation: "Restoring fixes the damage after the event, which makes it corrective.",
        article: A("Cybersecurity Controls from Zero to Hero", "cybersecurity-controls-from-zero"),
      },
      {
        q: "A sign at the entrance says \"This area is monitored by CCTV.\" What is its PRIMARY function?",
        options: ["Deterrent", "Corrective", "Compensating", "Detective"],
        correct: 0,
        explanation: "The sign discourages people from trying. It doesn't detect or fix anything on its own.",
        article: A("Cybersecurity Controls from Zero to Hero", "cybersecurity-controls-from-zero"),
      },
      {
        q: "An assessment finds a critical vulnerability, and the team patches it the same week. Which concept does the patching show?",
        options: ["Due diligence", "Due care", "Risk avoidance", "Separation of duties"],
        correct: 1,
        explanation: "Due diligence is finding out what needs to be done (the assessment). Due care is doing it (the patch).",
        article: A("Cybersecurity Controls from Zero to Hero", "cybersecurity-controls-from-zero"),
      },
    ],
  },

  // --------------------------------------------------------- DOMAIN 1 QUIZ
  "domain-1": {
    day: 7,
    title: "Domain 1 quiz: Security Principles",
    domain: 1,
    mode: "exam",
    target: 80,
    retry: "Below 70%? Repeat the day you scored lowest on before you start Week 2.",
    next: "Next: Week 2 starts with Day 8, governance, risk and compliance.",
    questions: [
      {
        q: "You discover a colleague is sending customer data to a competitor. What should you do FIRST?",
        options: ["Confront the colleague directly", "Report it through the channel your organization's policy defines", "Remove the colleague's access yourself", "Warn the customers on social media"],
        correct: 1,
        explanation: "Follow the process. Report through proper channels and let the people with authority act. Taking matters into your own hands can destroy evidence and break policy.",
        article: A("Why Good Engineers Fail the CISSP Exam, and Managers Don't", "why-good-engineers-fail-the-cissp"),
      },
      {
        q: "Which statement BEST describes risk?",
        options: ["Any threat to the organization", "A weakness in a system", "The likelihood that a threat exploits a vulnerability, and the impact if it does", "An attack that is currently in progress"],
        correct: 2,
        explanation: "Risk combines likelihood and impact. A threat alone or a weakness alone isn't a risk.",
        article: A("Threat ≠ Risk ≠ Vulnerability", "threat-risk-vulnerability-why-cissp"),
      },
      {
        q: "A data owner decides to encrypt a database of customer records. Which principle does this PRIMARILY protect?",
        options: ["Availability", "Confidentiality", "Non-repudiation", "Accounting"],
        correct: 1,
        explanation: "Encryption keeps the data secret from anyone without the key. That's confidentiality.",
        article: A("The 8 Security Principles Every CISSP Candidate Thinks They Understand", "the-8-security-principles-every-cissp"),
      },
      {
        q: "A software vendor publishes a SHA-256 value next to each download. What does this let users verify?",
        options: ["That the file contains no malware", "That the file wasn't altered", "That the download will be fast", "That the vendor is trustworthy"],
        correct: 1,
        explanation: "A matching hash proves integrity: the file is the one the vendor published. It says nothing about whether that file is safe.",
        article: A("Hashing: Why It's Not the Same as Encryption", "hashing-what-it-is-and-why-its-not"),
      },
      {
        q: "A small company can't split payment duties between two people, so the owner reviews every payment log each week. What kind of control is the weekly review?",
        options: ["Preventive", "Compensating", "Deterrent", "Directive"],
        correct: 1,
        explanation: "Separation of duties isn't possible, so the review reduces the same risk another way. That's a compensating control.",
        article: A("Cybersecurity Controls from Zero to Hero", "cybersecurity-controls-from-zero"),
      },
      {
        q: "Which document states the organization's security intent and is approved by senior management?",
        options: ["Procedure", "Guideline", "Policy", "Baseline"],
        correct: 2,
        explanation: "The policy is the top of the hierarchy. Standards, procedures and guidelines exist to support it.",
        article: A("Security Policies, Standards, and Procedures", "security-policies-standards-and-procedures"),
      },
      {
        q: "Management reviews a risk, decides it falls within the risk appetite, and documents that decision. Which response is this?",
        options: ["Acceptance", "Avoidance", "Transference", "Mitigation"],
        correct: 0,
        explanation: "A documented decision to live with a risk, made by someone with authority, is acceptance.",
        article: A("Risk Management in Cybersecurity, Explained for Beginners", "risk-management-in-cybersecurity"),
      },
      {
        q: "Before signing with a cloud provider, a company reviews the provider's security certifications and audit reports. What is this an example of?",
        options: ["Due care", "Due diligence", "Risk transference", "Non-repudiation"],
        correct: 1,
        explanation: "Researching and assessing before deciding is due diligence. Acting on what you found is due care.",
        article: A("How Risk Management Frameworks Keep Systems Secure", "how-risk-management-frameworks-keep"),
      },
      {
        q: "Logs show the account \"admin\" deleted customer records, but five people know that account's password. Which part of AAA has failed?",
        options: ["Identification", "Authorization", "Accounting", "Availability"],
        correct: 2,
        explanation: "The logs can't tie the action to one person, so accountability is gone. Shared accounts break accounting.",
        article: A("The AAA Framework", "the-aaa-framework-can-your-cowokers"),
      },
      {
        q: "Under the ISC2 Code of Ethics, which duty has the HIGHEST priority?",
        options: ["Serve your employer diligently", "Advance and protect the profession", "Protect society, the common good and the infrastructure", "Act honorably and legally"],
        correct: 2,
        explanation: "The canons are ranked, and protecting society comes first. When duties conflict, the higher canon wins.",
        article: A("Why Good Engineers Fail the CISSP Exam, and Managers Don't", "why-good-engineers-fail-the-cissp"),
      },
      {
        q: "Which principle says an organization should collect only the personal data it needs for a stated purpose?",
        options: ["Data minimization", "Least privilege", "Separation of duties", "Defense in depth"],
        correct: 0,
        explanation: "Data minimization is a privacy principle, central to GDPR. Least privilege is about access, not collection.",
        article: A("GDPR Explained", "gdpr-explained-the-privacy-law-that"),
      },
      {
        q: "Which type of risk analysis puts money values on likelihood and impact?",
        options: ["Qualitative", "Quantitative", "Subjective", "Descriptive"],
        correct: 1,
        explanation: "Quantitative analysis uses numbers and money. Qualitative analysis uses ratings such as high, medium and low.",
        article: A("Risk Management in Cybersecurity, Explained for Beginners", "risk-management-in-cybersecurity"),
      },
      {
        q: "Full-disk encryption on company laptops is which type of control?",
        options: ["Administrative", "Physical", "Technical", "Deterrent"],
        correct: 2,
        explanation: "It's implemented in technology, so its type is technical. Deterrent is a function, not a type.",
        article: A("Cybersecurity Controls from Zero to Hero", "cybersecurity-controls-from-zero"),
      },
      {
        q: "What is the MAIN purpose of security governance?",
        options: ["Buying the right security tools", "Aligning security with business goals and assigning accountability", "Writing firewall rules", "Running penetration tests"],
        correct: 1,
        explanation: "Governance sets direction and decides who is accountable. Tools, rules and tests come later, as ways of carrying it out.",
        article: A("GRC for Beginners", "grc-for-beginners-the-exact-study"),
      },
      {
        q: "An attacker can read data as it crosses the network but can't change it. Which principle is MAINLY at risk?",
        options: ["Integrity", "Availability", "Confidentiality", "Non-repudiation"],
        correct: 2,
        explanation: "Reading without permission breaks confidentiality. Changing the data would be integrity.",
        article: A("The 8 Security Principles Every CISSP Candidate Thinks They Understand", "the-8-security-principles-every-cissp"),
      },
    ],
  },
};

export const PLAN_QUIZZES = { ...WEEK1_QUIZZES, ...GENERATED_QUIZZES };
