import { useEffect, useState, useCallback } from "react";
import CategoryHub from "./CategoryHub.jsx";
import DiagnosticsCategory from "./DiagnosticsCategory.jsx";
import CisspCategory from "./CisspCategory.jsx";
import ArticleQuizCategory from "./ArticleQuizCategory.jsx";
import PathFinder from "./PathFinder.jsx";
import DirectionFinder from "./DirectionFinder.jsx";
import CisspDomain1 from "./CisspDomain1.jsx";
import ThreeStatesOfData from "./ThreeStatesOfData.jsx";
import RecoveryMetricsQuiz from "./RecoveryMetricsQuiz.jsx";

// Path-based routing. Works with Vercel rewrites for SPA fallback,
// and per-route static HTML files so social crawlers see per-route OG meta.
//
// HUB + CATEGORY PAGES
//   "/"             → CategoryHub
//   "/diagnostics"  → DiagnosticsCategory (Study Path + Direction)
//   "/cissp"        → CisspCategory (Domain 1 + coming-soon)
//   "/articles"     → ArticleQuizCategory (Three States + Recovery Metrics)
//
// INDIVIDUAL QUIZZES (unchanged URLs — shareable links keep working)
//   "/path"                              → PathFinder
//   "/direction"                         → DirectionFinder
//   "/cissp/domain-1"                    → CisspDomain1
//   "/article/three-states-of-data"      → ThreeStatesOfData
//   "/article/recovery-metrics"          → RecoveryMetricsQuiz
//
// BACKWARD COMPAT: old hash URLs (#/path etc.) are redirected to path equivalents.
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

  // Individual quiz pages
  if (route === "path") return <PathFinder />;
  if (route === "direction") return <DirectionFinder />;
  if (route === "cissp/domain-1") return <CisspDomain1 />;
  if (route === "article/three-states-of-data") return <ThreeStatesOfData />;
  if (route === "article/recovery-metrics") return <RecoveryMetricsQuiz />;

  // Fallback — anything unknown lands on the hub
  return <CategoryHub />;
}
