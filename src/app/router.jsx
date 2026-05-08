import { Navigate, createBrowserRouter } from "react-router-dom";

import { LoadingRoute } from "../routes/LoadingRoute";
import { MainMenuRoute } from "../routes/MainMenuRoute";
import { SettingsRoute } from "../routes/SettingsRoute";
import { SceneLayout } from "./SceneLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/loading" replace />,
  },
  {
    path: "/loading",
    element: <LoadingRoute />,
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
