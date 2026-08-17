import { useSyncExternalStore } from "react";
import type { HotspotId } from "../data/hotspots";

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
  /** desk lamp switch — drives the room's mood */
  lampOn: boolean;
  /** the speaker. Browsers block autoplay, so this only ever starts on a click */
  musicPlaying: boolean;
  /** set when playback was refused — usually because no audio file is present */
  musicUnavailable: boolean;
}

let state: StudyState = {
  focused: null,
  lampOn: false,
  musicPlaying: false,
  musicUnavailable: false,
};
const listeners = new Set<() => void>();

function setState(patch: Partial<StudyState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;

export const focus = (id: HotspotId | null) => setState({ focused: id });
export const toggleLamp = () => setState({ lampOn: !state.lampOn });
export const setMusicPlaying = (playing: boolean) =>
  setState({ musicPlaying: playing, ...(playing ? { musicUnavailable: false } : {}) });

export const reportMusicUnavailable = () =>
  setState({ musicPlaying: false, musicUnavailable: true });

export function useStudy() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ...snapshot, focus, toggleLamp, setMusicPlaying };
}
