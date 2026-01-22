/**
 * GhostAISystem
 *
 * Manages ghost AI behavior, targeting, and mode transitions.
 * Implements classic Pac-Man ghost behaviors.
 */

import type { World } from '../ecs';
import type { EventBus } from '../../events';
import type { Direction, EntityId, GhostMode, GhostType } from '../../types';
import { GameEvents } from '../../types';
import { getGhostEntities, isGhostVulnerable } from '../../selectors';
import { getPlayerEntity, getPlayerPosition, getPlayerDirection } from '../../selectors';
import { GHOST_SPEED, GHOST_FRIGHTENED_SPEED, TILE_SIZE } from '../../utils/constants';
import { ORIGINAL_MAZE } from '../../data/originalMaze';

/**
 * GhostAISystem interface
 */
export interface GhostAISystem {
  /** Update ghost AI state and targeting */
  update(world: World): void;
  /** Get the current target position for a ghost */
  getGhostTarget(world: World, ghostId: EntityId): { x: number; y: number } | null;
}

/**
 * Scatter targets for each ghost type (corners of the maze)
 */
const SCATTER_TARGETS: Record<GhostType, { x: number; y: number }> = {
  blinky: { x: 25, y: 0 }, // Top-right
  pinky: { x: 2, y: 0 }, // Top-left
  inky: { x: 27, y: 30 }, // Bottom-right
  clyde: { x: 0, y: 30 }, // Bottom-left
};

/**
 * Ghost house target for eaten ghosts
 */
const GHOST_HOUSE_TARGET = { x: 13, y: 14 };

/**
 * Clyde's distance threshold (8 tiles)
 */
const CLYDE_DISTANCE_THRESHOLD = 8;

/**
 * Number of tiles Pinky targets ahead of player
 */
const PINKY_AHEAD_TILES = 4;

/**
 * Get the opposite direction
 */
function getOppositeDirection(dir: Direction | null): Direction | null {
  if (dir === null) return null;
  const opposites: Record<Direction, Direction> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  };
  return opposites[dir];
}

/**
 * Calculate squared distance between two points
 */
