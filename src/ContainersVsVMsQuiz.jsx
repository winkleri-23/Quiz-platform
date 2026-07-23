import { useState, useEffect } from "react";
import { track } from "@vercel/analytics/react";

// =============================================================================
// DECODED SECURITY — CONTAINERS vs VIRTUAL MACHINES (ARTICLE QUIZ)
// Virtualization fundamentals for CISSP Domain 3 (Security Architecture &
// Engineering). Maps to CC, Security+, CISSP D3.
// =============================================================================

const COLORS = {
  red: "#e64833",
  green: "#3ab676",
  black: "#000000",
  white: "#FFFFFF",
  border: "#2a2a2a",
  muted: "#888888",
};

const BASE_URL = "https://www.decodedsecurity.com/p/";
const SUBSCRIBE_URL = "https://www.decodedsecurity.com/subscribe";

const SOURCE_ARTICLE = {
  title: "Containers vs. Virtual Machines: The Fight for the Future of Computing",
  slug: "containers-vs-virtual-machines-the",
};

const QUIZ = {
  title: "Containers vs Virtual Machines",
  subtitle: "Virtualization fundamentals the CISSP tests — VM vs container architecture, hypervisor types, isolation vs efficiency tradeoffs, and when to pick each.",
  certs: "CC  ·  CISSP D3  ·  SECURITY+",
  questions: [
    {
      q: "Which of the following best describes a Virtual Machine?",
      options: [
        "A lightweight process isolated by sharing the host OS kernel.",
        "A software-based computer with its own OS, CPU, memory, and disk running on a physical host.",
        "A cloud service that automatically scales workloads across regions.",
        "A physical server dedicated to a single tenant workload.",
      ],
      correct: 1,
      explanation: "A VM is a software-based computer running inside a physical host — its own virtual CPU, memory, disk, and its own operating system. (A) describes a container; (C) describes cloud autoscaling; (D) describes bare-metal single-tenancy.",
    },
    {
      q: "Which of the following best describes a Container?",
      options: [
        "A full virtual computer with its own operating system.",
        "A lightweight, isolated environment that packages an application with its dependencies but shares the host OS kernel.",
        "A Type 1 hypervisor that manages bare-metal workloads.",
        "A physical partition of a hard disk dedicated to backup.",
      ],
      correct: 1,
      explanation: "Containers package the app with its binaries, libraries, and configuration but do NOT include a full guest OS — they share the host kernel. That's what makes them lighter and faster than VMs, and also what reduces their isolation compared to VMs.",
    },
    {
      q: "What is the primary role of a hypervisor?",
      options: [
        "Compile application source code into container images.",
        "Allocate host hardware resources and provide strong isolation between virtual machines.",
        "Manage DNS records for cloud tenants.",
        "Handle authentication requests for federated identity systems.",
      ],
      correct: 1,
      explanation: "The hypervisor is the VM manager. It allocates CPU, memory, storage, and network to each VM, ensures isolation between them, presents virtual hardware to the guest OS, and manages VM lifecycle events like start, pause, stop, and snapshot.",
    },
    {
      q: "VMware ESXi and Microsoft Hyper-V are examples of which hypervisor type?",
      options: [
        "Type 1 (bare-metal) — runs directly on hardware.",
        "Type 2 (hosted) — runs on top of a host OS.",
        "Container runtime.",
        "Application-level virtualization.",
      ],
      correct: 0,
      explanation: "Type 1 hypervisors (VMware ESXi, Hyper-V) run directly on hardware — no host OS underneath. Type 2 hypervisors (VirtualBox, VMware Workstation) run as an application on top of a host OS. Type 1 is what production data centers use; Type 2 is what developers use on laptops.",
    },
    {
      q: "When a security professional says \"Virtual Machine,\" what concept should come to mind first?",
      options: [
        "Speed",
        "Portability",
        "Isolation",
        "Kernel sharing",
      ],
      correct: 2,
      explanation: "The entire point of a VM is isolation — a fully separated environment. If one VM is compromised, it doesn't affect the rest of the system. That strong boundary is why VMs are the correct answer whenever a scenario emphasizes security, compliance, or containment.",
    },
    {
      q: "A container is compromised. What is the main additional risk compared to a comparable VM compromise?",
      options: [
        "Nothing — containers are fully isolated from each other and from the host.",
        "Because containers share the host OS kernel, a kernel-level compromise or container escape can put other containers and the host at risk.",
        "Containers cannot be compromised — only the container runtime.",
        "Containers rely on hardware-level isolation, so risk is limited to that container only.",
      ],
      correct: 1,
      explanation: "Containers share the host OS kernel — the source of their efficiency AND their weakness. A kernel vulnerability or container escape can put every container on that host and the host itself at risk. VMs each have their own guest OS, so a compromise stays inside that VM.",
    },
    {
      q: "Compared to a Virtual Machine, a Container typically:",
      options: [
        "Requires more resources and takes longer to start.",
        "Requires fewer resources and starts almost instantly.",
        "Requires a Type 1 hypervisor to run.",
        "Requires a full guest OS installation.",
      ],
      correct: 1,
      explanation: "Containers are lightweight — no full guest OS to boot, minimal overhead, seconds-fast startup. VMs must boot their guest OS and consume significant CPU and memory. This is exactly why containers won the modern-cloud and DevOps use cases: scale-out speed matters.",
    },
    {
      q: "A regulated financial application must run in a fully isolated environment to meet compliance requirements. Which virtualization approach is most appropriate?",
      options: [
        "Container, because it starts faster and scales easily.",
        "Virtual Machine, because it provides stronger isolation with its own guest OS.",
        "Bare-metal deployment with no virtualization.",
        "A container running inside another container.",
      ],
      correct: 1,
      explanation: "Compliance and strong isolation are VM territory. Each VM has its own guest OS, so a compromise stays contained. Containers share the host kernel, which regulated environments often view as an unacceptable shared trust boundary. When the scenario emphasizes isolation or regulation, the answer is almost always VM.",
    },
    {
      q: "What is the KEY architectural difference between a Container and a Virtual Machine?",
      options: [
        "Containers have their own guest OS; VMs do not.",
        "VMs have their own guest OS; containers share the host OS kernel.",
        "Both have their own guest OS; the only difference is the hypervisor.",
        "Neither has a guest OS; they both interact with hardware directly.",
      ],
      correct: 1,
      explanation: "This is THE detail to remember. VMs include a full guest OS on top of the hypervisor. Containers do not — they share the host OS kernel and only include the application, its binaries, libraries, and configuration. One look at the two architecture diagrams and you can spot the missing guest OS on the container side.",
    },
    {
      q: "Which of the following is a common container engine or runtime?",
      options: [
        "VMware ESXi",
        "Microsoft Hyper-V",
        "Docker",
        "Oracle VirtualBox",
      ],
      correct: 2,
      explanation: "Docker is the classic container engine. Other examples include Podman and containerd. VMware ESXi and Hyper-V are Type 1 hypervisors for VMs. VirtualBox is a Type 2 hypervisor. The exam expects you to know which technology belongs to which side.",
    },
  ],
};

