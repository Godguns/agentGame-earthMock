import * as THREE from "three";

/**
 * Generates a placeholder pre-rendered scene background image.
 * Simulates what a Meshy AI render would look like from our 3/4 camera
 * (45° yaw, 35° pitch, FOV 42, camera at ~8.7/8.6/8.7 from target).
 *
 * Replace this entire function with a loaded PNG/JPG from Meshy later.
 */

const CANVAS_W = 1920;
const CANVAS_H = 1080;

const PALETTES = {
  metro: {
    skyTop: "#0a0e1a",
    skyBot: "#1a2a44",
    groundFar: "#1a2840",
    groundNear: "#243858",
    buildingFace: "#3a5070",
    buildingSide: "#2a3a50",
    buildingRoof: "#4a6080",
    accent: "#5a89cc",
    window: "rgba(90,137,204,0.5)",
  },
  town: {
    skyTop: "#0a0e14",
    skyBot: "#1a2e28",
    groundFar: "#1a2e22",
    groundNear: "#264830",
    buildingFace: "#3a6040",
    buildingSide: "#2a4830",
    buildingRoof: "#4a7050",
    accent: "#5aaa8a",
    window: "rgba(90,170,138,0.5)",
  },
  village: {
    skyTop: "#0a0e10",
    skyBot: "#1e2e1c",
    groundFar: "#1e2e16",
    groundNear: "#2a4020",
    buildingFace: "#4a6830",
    buildingSide: "#385020",
    buildingRoof: "#5a7840",
    accent: "#6aaa58",
    window: "rgba(106,170,88,0.5)",
  },
};

/**
 * Project a 3D world point (on ground Y=0) to 2D screen pixels,
 * matching our game camera parameters.
 *
 * Camera at (targetX + 8.7, 8.6, targetZ + 8.7)
 * Looking at (targetX, 1.0, targetZ)
 * FOV 42°, pitch 35°, yaw 45°
 *
 * For the background image, target is (0, 0, 0).
 * Camera pos = (8.7, 8.6, 8.7), lookAt = (0, 1.0, 0).
 */
function worldToScreen(wx, wz, wy = 0) {
  // Camera position (for background render, camera at fixed position)
  const camX = 8.7;
  const camY = 8.6;
  const camZ = 8.7;

  // Translate world point relative to camera
  const dx = wx - camX;
  const dy = wy - camY;
  const dz = wz - camZ;

  // Camera look direction (toward origin, slightly above ground)
  // lookAt target is (0, 1.0, 0), so forward = target - camera
  const fx = 0 - camX;
  const fy = 1.0 - camY;
  const fz = 0 - camZ;
  const flen = Math.sqrt(fx * fx + fy * fy + fz * fz);
  const fnx = fx / flen;
  const fny = fy / flen;
  const fnz = fz / flen;

  // Right vector = forward × worldUp (0,1,0)
  const rtx = fnz; // cross product with (0,1,0) simplified
  const rty = 0;
  const rtz = -fnx;
  const rtlen = Math.sqrt(rtx * rtx + rtz * rtz);
  const rnx = rtx / rtlen;
  const rnz = rtz / rtlen;

  // Up vector = right × forward
  const ux = rnz * fny;
  const uy = rnz * fnx - rnx * fnz;
  const uz = -rnx * fny;

  // Project point into view space
  const vx = dx * rnx + dz * rnz;
  const vy = dx * ux + dy * uy + dz * uz;
  const vz = dx * fnx + dy * fny + dz * fnz;

  if (vz <= 0) return null; // behind camera

  // Perspective projection
  const fovRad = (42 * Math.PI) / 180;
  const aspect = CANVAS_W / CANVAS_H;
  const halfH = Math.tan(fovRad / 2);

  const sx = (vx / vz) / (halfH * aspect);
  const sy = (vy / vz) / halfH;

  // NDC → pixel
  const px = (sx * 0.5 + 0.5) * CANVAS_W;
  const py = (-sy * 0.5 + 0.5) * CANVAS_H;

  return { x: px, y: py, depth: vz };
}

