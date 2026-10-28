import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

interface StudioProps {
  isNight: boolean;
}

/**
 * The lighting rig. This is what carries the "Apple product render" look —
 * the geometry is trivial, the material response is everything.
 *
 * Three layers:
 *  1. <Environment> built from Lightformers. These never appear in the scene;
 *     they are rendered into a cube map that glossy materials reflect. The big
 *     soft rectangles are exactly what a photographer's softbox does, and they
 *     are the reason aluminium reads as aluminium.
 *  2. One shadow-casting key light with PCSS soft shadows for object-on-desk
 *     contact.
 *  3. ContactShadows to ground the furniture on the floor.
 */
export function Studio({ isNight }: StudioProps) {
  // Time changes the ambient world; the desk lamp remains a separate,
  // continuous local light controlled from its physical dial.
  const daylight = isNight ? 0.16 : 1;
  // Keep enough reflected light at night that materials and controls never
  // collapse into black, even when the desk lamp is switched off.
  const environment = isNight ? 0.22 : 1;

  return (
    <>
      {/*
        No <SoftShadows> here. drei's PCSS injection calls unpackRGBAToDepth,
        which current three.js no longer defines, and a failed injection breaks
        shader compilation for *every* material in the scene — metalness and
        clearcoat silently stop working and the room reads as matte plastic.
        The Canvas uses three's own soft shadow map instead.
      */}
      <ambientLight intensity={isNight ? 0.1 : 0.28} />

      <directionalLight
        castShadow
        position={[3.2, 5.4, 2.2]}
        intensity={2.1 * daylight}
        color="#fff4e6"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-camera-near={0.5}
        shadow-camera-far={14}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />

      {/* cool bounce from the window side, keeps the greys from going muddy */}
      <directionalLight
        position={[-4, 2.5, 1.5]}
        intensity={0.5 * daylight}
        color="#cfe0f5"
      />

      {/* frames={1} bakes a stable reflection map for each time of day. */}
      <Environment key={isNight ? "night" : "day"} resolution={256} frames={1}>
        {/* overhead softbox — the long highlight down the middle of glossy tops */}
        <Lightformer
          form="rect"
          intensity={3.4 * environment}
          position={[0, 4, -1]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[6, 4, 1]}
          color="#ffffff"
        />
        {/* window wall — the big cool gradient in side reflections */}
        <Lightformer
          form="rect"
          intensity={2.6 * environment}
          position={[-4, 1.8, 0.5]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[5, 3, 1]}
          color="#dceaff"
        />
        {/* warm kicker from the lamp side, stops the back edges going dead */}
        <Lightformer
          form="rect"
          intensity={isNight ? 1.25 : 1.5}
          position={[3.5, 1.4, -1]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[4, 2, 1]}
          color="#ffd9ad"
        />
        {/* thin strip lights: these become the crisp specular lines on edges */}
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
        resolution={1024}
        blur={2.6}
        opacity={isNight ? 0.38 : 0.5}
        far={2.2}
        color="#4a3a2a"
      />
    </>
  );
}
