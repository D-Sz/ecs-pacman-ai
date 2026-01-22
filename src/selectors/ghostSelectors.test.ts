/**
 * Ghost Selectors Tests
 *
 * Tests for querying ghost-related state from the world.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getGhostEntities,
  getGhostPosition,
  getGhostMode,
  getGhostType,
  isGhostVulnerable,
  isGhostFlashing,
  getAllGhostsState,
  getGhostByType,
} from './ghostSelectors';
import { createWorld, type World } from '../logic/ecs';
import { createGhostEntity } from '../logic/components/entityFactories';
import { createVulnerable } from '../logic/components';

describe('Ghost Selectors', () => {
  let world: World;

  beforeEach(() => {
    world = createWorld();
  });

  describe('getGhostEntities', () => {
    it('should return empty array when no ghosts exist', () => {
      expect(getGhostEntities(world)).toEqual([]);
    });

    it('should return all ghost entity IDs', () => {
      const blinky = createGhostEntity(world, 'blinky', 14, 11);
      const pinky = createGhostEntity(world, 'pinky', 14, 14);
      const inky = createGhostEntity(world, 'inky', 12, 14);
      const clyde = createGhostEntity(world, 'clyde', 16, 14);

      const ghosts = getGhostEntities(world);
      expect(ghosts).toHaveLength(4);
      expect(ghosts).toContain(blinky);
      expect(ghosts).toContain(pinky);
      expect(ghosts).toContain(inky);
      expect(ghosts).toContain(clyde);
    });
  });

  describe('getGhostPosition', () => {
    it('should return null for non-existent ghost', () => {
      expect(getGhostPosition(world, 999)).toBeNull();
    });

    it('should return ghost position', () => {
      const blinky = createGhostEntity(world, 'blinky', 14, 11);
      const position = getGhostPosition(world, blinky);

      expect(position).not.toBeNull();
      expect(position!.gridX).toBe(14);
      expect(position!.gridY).toBe(11);
    });
  });

  describe('getGhostMode', () => {
    it('should return null for non-existent ghost', () => {
      expect(getGhostMode(world, 999)).toBeNull();
    });

    it('should return ghost mode', () => {
      const blinky = createGhostEntity(world, 'blinky', 14, 11);
      expect(getGhostMode(world, blinky)).toBe('scatter');
    });

    it('should return updated mode', () => {
      const blinky = createGhostEntity(world, 'blinky', 14, 11);
      const ghostAI = world.entities.getComponent(blinky, 'ghostAI')!;
      world.entities.addComponent(blinky, 'ghostAI', {
        ...ghostAI,
        mode: 'chase',
      });

      expect(getGhostMode(world, blinky)).toBe('chase');
    });
  });

  describe('getGhostType', () => {
    it('should return null for non-existent ghost', () => {
      expect(getGhostType(world, 999)).toBeNull();
    });

    it('should return ghost type', () => {
      const blinky = createGhostEntity(world, 'blinky', 14, 11);
      const pinky = createGhostEntity(world, 'pinky', 14, 14);

      expect(getGhostType(world, blinky)).toBe('blinky');
      expect(getGhostType(world, pinky)).toBe('pinky');
    });
  });

  describe('isGhostVulnerable', () => {
    it('should return false for non-existent ghost', () => {
      expect(isGhostVulnerable(world, 999)).toBe(false);
    });

    it('should return false when ghost has no vulnerable component', () => {
      const blinky = createGhostEntity(world, 'blinky', 14, 11);
      expect(isGhostVulnerable(world, blinky)).toBe(false);
    });

    it('should return true when ghost has vulnerable component', () => {
      const blinky = createGhostEntity(world, 'blinky', 14, 11);
      world.entities.addComponent(blinky, 'vulnerable', createVulnerable(5000));

      expect(isGhostVulnerable(world, blinky)).toBe(true);
    });

    it('should return false when vulnerable time is zero', () => {
      const blinky = createGhostEntity(world, 'blinky', 14, 11);
      world.entities.addComponent(blinky, 'vulnerable', createVulnerable(0));

      expect(isGhostVulnerable(world, blinky)).toBe(false);
    });
  });

  describe('isGhostFlashing', () => {
    it('should return false for non-existent ghost', () => {
      expect(isGhostFlashing(world, 999)).toBe(false);
    });

    it('should return false when ghost has no vulnerable component', () => {
      const blinky = createGhostEntity(world, 'blinky', 14, 11);
      expect(isGhostFlashing(world, blinky)).toBe(false);
    });

    it('should return false when ghost is vulnerable but not flashing', () => {
      const blinky = createGhostEntity(world, 'blinky', 14, 11);
      world.entities.addComponent(blinky, 'vulnerable', createVulnerable(5000, false));

      expect(isGhostFlashing(world, blinky)).toBe(false);
    });

    it('should return true when ghost is flashing', () => {
      const blinky = createGhostEntity(world, 'blinky', 14, 11);
      world.entities.addComponent(blinky, 'vulnerable', createVulnerable(2000, true));

      expect(isGhostFlashing(world, blinky)).toBe(true);
    });
  });

  describe('getAllGhostsState', () => {
    it('should return empty array when no ghosts exist', () => {
      expect(getAllGhostsState(world)).toEqual([]);
    });

    it('should return state for all ghosts', () => {
      createGhostEntity(world, 'blinky', 14, 11);
      createGhostEntity(world, 'pinky', 14, 14);

      const states = getAllGhostsState(world);
      expect(states).toHaveLength(2);
    });

    it('should include ghost type, position, mode, and vulnerability', () => {
      const blinky = createGhostEntity(world, 'blinky', 14, 11);
      world.entities.addComponent(blinky, 'vulnerable', createVulnerable(5000, true));

      const states = getAllGhostsState(world);
      expect(states).toHaveLength(1);

      const state = states[0];
      expect(state.id).toBe(blinky);
      expect(state.type).toBe('blinky');
      expect(state.mode).toBe('scatter');
      expect(state.position.gridX).toBe(14);
      expect(state.position.gridY).toBe(11);
      expect(state.isVulnerable).toBe(true);
      expect(state.isFlashing).toBe(true);
    });
  });

  describe('getGhostByType', () => {
    it('should return null when ghost type not found', () => {
      expect(getGhostByType(world, 'blinky')).toBeNull();
    });

    it('should return entity ID for ghost type', () => {
      const blinky = createGhostEntity(world, 'blinky', 14, 11);
      createGhostEntity(world, 'pinky', 14, 14);

      expect(getGhostByType(world, 'blinky')).toBe(blinky);
    });

    it('should find each ghost type', () => {
      const blinky = createGhostEntity(world, 'blinky', 14, 11);
      const pinky = createGhostEntity(world, 'pinky', 14, 14);
      const inky = createGhostEntity(world, 'inky', 12, 14);
      const clyde = createGhostEntity(world, 'clyde', 16, 14);

      expect(getGhostByType(world, 'blinky')).toBe(blinky);
      expect(getGhostByType(world, 'pinky')).toBe(pinky);
      expect(getGhostByType(world, 'inky')).toBe(inky);
      expect(getGhostByType(world, 'clyde')).toBe(clyde);
    });
  });
});
