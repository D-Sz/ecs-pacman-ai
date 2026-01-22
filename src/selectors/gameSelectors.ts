/**
 * Game Selectors
 *
 * Redux-like selectors for querying game-level state from the world.
 */

import type { World } from '../logic/ecs';
import type { GameState } from '../types';

/**
 * Get the current score
 * @param world - The game world
 * @returns The current score
 */
export function getScore(world: World): number {
  return world.getScore();
}

/**
 * Get the current lives remaining
 * @param world - The game world
 * @returns The number of lives remaining
 */
export function getLives(world: World): number {
  return world.getLives();
}

/**
 * Get the current level
 * @param world - The game world
 * @returns The current level number
 */
export function getLevel(world: World): number {
  return world.getLevel();
}

/**
 * Get the current game state
 * @param world - The game world
 * @returns The current game state
 */
export function getGameState(world: World): GameState {
  return world.getGameState();
}

/**
 * Get the remaining power-up time
 * @param world - The game world
 * @returns The remaining power-up time in milliseconds
 */
export function getPowerUpTimeRemaining(world: World): number {
  return world.getPowerUpTimeRemaining();
}

/**
 * Check if a power-up is currently active
 * @param world - The game world
 * @returns True if power-up is active
 */
export function isPowerUpActive(world: World): boolean {
  return world.isPowerUpActive();
}

/**
 * Check if the game is over (lost)
 * @param world - The game world
 * @returns True if game is lost
 */
export function isGameOver(world: World): boolean {
  return world.getGameState() === 'lost';
}

/**
 * Check if the game is won
 * @param world - The game world
 * @returns True if game is won
 */
export function isGameWon(world: World): boolean {
  return world.getGameState() === 'won';
}

/**
 * Check if the game is currently playing
 * @param world - The game world
 * @returns True if game is playing
 */
export function isGamePlaying(world: World): boolean {
  return world.getGameState() === 'playing';
}

/**
 * Check if the game is paused
 * @param world - The game world
 * @returns True if game is paused
 */
export function isGamePaused(world: World): boolean {
  return world.getGameState() === 'paused';
}

/**
 * Check if the game is in ready state (waiting to start)
 * @param world - The game world
 * @returns True if game is ready
 */
export function isGameReady(world: World): boolean {
  return world.getGameState() === 'ready';
}
