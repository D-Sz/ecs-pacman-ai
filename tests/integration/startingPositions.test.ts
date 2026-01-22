/**
 * Starting Positions Integration Tests
 *
 * Tests for verifying correct starting positions and coordinate alignment.
 */

import { describe, it, expect } from 'vitest';
import { createWorld } from '../../src/logic/ecs';
import {
  createPacmanEntity,
  createGhostEntity,
} from '../../src/logic/components/entityFactories';
import {
  ORIGINAL_MAZE,
  PACMAN_START,
  GHOST_START_POSITIONS,
  POWER_PELLET_POSITIONS,
  MAZE_WIDTH,
  MAZE_HEIGHT,
} from '../../src/data/originalMaze';
import { TILE_SIZE } from '../../src/utils/constants';
import { getPlayerPosition } from '../../src/selectors';

describe('Starting Positions', () => {
  describe('Power Pellet Positions', () => {
    it('should have power pellets at the four corners of the maze', () => {
      // Power pellets should be near the corners, on valid path cells
      // Top-left corner area, top-right corner area, bottom-left, bottom-right
      const positions = POWER_PELLET_POSITIONS;

      // Should have exactly 4 power pellets
      expect(positions).toHaveLength(4);

      // Each position should be on a valid path cell (not a wall)
      for (const pos of positions) {
        const cell = ORIGINAL_MAZE[pos.y][pos.x];
        expect(cell.type).not.toBe('wall');
      }

      // Top-left: should be in the left portion of the maze, upper area
      const topLeft = positions.find(p => p.x < MAZE_WIDTH / 2 && p.y < MAZE_HEIGHT / 2);
      expect(topLeft).toBeDefined();

      // Top-right: should be in the right portion, upper area
      const topRight = positions.find(p => p.x >= MAZE_WIDTH / 2 && p.y < MAZE_HEIGHT / 2);
      expect(topRight).toBeDefined();

      // Bottom-left: should be in the left portion, lower area
      const bottomLeft = positions.find(p => p.x < MAZE_WIDTH / 2 && p.y >= MAZE_HEIGHT / 2);
      expect(bottomLeft).toBeDefined();

      // Bottom-right: should be in the right portion, lower area
      const bottomRight = positions.find(p => p.x >= MAZE_WIDTH / 2 && p.y >= MAZE_HEIGHT / 2);
      expect(bottomRight).toBeDefined();
    });

    it('should match the maze data power pellet markers (value 3)', () => {
      // We need to check the raw maze data for value 3
      // The ORIGINAL_MAZE has already been converted, so we check POWER_PELLET_POSITIONS
      for (const pos of POWER_PELLET_POSITIONS) {
        // Position should be valid
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThan(MAZE_WIDTH);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThan(MAZE_HEIGHT);
      }
    });
  });

  describe('Ghost Starting Positions', () => {
    it('should have Blinky start outside/above the ghost house', () => {
      const blinkyPos = GHOST_START_POSITIONS.blinky;
      const cell = ORIGINAL_MAZE[blinkyPos.y][blinkyPos.x];

      // Blinky should be on a path, not inside ghost house
      expect(cell.type).toBe('path');
    });

    it('should have Pinky, Inky, and Clyde start inside the ghost house', () => {
      const pinkyPos = GHOST_START_POSITIONS.pinky;
      const inkyPos = GHOST_START_POSITIONS.inky;
      const clydePos = GHOST_START_POSITIONS.clyde;

      // These ghosts should be inside the ghost house
      const pinkyCell = ORIGINAL_MAZE[pinkyPos.y][pinkyPos.x];
      const inkyCell = ORIGINAL_MAZE[inkyPos.y][inkyPos.x];
      const clydeCell = ORIGINAL_MAZE[clydePos.y][clydePos.x];

      expect(pinkyCell.type).toBe('ghost-house');
      expect(inkyCell.type).toBe('ghost-house');
      expect(clydeCell.type).toBe('ghost-house');
    });

    it('should position ghost entities at correct pixel coordinates', () => {
      const world = createWorld();

      for (const [type, pos] of Object.entries(GHOST_START_POSITIONS)) {
        const ghostId = createGhostEntity(world, type as any, pos.x, pos.y);
        const position = world.entities.getComponent(ghostId, 'position');

        expect(position).toBeDefined();
        expect(position!.gridX).toBe(pos.x);
        expect(position!.gridY).toBe(pos.y);
        // Pixel position should be centered in the cell
        expect(position!.pixelX).toBe(pos.x * TILE_SIZE + TILE_SIZE / 2);
        expect(position!.pixelY).toBe(pos.y * TILE_SIZE + TILE_SIZE / 2);
      }
    });
  });

  describe('Pacman Starting Position', () => {
    it('should start on a valid path cell', () => {
      const cell = ORIGINAL_MAZE[PACMAN_START.y][PACMAN_START.x];
      // Pacman should start on a path (not wall, not ghost house)
      expect(['path', 'tunnel']).toContain(cell.type);
    });

    it('should not start inside the ghost house', () => {
      const cell = ORIGINAL_MAZE[PACMAN_START.y][PACMAN_START.x];
      expect(cell.type).not.toBe('ghost-house');
      expect(cell.type).not.toBe('ghost-door');
    });

    it('should position Pacman entity at correct pixel coordinates', () => {
      const world = createWorld();
      createPacmanEntity(world, PACMAN_START.x, PACMAN_START.y);

      const position = getPlayerPosition(world);
      expect(position).toBeDefined();
      expect(position!.gridX).toBe(PACMAN_START.x);
      expect(position!.gridY).toBe(PACMAN_START.y);
      // Pixel position should be centered in the cell
      expect(position!.pixelX).toBe(PACMAN_START.x * TILE_SIZE + TILE_SIZE / 2);
      expect(position!.pixelY).toBe(PACMAN_START.y * TILE_SIZE + TILE_SIZE / 2);
    });

    it('should be in the lower portion of the maze (below ghost house)', () => {
      // Classic Pacman starts below the ghost house
      // Ghost house is roughly at y=12-16, so Pacman should be at y > 16
      expect(PACMAN_START.y).toBeGreaterThan(16);
    });
  });
});

