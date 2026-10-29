import { useCursor } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { dialAngleForBrightness } from "../../interaction/lampControl";
import {
  brightnessFor,
  detentForBrightness,
  dragThresholdFor,
  movementFor,
  type LampGesture,
} from "../../interaction/lampGesture";
import { tactileFeedback } from "../../interaction/tactile";
import { focus, useLampControls } from "../../interaction/studyStore";

type PointerCaptureTarget = {
  setPointerCapture(pointerId: number): void;
  releasePointerCapture(pointerId: number): void;
};

const asCaptureTarget = (event: ThreeEvent<PointerEvent>) =>
  event.target as unknown as PointerCaptureTarget;

const pressDepth = 0.0018;
const maxPressDuration = 450;
const topIdleColor = new THREE.Color("#c1c3be");
const topHoverColor = new THREE.Color("#d5d8d2");

function Knurling() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    // These are fine, almost flush machining ridges—not large teeth attached
    // to the barrel. Their short radial depth keeps the silhouette circular.
    const count = 36;
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      dummy.position.set(Math.sin(angle) * 0.03065, -0.00035, -Math.cos(angle) * 0.03065);
      dummy.rotation.set(0, angle, 0);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(index, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 36]} castShadow receiveShadow>
      <boxGeometry args={[0.00135, 0.0066, 0.0011]} />
      <meshStandardMaterial color="#69706f" metalness={0.78} roughness={0.54} />
    </instancedMesh>
  );
}

function ScaleTicks() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const count = 15;
    const min = THREE.MathUtils.degToRad(-130);
    const max = THREE.MathUtils.degToRad(130);
    for (let index = 0; index < count; index += 1) {
      const angle = min + (index / (count - 1)) * (max - min);
      const major = index % 3 === 0 || index === count - 1;
      dummy.position.set(Math.sin(angle) * 0.0365, 0.00572, -Math.cos(angle) * 0.0365);
      dummy.rotation.set(0, angle, 0);
      dummy.scale.set(1, 1, major ? 1.45 : 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(index, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 15]}>
      <boxGeometry args={[0.0009, 0.00032, 0.0032]} />
      <meshStandardMaterial color="#6f7775" metalness={0.48} roughness={0.64} />
    </instancedMesh>
  );
}

/**
 * Press to power. Drag to choose a continuous brightness. All event handling
 * lives on the hit target so capture, cancellation and Hotspot propagation are
 * governed by one gesture state rather than independent window listeners.
 */
