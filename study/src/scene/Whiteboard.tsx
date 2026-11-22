import { useEffect, useMemo } from "react";
import { Hotspot } from "../interaction/Hotspot";
import { requestArchive } from "../interaction/studyStore";
import { layout } from "./layout";
import { useChiselModelNode } from "./chiselModelNodes";
import { makeChiselWhiteboardTexture } from "./chiselArtDirection";
const W = 0.8928;
const H = 0.624;
export function Whiteboard() {
  const drawing = useMemo(makeChiselWhiteboardTexture, []);
  const boardModel = useChiselModelNode("BOARD_research_whiteboard");
  const { pos } = layout.whiteboard;
  useEffect(() => () => drawing.dispose(), [drawing]);
  return (
    <Hotspot
      id="whiteboard"
      onSelect={() => requestArchive("research")}
      labelAt={[pos[0], pos[1] + 0.44, pos[2]]}
    >
      <group position={[pos[0], pos[1], pos[2]]}>
        <primitive object={boardModel} dispose={null} />
        <mesh position={[0, 0, 0.0215]}>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial map={drawing} roughness={0.96} metalness={0} />
        </mesh>
        <mesh position={[0, -H / 2 - 0.026, 0.026]} castShadow>
          <boxGeometry args={[0.26, 0.014, 0.036]} />
          <meshPhysicalMaterial color="#a8a8ae" metalness={0.85} roughness={0.36} />
        </mesh>
        {[-0.06, 0.01].map((x, index) => (
          <mesh
            key={x}
            position={[x, -H / 2 - 0.014, 0.032]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.007, 0.007, 0.085, 10]} />
            <meshStandardMaterial
              color={index === 0 ? "#2f3a49" : "#b8443c"}
              roughness={0.5}
            />
          </mesh>
        ))}
      </group>
    </Hotspot>
  );
}
