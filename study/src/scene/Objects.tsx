import { useEffect, useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Hotspot } from "../interaction/Hotspot";
import { tactileFeedback } from "../interaction/tactile";
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

/**
 * A physical lamp rather than a binary UI switch:
 * - tap its body to restore/cut power;
 * - press and drag the knurled dial sideways to set a continuous output.
 */
function DeskLamp() {
  const { lampIntensity, toggleLamp } = useStudy();
  const { pos, rotY } = layout.lamp;
  const armLen = 0.4;
  const headY = 0.44;
  const spotTarget = useMemo(() => new THREE.Object3D(), []);
  const spotLight = useRef<THREE.SpotLight>(null);
  const spillLight = useRef<THREE.PointLight>(null);
  const shadeMaterial = useRef<THREE.MeshPhysicalMaterial>(null);
  const bulbMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const haloMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const halo = useRef<THREE.Mesh>(null);
  const filamentLevel = useRef(0);
  const shadeLevel = useRef(0);
  const poolLevel = useRef(0);
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useFrame((_state, delta) => {
    const approach = (current: number, target: number, rate: number) =>
      reducedMotion ? target : THREE.MathUtils.damp(current, target, rate, delta);

    // The filament wakes first, the shade follows, and the pool reaches the
    // desk last. That stagger is small enough to feel physical, not theatrical.
    filamentLevel.current = approach(
      filamentLevel.current,
      lampIntensity,
      lampIntensity > filamentLevel.current ? 13 : 9,
    );
    shadeLevel.current = approach(
      shadeLevel.current,
      lampIntensity,
      lampIntensity > shadeLevel.current ? 7 : 5,
    );
    poolLevel.current = approach(
      poolLevel.current,
      lampIntensity,
      lampIntensity > poolLevel.current ? 3.1 : 4.6,
    );

    const filament = filamentLevel.current;
    const shade = shadeLevel.current;
    const pool = poolLevel.current;

    if (spotLight.current) {
      spotLight.current.intensity = 7.8 * pool ** 1.72;
    }
    if (spillLight.current) {
      spillLight.current.intensity = 0.62 * shade ** 1.18;
    }
    if (shadeMaterial.current) {
      shadeMaterial.current.emissiveIntensity = 0.03 + shade * 0.48;
    }
    if (bulbMaterial.current) {
      // Above-one emissive values are intentionally left tone-unmapped so
      // the existing selective Bloom pass can catch this material only.
      const glow = 0.08 + filament * 3.1;
      bulbMaterial.current.color.setRGB(glow, glow * 0.78, glow * 0.52);
      bulbMaterial.current.opacity = 0.02 + filament * 0.94;
    }
    if (haloMaterial.current) {
      haloMaterial.current.opacity = filament ** 1.7 * 0.18;
    }
    if (halo.current) {
      halo.current.scale.setScalar(1 + filament * 0.72);
    }
  });

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

        <LampDimmer />

        <mesh position={[0, armLen / 2 + 0.02, -0.03]} rotation={[0.14, 0, 0]} castShadow>
          <cylinderGeometry args={[0.0075, 0.0075, armLen, 16]} />
          <meshStandardMaterial color={palette.aluminumDark} metalness={0.9} roughness={0.3} />
        </mesh>

        {/* dome shade */}
        <group position={[0, headY, 0.03]} rotation={[0.62, 0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.075, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial
              ref={shadeMaterial}
              color={palette.ceramic}
              emissive="#f2b86e"
              emissiveIntensity={0.03}
              metalness={0.15}
              roughness={0.4}
              clearcoat={0.7}
              side={2}
            />
          </mesh>

          {/* The hot bulb and its tiny optical halo feed the selective Bloom pass. */}
          <mesh position={[0, -0.004, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.062, 28]} />
            <meshBasicMaterial
              ref={bulbMaterial}
              color="#211108"
              transparent
              opacity={0.02}
              toneMapped={false}
            />
          </mesh>
          <mesh ref={halo} position={[0, -0.004, 0.0008]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.084, 32]} />
            <meshBasicMaterial
              ref={haloMaterial}
              color="#ffb765"
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/*
          Kept mounted at zero intensity. This gives a real fade-out rather
          than deleting the light on the first frame after an off action.
        */}
        <primitive object={spotTarget} position={[0.16, -0.62, 0.42]} />
        <spotLight
          ref={spotLight}
          position={[0, headY - 0.06, 0.06]}
          target={spotTarget}
          angle={0.72}
          penumbra={0.85}
          intensity={0}
          distance={2.6}
          decay={1.6}
          color="#ffd9a0"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0008}
        />
        <pointLight
          ref={spillLight}
          position={[0, headY - 0.02, 0.04]}
          intensity={0}
          distance={0.9}
          decay={2}
          color="#ffcf90"
        />
      </group>
    </Hotspot>
  );
}

type DialGesture = {
  startX: number;
  startLevel: number;
  lastDetent: number;
  moved: boolean;
};

