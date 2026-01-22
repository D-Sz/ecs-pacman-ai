/**
 * Maze Selectors Tests
 *
 * Tests for querying maze-related state from the world.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPelletAt,
  getAllPellets,
  getPowerPellets,
  getRemainingPelletCount,
  isPelletAt,
  isPowerPelletAt,
} from './mazeSelectors';
import { createWorld, type World } from '../logic/ecs';
import { createPelletEntity, createPowerPelletEntity } from '../logic/components/entityFactories';

describe('Maze Selectors', () => {
  let world: World;

  beforeEach(() => {
    world = createWorld();
  });

  describe('getPelletAt', () => {
    it('should return null when no pellet at position', () => {
      expect(getPelletAt(world, 5, 5)).toBeNull();
    });

    it('should return pellet entity ID at position', () => {
      const pelletId = createPelletEntity(world, 5, 5);
      expect(getPelletAt(world, 5, 5)).toBe(pelletId);
    });

    it('should return power pellet entity ID at position', () => {
      const powerId = createPowerPelletEntity(world, 1, 3);
      expect(getPelletAt(world, 1, 3)).toBe(powerId);
    });

    it('should not return pellet at different position', () => {
      createPelletEntity(world, 5, 5);
      expect(getPelletAt(world, 6, 5)).toBeNull();
    });
  });

  describe('getAllPellets', () => {
    it('should return empty array when no pellets', () => {
      expect(getAllPellets(world)).toEqual([]);
    });

    it('should return all regular pellets', () => {
      const p1 = createPelletEntity(world, 1, 1);
      const p2 = createPelletEntity(world, 2, 1);
      const p3 = createPelletEntity(world, 3, 1);

      const pellets = getAllPellets(world);
      expect(pellets).toHaveLength(3);
      expect(pellets).toContain(p1);
      expect(pellets).toContain(p2);
      expect(pellets).toContain(p3);
    });

    it('should include power pellets in all pellets', () => {
      const regular = createPelletEntity(world, 1, 1);
      const power = createPowerPelletEntity(world, 1, 3);

      const pellets = getAllPellets(world);
      expect(pellets).toHaveLength(2);
      expect(pellets).toContain(regular);
      expect(pellets).toContain(power);
    });
  });

  describe('getPowerPellets', () => {
    it('should return empty array when no power pellets', () => {
      expect(getPowerPellets(world)).toEqual([]);
    });

    it('should return only power pellets', () => {
      createPelletEntity(world, 1, 1);
      const power1 = createPowerPelletEntity(world, 1, 3);
      createPelletEntity(world, 2, 1);
      const power2 = createPowerPelletEntity(world, 26, 3);

      const powerPellets = getPowerPellets(world);
      expect(powerPellets).toHaveLength(2);
      expect(powerPellets).toContain(power1);
      expect(powerPellets).toContain(power2);
    });

    it('should not include regular pellets', () => {
      const regular = createPelletEntity(world, 1, 1);
      createPowerPelletEntity(world, 1, 3);

      const powerPellets = getPowerPellets(world);
      expect(powerPellets).not.toContain(regular);
    });
  });

  describe('getRemainingPelletCount', () => {
    it('should return 0 when no pellets', () => {
      expect(getRemainingPelletCount(world)).toBe(0);
    });

    it('should count all pellets including power pellets', () => {
      createPelletEntity(world, 1, 1);
      createPelletEntity(world, 2, 1);
      createPowerPelletEntity(world, 1, 3);

      expect(getRemainingPelletCount(world)).toBe(3);
    });

    it('should decrease count when pellet is destroyed', () => {
      const p1 = createPelletEntity(world, 1, 1);
      createPelletEntity(world, 2, 1);
      createPelletEntity(world, 3, 1);

      expect(getRemainingPelletCount(world)).toBe(3);

      world.entities.destroyEntity(p1);
      expect(getRemainingPelletCount(world)).toBe(2);
    });
  });

  describe('isPelletAt', () => {
    it('should return false when no pellet at position', () => {
      expect(isPelletAt(world, 5, 5)).toBe(false);
    });

    it('should return true when regular pellet at position', () => {
      createPelletEntity(world, 5, 5);
      expect(isPelletAt(world, 5, 5)).toBe(true);
    });

    it('should return true when power pellet at position', () => {
      createPowerPelletEntity(world, 1, 3);
      expect(isPelletAt(world, 1, 3)).toBe(true);
    });
  });

  describe('isPowerPelletAt', () => {
    it('should return false when no pellet at position', () => {
      expect(isPowerPelletAt(world, 1, 3)).toBe(false);
    });

    it('should return false when regular pellet at position', () => {
      createPelletEntity(world, 5, 5);
      expect(isPowerPelletAt(world, 5, 5)).toBe(false);
    });

    it('should return true when power pellet at position', () => {
      createPowerPelletEntity(world, 1, 3);
      expect(isPowerPelletAt(world, 1, 3)).toBe(true);
    });
  });
});
