/**
 * Pacman Component
 *
 * The player character - a yellow circle with an animated mouth.
 * Rotates based on movement direction.
 * Mouth opens and closes when eating.
 */

export type PacmanDirection = 'right' | 'left' | 'up' | 'down';

export interface PacmanProps {
  direction?: PacmanDirection;
  eating?: boolean;
}

/**
 * Creates a Pacman DOM element
 * @param props - Pacman properties
 * @returns HTMLDivElement representing Pacman
 */
export function createPacman(props: PacmanProps): HTMLDivElement {
  const { direction = 'right', eating = false } = props;

  const pacman = document.createElement('div');

  // Base class
  pacman.classList.add('pacman');

  // Direction modifier class (for rotation)
  pacman.classList.add(`pacman--${direction}`);

  // Eating animation class
  if (eating) {
    pacman.classList.add('pacman--eating');
  }

  // Data attributes for state access
  pacman.dataset.direction = direction;
  pacman.dataset.eating = String(eating);

  // Accessibility attributes
  pacman.setAttribute('role', 'img');
  pacman.setAttribute('aria-label', 'Pacman');

  return pacman;
}
