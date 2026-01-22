/**
 * GameView
 *
 * Connects the game logic (GameController) to the UI rendering layer.
 * Manages the render loop and updates the DOM based on game state.
 */

import type { GameController } from '../logic/GameController';
import { createGameLayout } from './components/GameLayout';
import { createPacman, type PacmanDirection } from './components/Pacman';
import { createGhost, type GhostState as GhostUIState } from './components/Ghost';
import { createPellet } from './components/Pellet';
import { createPowerPellet } from './components/PowerPellet';
import { ORIGINAL_MAZE } from '../data/originalMaze';
import {
  getScore,
  getLives,
  getLevel,
  getGameState,
  getPlayerPosition,
  getPlayerDirection,
  getAllGhostsState,
  getAllPellets,
  getPowerPellets,
} from '../selectors';
import { TILE_SIZE } from '../utils/constants';

export interface GameViewOptions {
  cellSize?: number;
  highScore?: number;
}

export interface GameView {
  /** Render the current game state */
  render(): void;
  /** Start the render loop */
  start(): void;
  /** Stop the render loop */
  stop(): void;
  /** Clean up resources */
  destroy(): void;
}

/**
 * Create a GameView
 * @param controller - The game controller
 * @param container - The container element to render into
 * @param options - Optional configuration
 * @returns A GameView instance
 */
export function createGameView(
  controller: GameController,
  container: HTMLElement,
  options: GameViewOptions = {}
): GameView {
  const { cellSize = TILE_SIZE, highScore = 0 } = options;

  let animationFrameId: number | null = null;
  let lastTime = 0;
  let entityLayer: HTMLElement | null = null;

  /**
   * Get overlay message based on game state
   */
  const getOverlayMessage = (): { show: boolean; message: string } => {
    const world = controller.getWorld();
    const state = getGameState(world);

    switch (state) {
    case 'ready':
      return { show: true, message: 'Ready!' };
    case 'paused':
      return { show: true, message: 'Paused' };
    case 'won':
      return { show: true, message: 'You Win!' };
    case 'lost':
      return { show: true, message: 'Game Over' };
    case 'dying':
      return { show: true, message: 'Oops!' };
    default:
      return { show: false, message: '' };
    }
  };

  /**
   * Convert ghost mode to UI state
   */
  const getGhostUIState = (ghost: ReturnType<typeof getAllGhostsState>[0]): GhostUIState => {
    if (ghost.mode === 'eaten') {
      return 'eyes-only';
    }
    if (ghost.isFlashing) {
      return 'flashing';
    }
    if (ghost.isVulnerable) {
      return 'frightened';
    }
    return 'normal';
  };

  /**
   * Create the entity layer that sits on top of the maze
   */
  const createEntityLayer = (): HTMLElement => {
    const layer = document.createElement('div');
    layer.classList.add('entity-layer');
    layer.style.position = 'absolute';
    layer.style.top = '0';
    layer.style.left = '0';
    layer.style.width = '100%';
    layer.style.height = '100%';
    layer.style.pointerEvents = 'none';
    return layer;
  };

  /**
   * Render Pacman onto the entity layer
   */
  const renderPacman = (layer: HTMLElement): void => {
    const world = controller.getWorld();
    const position = getPlayerPosition(world);
    const direction = getPlayerDirection(world);

    if (!position) return;

    const pacman = createPacman({
      direction: (direction as PacmanDirection) || 'right',
      eating: false,
    });

    pacman.style.position = 'absolute';
    pacman.style.left = `${position.pixelX}px`;
    pacman.style.top = `${position.pixelY}px`;
    // Note: Don't set transform here - the CSS direction classes already include
    // translate(-50%, -50%) with rotation

    layer.appendChild(pacman);
  };

  /**
   * Render all ghosts onto the entity layer
   */
  const renderGhosts = (layer: HTMLElement): void => {
    const world = controller.getWorld();
    const ghosts = getAllGhostsState(world);

    for (const ghostState of ghosts) {
      const velocity = world.entities.getComponent(ghostState.id, 'velocity');
      const lookDirection = velocity?.direction || 'right';

      const ghost = createGhost({
        type: ghostState.type,
        state: getGhostUIState(ghostState),
        lookDirection: lookDirection as 'right' | 'left' | 'up' | 'down',
      });

      ghost.style.position = 'absolute';
      ghost.style.left = `${ghostState.position.pixelX}px`;
      ghost.style.top = `${ghostState.position.pixelY}px`;
      ghost.style.transform = 'translate(-50%, -50%)';

      layer.appendChild(ghost);
    }
  };

  /**
   * Render all pellets onto the entity layer
   */
  const renderPellets = (layer: HTMLElement): void => {
    const world = controller.getWorld();
    const pellets = getAllPellets(world);
    const powerPelletIds = new Set(getPowerPellets(world));

    for (const pelletId of pellets) {
      const position = world.entities.getComponent(pelletId, 'position');
      if (!position) continue;

      const isPowerPellet = powerPelletIds.has(pelletId);
      const element = isPowerPellet
        ? createPowerPellet({ animated: true })
        : createPellet({ size: 'small' });

      element.style.position = 'absolute';
      // Center pellet in cell
      element.style.left = `${position.gridX * cellSize + cellSize / 2}px`;
      element.style.top = `${position.gridY * cellSize + cellSize / 2}px`;
      element.style.transform = 'translate(-50%, -50%)';

      layer.appendChild(element);
    }
  };

  /**
   * Render the full game state
   */
  const render = (): void => {
    const world = controller.getWorld();
    const overlay = getOverlayMessage();

    // Clear container
    container.innerHTML = '';

    // Create game layout
    const layout = createGameLayout({
      score: getScore(world),
      highScore,
      lives: getLives(world),
      level: getLevel(world),
      mazeData: ORIGINAL_MAZE,
      cellSize,
      showOverlay: overlay.show,
      overlayMessage: overlay.message,
    });

    // Find maze container for entity positioning
    const mazeContainer = layout.querySelector('.game-layout__maze-container');
    if (mazeContainer) {
      (mazeContainer as HTMLElement).style.position = 'relative';

      // Create entity layer
      entityLayer = createEntityLayer();

      // Render all entities
      renderPellets(entityLayer);
      renderPacman(entityLayer);
      renderGhosts(entityLayer);

      mazeContainer.appendChild(entityLayer);
    }

    container.appendChild(layout);
  };

  /**
   * Game loop callback
   */
  const gameLoop = (currentTime: number): void => {
    // Calculate delta time
    const deltaTime = lastTime === 0 ? 16 : currentTime - lastTime;
    lastTime = currentTime;

    // Update game logic
    controller.update(deltaTime);

    // Render
    render();

    // Continue loop
    animationFrameId = requestAnimationFrame(gameLoop);
  };

  /**
   * Start the render loop
   */
  const start = (): void => {
    if (animationFrameId === null) {
      lastTime = 0;
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  };

  /**
   * Stop the render loop
   */
  const stop = (): void => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  /**
   * Clean up resources
   */
  const destroy = (): void => {
    stop();
    container.innerHTML = '';
    entityLayer = null;
  };

  return {
    render,
    start,
    stop,
    destroy,
  };
}
