/**
 * Component Factory Tests
 *
 * Tests for component creation and entity factory functions.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createPosition,
  createVelocity,
  createGhostAI,
  createEdible,
  createCollider,
  createVulnerable,
  createRespawnable,
} from './index';
import {
  createPacmanEntity,
  createGhostEntity,
  createPelletEntity,
  createPowerPelletEntity,
} from './entityFactories';
import { createWorld, type World } from '../ecs';
import { TILE_SIZE } from '../../utils/constants';

describe('Component Factories', () => {
  describe('createPosition', () => {
    it('should create position with grid coordinates', () => {
      const pos = createPosition(5, 10);
      expect(pos.gridX).toBe(5);
      expect(pos.gridY).toBe(10);
    });

    it('should calculate pixel coordinates from grid', () => {
      const pos = createPosition(5, 10);
      expect(pos.pixelX).toBe(5 * TILE_SIZE + TILE_SIZE / 2);
      expect(pos.pixelY).toBe(10 * TILE_SIZE + TILE_SIZE / 2);
    });

    it('should allow custom pixel offsets', () => {
      const pos = createPosition(5, 10, 100, 200);
      expect(pos.pixelX).toBe(100);
      expect(pos.pixelY).toBe(200);
    });
  });

  describe('createVelocity', () => {
    it('should create velocity with default values', () => {
      const vel = createVelocity();
      expect(vel.direction).toBeNull();
      expect(vel.speed).toBe(0);
      expect(vel.nextDirection).toBeNull();
    });

    it('should create velocity with direction', () => {
      const vel = createVelocity('right');
      expect(vel.direction).toBe('right');
    });

    it('should create velocity with speed', () => {
      const vel = createVelocity('up', 2);
      expect(vel.speed).toBe(2);
    });

    it('should create velocity with next direction', () => {
      const vel = createVelocity('up', 1, 'left');
      expect(vel.nextDirection).toBe('left');
    });
  });

  describe('createGhostAI', () => {
    it('should create Blinky AI with chase mode and top-right target', () => {
      const ai = createGhostAI('blinky');
      expect(ai.type).toBe('blinky');
      expect(ai.mode).toBe('scatter');
      expect(ai.scatterTarget).toEqual({ x: 25, y: 0 });
    });

    it('should create Pinky AI with top-left target', () => {
      const ai = createGhostAI('pinky');
      expect(ai.type).toBe('pinky');
      expect(ai.scatterTarget).toEqual({ x: 2, y: 0 });
    });

    it('should create Inky AI with bottom-right target', () => {
      const ai = createGhostAI('inky');
      expect(ai.type).toBe('inky');
      expect(ai.scatterTarget).toEqual({ x: 27, y: 30 });
    });

    it('should create Clyde AI with bottom-left target', () => {
      const ai = createGhostAI('clyde');
      expect(ai.type).toBe('clyde');
      expect(ai.scatterTarget).toEqual({ x: 0, y: 30 });
    });

    it('should allow custom initial mode', () => {
      const ai = createGhostAI('blinky', 'chase');
      expect(ai.mode).toBe('chase');
    });
  });

  describe('createEdible', () => {
    it('should create edible with default pellet points', () => {
      const edible = createEdible();
      expect(edible.points).toBe(10);
    });

    it('should create edible with custom points', () => {
      const edible = createEdible(50);
      expect(edible.points).toBe(50);
    });
  });

  describe('createCollider', () => {
    it('should create collider with cell size by default', () => {
      const collider = createCollider();
      expect(collider.width).toBe(TILE_SIZE);
      expect(collider.height).toBe(TILE_SIZE);
    });

    it('should create collider with custom dimensions', () => {
      const collider = createCollider(10, 15);
      expect(collider.width).toBe(10);
      expect(collider.height).toBe(15);
    });
  });

  describe('createVulnerable', () => {
    it('should create vulnerable state with time remaining', () => {
      const vulnerable = createVulnerable(5000);
      expect(vulnerable.remainingTime).toBe(5000);
      expect(vulnerable.flashing).toBe(false);
    });

    it('should set flashing when time is low', () => {
      const vulnerable = createVulnerable(5000, true);
      expect(vulnerable.flashing).toBe(true);
    });
  });

  describe('createRespawnable', () => {
    it('should create respawnable with spawn position', () => {
      const respawn = createRespawnable(14, 14);
      expect(respawn.spawnX).toBe(14);
      expect(respawn.spawnY).toBe(14);
      expect(respawn.delay).toBe(3000);
      expect(respawn.timer).toBe(0);
    });

    it('should allow custom delay', () => {
      const respawn = createRespawnable(14, 14, 5000);
      expect(respawn.delay).toBe(5000);
    });
  });
});

describe('Entity Factories', () => {
  let world: World;

  beforeEach(() => {
    world = createWorld();
  });

  describe('createPacmanEntity', () => {
    it('should create a Pacman entity with position', () => {
      const id = createPacmanEntity(world, 14, 23);
      const position = world.entities.getComponent(id, 'position');

      expect(position).toBeDefined();
      expect(position!.gridX).toBe(14);
      expect(position!.gridY).toBe(23);
    });

    it('should create a Pacman entity with velocity', () => {
      const id = createPacmanEntity(world, 14, 23);
      const velocity = world.entities.getComponent(id, 'velocity');

      expect(velocity).toBeDefined();
      expect(velocity!.direction).toBeNull();
    });

    it('should create a Pacman entity with playerControlled marker', () => {
      const id = createPacmanEntity(world, 14, 23);
      expect(world.entities.hasComponent(id, 'playerControlled')).toBe(true);
    });

    it('should create a Pacman entity with collider', () => {
      const id = createPacmanEntity(world, 14, 23);
      expect(world.entities.hasComponent(id, 'collider')).toBe(true);
    });
  });

  describe('createGhostEntity', () => {
    it('should create a ghost entity with position', () => {
      const id = createGhostEntity(world, 'blinky', 14, 11);
      const position = world.entities.getComponent(id, 'position');

      expect(position).toBeDefined();
      expect(position!.gridX).toBe(14);
      expect(position!.gridY).toBe(11);
    });

    it('should create a ghost entity with velocity', () => {
      const id = createGhostEntity(world, 'blinky', 14, 11);
      const velocity = world.entities.getComponent(id, 'velocity');

      expect(velocity).toBeDefined();
    });

    it('should create a ghost entity with ghostAI component', () => {
      const id = createGhostEntity(world, 'blinky', 14, 11);
      const ghostAI = world.entities.getComponent(id, 'ghostAI');

      expect(ghostAI).toBeDefined();
      expect(ghostAI!.type).toBe('blinky');
    });

    it('should create a ghost entity with collider', () => {
      const id = createGhostEntity(world, 'pinky', 14, 14);
      expect(world.entities.hasComponent(id, 'collider')).toBe(true);
    });

    it('should create a ghost entity with respawnable component', () => {
      const id = createGhostEntity(world, 'inky', 12, 14);
      const respawn = world.entities.getComponent(id, 'respawnable');

      expect(respawn).toBeDefined();
      expect(respawn!.spawnX).toBe(12);
      expect(respawn!.spawnY).toBe(14);
    });
  });

  describe('createPelletEntity', () => {
    it('should create a pellet entity with position', () => {
      const id = createPelletEntity(world, 5, 5);
      const position = world.entities.getComponent(id, 'position');

      expect(position).toBeDefined();
      expect(position!.gridX).toBe(5);
      expect(position!.gridY).toBe(5);
    });

    it('should create a pellet entity with edible component', () => {
      const id = createPelletEntity(world, 5, 5);
      const edible = world.entities.getComponent(id, 'edible');

      expect(edible).toBeDefined();
      expect(edible!.points).toBe(10);
    });

    it('should create a pellet entity with collider', () => {
      const id = createPelletEntity(world, 5, 5);
      expect(world.entities.hasComponent(id, 'collider')).toBe(true);
    });
  });

  describe('createPowerPelletEntity', () => {
    it('should create a power pellet entity with position', () => {
      const id = createPowerPelletEntity(world, 1, 3);
      const position = world.entities.getComponent(id, 'position');

      expect(position).toBeDefined();
      expect(position!.gridX).toBe(1);
      expect(position!.gridY).toBe(3);
    });

    it('should create a power pellet entity with edible component worth 50 points', () => {
      const id = createPowerPelletEntity(world, 1, 3);
      const edible = world.entities.getComponent(id, 'edible');

      expect(edible).toBeDefined();
      expect(edible!.points).toBe(50);
    });

    it('should create a power pellet entity with powerUp component', () => {
      const id = createPowerPelletEntity(world, 1, 3);
      const powerUp = world.entities.getComponent(id, 'powerUp');

      expect(powerUp).toBeDefined();
      expect(powerUp!.duration).toBeGreaterThan(0);
    });

    it('should create a power pellet entity with collider', () => {
      const id = createPowerPelletEntity(world, 1, 3);
      expect(world.entities.hasComponent(id, 'collider')).toBe(true);
    });
  });
});
