import React, { useRef, useEffect, useLayoutEffect, useMemo, useState, forwardRef, useImperativeHandle, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { findPath } from "./pathfinding";

/** Default character model path */
const DEFAULT_MODEL = "/assets/avatars/Meshy_AI_Purple_Haired_Chibi_G_biped/Meshy_AI_Emerald_Blossom_biped_Animation_Walking_Woman_withSkin.glb";

/**
 * Inner component — loads and renders the GLB model with animations.
 * Separated so Suspense can catch the loading state.
 */
function CharacterModel({ url, isWalking, groupRef }) {
  const { scene, animations } = useGLTF(url);
  const { actions, mixer } = useAnimations(animations, groupRef);

  // Clone + auto-fit: scale to target height, then lift so feet rest on ground (Y=0)
  // SkeletonUtils.clone properly remaps SkinnedMesh bone references after cloning,
  // avoiding the THREE.js bug where cloned meshes still point to original bones.
  const model = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene);

    // Force-update world matrices so setFromObject reads correct transforms.
    // Meshy GLB roots often carry a unit-conversion scale (e.g. cm→m 0.01).
    // Without this call the matrixWorld is stale and the bbox height comes out
    // in local/geometry units, making the auto-fit scale explode.
    cloned.updateMatrixWorld(true);

    // 1. Compute raw bounding box (world space, after all node transforms)
    const rawBox = new THREE.Box3().setFromObject(cloned);
    const rawSize = rawBox.getSize(new THREE.Vector3());
    const rawMinY = rawBox.min.y;

    // 2. Scale to target character height
    const TARGET_HEIGHT = 1.8;
    const scale = rawSize.y > 0 ? TARGET_HEIGHT / rawSize.y : 1;
    cloned.scale.setScalar(scale);

    // 3. Lift so feet sit at Y=0 (after scale, minY = rawMinY * scale)
    cloned.position.y = -(rawMinY * scale);

    // 4. Enable shadows on all meshes
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return cloned;
  }, [scene]);

  // Control animations based on walk state
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    const keys = Object.keys(actions);
    const findAction = (...patterns) => {
      for (const pat of patterns) {
        const found = keys.find((k) => k.toLowerCase().includes(pat.toLowerCase()));
        if (found) return actions[found];
      }
      return null;
    };

    const walkAction = findAction("walk", "run", "move");
    const anyAction = Object.values(actions)[0];

    if (isWalking) {
      // Unpause and fade out whatever was playing, then start walk
      Object.values(actions).forEach((a) => {
        a.paused = false;
        if (a.isRunning()) a.fadeOut(0.15);
      });
      const action = walkAction || anyAction;
      if (action) {
        action.setEffectiveTimeScale(1);
        action.reset().fadeIn(0.15).play();
      }
    } else {
      // Arrived — pause at current frame instead of snapping to T-pose
      Object.values(actions).forEach((a) => {
        a.paused = true;
      });
    }
  }, [isWalking, actions]);

  // Cleanup mixer on unmount
  useEffect(() => {
    return () => {
      mixer?.stopAllAction();
    };
  }, [mixer]);

  return <primitive object={model} />;
}

/**
 * Fallback character when GLB model is not available.
 */
function FallbackCharacter({ avatarAccent }) {
  const mesh = useMemo(() => {
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(avatarAccent),
      roughness: 0.55,
      metalness: 0.05,
    });

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.1, 12), bodyMat);
    torso.position.y = 0.75;
    torso.castShadow = true;
    group.add(torso);

    const headMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ffe4cc"),
      roughness: 0.6,
    });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), headMat);
    head.position.y = 1.45;
    head.castShadow = true;
    group.add(head);

    const legMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#3a3a4a"),
      roughness: 0.5,
    });
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.7, 8), legMat);
    leftLeg.position.set(-0.15, 0.35, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.7, 8), legMat);
    rightLeg.position.set(0.15, 0.35, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    const shadowGeo = new THREE.CircleGeometry(0.35, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    shadow.renderOrder = -1;
    group.add(shadow);

    return group;
  }, [avatarAccent]);

  return <primitive object={mesh} />;
}

