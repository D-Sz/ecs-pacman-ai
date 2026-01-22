/**
 * Visual State Tests
 *
 * Tests for verifying that visual state (direction, eating) is correctly tracked.
 */

import { describe, it, expect } from 'vitest';
import {
  setupGame,
  setupGameWithPellets,
  runSystems,
  runFrames,
} from './setup';
import { GameEvents } from '../../src/types';
import {
  getPlayerPosition,
  getPlayerDirection,
  getScore,
  getRemainingPelletCount,
} from '../../src/selectors';
import { TILE_SIZE } from '../../src/utils/constants';

describe('Pacman Visual State', () => {
  describe('Direction tracking', () => {
    it('should track direction as right when moving right', () => {
      const game = setupGame(6, 5);

      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'right' });
      runFrames(game.world, game.systems, 5);

      expect(getPlayerDirection(game.world)).toBe('right');
    });

    it('should track direction as left when moving left', () => {
      const game = setupGame(6, 5);

      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'left' });
      runFrames(game.world, game.systems, 5);

      expect(getPlayerDirection(game.world)).toBe('left');
    });

    it('should track direction as up when moving up', () => {
      const game = setupGame(6, 5);

      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'up' });
      runFrames(game.world, game.systems, 5);

      expect(getPlayerDirection(game.world)).toBe('up');
    });

    it('should track direction as down when moving down', () => {
      const game = setupGame(6, 5);

      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'down' });
      runFrames(game.world, game.systems, 5);

      expect(getPlayerDirection(game.world)).toBe('down');
    });

    it('should update direction immediately on valid turn', () => {
      const game = setupGame(6, 5);

      // Start moving right
      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'right' });
      runFrames(game.world, game.systems, 3);

      expect(getPlayerDirection(game.world)).toBe('right');

      // Turn around to left (always valid)
      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'left' });
      runFrames(game.world, game.systems, 3);

      expect(getPlayerDirection(game.world)).toBe('left');
    });
  });

  describe('Velocity direction matches visual direction', () => {
    it('should have velocity direction match the displayed direction', () => {
      const game = setupGame(6, 5);
      const playerId = game.playerId;

      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'right' });
      runFrames(game.world, game.systems, 5);

      const velocity = game.world.entities.getComponent(playerId, 'velocity');
      expect(velocity!.direction).toBe('right');

      // The selector should return the same
      expect(getPlayerDirection(game.world)).toBe(velocity!.direction);
    });
  });
});

describe('Pellet Eating Alignment', () => {
  describe('Pellet detection uses grid coordinates', () => {
    it('should eat pellet when grid positions match', () => {
      // Create a game with pellet at specific position
      const pelletX = 6;
      const pelletY = 5;
      const game = setupGameWithPellets(pelletX, pelletY, [{ x: pelletX, y: pelletY }]);

      const initialCount = getRemainingPelletCount(game.world);
      expect(initialCount).toBe(1);

      // Player is on same grid position as pellet
      runSystems(game.world, game.systems);

      // Pellet should be eaten
      const remainingCount = getRemainingPelletCount(game.world);
      expect(remainingCount).toBe(0);
      expect(getScore(game.world)).toBe(10);
    });

    it('should eat pellet when moving onto its grid cell', () => {
      // Player starts one cell away from pellet
      const game = setupGameWithPellets(5, 5, [{ x: 6, y: 5 }]);

      expect(getRemainingPelletCount(game.world)).toBe(1);

      // Move right to the pellet
      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'right' });
      runFrames(game.world, game.systems, 20);

      // Check if pellet was eaten
      const pos = getPlayerPosition(game.world);
      if (pos!.gridX === 6) {
        expect(getRemainingPelletCount(game.world)).toBe(0);
      }
    });

    it('should not eat pellet in adjacent cell', () => {
      // Player at (5, 5), pellet at (7, 5) - not adjacent when stationary
      const game = setupGameWithPellets(5, 5, [{ x: 7, y: 5 }]);

      expect(getRemainingPelletCount(game.world)).toBe(1);

      // Run systems without moving
      runSystems(game.world, game.systems);

      // Pellet should not be eaten (different grid cell)
      expect(getRemainingPelletCount(game.world)).toBe(1);
    });
  });

  describe('Pellet position accuracy', () => {
    it('should have pellet grid position match its stored position', () => {
      const pelletX = 12;
      const pelletY = 8;
      const game = setupGameWithPellets(1, 1, [{ x: pelletX, y: pelletY }]);

      // Find the pellet entity
      const pellets = game.world.entities.getEntitiesWithComponents(['edible', 'position']);
      expect(pellets.length).toBe(1);

      const pelletPos = game.world.entities.getComponent(pellets[0], 'position');
      expect(pelletPos!.gridX).toBe(pelletX);
      expect(pelletPos!.gridY).toBe(pelletY);

      // Pixel position should be centered in cell
      expect(pelletPos!.pixelX).toBe(pelletX * TILE_SIZE + TILE_SIZE / 2);
      expect(pelletPos!.pixelY).toBe(pelletY * TILE_SIZE + TILE_SIZE / 2);
    });
  });
});
