import { useMemo, useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildObstacleGrid, worldToGrid, CELL_SIZE, GRID_HALF_X, GRID_HALF_Z } from "./pathfinding";

/**
 * Visual overlay showing the walkable grid on the ground.
 * - Green tint: walkable
 * - Red tint: blocked (building)
 * - Orange tint: custom-blocked (dev paint)
 *
 * Performance: single plane with a generated CanvasTexture (not individual meshes).
 */
export function DevGridOverlay({ buildings, customBlocked, visible }) {
  const meshRef = useRef();

  const texture = useMemo(() => {
    const { grid, rows, cols } = buildObstacleGrid(buildings, customBlocked);

    const cellPx = 8;
    const w = cols * cellPx;
    const h = rows * cellPx;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${c},${r}`;
        const isBuildingBlocked = grid[r][c];
        const isCustomBlocked = customBlocked.has(key);

        if (isCustomBlocked) {
          ctx.fillStyle = "rgba(255,130,60,0.55)"; // orange — custom blocked
        } else if (isBuildingBlocked) {
          ctx.fillStyle = "rgba(255,60,60,0.4)"; // red — building blocked
        } else {
          ctx.fillStyle = "rgba(60,255,130,0.18)"; // green — walkable
        }

        ctx.fillRect(c * cellPx, r * cellPx, cellPx, cellPx);

        // Grid lines
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(c * cellPx, r * cellPx, cellPx, cellPx);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, [buildings, customBlocked]);

  // Regenerate texture when customBlocked changes
  useEffect(() => {
    if (!meshRef.current) return;
    const { grid, rows, cols } = buildObstacleGrid(buildings, customBlocked);
    const cellPx = 8;
    const w = cols * cellPx;
    const h = rows * cellPx;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${c},${r}`;
        const isBuildingBlocked = grid[r][c];
        const isCustomBlocked = customBlocked.has(key);

        if (isCustomBlocked) {
          ctx.fillStyle = "rgba(255,130,60,0.55)";
        } else if (isBuildingBlocked) {
          ctx.fillStyle = "rgba(255,60,60,0.4)";
        } else {
          ctx.fillStyle = "rgba(60,255,130,0.18)";
        }
        ctx.fillRect(c * cellPx, r * cellPx, cellPx, cellPx);
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(c * cellPx, r * cellPx, cellPx, cellPx);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;

    if (meshRef.current.material.map) {
      meshRef.current.material.map.dispose();
    }
    meshRef.current.material.map = tex;
    meshRef.current.material.needsUpdate = true;
  }, [buildings, customBlocked]);

  if (!visible) return null;

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.015, 0]}
      renderOrder={1}
      depthTest={true}
      depthWrite={false}
    >
      <planeGeometry args={[GRID_HALF_X * 2, GRID_HALF_Z * 2]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.85}
        depthTest={true}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * Invisible click-target layer for paint-to-block mode.
 * When active, clicking the ground (not a building marker) toggles
 * the cell under the cursor as custom-blocked.
 */
export function PaintLayer({ visible, onCellToggle }) {
  if (!visible) return null;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.012, 0]}
      onClick={(e) => {
        e.stopPropagation();
        const p = e.point;
        const cell = worldToGrid({ x: p.x, z: p.z });
        onCellToggle(cell.col, cell.row);
      }}
    >
      <planeGeometry args={[GRID_HALF_X * 2, GRID_HALF_Z * 2]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
