import { describe, it, expect, beforeEach } from 'vitest';
import { createGameLayout } from './GameLayout';
import type { MazeCellData } from './MazeLayout';

describe('GameLayout Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  // Simple 3x3 test maze
  const simpleMaze: MazeCellData[][] = [
    [{ type: 'wall' }, { type: 'wall' }, { type: 'wall' }],
    [{ type: 'wall' }, { type: 'path' }, { type: 'wall' }],
    [{ type: 'wall' }, { type: 'wall' }, { type: 'wall' }],
  ];

  const defaultProps = {
    score: 0,
    highScore: 10000,
    lives: 3,
    level: 1,
    mazeData: simpleMaze
  };

  describe('createGameLayout', () => {
    it('should create a game layout element', () => {
      const layout = createGameLayout(defaultProps);
      expect(layout).toBeInstanceOf(HTMLElement);
    });

    it('should have the base game-layout class', () => {
      const layout = createGameLayout(defaultProps);
      expect(layout.classList.contains('game-layout')).toBe(true);
    });

    it('should be a div element', () => {
      const layout = createGameLayout(defaultProps);
      expect(layout.tagName).toBe('DIV');
    });
  });

  describe('components', () => {
    it('should contain a scoreboard', () => {
      const layout = createGameLayout(defaultProps);
      const scoreboard = layout.querySelector('.scoreboard');
      expect(scoreboard).toBeTruthy();
    });

    it('should contain a maze layout', () => {
      const layout = createGameLayout(defaultProps);
      const maze = layout.querySelector('.maze-layout');
      expect(maze).toBeTruthy();
    });

    it('should pass score to scoreboard', () => {
      const layout = createGameLayout({ ...defaultProps, score: 5000 });
      const scoreValue = layout.querySelector('.scoreboard__score-value');
      expect(scoreValue?.textContent).toBe('5000');
    });

    it('should pass high score to scoreboard', () => {
      const layout = createGameLayout({ ...defaultProps, highScore: 25000 });
      const highScoreValue = layout.querySelector('.scoreboard__highscore-value');
      expect(highScoreValue?.textContent).toBe('25000');
    });

    it('should pass lives to scoreboard', () => {
      const layout = createGameLayout({ ...defaultProps, lives: 2 });
      const lifeIcons = layout.querySelectorAll('.scoreboard__life');
      expect(lifeIcons.length).toBe(2);
    });

    it('should pass level to scoreboard', () => {
      const layout = createGameLayout({ ...defaultProps, level: 5 });
      const levelValue = layout.querySelector('.scoreboard__level-value');
      expect(levelValue?.textContent).toBe('5');
    });

    it('should pass maze data to maze layout', () => {
      const layout = createGameLayout(defaultProps);
      const cells = layout.querySelectorAll('.maze-cell');
      expect(cells.length).toBe(9); // 3x3 maze
    });
  });

  describe('cell size', () => {
    it('should apply default cell size', () => {
      const layout = createGameLayout(defaultProps);
      const maze = layout.querySelector('.maze-layout');
      expect(maze?.getAttribute('data-cell-size')).toBe('20');
    });

    it('should apply custom cell size', () => {
      const layout = createGameLayout({ ...defaultProps, cellSize: 16 });
      const maze = layout.querySelector('.maze-layout');
      expect(maze?.getAttribute('data-cell-size')).toBe('16');
    });
  });

  describe('overlay', () => {
    it('should not show overlay by default', () => {
      const layout = createGameLayout(defaultProps);
      const overlay = layout.querySelector('.game-layout__overlay');
      expect(overlay).toBeFalsy();
    });

    it('should show overlay when showOverlay is true', () => {
      const layout = createGameLayout({ ...defaultProps, showOverlay: true, overlayMessage: 'TEST' });
      const overlay = layout.querySelector('.game-layout__overlay');
      expect(overlay).toBeTruthy();
    });

    it('should display overlay message', () => {
      const layout = createGameLayout({ ...defaultProps, showOverlay: true, overlayMessage: 'READY!' });
      const message = layout.querySelector('.game-layout__message');
      expect(message?.textContent).toBe('READY!');
    });

    it('should show GAME OVER message', () => {
      const layout = createGameLayout({ ...defaultProps, showOverlay: true, overlayMessage: 'GAME OVER' });
      const message = layout.querySelector('.game-layout__message');
      expect(message?.textContent).toBe('GAME OVER');
    });

    it('should not show message when overlay is hidden', () => {
      const layout = createGameLayout({ ...defaultProps, showOverlay: false, overlayMessage: 'TEST' });
      const message = layout.querySelector('.game-layout__message');
      expect(message).toBeFalsy();
    });
  });

  describe('DOM structure', () => {
    it('should have scoreboard before maze', () => {
      const layout = createGameLayout(defaultProps);
      const children = Array.from(layout.children);
      const scoreboardIndex = children.findIndex(el => el.classList.contains('scoreboard'));
      const mazeContainerIndex = children.findIndex(el => el.classList.contains('game-layout__maze-container'));

      expect(scoreboardIndex).toBeLessThan(mazeContainerIndex);
    });

    it('should have maze inside container', () => {
      const layout = createGameLayout(defaultProps);
      const container = layout.querySelector('.game-layout__maze-container');
      const maze = container?.querySelector('.maze-layout');
      expect(maze).toBeTruthy();
    });

    it('should be appendable to DOM', () => {
      const layout = createGameLayout(defaultProps);
      document.body.appendChild(layout);
      expect(document.querySelector('.game-layout')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have role="application"', () => {
      const layout = createGameLayout(defaultProps);
      expect(layout.getAttribute('role')).toBe('application');
    });

    it('should have aria-label', () => {
      const layout = createGameLayout(defaultProps);
      expect(layout.getAttribute('aria-label')).toBe('Pacman game');
    });
  });

  describe('data attributes', () => {
    it('should have data-score attribute', () => {
      const layout = createGameLayout({ ...defaultProps, score: 1500 });
      expect(layout.dataset.score).toBe('1500');
    });

    it('should have data-level attribute', () => {
      const layout = createGameLayout({ ...defaultProps, level: 3 });
      expect(layout.dataset.level).toBe('3');
    });

    it('should have data-lives attribute', () => {
      const layout = createGameLayout({ ...defaultProps, lives: 2 });
      expect(layout.dataset.lives).toBe('2');
    });
  });
});
