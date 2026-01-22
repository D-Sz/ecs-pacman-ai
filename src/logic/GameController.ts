/**
 * GameController
 *
 * Orchestrates the game logic, managing the world, systems, and game loop.
 * Acts as the central coordinator between UI and logic layers.
 */

import { createWorld, type World } from './ecs';
import { createEventBus, type EventBus } from '../events';
import {
  createInputSystem,
  createMovementSystem,
  createCollisionSystem,
  createEatingSystem,
  createPowerUpSystem,
  createGhostAISystem,
  type InputSystem,
  type MovementSystem,
  type CollisionSystem,
  type EatingSystem,
  type PowerUpSystem,
  type GhostAISystem,
} from './systems';
import {
  createPacmanEntity,
  createGhostEntity,
  createPelletEntity,
  createPowerPelletEntity,
} from './components/entityFactories';
import {
  ORIGINAL_MAZE,
  PACMAN_START,
  GHOST_START_POSITIONS,
  POWER_PELLET_POSITIONS,
  PELLET_POSITIONS,
} from '../data/originalMaze';
import type { GhostType, EntityId } from '../types';
import { SCATTER_DURATION, CHASE_DURATION, RESPAWN_DELAY, TILE_SIZE } from '../utils/constants';
import { GameEvents } from '../types';
import { getPlayerEntity } from '../selectors';

/**
 * Game systems bundle
 */
interface GameSystems {
  input: InputSystem;
  movement: MovementSystem;
  collision: CollisionSystem;
  eating: EatingSystem;
  powerUp: PowerUpSystem;
  ghostAI: GhostAISystem;
}

/**
 * GameController interface
 */
export interface GameController {
  /** Get the game world */
  getWorld(): World;
  /** Get the event bus */
  getEventBus(): EventBus;
  /** Initialize or reset the game */
  init(): void;
  /** Update game state (call each frame) */
  update(deltaTime: number): void;
  /** Start the game */
  start(): void;
  /** Pause the game */
  pause(): void;
  /** Resume the game */
  resume(): void;
  /** Clean up resources */
  destroy(): void;
}

/**
 * Create a GameController
 */
