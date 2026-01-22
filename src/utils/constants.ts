// Game constants and configuration

export const TILE_SIZE = 20;
export const MAZE_WIDTH = 28;
export const MAZE_HEIGHT = 31;

// Speeds (pixels per frame at 60fps)
export const BASE_SPEED = 2;
export const PLAYER_SPEED = BASE_SPEED * 0.8;
export const GHOST_SPEED = BASE_SPEED * 0.75;
export const GHOST_FRIGHTENED_SPEED = BASE_SPEED * 0.5;
export const GHOST_TUNNEL_SPEED = BASE_SPEED * 0.4;

// Timings (in milliseconds)
export const POWER_DURATION = 6000;
export const POWER_WARNING_TIME = 2000;
export const SCATTER_DURATION = 7000;
export const CHASE_DURATION = 20000;
export const RESPAWN_DELAY = 1500;

// Points
export const PELLET_POINTS = 10;
export const POWER_PELLET_POINTS = 50;
export const GHOST_BASE_POINTS = 200;

// Directions
export const DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right'
} as const;

export type Direction = typeof DIRECTIONS[keyof typeof DIRECTIONS];

// Game states
export const GAME_STATES = {
  READY: 'ready',
  PLAYING: 'playing',
  PAUSED: 'paused',
  WON: 'won',
  LOST: 'lost',
  DYING: 'dying'
} as const;

export type GameState = typeof GAME_STATES[keyof typeof GAME_STATES];

// Ghost types
export const GHOST_TYPES = {
  BLINKY: 'blinky',
  PINKY: 'pinky',
  INKY: 'inky',
  CLYDE: 'clyde'
} as const;

export type GhostType = typeof GHOST_TYPES[keyof typeof GHOST_TYPES];

// Ghost modes
export const GHOST_MODES = {
  CHASE: 'chase',
  SCATTER: 'scatter',
  FRIGHTENED: 'frightened'
} as const;

export type GhostMode = typeof GHOST_MODES[keyof typeof GHOST_MODES];

// Cell types for maze
export const CELL_TYPES = {
  WALL: 'wall',
  PATH: 'path',
  TUNNEL: 'tunnel',
  GHOST_HOUSE: 'ghost-house',
  GHOST_DOOR: 'ghost-door'
} as const;

export type CellType = typeof CELL_TYPES[keyof typeof CELL_TYPES];
