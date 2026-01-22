/**
 * Component Factory Functions
 *
 * Helper functions for creating components with sensible defaults.
 */

import type {
  Position,
  Velocity,
  GhostAI,
  GhostType,
  GhostMode,
  Direction,
  Edible,
  Collider,
  Vulnerable,
  Respawnable,
  PlayerControlled,
  PowerUp,
} from '../../types';
import { TILE_SIZE } from '../../utils/constants';

/**
 * Ghost scatter targets (corner positions they retreat to)
 */
const SCATTER_TARGETS: Record<GhostType, { x: number; y: number }> = {
  blinky: { x: 25, y: 0 },   // Top-right
  pinky: { x: 2, y: 0 },     // Top-left
  inky: { x: 27, y: 30 },    // Bottom-right
  clyde: { x: 0, y: 30 },    // Bottom-left
};

/**
 * Create a Position component
 * @param gridX - Grid X coordinate
 * @param gridY - Grid Y coordinate
 * @param pixelX - Optional pixel X coordinate (calculated from grid if not provided)
 * @param pixelY - Optional pixel Y coordinate (calculated from grid if not provided)
 */
export function createPosition(
  gridX: number,
  gridY: number,
  pixelX?: number,
  pixelY?: number
): Position {
  return {
    gridX,
    gridY,
    pixelX: pixelX ?? gridX * TILE_SIZE + TILE_SIZE / 2,
    pixelY: pixelY ?? gridY * TILE_SIZE + TILE_SIZE / 2,
  };
}

/**
 * Create a Velocity component
 * @param direction - Current movement direction
 * @param speed - Movement speed
 * @param nextDirection - Queued direction for next turn
 */
export function createVelocity(
  direction: Direction | null = null,
  speed: number = 0,
  nextDirection: Direction | null = null
): Velocity {
  return {
    direction,
    speed,
    nextDirection,
  };
}

/**
 * Create a GhostAI component
 * @param type - Ghost type (blinky, pinky, inky, clyde)
 * @param mode - Initial behavior mode
 */
export function createGhostAI(
  type: GhostType,
  mode: GhostMode = 'scatter'
): GhostAI {
  return {
    type,
    mode,
    scatterTarget: SCATTER_TARGETS[type],
  };
}

/**
 * Create an Edible component
 * @param points - Points awarded when eaten (default: 10 for pellet)
 */
export function createEdible(points: number = 10): Edible {
  return { points };
}

/**
 * Create a Collider component
 * @param width - Collider width (default: TILE_SIZE)
 * @param height - Collider height (default: TILE_SIZE)
 */
export function createCollider(
  width: number = TILE_SIZE,
  height: number = TILE_SIZE
): Collider {
  return { width, height };
}

/**
 * Create a Vulnerable component (for frightened ghosts)
 * @param remainingTime - Time remaining in vulnerable state
 * @param flashing - Whether ghost is flashing (near end of vulnerability)
 */
export function createVulnerable(
  remainingTime: number,
  flashing: boolean = false
): Vulnerable {
  return { remainingTime, flashing };
}

/**
 * Create a Respawnable component
 * @param spawnX - X coordinate to respawn at
 * @param spawnY - Y coordinate to respawn at
 * @param delay - Delay before respawning (default: 3000ms)
 */
export function createRespawnable(
  spawnX: number,
  spawnY: number,
  delay: number = 3000
): Respawnable {
  return {
    spawnX,
    spawnY,
    delay,
    timer: 0,
  };
}

/**
 * Create a PlayerControlled marker component
 */
export function createPlayerControlled(): PlayerControlled {
  return { _tag: 'playerControlled' };
}

/**
 * Create a PowerUp component
 * @param duration - Duration of the power-up effect in ms (default: 6000)
 */
export function createPowerUp(duration: number = 6000): PowerUp {
  return { duration };
}
