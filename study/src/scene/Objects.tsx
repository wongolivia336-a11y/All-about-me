import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { Hotspot } from "../interaction/Hotspot";
import { useStudy } from "../interaction/studyStore";
import { layout } from "./layout";
import { makeSpreadTexture, palette } from "./theme";

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

/** Clicking the lamp toggles the room's mood instead of moving the camera. */
function DeskLamp() {
  const { lampOn, toggleLamp } = useStudy();
  const { pos, rotY } = layout.lamp;
  const armLen = 0.4;
  const headY = 0.44;

  return (
    <Hotspot id="lamp" onSelect={toggleLamp} labelAt={[pos[0], pos[1] + 0.6, pos[2]]}>
      <group position={[pos[0], pos[1], pos[2]]} rotation={[0, rotY, 0]}>
        <mesh position={[0, 0.011, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.085, 0.09, 0.022, 32]} />
          <meshPhysicalMaterial
            color={palette.aluminumDark}
            metalness={0.85}
            roughness={0.35}
            clearcoat={0.5}
          />
        </mesh>

        <mesh position={[0, armLen / 2 + 0.02, -0.03]} rotation={[0.14, 0, 0]} castShadow>
          <cylinderGeometry args={[0.0075, 0.0075, armLen, 16]} />
          <meshStandardMaterial color={palette.aluminumDark} metalness={0.9} roughness={0.3} />
        </mesh>

        {/* dome shade */}
        <group position={[0, headY, 0.03]} rotation={[0.62, 0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.075, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial
              color={lampOn ? "#f6efe2" : palette.ceramic}
              metalness={0.15}
              roughness={0.4}
              clearcoat={0.7}
              side={2}
            />
          </mesh>
          {/* the bulb face */}
          <mesh position={[0, -0.004, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.062, 28]} />
            <meshBasicMaterial
              color={lampOn ? "#ffe9c4" : "#3a3a3e"}
              toneMapped={false}
            />
          </mesh>
        </group>

        {lampOn && (
          <pointLight
            position={[0, headY - 0.08, 0.1]}
            intensity={1.6}
            distance={2.4}
            decay={2}
            color="#ffd9a0"
            castShadow
          />
        )}
      </group>
    </Hotspot>
  );
}

/** The open portfolio — this is where the PDF lives. */
function PortfolioSpread() {
  const spread = useMemo(makeSpreadTexture, []);
  const { pos, rotY } = layout.portfolio;

  return (
    <Hotspot id="portfolio" labelAt={[pos[0], pos[1] + 0.22, pos[2]]}>
      <group position={[pos[0], pos[1], pos[2]]} rotation={[0, rotY, 0]}>
        {/* the closed page block underneath, so it has thickness */}
        <RoundedBox
          args={[0.42, 0.014, 0.297]}
          radius={0.002}
          smoothness={2}
          position={[0, 0.007, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#efe9dc" roughness={0.9} />
        </RoundedBox>

        <mesh position={[0, 0.0146, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[0.418, 0.295]} />
          <meshStandardMaterial map={spread} roughness={0.88} />
        </mesh>
      </group>
    </Hotspot>
  );
}

function Mug() {
  const { pos } = layout.mug;
  return (
    <group position={[pos[0], pos[1], pos[2]]}>
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.041, 0.035, 0.1, 32, 1, true]} />
        <meshPhysicalMaterial
          color={palette.ceramic}
          roughness={0.28}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          side={2}
        />
      </mesh>
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.012, 32]} />
        <meshPhysicalMaterial color={palette.ceramic} roughness={0.3} clearcoat={0.9} />
      </mesh>
      {/* coffee */}
      <mesh position={[0, 0.082, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.038, 32]} />
        <meshPhysicalMaterial color="#3b2317" roughness={0.15} clearcoat={1} />
      </mesh>
      <mesh position={[0.048, 0.055, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.022, 0.006, 12, 28, Math.PI * 1.2]} />
        <meshPhysicalMaterial color={palette.ceramic} roughness={0.28} clearcoat={0.9} />
      </mesh>
    </group>
  );
}

function FilmCamera() {
  const { pos, rotY } = layout.camera;
  return (
    <Hotspot id="camera" labelAt={[pos[0], pos[1] + 0.2, pos[2]]}>
      <group position={[pos[0], pos[1], pos[2]]} rotation={[0, rotY, 0]}>
        <RoundedBox
          args={[0.125, 0.078, 0.048]}
          radius={0.008}
          smoothness={4}
          position={[0, 0.039, 0]}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            color="#2c2c30"
            roughness={0.55}
            clearcoat={0.3}
          />
        </RoundedBox>
        {/* silver top plate */}
        <RoundedBox
          args={[0.125, 0.018, 0.048]}
          radius={0.006}
          smoothness={4}
          position={[0, 0.087, 0]}
          castShadow
        >
          <meshPhysicalMaterial
            color={palette.aluminum}
            metalness={0.95}
            roughness={0.25}
            clearcoat={0.6}
          />
        </RoundedBox>
        {/* lens */}
        <mesh position={[0, 0.039, 0.042]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.026, 0.028, 0.04, 32]} />
          <meshPhysicalMaterial color="#1a1a1e" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.039, 0.062]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.021, 32]} />
          <meshPhysicalMaterial
            color="#0b1a24"
            metalness={1}
            roughness={0.05}
            clearcoat={1}
          />
        </mesh>
        {/* shutter button */}
        <mesh position={[0.042, 0.098, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.005, 16]} />
          <meshStandardMaterial color={palette.brass} metalness={0.9} roughness={0.25} />
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
  const leaves = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        const lean = 0.35 + (i % 3) * 0.12;
        return {
          pos: [Math.cos(a) * 0.09, 0.3 + (i % 4) * 0.055, Math.sin(a) * 0.09] as const,
          rot: [Math.cos(a) * lean, a, Math.sin(a) * lean] as const,
          scale: 0.85 + (i % 3) * 0.16,
        };
      }),
    [],
  );

  return (
    <group position={[pos[0], pos[1], pos[2]]}>
      <mesh position={[0, 0.085, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.075, 0.17, 32]} />
        <meshPhysicalMaterial
          color={palette.terracotta}
          roughness={0.6}
          clearcoat={0.2}
        />
      </mesh>
      <mesh position={[0, 0.172, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.096, 32]} />
        <meshStandardMaterial color="#3a2a1e" roughness={1} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh
          key={i}
          position={l.pos as unknown as [number, number, number]}
          rotation={l.rot as unknown as [number, number, number]}
          scale={[l.scale * 0.7, l.scale * 1.5, l.scale * 0.25]}
          castShadow
        >
          <sphereGeometry args={[0.08, 16, 12]} />
          <meshStandardMaterial color={palette.leaf} roughness={0.65} />
        </mesh>
      ))}
    </group>
  );
}
