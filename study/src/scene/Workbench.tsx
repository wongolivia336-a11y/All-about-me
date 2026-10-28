import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { Hotspot } from "../interaction/Hotspot";
import { requestArchive } from "../interaction/studyStore";
import { layout } from "./layout";
import { makeCoffeeRing, makeSketchSpread } from "./surfaces";
import { palette } from "./theme";
import { makeFabric, makeWood } from "./textures";

/** The evidence that someone actually works here. */
export function Workbench() {
  return (
    <>
      <Sketchbook />
      <MaterialTray />
      <CoffeeRing />
    </>
  );
}

/** An open A5 spread — 296 x 210mm across the gutter — with a pencil on it. */
function Sketchbook() {
  const spread = useMemo(makeSketchSpread, []);
  const { pos, rotY } = layout.sketchbook;

  const W = 0.296;
  const D = 0.21;
  const BLOCK = 0.014;

  return (
    <Hotspot id="sketchbook" labelAt={[pos[0], pos[1] + 0.2, pos[2]]}>
      <group position={[pos[0], pos[1], pos[2]]} rotation={[0, rotY, 0]}>
        <RoundedBox
          args={[W, BLOCK, D]}
          radius={0.002}
          smoothness={2}
          position={[0, BLOCK / 2, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#efe9dc" roughness={0.92} />
        </RoundedBox>

        <mesh
          position={[0, BLOCK + 0.0006, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[W - 0.004, D - 0.004]} />
          <meshStandardMaterial map={spread} roughness={0.9} />
        </mesh>

        {/* pencil, resting across the right-hand page */}
        <group position={[0.07, BLOCK + 0.005, 0.05]} rotation={[0, -0.42, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.0042, 0.0042, 0.15, 6]} />
            <meshStandardMaterial color="#d9a441" roughness={0.55} />
          </mesh>
          <mesh position={[-0.082, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
            <coneGeometry args={[0.0042, 0.016, 6]} />
            <meshStandardMaterial color="#e8d2ac" roughness={0.7} />
          </mesh>
          <mesh position={[-0.0905, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.0016, 0.005, 6]} />
            <meshStandardMaterial color="#2e2b28" roughness={0.6} />
          </mesh>
          <mesh position={[0.078, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0044, 0.0044, 0.012, 8]} />
            <meshStandardMaterial color="#c96a6a" roughness={0.85} />
          </mesh>
        </group>
      </group>
    </Hotspot>
  );
}

/**
 * A tray of material chips.
 *
 * Industrial designers keep these; almost no online portfolio shows one. It
 * also happens to be the most honest demo of the room's material system —
 * six chips, one shared light rig, and the difference between them is entirely
 * metalness, roughness, clearcoat and transmission.
 */
function MaterialTray() {
  const { pos, rotY } = layout.tray;
  const oak = useMemo(() => makeWood("#c08a52", "#8a5c30", [1, 1]), []);
  const cloth = useMemo(() => makeFabric("#7d8b74", [2, 2]), []);

  const TRAY_W = 0.2;
  const TRAY_D = 0.1;
  const TRAY_H = 0.012;

  const CHIP_W = 0.055;
  const CHIP_D = 0.04;
  const GAP = 0.008;
  const cols = 3;
  const rows = 2;
  const x0 = -((cols * CHIP_W + (cols - 1) * GAP) / 2) + CHIP_W / 2;
  const z0 = -((rows * CHIP_D + (rows - 1) * GAP) / 2) + CHIP_D / 2;

  return (
    <Hotspot
      id="materials"
      onSelect={() => requestArchive("make")}
      labelAt={[pos[0], pos[1] + 0.16, pos[2]]}
    >
      <group position={[pos[0], pos[1], pos[2]]} rotation={[0, rotY, 0]}>
        {/* tray */}
        <RoundedBox
          args={[TRAY_W, TRAY_H, TRAY_D]}
          radius={0.004}
          smoothness={3}
          position={[0, TRAY_H / 2, 0]}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial color="#2f2c29" roughness={0.72} clearcoat={0.2} />
        </RoundedBox>

        {Array.from({ length: cols * rows }, (_, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          return (
            <mesh
              key={i}
              position={[
                x0 + col * (CHIP_W + GAP),
                TRAY_H + 0.0018,
                z0 + row * (CHIP_D + GAP),
              ]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[CHIP_W, 0.0036, CHIP_D]} />
              {i === 0 && (
                // brushed aluminium
                <meshPhysicalMaterial
                  color="#cfd1d4"
                  metalness={0.98}
                  roughness={0.34}
                />
              )}
              {i === 1 && (
                // oiled oak
                <meshPhysicalMaterial
                  map={oak.map}
                  bumpMap={oak.bumpMap}
                  bumpScale={0.12}
                  roughness={0.55}
                  clearcoat={0.2}
                />
              )}
              {i === 2 && (
                // matte injection-moulded plastic
                <meshPhysicalMaterial color="#c8503f" roughness={0.78} clearcoat={0.1} />
              )}
              {i === 3 && (
                // wool
                <meshPhysicalMaterial
                  map={cloth.map}
                  bumpMap={cloth.bumpMap}
                  bumpScale={0.2}
                  roughness={0.96}
                  sheen={0.8}
                  sheenColor="#cfe0c4"
                />
              )}
              {i === 4 && (
                // frosted glass
                <meshPhysicalMaterial
                  color="#dfeaf0"
                  transmission={0.92}
                  thickness={0.004}
                  roughness={0.28}
                  ior={1.5}
                  transparent
                />
              )}
              {i === 5 && (
                // glazed ceramic
                <meshPhysicalMaterial
                  color={palette.ceramic}
                  roughness={0.12}
                  clearcoat={1}
                  clearcoatRoughness={0.06}
                />
              )}
            </mesh>
          );
        })}
      </group>
    </Hotspot>
  );
}

/** A stain, not an object. Sits a fraction above the desk to avoid z-fighting. */
function CoffeeRing() {
  const ring = useMemo(makeCoffeeRing, []);
  const { pos } = layout.coffeeRing;

  return (
    <mesh
      position={[pos[0], pos[1] + 0.0007, pos[2]]}
      rotation={[-Math.PI / 2, 0, 0.7]}
    >
      <planeGeometry args={[0.092, 0.092]} />
      <meshStandardMaterial
        map={ring}
        transparent
        depthWrite={false}
        roughness={0.6}
      />
    </mesh>
  );
}
