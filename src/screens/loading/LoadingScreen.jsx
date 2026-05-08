import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ParticleField } from "../../components/atmosphere/ParticleField";
import { ScanlineOverlay } from "../../components/atmosphere/ScanlineOverlay";
import { StatusLED } from "../../components/atmosphere/StatusLED";
import { ContinuePrompt } from "../../components/ui/ContinuePrompt";
import { ThinProgressBar } from "../../components/ui/ThinProgressBar";
import { useAppStore } from "../../app/store/appStore";
import { useBootSequence } from "./useBootSequence";
import "./loading.css";

export function LoadingScreen() {
  const navigate = useNavigate();
  const setLastBootCompletedAt = useAppStore(
    (state) => state.setLastBootCompletedAt,
  );
  const boot = useBootSequence();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!boot.ready) {
      return undefined;
    }

    setLastBootCompletedAt(new Date().toISOString());
    return undefined;
  }, [boot.ready, setLastBootCompletedAt]);

  useEffect(() => {
    if (!boot.showContinue) {
      return undefined;
    }

    const handleContinue = () => {
      setIsExiting(true);
      window.setTimeout(() => {
        navigate("/menu");
      }, 900);
    };

    window.addEventListener("click", handleContinue);
    window.addEventListener("keydown", handleContinue);
    window.addEventListener("touchstart", handleContinue, { passive: true });

    return () => {
      window.removeEventListener("click", handleContinue);
      window.removeEventListener("keydown", handleContinue);
      window.removeEventListener("touchstart", handleContinue);
    };
  }, [boot.showContinue, navigate]);

  return (
    <main className={`loading-screen ${isExiting ? "is-exiting" : ""}`}>
      <ParticleField />
      <ScanlineOverlay />

      <div className="loading-screen__vignette" />

      <StatusLED />

      <section className="loading-screen__content">
        <header
          className={`loading-screen__header ${
            boot.titleVisible ? "is-visible" : ""
          }`}
        >
          <p className="loading-screen__eyebrow">EARTH ONLINE</p>
          <h1 className="loading-screen__title">地球Online</h1>
          <div className="loading-screen__title-rule" />
          <p className="loading-screen__subtitle">
            // LIFE SIMULATION ENGINE v1.0
          </p>
        </header>

        <section
          className={`loading-screen__progress ${
            boot.progressVisible ? "is-visible" : ""
          } ${boot.ready ? "is-ready" : ""}`}
        >
          {!boot.ready ? (
            <ThinProgressBar progress={boot.progress} percent={boot.percent} />
          ) : null}

          <p className="loading-screen__status" aria-live="polite">
            {boot.statusText}
          </p>

          <ContinuePrompt visible={boot.showContinue} />
        </section>
      </section>

      <p className="loading-screen__footer">
        请闭上眼睛，回忆你昨天做了什么。
      </p>
    </main>
  );
}
