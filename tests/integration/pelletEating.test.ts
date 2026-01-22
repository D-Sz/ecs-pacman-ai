/**
 * Pellet Eating Integration Tests
 *
 * Tests for player eating pellets and power pellets.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  setupGameWithPellets,
  runSystems,
  runFrames,
  type GameSetupWithPellets,
} from './setup';
import { GameEvents } from '../../src/types';
import { getScore, getRemainingPelletCount } from '../../src/selectors';

describe('Pellet Eating Integration', () => {
  describe('regular pellets', () => {
    let game: GameSetupWithPellets;

    beforeEach(() => {
      // Setup with player at (14, 5) and pellets around
      game = setupGameWithPellets(
        14,
        5,
        [
          { x: 14, y: 5 }, // On player
          { x: 15, y: 5 }, // To the right
          { x: 16, y: 5 }, // Further right
        ]
      );
    });

    it('should eat pellet when player moves onto it', () => {
      const initialPellets = getRemainingPelletCount(game.world);
      expect(initialPellets).toBe(3);

      // Player is already on first pellet, run systems
      runSystems(game.world, game.systems);

      // One pellet should be eaten
      const remainingPellets = getRemainingPelletCount(game.world);
      expect(remainingPellets).toBe(2);
    });

    it('should add points to score when eating pellet', () => {
      expect(getScore(game.world)).toBe(0);

      runSystems(game.world, game.systems);

      expect(getScore(game.world)).toBe(10); // Regular pellet = 10 points
    });

    it('should dispatch pellet eaten event', () => {
      const handler = vi.fn();
      game.eventBus.subscribe(GameEvents.PELLET_EATEN, handler);

      runSystems(game.world, game.systems);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          points: 10,
          position: expect.objectContaining({ gridX: 14, gridY: 5 }),
        })
      );
    });

    it('should eat multiple pellets as player moves', () => {
      // Eat first pellet
      runSystems(game.world, game.systems);
      expect(getRemainingPelletCount(game.world)).toBe(2);

      // Move right
      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'right' });
      runFrames(game.world, game.systems, 20); // Move to next pellet

      // Should have eaten another pellet
      expect(getRemainingPelletCount(game.world)).toBeLessThan(2);
    });
  });

  describe('power pellets', () => {
    let game: GameSetupWithPellets;

    beforeEach(() => {
      // Setup with player and power pellet
      game = setupGameWithPellets(
        14,
        5,
        [], // No regular pellets
        [{ x: 14, y: 5 }] // Power pellet on player
      );
    });

    it('should add 50 points for power pellet', () => {
      runSystems(game.world, game.systems);
      expect(getScore(game.world)).toBe(50);
    });

    it('should start power-up timer when eating power pellet', () => {
      expect(game.world.isPowerUpActive()).toBe(false);

      runSystems(game.world, game.systems);

      expect(game.world.isPowerUpActive()).toBe(true);
      expect(game.world.getPowerUpTimeRemaining()).toBe(6000);
    });

    it('should dispatch power pellet eaten event', () => {
      const handler = vi.fn();
      game.eventBus.subscribe(GameEvents.POWER_PELLET_EATEN, handler);

      runSystems(game.world, game.systems);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          points: 50,
          duration: 6000,
        })
      );
    });

    it('should dispatch power up started event', () => {
      const handler = vi.fn();
      game.eventBus.subscribe(GameEvents.POWER_UP_STARTED, handler);

      runSystems(game.world, game.systems);

      expect(handler).toHaveBeenCalledWith({ timeRemaining: 6000 });
    });
  });

  describe('level complete', () => {
    it('should complete level when all pellets eaten', () => {
      const handler = vi.fn();
      const game = setupGameWithPellets(14, 5, [{ x: 14, y: 5 }]); // Single pellet
      game.eventBus.subscribe(GameEvents.LEVEL_COMPLETE, handler);

      runSystems(game.world, game.systems);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 1,
        })
      );
      expect(game.world.getGameState()).toBe('won');
    });

    it('should not complete level while pellets remain', () => {
      const handler = vi.fn();
      const game = setupGameWithPellets(14, 5, [
        { x: 14, y: 5 },
        { x: 20, y: 5 },
      ]);
      game.eventBus.subscribe(GameEvents.LEVEL_COMPLETE, handler);

      runSystems(game.world, game.systems);

      expect(handler).not.toHaveBeenCalled();
      expect(game.world.getGameState()).toBe('playing');
    });
  });
});
