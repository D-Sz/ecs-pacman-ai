import { describe, it, expect, beforeEach } from 'vitest';
import { createMazeLayout, type MazeCellData } from './MazeLayout';

describe('MazeLayout Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  // Simple 3x3 test maze
  const simpleMaze: MazeCellData[][] = [
    [{ type: 'wall' }, { type: 'wall' }, { type: 'wall' }],
    [{ type: 'wall' }, { type: 'path' }, { type: 'wall' }],
    [{ type: 'wall' }, { type: 'wall' }, { type: 'wall' }],
  ];

  describe('createMazeLayout', () => {
    it('should create a maze layout element', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      expect(maze).toBeInstanceOf(HTMLElement);
    });

    it('should have the base maze-layout class', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      expect(maze.classList.contains('maze-layout')).toBe(true);
    });

    it('should be a div element', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      expect(maze.tagName).toBe('DIV');
    });
  });

  describe('grid structure', () => {
    it('should create correct number of rows', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      const rows = maze.querySelectorAll('.maze-layout__row');
      expect(rows.length).toBe(3);
    });

    it('should create correct number of cells per row', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      const firstRow = maze.querySelector('.maze-layout__row');
      const cells = firstRow?.querySelectorAll('.maze-cell');
      expect(cells?.length).toBe(3);
    });

    it('should create total correct number of cells', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      const cells = maze.querySelectorAll('.maze-cell');
      expect(cells.length).toBe(9); // 3x3 = 9
    });

    it('should handle larger mazes', () => {
      const largeMaze: MazeCellData[][] = Array(10).fill(null).map(() =>
        Array(10).fill(null).map(() => ({ type: 'path' as const }))
      );
      const maze = createMazeLayout({ mazeData: largeMaze });
      const cells = maze.querySelectorAll('.maze-cell');
      expect(cells.length).toBe(100); // 10x10 = 100
    });
  });

  describe('cell types', () => {
    it('should render wall cells with correct class', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      const wallCells = maze.querySelectorAll('.maze-cell--wall');
      expect(wallCells.length).toBe(8); // All border cells are walls
    });

    it('should render path cells with correct class', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      const pathCells = maze.querySelectorAll('.maze-cell--path');
      expect(pathCells.length).toBe(1); // Only center is path
    });

    it('should render tunnel cells', () => {
      const mazeWithTunnel: MazeCellData[][] = [
        [{ type: 'tunnel' }, { type: 'path' }, { type: 'tunnel' }],
      ];
      const maze = createMazeLayout({ mazeData: mazeWithTunnel });
      const tunnelCells = maze.querySelectorAll('.maze-cell--tunnel');
      expect(tunnelCells.length).toBe(2);
    });

    it('should render ghost-house cells', () => {
      const mazeWithGhostHouse: MazeCellData[][] = [
        [{ type: 'ghost-house' }, { type: 'ghost-house' }],
      ];
      const maze = createMazeLayout({ mazeData: mazeWithGhostHouse });
      const ghostHouseCells = maze.querySelectorAll('.maze-cell--ghost-house');
      expect(ghostHouseCells.length).toBe(2);
    });

    it('should render ghost-door cells', () => {
      const mazeWithDoor: MazeCellData[][] = [
        [{ type: 'wall' }, { type: 'ghost-door' }, { type: 'wall' }],
      ];
      const maze = createMazeLayout({ mazeData: mazeWithDoor });
      const doorCells = maze.querySelectorAll('.maze-cell--ghost-door');
      expect(doorCells.length).toBe(1);
    });
  });

  describe('cell size', () => {
    it('should apply default cell size of 20px', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      expect(maze.dataset.cellSize).toBe('20');
    });

    it('should apply custom cell size', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze, cellSize: 16 });
      expect(maze.dataset.cellSize).toBe('16');
    });

    it('should set CSS custom property for cell size', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze, cellSize: 24 });
      expect(maze.style.getPropertyValue('--cell-size')).toBe('24px');
    });
  });

  describe('dimensions', () => {
    it('should have data-width attribute', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      expect(maze.dataset.width).toBe('3');
    });

    it('should have data-height attribute', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      expect(maze.dataset.height).toBe('3');
    });

    it('should handle non-square mazes', () => {
      const rectMaze: MazeCellData[][] = [
        [{ type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }],
        [{ type: 'wall' }, { type: 'path' }, { type: 'path' }, { type: 'path' }, { type: 'wall' }],
        [{ type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }, { type: 'wall' }],
      ];
      const maze = createMazeLayout({ mazeData: rectMaze });
      expect(maze.dataset.width).toBe('5');
      expect(maze.dataset.height).toBe('3');
    });
  });

  describe('cell coordinates', () => {
    it('should set data-x and data-y on cells', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      const cells = maze.querySelectorAll('.maze-cell');

      // Check first cell (0,0)
      expect(cells[0].getAttribute('data-x')).toBe('0');
      expect(cells[0].getAttribute('data-y')).toBe('0');

      // Check center cell (1,1) - which is index 4 in a 3x3 grid
      expect(cells[4].getAttribute('data-x')).toBe('1');
      expect(cells[4].getAttribute('data-y')).toBe('1');
    });

    it('should set correct coordinates for all cells', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      const cells = maze.querySelectorAll('.maze-cell');

      // Last cell should be (2,2)
      expect(cells[8].getAttribute('data-x')).toBe('2');
      expect(cells[8].getAttribute('data-y')).toBe('2');
    });
  });

  describe('DOM structure', () => {
    it('should be appendable to DOM', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      document.body.appendChild(maze);
      expect(document.querySelector('.maze-layout')).toBeTruthy();
    });

    it('should have rows as direct children', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      const directChildren = Array.from(maze.children);
      expect(directChildren.every(child => child.classList.contains('maze-layout__row'))).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have role="grid"', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      expect(maze.getAttribute('role')).toBe('grid');
    });

    it('should have aria-label', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      expect(maze.getAttribute('aria-label')).toBe('Game maze');
    });

    it('should have rows with role="row"', () => {
      const maze = createMazeLayout({ mazeData: simpleMaze });
      const rows = maze.querySelectorAll('.maze-layout__row');
      rows.forEach(row => {
        expect(row.getAttribute('role')).toBe('row');
      });
    });
  });

  describe('empty maze handling', () => {
    it('should handle empty maze data', () => {
      const maze = createMazeLayout({ mazeData: [] });
      const rows = maze.querySelectorAll('.maze-layout__row');
      expect(rows.length).toBe(0);
    });

    it('should handle maze with empty rows', () => {
      const maze = createMazeLayout({ mazeData: [[]] });
      const cells = maze.querySelectorAll('.maze-cell');
      expect(cells.length).toBe(0);
    });
  });
});
