/**
 * MovementSystem
 *
 * Handles entity movement, collision with walls, direction changes,
 * and tunnel wrap-around.
 */

import type { World } from '../ecs';
import type { Direction } from '../../types';
import type { MazeCellData } from '../../ui/components/MazeLayout';
import { TILE_SIZE, MAZE_WIDTH } from '../../utils/constants';

/**
 * MovementSystem interface
 */
export interface MovementSystem {
  /** Update all entity positions based on velocity */
  update(world: World): void;
}

// Tunnel row (middle of maze)
const TUNNEL_ROW = 14;

/**
 * Check if a cell is walkable (not a wall)
 * @param maze - The maze data
 * @param gridX - X coordinate
 * @param gridY - Y coordinate
 * @param isPlayer - Whether this is the player (Pacman can't enter ghost house)
 */
function isWalkable(maze: MazeCellData[][], gridX: number, gridY: number, isPlayer: boolean = false): boolean {
  // Out of bounds check
  if (gridY < 0 || gridY >= maze.length) {
    return false;
  }
  if (gridX < 0 || gridX >= maze[0].length) {
    // Allow walking off edges for tunnel
    return gridY === TUNNEL_ROW;
  }

  const cell = maze[gridY][gridX];

  // Walls are never walkable
  if (cell.type === 'wall') {
    return false;
  }

  // Pacman cannot enter ghost house or ghost door
  if (isPlayer && (cell.type === 'ghost-house' || cell.type === 'ghost-door')) {
    return false;
  }

  return true;
}

/**
 * Get the next grid position in a direction
 */
function getNextGridPos(
  gridX: number,
  gridY: number,
  direction: Direction
): { x: number; y: number } {
  switch (direction) {
  case 'up':
    return { x: gridX, y: gridY - 1 };
  case 'down':
    return { x: gridX, y: gridY + 1 };
  case 'left':
    return { x: gridX - 1, y: gridY };
  case 'right':
    return { x: gridX + 1, y: gridY };
  }
}

/**
 * Check if position is aligned to grid center (within threshold)
 * Using larger threshold (TILE_SIZE/4 = 5px) to allow easier turns at junctions
 */
