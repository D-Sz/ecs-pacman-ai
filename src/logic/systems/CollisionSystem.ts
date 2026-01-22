/**
 * CollisionSystem
 *
 * Handles collision detection between player and ghosts.
 * Determines outcomes based on ghost vulnerability state.
 */

import type { World } from '../ecs';
import type { EventBus } from '../../events';
import type { EntityId } from '../../types';
import { GameEvents } from '../../types';
import { getPlayerEntity } from '../../selectors';
import { getGhostEntities, getGhostType, isGhostVulnerable, getGhostMode } from '../../selectors';
import { TILE_SIZE } from '../../utils/constants';

/**
 * CollisionSystem interface
 */
export interface CollisionSystem {
  /** Check and handle collisions */
  update(world: World): void;
}

// Collision threshold in pixels
const COLLISION_THRESHOLD = TILE_SIZE * 0.8;

// Points for eating ghosts (doubles each time)
const GHOST_POINTS = [200, 400, 800, 1600];

/**
 * Check if two entities are colliding based on pixel distance
 */
function areColliding(
  world: World,
  entity1: EntityId,
  entity2: EntityId
): boolean {
  const pos1 = world.entities.getComponent(entity1, 'position');
  const pos2 = world.entities.getComponent(entity2, 'position');

  if (!pos1 || !pos2) {
    return false;
  }

  const dx = pos1.pixelX - pos2.pixelX;
  const dy = pos1.pixelY - pos2.pixelY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < COLLISION_THRESHOLD;
}

/**
 * Create a CollisionSystem
 * @param eventBus - The event bus for dispatching events
 */
export function createCollisionSystem(eventBus: EventBus): CollisionSystem {
  const update = (world: World): void => {
    // Only process during gameplay
    if (world.getGameState() !== 'playing') {
      return;
    }

    const playerId = getPlayerEntity(world);
    if (playerId === null) {
      return;
    }

    const ghostIds = getGhostEntities(world);
    const collidingGhosts: EntityId[] = [];

    // Find all ghosts colliding with player (skip eaten ghosts)
    for (const ghostId of ghostIds) {
      const mode = getGhostMode(world, ghostId);
      // Skip ghosts that are already eaten (returning to ghost house)
      if (mode === 'eaten') {
        continue;
      }
      if (areColliding(world, playerId, ghostId)) {
        collidingGhosts.push(ghostId);
      }
    }

    // Process collisions
    for (const ghostId of collidingGhosts) {
      const vulnerable = isGhostVulnerable(world, ghostId);

      if (vulnerable) {
        // Player eats ghost
        world.incrementGhostEatenStreak();
        const streak = world.getGhostEatenStreak();
        const points = GHOST_POINTS[Math.min(streak - 1, GHOST_POINTS.length - 1)];
        const ghostType = getGhostType(world, ghostId) || 'blinky';

        world.addScore(points);

        // Remove vulnerable component and set ghost to 'eaten' mode
        world.entities.removeComponent(ghostId, 'vulnerable');

        // Set ghost to 'eaten' mode so it won't collide with player
        const ghostAI = world.entities.getComponent(ghostId, 'ghostAI');
        if (ghostAI) {
          world.entities.addComponent(ghostId, 'ghostAI', {
            ...ghostAI,
            mode: 'eaten',
          });
        }

        // Dispatch ghost eaten event
        const ghostPos = world.entities.getComponent(ghostId, 'position')!;
        eventBus.dispatch(GameEvents.GHOST_EATEN, {
          ghostId,
          ghostType,
          points,
          streak,
          position: ghostPos,
        });
      } else {
        // Ghost kills player
        world.loseLife();
        const livesRemaining = world.getLives();

        // Dispatch player died event
        eventBus.dispatch(GameEvents.PLAYER_DIED, {
          livesRemaining,
        });

        // Check for game over
        if (livesRemaining === 0) {
          world.setGameState('lost');
          eventBus.dispatch(GameEvents.GAME_OVER, {
            finalScore: world.getScore(),
            level: world.getLevel(),
          });
        }

        // Stop processing more collisions after death
        break;
      }
    }
  };

  return { update };
}
