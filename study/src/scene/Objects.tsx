import { useEffect, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Hotspot } from "../interaction/Hotspot";
import { useLanguage, type Language } from "../i18n";
import { layout } from "./layout";
import { DeskLamp } from "./lamp/DeskLamp";
import { makeSpreadTexture, palette } from "./theme";
import { useLocalizedCanvasTexture } from "./useLocalizedCanvasTexture";
import { useChiselModelNode } from "./chiselModelNodes";

const makePortfolioSpread = (language: Language) => makeSpreadTexture(language);

export function DeskProps() {
  return (
    <>
      <DeskLamp />
      <PortfolioSpread />
      <Mug />
      <FilmCamera />
      <Polaroids />
      <Plant />
    </>
  );
}

/** The open portfolio — this is where the PDF lives. */
function PortfolioSpread() {
  const { language } = useLanguage();
  const spread = useLocalizedCanvasTexture(language, makePortfolioSpread);
  const { pos, rotY } = layout.portfolio;
  const paper = useChiselModelNode("PROP_portfolio_paper");

  return (
    <Hotspot id="portfolio" labelAt={[pos[0], pos[1] + 0.22, pos[2]]}>
      <group position={[pos[0], pos[1] + 0.01, pos[2]]} rotation={[0, rotY, 0]}>
        <primitive object={paper} dispose={null} />
        <mesh position={[0, 0.0082, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[0.418, 0.295]} />
          <meshStandardMaterial map={spread} roughness={0.96} metalness={0} />
        </mesh>
      </group>
    </Hotspot>
  );
}

// Body dimensions live here so the handle can be attached by arithmetic
// instead of by nudging magic numbers until it looks about right.
const MUG_H = 0.1;
const MUG_R_TOP = 0.041;
const MUG_R_BOTTOM = 0.035;
const mugWallAt = (y: number) =>
  MUG_R_BOTTOM + (y / MUG_H) * (MUG_R_TOP - MUG_R_BOTTOM);

const HANDLE_ARC = Math.PI * 1.2;
const HANDLE_R = 0.023;
const HANDLE_TUBE = 0.0062;
const HANDLE_Y = 0.056;

/**
 * A torus arc starts at +X and sweeps counter-clockwise, so a 216° arc left
 * unrotated is centred on 108° — pointing back through the cup. Rotating by
 * half the arc centres the bulge on +X, where a handle belongs.
 */
const HANDLE_ROT = -HANDLE_ARC / 2;
/** x of the arc's open ends, relative to the torus centre (negative) */
const HANDLE_END_X = HANDLE_R * Math.cos(HANDLE_ARC / 2);
const HANDLE_END_Y = HANDLE_R * Math.sin(HANDLE_ARC / 2);
/** push the centre out until both ends bite 2mm into the wall */
const HANDLE_X = mugWallAt(HANDLE_Y) - HANDLE_END_X - 0.002;

function Mug() {
  const { pos } = layout.mug;
  const mug = useChiselModelNode("PROP_mug");

  useEffect(() => {
    mug.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const sourceMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      const glazedMaterials = sourceMaterials.map((source) => {
        const material = new THREE.MeshPhysicalMaterial({
          color: palette.ceramic,
          metalness: 0,
          roughness: 0.32,
          clearcoat: 0.68,
          clearcoatRoughness: 0.2,
          side: THREE.DoubleSide,
        });
        source.dispose();
        return material;
      });
      object.material = Array.isArray(object.material)
        ? glazedMaterials
        : glazedMaterials[0];
    });
  }, [mug]);

  const stampY = 0.008;
  const stampPetals = [
    [-0.0022, 0.0022],
    [0.0022, 0.0022],
    [-0.0022, -0.0022],
    [0.0022, -0.0022],
  ] as const;

  return (
    <group position={[pos[0], pos[1] + MUG_H / 2, pos[2]]}>
      <primitive object={mug} dispose={null} />

      {/* A softly glazed rolled lip and a quieter inner edge give the opening depth. */}
      <mesh position={[0, MUG_H / 2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[MUG_R_TOP, 0.0017, 10, 48]} />
        <meshPhysicalMaterial
          color={palette.ceramic}
          roughness={0.24}
          clearcoat={0.92}
          clearcoatRoughness={0.16}
        />
      </mesh>
      <mesh position={[0, MUG_H / 2 - 0.0005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[MUG_R_TOP - 0.0037, 0.00085, 8, 48]} />
        <meshPhysicalMaterial color="#e5e1d7" roughness={0.3} clearcoat={0.72} />
      </mesh>

      {/* The liquid sits below the lip with a thin, warm meniscus at the edge. */}
      <mesh position={[0, 0.034, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[mugWallAt(0.084) - 0.004, 40]} />
        <meshPhysicalMaterial color="#3b2317" roughness={0.15} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.0342, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[mugWallAt(0.084) - 0.005, 0.0008, 6, 40]} />
        <meshPhysicalMaterial color="#69472f" roughness={0.26} clearcoat={0.5} />
      </mesh>

      <mesh
        position={[HANDLE_X, HANDLE_Y - MUG_H / 2, 0]}
        rotation={[0, 0, HANDLE_ROT]}
        castShadow
      >
        <torusGeometry args={[HANDLE_R, HANDLE_TUBE, 14, 32, HANDLE_ARC]} />
        <meshPhysicalMaterial color={palette.ceramic} roughness={0.28} clearcoat={0.9} />
      </mesh>

      {/* Small ceramic joins soften the handle where it meets the cup wall. */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[
            HANDLE_X + HANDLE_END_X,
            HANDLE_Y - MUG_H / 2 + side * HANDLE_END_Y,
            0,
          ]}
          castShadow
        >
          <sphereGeometry args={[HANDLE_TUBE * 0.98, 16, 12]} />
          <meshPhysicalMaterial
            color={palette.ceramic}
            roughness={0.28}
            clearcoat={0.9}
            clearcoatRoughness={0.18}
          />
        </mesh>
      ))}

      {/* A tiny four-leaf maker's mark ties the desk object back to FOUR HEARTS. */}
      {stampPetals.map(([x, y], index) => {
        const radius = mugWallAt(MUG_H / 2 + stampY + y);
        const z = Math.sqrt(Math.max(0, radius * radius - x * x)) + 0.0006;
        return (
          <mesh key={index} position={[x, stampY + y, z]}>
            <circleGeometry args={[0.00245, 16]} />
            <meshStandardMaterial color="#718477" roughness={0.72} />
          </mesh>
        );
      })}
      <mesh
        position={[0, stampY, mugWallAt(MUG_H / 2 + stampY) + 0.0007]}
      >
        <circleGeometry args={[0.00125, 12]} />
        <meshStandardMaterial color="#718477" roughness={0.72} />
      </mesh>
    </group>
  );
}

