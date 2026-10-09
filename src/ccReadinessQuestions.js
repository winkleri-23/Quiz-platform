// =============================================================================
// DECODED SECURITY: CC READINESS TEST: QUESTION BANK (v1, 2026-10-09)
// 25 original questions on the ISC2 CC exam outline effective 2026-09-01.
// Weighted to the outline: D1 6, D2 4, D3 5, D4 5, D5 5.
// All questions are original (ISC2 exam content is under NDA).
// =============================================================================

export const CC_DOMAINS = [
  { id: 1, short: "D1", name: "Security Principles", weight: 24, days: "Days 2 to 7" },
  { id: 2, short: "D2", name: "Security Governance", weight: 17.3, days: "Days 8 to 11" },
  { id: 3, short: "D3", name: "Identity and Access Management", weight: 20, days: "Days 12 to 14" },
  { id: 4, short: "D4", name: "Networking and Cloud Security", weight: 21.3, days: "Days 15 to 19" },
  { id: 5, short: "D5", name: "Security Operations and Incident Response", weight: 17.3, days: "Days 20 to 23" },
];

const A = (title, slug) => ({ title, slug });

export const CC_QUESTIONS = [
  // ---------------------------------------------------------------- D1 (6)
  {
    domain: 1,
    q: "Ransomware takes a hospital's patient records system offline. Doctors can no longer see patients' allergy information. Which security principle was MOST directly affected?",
    options: ["Confidentiality", "Integrity", "Availability", "Non-repudiation"],
    correct: 2,
    explanation: "Nobody stole or changed the data here. The doctors simply can't reach it when they need it. That's availability. Ransomware can also hit confidentiality when attackers copy data first, but the impact described is lost access.",
    article: A("The 8 Security Principles Every CISSP Candidate Thinks They Understand", "the-8-security-principles-every-cissp"),
  },
  {
    domain: 1,
    q: "An employee claims they never sent the email that approved a large payment. Which control would BEST prevent them from credibly denying it?",
    options: [
      "Encrypting the email with a key shared by the whole finance team",
      "Requiring a longer password for email accounts",
      "Storing a copy of every email on a backup server",
      "Digitally signing the email with the employee's private key",
    ],
    correct: 3,
    explanation: "This is non-repudiation. Only the employee holds their private key, so a valid signature proves the email came from them. A shared key proves nothing about which person used it, and backups only prove the email exists.",
    article: A("Symmetric vs Asymmetric Encryption", "symmetric-vs-asymmetric-encryption"),
  },
  {
    domain: 1,
    q: "Protecting an old marketing website would cost more than any loss it could ever cause. Management documents this and decides to take no further action. Which risk response is this?",
    options: ["Risk avoidance", "Risk acceptance", "Risk transference", "Risk mitigation"],
    correct: 1,
    explanation: "Knowingly living with a risk, and documenting that decision, is acceptance. Avoidance would mean shutting the website down. Transference would be insurance or outsourcing. Mitigation would mean adding controls.",
    article: A("Risk Management in Cybersecurity, Explained for Beginners", "risk-management-in-cybersecurity"),
  },
  {
    domain: 1,
    q: "Every new hire must complete security awareness training in their first week. What type of control is this?",
    options: ["Technical", "Physical", "Administrative", "Compensating"],
    correct: 2,
    explanation: "Training, policies and procedures are administrative (managerial) controls. They work through people and processes, not through technology (technical) or barriers you can touch (physical).",
    article: A("Cybersecurity Controls from Zero to Hero", "cybersecurity-controls-from-zero"),
  },
  {
    domain: 1,
    q: "During a review, you find a product flaw that could put public safety at risk. Your manager tells you to keep quiet until next quarter's release. Under the ISC2 Code of Ethics, which duty comes FIRST?",
    options: [
      "Follow your manager's instructions",
      "Protect society, the common good and the infrastructure",
      "Protect your employer's reputation",
      "Advance and protect the profession",
    ],
    correct: 1,
    explanation: "The four canons are ranked, and protecting society comes first. When duties conflict, the higher canon wins. ISC2 questions reward the answer that protects people before the business.",
    article: A("Why Good Engineers Fail the CISSP Exam, and Managers Don't", "why-good-engineers-fail-the-cissp"),
  },
  {
    domain: 1,
    q: "Which document gives mandatory, step-by-step instructions for carrying out a specific task, such as creating a new user account?",
    options: ["Policy", "Guideline", "Standard", "Procedure"],
    correct: 3,
    explanation: "Procedures are the step-by-step how-to. Policies state high-level intent, standards set specific mandatory requirements, and guidelines are recommendations you're free to adapt.",
    article: A("Security Policies, Standards, and Procedures", "security-policies-standards-and-procedures"),
  },

  // ---------------------------------------------------------------- D2 (4)
  {
    domain: 2,
    q: "Your sales database is backed up every night at midnight. Management says losing more than 4 hours of sales data is unacceptable. Which target does the current schedule fail to meet?",
    options: [
      "Recovery Time Objective (RTO)",
      "Recovery Point Objective (RPO)",
      "Maximum Tolerable Downtime (MTD)",
      "Work Recovery Time (WRT)",
    ],
    correct: 1,
    explanation: "RPO is how much data you can afford to lose, measured in time. Nightly backups mean you could lose up to 24 hours of data, far beyond the 4-hour target. RTO is about how fast you recover, not how much data you lose.",
    article: A("RTO, RPO, MTD, WRT Explained", "rto-rpo-mtd-wrt-explained-the-backup"),
  },
  {
    domain: 2,
    q: "A flood closes your main office. Which plan focuses specifically on restoring the IT systems and data that the business depends on?",
    options: ["Business continuity plan", "Incident response plan", "Disaster recovery plan", "Risk register"],
    correct: 2,
    explanation: "Business continuity keeps the whole business running, including people, processes and locations. Disaster recovery is the IT part of that: getting systems and data back.",
    article: A("Testing Disaster Recovery Plans", "testing-disaster-recovery-plans-why"),
  },
  {
    domain: 2,
    q: "What is the PRIMARY goal of a security awareness program?",
    options: [
      "Turning every employee into a security expert",
      "Giving auditors evidence that training took place",
      "Changing employee behavior to reduce human-related risk",
      "Teaching staff how to configure security tools",
    ],
    correct: 2,
    explanation: "Awareness exists to change behavior: fewer clicks on phishing links, more reports, better habits. Audit evidence is a side effect, not the goal. If behavior doesn't change, the program failed.",
    article: A("The Psychology of Hacking", "the-psychology-of-hacking-why-smart"),
  },
  {
    domain: 2,
    q: "Your company processes personal data of EU residents, so it must meet GDPR requirements. Within GRC, which function is MAINLY responsible for meeting that obligation?",
    options: ["Governance", "Risk management", "Incident response", "Compliance"],
    correct: 3,
    explanation: "Compliance makes sure the organization meets the laws, regulations and contracts it's bound by. Governance sets direction and accountability, and risk management decides how to treat risks.",
    article: A("GRC for Beginners", "grc-for-beginners-the-exact-study"),
  },

  // ---------------------------------------------------------------- D3 (5)
  {
    domain: 3,
    q: "A user logs in by typing a username and then a password. What does typing the username accomplish?",
    options: ["Identification", "Authentication", "Authorization", "Accounting"],
    correct: 0,
    explanation: "The username is a claim of identity: \"this is who I am\". The password proves the claim (authentication). Authorization decides what you can do, and accounting records what you did.",
    article: A("The AAA Framework", "the-aaa-framework-can-your-cowokers"),
  },
  {
    domain: 3,
    q: "Which of these is true multi-factor authentication?",
    options: [
      "A password and a PIN",
      "A fingerprint and a face scan",
      "A password and a code from an authenticator app on your phone",
      "A password and the answers to two security questions",
    ],
    correct: 2,
    explanation: "Multi-factor means different factor types: something you know, something you have, something you are. A password (know) plus a phone app (have) is two factors. The other pairs use the same factor type twice.",
    article: A("Methods of Authentication", "cybersecurity-101-methods-of-authentication"),
  },
  {
    domain: 3,
    q: "In the finance team, one person can create a new supplier, enter that supplier's invoice and approve the payment. Which principle is MOST clearly missing?",
    options: ["Least privilege", "Separation of duties", "Need to know", "Defense in depth"],
    correct: 1,
    explanation: "Separation of duties splits a critical process so no single person can complete it alone. Here one person could create a fake supplier and pay it. Least privilege is related, but splitting the task is the specific fix.",
    article: A("Access Controls: Who Gets the Keys?", "access-controls"),
  },
  {
    domain: 3,
    q: "An employee moved from HR to Marketing two years ago and can still open HR salary files. Which control would BEST have caught this?",
    options: [
      "Stronger password requirements",
      "Encrypting the salary files at rest",
      "Periodic access reviews",
      "A stricter firewall policy",
    ],
    correct: 2,
    explanation: "This is privilege creep: access piles up as people move roles. Regular access reviews find permissions that no longer match the job. Encryption doesn't help when the user is authorized to decrypt.",
    article: A("CISSP Identity Lifecycle Management", "cissp-identity-lifecycle-management"),
  },
  {
    domain: 3,
    q: "In a hospital system, everyone in the \"Nurse\" group gets the same permissions, and everyone in the \"Doctor\" group gets a different set. Which access control model is this?",
    options: [
      "Discretionary Access Control (DAC)",
      "Mandatory Access Control (MAC)",
      "Role-Based Access Control (RBAC)",
      "Rule-based firewall filtering",
    ],
    correct: 2,
    explanation: "Permissions attached to job roles, with users assigned to roles, is RBAC. In DAC the data owner decides who gets access. MAC uses labels and clearances set by the system.",
    article: A("Access Control Concepts 101: Logical Access Models", "access-control-concepts-101-logical"),
  },

  // ---------------------------------------------------------------- D4 (5)
  {
    domain: 4,
    q: "An administrator still manages servers over Telnet on port 23. What should replace it?",
    options: ["FTP on port 21", "SSH on port 22", "HTTP on port 80", "RDP on port 3389"],
    correct: 1,
    explanation: "Telnet sends everything, including passwords, in clear text. SSH does the same job over an encrypted channel. FTP and HTTP are also unencrypted, and RDP is a different (graphical) protocol.",
    article: A("A Port Is Just a Door", "ports-and-why-we-scan-them"),
  },
  {
    domain: 4,
    q: "A company adopts a zero trust architecture. Which statement BEST describes the approach?",
    options: [
      "Devices on the internal office network are trusted automatically",
      "Every access request is verified, wherever it comes from",
      "Users connected through the VPN get full network access",
      "A strong perimeter firewall is the main line of defense",
    ],
    correct: 1,
    explanation: "Zero trust means never trust, always verify. Being inside the network earns no trust. Every request is authenticated and authorized, with least privilege. The other three options describe the old perimeter model.",
    article: A("Why Most Beginners Don't Understand How Networks Actually Work", "why-most-beginners-dont-understand"),
  },
  {
    domain: 4,
    q: "A company uses a SaaS email service. Who is responsible for deciding which employees can access which mailboxes?",
    options: [
      "The SaaS provider",
      "The company's internet service provider",
      "The customer company",
      "Nobody, because SaaS handles access automatically",
    ],
    correct: 2,
    explanation: "Under the shared responsibility model, the provider secures the service itself. The customer always owns its data and decides who can access it, in every cloud model, including SaaS.",
    article: A("The Cloud Isn't Magic! It's Just Rented IT.", "cloud-based-systems"),
  },
  {
    domain: 4,
    q: "Public-facing web servers are placed in a separate network zone between the internet and the internal network. What is this zone called?",
    options: ["VLAN", "VPN", "DMZ", "Intranet"],
    correct: 2,
    explanation: "A DMZ (demilitarized zone) holds systems the internet must reach, so a compromised web server doesn't sit inside the internal network. It's a classic example of segmentation.",
    article: A("The Complete Guide to Firewall Types", "the-complete-guide-to-firewall-types"),
  },
  {
    domain: 4,
    q: "At which OSI layer does a router decide where to forward traffic based on IP addresses?",
    options: ["Layer 2: Data Link", "Layer 3: Network", "Layer 4: Transport", "Layer 7: Application"],
    correct: 1,
    explanation: "IP addressing and routing live at Layer 3, the Network layer. Switches work with MAC addresses at Layer 2, and TCP and UDP ports belong to Layer 4.",
    article: A("Understanding the ISO/OSI Model", "understanding-the-isoosi-model-why"),
  },

  // ---------------------------------------------------------------- D5 (5)
  {
    domain: 5,
    q: "A SOC analyst confirms a laptop is infected with malware that is spreading to other machines. What should happen FIRST?",
    options: [
      "Wipe the laptop and reinstall the operating system",
      "Write the lessons-learned report",
      "Isolate the laptop from the network",
      "Notify all customers of a breach",
    ],
    correct: 2,
    explanation: "Once an incident is confirmed and spreading, containment comes first. Stop the damage, then eradicate and recover. Wiping first destroys evidence, and lessons learned comes at the end.",
    article: A("The Incident Response Mistakes That End Interviews Early", "the-incident-response-mistakes-that"),
  },
  {
    domain: 5,
    q: "You want to prove that a downloaded file hasn't been changed, without hiding its contents. Which technique fits BEST?",
    options: ["Symmetric encryption", "Hashing", "Asymmetric encryption", "Data masking"],
    correct: 1,
    explanation: "A hash is a fingerprint of the file. If one bit changes, the hash changes. Hashing proves integrity and is one-way. Encryption protects confidentiality, which isn't what's needed here.",
    article: A("Hashing: Why It's Not the Same as Encryption", "hashing-what-it-is-and-why-its-not"),
  },
  {
    domain: 5,
    q: "An old hard drive held confidential customer data and is about to leave the company. Which option gives the HIGHEST assurance the data can't be recovered?",
    options: [
      "Deleting all the files",
      "Running a quick format",
      "Physically shredding the drive",
      "Moving the files to the recycle bin and emptying it",
    ],
    correct: 2,
    explanation: "Deleting and quick formatting only remove the pointers to the data, so recovery tools can bring it back. Physical destruction leaves nothing to recover.",
    article: A("How to Dispose of Data So It Never Comes Back", "the-final-goodbye-how-to-dispose"),
  },
  {
    domain: 5,
    q: "What is the main job of a SIEM?",
    options: [
      "Blocking malicious traffic at the network edge",
      "Collecting and correlating logs from many sources to spot suspicious activity",
      "Encrypting log files so attackers can't read them",
      "Automatically patching vulnerable systems",
    ],
    correct: 1,
    explanation: "A SIEM pulls logs from across the environment and connects related events into alerts. It detects. It doesn't block traffic (that's a firewall or IPS) or patch systems.",
    article: A("This Is How I Explain SIEM To a Beginner", "this-is-how-i-explain-siem-to-a-beginner"),
  },
  {
    domain: 5,
    q: "What is the key difference between a vulnerability scan and a penetration test?",
    options: [
      "A vulnerability scan is always done manually",
      "A penetration test attempts to actually exploit weaknesses",
      "A vulnerability scan needs written approval and a penetration test doesn't",
      "There is no difference, the terms mean the same thing",
    ],
    correct: 1,
    explanation: "A scan finds known weaknesses automatically. A penetration test goes further and proves they can be exploited. Both need authorization, and a pen test always requires written approval.",
    article: A("Penetration Testing for Beginners", "penetration-testing-for-beginners"),
  },
];
