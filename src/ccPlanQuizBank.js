// GENERATED from the question bank. Weeks 2-4 daily quizzes, Domain 2-5 quizzes and both mock exams.
// All questions are original (ISC2 exam content is under NDA).
export const GENERATED_QUIZZES = {
 "day-8": {
  "title": "Day 8 quiz: governance, risk and compliance",
  "day": 8,
  "domain": 2,
  "mode": "practice",
  "next": "Tomorrow: Day 9, business continuity, disaster recovery and the recovery numbers.",
  "questions": [
   {
    "q": "Who sets an organization's risk appetite?",
    "options": [
     "Security analysts",
     "Senior leadership",
     "External auditors",
     "The IT help desk"
    ],
    "correct": 1,
    "explanation": "Risk appetite is a governance decision. Leadership decides how much risk the business will take, and everyone else works within it.",
    "article": {
     "title": "GRC for Beginners",
     "slug": "grc-for-beginners-the-exact-study"
    }
   },
   {
    "q": "Which GRC function makes sure the organization can PROVE it meets its legal and contractual obligations?",
    "options": [
     "Governance",
     "Risk management",
     "Compliance",
     "Incident response"
    ],
    "correct": 2,
    "explanation": "Compliance checks obligations are met and keeps the evidence that shows it.",
    "article": {
     "title": "GRC for Beginners",
     "slug": "grc-for-beginners-the-exact-study"
    }
   },
   {
    "q": "ISO 27001 is BEST described as:",
    "options": [
     "A law that applies in every EU country",
     "A standard for an information security management system that you can be certified against",
     "A firewall configuration guide",
     "A malware analysis method"
    ],
    "correct": 1,
    "explanation": "ISO 27001 is a certifiable management system standard. It isn't a law, and it isn't a technical how-to.",
    "article": {
     "title": "How Risk Management Frameworks Keep Systems Secure",
     "slug": "how-risk-management-frameworks-keep"
    }
   },
   {
    "q": "Which NIST CSF function, added in version 2.0, covers strategy, roles and oversight?",
    "options": [
     "Identify",
     "Govern",
     "Recover",
     "Detect"
    ],
    "correct": 1,
    "explanation": "CSF 2.0 added Govern to the original five functions, so there are now six: Govern, Identify, Protect, Detect, Respond, Recover.",
    "article": {
     "title": "How Risk Management Frameworks Keep Systems Secure",
     "slug": "how-risk-management-frameworks-keep"
    }
   },
   {
    "q": "A company passes its annual audit and is breached a month later. What does this BEST show?",
    "options": [
     "Audits are useless",
     "Compliance isn't the same as security",
     "The auditor made a mistake",
     "Breaches can't be prevented"
    ],
    "correct": 1,
    "explanation": "An audit proves you met a defined minimum at one point in time. Real security has to go further than that.",
    "article": {
     "title": "GRC for Beginners",
     "slug": "grc-for-beginners-the-exact-study"
    }
   }
  ]
 },
 "day-9": {
  "title": "Day 9 quiz: continuity, recovery and the numbers",
  "day": 9,
  "domain": 2,
  "mode": "practice",
  "next": "Tomorrow: Day 10, backups, recovery sites and testing the plan.",
  "questions": [
   {
    "q": "What should come FIRST when building a business continuity plan?",
    "options": [
     "Buying a hot site",
     "A business impact analysis",
     "Writing the disaster recovery runbook",
     "Testing the backups"
    ],
    "correct": 1,
    "explanation": "The BIA tells you which processes matter most and how long each can be down. Every later decision depends on it.",
    "article": {
     "title": "RTO, RPO, MTD, WRT Explained",
     "slug": "rto-rpo-mtd-wrt-explained-the-backup"
    }
   },
   {
    "q": "\"We can lose at most 15 minutes of transactions.\" Which metric is this?",
    "options": [
     "RTO",
     "RPO",
     "MTD",
     "WRT"
    ],
    "correct": 1,
    "explanation": "How much data you can afford to lose, measured in time, is the recovery point objective.",
    "article": {
     "title": "RTO, RPO, MTD, WRT Explained",
     "slug": "rto-rpo-mtd-wrt-explained-the-backup"
    }
   },
   {
    "q": "\"The website must be back online within 2 hours.\" Which metric is this?",
    "options": [
     "RTO",
     "RPO",
     "MTD",
     "WRT"
    ],
    "correct": 0,
    "explanation": "How fast a system must be restored is the recovery time objective.",
    "article": {
     "title": "RTO, RPO, MTD, WRT Explained",
     "slug": "rto-rpo-mtd-wrt-explained-the-backup"
    }
   },
   {
    "q": "How do business continuity (BC) and disaster recovery (DR) relate?",
    "options": [
     "BC is part of DR",
     "DR is part of BC",
     "They're unrelated",
     "Both are part of incident response"
    ],
    "correct": 1,
    "explanation": "BC keeps the whole business running. DR, restoring IT systems and data, is one part of that.",
    "article": {
     "title": "RTO, RPO, MTD, WRT Explained",
     "slug": "rto-rpo-mtd-wrt-explained-the-backup"
    }
   },
   {
    "q": "A process has an MTD of 12 hours. Its RTO is 10 hours and its WRT is 4 hours. What's wrong?",
    "options": [
     "Nothing, the RTO is under the MTD",
     "RTO plus WRT exceeds the MTD",
     "The RPO is too long",
     "WRT doesn't count toward downtime"
    ],
    "correct": 1,
    "explanation": "10 plus 4 is 14 hours, which is longer than the 12 hours the business can tolerate.",
    "article": {
     "title": "RTO, RPO, MTD, WRT Explained",
     "slug": "rto-rpo-mtd-wrt-explained-the-backup"
    }
   }
  ]
 },
 "day-10": {
  "title": "Day 10 quiz: backups, recovery sites and testing",
  "day": 10,
  "domain": 2,
  "mode": "practice",
  "next": "Tomorrow: Day 11, security awareness and measuring what works, then the Domain 2 quiz.",
  "questions": [
   {
    "q": "Which backup type copies only what changed since the last FULL backup?",
    "options": [
     "Full",
     "Incremental",
     "Differential",
     "Snapshot"
    ],
    "correct": 2,
    "explanation": "A differential grows each day until the next full backup. An incremental copies only what changed since the last backup of any kind.",
    "article": {
     "title": "This Is How I Explain Backup Strategies to a Beginner",
     "slug": "this-is-how-i-explain-backup-strategies"
    }
   },
   {
    "q": "Which recovery site can take over fastest?",
    "options": [
     "Cold site",
     "Warm site",
     "Hot site",
     "A spare office with power only"
    ],
    "correct": 2,
    "explanation": "A hot site is fully equipped with current data. It's the fastest and the most expensive.",
    "article": {
     "title": "This Is How I Explain Backup Strategies to a Beginner",
     "slug": "this-is-how-i-explain-backup-strategies"
    }
   },
   {
    "q": "Which disaster recovery test is LEAST disruptive?",
    "options": [
     "Full interruption",
     "Parallel test",
     "Checklist review",
     "Simulation"
    ],
    "correct": 2,
    "explanation": "A checklist review means reading the plan. Nothing in production is touched.",
    "article": {
     "title": "Testing Disaster Recovery Plans",
     "slug": "testing-disaster-recovery-plans-why"
    }
   },
   {
    "q": "What happens in a parallel test?",
    "options": [
     "Production is shut down",
     "The recovery site runs alongside production",
     "The team only reads the plan",
     "Nobody is involved"
    ],
    "correct": 1,
    "explanation": "The recovery systems are brought up and run alongside production, without interrupting it.",
    "article": {
     "title": "Testing Disaster Recovery Plans",
     "slug": "testing-disaster-recovery-plans-why"
    }
   },
   {
    "q": "Why keep one backup copy offline or unchangeable?",
    "options": [
     "Restores are faster",
     "Ransomware can't encrypt or delete it",
     "Storage is cheaper",
     "DNS requires it"
    ],
    "correct": 1,
    "explanation": "Ransomware often goes after backups. A copy it can't reach or change is what saves you.",
    "article": {
     "title": "This Is How I Explain Backup Strategies to a Beginner",
     "slug": "this-is-how-i-explain-backup-strategies"
    }
   }
  ]
 },
 "day-12": {
  "title": "Day 12 quiz: the identity life cycle",
  "day": 12,
  "domain": 3,
  "mode": "practice",
  "next": "Tomorrow: Day 13, least privilege, separation of duties and access control models.",
  "questions": [
   {
    "q": "An employee moves from Sales to Finance. Besides granting Finance access, what MUST happen?",
    "options": [
     "Nothing else",
     "Remove their Sales access",
     "Reset their password",
     "Delete their account and create a new one"
    ],
    "correct": 1,
    "explanation": "Movers keep old access unless someone removes it. That's how privilege creep starts.",
    "article": {
     "title": "CISSP Identity Lifecycle Management",
     "slug": "cissp-identity-lifecycle-management"
    }
   },
   {
    "q": "What is the build-up of access through role changes over time called?",
    "options": [
     "Privilege escalation",
     "Privilege creep",
     "Least privilege",
     "Separation of duties"
    ],
    "correct": 1,
    "explanation": "Privilege creep is gradual, and nobody notices it without access reviews. Privilege escalation is an attack.",
    "article": {
     "title": "CISSP Identity Lifecycle Management",
     "slug": "cissp-identity-lifecycle-management"
    }
   },
   {
    "q": "In a hostile termination, when should the employee's access be disabled?",
    "options": [
     "After the exit interview",
     "At or before the moment they're told",
     "At the end of the month",
     "When HR sends a ticket"
    ],
    "correct": 1,
    "explanation": "Access has to end before they can act on the news.",
    "article": {
     "title": "CISSP Identity Lifecycle Management",
     "slug": "cissp-identity-lifecycle-management"
    }
   },
   {
    "q": "An account that still works after its owner left the company is called:",
    "options": [
     "A service account",
     "An orphaned account",
     "A privileged account",
     "A guest account"
    ],
    "correct": 1,
    "explanation": "Orphaned accounts are a favorite way in for attackers, because nobody watches them.",
    "article": {
     "title": "CISSP Identity Lifecycle Management",
     "slug": "cissp-identity-lifecycle-management"
    }
   },
   {
    "q": "In an access review, who should confirm that a user still needs access to a data set?",
    "options": [
     "The user",
     "The data owner or the user's manager",
     "The help desk",
     "Any administrator"
    ],
    "correct": 1,
    "explanation": "The person accountable for the data, or for the person's job, is the one who can judge the need.",
    "article": {
     "title": "CISSP Identity Lifecycle Management",
     "slug": "cissp-identity-lifecycle-management"
    }
   }
  ]
 },
 "day-13": {
  "title": "Day 13 quiz: least privilege and access models",
  "day": 13,
  "domain": 3,
  "mode": "practice",
  "next": "Tomorrow: Day 14, review and the Domain 3 quiz.",
  "questions": [
   {
    "q": "Users can share their own files with anyone they choose. Which model is this?",
    "options": [
     "DAC",
     "MAC",
     "RBAC",
     "ABAC"
    ],
    "correct": 0,
    "explanation": "In discretionary access control, the owner decides who gets access.",
    "article": {
     "title": "Access Control Concepts 101: Logical Access Models",
     "slug": "access-control-concepts-101-logical"
    }
   },
   {
    "q": "A system grants access by comparing users' clearances with labels such as Secret and Top Secret. Which model?",
    "options": [
     "DAC",
     "MAC",
     "RBAC",
     "ABAC"
    ],
    "correct": 1,
    "explanation": "Mandatory access control enforces labels and clearances. Users can't override it.",
    "article": {
     "title": "Access Control Concepts 101: Logical Access Models",
     "slug": "access-control-concepts-101-logical"
    }
   },
   {
    "q": "A developer gets read access to production logs and nothing else, because that's all the task needs. Which principle is this?",
    "options": [
     "Need to know",
     "Least privilege",
     "Separation of duties",
     "Defense in depth"
    ],
    "correct": 1,
    "explanation": "Least privilege means only the access the job requires.",
    "article": {
     "title": "Access Controls: Who Gets the Keys?",
     "slug": "access-controls"
    }
   },
   {
    "q": "The person who raises a purchase order can't approve it. Which principle is this?",
    "options": [
     "Least privilege",
     "Separation of duties",
     "Need to know",
     "Job rotation"
    ],
    "correct": 1,
    "explanation": "Splitting a critical process between people is separation of duties.",
    "article": {
     "title": "Access Controls: Who Gets the Keys?",
     "slug": "access-controls"
    }
   },
   {
    "q": "Access is allowed only if the user is in HR AND is using a company-managed device. Which model is this?",
    "options": [
     "DAC",
     "MAC",
     "RBAC",
     "ABAC"
    ],
    "correct": 3,
    "explanation": "Rules that combine several attributes, such as department and device, are attribute-based access control.",
    "article": {
     "title": "Access Control Concepts 101: Logical Access Models",
     "slug": "access-control-concepts-101-logical"
    }
   }
  ]
 },
 "day-15": {
  "title": "Day 15 quiz: how networks work",
  "day": 15,
  "domain": 4,
  "mode": "practice",
  "next": "Tomorrow: Day 16, ports, protocols, DNS and firewalls.",
  "questions": [
   {
    "q": "A switch forwards frames using MAC addresses. Which OSI layer is that?",
    "options": [
     "Layer 1",
     "Layer 2",
     "Layer 3",
     "Layer 4"
    ],
    "correct": 1,
    "explanation": "MAC addresses and switching belong to Layer 2, Data Link.",
    "article": {
     "title": "Understanding the ISO/OSI Model",
     "slug": "understanding-the-isoosi-model-why"
    }
   },
   {
    "q": "Which protocol is connectionless?",
    "options": [
     "TCP",
     "UDP",
     "SSH",
     "HTTPS"
    ],
    "correct": 1,
    "explanation": "UDP sends without a handshake or delivery guarantee. TCP, SSH and HTTPS all run over connections.",
    "article": {
     "title": "Introduction to the TCP/IP Model",
     "slug": "introduction-to-the-tcpip-model"
    }
   },
   {
    "q": "How many bits are in an IPv6 address?",
    "options": [
     "32",
     "64",
     "128",
     "256"
    ],
    "correct": 2,
    "explanation": "IPv6 addresses are 128-bit. IPv4 addresses are 32-bit.",
    "article": {
     "title": "Why Most Beginners Don't Understand How Networks Actually Work",
     "slug": "why-most-beginners-dont-understand"
    }
   },
   {
    "q": "Which of these is a private IPv4 address?",
    "options": [
     "8.8.8.8",
     "192.168.1.10",
     "1.1.1.1",
     "172.32.0.5"
    ],
    "correct": 1,
    "explanation": "192.168.x.x is a private range. 172.32.0.5 is just outside the private range, which only runs from 172.16 to 172.31.",
    "article": {
     "title": "Why Most Beginners Don't Understand How Networks Actually Work",
     "slug": "why-most-beginners-dont-understand"
    }
   },
   {
    "q": "What is the order of the TCP three-way handshake?",
    "options": [
     "ACK, SYN, SYN-ACK",
     "SYN, ACK, SYN-ACK",
     "SYN, SYN-ACK, ACK",
     "SYN-ACK, SYN, ACK"
    ],
    "correct": 2,
    "explanation": "The client sends SYN, the server answers SYN-ACK, and the client confirms with ACK.",
    "article": {
     "title": "Introduction to the TCP/IP Model",
     "slug": "introduction-to-the-tcpip-model"
    }
   }
  ]
 },
 "day-16": {
  "title": "Day 16 quiz: ports, protocols, DNS and firewalls",
  "day": 16,
  "domain": 4,
  "mode": "practice",
  "next": "Tomorrow: Day 17, VPNs, wireless and embedded devices.",
  "questions": [
   {
    "q": "Which service normally runs on port 443?",
    "options": [
     "HTTP",
     "HTTPS",
     "SSH",
     "DNS"
    ],
    "correct": 1,
    "explanation": "443 is HTTPS. Plain HTTP uses 80.",
    "article": {
     "title": "A Port Is Just a Door",
     "slug": "ports-and-why-we-scan-them"
    }
   },
   {
    "q": "What should replace Telnet for remote administration?",
    "options": [
     "FTP",
     "SSH",
     "HTTP",
     "SNMP"
    ],
    "correct": 1,
    "explanation": "SSH does the same job as Telnet, but encrypted.",
    "article": {
     "title": "A Port Is Just a Door",
     "slug": "ports-and-why-we-scan-them"
    }
   },
   {
    "q": "Which port does DNS use by default?",
    "options": [
     "25",
     "53",
     "80",
     "110"
    ],
    "correct": 1,
    "explanation": "DNS uses port 53. Port 25 is SMTP.",
    "article": {
     "title": "This Is How I Explain DNS To Beginners",
     "slug": "this-is-how-i-explain-dns-to-beginners"
    }
   },
   {
    "q": "Which port is used by Remote Desktop Protocol (RDP)?",
    "options": [
     "22",
     "443",
     "3389",
     "8080"
    ],
    "correct": 2,
    "explanation": "RDP uses 3389. Exposing it to the internet is a well-known ransomware entry point.",
    "article": {
     "title": "A Port Is Just a Door",
     "slug": "ports-and-why-we-scan-them"
    }
   },
   {
    "q": "Which firewall is designed to block attacks such as SQL injection against a website?",
    "options": [
     "Packet filter",
     "Stateful firewall",
     "Web application firewall",
     "Circuit-level gateway"
    ],
    "correct": 2,
    "explanation": "A WAF inspects web traffic at the application level, where SQL injection happens.",
    "article": {
     "title": "The Complete Guide to Firewall Types",
     "slug": "the-complete-guide-to-firewall-types"
    }
   }
  ]
 },
 "day-17": {
  "title": "Day 17 quiz: VPNs, wireless and devices",
  "day": 17,
  "domain": 4,
  "mode": "practice",
  "next": "Tomorrow: Day 18, segmentation, defense in depth and zero trust.",
  "questions": [
   {
    "q": "Which Wi-Fi security option is strongest?",
    "options": [
     "WEP",
     "WPA",
     "WPA2",
     "WPA3"
    ],
    "correct": 3,
    "explanation": "WPA3 is the current standard. Its SAE handshake resists offline password guessing.",
    "article": {
     "title": "Wi-Fi Security: Here Is What Actually Matters",
     "slug": "wi-fi-security-for-the-cissp-candidates"
    }
   },
   {
    "q": "An attacker sets up an access point with the same name as a coffee shop's Wi-Fi. What is this attack?",
    "options": [
     "Evil twin",
     "Rogue access point",
     "War driving",
     "Jamming"
    ],
    "correct": 0,
    "explanation": "A fake access point that copies a trusted network's name is an evil twin. A rogue access point is an unauthorized one plugged into your own network.",
    "article": {
     "title": "Wi-Fi Security: Here Is What Actually Matters",
     "slug": "wi-fi-security-for-the-cissp-candidates"
    }
   },
   {
    "q": "What does Enterprise mode Wi-Fi use to authenticate each user individually?",
    "options": [
     "One shared password",
     "802.1X with a RADIUS server",
     "MAC address filtering",
     "A hidden network name"
    ],
    "correct": 1,
    "explanation": "802.1X checks each user's own credentials against a RADIUS server.",
    "article": {
     "title": "Wi-Fi Security: Here Is What Actually Matters",
     "slug": "wi-fi-security-for-the-cissp-candidates"
    }
   },
   {
    "q": "Two offices need a permanent, encrypted connection over the internet. What fits BEST?",
    "options": [
     "A remote access VPN",
     "A site-to-site VPN",
     "A public Wi-Fi hotspot",
     "Port forwarding"
    ],
    "correct": 1,
    "explanation": "A site-to-site VPN links whole networks. Remote access VPNs connect individual users.",
    "article": {
     "title": "This Is How I Explain VPNs to Beginners",
     "slug": "this-is-how-i-explain-vpns-to-beginners"
    }
   },
   {
    "q": "Smart TVs and IP cameras sit on the same network as office laptops. What is the BEST first step?",
    "options": [
     "Leave them, they're harmless",
     "Move them to a separate network segment",
     "Give them admin rights",
     "Turn off the firewall"
    ],
    "correct": 1,
    "explanation": "Smart devices are hard to patch. Segmenting them stops a compromised camera from reaching laptops.",
    "article": {
     "title": "Your Smart TV Might Be Watching You",
     "slug": "your-smart-tv-might-be-watching-you"
    }
   }
  ]
 },
 "day-18": {
  "title": "Day 18 quiz: segmentation and zero trust",
  "day": 18,
  "domain": 4,
  "mode": "practice",
  "next": "Tomorrow: Day 19, cloud security, then the Domain 4 quiz.",
  "questions": [
   {
    "q": "What is the core idea of zero trust?",
    "options": [
     "Trust everything inside the firewall",
     "Never trust, always verify every request",
     "Trust devices once they're on the VPN",
     "Remove all passwords"
    ],
    "correct": 1,
    "explanation": "In zero trust, network location earns no trust. Every request has to prove itself.",
    "article": {
     "title": "Why Most Beginners Don't Understand How Networks Actually Work",
     "slug": "why-most-beginners-dont-understand"
    }
   },
   {
    "q": "Where should a public-facing web server BEST be placed?",
    "options": [
     "On the internal network",
     "In a DMZ",
     "On an employee's laptop",
     "Directly on the internet with no firewall"
    ],
    "correct": 1,
    "explanation": "The DMZ keeps internet-facing systems apart from the internal network.",
    "article": {
     "title": "The Complete Guide to Firewall Types",
     "slug": "the-complete-guide-to-firewall-types"
    }
   },
   {
    "q": "What does defense in depth mean?",
    "options": [
     "One very strong firewall",
     "Several independent layers of controls",
     "Deep packet inspection only",
     "Encrypting everything twice"
    ],
    "correct": 1,
    "explanation": "Multiple layers mean one failure isn't fatal."
   },
   {
    "q": "What does network access control (NAC) do?",
    "options": [
     "Encrypts Wi-Fi traffic",
     "Checks a device's identity and health before letting it on the network",
     "Blocks spam email",
     "Backs up network settings"
    ],
    "correct": 1,
    "explanation": "NAC can refuse or quarantine a device that is unknown or unpatched."
   },
   {
    "q": "What does micro-segmentation add compared with traditional segmentation?",
    "options": [
     "Larger network zones",
     "Controls traffic down to individual workloads",
     "Faster internet speed",
     "Removes the need for firewalls"
    ],
    "correct": 1,
    "explanation": "Micro-segmentation applies rules between individual servers or workloads, not just between big zones."
   }
  ]
 },
 "day-20": {
  "title": "Day 20 quiz: data security and encryption",
  "day": 20,
  "domain": 5,
  "mode": "practice",
  "next": "Tomorrow: Day 21, logging, triage and threats.",
  "questions": [
   {
    "q": "Data saved on a laptop's disk is in which state?",
    "options": [
     "In transit",
     "At rest",
     "In use",
     "In process"
    ],
    "correct": 1,
    "explanation": "Stored data is at rest. Full-disk encryption protects it.",
    "article": {
     "title": "This Is How I Explain Data States",
     "slug": "this-is-how-i-explain-data-states"
    }
   },
   {
    "q": "AES is which kind of encryption?",
    "options": [
     "Symmetric",
     "Asymmetric",
     "Hashing",
     "Encoding"
    ],
    "correct": 0,
    "explanation": "AES uses one shared key, which makes it symmetric. RSA is asymmetric.",
    "article": {
     "title": "Symmetric vs Asymmetric Encryption",
     "slug": "symmetric-vs-asymmetric-encryption"
    }
   },
   {
    "q": "Which technique proves integrity but doesn't provide confidentiality?",
    "options": [
     "AES encryption",
     "Hashing with SHA-256",
     "A VPN",
     "Full-disk encryption"
    ],
    "correct": 1,
    "explanation": "A hash shows whether data changed, but it doesn't hide anything.",
    "article": {
     "title": "Hashing: Why It's Not the Same as Encryption",
     "slug": "hashing-what-it-is-and-why-its-not"
    }
   },
   {
    "q": "A failed SSD held secret keys. Which disposal gives the HIGHEST assurance?",
    "options": [
     "Degaussing",
     "Deleting the files",
     "Physical destruction (shredding)",
     "A quick format"
    ],
    "correct": 2,
    "explanation": "Degaussing doesn't reliably erase SSDs because they store data in flash memory, not magnetically. Shredding leaves nothing to recover.",
    "article": {
     "title": "How to Dispose of Data So It Never Comes Back",
     "slug": "the-final-goodbye-how-to-dispose"
    }
   },
   {
    "q": "Why label data with its classification?",
    "options": [
     "So the right handling rules can be applied",
     "To compress it",
     "To encrypt it automatically",
     "To speed up backups"
    ],
    "correct": 0,
    "explanation": "A visible label tells people and systems how the data must be stored, shared and destroyed.",
    "article": {
     "title": "This Is How I Explain Data Classification",
     "slug": "this-is-how-i-explain-data-classification"
    }
   }
  ]
 },
 "day-21": {
  "title": "Day 21 quiz: security operations",
  "day": 21,
  "domain": 5,
  "mode": "practice",
  "next": "Tomorrow: Day 22, incident response and asset protection.",
  "questions": [
   {
    "q": "Which tool collects and correlates logs from many sources to raise alerts?",
    "options": [
     "Firewall",
     "SIEM",
     "VPN",
     "Load balancer"
    ],
    "correct": 1,
    "explanation": "A SIEM connects events across systems. That's how it spots patterns no single log shows.",
    "article": {
     "title": "This Is How I Explain SIEM To a Beginner",
     "slug": "this-is-how-i-explain-siem-to-a-beginner"
    }
   },
   {
    "q": "Which system can actively block malicious traffic?",
    "options": [
     "IDS",
     "IPS",
     "SIEM",
     "Log server"
    ],
    "correct": 1,
    "explanation": "An IPS sits inline and blocks. An IDS only alerts.",
    "article": {
     "title": "This Is How I Explain SIEM To a Beginner",
     "slug": "this-is-how-i-explain-siem-to-a-beginner"
    }
   },
   {
    "q": "Why synchronize clocks across systems with NTP?",
    "options": [
     "To make the network faster",
     "So log timestamps line up and events can be correlated",
     "To save storage",
     "To encrypt the logs"
    ],
    "correct": 1,
    "explanation": "Without consistent time, you can't reconstruct what happened in what order.",
    "article": {
     "title": "This Is How I Explain SIEM To a Beginner",
     "slug": "this-is-how-i-explain-siem-to-a-beginner"
    }
   },
   {
    "q": "What usually drives a hacktivist?",
    "options": [
     "Money",
     "A political or social cause",
     "Espionage for a government",
     "Accidental mistakes"
    ],
    "correct": 1,
    "explanation": "Hacktivists attack to promote a cause. Organized crime is driven by money."
   },
   {
    "q": "What is MITRE ATT&CK?",
    "options": [
     "A firewall product",
     "A knowledge base of attacker tactics and techniques",
     "A type of malware",
     "An encryption standard"
    ],
    "correct": 1,
    "explanation": "ATT&CK catalogs how real attackers operate, which helps defenders plan detection."
   }
  ]
 },
 "day-22": {
  "title": "Day 22 quiz: incident response and change",
  "day": 22,
  "domain": 5,
  "mode": "practice",
  "next": "Tomorrow: Day 23, security testing, then the Domain 5 quiz.",
  "questions": [
   {
    "q": "What is the FIRST phase of the incident response life cycle?",
    "options": [
     "Detection and analysis",
     "Preparation",
     "Containment",
     "Lessons learned"
    ],
    "correct": 1,
    "explanation": "Preparation (plans, tools, training) happens before anything goes wrong.",
    "article": {
     "title": "The Incident Response Mistakes That End Interviews Early",
     "slug": "the-incident-response-mistakes-that"
    }
   },
   {
    "q": "What turns an event into an incident?",
    "options": [
     "It happens at night",
     "It harms or threatens confidentiality, integrity or availability",
     "It appears in a log",
     "A user reports it"
    ],
    "correct": 1,
    "explanation": "Plenty of events are harmless. An incident has real or threatened impact on CIA.",
    "article": {
     "title": "The Incident Response Mistakes That End Interviews Early",
     "slug": "the-incident-response-mistakes-that"
    }
   },
   {
    "q": "What is the purpose of a chain of custody?",
    "options": [
     "To speed up recovery",
     "To record who handled evidence and when, so it stays trustworthy",
     "To encrypt evidence",
     "To decide who gets blamed"
    ],
    "correct": 1,
    "explanation": "If you can't show who handled the evidence, it may not stand up in court or in a disciplinary process.",
    "article": {
     "title": "The Incident Response Mistakes That End Interviews Early",
     "slug": "the-incident-response-mistakes-that"
    }
   },
   {
    "q": "When does the lessons-learned review happen?",
    "options": [
     "Before containment",
     "During detection",
     "After recovery",
     "Never, if the incident was small"
    ],
    "correct": 2,
    "explanation": "Lessons learned is the last phase, and it feeds back into preparation.",
    "article": {
     "title": "The Incident Response Mistakes That End Interviews Early",
     "slug": "the-incident-response-mistakes-that"
    }
   },
   {
    "q": "An urgent firewall change is made at night to stop an attack. What should happen with change management?",
    "options": [
     "Nothing, it was an emergency",
     "Document and review it afterwards through the change process",
     "Reverse it in the morning",
     "Delete the logs"
    ],
    "correct": 1,
    "explanation": "Emergency changes can skip the queue, but they're still documented and reviewed afterwards."
   }
  ]
 },
 "domain-2": {
  "title": "Domain 2 quiz: Security Governance",
  "day": 11,
  "domain": 2,
  "mode": "exam",
  "next": "Next: Day 12, the identity life cycle.",
  "questions": [
   {
    "q": "The board approves a security strategy that supports the company's five-year business plan. Which GRC function is this?",
    "options": [
     "Governance",
     "Risk management",
     "Compliance",
     "Incident response"
    ],
    "correct": 0,
    "explanation": "Setting direction and aligning security with the business is governance.",
    "article": {
     "title": "GRC for Beginners",
     "slug": "grc-for-beginners-the-exact-study"
    }
   },
   {
    "q": "A company is fined because it reported a breach to the regulator after the legal deadline. Which function failed?",
    "options": [
     "Governance",
     "Compliance",
     "Availability management",
     "Change management"
    ],
    "correct": 1,
    "explanation": "Meeting legal obligations, such as notification deadlines, is compliance.",
    "article": {
     "title": "GRC for Beginners",
     "slug": "grc-for-beginners-the-exact-study"
    }
   },
   {
    "q": "What is the MAIN output of a business impact analysis?",
    "options": [
     "A list of firewall rules",
     "The critical processes and how long each can be down",
     "A phishing training plan",
     "A penetration test report"
    ],
    "correct": 1,
    "explanation": "The BIA identifies what matters most and sets the recovery targets.",
    "article": {
     "title": "RTO, RPO, MTD, WRT Explained",
     "slug": "rto-rpo-mtd-wrt-explained-the-backup"
    }
   },
   {
    "q": "A system's RPO is 1 hour. Which backup approach meets it?",
    "options": [
     "Daily backups",
     "Weekly backups",
     "Backups or replication at least every hour",
     "Monthly backups"
    ],
    "correct": 2,
    "explanation": "To lose at most an hour of data, you need a recovery point at least every hour.",
    "article": {
     "title": "RTO, RPO, MTD, WRT Explained",
     "slug": "rto-rpo-mtd-wrt-explained-the-backup"
    }
   },
   {
    "q": "A recovery site has hardware ready, but data must be restored before it can take over. What kind of site is it?",
    "options": [
     "Hot site",
     "Warm site",
     "Cold site",
     "Mobile site"
    ],
    "correct": 1,
    "explanation": "A warm site sits between hot (ready now) and cold (space and power only).",
    "article": {
     "title": "This Is How I Explain Backup Strategies to a Beginner",
     "slug": "this-is-how-i-explain-backup-strategies"
    }
   },
   {
    "q": "Which backup scheme takes the MOST time to restore?",
    "options": [
     "Full backups only",
     "A full plus a chain of daily incrementals",
     "A full plus the latest differential",
     "A full backup taken last night"
    ],
    "correct": 1,
    "explanation": "Restoring incrementals means applying every one since the full, in order.",
    "article": {
     "title": "This Is How I Explain Backup Strategies to a Beginner",
     "slug": "this-is-how-i-explain-backup-strategies"
    }
   },
   {
    "q": "Which DR test shuts down the primary site to prove the recovery site works?",
    "options": [
     "Checklist",
     "Tabletop",
     "Parallel",
     "Full interruption"
    ],
    "correct": 3,
    "explanation": "Full interruption is the most realistic and the most risky test.",
    "article": {
     "title": "Testing Disaster Recovery Plans",
     "slug": "testing-disaster-recovery-plans-why"
    }
   },
   {
    "q": "A team talks through a ransomware scenario around a table, step by step, without touching any systems. What is this?",
    "options": [
     "A tabletop exercise",
     "A parallel test",
     "A penetration test",
     "A full interruption test"
    ],
    "correct": 0,
    "explanation": "Tabletop exercises are discussion-based and carry no risk to production.",
    "article": {
     "title": "Testing Disaster Recovery Plans",
     "slug": "testing-disaster-recovery-plans-why"
    }
   },
   {
    "q": "An attacker sends text messages pretending to be the bank, asking people to click a link. What is this?",
    "options": [
     "Vishing",
     "Smishing",
     "Tailgating",
     "Whaling"
    ],
    "correct": 1,
    "explanation": "Phishing by SMS is smishing. Vishing uses voice calls.",
    "article": {
     "title": "How Phishing Works in 5 Steps",
     "slug": "how-phishing-works-in-5-steps"
    }
   },
   {
    "q": "Someone follows an employee through a badge-controlled door without badging in. What is this?",
    "options": [
     "Pretexting",
     "Tailgating",
     "Baiting",
     "Shoulder surfing"
    ],
    "correct": 1,
    "explanation": "Following someone through a secure door is tailgating, also called piggybacking.",
    "article": {
     "title": "The Psychology of Hacking",
     "slug": "the-psychology-of-hacking-why-smart"
    }
   },
   {
    "q": "Which is BEST described as a key risk indicator (KRI)?",
    "options": [
     "The number of training sessions delivered",
     "A rising number of unpatched critical systems",
     "The security team's headcount",
     "The firewall's uptime last year"
    ],
    "correct": 1,
    "explanation": "A KRI warns that a risk is growing. Unpatched critical systems are exactly that."
   },
   {
    "q": "What is the BEST format for reporting security status to executives?",
    "options": [
     "Raw firewall logs",
     "A dashboard with trends and the main risks",
     "A list of every alert",
     "Source code reviews"
    ],
    "correct": 1,
    "explanation": "Executives need the big picture. Detail goes to the teams."
   },
   {
    "q": "Developers attend a course on writing secure code. Is this awareness, training or education?",
    "options": [
     "Awareness",
     "Training",
     "Education",
     "Certification"
    ],
    "correct": 1,
    "explanation": "Training builds role-specific skills. Awareness changes general attention."
   },
   {
    "q": "A caller claims to be from IT support and asks for your password to \"fix your account\". What technique is this?",
    "options": [
     "Pretexting",
     "Baiting",
     "Tailgating",
     "Dumpster diving"
    ],
    "correct": 0,
    "explanation": "Pretexting uses an invented story to get information. IT will never need your password.",
    "article": {
     "title": "The Psychology of Hacking",
     "slug": "the-psychology-of-hacking-why-smart"
    }
   },
   {
    "q": "What does the 3-2-1 backup rule recommend?",
    "options": [
     "3 backups a day, 2 admins, 1 tool",
     "3 copies, on 2 types of media, with 1 off-site",
     "3 servers, 2 sites, 1 cloud",
     "3 tests, 2 restores, 1 audit"
    ],
    "correct": 1,
    "explanation": "Three copies on two kinds of media, with one off-site, survives most single failures.",
    "article": {
     "title": "This Is How I Explain Backup Strategies to a Beginner",
     "slug": "this-is-how-i-explain-backup-strategies"
    }
   }
  ],
  "target": 80,
  "retry": "Below 70%? Reread Days 8 to 11, focusing on the day where you missed the most, before Day 12."
 },
 "domain-3": {
  "title": "Domain 3 quiz: Identity and Access Management",
  "day": 14,
  "domain": 3,
  "mode": "exam",
  "next": "Next: Week 3 starts with Day 15, how networks work.",
  "questions": [
   {
    "q": "Who should approve a new hire's access?",
    "options": [
     "The new hire",
     "Their manager and the data owner",
     "Any IT administrator",
     "The CEO"
    ],
    "correct": 1,
    "explanation": "The people accountable for the job and for the data decide what access is needed.",
    "article": {
     "title": "CISSP Identity Lifecycle Management",
     "slug": "cissp-identity-lifecycle-management"
    }
   },
   {
    "q": "What is the MAIN risk when an employee changes roles?",
    "options": [
     "They forget their password",
     "They keep access they no longer need",
     "Their account is deleted",
     "Their badge stops working"
    ],
    "correct": 1,
    "explanation": "Unremoved old access piles up into privilege creep.",
    "article": {
     "title": "CISSP Identity Lifecycle Management",
     "slug": "cissp-identity-lifecycle-management"
    }
   },
   {
    "q": "The help desk creates a new hire's account by copying a colleague who has worked there for 10 years. What is the MAIN risk?",
    "options": [
     "The account name may be too long",
     "The new hire inherits access they don't need",
     "The password will be weak",
     "The new hire can't log in"
    ],
    "correct": 1,
    "explanation": "Copying an old account copies years of accumulated access and breaks least privilege.",
    "article": {
     "title": "CISSP Identity Lifecycle Management",
     "slug": "cissp-identity-lifecycle-management"
    }
   },
   {
    "q": "What is the BEST way to make sure contractor accounts don't stay active after their contracts end?",
    "options": [
     "Ask contractors to delete their own accounts",
     "Set an expiry date on each contractor account",
     "Share one account among all contractors",
     "Check once a year"
    ],
    "correct": 1,
    "explanation": "An expiry date disables the account automatically, even if someone forgets.",
    "article": {
     "title": "CISSP Identity Lifecycle Management",
     "slug": "cissp-identity-lifecycle-management"
    }
   },
   {
    "q": "Why should administrators use a separate account for admin tasks?",
    "options": [
     "It's faster",
     "It limits the damage if their everyday account is compromised",
     "Admins need two email addresses",
     "It saves licenses"
    ],
    "correct": 1,
    "explanation": "Browsing and email with an admin account exposes powerful rights to everyday threats.",
    "article": {
     "title": "Access Controls: Who Gets the Keys?",
     "slug": "access-controls"
    }
   },
   {
    "q": "What does just-in-time privileged access mean?",
    "options": [
     "Admin rights are granted permanently",
     "Elevated rights are granted only when needed, for a limited time",
     "Admins log in only at night",
     "Passwords are changed every minute"
    ],
    "correct": 1,
    "explanation": "Rights that don't exist most of the time can't be stolen most of the time.",
    "article": {
     "title": "Access Controls: Who Gets the Keys?",
     "slug": "access-controls"
    }
   },
   {
    "q": "An analyst has Secret clearance but can see only the Secret files for their own project. Which principle is this?",
    "options": [
     "Least privilege",
     "Need to know",
     "Separation of duties",
     "Job rotation"
    ],
    "correct": 1,
    "explanation": "Clearance alone isn't enough. You also need a business reason to see each piece of data.",
    "article": {
     "title": "Access Controls: Who Gets the Keys?",
     "slug": "access-controls"
    }
   },
   {
    "q": "A developer can't deploy their own code to production without someone else's approval. Which principle is this?",
    "options": [
     "Need to know",
     "Separation of duties",
     "Least privilege",
     "Defense in depth"
    ],
    "correct": 1,
    "explanation": "Splitting writing and approving between people is separation of duties.",
    "article": {
     "title": "Access Controls: Who Gets the Keys?",
     "slug": "access-controls"
    }
   },
   {
    "q": "Separation of duties can be defeated MOST easily by:",
    "options": [
     "Strong passwords",
     "Collusion between employees",
     "Encryption",
     "Access reviews"
    ],
    "correct": 1,
    "explanation": "If the two people involved work together, splitting the task no longer protects you.",
    "article": {
     "title": "Access Controls: Who Gets the Keys?",
     "slug": "access-controls"
    }
   },
   {
    "q": "Why do some organizations use job rotation?",
    "options": [
     "To reduce salaries",
     "To help detect fraud and reduce dependence on one person",
     "To avoid access reviews",
     "To speed up hiring"
    ],
    "correct": 1,
    "explanation": "Someone new in the role may notice irregularities the previous person was hiding.",
    "article": {
     "title": "Access Controls: Who Gets the Keys?",
     "slug": "access-controls"
    }
   },
   {
    "q": "Which model lets the data owner decide who gets access?",
    "options": [
     "DAC",
     "MAC",
     "RBAC",
     "ABAC"
    ],
    "correct": 0,
    "explanation": "Discretionary access control is owner-driven.",
    "article": {
     "title": "Access Control Concepts 101: Logical Access Models",
     "slug": "access-control-concepts-101-logical"
    }
   },
   {
    "q": "Which model is used for classified government data with labels and clearances?",
    "options": [
     "DAC",
     "MAC",
     "RBAC",
     "ABAC"
    ],
    "correct": 1,
    "explanation": "Mandatory access control is enforced by the system based on labels.",
    "article": {
     "title": "Access Control Concepts 101: Logical Access Models",
     "slug": "access-control-concepts-101-logical"
    }
   },
   {
    "q": "Nurses can view patient records, and doctors can view them and prescribe. Which model fits BEST?",
    "options": [
     "DAC",
     "MAC",
     "RBAC",
     "ABAC"
    ],
    "correct": 2,
    "explanation": "Permissions are tied to job roles, which is role-based access control.",
    "article": {
     "title": "Access Control Concepts 101: Logical Access Models",
     "slug": "access-control-concepts-101-logical"
    }
   },
   {
    "q": "Which authentication factor is the hardest to replace if it's compromised?",
    "options": [
     "A password",
     "A PIN",
     "A fingerprint",
     "A smart card"
    ],
    "correct": 2,
    "explanation": "You can change a password or reissue a card, but you can't change your fingerprint.",
    "article": {
     "title": "Methods of Authentication",
     "slug": "cybersecurity-101-methods-of-authentication"
    }
   },
   {
    "q": "What is a MAIN risk of single sign-on?",
    "options": [
     "Users must remember more passwords",
     "One stolen credential can open many systems",
     "It can't use MFA",
     "It only works on-premises"
    ],
    "correct": 1,
    "explanation": "SSO is convenient, so the one login must be protected well, ideally with MFA.",
    "article": {
     "title": "Methods of Authentication",
     "slug": "cybersecurity-101-methods-of-authentication"
    }
   }
  ],
  "target": 80,
  "retry": "Below 70%? Reread Days 12 and 13 and redo their quizzes before Week 3."
 },
 "domain-4": {
  "title": "Domain 4 quiz: Networking and Cloud Security",
  "day": 19,
  "domain": 4,
  "mode": "exam",
  "next": "Next: Day 20, data security and encryption.",
  "questions": [
   {
    "q": "Which device makes forwarding decisions based on IP addresses?",
    "options": [
     "Hub",
     "Switch",
     "Router",
     "Repeater"
    ],
    "correct": 2,
    "explanation": "Routing by IP address is a Layer 3 job, done by routers.",
    "article": {
     "title": "Understanding the ISO/OSI Model",
     "slug": "understanding-the-isoosi-model-why"
    }
   },
   {
    "q": "Which service uses port 22?",
    "options": [
     "Telnet",
     "SSH",
     "SMTP",
     "DNS"
    ],
    "correct": 1,
    "explanation": "SSH, and SFTP which runs over it, use port 22.",
    "article": {
     "title": "A Port Is Just a Door",
     "slug": "ports-and-why-we-scan-them"
    }
   },
   {
    "q": "Which is a typical use of UDP?",
    "options": [
     "Sending email",
     "DNS queries and live streaming",
     "Secure file transfer",
     "Web banking"
    ],
    "correct": 1,
    "explanation": "UDP suits fast, small or real-time traffic where a lost packet doesn't matter much.",
    "article": {
     "title": "Introduction to the TCP/IP Model",
     "slug": "introduction-to-the-tcpip-model"
    }
   },
   {
    "q": "How many bits are in an IPv4 address?",
    "options": [
     "16",
     "32",
     "64",
     "128"
    ],
    "correct": 1,
    "explanation": "IPv4 is 32-bit, which is why addresses ran out.",
    "article": {
     "title": "Why Most Beginners Don't Understand How Networks Actually Work",
     "slug": "why-most-beginners-dont-understand"
    }
   },
   {
    "q": "A SYN flood exhausts a server by abusing which mechanism?",
    "options": [
     "The DNS lookup",
     "The TCP three-way handshake",
     "The Wi-Fi password",
     "The VPN tunnel"
    ],
    "correct": 1,
    "explanation": "The attacker opens many half-finished handshakes and never completes them.",
    "article": {
     "title": "Introduction to the TCP/IP Model",
     "slug": "introduction-to-the-tcpip-model"
    }
   },
   {
    "q": "What is the purpose of a DMZ?",
    "options": [
     "To store backups",
     "To separate internet-facing systems from the internal network",
     "To speed up Wi-Fi",
     "To host user laptops"
    ],
    "correct": 1,
    "explanation": "If a public server is compromised, the internal network stays separated from it.",
    "article": {
     "title": "The Complete Guide to Firewall Types",
     "slug": "the-complete-guide-to-firewall-types"
    }
   },
   {
    "q": "What does a VLAN provide?",
    "options": [
     "Encryption of all traffic",
     "Logical separation of networks on the same switches",
     "Faster internet",
     "Antivirus protection"
    ],
    "correct": 1,
    "explanation": "VLANs split one physical network into separate logical ones. Filtering between them still needs a firewall."
   },
   {
    "q": "Which statement fits zero trust?",
    "options": [
     "Users on the VPN are trusted",
     "Every request is verified, wherever it comes from",
     "The perimeter firewall is enough",
     "Internal traffic needs no logging"
    ],
    "correct": 1,
    "explanation": "Zero trust removes location-based trust entirely.",
    "article": {
     "title": "Why Most Beginners Don't Understand How Networks Actually Work",
     "slug": "why-most-beginners-dont-understand"
    }
   },
   {
    "q": "What makes WPA3 Personal stronger than WPA2 Personal?",
    "options": [
     "A longer network name",
     "The SAE handshake, which resists offline password guessing",
     "It removes passwords",
     "It uses WEP keys"
    ],
    "correct": 1,
    "explanation": "SAE stops attackers from capturing a handshake and cracking the password offline.",
    "article": {
     "title": "Wi-Fi Security: Here Is What Actually Matters",
     "slug": "wi-fi-security-for-the-cissp-candidates"
    }
   },
   {
    "q": "What is the BEST protection for IoT devices that can't be patched?",
    "options": [
     "Give them admin rights",
     "Isolate them on their own network segment",
     "Connect them directly to the internet",
     "Turn off their logging"
    ],
    "correct": 1,
    "explanation": "Segmentation limits what an attacker can reach through a vulnerable device.",
    "article": {
     "title": "Your Smart TV Might Be Watching You",
     "slug": "your-smart-tv-might-be-watching-you"
    }
   },
   {
    "q": "What does a VPN protect?",
    "options": [
     "The endpoint from malware",
     "Data in transit across untrusted networks",
     "Data at rest on the server",
     "Users from phishing"
    ],
    "correct": 1,
    "explanation": "A VPN encrypts the tunnel. It doesn't clean or protect the device at either end.",
    "article": {
     "title": "This Is How I Explain VPNs to Beginners",
     "slug": "this-is-how-i-explain-vpns-to-beginners"
    }
   },
   {
    "q": "In SaaS, what does the customer remain responsible for?",
    "options": [
     "The data center's physical security",
     "Patching the application servers",
     "Their data and who can access it",
     "The hypervisor"
    ],
    "correct": 2,
    "explanation": "Even in SaaS, your data and access control stay yours.",
    "article": {
     "title": "The Cloud Isn't Magic! It's Just Rented IT.",
     "slug": "cloud-based-systems"
    }
   },
   {
    "q": "Which cloud characteristic means resources scale up and down quickly with demand?",
    "options": [
     "Measured service",
     "Rapid elasticity",
     "Resource pooling",
     "Broad network access"
    ],
    "correct": 1,
    "explanation": "Rapid elasticity is how cloud handles traffic spikes without buying hardware.",
    "article": {
     "title": "The Cloud Isn't Magic! It's Just Rented IT.",
     "slug": "cloud-based-systems"
    }
   },
   {
    "q": "A company runs some systems in its own data center and others in a public cloud. Which deployment model is this?",
    "options": [
     "Public",
     "Private",
     "Hybrid",
     "Community"
    ],
    "correct": 2,
    "explanation": "A mix of private and public is hybrid.",
    "article": {
     "title": "The Cloud Isn't Magic! It's Just Rented IT.",
     "slug": "cloud-based-systems"
    }
   },
   {
    "q": "What is a stateful firewall able to do that a simple packet filter can't?",
    "options": [
     "Inspect email attachments",
     "Track whether a packet belongs to an established connection",
     "Encrypt traffic",
     "Block phishing websites by content"
    ],
    "correct": 1,
    "explanation": "Stateful inspection remembers connections. Packet filters judge each packet alone.",
    "article": {
     "title": "The Complete Guide to Firewall Types",
     "slug": "the-complete-guide-to-firewall-types"
    }
   }
  ],
  "target": 80,
  "retry": "Below 70%? Reread the network day where you missed the most, then redo its quiz before Day 20."
 },
 "domain-5": {
  "title": "Domain 5 quiz: Security Operations and Incident Response",
  "day": 23,
  "domain": 5,
  "mode": "exam",
  "next": "Next: Day 24, Mock exam 1. Block two quiet hours.",
  "questions": [
   {
    "q": "Data being sent from a browser to a website is in which state?",
    "options": [
     "At rest",
     "In transit",
     "In use",
     "Archived"
    ],
    "correct": 1,
    "explanation": "Data moving across a network is in transit. TLS protects it.",
    "article": {
     "title": "This Is How I Explain Data States",
     "slug": "this-is-how-i-explain-data-states"
    }
   },
   {
    "q": "What is the main challenge of symmetric encryption?",
    "options": [
     "It's too slow",
     "Sharing the key securely",
     "It can't encrypt files",
     "It only works with hashing"
    ],
    "correct": 1,
    "explanation": "Both sides need the same secret key, and getting it to them safely is the hard part.",
    "article": {
     "title": "Symmetric vs Asymmetric Encryption",
     "slug": "symmetric-vs-asymmetric-encryption"
    }
   },
   {
    "q": "Alice encrypts a message with Bob's public key. Who can decrypt it?",
    "options": [
     "Anyone",
     "Alice, with her private key",
     "Bob, with his private key",
     "Anyone with Bob's public key"
    ],
    "correct": 2,
    "explanation": "Only the matching private key, which only Bob holds, can decrypt it.",
    "article": {
     "title": "Symmetric vs Asymmetric Encryption",
     "slug": "symmetric-vs-asymmetric-encryption"
    }
   },
   {
    "q": "Which key is used to create a digital signature?",
    "options": [
     "The sender's public key",
     "The sender's private key",
     "The recipient's public key",
     "A shared symmetric key"
    ],
    "correct": 1,
    "explanation": "Signing uses the sender's private key. Anyone can verify it with the sender's public key.",
    "article": {
     "title": "Symmetric vs Asymmetric Encryption",
     "slug": "symmetric-vs-asymmetric-encryption"
    }
   },
   {
    "q": "Degaussing does NOT reliably erase data on which media?",
    "options": [
     "Magnetic hard drives",
     "Backup tapes",
     "Solid-state drives",
     "Floppy disks"
    ],
    "correct": 2,
    "explanation": "SSDs store data in flash memory, not magnetically, so degaussing doesn't erase them.",
    "article": {
     "title": "How to Dispose of Data So It Never Comes Back",
     "slug": "the-final-goodbye-how-to-dispose"
    }
   },
   {
    "q": "What is a false positive?",
    "options": [
     "A real attack that wasn't detected",
     "An alert raised for harmless activity",
     "A successful backup",
     "A blocked attack"
    ],
    "correct": 1,
    "explanation": "False positives waste analysts' time. Tuning reduces them.",
    "article": {
     "title": "This Is How I Explain SIEM To a Beginner",
     "slug": "this-is-how-i-explain-siem-to-a-beginner"
    }
   },
   {
    "q": "An employee with legitimate access copies customer lists before leaving for a competitor. What kind of threat is this?",
    "options": [
     "Nation-state",
     "Hacktivist",
     "Insider",
     "Unskilled attacker"
    ],
    "correct": 2,
    "explanation": "A person inside the organization misusing their access is an insider threat."
   },
   {
    "q": "What is the first stage of the Cyber Kill Chain?",
    "options": [
     "Exploitation",
     "Reconnaissance",
     "Delivery",
     "Actions on objectives"
    ],
    "correct": 1,
    "explanation": "Attackers start by researching their target."
   },
   {
    "q": "Malware is confirmed on a laptop and is spreading. What should happen FIRST?",
    "options": [
     "Write the report",
     "Contain it by isolating the laptop",
     "Reinstall every server",
     "Wait for more evidence"
    ],
    "correct": 1,
    "explanation": "Containment stops the spread. Eradication and recovery come next.",
    "article": {
     "title": "The Incident Response Mistakes That End Interviews Early",
     "slug": "the-incident-response-mistakes-that"
    }
   },
   {
    "q": "Why does the chain of custody matter?",
    "options": [
     "It makes recovery faster",
     "It proves evidence wasn't tampered with",
     "It encrypts the evidence",
     "It assigns blame"
    ],
    "correct": 1,
    "explanation": "A documented chain of custody keeps evidence usable in legal or disciplinary action.",
    "article": {
     "title": "The Incident Response Mistakes That End Interviews Early",
     "slug": "the-incident-response-mistakes-that"
    }
   },
   {
    "q": "Why is an end-of-life server a risk even if it runs fine today?",
    "options": [
     "It uses too much power",
     "It no longer receives security patches",
     "It can't be backed up",
     "It slows the network"
    ],
    "correct": 1,
    "explanation": "New vulnerabilities will never be fixed, so the risk only grows."
   },
   {
    "q": "What is the correct order for a normal change?",
    "options": [
     "Implement, then request approval",
     "Request, review and approve, test, implement, document",
     "Test in production, then document",
     "Document only if something breaks"
    ],
    "correct": 1,
    "explanation": "Changes are approved and tested before they reach production, and documented throughout."
   },
   {
    "q": "What MUST be in place before a penetration test starts?",
    "options": [
     "A new firewall",
     "Written authorization and an agreed scope",
     "A press release",
     "A SIEM upgrade"
    ],
    "correct": 1,
    "explanation": "Without written permission, a penetration test is an attack.",
    "article": {
     "title": "Penetration Testing for Beginners",
     "slug": "penetration-testing-for-beginners"
    }
   },
   {
    "q": "What does static analysis (SAST) do?",
    "options": [
     "Tests the running application",
     "Reviews source code without running it",
     "Scans the network for open ports",
     "Simulates phishing"
    ],
    "correct": 1,
    "explanation": "Static analysis reads code. Dynamic analysis tests the running app.",
    "article": {
     "title": "Penetration Testing for Beginners",
     "slug": "penetration-testing-for-beginners"
    }
   },
   {
    "q": "What is the key difference between a vulnerability scan and a penetration test?",
    "options": [
     "Scans are illegal",
     "A penetration test tries to exploit weaknesses to prove impact",
     "Scans are always manual",
     "There is no difference"
    ],
    "correct": 1,
    "explanation": "A scan lists known weaknesses. A penetration test proves which ones can actually be used.",
    "article": {
     "title": "How Network Scanning Actually Works",
     "slug": "network-scanning-vulnerability-management"
    }
   }
  ],
  "target": 80,
  "retry": "Below 70%? Reread Days 20 to 23, focusing on your weakest day, before Mock exam 1."
 },
 "mock-1": {
  "title": "Mock exam 1: full timed CC exam",
  "day": 24,
  "domain": null,
  "mode": "mock",
  "minutes": 120,
  "target": 80,
  "next": "Next: Days 25 and 26, repair your two weakest domains using the scores above.",
  "questions": [
   {
    "domain": 1,
    "q": "Which principle ensures information isn't disclosed to unauthorized people?",
    "options": [
     "Integrity",
     "Availability",
     "Confidentiality",
     "Non-repudiation"
    ],
    "correct": 2,
    "explanation": "Keeping information from people who shouldn't see it is confidentiality."
   },
   {
    "domain": 1,
    "q": "An attacker intercepts and changes data in transit between a user and a bank. Which principle is MOST directly violated?",
    "options": [
     "Confidentiality",
     "Integrity",
     "Availability",
     "Privacy"
    ],
    "correct": 1,
    "explanation": "The data was altered without authorization, which breaks integrity."
   },
   {
    "domain": 1,
    "q": "A backup power generator for the data center MAINLY supports which principle?",
    "options": [
     "Confidentiality",
     "Integrity",
     "Availability",
     "Non-repudiation"
    ],
    "correct": 2,
    "explanation": "Keeping systems running through a power cut is availability."
   },
   {
    "domain": 1,
    "q": "What gives proof that a specific person sent a message?",
    "options": [
     "A firewall rule",
     "A digital signature",
     "A strong password",
     "A VPN"
    ],
    "correct": 1,
    "explanation": "A signature made with the sender's private key provides non-repudiation."
   },
   {
    "domain": 1,
    "q": "Which of these is something you know?",
    "options": [
     "A smart card",
     "A fingerprint",
     "A PIN",
     "A hardware token"
    ],
    "correct": 2,
    "explanation": "A PIN is knowledge. Cards and tokens are something you have, fingerprints something you are."
   },
   {
    "domain": 1,
    "q": "Which login is still single-factor even though it has two steps?",
    "options": [
     "A password, then a code sent by SMS",
     "A password, then a security question",
     "A smart card, then a PIN",
     "A fingerprint, then a password"
    ],
    "correct": 1,
    "explanation": "A password and a security question are both something you know."
   },
   {
    "domain": 1,
    "q": "What is the process of verifying a claimed identity called?",
    "options": [
     "Identification",
     "Authentication",
     "Authorization",
     "Accounting"
    ],
    "correct": 1,
    "explanation": "Authentication proves the identity you claimed during identification."
   },
   {
    "domain": 1,
    "q": "After login, the system decides which folders a user may open. What is this?",
    "options": [
     "Identification",
     "Authentication",
     "Authorization",
     "Accounting"
    ],
    "correct": 2,
    "explanation": "Deciding what an authenticated user may do is authorization."
   },
   {
    "domain": 1,
    "q": "Audit logs MAINLY support which concept?",
    "options": [
     "Availability",
     "Accountability",
     "Encryption",
     "Redundancy"
    ],
    "correct": 1,
    "explanation": "Logs tie actions to individuals, which is accountability."
   },
   {
    "domain": 1,
    "q": "Which BEST describes risk?",
    "options": [
     "A weakness in a system",
     "Anything that can cause harm",
     "The likelihood of a threat exploiting a vulnerability, combined with the impact",
     "A control that reduces harm"
    ],
    "correct": 2,
    "explanation": "Risk combines likelihood and impact."
   },
   {
    "domain": 1,
    "q": "A weak password policy is an example of a:",
    "options": [
     "Threat",
     "Vulnerability",
     "Control",
     "Risk response"
    ],
    "correct": 1,
    "explanation": "It's a weakness a threat could exploit."
   },
   {
    "domain": 1,
    "q": "An organized crime group targeting your company is an example of a:",
    "options": [
     "Vulnerability",
     "Threat",
     "Control",
     "Asset"
    ],
    "correct": 1,
    "explanation": "A threat actor is something or someone that could cause harm."
   },
   {
    "domain": 1,
    "q": "A company decides not to enter a market because it can't meet that country's data laws. Which risk response is this?",
    "options": [
     "Avoidance",
     "Acceptance",
     "Transference",
     "Mitigation"
    ],
    "correct": 0,
    "explanation": "Not doing the risky activity at all is avoidance."
   },
   {
    "domain": 1,
    "q": "Installing a firewall to lower the chance of an attack is which risk response?",
    "options": [
     "Avoidance",
     "Mitigation",
     "Transference",
     "Acceptance"
    ],
    "correct": 1,
    "explanation": "Adding controls to reduce likelihood or impact is mitigation."
   },
   {
    "domain": 1,
    "q": "A company buys insurance against ransomware losses. Which risk response is this?",
    "options": [
     "Avoidance",
     "Mitigation",
     "Transference",
     "Acceptance"
    ],
    "correct": 2,
    "explanation": "Part of the financial impact moves to the insurer."
   },
   {
    "domain": 1,
    "q": "Management documents a decision to live with a low risk. Which response is this?",
    "options": [
     "Avoidance",
     "Mitigation",
     "Transference",
     "Acceptance"
    ],
    "correct": 3,
    "explanation": "A documented, authorized decision to live with a risk is acceptance."
   },
   {
    "domain": 1,
    "q": "What is the risk that remains after controls are applied called?",
    "options": [
     "Inherent risk",
     "Residual risk",
     "Total risk",
     "Accepted risk"
    ],
    "correct": 1,
    "explanation": "Residual risk is what's left once your controls are in place."
   },
   {
    "domain": 1,
    "q": "Which risk analysis uses monetary values?",
    "options": [
     "Qualitative",
     "Quantitative",
     "Heuristic",
     "Descriptive"
    ],
    "correct": 1,
    "explanation": "Quantitative analysis works with numbers and money."
   },
   {
    "domain": 1,
    "q": "Who should approve the information security policy?",
    "options": [
     "Security analysts",
     "Senior management",
     "Every employee",
     "The help desk"
    ],
    "correct": 1,
    "explanation": "Policies carry management's authority."
   },
   {
    "domain": 1,
    "q": "Which document contains step-by-step instructions for a task?",
    "options": [
     "Policy",
     "Standard",
     "Procedure",
     "Guideline"
    ],
    "correct": 2,
    "explanation": "Procedures are the how-to."
   },
   {
    "domain": 1,
    "q": "Which document is a recommendation rather than a requirement?",
    "options": [
     "Policy",
     "Standard",
     "Procedure",
     "Guideline"
    ],
    "correct": 3,
    "explanation": "Guidelines are optional."
   },
   {
    "domain": 1,
    "q": "\"All laptops must use full-disk encryption\" is BEST described as a:",
    "options": [
     "Guideline",
     "Standard",
     "Procedure",
     "Framework"
    ],
    "correct": 1,
    "explanation": "It's a specific mandatory requirement supporting a policy."
   },
   {
    "domain": 1,
    "q": "HIPAA, which protects health information in the US, is an example of a:",
    "options": [
     "Framework",
     "Regulation",
     "Guideline",
     "Procedure"
    ],
    "correct": 1,
    "explanation": "HIPAA is US law, which makes it a regulation organizations must comply with."
   },
   {
    "domain": 1,
    "q": "A firewall is which type of control?",
    "options": [
     "Administrative",
     "Technical",
     "Physical",
     "Directive"
    ],
    "correct": 1,
    "explanation": "It's implemented in technology."
   },
   {
    "domain": 1,
    "q": "A security guard at the entrance is which type of control?",
    "options": [
     "Administrative",
     "Technical",
     "Physical",
     "Compensating"
    ],
    "correct": 2,
    "explanation": "Guards, fences and locks are physical controls."
   },
   {
    "domain": 1,
    "q": "Security awareness training is which type of control?",
    "options": [
     "Administrative",
     "Technical",
     "Physical",
     "Corrective"
    ],
    "correct": 0,
    "explanation": "Training works through people and process, so it's administrative."
   },
   {
    "domain": 1,
    "q": "Reviewing logs for suspicious activity is which function?",
    "options": [
     "Preventive",
     "Detective",
     "Corrective",
     "Deterrent"
    ],
    "correct": 1,
    "explanation": "It identifies events after they occur."
   },
   {
    "domain": 1,
    "q": "Restoring a server from backup after an attack is which function?",
    "options": [
     "Preventive",
     "Detective",
     "Corrective",
     "Deterrent"
    ],
    "correct": 2,
    "explanation": "Fixing damage after the event is corrective."
   },
   {
    "domain": 1,
    "q": "Under the ISC2 Code of Ethics, which canon comes FIRST?",
    "options": [
     "Provide diligent service to principals",
     "Protect society, the common good and the infrastructure",
     "Advance the profession",
     "Act legally"
    ],
    "correct": 1,
    "explanation": "Protecting society has the highest priority."
   },
   {
    "domain": 1,
    "q": "A company applies patches promptly after learning about a vulnerability. This is an example of:",
    "options": [
     "Due diligence",
     "Due care",
     "Risk avoidance",
     "Non-repudiation"
    ],
    "correct": 1,
    "explanation": "Acting on what you know is due care."
   },
   {
    "domain": 2,
    "q": "Who is ultimately accountable for information security?",
    "options": [
     "The security team",
     "Senior management",
     "The IT manager",
     "External auditors"
    ],
    "correct": 1,
    "explanation": "Accountability sits with senior management and can't be delegated away."
   },
   {
    "domain": 2,
    "q": "What does governance provide?",
    "options": [
     "Firewall rules",
     "Direction and accountability for security",
     "Malware analysis",
     "Backup schedules"
    ],
    "correct": 1,
    "explanation": "Governance decides direction, owners and risk appetite."
   },
   {
    "domain": 2,
    "q": "Which function makes sure an organization meets its laws and contracts and can prove it?",
    "options": [
     "Governance",
     "Risk management",
     "Compliance",
     "Operations"
    ],
    "correct": 2,
    "explanation": "That is compliance."
   },
   {
    "domain": 2,
    "q": "Which is a certifiable information security management standard?",
    "options": [
     "NIST CSF",
     "ISO 27001",
     "CIS Controls",
     "MITRE ATT&CK"
    ],
    "correct": 1,
    "explanation": "Organizations can be certified against ISO 27001."
   },
   {
    "domain": 2,
    "q": "How many functions does NIST CSF 2.0 have?",
    "options": [
     "Four",
     "Five",
     "Six",
     "Eight"
    ],
    "correct": 2,
    "explanation": "Govern, Identify, Protect, Detect, Respond, Recover."
   },
   {
    "domain": 2,
    "q": "What is the purpose of a business impact analysis?",
    "options": [
     "To test firewalls",
     "To identify critical processes and the impact of their downtime",
     "To train users",
     "To choose antivirus software"
    ],
    "correct": 1,
    "explanation": "The BIA tells you what matters and how fast it must recover."
   },
   {
    "domain": 2,
    "q": "What does MTD stand for?",
    "options": [
     "Mean time to detect",
     "Maximum tolerable downtime",
     "Minimum test duration",
     "Managed threat defense"
    ],
    "correct": 1,
    "explanation": "MTD is the longest a process can be down before the damage is unacceptable."
   },
   {
    "domain": 2,
    "q": "Which metric states how quickly a system must be restored?",
    "options": [
     "RPO",
     "RTO",
     "MTD",
     "WRT"
    ],
    "correct": 1,
    "explanation": "The recovery time objective is about time to recover."
   },
   {
    "domain": 2,
    "q": "Which metric states how much data loss is acceptable?",
    "options": [
     "RPO",
     "RTO",
     "MTD",
     "WRT"
    ],
    "correct": 0,
    "explanation": "The recovery point objective is measured as time back to the last good copy."
   },
   {
    "domain": 2,
    "q": "What is work recovery time (WRT)?",
    "options": [
     "Time to detect an incident",
     "Time to verify data and resume work after systems are restored",
     "Time between backups",
     "Time to train staff"
    ],
    "correct": 1,
    "explanation": "WRT comes after the RTO, and the two together must fit within the MTD."
   },
   {
    "domain": 2,
    "q": "Which plan focuses on restoring IT systems and data?",
    "options": [
     "Business continuity plan",
     "Disaster recovery plan",
     "Communication plan",
     "Training plan"
    ],
    "correct": 1,
    "explanation": "DR is the IT part of business continuity."
   },
   {
    "domain": 2,
    "q": "Which recovery site is fastest and most expensive?",
    "options": [
     "Hot",
     "Warm",
     "Cold",
     "Mobile"
    ],
    "correct": 0,
    "explanation": "A hot site has current data and is ready to take over."
   },
   {
    "domain": 2,
    "q": "Which recovery site provides only space and power?",
    "options": [
     "Hot",
     "Warm",
     "Cold",
     "Mirrored"
    ],
    "correct": 2,
    "explanation": "A cold site is the cheapest and slowest option."
   },
   {
    "domain": 2,
    "q": "An incremental backup copies:",
    "options": [
     "Everything",
     "Changes since the last full backup",
     "Changes since the last backup of any kind",
     "Only system files"
    ],
    "correct": 2,
    "explanation": "Incrementals capture changes since the previous backup, whatever its type."
   },
   {
    "domain": 2,
    "q": "What is needed to restore from differential backups?",
    "options": [
     "Every differential",
     "The last full plus the latest differential",
     "Only the latest differential",
     "The first differential only"
    ],
    "correct": 1,
    "explanation": "Each differential contains all changes since the full."
   },
   {
    "domain": 2,
    "q": "Which test runs recovery systems alongside production without interrupting it?",
    "options": [
     "Checklist",
     "Tabletop",
     "Parallel",
     "Full interruption"
    ],
    "correct": 2,
    "explanation": "A parallel test proves the recovery site works without stopping the business."
   },
   {
    "domain": 2,
    "q": "Which DR test is the most realistic but also the riskiest?",
    "options": [
     "Checklist",
     "Tabletop",
     "Simulation",
     "Full interruption"
    ],
    "correct": 3,
    "explanation": "Shutting down production proves the plan, but it can cause a real outage."
   },
   {
    "domain": 2,
    "q": "Phishing by phone call is called:",
    "options": [
     "Smishing",
     "Vishing",
     "Whaling",
     "Spoofing"
    ],
    "correct": 1,
    "explanation": "Voice phishing is vishing."
   },
   {
    "domain": 2,
    "q": "Which metric BEST shows an awareness program is working?",
    "options": [
     "Number of posters printed",
     "Rate at which staff report suspicious emails",
     "Training budget",
     "Number of slides"
    ],
    "correct": 1,
    "explanation": "Reporting is the behavior the program is meant to create."
   },
   {
    "domain": 2,
    "q": "What does a KPI measure?",
    "options": [
     "Future risk",
     "How well something performed",
     "Encryption strength",
     "Network latency"
    ],
    "correct": 1,
    "explanation": "A KPI looks back at performance."
   },
   {
    "domain": 2,
    "q": "What does a KRI do?",
    "options": [
     "Measures training attendance",
     "Warns that a risk is increasing",
     "Counts employees",
     "Reports uptime"
    ],
    "correct": 1,
    "explanation": "A KRI is an early warning."
   },
   {
    "domain": 2,
    "q": "Which control BEST reduces tailgating?",
    "options": [
     "An access control vestibule (mantrap)",
     "Antivirus",
     "Longer passwords",
     "Disk encryption"
    ],
    "correct": 0,
    "explanation": "A vestibule lets only one person through at a time."
   },
   {
    "domain": 3,
    "q": "When a new employee joins, their access should be based on:",
    "options": [
     "What their predecessor had",
     "What their role requires, approved by their manager",
     "Everything, removed later",
     "Whatever they request"
    ],
    "correct": 1,
    "explanation": "Start with least privilege for the role, with approval."
   },
   {
    "domain": 3,
    "q": "An employee changes roles. What must happen to their old access?",
    "options": [
     "Keep it, just in case",
     "Remove it",
     "Double it",
     "Share it with the team"
    ],
    "correct": 1,
    "explanation": "Removing old access prevents privilege creep."
   },
   {
    "domain": 3,
    "q": "An employee resigns. When should their access be disabled?",
    "options": [
     "A month later",
     "On their last day, or immediately if the departure is hostile",
     "Never",
     "At the next annual review"
    ],
    "correct": 1,
    "explanation": "Leaver access must end promptly."
   },
   {
    "domain": 3,
    "q": "Access that builds up as people move between roles is called:",
    "options": [
     "Privilege escalation",
     "Privilege creep",
     "Federation",
     "Delegation"
    ],
    "correct": 1,
    "explanation": "Privilege creep happens slowly and needs reviews to catch."
   },
   {
    "domain": 3,
    "q": "Accounts still active for people who have left are called:",
    "options": [
     "Service accounts",
     "Orphaned accounts",
     "Guest accounts",
     "Shared accounts"
    ],
    "correct": 1,
    "explanation": "Orphaned accounts are a common audit finding."
   },
   {
    "domain": 3,
    "q": "Who should confirm users' access during a recertification?",
    "options": [
     "The users themselves",
     "Data owners or managers",
     "Help desk staff",
     "External vendors"
    ],
    "correct": 1,
    "explanation": "They're accountable for the data and the job."
   },
   {
    "domain": 3,
    "q": "Why should admins have a separate account for admin work?",
    "options": [
     "To get more email",
     "To reduce exposure of powerful rights during everyday tasks",
     "Because licenses require it",
     "To avoid MFA"
    ],
    "correct": 1,
    "explanation": "Everyday browsing with admin rights exposes them to phishing and malware."
   },
   {
    "domain": 3,
    "q": "Giving users only the access they need for their job is:",
    "options": [
     "Need to know",
     "Least privilege",
     "Defense in depth",
     "Due care"
    ],
    "correct": 1,
    "explanation": "That's the definition of least privilege."
   },
   {
    "domain": 3,
    "q": "Limiting someone to the specific data their task requires, even if they're cleared for more, is:",
    "options": [
     "Least privilege",
     "Need to know",
     "Job rotation",
     "Dual control"
    ],
    "correct": 1,
    "explanation": "Need to know restricts what data you can see."
   },
   {
    "domain": 3,
    "q": "Requiring one person to create a payment and another to approve it is:",
    "options": [
     "Separation of duties",
     "Least privilege",
     "Need to know",
     "Job rotation"
    ],
    "correct": 0,
    "explanation": "Splitting a critical process between people is separation of duties."
   },
   {
    "domain": 3,
    "q": "Two employees must each enter their own code to open the vault. What is this?",
    "options": [
     "Dual control",
     "Least privilege",
     "MAC",
     "Single sign-on"
    ],
    "correct": 0,
    "explanation": "Dual control needs two people present to complete one action."
   },
   {
    "domain": 3,
    "q": "What is a security benefit of job rotation?",
    "options": [
     "Lower salaries",
     "Helps detect fraud",
     "Fewer access reviews",
     "Faster logins"
    ],
    "correct": 1,
    "explanation": "A new person in the role may spot irregularities."
   },
   {
    "domain": 3,
    "q": "Why do some organizations require mandatory vacations?",
    "options": [
     "To reduce costs",
     "So fraud that needs daily attention can be detected while the person is away",
     "To avoid training",
     "To reset passwords"
    ],
    "correct": 1,
    "explanation": "Many fraud schemes collapse when the person isn't there to maintain them."
   },
   {
    "domain": 3,
    "q": "In which model does the data owner decide who gets access?",
    "options": [
     "DAC",
     "MAC",
     "RBAC",
     "ABAC"
    ],
    "correct": 0,
    "explanation": "Discretionary access control is owner-driven."
   },
   {
    "domain": 3,
    "q": "Which model uses labels and clearances enforced by the system?",
    "options": [
     "DAC",
     "MAC",
     "RBAC",
     "ABAC"
    ],
    "correct": 1,
    "explanation": "Mandatory access control."
   },
   {
    "domain": 3,
    "q": "Which model assigns permissions to job roles?",
    "options": [
     "DAC",
     "MAC",
     "RBAC",
     "ABAC"
    ],
    "correct": 2,
    "explanation": "Role-based access control."
   },
   {
    "domain": 3,
    "q": "Which model makes decisions using attributes such as location, time and device?",
    "options": [
     "DAC",
     "MAC",
     "RBAC",
     "ABAC"
    ],
    "correct": 3,
    "explanation": "Attribute-based access control."
   },
   {
    "domain": 3,
    "q": "Which model is most common for managing access by job function in businesses?",
    "options": [
     "MAC",
     "RBAC",
     "DAC",
     "Rule of thumb"
    ],
    "correct": 1,
    "explanation": "RBAC scales well for organizations with many employees."
   },
   {
    "domain": 3,
    "q": "A hardware token that generates codes is which factor?",
    "options": [
     "Something you know",
     "Something you have",
     "Something you are",
     "Somewhere you are"
    ],
    "correct": 1,
    "explanation": "It's a physical item you possess."
   },
   {
    "domain": 3,
    "q": "A fingerprint is which factor?",
    "options": [
     "Something you know",
     "Something you have",
     "Something you are",
     "Something you do"
    ],
    "correct": 2,
    "explanation": "Biometrics are something you are."
   },
   {
    "domain": 3,
    "q": "Which combination is multi-factor authentication?",
    "options": [
     "Password and PIN",
     "Password and fingerprint",
     "Two passwords",
     "PIN and security question"
    ],
    "correct": 1,
    "explanation": "Knowledge plus biometrics are two different factor types."
   },
   {
    "domain": 3,
    "q": "Account lockout after several failed logins MAINLY protects against:",
    "options": [
     "Phishing",
     "Password guessing",
     "Malware",
     "Data loss"
    ],
    "correct": 1,
    "explanation": "Lockout stops repeated guessing attempts."
   },
   {
    "domain": 3,
    "q": "A company rolls out single sign-on. Which control BEST reduces its main risk?",
    "options": [
     "Removing passwords entirely",
     "Strong MFA on the single sign-on login",
     "Longer session timeouts",
     "One shared account per team"
    ],
    "correct": 1,
    "explanation": "With SSO, one credential opens many systems, so that one login needs the strongest protection."
   },
   {
    "domain": 3,
    "q": "What should happen to initial passwords set for new accounts?",
    "options": [
     "Keep them forever",
     "Make them unique and require a change at first login",
     "Use the same one for everyone",
     "Write them on the badge"
    ],
    "correct": 1,
    "explanation": "Shared or permanent initial passwords are an easy way in."
   },
   {
    "domain": 3,
    "q": "Which practice is BEST for service accounts used by applications?",
    "options": [
     "Share the password with all admins",
     "Least privilege, a named owner and monitoring",
     "Allow interactive login for everyone",
     "Never change the password"
    ],
    "correct": 1,
    "explanation": "Service accounts are powerful and often forgotten, so they need ownership and least privilege."
   },
   {
    "domain": 4,
    "q": "HTTP operates at which OSI layer?",
    "options": [
     "Layer 3",
     "Layer 4",
     "Layer 7",
     "Layer 2"
    ],
    "correct": 2,
    "explanation": "HTTP is an Application layer protocol."
   },
   {
    "domain": 4,
    "q": "Which address is used at Layer 2?",
    "options": [
     "IP address",
     "MAC address",
     "Port number",
     "URL"
    ],
    "correct": 1,
    "explanation": "Data Link uses MAC addresses."
   },
   {
    "domain": 4,
    "q": "TCP and UDP operate at which layer?",
    "options": [
     "Network",
     "Transport",
     "Session",
     "Data Link"
    ],
    "correct": 1,
    "explanation": "They're Layer 4 protocols."
   },
   {
    "domain": 4,
    "q": "A router operates mainly at which layer?",
    "options": [
     "Layer 1",
     "Layer 2",
     "Layer 3",
     "Layer 7"
    ],
    "correct": 2,
    "explanation": "Routers use IP addresses, which belong to Layer 3."
   },
   {
    "domain": 4,
    "q": "Cables and electrical signals belong to which OSI layer?",
    "options": [
     "Physical",
     "Data Link",
     "Network",
     "Session"
    ],
    "correct": 0,
    "explanation": "Layer 1 is Physical."
   },
   {
    "domain": 4,
    "q": "The TCP/IP Internet layer corresponds to which OSI layer?",
    "options": [
     "Transport",
     "Network",
     "Data Link",
     "Application"
    ],
    "correct": 1,
    "explanation": "Both handle IP addressing and routing."
   },
   {
    "domain": 4,
    "q": "Which protocol guarantees ordered, reliable delivery?",
    "options": [
     "UDP",
     "TCP",
     "ICMP",
     "ARP"
    ],
    "correct": 1,
    "explanation": "TCP acknowledges and retransmits data."
   },
   {
    "domain": 4,
    "q": "DNS uses which port?",
    "options": [
     "21",
     "25",
     "53",
     "443"
    ],
    "correct": 2,
    "explanation": "DNS uses port 53."
   },
   {
    "domain": 4,
    "q": "SMTP, used to send email, uses which port by default?",
    "options": [
     "25",
     "53",
     "110",
     "3389"
    ],
    "correct": 0,
    "explanation": "SMTP uses port 25."
   },
   {
    "domain": 4,
    "q": "FTP uses which ports?",
    "options": [
     "20 and 21",
     "22 and 23",
     "80 and 443",
     "53 and 67"
    ],
    "correct": 0,
    "explanation": "FTP uses 20 for data and 21 for control."
   },
   {
    "domain": 4,
    "q": "Encrypted web traffic normally uses which port?",
    "options": [
     "80",
     "443",
     "8080",
     "22"
    ],
    "correct": 1,
    "explanation": "HTTPS uses 443."
   },
   {
    "domain": 4,
    "q": "Which protocol transfers files securely over SSH?",
    "options": [
     "FTP",
     "TFTP",
     "SFTP",
     "HTTP"
    ],
    "correct": 2,
    "explanation": "SFTP runs over SSH on port 22."
   },
   {
    "domain": 4,
    "q": "How long is an IPv4 address?",
    "options": [
     "32 bits",
     "64 bits",
     "128 bits",
     "48 bits"
    ],
    "correct": 0,
    "explanation": "IPv4 addresses are 32-bit."
   },
   {
    "domain": 4,
    "q": "Which range is private IPv4 address space?",
    "options": [
     "8.0.0.0 to 8.255.255.255",
     "10.0.0.0 to 10.255.255.255",
     "100.0.0.0 to 100.255.255.255",
     "200.0.0.0 to 200.255.255.255"
    ],
    "correct": 1,
    "explanation": "10.0.0.0/8 is one of the three private ranges."
   },
   {
    "domain": 4,
    "q": "What does a stateful firewall track?",
    "options": [
     "User passwords",
     "The state of network connections",
     "Disk usage",
     "Email content"
    ],
    "correct": 1,
    "explanation": "It knows whether a packet belongs to an established session."
   },
   {
    "domain": 4,
    "q": "What is a web application firewall designed to protect?",
    "options": [
     "Wi-Fi networks",
     "Web applications",
     "Email servers only",
     "Physical doors"
    ],
    "correct": 1,
    "explanation": "A WAF filters HTTP traffic to stop attacks such as SQL injection."
   },
   {
    "domain": 4,
    "q": "Why are public web servers usually placed in a DMZ instead of the internal network?",
    "options": [
     "Backups run faster there",
     "A compromised web server can't directly reach internal systems",
     "DMZs don't need firewalls",
     "It removes the need for patching"
    ],
    "correct": 1,
    "explanation": "The DMZ keeps internet-facing systems separated from the internal network."
   },
   {
    "domain": 4,
    "q": "What does a VLAN do?",
    "options": [
     "Encrypts traffic",
     "Logically separates networks on the same physical switches",
     "Speeds up the internet",
     "Replaces firewalls"
    ],
    "correct": 1,
    "explanation": "VLANs create separate broadcast domains on shared hardware."
   },
   {
    "domain": 4,
    "q": "Zero trust assumes:",
    "options": [
     "The internal network is safe",
     "No user or device is trusted by default",
     "Firewalls are unnecessary",
     "VPN users are trusted"
    ],
    "correct": 1,
    "explanation": "Every request has to be verified."
   },
   {
    "domain": 4,
    "q": "Defense in depth means:",
    "options": [
     "One strong control",
     "Several layered, independent controls",
     "Encrypting data twice",
     "Deep packet inspection"
    ],
    "correct": 1,
    "explanation": "Layers mean one failure isn't fatal."
   },
   {
    "domain": 4,
    "q": "Why is WEP not recommended?",
    "options": [
     "It's too slow",
     "Its encryption is broken",
     "It needs a RADIUS server",
     "It only works with IPv6"
    ],
    "correct": 1,
    "explanation": "WEP can be cracked in minutes."
   },
   {
    "domain": 4,
    "q": "What does 802.1X provide in a wireless network?",
    "options": [
     "Faster speeds",
     "Network access control with individual credentials",
     "A longer range",
     "A hidden network name"
    ],
    "correct": 1,
    "explanation": "Each user authenticates individually, usually through RADIUS."
   },
   {
    "domain": 4,
    "q": "A fake access point that copies a legitimate network's name is called:",
    "options": [
     "A rogue AP",
     "An evil twin",
     "A honeypot",
     "A repeater"
    ],
    "correct": 1,
    "explanation": "An evil twin tricks users into connecting to the attacker."
   },
   {
    "domain": 4,
    "q": "Why are IoT devices often risky?",
    "options": [
     "They're too expensive",
     "They often have default passwords and rarely get patched",
     "They use too much bandwidth",
     "They need admin rights"
    ],
    "correct": 1,
    "explanation": "Weak defaults and missing updates make them easy targets."
   },
   {
    "domain": 4,
    "q": "In IaaS, who patches the guest operating system?",
    "options": [
     "The cloud provider",
     "The customer",
     "The ISP",
     "Nobody"
    ],
    "correct": 1,
    "explanation": "In IaaS, the operating system is the customer's job."
   },
   {
    "domain": 4,
    "q": "Under shared responsibility, what does the cloud provider ALWAYS secure?",
    "options": [
     "Customer data",
     "User access rights",
     "The physical data centers",
     "Customer passwords"
    ],
    "correct": 2,
    "explanation": "Physical infrastructure is always the provider's job."
   },
   {
    "domain": 5,
    "q": "Why classify data?",
    "options": [
     "To delete it faster",
     "So it can be protected according to its sensitivity",
     "To make it public",
     "To compress it"
    ],
    "correct": 1,
    "explanation": "Classification drives the handling rules."
   },
   {
    "domain": 5,
    "q": "Which control BEST protects data in transit?",
    "options": [
     "Full-disk encryption",
     "TLS",
     "Hashing",
     "Data masking"
    ],
    "correct": 1,
    "explanation": "TLS encrypts data as it moves across networks."
   },
   {
    "domain": 5,
    "q": "Which control BEST protects data at rest on a laptop?",
    "options": [
     "TLS",
     "Full-disk encryption",
     "A VPN",
     "A firewall"
    ],
    "correct": 1,
    "explanation": "Disk encryption protects stored data if the device is lost."
   },
   {
    "domain": 5,
    "q": "AES is:",
    "options": [
     "An asymmetric algorithm",
     "A symmetric algorithm",
     "A hashing algorithm",
     "A protocol"
    ],
    "correct": 1,
    "explanation": "AES uses one shared key."
   },
   {
    "domain": 5,
    "q": "RSA is:",
    "options": [
     "A symmetric algorithm",
     "An asymmetric algorithm",
     "A hashing algorithm",
     "A firewall"
    ],
    "correct": 1,
    "explanation": "RSA uses public and private key pairs."
   },
   {
    "domain": 5,
    "q": "Which property does a cryptographic hash have?",
    "options": [
     "It can be decrypted with a key",
     "It's one-way, with a fixed-length output",
     "It needs a key pair",
     "Its output length varies with the input"
    ],
    "correct": 1,
    "explanation": "You can't reverse a hash, and its length is fixed."
   },
   {
    "domain": 5,
    "q": "To send Bob a message only he can read, encrypt it with:",
    "options": [
     "Your private key",
     "Your public key",
     "Bob's public key",
     "Bob's private key"
    ],
    "correct": 2,
    "explanation": "Only Bob's private key can decrypt it."
   },
   {
    "domain": 5,
    "q": "What is cryptographic erasure?",
    "options": [
     "Overwriting a disk ten times",
     "Destroying the encryption keys so the encrypted data can't be read",
     "Degaussing a tape",
     "Shredding paper"
    ],
    "correct": 1,
    "explanation": "Without the key, encrypted data is unreadable."
   },
   {
    "domain": 5,
    "q": "Degaussing is effective on:",
    "options": [
     "Solid-state drives",
     "Magnetic hard drives and tapes",
     "Paper",
     "Optical discs"
    ],
    "correct": 1,
    "explanation": "It disrupts magnetic storage. It doesn't reliably erase flash memory."
   },
   {
    "domain": 5,
    "q": "What does a SIEM do?",
    "options": [
     "Blocks all attacks",
     "Collects and correlates logs to detect suspicious activity",
     "Encrypts files",
     "Backs up servers"
    ],
    "correct": 1,
    "explanation": "It's a detection and correlation tool."
   },
   {
    "domain": 5,
    "q": "How can you BEST protect the integrity of logs?",
    "options": [
     "Let admins edit them",
     "Send them to a central server with restricted access",
     "Delete them weekly",
     "Keep them only on each device"
    ],
    "correct": 1,
    "explanation": "Central, restricted storage makes tampering harder."
   },
   {
    "domain": 5,
    "q": "When triaging alerts, what should drive priority?",
    "options": [
     "The order they arrived in",
     "Severity and the importance of the affected asset",
     "The analyst's preference",
     "The alert's color"
    ],
    "correct": 1,
    "explanation": "Critical assets and high severity come first."
   },
   {
    "domain": 5,
    "q": "Which threat actor is MOST associated with espionage?",
    "options": [
     "Hacktivists",
     "Nation-states",
     "Unskilled attackers",
     "Spammers"
    ],
    "correct": 1,
    "explanation": "Governments run long-term espionage campaigns."
   },
   {
    "domain": 5,
    "q": "Which is an indicator of compromise (IOC)?",
    "options": [
     "A strong password",
     "A known malicious IP address in your logs",
     "A patched server",
     "A security policy"
    ],
    "correct": 1,
    "explanation": "IOCs are evidence that an attack may have happened."
   },
   {
    "domain": 5,
    "q": "In NIST's incident response life cycle, which phase comes right after preparation?",
    "options": [
     "Containment",
     "Detection and analysis",
     "Recovery",
     "Lessons learned"
    ],
    "correct": 1,
    "explanation": "You can't respond to what you haven't detected."
   },
   {
    "domain": 5,
    "q": "Which is a containment action?",
    "options": [
     "Writing the final report",
     "Isolating an infected host from the network",
     "Buying new hardware",
     "Training users"
    ],
    "correct": 1,
    "explanation": "Containment stops the spread."
   },
   {
    "domain": 5,
    "q": "Which is an eradication action?",
    "options": [
     "Isolating a host",
     "Removing malware and closing the exploited weakness",
     "Restoring from backup",
     "Holding a meeting"
    ],
    "correct": 1,
    "explanation": "Eradication removes the cause."
   },
   {
    "domain": 5,
    "q": "What is the purpose of a lessons-learned review?",
    "options": [
     "To assign blame",
     "To improve processes and prevent the incident from happening again",
     "To close the ticket faster",
     "To delete evidence"
    ],
    "correct": 1,
    "explanation": "It feeds improvements back into preparation."
   },
   {
    "domain": 5,
    "q": "What should be done about an end-of-life system that can't be replaced yet?",
    "options": [
     "Ignore it",
     "Isolate it and add compensating controls",
     "Connect it to the internet",
     "Remove its logging"
    ],
    "correct": 1,
    "explanation": "Reduce exposure until it can be replaced."
   },
   {
    "domain": 5,
    "q": "What is the purpose of change management?",
    "options": [
     "To slow down IT",
     "To prevent unauthorized or untested changes from causing problems",
     "To replace backups",
     "To audit salaries"
    ],
    "correct": 1,
    "explanation": "Approved, tested, documented changes reduce outages and security gaps."
   },
   {
    "domain": 5,
    "q": "How does a vulnerability scan differ from a penetration test?",
    "options": [
     "A scan exploits weaknesses",
     "A scan identifies known weaknesses without exploiting them",
     "A scan needs no tools",
     "A scan is always manual"
    ],
    "correct": 1,
    "explanation": "Penetration tests go further and exploit to prove impact."
   },
   {
    "domain": 5,
    "q": "What does a red team do?",
    "options": [
     "Defends the network",
     "Simulates attackers",
     "Writes policies",
     "Manages backups"
    ],
    "correct": 1,
    "explanation": "Red attacks, blue defends, purple works together."
   }
  ]
 },
 "mock-2": {
  "title": "Mock exam 2: full timed CC exam",
  "day": 27,
  "domain": null,
  "mode": "mock",
  "minutes": 120,
  "target": 80,
  "next": "Next: Day 28, final repair or catch-up, then light review on Day 29.",
  "questions": [
   {
    "domain": 1,
    "q": "A cloud storage provider loses customer files in a hardware failure, and no other copies exist. Which principle failed MOST?",
    "options": [
     "Confidentiality",
     "Integrity",
     "Availability",
     "Non-repudiation"
    ],
    "correct": 2,
    "explanation": "The data can no longer be accessed by the people who need it."
   },
   {
    "domain": 1,
    "q": "An employee accidentally emails a salary spreadsheet to the whole company. Which principle is violated?",
    "options": [
     "Confidentiality",
     "Integrity",
     "Availability",
     "Accountability"
    ],
    "correct": 0,
    "explanation": "Information reached people who weren't authorized to see it."
   },
   {
    "domain": 1,
    "q": "A database error silently changes order amounts. Which principle is affected?",
    "options": [
     "Confidentiality",
     "Integrity",
     "Availability",
     "Privacy"
    ],
    "correct": 1,
    "explanation": "The data is no longer accurate."
   },
   {
    "domain": 1,
    "q": "Which BEST supports non-repudiation for actions taken in a business application?",
    "options": [
     "A shared admin account",
     "Unique user IDs combined with audit logging",
     "Longer passwords",
     "A perimeter firewall"
    ],
    "correct": 1,
    "explanation": "Each action can be tied to one person who can't credibly deny it."
   },
   {
    "domain": 1,
    "q": "Your manager asks you to switch off a security control \"just this once\" to meet a deadline. What should you do FIRST?",
    "options": [
     "Switch it off quietly",
     "Decline and raise it through the proper approval process",
     "Switch it off permanently",
     "Ignore the request without a word"
    ],
    "correct": 1,
    "explanation": "Follow the process. Exceptions need documented approval from someone with authority."
   },
   {
    "domain": 1,
    "q": "A company keeps customer data for years after it's no longer needed. Which privacy principle does this breach?",
    "options": [
     "Storage limitation",
     "Availability",
     "Non-repudiation",
     "Least privilege"
    ],
    "correct": 0,
    "explanation": "Personal data should be kept only as long as it's needed."
   },
   {
    "domain": 1,
    "q": "Which of these is an asset?",
    "options": [
     "A phishing campaign",
     "The customer database",
     "An unpatched server's weakness",
     "A hacker group"
    ],
    "correct": 1,
    "explanation": "Assets are what you protect."
   },
   {
    "domain": 1,
    "q": "A ransomware gang is BEST described as a:",
    "options": [
     "Vulnerability",
     "Threat actor",
     "Control",
     "Residual risk"
    ],
    "correct": 1,
    "explanation": "It's a source of potential harm."
   },
   {
    "domain": 1,
    "q": "Laptops without disk encryption are an example of a:",
    "options": [
     "Threat",
     "Vulnerability",
     "Risk response",
     "Control"
    ],
    "correct": 1,
    "explanation": "It's a weakness that a thief could exploit."
   },
   {
    "domain": 1,
    "q": "A team estimates a breach would cost 200,000 EUR and is likely once every four years. What kind of analysis is this?",
    "options": [
     "Qualitative",
     "Quantitative",
     "Subjective",
     "Descriptive"
    ],
    "correct": 1,
    "explanation": "Money and frequency figures make it quantitative."
   },
   {
    "domain": 1,
    "q": "What is the MAIN purpose of a risk register?",
    "options": [
     "To list employees",
     "To record risks, their owners and how they're treated",
     "To store passwords",
     "To log firewall events"
    ],
    "correct": 1,
    "explanation": "It's the central record for managing risks."
   },
   {
    "domain": 1,
    "q": "Who is a risk owner?",
    "options": [
     "Whoever found the risk",
     "The person accountable for managing a specific risk",
     "The auditor",
     "The attacker"
    ],
    "correct": 1,
    "explanation": "Each risk needs someone accountable for its treatment."
   },
   {
    "domain": 1,
    "q": "Who sets the organization's risk appetite?",
    "options": [
     "Individual developers",
     "Senior leadership or the board",
     "The help desk",
     "The vendor"
    ],
    "correct": 1,
    "explanation": "Appetite is a governance decision."
   },
   {
    "domain": 1,
    "q": "Applying a security patch to fix a vulnerability is which risk response?",
    "options": [
     "Avoidance",
     "Mitigation",
     "Transference",
     "Acceptance"
    ],
    "correct": 1,
    "explanation": "It reduces the likelihood of exploitation."
   },
   {
    "domain": 1,
    "q": "A company retires an insecure legacy application entirely. Which risk response is this?",
    "options": [
     "Avoidance",
     "Mitigation",
     "Transference",
     "Acceptance"
    ],
    "correct": 0,
    "explanation": "Removing the activity removes the risk."
   },
   {
    "domain": 1,
    "q": "What is inherent risk?",
    "options": [
     "Risk after controls",
     "Risk before any controls are applied",
     "Risk that was transferred",
     "Risk that was accepted"
    ],
    "correct": 1,
    "explanation": "Inherent risk is the starting point. Residual risk is what's left after controls."
   },
   {
    "domain": 1,
    "q": "A policy requires employees to lock their screens when they step away. Which type of control is the policy?",
    "options": [
     "Technical",
     "Administrative",
     "Physical",
     "Detective"
    ],
    "correct": 1,
    "explanation": "Policies are administrative controls."
   },
   {
    "domain": 1,
    "q": "What is a baseline?",
    "options": [
     "An optional tip",
     "A minimum security configuration for a type of system",
     "A law",
     "A recovery site"
    ],
    "correct": 1,
    "explanation": "Baselines define the minimum settings every system of that type must meet."
   },
   {
    "domain": 1,
    "q": "GDPR is an example of a:",
    "options": [
     "Framework",
     "Regulation",
     "Guideline",
     "Procedure"
    ],
    "correct": 1,
    "explanation": "It's EU law."
   },
   {
    "domain": 1,
    "q": "A perimeter fence is which type of control?",
    "options": [
     "Technical",
     "Administrative",
     "Physical",
     "Directive"
    ],
    "correct": 2,
    "explanation": "Fences are physical."
   },
   {
    "domain": 1,
    "q": "An intrusion detection system performs which function?",
    "options": [
     "Preventive",
     "Detective",
     "Corrective",
     "Deterrent"
    ],
    "correct": 1,
    "explanation": "It detects and alerts. It doesn't block."
   },
   {
    "domain": 1,
    "q": "A disaster recovery plan is MAINLY which function of control?",
    "options": [
     "Preventive",
     "Detective",
     "Corrective",
     "Deterrent"
    ],
    "correct": 2,
    "explanation": "It restores operations after an event."
   },
   {
    "domain": 1,
    "q": "A small company can't afford a SIEM, so the manager reviews key logs every Monday. What kind of control is the review?",
    "options": [
     "Compensating",
     "Deterrent",
     "Directive",
     "Preventive"
    ],
    "correct": 0,
    "explanation": "It's an alternative that partly covers the same risk."
   },
   {
    "domain": 1,
    "q": "A friend asks you for the actual questions you saw on your CC exam. What should you do?",
    "options": [
     "Share a few of them",
     "Decline, because exam content is confidential and sharing it breaks your agreement and ethics",
     "Sell them",
     "Post them online anonymously"
    ],
    "correct": 1,
    "explanation": "ISC2 exam content is under NDA, and sharing it violates the Code of Ethics."
   },
   {
    "domain": 1,
    "q": "Your employer wants to ship a product with a flaw that could endanger the public. Under the ISC2 Code of Ethics, what comes first?",
    "options": [
     "Your employer's schedule",
     "Protecting society and public safety",
     "Your bonus",
     "The profession's reputation"
    ],
    "correct": 1,
    "explanation": "The first canon, protecting society, outranks duty to your employer."
   },
   {
    "domain": 1,
    "q": "Before outsourcing payroll, a company reviews the provider's security controls and audit reports. This is:",
    "options": [
     "Due care",
     "Due diligence",
     "Risk avoidance",
     "Acceptance"
    ],
    "correct": 1,
    "explanation": "Investigating before deciding is due diligence."
   },
   {
    "domain": 1,
    "q": "After the review, the company signs a contract requiring the provider to encrypt data and report breaches. This is:",
    "options": [
     "Due diligence",
     "Due care",
     "Transference only",
     "Avoidance"
    ],
    "correct": 1,
    "explanation": "Acting on what you learned is due care."
   },
   {
    "domain": 1,
    "q": "Which BEST describes privacy?",
    "options": [
     "Keeping systems online",
     "An individual's right to control how their personal information is used",
     "Encrypting all data",
     "Logging all access"
    ],
    "correct": 1,
    "explanation": "Privacy is about people's rights over their personal data."
   },
   {
    "domain": 1,
    "q": "Which item does NOT belong to the CIA triad?",
    "options": [
     "Confidentiality",
     "Integrity",
     "Availability",
     "Authorization"
    ],
    "correct": 3,
    "explanation": "Authorization is part of AAA, not CIA."
   },
   {
    "domain": 1,
    "q": "A hospital insists systems stay up even if that means weaker controls during an emergency. Which principle is being prioritized?",
    "options": [
     "Confidentiality",
     "Integrity",
     "Availability",
     "Non-repudiation"
    ],
    "correct": 2,
    "explanation": "Patient care depends on systems being available."
   },
   {
    "domain": 2,
    "q": "The board approves the security budget so that it supports business goals. Which GRC function is this?",
    "options": [
     "Governance",
     "Compliance",
     "Risk management",
     "Operations"
    ],
    "correct": 0,
    "explanation": "Direction and resourcing are governance."
   },
   {
    "domain": 2,
    "q": "An organization gathers evidence that its controls meet ISO 27001 requirements. Which function is this?",
    "options": [
     "Governance",
     "Compliance",
     "Incident response",
     "Change management"
    ],
    "correct": 1,
    "explanation": "Proving conformity with requirements is compliance."
   },
   {
    "domain": 2,
    "q": "Before signing a new supplier, the team rates the supplier's likelihood of a breach and its impact. Which function is this?",
    "options": [
     "Risk management",
     "Compliance",
     "Governance",
     "Recovery"
    ],
    "correct": 0,
    "explanation": "Assessing likelihood and impact is risk management."
   },
   {
    "domain": 2,
    "q": "What are the CIS Controls?",
    "options": [
     "A law",
     "A prioritized set of technical security safeguards",
     "A cloud provider",
     "A type of firewall"
    ],
    "correct": 1,
    "explanation": "They give organizations a practical order for implementing controls."
   },
   {
    "domain": 2,
    "q": "What does a business impact analysis produce for each critical process?",
    "options": [
     "A firewall rule",
     "Recovery targets such as MTD and RTO",
     "A phishing score",
     "A password policy"
    ],
    "correct": 1,
    "explanation": "The BIA sets how fast each process must recover."
   },
   {
    "domain": 2,
    "q": "Payroll can be down for at most three days before the damage is unacceptable. What is this value?",
    "options": [
     "RPO",
     "MTD",
     "WRT",
     "SLA"
    ],
    "correct": 1,
    "explanation": "It's the maximum tolerable downtime."
   },
   {
    "domain": 2,
    "q": "Backups run every six hours. What is the most data you could lose?",
    "options": [
     "About 6 hours",
     "About 1 hour",
     "About 24 hours",
     "None"
    ],
    "correct": 0,
    "explanation": "In the worst case you lose everything since the last backup."
   },
   {
    "domain": 2,
    "q": "What should come before choosing a recovery strategy?",
    "options": [
     "Buying hardware",
     "A business impact analysis",
     "A penetration test",
     "User training"
    ],
    "correct": 1,
    "explanation": "You can't pick a strategy until you know what you need to recover and how fast."
   },
   {
    "domain": 2,
    "q": "A site has hardware installed, but data must be restored before it can be used. What kind of site is it?",
    "options": [
     "Hot",
     "Warm",
     "Cold",
     "Mirrored"
    ],
    "correct": 1,
    "explanation": "Warm sites need some setup before they take over."
   },
   {
    "domain": 2,
    "q": "What is an advantage of cloud-based disaster recovery?",
    "options": [
     "No testing needed",
     "No need to own a second facility, and capacity scales on demand",
     "It's always free",
     "It removes the need for backups"
    ],
    "correct": 1,
    "explanation": "You rent recovery capacity instead of building a site."
   },
   {
    "domain": 2,
    "q": "Which backup type restores fastest?",
    "options": [
     "Full",
     "Incremental",
     "Differential",
     "A mix of incrementals"
    ],
    "correct": 0,
    "explanation": "A full backup restores in one step."
   },
   {
    "domain": 2,
    "q": "Full backup on Sunday, incrementals Monday to Thursday, failure on Friday. What is needed to restore?",
    "options": [
     "Sunday's full only",
     "Sunday's full and Thursday's incremental",
     "Sunday's full and all four incrementals",
     "Thursday's incremental only"
    ],
    "correct": 2,
    "explanation": "Every incremental in the chain is needed."
   },
   {
    "domain": 2,
    "q": "A team walks through a disaster scenario in a meeting room, discussing what each person would do. What is this?",
    "options": [
     "A parallel test",
     "A tabletop exercise",
     "A full interruption test",
     "A penetration test"
    ],
    "correct": 1,
    "explanation": "Tabletop exercises are discussion-based."
   },
   {
    "domain": 2,
    "q": "Why should DR plans be tested regularly?",
    "options": [
     "To satisfy curiosity",
     "To find gaps before a real disaster exposes them",
     "To replace backups",
     "To train attackers"
    ],
    "correct": 1,
    "explanation": "Untested plans often fail when they're needed."
   },
   {
    "domain": 2,
    "q": "Who should be involved in business continuity planning?",
    "options": [
     "Only IT",
     "Business process owners as well as IT",
     "Only external consultants",
     "Only the CEO"
    ],
    "correct": 1,
    "explanation": "The business knows which processes matter and how long they can wait."
   },
   {
    "domain": 2,
    "q": "Someone texts an employee a link to \"confirm a parcel delivery\". What is this?",
    "options": [
     "Vishing",
     "Smishing",
     "Tailgating",
     "Whaling"
    ],
    "correct": 1,
    "explanation": "SMS phishing is smishing."
   },
   {
    "domain": 2,
    "q": "A caller pretends to be a new manager to get an employee's login details. What is this?",
    "options": [
     "Baiting",
     "Pretexting",
     "Shoulder surfing",
     "Dumpster diving"
    ],
    "correct": 1,
    "explanation": "An invented story used to get information is pretexting."
   },
   {
    "domain": 2,
    "q": "Infected USB sticks are left in the company car park in the hope someone plugs one in. What is this?",
    "options": [
     "Baiting",
     "Tailgating",
     "Pretexting",
     "Smishing"
    ],
    "correct": 0,
    "explanation": "Baiting uses something tempting as the lure."
   },
   {
    "domain": 2,
    "q": "Developers take a course on secure coding. Which category is this?",
    "options": [
     "Awareness",
     "Training",
     "Education",
     "Simulation"
    ],
    "correct": 1,
    "explanation": "Role-specific skill building is training."
   },
   {
    "domain": 2,
    "q": "The click rate in phishing simulations rises three months in a row. What is this?",
    "options": [
     "A KPI improving",
     "A key risk indicator warning of growing risk",
     "A compliance requirement",
     "A recovery metric"
    ],
    "correct": 1,
    "explanation": "It signals that risk is increasing."
   },
   {
    "domain": 2,
    "q": "Which BEST measures whether awareness training changed behavior?",
    "options": [
     "Attendance numbers",
     "The rate of reported phishing attempts",
     "Course length",
     "Number of trainers"
    ],
    "correct": 1,
    "explanation": "Reporting is the behavior you want."
   },
   {
    "domain": 2,
    "q": "How should security status be reported to executives?",
    "options": [
     "Raw logs",
     "A short dashboard with trends and the main risks",
     "Packet captures",
     "Every alert in detail"
    ],
    "correct": 1,
    "explanation": "Executives need decisions, not data dumps."
   },
   {
    "domain": 3,
    "q": "The help desk creates a new account by copying an experienced colleague's account. What is the MAIN risk?",
    "options": [
     "Weak password",
     "Excess access inherited from the colleague",
     "Wrong email address",
     "Slow login"
    ],
    "correct": 1,
    "explanation": "Copying accounts copies years of accumulated access."
   },
   {
    "domain": 3,
    "q": "An employee is promoted to team lead. What should happen to their access?",
    "options": [
     "Add the new rights and keep everything",
     "Add the new rights and remove what they no longer need",
     "Delete the account",
     "Nothing"
    ],
    "correct": 1,
    "explanation": "Review and adjust at every move."
   },
   {
    "domain": 3,
    "q": "What is the BEST way to make sure temporary contractor accounts don't outlive the contract?",
    "options": [
     "Trust the contractor",
     "Set account expiry dates",
     "Use one shared contractor account",
     "Review once a year"
    ],
    "correct": 1,
    "explanation": "Automatic expiry works even when people forget."
   },
   {
    "domain": 3,
    "q": "An access review finds 30 active accounts belonging to former employees. Which process is failing?",
    "options": [
     "Joiner",
     "Mover",
     "Leaver",
     "Backup"
    ],
    "correct": 2,
    "explanation": "Leaver deprovisioning isn't working."
   },
   {
    "domain": 3,
    "q": "What does privileged access management (PAM) typically provide?",
    "options": [
     "Free Wi-Fi",
     "Secured, monitored and time-limited use of admin credentials",
     "Password-free accounts for everyone",
     "Faster email"
    ],
    "correct": 1,
    "explanation": "PAM controls and records powerful access."
   },
   {
    "domain": 3,
    "q": "An administrator browses the web while logged in with a domain admin account. What is the MAIN risk?",
    "options": [
     "Slower browsing",
     "Malware could run with admin rights",
     "Higher license cost",
     "None"
    ],
    "correct": 1,
    "explanation": "Admin rights should be used only for admin tasks."
   },
   {
    "domain": 3,
    "q": "A payroll clerk can view salaries only for the department they process. Which principle is applied?",
    "options": [
     "Need to know",
     "Separation of duties",
     "Dual control",
     "Defense in depth"
    ],
    "correct": 0,
    "explanation": "Access is limited to the data the task requires."
   },
   {
    "domain": 3,
    "q": "An application only needs to read a database but was given full write access. Which principle is violated?",
    "options": [
     "Need to know",
     "Least privilege",
     "Job rotation",
     "Non-repudiation"
    ],
    "correct": 1,
    "explanation": "It has more access than its function requires."
   },
   {
    "domain": 3,
    "q": "The same developer writes code and approves it for production. Which principle is missing?",
    "options": [
     "Least privilege",
     "Separation of duties",
     "Need to know",
     "Data minimization"
    ],
    "correct": 1,
    "explanation": "Writing and approving should be split between people."
   },
   {
    "domain": 3,
    "q": "How can separation of duties be defeated?",
    "options": [
     "By encryption",
     "By collusion between two people",
     "By MFA",
     "By access reviews"
    ],
    "correct": 1,
    "explanation": "If the people involved work together, the control stops working."
   },
   {
    "domain": 3,
    "q": "Rotating staff between roles helps MOSTLY with:",
    "options": [
     "Lowering costs",
     "Detecting fraud and reducing reliance on one person",
     "Faster hiring",
     "Removing the need for audits"
    ],
    "correct": 1,
    "explanation": "A new person may notice irregularities."
   },
   {
    "domain": 3,
    "q": "What is a weakness of discretionary access control?",
    "options": [
     "Too rigid",
     "Users may share data with people who shouldn't have it",
     "Requires clearances",
     "Can't be used on PCs"
    ],
    "correct": 1,
    "explanation": "Owners decide, and owners make mistakes."
   },
   {
    "domain": 3,
    "q": "Where is mandatory access control MOST commonly used?",
    "options": [
     "Home networks",
     "Government and military systems with classified data",
     "Social media",
     "Small shops"
    ],
    "correct": 1,
    "explanation": "MAC suits strict, label-based environments."
   },
   {
    "domain": 3,
    "q": "What is a MAIN benefit of role-based access control?",
    "options": [
     "No need for roles",
     "Easier to manage access for many users",
     "Users choose their own access",
     "Uses security labels"
    ],
    "correct": 1,
    "explanation": "Change the role once, and every member gets the change."
   },
   {
    "domain": 3,
    "q": "What is a MAIN benefit of attribute-based access control?",
    "options": [
     "Simplest model",
     "Fine-grained decisions based on context such as time, location and device",
     "No policies needed",
     "Owner-based sharing"
    ],
    "correct": 1,
    "explanation": "ABAC can express detailed, context-aware rules."
   },
   {
    "domain": 3,
    "q": "\"Only the file's owner decides who can open it.\" Which model?",
    "options": [
     "DAC",
     "MAC",
     "RBAC",
     "ABAC"
    ],
    "correct": 0,
    "explanation": "Owner-based is discretionary."
   },
   {
    "domain": 3,
    "q": "\"Users with Secret clearance can read Secret documents, enforced by the system.\" Which model?",
    "options": [
     "DAC",
     "MAC",
     "RBAC",
     "ABAC"
    ],
    "correct": 1,
    "explanation": "Labels and clearances are mandatory access control."
   },
   {
    "domain": 3,
    "q": "\"Cashiers can open the till. Supervisors can open the till and issue refunds.\" Which model?",
    "options": [
     "DAC",
     "MAC",
     "RBAC",
     "ABAC"
    ],
    "correct": 2,
    "explanation": "Permissions follow job roles."
   },
   {
    "domain": 3,
    "q": "A password plus a code from an authenticator app is:",
    "options": [
     "Single-factor",
     "Multi-factor",
     "Biometric",
     "Federated"
    ],
    "correct": 1,
    "explanation": "Knowledge plus possession are two factor types."
   },
   {
    "domain": 3,
    "q": "A smart card is which factor?",
    "options": [
     "Something you know",
     "Something you have",
     "Something you are",
     "Somewhere you are"
    ],
    "correct": 1,
    "explanation": "It's a physical item."
   },
   {
    "domain": 3,
    "q": "Why are biometrics hard to revoke?",
    "options": [
     "They're cheap",
     "You can't change your fingerprint if it's copied",
     "They expire monthly",
     "They need a PIN"
    ],
    "correct": 1,
    "explanation": "Unlike a password, a body feature can't be reissued."
   },
   {
    "domain": 3,
    "q": "Typing your username is which step?",
    "options": [
     "Identification",
     "Authentication",
     "Authorization",
     "Accounting"
    ],
    "correct": 0,
    "explanation": "It's the claim of identity."
   },
   {
    "domain": 3,
    "q": "Logs recording who changed a firewall rule support:",
    "options": [
     "Identification",
     "Authentication",
     "Accounting",
     "Availability"
    ],
    "correct": 2,
    "explanation": "Recording actions is accounting."
   },
   {
    "domain": 3,
    "q": "Employees use one corporate login to reach email, HR and the CRM. What is this?",
    "options": [
     "Multi-factor authentication",
     "Single sign-on",
     "Mandatory access control",
     "Dual control"
    ],
    "correct": 1,
    "explanation": "One login giving access to many applications is SSO."
   },
   {
    "domain": 3,
    "q": "What is the MAIN security benefit of a password manager?",
    "options": [
     "No passwords are needed",
     "Unique, strong passwords for every account",
     "Faster internet",
     "It replaces MFA"
    ],
    "correct": 1,
    "explanation": "Unique passwords stop one leak from opening every account."
   },
   {
    "domain": 4,
    "q": "Which device works mainly at Layer 2?",
    "options": [
     "Router",
     "Switch",
     "Proxy",
     "Load balancer"
    ],
    "correct": 1,
    "explanation": "Switches forward frames by MAC address."
   },
   {
    "domain": 4,
    "q": "Format conversion and encryption belong to which OSI layer?",
    "options": [
     "Session",
     "Presentation",
     "Transport",
     "Network"
    ],
    "correct": 1,
    "explanation": "Layer 6 handles data representation."
   },
   {
    "domain": 4,
    "q": "What does the Session layer manage?",
    "options": [
     "Cabling",
     "Dialogs and sessions between applications",
     "IP addresses",
     "MAC addresses"
    ],
    "correct": 1,
    "explanation": "Layer 5 sets up, maintains and closes sessions."
   },
   {
    "domain": 4,
    "q": "Port numbers are used at which OSI layer?",
    "options": [
     "Network",
     "Transport",
     "Data Link",
     "Physical"
    ],
    "correct": 1,
    "explanation": "Ports identify services at Layer 4."
   },
   {
    "domain": 4,
    "q": "ICMP, used by ping, works at which layer?",
    "options": [
     "Layer 2",
     "Layer 3",
     "Layer 4",
     "Layer 7"
    ],
    "correct": 1,
    "explanation": "ICMP is part of the Network layer."
   },
   {
    "domain": 4,
    "q": "What does ARP do?",
    "options": [
     "Maps domain names to IPs",
     "Maps IP addresses to MAC addresses",
     "Assigns IP addresses",
     "Encrypts traffic"
    ],
    "correct": 1,
    "explanation": "ARP finds the hardware address for a local IP."
   },
   {
    "domain": 4,
    "q": "What does DHCP do?",
    "options": [
     "Encrypts email",
     "Automatically assigns IP addresses to devices",
     "Blocks malware",
     "Resolves names"
    ],
    "correct": 1,
    "explanation": "DHCP hands out IP configuration."
   },
   {
    "domain": 4,
    "q": "Which describes UDP?",
    "options": [
     "Connection-oriented with delivery guarantees",
     "Connectionless, with no delivery guarantee",
     "Encrypted by default",
     "Layer 3"
    ],
    "correct": 1,
    "explanation": "UDP trades reliability for speed."
   },
   {
    "domain": 4,
    "q": "How are IPv6 addresses written?",
    "options": [
     "Decimal",
     "Binary",
     "Hexadecimal",
     "Octal"
    ],
    "correct": 2,
    "explanation": "IPv6 uses hexadecimal groups separated by colons."
   },
   {
    "domain": 4,
    "q": "What does NAT do?",
    "options": [
     "Encrypts traffic",
     "Translates private IP addresses to public ones",
     "Assigns MAC addresses",
     "Filters spam"
    ],
    "correct": 1,
    "explanation": "NAT lets many private devices share public addresses."
   },
   {
    "domain": 4,
    "q": "RDP (port 3389) is open to the internet on a server. What is the MAIN concern?",
    "options": [
     "Slower speeds",
     "It's a common entry point for attackers, including ransomware groups",
     "It disables DNS",
     "It breaks email"
    ],
    "correct": 1,
    "explanation": "Exposed RDP is heavily targeted."
   },
   {
    "domain": 4,
    "q": "Why is Telnet insecure?",
    "options": [
     "It's too slow",
     "It sends data, including passwords, in clear text",
     "It needs IPv6",
     "It only works on Linux"
    ],
    "correct": 1,
    "explanation": "Anyone on the path can read it."
   },
   {
    "domain": 4,
    "q": "Plain HTTP uses which port?",
    "options": [
     "80",
     "443",
     "22",
     "25"
    ],
    "correct": 0,
    "explanation": "HTTP is port 80, HTTPS is 443."
   },
   {
    "domain": 4,
    "q": "What is the effect of DNS cache poisoning?",
    "options": [
     "Faster lookups",
     "Users are sent to an attacker's IP address",
     "Email is encrypted",
     "Disks fill up"
    ],
    "correct": 1,
    "explanation": "Forged DNS answers redirect victims."
   },
   {
    "domain": 4,
    "q": "A basic packet-filtering firewall makes decisions based on:",
    "options": [
     "Application content",
     "IP addresses, ports and protocols",
     "User behavior",
     "File hashes"
    ],
    "correct": 1,
    "explanation": "It looks at header information only."
   },
   {
    "domain": 4,
    "q": "What can a next-generation firewall do that a basic firewall can't?",
    "options": [
     "Route packets",
     "Identify and control specific applications and inspect content",
     "Assign IPs",
     "Store backups"
    ],
    "correct": 1,
    "explanation": "NGFWs are application-aware."
   },
   {
    "domain": 4,
    "q": "What is the MAIN security benefit of network segmentation?",
    "options": [
     "Faster Wi-Fi",
     "It limits lateral movement after a compromise",
     "Fewer IP addresses",
     "No need for passwords"
    ],
    "correct": 1,
    "explanation": "Attackers can't easily jump between zones."
   },
   {
    "domain": 4,
    "q": "Micro-segmentation applies controls:",
    "options": [
     "Only at the internet edge",
     "Down to individual workloads",
     "Only on Wi-Fi",
     "Only to email"
    ],
    "correct": 1,
    "explanation": "Rules apply between single servers or workloads."
   },
   {
    "domain": 4,
    "q": "A zero trust architecture assumes:",
    "options": [
     "The perimeter is enough",
     "A breach may already have happened",
     "Internal users are safe",
     "VPN users are trusted"
    ],
    "correct": 1,
    "explanation": "Design as if attackers are already inside."
   },
   {
    "domain": 4,
    "q": "Network access control can:",
    "options": [
     "Block a device that's missing security updates from joining the network",
     "Encrypt hard drives",
     "Write policies",
     "Replace backups"
    ],
    "correct": 0,
    "explanation": "NAC checks device health before granting access."
   },
   {
    "domain": 4,
    "q": "An employee plugs their own wireless access point into the office network. What is this?",
    "options": [
     "An evil twin",
     "A rogue access point",
     "A honeypot",
     "A DMZ"
    ],
    "correct": 1,
    "explanation": "An unauthorized AP on your network is a rogue AP."
   },
   {
    "domain": 4,
    "q": "What is the MAIN weakness of WPA2 Personal in a large office?",
    "options": [
     "No encryption",
     "Everyone shares one password",
     "It requires RADIUS",
     "It only supports IPv6"
    ],
    "correct": 1,
    "explanation": "One shared password is hard to rotate and can't identify individuals."
   },
   {
    "domain": 4,
    "q": "Which protocol suite is commonly used for site-to-site VPNs?",
    "options": [
     "IPsec",
     "FTP",
     "SMTP",
     "DHCP"
    ],
    "correct": 0,
    "explanation": "IPsec encrypts traffic between networks."
   },
   {
    "domain": 4,
    "q": "Why are industrial control systems hard to secure?",
    "options": [
     "They change every week",
     "They run for years, are hard to patch and must stay available",
     "They have no network connection",
     "They use modern operating systems"
    ],
    "correct": 1,
    "explanation": "Availability comes first, so patching is difficult."
   },
   {
    "domain": 4,
    "q": "In PaaS, what is the customer responsible for?",
    "options": [
     "The physical servers",
     "Their applications and data",
     "The hypervisor",
     "The data center locks"
    ],
    "correct": 1,
    "explanation": "The provider runs the platform. You run what you deploy on it."
   },
   {
    "domain": 4,
    "q": "Which cloud characteristic means you pay for what you use?",
    "options": [
     "Measured service",
     "Resource pooling",
     "Rapid elasticity",
     "Broad network access"
    ],
    "correct": 0,
    "explanation": "Usage is metered and billed."
   },
   {
    "domain": 5,
    "q": "Which data should get the highest classification level?",
    "options": [
     "Public marketing material",
     "Data whose disclosure would cause the most serious harm",
     "Any email",
     "Printed documents"
    ],
    "correct": 1,
    "explanation": "Classification follows the impact of exposure."
   },
   {
    "domain": 5,
    "q": "Who is responsible for deciding a data set's classification?",
    "options": [
     "The help desk",
     "The data owner",
     "Any user",
     "The cloud provider"
    ],
    "correct": 1,
    "explanation": "Owners classify. Custodians protect."
   },
   {
    "domain": 5,
    "q": "A receipt shows a card number as ************1234. What is this?",
    "options": [
     "Encryption",
     "Hashing",
     "Data masking",
     "Degaussing"
    ],
    "correct": 2,
    "explanation": "Masking hides most of the value when displaying it."
   },
   {
    "domain": 5,
    "q": "Why add a salt before hashing passwords?",
    "options": [
     "To make hashing reversible",
     "To stop precomputed (rainbow table) attacks and stop identical passwords having identical hashes",
     "To speed up logins",
     "To compress passwords"
    ],
    "correct": 1,
    "explanation": "A unique salt makes every hash different."
   },
   {
    "domain": 5,
    "q": "What does a digital certificate do?",
    "options": [
     "Encrypts a hard drive",
     "Binds a public key to an identity, vouched for by a certificate authority",
     "Stores passwords",
     "Replaces a firewall"
    ],
    "correct": 1,
    "explanation": "Certificates let you trust whose public key you're using."
   },
   {
    "domain": 5,
    "q": "What does TLS provide for a website?",
    "options": [
     "Antivirus scanning",
     "Encryption in transit and authentication of the server",
     "Backups",
     "Data masking"
    ],
    "correct": 1,
    "explanation": "TLS protects the connection and proves the site's identity."
   },
   {
    "domain": 5,
    "q": "Which sanitization method is designed to resist even laboratory recovery?",
    "options": [
     "Clearing",
     "Purging",
     "Deleting",
     "Formatting"
    ],
    "correct": 1,
    "explanation": "Purging, such as degaussing or cryptographic erase, goes further than clearing."
   },
   {
    "domain": 5,
    "q": "What does a data retention policy define?",
    "options": [
     "Who can log in",
     "How long data is kept and when it's destroyed",
     "Firewall rules",
     "Backup speed"
    ],
    "correct": 1,
    "explanation": "Keep data only as long as required, then dispose of it properly."
   },
   {
    "domain": 5,
    "q": "Which is a typical log source for security monitoring?",
    "options": [
     "Firewall logs",
     "Office floor plans",
     "Marketing slides",
     "Printed invoices"
    ],
    "correct": 0,
    "explanation": "Firewalls, servers, endpoints and applications all feed monitoring."
   },
   {
    "domain": 5,
    "q": "What is alert fatigue?",
    "options": [
     "Too few alerts",
     "Analysts overwhelmed by too many alerts, often false positives",
     "A hardware failure",
     "Expired certificates"
    ],
    "correct": 1,
    "explanation": "Tuning and good triage reduce it."
   },
   {
    "domain": 5,
    "q": "A SIEM links a failed VPN login from abroad with a successful login minutes later. What is this?",
    "options": [
     "Encryption",
     "Correlation",
     "Masking",
     "Hashing"
    ],
    "correct": 1,
    "explanation": "Connecting related events across sources is correlation."
   },
   {
    "domain": 5,
    "q": "Which is an indicator of compromise?",
    "options": [
     "A new hire",
     "A file hash matching known malware",
     "A strong password",
     "A firewall upgrade"
    ],
    "correct": 1,
    "explanation": "Known malicious artifacts suggest compromise."
   },
   {
    "domain": 5,
    "q": "What BEST reduces insider threat?",
    "options": [
     "Shared admin accounts",
     "Least privilege combined with monitoring",
     "No logging",
     "Unlimited USB use"
    ],
    "correct": 1,
    "explanation": "Limit access and watch for misuse."
   },
   {
    "domain": 5,
    "q": "In the Cyber Kill Chain, which stage comes right after delivery?",
    "options": [
     "Reconnaissance",
     "Exploitation",
     "Weaponization",
     "Command and control"
    ],
    "correct": 1,
    "explanation": "Once delivered, the payload exploits a weakness."
   },
   {
    "domain": 5,
    "q": "What is a low-risk way to test an incident response plan?",
    "options": [
     "Launch a real attack",
     "Run a tabletop exercise",
     "Turn off the SIEM",
     "Delete the backups"
    ],
    "correct": 1,
    "explanation": "Tabletops test roles and decisions safely."
   },
   {
    "domain": 5,
    "q": "What document is typically produced after an incident is closed?",
    "options": [
     "A purchase order",
     "A post-incident report with lessons learned",
     "A firewall rule",
     "A user manual"
    ],
    "correct": 1,
    "explanation": "It records what happened and what will change."
   },
   {
    "domain": 5,
    "q": "How should evidence be handled during an investigation?",
    "options": [
     "Anyone can copy it",
     "With a documented chain of custody",
     "Deleted after a week",
     "Emailed to everyone"
    ],
    "correct": 1,
    "explanation": "Chain of custody keeps it trustworthy."
   },
   {
    "domain": 5,
    "q": "Why is an accurate asset inventory important for security?",
    "options": [
     "It's required for payroll",
     "You can't protect what you don't know you have",
     "It speeds up Wi-Fi",
     "It replaces backups"
    ],
    "correct": 1,
    "explanation": "Unknown assets go unpatched and unmonitored."
   },
   {
    "domain": 5,
    "q": "An admin makes an unapproved change and causes an outage. Which process was bypassed?",
    "options": [
     "Incident response",
     "Change management",
     "Access review",
     "Classification"
    ],
    "correct": 1,
    "explanation": "Change management exists to prevent exactly this."
   },
   {
    "domain": 5,
    "q": "In a white box test, the testers:",
    "options": [
     "Know nothing in advance",
     "Get full information, such as source code and network diagrams",
     "Only test physical security",
     "Work without authorization"
    ],
    "correct": 1,
    "explanation": "White box means full knowledge. Black box means none."
   },
   {
    "domain": 5,
    "q": "What does a purple team do?",
    "options": [
     "Attacks only",
     "Defends only",
     "Brings attackers and defenders together to improve detection",
     "Writes policies"
    ],
    "correct": 2,
    "explanation": "Red and blue work together so defenders learn."
   },
   {
    "domain": 5,
    "q": "A vulnerability scan reports a flaw that turns out not to exist. What is this?",
    "options": [
     "A false negative",
     "A false positive",
     "A zero-day",
     "An exploit"
    ],
    "correct": 1,
    "explanation": "Scans can report weaknesses that aren't really there."
   }
  ]
 }
};
