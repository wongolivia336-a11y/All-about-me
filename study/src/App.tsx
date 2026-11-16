import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Collection, ThemeId } from "./data/library";
import { themes } from "./data/library";
import { isQuickReadPageId, type QuickReadPageId } from "./data/quickRead";
import { getJournalArticle } from "./data/journal";
import {
  focus,
  reportMusicUnavailable,
  useStudy,
} from "./interaction/studyStore";
import { tactileFeedback } from "./interaction/tactile";
import { Archive } from "./ui/Archive";
import { LanguageSwitch } from "./ui/LanguageSwitch";
import { PaperCorner } from "./ui/PaperCorner";
import { RoomExitButton } from "./ui/RoomExitButton";
import { RoomRevealSurface } from "./ui/RoomRevealTransition";
import { Surface } from "./ui/Surface";
import { useLoading, type LoadingTaskController } from "./ui/loading/LoadingContext";
import { ARCHIVE_ROOM_REVEAL_DURATION, useRoomReveal } from "./ui/useRoomReveal";
import type { RoomAssetProgress } from "./scene/RoomScene";
import { useLanguage } from "./i18n";
import "./PageTurn.css";

type View = "index" | "room";

interface IndexRoute {
  view: "index";
  theme: ThemeId;
  archive?: boolean;
  projectId?: string;
  focused?: boolean;
  quickReadId?: QuickReadPageId;
  journalId?: string;
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
  if (themeCandidate === "journal" && getJournalArticle(projectId)) {
    return { view: "index", theme: "keep", journalId: projectId };
  }
  if (themeCandidate === "quick" && isQuickReadPageId(projectId)) {
    return { view: "index", theme: "build", quickReadId: projectId };
  }
  const hasTheme = isTheme(themeCandidate);
  return {
    view: "index",
    theme: hasTheme ? themeCandidate : "build",
    focused: hasTheme,
    ...(hasTheme && projectId ? { projectId } : {}),
  };
};

const hashForIndex = ({ theme, archive, projectId, focused, quickReadId, journalId }: IndexRoute) =>
  journalId
    ? `#index/journal/${journalId}`
    : quickReadId
    ? `#index/quick/${quickReadId}`
    : archive || focused || projectId ? `#index/${theme}${projectId ? `/${projectId}` : ""}` : "#index";

const isNightNow = () => {
  const hour = new Date().getHours();
  return hour < 7 || hour >= 18;
};

const RoomScene = lazy(() => import("./scene/RoomScene"));
const preloadRoomScene = () => { void import("./scene/RoomScene"); };

// A cached Index can outlive a Vercel deployment that replaced its lazy
// RoomScene chunk. Preserve navigation and offer an explicit cache-busting
// recovery rather than allowing React's root to collapse into a blank page.
class RoomSceneBoundary extends Component<{ children: ReactNode; retryLabel: string; backLabel: string; onBack: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="room-loading-error" role="alert">
        <span>Room couldn't finish loading.</span>
        <button type="button" onClick={() => {
          const url = new URL(window.location.href);
          url.searchParams.set("refresh", String(Date.now()));
          window.location.replace(url);
        }}>{this.props.retryLabel}</button>
        <button type="button" onClick={this.props.onBack}>{this.props.backLabel}</button>
      </div>
    );
  }
}

