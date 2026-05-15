/**
 * A* grid-based pathfinding for 2.5D side-scrolling map.
 *
 * Grid is projected onto the XZ plane (Y is up).
 * Obstacles are registered as blocked cells from building footprints.
 */

const CELL_SIZE = 0.5;
const GRID_HALF_X = 20; // total width 40 units
const GRID_HALF_Z = 20; // total depth 40 units
const WORLD_RADIUS = 20; // circular ground radius

function worldToGrid(worldPos) {
  const col = Math.round((worldPos.x + GRID_HALF_X) / CELL_SIZE);
  const row = Math.round((worldPos.z + GRID_HALF_Z) / CELL_SIZE);
  return { col, row };
}

function gridToWorld(col, row) {
  return {
    x: col * CELL_SIZE - GRID_HALF_X,
    z: row * CELL_SIZE - GRID_HALF_Z,
  };
}

function buildObstacleGrid(buildings, customBlocked = new Set()) {
  const cols = Math.ceil((GRID_HALF_X * 2) / CELL_SIZE);
  const rows = Math.ceil((GRID_HALF_Z * 2) / CELL_SIZE);
  const grid = Array.from({ length: rows }, () => Array(cols).fill(false));

  for (const b of buildings) {
    const center = worldToGrid({ x: b.worldPos[0], z: b.worldPos[2] });
    const halfW = Math.ceil((b.footprint?.[0] || 1.2) / CELL_SIZE / 2);
    const halfD = Math.ceil((b.footprint?.[1] || 1.2) / CELL_SIZE / 2);
    for (let r = center.row - halfD; r <= center.row + halfD; r++) {
      for (let c = center.col - halfW; c <= center.col + halfW; c++) {
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
          grid[r][c] = true;
        }
      }
    }
  }

  // Apply custom blocked cells (from dev tools)
  for (const key of customBlocked) {
    const [c, r] = key.split(",").map(Number);
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      grid[r][c] = true;
    }
  }

  return { grid, rows, cols };
}

