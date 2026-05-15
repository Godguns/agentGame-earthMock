import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    proxy: {
      "/oss": {
        target: "https://earth-1331021090.cos.ap-nanjing.myqcloud.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/oss/, ""),
      },
    },
  },
  build: {
    emptyOutDir: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("three") || id.includes("@react-three")) {
            return "vendor-three";
          }

          if (id.includes("postprocessing")) {
            return "vendor-postfx";
          }

          if (id.includes("ogl") || id.includes("gl-matrix")) {
            return "vendor-graphics";
          }

          if (id.includes("framer-motion") || id.includes("gsap")) {
            return "vendor-motion";
          }

          if (id.includes("react-router-dom")) {
            return "vendor-router";
          }

          if (id.includes("zustand")) {
            return "vendor-store";
          }

          if (id.includes("react") || id.includes("scheduler") || id.includes("react-dom")) {
            return "vendor-react";
          }

          return undefined;
        },
      },
    },
  },
});
