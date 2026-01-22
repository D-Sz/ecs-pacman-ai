/**
 * GameView Tests
 *
 * Tests for the main game view that connects logic to UI rendering.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createGameView, type GameView } from './GameView';
import { createGameController, type GameController } from '../logic/GameController';

describe('GameView', () => {
  let container: HTMLDivElement;
  let controller: GameController;
  let view: GameView;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    controller = createGameController();
    controller.init();
  });

  afterEach(() => {
    if (view) {
      view.destroy();
    }
    container.remove();
  });

  describe('creation', () => {
    it('should create a game view', () => {
      view = createGameView(controller, container);
      expect(view).toBeDefined();
    });

    it('should render initial game layout', () => {
      view = createGameView(controller, container);
      view.render();
      expect(container.querySelector('.game-layout')).not.toBeNull();
    });

    it('should render the maze', () => {
      view = createGameView(controller, container);
      view.render();
      expect(container.querySelector('.maze-layout')).not.toBeNull();
    });

    it('should render the scoreboard', () => {
      view = createGameView(controller, container);
      view.render();
      expect(container.querySelector('.scoreboard')).not.toBeNull();
    });
  });

  describe('entity rendering', () => {
    it('should render Pacman', () => {
      view = createGameView(controller, container);
      view.render();
      expect(container.querySelector('.pacman')).not.toBeNull();
    });

    it('should render all four ghosts', () => {
      view = createGameView(controller, container);
      view.render();
      const ghosts = container.querySelectorAll('.ghost');
      expect(ghosts.length).toBe(4);
    });

    it('should render pellets', () => {
      view = createGameView(controller, container);
      view.render();
      const pellets = container.querySelectorAll('.pellet');
      expect(pellets.length).toBeGreaterThan(0);
    });

    it('should render power pellets', () => {
      view = createGameView(controller, container);
      view.render();
      const powerPellets = container.querySelectorAll('.power-pellet');
      expect(powerPellets.length).toBe(4);
    });
  });

  describe('game loop', () => {
    it('should start the render loop', () => {
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
      view = createGameView(controller, container);
      view.start();

      expect(rafSpy).toHaveBeenCalled();
      rafSpy.mockRestore();
    });

    it('should stop the render loop', () => {
      const cafSpy = vi.spyOn(window, 'cancelAnimationFrame');
      view = createGameView(controller, container);
      view.start();
      view.stop();

      expect(cafSpy).toHaveBeenCalled();
      cafSpy.mockRestore();
    });

    it('should call controller.update on each frame', () => {
      vi.useFakeTimers();
      const updateSpy = vi.spyOn(controller, 'update');

      view = createGameView(controller, container);
      view.start();

      // Simulate a frame
      vi.advanceTimersByTime(16);

      // The update should be called
      expect(updateSpy).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('overlay messages', () => {
    it('should show "Ready!" overlay when game is ready', () => {
      view = createGameView(controller, container);
      view.render();
      expect(container.querySelector('.game-layout__message')?.textContent).toBe('Ready!');
    });

    it('should show "Paused" overlay when game is paused', () => {
      view = createGameView(controller, container);
      controller.start();
      controller.pause();
      view.render();
      expect(container.querySelector('.game-layout__message')?.textContent).toBe('Paused');
    });

    it('should not show overlay when game is playing', () => {
      view = createGameView(controller, container);
      controller.start();
      view.render();
      expect(container.querySelector('.game-layout__overlay')).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should clear container on destroy', () => {
      view = createGameView(controller, container);
      view.render();
      view.destroy();
      expect(container.innerHTML).toBe('');
    });

    it('should stop render loop on destroy', () => {
      const cafSpy = vi.spyOn(window, 'cancelAnimationFrame');
      view = createGameView(controller, container);
      view.start();
      view.destroy();
      expect(cafSpy).toHaveBeenCalled();
      cafSpy.mockRestore();
    });
  });

  describe('cell size', () => {
    it('should use default cell size (TILE_SIZE)', () => {
      view = createGameView(controller, container);
      view.render();
      const maze = container.querySelector('.maze-layout') as HTMLElement;
      // Default cell size should match TILE_SIZE (20px)
      expect(maze?.style.getPropertyValue('--cell-size')).toBe('20px');
    });

    it('should accept custom cell size', () => {
      view = createGameView(controller, container, { cellSize: 24 });
      view.render();
      const maze = container.querySelector('.maze-layout') as HTMLElement;
      expect(maze?.style.getPropertyValue('--cell-size')).toBe('24px');
    });
  });
});
