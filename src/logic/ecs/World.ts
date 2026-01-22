/**
 * World Container
 *
 * The central game state container that holds all entities
 * and game-level state like score, lives, and current game state.
 */

import type { GameState } from '../../types';
import { createEntityManager, type EntityManager } from './Entity';

/**
 * World configuration options
 */
export interface WorldOptions {
  initialLives?: number;
}

/**
 * World interface - the main game state container
 */
export interface World {
  /** Entity manager for all entities and components */
  readonly entities: EntityManager;

  // Game state
  getGameState(): GameState;
  setGameState(state: GameState): void;

  // Score
  getScore(): number;
  addScore(points: number): void;
  resetScore(): void;

  // Lives
  getLives(): number;
  loseLife(): void;
  addLife(): void;
  resetLives(): void;

  // Level
  getLevel(): number;
  nextLevel(): void;
  resetLevel(): void;

  // Power-up timer
  getPowerUpTimeRemaining(): number;
  setPowerUpTime(time: number): void;
  decreasePowerUpTime(delta: number): void;
  isPowerUpActive(): boolean;

  // Delta time (for frame-based updates)
  getDeltaTime(): number;
  setDeltaTime(dt: number): void;

  // Ghost eating streak (for scoring multiplier)
  getGhostEatenStreak(): number;
  incrementGhostEatenStreak(): void;
  resetGhostEatenStreak(): void;

  // Reset all state
  reset(): void;
}

const DEFAULT_LIVES = 3;

/**
 * Create a new World instance
 */
export function createWorld(options: WorldOptions = {}): World {
  const { initialLives = DEFAULT_LIVES } = options;

  const entities = createEntityManager();

  let gameState: GameState = 'ready';
  let score = 0;
  let lives = initialLives;
  let level = 1;
  let powerUpTime = 0;
  let deltaTime = 0;
  let ghostEatenStreak = 0;

  const getGameState = (): GameState => gameState;
  const setGameState = (state: GameState): void => {
    gameState = state;
  };

  const getScore = (): number => score;
  const addScore = (points: number): void => {
    if (points > 0) {
      score += points;
    }
  };
  const resetScore = (): void => {
    score = 0;
  };

  const getLives = (): number => lives;
  const loseLife = (): void => {
    if (lives > 0) {
      lives--;
    }
  };
  const addLife = (): void => {
    lives++;
  };
  const resetLives = (): void => {
    lives = initialLives;
  };

  const getLevel = (): number => level;
  const nextLevel = (): void => {
    level++;
  };
  const resetLevel = (): void => {
    level = 1;
  };

  const getPowerUpTimeRemaining = (): number => powerUpTime;
  const setPowerUpTime = (time: number): void => {
    powerUpTime = time;
  };
  const decreasePowerUpTime = (delta: number): void => {
    powerUpTime = Math.max(0, powerUpTime - delta);
  };
  const isPowerUpActive = (): boolean => powerUpTime > 0;

  const getDeltaTime = (): number => deltaTime;
  const setDeltaTime = (dt: number): void => {
    deltaTime = dt;
  };

  const getGhostEatenStreak = (): number => ghostEatenStreak;
  const incrementGhostEatenStreak = (): void => {
    ghostEatenStreak++;
  };
  const resetGhostEatenStreak = (): void => {
    ghostEatenStreak = 0;
  };

  const reset = (): void => {
    entities.clear();
    gameState = 'ready';
    score = 0;
    lives = initialLives;
    level = 1;
    powerUpTime = 0;
    deltaTime = 0;
    ghostEatenStreak = 0;
  };

  return {
    entities,
    getGameState,
    setGameState,
    getScore,
    addScore,
    resetScore,
    getLives,
    loseLife,
    addLife,
    resetLives,
    getLevel,
    nextLevel,
    resetLevel,
    getPowerUpTimeRemaining,
    setPowerUpTime,
    decreasePowerUpTime,
    isPowerUpActive,
    getDeltaTime,
    setDeltaTime,
    getGhostEatenStreak,
    incrementGhostEatenStreak,
    resetGhostEatenStreak,
    reset,
  };
}
