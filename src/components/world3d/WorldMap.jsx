import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GRID_HALF_X, GRID_HALF_Z, WORLD_RADIUS } from "./pathfinding";

/**
 * Generate a procedural anime-style ground texture.
 * Soft colors, subtle grid, gentle variation — no harsh lines.
 */
function makeGroundTex(sceneKey) {
  const styles = {
    metro: { base: "#d5d1c8", grid: "#c8c4bb", accent: "#e0dbd2" },
    town: { base: "#d9d2c0", grid: "#cdc5b2", accent: "#e2dbca" },
    village: { base: "#c8d4b8", grid: "#bcc8a8", accent: "#d4dec4" },
  };
  const s = styles[sceneKey] || styles.metro;

  const w = 512;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  // Base fill
  ctx.fillStyle = s.base;
  ctx.fillRect(0, 0, w, h);

  // Soft noise-like patches
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 20 + 4;
    const alpha = Math.random() * 0.06;
    ctx.fillStyle = i % 2 === 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Grid lines (subtle, anime city-block feel)
  const gridSpacing = 32;
  ctx.strokeStyle = s.grid;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.35;
  for (let x = gridSpacing; x < w; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = gridSpacing; y < h; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Main cross roads (slightly more visible)
  ctx.strokeStyle = s.accent;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  // Horizontal center road
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();
  // Vertical center road
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  return tex;
}

/**
 * World map: procedural anime ground + 3D building models + dot markers.
 */
export function WorldMap({
  sceneKey,
  buildings,
  activeTargetId,
  walkingTargetId,
  onBuildingClick,
  onGroundClick,
  buildingRenderers = {},
}) {
  const groundTex = useMemo(() => makeGroundTex(sceneKey), [sceneKey]);

  const colors = useMemo(() => {
    const palettes = {
      metro: { accent: "#5a89cc", buildingHue: 0.6, roofEmissive: "#335577" },
      town: { accent: "#5aaa8a", buildingHue: 0.35, roofEmissive: "#336655" },
      village: { accent: "#6aaa58", buildingHue: 0.22, roofEmissive: "#335533" },
    };
    return palettes[sceneKey] || palettes.metro;
  }, [sceneKey]);

  return (
    <group>
      {/* Circular ground — procedural anime texture + click-to-move */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
        onClick={onGroundClick}
      >
        <circleGeometry args={[WORLD_RADIUS, 64]} />
        <meshStandardMaterial
          map={groundTex}
          roughness={0.75}
          metalness={0.01}
        />
      </mesh>

      {/* 3D Building models */}
      {buildings.map((b) => {
        const CustomRenderer = buildingRenderers[b.id];
        const height = 2.5 + (1 - (b.depth || 0)) * 1.2;
        const fw = b.footprint?.[0] || 1.2;
        const fd = b.footprint?.[1] || 1.2;
        const bodyColor = new THREE.Color().setHSL(colors.buildingHue, 0.4, 0.35);

        return (
          <group key={b.id} position={[b.worldPos[0], 0, b.worldPos[2]]}>
            {CustomRenderer ? (
              // Wrap in Suspense so GLB loading doesn't block the outer Suspense
              // (which would make the ground plane disappear during load)
              <Suspense fallback={null}>
                <CustomRenderer
                  footprint={[fw, fd]}
                  targetHeight={height}
                  accentColor={colors.accent}
                />
              </Suspense>
            ) : null}
          </group>
        );
      })}

      {/* Building interaction markers */}
      {buildings.map((b) => {
        const isActive = b.id === activeTargetId;
        const isWalkingTarget = b.id === walkingTargetId;
        const markerY = 3.0 + (1 - (b.depth || 0)) * 0.8;

        return (
          <DotMarker
            key={`dot-${b.id}`}
            worldPos={b.worldPos}
            markerY={markerY}
            accentColor={colors.accent}
            isActive={isActive}
            isWalkingTarget={isWalkingTarget}
            label={b.label}
            onClick={() => onBuildingClick(b)}
          />
        );
      })}
    </group>
  );
}

/**
 * Floating dot marker above a building.
 */
function DotMarker({
  worldPos,
  markerY,
  accentColor,
  isActive,
  isWalkingTarget,
  label,
  onClick,
}) {
  const ringRef = useRef();
  const phaseRef = useRef(Math.random() * Math.PI * 2);
  const color = useMemo(() => new THREE.Color(accentColor), [accentColor]);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 2 + phaseRef.current) * 0.15;
    const targetScale = isActive ? 1.4 : isWalkingTarget ? 1.2 : 1;
    ringRef.current.scale.setScalar(pulse * targetScale);
    ringRef.current.position.y = worldPos[1] + markerY + Math.sin(t * 1.5) * 0.12;
  });

  return (
    <group>
      {/* Invisible click target */}
      <mesh
        position={[worldPos[0], markerY, worldPos[2]]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = ""; }}
      >
        <cylinderGeometry args={[0.55, 0.55, 1.8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Glowing ring */}
      <mesh
        ref={ringRef}
        position={[worldPos[0], markerY, worldPos[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={999}
      >
        <ringGeometry args={[0.22, 0.34, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isActive ? 0.95 : 0.55}
          side={THREE.DoubleSide}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Inner dot */}
      <mesh
        position={[worldPos[0], markerY + 0.02, worldPos[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={999}
      >
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isActive ? 1 : 0.6}
          side={THREE.DoubleSide}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
