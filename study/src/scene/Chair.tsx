import { useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Hotspot } from "../interaction/Hotspot";
import { currentVolume } from "../interaction/studyStore";
import { layout } from "./layout";
import { palette } from "./theme";
import { makeFabric, makeWood } from "./textures";

const SEAT_Y = 0.44;

const fur = {
  coat: "#f1efeb",
  stripe: "#b9b6b0",
  innerEar: "#eeb0b4",
  nose: "#e0949a",
  eye: "#86bf4f",
  pupil: "#26303a",
  tailTip: "#3a3a3c",
};

export function ReadingChair() {
  const { pos, rotY } = layout.chair;
  return (
    <group position={[pos[0], pos[1], pos[2]]} rotation={[0, rotY, 0]}>
      <Chair />
      <Domi />
    </group>
  );
}

function Chair() {
  const oak = useMemo(() => makeWood("#d8b489", "#a3784a", [1, 1]), []);
  const cloth = useMemo(() => makeFabric("#c2a894", [3, 3]), []);
  const legs: [number, number][] = [
    [-0.17, -0.17],
    [0.17, -0.17],
    [-0.17, 0.17],
    [0.17, 0.17],
  ];

  return (
    <group>
      {legs.map(([x, z], i) => (
        <mesh key={i} position={[x, SEAT_Y / 2, z]} castShadow>
          <cylinderGeometry args={[0.017, 0.014, SEAT_Y, 16]} />
          <meshStandardMaterial
            color={palette.deskLeg}
            metalness={0.8}
            roughness={0.35}
          />
        </mesh>
      ))}

      <RoundedBox
        args={[0.44, 0.045, 0.44]}
        radius={0.012}
        smoothness={4}
        position={[0, SEAT_Y + 0.022, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          map={oak.map}
          bumpMap={oak.bumpMap}
          bumpScale={0.2}
          roughness={0.44}
          clearcoat={0.3}
        />
      </RoundedBox>

      {/* cushion */}
      <RoundedBox
        args={[0.38, 0.05, 0.38]}
        radius={0.022}
        smoothness={4}
        position={[0, SEAT_Y + 0.068, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          map={cloth.map}
          bumpMap={cloth.bumpMap}
          bumpScale={0.3}
          roughness={0.94}
          sheen={0.7}
          sheenColor="#e6d3c2"
        />
      </RoundedBox>

      {/* back */}
      <group position={[0, 0, -0.2]}>
        {[-0.19, 0.19].map((x) => (
          <mesh key={x} position={[x, SEAT_Y + 0.26, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.52, 16]} />
            <meshStandardMaterial
              color={palette.deskLeg}
              metalness={0.8}
              roughness={0.35}
            />
          </mesh>
        ))}
        <RoundedBox
          args={[0.42, 0.17, 0.035]}
          radius={0.014}
          smoothness={4}
          position={[0, SEAT_Y + 0.44, 0]}
          castShadow
        >
          <meshPhysicalMaterial
            map={oak.map}
            bumpMap={oak.bumpMap}
            bumpScale={0.2}
            roughness={0.44}
            clearcoat={0.3}
          />
        </RoundedBox>
      </group>
    </group>
  );
}

/** Fires a meow if one has been dropped in. Silent, not broken, if not. */
function meow() {
  const el = new Audio("/audio/domi-meow.mp3");
  el.volume = currentVolume();
  el.play().catch(() => {
    /* no file yet — the startle still reads on its own */
  });
}

/**
 * Domi, assembled from spheres and cones to match the room's language.
 * Proportions are deliberately kitten-ish — big head, small body — because a
 * correctly proportioned cat built from primitives reads as a sack of balls.
 *
 * She is the one thing in the room that moves on its own: breathing, blinking,
 * looking around, tail going. A still cat reads as an ornament; an idling one
 * reads as an animal that happens to be sitting there.
 */
function Domi() {
  const root = useRef<Group>(null);
  const head = useRef<Group>(null);
  const tail = useRef<Group>(null);
  const eyes = useRef<Group>(null);

  // one mutable bag rather than state — none of this should trigger a re-render
  const beat = useRef({
    lookY: 0,
    lookX: 0,
    nextLook: 2.5,
    nextBlink: 3,
    blinkUntil: -1,
    startle: 0,
  });

  const poke = () => {
    beat.current.startle = 1;
    // look straight out at whoever just poked her
    beat.current.lookY = 0.55;
    beat.current.lookX = -0.08;
    beat.current.nextLook = 2.2;
    meow();
  };

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const b = beat.current;

    // breathing
    if (root.current) root.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.006);

    // pick somewhere new to look every few seconds
    b.nextLook -= dt;
    if (b.nextLook <= 0) {
      b.lookY = (Math.random() - 0.5) * 1.1;
      b.lookX = (Math.random() - 0.35) * 0.24;
      b.nextLook = 2.5 + Math.random() * 4;
    }

    if (head.current) {
      const ease = 1 - Math.pow(0.001, dt); // frame-rate independent damping
      head.current.rotation.y += (b.lookY - head.current.rotation.y) * ease;
      head.current.rotation.x += (b.lookX - head.current.rotation.x) * ease;
    }

    // blink
    b.nextBlink -= dt;
    if (b.nextBlink <= 0) {
      b.blinkUntil = t + 0.14;
      b.nextBlink = 3 + Math.random() * 5;
    }
    if (eyes.current) {
      const closed = t < b.blinkUntil;
      const target = closed ? 0.12 : 1;
      eyes.current.scale.y += (target - eyes.current.scale.y) * (closed ? 0.6 : 0.25);
    }

    // tail: a slow sway, snapping into a flick when startled
    b.startle = Math.max(0, b.startle - dt * 1.4);
    if (tail.current) {
      const idle = Math.sin(t * 0.9) * 0.13;
      const flick = Math.sin(t * 14) * 0.3 * b.startle;
      tail.current.rotation.y = idle + flick;
    }
  });

  const tailSegments = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const t = i / 8;
        const a = 0.2 + t * 2.4;
        return {
          pos: [
            Math.sin(a) * 0.075,
            t * 0.028,
            (1 - Math.cos(a)) * 0.075,
          ] as [number, number, number],
          r: 0.019 - t * 0.005,
          dark: t > 0.7,
        };
      }),
    [],
  );

  const stripes = useMemo(
    () => [
      { pos: [0, 0.2, -0.055], s: [0.05, 0.014, 0.026] },
      { pos: [0, 0.155, -0.07], s: [0.058, 0.014, 0.026] },
      { pos: [0, 0.108, -0.072], s: [0.055, 0.013, 0.024] },
    ],
    [],
  );

  return (
    <Hotspot id="domi" labelAt={[0, SEAT_Y + 0.52, 0]} onActivate={poke}>
      {/* turned out of the chair so her face catches the default camera */}
      <group ref={root} position={[0, SEAT_Y + 0.09, 0.01]} rotation={[0, 0.95, 0]}>
        {/*
          One continuous teardrop body rather than a stack of spheres. Two
          stacked balls plus a third for the head reads as a snowman; a sitting
          cat is a single tapering mass with the head sitting proud of it.
        */}
        <mesh position={[0, 0.125, -0.01]} scale={[0.9, 1.28, 0.86]} castShadow>
          <sphereGeometry args={[0.088, 32, 24]} />
          <meshStandardMaterial color={fur.coat} roughness={0.88} />
        </mesh>

        {/* chest ruff, fills the neck so the head does not float */}
        <mesh position={[0, 0.212, 0.038]} scale={[0.95, 0.8, 0.9]}>
          <sphereGeometry args={[0.06, 24, 18]} />
          <meshStandardMaterial color={fur.coat} roughness={0.9} />
        </mesh>

        {stripes.map((s, i) => (
          <mesh
            key={i}
            position={s.pos as [number, number, number]}
            scale={s.s as [number, number, number]}
          >
            <sphereGeometry args={[1, 14, 10]} />
            <meshStandardMaterial color={fur.stripe} roughness={0.9} />
          </mesh>
        ))}

        {/* everything from here up turns together when she looks around */}
        <group ref={head} position={[0, 0.285, 0.022]}>
          <mesh scale={[1.06, 0.94, 0.96]} castShadow>
            <sphereGeometry args={[0.072, 32, 24]} />
            <meshStandardMaterial color={fur.coat} roughness={0.88} />
          </mesh>

          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.052, -0.017, 0.016]}
              scale={[0.8, 0.85, 0.8]}
            >
              <sphereGeometry args={[0.032, 18, 14]} />
              <meshStandardMaterial color={fur.coat} roughness={0.9} />
            </mesh>
          ))}

          {/* forehead markings — what reads first at a distance */}
          <mesh position={[0, 0.04, -0.008]} scale={[0.026, 0.012, 0.022]}>
            <sphereGeometry args={[1, 14, 10]} />
            <meshStandardMaterial color={fur.stripe} roughness={0.9} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.03, 0.033, 0.004]}
              scale={[0.014, 0.01, 0.018]}
            >
              <sphereGeometry args={[1, 12, 10]} />
              <meshStandardMaterial color={fur.stripe} roughness={0.9} />
            </mesh>
          ))}

          {/* ears */}
          {[-1, 1].map((side) => (
            <group
              key={side}
              position={[side * 0.05, 0.06, -0.01]}
              rotation={[0.08, 0, side * 0.3]}
            >
              <mesh castShadow>
                <coneGeometry args={[0.036, 0.072, 18]} />
                <meshStandardMaterial color={fur.coat} roughness={0.88} />
              </mesh>
              <mesh position={[0, -0.006, 0.016]} scale={[0.6, 0.68, 0.6]}>
                <coneGeometry args={[0.036, 0.072, 18]} />
                <meshStandardMaterial color={fur.innerEar} roughness={0.85} />
              </mesh>
            </group>
          ))}

          {/* muzzle + nose */}
          <mesh position={[0, -0.027, 0.054]} scale={[1.35, 0.78, 0.85]}>
            <sphereGeometry args={[0.031, 20, 16]} />
            <meshStandardMaterial color={fur.coat} roughness={0.86} />
          </mesh>
          <mesh position={[0, -0.017, 0.077]}>
            <sphereGeometry args={[0.0095, 14, 12]} />
            <meshStandardMaterial color={fur.nose} roughness={0.55} />
          </mesh>

          {/* eyes — the green is the most recognisably Domi thing about her */}
          <group ref={eyes}>
            {[-1, 1].map((side) => (
              <group key={side} position={[side * 0.031, 0.011, 0.04]}>
                <mesh>
                  <sphereGeometry args={[0.021, 20, 16]} />
                  <meshStandardMaterial color={fur.eye} roughness={0.25} />
                </mesh>
                <mesh position={[0, 0, 0.014]} scale={[0.55, 1, 0.5]}>
                  <sphereGeometry args={[0.011, 16, 12]} />
                  <meshStandardMaterial color={fur.pupil} roughness={0.18} />
                </mesh>
                <mesh position={[0.006, 0.007, 0.018]}>
                  <sphereGeometry args={[0.004, 10, 8]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </group>
            ))}
          </group>
        </group>

        {/* front legs, tucked close together the way she actually sits */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.03, 0, 0.062]}>
            <mesh position={[0, 0.052, 0]} castShadow>
              <cylinderGeometry args={[0.017, 0.019, 0.104, 16]} />
              <meshStandardMaterial color={fur.coat} roughness={0.88} />
            </mesh>
            <mesh position={[0, 0.013, 0.014]} scale={[1, 0.75, 1.3]}>
              <sphereGeometry args={[0.021, 16, 14]} />
              <meshStandardMaterial color={fur.coat} roughness={0.88} />
            </mesh>
          </group>
        ))}

        {/* tail, curling round to the front with the dark tip she actually has */}
        <group ref={tail} position={[0.055, 0.028, -0.075]}>
          {tailSegments.map((seg, i) => (
            <mesh key={i} position={seg.pos} castShadow>
              <sphereGeometry args={[seg.r, 14, 12]} />
              <meshStandardMaterial
                color={seg.dark ? fur.tailTip : fur.coat}
                roughness={0.88}
              />
            </mesh>
          ))}
        </group>
      </group>
    </Hotspot>
  );
}
