/**
 * Ghost Behavior Integration Tests
 *
 * Tests for ghost AI behavior, mode switching, and targeting.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setupGameWithGhosts, runSystems, runFrames, type GameSetupWithGhosts } from './setup';
import { GameEvents } from '../../src/types';
import { getGhostMode, getGhostPosition, isGhostVulnerable } from '../../src/selectors';

describe('Ghost Behavior Integration', () => {
  let game: GameSetupWithGhosts;

  beforeEach(() => {
    // Setup with player and all four ghosts
    game = setupGameWithGhosts(14, 5);
  });

  describe('mode switching', () => {
    it('should start ghosts in scatter mode', () => {
      const blinkyId = game.ghosts.get('blinky')!;
      const mode = getGhostMode(game.world, blinkyId);
      expect(mode).toBe('scatter');
    });

    it('should change all ghosts to chase mode on event', () => {
      game.eventBus.dispatch(GameEvents.GHOST_MODE_CHANGE, { mode: 'chase' });
      runSystems(game.world, game.systems);

      for (const [, ghostId] of game.ghosts) {
        const mode = getGhostMode(game.world, ghostId);
        expect(mode).toBe('chase');
      }
    });

    it('should change all ghosts to frightened when power-up starts', () => {
      game.eventBus.dispatch(GameEvents.POWER_UP_STARTED, { timeRemaining: 6000 });
      runSystems(game.world, game.systems);

      for (const [, ghostId] of game.ghosts) {
        const mode = getGhostMode(game.world, ghostId);
        expect(mode).toBe('frightened');
      }
    });
  });

  describe('vulnerability', () => {
    it('should make ghosts vulnerable when power-up starts', () => {
      // Trigger power-up via event
      game.world.setPowerUpTime(6000);
      runSystems(game.world, game.systems);

      const blinkyId = game.ghosts.get('blinky')!;
      expect(isGhostVulnerable(game.world, blinkyId)).toBe(true);
    });

    it('should remove vulnerability when power-up ends', () => {
      const blinkyId = game.ghosts.get('blinky')!;

      // Start power-up (run twice to trigger vulnerability add)
      game.world.setPowerUpTime(6000);
      runSystems(game.world, game.systems);
      runSystems(game.world, game.systems);

      // Verify ghost is vulnerable
      expect(isGhostVulnerable(game.world, blinkyId)).toBe(true);

      // End power-up by setting time to small value and letting it expire
      game.world.setPowerUpTime(10);
      game.world.setDeltaTime(100); // More than remaining
      runSystems(game.world, game.systems);

      expect(isGhostVulnerable(game.world, blinkyId)).toBe(false);
    });
  });

  describe('ghost targeting', () => {
    it('Blinky should target player directly in chase mode', () => {
      game.eventBus.dispatch(GameEvents.GHOST_MODE_CHANGE, { mode: 'chase' });
      runSystems(game.world, game.systems);

      const blinkyId = game.ghosts.get('blinky')!;
      const target = game.systems.ghostAI.getGhostTarget(game.world, blinkyId);

      // Blinky targets player's position
      expect(target).toEqual({ x: 14, y: 5 });
    });

    it('Blinky should target corner in scatter mode', () => {
      const blinkyId = game.ghosts.get('blinky')!;
      const target = game.systems.ghostAI.getGhostTarget(game.world, blinkyId);

      // Blinky's scatter corner is top-right
      expect(target).toEqual({ x: 25, y: 0 });
    });
  });

  describe('ghost movement', () => {
    it('should move ghosts when game is playing', () => {
      const blinkyId = game.ghosts.get('blinky')!;
      const initialPos = getGhostPosition(game.world, blinkyId);

      // Set a direction for movement
      const velocity = game.world.entities.getComponent(blinkyId, 'velocity')!;
      game.world.entities.addComponent(blinkyId, 'velocity', {
        ...velocity,
        direction: 'left',
      });

      runFrames(game.world, game.systems, 10);

      const newPos = getGhostPosition(game.world, blinkyId);
      expect(newPos!.pixelX).not.toBe(initialPos!.pixelX);
    });
  });

  describe('eaten ghost behavior', () => {
    it('should set ghost to eaten mode when eaten event dispatched', () => {
      const blinkyId = game.ghosts.get('blinky')!;

      // Move Blinky away from ghost house
      game.world.entities.addComponent(blinkyId, 'position', {
        gridX: 20, gridY: 20, pixelX: 410, pixelY: 410,
      });

      game.eventBus.dispatch(GameEvents.GHOST_EATEN, {
        ghostId: blinkyId,
        ghostType: 'blinky',
        points: 200,
        streak: 1,
        position: { gridX: 20, gridY: 20, pixelX: 410, pixelY: 410 },
      });
      runSystems(game.world, game.systems);

      const mode = getGhostMode(game.world, blinkyId);
      expect(mode).toBe('eaten');
    });

    it('should target ghost house when eaten', () => {
      const blinkyId = game.ghosts.get('blinky')!;

      // Manually set mode to eaten
      const ghostAI = game.world.entities.getComponent(blinkyId, 'ghostAI')!;
      game.world.entities.addComponent(blinkyId, 'ghostAI', {
        ...ghostAI,
        mode: 'eaten',
      });

      const target = game.systems.ghostAI.getGhostTarget(game.world, blinkyId);
      expect(target).toEqual({ x: 13, y: 14 });
    });
  });
});
