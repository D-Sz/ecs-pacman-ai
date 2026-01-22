/**
 * PowerPellet Component
 *
 * A larger pellet that grants Pacman the ability to eat ghosts.
 * Features a pulsing animation to distinguish from regular pellets.
 * Positioned in the four corners of the maze.
 */

export interface PowerPelletProps {
  animated?: boolean;
}

/**
 * Creates a power pellet DOM element
 * @param props - PowerPellet properties
 * @returns HTMLDivElement representing the power pellet
 */
export function createPowerPellet(props: PowerPelletProps): HTMLDivElement {
  const { animated = true } = props;

  const powerPellet = document.createElement('div');

  // Base class
  powerPellet.classList.add('power-pellet');

  // Animation modifier class
  if (animated) {
    powerPellet.classList.add('power-pellet--animated');
  }

  // Accessibility attributes
  powerPellet.setAttribute('role', 'img');
  powerPellet.setAttribute('aria-label', 'power pellet');

  return powerPellet;
}
