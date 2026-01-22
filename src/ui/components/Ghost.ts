/**
 * Ghost Component
 *
 * The enemy characters - colored ghosts with eyes that track direction.
 * Four types: Blinky (red), Pinky (pink), Inky (cyan), Clyde (orange).
 * States: normal, frightened (blue), flashing (power ending), eyes-only (returning).
 */

export type GhostType = 'blinky' | 'pinky' | 'inky' | 'clyde';
export type GhostState = 'normal' | 'frightened' | 'flashing' | 'eyes-only';
export type GhostLookDirection = 'right' | 'left' | 'up' | 'down';

export interface GhostProps {
  type: GhostType;
  state?: GhostState;
  lookDirection?: GhostLookDirection;
}

/**
 * Creates a Ghost DOM element
 * @param props - Ghost properties
 * @returns HTMLDivElement representing a Ghost
 */
export function createGhost(props: GhostProps): HTMLDivElement {
  const { type, state = 'normal', lookDirection = 'right' } = props;

  const ghost = document.createElement('div');

  // Base class
  ghost.classList.add('ghost');

  // Type modifier class (for color)
  ghost.classList.add(`ghost--${type}`);

  // State modifier classes
  if (state === 'frightened') {
    ghost.classList.add('ghost--frightened');
  } else if (state === 'flashing') {
    ghost.classList.add('ghost--frightened');
    ghost.classList.add('ghost--flashing');
  } else if (state === 'eyes-only') {
    ghost.classList.add('ghost--eyes-only');
  }

  // Look direction modifier class
  ghost.classList.add(`ghost--look-${lookDirection}`);

  // Data attributes for state access
  ghost.dataset.type = type;
  ghost.dataset.state = state;
  ghost.dataset.lookDirection = lookDirection;

  // Accessibility attributes
  ghost.setAttribute('role', 'img');
  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
  const ariaLabel = state === 'frightened' || state === 'flashing'
    ? `${capitalizedType} ghost (frightened)`
    : `${capitalizedType} ghost`;
  ghost.setAttribute('aria-label', ariaLabel);

  // Build ghost structure
  // Body (rounded top)
  const body = document.createElement('div');
  body.classList.add('ghost__body');

  // Eyes container
  const eyes = document.createElement('div');
  eyes.classList.add('ghost__eyes');

  // Left eye
  const leftEye = document.createElement('div');
  leftEye.classList.add('ghost__eye');
  const leftPupil = document.createElement('div');
  leftPupil.classList.add('ghost__pupil');
  leftEye.appendChild(leftPupil);

  // Right eye
  const rightEye = document.createElement('div');
  rightEye.classList.add('ghost__eye');
  const rightPupil = document.createElement('div');
  rightPupil.classList.add('ghost__pupil');
  rightEye.appendChild(rightPupil);

  eyes.appendChild(leftEye);
  eyes.appendChild(rightEye);
  body.appendChild(eyes);

  // Skirt (wavy bottom)
  const skirt = document.createElement('div');
  skirt.classList.add('ghost__skirt');

  // Three waves for the skirt
  for (let i = 0; i < 3; i++) {
    const wave = document.createElement('div');
    wave.classList.add('ghost__skirt-wave');
    skirt.appendChild(wave);
  }

  // Assemble ghost
  ghost.appendChild(body);
  ghost.appendChild(skirt);

  return ghost;
}
