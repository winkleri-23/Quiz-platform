import { useEffect, useState } from "react";
import Chooser from "./Chooser.jsx";
import PathFinder from "./PathFinder.jsx";
import DirectionFinder from "./DirectionFinder.jsx";
import CisspDomain1 from "./CisspDomain1.jsx";

// Hash-based routing — no dependencies, no Vercel rewrites needed.
// ""                  → Chooser (diagnostic hub landing page)
// "#/path"            → PathFinder (Quiz 1, study path)
// "#/direction"       → DirectionFinder (Quiz 2, career direction)
// "#/cissp/domain-1"  → CisspDomain1 (Quiz 3, CISSP D1 knowledge test)
export default function App() {
  const getRoute = () => {
    const h = window.location.hash.replace(/^#/, "").replace(/^\//, "");
    return h || "";
  };

  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRoute());
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (route === "path") return <PathFinder />;
  if (route === "direction") return <DirectionFinder />;
  if (route === "cissp/domain-1") return <CisspDomain1 />;
  return <Chooser />;
}