export default function ContainersVsVMsQuiz() {
  const [stage, setStage] = useState("welcome");
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => {
      try { document.head.removeChild(link); } catch (e) {}
    };
  }, []);

  const fontStack = "'IBM Plex Mono', ui-monospace, Menlo, monospace";
  const totalQ = QUIZ.questions.length;
  const articleUrl = `${BASE_URL}${SOURCE_ARTICLE.slug}`;

  const startQuiz = () => {
    track("quiz_started", { quiz: "article_containers_vs_vms" });
    setStage("question");
    setCurrentQ(0);
    setSelectedIdx(null);
    setAnswers([]);
  };

  const handleAnswer = (idx) => {
    if (selectedIdx !== null) return;
    const correct = QUIZ.questions[currentQ].correct;
    track("question_answered", {
      quiz: "article_containers_vs_vms",
      question: currentQ + 1,
      answer: idx,
      correct: idx === correct,
    });
    setSelectedIdx(idx);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selectedIdx];
    if (currentQ + 1 < totalQ) {
      setAnswers(newAnswers);
      setCurrentQ(currentQ + 1);
      setSelectedIdx(null);
    } else {
      setAnswers(newAnswers);
      const score = newAnswers.filter((a, i) => a === QUIZ.questions[i].correct).length;
      track("quiz_completed", { quiz: "article_containers_vs_vms", score, total: totalQ });
      setStage("result");
    }
  };

  const restart = () => {
    track("quiz_restarted", { quiz: "article_containers_vs_vms" });
    setStage("welcome");
    setCurrentQ(0);
    setSelectedIdx(null);
    setAnswers([]);
  };

  const progress = (currentQ / totalQ) * 100;
  const score = answers.filter((a, i) => a === QUIZ.questions[i].correct).length;
  const missed = answers.map((a, i) => ({ idx: i, correct: a === QUIZ.questions[i].correct })).filter((x) => !x.correct);

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
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <header style={{ marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: COLORS.red, borderRadius: "50%", boxShadow: `0 0 12px ${COLORS.red}` }} />
            <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.muted }}>DECODED_SECURITY // ARTICLE QUIZ</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <a
              href="/"
              style={{
                fontSize: 11,
                letterSpacing: 1.5,
                color: COLORS.muted,
                textDecoration: "none",
                borderBottom: `1px solid ${COLORS.border}`,
                paddingBottom: 2,
                transition: "color 150ms, border-color 150ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; e.currentTarget.style.borderBottomColor = COLORS.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.borderBottomColor = COLORS.border; }}
            >
              ← QUIZ MENU
            </a>
            {stage === "question" && (
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5 }}>
                {String(currentQ + 1).padStart(2, "0")} / {String(totalQ).padStart(2, "0")}
              </div>
            )}
          </div>
        </header>

        {stage === "question" && (
          <div style={{ height: 2, backgroundColor: COLORS.border, marginBottom: 48, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, backgroundColor: COLORS.red, transition: "width 400ms ease-out" }} />
          </div>
        )}

        {/* WELCOME */}
        {stage === "welcome" && (
          <div style={{ animation: "fadeIn 600ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 24 }}>
              &gt; ARTICLE QUIZ
            </div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 18, letterSpacing: -1 }}>
              {QUIZ.title}
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "#cccccc", marginBottom: 16, maxWidth: 600 }}>
              {QUIZ.subtitle}
            </p>
            <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 2, marginBottom: 32 }}>
              MAPS TO: {QUIZ.certs}
            </div>

            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("source_article_clicked", { quiz: "article_containers_vs_vms", from: "welcome" })}
              style={{
                display: "block",
                borderLeft: `2px solid ${COLORS.red}`,
                paddingLeft: 16,
                marginBottom: 40,
                maxWidth: 560,
                textDecoration: "none",
                color: COLORS.white,
                transition: "all 150ms ease-out",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "20px"; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "16px"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>
                BASED ON THE ARTICLE
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>
                {SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span>
              </div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4, letterSpacing: 0.5 }}>
                Read the article first. Then come back and test if you can spot each concept in an exam scenario.
              </div>
            </a>

            <div style={{ display: "flex", gap: 32, marginBottom: 48, flexWrap: "wrap", fontSize: 13, color: COLORS.muted }}>
              <div><span style={{ color: COLORS.red }}>{String(totalQ).padStart(2, "0")}</span> questions</div>
              <div><span style={{ color: COLORS.red }}>~6min</span> to complete</div>
              <div><span style={{ color: COLORS.red }}>Free</span></div>
            </div>

            <button
              onClick={startQuiz}
              style={{
                fontFamily: fontStack,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: 1.5,
                color: COLORS.white,
                backgroundColor: COLORS.red,
                border: "none",
                padding: "18px 36px",
                cursor: "pointer",
                transition: "transform 150ms, box-shadow 150ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(230, 72, 51, 0.3)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              START THE QUIZ →
            </button>
          </div>
        )}

        {/* QUESTION */}
        {stage === "question" && (
          <div key={currentQ} style={{ animation: "fadeIn 300ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>
              QUESTION_{String(currentQ + 1).padStart(2, "0")}
            </div>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 600, lineHeight: 1.3, marginBottom: 28, letterSpacing: -0.3 }}>
              {QUIZ.questions[currentQ].q}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {QUIZ.questions[currentQ].options.map((opt, idx) => {
                const correctIdx = QUIZ.questions[currentQ].correct;
                const isAnswered = selectedIdx !== null;
                const isSelected = selectedIdx === idx;
                const isCorrect = idx === correctIdx;
                let borderColor = COLORS.border;
                let bgColor = "transparent";
                let letterColor = COLORS.red;
                if (isAnswered) {
                  if (isCorrect) { borderColor = COLORS.green; bgColor = "rgba(58, 182, 118, 0.08)"; letterColor = COLORS.green; }
                  else if (isSelected) { borderColor = COLORS.red; bgColor = "rgba(230, 72, 51, 0.08)"; }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={isAnswered}
                    style={{
                      fontFamily: fontStack,
                      fontSize: 15,
                      color: COLORS.white,
                      backgroundColor: bgColor,
                      border: `1px solid ${borderColor}`,
                      padding: "16px 18px",
                      textAlign: "left",
                      cursor: isAnswered ? "default" : "pointer",
                      transition: "all 150ms ease-out",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      lineHeight: 1.4,
                    }}
                    onMouseEnter={(e) => {
                      if (!isAnswered) {
                        e.currentTarget.style.borderColor = COLORS.red;
                        e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.06)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isAnswered) {
                        e.currentTarget.style.borderColor = COLORS.border;
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <span style={{ color: letterColor, fontSize: 12, fontWeight: 600, minWidth: 14 }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span style={{ flex: 1 }}>{opt}</span>
                    {isAnswered && isCorrect && <span style={{ color: COLORS.green, fontSize: 16 }}>✓</span>}
                    {isAnswered && isSelected && !isCorrect && <span style={{ color: COLORS.red, fontSize: 16 }}>✗</span>}
                  </button>
                );
              })}
            </div>

            {selectedIdx !== null && (
              <div style={{ animation: "fadeIn 300ms ease-out" }}>
                <div
                  style={{
                    borderLeft: `2px solid ${selectedIdx === QUIZ.questions[currentQ].correct ? COLORS.green : COLORS.red}`,
                    paddingLeft: 18,
                    marginBottom: 24,
                  }}
                >
                  <div style={{ fontSize: 11, color: selectedIdx === QUIZ.questions[currentQ].correct ? COLORS.green : COLORS.red, letterSpacing: 2, marginBottom: 8 }}>
                    {selectedIdx === QUIZ.questions[currentQ].correct ? "CORRECT ✓" : "NOT QUITE"}
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.55, color: "#dddddd", margin: 0 }}>
                    {QUIZ.questions[currentQ].explanation}
                  </p>
                </div>

                <a
                  href={articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("article_clicked", { quiz: "article_containers_vs_vms", question: currentQ + 1 })}
                  style={{
                    display: "block",
                    padding: "16px 18px",
                    border: `1px solid ${COLORS.border}`,
                    textDecoration: "none",
                    color: COLORS.white,
                    marginBottom: 28,
                    transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLORS.red; e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 4 }}>
                    REVISIT THIS SECTION
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>
                    {SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span>
                  </div>
                </a>

                <button
                  onClick={handleNext}
                  style={{
                    fontFamily: fontStack,
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    color: COLORS.white,
                    backgroundColor: COLORS.red,
                    border: "none",
                    padding: "14px 28px",
                    cursor: "pointer",
                    transition: "transform 150ms, box-shadow 150ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(230, 72, 51, 0.3)`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {currentQ + 1 < totalQ ? "NEXT QUESTION →" : "SEE MY SCORE →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESULT */}
        {stage === "result" && (
          <div style={{ animation: "fadeIn 700ms ease-out" }}>
            <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>
              &gt; QUIZ COMPLETE
            </div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 2, marginBottom: 12 }}>
              YOUR SCORE:
            </div>
            <h1 style={{ fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 700, lineHeight: 1.05, marginBottom: 8, letterSpacing: -2 }}>
              <span style={{ color: COLORS.red }}>{score}</span>
              <span style={{ color: COLORS.muted, fontSize: "0.55em", marginLeft: 8 }}>/ {totalQ}</span>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.55, color: "#cccccc", marginBottom: 36, maxWidth: 560 }}>
              {score === totalQ && "Perfect. Virtualization on Domain 3 is fully covered — you'll pick the right architecture whenever it comes up."}
              {score >= totalQ - 1 && score < totalQ && "Almost perfect. The one you missed is worth re-reading before exam day."}
              {score >= totalQ * 0.7 && score < totalQ - 1 && "Solid. You've got the framework — close the gaps below and retake."}
              {score >= totalQ * 0.5 && score < totalQ * 0.7 && "Mixed results. Re-read the article focusing on what you missed, then retake."}
              {score < totalQ * 0.5 && "Worth re-reading the article end-to-end. VM vs container comes up in almost every cloud interview and on the exam — don't leave it half-learned."}
            </p>

            {missed.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 3, marginBottom: 16 }}>
                  &gt; REVISIT THE ARTICLE
                </div>
                <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20, lineHeight: 1.5 }}>
                  {missed.length === 1 ? "One question slipped" : `${missed.length} questions slipped`}. The article walks through each of these.
                </p>
                <a
                  href={articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("revisit_article_clicked", { quiz: "article_containers_vs_vms" })}
                  style={{
                    display: "block",
                    padding: "20px 22px",
                    border: `1px solid ${COLORS.red}`,
                    backgroundColor: "rgba(230, 72, 51, 0.04)",
                    textDecoration: "none",
                    color: COLORS.white,
                    transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(230, 72, 51, 0.04)"; }}
                >
                  <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, marginBottom: 6 }}>
                    READ THE SOURCE
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>
                    {SOURCE_ARTICLE.title} <span style={{ color: COLORS.red }}>↗</span>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 6, letterSpacing: 0.5 }}>
                    Then come back and retake the quiz.
                  </div>
                </a>
              </div>
            )}

            <div style={{ border: `1px solid ${COLORS.border}`, padding: 28, marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 3, marginBottom: 12 }}>NEWSLETTER</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
                Get one practical breakdown like this every week.
              </div>
              <p style={{ fontSize: 14, color: "#bbbbbb", marginBottom: 20, lineHeight: 1.5 }}>
                1,300+ readers preparing for CC, CISSP, and Security+. No fluff.
              </p>
              <a
                href={SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("subscribe_clicked", { quiz: "article_containers_vs_vms" })}
                style={{
                  display: "inline-block",
                  fontFamily: fontStack,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  color: COLORS.white,
                  backgroundColor: COLORS.red,
                  textDecoration: "none",
                  padding: "14px 28px",
                }}
              >
                SUBSCRIBE →
              </a>
            </div>

            <button
              onClick={restart}
              style={{
                fontFamily: fontStack,
                fontSize: 12,
                color: COLORS.muted,
                backgroundColor: "transparent",
                border: "none",
                padding: "8px 0",
                cursor: "pointer",
                letterSpacing: 1.5,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; }}
            >
              ↻ RESTART QUIZ
            </button>
          </div>
        )}

        <footer style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>DECODED_SECURITY // ARTICLE_QUIZ_v1</div>
          <div>CONTAINERS vs VMs · CISSP D3</div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, a:focus-visible { outline: 2px solid ${COLORS.red}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
