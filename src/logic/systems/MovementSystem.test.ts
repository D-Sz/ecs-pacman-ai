/**
 * MovementSystem Tests
 *
 * Tests for entity movement, direction changes, and maze collision.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createMovementSystem, type MovementSystem } from './MovementSystem';
import { createWorld, type World } from '../ecs';
import { createPacmanEntity, createGhostEntity } from '../components/entityFactories';
import { ORIGINAL_MAZE, MAZE_WIDTH } from '../../data/originalMaze';

describe('MovementSystem', () => {
  let world: World;
  let movementSystem: MovementSystem;

  beforeEach(() => {
    world = createWorld();
    world.setGameState('playing');
    movementSystem = createMovementSystem(ORIGINAL_MAZE);
  });

  describe('basic movement', () => {
    it('should move entity right when direction is right', () => {
      // Position player on a path (row 5 is all paths)
      const playerId = createPacmanEntity(world, 5, 5);
      const velocity = world.entities.getComponent(playerId, 'velocity')!;
      world.entities.addComponent(playerId, 'velocity', {
        ...velocity,
        direction: 'right',
      });

      world.setDeltaTime(16.67); // ~60fps
      movementSystem.update(world);

      const position = world.entities.getComponent(playerId, 'position');
      expect(position!.pixelX).toBeGreaterThan(5 * 20 + 10); // Moved right
    });

    it('should move entity left when direction is left', () => {
      const playerId = createPacmanEntity(world, 10, 5);
      const velocity = world.entities.getComponent(playerId, 'velocity')!;
      world.entities.addComponent(playerId, 'velocity', {
        ...velocity,
        direction: 'left',
      });

      const initialX = world.entities.getComponent(playerId, 'position')!.pixelX;
      world.setDeltaTime(16.67);
      movementSystem.update(world);

      const position = world.entities.getComponent(playerId, 'position');
      expect(position!.pixelX).toBeLessThan(initialX);
    });

    it('should move entity up when direction is up', () => {
      const playerId = createPacmanEntity(world, 6, 6);
      const velocity = world.entities.getComponent(playerId, 'velocity')!;
      world.entities.addComponent(playerId, 'velocity', {
        ...velocity,
        direction: 'up',
      });

      const initialY = world.entities.getComponent(playerId, 'position')!.pixelY;
      world.setDeltaTime(16.67);
      movementSystem.update(world);

      const position = world.entities.getComponent(playerId, 'position');
      expect(position!.pixelY).toBeLessThan(initialY);
    });

    it('should move entity down when direction is down', () => {
      const playerId = createPacmanEntity(world, 6, 5);
      const velocity = world.entities.getComponent(playerId, 'velocity')!;
      world.entities.addComponent(playerId, 'velocity', {
        ...velocity,
        direction: 'down',
      });

      const initialY = world.entities.getComponent(playerId, 'position')!.pixelY;
      world.setDeltaTime(16.67);
      movementSystem.update(world);

      const position = world.entities.getComponent(playerId, 'position');
      expect(position!.pixelY).toBeGreaterThan(initialY);
    });

    it('should not move when direction is null', () => {
      const playerId = createPacmanEntity(world, 5, 5);
      const initialPos = { ...world.entities.getComponent(playerId, 'position')! };

      world.setDeltaTime(16.67);
      movementSystem.update(world);

      const position = world.entities.getComponent(playerId, 'position');
      expect(position!.pixelX).toBe(initialPos.pixelX);
      expect(position!.pixelY).toBe(initialPos.pixelY);
    });
  });

  describe('wall collision', () => {
    it('should stop at wall when moving into it', () => {
      // Position near a wall (row 0 is all walls)
      const playerId = createPacmanEntity(world, 1, 1);
      const velocity = world.entities.getComponent(playerId, 'velocity')!;
      world.entities.addComponent(playerId, 'velocity', {
        ...velocity,
        direction: 'up', // Moving towards wall at row 0
      });

      // Move multiple times to ensure we hit the wall
      for (let i = 0; i < 100; i++) {
        world.setDeltaTime(16.67);
        movementSystem.update(world);
      }

      const position = world.entities.getComponent(playerId, 'position');
      // Should not enter row 0 (wall)
      expect(position!.gridY).toBeGreaterThanOrEqual(1);
    });
  });

  describe('direction change at intersection', () => {
    it('should apply next direction when aligned at intersection', () => {
      // Start at an intersection (row 5, col 6 - T junction area)
      const playerId = createPacmanEntity(world, 6, 5);
      const velocity = world.entities.getComponent(playerId, 'velocity')!;
      world.entities.addComponent(playerId, 'velocity', {
        ...velocity,
        direction: 'right',
        nextDirection: 'down',
      });

      // Align to grid center
      const pos = world.entities.getComponent(playerId, 'position')!;
      world.entities.addComponent(playerId, 'position', {
        ...pos,
        pixelX: 6 * 20 + 10, // Center of cell
        pixelY: 5 * 20 + 10,
      });

      world.setDeltaTime(16.67);
      movementSystem.update(world);

      const newVelocity = world.entities.getComponent(playerId, 'velocity');
      expect(newVelocity!.direction).toBe('down');
      expect(newVelocity!.nextDirection).toBeNull();
    });

    it('should keep next direction if turn not possible', () => {
      // At a position where down leads to wall
      const playerId = createPacmanEntity(world, 1, 1);
      const velocity = world.entities.getComponent(playerId, 'velocity')!;
      world.entities.addComponent(playerId, 'velocity', {
        ...velocity,
        direction: 'right',
        nextDirection: 'up', // Up leads to wall
      });

      // Align to grid
      const pos = world.entities.getComponent(playerId, 'position')!;
      world.entities.addComponent(playerId, 'position', {
        ...pos,
        pixelX: 1 * 20 + 10,
        pixelY: 1 * 20 + 10,
      });

      world.setDeltaTime(16.67);
      movementSystem.update(world);

      const newVelocity = world.entities.getComponent(playerId, 'velocity');
      // Should keep trying to turn up
      expect(newVelocity!.nextDirection).toBe('up');
    });
  });

  describe('tunnel wrap-around', () => {
    it('should wrap from left tunnel to right side', () => {
      // Row 14 is the tunnel row
      const playerId = createPacmanEntity(world, 0, 14);
      const velocity = world.entities.getComponent(playerId, 'velocity')!;
      world.entities.addComponent(playerId, 'velocity', {
        ...velocity,
        direction: 'left',
      });

      // Position at left edge
      const pos = world.entities.getComponent(playerId, 'position')!;
      world.entities.addComponent(playerId, 'position', {
        ...pos,
        pixelX: 0,
        pixelY: 14 * 20 + 10,
        gridX: 0,
        gridY: 14,
      });

      world.setDeltaTime(16.67);
      movementSystem.update(world);

      const position = world.entities.getComponent(playerId, 'position');
      // Should wrap to right side
      expect(position!.pixelX).toBeGreaterThan(MAZE_WIDTH * 20 - 40);
    });

    it('should wrap from right tunnel to left side', () => {
      const playerId = createPacmanEntity(world, MAZE_WIDTH - 1, 14);
      const velocity = world.entities.getComponent(playerId, 'velocity')!;
      world.entities.addComponent(playerId, 'velocity', {
        ...velocity,
        direction: 'right',
      });

      // Position at right edge
      const pos = world.entities.getComponent(playerId, 'position')!;
      world.entities.addComponent(playerId, 'position', {
        ...pos,
        pixelX: MAZE_WIDTH * 20,
        pixelY: 14 * 20 + 10,
        gridX: MAZE_WIDTH - 1,
        gridY: 14,
      });

      world.setDeltaTime(16.67);
      movementSystem.update(world);

      const position = world.entities.getComponent(playerId, 'position');
      // Should wrap to left side
      expect(position!.pixelX).toBeLessThan(40);
    });
  });

  describe('grid position update', () => {
    it('should update grid position when crossing cell boundary', () => {
      const playerId = createPacmanEntity(world, 5, 5);
      const velocity = world.entities.getComponent(playerId, 'velocity')!;
      world.entities.addComponent(playerId, 'velocity', {
        ...velocity,
        direction: 'right',
        speed: 5, // Fast speed to cross cell quickly
      });

      // Move enough to cross into next cell
      for (let i = 0; i < 10; i++) {
        world.setDeltaTime(16.67);
        movementSystem.update(world);
      }

      const position = world.entities.getComponent(playerId, 'position');
      expect(position!.gridX).toBeGreaterThan(5);
    });
  });

  describe('ghost movement', () => {
    it('should move ghosts with velocity', () => {
      const ghostId = createGhostEntity(world, 'blinky', 14, 11);
      const velocity = world.entities.getComponent(ghostId, 'velocity')!;
      world.entities.addComponent(ghostId, 'velocity', {
        ...velocity,
        direction: 'left',
      });

      const initialX = world.entities.getComponent(ghostId, 'position')!.pixelX;
      world.setDeltaTime(16.67);
      movementSystem.update(world);

      const position = world.entities.getComponent(ghostId, 'position');
      expect(position!.pixelX).toBeLessThan(initialX);
    });
  });
});
