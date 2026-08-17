import { useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Hotspot } from "../interaction/Hotspot";
import { layout } from "./layout";
import { palette } from "./theme";

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
          color={palette.deskTop}
          roughness={0.5}
          clearcoat={0.25}
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
        <meshPhysicalMaterial color="#c2a894" roughness={0.92} sheen={0.6} />
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
            color={palette.deskTop}
            roughness={0.5}
            clearcoat={0.25}
          />
        </RoundedBox>
      </group>
    </group>
  );
}

/**
 * Domi, assembled from spheres and cones to match the room's language.
 * Proportions are deliberately kitten-ish — big head, small body — because a
 * correctly proportioned cat built from primitives reads as a sack of balls.
 */
function Domi() {
  const ref = useRef<Group>(null);

  // slow breathing, so she is not a statue
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.006);
  });

  // sweeps from behind her round the right side and comes to rest in front,
  // lying on the cushion rather than floating
  const tail = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const t = i / 10;
        const a = Math.PI - t * 2.65;
        const radius = 0.088 + t * 0.032;
        return {
          pos: [
            Math.sin(a) * radius,
            0.021 + Math.sin(t * Math.PI) * 0.008,
            Math.cos(a) * radius * 0.95,
          ] as [number, number, number],
          r: 0.02 - t * 0.005,
          dark: t > 0.72,
        };
      }),
    [],
  );

  const stripes = useMemo(
    () => [
      // back
      { pos: [0, 0.2, -0.055], s: [0.05, 0.014, 0.026] },
      { pos: [0, 0.155, -0.07], s: [0.058, 0.014, 0.026] },
      { pos: [0, 0.108, -0.072], s: [0.055, 0.013, 0.024] },
      // forehead — the marking that reads first at a distance
      { pos: [0, 0.325, 0.014], s: [0.026, 0.012, 0.022] },
      { pos: [-0.03, 0.318, 0.026], s: [0.014, 0.01, 0.018] },
      { pos: [0.03, 0.318, 0.026], s: [0.014, 0.01, 0.018] },
    ],
    [],
  );

  return (
    <Hotspot id="domi" labelAt={[0, SEAT_Y + 0.52, 0]}>
      {/* turned out of the chair so her face catches the default camera */}
      <group ref={ref} position={[0, SEAT_Y + 0.09, 0.01]} rotation={[0, 0.95, 0]}>
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

        {/* head — deliberately oversized, kitten proportions */}
        <mesh position={[0, 0.285, 0.022]} scale={[1.06, 0.94, 0.96]} castShadow>
          <sphereGeometry args={[0.072, 32, 24]} />
          <meshStandardMaterial color={fur.coat} roughness={0.88} />
        </mesh>

        {/* cheeks */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.052, 0.268, 0.038]}
            scale={[0.8, 0.85, 0.8]}
          >
            <sphereGeometry args={[0.032, 18, 14]} />
            <meshStandardMaterial color={fur.coat} roughness={0.9} />
          </mesh>
        ))}

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

        {/* ears — big, and clearly clear of the skull */}
        {[-1, 1].map((side) => (
          <group
            key={side}
            position={[side * 0.05, 0.345, 0.012]}
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
        <mesh position={[0, 0.258, 0.076]} scale={[1.35, 0.78, 0.85]}>
          <sphereGeometry args={[0.031, 20, 16]} />
          <meshStandardMaterial color={fur.coat} roughness={0.86} />
        </mesh>
        <mesh position={[0, 0.268, 0.099]}>
          <sphereGeometry args={[0.0095, 14, 12]} />
          <meshStandardMaterial color={fur.nose} roughness={0.55} />
        </mesh>

        {/* eyes — the green is the most recognisably Domi thing about her */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.031, 0.296, 0.062]}>
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
        {tail.map((seg, i) => (
          <mesh key={i} position={seg.pos} castShadow>
            <sphereGeometry args={[seg.r, 14, 12]} />
            <meshStandardMaterial
              color={seg.dark ? fur.tailTip : fur.coat}
              roughness={0.88}
            />
          </mesh>
        ))}
      </group>
    </Hotspot>
  );
}
