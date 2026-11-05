import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n";
import { createFourHeartsEngine, type FourHeartsEngine } from "./loading/fourHeartsEngine";
import "./SpeechCodeLoader.css";

type SpeechCodeLoaderProps = {
  active: boolean;
  progress?: number | null;
  error?: string | null;
  onRetry?: () => void;
  onReturnToIndex?: () => void;
};

const exposureMs = 1200;
const reducedExposureMs = 280;
const exitMs = 360;

export function SpeechCodeLoader({ active, progress = null, error = null, onRetry, onReturnToIndex }: SpeechCodeLoaderProps) {
  const { language, copy } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FourHeartsEngine | null>(null);
  const shownAt = useRef(0);
  const [presented, setPresented] = useState(active);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!active) return;
    shownAt.current = performance.now();
    setPresented(true);
    setLeaving(false);
  }, [active]);

  useEffect(() => {
    if (active || !presented) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = Math.max(
      0,
      (reduced ? reducedExposureMs : exposureMs) - (performance.now() - shownAt.current),
    );
    const leaveTimer = window.setTimeout(() => setLeaving(true), wait);
    const hideTimer = window.setTimeout(() => setPresented(false), wait + (reduced ? 0 : exitMs));
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, [active, presented]);

  useEffect(() => {
    if (!presented) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = createFourHeartsEngine(canvas, {
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      if (engineRef.current === engine) engineRef.current = null;
    };
  }, [presented]);

  useEffect(() => {
    engineRef.current?.setProgress(progress);
  }, [progress]);

  return (
    <section className={["speech-loader", !presented && "speech-loader--hidden", leaving && "speech-loader--leaving"].filter(Boolean).join(" ")} aria-hidden={!presented} aria-label={language === "zh" ? "网站正在载入" : "Website is loading"}>
      <header className="speech-loader__topline">
        <div>
          <strong>FOUR HEARTS<span aria-hidden="true">.</span></strong>
          <small>OLIVIA WONG / 王心蕊</small>
        </div>
        <span className="speech-loader__state">{active ? copy.loaderForming : copy.loaderReady}</span>
      </header>
      <div className="speech-loader__artwork">
        <canvas ref={canvasRef} className="speech-loader__canvas" role="img" aria-label={language === "zh" ? "由 ASCII 字符和网点组成的四叶草" : "A four-leaf clover made from ASCII marks and halftone particles"} />
        <p className="speech-loader__sidenote"><b>01—04</b> / FOUR WORLDS<br />{language === "zh" ? "构建 · 追问 · 玩耍 · 珍藏" : "Build · Question · Play · Collect"}</p>
        <span className="speech-loader__caption" aria-hidden="true">a world, assembled from little things.</span>
      </div>
      <footer className="speech-loader__footer">
        <div>
          <span className="speech-loader__eyebrow">{language === "zh" ? "一段转场 / 不是等待室" : "AN INTERLUDE / NOT A WAITING ROOM"}</span>
          <p>{copy.loaderTitle}</p>
          <small>{copy.loaderSubtitle}</small>
        </div>
        <div className="speech-loader__progress-copy">
          <span>{progress == null ? copy.loaderWorking : `${Math.round(progress * 100)}%`}</span>
          <span className="speech-loader__track" role={progress == null ? undefined : "progressbar"} aria-label={copy.loaderProgress} aria-valuemin={progress == null ? undefined : 0} aria-valuemax={progress == null ? undefined : 100} aria-valuenow={progress == null ? undefined : Math.round(progress * 100)}>
            <i style={progress == null ? undefined : { width: `${Math.round(progress * 100)}%` }} />
          </span>
        </div>
      </footer>
      {error && onRetry && (
        <div className="speech-loader__error">
          <span>{copy.roomLoadError}</span>
          <button type="button" onClick={onRetry}>{copy.retry}</button>
          {onReturnToIndex && (
            <button type="button" onClick={onReturnToIndex}>{copy.returnToIndex}</button>
          )}
        </div>
      )}
    </section>
  );
}

