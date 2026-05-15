import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";

/**
 * 3/4 perspective camera supporting both static and follow modes.
 *
 * Static mode (default): camera stays at fixed position — essential for
 * pre-rendered background images where camera movement causes drift.
 *
 * Follow mode: when `target` ref is provided, smoothly follows the
 * character's X/Z position. Use when the background is a world-space
 * ground texture that benefits from parallax.
 *
 * Camera params (offset, fov) are synchronized from dev tools.
 */
export function CameraRig({
  target,
  enabled = true,
  offsetX = 8.7,
  offsetY = 8.6,
  offsetZ = 8.7,
  fov,
}) {
  const { camera } = useThree();
  const lastOffset = useRef({ x: offsetX, y: offsetY, z: offsetZ });

  // Sync camera FOV from dev tools
  useEffect(() => {
    if (fov !== undefined) camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [camera, fov]);

  useFrame((_, delta) => {
    if (!enabled) return;

    // If following a character target, smoothly update position
    if (target) {
      const targetPos = target.current?.position;
      if (targetPos) {
        const desired = {
          x: targetPos.x + offsetX,
          y: offsetY,
          z: targetPos.z + offsetZ,
        };
        lastOffset.current = desired;
        camera.position.lerp(
          { x: desired.x, y: desired.y, z: desired.z },
          Math.min(1, delta * 3.5),
        );
        camera.lookAt(targetPos.x, 1.0, targetPos.z);
        return;
      }
    }

    // Static mode: apply offset changes from dev tools
    if (
      offsetX !== lastOffset.current.x ||
      offsetY !== lastOffset.current.y ||
      offsetZ !== lastOffset.current.z
    ) {
      lastOffset.current = { x: offsetX, y: offsetY, z: offsetZ };
      camera.position.set(offsetX, offsetY, offsetZ);
    }

    camera.lookAt(0, 0.4, 0);
  });

  return null;
}
