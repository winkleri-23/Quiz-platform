import { useEffect, useState, useCallback } from "react";
import Chooser from "./Chooser.jsx";
import PathFinder from "./PathFinder.jsx";
import DirectionFinder from "./DirectionFinder.jsx";
import CisspDomain1 from "./CisspDomain1.jsx";
import ThreeStatesOfData from "./ThreeStatesOfData.jsx";

// Path-based routing. Works with Vercel rewrites for SPA fallback,
// and per-route static HTML files so social crawlers see per-route OG meta.
// "/"                → Chooser
// "/path"            → PathFinder
// "/direction"       → DirectionFinder
// "/cissp/domain-1"  → CisspDomain1
//
// Old hash URLs (#/path, #/direction, #/cissp/domain-1) are redirected
// to the path equivalents so existing shared links keep working.
export default function App() {
  const getRoute = useCallback(() => {
    return window.location.pathname.replace(/^\//, "").replace(/\/$/, "");
  }, []);

  const [route, setRoute] = useState(getRoute());

  // Backward compat: rewrite #/foo URLs to /foo on first load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#/")) {
      const newPath = hash.replace(/^#/, "");
      window.history.replaceState(null, "", newPath);
      setRoute(getRoute());
    }
  }, [getRoute]);

  // Browser back/forward
  useEffect(() => {
    const onPop = () => {
      setRoute(getRoute());
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [getRoute]);

  // Intercept clicks on internal <a> tags so SPA navigation works without full reload
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

  if (route === "path") return <PathFinder />;
  if (route === "direction") return <DirectionFinder />;
  if (route === "cissp/domain-1") return <CisspDomain1 />;
  if (route === "article/three-states-of-data") return <ThreeStatesOfData />;
  return <Chooser />;
}
