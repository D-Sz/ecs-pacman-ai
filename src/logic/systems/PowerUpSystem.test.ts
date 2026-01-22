/**
 * PowerUpSystem Tests
 *
 * Tests for power-up timer management and ghost vulnerability.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPowerUpSystem, type PowerUpSystem } from './PowerUpSystem';
import { createWorld, type World } from '../ecs';
import { createEventBus, type EventBus } from '../../events';
import { createGhostEntity } from '../components/entityFactories';
import { createVulnerable } from '../components';
import { GameEvents } from '../../types';
import { POWER_WARNING_TIME } from '../../utils/constants';

describe('PowerUpSystem', () => {
  let world: World;
  let eventBus: EventBus;
  let powerUpSystem: PowerUpSystem;

  beforeEach(() => {
    world = createWorld();
    eventBus = createEventBus();
    powerUpSystem = createPowerUpSystem(eventBus);
  });

  describe('timer countdown', () => {
    it('should decrease power-up time by delta time', () => {
      world.setPowerUpTime(5000);
      world.setDeltaTime(100);
      world.setGameState('playing');

      powerUpSystem.update(world);

      expect(world.getPowerUpTimeRemaining()).toBe(4900);
    });

    it('should not go below zero', () => {
      world.setPowerUpTime(50);
      world.setDeltaTime(100);
      world.setGameState('playing');

      powerUpSystem.update(world);

      expect(world.getPowerUpTimeRemaining()).toBe(0);
    });

    it('should not count down when game is paused', () => {
      world.setPowerUpTime(5000);
      world.setDeltaTime(100);
      world.setGameState('paused');

      powerUpSystem.update(world);

      expect(world.getPowerUpTimeRemaining()).toBe(5000);
    });
  });

  describe('ghost vulnerability', () => {
    it('should make all ghosts vulnerable when power-up starts', () => {
      const ghost1 = createGhostEntity(world, 'blinky', 14, 11);
      const ghost2 = createGhostEntity(world, 'pinky', 14, 14);

      world.setPowerUpTime(6000);
      world.setDeltaTime(16);
      world.setGameState('playing');

      powerUpSystem.update(world);

      expect(world.entities.hasComponent(ghost1, 'vulnerable')).toBe(true);
      expect(world.entities.hasComponent(ghost2, 'vulnerable')).toBe(true);
    });

    it('should update vulnerable time remaining on ghosts', () => {
      const ghost = createGhostEntity(world, 'blinky', 14, 11);
      world.entities.addComponent(ghost, 'vulnerable', createVulnerable(5000));

      world.setPowerUpTime(4000);
      world.setDeltaTime(16);
      world.setGameState('playing');

      powerUpSystem.update(world);

      const vulnerable = world.entities.getComponent(ghost, 'vulnerable');
      expect(vulnerable?.remainingTime).toBeLessThan(5000);
    });
  });

  describe('warning state', () => {
    it('should dispatch warning event when time is low', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.POWER_UP_WARNING, handler);

      world.setPowerUpTime(POWER_WARNING_TIME);
      world.setDeltaTime(100);
      world.setGameState('playing');

      powerUpSystem.update(world);

      expect(handler).toHaveBeenCalled();
    });

    it('should set ghost flashing state when warning', () => {
      const ghost = createGhostEntity(world, 'blinky', 14, 11);
      world.entities.addComponent(ghost, 'vulnerable', createVulnerable(POWER_WARNING_TIME));

      world.setPowerUpTime(POWER_WARNING_TIME - 100);
      world.setDeltaTime(16);
      world.setGameState('playing');

      powerUpSystem.update(world);

      const vulnerable = world.entities.getComponent(ghost, 'vulnerable');
      expect(vulnerable?.flashing).toBe(true);
    });
  });

  describe('power-up end', () => {
    it('should dispatch power up ended event when timer reaches zero', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.POWER_UP_ENDED, handler);

      world.setPowerUpTime(50);
      world.setDeltaTime(100);
      world.setGameState('playing');

      powerUpSystem.update(world);

      expect(handler).toHaveBeenCalled();
    });

    it('should remove vulnerable component from ghosts when power-up ends', () => {
      const ghost = createGhostEntity(world, 'blinky', 14, 11);
      world.entities.addComponent(ghost, 'vulnerable', createVulnerable(50));

      world.setPowerUpTime(50);
      world.setDeltaTime(100);
      world.setGameState('playing');

      powerUpSystem.update(world);

      expect(world.entities.hasComponent(ghost, 'vulnerable')).toBe(false);
    });

    it('should reset ghost eaten streak when power-up ends', () => {
      world.incrementGhostEatenStreak();
      world.incrementGhostEatenStreak();

      world.setPowerUpTime(50);
      world.setDeltaTime(100);
      world.setGameState('playing');

      powerUpSystem.update(world);

      expect(world.getGhostEatenStreak()).toBe(0);
    });
  });
});
