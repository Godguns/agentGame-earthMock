import { useMemo } from "react";
import * as THREE from "three";

/**
 * Clickable marker at each building's 3D position.
 *
 * - Invisible box mesh for raycasting click detection
 * - Floating ring indicator visible in 3D
 * - Glow pillar connecting ring to building
 */
export function BuildingMarker({ worldPos, footprint = [1.2, 1.2, 2.5], isActive, isTarget, onClick }) {
  const ringGeo = useMemo(() => new THREE.TorusGeometry(0.5, 0.06, 8, 16), []);
  const pillarGeo = useMemo(() => new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), []);

  const activeColor = isActive ? 0xffffff : 0x88bbff;
  const opacity = isActive ? 0.7 : 0.35;

  const handleClick = (e) => {
    e.stopPropagation();
    onClick?.();
  };

  const handlePointerOver = () => {
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    document.body.style.cursor = "";
  };

  return (
    <group position={[worldPos[0], worldPos[1] + 1.2, worldPos[2]]}>
      {/* Invisible click target */}
      <mesh
        position={[0, 0, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        visible={false}
      >
        <boxGeometry args={footprint} />
      </mesh>

      {/* Visible ring */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        geometry={ringGeo}
        renderOrder={999}
      >
        <meshBasicMaterial
          color={activeColor}
          transparent
          opacity={opacity}
          depthTest={false}
        />
      </mesh>

      {/* Pillar connector */}
      <mesh position={[0, -0.6, 0]} geometry={pillarGeo}>
        <meshBasicMaterial
          color={activeColor}
          transparent
          opacity={opacity * 0.7}
          depthTest={false}
        />
      </mesh>
    </group>
  );
}
