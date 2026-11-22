import { useEffect, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { Hotspot } from "../interaction/Hotspot";
import { useMusicState } from "../interaction/studyStore";
import { layout } from "./layout";
import { makeGrilleTexture } from "./theme";
import { useChiselModelNode } from "./chiselModelNodes";

/**
 * Detailed desk speaker built to the Chisel prop's proportions.
 * The cabinet, woven front, top controls and feet stay inside the existing
 * Music hotspot; playback state remains visible on the face.
 */
export function Marshall() {
  const grille = useMemo(makeGrilleTexture, []);
  const speaker = useChiselModelNode("PROP_music_speaker");
  const { pos, rotY } = layout.marshall;
  const { musicPlaying } = useMusicState();

  useEffect(() => () => grille.dispose(), [grille]);

  return (
    <Hotspot id="marshall" labelAt={[pos[0], pos[1] + 0.26, pos[2]]}>
      <group position={[pos[0], pos[1] + 0.061, pos[2]]} rotation={[0, rotY, 0]}>
        <primitive object={speaker} visible={false} dispose={null} />

        <RoundedBox args={[0.17, 0.12, 0.10]} radius={0.012} smoothness={4} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#303638"
            metalness={0.08}
            roughness={0.76}
            clearcoat={0.1}
            clearcoatRoughness={0.72}
          />
        </RoundedBox>

        {/* Recessed baffle and woven cloth create a real front-to-back edge. */}
        <RoundedBox
          args={[0.148, 0.085, 0.006]}
          radius={0.006}
          smoothness={3}
          position={[0, -0.008, 0.05]}
          castShadow
        >
          <meshPhysicalMaterial color="#222729" roughness={0.86} />
        </RoundedBox>
        <mesh position={[0, -0.008, 0.0535]}>
          <planeGeometry args={[0.136, 0.073]} />
          <meshStandardMaterial map={grille} roughness={0.96} />
        </mesh>

        {[[-0.067, 0.027], [0.067, 0.027], [-0.067, -0.043], [0.067, -0.043]].map(([x, y], index) => (
          <mesh key={index} position={[x, y, 0.0542]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.0017, 0.0017, 0.0012, 12]} />
            <meshStandardMaterial color="#a99370" metalness={0.5} roughness={0.38} />
          </mesh>
        ))}

        {/* Soft brass control plate with three individually ridged knobs. */}
        <RoundedBox
          args={[0.102, 0.005, 0.027]}
          radius={0.003}
          smoothness={3}
          position={[0, 0.062, -0.012]}
        >
          <meshPhysicalMaterial color="#98784b" metalness={0.65} roughness={0.36} />
        </RoundedBox>
        {[-0.026, 0, 0.026].map((x, index) => (
          <group key={x} position={[x, 0.065, -0.012]}>
            <mesh position={[0, 0.002, 0]}>
              <cylinderGeometry args={[0.008, 0.0085, 0.004, 24]} />
              <meshPhysicalMaterial
                color={index === 1 ? "#d0b477" : "#c0a16b"}
                metalness={0.62}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 0.0042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.0064, 0.0007, 6, 24]} />
              <meshStandardMaterial color="#efe0bd" metalness={0.55} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.0048, -0.002]} rotation={[0, 0, 0.18]}>
              <boxGeometry args={[0.0007, 0.0025, 0.0004]} />
              <meshBasicMaterial color="#464039" />
            </mesh>
          </group>
        ))}

        {/* Four recessed feet lift the cabinet just clear of the desk. */}
        {[[-0.062, -0.034], [0.062, -0.034], [-0.062, 0.034], [0.062, 0.034]].map(([x, z], index) => (
          <mesh key={index} position={[x, -0.058, z]}>
            <cylinderGeometry args={[0.008, 0.0075, 0.006, 16]} />
            <meshStandardMaterial color="#171a1b" roughness={0.92} />
          </mesh>
        ))}

        {/* The indicator stays tied to the existing music state. */}
        <mesh position={[0.062, 0.039, 0.0545]}>
          <sphereGeometry args={[0.0045, 16, 12]} />
          <meshBasicMaterial
            color={musicPlaying ? "#f07850" : "#8f6d4d"}
            toneMapped={false}
          />
        </mesh>
      </group>
    </Hotspot>
  );
}
