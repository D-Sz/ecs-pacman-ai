/**
 * EatingSystem Tests
 *
 * Tests for player eating pellets and power pellets.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEatingSystem, type EatingSystem } from './EatingSystem';
import { createWorld, type World } from '../ecs';
import { createEventBus, type EventBus } from '../../events';
import { createPacmanEntity } from '../components/entityFactories';
import { createPelletEntity, createPowerPelletEntity } from '../components/entityFactories';
import { GameEvents } from '../../types';

describe('EatingSystem', () => {
  let world: World;
  let eventBus: EventBus;
  let eatingSystem: EatingSystem;

  beforeEach(() => {
    world = createWorld();
    eventBus = createEventBus();
    eatingSystem = createEatingSystem(eventBus);
  });

  describe('eating pellets', () => {
    it('should destroy pellet when player is on same position', () => {
      createPacmanEntity(world, 5, 5);
      const pelletId = createPelletEntity(world, 5, 5);

      world.setGameState('playing');
      eatingSystem.update(world);

      expect(world.entities.isAlive(pelletId)).toBe(false);
    });

    it('should add pellet points to score', () => {
      createPacmanEntity(world, 5, 5);
      createPelletEntity(world, 5, 5);

      world.setGameState('playing');
      eatingSystem.update(world);

      expect(world.getScore()).toBe(10);
    });

    it('should dispatch pellet eaten event', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.PELLET_EATEN, handler);

      createPacmanEntity(world, 5, 5);
      const pelletId = createPelletEntity(world, 5, 5);

      world.setGameState('playing');
      eatingSystem.update(world);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          entityId: pelletId,
          points: 10,
        })
      );
    });

    it('should not eat pellets in different positions', () => {
      createPacmanEntity(world, 5, 5);
      const pelletId = createPelletEntity(world, 10, 10);

      world.setGameState('playing');
      eatingSystem.update(world);

      expect(world.entities.isAlive(pelletId)).toBe(true);
      expect(world.getScore()).toBe(0);
    });

    it('should eat multiple pellets in same frame if overlapping', () => {
      createPacmanEntity(world, 5, 5);
      createPelletEntity(world, 5, 5);
      createPelletEntity(world, 5, 5);

      world.setGameState('playing');
      eatingSystem.update(world);

      expect(world.getScore()).toBe(20);
    });
  });

  describe('eating power pellets', () => {
    it('should destroy power pellet when player is on same position', () => {
      createPacmanEntity(world, 1, 3);
      const powerId = createPowerPelletEntity(world, 1, 3);

      world.setGameState('playing');
      eatingSystem.update(world);

      expect(world.entities.isAlive(powerId)).toBe(false);
    });

    it('should add power pellet points to score (50)', () => {
      createPacmanEntity(world, 1, 3);
      createPowerPelletEntity(world, 1, 3);

      world.setGameState('playing');
      eatingSystem.update(world);

      expect(world.getScore()).toBe(50);
    });

    it('should dispatch power pellet eaten event', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.POWER_PELLET_EATEN, handler);

      createPacmanEntity(world, 1, 3);
      const powerId = createPowerPelletEntity(world, 1, 3);

      world.setGameState('playing');
      eatingSystem.update(world);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          entityId: powerId,
          points: 50,
          duration: 6000,
        })
      );
    });

    it('should start power-up timer', () => {
      createPacmanEntity(world, 1, 3);
      createPowerPelletEntity(world, 1, 3);

      world.setGameState('playing');
      eatingSystem.update(world);

      expect(world.getPowerUpTimeRemaining()).toBe(6000);
    });

    it('should dispatch power up started event', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.POWER_UP_STARTED, handler);

      createPacmanEntity(world, 1, 3);
      createPowerPelletEntity(world, 1, 3);

      world.setGameState('playing');
      eatingSystem.update(world);

      expect(handler).toHaveBeenCalledWith({ timeRemaining: 6000 });
    });

    it('should reset ghost eaten streak on power pellet', () => {
      // Simulate having eaten ghosts previously
      world.incrementGhostEatenStreak();
      world.incrementGhostEatenStreak();

      createPacmanEntity(world, 1, 3);
      createPowerPelletEntity(world, 1, 3);

      world.setGameState('playing');
      eatingSystem.update(world);

      expect(world.getGhostEatenStreak()).toBe(0);
    });
  });

  describe('level complete', () => {
    it('should dispatch level complete when all pellets eaten', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.LEVEL_COMPLETE, handler);

      createPacmanEntity(world, 5, 5);
      createPelletEntity(world, 5, 5); // Last pellet

      world.setGameState('playing');
      eatingSystem.update(world);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 1,
        })
      );
    });

    it('should not complete level while pellets remain', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.LEVEL_COMPLETE, handler);

      createPacmanEntity(world, 5, 5);
      createPelletEntity(world, 5, 5); // Player eats this one
      createPelletEntity(world, 10, 10); // This one remains

      world.setGameState('playing');
      eatingSystem.update(world);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should set game state to won on level complete', () => {
      createPacmanEntity(world, 5, 5);
      createPelletEntity(world, 5, 5);

      world.setGameState('playing');
      eatingSystem.update(world);

      expect(world.getGameState()).toBe('won');
    });
  });

  describe('game state checks', () => {
    it('should not process when game is paused', () => {
      createPacmanEntity(world, 5, 5);
      const pelletId = createPelletEntity(world, 5, 5);

      world.setGameState('paused');
      eatingSystem.update(world);

      expect(world.entities.isAlive(pelletId)).toBe(true);
    });

    it('should not process when game is ready', () => {
      createPacmanEntity(world, 5, 5);
      const pelletId = createPelletEntity(world, 5, 5);

      world.setGameState('ready');
      eatingSystem.update(world);

      expect(world.entities.isAlive(pelletId)).toBe(true);
    });
  });
});
