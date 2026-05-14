import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const resolveStub = path.resolve(__dirname, "src/lib/reactbits-stubs.js");

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: [
      // Paid GSAP plugins → stub
      { find: "gsap/SplitText", replacement: resolveStub },
      { find: "gsap/ScrambleTextPlugin", replacement: resolveStub },
      { find: "gsap/Observer", replacement: resolveStub },
      { find: "gsap/InertiaPlugin", replacement: resolveStub },
      // Heavy 3D / physics libs → stub (regex to match subpaths too)
      { find: "matter-js", replacement: resolveStub },
      { find: "three-stdlib", replacement: resolveStub },
      { find: /^@react-three\/fiber(\/.*)?$/, replacement: resolveStub },
      { find: /^@react-three\/drei(\/.*)?$/, replacement: resolveStub },
      { find: /^@react-three\/postprocessing(\/.*)?$/, replacement: resolveStub },
      { find: "@chakra-ui/react", replacement: resolveStub },
    ],
  },
  build: {
    emptyOutDir: false,
  },
});
