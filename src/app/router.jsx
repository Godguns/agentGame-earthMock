import { Navigate, createHashRouter } from "react-router-dom";

import { GameRoute } from "../routes/GameRoute";
import { LoadingRoute } from "../routes/LoadingRoute";
import { MainMenuRoute } from "../routes/MainMenuRoute";
import { SettingsRoute } from "../routes/SettingsRoute";
import { SceneLayout } from "./SceneLayout";

export const router = createHashRouter([
  {
    path: "/",
    element: <Navigate to="/loading" replace />,
  },
  {
    path: "/loading",
    element: <LoadingRoute />,
  },
  {
    path: "/game",
    element: <GameRoute />,
  },
  {
    element: <SceneLayout />,
    children: [
      {
        path: "/menu",
        element: <MainMenuRoute />,
      },
      {
        path: "/settings",
        element: <SettingsRoute />,
      },
    ],
  },
]);
