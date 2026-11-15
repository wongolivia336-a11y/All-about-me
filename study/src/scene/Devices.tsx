import { Html, RoundedBox } from "@react-three/drei";
import { phoneApps } from "../data/links";
import { Hotspot } from "../interaction/Hotspot";
import { useFocusedRoom } from "../interaction/studyStore";
import { useLanguage, type Language } from "../i18n";
import { DESK_TOP_Y, layout } from "./layout";
import { makeAppScreen, makeSiteScreen, palette } from "./theme";
import { useLocalizedCanvasTexture } from "./useLocalizedCanvasTexture";
import { LaptopDesktop } from "./LaptopDesktop";

const makePhoneScreen = (language: Language) => makeAppScreen(phoneApps, language);

/**
 * The two screens. These are the objects that will eventually host real DOM
 * via <Html transform> when focused; for now they carry a drawn texture, which
 * is cheap and keeps the overview readable.
 */
export function Devices() {
  return (
    <>
      <Macintosh />
      <Phone />
    </>
  );
}

function Macintosh() {
  const { language } = useLanguage();
  const { focused } = useFocusedRoom();
  const screen = useLocalizedCanvasTexture(language, makeSiteScreen);
  const { pos, rotY } = layout.laptop;
  const bodyWidth = 0.34;
  const bodyHeight = 0.37;
  const bodyDepth = 0.255;
  const screenCenterY = DESK_TOP_Y + 0.255;
  const screenCenterZ = bodyDepth / 2 + 0.017;

  return (
    <Hotspot
      id="laptop"
      labelAt={[pos[0], DESK_TOP_Y + bodyHeight + 0.06, pos[2]]}
    >
      <group position={[pos[0], 0, pos[2]]} rotation={[0, rotY, 0]}>
        {/* A compact all-in-one Macintosh case, scaled to the room's metre units. */}
        <RoundedBox
          args={[bodyWidth, bodyHeight, bodyDepth]}
          radius={0.024}
          smoothness={5}
          position={[0, DESK_TOP_Y + bodyHeight / 2, 0]}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            color="#ddd6c4"
            metalness={0.04}
            roughness={0.7}
            clearcoat={0.12}
            clearcoatRoughness={0.68}
          />
        </RoundedBox>

        {/* The little molded carry handle gives the silhouette its classic outline. */}
        {[-1, 1].map((side) => (
          <RoundedBox key={side} args={[0.014, 0.026, 0.018]} radius={0.006} smoothness={3} position={[side * 0.047, DESK_TOP_Y + bodyHeight + 0.009, -0.018]} castShadow>
            <meshPhysicalMaterial color="#d7cfbc" roughness={0.7} />
          </RoundedBox>
        ))}
        <RoundedBox args={[0.108, 0.012, 0.018]} radius={0.006} smoothness={3} position={[0, DESK_TOP_Y + bodyHeight + 0.019, -0.018]} castShadow>
          <meshPhysicalMaterial color="#d7cfbc" roughness={0.7} />
        </RoundedBox>

        {/* Recessed CRT bezel and glass sit on the front of the rounded shell. */}
        <RoundedBox
          args={[0.302, 0.22, 0.014]}
          radius={0.012}
          smoothness={4}
          position={[0, screenCenterY, bodyDepth / 2 + 0.004]}
          castShadow
        >
          <meshPhysicalMaterial color="#aaa69a" roughness={0.74} clearcoat={0.08} />
        </RoundedBox>
        <RoundedBox
          args={[0.286, 0.196, 0.006]}
          radius={0.008}
          smoothness={4}
          position={[0, screenCenterY, bodyDepth / 2 + 0.013]}
        >
          <meshStandardMaterial color="#191b1d" roughness={0.3} metalness={0.08} />
        </RoundedBox>
        <mesh position={[0, screenCenterY, screenCenterZ]}>
          <planeGeometry args={[0.276, 0.178]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
        {focused === "laptop" && (
          <Html
            transform
            center
            position={[0, screenCenterY, screenCenterZ + 0.0015]}
            scale={0.0198}
            zIndexRange={[8, 2]}
          >
            <LaptopDesktop language={language} />
          </Html>
        )}

        {/* Original-style floppy slot, speaker cuts, and a small rainbow badge. */}
        <RoundedBox args={[0.11, 0.006, 0.003]} radius={0.002} smoothness={3} position={[0, DESK_TOP_Y + 0.073, bodyDepth / 2 + 0.002]}>
          <meshStandardMaterial color="#77746c" roughness={0.82} />
        </RoundedBox>
        <mesh position={[-0.094, DESK_TOP_Y + 0.038, bodyDepth / 2 + 0.002]}>
          <boxGeometry args={[0.018, 0.012, 0.002]} />
          <meshStandardMaterial color="#f1eee5" roughness={0.58} />
        </mesh>
        {"#4c9a62 #e0c84a #e68a3d #c94b4b #8066a6 #5183b5".split(" ").map((color, index) => (
          <mesh key={color} position={[-0.101 + index * 0.0032, DESK_TOP_Y + 0.038, bodyDepth / 2 + 0.0032]}>
            <boxGeometry args={[0.0028, 0.009, 0.001]} />
            <meshBasicMaterial color={color} />
          </mesh>
        ))}
        {Array.from({ length: 8 }, (_, index) => (
          <mesh key={index} position={[0.112 + (index % 4) * 0.006, DESK_TOP_Y + 0.052 + Math.floor(index / 4) * 0.009, bodyDepth / 2 + 0.002]}>
            <circleGeometry args={[0.0017, 8]} />
            <meshStandardMaterial color="#817d72" roughness={0.9} />
          </mesh>
        ))}

        {/* Ventilation slots on the right side make the one-piece case read in 3D. */}
        {Array.from({ length: 9 }, (_, index) => (
          <mesh key={index} position={[bodyWidth / 2 + 0.001, DESK_TOP_Y + 0.11 + index * 0.008, -0.066]}>
            <boxGeometry args={[0.002, 0.003, 0.026]} />
            <meshStandardMaterial color="#928d81" roughness={0.85} />
          </mesh>
        ))}
      </group>
    </Hotspot>
  );
}

function Phone() {
  const { language } = useLanguage();
  const screen = useLocalizedCanvasTexture(language, makePhoneScreen);
  const { focused } = useFocusedRoom();
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
