import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

interface StudioProps {
  isNight: boolean;
}

/** Soft, directional daylight tuned to the approved Chisel room study. */
export function Studio({ isNight }: StudioProps) {
  const daylight = isNight ? 0.16 : 1;
  const environment = isNight ? 0.22 : 1;

  return (
    <>
      <hemisphereLight args={["#fffaf1", "#b7aa94", isNight ? 0.22 : 1.45]} />
      <ambientLight color="#fff8ed" intensity={isNight ? 0.1 : 0.65} />

      <directionalLight
        castShadow
        position={[-4.2, 7.4, 3.2]}
        intensity={2.7 * daylight}
        color="#fff1d9"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00035}
        shadow-normalBias={0.018}
        shadow-camera-near={0.1}
        shadow-camera-far={18}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />

      <directionalLight
        position={[-4, 2.5, 1.5]}
        intensity={0.25 * daylight}
        color="#dce6e7"
      />

      <Environment key={isNight ? "night" : "day"} resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={3.4 * environment}
          position={[0, 4, -1]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[6, 4, 1]}
          color="#ffffff"
        />
        <Lightformer
          form="rect"
          intensity={2.6 * environment}
          position={[-4, 1.8, 0.5]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[5, 3, 1]}
          color="#dceaff"
        />
        <Lightformer
          form="rect"
          intensity={isNight ? 1.25 : 1.5}
          position={[3.5, 1.4, -1]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[4, 2, 1]}
          color="#ffd9ad"
        />
        <Lightformer
          form="rect"
          intensity={4 * environment}
          position={[-1.2, 2.4, 1.6]}
          rotation={[Math.PI / 3, 0, 0]}
          scale={[3, 0.25, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3 * environment}
          position={[1.6, 2.2, 1.4]}
          rotation={[Math.PI / 3, 0, 0]}
          scale={[2, 0.2, 1]}
        />
      </Environment>

      <ContactShadows
        position={[0, 0.002, -0.9]}
        scale={7}
        frames={1}
        resolution={1024}
        blur={2.6}
        opacity={isNight ? 0.38 : 0.5}
        far={2.2}
        color="#4a3a2a"
      />
    </>
  );
}
