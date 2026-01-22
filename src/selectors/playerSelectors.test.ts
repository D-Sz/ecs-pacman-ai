/**
 * Player Selectors Tests
 *
 * Tests for querying player-related state from the world.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPlayerEntity,
  getPlayerPosition,
  getPlayerDirection,
  getPlayerNextDirection,
  getPlayerSpeed,
  isPlayerAlive,
} from './playerSelectors';
import { createWorld, type World } from '../logic/ecs';
import { createPacmanEntity } from '../logic/components/entityFactories';
import type { Direction } from '../types';

describe('Player Selectors', () => {
  let world: World;

  beforeEach(() => {
    world = createWorld();
  });

  describe('getPlayerEntity', () => {
    it('should return null when no player exists', () => {
      expect(getPlayerEntity(world)).toBeNull();
    });

    it('should return the player entity ID', () => {
      const playerId = createPacmanEntity(world, 14, 23);
      expect(getPlayerEntity(world)).toBe(playerId);
    });

    it('should return the player even when other entities exist', () => {
      // Create some non-player entities
      const other1 = world.entities.createEntity();
      world.entities.addComponent(other1, 'position', {
        gridX: 0,
        gridY: 0,
        pixelX: 0,
        pixelY: 0,
      });

      const playerId = createPacmanEntity(world, 14, 23);

      const other2 = world.entities.createEntity();
      world.entities.addComponent(other2, 'position', {
        gridX: 5,
        gridY: 5,
        pixelX: 100,
        pixelY: 100,
      });

      expect(getPlayerEntity(world)).toBe(playerId);
    });
  });

  describe('getPlayerPosition', () => {
    it('should return null when no player exists', () => {
      expect(getPlayerPosition(world)).toBeNull();
    });

    it('should return the player position', () => {
      createPacmanEntity(world, 14, 23);
      const position = getPlayerPosition(world);

      expect(position).not.toBeNull();
      expect(position!.gridX).toBe(14);
      expect(position!.gridY).toBe(23);
    });
  });

  describe('getPlayerDirection', () => {
    it('should return null when no player exists', () => {
      expect(getPlayerDirection(world)).toBeNull();
    });

    it('should return null when player has no direction', () => {
      createPacmanEntity(world, 14, 23);
      expect(getPlayerDirection(world)).toBeNull();
    });

    it('should return the player direction', () => {
      const playerId = createPacmanEntity(world, 14, 23);
      const velocity = world.entities.getComponent(playerId, 'velocity')!;
      world.entities.addComponent(playerId, 'velocity', {
        ...velocity,
        direction: 'right' as Direction,
      });

      expect(getPlayerDirection(world)).toBe('right');
    });
  });

  describe('getPlayerNextDirection', () => {
    it('should return null when no player exists', () => {
      expect(getPlayerNextDirection(world)).toBeNull();
    });

    it('should return null when player has no next direction', () => {
      createPacmanEntity(world, 14, 23);
      expect(getPlayerNextDirection(world)).toBeNull();
    });

    it('should return the player next direction', () => {
      const playerId = createPacmanEntity(world, 14, 23);
      const velocity = world.entities.getComponent(playerId, 'velocity')!;
      world.entities.addComponent(playerId, 'velocity', {
        ...velocity,
        nextDirection: 'up' as Direction,
      });

      expect(getPlayerNextDirection(world)).toBe('up');
    });
  });

  describe('getPlayerSpeed', () => {
    it('should return 0 when no player exists', () => {
      expect(getPlayerSpeed(world)).toBe(0);
    });

    it('should return the player speed', () => {
      createPacmanEntity(world, 14, 23);
      const speed = getPlayerSpeed(world);
      expect(speed).toBeGreaterThan(0);
    });
  });

  describe('isPlayerAlive', () => {
    it('should return false when no player exists', () => {
      expect(isPlayerAlive(world)).toBe(false);
    });

    it('should return true when player exists', () => {
      createPacmanEntity(world, 14, 23);
      expect(isPlayerAlive(world)).toBe(true);
    });

    it('should return false when player entity is destroyed', () => {
      const playerId = createPacmanEntity(world, 14, 23);
      world.entities.destroyEntity(playerId);
      expect(isPlayerAlive(world)).toBe(false);
    });
  });
});
