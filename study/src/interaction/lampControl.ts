/** The physical lamp's stable, non-animated control model. */
export const DEFAULT_LAMP_BRIGHTNESS = 0.72;
export const LAMP_MIN_BRIGHTNESS = 0;
export const LAMP_MAX_BRIGHTNESS = 1;
export const DIAL_MIN_ANGLE = (-130 * Math.PI) / 180;
export const DIAL_MAX_ANGLE = (130 * Math.PI) / 180;

/** Sixteen tactile detents are feedback landmarks, not brightness steps. */
export const LAMP_DETENT_COUNT = 16;

export const clampLampBrightness = (value: number) =>
  Math.min(LAMP_MAX_BRIGHTNESS, Math.max(LAMP_MIN_BRIGHTNESS, value));

export const dialAngleForBrightness = (brightness: number) =>
  DIAL_MIN_ANGLE +
  clampLampBrightness(brightness) * (DIAL_MAX_ANGLE - DIAL_MIN_ANGLE);

export const effectiveLampBrightness = (power: boolean, brightness: number) =>
  power ? clampLampBrightness(brightness) : 0;
