/**
 * PowerUpSystem
 *
 * Manages power-up timer, ghost vulnerability, and warning states.
 */

import type { World } from '../ecs';
import type { EventBus } from '../../events';
import { GameEvents } from '../../types';
import { getGhostEntities } from '../../selectors';
import { createVulnerable } from '../components';
import { POWER_WARNING_TIME } from '../../utils/constants';

/**
 * PowerUpSystem interface
 */
export interface PowerUpSystem {
  /** Update power-up timer and ghost states */
  update(world: World): void;
}

/**
 * Create a PowerUpSystem
 * @param eventBus - The event bus for dispatching events
 */
export function createPowerUpSystem(eventBus: EventBus): PowerUpSystem {
  let wasActive = false;
  let warningDispatched = false;

  const update = (world: World): void => {
    // Only process during gameplay
    if (world.getGameState() !== 'playing') {
      return;
    }

    const deltaTime = world.getDeltaTime();
    const powerUpTime = world.getPowerUpTimeRemaining();
    const isActive = powerUpTime > 0;

    // Power-up just started
    if (isActive && !wasActive) {
      // Make all ghosts vulnerable
      const ghosts = getGhostEntities(world);
      for (const ghostId of ghosts) {
        if (!world.entities.hasComponent(ghostId, 'vulnerable')) {
          world.entities.addComponent(
            ghostId,
            'vulnerable',
            createVulnerable(powerUpTime)
          );
        }
      }
      warningDispatched = false;
    }

    // Update timer
    if (isActive) {
      world.decreasePowerUpTime(deltaTime);
      const newTime = world.getPowerUpTimeRemaining();

      // Update ghost vulnerable timers
      const ghosts = getGhostEntities(world);
      const shouldFlash = newTime <= POWER_WARNING_TIME;

      for (const ghostId of ghosts) {
        const vulnerable = world.entities.getComponent(ghostId, 'vulnerable');
        if (vulnerable) {
          world.entities.addComponent(ghostId, 'vulnerable', {
            remainingTime: newTime,
            flashing: shouldFlash,
          });
        }
      }

      // Warning state
      if (shouldFlash && !warningDispatched) {
        eventBus.dispatch(GameEvents.POWER_UP_WARNING, {
          timeRemaining: newTime,
        });
        warningDispatched = true;
      }

      // Power-up ended
      if (newTime === 0) {
        // Remove vulnerability from all ghosts
        for (const ghostId of ghosts) {
          world.entities.removeComponent(ghostId, 'vulnerable');
        }

        // Reset streak
        world.resetGhostEatenStreak();

        // Dispatch ended event
        eventBus.dispatch(GameEvents.POWER_UP_ENDED, undefined);
      }
    }

    wasActive = world.getPowerUpTimeRemaining() > 0;
  };

  return { update };
}
