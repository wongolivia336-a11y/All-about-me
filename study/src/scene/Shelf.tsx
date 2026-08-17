import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { Hotspot } from "../interaction/Hotspot";
import { layout } from "./layout";
import { palette } from "./theme";

/** Deterministic pseudo-random, so the books don't reshuffle on every render. */
const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

const SPINE_COLORS = [
  "#7d8f9c",
  "#b46b52",
  "#8a9a72",
  "#c9a24d",
  "#6f6a86",
  "#a8563f",
  "#4f6b78",
  "#d0c3a8",
  "#8c7a5e",
  "#5d7a63",
];

export function Bookshelf() {
  const { pos, rotY } = layout.shelf;

  const W = 1.17; // inner width
  const D = 0.3;
  const H = 1.85;
  const shelfYs = [0.02, 0.44, 0.86, 1.28, 1.7];

  return (
    <Hotspot id="shelf" labelAt={[pos[0] + 0.3, 1.15, pos[2]]}>
      <group position={[pos[0], pos[1], pos[2]]} rotation={[0, rotY, 0]}>
        {/* sides */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (W / 2 + 0.015), H / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.03, H, D]} />
            <meshStandardMaterial color={palette.deskEdge} roughness={0.65} />
          </mesh>
        ))}

        {/* back panel */}
        <mesh position={[0, H / 2, -D / 2 + 0.007]} receiveShadow>
          <boxGeometry args={[W + 0.03, H, 0.014]} />
          <meshStandardMaterial color="#c2a07c" roughness={0.8} />
        </mesh>

        {/* shelves */}
        {shelfYs.map((y) => (
          <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[W, 0.028, D]} />
            <meshStandardMaterial color={palette.deskEdge} roughness={0.65} />
          </mesh>
        ))}

        {shelfYs.slice(0, 4).map((y, row) => (
          <BookRow key={y} y={y + 0.014} width={W} row={row} />
        ))}
      </group>
    </Hotspot>
  );
}

function BookRow({ y, width, row }: { y: number; width: number; row: number }) {
  const books = useMemo(() => {
    const out: {
      x: number;
      w: number;
      h: number;
      d: number;
      color: string;
      tilt: number;
    }[] = [];
    let x = -width / 2 + 0.02;
    let i = 0;

    while (x < width / 2 - 0.06) {
      const seed = row * 31 + i;
      const w = 0.016 + rnd(seed) * 0.028;
      const h = 0.17 + rnd(seed + 0.5) * 0.09;
      const d = 0.14 + rnd(seed + 1.5) * 0.05;
      // every so often a book leans, and occasionally there's a gap
      const tilt = rnd(seed + 2.5) > 0.88 ? 0.18 : 0;
      const gap = rnd(seed + 3.5) > 0.9 ? 0.035 : 0.002;

      out.push({
        x: x + w / 2,
        w,
        h,
        d,
        color: SPINE_COLORS[Math.floor(rnd(seed + 4.5) * SPINE_COLORS.length)],
        tilt,
      });
      x += w + gap;
      i++;
    }
    return out;
  }, [width, row]);

  return (
    <group position={[0, y, 0]}>
      {books.map((b, i) => (
        <group key={i} position={[b.x, 0, 0.01]} rotation={[0, 0, b.tilt]}>
          <RoundedBox
            args={[b.w, b.h, b.d]}
            radius={0.0018}
            smoothness={2}
            position={[0, b.h / 2, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={b.color} roughness={0.82} />
          </RoundedBox>
          {/* a pale band on the spine reads as a title from across the room */}
          <mesh position={[0, b.h * 0.66, b.d / 2 + 0.0006]}>
            <planeGeometry args={[b.w * 0.62, b.h * 0.1]} />
            <meshStandardMaterial color="#efe9dd" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** The pinboard above the desk: About, and what you're up to right now. */
export function Corkboard() {
  const { pos } = layout.board;

  const notes = useMemo(
    () => [
      { x: -0.22, y: 0.11, r: -0.06, c: "#f3dd7a", w: 0.13, h: 0.13 },
      { x: -0.03, y: 0.14, r: 0.05, c: "#f0a9b4", w: 0.12, h: 0.12 },
      { x: 0.17, y: 0.1, r: -0.03, c: "#a9d3f0", w: 0.13, h: 0.12 },
      { x: -0.16, y: -0.11, r: 0.04, c: "#c8e6b8", w: 0.14, h: 0.12 },
      { x: 0.06, y: -0.13, r: -0.07, c: "#f3dd7a", w: 0.12, h: 0.13 },
    ],
    [],
  );

  return (
    <Hotspot id="board" labelAt={[pos[0], pos[1] + 0.36, pos[2]]}>
      <group position={[pos[0], pos[1], pos[2]]}>
        {/* frame */}
        <RoundedBox args={[0.78, 0.56, 0.022]} radius={0.008} smoothness={3} castShadow>
          <meshStandardMaterial color={palette.deskEdge} roughness={0.6} />
        </RoundedBox>
        {/* cork */}
        <mesh position={[0, 0, 0.013]}>
          <planeGeometry args={[0.72, 0.5]} />
          <meshStandardMaterial color="#c9a273" roughness={0.95} />
        </mesh>

        {notes.map((n, i) => (
          <group key={i} position={[n.x, n.y, 0.016]} rotation={[0, 0, n.r]}>
            <mesh castShadow>
              <planeGeometry args={[n.w, n.h]} />
              <meshStandardMaterial color={n.c} roughness={0.92} />
            </mesh>
            {/* pin */}
            <mesh position={[0, n.h / 2 - 0.014, 0.004]}>
              <sphereGeometry args={[0.006, 12, 10]} />
              <meshPhysicalMaterial color="#cf4a3c" roughness={0.25} clearcoat={1} />
            </mesh>
          </group>
        ))}
      </group>
    </Hotspot>
  );
}
