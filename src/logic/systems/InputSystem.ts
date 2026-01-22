/**
 * InputSystem
 *
 * Handles player input events and updates game state accordingly.
 * Listens to EventBus for input events and modifies World state.
 */

import type { World } from '../ecs';
import type { EventBus } from '../../events';
import type { Direction } from '../../types';
import { GameEvents } from '../../types';
import { getPlayerEntity } from '../../selectors';

/**
 * InputSystem interface
 */
export interface InputSystem {
  /** Process pending inputs and update world state */
  update(world: World): void;
  /** Clean up event subscriptions */
  destroy(): void;
}

/**
 * Create an InputSystem
 * @param eventBus - The event bus to listen on
 */
export function createInputSystem(eventBus: EventBus): InputSystem {
  // Pending input state
  let pendingDirection: Direction | null = null;
  let pendingStart = false;
  let pendingPause = false;
  let pendingRestart = false;

  // Subscribe to input events
  const unsubDirection = eventBus.subscribe(
    GameEvents.INPUT_DIRECTION,
    (payload) => {
      pendingDirection = payload.direction;
    }
  );

  const unsubStart = eventBus.subscribe(GameEvents.INPUT_START, () => {
    pendingStart = true;
  });

  const unsubPause = eventBus.subscribe(GameEvents.INPUT_PAUSE, () => {
    pendingPause = true;
  });

  const unsubRestart = eventBus.subscribe(GameEvents.INPUT_RESTART, () => {
    pendingRestart = true;
  });

  const update = (world: World): void => {
    // Handle restart - just set flag, let GameController handle full reinit
    if (pendingRestart) {
      // Signal that we want to restart by setting a special state
      // GameController will handle the actual restart
      pendingRestart = false;
      pendingStart = false;
      pendingPause = false;
      pendingDirection = null;
      // Dispatch restart requested event for GameController to handle
      eventBus.dispatch(GameEvents.GAME_RESTART, undefined);
      return;
    }

    // Handle start
    if (pendingStart) {
      if (world.getGameState() === 'ready') {
        world.setGameState('playing');
      }
      pendingStart = false;
    }

    // Handle pause/resume
    if (pendingPause) {
      const gameState = world.getGameState();
      if (gameState === 'playing') {
        world.setGameState('paused');
      } else if (gameState === 'paused') {
        world.setGameState('playing');
      }
      pendingPause = false;
    }

    // Handle direction input
    if (pendingDirection !== null) {
      const playerId = getPlayerEntity(world);

      if (playerId !== null) {
        const velocity = world.entities.getComponent(playerId, 'velocity');
        if (velocity) {
          world.entities.addComponent(playerId, 'velocity', {
            ...velocity,
            nextDirection: pendingDirection,
          });
        }
      }

      pendingDirection = null;
    }
  };

  const destroy = (): void => {
    unsubDirection();
    unsubStart();
    unsubPause();
    unsubRestart();
  };

  return {
    update,
    destroy,
  };
}
