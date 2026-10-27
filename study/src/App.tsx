import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { HOME_CAM } from "./data/hotspots";
import {
  focus,
  reportMusicUnavailable,
  toggleLamp as flipLamp,
  useStudy,
} from "./interaction/studyStore";
import { Room } from "./scene/Room";
import { Archive } from "./ui/Archive";
import { Surface } from "./ui/Surface";

export default function App() {
  const { lampOn, toggleLamp, musicPlaying, volume } = useStudy();
  const [indexMode, setIndexMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const appliedTimeMood = useRef(false);

  useEffect(() => {
    if (appliedTimeMood.current) return;
    appliedTimeMood.current = true;

    const hour = new Date().getHours();
    if (hour < 7 || hour >= 18) flipLamp();
  }, []);

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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (indexMode) setIndexMode(false);
      else focus(null);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [indexMode]);

  const openIndex = () => {
    focus(null);
    setIndexMode(true);
  };

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
        <span className="hud__name">Olivia Wong</span>
        <div className="hud__actions">
          <button
            className="hud__btn hud__btn--icon"
            type="button"
            onClick={toggleLamp}
            aria-label="切换昼夜"
            aria-pressed={lampOn}
            title="切换昼夜"
          >
            <span aria-hidden="true">{lampOn ? "☾" : "☀"}</span>
          </button>
          <button className="hud__btn" type="button" onClick={openIndex}>
            Index
          </button>
        </div>
      </header>

      <Surface />

      <audio ref={audioRef} src="/audio/now-playing.mp3" loop preload="none" />

      {indexMode && <Archive onClose={() => setIndexMode(false)} />}
    </div>
  );
}