function FilmCamera() {
  const { pos, rotY } = layout.camera;
  const lensTicks = Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2;
    return {
      position: [Math.cos(angle) * 0.0245, 0.039 + Math.sin(angle) * 0.0245, 0.0595] as const,
      rotation: [0, 0, angle] as const,
    };
  });

  return (
    <Hotspot id="camera" labelAt={[pos[0], pos[1] + 0.2, pos[2]]}>
      <group position={[pos[0], pos[1], pos[2]]} rotation={[0, rotY, 0]}>
        <RoundedBox
          args={[0.125, 0.078, 0.048]}
          radius={0.009}
          smoothness={4}
          position={[0, 0.039, 0]}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            color="#343d40"
            metalness={0.16}
            roughness={0.62}
            clearcoat={0.16}
            clearcoatRoughness={0.58}
          />
        </RoundedBox>

        <RoundedBox
          args={[0.112, 0.008, 0.044]}
          radius={0.004}
          smoothness={3}
          position={[0, 0.076, -0.001]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#c2b9a6"
            metalness={0.48}
            roughness={0.36}
            clearcoat={0.22}
          />
        </RoundedBox>

        {/* A small leatherette grip gives the front face a softer material break. */}
        <RoundedBox
          args={[0.018, 0.038, 0.003]}
          radius={0.004}
          smoothness={3}
          position={[-0.048, 0.028, 0.025]}
        >
          <meshPhysicalMaterial color="#685646" roughness={0.9} />
        </RoundedBox>
        {Array.from({ length: 5 }, (_, index) => (
          <mesh key={index} position={[-0.048, 0.012 + index * 0.007, 0.027]}>
            <boxGeometry args={[0.014, 0.0007, 0.0005]} />
            <meshStandardMaterial color="#8b7762" roughness={0.9} />
          </mesh>
        ))}

        {/* Recessed rangefinder window. */}
        <RoundedBox
          args={[0.02, 0.014, 0.0035]}
          radius={0.003}
          smoothness={3}
          position={[-0.045, 0.061, 0.026]}
        >
          <meshPhysicalMaterial color="#1e2729" roughness={0.28} metalness={0.2} />
        </RoundedBox>
        <mesh position={[-0.045, 0.061, 0.028]}>
          <planeGeometry args={[0.014, 0.008]} />
          <meshPhysicalMaterial
            color="#718f91"
            metalness={0.3}
            roughness={0.18}
            clearcoat={0.8}
            transparent
            opacity={0.82}
          />
        </mesh>

        {/* Stepped metal lens barrel with a glass front and fine index marks. */}
        <mesh position={[0, 0.039, 0.04]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.027, 0.03, 0.032, 40]} />
          <meshPhysicalMaterial color="#242b2d" metalness={0.55} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0.039, 0.051]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.027, 0.009, 40]} />
          <meshPhysicalMaterial color="#a79b83" metalness={0.72} roughness={0.29} />
        </mesh>
        {[0.0295, 0.027, 0.021].map((radius, index) => (
          <mesh key={radius} position={[0, 0.039, 0.056 + index * 0.0005]}>
            <torusGeometry args={[radius, index === 2 ? 0.0008 : 0.0011, 6, 40]} />
            <meshStandardMaterial
              color={index === 1 ? "#c0a16b" : "#353d3f"}
              metalness={0.68}
              roughness={0.3}
            />
          </mesh>
        ))}
        {lensTicks.map((tick, index) => (
          <mesh key={index} position={tick.position} rotation={tick.rotation}>
            <boxGeometry args={[0.0032, 0.00065, 0.0005]} />
            <meshStandardMaterial color="#c6b58e" metalness={0.35} roughness={0.48} />
          </mesh>
        ))}
        <mesh position={[0, 0.039, 0.058]}>
          <circleGeometry args={[0.0185, 40]} />
          <meshPhysicalMaterial
            color="#2f4549"
            metalness={0.48}
            roughness={0.16}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>
        <mesh position={[-0.006, 0.047, 0.059]}>
          <circleGeometry args={[0.004, 20]} />
          <meshBasicMaterial color="#bdd9d8" transparent opacity={0.52} />
        </mesh>
        <mesh position={[0.006, 0.031, 0.059]}>
          <circleGeometry args={[0.0022, 16]} />
          <meshBasicMaterial color="#8db1b6" transparent opacity={0.34} />
        </mesh>

        {/* Hot shoe, exposure dial and shutter release. */}
        <RoundedBox
          args={[0.025, 0.005, 0.012]}
          radius={0.002}
          smoothness={3}
          position={[0, 0.083, -0.006]}
        >
          <meshStandardMaterial color="#454b4a" metalness={0.45} roughness={0.42} />
        </RoundedBox>
        <mesh position={[-0.037, 0.084, 0.002]}>
          <cylinderGeometry args={[0.008, 0.009, 0.008, 24]} />
          <meshPhysicalMaterial color="#303638" metalness={0.46} roughness={0.34} />
        </mesh>
        <mesh position={[-0.037, 0.0885, 0.002]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.0062, 0.0009, 6, 24]} />
          <meshStandardMaterial color="#c0a16b" metalness={0.68} roughness={0.28} />
        </mesh>
        <mesh position={[0.044, 0.083, 0.004]}>
          <cylinderGeometry args={[0.0048, 0.0055, 0.005, 20]} />
          <meshPhysicalMaterial color="#ab8150" metalness={0.62} roughness={0.28} />
        </mesh>
      </group>
    </Hotspot>
  );
}
/** A small scatter of prints — the photography section spills out of these. */
function Polaroids() {
  const { pos } = layout.polaroids;
  const cards = useMemo(
    () => [
      { x: -0.02, z: 0.01, r: 0.24, tint: "#b9c9d4" },
      { x: 0.03, z: -0.02, r: -0.42, tint: "#d8c3ae" },
      { x: 0.012, z: 0.035, r: 0.62, tint: "#c3cfba" },
    ],
    [],
  );

  return (
    <Hotspot id="camera" labelAt={[pos[0], pos[1] + 0.16, pos[2]]}>
      <group position={[pos[0], pos[1], pos[2]]}>
        {cards.map((c, i) => (
          <group
            key={i}
            position={[c.x, 0.0012 + i * 0.0016, c.z]}
            rotation={[0, c.r, 0]}
          >
            <mesh receiveShadow castShadow>
              <boxGeometry args={[0.088, 0.0012, 0.104]} />
              <meshStandardMaterial color="#fbf9f4" roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.0008, -0.008]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.072, 0.072]} />
              <meshStandardMaterial color={c.tint} roughness={0.6} />
            </mesh>
          </group>
        ))}
      </group>
    </Hotspot>
  );
}

