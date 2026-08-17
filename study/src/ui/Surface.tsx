import { useStudy } from "../interaction/studyStore";
import { GitHubPanel } from "./GitHubPanel";
import { MusicPanel } from "./MusicPanel";
import { Panel } from "./Panel";
import { PhonePanel } from "./PhonePanel";
import { PortfolioViewer } from "./PortfolioViewer";

/**
 * Picks the content surface for whatever the camera is pushed into.
 * Objects with real behaviour get their own component; the rest fall through
 * to the generic panel driven by `data/content.ts`.
 */
export function Surface() {
  const { focused } = useStudy();
  if (!focused) return null;

  switch (focused) {
    case "portfolio":
      return <PortfolioViewer />;
    case "laptop":
      return <GitHubPanel />;
    case "phone":
      return <PhonePanel />;
    case "marshall":
      return <MusicPanel />;
    default:
      return <Panel />;
  }
}
