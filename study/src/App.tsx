import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { content } from "./data/content";
import { HOME_CAM, hotspots } from "./data/hotspots";
import { focus, reportMusicUnavailable, useStudy } from "./interaction/studyStore";
import { Room } from "./scene/Room";
import { Surface } from "./ui/Surface";

export default function App() {
  const { focused, lampOn, toggleLamp, musicPlaying } = useStudy();
  const [indexMode, setIndexMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // The audio element lives here rather than in the music panel so closing the
  // panel does not stop the music.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (musicPlaying) {
      // rejects when the file is missing or the browser blocks it — say so
      // rather than leaving a play button that silently does nothing
      el.play().catch(reportMusicUnavailable);
    } else {
      el.pause();
    }
  }, [musicPlaying]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (indexMode) setIndexMode(false);
      else focus(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [indexMode]);

  return (
    <div className={`app${lampOn ? " app--evening" : ""}`}>
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        gl={{ antialias: true, toneMappingExposure: 1.05 }}
        camera={{ position: HOME_CAM, fov: 36, near: 0.05, far: 60 }}
        onPointerMissed={() => focus(null)}
      >
        <color attach="background" args={[lampOn ? "#171419" : "#e8e3da"]} />
        <Room />
      </Canvas>

      <header className="hud">
        <div className="hud__id">
          <span className="hud__name">Olivia Wong</span>
          <span className="hud__role">设计 · 摄影 · 产品</span>
        </div>
        <div className="hud__actions">
          <button
            className="hud__btn"
            onClick={toggleLamp}
            aria-pressed={lampOn}
            title="开灯 / 关灯"
          >
            {lampOn ? "☾ 夜" : "☀ 昼"}
          </button>
          <button className="hud__btn" onClick={() => setIndexMode((v) => !v)}>
            {indexMode ? "返回房间" : "Index"}
          </button>
        </div>
      </header>

      {!focused && !indexMode && (
        <p className="hint">点击物件进入 · 拖动可轻微转视角 · Esc 返回</p>
      )}

      <Surface />

      <audio ref={audioRef} src="/audio/now-playing.mp3" loop preload="none" />

      {indexMode && (
        <div className="index" role="dialog" aria-label="内容索引">
          <div className="index__inner">
            <p className="index__kicker">Index</p>
            <h1 className="index__title">如果你赶时间</h1>
            <p className="index__note">
              房间里的每个物件都对应下面一项。不想逛的话，直接从这儿进。
            </p>
            <ul className="index__list">
              {hotspots
                .filter((h) => content[h.id])
                .map((h) => (
                  <li key={h.id}>
                    <button
                      onClick={() => {
                        setIndexMode(false);
                        focus(h.id);
                      }}
                    >
                      <span className="index__label">{h.label}</span>
                      <span className="index__blurb">{h.blurb}</span>
                      <span className="index__path">{h.path}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
