/**
 * FOUR HEARTS — approved B4 corner geometry.
 * This deliberately models only the small navigation corner, not the full-page
 * Index ↔ Room transition in roomRevealGeometry.ts.
 */

export const REST_LIFT = 0.31;
export const FOCUS_LIFT = 0.7;

export interface PaperCornerB4Geometry {
  under: string;
  flap: string;
  crease: string;
  freeEdge: string;
  broadShadowOffset: string;
  contactShadowOffset: string;
}

export const clampCornerLift = (value: number) =>
  Math.max(0, Math.min(1, value));

export function paperCornerB4Geometry(rawLift: number): PaperCornerB4Geometry {
  const lift = clampCornerLift(rawLift);
  const s = 16 + 112 * lift;
  const x = 200 - s;

  const under = `M${x} 0 L200 0 L200 ${s} Z`;
  const crease =
    `M${x} 0 ` +
    `C${200 - s * 0.61} ${s * 0.02}, ${200 - s * 0.29} ${s * 0.27}, ${200 - s * 0.22} ${s * 0.52} ` +
    `C${200 - s * 0.13} ${s * 0.75}, ${200 - s * 0.04} ${s * 0.9}, 200 ${s}`;
  const freeEdge =
    `M200 ${s} ` +
    `C${200 - s * 0.22} ${s * 0.94}, ${200 - s * 0.52} ${s * 0.85}, ${200 - s * 0.9} ${s * 0.91} ` +
    `C${200 - s * 1.08} ${s * 0.62}, ${200 - s * 1.08} ${s * 0.19}, ${x} 0`;

  return {
    under,
    flap: `${crease} ${freeEdge.replace(/^M/, "L")} Z`,
    crease,
    freeEdge,
    broadShadowOffset: `translate(${-2 - 5 * lift}, ${5 + 9 * lift})`,
    contactShadowOffset: `translate(${-1 - 1.7 * lift}, ${1.6 + 2 * lift})`,
  };
}
