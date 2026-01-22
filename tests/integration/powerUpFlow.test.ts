/**
 * Power-Up Flow Integration Tests
 *
 * Tests for power-up behavior including ghost vulnerability and eating.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  setupGameWithGhosts,
  createPowerPelletEntity,
  createPelletEntity,
  runSystems,
  runFrames,
} from './setup';
import { GameEvents } from '../../src/types';
import { createVulnerable } from '../../src/logic/components';
import {
  getScore,
  getLives,
  isGhostFlashing,
  getGhostMode,
  isGhostVulnerable,
} from '../../src/selectors';
import { POWER_WARNING_TIME } from '../../src/utils/constants';

describe('Power-Up Flow Integration', () => {
  describe('power-up activation', () => {
    it('should make all ghosts vulnerable when power-up activates', () => {
      const game = setupGameWithGhosts(14, 5);

      // Directly set power-up time (simulating what happens when power pellet is eaten)
      game.world.setPowerUpTime(6000);

      // Run systems - PowerUpSystem should detect the transition and make ghosts vulnerable
      runSystems(game.world, game.systems);

      for (const [, ghostId] of game.ghosts) {
        expect(isGhostVulnerable(game.world, ghostId)).toBe(true);
      }
    });

    it('should reset ghost eaten streak when power-up starts', () => {
      const game = setupGameWithGhosts(14, 5);
      game.world.incrementGhostEatenStreak();
      game.world.incrementGhostEatenStreak();
      expect(game.world.getGhostEatenStreak()).toBe(2);

      createPowerPelletEntity(game.world, 14, 5);
      runSystems(game.world, game.systems);

      expect(game.world.getGhostEatenStreak()).toBe(0);
    });
  });

  describe('eating ghosts', () => {
    it('should award 200 points for first ghost', () => {
      const game = setupGameWithGhosts(14, 5, {
        blinky: { x: 14, y: 5 }, // Same position as player
      });
      const blinkyId = game.ghosts.get('blinky')!;

      // Make ghost vulnerable
      game.world.entities.addComponent(blinkyId, 'vulnerable', createVulnerable(5000));

      const initialScore = getScore(game.world);
      runSystems(game.world, game.systems);

      expect(getScore(game.world)).toBe(initialScore + 200);
    });

    it('should double points for consecutive ghost eats (200, 400, 800, 1600)', () => {
      const handler = vi.fn();
      const game = setupGameWithGhosts(14, 5, {
        blinky: { x: 14, y: 5 },
        pinky: { x: 14, y: 5 },
        inky: { x: 14, y: 5 },
        clyde: { x: 14, y: 5 },
      });
      game.eventBus.subscribe(GameEvents.GHOST_EATEN, handler);

      // Make all ghosts vulnerable
      for (const [, ghostId] of game.ghosts) {
        game.world.entities.addComponent(ghostId, 'vulnerable', createVulnerable(5000));
      }

      runSystems(game.world, game.systems);

      // Should have eaten all 4 ghosts
      expect(handler).toHaveBeenCalledTimes(4);

      // Check points awarded
      const calls = handler.mock.calls;
      expect(calls[0][0].points).toBe(200);
      expect(calls[1][0].points).toBe(400);
      expect(calls[2][0].points).toBe(800);
      expect(calls[3][0].points).toBe(1600);
    });

    it('should dispatch ghost eaten event with streak', () => {
      const handler = vi.fn();
      const game = setupGameWithGhosts(14, 5, {
        blinky: { x: 14, y: 5 },
      });
      game.eventBus.subscribe(GameEvents.GHOST_EATEN, handler);

      const blinkyId = game.ghosts.get('blinky')!;
      game.world.entities.addComponent(blinkyId, 'vulnerable', createVulnerable(5000));

      runSystems(game.world, game.systems);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          ghostType: 'blinky',
          streak: 1,
        })
      );
    });

    it('should not eat non-vulnerable ghost (player dies instead)', () => {
      const diedHandler = vi.fn();
      const eatenHandler = vi.fn();
      const game = setupGameWithGhosts(14, 5, {
        blinky: { x: 14, y: 5 },
      });
      game.eventBus.subscribe(GameEvents.PLAYER_DIED, diedHandler);
      game.eventBus.subscribe(GameEvents.GHOST_EATEN, eatenHandler);

      // Ghost is NOT vulnerable
      runSystems(game.world, game.systems);

      expect(diedHandler).toHaveBeenCalled();
      expect(eatenHandler).not.toHaveBeenCalled();
    });
  });

  describe('power-up timer', () => {
    it('should count down power-up time', () => {
      const game = setupGameWithGhosts(14, 5);
      game.world.setPowerUpTime(5000);

      runFrames(game.world, game.systems, 10, 16);

      expect(game.world.getPowerUpTimeRemaining()).toBeLessThan(5000);
    });

    it('should dispatch warning event when time is low', () => {
      const handler = vi.fn();
      const game = setupGameWithGhosts(14, 5);
      game.eventBus.subscribe(GameEvents.POWER_UP_WARNING, handler);

      // Set time just above warning threshold
      game.world.setPowerUpTime(POWER_WARNING_TIME);
      runSystems(game.world, game.systems);

      expect(handler).toHaveBeenCalled();
    });

    it('should set ghost flashing state during warning period', () => {
      const game = setupGameWithGhosts(14, 5);
      const blinkyId = game.ghosts.get('blinky')!;

      // Start power-up and add vulnerability
      game.world.setPowerUpTime(POWER_WARNING_TIME - 100);
      game.world.entities.addComponent(blinkyId, 'vulnerable', createVulnerable(POWER_WARNING_TIME));

      runSystems(game.world, game.systems);

      expect(isGhostFlashing(game.world, blinkyId)).toBe(true);
    });

    it('should dispatch power up ended event when timer expires', () => {
      const handler = vi.fn();
      const game = setupGameWithGhosts(14, 5);
      game.eventBus.subscribe(GameEvents.POWER_UP_ENDED, handler);

      game.world.setPowerUpTime(50);
      game.world.setDeltaTime(100); // More than remaining time

      runSystems(game.world, game.systems);

      expect(handler).toHaveBeenCalled();
    });

    it('should remove ghost vulnerability when power-up ends', () => {
      const game = setupGameWithGhosts(14, 5);
      const blinkyId = game.ghosts.get('blinky')!;

      // Start with vulnerability
      game.world.setPowerUpTime(6000);
      game.world.entities.addComponent(blinkyId, 'vulnerable', createVulnerable(6000));

      // Let it expire
      game.world.setPowerUpTime(50);
      game.world.setDeltaTime(100);
      runSystems(game.world, game.systems);

      expect(isGhostVulnerable(game.world, blinkyId)).toBe(false);
    });

    it('should reset streak when power-up ends', () => {
      const game = setupGameWithGhosts(14, 5);
      game.world.incrementGhostEatenStreak();
      game.world.incrementGhostEatenStreak();

      game.world.setPowerUpTime(50);
      game.world.setDeltaTime(100);
      runSystems(game.world, game.systems);

      expect(game.world.getGhostEatenStreak()).toBe(0);
    });
  });

  describe('return to normal', () => {
    it('should return ghosts to previous mode after power-up', () => {
      const game = setupGameWithGhosts(14, 5);
      const blinkyId = game.ghosts.get('blinky')!;

      // Set to chase mode
      game.eventBus.dispatch(GameEvents.GHOST_MODE_CHANGE, { mode: 'chase' });
      runSystems(game.world, game.systems);

      // Start and end power-up
      game.eventBus.dispatch(GameEvents.POWER_UP_STARTED, { timeRemaining: 6000 });
      runSystems(game.world, game.systems);

      game.eventBus.dispatch(GameEvents.POWER_UP_ENDED, undefined);
      runSystems(game.world, game.systems);

      const mode = getGhostMode(game.world, blinkyId);
      expect(mode).toBe('chase');
    });
  });

  describe('system execution order', () => {
    it('should make ghost vulnerable before collision when eating power pellet at same position', () => {
      // This test verifies the critical system order fix:
      // Eating → PowerUp → Collision (not Collision → Eating → PowerUp)
      // When Pacman eats a power pellet at the same position as a ghost,
      // the ghost should become vulnerable BEFORE the collision is checked.

      const game = setupGameWithGhosts(14, 5, {
        blinky: { x: 14, y: 5 }, // Ghost at same position as Pacman
      });

      // Place a power pellet at Pacman's position
      createPowerPelletEntity(game.world, 14, 5);
      // Add another pellet so game doesn't end when power pellet is eaten
      createPelletEntity(game.world, 1, 1);

      const initialLives = getLives(game.world);
      const ghostEatenHandler = vi.fn();
      const playerDiedHandler = vi.fn();
      game.eventBus.subscribe(GameEvents.GHOST_EATEN, ghostEatenHandler);
      game.eventBus.subscribe(GameEvents.PLAYER_DIED, playerDiedHandler);

      // Run one frame - eating, powerUp, then collision should happen in order
      runSystems(game.world, game.systems);

      // Player should NOT have lost a life (ghost was made vulnerable first)
      // This is the key assertion - if system order was wrong, player would die
      expect(getLives(game.world)).toBe(initialLives);
      expect(playerDiedHandler).not.toHaveBeenCalled();

      // Ghost should have been eaten (collision detected vulnerable ghost)
      // Note: After eating, the vulnerable component is removed, so we check
      // that the ghost eaten event was dispatched instead
      expect(ghostEatenHandler).toHaveBeenCalled();
    });

    it('should not die when eating power pellet with multiple ghosts nearby', () => {
      const game = setupGameWithGhosts(14, 5, {
        blinky: { x: 14, y: 5 },
        pinky: { x: 14, y: 5 },
      });

      // Place a power pellet at Pacman's position
      createPowerPelletEntity(game.world, 14, 5);
      // Add another pellet so game doesn't end when power pellet is eaten
      createPelletEntity(game.world, 1, 1);

      const initialLives = getLives(game.world);
      const playerDiedHandler = vi.fn();
      game.eventBus.subscribe(GameEvents.PLAYER_DIED, playerDiedHandler);

      runSystems(game.world, game.systems);

      // Player should NOT have died
      expect(getLives(game.world)).toBe(initialLives);
      expect(playerDiedHandler).not.toHaveBeenCalled();
    });
  });
});
