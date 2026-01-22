/**
 * Event type definitions for game communication
 */

import type { Direction, EntityId, Position } from './components';

/**
 * Game event type constants
 */
export const GameEvents = {
  // Input events (UI → Logic)
  INPUT_DIRECTION: 'game:input:direction',
  INPUT_PAUSE: 'game:input:pause',
  INPUT_START: 'game:input:start',
  INPUT_RESTART: 'game:input:restart',

  // Game flow events
  GAME_STARTED: 'game:started',
  GAME_PAUSED: 'game:paused',
  GAME_RESUMED: 'game:resumed',
  GAME_OVER: 'game:over',
  GAME_RESTART: 'game:restart',
  LEVEL_COMPLETE: 'game:level:complete',

  // Gameplay events
  PELLET_EATEN: 'game:pellet:eaten',
  POWER_PELLET_EATEN: 'game:power:eaten',
  GHOST_EATEN: 'game:ghost:eaten',
  PLAYER_DIED: 'game:player:died',
  PLAYER_RESPAWNED: 'game:player:respawned',
  POWER_UP_STARTED: 'game:powerup:started',
  POWER_UP_WARNING: 'game:powerup:warning',
  POWER_UP_ENDED: 'game:powerup:ended',
  GHOST_MODE_CHANGE: 'game:ghost:mode',
} as const;

export type GameEventType = typeof GameEvents[keyof typeof GameEvents];

/**
 * Event payload definitions
 */
export interface InputDirectionPayload {
  direction: Direction;
}

export interface PelletEatenPayload {
  entityId: EntityId;
  position: Position;
  points: number;
}

export interface PowerPelletEatenPayload {
  entityId: EntityId;
  position: Position;
  points: number;
  duration: number;
}

export interface GhostEatenPayload {
  ghostId: EntityId;
  ghostType: string;
  points: number;
  streak: number;
  position: Position;
}

export interface GhostModeChangePayload {
  mode: 'chase' | 'scatter';
}

export interface PlayerDiedPayload {
  livesRemaining: number;
}

export interface LevelCompletePayload {
  level: number;
  score: number;
}

export interface GameOverPayload {
  finalScore: number;
  level: number;
}

export interface PowerUpPayload {
  timeRemaining: number;
}

/**
 * Map of event types to their payload types
 */
export interface GameEventPayloads {
  [GameEvents.INPUT_DIRECTION]: InputDirectionPayload;
  [GameEvents.INPUT_PAUSE]: void;
  [GameEvents.INPUT_START]: void;
  [GameEvents.INPUT_RESTART]: void;
  [GameEvents.GAME_STARTED]: void;
  [GameEvents.GAME_PAUSED]: void;
  [GameEvents.GAME_RESUMED]: void;
  [GameEvents.GAME_OVER]: GameOverPayload;
  [GameEvents.GAME_RESTART]: void;
  [GameEvents.LEVEL_COMPLETE]: LevelCompletePayload;
  [GameEvents.PELLET_EATEN]: PelletEatenPayload;
  [GameEvents.POWER_PELLET_EATEN]: PowerPelletEatenPayload;
  [GameEvents.GHOST_EATEN]: GhostEatenPayload;
  [GameEvents.PLAYER_DIED]: PlayerDiedPayload;
  [GameEvents.PLAYER_RESPAWNED]: void;
  [GameEvents.POWER_UP_STARTED]: PowerUpPayload;
  [GameEvents.POWER_UP_WARNING]: PowerUpPayload;
  [GameEvents.POWER_UP_ENDED]: void;
  [GameEvents.GHOST_MODE_CHANGE]: GhostModeChangePayload;
}
