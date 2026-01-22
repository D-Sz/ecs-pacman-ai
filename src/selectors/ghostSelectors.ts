/**
 * Ghost Selectors
 *
 * Redux-like selectors for querying ghost state from the world.
 */

import type { World } from '../logic/ecs';
import type { EntityId, Position, GhostMode, GhostType } from '../types';

/**
 * State representation for a single ghost
 */
export interface GhostState {
  id: EntityId;
  type: GhostType;
  mode: GhostMode;
  position: Position;
  isVulnerable: boolean;
  isFlashing: boolean;
}

/**
 * Get all ghost entity IDs
 * @param world - The game world
 * @returns Array of ghost entity IDs
 */
export function getGhostEntities(world: World): EntityId[] {
  return world.entities.getEntitiesWithComponents(['ghostAI']);
}

/**
 * Get a ghost's position
 * @param world - The game world
 * @param ghostId - The ghost entity ID
 * @returns The ghost's position or null
 */
export function getGhostPosition(world: World, ghostId: EntityId): Position | null {
  return world.entities.getComponent(ghostId, 'position') ?? null;
}

/**
 * Get a ghost's current mode
 * @param world - The game world
 * @param ghostId - The ghost entity ID
 * @returns The ghost's mode or null
 */
export function getGhostMode(world: World, ghostId: EntityId): GhostMode | null {
  const ghostAI = world.entities.getComponent(ghostId, 'ghostAI');
  return ghostAI?.mode ?? null;
}

/**
 * Get a ghost's type
 * @param world - The game world
 * @param ghostId - The ghost entity ID
 * @returns The ghost's type or null
 */
export function getGhostType(world: World, ghostId: EntityId): GhostType | null {
  const ghostAI = world.entities.getComponent(ghostId, 'ghostAI');
  return ghostAI?.type ?? null;
}

/**
 * Check if a ghost is vulnerable (can be eaten)
 * @param world - The game world
 * @param ghostId - The ghost entity ID
 * @returns True if ghost is vulnerable
 */
export function isGhostVulnerable(world: World, ghostId: EntityId): boolean {
  const vulnerable = world.entities.getComponent(ghostId, 'vulnerable');
  return vulnerable !== undefined && vulnerable.remainingTime > 0;
}

/**
 * Check if a ghost is flashing (vulnerability ending soon)
 * @param world - The game world
 * @param ghostId - The ghost entity ID
 * @returns True if ghost is flashing
 */
export function isGhostFlashing(world: World, ghostId: EntityId): boolean {
  const vulnerable = world.entities.getComponent(ghostId, 'vulnerable');
  return vulnerable?.flashing ?? false;
}

/**
 * Get state for all ghosts
 * @param world - The game world
 * @returns Array of ghost states
 */
export function getAllGhostsState(world: World): GhostState[] {
  const ghostIds = getGhostEntities(world);
  const states: GhostState[] = [];

  for (const id of ghostIds) {
    const ghostAI = world.entities.getComponent(id, 'ghostAI');
    const position = world.entities.getComponent(id, 'position');

    if (ghostAI && position) {
      states.push({
        id,
        type: ghostAI.type,
        mode: ghostAI.mode,
        position,
        isVulnerable: isGhostVulnerable(world, id),
        isFlashing: isGhostFlashing(world, id),
      });
    }
  }

  return states;
}

/**
 * Get a ghost entity by type
 * @param world - The game world
 * @param type - The ghost type to find
 * @returns The entity ID or null
 */
export function getGhostByType(world: World, type: GhostType): EntityId | null {
  const ghostIds = getGhostEntities(world);

  for (const id of ghostIds) {
    const ghostAI = world.entities.getComponent(id, 'ghostAI');
    if (ghostAI?.type === type) {
      return id;
    }
  }

  return null;
}