export default function App() {
  const { begin } = useLoading();
  const { language, copy } = useLanguage();
  const {
    archiveRequest,
    clearArchiveRequest,
    focused,
    isNight,
    lampPower,
    lampBrightness,
    setLampBrightness,
    setNightMode,
    toggleLampPower,
    tactileMuted,
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
  const projectOriginRoute = useRef<IndexRoute | null>(null);
  const quickReadOriginRoute = useRef<IndexRoute | null>(null);
  const journalOriginRoute = useRef<IndexRoute | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const indexTrigger = useRef<HTMLButtonElement>(null);
  const roomExitRef = useRef<HTMLButtonElement>(null);
  const pendingTransitionFocus = useRef<View | null>(null);
  const roomTask = useRef<LoadingTaskController | null>(null);
  const roomFailed = useRef(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  const viewTransitionRef = useRef<"idle" | "preparing" | "opening" | "closing">("idle");
  const roomReadyRef = useRef(false);
  const revealCompletedRef = useRef(initialRoute.view === "room");
  const [roomReady, setRoomReady] = useState(false);
  const [viewTransition, setViewTransition] = useState<"idle" | "preparing" | "opening" | "closing">("idle");
  const [roomMounted, setRoomMounted] = useState(initialRoute.view === "room");
  const { progress: revealProgress, animateTo: animateReveal, cancel: cancelReveal } = useRoomReveal(
    initialRoute.view === "room" ? 1 : 0,
  );

  useEffect(() => {
    if (route.view === "room") {
      document.title = language === "zh" ? "王心蕊 — Room" : "Olivia Wong — Room";
    }
  }, [language, route.view]);

  const beginRoomLoading = useCallback((blocking = true) => {
    if (roomTask.current) return;
    setRoomError(null);
    roomTask.current = begin("Room scene", { blocking });
  }, [begin]);

  const settleRoomLoading = useCallback(() => {
    roomTask.current?.done();
    roomTask.current = null;
    roomFailed.current = false;
    setRoomError(null);
  }, []);

  const reportRoomProgress = useCallback(
    ({ active, progress, errors }: RoomAssetProgress) => {
      if (active) {
        beginRoomLoading(false);
        roomTask.current?.report(progress / 100);
      }
      if (errors > 0 && !roomFailed.current) {
        roomFailed.current = true;
        setRoomError(copy.roomLoadError);
        roomTask.current?.fail(copy.roomLoadError, () => window.location.reload());
      }
    },
    [beginRoomLoading, copy.roomLoadError],
  );

  useEffect(() => {
    const syncTime = () => setNightMode(isNightNow());
    syncTime();
    const timer = window.setInterval(syncTime, 60_000);
    return () => window.clearInterval(timer);
  }, [setNightMode]);

  useEffect(() => {
    if (viewRef.current === "room") beginRoomLoading();
  }, [beginRoomLoading]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (musicPlaying) el.play().catch(reportMusicUnavailable);
    else el.pause();
  }, [musicPlaying]);

  const setTransitionPhase = useCallback((phase: "idle" | "preparing" | "opening" | "closing") => {
    viewTransitionRef.current = phase;
    setViewTransition(phase);
  }, []);

  const finishOpening = useCallback(() => {
    pendingTransitionFocus.current = "room";
    setTransitionPhase("idle");
  }, [setTransitionPhase]);

  const finishClosing = useCallback(() => {
    pendingTransitionFocus.current = "index";
    setRoomMounted(false);
    roomReadyRef.current = false;
    revealCompletedRef.current = false;
    setRoomReady(false);
    setTransitionPhase("idle");
    settleRoomLoading();
  }, [setTransitionPhase, settleRoomLoading]);

  const turnPage = useCallback((view: View, pushHistory = true) => {
    const currentPhase = viewTransitionRef.current;
    if (view === "room") {
      if (viewRef.current === "room" && currentPhase !== "closing") return;
      viewRef.current = "room";
      setRoute({ view: "room" });
      if (pushHistory && window.location.hash !== "#room") window.history.pushState(null, "", "#room");
      if (!roomMounted) setRoomMounted(true);
      if (roomReadyRef.current) settleRoomLoading();
      else beginRoomLoading(false);

      // Run one uninterrupted fold. The paper surface hides the WebGL warmup
      // and dissolves when ready; the timeline never freezes at 14% again.
      revealCompletedRef.current = false;
      setTransitionPhase("opening");
      animateReveal(1, {
        duration: ARCHIVE_ROOM_REVEAL_DURATION,
        onComplete: () => {
          revealCompletedRef.current = true;
          if (roomReadyRef.current) finishOpening();
        },
      });
      return;
    }

    if (viewRef.current === "index" && currentPhase !== "opening" && currentPhase !== "preparing") return;
    viewRef.current = "index";
    setRoute(indexRouteRef.current);
    const indexHash = hashForIndex(indexRouteRef.current);
    if (pushHistory && window.location.hash !== indexHash) window.history.pushState(null, "", indexHash);
    setTransitionPhase("closing");
    animateReveal(0, { duration: ARCHIVE_ROOM_REVEAL_DURATION, onComplete: finishClosing });
  }, [animateReveal, beginRoomLoading, finishClosing, finishOpening, roomMounted, setTransitionPhase, settleRoomLoading]);

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
      if (next.view !== viewRef.current) turnPage(next.view, false);
      else setRoute(next);
    };

    window.addEventListener("popstate", syncRoute);
    window.addEventListener("hashchange", syncRoute);
    return () => {
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener("hashchange", syncRoute);
    };
  }, [turnPage]);

  useEffect(() => cancelReveal, [cancelReveal]);

  const enterRoom = useCallback(() => turnPage("room"), [turnPage]);

  const openIndex = useCallback((collection: Collection = "work") => {
    focus(null);
    const next: IndexRoute = { view: "index", theme: themeForCollection(collection) };
    applyIndexRoute(next);
    turnPage("index", false);
  }, [applyIndexRoute, turnPage]);

  useEffect(() => {
    if (!archiveRequest) return;
    openIndex(archiveRequest);
    clearArchiveRequest();
  }, [archiveRequest, clearArchiveRequest, openIndex]);

  useEffect(() => () => settleRoomLoading(), [settleRoomLoading]);

  const handleThemeChange = useCallback((theme: ThemeId, showAll = false, focused = false) => {
    applyIndexRoute({ view: "index", theme, archive: showAll, focused });
  }, [applyIndexRoute]);

  const handleQuickReadOpen = useCallback((quickReadId: QuickReadPageId) => {
    const current = indexRouteRef.current;
    if (!current.quickReadId) quickReadOriginRoute.current = { ...current };
    // Switching between the three subpages replaces the current quick-read
    // entry, so its Back button returns to the index instead of stepping back
    // through every tab the visitor opened.
    applyIndexRoute({ view: "index", theme: current.theme, quickReadId }, !current.quickReadId);
  }, [applyIndexRoute]);

  const handleQuickReadClose = useCallback(() => {
    if (quickReadOriginRoute.current) {
      quickReadOriginRoute.current = null;
      window.history.back();
      return;
    }
    applyIndexRoute({ view: "index", theme: "build" }, false);
  }, [applyIndexRoute]);

  const handleJournalOpen = useCallback((journalId: string) => {
    const current = indexRouteRef.current;
    if (!current.journalId) journalOriginRoute.current = { ...current };
    applyIndexRoute({ ...current, journalId }, !current.journalId);
  }, [applyIndexRoute]);

  const handleJournalClose = useCallback(() => {
    if (journalOriginRoute.current) {
      journalOriginRoute.current = null;
      window.history.back();
      return;
    }
    const next = { ...indexRouteRef.current };
    delete next.journalId;
    applyIndexRoute(next, false);
  }, [applyIndexRoute]);

  const handleProjectOpen = useCallback((entry: { id: string; primaryTheme: ThemeId }) => {
    projectOriginRoute.current = indexRouteRef.current;
    applyIndexRoute({ view: "index", theme: entry.primaryTheme, focused: true, projectId: entry.id });
  }, [applyIndexRoute]);

  const handleProjectClose = useCallback((theme: ThemeId) => {
    if (projectOriginRoute.current) {
      projectOriginRoute.current = null;
      window.history.back();
      return;
    }
    applyIndexRoute({ view: "index", theme, focused: true }, false);
  }, [applyIndexRoute]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (viewRef.current === "index") {
        const current = indexRouteRef.current;
        if (current.projectId) {
          handleProjectClose(current.theme);
          return;
        }
        if (current.quickReadId) {
          handleQuickReadClose();
          return;
        }
        if (current.journalId) {
          handleJournalClose();
          return;
        }
        if (current.focused) {
          focus(null);
          applyIndexRoute({ view: "index", theme: current.theme, focused: false }, false);
          return;
        }
      }
      if (focused) {
        focus(null);
        return;
      }
      if (viewRef.current === "room" && viewTransitionRef.current === "idle") openIndex();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyIndexRoute, focused, handleJournalClose, handleProjectClose, handleQuickReadClose, openIndex]);

  const brightnessPercent = Math.round(lampBrightness * 100);
  const markRoomReady = useCallback(() => {
    if (roomReadyRef.current) return;
    roomReadyRef.current = true;
    setRoomReady(true);
    settleRoomLoading();
    if (viewTransitionRef.current === "opening" && revealCompletedRef.current) finishOpening();
  }, [finishOpening, settleRoomLoading]);
  const indexCovered = route.view === "room" && revealProgress >= 0.999;
  const roomInteractive = route.view === "room" && roomReady && viewTransition === "idle" && revealProgress >= 0.999;
  // Keep the expensive Canvas element stable while the page mask advances.
  const roomScene = useMemo(() => (
    <RoomScene isNight={isNight} onReady={markRoomReady} onAssetProgress={reportRoomProgress} />
  ), [isNight, markRoomReady, reportRoomProgress]);

  useEffect(() => {
    const target = pendingTransitionFocus.current;
    if (!target) return;

    const ready = target === "room"
      ? roomInteractive
      : route.view === "index" && viewTransition === "idle" && !roomMounted;
    if (!ready) return;

    const frame = window.requestAnimationFrame(() => {
      if (pendingTransitionFocus.current !== target) return;
      const control = target === "room" ? roomExitRef.current : indexTrigger.current;
      if (!control) return;
      control.focus({ preventScroll: true });
      pendingTransitionFocus.current = null;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [roomInteractive, roomMounted, route.view, viewTransition]);

  return (
    <div className={["app", isNight && "app--evening"].filter(Boolean).join(" ")}>
      {roomMounted && (
        <RoomSceneBoundary retryLabel={copy.retry} backLabel={copy.returnToIndex} onBack={() => openIndex()}>
        <RoomRevealSurface progress={revealProgress} interactive={roomInteractive} sceneReady={roomReady}>
            <Suspense fallback={<div className="room-loading" role="status" aria-label={copy.loadingRoom} />}>
              {roomScene}
          </Suspense>
          {roomInteractive && focused !== "portfolio" && (
            <header className="hud">
              <div className="hud__identity">
                <span className="hud__name">{language === "zh" ? "王心蕊" : "Olivia Wong"}</span>
                <LanguageSwitch />
              </div>
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
                    aria-label={copy.lampBrightness}
                    aria-valuetext={brightnessPercent + "%" + (language === "zh"
                      ? lampPower ? "，已开启" : "，已关闭"
                      : lampPower ? " · on" : " · off")}
                  />
                </div>
                <button
                  className="hud__btn hud__btn--icon"
                  type="button"
                  onClick={() => {
                    tactileFeedback("press", tactileMuted);
                    toggleLampPower();
                  }}
                  aria-label={lampPower ? copy.turnLampOff : copy.turnLampOn}
                  aria-pressed={lampPower}
                  title={lampPower ? copy.turnLampOff : copy.turnLampOn}
                >
                  <span aria-hidden="true">{lampPower ? "◉" : "○"}</span>
                </button>
              </div>
            </header>
          )}

          <Surface />
          {roomInteractive && focused !== "portfolio" && <RoomExitButton ref={roomExitRef} onClick={() => openIndex()} />}
        </RoomRevealSurface>
        </RoomSceneBoundary>
      )}

      {roomError && (
        <div className="room-loading-error" role="alert">
          <span>{copy.roomLoadError}</span>
          <button type="button" onClick={() => window.location.reload()}>{copy.retry}</button>
          <button type="button" onClick={() => openIndex()}>{copy.returnToIndex}</button>
        </div>
      )}

      {route.view === "index" && viewTransition === "idle" && !indexRoute.focused && !indexRoute.projectId && !indexRoute.quickReadId && !indexRoute.journalId && (
        <PaperCorner
          ref={indexTrigger}
          label="Room"
          ariaLabel={copy.enterRoom}
          title={copy.enterRoom}
          onClick={enterRoom}
          onPreload={preloadRoomScene}
          disabled={viewTransition !== "idle"}
        />
      )}

      <audio ref={audioRef} src="/audio/now-playing.mp3" loop preload="none" />

      <div
        className={["page-sheet", "page-sheet--index", indexCovered && "page-sheet--index-covered"].filter(Boolean).join(" ")}
        aria-hidden={route.view === "room"}
        style={{
          pointerEvents: route.view === "room" ? "none" : "auto",
          visibility: indexCovered ? "hidden" : "visible",
        }}
      >
          <Archive
            active={route.view === "index"}
            initialTheme={indexRoute.theme}
            initialFocused={Boolean(indexRoute.focused || indexRoute.projectId)}
            showThemeArchive={Boolean(indexRoute.archive || indexRoute.projectId)}
            projectId={indexRoute.projectId}
            quickReadId={indexRoute.quickReadId}
            journalId={indexRoute.journalId}
            onClose={enterRoom}
            onThemeChange={handleThemeChange}
            onProjectOpen={handleProjectOpen}
            onProjectClose={handleProjectClose}
            onQuickReadOpen={handleQuickReadOpen}
            onQuickReadClose={handleQuickReadClose}
            onJournalOpen={handleJournalOpen}
            onJournalClose={handleJournalClose}
          />
      </div>
    </div>
  );
}