export function LampDimmer() {
  const {
    lampBrightness,
    lampPowerRevision,
    setLampBrightness,
    toggleLampPower,
    setLampInteracting,
    tactileMuted,
  } = useLampControls();
  const dial = useRef<THREE.Group>(null);
  const topMaterial = useRef<THREE.MeshPhysicalMaterial>(null);
  const gesture = useRef<LampGesture | null>(null);
  const captureTarget = useRef<PointerCaptureTarget | null>(null);
  const pressTarget = useRef(0);
  const press = useRef(0);
  const appliedPowerRevision = useRef(lampPowerRevision);
  const suppressNextPowerAnimation = useRef(false);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  useCursor(hovered || dragging, dragging ? "grabbing" : "grab", "auto");

  const finishGesture = (pointerId: number) => {
    const active = gesture.current;
    if (!active || active.pointerId !== pointerId) return null;

    try {
      captureTarget.current?.releasePointerCapture(pointerId);
    } catch {
      // A browser may release capture before a cancellation handler runs.
    }
    gesture.current = null;
    captureTarget.current = null;
    pressTarget.current = 0;
    setDragging(false);
    setLampInteracting(false);
    return active;
  };

  useEffect(
    () => () => {
      gesture.current = null;
      captureTarget.current = null;
      setDragging(false);
      setLampInteracting(false);
    },
    [setLampInteracting],
  );

  useEffect(() => {
    if (lampPowerRevision === appliedPowerRevision.current) return;
    appliedPowerRevision.current = lampPowerRevision;
    if (suppressNextPowerAnimation.current) {
      suppressNextPowerAnimation.current = false;
      return;
    }

    // A keyboard or HUD power action still has a visible response on the
    // physical dial, while the originating physical press avoids a second dip.
    pressTarget.current = 1;
    const release = window.setTimeout(() => {
      pressTarget.current = 0;
    }, 72);
    return () => window.clearTimeout(release);
  }, [lampPowerRevision]);

  useFrame((_state, delta) => {
    if (!dial.current) return;

    dial.current.rotation.y = THREE.MathUtils.damp(
      dial.current.rotation.y,
      dialAngleForBrightness(lampBrightness),
      24,
      delta,
    );
    // Short, real-scale travel: fast into the mechanical stop, softly damped
    // back out. There is no spring overshoot to make the metal feel rubbery.
    press.current = THREE.MathUtils.damp(
      press.current,
      pressTarget.current,
      pressTarget.current ? 42 : 26,
      delta,
    );
    dial.current.position.y = 0.009 - press.current * pressDepth;

    if (topMaterial.current) {
      topMaterial.current.color.lerp(
        hovered ? topHoverColor : topIdleColor,
        1 - Math.exp(-delta * 12),
      );
    }
  });

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (gesture.current) {
      event.stopPropagation();
      return;
    }
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.stopPropagation();
    focus("lamp");

    const target = asCaptureTarget(event);
    try {
      target.setPointerCapture(event.pointerId);
      captureTarget.current = target;
    } catch {
      // The gesture remains safe if a browser declines capture; R3F continues
      // dispatching while the hit area is under the pointer.
      captureTarget.current = null;
    }

    gesture.current = {
      pointerId: event.pointerId,
      pointerType: event.pointerType || "mouse",
      startX: event.clientX,
      startY: event.clientY,
      startBrightness: lampBrightness,
      startedAt: event.timeStamp,
      phase: "press-candidate",
      lastDetent: detentForBrightness(lampBrightness),
    };
    pressTarget.current = 1;
    setLampInteracting(true);
  };

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    event.stopPropagation();

    if (
      active.phase === "press-candidate" &&
      movementFor(active, event.clientX, event.clientY) >= dragThresholdFor(active.pointerType)
    ) {
      active.phase = "dragging";
      pressTarget.current = 0;
      setDragging(true);
    }
    if (active.phase !== "dragging") return;

    const brightness = brightnessFor(active, event.clientX, event.clientY, window.innerWidth);
    setLampBrightness(brightness);

    const detent = detentForBrightness(brightness);
    if (detent !== active.lastDetent) {
      tactileFeedback("tick", tactileMuted);
      active.lastDetent = detent;
    }
  };

  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    const active = finishGesture(event.pointerId);
    if (!active) return;
    event.stopPropagation();

    if (
      active.phase === "press-candidate" &&
      event.timeStamp - active.startedAt <= maxPressDuration
    ) {
      tactileFeedback("press", tactileMuted);
      suppressNextPowerAnimation.current = true;
      toggleLampPower();
    }
  };

  const onPointerCancel = (event: ThreeEvent<PointerEvent>) => {
    const active = finishGesture(event.pointerId);
    if (!active) return;
    event.stopPropagation();
    // Cancellation is not a hidden click. Roll an in-flight drag back to the
    // value at its initial contact and leave power untouched.
    if (active.phase === "dragging") setLampBrightness(active.startBrightness);
  };

  return (
    <group position={[0.036, 0.022, 0.026]}>
      {/* Fixed mechanism: gap, scale and calibrated markings never rotate. */}
      <mesh position={[0, 0.0024, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.0405, 0.0415, 0.0048, 64]} />
        <meshStandardMaterial color="#3f4545" metalness={0.78} roughness={0.52} />
      </mesh>
      <mesh position={[0, 0.0051, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.0402, 0.0402, 0.0007, 64]} />
        <meshStandardMaterial color="#535a58" metalness={0.64} roughness={0.61} />
      </mesh>
      <ScaleTicks />

      <group ref={dial} position={[0, 0.009, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.03, 0.0306, 0.0102, 64]} />
          <meshStandardMaterial color="#707775" metalness={0.76} roughness={0.53} />
        </mesh>
        <Knurling />
        <mesh position={[0, 0.0052, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.0282, 0.03, 0.0016, 64]} />
          <meshStandardMaterial color="#858b88" metalness={0.68} roughness={0.58} />
        </mesh>
        <mesh position={[0, 0.00615, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.0278, 0.0278, 0.00065, 64]} />
          <meshStandardMaterial
            ref={topMaterial}
            color="#a9adaa"
            metalness={0.58}
            roughness={0.64}
            envMapIntensity={0.55}
          />
        </mesh>
        <mesh position={[0, 0.0065, -0.0125]} castShadow>
          <boxGeometry args={[0.00135, 0.00028, 0.0072]} />
          <meshStandardMaterial color="#303636" metalness={0.24} roughness={0.7} />
        </mesh>
      </group>

      {/* Slightly larger than the visible dial, but contained inside the base. */}
      <mesh
        position={[0, 0.012, 0]}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          if (!gesture.current) setHovered(false);
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <cylinderGeometry args={[0.045, 0.045, 0.028, 40]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