export function generateBackgroundTexture(sceneKey, buildings = []) {
  const p = PALETTES[sceneKey] || PALETTES.metro;
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  skyGrad.addColorStop(0, p.skyTop);
  skyGrad.addColorStop(0.45, p.skyBot);
  skyGrad.addColorStop(0.55, p.groundFar);
  skyGrad.addColorStop(1, p.groundNear);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Horizon line
  const origin = worldToScreen(0, 0);
  const horizonY = origin ? origin.y : CANVAS_H * 0.48;
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(CANVAS_W, horizonY);
  ctx.stroke();

  // Ground grid (perspective-correct grid lines)
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let x = -12; x <= 12; x += 1) {
    const a = worldToScreen(x, -6);
    const b = worldToScreen(x, 6);
    if (a && b) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
  for (let z = -6; z <= 6; z += 1) {
    const a = worldToScreen(-12, z);
    const b = worldToScreen(12, z);
    if (a && b) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  // Buildings — sort far to near
  const sorted = [...buildings].sort((a, b) => {
    const pa = worldToScreen(a.worldPos[0], a.worldPos[2]);
    const pb = worldToScreen(b.worldPos[0], b.worldPos[2]);
    return (pa?.y ?? 0) - (pb?.y ?? 0);
  });

  for (const b of sorted) {
    const bx = b.worldPos[0];
    const bz = b.worldPos[2];
    const fw = (b.footprint?.[0] || 1.2) * 0.7;
    const fd = (b.footprint?.[1] || 1.2) * 0.7;
    const height = 2.5 + (1 - (b.depth || 0)) * 1.2;

    // Project corners
    const base = worldToScreen(bx, bz);
    const top = worldToScreen(bx, bz, height);
    if (!base || !top) continue;

    // Approximate building width/height in screen pixels
    const bl = worldToScreen(bx - fw / 2, bz);
    const br = worldToScreen(bx + fw / 2, bz);
    const tl = worldToScreen(bx - fw / 2, bz, height);
    const tr = worldToScreen(bx + fw / 2, bz, height);

    if (!bl || !br || !tl || !tr) continue;

    const screenW = Math.abs(br.x - bl.x) || 80;
    const screenH = Math.abs(base.y - top.y) || 100;
    const left = top.x;
    const roofTop = top.y;

    // Front face
    const faceGrad = ctx.createLinearGradient(left, 0, left + screenW, 0);
    faceGrad.addColorStop(0, p.buildingSide);
    faceGrad.addColorStop(0.4, p.buildingFace);
    faceGrad.addColorStop(1, p.buildingSide);
    ctx.fillStyle = faceGrad;
    ctx.fillRect(left, roofTop, screenW, screenH);

    // Windows — simple grid pattern
    ctx.fillStyle = p.window;
    const winCols = Math.max(1, Math.floor(screenW / 22));
    const winRows = Math.max(2, Math.floor(screenH / 28));
    const winW = screenW / (winCols + 1);
    const winH = screenH / (winRows + 1);
    for (let r = 0; r < winRows; r++) {
      for (let c = 0; c < winCols; c++) {
        if ((r + c) % 3 === 0) {
          ctx.globalAlpha = 0.6;
        } else {
          ctx.globalAlpha = 0.25;
        }
        const wx = left + (c + 1) * winW - winW * 0.35;
        const wy = roofTop + (r + 1) * winH - winH * 0.35;
        ctx.fillRect(wx, wy, winW * 0.7, winH * 0.5);
      }
    }
    ctx.globalAlpha = 1;

    // Roof — subtle trapezoid (wider at front for 3/4 feel)
    ctx.fillStyle = p.buildingRoof;
    ctx.beginPath();
    ctx.moveTo(left - 4, roofTop);
    ctx.lineTo(left + screenW + 4, roofTop);
    ctx.lineTo(left + screenW, roofTop - 6);
    ctx.lineTo(left, roofTop - 6);
    ctx.closePath();
    ctx.fill();

    // Building outline
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5;
    ctx.strokeRect(left, roofTop, screenW, screenH);
    ctx.globalAlpha = 1;

    // Ground shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(base.x, base.y + screenH * 0.05, screenW * 0.5, screenH * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Vignette
  const vig = ctx.createRadialGradient(
    CANVAS_W / 2, CANVAS_H / 2, CANVAS_W * 0.35,
    CANVAS_W / 2, CANVAS_H / 2, CANVAS_W * 0.72,
  );
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  return texture;
}
