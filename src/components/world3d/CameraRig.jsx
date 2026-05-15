import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";

/**
 * 3/4 perspective camera supporting static, follow, and scroll-zoom modes.
 *
 * Static mode (default): camera stays at fixed position.
 * Follow mode: when `target` ref is provided, smoothly follows the character.
 * Scroll zoom: mouse wheel temporarily zooms in, then springs back to base FOV.
 */
export function CameraRig({
  target,
  enabled = true,
  offsetX = 8.7,
  offsetY = 8.6,
  offsetZ = 8.7,
  fov,
}) {
  const { camera, gl } = useThree();
  const lastOffset = useRef({ x: offsetX, y: offsetY, z: offsetZ });
  const baseFovRef = useRef(fov || 40);
  const zoomOffsetRef = useRef(0);

  // Sync base FOV from dev tools prop
  useEffect(() => {
    if (fov !== undefined) baseFovRef.current = fov;
  }, [fov]);

  // Scroll-wheel → temporary zoom, spring back each frame
  useEffect(() => {
    // Attach to both the canvas and window for reliable capture
    const onWheel = (e) => {
      // Only capture events over the canvas or its container
      const el = gl.domElement;
      const rect = el.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right &&
                     e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) return;

      e.preventDefault();
      // deltaY > 0 = scroll down → zoom in (reduce FOV)
      zoomOffsetRef.current -= e.deltaY * 0.05;
      zoomOffsetRef.current = Math.max(-12, Math.min(10, zoomOffsetRef.current));
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [gl]);

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
      }
    } else {
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
    }

    // Scroll zoom: always apply regardless of follow/static mode
    zoomOffsetRef.current += (0 - zoomOffsetRef.current) * Math.min(1, delta * 2.8);
    const targetFov = baseFovRef.current + zoomOffsetRef.current;
    camera.fov += (targetFov - camera.fov) * Math.min(1, delta * 10);
    camera.updateProjectionMatrix();
  });

  return null;
}
