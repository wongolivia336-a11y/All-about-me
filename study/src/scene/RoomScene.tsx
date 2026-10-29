import { useProgress } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { HOME_CAM } from "../data/hotspots";
import { focus } from "../interaction/studyStore";
import { sceneDebug } from "./debug";
import { Room } from "./Room";

interface RoomSceneProps {
  isNight: boolean;
  onReady?: () => void;
  onAssetProgress?: (state: RoomAssetProgress) => void;
}

export type RoomAssetProgress = {
  active: boolean;
  progress: number;
  errors: number;
};

function SceneAssetProgress({ onAssetProgress }: Pick<RoomSceneProps, "onAssetProgress">) {
  const { active, progress, errors } = useProgress();

  useEffect(() => {
    onAssetProgress?.({ active, progress, errors: errors.length });
  }, [active, errors.length, onAssetProgress, progress]);

  return null;
}

function SceneReady({ onReady }: { onReady?: () => void }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!onReady) return;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      invalidate();
      secondFrame = window.requestAnimationFrame(onReady);
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [invalidate, onReady]);

  return null;
}

/**
 * Kept behind a dynamic import so the content-first Index never pays the
 * WebGL/R3F download cost until someone explicitly enters the room.
 */
export default function RoomScene({ isNight, onReady, onAssetProgress }: RoomSceneProps) {
  return (
    <Canvas
      shadows={sceneDebug.shadowsEnabled ? "soft" : false}
      dpr={[1, 2]}
      gl={{ antialias: true, toneMappingExposure: 1.05 }}
      camera={{ position: HOME_CAM, fov: 36, near: 0.05, far: 60 }}
      onPointerMissed={() => focus(null)}
    >
      <color attach="background" args={[isNight ? "#171419" : "#e8e3da"]} />
      <Room isNight={isNight} />
      <SceneReady onReady={onReady} />
      <SceneAssetProgress onAssetProgress={onAssetProgress} />
    </Canvas>
  );
}
