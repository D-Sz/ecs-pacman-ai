/**
 * World Container Tests
 *
 * Tests for the game world that contains all entities and game state.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createWorld, type World } from './World';
import type { Position } from '../../types';

describe('World', () => {
  let world: World;

  beforeEach(() => {
    world = createWorld();
  });

  describe('initialization', () => {
    it('should create a world with default game state', () => {
      expect(world.getGameState()).toBe('ready');
    });

    it('should create a world with zero score', () => {
      expect(world.getScore()).toBe(0);
    });

    it('should create a world with default lives', () => {
      expect(world.getLives()).toBe(3);
    });

    it('should create a world with level 1', () => {
      expect(world.getLevel()).toBe(1);
    });

    it('should have an entity manager', () => {
      expect(world.entities).toBeDefined();
    });
  });

  describe('entity management delegation', () => {
    it('should create entities through entity manager', () => {
      const id = world.entities.createEntity();
      expect(world.entities.isAlive(id)).toBe(true);
    });

    it('should add components through entity manager', () => {
      const id = world.entities.createEntity();
      const position: Position = { gridX: 5, gridY: 10, pixelX: 100, pixelY: 200 };
      world.entities.addComponent(id, 'position', position);

      expect(world.entities.getComponent(id, 'position')).toEqual(position);
    });

    it('should query entities through entity manager', () => {
      const id1 = world.entities.createEntity();
      const id2 = world.entities.createEntity();

      const position: Position = { gridX: 0, gridY: 0, pixelX: 0, pixelY: 0 };
      world.entities.addComponent(id1, 'position', position);

      const entities = world.entities.getEntitiesWithComponents(['position']);
      expect(entities).toContain(id1);
      expect(entities).not.toContain(id2);
    });
  });

  describe('game state', () => {
    it('should set game state to playing', () => {
      world.setGameState('playing');
      expect(world.getGameState()).toBe('playing');
    });

    it('should set game state to paused', () => {
      world.setGameState('paused');
      expect(world.getGameState()).toBe('paused');
    });

    it('should set game state to won', () => {
      world.setGameState('won');
      expect(world.getGameState()).toBe('won');
    });

    it('should set game state to lost', () => {
      world.setGameState('lost');
      expect(world.getGameState()).toBe('lost');
    });
  });

  describe('score', () => {
    it('should add to score', () => {
      world.addScore(100);
      expect(world.getScore()).toBe(100);
    });

    it('should accumulate score over multiple additions', () => {
      world.addScore(100);
      world.addScore(50);
      world.addScore(200);
      expect(world.getScore()).toBe(350);
    });

    it('should reset score', () => {
      world.addScore(500);
      world.resetScore();
      expect(world.getScore()).toBe(0);
    });

    it('should not allow negative score additions', () => {
      world.addScore(100);
      world.addScore(-50);
      expect(world.getScore()).toBe(100);
    });
  });

  describe('lives', () => {
    it('should lose a life', () => {
      world.loseLife();
      expect(world.getLives()).toBe(2);
    });

    it('should not go below zero lives', () => {
      world.loseLife();
      world.loseLife();
      world.loseLife();
      world.loseLife();
      expect(world.getLives()).toBe(0);
    });

    it('should add a life', () => {
      world.addLife();
      expect(world.getLives()).toBe(4);
    });

    it('should reset lives to default', () => {
      world.loseLife();
      world.loseLife();
      world.resetLives();
      expect(world.getLives()).toBe(3);
    });

    it('should set custom initial lives', () => {
      const customWorld = createWorld({ initialLives: 5 });
      expect(customWorld.getLives()).toBe(5);
    });
  });

  describe('level', () => {
    it('should advance to next level', () => {
      world.nextLevel();
      expect(world.getLevel()).toBe(2);
    });

    it('should accumulate levels', () => {
      world.nextLevel();
      world.nextLevel();
      world.nextLevel();
      expect(world.getLevel()).toBe(4);
    });

    it('should reset level', () => {
      world.nextLevel();
      world.nextLevel();
      world.resetLevel();
      expect(world.getLevel()).toBe(1);
    });
  });

  describe('power-up timer', () => {
    it('should start with no power-up active', () => {
      expect(world.getPowerUpTimeRemaining()).toBe(0);
    });

    it('should set power-up time', () => {
      world.setPowerUpTime(5000);
      expect(world.getPowerUpTimeRemaining()).toBe(5000);
    });

    it('should decrease power-up time', () => {
      world.setPowerUpTime(5000);
      world.decreasePowerUpTime(1000);
      expect(world.getPowerUpTimeRemaining()).toBe(4000);
    });

    it('should not go below zero power-up time', () => {
      world.setPowerUpTime(500);
      world.decreasePowerUpTime(1000);
      expect(world.getPowerUpTimeRemaining()).toBe(0);
    });

    it('should check if power-up is active', () => {
      expect(world.isPowerUpActive()).toBe(false);
      world.setPowerUpTime(5000);
      expect(world.isPowerUpActive()).toBe(true);
      world.setPowerUpTime(0);
      expect(world.isPowerUpActive()).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all game state', () => {
      // Modify everything
      world.addScore(1000);
      world.loseLife();
      world.nextLevel();
      world.setGameState('playing');
      world.setPowerUpTime(5000);

      const id = world.entities.createEntity();
      const position: Position = { gridX: 0, gridY: 0, pixelX: 0, pixelY: 0 };
      world.entities.addComponent(id, 'position', position);

      // Reset
      world.reset();

      // Verify all reset
      expect(world.getScore()).toBe(0);
      expect(world.getLives()).toBe(3);
      expect(world.getLevel()).toBe(1);
      expect(world.getGameState()).toBe('ready');
      expect(world.getPowerUpTimeRemaining()).toBe(0);
      expect(world.entities.getAllEntities()).toEqual([]);
    });
  });

  describe('delta time', () => {
    it('should store and retrieve delta time', () => {
      world.setDeltaTime(16.67);
      expect(world.getDeltaTime()).toBeCloseTo(16.67);
    });

    it('should start with zero delta time', () => {
      expect(world.getDeltaTime()).toBe(0);
    });
  });

  describe('ghost eaten streak', () => {
    it('should start with zero streak', () => {
      expect(world.getGhostEatenStreak()).toBe(0);
    });

    it('should increment streak', () => {
      world.incrementGhostEatenStreak();
      expect(world.getGhostEatenStreak()).toBe(1);
      world.incrementGhostEatenStreak();
      expect(world.getGhostEatenStreak()).toBe(2);
    });

    it('should reset streak', () => {
      world.incrementGhostEatenStreak();
      world.incrementGhostEatenStreak();
      world.resetGhostEatenStreak();
      expect(world.getGhostEatenStreak()).toBe(0);
    });
  });
});
