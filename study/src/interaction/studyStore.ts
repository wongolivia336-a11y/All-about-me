import { useSyncExternalStore } from "react";
import type { Collection } from "../data/library";
import type { HotspotId } from "../data/hotspots";
import {
  DEFAULT_LAMP_BRIGHTNESS,
  clampLampBrightness,
  effectiveLampBrightness,
} from "./lampControl";

/**
 * Shared state for the room.
 *
 * Deliberately NOT React context: <Canvas> mounts its own reconciler root, so
 * context from the DOM tree does not reach components inside the scene. An
 * external store is read identically from both sides.
 */
interface StudyState {
  /** which object the camera is pushed into, if any */
  focused: HotspotId | null;
  /** a one-shot request from a physical object to the DOM Index */
  archiveRequest: Collection | null;
  /** ambient time of day; this never follows a local task-light action */
  isNight: boolean;
  /** physical switch state; never inferred from a brightness adjustment */
  lampPower: boolean;
  /** increments for every explicit power press, including the accessible HUD */
  lampPowerRevision: number;
  /** 0..1 dimmer position, retained even while the lamp is powered off */
  lampBrightness: number;
  /** the level restored when a physical press turns power back on */
  lastNonZeroLampBrightness: number;
  /** prevents CameraControls from competing with an active dial gesture */
  lampInteracting: boolean;
  /** optional, low-volume mechanical feedback; defaults to enabled */
  tactileMuted: boolean;
  /** the speaker. Browsers block autoplay, so this only ever starts on a click */
  musicPlaying: boolean;
  /** set when playback was refused — usually because no audio file is present */
  musicUnavailable: boolean;
  /** 0..1, shared by the speaker and by the cat */
  volume: number;
}

let state: StudyState = {
  focused: null,
  archiveRequest: null,
  isNight: initialNightMode(),
  lampPower: false,
  lampPowerRevision: 0,
  lampBrightness: DEFAULT_LAMP_BRIGHTNESS,
  lastNonZeroLampBrightness: DEFAULT_LAMP_BRIGHTNESS,
  lampInteracting: false,
  tactileMuted: false,
  musicPlaying: false,
  musicUnavailable: false,
  volume: 0.6,
};
const listeners = new Set<() => void>();

function setState(patch: Partial<StudyState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;
const useStudyValue = <T,>(read: () => T) =>
  useSyncExternalStore(subscribe, read, read);
function initialNightMode() {
  if (typeof window === "undefined") return false;
  const hour = new Date().getHours();
  return hour < 7 || hour >= 18;
}

export const focus = (id: HotspotId | null) => setState({ focused: id });
export const requestArchive = (collection: Collection) =>
  setState({ archiveRequest: collection, focused: null });
export const clearArchiveRequest = () => setState({ archiveRequest: null });
export const setNightMode = (isNight: boolean) => {
  if (state.isNight !== isNight) setState({ isNight });
};

export const setLampBrightness = (value: number) => {
  const lampBrightness = clampLampBrightness(value);

  setState({
    lampBrightness,
    ...(lampBrightness > 0.01
      ? { lastNonZeroLampBrightness: lampBrightness }
      : {}),
  });
};

export const toggleLampPower = () => {
  if (state.lampPower) {
    setState({ lampPower: false, lampPowerRevision: state.lampPowerRevision + 1 });
    return;
  }

  const restoredBrightness =
    state.lampBrightness > 0.01
      ? state.lampBrightness
      : state.lastNonZeroLampBrightness || DEFAULT_LAMP_BRIGHTNESS;

  setState({
    lampPower: true,
    lampPowerRevision: state.lampPowerRevision + 1,
    lampBrightness: restoredBrightness,
    lastNonZeroLampBrightness: restoredBrightness,
  });
};

export const setLampInteracting = (lampInteracting: boolean) => {
  if (state.lampInteracting !== lampInteracting) setState({ lampInteracting });
};

export const setTactileMuted = (tactileMuted: boolean) => setState({ tactileMuted });

export const setMusicPlaying = (playing: boolean) =>
  setState({ musicPlaying: playing, ...(playing ? { musicUnavailable: false } : {}) });

export const reportMusicUnavailable = () =>
  setState({ musicPlaying: false, musicUnavailable: true });

export const setVolume = (volume: number) =>
  setState({ volume: clampLampBrightness(volume) });

/** Read without subscribing — for one-off sounds fired from an event handler. */
export const currentVolume = () => state.volume;
/** Read during `useFrame` without subscribing a whole scene component. */
export const currentEffectiveLampBrightness = () =>
  effectiveLampBrightness(state.lampPower, state.lampBrightness);

export function useLampControls() {
  const lampPower = useStudyValue(() => state.lampPower);
  const lampPowerRevision = useStudyValue(() => state.lampPowerRevision);
  const lampBrightness = useStudyValue(() => state.lampBrightness);
  const tactileMuted = useStudyValue(() => state.tactileMuted);
  return {
    lampPower,
    lampPowerRevision,
    lampBrightness,
    tactileMuted,
    setLampBrightness,
    toggleLampPower,
    setLampInteracting,
  };
}

export function useFocusedRoom() {
  const focused = useStudyValue(() => state.focused);
  return { focused, focus };
}

export function useCameraRoomState() {
  const focused = useStudyValue(() => state.focused);
  const lampInteracting = useStudyValue(() => state.lampInteracting);
  return { focused, lampInteracting };
}

export function usePostFXLighting() {
  const isNight = useStudyValue(() => state.isNight);
  const effectiveBrightness = useStudyValue(currentEffectiveLampBrightness);
  return { isNight, effectiveBrightness };
}

export function useMusicState() {
  const musicPlaying = useStudyValue(() => state.musicPlaying);
  const musicUnavailable = useStudyValue(() => state.musicUnavailable);
  const volume = useStudyValue(() => state.volume);
  return {
    musicPlaying,
    musicUnavailable,
    volume,
    setMusicPlaying,
    setVolume,
  };
}

export function useStudy() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...snapshot,
    focus,
    requestArchive,
    clearArchiveRequest,
    setNightMode,
    setLampBrightness,
    toggleLampPower,
    setLampInteracting,
    setTactileMuted,
    setMusicPlaying,
    setVolume,
    effectiveLampBrightness: effectiveLampBrightness(snapshot.lampPower, snapshot.lampBrightness),
  };
}
