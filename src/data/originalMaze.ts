/**
 * Original Pac-Man Maze Data
 *
 * 28x31 grid based on the classic arcade game layout.
 * Reference: Original Pac-Man arcade (1980)
 *
 * Cell types:
 * - 'wall': Blue walls
 * - 'path': Walkable paths (where pellets can be placed)
 * - 'tunnel': Side tunnels for wrap-around movement
 * - 'ghost-house': Ghost spawn area
 * - 'ghost-door': Entrance to ghost house
 */

import type { MazeCellData } from '../ui/components/MazeLayout';

// Original Pac-Man arcade maze (28x31)
// 0 = path (pellet location)
// 1 = wall
// 2 = ghost house interior
// 3 = power pellet location (treated as path)
// 4 = empty path (no pellet) / tunnel edges
// 5 = ghost door
const ORIGINAL_MAZE_NUMERIC = [
  // Row 0 - top wall
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // Row 1
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  // Row 2
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  // Row 3 - power pellets top corners
  [1, 3, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 3, 1],
  // Row 4
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  // Row 5
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  // Row 6
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  // Row 7
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  // Row 8
  [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
  // Row 9
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
  // Row 10
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
  // Row 11
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
  // Row 12 - ghost house top with door
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 5, 5, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
  // Row 13 - ghost house
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
  // Row 14 - tunnel row + ghost house center
  [4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4],
  // Row 15 - ghost house
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
  // Row 16 - ghost house bottom
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
  // Row 17
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
  // Row 18
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
  // Row 19
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  // Row 20
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  // Row 21
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  // Row 22 - power pellets bottom corners
  [1, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 3, 1],
  // Row 23
  [1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1],
  // Row 24
  [1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1],
  // Row 25
  [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
  // Row 26
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  // Row 27
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  // Row 28
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  // Row 29
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // Row 30 - bottom wall
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

/**
 * Converts numeric maze value to MazeCellData type
 */
function convertCell(value: number, x: number, y: number): MazeCellData {
  // Tunnel detection: row 14, edge columns
  const isTunnelRow = y === 14;
  const isTunnelColumn = x <= 5 || x >= 22;

  switch (value) {
  case 1:
    return { type: 'wall' };
  case 2:
    return { type: 'ghost-house' };
  case 5:
    return { type: 'ghost-door' };
  case 0:
  case 3:
    return { type: 'path' };
  case 4:
    // Tunnels only on the sides of row 14
    if (isTunnelRow && isTunnelColumn) {
      return { type: 'tunnel' };
    }
    // Otherwise it's just an empty path (no pellet)
    return { type: 'path' };
  default:
    return { type: 'path' };
  }
}

/**
 * Original Pac-Man maze layout as MazeCellData
 */
export const ORIGINAL_MAZE: MazeCellData[][] = ORIGINAL_MAZE_NUMERIC.map((row, y) =>
  row.map((cell, x) => convertCell(cell, x, y))
);

/**
 * Maze dimensions
 */
export const MAZE_WIDTH = 28;
export const MAZE_HEIGHT = 31;

/**
 * Power pellet positions (x, y coordinates)
 */
export const POWER_PELLET_POSITIONS = [
  { x: 1, y: 3 },   // Top-left
  { x: 26, y: 3 },  // Top-right
  { x: 1, y: 22 },  // Bottom-left
  { x: 26, y: 22 }, // Bottom-right
];

/**
 * Pacman starting position
 */
export const PACMAN_START = { x: 14, y: 22 };

/**
 * Ghost starting positions (inside ghost house)
 */
export const GHOST_START_POSITIONS = {
  blinky: { x: 14, y: 11 }, // Red - starts outside ghost house
  pinky: { x: 14, y: 14 },  // Pink - center of ghost house
  inky: { x: 12, y: 14 },   // Cyan - left side
  clyde: { x: 16, y: 14 },  // Orange - right side
};

/**
 * Ghost house door position
 */
export const GHOST_DOOR_POSITION = { x: 13, y: 12 };

/**
 * Calculate pellet positions from the numeric maze data
 * Value 0 indicates a pellet position (excluding power pellet positions)
 */
export const PELLET_POSITIONS: { x: number; y: number }[] = (() => {
  const positions: { x: number; y: number }[] = [];
  const powerPelletSet = new Set(
    POWER_PELLET_POSITIONS.map((p) => `${p.x},${p.y}`)
  );

  ORIGINAL_MAZE_NUMERIC.forEach((row, y) => {
    row.forEach((cell, x) => {
      // Cell value 0 means regular pellet
      if (cell === 0 && !powerPelletSet.has(`${x},${y}`)) {
        positions.push({ x, y });
      }
    });
  });

  return positions;
})();