function Plant() {
  const { pos } = layout.plant;
  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(-0.047, 0.042, -0.064, 0.16, 0, 0.32);
    shape.bezierCurveTo(0.064, 0.16, 0.047, 0.042, 0, 0);
    shape.closePath();
    const geometry = new THREE.ShapeGeometry(shape, 18);
    const vertices = geometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i);
      const y = vertices.getY(i);
      const alongLeaf = THREE.MathUtils.clamp(y / 0.32, 0, 1);
      const distanceFromMidrib = THREE.MathUtils.clamp(Math.abs(x) / 0.064, 0, 1);
      const cupping = (1 - distanceFromMidrib) * Math.sin(alongLeaf * Math.PI) * 0.014;
      vertices.setZ(i, cupping - alongLeaf * alongLeaf * 0.018);
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  const veinGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0.001),
      new THREE.Vector3(0, 0.095, 0.012),
      new THREE.Vector3(0, 0.2, 0.009),
      new THREE.Vector3(0, 0.32, -0.016),
    ]);
    return new THREE.TubeGeometry(curve, 18, 0.00135, 5, false);
  }, []);
  const leaves = useMemo(
    () =>
      Array.from({ length: 9 }, (_, index) => {
        const angle = (index / 9) * Math.PI * 2 + 0.22;
        const lean = 0.24 + (index % 3) * 0.09;
        return {
          position: [Math.cos(angle) * 0.035, 0.205 + (index % 3) * 0.045, Math.sin(angle) * 0.035] as const,
          rotation: [Math.sin(angle) * lean, angle, -Math.cos(angle) * lean] as const,
          scale: [0.86 + (index % 3) * 0.08, 0.84 + (index % 4) * 0.08, 1] as const,
          color: ["#688568", "#78946e", "#5e7d64"][index % 3],
        };
      }),
    [],
  );

  useEffect(() => () => {
    leafGeometry.dispose();
    veinGeometry.dispose();
  }, [leafGeometry, veinGeometry]);

  return (
    <group position={[pos[0], pos[1], pos[2]]}>
      <mesh position={[0, 0.085, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.075, 0.17, 40]} />
        <meshPhysicalMaterial color={palette.terracotta} roughness={0.68} clearcoat={0.1} />
      </mesh>
      <mesh position={[0, 0.172, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.092, 36]} />
        <meshStandardMaterial color="#3a2a1e" roughness={1} />
      </mesh>
      <mesh position={[0, 0.173, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.094, 0.0045, 8, 40]} />
        <meshPhysicalMaterial color={palette.terracotta} roughness={0.62} />
      </mesh>
      {leaves.map((leaf, index) => (
        <group key={index} position={leaf.position} rotation={leaf.rotation}>
          <mesh position={[0, -0.052, 0]} castShadow>
            <cylinderGeometry args={[0.0022, 0.0038, 0.11, 8]} />
            <meshStandardMaterial color="#667b58" roughness={0.82} />
          </mesh>
          <mesh geometry={leafGeometry} scale={leaf.scale} castShadow receiveShadow dispose={null}>
            <meshPhysicalMaterial
              color={leaf.color}
              roughness={0.78}
              sheen={0.16}
              sheenColor="#c1cba8"
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh geometry={veinGeometry} scale={leaf.scale} dispose={null}>
            <meshStandardMaterial color="#9aaa7d" roughness={0.76} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
