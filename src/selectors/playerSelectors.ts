/**
 * Player Selectors
 *
 * Redux-like selectors for querying player state from the world.
 */

import type { World } from '../logic/ecs';
import type { EntityId, Position, Direction } from '../types';

/**
 * Get the player entity ID
 * @param world - The game world
 * @returns The player entity ID or null if not found
 */
export function getPlayerEntity(world: World): EntityId | null {
  const entities = world.entities.getEntitiesWithComponents(['playerControlled']);
  return entities.length > 0 ? entities[0] : null;
}

/**
 * Get the player's position
 * @param world - The game world
 * @returns The player's position or null if player not found
 */
export function getPlayerPosition(world: World): Position | null {
  const playerId = getPlayerEntity(world);
  if (playerId === null) {
    return null;
  }
  return world.entities.getComponent(playerId, 'position') ?? null;
}

/**
 * Get the player's current direction
 * @param world - The game world
 * @returns The player's direction or null if player not found or not moving
 */
export function getPlayerDirection(world: World): Direction | null {
  const playerId = getPlayerEntity(world);
  if (playerId === null) {
    return null;
  }
  const velocity = world.entities.getComponent(playerId, 'velocity');
  return velocity?.direction ?? null;
}

/**
 * Get the player's next queued direction
 * @param world - The game world
 * @returns The player's next direction or null
 */
export function getPlayerNextDirection(world: World): Direction | null {
  const playerId = getPlayerEntity(world);
  if (playerId === null) {
    return null;
  }
  const velocity = world.entities.getComponent(playerId, 'velocity');
  return velocity?.nextDirection ?? null;
}

/**
 * Get the player's speed
 * @param world - The game world
 * @returns The player's speed or 0 if player not found
 */
export function getPlayerSpeed(world: World): number {
  const playerId = getPlayerEntity(world);
  if (playerId === null) {
    return 0;
  }
  const velocity = world.entities.getComponent(playerId, 'velocity');
  return velocity?.speed ?? 0;
}

/**
 * Check if the player is alive
 * @param world - The game world
 * @returns True if player exists and is alive
 */
export function isPlayerAlive(world: World): boolean {
  const playerId = getPlayerEntity(world);
  return playerId !== null && world.entities.isAlive(playerId);
}
