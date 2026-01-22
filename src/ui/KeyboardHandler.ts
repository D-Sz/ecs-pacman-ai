/**
 * KeyboardHandler
 *
 * Translates browser keyboard events to game input events.
 * Connects physical keyboard input to the EventBus.
 */

import type { EventBus } from '../events';
import type { Direction } from '../types';
import { GameEvents } from '../types';

/**
 * KeyboardHandler interface
 */
export interface KeyboardHandler {
  /** Clean up event listeners */
  destroy(): void;
}

/**
 * Key mappings for directions
 */
const DIRECTION_KEYS: Record<string, Direction> = {
  arrowleft: 'left',
  arrowright: 'right',
  arrowup: 'up',
  arrowdown: 'down',
  a: 'left',
  d: 'right',
  w: 'up',
  s: 'down',
};

/**
 * Keys that should have default action prevented
 */
const PREVENT_DEFAULT_KEYS = new Set([
  'arrowleft',
  'arrowright',
  'arrowup',
  'arrowdown',
  ' ',
]);

/**
 * Create a KeyboardHandler
 * @param eventBus - The event bus to dispatch events to
 * @returns A KeyboardHandler instance
 */
export function createKeyboardHandler(eventBus: EventBus): KeyboardHandler {
  /**
   * Handle keydown events
   */
  const handleKeyDown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();

    // Prevent default for game keys
    if (PREVENT_DEFAULT_KEYS.has(key)) {
      event.preventDefault();
    }

    // Ignore repeated key events (key held down)
    if (event.repeat) {
      return;
    }

    // Direction input
    const direction = DIRECTION_KEYS[key];
    if (direction) {
      eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction });
      return;
    }

    // Start game
    if (key === 'enter' || key === ' ') {
      event.preventDefault();
      eventBus.dispatch(GameEvents.INPUT_START, undefined);
      return;
    }

    // Pause/Resume
    if (key === 'p' || key === 'escape') {
      eventBus.dispatch(GameEvents.INPUT_PAUSE, undefined);
      return;
    }

    // Restart
    if (key === 'r') {
      eventBus.dispatch(GameEvents.INPUT_RESTART, undefined);
      return;
    }
  };

  // Add event listener
  window.addEventListener('keydown', handleKeyDown);

  /**
   * Clean up event listeners
   */
  const destroy = (): void => {
    window.removeEventListener('keydown', handleKeyDown);
  };

  return {
    destroy,
  };
}
