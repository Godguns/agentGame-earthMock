import { Navigate, createHashRouter } from "react-router-dom";

import { GameRoute } from "../routes/GameRoute";
import { InternalUsersRoute } from "../routes/InternalUsersRoute";
import { LoadingRoute } from "../routes/LoadingRoute";
import { MainMenuRoute } from "../routes/MainMenuRoute";
import { SettingsRoute } from "../routes/SettingsRoute";
import { AvatarSetupRoute } from "../routes/AvatarSetupRoute";
import { WorldFieldRoute } from "../routes/WorldFieldRoute";
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
      {
        path: "/avatar/setup",
        element: <AvatarSetupRoute />,
      },
      {
        path: "/world/field",
        element: <WorldFieldRoute />,
      },
      {
        path: "/internal/users",
        element: <InternalUsersRoute />,
      },
    ],
  },
]);
