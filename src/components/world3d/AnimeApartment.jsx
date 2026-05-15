import { useMemo } from "react";
import * as THREE from "three";

/**
 * Code-built anime-style apartment building.
 *
 * Design: 4-story Japanese apartment with pastel walls, framed windows,
 * balconies, and a tiled roof. Matches the soft, cel-shaded look of
 * anime / gacha game backgrounds (e.g. Blue Archive, Brown Dust).
 *
 * Props:
 *  accentColor — used for roof trim and window frames
 *  footprint   — [width, depth] in world units
 */

const STORY_HEIGHT = 0.75;
const FLOORS = 4;

export function AnimeApartment({ accentColor = "#7aaccc", footprint = [1.4, 1.4] }) {
  const [fw, fd] = footprint;
  const bw = fw * 0.8; // body width
  const bd = fd * 0.8; // body depth
  const totalH = FLOORS * STORY_HEIGHT;

  const matWall = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#f5ede0"), // warm cream
        roughness: 0.65,
        metalness: 0.02,
      }),
    [],
  );
  const matRoof = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#5a6e7a"), // muted blue-grey
        roughness: 0.45,
        metalness: 0.1,
      }),
    [],
  );
  const matTrim = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(accentColor),
        roughness: 0.4,
        metalness: 0.12,
        emissive: new THREE.Color(accentColor),
        emissiveIntensity: 0.06,
      }),
    [accentColor],
  );
  const matWindow = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#d4e8f0"), // light blue glass
        roughness: 0.3,
        metalness: 0.2,
        emissive: new THREE.Color("#b8d8f0"),
        emissiveIntensity: 0.18,
      }),
    [],
  );
  const matBalcony = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#e8ddd0"), // slightly darker cream
        roughness: 0.6,
        metalness: 0.04,
      }),
    [],
  );
  const matEntrance = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#4a3a2a"), // dark wood
        roughness: 0.5,
        metalness: 0.05,
      }),
    [],
  );
  const matRailing = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#c8c0b4"),
        roughness: 0.45,
        metalness: 0.3,
      }),
    [],
  );

  const building = useMemo(() => {
    const root = new THREE.Group();

    // ---- Main body ----
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(bw, totalH, bd),
      matWall,
    );
    body.position.y = totalH / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    root.add(body);

    // ---- Roof ----
    const roofH = 0.35;
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(bw + 0.2, roofH, bd + 0.2),
      matRoof,
    );
    roof.position.y = totalH + roofH / 2;
    roof.castShadow = true;
    roof.receiveShadow = true;
    root.add(roof);

    // Roof ridge
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(bw + 0.1, 0.08, 0.25),
      matTrim,
    );
    ridge.position.y = totalH + roofH + 0.04;
    root.add(ridge);

    // ---- Per-floor detail ----
    for (let f = 0; f < FLOORS; f++) {
      const floorY = f * STORY_HEIGHT + STORY_HEIGHT / 2;

      // Floor separator line
      const separator = new THREE.Mesh(
        new THREE.BoxGeometry(bw + 0.02, 0.04, bd + 0.02),
        matTrim,
      );
      separator.position.y = f * STORY_HEIGHT;
      root.add(separator);

      // Windows on front face (Z+)
      const winW = 0.18;
      const winH = 0.28;
      const winCount = Math.max(2, Math.floor((bw - 0.3) / (winW + 0.12)));
      const winSpan = (winCount - 1) * (winW + 0.12);
      const startX = -winSpan / 2;

      for (let w = 0; w < winCount; w++) {
        const wx = startX + w * (winW + 0.12);

        // Window glass
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(winW, winH, 0.02),
          matWindow,
        );
        win.position.set(wx, floorY, bd / 2 + 0.02);
        root.add(win);

        // Window frame
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(winW + 0.04, winH + 0.04, 0.025),
          matTrim,
        );
        frame.position.set(wx, floorY, bd / 2 + 0.015);
        root.add(frame);

        // Windows on back face (Z-)
        const winBack = new THREE.Mesh(
          new THREE.BoxGeometry(winW, winH, 0.02),
          matWindow,
        );
        winBack.position.set(wx, floorY, -bd / 2 - 0.02);
        root.add(winBack);
        const frameBack = new THREE.Mesh(
          new THREE.BoxGeometry(winW + 0.04, winH + 0.04, 0.025),
          matTrim,
        );
        frameBack.position.set(wx, floorY, -bd / 2 - 0.015);
        root.add(frameBack);
      }

      // Side windows (X faces)
      const sideWinCount = Math.max(1, Math.floor((bd - 0.3) / (winW + 0.12)));
      const sideWinSpan = (sideWinCount - 1) * (winW + 0.12);
      const startZ = -sideWinSpan / 2;

      for (let w = 0; w < sideWinCount; w++) {
        const wz = startZ + w * (winW + 0.12);

        // Right side
        const winR = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, winH, winW),
          matWindow,
        );
        winR.position.set(bw / 2 + 0.02, floorY, wz);
        root.add(winR);

        // Left side
        const winL = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, winH, winW),
          matWindow,
        );
        winL.position.set(-bw / 2 - 0.02, floorY, wz);
        root.add(winL);
      }

      // Balcony on front (floors 1-3)
      if (f >= 1 && f < FLOORS - 1) {
        const balconyW = bw * 0.7;
        const balconyD = 0.22;
        const balcony = new THREE.Mesh(
          new THREE.BoxGeometry(balconyW, 0.06, balconyD),
          matBalcony,
        );
        balcony.position.set(0, floorY - winH / 2 - 0.1, bd / 2 + balconyD / 2);
        balcony.castShadow = true;
        root.add(balcony);

        // Balcony railing
        const railH = 0.2;
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(balconyW, railH, 0.03),
          matRailing,
        );
        rail.position.set(0, floorY - winH / 2 + railH / 2 - 0.04, bd / 2 + balconyD - 0.02);
        root.add(rail);

        // Railing side posts
        for (const side of [-1, 1]) {
          const post = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, railH, balconyD),
            matRailing,
          );
          post.position.set(
            (side * balconyW) / 2,
            floorY - winH / 2 + railH / 2 - 0.04,
            bd / 2 + balconyD / 2,
          );
          root.add(post);
        }
      }
    }

    // ---- Entrance (ground floor) ----
    const doorW = 0.3;
    const doorH = 0.5;
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, doorH, 0.04),
      matEntrance,
    );
    door.position.set(0, doorH / 2, bd / 2 + 0.03);
    root.add(door);

    // Door frame
    const doorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(doorW + 0.06, doorH + 0.06, 0.05),
      matTrim,
    );
    doorFrame.position.set(0, doorH / 2, bd / 2 + 0.025);
    root.add(doorFrame);

    // Small awning over entrance
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(doorW + 0.2, 0.04, 0.18),
      matTrim,
    );
    awning.position.set(0, doorH + 0.08, bd / 2 + 0.08);
    root.add(awning);

    // ---- Side door / utility box ----
    const utilBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.2, 0.1),
      matEntrance,
    );
    utilBox.position.set(bw / 2 - 0.1, 0.15, -bd / 2 - 0.05);
    root.add(utilBox);

    // AC units on some balconies
    const acGeo = new THREE.BoxGeometry(0.12, 0.16, 0.08);
    const acMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d8d4ce"),
      roughness: 0.4,
      metalness: 0.25,
    });
    for (const f of [1, 2]) {
      const acY = f * STORY_HEIGHT + STORY_HEIGHT / 2 - 0.1;
      for (const side of [-1, 1]) {
        if (Math.random() > 0.4) continue;
        const ac = new THREE.Mesh(acGeo, acMat);
        ac.position.set(side * (bw / 2 - 0.08), acY, bd / 2 + 0.1);
        ac.castShadow = true;
        root.add(ac);
      }
    }

    return root;
  }, [bw, bd, totalH, matWall, matRoof, matTrim, matWindow, matBalcony, matEntrance, matRailing]);

  return <primitive object={building} />;
}
