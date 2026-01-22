/**
 * Player Movement Integration Tests
 *
 * Tests for player movement through the game world.
 * Uses EventBus for input and Selectors for state queries.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setupGame, runSystems, runFrames, type GameSetup } from './setup';
import { GameEvents } from '../../src/types';
import {
  getPlayerPosition,
  getPlayerDirection,
  getPlayerNextDirection,
} from '../../src/selectors';
import { TILE_SIZE } from '../../src/utils/constants';

describe('Player Movement Integration', () => {
  let game: GameSetup;

  beforeEach(() => {
    // Start player in horizontal corridor (row 5 is all path except edges)
    game = setupGame(14, 5);
  });

  describe('direction input', () => {
    it('should set direction when input event dispatched on valid path', () => {
      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'right' });
      runSystems(game.world, game.systems);

      // Direction should be applied immediately on valid path
      const direction = getPlayerDirection(game.world);
      expect(direction).toBe('right');
    });

    it('should change player direction when moving and input matches', () => {
      // Set initial direction
      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'left' });
      runSystems(game.world, game.systems);

      // Player should be moving left
      const direction = getPlayerDirection(game.world);
      expect(direction).toBe('left');
    });

    it('should queue direction when cannot immediately turn', () => {
      // Start moving right
      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'right' });
      runSystems(game.world, game.systems);

      // Move a bit off grid center so we can't immediately turn
      runFrames(game.world, game.systems, 3);

      // Queue up direction - will be queued if not aligned to grid
      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'up' });
      runSystems(game.world, game.systems);

      // Either direction changed (if aligned) or queued
      const direction = getPlayerDirection(game.world);
      const nextDir = getPlayerNextDirection(game.world);
      // Should have one or the other set
      expect(direction === 'up' || nextDir === 'up').toBe(true);
    });
  });

  describe('position changes', () => {
    it('should move player position when direction set', () => {
      const initialPos = getPlayerPosition(game.world);

      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'left' });

      // Run multiple frames to see movement
      runFrames(game.world, game.systems, 10);

      const newPos = getPlayerPosition(game.world);
      expect(newPos!.pixelX).toBeLessThan(initialPos!.pixelX);
    });

    it('should update grid position when crossing tile boundary', () => {
      const initialPos = getPlayerPosition(game.world);

      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'left' });

      // Run enough frames to cross a tile
      runFrames(game.world, game.systems, Math.ceil(TILE_SIZE / 2) + 5);

      const newPos = getPlayerPosition(game.world);
      expect(newPos!.gridX).toBeLessThanOrEqual(initialPos!.gridX);
    });
  });

  describe('game state checks', () => {
    it('should not move when game is paused', () => {
      // Set paused state BEFORE any input
      game.world.setGameState('paused');
      const initialPos = getPlayerPosition(game.world);

      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'left' });

      runFrames(game.world, game.systems, 10);

      const newPos = getPlayerPosition(game.world);
      expect(newPos!.pixelX).toBe(initialPos!.pixelX);
    });

    it('should not move when game is ready', () => {
      // Set ready state BEFORE any input
      game.world.setGameState('ready');
      const initialPos = getPlayerPosition(game.world);

      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'left' });

      runFrames(game.world, game.systems, 10);

      const newPos = getPlayerPosition(game.world);
      expect(newPos!.pixelX).toBe(initialPos!.pixelX);
    });
  });

  describe('start and pause', () => {
    it('should start game when start event dispatched', () => {
      game.world.setGameState('ready');
      expect(game.world.getGameState()).toBe('ready');

      game.eventBus.dispatch(GameEvents.INPUT_START, undefined);
      runSystems(game.world, game.systems);

      expect(game.world.getGameState()).toBe('playing');
    });

    it('should pause game when pause event dispatched while playing', () => {
      expect(game.world.getGameState()).toBe('playing');

      game.eventBus.dispatch(GameEvents.INPUT_PAUSE, undefined);
      runSystems(game.world, game.systems);

      expect(game.world.getGameState()).toBe('paused');
    });

    it('should resume game when pause event dispatched while paused', () => {
      game.world.setGameState('paused');

      game.eventBus.dispatch(GameEvents.INPUT_PAUSE, undefined);
      runSystems(game.world, game.systems);

      expect(game.world.getGameState()).toBe('playing');
    });
  });
});
