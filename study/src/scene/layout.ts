/**
 * Single source of truth for where things are in the room.
 *
 * Object components and the camera poses in `data/hotspots.ts` both read from
 * here, so nudging a prop on the desk moves its close-up with it instead of
 * silently drifting out of frame.
 *
 * Units are metres and the scale is real: a 1.7m desk, a 0.31m laptop. Keeping
 * it physical is what makes the lighting behave.
 */
export const DESK_TOP_Y = 0.75;
export const BACK_WALL_Z = -1.65;
export const LEFT_WALL_X = -2.5;

/** Usable desk surface: x from -0.85 to 0.85, z from -1.41 to -0.69. */
export const layout = {
  lamp: { pos: [-0.7, DESK_TOP_Y, -1.26] as const, rotY: 0.2 },
  laptop: { pos: [-0.28, DESK_TOP_Y, -1.08] as const, rotY: 0.16 },
  portfolio: { pos: [-0.1, DESK_TOP_Y, -0.82] as const, rotY: -0.12 },
  phone: { pos: [0.3, DESK_TOP_Y, -0.8] as const, rotY: -0.35 },
  mug: { pos: [0.3, DESK_TOP_Y, -1.2] as const, rotY: 0 },
  camera: { pos: [0.6, DESK_TOP_Y, -1.06] as const, rotY: -0.55 },
  polaroids: { pos: [0.62, DESK_TOP_Y, -0.83] as const, rotY: 0.1 },
  plant: { pos: [1.35, 0, -1.3] as const, rotY: 0 },
  // pulled forward so the 0.3m-deep carcass sits flush against the left wall
  shelf: { pos: [-2.34, 0, -0.85] as const, rotY: Math.PI / 2 },
  board: { pos: [0.42, 1.5, BACK_WALL_Z + 0.03] as const, rotY: 0 },
} as const;
