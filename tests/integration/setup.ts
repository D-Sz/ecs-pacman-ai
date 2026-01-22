/**
 * Integration Test Setup
 *
 * Provides helper functions for creating game state and running systems.
 */

import { createWorld, type World } from '../../src/logic/ecs';
import { createEventBus, type EventBus } from '../../src/events';
import {
  createInputSystem,
  createMovementSystem,
  createCollisionSystem,
  createEatingSystem,
  createPowerUpSystem,
  createGhostAISystem,
} from '../../src/logic/systems';
import {
  createPacmanEntity,
  createGhostEntity,
  createPelletEntity,
  createPowerPelletEntity,
} from '../../src/logic/components/entityFactories';
import { ORIGINAL_MAZE } from '../../src/data/originalMaze';
import type { EntityId, GhostType } from '../../src/types';

/**
 * Game systems bundle
 */
export interface GameSystems {
  input: ReturnType<typeof createInputSystem>;
  movement: ReturnType<typeof createMovementSystem>;
  collision: ReturnType<typeof createCollisionSystem>;
  eating: ReturnType<typeof createEatingSystem>;
  powerUp: ReturnType<typeof createPowerUpSystem>;
  ghostAI: ReturnType<typeof createGhostAISystem>;
}

/**
 * Create all game systems
 */
export function createGameSystems(eventBus: EventBus): GameSystems {
  return {
    input: createInputSystem(eventBus),
    movement: createMovementSystem(ORIGINAL_MAZE),
    collision: createCollisionSystem(eventBus),
    eating: createEatingSystem(eventBus),
    powerUp: createPowerUpSystem(eventBus),
    ghostAI: createGhostAISystem(eventBus),
  };
}

/**
 * Run all game systems in order
 * Note: Eating must run before Collision so power pellets can make ghosts
 * vulnerable before collision is checked. PowerUp must run right after
 * Eating to apply vulnerability to ghosts immediately.
 */
export function runSystems(world: World, systems: GameSystems): void {
  systems.input.update(world);
  systems.ghostAI.update(world);
  systems.movement.update(world);
  systems.eating.update(world);
  systems.powerUp.update(world);
  systems.collision.update(world);
}

/**
 * Run game systems for multiple frames
 */
export function runFrames(
  world: World,
  systems: GameSystems,
  frames: number,
  deltaTime: number = 16
): void {
  for (let i = 0; i < frames; i++) {
    world.setDeltaTime(deltaTime);
    runSystems(world, systems);
  }
}

/**
 * Setup basic game state
 */
export interface GameSetup {
  world: World;
  eventBus: EventBus;
  systems: GameSystems;
  playerId: EntityId;
}

/**
 * Create a basic game setup with player at specified position
 */
export function setupGame(playerX: number, playerY: number): GameSetup {
  const world = createWorld();
  const eventBus = createEventBus();
  const systems = createGameSystems(eventBus);
  const playerId = createPacmanEntity(world, playerX, playerY);

  world.setGameState('playing');
  world.setDeltaTime(16);

  return { world, eventBus, systems, playerId };
}

/**
 * Setup game with ghosts
 */
export interface GameSetupWithGhosts extends GameSetup {
  ghosts: Map<GhostType, EntityId>;
}

/**
 * Create game setup with all four ghosts
 */
export function setupGameWithGhosts(
  playerX: number,
  playerY: number,
  ghostPositions?: Partial<Record<GhostType, { x: number; y: number }>>
): GameSetupWithGhosts {
  const setup = setupGame(playerX, playerY);
  const ghosts = new Map<GhostType, EntityId>();

  const defaultPositions: Record<GhostType, { x: number; y: number }> = {
    blinky: { x: 14, y: 11 },
    pinky: { x: 13, y: 14 },
    inky: { x: 14, y: 14 },
    clyde: { x: 15, y: 14 },
  };

  const positions = { ...defaultPositions, ...ghostPositions };

  for (const [type, pos] of Object.entries(positions) as [GhostType, { x: number; y: number }][]) {
    const ghostId = createGhostEntity(setup.world, type, pos.x, pos.y);
    ghosts.set(type, ghostId);
  }

  return { ...setup, ghosts };
}

/**
 * Setup game with pellets
 */
export interface GameSetupWithPellets extends GameSetup {
  pelletIds: EntityId[];
  powerPelletIds: EntityId[];
}

/**
 * Create game setup with pellets at specified positions
 */
export function setupGameWithPellets(
  playerX: number,
  playerY: number,
  pelletPositions: { x: number; y: number }[],
  powerPelletPositions: { x: number; y: number }[] = []
): GameSetupWithPellets {
  const setup = setupGame(playerX, playerY);

  const pelletIds = pelletPositions.map((pos) =>
    createPelletEntity(setup.world, pos.x, pos.y)
  );

  const powerPelletIds = powerPelletPositions.map((pos) =>
    createPowerPelletEntity(setup.world, pos.x, pos.y)
  );

  return { ...setup, pelletIds, powerPelletIds };
}

// Re-export for convenience
export { createWorld, createEventBus };
export {
  createPacmanEntity,
  createGhostEntity,
  createPelletEntity,
  createPowerPelletEntity,
} from '../../src/logic/components/entityFactories';