/**
 * The dial is deliberately mounted on top of the lamp base, not exposed as a
 * separate settings panel. A short drag has eight tactile detents; a simple
 * press toggles the lamp. A small DOM range in the HUD is retained for touch
 * precision and keyboard users.
 */
function LampDimmer() {
  const { lampIntensity, setLampIntensity, toggleLamp, focus } = useStudy();
  const dial = useRef<THREE.Group>(null);
  const gesture = useRef<DialGesture | null>(null);
  const press = useRef(0);

  useFrame((_state, delta) => {
    if (!dial.current) return;

    const targetAngle = -0.78 + lampIntensity * 1.56;
    dial.current.rotation.y = THREE.MathUtils.damp(
      dial.current.rotation.y,
      targetAngle,
      18,
      delta,
    );

    press.current = THREE.MathUtils.damp(press.current, 0, 24, delta);
    dial.current.position.y = 0.007 - press.current * 0.003;
    dial.current.scale.y = 1 - press.current * 0.14;
  });

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const active = gesture.current;
      if (!active) return;

      const travel = Math.min(220, Math.max(120, window.innerWidth * 0.25));
      const distance = event.clientX - active.startX;
      const nextLevel = Math.min(1, Math.max(0, active.startLevel + distance / travel));

      if (Math.abs(distance) > 4) active.moved = true;
      setLampIntensity(nextLevel);

      const detent = Math.round(nextLevel * 8);
      if (detent !== active.lastDetent) {
        tactileFeedback("tick");
        active.lastDetent = detent;
      }
    };

    const release = () => {
      const active = gesture.current;
      if (!active) return;

      gesture.current = null;
      if (!active.moved) toggleLamp();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [setLampIntensity, toggleLamp]);

  return (
    <group
      position={[0.036, 0.022, 0.026]}
      onPointerDown={(event) => {
        event.stopPropagation();
        focus("lamp");
        gesture.current = {
          startX: event.clientX,
          startLevel: lampIntensity,
          lastDetent: Math.round(lampIntensity * 8),
          moved: false,
        };
        press.current = 1;
        tactileFeedback("press");
      }}
      onClick={(event) => event.stopPropagation()}
    >
      {/* Brass ring keeps the control readable against the aluminium base. */}
      <mesh position={[0, 0.003, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.006, 32]} />
        <meshStandardMaterial color="#4c3a23" metalness={0.9} roughness={0.28} />
      </mesh>

      <group ref={dial} position={[0, 0.007, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.029, 0.032, 0.012, 32]} />
          <meshPhysicalMaterial
            color={palette.brass}
            metalness={0.88}
            roughness={0.24}
            clearcoat={0.48}
          />
        </mesh>
        {/* A radial slot makes the current setting legible without copy. */}
        <mesh position={[0, 0.007, -0.016]} castShadow>
          <boxGeometry args={[0.003, 0.0015, 0.012]} />
          <meshStandardMaterial color="#1b1712" roughness={0.48} />
        </mesh>
        <mesh position={[0, 0.0072, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.024, 0.0012, 8, 28]} />
          <meshStandardMaterial color="#f6d18d" metalness={0.85} roughness={0.3} />
        </mesh>
      </group>
    </group>
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
/** push the centre out until both ends bite 2mm into the wall */
const HANDLE_X = mugWallAt(HANDLE_Y) - HANDLE_END_X - 0.002;

function Mug() {
  const { pos } = layout.mug;
  return (
    <group position={[pos[0], pos[1], pos[2]]}>
      <mesh position={[0, MUG_H / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[MUG_R_TOP, MUG_R_BOTTOM, MUG_H, 40, 1, true]}
        />
        <meshPhysicalMaterial
          color={palette.ceramic}
          roughness={0.28}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          side={2}
        />
      </mesh>

      {/* rim, so the lip has thickness instead of a zero-width edge */}
      <mesh position={[0, MUG_H, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[MUG_R_TOP, 0.0016, 8, 40]} />
        <meshPhysicalMaterial color={palette.ceramic} roughness={0.26} clearcoat={0.9} />
      </mesh>

      <mesh position={[0, 0.006, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[MUG_R_BOTTOM, MUG_R_BOTTOM, 0.012, 40]} />
        <meshPhysicalMaterial color={palette.ceramic} roughness={0.3} clearcoat={0.9} />
      </mesh>

      {/* coffee */}
      <mesh position={[0, 0.082, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[mugWallAt(0.082) - 0.001, 40]} />
        <meshPhysicalMaterial color="#3b2317" roughness={0.15} clearcoat={1} />
      </mesh>

      <mesh
        position={[HANDLE_X, HANDLE_Y, 0]}
        rotation={[0, 0, HANDLE_ROT]}
        castShadow
      >
        <torusGeometry args={[HANDLE_R, HANDLE_TUBE, 14, 32, HANDLE_ARC]} />
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
