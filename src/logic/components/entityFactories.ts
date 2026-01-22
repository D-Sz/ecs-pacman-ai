/**
 * Entity Factory Functions
 *
 * Helper functions for creating game entities with all required components.
 */

import type { World } from '../ecs';
import type { GhostType, EntityId } from '../../types';
import {
  createPosition,
  createVelocity,
  createGhostAI,
  createEdible,
  createCollider,
  createRespawnable,
  createPlayerControlled,
  createPowerUp,
} from './index';

// Default speeds
const PACMAN_SPEED = 2;
const GHOST_SPEED = 1.8;

/**
 * Create a Pacman entity with all required components
 * @param world - The game world
 * @param gridX - Starting grid X position
 * @param gridY - Starting grid Y position
 * @returns The entity ID
 */
export function createPacmanEntity(
  world: World,
  gridX: number,
  gridY: number
): EntityId {
  const id = world.entities.createEntity();

  world.entities.addComponent(id, 'position', createPosition(gridX, gridY));
  world.entities.addComponent(id, 'velocity', createVelocity(null, PACMAN_SPEED));
  world.entities.addComponent(id, 'playerControlled', createPlayerControlled());
  world.entities.addComponent(id, 'collider', createCollider());

  return id;
}

/**
 * Create a Ghost entity with all required components
 * @param world - The game world
 * @param type - Ghost type (blinky, pinky, inky, clyde)
 * @param gridX - Starting grid X position
 * @param gridY - Starting grid Y position
 * @returns The entity ID
 */
export function createGhostEntity(
  world: World,
  type: GhostType,
  gridX: number,
  gridY: number
): EntityId {
  const id = world.entities.createEntity();

  world.entities.addComponent(id, 'position', createPosition(gridX, gridY));
  world.entities.addComponent(id, 'velocity', createVelocity(null, GHOST_SPEED));
  world.entities.addComponent(id, 'ghostAI', createGhostAI(type));
  world.entities.addComponent(id, 'collider', createCollider());
  world.entities.addComponent(id, 'respawnable', createRespawnable(gridX, gridY));

  return id;
}

/**
 * Create a Pellet entity
 * @param world - The game world
 * @param gridX - Grid X position
 * @param gridY - Grid Y position
 * @returns The entity ID
 */
export function createPelletEntity(
  world: World,
  gridX: number,
  gridY: number
): EntityId {
  const id = world.entities.createEntity();

  world.entities.addComponent(id, 'position', createPosition(gridX, gridY));
  world.entities.addComponent(id, 'edible', createEdible(10));
  world.entities.addComponent(id, 'collider', createCollider());

  return id;
}

/**
 * Create a Power Pellet entity
 * @param world - The game world
 * @param gridX - Grid X position
 * @param gridY - Grid Y position
 * @returns The entity ID
 */
export function createPowerPelletEntity(
  world: World,
  gridX: number,
  gridY: number
): EntityId {
  const id = world.entities.createEntity();

  world.entities.addComponent(id, 'position', createPosition(gridX, gridY));
  world.entities.addComponent(id, 'edible', createEdible(50));
  world.entities.addComponent(id, 'powerUp', createPowerUp(6000));
  world.entities.addComponent(id, 'collider', createCollider());

  return id;
}
