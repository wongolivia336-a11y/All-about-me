import { layout } from "../scene/layout";

/**
 * The navigation model of the whole site: every piece of content lives on a
 * physical object, and every object owns a real URL. Add an entry here and it
 * joins the hover labels, the camera choreography and the index fallback.
 *
 * Camera poses are derived from `scene/layout.ts` rather than hand-typed, so
 * sliding an object across the desk brings its close-up along with it.
 */
export type HotspotId =
  | "laptop"
  | "phone"
  | "portfolio"
  | "shelf"
  | "camera"
  | "board"
  | "lamp";

type Vec3 = [number, number, number];

export interface Hotspot {
  id: HotspotId;
  /** shown on hover, in the room */
  label: string;
  /** one line of what it holds */
  blurb: string;
  path: string;
  /** camera position when this object is focused */
  cam: Vec3;
  /** what the camera looks at */
  target: Vec3;
}

export const HOME_CAM: Vec3 = [2.05, 1.62, 1.95];
export const HOME_TARGET: Vec3 = [-0.1, 0.85, -0.95];

const at = (
  base: readonly [number, number, number],
  lift: number,
  offset: Vec3,
): { cam: Vec3; target: Vec3 } => {
  const target: Vec3 = [base[0], base[1] + lift, base[2]];
  return {
    target,
    cam: [target[0] + offset[0], target[1] + offset[1], target[2] + offset[2]],
  };
};

export const hotspots: Hotspot[] = [
  {
    id: "laptop",
    label: "Web",
    blurb: "网页与界面项目",
    path: "/web",
    // sight line straight into the lid, which sits at the back of the base
    ...at([layout.laptop.pos[0], 0.75, layout.laptop.pos[2] - 0.11], 0.11, [
      0, 0.06, 0.42,
    ]),
  },
  {
    id: "phone",
    label: "App",
    blurb: "移动端产品与原型",
    path: "/app",
    ...at(layout.phone.pos, 0.01, [0, 0.3, 0.13]),
  },
  {
    id: "portfolio",
    label: "Portfolio",
    blurb: "完整作品集 PDF",
    path: "/portfolio",
    ...at(layout.portfolio.pos, 0.01, [0, 0.36, 0.21]),
  },
  {
    id: "shelf",
    label: "Reading",
    blurb: "书单与读书笔记",
    path: "/reading",
    ...at([layout.shelf.pos[0], 0, layout.shelf.pos[2]], 1.0, [1.05, 0.15, 0.28]),
  },
  {
    id: "camera",
    label: "Photography",
    blurb: "摄影",
    path: "/photography",
    ...at(layout.camera.pos, 0.05, [0.2, 0.15, 0.36]),
  },
  {
    id: "board",
    label: "About",
    blurb: "关于我 / 最近在做什么",
    path: "/about",
    ...at(layout.board.pos, 0, [0, 0.05, 0.75]),
  },
  {
    id: "lamp",
    // never a camera destination — clicking it flips the lights
    label: "Lights",
    blurb: "开灯 / 关灯",
    path: "/",
    ...at(layout.lamp.pos, 0.35, [0.3, 0.15, 0.5]),
  },
];

export const hotspotById = (id: HotspotId) => hotspots.find((h) => h.id === id)!;

export const hotspotByPath = (path: string) =>
  hotspots.find((h) => h.path === path && h.path !== "/");
