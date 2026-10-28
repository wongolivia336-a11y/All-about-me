import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
  Box3,
  Box3Helper,
  CameraHelper,
  Group,
  Material,
  Mesh,
  Object3D,
} from "three";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper.js";
import { ROOM_BOUNDS } from "./layout";
import { sceneDebug } from "./debug";

type BoundsHelper = {
  helper: Box3Helper;
  source: Object3D;
};

type WireframeMaterial = Material & { wireframe: boolean };
const hasWireframe = (material: Material): material is WireframeMaterial =>
  "wireframe" in material;

const landmarks = [
  { label: "room origin · 0, 0, 0", position: [0, 0.05, 0] as const },
  { label: "desk · -0.5, 0.75, -1.05", position: [-0.5, 0.78, -1.05] as const },
  { label: "window", position: [ROOM_BOUNDS.left + 0.08, 1.4, 0.72] as const },
];

/**
 * Lightweight, query-driven developer overlay. It intentionally has no
 * production UI, but makes the room's scale, camera frustum, normals and
 * broad-phase bounds inspectable during geometry work.
 */
export function SceneDebug() {
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const bounds = useRef<BoundsHelper[]>([]);
  const cameraHelper = useRef<CameraHelper | null>(null);

  useEffect(() => {
    if (!sceneDebug.enabled) return;

    const helpers: BoundsHelper[] = [];
    scene.traverse((object) => {
      if (!(object instanceof Group) || !object.userData.debugBounds) return;
      const helper = new Box3Helper(new Box3().setFromObject(object), "#d7a73c");
      scene.add(helper);
      helpers.push({ helper, source: object });
    });

    const nextCameraHelper = new CameraHelper(camera);
    scene.add(nextCameraHelper);
    bounds.current = helpers;
    cameraHelper.current = nextCameraHelper;

    return () => {
      helpers.forEach(({ helper }) => {
        scene.remove(helper);
        helper.dispose();
      });
      scene.remove(nextCameraHelper);
      nextCameraHelper.dispose();
      bounds.current = [];
      cameraHelper.current = null;
    };
  }, [camera, scene]);

  useEffect(() => {
    if (!sceneDebug.wireframe) return;
    const previous = new Map<WireframeMaterial, boolean>();
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (!hasWireframe(material)) return;
        previous.set(material, Boolean(material.wireframe));
        material.wireframe = true;
        material.needsUpdate = true;
      });
    });

    return () => {
      previous.forEach((wireframe, material) => {
        material.wireframe = wireframe;
        material.needsUpdate = true;
      });
    };
  }, [scene]);

  useEffect(() => {
    if (!sceneDebug.normals) return;
    const helpers: VertexNormalsHelper[] = [];
    scene.traverse((object) => {
      if (!(object instanceof Mesh) || !object.geometry.hasAttribute("normal")) return;
      const helper = new VertexNormalsHelper(object, 0.045, 0x5ae0ff);
      scene.add(helper);
      helpers.push(helper);
    });

    return () => {
      helpers.forEach((helper) => {
        scene.remove(helper);
        helper.dispose();
      });
    };
  }, [scene]);

  useFrame(() => {
    bounds.current.forEach(({ helper, source }) => helper.box.setFromObject(source));
    cameraHelper.current?.update();
  });

  if (!sceneDebug.enabled) return null;

  return (
    <>
      <axesHelper args={[0.75]} />
      <gridHelper
        args={[
          ROOM_BOUNDS.right - ROOM_BOUNDS.left,
          10,
          "#88a3a8",
          "#50636d",
        ]}
        position={[(ROOM_BOUNDS.left + ROOM_BOUNDS.right) / 2, 0.004, 0]}
      />
      {landmarks.map((landmark) => (
        <Html
          key={landmark.label}
          position={landmark.position}
          style={{ color: "#e8fcff", font: "11px/1.2 ui-monospace, monospace", pointerEvents: "none" }}
        >
          {landmark.label}
        </Html>
      ))}
    </>
  );
}
