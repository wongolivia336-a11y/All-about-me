import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Collection } from "./data/library";
import {
  focus,
  reportMusicUnavailable,
  useStudy,
} from "./interaction/studyStore";
import { Archive } from "./ui/Archive";
import { Surface } from "./ui/Surface";

type View = "index" | "room";

const viewFromHash = (): View => (window.location.hash === "#room" ? "room" : "index");
const isNightNow = () => {
  const hour = new Date().getHours();
  return hour < 7 || hour >= 18;
};
const RoomScene = lazy(() => import("./scene/RoomScene"));

export default function App() {
  const {
    archiveRequest,
    clearArchiveRequest,
    lampOn,
    lightLevel,
    setLightLevel,
    toggleLamp,
    musicPlaying,
    volume,
  } = useStudy();
  const [indexMode, setIndexMode] = useState(() => viewFromHash() === "index");
  const [activeCollection, setActiveCollection] = useState<Collection>("work");
  const [isNight, setIsNight] = useState(isNightNow);
  const audioRef = useRef<HTMLAudioElement>(null);
  const indexTrigger = useRef<HTMLButtonElement>(null);
  const appliedInitialLighting = useRef(false);

  useEffect(() => {
    if (!window.location.hash) window.history.replaceState(null, "", "#index");

    const syncView = () => setIndexMode(viewFromHash() === "index");
    window.addEventListener("popstate", syncView);
    return () => window.removeEventListener("popstate", syncView);
  }, []);

  useEffect(() => {
    const syncTime = () => setIsNight(isNightNow());
    syncTime();
    const timer = window.setInterval(syncTime, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  // Local time controls the ambient room. The lamp is still independent after
  // first load, so choosing a daytime task light never turns the whole site dark.
  useEffect(() => {
    if (appliedInitialLighting.current) return;
    appliedInitialLighting.current = true;
    if (isNight) setLightLevel(0.72);
  }, [isNight, setLightLevel]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // The audio element lives here rather than in the music panel so closing the
  // panel does not stop the music.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (musicPlaying) {
      el.play().catch(reportMusicUnavailable);
    } else {
      el.pause();
    }
  }, [musicPlaying]);

  const setView = (view: View) => {
    const hash = view === "room" ? "#room" : "#index";
    if (window.location.hash !== hash) window.history.pushState(null, "", hash);
    setIndexMode(view === "index");
  };

  const closeIndex = () => {
    setView("room");
    window.requestAnimationFrame(() => indexTrigger.current?.focus());
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (indexMode) closeIndex();
      else focus(null);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [indexMode]);

  const openIndex = (collection: Collection = "work") => {
    focus(null);
    setActiveCollection(collection);
    setView("index");
  };

  useEffect(() => {
    if (!archiveRequest) return;
    openIndex(archiveRequest);
    clearArchiveRequest();
  }, [archiveRequest]);

  const brightnessPercent = Math.round(lightLevel * 100);

  return (
    <div className={["app", isNight && "app--evening"].filter(Boolean).join(" ")}>
      {!indexMode && (
        <>
          <Suspense
            fallback={<div className="room-loading" role="status" aria-label="加载 Room" />}
          >
            <RoomScene isNight={isNight} />
          </Suspense>

          <header className="hud">
            <span className="hud__name">Olivia Wong</span>
            <div className="hud__actions">
              <div className="hud__light">
                <input
                  className="hud__brightness"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={brightnessPercent}
                  style={{ "--value": brightnessPercent + "%" } as CSSProperties}
                  onChange={(event) => setLightLevel(Number(event.currentTarget.value) / 100)}
                  aria-label="台灯亮度"
                  aria-valuetext={brightnessPercent + "%"}
                />
              </div>
              <button
                className="hud__btn hud__btn--icon"
                type="button"
                onClick={toggleLamp}
                aria-label={lampOn ? "关闭台灯" : "打开台灯"}
                aria-pressed={lampOn}
                title={lampOn ? "关闭台灯" : "打开台灯"}
              >
                <span aria-hidden="true">{lampOn ? "◉" : "○"}</span>
              </button>
              <button
                ref={indexTrigger}
                className="hud__btn"
                type="button"
                onClick={() => openIndex()}
              >
                Index
              </button>
            </div>
          </header>

          <Surface />
        </>
      )}

      <audio ref={audioRef} src="/audio/now-playing.mp3" loop preload="none" />

      {indexMode && (
        <Archive initialCollection={activeCollection} onClose={closeIndex} />
      )}
    </div>
  );
}
