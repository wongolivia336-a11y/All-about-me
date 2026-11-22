import { Html, RoundedBox } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { Mesh, MeshStandardMaterial } from "three";
import { phoneApps } from "../data/links";
import { Hotspot } from "../interaction/Hotspot";
import { useFocusedRoom } from "../interaction/studyStore";
import { useLanguage, type Language } from "../i18n";
import { DESK_TOP_Y, layout } from "./layout";
import { makeAppScreen, makeSiteScreen } from "./theme";
import { useLocalizedCanvasTexture } from "./useLocalizedCanvasTexture";
import { LaptopDesktop } from "./LaptopDesktop";
import { useChiselModelNode } from "./chiselModelNodes";
import {
  makeChiselKeyboardTexture,
  makeMacintoshBadgeTexture,
} from "./chiselArtDirection";

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
  const badge = useMemo(makeMacintoshBadgeTexture, []);
  const { pos, rotY } = layout.laptop;
  const mac = useChiselModelNode("INTERACTIVE_Macintosh_KEEP_LaptopDesktop");

  useEffect(() => () => badge.dispose(), [badge]);

  useEffect(() => {
    const display = mac.getObjectByName("MAC_display_REPLACE_with_existing_React_Html");
    if (!(display instanceof Mesh)) return;
    const materials = Array.isArray(display.material) ? display.material : [display.material];
    const screenMaterials = materials.filter((material): material is MeshStandardMaterial => material instanceof MeshStandardMaterial);
    if (!screenMaterials.length) return;

    screenMaterials.forEach((material) => {
      material.map = screen;
      material.emissiveMap = screen;
      material.emissive.set("#ffffff");
      material.emissiveIntensity = 1;
      material.color.set("#ffffff");
      material.needsUpdate = true;
    });

    return () => {
      screenMaterials.forEach((material) => {
        material.map = null;
        material.emissiveMap = null;
        material.emissive.set("#000000");
        material.needsUpdate = true;
      });
    };
  }, [mac, screen]);

  const screenCenterY = 1.005;
  const screenCenterZ = 0.155;

  return (
    <Hotspot id="laptop" labelAt={[pos[0], screenCenterY + 0.21, pos[2]]}>
      <group position={[pos[0], 0, pos[2]]} rotation={[0, rotY, 0]}>
        <primitive object={mac} dispose={null} />
        <mesh position={[-0.126, 0.797, 0.1312]}>
          <planeGeometry args={[0.025, 0.027]} />
          <meshBasicMaterial map={badge} transparent toneMapped={false} depthWrite={false} />
        </mesh>
        <MacintoshAccessories origin={pos} parentRotation={rotY} />
        {focused === "laptop" && (
          <Html
            transform
            center
            position={[0, screenCenterY, screenCenterZ]}
            scale={0.0198}
            zIndexRange={[8, 2]}
          >
            <LaptopDesktop language={language} />
          </Html>
        )}
      </group>
    </Hotspot>
  );
}

function MacintoshAccessories({
  origin,
  parentRotation,
}: {
  origin: readonly [number, number, number];
  parentRotation: number;
}) {
  const keycaps = useMemo(makeChiselKeyboardTexture, []);
  const keyboard = layout.keyboard;
  const mouse = layout.mouse;
  const keyboardPosition = localDeskPosition(keyboard.pos, origin, parentRotation, 0.013);
  const mousePosition = localDeskPosition(mouse.pos, origin, parentRotation, 0.018);

  useEffect(() => () => keycaps.dispose(), [keycaps]);

  return (
    <group>
      <group
        position={keyboardPosition}
        rotation={[0, keyboard.rotY - parentRotation, 0]}
      >
        <RoundedBox
          args={[0.46, 0.026, 0.15]}
          radius={0.006}
          smoothness={3}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            color="#ebe9e1"
            roughness={0.62}
            clearcoat={0.12}
            clearcoatRoughness={0.58}
          />
        </RoundedBox>
        <mesh position={[0, 0.0134, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.438, 0.128]} />
          <meshBasicMaterial map={keycaps} transparent toneMapped={false} />
        </mesh>
      </group>
      <group
        position={mousePosition}
        rotation={[0, mouse.rotY - parentRotation, 0]}
      >
        <mesh scale={[0.032, 0.018, 0.047]} castShadow receiveShadow>
          <sphereGeometry args={[1, 24, 16]} />
          <meshPhysicalMaterial
            color="#f3f1e9"
            roughness={0.38}
            clearcoat={0.16}
            clearcoatRoughness={0.52}
          />
        </mesh>
        <mesh position={[0, 0.0176, -0.006]}>
          <boxGeometry args={[0.0015, 0.001, 0.018]} />
          <meshStandardMaterial color="#8e948e" roughness={0.56} />
        </mesh>
        <mesh position={[0, 0.0177, -0.012]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.002, 12]} />
          <meshStandardMaterial color="#747c77" roughness={0.46} />
        </mesh>
      </group>
    </group>
  );
}

function localDeskPosition(
  position: readonly [number, number, number],
  origin: readonly [number, number, number],
  parentRotation: number,
  lift: number,
): [number, number, number] {
  const dx = position[0] - origin[0];
  const dz = position[2] - origin[2];
  const cosine = Math.cos(parentRotation);
  const sine = Math.sin(parentRotation);
  return [
    cosine * dx - sine * dz,
    position[1] + lift,
    sine * dx + cosine * dz,
  ];
}

function Phone() {
  const { language } = useLanguage();
  const screen = useLocalizedCanvasTexture(language, makePhoneScreen);
  const { focused } = useFocusedRoom();
  const lit = focused === "phone";

  const { pos, rotY } = layout.phone;
  const phone = useChiselModelNode("PROP_phone");

  return (
    <Hotspot id="phone" labelAt={[pos[0], DESK_TOP_Y + 0.2, pos[2]]}>
      <group position={[pos[0], pos[1] + 0.004, pos[2]]} rotation={[0, rotY, 0]}>
        <primitive object={phone} dispose={null} />
        <mesh position={[0, 0.0045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
