/**
 * Entity Manager Tests
 *
 * Tests for entity creation, destruction, and component management.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEntityManager,
  type EntityManager,
} from './Entity';
import type { Position, Velocity, GhostAI } from '../../types';

describe('EntityManager', () => {
  let entityManager: EntityManager;

  beforeEach(() => {
    entityManager = createEntityManager();
  });

  describe('createEntity', () => {
    it('should create an entity with a unique ID', () => {
      const id = entityManager.createEntity();
      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThanOrEqual(0);
    });

    it('should create entities with incrementing IDs', () => {
      const id1 = entityManager.createEntity();
      const id2 = entityManager.createEntity();
      const id3 = entityManager.createEntity();

      expect(id2).toBe(id1 + 1);
      expect(id3).toBe(id2 + 1);
    });

    it('should track created entities as alive', () => {
      const id = entityManager.createEntity();
      expect(entityManager.isAlive(id)).toBe(true);
    });
  });

  describe('destroyEntity', () => {
    it('should mark entity as not alive after destruction', () => {
      const id = entityManager.createEntity();
      entityManager.destroyEntity(id);
      expect(entityManager.isAlive(id)).toBe(false);
    });

    it('should remove all components when entity is destroyed', () => {
      const id = entityManager.createEntity();
      const position: Position = { gridX: 5, gridY: 10, pixelX: 100, pixelY: 200 };
      entityManager.addComponent(id, 'position', position);

      entityManager.destroyEntity(id);

      expect(entityManager.getComponent(id, 'position')).toBeUndefined();
    });

    it('should not throw when destroying non-existent entity', () => {
      expect(() => entityManager.destroyEntity(999)).not.toThrow();
    });

    it('should not throw when destroying already destroyed entity', () => {
      const id = entityManager.createEntity();
      entityManager.destroyEntity(id);
      expect(() => entityManager.destroyEntity(id)).not.toThrow();
    });
  });

  describe('isAlive', () => {
    it('should return false for non-existent entity', () => {
      expect(entityManager.isAlive(999)).toBe(false);
    });

    it('should return true for newly created entity', () => {
      const id = entityManager.createEntity();
      expect(entityManager.isAlive(id)).toBe(true);
    });

    it('should return false for destroyed entity', () => {
      const id = entityManager.createEntity();
      entityManager.destroyEntity(id);
      expect(entityManager.isAlive(id)).toBe(false);
    });
  });

  describe('addComponent', () => {
    it('should add a position component to an entity', () => {
      const id = entityManager.createEntity();
      const position: Position = { gridX: 5, gridY: 10, pixelX: 100, pixelY: 200 };

      entityManager.addComponent(id, 'position', position);

      const retrieved = entityManager.getComponent(id, 'position');
      expect(retrieved).toEqual(position);
    });

    it('should add a velocity component to an entity', () => {
      const id = entityManager.createEntity();
      const velocity: Velocity = { direction: 'right', speed: 2, nextDirection: null };

      entityManager.addComponent(id, 'velocity', velocity);

      const retrieved = entityManager.getComponent(id, 'velocity');
      expect(retrieved).toEqual(velocity);
    });

    it('should add a ghostAI component to an entity', () => {
      const id = entityManager.createEntity();
      const ghostAI: GhostAI = {
        type: 'blinky',
        mode: 'chase',
        scatterTarget: { x: 25, y: 0 },
      };

      entityManager.addComponent(id, 'ghostAI', ghostAI);

      const retrieved = entityManager.getComponent(id, 'ghostAI');
      expect(retrieved).toEqual(ghostAI);
    });

    it('should allow multiple components on one entity', () => {
      const id = entityManager.createEntity();
      const position: Position = { gridX: 5, gridY: 10, pixelX: 100, pixelY: 200 };
      const velocity: Velocity = { direction: 'up', speed: 1, nextDirection: 'left' };

      entityManager.addComponent(id, 'position', position);
      entityManager.addComponent(id, 'velocity', velocity);

      expect(entityManager.getComponent(id, 'position')).toEqual(position);
      expect(entityManager.getComponent(id, 'velocity')).toEqual(velocity);
    });

    it('should overwrite existing component of same type', () => {
      const id = entityManager.createEntity();
      const position1: Position = { gridX: 5, gridY: 10, pixelX: 100, pixelY: 200 };
      const position2: Position = { gridX: 15, gridY: 20, pixelX: 300, pixelY: 400 };

      entityManager.addComponent(id, 'position', position1);
      entityManager.addComponent(id, 'position', position2);

      expect(entityManager.getComponent(id, 'position')).toEqual(position2);
    });

    it('should not add component to non-existent entity', () => {
      const position: Position = { gridX: 5, gridY: 10, pixelX: 100, pixelY: 200 };
      entityManager.addComponent(999, 'position', position);

      expect(entityManager.getComponent(999, 'position')).toBeUndefined();
    });

    it('should not add component to destroyed entity', () => {
      const id = entityManager.createEntity();
      entityManager.destroyEntity(id);

      const position: Position = { gridX: 5, gridY: 10, pixelX: 100, pixelY: 200 };
      entityManager.addComponent(id, 'position', position);

      expect(entityManager.getComponent(id, 'position')).toBeUndefined();
    });
  });

  describe('getComponent', () => {
    it('should return undefined for non-existent entity', () => {
      expect(entityManager.getComponent(999, 'position')).toBeUndefined();
    });

    it('should return undefined for entity without that component', () => {
      const id = entityManager.createEntity();
      expect(entityManager.getComponent(id, 'position')).toBeUndefined();
    });

    it('should return the component if it exists', () => {
      const id = entityManager.createEntity();
      const position: Position = { gridX: 5, gridY: 10, pixelX: 100, pixelY: 200 };
      entityManager.addComponent(id, 'position', position);

      expect(entityManager.getComponent(id, 'position')).toEqual(position);
    });
  });

  describe('removeComponent', () => {
    it('should remove a component from an entity', () => {
      const id = entityManager.createEntity();
      const position: Position = { gridX: 5, gridY: 10, pixelX: 100, pixelY: 200 };
      entityManager.addComponent(id, 'position', position);

      entityManager.removeComponent(id, 'position');

      expect(entityManager.getComponent(id, 'position')).toBeUndefined();
    });

    it('should not affect other components when removing one', () => {
      const id = entityManager.createEntity();
      const position: Position = { gridX: 5, gridY: 10, pixelX: 100, pixelY: 200 };
      const velocity: Velocity = { direction: 'up', speed: 1, nextDirection: null };

      entityManager.addComponent(id, 'position', position);
      entityManager.addComponent(id, 'velocity', velocity);

      entityManager.removeComponent(id, 'position');

      expect(entityManager.getComponent(id, 'position')).toBeUndefined();
      expect(entityManager.getComponent(id, 'velocity')).toEqual(velocity);
    });

    it('should not throw when removing non-existent component', () => {
      const id = entityManager.createEntity();
      expect(() => entityManager.removeComponent(id, 'position')).not.toThrow();
    });

    it('should not throw when removing from non-existent entity', () => {
      expect(() => entityManager.removeComponent(999, 'position')).not.toThrow();
    });
  });

  describe('hasComponent', () => {
    it('should return false for non-existent entity', () => {
      expect(entityManager.hasComponent(999, 'position')).toBe(false);
    });

    it('should return false for entity without that component', () => {
      const id = entityManager.createEntity();
      expect(entityManager.hasComponent(id, 'position')).toBe(false);
    });

    it('should return true for entity with that component', () => {
      const id = entityManager.createEntity();
      const position: Position = { gridX: 5, gridY: 10, pixelX: 100, pixelY: 200 };
      entityManager.addComponent(id, 'position', position);

      expect(entityManager.hasComponent(id, 'position')).toBe(true);
    });

    it('should return false after component is removed', () => {
      const id = entityManager.createEntity();
      const position: Position = { gridX: 5, gridY: 10, pixelX: 100, pixelY: 200 };
      entityManager.addComponent(id, 'position', position);
      entityManager.removeComponent(id, 'position');

      expect(entityManager.hasComponent(id, 'position')).toBe(false);
    });
  });

  describe('getEntitiesWithComponents', () => {
    it('should return empty array when no entities exist', () => {
      const result = entityManager.getEntitiesWithComponents(['position']);
      expect(result).toEqual([]);
    });

    it('should return entities that have the specified component', () => {
      const id1 = entityManager.createEntity();
      const id2 = entityManager.createEntity();
      const id3 = entityManager.createEntity();

      const position: Position = { gridX: 0, gridY: 0, pixelX: 0, pixelY: 0 };
      entityManager.addComponent(id1, 'position', position);
      entityManager.addComponent(id3, 'position', position);

      const result = entityManager.getEntitiesWithComponents(['position']);
      expect(result).toContain(id1);
      expect(result).not.toContain(id2);
      expect(result).toContain(id3);
      expect(result.length).toBe(2);
    });

    it('should return entities that have ALL specified components', () => {
      const id1 = entityManager.createEntity();
      const id2 = entityManager.createEntity();
      const id3 = entityManager.createEntity();

      const position: Position = { gridX: 0, gridY: 0, pixelX: 0, pixelY: 0 };
      const velocity: Velocity = { direction: 'up', speed: 1, nextDirection: null };

      entityManager.addComponent(id1, 'position', position);
      entityManager.addComponent(id1, 'velocity', velocity);

      entityManager.addComponent(id2, 'position', position);
      // id2 has no velocity

      entityManager.addComponent(id3, 'position', position);
      entityManager.addComponent(id3, 'velocity', velocity);

      const result = entityManager.getEntitiesWithComponents(['position', 'velocity']);
      expect(result).toContain(id1);
      expect(result).not.toContain(id2);
      expect(result).toContain(id3);
      expect(result.length).toBe(2);
    });

    it('should not return destroyed entities', () => {
      const id1 = entityManager.createEntity();
      const id2 = entityManager.createEntity();

      const position: Position = { gridX: 0, gridY: 0, pixelX: 0, pixelY: 0 };
      entityManager.addComponent(id1, 'position', position);
      entityManager.addComponent(id2, 'position', position);

      entityManager.destroyEntity(id1);

      const result = entityManager.getEntitiesWithComponents(['position']);
      expect(result).not.toContain(id1);
      expect(result).toContain(id2);
      expect(result.length).toBe(1);
    });
  });

  describe('getAllEntities', () => {
    it('should return empty array when no entities exist', () => {
      expect(entityManager.getAllEntities()).toEqual([]);
    });

    it('should return all alive entities', () => {
      const id1 = entityManager.createEntity();
      const id2 = entityManager.createEntity();
      const id3 = entityManager.createEntity();

      const result = entityManager.getAllEntities();
      expect(result).toContain(id1);
      expect(result).toContain(id2);
      expect(result).toContain(id3);
      expect(result.length).toBe(3);
    });

    it('should not return destroyed entities', () => {
      const id1 = entityManager.createEntity();
      const id2 = entityManager.createEntity();
      entityManager.destroyEntity(id1);

      const result = entityManager.getAllEntities();
      expect(result).not.toContain(id1);
      expect(result).toContain(id2);
      expect(result.length).toBe(1);
    });
  });

  describe('clear', () => {
    it('should remove all entities', () => {
      entityManager.createEntity();
      entityManager.createEntity();
      entityManager.createEntity();

      entityManager.clear();

      expect(entityManager.getAllEntities()).toEqual([]);
    });

    it('should allow creating new entities after clear', () => {
      const id1 = entityManager.createEntity();
      entityManager.clear();

      const id2 = entityManager.createEntity();
      expect(entityManager.isAlive(id2)).toBe(true);
      expect(entityManager.isAlive(id1)).toBe(false);
    });
  });
});
