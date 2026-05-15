import { Suspense, useRef, useState, useCallback, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { WorldMap } from "./WorldMap";
import { PlayerCharacter } from "./PlayerCharacter";
import { CameraRig } from "./CameraRig";
import { DevToolsPanel } from "./DevToolsPanel";
import { DevGridOverlay, PaintLayer } from "./DevGridOverlay";
import { GLBBuilding } from "./GLBBuilding";
import { percentToWorld } from "./pathfinding";
import "./world3d.css";

/* ------------------------------------------------------------------ */
/* Default configs                                                     */
/* ------------------------------------------------------------------ */

const DEFAULT_LIGHTING = {
  ambient: { intensity: 0.9, color: "#e8ecf8" },
  sun: { intensity: 1.0, color: "#fff4e8", posX: 6, posY: 14, posZ: 4 },
  fill: { intensity: 0.5, color: "#dde4f8", posX: -2, posY: 2, posZ: 12 },
  hemisphere: { intensity: 0.55, sky: "#dde8f8", ground: "#554433" },
  point: { intensity: 0.4, color: "#fff4ee", posX: 0, posY: 3, posZ: 6 },
};

const DEFAULT_FOG = { color: "#d8dce8", near: 38, far: 80 };
const DEFAULT_EXPOSURE = 1.0;
const DEFAULT_CAM_FOV = 35;      // NIKKE风默认
const DEFAULT_CAM_DISTANCE = 16; // NIKKE风默认
const DEFAULT_CAM_PITCH = 28;    // NIKKE风默认
const CAM_YAW = 45; // degrees (fixed)

const DEFAULT_MODEL_URL =
  "/assets/avatars/Meshy_AI_Purple_Haired_Chibi_G_biped/Meshy_AI_Emerald_Blossom_biped_Animation_Walking_Woman_withSkin.glb";

function camOffset(dist, pitchDeg, yawDeg) {
  const pitch = (pitchDeg * Math.PI) / 180;
  const yaw = (yawDeg * Math.PI) / 180;
  return {
    x: dist * Math.cos(pitch) * Math.sin(yaw),
    y: dist * Math.sin(pitch),
    z: dist * Math.cos(pitch) * Math.cos(yaw),
  };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function World3DStage({
  sceneKey,
  buildings,
  activeTargetId,
  onBuildingClick,
  onGroundClick,
  onArrived,
  avatarAccent,
}) {
  const characterRef = useRef();
  const [isWalking, setIsWalking] = useState(false);
  const [targetWorldPos, setTargetWorldPos] = useState(null);

  // --- Dev tool states ---
  const [modelUrl, setModelUrl] = useState(DEFAULT_MODEL_URL);
  const [showGrid, setShowGrid] = useState(false);
  const [paintMode, setPaintMode] = useState(false);
  const [customBlocked, setCustomBlocked] = useState(() => new Set());

  const [lighting, setLighting] = useState(DEFAULT_LIGHTING);
  const [fog, setFog] = useState(DEFAULT_FOG);
  const [exposure, setExposure] = useState(DEFAULT_EXPOSURE);
  const [camFov, setCamFov] = useState(DEFAULT_CAM_FOV);
  const [camDistance, setCamDistance] = useState(DEFAULT_CAM_DISTANCE);
  const [camPitch, setCamPitch] = useState(DEFAULT_CAM_PITCH);

  const camOff = useMemo(
    () => camOffset(camDistance, camPitch, CAM_YAW),
    [camDistance, camPitch],
  );

  const buildings3D = useMemo(
    () =>
      buildings.map((b) => {
        const world = percentToWorld(b.x, b.y);
        return {
          ...b,
          worldPos: [world.x, 0, world.z],
          footprint: [1.2, 1.2],
        };
      }),
    [buildings],
  );

  // Custom building renderers — maps building.id → component
  const buildingRenderers = useMemo(() => {
    const renderers = {};
    renderers.office = (props) => (
      <GLBBuilding
        url="/assets/avatars/buildingCompany.glb"
        targetHeight={props.targetHeight}
      />
    );
    renderers.market = (props) => (
      <GLBBuilding
        url="/assets/avatars/market.glb"
        targetHeight={props.targetHeight}
      />
    );
    renderers.apartment = (props) => (
      <GLBBuilding
        url="/assets/avatars/home.glb"
        targetHeight={props.targetHeight}
      />
    );
    return renderers;
  }, []);

  const handleBuildingClick = useCallback(
    (b) => {
      const target = {
        x: b.worldPos[0],
        y: 0,
        z: b.worldPos[2] - 1.5,
      };
      setTargetWorldPos(target);
      setIsWalking(true);
      onBuildingClick(b);
    },
    [onBuildingClick],
  );

  const handleArrived = useCallback(() => {
    setIsWalking(false);
    onArrived?.();
  }, [onArrived]);

  const handleGroundClick = useCallback(
    (e) => {
      e.stopPropagation();
      const point = e.point;
      setTargetWorldPos({ x: point.x, y: 0, z: point.z });
      setIsWalking(true);
      onGroundClick?.();
    },
    [onGroundClick],
  );

  const walkingTargetId = isWalking
    ? buildings3D.find(
        (b) =>
          targetWorldPos &&
          Math.abs(b.worldPos[0] - targetWorldPos.x) < 1.5 &&
          Math.abs(b.worldPos[2] - (targetWorldPos.z + 1.5)) < 1.5,
      )?.id
    : null;

  // Paint mode — toggle a grid cell as custom-blocked
  const handleCellToggle = useCallback((col, row) => {
    const key = `${col},${row}`;
    setCustomBlocked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleClearBlocked = useCallback(() => {
    setCustomBlocked(new Set());
  }, []);

  const initialCamPos = useMemo(
    () => [camOff.x, camOff.y, camOff.z],
    [camOff],
  );

  return (
    <div className="world3d-stage">
      <Canvas
        shadows
        camera={{
          position: initialCamPos,
          fov: camFov,
          near: 0.5,
          far: 80,
        }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: exposure,
        }}
        onCreated={({ scene, camera }) => {
          scene.background = new THREE.Color("#d8dce8");
          camera.lookAt(0, 0.4, 0);
        }}
      >
        {/* Configurable Lighting */}
        <ambientLight
          intensity={lighting.ambient.intensity}
          color={lighting.ambient.color}
        />

        <directionalLight
          position={[lighting.sun.posX, lighting.sun.posY, lighting.sun.posZ]}
          intensity={lighting.sun.intensity}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={60}
          shadow-camera-left={-22}
          shadow-camera-right={22}
          shadow-camera-top={14}
          shadow-camera-bottom={-14}
          color={lighting.sun.color}
        />

        <directionalLight
          position={[lighting.fill.posX, lighting.fill.posY, lighting.fill.posZ]}
          intensity={lighting.fill.intensity}
          color={lighting.fill.color}
        />

        <hemisphereLight
          color={lighting.hemisphere.sky}
          groundColor={lighting.hemisphere.ground}
          intensity={lighting.hemisphere.intensity}
        />

        <pointLight
          position={[lighting.point.posX, lighting.point.posY, lighting.point.posZ]}
          intensity={lighting.point.intensity}
          color={lighting.point.color}
          distance={20}
          decay={2}
        />

        <fog attach="fog" args={[fog.color, fog.near, fog.far]} />

        <Suspense fallback={null}>
          <WorldMap
            sceneKey={sceneKey}
            buildings={buildings3D}
            activeTargetId={activeTargetId}
            walkingTargetId={walkingTargetId}
            onBuildingClick={handleBuildingClick}
            onGroundClick={paintMode ? undefined : handleGroundClick}
            buildingRenderers={buildingRenderers}
          />

          {/* Dev: walkable grid visualization */}
          <DevGridOverlay
            buildings={buildings3D}
            customBlocked={customBlocked}
            visible={showGrid}
          />

          {/* Dev: paint-to-block click layer */}
          <PaintLayer
            visible={paintMode}
            onCellToggle={handleCellToggle}
          />

          <PlayerCharacter
            ref={characterRef}
            modelUrl={modelUrl}
            targetWorldPos={targetWorldPos}
            isWalking={isWalking}
            buildings3D={buildings3D}
            customBlocked={customBlocked}
            onArrived={handleArrived}
            avatarAccent={avatarAccent}
          />

          {/* Target indicator: shows where the player clicked */}
          {targetWorldPos && isWalking && (
            <group position={[targetWorldPos.x, 0.05, targetWorldPos.z]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.3, 0.45, 24]} />
                <meshBasicMaterial color="#00ffcc" transparent opacity={0.8} depthWrite={false} />
              </mesh>
            </group>
          )}

          <CameraRig
            enabled={true}
            target={characterRef}
            offsetX={camOff.x}
            offsetY={camOff.y}
            offsetZ={camOff.z}
            fov={camFov}
          />
        </Suspense>
      </Canvas>

      {/* Developer Tools Panel (HTML overlay above canvas) */}
      <DevToolsPanel
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        paintMode={paintMode}
        setPaintMode={setPaintMode}
        customBlockedCount={customBlocked.size}
        onClearBlocked={handleClearBlocked}
        lighting={lighting}
        onLightingChange={setLighting}
        fog={fog}
        onFogChange={setFog}
        exposure={exposure}
        onExposureChange={setExposure}
        camFov={camFov}
        onCamFovChange={setCamFov}
        camDistance={camDistance}
        onCamDistanceChange={setCamDistance}
        camPitch={camPitch}
        onCamPitchChange={setCamPitch}
        modelUrl={modelUrl}
        onModelChange={setModelUrl}
      />
    </div>
  );
}
