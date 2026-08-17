import { ContactShadows, Environment, Lightformer, SoftShadows } from "@react-three/drei";
import { useStudy } from "../interaction/studyStore";

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
export function Studio() {
  const { lampOn } = useStudy();
  // "lamp on" means evening: the daylight rig drops away and the desk lamp
  // becomes the only real source in the room.
  const day = lampOn ? 0.12 : 1;
  // the environment keeps a little more life than the direct lights, otherwise
  // every glossy surface goes flat black and the room stops reading as 3D
  const env = lampOn ? 0.18 : 1;

  return (
    <>
      <SoftShadows size={24} samples={10} focus={0.7} />

      <ambientLight intensity={lampOn ? 0.07 : 0.28} />

      <directionalLight
        castShadow
        position={[3.2, 5.4, 2.2]}
        intensity={2.1 * day}
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
      <directionalLight position={[-4, 2.5, 1.5]} intensity={0.5 * day} color="#cfe0f5" />

      {/*
        frames={1} bakes the cube map once on mount, which is what makes this
        cheap. Remounting on the light switch is how the night palette gets
        picked up without paying for a live-updating environment.
      */}
      <Environment key={lampOn ? "night" : "day"} resolution={256} frames={1}>
        {/* overhead softbox — the long highlight down the middle of glossy tops */}
        <Lightformer
          form="rect"
          intensity={3.4 * env}
          position={[0, 4, -1]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[6, 4, 1]}
          color="#ffffff"
        />
        {/* window wall — the big cool gradient in side reflections */}
        <Lightformer
          form="rect"
          intensity={2.6 * env}
          position={[-4, 1.8, 0.5]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[5, 3, 1]}
          color="#dceaff"
        />
        {/* warm kicker from the lamp side, stops the back edges going dead */}
        <Lightformer
          form="rect"
          intensity={1.5 * (lampOn ? 0.9 : 1)}
          position={[3.5, 1.4, -1]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[4, 2, 1]}
          color="#ffd9ad"
        />
        {/* thin strip lights: these become the crisp specular lines on edges */}
        <Lightformer
          form="rect"
          intensity={4 * env}
          position={[-1.2, 2.4, 1.6]}
          rotation={[Math.PI / 3, 0, 0]}
          scale={[3, 0.25, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3 * env}
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
        opacity={0.5}
        far={2.2}
        color="#4a3a2a"
      />
    </>
  );
}
