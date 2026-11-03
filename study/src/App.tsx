import { lazy, Suspense, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Collection, ThemeId } from "./data/library";
import { themes } from "./data/library";
import {
  focus,
  reportMusicUnavailable,
  useStudy,
} from "./interaction/studyStore";
import { tactileFeedback } from "./interaction/tactile";
import { Archive } from "./ui/Archive";
import { PaperCorner } from "./ui/PaperCorner";
import { Surface } from "./ui/Surface";
import { useLoading, type LoadingTaskController } from "./ui/loading/LoadingContext";
import type { RoomAssetProgress } from "./scene/RoomScene";
import "./PageTurn.css";

type View = "index" | "room";

interface IndexRoute {
  view: "index";
  theme: ThemeId;
  archive?: boolean;
  projectId?: string;
}

type Route = IndexRoute | { view: "room" };

const isTheme = (value: string | undefined): value is ThemeId =>
  Boolean(value && themes.includes(value as ThemeId));

const themeForCollection = (collection: Collection): ThemeId => {
  if (collection === "research") return "question";
  if (collection === "make") return "play";
  return "build";
};

const routeFromHash = (): Route => {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash === "room") return { view: "room" };

  const [, themeCandidate, projectId] = hash.split("/");
  return {
    view: "index",
    theme: isTheme(themeCandidate) ? themeCandidate : "build",
    archive: isTheme(themeCandidate),
    ...(isTheme(themeCandidate) && projectId ? { projectId } : {}),
  };
};

const hashForIndex = ({ theme, archive, projectId }: IndexRoute) =>
  archive || projectId ? `#index/${theme}${projectId ? `/${projectId}` : ""}` : "#index";

const isNightNow = () => {
  const hour = new Date().getHours();
  return hour < 7 || hour >= 18;
};

const RoomScene = lazy(() => import("./scene/RoomScene"));

