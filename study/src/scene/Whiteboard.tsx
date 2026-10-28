import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { Hotspot } from "../interaction/Hotspot";
import { requestArchive } from "../interaction/studyStore";
import { layout } from "./layout";
import { makeWhiteboard } from "./surfaces";

const W = 0.9;
const H = 0.62;

/**
 * The unfinished corner.
 *
 * Her profile opens with "I like building where things are still a little
 * unclear." That line is a slogan until somewhere in the room is visibly
 * unresolved — so this board carries a half-drawn flow, two tentative dashed
 * arrows, a question mark where the thinking stops, and the ghosting of
 * whatever got wiped off before.
 */
export function Whiteboard() {
  const board = useMemo(makeWhiteboard, []);
  const { pos } = layout.whiteboard;

  return (
    <Hotspot
      id="whiteboard"
      onSelect={() => requestArchive("research")}
      labelAt={[pos[0], pos[1] + 0.44, pos[2]]}
    >
      <group position={[pos[0], pos[1], pos[2]]}>
        {/* aluminium frame */}
        <RoundedBox
          args={[W + 0.03, H + 0.03, 0.022]}
          radius={0.006}
          smoothness={3}
          castShadow
        >
          <meshPhysicalMaterial
            color="#b8b8bd"
            metalness={0.9}
            roughness={0.34}
            clearcoat={0.4}
          />
        </RoundedBox>

        {/* the writing surface — glossy, so it catches the window */}
        <mesh position={[0, 0, 0.013]}>
          <planeGeometry args={[W, H]} />
          <meshPhysicalMaterial
            map={board}
            roughness={0.12}
            clearcoat={0.9}
            clearcoatRoughness={0.08}
          />
        </mesh>

        {/* pen tray */}
        <mesh position={[0, -H / 2 - 0.026, 0.026]} castShadow>
          <boxGeometry args={[0.26, 0.014, 0.036]} />
          <meshPhysicalMaterial color="#a8a8ae" metalness={0.85} roughness={0.36} />
        </mesh>
        {[-0.06, 0.01].map((x, i) => (
          <mesh
            key={x}
            position={[x, -H / 2 - 0.014, 0.032]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.007, 0.007, 0.085, 10]} />
            <meshStandardMaterial
              color={i === 0 ? "#2f3a49" : "#b8443c"}
              roughness={0.5}
            />
          </mesh>
        ))}
      </group>
    </Hotspot>
  );
}
