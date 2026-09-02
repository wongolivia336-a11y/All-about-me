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

/**
 * Usable desk surface: x from -0.85 to 0.85, z from -1.41 to -0.69.
 *
 * Laid out in three bands — a back row against the wall, the laptop in the
 * middle, and a front row at the near edge — so nothing overlaps and the
 * surface still reads as used rather than arranged.
 */
export const layout = {
  // --- back row ---
  lamp: { pos: [-0.72, DESK_TOP_Y, -1.26] as const, rotY: 0.2 },
  mug: { pos: [-0.32, DESK_TOP_Y, -1.25] as const, rotY: 0 },
  tray: { pos: [0.05, DESK_TOP_Y, -1.15] as const, rotY: 0.12 },
  camera: { pos: [0.32, DESK_TOP_Y, -1.25] as const, rotY: -0.5 },
  marshall: { pos: [0.62, DESK_TOP_Y, -1.26] as const, rotY: -0.28 },

  // --- middle ---
  laptop: { pos: [-0.3, DESK_TOP_Y, -1.08] as const, rotY: 0.16 },

  // --- front row ---
  portfolio: { pos: [-0.42, DESK_TOP_Y, -0.8] as const, rotY: -0.1 },
  sketchbook: { pos: [0.02, DESK_TOP_Y, -0.82] as const, rotY: 0.14 },
  phone: { pos: [0.33, DESK_TOP_Y, -0.8] as const, rotY: -0.35 },
  polaroids: { pos: [0.55, DESK_TOP_Y, -0.83] as const, rotY: 0.1 },

  /** a ring left where a mug used to sit — no object, just a stain */
  coffeeRing: { pos: [-0.18, DESK_TOP_Y, -1.19] as const, rotY: 0 },

  // --- around the room ---
  plant: { pos: [-1.5, 0, -1.35] as const, rotY: 0 },
  // pulled forward so the 0.3m-deep carcass sits flush against the left wall
  shelf: { pos: [-2.34, 0, -0.85] as const, rotY: Math.PI / 2 },
  board: { pos: [-0.35, 1.55, BACK_WALL_Z + 0.03] as const, rotY: 0 },
  /** the deliberately unfinished corner */
  whiteboard: { pos: [-1.45, 1.34, BACK_WALL_Z + 0.02] as const, rotY: 0 },

  // --- the reading corner ---
  // kept inside x < 1.9 so the whole corner stays in frame on a narrow window
  chair: { pos: [1.38, 0, -0.72] as const, rotY: -1.15 },
  posters: { pos: [1.3, 1.5, BACK_WALL_Z + 0.02] as const, rotY: 0 },
} as const;
