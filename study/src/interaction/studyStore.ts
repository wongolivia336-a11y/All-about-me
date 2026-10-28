import { useSyncExternalStore } from "react";
import type { Collection } from "../data/library";
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
  /** a one-shot request from a physical object to the DOM Index */
  archiveRequest: Collection | null;
  /** desk lamp switch — drives the room's mood */
  lampOn: boolean;
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
  lampOn: false,
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

export const focus = (id: HotspotId | null) => setState({ focused: id });
export const requestArchive = (collection: Collection) =>
  setState({ archiveRequest: collection, focused: null });
export const clearArchiveRequest = () => setState({ archiveRequest: null });
export const toggleLamp = () => setState({ lampOn: !state.lampOn });
export const setMusicPlaying = (playing: boolean) =>
  setState({ musicPlaying: playing, ...(playing ? { musicUnavailable: false } : {}) });

export const reportMusicUnavailable = () =>
  setState({ musicPlaying: false, musicUnavailable: true });

export const setVolume = (volume: number) =>
  setState({ volume: Math.min(1, Math.max(0, volume)) });

/** Read without subscribing — for one-off sounds fired from an event handler. */
export const currentVolume = () => state.volume;

export function useStudy() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...snapshot,
    focus,
    requestArchive,
    clearArchiveRequest,
    toggleLamp,
    setMusicPlaying,
    setVolume,
  };
}