function distanceSquared(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

/**
 * All four directions for iteration
 */
const ALL_DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

/**
 * Check if a maze cell is walkable for ghosts
 */
function isWalkableForGhost(x: number, y: number): boolean {
  if (y < 0 || y >= ORIGINAL_MAZE.length || x < 0 || x >= ORIGINAL_MAZE[0].length) {
    return false;
  }
  const cell = ORIGINAL_MAZE[y][x];
  // Ghosts can walk on paths, tunnels, ghost house, and ghost door
  return cell.type !== 'wall';
}

/**
 * Get the next grid position in a direction
 */
function getNextGridPos(x: number, y: number, dir: Direction): { x: number; y: number } {
  switch (dir) {
    case 'up': return { x, y: y - 1 };
    case 'down': return { x, y: y + 1 };
    case 'left': return { x: x - 1, y };
    case 'right': return { x: x + 1, y };
  }
}

/**
 * Check if a position is at grid center (aligned)
 */
function isAlignedToGrid(pixelX: number, pixelY: number, threshold: number = 2): boolean {
  const cellCenterX = Math.floor(pixelX / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
  const cellCenterY = Math.floor(pixelY / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
  return Math.abs(pixelX - cellCenterX) <= threshold && Math.abs(pixelY - cellCenterY) <= threshold;
}

/**
 * Get available directions from a position (excluding the opposite of current direction)
 */
function getAvailableDirections(
  x: number,
  y: number,
  currentDir: Direction | null
): Direction[] {
  const opposite = getOppositeDirection(currentDir);
  const available: Direction[] = [];

  for (const dir of ALL_DIRECTIONS) {
    // Can't reverse direction (except in frightened mode which handles this separately)
    if (dir === opposite) continue;

    const next = getNextGridPos(x, y, dir);
    if (isWalkableForGhost(next.x, next.y)) {
      available.push(dir);
    }
  }

  return available;
}

/**
 * Choose direction toward target using classic Pac-Man ghost AI
 * Ghosts evaluate available directions and choose the one that minimizes
 * distance to target (with priority: up > left > down > right on ties)
 */
function chooseDirectionTowardTarget(
  x: number,
  y: number,
  targetX: number,
  targetY: number,
  currentDir: Direction | null
): Direction | null {
  const available = getAvailableDirections(x, y, currentDir);

  if (available.length === 0) {
    // Dead end - must reverse
    const opposite = getOppositeDirection(currentDir);
    if (opposite && isWalkableForGhost(getNextGridPos(x, y, opposite).x, getNextGridPos(x, y, opposite).y)) {
      return opposite;
    }
    return null;
  }

  if (available.length === 1) {
    return available[0];
  }

  // Choose direction that minimizes distance to target
  // Priority order on ties: up, left, down, right (classic Pac-Man)
  const priorityOrder: Direction[] = ['up', 'left', 'down', 'right'];
  let bestDir: Direction = available[0];
  let bestDist = Infinity;

  for (const dir of priorityOrder) {
    if (!available.includes(dir)) continue;

    const next = getNextGridPos(x, y, dir);
    const dist = distanceSquared(next.x, next.y, targetX, targetY);

    if (dist < bestDist) {
      bestDist = dist;
      bestDir = dir;
    }
  }

  return bestDir;
}

/**
 * Choose a random direction (for frightened mode)
 */
function chooseRandomDirection(
  x: number,
  y: number,
  currentDir: Direction | null
): Direction | null {
  const available = getAvailableDirections(x, y, currentDir);

  if (available.length === 0) {
    const opposite = getOppositeDirection(currentDir);
    return opposite;
  }

  // Random selection
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Create a GhostAISystem
 * @param eventBus - The event bus for subscribing to events
 */
export function createGhostAISystem(eventBus: EventBus): GhostAISystem {
  // Track current global mode (for non-frightened ghosts)
  let currentGlobalMode: 'chase' | 'scatter' = 'scatter';
  let modeJustChanged = false;
  let frightenedActive = false;
  const eatenGhosts = new Set<EntityId>();

  // Subscribe to mode change events
  eventBus.subscribe(GameEvents.GHOST_MODE_CHANGE, (payload) => {
    currentGlobalMode = payload.mode;
    modeJustChanged = true;
  });

  // Subscribe to power-up events
  eventBus.subscribe(GameEvents.POWER_UP_STARTED, () => {
    frightenedActive = true;
    modeJustChanged = true;
  });

  eventBus.subscribe(GameEvents.POWER_UP_ENDED, () => {
    frightenedActive = false;
    modeJustChanged = true;
  });

  // Subscribe to ghost eaten events
  eventBus.subscribe(GameEvents.GHOST_EATEN, (payload) => {
    eatenGhosts.add(payload.ghostId);
  });

  /**
   * Get target position based on ghost type and mode
   */
  const getGhostTarget = (world: World, ghostId: EntityId): { x: number; y: number } | null => {
    const ghostAI = world.entities.getComponent(ghostId, 'ghostAI');
    if (!ghostAI) return null;

    const ghostType = ghostAI.type;
    const mode = ghostAI.mode;

    // Eaten ghosts return to ghost house
    if (mode === 'eaten') {
      return GHOST_HOUSE_TARGET;
    }

    // Frightened mode doesn't have a specific target (random)
    if (mode === 'frightened' || isGhostVulnerable(world, ghostId)) {
      return null;
    }

    // Scatter mode - go to corner
    if (mode === 'scatter') {
      return SCATTER_TARGETS[ghostType];
    }

    // Chase mode - behavior depends on ghost type
    const playerId = getPlayerEntity(world);
    if (playerId === null) {
      return SCATTER_TARGETS[ghostType];
    }

    const playerPos = getPlayerPosition(world);
    if (!playerPos) {
      return SCATTER_TARGETS[ghostType];
    }

    switch (ghostType) {
      case 'blinky':
        // Directly targets player
        return { x: playerPos.gridX, y: playerPos.gridY };

      case 'pinky': {
        // Targets 4 tiles ahead of player
        const playerDir = getPlayerDirection(world);
        let targetX = playerPos.gridX;
        let targetY = playerPos.gridY;

        if (playerDir === 'up') {
          targetY -= PINKY_AHEAD_TILES;
          // Original bug: also moves left when going up
          targetX -= PINKY_AHEAD_TILES;
        } else if (playerDir === 'down') {
          targetY += PINKY_AHEAD_TILES;
        } else if (playerDir === 'left') {
          targetX -= PINKY_AHEAD_TILES;
        } else if (playerDir === 'right') {
          targetX += PINKY_AHEAD_TILES;
        }

        return { x: targetX, y: targetY };
      }

      case 'inky': {
        // Complex targeting using Blinky's position
        // For simplicity, target 2 tiles ahead of player, then double from Blinky
        const blinkyId = getGhostByTypeInternal(world, 'blinky');
        if (blinkyId === null) {
          return { x: playerPos.gridX, y: playerPos.gridY };
        }

        const blinkyPos = world.entities.getComponent(blinkyId, 'position');
        if (!blinkyPos) {
          return { x: playerPos.gridX, y: playerPos.gridY };
        }

        const playerDir = getPlayerDirection(world);
        let intermediateX = playerPos.gridX;
        let intermediateY = playerPos.gridY;

        if (playerDir === 'up') intermediateY -= 2;
        else if (playerDir === 'down') intermediateY += 2;
        else if (playerDir === 'left') intermediateX -= 2;
        else if (playerDir === 'right') intermediateX += 2;

        // Double the vector from Blinky to intermediate point
        const targetX = intermediateX + (intermediateX - blinkyPos.gridX);
        const targetY = intermediateY + (intermediateY - blinkyPos.gridY);

        return { x: targetX, y: targetY };
      }

      case 'clyde': {
        // Target player if far, scatter if close
        const ghostPos = world.entities.getComponent(ghostId, 'position');
        if (!ghostPos) {
          return SCATTER_TARGETS.clyde;
        }

        const dist = Math.sqrt(
          distanceSquared(ghostPos.gridX, ghostPos.gridY, playerPos.gridX, playerPos.gridY)
        );

        if (dist > CLYDE_DISTANCE_THRESHOLD) {
          return { x: playerPos.gridX, y: playerPos.gridY };
        } else {
          return SCATTER_TARGETS.clyde;
        }
      }

      default:
        return SCATTER_TARGETS[ghostType];
    }
  };

  /**
   * Helper to find ghost by type
   */
  function getGhostByTypeInternal(world: World, type: GhostType): EntityId | null {
    const ghostIds = getGhostEntities(world);
    for (const id of ghostIds) {
      const ghostAI = world.entities.getComponent(id, 'ghostAI');
      if (ghostAI?.type === type) {
        return id;
      }
    }
    return null;
  }

  /**
   * Update a single ghost's AI state
   */
  function updateGhost(world: World, ghostId: EntityId): void {
    const ghostAI = world.entities.getComponent(ghostId, 'ghostAI');
    const velocity = world.entities.getComponent(ghostId, 'velocity');
    const position = world.entities.getComponent(ghostId, 'position');

    if (!ghostAI || !velocity || !position) return;

    const isVulnerable = isGhostVulnerable(world, ghostId);
    const wasEaten = eatenGhosts.has(ghostId);

    // Determine current mode
    let newMode: GhostMode = ghostAI.mode;

    if (wasEaten) {
      newMode = 'eaten';
      // Check if ghost reached ghost house
      if (position.gridX >= 13 && position.gridX <= 14 && position.gridY === 14) {
        eatenGhosts.delete(ghostId);
        newMode = currentGlobalMode;
      }
    } else if (isVulnerable) {
      newMode = 'frightened';
    } else if (frightenedActive) {
      newMode = 'frightened';
    } else {
      newMode = currentGlobalMode;
    }

    // Update mode if changed
    if (newMode !== ghostAI.mode) {
      world.entities.addComponent(ghostId, 'ghostAI', {
        ...ghostAI,
        mode: newMode,
      });
    }

    // Update speed based on vulnerability
    const newSpeed = isVulnerable ? GHOST_FRIGHTENED_SPEED : GHOST_SPEED;

    // Handle direction reversal on mode change
    if (modeJustChanged && velocity.direction !== null) {
      const oppositeDir = getOppositeDirection(velocity.direction);
      world.entities.addComponent(ghostId, 'velocity', {
        ...velocity,
        speed: newSpeed,
        direction: oppositeDir,
      });
      return; // Direction is set by reversal
    }

    // Check if ghost needs to pick a direction (at intersection or initially)
    const aligned = isAlignedToGrid(position.pixelX, position.pixelY);
    const needsDirection = velocity.direction === null || aligned;

    if (needsDirection) {
      const { gridX, gridY } = position;
      const target = getGhostTarget(world, ghostId);

      let newDirection: Direction | null = null;

      if (newMode === 'frightened') {
        // Frightened ghosts move randomly
        newDirection = chooseRandomDirection(gridX, gridY, velocity.direction);
      } else if (target) {
        // Normal AI - move toward target
        newDirection = chooseDirectionTowardTarget(
          gridX,
          gridY,
          target.x,
          target.y,
          velocity.direction
        );
      } else {
        // No target (shouldn't happen) - pick any direction
        newDirection = chooseRandomDirection(gridX, gridY, velocity.direction);
      }

      // Only update if direction changed or was null
      if (newDirection !== null && newDirection !== velocity.direction) {
        world.entities.addComponent(ghostId, 'velocity', {
          ...velocity,
          speed: newSpeed,
          direction: newDirection,
        });
      } else if (velocity.speed !== newSpeed) {
        // Just update speed if direction didn't change
        world.entities.addComponent(ghostId, 'velocity', {
          ...velocity,
          speed: newSpeed,
        });
      }
    } else if (velocity.speed !== newSpeed) {
      // Not at intersection but speed needs update
      world.entities.addComponent(ghostId, 'velocity', {
        ...velocity,
        speed: newSpeed,
      });
    }
  }

  const update = (world: World): void => {
    // Only process during gameplay
    if (world.getGameState() !== 'playing') {
      return;
    }

    const ghostIds = getGhostEntities(world);

    // Update each ghost
    for (const ghostId of ghostIds) {
      updateGhost(world, ghostId);
    }

    // Reset mode change flag after processing all ghosts
    modeJustChanged = false;
  };

  return { update, getGhostTarget };
}
