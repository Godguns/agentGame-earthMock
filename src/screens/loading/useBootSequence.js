import { useEffect, useMemo, useRef, useState } from "react";

import { READY_MESSAGE, BOOT_MESSAGES } from "./bootMessages";
import { preloadAssets } from "../../systems/preload/preloadAssets";

const MIN_BOOT_DURATION = 5200;
const STAGE_DELAYS = {
  titleVisible: 500,
  progressVisible: 1500,
};

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

export function useBootSequence() {
  const [elapsed, setElapsed] = useState(0);
  const [resourceProgress, setResourceProgress] = useState(0.1);
  const [resourcesReady, setResourcesReady] = useState(false);
  const startTimeRef = useRef(0);

  useEffect(() => {
    let frameId = 0;
    let mounted = true;

    startTimeRef.current = performance.now();

    const tick = (now) => {
      if (!mounted) {
        return;
      }

      setElapsed(now - startTimeRef.current);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    preloadAssets((progress) => {
      if (!mounted) {
        return;
      }

      setResourceProgress(progress);
    }).finally(() => {
      if (mounted) {
        setResourcesReady(true);
        setResourceProgress(1);
      }
    });

    return () => {
      mounted = false;
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const boot = useMemo(() => {
    const normalizedTime = Math.min(elapsed / MIN_BOOT_DURATION, 1);
    const timeProgress = easeOutCubic(normalizedTime);
    const resourceWeightedProgress = Math.min(
      0.68 * resourceProgress + 0.32 * timeProgress,
      1,
    );
    const ready = elapsed >= MIN_BOOT_DURATION && resourcesReady;
    const progress = ready ? 1 : resourceWeightedProgress;
    const percent = Math.round(progress * 100);
    const titleVisible = elapsed >= STAGE_DELAYS.titleVisible;
    const progressVisible = elapsed >= STAGE_DELAYS.progressVisible;
    const phaseIndex = Math.min(
      BOOT_MESSAGES.length - 1,
      Math.floor((progress || 0) * BOOT_MESSAGES.length),
    );
    const statusText = ready ? READY_MESSAGE : BOOT_MESSAGES[phaseIndex];

    return {
      ready,
      progress,
      percent,
      statusText,
      titleVisible,
      progressVisible,
      showContinue: ready,
    };
  }, [elapsed, resourceProgress, resourcesReady]);

  return boot;
}
