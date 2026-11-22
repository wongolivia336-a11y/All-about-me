import { useEffect, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { MeshStandardMaterial } from "three";
import { Hotspot } from "../interaction/Hotspot";
import { layout } from "./layout";
import { makeWood } from "./textures";
import { eachChiselMaterial, useChiselModelNode } from "./chiselModelNodes";
import { makeChiselCorkTexture, makeChiselNoteTexture, type ChiselNoteStyle } from "./chiselArtDirection";
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
  const oak = useMemo(() => makeWood("#c9a375", "#966c3e", [2, 1]), []);
  const backPanel = useMemo(() => makeWood("#c2a07c", "#8e6b42", [3, 2]), []);
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
            <meshStandardMaterial
              map={oak.map}
              bumpMap={oak.bumpMap}
              bumpScale={0.2}
              roughness={0.58}
            />
          </mesh>
        ))}
        {/* back panel */}
        <mesh position={[0, H / 2, -D / 2 + 0.007]} receiveShadow>
          <boxGeometry args={[W + 0.03, H, 0.014]} />
          <meshStandardMaterial
            map={backPanel.map}
            bumpMap={backPanel.bumpMap}
            bumpScale={0.2}
            roughness={0.82}
          />
        </mesh>
        {/* shelves */}
        {shelfYs.map((y) => (
          <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[W, 0.028, D]} />
            <meshStandardMaterial
              map={oak.map}
              bumpMap={oak.bumpMap}
              bumpScale={0.2}
              roughness={0.58}
            />
          </mesh>
        ))}
        {shelfYs.slice(0, 4).map((y, row) => (
          <BookRow key={y} y={y + 0.014} width={W} row={row} />
        ))}
        <FaceDownBook y={shelfYs[4] + 0.014} />
      </group>
    </Hotspot>
  );
}
/**
 * A book left open and turned over on the top shelf. It is the one universally
 * legible sign that someone is halfway through something, and it costs three
 * boxes: two covers tented over a spine.
 */
function FaceDownBook({ y }: { y: number }) {
  return (
    <group position={[0.3, y, 0.01]} rotation={[0, 0.22, 0]}>
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * 0.052, 0.005, 0]}
          rotation={[0, 0, s * -0.13]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.105, 0.009, 0.15]} />
          <meshStandardMaterial color="#e9e1d1" roughness={0.92} />
        </mesh>
      ))}
      <mesh position={[0, 0.015, 0]} castShadow>
        <boxGeometry args={[0.018, 0.007, 0.152]} />
        <meshStandardMaterial color="#8a5a3c" roughness={0.7} />
      </mesh>
    </group>
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
  const board = useChiselModelNode("BOARD_about_cork");
  const cork = useMemo(makeChiselCorkTexture, []);
  const notesArtwork = useMemo(
    () => ({
      city: makeChiselNoteTexture("city"),
      botanical: makeChiselNoteTexture("botanical"),
      blueprint: makeChiselNoteTexture("blueprint"),
      coral: makeChiselNoteTexture("coral"),
    }),
    [],
  );
  const notes = useMemo(
    () => [
      { x: -0.235, y: 0.105, w: 0.205, h: 0.155, angle: -0.045, style: "city" as const },
      { x: 0.018, y: 0.105, w: 0.17, h: 0.205, angle: 0.035, style: "botanical" as const },
      { x: 0.235, y: 0.095, w: 0.205, h: 0.155, angle: -0.028, style: "blueprint" as const },
      { x: -0.12, y: -0.145, w: 0.19, h: 0.12, angle: 0.035, style: "coral" as const },
    ],
    [],
  );
  useEffect(() => {
    eachChiselMaterial(board, (material) => {
      if (!(material instanceof MeshStandardMaterial)) return;
      material.map = cork;
      material.color.set("#ffffff");
      material.metalness = 0;
      material.roughness = 0.98;
      material.needsUpdate = true;
    });
  }, [board, cork]);
  useEffect(
    () => () => {
      cork.dispose();
      Object.values(notesArtwork).forEach((texture) => texture.dispose());
    },
    [cork, notesArtwork],
  );
  return (
    <Hotspot id="board" labelAt={[pos[0], pos[1] + 0.36, pos[2]]}>
      <group position={[pos[0], pos[1], pos[2]]}>
        <primitive object={board} dispose={null} />
        <mesh position={[0, 0, 0.0215]}>
          <planeGeometry args={[0.7488, 0.5376]} />
          <meshStandardMaterial map={cork} roughness={0.98} metalness={0} />
        </mesh>
        {notes.map((note, index) => (
          <group
            key={index}
            position={[note.x, note.y, 0.023]}
            rotation={[0, 0, note.angle]}
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[note.w, note.h, 0.005]} />
              <meshStandardMaterial
                map={notesArtwork[note.style as ChiselNoteStyle]}
                roughness={0.96}
                metalness={0}
              />
            </mesh>
            <mesh position={[0.003, note.h * 0.38 - 0.004, 0.009]}>
              <circleGeometry args={[0.009, 16]} />
              <meshBasicMaterial color="#544639" />
            </mesh>
            <mesh position={[0, note.h * 0.38, 0.015]} castShadow>
              <sphereGeometry args={[0.0065, 16, 10]} />
              <meshStandardMaterial color="#9d7951" roughness={0.52} metalness={0.12} />
            </mesh>
          </group>
        ))}
      </group>
    </Hotspot>
  );
}
