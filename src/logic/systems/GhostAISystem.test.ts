/**
 * GhostAISystem Tests
 *
 * Tests for ghost AI behavior, targeting, and mode management.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createGhostAISystem, type GhostAISystem } from './GhostAISystem';
import { createWorld, type World } from '../ecs';
import { createEventBus, type EventBus } from '../../events';
import { createPacmanEntity, createGhostEntity } from '../components/entityFactories';
import { createVulnerable } from '../components';
import { GameEvents } from '../../types';
import { GHOST_SPEED, GHOST_FRIGHTENED_SPEED } from '../../utils/constants';

describe('GhostAISystem', () => {
  let world: World;
  let eventBus: EventBus;
  let ghostAISystem: GhostAISystem;

  beforeEach(() => {
    world = createWorld();
    eventBus = createEventBus();
    ghostAISystem = createGhostAISystem(eventBus);
  });

  describe('mode management', () => {
    it('should start ghosts in scatter mode', () => {
      const ghostId = createGhostEntity(world, 'blinky', 14, 11);

      const ghostAI = world.entities.getComponent(ghostId, 'ghostAI');
      expect(ghostAI?.mode).toBe('scatter');
    });

    it('should change ghost mode when mode change event dispatched', () => {
      const ghostId = createGhostEntity(world, 'blinky', 14, 11);
      world.setGameState('playing');

      // Dispatch mode change event
      eventBus.dispatch(GameEvents.GHOST_MODE_CHANGE, { mode: 'chase' });
      ghostAISystem.update(world);

      const ghostAI = world.entities.getComponent(ghostId, 'ghostAI');
      expect(ghostAI?.mode).toBe('chase');
    });

    it('should not change mode for vulnerable ghosts', () => {
      const ghostId = createGhostEntity(world, 'blinky', 14, 11);
      world.entities.addComponent(ghostId, 'vulnerable', createVulnerable(5000));
      world.setGameState('playing');

      eventBus.dispatch(GameEvents.GHOST_MODE_CHANGE, { mode: 'chase' });
      ghostAISystem.update(world);

      // Vulnerable ghosts stay in frightened mode
      const ghostAI = world.entities.getComponent(ghostId, 'ghostAI');
      expect(ghostAI?.mode).toBe('frightened');
    });

    it('should set mode to frightened when power-up starts', () => {
      const ghostId = createGhostEntity(world, 'blinky', 14, 11);
      world.setGameState('playing');

      eventBus.dispatch(GameEvents.POWER_UP_STARTED, { timeRemaining: 6000 });
      ghostAISystem.update(world);

      const ghostAI = world.entities.getComponent(ghostId, 'ghostAI');
      expect(ghostAI?.mode).toBe('frightened');
    });

    it('should restore previous mode when power-up ends', () => {
      const ghostId = createGhostEntity(world, 'blinky', 14, 11);
      world.setGameState('playing');

      // Start in chase mode
      eventBus.dispatch(GameEvents.GHOST_MODE_CHANGE, { mode: 'chase' });
      ghostAISystem.update(world);

      // Power-up makes frightened
      eventBus.dispatch(GameEvents.POWER_UP_STARTED, { timeRemaining: 6000 });
      ghostAISystem.update(world);

      // Power-up ends
      eventBus.dispatch(GameEvents.POWER_UP_ENDED, undefined);
      ghostAISystem.update(world);

      const ghostAI = world.entities.getComponent(ghostId, 'ghostAI');
      expect(ghostAI?.mode).toBe('chase');
    });
  });

  describe('ghost speed', () => {
    it('should use normal speed in chase/scatter mode', () => {
      const ghostId = createGhostEntity(world, 'blinky', 14, 11);
      world.setGameState('playing');

      ghostAISystem.update(world);

      const velocity = world.entities.getComponent(ghostId, 'velocity');
      expect(velocity?.speed).toBe(GHOST_SPEED);
    });

    it('should use frightened speed when vulnerable', () => {
      const ghostId = createGhostEntity(world, 'blinky', 14, 11);
      world.entities.addComponent(ghostId, 'vulnerable', createVulnerable(5000));
      world.setGameState('playing');

      ghostAISystem.update(world);

      const velocity = world.entities.getComponent(ghostId, 'velocity');
      expect(velocity?.speed).toBe(GHOST_FRIGHTENED_SPEED);
    });
  });

  describe('scatter mode targeting', () => {
    it('should target top-right corner for Blinky in scatter', () => {
      const ghostId = createGhostEntity(world, 'blinky', 14, 14);
      createPacmanEntity(world, 14, 23); // Player far away
      world.setGameState('playing');

      const ghostAI = world.entities.getComponent(ghostId, 'ghostAI');
      expect(ghostAI?.scatterTarget).toEqual({ x: 25, y: 0 });
    });

    it('should target top-left corner for Pinky in scatter', () => {
      const ghostId = createGhostEntity(world, 'pinky', 14, 14);
      world.setGameState('playing');

      const ghostAI = world.entities.getComponent(ghostId, 'ghostAI');
      expect(ghostAI?.scatterTarget).toEqual({ x: 2, y: 0 });
    });

    it('should target bottom-right corner for Inky in scatter', () => {
      const ghostId = createGhostEntity(world, 'inky', 14, 14);
      world.setGameState('playing');

      const ghostAI = world.entities.getComponent(ghostId, 'ghostAI');
      expect(ghostAI?.scatterTarget).toEqual({ x: 27, y: 30 });
    });

    it('should target bottom-left corner for Clyde in scatter', () => {
      const ghostId = createGhostEntity(world, 'clyde', 14, 14);
      world.setGameState('playing');

      const ghostAI = world.entities.getComponent(ghostId, 'ghostAI');
      expect(ghostAI?.scatterTarget).toEqual({ x: 0, y: 30 });
    });
  });

  describe('chase mode targeting', () => {
    it('should target player position for Blinky (chase)', () => {
      const ghostId = createGhostEntity(world, 'blinky', 10, 10);
      createPacmanEntity(world, 14, 23);
      world.setGameState('playing');

      // Set to chase mode
      eventBus.dispatch(GameEvents.GHOST_MODE_CHANGE, { mode: 'chase' });
      ghostAISystem.update(world);

      // Blinky directly targets player
      const target = ghostAISystem.getGhostTarget(world, ghostId);
      expect(target).toEqual({ x: 14, y: 23 });
    });

    it('should target ahead of player for Pinky (chase)', () => {
      const ghostId = createGhostEntity(world, 'pinky', 10, 10);
      const playerId = createPacmanEntity(world, 14, 23);

      // Set player direction
      const velocity = world.entities.getComponent(playerId, 'velocity')!;
      world.entities.addComponent(playerId, 'velocity', {
        ...velocity,
        direction: 'right',
      });

      world.setGameState('playing');
      eventBus.dispatch(GameEvents.GHOST_MODE_CHANGE, { mode: 'chase' });
      ghostAISystem.update(world);

      // Pinky targets 4 tiles ahead of player in their direction
      const target = ghostAISystem.getGhostTarget(world, ghostId);
      expect(target).toEqual({ x: 18, y: 23 });
    });

    it('should have distance-based behavior for Clyde (chase)', () => {
      const ghostId = createGhostEntity(world, 'clyde', 10, 10);
      createPacmanEntity(world, 20, 20); // Far from ghost
      world.setGameState('playing');

      eventBus.dispatch(GameEvents.GHOST_MODE_CHANGE, { mode: 'chase' });
      ghostAISystem.update(world);

      // Clyde targets player when far away (> 8 tiles)
      const target = ghostAISystem.getGhostTarget(world, ghostId);
      expect(target).toEqual({ x: 20, y: 20 });
    });

    it('should scatter when close to player for Clyde', () => {
      const ghostId = createGhostEntity(world, 'clyde', 14, 20);
      createPacmanEntity(world, 14, 23); // Close to ghost (3 tiles)
      world.setGameState('playing');

      eventBus.dispatch(GameEvents.GHOST_MODE_CHANGE, { mode: 'chase' });
      ghostAISystem.update(world);

      // Clyde goes to scatter target when close to player (< 8 tiles)
      const target = ghostAISystem.getGhostTarget(world, ghostId);
      expect(target).toEqual({ x: 0, y: 30 }); // Clyde's scatter corner
    });
  });

  describe('direction selection', () => {
    it('should not reverse direction unless mode changes', () => {
      const ghostId = createGhostEntity(world, 'blinky', 14, 14);
      createPacmanEntity(world, 14, 23);
      world.setGameState('playing');

      // Set initial direction
      const velocity = world.entities.getComponent(ghostId, 'velocity')!;
      world.entities.addComponent(ghostId, 'velocity', {
        ...velocity,
        direction: 'up',
      });

      ghostAISystem.update(world);

      // Ghost should not reverse to 'down'
      const newVelocity = world.entities.getComponent(ghostId, 'velocity');
      expect(newVelocity?.direction).not.toBe('down');
    });

    it('should reverse direction when mode changes', () => {
      const ghostId = createGhostEntity(world, 'blinky', 14, 14);
      createPacmanEntity(world, 14, 5); // Player above ghost
      world.setGameState('playing');

      // Set initial direction moving down (away from player)
      const velocity = world.entities.getComponent(ghostId, 'velocity')!;
      world.entities.addComponent(ghostId, 'velocity', {
        ...velocity,
        direction: 'down',
      });

      // Change mode from scatter to chase - should trigger direction reversal
      eventBus.dispatch(GameEvents.GHOST_MODE_CHANGE, { mode: 'chase' });
      ghostAISystem.update(world);

      const newVelocity = world.entities.getComponent(ghostId, 'velocity');
      expect(newVelocity?.direction).toBe('up');
    });
  });

  describe('eaten mode', () => {
    it('should set mode to eaten when ghost is eaten', () => {
      // Position ghost away from ghost house (14, 14) to avoid immediate respawn
      const ghostId = createGhostEntity(world, 'blinky', 20, 20);
      world.setGameState('playing');

      eventBus.dispatch(GameEvents.GHOST_EATEN, {
        ghostId,
        ghostType: 'blinky',
        points: 200,
        streak: 1,
        position: { gridX: 20, gridY: 20, pixelX: 400, pixelY: 400 },
      });
      ghostAISystem.update(world);

      const ghostAI = world.entities.getComponent(ghostId, 'ghostAI');
      expect(ghostAI?.mode).toBe('eaten');
    });

    it('should target ghost house when eaten', () => {
      const ghostId = createGhostEntity(world, 'blinky', 20, 20);
      world.setGameState('playing');

      // Mark ghost as eaten
      const ghostAI = world.entities.getComponent(ghostId, 'ghostAI')!;
      world.entities.addComponent(ghostId, 'ghostAI', {
        ...ghostAI,
        mode: 'eaten',
      });

      const target = ghostAISystem.getGhostTarget(world, ghostId);
      // Ghost house target is (13, 14)
      expect(target?.x).toBe(13);
      expect(target?.y).toBe(14);
    });
  });

  describe('game state checks', () => {
    it('should not update when game is paused', () => {
      const ghostId = createGhostEntity(world, 'blinky', 14, 14);
      createPacmanEntity(world, 14, 23);
      world.setGameState('paused');

      const initialVelocity = world.entities.getComponent(ghostId, 'velocity');
      ghostAISystem.update(world);
      const newVelocity = world.entities.getComponent(ghostId, 'velocity');

      expect(newVelocity?.direction).toBe(initialVelocity?.direction);
    });

    it('should not update when game is ready', () => {
      const ghostId = createGhostEntity(world, 'blinky', 14, 14);
      createPacmanEntity(world, 14, 23);
      world.setGameState('ready');

      ghostAISystem.update(world);

      // Direction should remain null/unchanged
      const velocity = world.entities.getComponent(ghostId, 'velocity');
      expect(velocity?.direction).toBeNull();
    });
  });

  describe('frightened mode', () => {
    it('should choose random valid direction in frightened mode', () => {
      const ghostId = createGhostEntity(world, 'blinky', 14, 14);
      world.entities.addComponent(ghostId, 'vulnerable', createVulnerable(5000));
      world.setGameState('playing');

      // Run multiple updates to verify randomness doesn't break
      for (let i = 0; i < 10; i++) {
        ghostAISystem.update(world);
        const velocity = world.entities.getComponent(ghostId, 'velocity');
        expect(['up', 'down', 'left', 'right', null]).toContain(velocity?.direction);
      }
    });
  });

  describe('event subscriptions', () => {
    it('should subscribe to mode change events', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.GHOST_MODE_CHANGE, handler);

      eventBus.dispatch(GameEvents.GHOST_MODE_CHANGE, { mode: 'chase' });

      expect(handler).toHaveBeenCalledWith({ mode: 'chase' });
    });

    it('should subscribe to power-up events', () => {
      const startHandler = vi.fn();
      const endHandler = vi.fn();
      eventBus.subscribe(GameEvents.POWER_UP_STARTED, startHandler);
      eventBus.subscribe(GameEvents.POWER_UP_ENDED, endHandler);

      eventBus.dispatch(GameEvents.POWER_UP_STARTED, { timeRemaining: 6000 });
      eventBus.dispatch(GameEvents.POWER_UP_ENDED, undefined);

      expect(startHandler).toHaveBeenCalled();
      expect(endHandler).toHaveBeenCalled();
    });
  });
});
