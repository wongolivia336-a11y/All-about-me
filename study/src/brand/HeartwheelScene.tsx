import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { ThemeId } from "../data/library";
import { themeConfig, themeOrder } from "../data/themeConfig";
import { HeartwheelFallback } from "./HeartwheelFallback";

function canUseWebGL() {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!context) return false;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function makeLeafShape() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(-8, 18, -58, 46, -66, 88);
  shape.bezierCurveTo(-73, 126, -28, 150, 0, 116);
  shape.bezierCurveTo(28, 150, 73, 126, 66, 88);
  shape.bezierCurveTo(58, 46, 8, 18, 0, 0);
  shape.closePath();
  return shape;
}

function makeRaisedSurface(shape: THREE.Shape) {
  const contour = shape.extractPoints(28).shape;
  if (contour.length > 2 && contour[0].distanceTo(contour[contour.length - 1]) < 0.0001) contour.pop();
  const triangles = THREE.ShapeUtils.triangulateShape(contour, []);
  const subdivisions = 7;
  const positions: number[] = [];
  const indices: number[] = [];
  const vertexByPoint = new Map<string, number>();

  const addVertex = (point: THREE.Vector2) => {
    const key = `${point.x.toFixed(4)},${point.y.toFixed(4)}`;
    const existing = vertexByPoint.get(key);
    if (existing !== undefined) return existing;
    const progress = THREE.MathUtils.clamp(point.y / 150, 0, 1);
    const ridge = Math.sin(progress * Math.PI) * Math.exp(-Math.abs(point.x) / 25) * 8.5;
    const index = positions.length / 3;
    positions.push(point.x, point.y, 2.7 + ridge);
    vertexByPoint.set(key, index);
    return index;
  };

  for (const [aIndex, bIndex, cIndex] of triangles) {
    const a = contour[aIndex];
    const b = contour[bIndex];
    const c = contour[cIndex];
    const rows: number[][] = [];

    for (let i = 0; i <= subdivisions; i += 1) {
      rows[i] = [];
      for (let j = 0; j <= subdivisions - i; j += 1) {
        const weightA = 1 - (i + j) / subdivisions;
        rows[i][j] = addVertex(new THREE.Vector2(
          a.x * weightA + b.x * i / subdivisions + c.x * j / subdivisions,
          a.y * weightA + b.y * i / subdivisions + c.y * j / subdivisions,
        ));
      }
    }

    for (let i = 0; i < subdivisions; i += 1) {
      for (let j = 0; j < subdivisions - i; j += 1) {
        indices.push(rows[i][j], rows[i + 1][j], rows[i][j + 1]);
        if (i + j < subdivisions - 1) {
          indices.push(rows[i + 1][j], rows[i + 1][j + 1], rows[i][j + 1]);
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function LeafMesh({
  theme,
  active,
  hovered,
  reducedMotion,
}: {
  theme: ThemeId;
  active: boolean;
  hovered: boolean;
  reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  const geometry = useMemo(() => {
    const shape = makeLeafShape();
    return {
      shell: new THREE.ExtrudeGeometry(shape, {
        depth: 1.8,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 1.2,
        bevelThickness: 0.8,
        curveSegments: 28,
      }),
      surface: makeRaisedSurface(shape),
      vein: new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 2, 2.9),
          new THREE.Vector3(0, 30, 7.95),
          new THREE.Vector3(0, 67, 11.45),
          new THREE.Vector3(0, 98, 10.4),
          new THREE.Vector3(0, 116, 8.9),
        ]),
        32,
        0.72,
        7,
        false,
      ),
    };
  }, []);

  useEffect(() => () => {
    geometry.shell.dispose();
    geometry.surface.dispose();
    geometry.vein.dispose();
  }, [geometry]);

  useFrame((_, delta) => {
    const target = hovered ? 1.055 : active ? 1.025 : 1;
    const targetLift = hovered ? 2.6 : active ? 1.2 : 0;
    const item = group.current;
    if (!item) return;

    if (reducedMotion) {
      item.scale.setScalar(target);
      item.position.z = targetLift;
      return;
    }

    const amount = 1 - Math.exp(-18 * Math.min(delta, 0.05));
    const nextScale = THREE.MathUtils.lerp(item.scale.x, target, amount);
    const nextLift = THREE.MathUtils.lerp(item.position.z, targetLift, amount);
    item.scale.setScalar(nextScale);
    item.position.z = nextLift;

    if (Math.abs(nextScale - target) > 0.001 || Math.abs(nextLift - targetLift) > 0.02) invalidate();
  });

  const angle = -themeConfig[theme].leafAngle * Math.PI / 180;

  return (
    <group ref={group} rotation={[0, 0, angle]}>
      <mesh geometry={geometry.shell} castShadow={false} receiveShadow={false}>
        <meshPhysicalMaterial color={themeConfig[theme].leafColor} roughness={0.72} metalness={0.01} clearcoat={0.08} clearcoatRoughness={0.86} />
      </mesh>
      <mesh geometry={geometry.surface} castShadow={false} receiveShadow={false}>
        <meshStandardMaterial color={themeConfig[theme].leafColor} roughness={0.62} metalness={0.01} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometry.vein} castShadow={false} receiveShadow={false}>
        <meshStandardMaterial color={themeConfig[theme].accent} roughness={0.78} transparent opacity={0.48} />
      </mesh>
    </group>
  );
}

export function HeartwheelScene({
  activeTheme,
  focused,
  hoveredTheme,
}: {
  activeTheme: ThemeId;
  focused: boolean;
  hoveredTheme: ThemeId | null;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglAvailable] = useState(canUseWebGL);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return webglAvailable ? (
        <Canvas
          orthographic
          camera={{ position: [0, 0, 260], left: -170, right: 170, top: 170, bottom: -170, near: 0.1, far: 500 }}
          dpr={[1, 1.5]}
          frameloop="demand"
          fallback={<HeartwheelFallback />}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        >
          <ambientLight intensity={0.72} />
          <directionalLight position={[-120, 28, 38]} intensity={2.4} />
          <directionalLight position={[55, -85, 90]} intensity={0.58} />
          {themeOrder.map((theme) => (
            <LeafMesh
              key={theme}
              theme={theme}
              active={focused && activeTheme === theme}
              hovered={hoveredTheme === theme}
              reducedMotion={reducedMotion}
            />
          ))}
        </Canvas>
  ) : <HeartwheelFallback />;
}
