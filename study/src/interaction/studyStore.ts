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
}

let state: StudyState = { focused: null, lampOn: false };
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

export function useStudy() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ...snapshot, focus, toggleLamp };
}
