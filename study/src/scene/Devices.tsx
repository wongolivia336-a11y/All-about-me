import { useLayoutEffect, useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { Object3D, type InstancedMesh } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { phoneApps } from "../data/links";
import { Hotspot } from "../interaction/Hotspot";
import { requestArchive, useFocusedRoom } from "../interaction/studyStore";
import { useLanguage, type Language } from "../i18n";
import { DESK_TOP_Y, layout } from "./layout";
import { makeAppScreen, makeSiteScreen, palette } from "./theme";
import { useLocalizedCanvasTexture } from "./useLocalizedCanvasTexture";

const makePhoneScreen = (language: Language) => makeAppScreen(phoneApps, language);

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
  const { language } = useLanguage();
  const screen = useLocalizedCanvasTexture(language, makeSiteScreen);

  const baseH = 0.011;
  const baseY = DESK_TOP_Y + baseH / 2;
  const depth = 0.215;
  const { pos, rotY } = layout.laptop;

  return (
    <Hotspot
      id="laptop"
      onSelect={() => requestArchive("work")}
      labelAt={[pos[0], DESK_TOP_Y + 0.34, pos[2]]}
    >
      <group position={[pos[0], 0, pos[2]]} rotation={[0, rotY, 0]}>
        {/* A raised, bevelled unibody keeps a real contact edge against the oak. */}
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
            roughness={0.43}
            clearcoat={0.16}
            clearcoatRoughness={0.48}
          />
        </RoundedBox>

        {/* The keyboard sits in a recessed well; one instanced mesh keeps the
            individual key silhouettes inexpensive in the overview. */}
        <RoundedBox
          args={[0.253, 0.0007, 0.102]}
          radius={0.0003}
          smoothness={2}
          position={[0, DESK_TOP_Y + baseH + 0.00035, -0.036]}
          receiveShadow
        >
          <meshStandardMaterial color="#55585d" metalness={0.62} roughness={0.67} />
        </RoundedBox>
        <Keyboard y={DESK_TOP_Y + baseH + 0.00155} />
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.142, DESK_TOP_Y + baseH + 0.00015, -0.036]}>
            <boxGeometry args={[0.0035, 0.0003, 0.088]} />
            <meshStandardMaterial color="#73767a" metalness={0.5} roughness={0.7} />
          </mesh>
        ))}

        {/* An inset pad reads as part of the unibody, not a second silver tile. */}
        <RoundedBox args={[0.109, 0.00042, 0.071]} radius={0.0002} smoothness={2} position={[0, DESK_TOP_Y + baseH + 0.00022, 0.061]}>
          <meshStandardMaterial
            color="#92969b"
            metalness={0.58}
            roughness={0.53}
          />
        </RoundedBox>
        <mesh position={[0, DESK_TOP_Y + baseH + 0.00045, 0.061]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.105, 0.067]} />
          <meshStandardMaterial color="#c8c9ca" metalness={0.64} roughness={0.5} />
        </mesh>

        {/* Two separated hinge barrels leave the centre open for the display cable. */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.11, DESK_TOP_Y + baseH + 0.0008, -depth / 2]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.0033, 0.0033, 0.054, 16]} />
            <meshStandardMaterial color="#74777b" metalness={0.8} roughness={0.42} />
          </mesh>
        ))}

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
              roughness={0.43}
              clearcoat={0.16}
            />
          </RoundedBox>

          <mesh position={[0, 0.106, 0.0035]}>
            <planeGeometry args={[0.300, 0.202]} />
            <meshStandardMaterial color="#202126" metalness={0.08} roughness={0.28} />
          </mesh>
          {/* A self-lit screen preserves its colours at night without washing
              the artwork white under the daytime key light. */}
          <mesh position={[0, 0.105, 0.00375]}>
            <planeGeometry args={[0.286, 0.184]} />
            <meshBasicMaterial map={screen} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.205, 0.00385]}>
            <circleGeometry args={[0.00145, 12]} />
            <meshBasicMaterial color="#4f5458" />
          </mesh>
        </group>
      </group>
    </Hotspot>
  );
}

function Keyboard({ y }: { y: number }) {
  const mesh = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.08), []);
  const keys = useMemo(() => {
    const regular = Array.from({ length: 5 }, (_, row) =>
      Array.from({ length: 14 }, (_, column) => ({
        x: (column - 6.5) * 0.017,
        z: -0.075 + row * 0.017,
        w: 0.014,
      })),
    ).flat();
    const last = [-0.102, -0.085, -0.068, 0.068, 0.085, 0.102].map((x) => ({
      x, z: 0.010, w: 0.014,
    }));
    return [...regular, ...last, { x: 0, z: 0.010, w: 0.103 }];
  }, []);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const key = new Object3D();
    keys.forEach(({ x, z, w }, index) => {
      key.position.set(x, y, z);
      key.scale.set(w, 0.00135, 0.013);
      key.updateMatrix();
      mesh.current!.setMatrixAt(index, key.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [keys, y]);

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, keys.length]} castShadow receiveShadow>
      <meshStandardMaterial color="#292b30" metalness={0.1} roughness={0.7} />
    </instancedMesh>
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
