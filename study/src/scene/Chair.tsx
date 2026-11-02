import { useEffect, useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CatmullRomCurve3,
  ExtrudeGeometry,
  MeshPhysicalMaterial,
  Shape,
  SphereGeometry,
  TubeGeometry,
  Vector3,
  type Group,
} from "three";
import { Hotspot } from "../interaction/Hotspot";
import { currentVolume } from "../interaction/studyStore";
import { layout } from "./layout";
import { palette } from "./theme";
import { makeFabric, makeFur, makeWood } from "./textures";

const SEAT_Y = 0.44;

const fur = {
  coat: "#ebe9e4",
  stripe: "#b9b6b0",
  innerEar: "#eeb0b4",
  nose: "#e0949a",
  eye: "#86bf4f",
  pupil: "#26303a",
  tailTip: "#3a3a3c",
};

function makeBodyGeometry() {
  const geometry = new SphereGeometry(1, 36, 28);
  const points = geometry.attributes.position;
  for (let i = 0; i < points.count; i++) {
    const x = points.getX(i);
    const y = points.getY(i);
    const z = points.getZ(i);
    const shoulder = Math.max(0, y);
    points.setXYZ(i, x * (1 - shoulder * 0.27), y < -0.62 ? -0.62 + (y + 0.62) * 0.55 : y, z * (1 - shoulder * 0.13));
  }
  geometry.computeVertexNormals();
  return geometry;
}

function makeHeadGeometry() {
  const geometry = new SphereGeometry(1, 36, 28);
  const points = geometry.attributes.position;
  for (let i = 0; i < points.count; i++) {
    const x = points.getX(i);
    const y = points.getY(i);
    const z = points.getZ(i);
    const cheek = 1 + 0.12 * (1 - Math.abs(y)) - 0.06 * y;
    points.setXYZ(i, x * cheek, y < -0.48 ? -0.48 + (y + 0.48) * 0.65 : y, z * (1 - Math.max(0, y) * 0.08));
  }
  geometry.computeVertexNormals();
  return geometry;
}

function makeEarGeometry() {
  const shape = new Shape();
  shape.moveTo(-0.028, -0.021);
  shape.quadraticCurveTo(-0.026, 0.015, -0.006, 0.050);
  shape.quadraticCurveTo(0.001, 0.058, 0.009, 0.047);
  shape.quadraticCurveTo(0.028, 0.012, 0.028, -0.021);
  shape.quadraticCurveTo(0, -0.031, -0.028, -0.021);
  const geometry = new ExtrudeGeometry(shape, {
    depth: 0.005,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 2,
    curveSegments: 7,
  });
  geometry.translate(0, 0, -0.0025);
  geometry.computeVertexNormals();
  return geometry;
}

export function ReadingChair() {
  const { pos, rotY } = layout.chair;
  return (
    <group position={[pos[0], pos[1], pos[2]]} rotation={[0, rotY, 0]}>
      <Chair />
      <Domi />
    </group>
  );
}