// Manhattan + cross-cost heuristic
function heuristic(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

function getNeighbors(cell, rows, cols) {
  const dirs = [
    { col: 0, row: -1 },
    { col: 0, row: 1 },
    { col: -1, row: 0 },
    { col: 1, row: 0 },
    { col: -1, row: -1 },
    { col: 1, row: -1 },
    { col: -1, row: 1 },
    { col: 1, row: 1 },
  ];
  const neighbors = [];
  for (const d of dirs) {
    const nc = cell.col + d.col;
    const nr = cell.row + d.row;
    if (nc >= 0 && nc < cols && nr >= 0 && nr < rows) {
      const cost = d.col !== 0 && d.row !== 0 ? 1.414 : 1;
      neighbors.push({ col: nc, row: nr, cost });
    }
  }
  return neighbors;
}

function key(cell) {
  return `${cell.col},${cell.row}`;
}

/**
 * Find path from start to goal on the XZ plane.
 *
 * @param {object} start - { x, z } world position
 * @param {object} goal  - { x, z } world position
 * @param {Array}  buildings - array of { worldPos: [x,y,z], footprint: [w,d] }
 * @returns {Array<{x, z}>} waypoints in world space
 */
export function findPath(start, goal, buildings = [], customBlocked = new Set()) {
  const { grid, rows, cols } = buildObstacleGrid(buildings, customBlocked);

  const startCell = worldToGrid(start);
  const goalCell = worldToGrid(goal);

  // Clamp goal to grid bounds
  const clampedGoal = {
    col: Math.max(0, Math.min(cols - 1, goalCell.col)),
    row: Math.max(0, Math.min(rows - 1, goalCell.row)),
  };

  // If goal is inside obstacle, find nearest walkable neighbor
  let actualGoal = clampedGoal;
  if (grid[clampedGoal.row]?.[clampedGoal.col]) {
    const dirs = [
      { col: 0, row: -1 }, { col: 0, row: 1 },
      { col: -1, row: 0 }, { col: 1, row: 0 },
      { col: -1, row: -1 }, { col: 1, row: -1 },
      { col: -1, row: 1 }, { col: 1, row: 1 },
    ];
    for (const d of dirs) {
      const nc = clampedGoal.col + d.col;
      const nr = clampedGoal.row + d.row;
      if (nc >= 0 && nc < cols && nr >= 0 && nr < rows && !grid[nr][nc]) {
        actualGoal = { col: nc, row: nr };
        break;
      }
    }
  }

  // If start is blocked (shouldn't happen), clamp
  let actualStart = startCell;
  if (grid[startCell.row]?.[startCell.col]) {
    actualStart = actualGoal; // fallback, won't move
  }

  const openSet = new Map();
  const closedSet = new Set();
  const gScore = new Map();
  const cameFrom = new Map();

  const startKey = key(actualStart);
  gScore.set(startKey, 0);
  openSet.set(startKey, {
    ...actualStart,
    f: heuristic(actualStart, actualGoal),
  });

  let found = false;
  const goalKey = key(actualGoal);

  while (openSet.size > 0) {
    // Find node with lowest f score
    let currentKey = null;
    let currentF = Infinity;
    for (const [k, node] of openSet) {
      if (node.f < currentF) {
        currentF = node.f;
        currentKey = k;
      }
    }

    if (currentKey === goalKey) {
      found = true;
      break;
    }

    const current = openSet.get(currentKey);
    openSet.delete(currentKey);
    closedSet.add(currentKey);

    const currentG = gScore.get(currentKey) || 0;

    for (const neighbor of getNeighbors(current, rows, cols)) {
      const nKey = key(neighbor);
      if (closedSet.has(nKey)) continue;
      if (grid[neighbor.row]?.[neighbor.col]) continue; // blocked

      const tentativeG = currentG + neighbor.cost;
      const existingG = gScore.get(nKey);

      if (existingG === undefined || tentativeG < existingG) {
        gScore.set(nKey, tentativeG);
        cameFrom.set(nKey, currentKey);
        openSet.set(nKey, {
          col: neighbor.col,
          row: neighbor.row,
          f: tentativeG + heuristic(neighbor, actualGoal),
        });
      }
    }
  }

  // Reconstruct path
  if (!found) {
    // No path found, return direct line
    return [gridToWorld(actualGoal.col, actualGoal.row)];
  }

  const pathCells = [];
  let current = goalKey;
  while (current && current !== startKey) {
    const [c, r] = current.split(",").map(Number);
    pathCells.unshift({ col: c, row: r });
    current = cameFrom.get(current);
  }

  // Simplify path (remove redundant collinear waypoints)
  const waypoints = pathCells.map((cell) => gridToWorld(cell.col, cell.row));
  return simplifyPath(waypoints);
}

function simplifyPath(waypoints) {
  if (waypoints.length <= 2) return waypoints;

  const result = [waypoints[0]];
  for (let i = 1; i < waypoints.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = waypoints[i];
    const next = waypoints[i + 1];

    // Check if curr is collinear with prev and next
    const dx1 = curr.x - prev.x;
    const dz1 = curr.z - prev.z;
    const dx2 = next.x - curr.x;
    const dz2 = next.z - curr.z;

    // Cross product to check collinearity
    const cross = dx1 * dz2 - dz1 * dx2;
    if (Math.abs(cross) > 0.01) {
      result.push(curr);
    }
  }
  result.push(waypoints[waypoints.length - 1]);
  return result;
}

/**
 * Get 3D world position for a building from percentage coordinates.
 * percentageX: 0-100 maps to X range
 * percentageY: 0-100 maps to Z range
 */
export function percentToWorld(percentX, percentY) {
  return {
    x: (percentX / 100) * (GRID_HALF_X * 2) - GRID_HALF_X,
    z: (percentY / 100) * (GRID_HALF_Z * 2) - GRID_HALF_Z,
  };
}

export { GRID_HALF_X, GRID_HALF_Z, WORLD_RADIUS, CELL_SIZE, worldToGrid, gridToWorld, buildObstacleGrid };
