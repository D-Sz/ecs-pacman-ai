/**
 * GameLayout Component
 *
 * The main game container that combines the ScoreBoard and MazeLayout.
 * Also handles overlay messages (Ready!, Game Over, Paused, etc.)
 */

import { createScoreBoard } from './ScoreBoard';
import { createMazeLayout, type MazeCellData } from './MazeLayout';

export interface GameLayoutProps {
  score: number;
  highScore: number;
  lives: number;
  level: number;
  mazeData: MazeCellData[][];
  cellSize?: number;
  showOverlay?: boolean;
  overlayMessage?: string;
}

/**
 * Creates a GameLayout DOM element
 * @param props - GameLayout properties
 * @returns HTMLDivElement representing the game layout
 */
export function createGameLayout(props: GameLayoutProps): HTMLDivElement {
  const {
    score,
    highScore,
    lives,
    level,
    mazeData,
    cellSize = 20,
    showOverlay = false,
    overlayMessage = ''
  } = props;

  const layout = document.createElement('div');

  // Base class
  layout.classList.add('game-layout');

  // Data attributes
  layout.dataset.score = String(score);
  layout.dataset.level = String(level);
  layout.dataset.lives = String(lives);

  // Accessibility attributes
  layout.setAttribute('role', 'application');
  layout.setAttribute('aria-label', 'Pacman game');

  // Create scoreboard
  const scoreboard = createScoreBoard({
    score,
    highScore,
    lives,
    level
  });

  // Create maze container
  const mazeContainer = document.createElement('div');
  mazeContainer.classList.add('game-layout__maze-container');

  // Create maze
  const maze = createMazeLayout({
    mazeData,
    cellSize
  });

  mazeContainer.appendChild(maze);

  // Create overlay if needed
  if (showOverlay && overlayMessage) {
    const overlay = document.createElement('div');
    overlay.classList.add('game-layout__overlay');

    const message = document.createElement('div');
    message.classList.add('game-layout__message');
    message.textContent = overlayMessage;

    overlay.appendChild(message);
    mazeContainer.appendChild(overlay);
  }

  // Assemble layout
  layout.appendChild(scoreboard);
  layout.appendChild(mazeContainer);

  return layout;
}
