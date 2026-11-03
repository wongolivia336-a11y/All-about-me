import { useEffect, useMemo, useState, type ReactNode } from "react";
import { roomRevealClipPath } from "./roomRevealGeometry";

interface RoomRevealSurfaceProps {
  children: ReactNode;
  progress: number;
  interactive: boolean;
}

const viewportSize = () => ({ width: window.innerWidth, height: window.innerHeight });

export function RoomRevealSurface({ children, progress, interactive }: RoomRevealSurfaceProps) {
  const [viewport, setViewport] = useState(viewportSize);

  useEffect(() => {
    const handleResize = () => setViewport(viewportSize());
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const clipPath = useMemo(
    () => roomRevealClipPath(viewport.width, viewport.height, progress),
    [progress, viewport.height, viewport.width],
  );

  return (
    <div
      className="room-reveal-surface"
      data-reveal-progress={progress.toFixed(3)}
      data-reveal-interactive={interactive ? "true" : "false"}
      aria-hidden={!interactive}
      style={{
        clipPath,
        pointerEvents: interactive ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}

export function RoomPeek({ visible }: { visible: boolean }) {
  return (
    <div className="room-peek" data-visible={visible ? "true" : "false"} aria-hidden="true">
      <span className="room-peek__grid" />
      <span className="room-peek__copy">
        <strong>Room</strong>
        <small>the study</small>
      </span>
    </div>
  );
}
