/**
 * MazeLayout Component
 *
 * Renders the game maze as a grid of cells.
 * Each cell can be a wall, path, tunnel, ghost-house, or ghost-door.
 */

import { createMazeCell, type MazeCellType } from './MazeCell';

export interface MazeCellData {
  type: MazeCellType;
}

export interface MazeLayoutProps {
  mazeData: MazeCellData[][];
  cellSize?: number;
}

/**
 * Creates a MazeLayout DOM element
 * @param props - MazeLayout properties
 * @returns HTMLDivElement representing the maze
 */
export function createMazeLayout(props: MazeLayoutProps): HTMLDivElement {
  const { mazeData, cellSize = 20 } = props;

  const maze = document.createElement('div');

  // Base class
  maze.classList.add('maze-layout');

  // Set CSS custom property for cell size
  maze.style.setProperty('--cell-size', `${cellSize}px`);

  // Data attributes
  const height = mazeData.length;
  const width = height > 0 ? mazeData[0].length : 0;

  maze.dataset.cellSize = String(cellSize);
  maze.dataset.width = String(width);
  maze.dataset.height = String(height);

  // Accessibility attributes
  maze.setAttribute('role', 'grid');
  maze.setAttribute('aria-label', 'Game maze');

  // Build maze grid
  mazeData.forEach((rowData, y) => {
    const row = document.createElement('div');
    row.classList.add('maze-layout__row');
    row.setAttribute('role', 'row');

    rowData.forEach((cellData, x) => {
      const cell = createMazeCell({ type: cellData.type });

      // Add coordinate data attributes
      cell.setAttribute('data-x', String(x));
      cell.setAttribute('data-y', String(y));

      row.appendChild(cell);
    });

    maze.appendChild(row);
  });

  return maze;
}
