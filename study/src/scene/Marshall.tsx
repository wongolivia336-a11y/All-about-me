import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { Hotspot } from "../interaction/Hotspot";
import { useStudy } from "../interaction/studyStore";
import { layout } from "./layout";
import { makeGrilleTexture } from "./theme";

const W = 0.22;
const H = 0.145;
const D = 0.13;

/**
 * A Marshall-shaped desk speaker: leather-wrapped box, gold control plate,
 * woven grille. The wordmark is deliberately absent — the silhouette carries
 * the reference without reproducing someone's trademark.
 */
export function Marshall() {
  const grille = useMemo(makeGrilleTexture, []);
  const { pos, rotY } = layout.marshall;
  const { musicPlaying } = useStudy();

  const knobs = [-0.062, 0, 0.062];

  return (
    <Hotspot id="marshall" labelAt={[pos[0], pos[1] + 0.26, pos[2]]}>
      <group position={[pos[0], pos[1], pos[2]]} rotation={[0, rotY, 0]}>
        {/* cabinet */}
        <RoundedBox
          args={[W, H, D]}
          radius={0.007}
          smoothness={4}
          position={[0, H / 2, 0]}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            color="#1b1918"
            roughness={0.82}
            clearcoat={0.15}
            clearcoatRoughness={0.6}
          />
        </RoundedBox>

        {/* fret cloth */}
        <mesh position={[0, H * 0.42, D / 2 + 0.0012]}>
          <planeGeometry args={[W - 0.028, H * 0.62]} />
          <meshStandardMaterial map={grille} roughness={0.95} />
        </mesh>

        {/* gold control plate */}
        <mesh position={[0, H - 0.022, D / 2 + 0.002]}>
          <boxGeometry args={[W - 0.028, 0.026, 0.004]} />
          <meshPhysicalMaterial
            color="#c9a24a"
            metalness={0.95}
            roughness={0.22}
            clearcoat={0.7}
          />
        </mesh>

        {knobs.map((x) => (
          <mesh
            key={x}
            position={[x, H - 0.022, D / 2 + 0.009]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.0085, 0.0085, 0.009, 20]} />
            <meshPhysicalMaterial
              color="#2a2724"
              metalness={0.7}
              roughness={0.3}
              clearcoat={0.8}
            />
          </mesh>
        ))}

        {/* power lamp — the only thing that changes when it is playing */}
        <mesh position={[W / 2 - 0.02, H - 0.022, D / 2 + 0.007]}>
          <sphereGeometry args={[0.005, 12, 10]} />
          <meshBasicMaterial
            color={musicPlaying ? "#ff6a3d" : "#3a2a24"}
            toneMapped={false}
          />
        </mesh>

        {/* corner protectors */}
        {[
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ].map(([sx, sy], i) => (
          <mesh
            key={i}
            position={[sx * (W / 2 - 0.012), H / 2 + sy * (H / 2 - 0.012), D / 2 + 0.001]}
          >
            <boxGeometry args={[0.022, 0.022, 0.004]} />
            <meshPhysicalMaterial
              color="#8a8a90"
              metalness={0.9}
              roughness={0.34}
            />
          </mesh>
        ))}
      </group>
    </Hotspot>
  );
}
