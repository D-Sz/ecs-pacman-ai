/**
 * InputSystem Tests
 *
 * Tests for handling player input and updating velocity direction.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createInputSystem, type InputSystem } from './InputSystem';
import { createWorld, type World } from '../ecs';
import { createEventBus, type EventBus } from '../../events';
import { createPacmanEntity } from '../components/entityFactories';
import { GameEvents } from '../../types';

describe('InputSystem', () => {
  let world: World;
  let eventBus: EventBus;
  let inputSystem: InputSystem;

  beforeEach(() => {
    world = createWorld();
    eventBus = createEventBus();
    inputSystem = createInputSystem(eventBus);
  });

  describe('direction input', () => {
    it('should set player next direction when direction event dispatched', () => {
      const playerId = createPacmanEntity(world, 14, 23);

      eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'up' });
      inputSystem.update(world);

      const velocity = world.entities.getComponent(playerId, 'velocity');
      expect(velocity?.nextDirection).toBe('up');
    });

    it('should update next direction on subsequent inputs', () => {
      const playerId = createPacmanEntity(world, 14, 23);

      eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'up' });
      inputSystem.update(world);

      eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'left' });
      inputSystem.update(world);

      const velocity = world.entities.getComponent(playerId, 'velocity');
      expect(velocity?.nextDirection).toBe('left');
    });

    it('should handle all four directions', () => {
      const playerId = createPacmanEntity(world, 14, 23);

      const directions = ['up', 'down', 'left', 'right'] as const;

      for (const direction of directions) {
        eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction });
        inputSystem.update(world);

        const velocity = world.entities.getComponent(playerId, 'velocity');
        expect(velocity?.nextDirection).toBe(direction);
      }
    });

    it('should not throw when no player exists', () => {
      eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'up' });

      expect(() => inputSystem.update(world)).not.toThrow();
    });

    it('should clear pending input after processing', () => {
      const playerId = createPacmanEntity(world, 14, 23);

      eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'up' });
      inputSystem.update(world);

      // Update again without new input
      inputSystem.update(world);

      // Next direction should still be 'up' (not cleared from velocity)
      const velocity = world.entities.getComponent(playerId, 'velocity');
      expect(velocity?.nextDirection).toBe('up');
    });
  });

  describe('game state input', () => {
    it('should start game when start event dispatched in ready state', () => {
      world.setGameState('ready');

      eventBus.dispatch(GameEvents.INPUT_START, undefined);
      inputSystem.update(world);

      expect(world.getGameState()).toBe('playing');
    });

    it('should not start game when already playing', () => {
      world.setGameState('playing');

      eventBus.dispatch(GameEvents.INPUT_START, undefined);
      inputSystem.update(world);

      expect(world.getGameState()).toBe('playing');
    });

    it('should pause game when pause event dispatched while playing', () => {
      world.setGameState('playing');

      eventBus.dispatch(GameEvents.INPUT_PAUSE, undefined);
      inputSystem.update(world);

      expect(world.getGameState()).toBe('paused');
    });

    it('should resume game when pause event dispatched while paused', () => {
      world.setGameState('paused');

      eventBus.dispatch(GameEvents.INPUT_PAUSE, undefined);
      inputSystem.update(world);

      expect(world.getGameState()).toBe('playing');
    });

    it('should not pause when game is in ready state', () => {
      world.setGameState('ready');

      eventBus.dispatch(GameEvents.INPUT_PAUSE, undefined);
      inputSystem.update(world);

      expect(world.getGameState()).toBe('ready');
    });

    it('should dispatch GAME_RESTART event when restart input received', () => {
      world.setGameState('lost');
      world.addScore(1000);

      // Track if GAME_RESTART event is dispatched
      let restartDispatched = false;
      eventBus.subscribe(GameEvents.GAME_RESTART, () => {
        restartDispatched = true;
      });

      eventBus.dispatch(GameEvents.INPUT_RESTART, undefined);
      inputSystem.update(world);

      // InputSystem dispatches GAME_RESTART, GameController handles the actual reset
      expect(restartDispatched).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe from events on destroy', () => {
      const playerId = createPacmanEntity(world, 14, 23);

      inputSystem.destroy();

      eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'up' });
      inputSystem.update(world);

      const velocity = world.entities.getComponent(playerId, 'velocity');
      expect(velocity?.nextDirection).toBeNull();
    });
  });
});
