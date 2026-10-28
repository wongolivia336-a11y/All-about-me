import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Hotspot } from "../../interaction/Hotspot";
import { currentEffectiveLampBrightness } from "../../interaction/studyStore";
import { layout } from "../layout";
import { palette } from "../theme";
import { LampDimmer } from "./LampDimmer";

/**
 * A continuous task light. The physical dimmer supplies a stable brightness
 * target while these three optical layers deliberately settle at different
 * rates: filament, shade, then the desk pool.
 */
export function DeskLamp() {
  const { pos, rotY } = layout.lamp;
  const armLen = 0.4;
  const headY = 0.44;
  const spotTarget = useMemo(() => new THREE.Object3D(), []);
  const spotLight = useRef<THREE.SpotLight>(null);
  const spillLight = useRef<THREE.PointLight>(null);
  const shadeMaterial = useRef<THREE.MeshPhysicalMaterial>(null);
  const bulbMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const haloMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const halo = useRef<THREE.Mesh>(null);
  const filamentLevel = useRef(0);
  const shadeLevel = useRef(0);
  const poolLevel = useRef(0);
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useFrame((_state, delta) => {
    const effectiveLampBrightness = currentEffectiveLampBrightness();
    const approach = (current: number, target: number, rate: number) =>
      reducedMotion ? target : THREE.MathUtils.damp(current, target, rate, delta);

    filamentLevel.current = approach(
      filamentLevel.current,
      effectiveLampBrightness,
      effectiveLampBrightness > filamentLevel.current ? 13 : 9,
    );
    shadeLevel.current = approach(
      shadeLevel.current,
      effectiveLampBrightness,
      effectiveLampBrightness > shadeLevel.current ? 7 : 5,
    );
    poolLevel.current = approach(
      poolLevel.current,
      effectiveLampBrightness,
      effectiveLampBrightness > poolLevel.current ? 3.1 : 4.6,
    );

    const filament = filamentLevel.current;
    const shade = shadeLevel.current;
    const pool = poolLevel.current;

    if (spotLight.current) spotLight.current.intensity = 7.8 * pool ** 1.72;
    if (spillLight.current) spillLight.current.intensity = 0.62 * shade ** 1.18;
    if (shadeMaterial.current) shadeMaterial.current.emissiveIntensity = 0.03 + shade * 0.48;
    if (bulbMaterial.current) {
      const glow = 0.08 + filament * 3.1;
      bulbMaterial.current.color.setRGB(glow, glow * 0.78, glow * 0.52);
      bulbMaterial.current.opacity = 0.02 + filament * 0.94;
    }
    if (haloMaterial.current) haloMaterial.current.opacity = filament ** 1.7 * 0.18;
    if (halo.current) halo.current.scale.setScalar(1 + filament * 0.72);
  });

  return (
    <Hotspot id="lamp" labelAt={[pos[0], pos[1] + 0.6, pos[2]]}>
      <group position={[pos[0], pos[1], pos[2]]} rotation={[0, rotY, 0]}>
        <mesh position={[0, 0.011, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.085, 0.09, 0.022, 32]} />
          <meshPhysicalMaterial
            color="#565a5c"
            metalness={0.85}
            roughness={0.38}
            clearcoat={0.18}
          />
        </mesh>

        <LampDimmer />

        <mesh position={[0, armLen / 2 + 0.02, -0.03]} rotation={[0.14, 0, 0]} castShadow>
          <cylinderGeometry args={[0.0075, 0.0075, armLen, 16]} />
          <meshStandardMaterial color={palette.aluminumDark} metalness={0.9} roughness={0.3} />
        </mesh>

        <group position={[0, headY, 0.03]} rotation={[0.62, 0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.075, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial
              ref={shadeMaterial}
              color={palette.ceramic}
              emissive="#f2b86e"
              emissiveIntensity={0.03}
              metalness={0.15}
              roughness={0.4}
              clearcoat={0.7}
              side={2}
            />
          </mesh>

          <mesh position={[0, -0.004, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.062, 28]} />
            <meshBasicMaterial
              ref={bulbMaterial}
              color="#211108"
              transparent
              opacity={0.02}
              toneMapped={false}
            />
          </mesh>
          <mesh ref={halo} position={[0, -0.004, 0.0008]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.084, 32]} />
            <meshBasicMaterial
              ref={haloMaterial}
              color="#ffb765"
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        </group>

        <primitive object={spotTarget} position={[0.16, -0.62, 0.42]} />
        <spotLight
          ref={spotLight}
          position={[0, headY - 0.06, 0.06]}
          target={spotTarget}
          angle={0.72}
          penumbra={0.85}
          intensity={0}
          distance={2.6}
          decay={1.6}
          color="#ffd9a0"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0008}
        />
        <pointLight
          ref={spillLight}
          position={[0, headY - 0.02, 0.04]}
          intensity={0}
          distance={0.9}
          decay={2}
          color="#ffcf90"
        />
      </group>
    </Hotspot>
  );
}
