/**
 * Game Selectors Tests
 *
 * Tests for querying game-level state from the world.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getScore,
  getLives,
  getLevel,
  getGameState,
  getPowerUpTimeRemaining,
  isPowerUpActive,
  isGameOver,
  isGameWon,
  isGamePlaying,
  isGamePaused,
  isGameReady,
} from './gameSelectors';
import { createWorld, type World } from '../logic/ecs';

describe('Game Selectors', () => {
  let world: World;

  beforeEach(() => {
    world = createWorld();
  });

  describe('getScore', () => {
    it('should return 0 for new world', () => {
      expect(getScore(world)).toBe(0);
    });

    it('should return current score', () => {
      world.addScore(100);
      expect(getScore(world)).toBe(100);
    });
  });

  describe('getLives', () => {
    it('should return 3 for new world', () => {
      expect(getLives(world)).toBe(3);
    });

    it('should return current lives', () => {
      world.loseLife();
      expect(getLives(world)).toBe(2);
    });
  });

  describe('getLevel', () => {
    it('should return 1 for new world', () => {
      expect(getLevel(world)).toBe(1);
    });

    it('should return current level', () => {
      world.nextLevel();
      expect(getLevel(world)).toBe(2);
    });
  });

  describe('getGameState', () => {
    it('should return ready for new world', () => {
      expect(getGameState(world)).toBe('ready');
    });

    it('should return current game state', () => {
      world.setGameState('playing');
      expect(getGameState(world)).toBe('playing');
    });
  });

  describe('getPowerUpTimeRemaining', () => {
    it('should return 0 for new world', () => {
      expect(getPowerUpTimeRemaining(world)).toBe(0);
    });

    it('should return current power up time', () => {
      world.setPowerUpTime(5000);
      expect(getPowerUpTimeRemaining(world)).toBe(5000);
    });
  });

  describe('isPowerUpActive', () => {
    it('should return false for new world', () => {
      expect(isPowerUpActive(world)).toBe(false);
    });

    it('should return true when power up is active', () => {
      world.setPowerUpTime(5000);
      expect(isPowerUpActive(world)).toBe(true);
    });

    it('should return false when power up time is zero', () => {
      world.setPowerUpTime(0);
      expect(isPowerUpActive(world)).toBe(false);
    });
  });

  describe('isGameOver', () => {
    it('should return false when game is playing', () => {
      world.setGameState('playing');
      expect(isGameOver(world)).toBe(false);
    });

    it('should return true when game is lost', () => {
      world.setGameState('lost');
      expect(isGameOver(world)).toBe(true);
    });

    it('should return false when game is won', () => {
      world.setGameState('won');
      expect(isGameOver(world)).toBe(false);
    });
  });

  describe('isGameWon', () => {
    it('should return false when game is playing', () => {
      world.setGameState('playing');
      expect(isGameWon(world)).toBe(false);
    });

    it('should return true when game is won', () => {
      world.setGameState('won');
      expect(isGameWon(world)).toBe(true);
    });
  });

  describe('isGamePlaying', () => {
    it('should return false when game is ready', () => {
      expect(isGamePlaying(world)).toBe(false);
    });

    it('should return true when game is playing', () => {
      world.setGameState('playing');
      expect(isGamePlaying(world)).toBe(true);
    });

    it('should return false when game is paused', () => {
      world.setGameState('paused');
      expect(isGamePlaying(world)).toBe(false);
    });
  });

  describe('isGamePaused', () => {
    it('should return false when game is playing', () => {
      world.setGameState('playing');
      expect(isGamePaused(world)).toBe(false);
    });

    it('should return true when game is paused', () => {
      world.setGameState('paused');
      expect(isGamePaused(world)).toBe(true);
    });
  });

  describe('isGameReady', () => {
    it('should return true for new world', () => {
      expect(isGameReady(world)).toBe(true);
    });

    it('should return false when game is playing', () => {
      world.setGameState('playing');
      expect(isGameReady(world)).toBe(false);
    });
  });
});
