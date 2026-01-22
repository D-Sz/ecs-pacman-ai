/**
 * EatingSystem
 *
 * Handles player eating pellets and power pellets.
 * Detects when player position overlaps with edible entities.
 */

import type { World } from '../ecs';
import type { EventBus } from '../../events';
import { GameEvents } from '../../types';
import { getPlayerEntity, getPlayerPosition, getAllPellets, getRemainingPelletCount } from '../../selectors';
import { TILE_SIZE } from '../../utils/constants';

/**
 * EatingSystem interface
 */
export interface EatingSystem {
  /** Check for and process pellet eating */
  update(world: World): void;
}

// Eating threshold - use same as collision so power pellets are eaten
// before ghost collision can trigger
const EATING_THRESHOLD = TILE_SIZE * 0.8;

/**
 * Create an EatingSystem
 * @param eventBus - The event bus for dispatching events
 */
export function createEatingSystem(eventBus: EventBus): EatingSystem {
  const update = (world: World): void => {
    // Only process during gameplay
    if (world.getGameState() !== 'playing') {
      return;
    }

    const playerId = getPlayerEntity(world);
    if (playerId === null) {
      return;
    }

    const playerPos = getPlayerPosition(world);
    if (!playerPos) {
      return;
    }

    const pellets = getAllPellets(world);
    const eatenPellets: number[] = [];

    // Check each pellet for collision with player using pixel distance
    // This matches the collision detection threshold so power pellets are
    // eaten before ghost collision can trigger death
    for (const pelletId of pellets) {
      const pelletPos = world.entities.getComponent(pelletId, 'position');
      if (!pelletPos) {
        continue;
      }

      // Check pixel distance (same threshold as ghost collision)
      const dx = playerPos.pixelX - pelletPos.pixelX;
      const dy = playerPos.pixelY - pelletPos.pixelY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < EATING_THRESHOLD) {
        eatenPellets.push(pelletId);
      }
    }

    // Process eaten pellets
    for (const pelletId of eatenPellets) {
      const edible = world.entities.getComponent(pelletId, 'edible');
      const powerUp = world.entities.getComponent(pelletId, 'powerUp');
      const position = world.entities.getComponent(pelletId, 'position')!;
      const points = edible?.points ?? 10;

      // Add score
      world.addScore(points);

      if (powerUp) {
        // Power pellet
        const duration = powerUp.duration;

        // Start power-up timer
        world.setPowerUpTime(duration);

        // Reset ghost eaten streak for new power-up
        world.resetGhostEatenStreak();

        // Dispatch power pellet eaten event
        eventBus.dispatch(GameEvents.POWER_PELLET_EATEN, {
          entityId: pelletId,
          position,
          points,
          duration,
        });

        // Dispatch power up started event
        eventBus.dispatch(GameEvents.POWER_UP_STARTED, {
          timeRemaining: duration,
        });
      } else {
        // Regular pellet
        eventBus.dispatch(GameEvents.PELLET_EATEN, {
          entityId: pelletId,
          position,
          points,
        });
      }

      // Destroy the pellet
      world.entities.destroyEntity(pelletId);
    }

    // Check for level complete (all pellets eaten)
    if (eatenPellets.length > 0) {
      const remaining = getRemainingPelletCount(world);
      if (remaining === 0) {
        world.setGameState('won');
        eventBus.dispatch(GameEvents.LEVEL_COMPLETE, {
          level: world.getLevel(),
          score: world.getScore(),
        });
      }
    }
  };

  return { update };
}
