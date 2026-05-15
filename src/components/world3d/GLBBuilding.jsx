import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * Loads a GLB model as a building replacement.
 *
 * Auto-fits: scales the model to roughly match the target building height,
 * then lifts so the base sits on the ground (Y=0).
 */
export function GLBBuilding({ url, targetHeight = 3.0 }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => {
    const cloned = scene.clone(true);

    // Force-update world matrices so setFromObject reads correct transforms
    // (GLB root nodes may carry unit-conversion scale that needs propagating)
    cloned.updateMatrixWorld(true);

    // Compute bounding box
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());

    // Scale to target height
    const scale = size.y > 0 ? targetHeight / size.y : 1;
    cloned.scale.setScalar(scale);

    // Lift so base is at Y=0
    cloned.position.y = -(box.min.y * scale);

    // Enable shadows
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return cloned;
  }, [scene, targetHeight]);

  return <primitive object={model} />;
}
