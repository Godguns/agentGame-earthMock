import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "./app/router";
import { useAuthStore } from "./app/store/authStore";
import "./app/sceneLayout.css";
import "./styles/global.css";

useAuthStore.getState().restoreMe();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
