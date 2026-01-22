/**
 * Maze Selectors
 *
 * Redux-like selectors for querying maze state from the world.
 */

import type { World } from '../logic/ecs';
import type { EntityId } from '../types';

/**
 * Get all entities with edible component (pellets and power pellets)
 * @param world - The game world
 * @returns Array of pellet entity IDs
 */
export function getAllPellets(world: World): EntityId[] {
  return world.entities.getEntitiesWithComponents(['edible', 'position']);
}

/**
 * Get only power pellet entities
 * @param world - The game world
 * @returns Array of power pellet entity IDs
 */
export function getPowerPellets(world: World): EntityId[] {
  return world.entities.getEntitiesWithComponents(['edible', 'powerUp', 'position']);
}

/**
 * Get the pellet entity at a specific grid position
 * @param world - The game world
 * @param gridX - Grid X coordinate
 * @param gridY - Grid Y coordinate
 * @returns The pellet entity ID or null
 */
export function getPelletAt(world: World, gridX: number, gridY: number): EntityId | null {
  const pellets = getAllPellets(world);

  for (const id of pellets) {
    const position = world.entities.getComponent(id, 'position');
    if (position && position.gridX === gridX && position.gridY === gridY) {
      return id;
    }
  }

  return null;
}

/**
 * Check if there is any pellet at a specific grid position
 * @param world - The game world
 * @param gridX - Grid X coordinate
 * @param gridY - Grid Y coordinate
 * @returns True if a pellet exists at the position
 */
export function isPelletAt(world: World, gridX: number, gridY: number): boolean {
  return getPelletAt(world, gridX, gridY) !== null;
}

/**
 * Check if there is a power pellet at a specific grid position
 * @param world - The game world
 * @param gridX - Grid X coordinate
 * @param gridY - Grid Y coordinate
 * @returns True if a power pellet exists at the position
 */
export function isPowerPelletAt(world: World, gridX: number, gridY: number): boolean {
  const pelletId = getPelletAt(world, gridX, gridY);
  if (pelletId === null) {
    return false;
  }
  return world.entities.hasComponent(pelletId, 'powerUp');
}

/**
 * Get the count of remaining pellets (including power pellets)
 * @param world - The game world
 * @returns The number of pellets remaining
 */
export function getRemainingPelletCount(world: World): number {
  return getAllPellets(world).length;
}