function isAlignedToGrid(pixelX: number, pixelY: number, threshold: number = TILE_SIZE / 4): boolean {
  const cellCenterX = Math.floor(pixelX / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
  const cellCenterY = Math.floor(pixelY / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;

  return (
    Math.abs(pixelX - cellCenterX) <= threshold &&
    Math.abs(pixelY - cellCenterY) <= threshold
  );
}

/**
 * Create a MovementSystem
 * @param maze - The maze data for collision detection
 */
export function createMovementSystem(maze: MazeCellData[][]): MovementSystem {
  const update = (world: World): void => {
    // Only process during gameplay
    if (world.getGameState() !== 'playing') {
      return;
    }

    const deltaTime = world.getDeltaTime();
    if (deltaTime === 0) return;

    // Get all entities with position and velocity
    const entities = world.entities.getEntitiesWithComponents(['position', 'velocity']);

    for (const entityId of entities) {
      const position = world.entities.getComponent(entityId, 'position')!;
      const velocity = world.entities.getComponent(entityId, 'velocity')!;

      // Check if this entity is the player (Pacman can't enter ghost house)
      const isPlayer = world.entities.hasComponent(entityId, 'playerControlled');

      // Skip if no direction
      if (velocity.direction === null && velocity.nextDirection === null) {
        continue;
      }

      let { pixelX, pixelY } = position;
      let currentDirection = velocity.direction;
      let nextDirection = velocity.nextDirection;

      // Always calculate grid position from current pixel position for accuracy
      let gridX = Math.floor(pixelX / TILE_SIZE);
      let gridY = Math.floor(pixelY / TILE_SIZE);

      // Check if we can apply the next direction
      if (nextDirection !== null) {
        // Check if this is a 180-degree turn (can always reverse direction)
        const isReverse = (
          (currentDirection === 'left' && nextDirection === 'right') ||
          (currentDirection === 'right' && nextDirection === 'left') ||
          (currentDirection === 'up' && nextDirection === 'down') ||
          (currentDirection === 'down' && nextDirection === 'up')
        );

        if (isReverse) {
          // Allow immediate reversal without grid alignment
          currentDirection = nextDirection;
          nextDirection = null;
        } else if (isAlignedToGrid(pixelX, pixelY)) {
          // For turns, require grid alignment
          const nextPos = getNextGridPos(gridX, gridY, nextDirection);
          if (isWalkable(maze, nextPos.x, nextPos.y, isPlayer)) {
            // Apply the direction change
            currentDirection = nextDirection;
            nextDirection = null;

            // Snap to grid center for clean turn
            pixelX = gridX * TILE_SIZE + TILE_SIZE / 2;
            pixelY = gridY * TILE_SIZE + TILE_SIZE / 2;
          }
        }
      }

      // Move in current direction
      if (currentDirection !== null) {
        const speed = velocity.speed * (deltaTime / 16.67); // Normalize to 60fps

        let newPixelX = pixelX;
        let newPixelY = pixelY;

        switch (currentDirection) {
        case 'up':
          newPixelY -= speed;
          break;
        case 'down':
          newPixelY += speed;
          break;
        case 'left':
          newPixelX -= speed;
          break;
        case 'right':
          newPixelX += speed;
          break;
        }

        // Handle tunnel wrap-around
        if (gridY === TUNNEL_ROW) {
          if (newPixelX < 0) {
            newPixelX = MAZE_WIDTH * TILE_SIZE + newPixelX;
          } else if (newPixelX >= MAZE_WIDTH * TILE_SIZE) {
            newPixelX = newPixelX - MAZE_WIDTH * TILE_SIZE;
          }
        }

        // Check wall collision - check the cell we're entering
        let canMove = true;

        // For each direction, check if the leading edge would enter a wall
        if (currentDirection === 'right') {
          // Check if right edge would enter a wall cell
          const edgeX = Math.floor((newPixelX + TILE_SIZE / 2 - 1) / TILE_SIZE);
          if (!isWalkable(maze, edgeX, gridY, isPlayer)) {
            canMove = false;
            // Stop at wall edge (right edge of current cell)
            pixelX = (gridX + 1) * TILE_SIZE - TILE_SIZE / 2;
          }
        } else if (currentDirection === 'left') {
          // Check if left edge would enter a wall cell
          const edgeX = Math.floor((newPixelX - TILE_SIZE / 2) / TILE_SIZE);
          if (!isWalkable(maze, edgeX, gridY, isPlayer)) {
            canMove = false;
            // Stop at wall edge (left edge of current cell)
            pixelX = gridX * TILE_SIZE + TILE_SIZE / 2;
          }
        } else if (currentDirection === 'down') {
          // Check if bottom edge would enter a wall cell
          const edgeY = Math.floor((newPixelY + TILE_SIZE / 2 - 1) / TILE_SIZE);
          if (!isWalkable(maze, gridX, edgeY, isPlayer)) {
            canMove = false;
            // Stop at wall edge (bottom edge of current cell)
            pixelY = (gridY + 1) * TILE_SIZE - TILE_SIZE / 2;
          }
        } else if (currentDirection === 'up') {
          // Check if top edge would enter a wall cell
          const edgeY = Math.floor((newPixelY - TILE_SIZE / 2) / TILE_SIZE);
          if (!isWalkable(maze, gridX, edgeY, isPlayer)) {
            canMove = false;
            // Stop at wall edge (top edge of current cell)
            pixelY = gridY * TILE_SIZE + TILE_SIZE / 2;
          }
        }

        if (canMove) {
          pixelX = newPixelX;
          pixelY = newPixelY;
          gridX = Math.floor(pixelX / TILE_SIZE);
          gridY = Math.floor(pixelY / TILE_SIZE);

          // Clamp grid to valid range
          gridX = Math.max(0, Math.min(MAZE_WIDTH - 1, gridX));
          gridY = Math.max(0, Math.min(maze.length - 1, gridY));
        }
      }

      // Update position
      world.entities.addComponent(entityId, 'position', {
        gridX,
        gridY,
        pixelX,
        pixelY,
      });

      // Update velocity with potentially new direction
      world.entities.addComponent(entityId, 'velocity', {
        ...velocity,
        direction: currentDirection,
        nextDirection,
      });
    }
  };

  return { update };
}
