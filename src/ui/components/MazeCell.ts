/**
 * MazeCell Component
 *
 * A single cell in the Pacman maze grid.
 * Can be a wall (barrier), path (traversable), tunnel (wrap-around),
 * ghost-house (spawn area), or ghost-door (entrance to ghost house).
 */

export type MazeCellType = 'wall' | 'path' | 'tunnel' | 'ghost-house' | 'ghost-door';

export interface MazeCellProps {
  type?: MazeCellType;
}

/**
 * Creates a maze cell DOM element
 * @param props - MazeCell properties
 * @returns HTMLDivElement representing the maze cell
 */
export function createMazeCell(props: MazeCellProps): HTMLDivElement {
  const { type = 'path' } = props;

  const cell = document.createElement('div');

  // Base class
  cell.classList.add('maze-cell');

  // Type modifier class
  cell.classList.add(`maze-cell--${type}`);

  // Data attribute for easy type access
  cell.dataset.cellType = type;

  // Accessibility - maze cells are decorative/structural
  cell.setAttribute('role', 'presentation');

  return cell;
}
