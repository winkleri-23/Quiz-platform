// GENERATED from the CC plan Google Doc (Key terms of every lesson). Do not edit by hand.
export const CC_CARD_CATEGORIES = { d1: "D1 Security Principles", d2: "D2 Governance", d3: "D3 IAM", d4: "D4 Networking and Cloud", d5: "D5 Security Operations" };
export const CC_CARDS = [
 {
  "id": "d2-confidentiality",
  "term": "Confidentiality",
  "category": "d1",
  "day": 2,
  "def": "Only the right people can see it. Broken by a stolen laptop with an unencrypted disk, an email sent to the wrong person, someone reading your screen over your shoulder. Protected by encryption, access control and data classification."
 },
 {
  "id": "d2-integrity",
  "term": "Integrity",
  "category": "d1",
  "day": 2,
  "def": "The data hasn't been changed without authorization, and you can tell if it has. Broken by an attacker editing the bank account number on an invoice, or a corrupted database. Protected by hashing, digital signatures, access control and change management."
 },
 {
  "id": "d2-availability",
  "term": "Availability",
  "category": "d1",
  "day": 2,
  "def": "Authorized people can get to it when they need it. Broken by ransomware, a DDoS attack, a power outage or a deleted backup. Protected by backups, redundancy, disaster recovery plans and patching."
 },
 {
  "id": "d2-non-repudiation",
  "term": "Non-repudiation",
  "category": "d1",
  "day": 2,
  "def": "Someone can't credibly deny they did something. It comes from a digital signature made with a private key only that person holds, backed by logs. A shared password or a shared key can't give you non-repudiation, because you can't prove which person used it."
 },
 {
  "id": "d2-privacy",
  "term": "Privacy",
  "category": "d1",
  "day": 2,
  "def": "A person's right to control how their personal data is collected and used. Confidentiality is a property of the data. Privacy is about people, and laws like GDPR set the rules. You can keep data perfectly confidential and still break privacy, for example by collecting more than you need or using it for something people never agreed to."
 },
 {
  "id": "d3-identification",
  "term": "Identification",
  "category": "d1",
  "day": 3,
  "def": "Claiming who you are. A username, an employee ID, an email address. No proof yet, just a claim."
 },
 {
  "id": "d3-authentication",
  "term": "Authentication",
  "category": "d1",
  "day": 3,
  "def": "Proving the claim. There are three factor types: something you know (password, PIN), something you have (phone, smart card, hardware key) and something you are (fingerprint, face). Multi-factor authentication means two or more different types."
 },
 {
  "id": "d3-authorization",
  "term": "Authorization",
  "category": "d1",
  "day": 3,
  "def": "What you're allowed to do once you're in, decided by permissions, roles and policies. Being authenticated doesn't mean you're authorized."
 },
 {
  "id": "d3-accounting",
  "term": "Accounting",
  "category": "d1",
  "day": 3,
  "def": "Recording what you did, in logs and audit trails. It's what makes people answerable for their actions, and it only works when every person has their own account."
 },
 {
  "id": "d4-asset",
  "term": "Asset",
  "category": "d1",
  "day": 4,
  "def": "What you're protecting: data, systems, people, reputation."
 },
 {
  "id": "d4-threat",
  "term": "Threat",
  "category": "d1",
  "day": 4,
  "def": "Something that could cause harm: an attacker, a flood, a careless employee."
 },
 {
  "id": "d4-vulnerability",
  "term": "Vulnerability",
  "category": "d1",
  "day": 4,
  "def": "A weakness a threat can use: an unpatched server, missing backups, a weak password."
 },
 {
  "id": "d4-risk",
  "term": "Risk",
  "category": "d1",
  "day": 4,
  "def": "The likelihood that a threat uses a vulnerability, combined with the impact if it does. No threat or no vulnerability means no risk."
 },
 {
  "id": "d4-risk-responses-avoid-reduce-transfer-",
  "term": "Risk responses (avoid, reduce, transfer, accept)",
  "category": "d1",
  "day": 4,
  "def": "Avoid (stop the activity), reduce or mitigate (add controls), transfer (insurance or outsourcing) and accept (a documented decision to live with it)."
 },
 {
  "id": "d4-appetite-and-residual-risk",
  "term": "Appetite and residual risk",
  "category": "d1",
  "day": 4,
  "def": "Risk appetite is how much risk leadership is willing to take. Residual risk is what's left after your controls are in place, and it should sit within the appetite."
 },
 {
  "id": "d5-policy",
  "term": "Policy",
  "category": "d1",
  "day": 5,
  "def": "High-level intent from management, for example \"all company data must be classified.\" Mandatory, approved by senior management, and it rarely changes."
 },
 {
  "id": "d5-standard",
  "term": "Standard",
  "category": "d1",
  "day": 5,
  "def": "A specific mandatory requirement that supports a policy, for example \"laptops must use full-disk encryption.\""
 },
 {
  "id": "d5-procedure",
  "term": "Procedure",
  "category": "d1",
  "day": 5,
  "def": "The step-by-step instructions for doing a task, for example how to turn on disk encryption for a new laptop. Mandatory."
 },
 {
  "id": "d5-guideline",
  "term": "Guideline",
  "category": "d1",
  "day": 5,
  "def": "A recommendation. Optional, for example \"consider using a password manager.\""
 },
 {
  "id": "d5-laws-regulations-and-frameworks",
  "term": "Laws, regulations and frameworks",
  "category": "d1",
  "day": 5,
  "def": "Laws and regulations are obligations you must meet (GDPR, NIS2, HIPAA). Frameworks such as ISO 27001 or NIST CSF are structures you choose to follow, or that a contract or regulator requires you to follow."
 },
 {
  "id": "d6-control-types",
  "term": "Control types",
  "category": "d1",
  "day": 6,
  "def": "Administrative (policies, training, background checks), technical (firewalls, encryption, MFA) and physical (locks, guards, fences, cameras)."
 },
 {
  "id": "d6-control-functions",
  "term": "Control functions",
  "category": "d1",
  "day": 6,
  "def": "Preventive (stops it: a lock, a firewall), detective (spots it: logs, an IDS, camera review), corrective (fixes it: restoring a backup, patching), deterrent (discourages it: warning signs, visible cameras) and compensating (an alternative when the normal control isn't possible)."
 },
 {
  "id": "d6-control-type-vs-control-function",
  "term": "Control type vs control function",
  "category": "d1",
  "day": 6,
  "def": "A camera is physical by type and detective (and deterrent) by function. A firewall is technical by type and preventive by function."
 },
 {
  "id": "d6-isc2-code-of-ethics",
  "term": "ISC2 Code of Ethics",
  "category": "d1",
  "day": 6,
  "def": "Four canons in priority order. Protect society, the common good and the infrastructure. Act honorably, honestly, justly, responsibly and legally. Provide diligent and competent service to principals. Advance and protect the profession. When two conflict, the higher one wins."
 },
 {
  "id": "d6-due-diligence-and-due-care",
  "term": "Due diligence and due care",
  "category": "d1",
  "day": 6,
  "def": "Due diligence is finding out what needs to be done (research, assessment). Due care is actually doing it (patching, training, enforcing)."
 },
 {
  "id": "d8-governance",
  "term": "Governance",
  "category": "d2",
  "day": 8,
  "def": "Sets direction and accountability. Leadership decides what matters, assigns owners, approves policies and sets the risk appetite."
 },
 {
  "id": "d8-risk-management",
  "term": "Risk management",
  "category": "d2",
  "day": 8,
  "def": "Identifies, assesses and treats risks so they stay within that appetite."
 },
 {
  "id": "d8-compliance",
  "term": "Compliance",
  "category": "d2",
  "day": 8,
  "def": "Makes sure the organization meets the laws, regulations, contracts and internal policies it's bound by, and can prove it."
 },
 {
  "id": "d8-frameworks-iso-27001-nist-csf-cis-con",
  "term": "Frameworks (ISO 27001, NIST CSF, CIS Controls)",
  "category": "d2",
  "day": 8,
  "def": "ISO 27001 is a management system you can be certified against. NIST CSF organizes security into six functions: Govern, Identify, Protect, Detect, Respond, Recover. The CIS Controls are a prioritized list of technical safeguards."
 },
 {
  "id": "d9-business-continuity-bc",
  "term": "Business continuity (BC)",
  "category": "d2",
  "day": 9,
  "def": "Keeps critical business functions running during and after a disruption: people, processes, locations and suppliers."
 },
 {
  "id": "d9-disaster-recovery-dr",
  "term": "Disaster recovery (DR)",
  "category": "d2",
  "day": 9,
  "def": "Restores the IT systems and data that support those functions. DR is part of BC."
 },
 {
  "id": "d9-business-impact-analysis-bia",
  "term": "Business impact analysis (BIA)",
  "category": "d2",
  "day": 9,
  "def": "Identifies the critical processes and how long each one can be down. It comes first, and it sets the numbers below."
 },
 {
  "id": "d9-mtd",
  "term": "MTD",
  "category": "d2",
  "day": 9,
  "def": "Maximum tolerable downtime, the longest a process can be down before the damage becomes unacceptable."
 },
 {
  "id": "d9-rto",
  "term": "RTO",
  "category": "d2",
  "day": 9,
  "def": "Recovery time objective, how quickly a system must be back."
 },
 {
  "id": "d9-rpo",
  "term": "RPO",
  "category": "d2",
  "day": 9,
  "def": "Recovery point objective, how much data you can afford to lose, measured as time back to the last good copy."
 },
 {
  "id": "d9-wrt",
  "term": "WRT",
  "category": "d2",
  "day": 9,
  "def": "Work recovery time, the time to check the data and get people working again after the systems are back. RTO plus WRT has to fit inside the MTD."
 },
 {
  "id": "d10-full-backup",
  "term": "Full backup",
  "category": "d2",
  "day": 10,
  "def": "Copies everything. Slowest to back up, fastest to restore, because you need only one set."
 },
 {
  "id": "d10-incremental-backup",
  "term": "Incremental backup",
  "category": "d2",
  "day": 10,
  "def": "Copies what changed since the last backup of any kind. Fastest to back up, slowest to restore: you need the full plus every incremental since."
 },
 {
  "id": "d10-differential-backup",
  "term": "Differential backup",
  "category": "d2",
  "day": 10,
  "def": "Copies what changed since the last full backup. To restore, you need the full plus the latest differential."
 },
 {
  "id": "d10-3-2-1-rule",
  "term": "3-2-1 rule",
  "category": "d2",
  "day": 10,
  "def": "Three copies of your data, on two types of media, with one copy off-site. Keep one copy offline or unchangeable too, so ransomware can't reach it."
 },
 {
  "id": "d10-recovery-sites-hot-warm-cold",
  "term": "Recovery sites (hot, warm, cold)",
  "category": "d2",
  "day": 10,
  "def": "A hot site is fully equipped with current data and takes over within hours or less, at the highest cost. A warm site has hardware ready but needs data restored, so recovery takes days. A cold site is space and power only, the cheapest and slowest. Cloud recovery is a common modern alternative."
 },
 {
  "id": "d10-disaster-recovery-tests",
  "term": "Disaster recovery tests",
  "category": "d2",
  "day": 10,
  "def": "Checklist (read-through), tabletop walkthrough, simulation, parallel test (the recovery site runs alongside production), full interruption (production is shut down, the most realistic and the most risky)."
 },
 {
  "id": "d11-social-engineering",
  "term": "Social engineering",
  "category": "d2",
  "day": 11,
  "def": "Manipulating people instead of systems. Phishing (email), vishing (voice calls), smishing (SMS), pretexting (a made-up story) and tailgating (following someone through a secure door)."
 },
 {
  "id": "d11-awareness-training-education",
  "term": "Awareness, training, education",
  "category": "d2",
  "day": 11,
  "def": "Awareness changes attention (posters, phishing simulations). Training builds skills for a specific role. Education builds deep understanding (degrees, certifications)."
 },
 {
  "id": "d11-kpi-and-kri",
  "term": "KPI and KRI",
  "category": "d2",
  "day": 11,
  "def": "A KPI shows how well something performed, such as the share of staff who report phishing. A KRI warns that a risk is growing before it hits, such as a rising click rate in simulations."
 },
 {
  "id": "d11-security-reporting",
  "term": "Security reporting",
  "category": "d2",
  "day": 11,
  "def": "Executives get dashboards with the big picture. Teams get detailed reports and scorecards."
 },
 {
  "id": "d12-joiner-provisioning",
  "term": "Joiner (provisioning)",
  "category": "d3",
  "day": 12,
  "def": "Create the account with the access the role needs, approved by the manager and the data owner."
 },
 {
  "id": "d12-mover-changes",
  "term": "Mover (changes)",
  "category": "d3",
  "day": 12,
  "def": "When someone changes role, add the new access and remove the old. Skipping the removal causes privilege creep."
 },
 {
  "id": "d12-leaver-deprovisioning",
  "term": "Leaver (deprovisioning)",
  "category": "d3",
  "day": 12,
  "def": "Disable access as soon as someone leaves, immediately in a hostile termination. Delete the account later, following retention rules."
 },
 {
  "id": "d12-access-reviews",
  "term": "Access reviews",
  "category": "d3",
  "day": 12,
  "def": "Data owners regularly confirm that each person still needs the access they have."
 },
 {
  "id": "d12-privileged-accounts",
  "term": "Privileged accounts",
  "category": "d3",
  "day": 12,
  "def": "Admin accounts need extra controls: separate admin accounts, MFA, monitoring and access granted only when needed."
 },
 {
  "id": "d13-least-privilege",
  "term": "Least privilege",
  "category": "d3",
  "day": 13,
  "def": "Only the access needed to do the job, nothing more."
 },
 {
  "id": "d13-need-to-know",
  "term": "Need to know",
  "category": "d3",
  "day": 13,
  "def": "Even with the right clearance, you see only the specific data your task requires."
 },
 {
  "id": "d13-separation-of-duties",
  "term": "Separation of duties",
  "category": "d3",
  "day": 13,
  "def": "Split a critical task so no single person can complete it alone. The person who creates a supplier can't also approve its payments."
 },
 {
  "id": "d13-dac-discretionary",
  "term": "DAC (discretionary)",
  "category": "d3",
  "day": 13,
  "def": "The owner of the data decides who gets access, like sharing your own folder."
 },
 {
  "id": "d13-mac-mandatory",
  "term": "MAC (mandatory)",
  "category": "d3",
  "day": 13,
  "def": "The system enforces access using labels and clearances, such as Secret and Top Secret. Users can't change it."
 },
 {
  "id": "d13-rbac-role-based",
  "term": "RBAC (role-based)",
  "category": "d3",
  "day": 13,
  "def": "Permissions are attached to roles, and users are assigned to roles."
 },
 {
  "id": "d13-abac-attribute-based",
  "term": "ABAC (attribute-based)",
  "category": "d3",
  "day": 13,
  "def": "Access is decided by rules on attributes such as department, location, time and device, for example \"finance staff, on a company laptop, during working hours.\""
 },
 {
  "id": "d15-osi-model",
  "term": "OSI model",
  "category": "d4",
  "day": 15,
  "def": "7 Application (HTTP, DNS), 6 Presentation (formats, encryption), 5 Session, 4 Transport (TCP, UDP, ports), 3 Network (IP addresses, routers), 2 Data Link (MAC addresses, switches), 1 Physical (cables, signals)."
 },
 {
  "id": "d15-tcp-ip-model",
  "term": "TCP/IP model",
  "category": "d4",
  "day": 15,
  "def": "Four layers. Application (OSI 5 to 7), Transport (4), Internet (3) and Network Access (1 and 2)."
 },
 {
  "id": "d15-tcp-and-udp",
  "term": "TCP and UDP",
  "category": "d4",
  "day": 15,
  "def": "TCP is connection-oriented and reliable, starting with a three-way handshake (SYN, SYN-ACK, ACK). UDP is connectionless and faster, used for DNS queries, streaming and voice calls."
 },
 {
  "id": "d15-ipv4-and-ipv6",
  "term": "IPv4 and IPv6",
  "category": "d4",
  "day": 15,
  "def": "IPv4 addresses are 32-bit, about 4.3 billion of them, and they ran out. IPv6 addresses are 128-bit and written in hexadecimal. Private IPv4 ranges: 10.x.x.x, 172.16.x.x to 172.31.x.x and 192.168.x.x."
 },
 {
  "id": "d16-port-network",
  "term": "Port (network)",
  "category": "d4",
  "day": 16,
  "def": "A number that tells a machine which service should receive the traffic. The IP address finds the machine, the port finds the service."
 },
 {
  "id": "d16-ports-to-know-for-the-exam",
  "term": "Ports to know for the exam",
  "category": "d4",
  "day": 16,
  "def": "20 and 21 FTP, 22 SSH (and SFTP), 23 Telnet, 25 SMTP, 53 DNS, 80 HTTP, 443 HTTPS, 3389 RDP."
 },
 {
  "id": "d16-secure-protocol-replacements",
  "term": "Secure protocol replacements",
  "category": "d4",
  "day": 16,
  "def": "Telnet becomes SSH, HTTP becomes HTTPS, FTP becomes SFTP or FTPS."
 },
 {
  "id": "d16-dns",
  "term": "DNS",
  "category": "d4",
  "day": 16,
  "def": "Turns names into IP addresses. DNS spoofing or cache poisoning sends users to an attacker's address instead."
 },
 {
  "id": "d16-firewall-types",
  "term": "Firewall types",
  "category": "d4",
  "day": 16,
  "def": "Packet filtering checks addresses and ports one packet at a time. Stateful inspection tracks connections. Application-level and next-generation firewalls understand applications and can inspect content. A web application firewall (WAF) protects web applications."
 },
 {
  "id": "d17-vpn",
  "term": "VPN",
  "category": "d4",
  "day": 17,
  "def": "An encrypted tunnel across an untrusted network. A remote access VPN connects one user to the company. A site-to-site VPN connects office to office. IPsec and TLS are the common protocols."
 },
 {
  "id": "d17-wi-fi-security",
  "term": "Wi-Fi security",
  "category": "d4",
  "day": 17,
  "def": "WEP is broken, never use it. WPA is weak. WPA2 uses AES and is still common. WPA3 is stronger: its SAE handshake protects against offline password guessing."
 },
 {
  "id": "d17-wi-fi-personal-and-enterprise-mode",
  "term": "Wi-Fi Personal and Enterprise mode",
  "category": "d4",
  "day": 17,
  "def": "Personal mode uses one shared password. Enterprise mode uses 802.1X with individual credentials, checked by a RADIUS server."
 },
 {
  "id": "d17-wireless-attacks",
  "term": "Wireless attacks",
  "category": "d4",
  "day": 17,
  "def": "An evil twin is a fake access point with a trusted network name. A rogue access point is an unauthorized one plugged into your network."
 },
 {
  "id": "d17-iot-and-industrial-systems",
  "term": "IoT and industrial systems",
  "category": "d4",
  "day": 17,
  "def": "Smart devices, embedded systems and industrial control systems are hard to secure: they're hard to patch, often ship with default passwords and stay in service for years. The main defense is segmentation."
 },
 {
  "id": "d18-segmentation",
  "term": "Segmentation",
  "category": "d4",
  "day": 18,
  "def": "Splitting a network into zones so one compromise can't reach everything. That can mean firewall zones, VLANs (separate virtual networks on the same switches) or micro-segmentation down to single workloads."
 },
 {
  "id": "d18-dmz",
  "term": "DMZ",
  "category": "d4",
  "day": 18,
  "def": "The zone for systems the internet must reach, such as web servers, placed between the internet and the internal network."
 },
 {
  "id": "d18-defense-in-depth",
  "term": "Defense in depth",
  "category": "d4",
  "day": 18,
  "def": "Layers of independent controls (policy, physical, network, host, application, data), so one failure isn't fatal."
 },
 {
  "id": "d18-zero-trust",
  "term": "Zero trust",
  "category": "d4",
  "day": 18,
  "def": "Never trust, always verify. Every request is authenticated and authorized, access is least privilege, and you design as if attackers are already inside. Being on the internal network earns no trust."
 },
 {
  "id": "d18-network-access-control-nac",
  "term": "Network access control (NAC)",
  "category": "d4",
  "day": 18,
  "def": "Checks a device's identity and health, such as its patch level, before letting it onto the network."
 },
 {
  "id": "d19-cloud-computing-characteristics",
  "term": "Cloud computing characteristics",
  "category": "d4",
  "day": 19,
  "def": "On-demand self-service, broad network access, resource pooling, rapid elasticity and measured service."
 },
 {
  "id": "d19-cloud-service-models-iaas-paas-saas",
  "term": "Cloud service models (IaaS, PaaS, SaaS)",
  "category": "d4",
  "day": 19,
  "def": "IaaS gives you virtual machines, and you manage the operating system and everything above it. PaaS gives you a platform, and you manage your applications and data. SaaS gives you finished software, and you manage your data and who can access it."
 },
 {
  "id": "d19-cloud-deployment-models",
  "term": "Cloud deployment models",
  "category": "d4",
  "day": 19,
  "def": "Public, private, hybrid and community."
 },
 {
  "id": "d19-cloud-shared-responsibility",
  "term": "Cloud shared responsibility",
  "category": "d4",
  "day": 19,
  "def": "The provider secures the cloud itself: buildings, hardware, the virtualization layer. You secure what you put in it. Whatever the model, your data, identities and access stay yours."
 },
 {
  "id": "d19-most-common-cloud-failure",
  "term": "Most common cloud failure",
  "category": "d4",
  "day": 19,
  "def": "Misconfiguration, such as a storage bucket accidentally left open to the public."
 },
 {
  "id": "d20-data-life-cycle",
  "term": "Data life cycle",
  "category": "d5",
  "day": 20,
  "def": "Create, store, use, share, archive, destroy."
 },
 {
  "id": "d20-classification-and-labeling",
  "term": "Classification and labeling",
  "category": "d5",
  "day": 20,
  "def": "Classify data by sensitivity (for example public, internal, confidential, restricted). Labels make the class visible so the right handling rules apply."
 },
 {
  "id": "d20-data-states",
  "term": "Data states",
  "category": "d5",
  "day": 20,
  "def": "At rest (protect with storage encryption), in transit (TLS, VPN) and in use (access control and memory protection)."
 },
 {
  "id": "d20-symmetric-encryption",
  "term": "Symmetric encryption",
  "category": "d5",
  "day": 20,
  "def": "One shared key, fast, for example AES. The hard part is sharing the key securely."
 },
 {
  "id": "d20-asymmetric-encryption",
  "term": "Asymmetric encryption",
  "category": "d5",
  "day": 20,
  "def": "A key pair. The public key encrypts and the private key decrypts, and the private key signs. Slower, but it solves key exchange and makes digital signatures possible (RSA, elliptic curve)."
 },
 {
  "id": "d20-hashing",
  "term": "Hashing",
  "category": "d5",
  "day": 20,
  "def": "A one-way fingerprint, such as SHA-256, used to prove integrity. It isn't encryption and can't be reversed."
 },
 {
  "id": "d20-data-destruction",
  "term": "Data destruction",
  "category": "d5",
  "day": 20,
  "def": "Clearing (overwriting), purging (degaussing, cryptographic erase) and physical destruction (shredding) for the highest assurance. Post-quantum cryptography means new algorithms designed to resist future quantum computers."
 },
 {
  "id": "d21-logging-and-monitoring",
  "term": "Logging and monitoring",
  "category": "d5",
  "day": 21,
  "def": "Collect logs from systems, network devices and applications. Protect them from tampering, and synchronize clocks (NTP) so events line up."
 },
 {
  "id": "d21-siem",
  "term": "SIEM",
  "category": "d5",
  "day": 21,
  "def": "Collects and correlates logs from many sources to spot suspicious patterns and raise alerts."
 },
 {
  "id": "d21-alert-triage",
  "term": "Alert triage",
  "category": "d5",
  "day": 21,
  "def": "Deciding which alerts to handle first, by severity, the value of the affected asset and correlation with other events. Many alerts are false positives, and tuning reduces the noise."
 },
 {
  "id": "d21-threat-actors",
  "term": "Threat actors",
  "category": "d5",
  "day": 21,
  "def": "Nation-states (espionage, sabotage), organized crime (money), hacktivists (a cause), insiders (a grudge, money or mistakes) and unskilled attackers using tools others wrote."
 },
 {
  "id": "d21-threat-intelligence-and-frameworks",
  "term": "Threat intelligence and frameworks",
  "category": "d5",
  "day": 21,
  "def": "Threat intelligence tells you who is likely to attack and how. MITRE ATT\\&CK catalogs attacker techniques. The Cyber Kill Chain describes an attack in seven stages, from reconnaissance to actions on objectives."
 },
 {
  "id": "d22-incident-response-life-cycle",
  "term": "Incident response life cycle",
  "category": "d5",
  "day": 22,
  "def": "Preparation; detection and analysis; containment, eradication and recovery; post-incident activity (lessons learned)."
 },
 {
  "id": "d22-event-and-incident",
  "term": "Event and incident",
  "category": "d5",
  "day": 22,
  "def": "An event is anything observable that happens. An incident is an event that harms, or threatens, confidentiality, integrity or availability."
 },
 {
  "id": "d22-containment-and-evidence",
  "term": "Containment and evidence",
  "category": "d5",
  "day": 22,
  "def": "Once an incident is confirmed, contain it first, then remove the cause. Preserve evidence and keep a chain of custody."
 },
 {
  "id": "d22-testing-the-incident-response-plan",
  "term": "Testing the incident response plan",
  "category": "d5",
  "day": 22,
  "def": "Tabletop exercises and simulations show whether people know their roles before a real incident."
 },
 {
  "id": "d22-asset-and-change-management",
  "term": "Asset and change management",
  "category": "d5",
  "day": 22,
  "def": "Keep an inventory of everything you own. End-of-life systems no longer get security patches, so they become permanent risks. Changes are requested, reviewed, approved, tested, implemented and documented. Emergency changes are documented afterwards."
 },
 {
  "id": "d23-vulnerability-scan",
  "term": "Vulnerability scan",
  "category": "d5",
  "day": 23,
  "def": "An automated search for known weaknesses. Fast and broad, but it can report false positives."
 },
 {
  "id": "d23-penetration-test",
  "term": "Penetration test",
  "category": "d5",
  "day": 23,
  "def": "An authorized attempt to exploit weaknesses and prove their impact. It needs written permission and an agreed scope (rules of engagement)."
 },
 {
  "id": "d23-red-blue-and-purple-teams",
  "term": "Red, blue and purple teams",
  "category": "d5",
  "day": 23,
  "def": "Red attacks, blue defends, and purple teams work together so defenders learn from each attack."
 },
 {
  "id": "d23-static-and-dynamic-analysis",
  "term": "Static and dynamic analysis",
  "category": "d5",
  "day": 23,
  "def": "Static analysis reviews code without running it. Dynamic analysis tests the running application."
 },
 {
  "id": "d23-other-security-tests",
  "term": "Other security tests",
  "category": "d5",
  "day": 23,
  "def": "Physical penetration tests and social engineering tests check whether someone can tailgate, phish or impersonate their way in. Black, white and gray box tests give the testers no, full or partial information in advance."
 }
];
