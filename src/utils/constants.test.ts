import { describe, it, expect } from 'vitest';
import {
  TILE_SIZE,
  MAZE_WIDTH,
  MAZE_HEIGHT,
  DIRECTIONS,
  GAME_STATES,
  GHOST_TYPES,
  GHOST_MODES,
  CELL_TYPES,
  type Direction,
  type GameState,
  type GhostType,
  type GhostMode,
  type CellType
} from './constants';

describe('constants', () => {
  it('should have correct tile size', () => {
    expect(TILE_SIZE).toBe(20);
  });

  it('should have correct maze dimensions', () => {
    expect(MAZE_WIDTH).toBe(28);
    expect(MAZE_HEIGHT).toBe(31);
  });

  it('should have all directions defined', () => {
    expect(DIRECTIONS.UP).toBe('up');
    expect(DIRECTIONS.DOWN).toBe('down');
    expect(DIRECTIONS.LEFT).toBe('left');
    expect(DIRECTIONS.RIGHT).toBe('right');
  });

  it('should have all game states defined', () => {
    expect(GAME_STATES.READY).toBe('ready');
    expect(GAME_STATES.PLAYING).toBe('playing');
    expect(GAME_STATES.PAUSED).toBe('paused');
    expect(GAME_STATES.WON).toBe('won');
    expect(GAME_STATES.LOST).toBe('lost');
  });

  it('should have all ghost types defined', () => {
    expect(GHOST_TYPES.BLINKY).toBe('blinky');
    expect(GHOST_TYPES.PINKY).toBe('pinky');
    expect(GHOST_TYPES.INKY).toBe('inky');
    expect(GHOST_TYPES.CLYDE).toBe('clyde');
  });

  it('should have all ghost modes defined', () => {
    expect(GHOST_MODES.CHASE).toBe('chase');
    expect(GHOST_MODES.SCATTER).toBe('scatter');
    expect(GHOST_MODES.FRIGHTENED).toBe('frightened');
  });

  it('should have all cell types defined', () => {
    expect(CELL_TYPES.WALL).toBe('wall');
    expect(CELL_TYPES.PATH).toBe('path');
    expect(CELL_TYPES.TUNNEL).toBe('tunnel');
    expect(CELL_TYPES.GHOST_HOUSE).toBe('ghost-house');
    expect(CELL_TYPES.GHOST_DOOR).toBe('ghost-door');
  });

  // Type checking tests (compile-time verification)
  it('should have correct types', () => {
    const dir: Direction = DIRECTIONS.UP;
    const state: GameState = GAME_STATES.PLAYING;
    const ghost: GhostType = GHOST_TYPES.BLINKY;
    const mode: GhostMode = GHOST_MODES.CHASE;
    const cell: CellType = CELL_TYPES.WALL;

    expect(dir).toBeDefined();
    expect(state).toBeDefined();
    expect(ghost).toBeDefined();
    expect(mode).toBeDefined();
    expect(cell).toBeDefined();
  });
});
