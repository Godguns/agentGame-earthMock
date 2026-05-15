import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import "./sceneLoadingOverlay.css";

const MIN_LOAD_MS = 3000;

const STATUS_STEPS = [
  "init_engine",
  "load_scene",
  "build_geometry",
  "bind_textures",
  "link_shaders",
  "run_step",
  "ready",
];

export function SceneLoadingOverlay({ onReady }) {
  const { progress, active, item } = useProgress();
  const startTimeRef = useRef(Date.now());
  const calledRef = useRef(false);

  const [displayProgress, setDisplayProgress] = useState(0);
  const [statusText, setStatusText] = useState(STATUS_STEPS[0]);

  /* Animate progress bar forward every ~80ms */
  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const timePct = Math.min((elapsed / MIN_LOAD_MS) * 100, 100);
      /* blend: take the max of time-based and real; cap at 99 until actually done */
      const blended = progress >= 100 ? Math.max(timePct, progress) : Math.min(Math.max(timePct, progress), 99);
      setDisplayProgress(blended);

      /* Status text cycles based on elapsed time */
      const idx = Math.min(Math.floor(elapsed / 450), STATUS_STEPS.length - 1);
      setStatusText(item ? item.split("/").pop().split(".")[0] : STATUS_STEPS[idx]);
    }, 80);
    return () => clearInterval(id);
  }, [progress, item]);

  /* Fire onReady when: min 3s elapsed + real loading done (or nothing to load) */
  useEffect(() => {
    if (calledRef.current) return;
    const loadDone = !active && (progress >= 100 || progress === 0);
    if (!loadDone) return;

    const elapsed = Date.now() - startTimeRef.current;
    const remaining = MIN_LOAD_MS - elapsed;

    if (remaining <= 0) {
      calledRef.current = true;
      setDisplayProgress(100);
      setTimeout(onReady, 280);
    } else {
      const t = setTimeout(() => {
        if (calledRef.current) return;
        calledRef.current = true;
        setDisplayProgress(100);
        setTimeout(onReady, 280);
      }, remaining);
      return () => clearTimeout(t);
    }
  }, [progress, active, onReady]);

  /* Safety fallback: after MIN_LOAD_MS + 5s force-proceed regardless */
  useEffect(() => {
    const t = setTimeout(() => {
      if (calledRef.current) return;
      calledRef.current = true;
      setDisplayProgress(100);
      setTimeout(onReady, 280);
    }, MIN_LOAD_MS + 5000);
    return () => clearTimeout(t);
  }, [onReady]);

  return (
    <div className="scene-loading">
      <div className="scene-loading__inner">
        <h1 className="scene-loading__title">Connecting to Sekai...</h1>
        <div className="scene-loading__bar-wrap">
          <div
            className="scene-loading__bar-fill"
            style={{ width: `${displayProgress}%` }}
          />
          <span className="scene-loading__bar-pct">{Math.round(displayProgress)}%</span>
        </div>
        <p className="scene-loading__status">Loading: {statusText}</p>
      </div>
    </div>
  );
}
