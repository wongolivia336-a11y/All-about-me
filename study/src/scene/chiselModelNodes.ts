import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Mesh, type Material, type Object3D } from "three";

export const FOUR_HEARTS_ROOM_MODEL = "/models/four-hearts-room.glb";

export function cloneChiselMaterials(root: Object3D) {
  root.traverse((object) => {
    if (object instanceof Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
      object.material = Array.isArray(object.material)
        ? object.material.map((material) => material.clone())
        : object.material.clone();
    }
  });
  return root;
}

export function eachChiselMaterial(root: Object3D, visit: (material: Material) => void) {
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach(visit);
  });
}

/** Clone one named GLB root so React can add local artwork and interaction. */
export function useChiselModelNode(
  name: string,
  localTransform = true,
  excludePrefixes: readonly string[] = [],
) {
  const { scene } = useGLTF(FOUR_HEARTS_ROOM_MODEL);
  const excluded = excludePrefixes.join("\u0000");

  const node = useMemo(() => {
    const source = scene.getObjectByName(name);
    if (!source) throw new Error(`Chisel room model is missing ${name}`);

    const clone = cloneChiselMaterials(source.clone(true));
    if (excluded) {
      const prefixes = excluded.split("\u0000");
      const removed: Object3D[] = [];
      clone.traverse((object) => {
        if (prefixes.some((prefix) => object.name.startsWith(prefix))) removed.push(object);
      });
      removed.forEach((object) => object.parent?.remove(object));
    }
    if (localTransform) {
      clone.position.set(0, 0, 0);
      clone.quaternion.identity();
      clone.scale.set(1, 1, 1);
    }
    return clone;
  }, [excluded, localTransform, name, scene]);

  useEffect(() => () => {
    eachChiselMaterial(node, (material) => material.dispose());
  }, [node]);

  return node;
}
