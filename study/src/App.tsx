import { lazy, Suspense, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Collection } from "./data/library";
import {
  focus,
  reportMusicUnavailable,
  useStudy,
} from "./interaction/studyStore";
import { tactileFeedback } from "./interaction/tactile";
import { Archive } from "./ui/Archive";
import { AsciiLoader } from "./ui/AsciiLoader";
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
    isNight,
    lampPower,
    lampBrightness,
    setLampBrightness,
    setNightMode,
    toggleLampPower,
    tactileMuted,
    setTactileMuted,
    musicPlaying,
    volume,
  } = useStudy();
  const [indexMode, setIndexMode] = useState(() => viewFromHash() === "index");
  const [activeCollection, setActiveCollection] = useState<Collection>("work");
  const [initialReady, setInitialReady] = useState(false);
  const [roomReady, setRoomReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const indexTrigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!window.location.hash) window.history.replaceState(null, "", "#index");

    const syncView = () => {
      const nextView = viewFromHash();
      setIndexMode(nextView === "index");
      if (nextView === "room") setRoomReady(false);
    };
    window.addEventListener("popstate", syncView);
    return () => window.removeEventListener("popstate", syncView);
  }, []);

  useEffect(() => {
    const syncTime = () => setNightMode(isNightNow());
    syncTime();
    const timer = window.setInterval(syncTime, 60_000);
    return () => window.clearInterval(timer);
  }, [setNightMode]);

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
    if (view === "room") setRoomReady(false);
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
  }, [archiveRequest, clearArchiveRequest]);

  const brightnessPercent = Math.round(lampBrightness * 100);
  const loading = !initialReady || (!indexMode && !roomReady);
  const markRoomReady = useCallback(() => setRoomReady(true), []);

  return (
    <div className={["app", isNight && "app--evening"].filter(Boolean).join(" ")}>
      {!indexMode && (
        <>
          <Suspense
            fallback={<div className="room-loading" role="status" aria-label="加载 Room" />}
          >
            <RoomScene isNight={isNight} onReady={markRoomReady} />
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
                  step="1"
                  value={brightnessPercent}
                  style={{ "--value": brightnessPercent + "%" } as CSSProperties}
                  onChange={(event) => setLampBrightness(Number(event.currentTarget.value) / 100)}
                  aria-label="台灯预设亮度"
                  aria-valuetext={brightnessPercent + "%" + (lampPower ? "，已开启" : "，已关闭")}
                />
              </div>
              <button
                className="hud__btn hud__btn--icon"
                type="button"
                onClick={() => {
                  tactileFeedback("press", tactileMuted);
                  toggleLampPower();
                }}
                aria-label={lampPower ? "关闭台灯" : "打开台灯"}
                aria-pressed={lampPower}
                title={lampPower ? "关闭台灯" : "打开台灯"}
              >
                <span aria-hidden="true">{lampPower ? "◉" : "○"}</span>
              </button>
              <button
                className="hud__btn hud__btn--icon"
                type="button"
                onClick={() => setTactileMuted(!tactileMuted)}
                aria-label={tactileMuted ? "开启台灯机械反馈" : "关闭台灯机械反馈"}
                aria-pressed={!tactileMuted}
                title={tactileMuted ? "开启机械反馈" : "关闭机械反馈"}
              >
                <span aria-hidden="true">{tactileMuted ? "○" : "⌁"}</span>
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

      <AsciiLoader active={loading} onInitialReady={() => setInitialReady(true)} />
    </div>
  );
}
