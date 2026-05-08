import { Outlet, useLocation } from "react-router-dom";

import { AmbientGlowField } from "../components/atmosphere/AmbientGlowField";
import "./sceneLayout.css";

function getVariant(pathname) {
  if (pathname.startsWith("/settings")) {
    return "settings";
  }

  return "menu";
}

export function SceneLayout() {
  const location = useLocation();
  const variant = getVariant(location.pathname);

  return (
    <div className="scene-layout">
      <AmbientGlowField variant={variant} />
      <div className="scene-layout__content">
        <Outlet />
      </div>
    </div>
  );
}
