/**
 * Pellet Component
 *
 * A simple dot that Pacman eats to score points.
 * CSS-styled circular element with size variants.
 */

export type PelletSize = 'small' | 'medium' | 'large';

export interface PelletProps {
  size?: PelletSize;
}

/**
 * Creates a pellet DOM element
 * @param props - Pellet properties
 * @returns HTMLDivElement representing the pellet
 */
export function createPellet(props: PelletProps): HTMLDivElement {
  const { size = 'small' } = props;

  const pellet = document.createElement('div');

  // Base class
  pellet.classList.add('pellet');

  // Size modifier class
  pellet.classList.add(`pellet--${size}`);

  // Accessibility attributes
  pellet.setAttribute('role', 'img');
  pellet.setAttribute('aria-label', 'pellet');

  return pellet;
}
