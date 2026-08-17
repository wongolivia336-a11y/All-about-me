import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { phoneApps } from "../data/links";
import { Hotspot } from "../interaction/Hotspot";
import { useStudy } from "../interaction/studyStore";
import { DESK_TOP_Y, layout } from "./layout";
import { makeAppScreen, makeSiteScreen, palette } from "./theme";

/**
 * The two screens. These are the objects that will eventually host real DOM
 * via <Html transform> when focused; for now they carry a drawn texture, which
 * is cheap and keeps the overview readable.
 */
export function Devices() {
  return (
    <>
      <Laptop />
      <Phone />
    </>
  );
}

function Laptop() {
  const screen = useMemo(makeSiteScreen, []);
  const { focused } = useStudy();
  const lit = focused === "laptop";

  const baseH = 0.011;
  const baseY = DESK_TOP_Y + baseH / 2;
  const depth = 0.215;
  const { pos, rotY } = layout.laptop;

  return (
    <Hotspot id="laptop" labelAt={[pos[0], DESK_TOP_Y + 0.34, pos[2]]}>
      <group position={[pos[0], 0, pos[2]]} rotation={[0, rotY, 0]}>
        {/* base */}
        <RoundedBox
          args={[0.31, baseH, depth]}
          radius={0.004}
          smoothness={4}
          position={[0, baseY, 0]}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            color={palette.aluminum}
            metalness={0.95}
            roughness={0.3}
            clearcoat={0.4}
            clearcoatRoughness={0.25}
          />
        </RoundedBox>

        {/* keyboard well + trackpad, just enough to read as a keyboard */}
        <mesh position={[0, baseY + baseH / 2 + 0.0006, -0.035]} receiveShadow>
          <boxGeometry args={[0.245, 0.001, 0.095]} />
          <meshStandardMaterial color="#2b2b2f" roughness={0.75} />
        </mesh>
        <mesh position={[0, baseY + baseH / 2 + 0.0006, 0.06]}>
          <boxGeometry args={[0.105, 0.001, 0.07]} />
          <meshStandardMaterial
            color={palette.aluminumDark}
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>

        {/* lid, hinged at the back edge */}
        <group
          position={[0, baseY + baseH / 2, -depth / 2]}
          rotation={[-0.19, 0, 0]}
        >
          <RoundedBox
            args={[0.31, 0.212, 0.006]}
            radius={0.004}
            smoothness={4}
            position={[0, 0.106, 0]}
            castShadow
          >
            <meshPhysicalMaterial
              color={palette.aluminum}
              metalness={0.95}
              roughness={0.3}
              clearcoat={0.4}
            />
          </RoundedBox>

          {/* the display itself */}
          <mesh position={[0, 0.106, 0.0036]}>
            <planeGeometry args={[0.286, 0.188]} />
            <meshStandardMaterial
              map={screen}
              emissiveMap={screen}
              emissive="#ffffff"
              emissiveIntensity={lit ? 1.05 : 0.8}
              roughness={0.22}
              metalness={0}
            />
          </mesh>
        </group>
      </group>
    </Hotspot>
  );
}

function Phone() {
  const screen = useMemo(() => makeAppScreen(phoneApps), []);
  const { focused } = useStudy();
  const lit = focused === "phone";

  const h = 0.0085;
  const y = DESK_TOP_Y + h / 2;
  const { pos, rotY } = layout.phone;

  return (
    <Hotspot id="phone" labelAt={[pos[0], DESK_TOP_Y + 0.2, pos[2]]}>
      <group position={[pos[0], 0, pos[2]]} rotation={[0, rotY, 0]}>
        <RoundedBox
          args={[0.072, h, 0.148]}
          radius={0.0038}
          smoothness={4}
          position={[0, y, 0]}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            color={palette.spaceGray}
            metalness={0.9}
            roughness={0.28}
            clearcoat={0.6}
          />
        </RoundedBox>

        <mesh position={[0, y + h / 2 + 0.0007, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.066, 0.141]} />
          <meshStandardMaterial
            map={screen}
            emissiveMap={screen}
            emissive="#ffffff"
            emissiveIntensity={lit ? 1.0 : 0.72}
            roughness={0.18}
            metalness={0}
          />
        </mesh>
      </group>
    </Hotspot>
  );
}