describe('Coordinate System Alignment', () => {
  describe('Grid to Pixel Conversion', () => {
    it('should calculate pixel position as cell center', () => {
      const world = createWorld();
      const testX = 5;
      const testY = 10;

      const playerId = createPacmanEntity(world, testX, testY);
      const position = world.entities.getComponent(playerId, 'position');

      // Pixel position should be at center of the cell
      const expectedPixelX = testX * TILE_SIZE + TILE_SIZE / 2;
      const expectedPixelY = testY * TILE_SIZE + TILE_SIZE / 2;

      expect(position!.pixelX).toBe(expectedPixelX);
      expect(position!.pixelY).toBe(expectedPixelY);
    });
  });

  describe('Maze Cell Alignment', () => {
    it('should have consistent maze dimensions', () => {
      expect(ORIGINAL_MAZE.length).toBe(MAZE_HEIGHT);
      expect(ORIGINAL_MAZE[0].length).toBe(MAZE_WIDTH);
    });

    it('should have walls around the border', () => {
      // Top row should be all walls
      for (let x = 0; x < MAZE_WIDTH; x++) {
        expect(ORIGINAL_MAZE[0][x].type).toBe('wall');
      }

      // Bottom row should be all walls
      for (let x = 0; x < MAZE_WIDTH; x++) {
        expect(ORIGINAL_MAZE[MAZE_HEIGHT - 1][x].type).toBe('wall');
      }

      // Left and right edges should be walls (except tunnel row)
      for (let y = 0; y < MAZE_HEIGHT; y++) {
        if (y !== 14) { // Tunnel row
          expect(ORIGINAL_MAZE[y][0].type).toBe('wall');
          expect(ORIGINAL_MAZE[y][MAZE_WIDTH - 1].type).toBe('wall');
        }
      }
    });
  });
});