export function createGameController(): GameController {
  const world = createWorld();
  const eventBus = createEventBus();

  // Create systems
  const systems: GameSystems = {
    input: createInputSystem(eventBus),
    movement: createMovementSystem(ORIGINAL_MAZE),
    collision: createCollisionSystem(eventBus),
    eating: createEatingSystem(eventBus),
    powerUp: createPowerUpSystem(eventBus),
    ghostAI: createGhostAISystem(eventBus),
  };

  // Mode switching timer
  let modeTimer = 0;
  let isScatterMode = true;

  // Entity references
  const ghostIds = new Map<GhostType, EntityId>();

  // Track if we need to reinitialize (set by GAME_RESTART event)
  let needsReinit = false;

  // Respawn timer for death handling
  let respawnTimer = 0;

  // Subscribe to restart event
  eventBus.subscribe(GameEvents.GAME_RESTART, () => {
    needsReinit = true;
  });

  // Subscribe to player died event (for respawn when lives remain)
  eventBus.subscribe(GameEvents.PLAYER_DIED, (payload) => {
    if (payload.livesRemaining > 0) {
      world.setGameState('dying');
      respawnTimer = RESPAWN_DELAY;
    }
  });

  /**
   * Reset Pacman and ghost positions after death (without resetting pellets/score)
   */
  const resetPositions = (): void => {
    // Reset Pacman position
    const playerId = getPlayerEntity(world);
    if (playerId !== null) {
      world.entities.addComponent(playerId, 'position', {
        gridX: PACMAN_START.x,
        gridY: PACMAN_START.y,
        pixelX: PACMAN_START.x * TILE_SIZE + TILE_SIZE / 2,
        pixelY: PACMAN_START.y * TILE_SIZE + TILE_SIZE / 2,
      });
      // Reset velocity
      world.entities.addComponent(playerId, 'velocity', {
        direction: null,
        speed: 0,
        nextDirection: null,
      });
    }

    // Reset all ghost positions
    const ghostTypes: GhostType[] = ['blinky', 'pinky', 'inky', 'clyde'];
    for (const type of ghostTypes) {
      const ghostId = ghostIds.get(type);
      if (ghostId !== undefined) {
        const pos = GHOST_START_POSITIONS[type];
        world.entities.addComponent(ghostId, 'position', {
          gridX: pos.x,
          gridY: pos.y,
          pixelX: pos.x * TILE_SIZE + TILE_SIZE / 2,
          pixelY: pos.y * TILE_SIZE + TILE_SIZE / 2,
        });
        // Reset ghost velocity
        world.entities.addComponent(ghostId, 'velocity', {
          direction: null,
          speed: 0,
          nextDirection: null,
        });
        // Reset ghost AI mode to scatter and remove vulnerability
        const ghostAI = world.entities.getComponent(ghostId, 'ghostAI');
        if (ghostAI) {
          world.entities.addComponent(ghostId, 'ghostAI', {
            ...ghostAI,
            mode: 'scatter',
          });
        }
        world.entities.removeComponent(ghostId, 'vulnerable');
      }
    }

    // Clear power-up state
    world.setPowerUpTime(0);
    world.resetGhostEatenStreak();

    // Reset mode timer
    modeTimer = 0;
    isScatterMode = true;
  };

  /**
   * Initialize the game world with entities
   */
  const init = (): void => {
    // Reset world state
    world.reset();
    modeTimer = 0;
    isScatterMode = true;

    // Create player
    createPacmanEntity(world, PACMAN_START.x, PACMAN_START.y);

    // Create ghosts
    ghostIds.clear();
    const ghostTypes: GhostType[] = ['blinky', 'pinky', 'inky', 'clyde'];
    for (const type of ghostTypes) {
      const pos = GHOST_START_POSITIONS[type];
      const ghostId = createGhostEntity(world, type, pos.x, pos.y);
      ghostIds.set(type, ghostId);
    }

    // Create pellets from pre-calculated positions
    for (const pos of PELLET_POSITIONS) {
      createPelletEntity(world, pos.x, pos.y);
    }

    // Create power pellets
    for (const pos of POWER_PELLET_POSITIONS) {
      createPowerPelletEntity(world, pos.x, pos.y);
    }

    // Set initial game state
    world.setGameState('ready');
  };

  /**
   * Update game state
   */
  const update = (deltaTime: number): void => {
    // Check if we need to reinitialize (restart was requested)
    if (needsReinit) {
      needsReinit = false;
      init();
      return;
    }

    // Set delta time for systems
    world.setDeltaTime(deltaTime);

    // Handle dying state - wait for respawn timer
    if (world.getGameState() === 'dying') {
      respawnTimer -= deltaTime;
      if (respawnTimer <= 0) {
        resetPositions();
        world.setGameState('playing');
      }
      return; // Don't run game systems while dying
    }

    // Update mode switching timer (scatter/chase)
    if (world.getGameState() === 'playing' && !world.isPowerUpActive()) {
      modeTimer += deltaTime;
      const currentDuration = isScatterMode ? SCATTER_DURATION : CHASE_DURATION;

      if (modeTimer >= currentDuration) {
        modeTimer = 0;
        isScatterMode = !isScatterMode;
        eventBus.dispatch(GameEvents.GHOST_MODE_CHANGE, {
          mode: isScatterMode ? 'scatter' : 'chase',
        });
      }
    }

    // Run all systems in order
    // Note: Eating must run before Collision so power pellets can make ghosts
    // vulnerable before collision is checked. PowerUp must run right after
    // Eating to apply vulnerability to ghosts immediately.
    systems.input.update(world);
    systems.ghostAI.update(world);
    systems.movement.update(world);
    systems.eating.update(world);
    systems.powerUp.update(world);
    systems.collision.update(world);
  };

  /**
   * Start the game
   */
  const start = (): void => {
    if (world.getGameState() === 'ready') {
      world.setGameState('playing');
      eventBus.dispatch(GameEvents.GAME_STARTED, undefined);
    }
  };

  /**
   * Pause the game
   */
  const pause = (): void => {
    if (world.getGameState() === 'playing') {
      world.setGameState('paused');
      eventBus.dispatch(GameEvents.GAME_PAUSED, undefined);
    }
  };

  /**
   * Resume the game
   */
  const resume = (): void => {
    if (world.getGameState() === 'paused') {
      world.setGameState('playing');
      eventBus.dispatch(GameEvents.GAME_RESUMED, undefined);
    }
  };

  /**
   * Clean up resources
   */
  const destroy = (): void => {
    systems.input.destroy();
    eventBus.clear();
  };

  return {
    getWorld: () => world,
    getEventBus: () => eventBus,
    init,
    update,
    start,
    pause,
    resume,
    destroy,
  };
}
