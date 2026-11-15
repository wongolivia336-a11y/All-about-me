import { useCallback, useEffect, useRef, useState } from "react";

interface AnimateOptions {
  duration?: number;
  onComplete?: () => void;
}

const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);
export const ARCHIVE_ROOM_REVEAL_DURATION = 2400;

/** A single, interruptible progress driver shared by the reveal layers. */
export function useRoomReveal(initialProgress: number) {
  const [progress, setProgress] = useState(initialProgress);
  const progressRef = useRef(initialProgress);
  const frameRef = useRef<number | null>(null);
  const animationToken = useRef(0);

  const cancel = useCallback(() => {
    animationToken.current += 1;
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const setProgressValue = useCallback((value: number) => {
    progressRef.current = value;
    setProgress(value);
  }, []);

  const animateTo = useCallback((target: number, options: AnimateOptions = {}) => {
    cancel();
    const normalizedTarget = Math.min(1, Math.max(0, target));
    const from = progressRef.current;
    const distance = Math.abs(normalizedTarget - from);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (distance < 0.0001 || reduced) {
      setProgressValue(normalizedTarget);
      options.onComplete?.();
      return;
    }

    const token = animationToken.current;
    const startedAt = performance.now();
    const duration = options.duration ?? Math.max(260, Math.min(850, distance * 850));

    const frame = (now: number) => {
      if (token !== animationToken.current) return;
      const elapsed = Math.min(1, (now - startedAt) / duration);
      setProgressValue(from + (normalizedTarget - from) * easeOut(elapsed));
      if (elapsed >= 1) {
        frameRef.current = null;
        options.onComplete?.();
        return;
      }
      frameRef.current = window.requestAnimationFrame(frame);
    };

    frameRef.current = window.requestAnimationFrame(frame);
  }, [cancel, setProgressValue]);

  useEffect(() => cancel, [cancel]);

  return { progress, progressRef, animateTo, cancel, setProgress: setProgressValue };
}
