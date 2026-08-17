import { RoundedBox } from "@react-three/drei";
import { useStudy } from "../interaction/studyStore";
import { BACK_WALL_Z, DESK_TOP_Y, LEFT_WALL_X } from "./layout";
import { palette } from "./theme";

export function Shell() {
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={palette.floor} roughness={0.7} />
      </mesh>

      {/* back wall */}
      <mesh position={[0, 1.4, BACK_WALL_Z]} receiveShadow>
        <planeGeometry args={[9, 2.8]} />
        <meshStandardMaterial color={palette.wall} roughness={0.95} />
      </mesh>

      {/* left wall */}
      <mesh
        position={[LEFT_WALL_X, 1.4, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[9, 2.8]} />
        <meshStandardMaterial color={palette.wallShadow} roughness={0.95} />
      </mesh>

      <Window />
      <Rug />
      <Desk />
    </group>
  );
}

/**
 * There is no world outside, so the glass is simply a bright emissive panel.
 * It reads as daylight and gives the aluminium something cool to reflect.
 */
function Window() {
  const { lampOn } = useStudy();
  const x = LEFT_WALL_X + 0.02;
  return (
    <group position={[x, 1.35, 0.72]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[1.25, 1.4]} />
        <meshBasicMaterial color={lampOn ? "#232a3d" : "#eaf3ff"} toneMapped={false} />
      </mesh>
      {/* frame */}
      <group position={[0, 0, 0.012]}>
        {[
          { p: [0, 0.72, 0] as const, s: [1.33, 0.045, 0.05] as const },
          { p: [0, -0.72, 0] as const, s: [1.33, 0.045, 0.05] as const },
          { p: [-0.64, 0, 0] as const, s: [0.045, 1.44, 0.05] as const },
          { p: [0.64, 0, 0] as const, s: [0.045, 1.44, 0.05] as const },
          { p: [0, 0, 0] as const, s: [0.028, 1.4, 0.045] as const },
        ].map((bar, i) => (
          <mesh key={i} position={bar.p as unknown as [number, number, number]}>
            <boxGeometry args={bar.s as unknown as [number, number, number]} />
            <meshStandardMaterial color="#f4f1ea" roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Rug() {
  return (
    <RoundedBox
      args={[2.9, 0.014, 1.9]}
      radius={0.006}
      smoothness={2}
      position={[0.15, 0.007, -0.25]}
      receiveShadow
    >
      <meshStandardMaterial color={palette.rug} roughness={0.98} />
    </RoundedBox>
  );
}

function Desk() {
  const slabThickness = 0.04;
  const slabY = DESK_TOP_Y - slabThickness / 2;
  const legY = slabY - slabThickness / 2;
  const legs: [number, number][] = [
    [-0.78, -1.32],
    [0.78, -1.32],
    [-0.78, -0.78],
    [0.78, -0.78],
  ];

  return (
    <group>
      <RoundedBox
        args={[1.7, slabThickness, 0.72]}
        radius={0.012}
        smoothness={4}
        position={[0, slabY, -1.05]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={palette.deskTop}
          roughness={0.5}
          clearcoat={0.25}
          clearcoatRoughness={0.45}
        />
      </RoundedBox>

      {legs.map(([x, z], i) => (
        <mesh key={i} position={[x, legY / 2, z]} castShadow>
          <cylinderGeometry args={[0.021, 0.019, legY, 20]} />
          <meshStandardMaterial
            color={palette.deskLeg}
            metalness={0.85}
            roughness={0.35}
          />
        </mesh>
      ))}

      {/* a shallow drawer under the top — holds the CV */}
      <RoundedBox
        args={[0.62, 0.1, 0.6]}
        radius={0.01}
        smoothness={3}
        position={[-0.5, slabY - 0.09, -1.05]}
        castShadow
      >
        <meshPhysicalMaterial
          color={palette.deskEdge}
          roughness={0.55}
          clearcoat={0.2}
        />
      </RoundedBox>
      <mesh position={[-0.5, slabY - 0.09, -0.742]}>
        <boxGeometry args={[0.16, 0.012, 0.014]} />
        <meshStandardMaterial color={palette.brass} metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}
