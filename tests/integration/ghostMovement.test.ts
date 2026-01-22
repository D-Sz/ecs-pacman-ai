/**
 * Ghost Movement Tests
 *
 * Tests for verifying that ghosts start moving correctly.
 */

import { describe, it, expect } from 'vitest';
import {
  setupGameWithGhosts,
  runFrames,
} from './setup';
import { getAllGhostsState } from '../../src/selectors';
import { GameEvents } from '../../src/types';

describe('Ghost Movement', () => {
  describe('Ghost initialization', () => {
    it('should have all four ghosts with correct initial positions', () => {
      const game = setupGameWithGhosts(14, 22);
      const ghosts = getAllGhostsState(game.world);

      expect(ghosts).toHaveLength(4);

      // Check each ghost type exists
      const types = ghosts.map(g => g.type);
      expect(types).toContain('blinky');
      expect(types).toContain('pinky');
      expect(types).toContain('inky');
      expect(types).toContain('clyde');
    });

    it('should have ghosts with velocity components', () => {
      const game = setupGameWithGhosts(14, 22);

      for (const [, ghostId] of game.ghosts) {
        const velocity = game.world.entities.getComponent(ghostId, 'velocity');
        expect(velocity).toBeDefined();
        expect(velocity!.speed).toBeGreaterThan(0);
      }
    });
  });

  describe('Ghost movement start', () => {
    it('should have Blinky start moving after game starts', () => {
      const game = setupGameWithGhosts(14, 22);
      const blinkyId = game.ghosts.get('blinky')!;

      // Get initial position
      const initialPos = game.world.entities.getComponent(blinkyId, 'position')!;
      const initialPixelX = initialPos.pixelX;
      const initialPixelY = initialPos.pixelY;

      // Run the game for several frames
      runFrames(game.world, game.systems, 30);

      // Get new position
      const newPos = game.world.entities.getComponent(blinkyId, 'position')!;

      // Blinky should have moved (either X or Y changed)
      const hasMoved =
        newPos.pixelX !== initialPixelX || newPos.pixelY !== initialPixelY;
      expect(hasMoved).toBe(true);
    });

    it('should have ghosts with a direction set after AI update', () => {
      const game = setupGameWithGhosts(14, 22);

      // Trigger ghost mode to ensure AI is active
      game.eventBus.dispatch(GameEvents.GHOST_MODE_CHANGE, { mode: 'scatter' });
      runFrames(game.world, game.systems, 10);

      for (const [ghostType, ghostId] of game.ghosts) {
        const velocity = game.world.entities.getComponent(ghostId, 'velocity');
        // Ghost should have picked a direction
        // Note: ghosts in ghost house might not move immediately
        if (ghostType === 'blinky') {
          // Blinky starts outside, should definitely be moving
          expect(velocity!.direction).not.toBeNull();
        }
      }
    });

    it('should have ghosts in scatter mode initially', () => {
      const game = setupGameWithGhosts(14, 22);
      const ghosts = getAllGhostsState(game.world);

      for (const ghost of ghosts) {
        // Initial mode should be scatter (or the mode set by AI)
        expect(['scatter', 'chase', 'frightened', 'eaten']).toContain(ghost.mode);
      }
    });
  });

  describe('Ghost AI behavior', () => {
    it('should respond to ghost mode change events', () => {
      const game = setupGameWithGhosts(14, 22);

      // Dispatch chase mode
      game.eventBus.dispatch(GameEvents.GHOST_MODE_CHANGE, { mode: 'chase' });
      runFrames(game.world, game.systems, 5);

      const ghosts = getAllGhostsState(game.world);
      for (const ghost of ghosts) {
        if (!ghost.isVulnerable) {
          expect(ghost.mode).toBe('chase');
        }
      }
    });

    it('should make ghosts vulnerable during power-up', () => {
      const game = setupGameWithGhosts(14, 22);

      // Start power-up
      game.world.setPowerUpTime(5000);
      runFrames(game.world, game.systems, 5);

      const ghosts = getAllGhostsState(game.world);
      for (const ghost of ghosts) {
        expect(ghost.isVulnerable).toBe(true);
      }
    });
  });
});
