import { Outlet, useLocation } from "react-router-dom";

import { AmbientGlowField } from "../components/atmosphere/AmbientGlowField";
import "./sceneLayout.css";

function getVariant(pathname) {
  if (pathname.startsWith("/settings")) {
    return "settings";
  }

  if (pathname.startsWith("/internal")) {
    return "settings";
  }

  return "menu";
}

export function SceneLayout() {
  const location = useLocation();
  const variant = getVariant(location.pathname);

  return (
    <div className={`scene-layout scene-layout--${variant}`}>
      <AmbientGlowField variant={variant} />
      <div className="scene-layout__wash" aria-hidden="true" />
      <div className="scene-layout__content">
        <Outlet />
      </div>
    </div>
  );
}
