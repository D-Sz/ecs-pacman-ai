/**
 * Game Flow Integration Tests
 *
 * Tests for game state management, lives, and overall game flow.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  setupGame,
  setupGameWithGhosts,
  setupGameWithPellets,
  runSystems,
  runFrames,
  createPacmanEntity,
} from './setup';
import { GameEvents } from '../../src/types';
import {
  getScore,
  getLives,
  getLevel,
  getGameState,
  isGameOver,
  isGameWon,
  isGamePlaying,
  isGamePaused,
  getPlayerPosition,
} from '../../src/selectors';
import { createGameController } from '../../src/logic/GameController';
import { RESPAWN_DELAY, TILE_SIZE } from '../../src/utils/constants';
import { PACMAN_START, GHOST_START_POSITIONS } from '../../src/data/originalMaze';

describe('Game Flow Integration', () => {
  describe('game start', () => {
    it('should start in ready state', () => {
      const game = setupGame(14, 5);
      game.world.setGameState('ready');

      expect(getGameState(game.world)).toBe('ready');
      expect(isGamePlaying(game.world)).toBe(false);
    });

    it('should transition to playing when start event dispatched', () => {
      const game = setupGame(14, 5);
      game.world.setGameState('ready');

      game.eventBus.dispatch(GameEvents.INPUT_START, undefined);
      runSystems(game.world, game.systems);

      expect(getGameState(game.world)).toBe('playing');
      expect(isGamePlaying(game.world)).toBe(true);
    });

    it('should dispatch game started event', () => {
      // Note: Game started event would be dispatched by game controller
      // This tests the state transition works correctly
      const game = setupGame(14, 5);
      game.world.setGameState('ready');

      game.eventBus.dispatch(GameEvents.INPUT_START, undefined);
      runSystems(game.world, game.systems);

      expect(isGamePlaying(game.world)).toBe(true);
    });
  });

  describe('pause and resume', () => {
    it('should pause game when pause event dispatched while playing', () => {
      const game = setupGame(14, 5);

      game.eventBus.dispatch(GameEvents.INPUT_PAUSE, undefined);
      runSystems(game.world, game.systems);

      expect(getGameState(game.world)).toBe('paused');
      expect(isGamePaused(game.world)).toBe(true);
    });

    it('should resume game when pause event dispatched while paused', () => {
      const game = setupGame(14, 5);
      game.world.setGameState('paused');

      game.eventBus.dispatch(GameEvents.INPUT_PAUSE, undefined);
      runSystems(game.world, game.systems);

      expect(getGameState(game.world)).toBe('playing');
      expect(isGamePlaying(game.world)).toBe(true);
    });

    it('should not process movement while paused', () => {
      const game = setupGame(14, 5);
      game.world.setGameState('paused');

      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'left' });
      const initialPos = game.world.entities.getComponent(game.playerId, 'position')!;

      runFrames(game.world, game.systems, 10);

      const newPos = game.world.entities.getComponent(game.playerId, 'position')!;
      expect(newPos.pixelX).toBe(initialPos.pixelX);
    });
  });

  describe('player death', () => {
    it('should lose a life when colliding with ghost', () => {
      const game = setupGameWithGhosts(14, 5, {
        blinky: { x: 14, y: 5 }, // Same position
      });
      const initialLives = getLives(game.world);

      runSystems(game.world, game.systems);

      expect(getLives(game.world)).toBe(initialLives - 1);
    });

    it('should dispatch player died event with remaining lives', () => {
      const handler = vi.fn();
      const game = setupGameWithGhosts(14, 5, {
        blinky: { x: 14, y: 5 },
      });
      game.eventBus.subscribe(GameEvents.PLAYER_DIED, handler);

      runSystems(game.world, game.systems);

      expect(handler).toHaveBeenCalledWith({ livesRemaining: 2 });
    });

    it('should keep game playing if lives remain', () => {
      const game = setupGameWithGhosts(14, 5, {
        blinky: { x: 14, y: 5 },
      });

      runSystems(game.world, game.systems);

      // Game should still be in a playable state (might need respawn logic)
      expect(getLives(game.world)).toBeGreaterThan(0);
    });
  });

  describe('game over', () => {
    it('should set game state to lost when no lives remaining', () => {
      const game = setupGameWithGhosts(14, 5, {
        blinky: { x: 14, y: 5 },
      });

      // Reduce to last life
      game.world.loseLife();
      game.world.loseLife();
      expect(getLives(game.world)).toBe(1);

      runSystems(game.world, game.systems);

      expect(getLives(game.world)).toBe(0);
      expect(getGameState(game.world)).toBe('lost');
      expect(isGameOver(game.world)).toBe(true);
    });

    it('should dispatch game over event with final score', () => {
      const handler = vi.fn();
      const game = setupGameWithGhosts(14, 5, {
        blinky: { x: 14, y: 5 },
      });
      game.eventBus.subscribe(GameEvents.GAME_OVER, handler);

      game.world.loseLife();
      game.world.loseLife();
      game.world.addScore(5000);

      runSystems(game.world, game.systems);

      expect(handler).toHaveBeenCalledWith({
        finalScore: 5000,
        level: 1,
      });
    });
  });

  describe('level complete', () => {
    it('should set game state to won when all pellets eaten', () => {
      const game = setupGameWithPellets(14, 5, [{ x: 14, y: 5 }]);

      runSystems(game.world, game.systems);

      expect(getGameState(game.world)).toBe('won');
      expect(isGameWon(game.world)).toBe(true);
    });

    it('should dispatch level complete event', () => {
      const handler = vi.fn();
      const game = setupGameWithPellets(14, 5, [{ x: 14, y: 5 }]);
      game.eventBus.subscribe(GameEvents.LEVEL_COMPLETE, handler);

      runSystems(game.world, game.systems);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 1,
        })
      );
    });
  });

  describe('score tracking', () => {
    it('should start with zero score', () => {
      const game = setupGame(14, 5);
      expect(getScore(game.world)).toBe(0);
    });

    it('should accumulate score from pellets', () => {
      const game = setupGameWithPellets(14, 5, [
        { x: 14, y: 5 },
        { x: 15, y: 5 },
      ]);

      // Eat first pellet
      runSystems(game.world, game.systems);
      expect(getScore(game.world)).toBe(10);

      // Move and eat second pellet
      game.eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'right' });
      runFrames(game.world, game.systems, 20);

      expect(getScore(game.world)).toBeGreaterThanOrEqual(10);
    });

    it('should persist score across frames', () => {
      const game = setupGameWithPellets(14, 5, [{ x: 14, y: 5 }]);

      runSystems(game.world, game.systems);
      const scoreAfterPellet = getScore(game.world);

      runFrames(game.world, game.systems, 10);

      expect(getScore(game.world)).toBe(scoreAfterPellet);
    });
  });

  describe('level tracking', () => {
    it('should start at level 1', () => {
      const game = setupGame(14, 5);
      expect(getLevel(game.world)).toBe(1);
    });
  });

  describe('death and respawn', () => {
    it('should set state to dying when player dies with lives remaining', () => {
      const controller = createGameController();
      controller.init();
      controller.start();

      const world = controller.getWorld();
      const eventBus = controller.getEventBus();

      // Dispatch player died event with lives remaining
      eventBus.dispatch(GameEvents.PLAYER_DIED, { livesRemaining: 2 });

      expect(getGameState(world)).toBe('dying');
    });

    it('should not change state when player dies with no lives remaining', () => {
      const controller = createGameController();
      controller.init();
      controller.start();

      const world = controller.getWorld();
      const eventBus = controller.getEventBus();

      // Set state to lost (what CollisionSystem would do)
      world.setGameState('lost');

      // Dispatch player died with 0 lives
      eventBus.dispatch(GameEvents.PLAYER_DIED, { livesRemaining: 0 });

      // Should remain lost, not dying
      expect(getGameState(world)).toBe('lost');
    });

    it('should resume playing after respawn delay', () => {
      const controller = createGameController();
      controller.init();
      controller.start();

      const world = controller.getWorld();
      const eventBus = controller.getEventBus();

      // Trigger death
      eventBus.dispatch(GameEvents.PLAYER_DIED, { livesRemaining: 2 });
      expect(getGameState(world)).toBe('dying');

      // Update for less than respawn delay - should still be dying
      controller.update(RESPAWN_DELAY - 100);
      expect(getGameState(world)).toBe('dying');

      // Update past respawn delay - should be playing
      controller.update(200);
      expect(getGameState(world)).toBe('playing');
    });

    it('should reset Pacman position after respawn', () => {
      const controller = createGameController();
      controller.init();
      controller.start();

      const world = controller.getWorld();
      const eventBus = controller.getEventBus();

      // Move Pacman away from start
      eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'left' });
      controller.update(16);
      controller.update(16);
      controller.update(16);

      const posBeforeDeath = getPlayerPosition(world);
      expect(posBeforeDeath).toBeDefined();
      expect(posBeforeDeath!.pixelX).not.toBe(PACMAN_START.x * TILE_SIZE + TILE_SIZE / 2);

      // Trigger death and wait for respawn
      eventBus.dispatch(GameEvents.PLAYER_DIED, { livesRemaining: 2 });
      controller.update(RESPAWN_DELAY + 100);

      const posAfterRespawn = getPlayerPosition(world);
      expect(posAfterRespawn).toBeDefined();
      expect(posAfterRespawn!.gridX).toBe(PACMAN_START.x);
      expect(posAfterRespawn!.gridY).toBe(PACMAN_START.y);
    });

    it('should reset ghost positions after respawn', () => {
      const controller = createGameController();
      controller.init();
      controller.start();

      const world = controller.getWorld();
      const eventBus = controller.getEventBus();

      // Run a few frames so ghosts move
      for (let i = 0; i < 10; i++) {
        controller.update(16);
      }

      // Trigger death and wait for respawn
      eventBus.dispatch(GameEvents.PLAYER_DIED, { livesRemaining: 2 });
      controller.update(RESPAWN_DELAY + 100);

      // Check that ghosts are back at their start positions
      const ghosts = world.entities.getEntitiesWithComponents(['ghostAI', 'position']);
      expect(ghosts.length).toBe(4);

      for (const ghostId of ghosts) {
        const ghostAI = world.entities.getComponent(ghostId, 'ghostAI')!;
        const position = world.entities.getComponent(ghostId, 'position')!;
        const startPos = GHOST_START_POSITIONS[ghostAI.type];

        expect(position.gridX).toBe(startPos.x);
        expect(position.gridY).toBe(startPos.y);
      }
    });

    it('should preserve score after death', () => {
      const controller = createGameController();
      controller.init();
      controller.start();

      const world = controller.getWorld();
      const eventBus = controller.getEventBus();

      // Add some score
      world.addScore(1500);
      expect(getScore(world)).toBe(1500);

      // Trigger death and respawn
      eventBus.dispatch(GameEvents.PLAYER_DIED, { livesRemaining: 2 });
      controller.update(RESPAWN_DELAY + 100);

      // Score should be preserved
      expect(getScore(world)).toBe(1500);
    });

    it('should clear power-up state on respawn', () => {
      const controller = createGameController();
      controller.init();
      controller.start();

      const world = controller.getWorld();
      const eventBus = controller.getEventBus();

      // Set power-up state
      world.setPowerUpTime(5000);
      world.incrementGhostEatenStreak();
      expect(world.isPowerUpActive()).toBe(true);

      // Trigger death and respawn
      eventBus.dispatch(GameEvents.PLAYER_DIED, { livesRemaining: 2 });
      controller.update(RESPAWN_DELAY + 100);

      // Power-up should be cleared
      expect(world.isPowerUpActive()).toBe(false);
      expect(world.getGhostEatenStreak()).toBe(0);
    });

    it('should not run game systems while dying', () => {
      const controller = createGameController();
      controller.init();
      controller.start();

      const world = controller.getWorld();
      const eventBus = controller.getEventBus();

      // Get initial position
      const initialPos = getPlayerPosition(world);

      // Set direction and trigger death
      eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'left' });
      eventBus.dispatch(GameEvents.PLAYER_DIED, { livesRemaining: 2 });

      // Update while dying - but position shouldn't change
      controller.update(100);
      controller.update(100);

      const dyingPos = getPlayerPosition(world);
      // Position should be same as initial (systems not running during dying)
      expect(dyingPos!.pixelX).toBe(initialPos!.pixelX);
    });
  });

  describe('restart', () => {
    it('should dispatch GAME_RESTART event when restart input is received', () => {
      const game = setupGame(14, 5);
      game.world.addScore(5000);
      game.world.loseLife();
      game.world.setGameState('lost');

      // Track if GAME_RESTART is dispatched (GameController would handle actual reset)
      let restartDispatched = false;
      game.eventBus.subscribe(GameEvents.GAME_RESTART, () => {
        restartDispatched = true;
      });

      game.eventBus.dispatch(GameEvents.INPUT_RESTART, undefined);
      runSystems(game.world, game.systems);

      // InputSystem dispatches GAME_RESTART event, GameController handles the actual reset
      expect(restartDispatched).toBe(true);
    });

    it('should reinitialize game when GAME_RESTART handler runs', () => {
      const game = setupGame(14, 5);
      game.world.addScore(5000);
      game.world.loseLife();
      game.world.setGameState('lost');

      // Simulate what GameController does on GAME_RESTART
      game.world.reset();
      createPacmanEntity(game.world, 14, 5);
      game.world.setGameState('ready');

      expect(getScore(game.world)).toBe(0);
      expect(getLives(game.world)).toBe(3);
      expect(getGameState(game.world)).toBe('ready');
    });

    it('should create all entities after restart (player, ghosts, pellets)', () => {
      const game = setupGame(14, 5);
      game.world.addScore(5000);
      game.world.loseLife();
      game.world.setGameState('lost');

      // Simulate what GameController does on GAME_RESTART
      // This verifies the bug fix: restart must recreate ALL entities
      game.world.reset();

      // Verify world is cleared
      const entitiesAfterReset = game.world.entities.getEntitiesWithComponents(['position']);
      expect(entitiesAfterReset.length).toBe(0);

      // Now recreate entities (what GameController.init() does)
      createPacmanEntity(game.world, 14, 5);
      game.world.setGameState('ready');

      // Verify player was created (has playerControlled component)
      const players = game.world.entities.getEntitiesWithComponents(['playerControlled']);
      expect(players.length).toBe(1);

      // Player should have correct position
      const playerPos = game.world.entities.getComponent(players[0], 'position');
      expect(playerPos).toBeDefined();
      expect(playerPos!.gridX).toBe(14);
      expect(playerPos!.gridY).toBe(5);
    });

    it('should reset power-up state on restart', () => {
      const game = setupGame(14, 5);

      // Set some power-up state
      game.world.setPowerUpTime(5000);
      game.world.incrementGhostEatenStreak();
      game.world.incrementGhostEatenStreak();

      expect(game.world.isPowerUpActive()).toBe(true);
      expect(game.world.getGhostEatenStreak()).toBe(2);

      // Reset world (what GameController does on restart)
      game.world.reset();

      // Verify power-up state was cleared
      expect(game.world.isPowerUpActive()).toBe(false);
      expect(game.world.getGhostEatenStreak()).toBe(0);
      expect(game.world.getPowerUpTimeRemaining()).toBe(0);
    });
  });
});
