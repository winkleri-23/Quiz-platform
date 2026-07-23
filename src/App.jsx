import { useEffect, useState, useCallback } from "react";
import CategoryHub from "./CategoryHub.jsx";
import DiagnosticsCategory from "./DiagnosticsCategory.jsx";
import CisspCategory from "./CisspCategory.jsx";
import CisspDomainTopics from "./CisspDomainTopics.jsx";
import ArticleQuizCategory from "./ArticleQuizCategory.jsx";
import PathFinder from "./PathFinder.jsx";
import DirectionFinder from "./DirectionFinder.jsx";
import CisspDomain1 from "./CisspDomain1.jsx";
import ThreeStatesOfData from "./ThreeStatesOfData.jsx";
import RecoveryMetricsQuiz from "./RecoveryMetricsQuiz.jsx";
import WifiSecurityQuiz from "./WifiSecurityQuiz.jsx";
import NetworkAttacksQuiz from "./NetworkAttacksQuiz.jsx";
import BackupStrategiesQuiz from "./BackupStrategiesQuiz.jsx";
import ContainersVsVMsQuiz from "./ContainersVsVMsQuiz.jsx";

// Path-based routing. Works with Vercel rewrites for SPA fallback,
// and per-route static HTML files so social crawlers see per-route OG meta.
//
// HUB + CATEGORY PAGES
//   "/"                     → CategoryHub
//   "/diagnostics"          → DiagnosticsCategory (Study Path + Direction)
//   "/cissp"                → CisspCategory (8 domain cards + all-mixed)
//   "/cissp/domain-N"       → CisspDomainTopics for domain N (mixed quiz + article quizzes)
//   "/articles"             → ArticleQuizCategory (all article quizzes)
//
// INDIVIDUAL QUIZZES (unchanged URLs — shareable links keep working)
//   "/path"                              → PathFinder
//   "/direction"                         → DirectionFinder
//   "/cissp/domain-1/mixed"              → CisspDomain1 (mixed Domain 1 knowledge quiz)
//   "/article/three-states-of-data"      → ThreeStatesOfData
//   "/article/recovery-metrics"          → RecoveryMetricsQuiz
//   "/article/wifi-security"             → WifiSecurityQuiz
//
// BACKWARD COMPAT
//   Old "/cissp/domain-1" was the D1 mixed quiz. It's now the D1 topic page.
//   Anyone landing there sees a page with a big "Domain 1 Mixed" card — one
//   click and they're in the same quiz. No hard 404, no redirect needed.
export default function App() {
  const getRoute = useCallback(() => {
    return window.location.pathname.replace(/^\//, "").replace(/\/$/, "");
  }, []);

  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#/")) {
      const newPath = hash.replace(/^#/, "");
      window.history.replaceState(null, "", newPath);
      setRoute(getRoute());
    }
  }, [getRoute]);

  useEffect(() => {
    const onPop = () => {
      setRoute(getRoute());
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [getRoute]);

  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      if (a.target === "_blank") return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      if (href !== window.location.pathname) {
        window.history.pushState(null, "", href);
        setRoute(getRoute());
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [getRoute]);

  // Category pages
  if (route === "diagnostics") return <DiagnosticsCategory />;
  if (route === "cissp") return <CisspCategory />;
  if (route === "articles") return <ArticleQuizCategory />;

  // CISSP domain topic pages
  const domainMatch = route.match(/^cissp\/domain-([1-8])$/);
  if (domainMatch) return <CisspDomainTopics domainNumber={parseInt(domainMatch[1], 10)} />;

  // Individual quiz pages
  if (route === "path") return <PathFinder />;
  if (route === "direction") return <DirectionFinder />;
  if (route === "cissp/domain-1/mixed") return <CisspDomain1 />;
  if (route === "article/three-states-of-data") return <ThreeStatesOfData />;
  if (route === "article/recovery-metrics") return <RecoveryMetricsQuiz />;
  if (route === "article/wifi-security") return <WifiSecurityQuiz />;
  if (route === "article/network-attacks") return <NetworkAttacksQuiz />;
  if (route === "article/backup-strategies") return <BackupStrategiesQuiz />;
  if (route === "article/containers-vs-vms") return <ContainersVsVMsQuiz />;

  return <CategoryHub />;
}
