import {
  LAMP_DETENT_COUNT,
  clampLampBrightness,
} from "./lampControl";

export type LampGesturePhase = "press-candidate" | "dragging";

export type LampGesture = {
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  startBrightness: number;
  startedAt: number;
  phase: LampGesturePhase;
  lastDetent: number;
};

export const dragThresholdFor = (pointerType: string) =>
  pointerType === "touch" ? 8 : 6;

/**
 * Touch needs a slightly longer travel than a mouse so a small finger tremor
 * remains a press, while a full sweep is still comfortably reachable.
 */
export const travelFor = (pointerType: string, viewportWidth: number) => {
  const proportion = pointerType === "touch" ? 0.34 : 0.22;
  const min = pointerType === "touch" ? 150 : 120;
  const max = pointerType === "touch" ? 280 : 220;
  return Math.min(max, Math.max(min, viewportWidth * proportion));
};

export const movementFor = (gesture: LampGesture, clientX: number, clientY: number) => {
  const x = clientX - gesture.startX;
  const y = clientY - gesture.startY;
  return Math.max(Math.abs(x), Math.abs(y));
};

/**
 * Horizontal movement is primary; a small vertical contribution makes a
 * natural diagonal thumb sweep useful without creating a second gesture.
 */
export const brightnessFor = (
  gesture: LampGesture,
  clientX: number,
  clientY: number,
  viewportWidth: number,
) => {
  const axisDistance = clientX - gesture.startX - (clientY - gesture.startY) * 0.25;
  return clampLampBrightness(
    gesture.startBrightness + axisDistance / travelFor(gesture.pointerType, viewportWidth),
  );
};

export const detentForBrightness = (brightness: number) =>
  Math.round(clampLampBrightness(brightness) * LAMP_DETENT_COUNT);