/**
 * Player character in the 3D world.
 *
 * Loads GLB model with animations. Falls back to a simple capsule if loading fails.
 * Handles click-to-move with A* pathfinding.
 * Exposes the group ref to parent so the CameraRig can follow.
 */
export const PlayerCharacter = forwardRef(function PlayerCharacter({
  modelUrl = DEFAULT_MODEL,
  targetWorldPos,
  isWalking,
  buildings3D,
  customBlocked = new Set(),
  onArrived,
  onPositionChange,
  avatarAccent = "#6ab6ff",
}, forwardedRef) {
  const groupRef = useRef();

  // Expose group to parent (CameraRig)
  useImperativeHandle(forwardedRef, () => groupRef.current, []);

  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const waypoints = useRef([]);
  const waypointIndex = useRef(0);
  const arrivedRef = useRef(false);
  const walkSpeed = 4.5;
  const bobPhase = useRef(0);

  // Recalculate path when target changes.
  // useLayoutEffect (not useEffect) is critical: it runs synchronously after
  // React commits and BEFORE the next requestAnimationFrame. This ensures
  // waypoints are populated before useFrame runs, preventing the safety net
  // from calling onArrived() on the very first frame where isWalking=true.
  useLayoutEffect(() => {
    if (!targetWorldPos) return;

    const start = currentPos.current;
    const goal = { x: targetWorldPos.x, z: targetWorldPos.z };
    const path = findPath(start, goal, buildings3D, customBlocked);

    // Edge case: already at target (same grid cell), signal arrival immediately
    if (path.length === 0) {
      arrivedRef.current = false;
      onArrived?.();
      return;
    }

    // findPath does NOT include the start cell, so use the full path as-is
    waypoints.current = path;
    waypointIndex.current = 0;
    arrivedRef.current = false;
  }, [targetWorldPos, buildings3D, customBlocked]);

  // Movement per frame
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const group = groupRef.current;

    if (isWalking && waypoints.current.length > 0) {
      // Keep character firmly on the ground — skeletal walk anim handles visual bounce
      group.position.y = 0;

      const wp = waypoints.current[waypointIndex.current];
      if (wp) {
        const target = new THREE.Vector3(wp.x, 0, wp.z);
        const current = group.position.clone();
        current.y = 0;
        const dir = target.clone().sub(current);
        const dist = dir.length();

        if (dist < 0.15) {
          waypointIndex.current++;
          if (waypointIndex.current >= waypoints.current.length) {
            if (!arrivedRef.current) {
              arrivedRef.current = true;
              group.position.y = 0;
              onArrived?.();
            }
          }
        } else {
          const step = dir.normalize().multiplyScalar(walkSpeed * delta);
          if (step.length() > dist) {
            group.position.x = target.x;
            group.position.z = target.z;
          } else {
            group.position.x += step.x;
            group.position.z += step.z;
          }

          const angle = Math.atan2(dir.x, dir.z);
          group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, angle, delta * 8);
        }
      }
    } else if (isWalking && waypoints.current.length === 0) {
      // Safety net: walking state stuck with empty waypoints — force arrival
      if (!arrivedRef.current) {
        arrivedRef.current = true;
        group.position.y = 0;
        onArrived?.();
      }
    } else {
      // Idle: stay on ground — skeletal idle anim handles visual movement
      group.position.y = 0;
    }

    currentPos.current.copy(group.position);
    onPositionChange?.(group.position.clone());
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <Suspense fallback={<FallbackCharacter avatarAccent={avatarAccent} />}>
        <ErrorBoundary fallback={<FallbackCharacter avatarAccent={avatarAccent} />}>
          <CharacterModel
            key={modelUrl}
            url={modelUrl}
            isWalking={isWalking}
            groupRef={groupRef}
          />
        </ErrorBoundary>
      </Suspense>
    </group>
  );
});

/**
 * Minimal error boundary for model loading failures.
 */
function ErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) return fallback;

  return (
    <ErrorCatcher onError={() => setHasError(true)}>
      {children}
    </ErrorCatcher>
  );
}

class ErrorCatcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    this.props.onError?.(error);
  }
  render() {
    if (this.state.error) return null;
    return this.props.children;
  }
}
