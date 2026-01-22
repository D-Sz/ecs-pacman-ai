/**
 * Main Entry Point
 *
 * Initializes the Pacman game by wiring together:
 * - GameController (logic orchestration)
 * - GameView (UI rendering)
 * - KeyboardHandler (input handling)
 */

import { createGameController } from './logic/GameController';
import { createGameView } from './ui/GameView';
import { createKeyboardHandler } from './ui/KeyboardHandler';
import { TILE_SIZE } from './utils/constants';

/**
 * Initialize the game
 */
function initGame(): void {
  // Get container element
  const container = document.getElementById('app');
  if (!container) {
    throw new Error('Could not find #app container element');
  }

  // Create game controller
  const controller = createGameController();
  controller.init();

  // Create game view
  const view = createGameView(controller, container, {
    cellSize: TILE_SIZE,
    highScore: getStoredHighScore(),
  });

  // Create keyboard handler
  const keyboard = createKeyboardHandler(controller.getEventBus());

  // Start the game loop
  view.start();

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    view.destroy();
    keyboard.destroy();
    controller.destroy();
  });

  // Initial render
  view.render();
}

/**
 * Get high score from localStorage
 */
function getStoredHighScore(): number {
  try {
    const stored = localStorage.getItem('pacman-high-score');
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
