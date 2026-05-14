import { Outlet, useLocation } from "react-router-dom";

import PixelBlast from "../components/backgrounds/PixelBlast";
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
      <div className="scene-layout__particles" aria-hidden="true">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#B497CF"
          patternScale={2}
          patternDensity={1}
          pixelSizeJitter={0}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid={false}
          speed={0.5}
          edgeFade={0.25}
          transparent
        />
      </div>
      <div className="scene-layout__wash" aria-hidden="true" />
      <div className="scene-layout__content">
        <Outlet />
      </div>
    </div>
  );
}
