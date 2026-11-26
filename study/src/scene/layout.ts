/**
 * Single source of truth for where things are in the room.
 *
 * Object components and the camera poses in `data/hotspots.ts` both read from
 * here, so nudging a prop on the desk moves its close-up with it instead of
 * silently drifting out of frame.
 *
 * Units are metres and the scale is real: a 1.7m desk and a compact 0.34m Macintosh. Keeping
 * it physical is what makes the lighting behave.
 */
export const DESK_TOP_Y = 0.75;
export const BACK_WALL_Z = -1.65;
export const LEFT_WALL_X = -2.5;

/**
 * The study is an open architectural diorama: back and left walls carry the
 * room, while the front and right remain intentionally cut away for viewing.
 * Keeping these limits explicit prevents the floor and walls from silently
 * growing whenever a prop needs a few more centimetres.
 */
export const ROOM_BOUNDS = {
  left: LEFT_WALL_X,
  right: 2.2,
  back: BACK_WALL_Z,
  front: 1.7,
  height: 2.8,
  wallThickness: 0.12,
  floorThickness: 0.08,
} as const;

/** A real opening in the left wall, measured in the room's Y/Z plane. */
export const WINDOW_OPENING = {
  centerZ: 0.72,
  width: 1.25,
  bottom: 0.65,
  height: 1.4,
} as const;

/**
 * Usable desk surface: x from -0.85 to 0.85, z from -1.41 to -0.69.
 *
 * The Mac anchors the center. Lamps, camera, cup, and materials stay along
 * the back edge; paper, keyboard, mouse, and phone form separate foreground
 * work zones with clear edges and room for their existing close-ups.
 */
export const layout = {
  // --- back row ---
  lamp: { pos: [-0.72, DESK_TOP_Y, -1.26] as const, rotY: 0.2 },
  camera: { pos: [-0.49, DESK_TOP_Y, -1.25] as const, rotY: -0.5 },
  mug: { pos: [-0.32, DESK_TOP_Y, -1.25] as const, rotY: 0 },
  tray: { pos: [0.34, DESK_TOP_Y, -1.24] as const, rotY: 0.12 },
  marshall: { pos: [0.68, DESK_TOP_Y, -1.26] as const, rotY: -0.28 },

  // --- center ---
  laptop: { pos: [0, DESK_TOP_Y, -1.14] as const, rotY: 0.1 },

  // --- front row ---
  portfolio: { pos: [-0.52, DESK_TOP_Y, -0.85] as const, rotY: -0.1 },
  keyboard: { pos: [0, DESK_TOP_Y, -0.9] as const, rotY: 0.1 },
  mouse: { pos: [0.27, DESK_TOP_Y, -0.89] as const, rotY: 0.1 },
  sketchbook: { pos: [0.43, DESK_TOP_Y, -0.82] as const, rotY: 0.14 },
  phone: { pos: [0.67, DESK_TOP_Y, -0.86] as const, rotY: -0.35 },
  polaroids: { pos: [-0.64, DESK_TOP_Y, -1.12] as const, rotY: 0.1 },

  /** a ring left where a mug used to sit — no object, just a stain */
  coffeeRing: { pos: [0.48, DESK_TOP_Y, -1.0] as const, rotY: 0 },

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