export default function App() {
  const { begin } = useLoading();
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
  const initialRoute = routeFromHash();
  const [route, setRoute] = useState<Route>(initialRoute);
  const [indexRoute, setIndexRoute] = useState<IndexRoute>(
    initialRoute.view === "index" ? initialRoute : { view: "index", theme: "build" },
  );
  const viewRef = useRef<View>(initialRoute.view);
  const indexRouteRef = useRef(indexRoute);
  const audioRef = useRef<HTMLAudioElement>(null);
  const indexTrigger = useRef<HTMLButtonElement>(null);
  const roomTask = useRef<LoadingTaskController | null>(null);
  const roomFailed = useRef(false);
  const foldTask = useRef<LoadingTaskController | null>(null);
  const foldTimer = useRef<number | null>(null);
  const foldingRef = useRef(false);
  const [folding, setFolding] = useState(false);
  const indexMode = route.view === "index";

  const beginRoomLoading = useCallback(() => {
    if (roomTask.current) return;
    roomTask.current = begin("Room scene");
  }, [begin]);

  const settleRoomLoading = useCallback(() => {
    roomTask.current?.done();
    roomTask.current = null;
    roomFailed.current = false;
  }, []);

  const beginIndexTransition = useCallback(() => {
    const task = begin("Index transition");
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => task.done()));
  }, [begin]);

  const reportRoomProgress = useCallback(
    ({ active, progress, errors }: RoomAssetProgress) => {
      if (active) {
        beginRoomLoading();
        roomTask.current?.report(progress / 100);
      }
      if (errors > 0 && !roomFailed.current) {
        roomFailed.current = true;
        roomTask.current?.fail("Room resources could not load.", () => window.location.reload());
      }
    },
    [beginRoomLoading],
  );

  useEffect(() => {
    const syncTime = () => setNightMode(isNightNow());
    syncTime();
    const timer = window.setInterval(syncTime, 60_000);
    return () => window.clearInterval(timer);
  }, [setNightMode]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (musicPlaying) el.play().catch(reportMusicUnavailable);
    else el.pause();
  }, [musicPlaying]);

  const setView = useCallback((view: View) => {
    if (view === viewRef.current) return;
    viewRef.current = view;
    const hash = view === "room" ? "#room" : hashForIndex(indexRouteRef.current);
    if (window.location.hash !== hash) window.history.pushState(null, "", hash);
    if (view === "index") {
      beginIndexTransition();
      setRoute(indexRouteRef.current);
    } else {
      setRoute({ view: "room" });
    }
    if (view === "room") beginRoomLoading();
    else settleRoomLoading();
  }, [beginIndexTransition, beginRoomLoading, settleRoomLoading]);

  const turnPage = useCallback((view: View) => {
    if (view === viewRef.current || foldingRef.current) return;
    foldingRef.current = true;
    foldTask.current = begin("Page turn");
    setFolding(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    foldTimer.current = window.setTimeout(() => {
      setView(view);
      foldTask.current?.done();
      foldTask.current = null;
      foldTimer.current = null;
      foldingRef.current = false;
      setFolding(false);
      if (view === "room") window.requestAnimationFrame(() => indexTrigger.current?.focus());
    }, reduced ? 0 : 850);
  }, [begin, setView]);

  const applyIndexRoute = useCallback((next: IndexRoute, push = true) => {
    indexRouteRef.current = next;
    setIndexRoute(next);
    if (viewRef.current === "index") setRoute(next);
    const hash = hashForIndex(next);
    if (window.location.hash !== hash) {
      if (push) window.history.pushState(null, "", hash);
      else window.history.replaceState(null, "", hash);
    }
  }, []);

  useEffect(() => {
    if (!window.location.hash) {
      const next = indexRouteRef.current;
      window.history.replaceState(null, "", hashForIndex(next));
    }

    const syncRoute = () => {
      const next = routeFromHash();
      if (next.view === "index") {
        indexRouteRef.current = next;
        setIndexRoute(next);
      }
      if (next.view !== viewRef.current) turnPage(next.view);
      else setRoute(next);
    };

    window.addEventListener("popstate", syncRoute);
    window.addEventListener("hashchange", syncRoute);
    return () => {
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener("hashchange", syncRoute);
    };
  }, [turnPage]);

  useEffect(() => () => {
    if (foldTimer.current !== null) window.clearTimeout(foldTimer.current);
    foldTask.current?.done();
  }, []);

  const enterRoom = useCallback(() => turnPage("room"), [turnPage]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      focus(null);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openIndex = useCallback((collection: Collection = "work") => {
    focus(null);
    const next: IndexRoute = { view: "index", theme: themeForCollection(collection) };
    applyIndexRoute(next);
    turnPage("index");
  }, [applyIndexRoute, turnPage]);

  useEffect(() => {
    if (!archiveRequest) return;
    openIndex(archiveRequest);
    clearArchiveRequest();
  }, [archiveRequest, clearArchiveRequest, openIndex]);

  useEffect(() => {
    if (!indexMode) beginRoomLoading();
    else settleRoomLoading();
  }, [beginRoomLoading, indexMode, settleRoomLoading]);

  useEffect(() => () => settleRoomLoading(), [settleRoomLoading]);

  const handleThemeChange = useCallback((theme: ThemeId, showAll = false) => {
    applyIndexRoute({ view: "index", theme, archive: showAll });
  }, [applyIndexRoute]);

  const handleProjectOpen = useCallback((entry: { id: string; primaryTheme: ThemeId }) => {
    applyIndexRoute({ view: "index", theme: entry.primaryTheme, archive: true, projectId: entry.id });
  }, [applyIndexRoute]);

  const brightnessPercent = Math.round(lampBrightness * 100);
  const markRoomReady = useCallback(() => settleRoomLoading(), [settleRoomLoading]);

  return (
    <div className={["app", isNight && "app--evening"].filter(Boolean).join(" ")}>
      {!indexMode && (
        <div className={["page-sheet", "page-sheet--room", folding && "page-sheet--folding"].filter(Boolean).join(" ")}>
          <Suspense fallback={<div className="room-loading" role="status" aria-label="加载 Room" />}>
            <RoomScene
              isNight={isNight}
              onReady={markRoomReady}
              onAssetProgress={reportRoomProgress}
            />
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
            </div>
          </header>

          <Surface />
          <PaperCorner
            ref={indexTrigger}
            className="page-corner--room"
            label="Index"
            ariaLabel="翻页进入 Index"
            title="翻页进入 Index"
            onClick={() => openIndex()}
            disabled={folding}
          />
        </div>
      )}

      <audio ref={audioRef} src="/audio/now-playing.mp3" loop preload="none" />

      {indexMode && (
        <div className={["page-sheet", "page-sheet--index", folding && "page-sheet--folding"].filter(Boolean).join(" ")}>
          <Archive
            initialTheme={indexRoute.theme}
            showThemeArchive={Boolean(indexRoute.archive || indexRoute.projectId)}
            projectId={indexRoute.projectId}
            onClose={enterRoom}
            onThemeChange={handleThemeChange}
            onProjectOpen={handleProjectOpen}
          />
        </div>
      )}
    </div>
  );
}