function Chair() {
  const oak = useMemo(() => makeWood("#d8b489", "#a3784a", [1, 1]), []);
  const cloth = useMemo(() => makeFabric("#c2a894", [3, 3]), []);
  const legs: [number, number][] = [
    [-0.17, -0.17],
    [0.17, -0.17],
    [-0.17, 0.17],
    [0.17, 0.17],
  ];

  return (
    <group>
      {legs.map(([x, z], i) => (
        <mesh key={i} position={[x, SEAT_Y / 2, z]} castShadow>
          <cylinderGeometry args={[0.017, 0.014, SEAT_Y, 16]} />
          <meshStandardMaterial
            color={palette.deskLeg}
            metalness={0.8}
            roughness={0.35}
          />
        </mesh>
      ))}

      <RoundedBox
        args={[0.44, 0.045, 0.44]}
        radius={0.012}
        smoothness={4}
        position={[0, SEAT_Y + 0.022, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          map={oak.map}
          bumpMap={oak.bumpMap}
          bumpScale={0.2}
          roughness={0.44}
          clearcoat={0.3}
        />
      </RoundedBox>

      {/* cushion */}
      <RoundedBox
        args={[0.38, 0.05, 0.38]}
        radius={0.022}
        smoothness={4}
        position={[0, SEAT_Y + 0.068, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          map={cloth.map}
          bumpMap={cloth.bumpMap}
          bumpScale={0.3}
          roughness={0.94}
          sheen={0.7}
          sheenColor="#e6d3c2"
        />
      </RoundedBox>

      {/* back */}
      <group position={[0, 0, -0.2]}>
        {[-0.19, 0.19].map((x) => (
          <mesh key={x} position={[x, SEAT_Y + 0.26, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.52, 16]} />
            <meshStandardMaterial
              color={palette.deskLeg}
              metalness={0.8}
              roughness={0.35}
            />
          </mesh>
        ))}
        <RoundedBox
          args={[0.42, 0.17, 0.035]}
          radius={0.014}
          smoothness={4}
          position={[0, SEAT_Y + 0.44, 0]}
          castShadow
        >
          <meshPhysicalMaterial
            map={oak.map}
            bumpMap={oak.bumpMap}
            bumpScale={0.2}
            roughness={0.44}
            clearcoat={0.3}
          />
        </RoundedBox>
      </group>
    </group>
  );
}

/** Fires a meow if one has been dropped in. Silent, not broken, if not. */
function meow() {
  const el = new Audio("/audio/domi-meow.mp3");
  el.volume = currentVolume();
  el.play().catch(() => {
    /* no file yet — the startle still reads on its own */
  });
}

/**
 * Domi keeps the room's procedural language, but uses shaped masses and a
 * continuous tail so the close camera reads an animal rather than toy parts.
 *
 * She is the one thing in the room that moves on its own: breathing, blinking,
 * looking around, tail going. A still cat reads as an ornament; an idling one
 * reads as an animal that happens to be sitting there.
 */
function Domi() {
  const root = useRef<Group>(null);
  const head = useRef<Group>(null);
  const tail = useRef<Group>(null);
  const eyes = useRef<Group>(null);
  const reducedMotion = useRef(false);
  const furMaps = useMemo(makeFur, []);
  const coatMaterial = useMemo(() => new MeshPhysicalMaterial({
    map: furMaps.map,
    bumpMap: furMaps.bumpMap,
    bumpScale: 0.012,
    roughness: 0.96,
    sheen: 0.48,
    sheenColor: "#f7f1e9",
  }), [furMaps]);
  const bodyGeometry = useMemo(makeBodyGeometry, []);
  const headGeometry = useMemo(makeHeadGeometry, []);
  const earGeometry = useMemo(makeEarGeometry, []);
  const tailCurve = useMemo(() => new CatmullRomCurve3([
    new Vector3(0, 0, 0),
    new Vector3(0.043, 0.018, -0.022),
    new Vector3(0.106, 0.023, -0.005),
    new Vector3(0.155, 0.035, 0.038),
    new Vector3(0.149, 0.058, 0.079),
  ]), []);
  const tailBaseCurve = useMemo(() => new CatmullRomCurve3([
    tailCurve.getPoint(0),
    tailCurve.getPoint(0.18),
    tailCurve.getPoint(0.36),
    tailCurve.getPoint(0.54),
    tailCurve.getPoint(0.70),
  ]), [tailCurve]);
  const tailGeometry = useMemo(() => new TubeGeometry(tailBaseCurve, 20, 0.014, 8, false), [tailBaseCurve]);
  const tailTipCurve = useMemo(() => new CatmullRomCurve3([
    tailCurve.getPoint(0.70),
    tailCurve.getPoint(0.81),
    tailCurve.getPoint(0.91),
    tailCurve.getPoint(1),
  ]), [tailCurve]);
  const tailTipGeometry = useMemo(() => new TubeGeometry(tailTipCurve, 10, 0.014, 8, false), [tailTipCurve]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reducedMotion.current = media.matches; };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const debugWindow = window as Window & { __studyDomiPose?: () => object };
    debugWindow.__studyDomiPose = () => ({
      rootScale: root.current?.scale.x ?? null,
      headRotation: head.current?.rotation.toArray().slice(0, 3) ?? null,
      eyeScale: eyes.current?.scale.y ?? null,
      tailRotation: tail.current?.rotation.y ?? null,
    });
    return () => { delete debugWindow.__studyDomiPose; };
  }, []);

  useEffect(() => () => {
    coatMaterial.dispose();
    furMaps.map.dispose();
    furMaps.bumpMap.dispose();
    bodyGeometry.dispose();
    headGeometry.dispose();
    earGeometry.dispose();
    tailGeometry.dispose();
    tailTipGeometry.dispose();
  }, [bodyGeometry, coatMaterial, earGeometry, furMaps, headGeometry, tailGeometry, tailTipGeometry]);

  // one mutable bag rather than state — none of this should trigger a re-render
  const beat = useRef({
    lookY: 0,
    lookX: 0,
    nextLook: 2.5,
    nextBlink: 3,
    blinkUntil: -1,
    startle: 0,
  });

  const poke = () => {
    beat.current.startle = 1;
    // look straight out at whoever just poked her
    beat.current.lookY = 0.55;
    beat.current.lookX = -0.08;
    beat.current.nextLook = 2.2;
    meow();
  };

  useFrame((state, dt) => {
    if (reducedMotion.current) {
      root.current?.scale.setScalar(1);
      if (head.current) head.current.rotation.set(0, 0, 0);
      if (eyes.current) eyes.current.scale.y = 1;
      if (tail.current) tail.current.rotation.y = 0;
      return;
    }
    const t = state.clock.getElapsedTime();
    const b = beat.current;

    // breathing
    if (root.current) root.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.006);

    // pick somewhere new to look every few seconds
    b.nextLook -= dt;
    if (b.nextLook <= 0) {
      b.lookY = (Math.random() - 0.5) * 1.1;
      b.lookX = (Math.random() - 0.35) * 0.24;
      b.nextLook = 2.5 + Math.random() * 4;
    }

    if (head.current) {
      const ease = 1 - Math.pow(0.001, dt); // frame-rate independent damping
      head.current.rotation.y += (b.lookY - head.current.rotation.y) * ease;
      head.current.rotation.x += (b.lookX - head.current.rotation.x) * ease;
    }

    // blink
    b.nextBlink -= dt;
    if (b.nextBlink <= 0) {
      b.blinkUntil = t + 0.14;
      b.nextBlink = 3 + Math.random() * 5;
    }
    if (eyes.current) {
      const closed = t < b.blinkUntil;
      const target = closed ? 0.12 : 1;
      eyes.current.scale.y += (target - eyes.current.scale.y) * (closed ? 0.6 : 0.25);
    }

    // tail: a slow sway, snapping into a flick when startled
    b.startle = Math.max(0, b.startle - dt * 1.4);
    if (tail.current) {
      const idle = Math.sin(t * 0.9) * 0.13;
      const flick = Math.sin(t * 14) * 0.3 * b.startle;
      tail.current.rotation.y = idle + flick;
    }
  });

  const stripes = useMemo(
    () => [
      { pos: [0, 0.205, -0.078], s: [0.05, 0.011, 0.011] },
      { pos: [0, 0.159, -0.094], s: [0.058, 0.011, 0.011] },
      { pos: [0, 0.112, -0.097], s: [0.054, 0.01, 0.011] },
    ],
    [],
  );

  return (
    <Hotspot id="domi" labelAt={[0, SEAT_Y + 0.52, 0]} onActivate={poke}>
      {/* turned out of the chair so her face catches the default camera */}
      <group ref={root} position={[0, SEAT_Y + 0.09, 0.01]} rotation={[0, 0.95, 0]}>
        {/* Shaped shoulders and a flattened seated base form one coat mass. */}
        <mesh geometry={bodyGeometry} material={coatMaterial} position={[0, 0.13, -0.01]} scale={[0.102, 0.15, 0.09]} castShadow receiveShadow />

        {stripes.map((s, i) => (
          <mesh
            key={i}
            position={s.pos as [number, number, number]}
            scale={s.s as [number, number, number]}
          >
            <sphereGeometry args={[1, 14, 10]} />
            <meshStandardMaterial color={fur.stripe} roughness={0.9} />
          </mesh>
        ))}

        {/* everything from here up turns together when she looks around */}
        <group ref={head} position={[0, 0.285, 0.022]}>
          <mesh geometry={headGeometry} material={coatMaterial} scale={[0.081, 0.07, 0.069]} castShadow receiveShadow />

          {/* Low-relief markings follow the forehead instead of floating on it. */}
          <mesh position={[0, 0.045, 0.050]} scale={[0.017, 0.014, 0.004]}>
            <sphereGeometry args={[1, 18, 12]} />
            <meshStandardMaterial color={fur.stripe} roughness={0.94} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.029, 0.037, 0.051]}
              scale={[0.009, 0.013, 0.0035]}
            >
              <sphereGeometry args={[1, 16, 10]} />
              <meshStandardMaterial color={fur.stripe} roughness={0.94} />
            </mesh>
          ))}

          {/* Thin, folded ear shells replace the visible cone tips. */}
          {[-1, 1].map((side) => (
            <group
              key={side}
              position={[side * 0.052, 0.061, -0.008]}
              rotation={[0.08, 0, -side * 0.18]}
            >
              <mesh geometry={earGeometry} material={coatMaterial} castShadow />
              <mesh geometry={earGeometry} position={[0, -0.007, 0.005]} scale={[0.57, 0.67, 0.5]}>
                <meshStandardMaterial color={fur.innerEar} roughness={0.93} />
              </mesh>
            </group>
          ))}

          {/* Paired jowls and a small nose keep the face legible when she blinks. */}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.018, -0.028, 0.060]} scale={[0.026, 0.016, 0.018]} material={coatMaterial}>
              <sphereGeometry args={[1, 20, 14]} />
            </mesh>
          ))}
          <mesh position={[0, -0.021, 0.081]} scale={[1, 0.72, 0.58]}>
            <sphereGeometry args={[0.008, 14, 10]} />
            <meshStandardMaterial color={fur.nose} roughness={0.73} />
          </mesh>

          {/* Domi's green eyes sit in shallow almond-shaped lids. */}
          <group ref={eyes}>
            {[-1, 1].map((side) => (
              <group key={side} position={[side * 0.031, 0.007, 0.062]}>
                <mesh scale={[0.022, 0.015, 0.004]}>
                  <sphereGeometry args={[1, 20, 14]} />
                  <meshStandardMaterial color="#6f7770" roughness={0.9} />
                </mesh>
                <mesh position={[0, 0, 0.003]} scale={[0.017, 0.012, 0.004]}>
                  <sphereGeometry args={[1, 20, 14]} />
                  <meshStandardMaterial color={fur.eye} roughness={0.47} />
                </mesh>
                <mesh position={[0, 0, 0.006]} scale={[0.0036, 0.009, 0.003]}>
                  <sphereGeometry args={[1, 12, 10]} />
                  <meshStandardMaterial color={fur.pupil} roughness={0.38} />
                </mesh>
                <mesh position={[0.005, 0.005, 0.008]}>
                  <sphereGeometry args={[0.0025, 8, 6]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </group>
            ))}
          </group>
        </group>

        {/* Low oval paws meet the cushion without separate vertical stumps. */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.043, 0.022, 0.052]} scale={[0.031, 0.022, 0.039]} material={coatMaterial} castShadow>
            <sphereGeometry args={[1, 20, 14]} />
          </mesh>
        ))}

        {/* One continuous curve, with her dark tip over the final section. */}
        <group ref={tail} position={[0.055, 0.034, -0.075]}>
          <mesh geometry={tailGeometry} material={coatMaterial} castShadow />
          <mesh geometry={tailTipGeometry} castShadow>
            <meshStandardMaterial color={fur.tailTip} roughness={0.94} />
          </mesh>
          <mesh position={tailCurve.getPoint(0.70)} castShadow>
            <sphereGeometry args={[0.014, 10, 8]} />
            <meshStandardMaterial color={fur.tailTip} roughness={0.94} />
          </mesh>
          <mesh position={tailCurve.getPoint(1)} castShadow>
            <sphereGeometry args={[0.014, 10, 8]} />
            <meshStandardMaterial color={fur.tailTip} roughness={0.94} />
          </mesh>
        </group>
      </group>
    </Hotspot>
  );
}
