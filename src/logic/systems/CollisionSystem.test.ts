/**
 * CollisionSystem Tests
 *
 * Tests for collision detection between entities.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCollisionSystem, type CollisionSystem } from './CollisionSystem';
import { createWorld, type World } from '../ecs';
import { createEventBus, type EventBus } from '../../events';
import { createPacmanEntity, createGhostEntity } from '../components/entityFactories';
import { createVulnerable } from '../components';
import { GameEvents } from '../../types';

describe('CollisionSystem', () => {
  let world: World;
  let eventBus: EventBus;
  let collisionSystem: CollisionSystem;

  beforeEach(() => {
    world = createWorld();
    eventBus = createEventBus();
    collisionSystem = createCollisionSystem(eventBus);
  });

  describe('player-ghost collision', () => {
    it('should dispatch player died event when colliding with normal ghost', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.PLAYER_DIED, handler);

      // Create player and ghost at same position
      createPacmanEntity(world, 10, 10);
      createGhostEntity(world, 'blinky', 10, 10);

      world.setGameState('playing');
      collisionSystem.update(world);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ livesRemaining: 2 });
    });

    it('should lose a life when player dies', () => {
      createPacmanEntity(world, 10, 10);
      createGhostEntity(world, 'blinky', 10, 10);

      world.setGameState('playing');
      collisionSystem.update(world);

      expect(world.getLives()).toBe(2);
    });

    it('should dispatch ghost eaten event when colliding with vulnerable ghost', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.GHOST_EATEN, handler);

      createPacmanEntity(world, 10, 10);
      const ghostId = createGhostEntity(world, 'blinky', 10, 10);

      // Make ghost vulnerable
      world.entities.addComponent(ghostId, 'vulnerable', createVulnerable(5000));

      world.setGameState('playing');
      collisionSystem.update(world);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          ghostId,
          ghostType: 'blinky',
          points: 200,
          streak: 1,
          position: expect.objectContaining({ gridX: 10, gridY: 10 }),
        })
      );
    });

    it('should increase streak for consecutive ghost eats', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.GHOST_EATEN, handler);

      createPacmanEntity(world, 10, 10);
      const ghost1 = createGhostEntity(world, 'blinky', 10, 10);
      const ghost2 = createGhostEntity(world, 'pinky', 10, 10);

      world.entities.addComponent(ghost1, 'vulnerable', createVulnerable(5000));
      world.entities.addComponent(ghost2, 'vulnerable', createVulnerable(5000));

      world.setGameState('playing');
      collisionSystem.update(world);

      // Both ghosts eaten, check streak values
      expect(handler).toHaveBeenCalledTimes(2);
      const calls = handler.mock.calls;
      expect(calls[0][0].streak).toBe(1);
      expect(calls[1][0].streak).toBe(2);
    });

    it('should award correct points based on streak (200, 400, 800, 1600)', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.GHOST_EATEN, handler);

      createPacmanEntity(world, 10, 10);
      const ghost1 = createGhostEntity(world, 'blinky', 10, 10);
      const ghost2 = createGhostEntity(world, 'pinky', 10, 10);
      const ghost3 = createGhostEntity(world, 'inky', 10, 10);
      const ghost4 = createGhostEntity(world, 'clyde', 10, 10);

      world.entities.addComponent(ghost1, 'vulnerable', createVulnerable(5000));
      world.entities.addComponent(ghost2, 'vulnerable', createVulnerable(5000));
      world.entities.addComponent(ghost3, 'vulnerable', createVulnerable(5000));
      world.entities.addComponent(ghost4, 'vulnerable', createVulnerable(5000));

      world.setGameState('playing');
      collisionSystem.update(world);

      const calls = handler.mock.calls;
      expect(calls[0][0].points).toBe(200);
      expect(calls[1][0].points).toBe(400);
      expect(calls[2][0].points).toBe(800);
      expect(calls[3][0].points).toBe(1600);
    });

    it('should add points to score when eating ghost', () => {
      createPacmanEntity(world, 10, 10);
      const ghostId = createGhostEntity(world, 'blinky', 10, 10);
      world.entities.addComponent(ghostId, 'vulnerable', createVulnerable(5000));

      world.setGameState('playing');
      collisionSystem.update(world);

      expect(world.getScore()).toBe(200);
    });

    it('should not collide when player and ghost in different cells', () => {
      const diedHandler = vi.fn();
      const eatenHandler = vi.fn();
      eventBus.subscribe(GameEvents.PLAYER_DIED, diedHandler);
      eventBus.subscribe(GameEvents.GHOST_EATEN, eatenHandler);

      createPacmanEntity(world, 10, 10);
      createGhostEntity(world, 'blinky', 15, 15);

      world.setGameState('playing');
      collisionSystem.update(world);

      expect(diedHandler).not.toHaveBeenCalled();
      expect(eatenHandler).not.toHaveBeenCalled();
    });

    it('should not process collisions when game not playing', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.PLAYER_DIED, handler);

      createPacmanEntity(world, 10, 10);
      createGhostEntity(world, 'blinky', 10, 10);

      world.setGameState('paused');
      collisionSystem.update(world);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should set game state to lost when no lives remaining', () => {
      createPacmanEntity(world, 10, 10);
      createGhostEntity(world, 'blinky', 10, 10);

      // Set to last life
      world.loseLife();
      world.loseLife();

      world.setGameState('playing');
      collisionSystem.update(world);

      expect(world.getLives()).toBe(0);
      expect(world.getGameState()).toBe('lost');
    });

    it('should dispatch game over event when no lives remaining', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.GAME_OVER, handler);

      createPacmanEntity(world, 10, 10);
      createGhostEntity(world, 'blinky', 10, 10);

      world.loseLife();
      world.loseLife();
      world.addScore(5000);

      world.setGameState('playing');
      collisionSystem.update(world);

      expect(handler).toHaveBeenCalledWith({
        finalScore: 5000,
        level: 1,
      });
    });

    it('should remove vulnerable component when ghost is eaten', () => {
      createPacmanEntity(world, 10, 10);
      const ghostId = createGhostEntity(world, 'blinky', 10, 10);
      world.entities.addComponent(ghostId, 'vulnerable', createVulnerable(5000));

      world.setGameState('playing');
      collisionSystem.update(world);

      expect(world.entities.hasComponent(ghostId, 'vulnerable')).toBe(false);
    });
  });

  describe('collision detection threshold', () => {
    it('should detect collision when entities are within threshold distance', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.PLAYER_DIED, handler);

      createPacmanEntity(world, 10, 10);
      const ghostId = createGhostEntity(world, 'blinky', 10, 10);

      // Move ghost slightly away but still within collision threshold
      const ghostPos = world.entities.getComponent(ghostId, 'position')!;
      world.entities.addComponent(ghostId, 'position', {
        ...ghostPos,
        pixelX: ghostPos.pixelX + 5,
      });

      world.setGameState('playing');
      collisionSystem.update(world);

      expect(handler).toHaveBeenCalled();
    });
  });
});
