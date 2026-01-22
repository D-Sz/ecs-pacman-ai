import { describe, it, expect, beforeEach } from 'vitest';
import { createScoreBoard } from './ScoreBoard';

describe('ScoreBoard Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('createScoreBoard', () => {
    it('should create a scoreboard element', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 3, level: 1 });
      expect(scoreboard).toBeInstanceOf(HTMLElement);
    });

    it('should have the base scoreboard class', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 3, level: 1 });
      expect(scoreboard.classList.contains('scoreboard')).toBe(true);
    });

    it('should be a div element', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 3, level: 1 });
      expect(scoreboard.tagName).toBe('DIV');
    });
  });

  describe('score display', () => {
    it('should display current score', () => {
      const scoreboard = createScoreBoard({ score: 1234, highScore: 5000, lives: 3, level: 1 });
      const scoreElement = scoreboard.querySelector('.scoreboard__score-value');
      expect(scoreElement?.textContent).toBe('1234');
    });

    it('should display zero score', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 5000, lives: 3, level: 1 });
      const scoreElement = scoreboard.querySelector('.scoreboard__score-value');
      expect(scoreElement?.textContent).toBe('0');
    });

    it('should display large scores', () => {
      const scoreboard = createScoreBoard({ score: 999999, highScore: 999999, lives: 3, level: 1 });
      const scoreElement = scoreboard.querySelector('.scoreboard__score-value');
      expect(scoreElement?.textContent).toBe('999999');
    });

    it('should have score label', () => {
      const scoreboard = createScoreBoard({ score: 100, highScore: 5000, lives: 3, level: 1 });
      const scoreLabel = scoreboard.querySelector('.scoreboard__score-label');
      expect(scoreLabel?.textContent).toBe('SCORE');
    });
  });

  describe('high score display', () => {
    it('should display high score', () => {
      const scoreboard = createScoreBoard({ score: 100, highScore: 10000, lives: 3, level: 1 });
      const highScoreElement = scoreboard.querySelector('.scoreboard__highscore-value');
      expect(highScoreElement?.textContent).toBe('10000');
    });

    it('should display zero high score', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 3, level: 1 });
      const highScoreElement = scoreboard.querySelector('.scoreboard__highscore-value');
      expect(highScoreElement?.textContent).toBe('0');
    });

    it('should have high score label', () => {
      const scoreboard = createScoreBoard({ score: 100, highScore: 5000, lives: 3, level: 1 });
      const highScoreLabel = scoreboard.querySelector('.scoreboard__highscore-label');
      expect(highScoreLabel?.textContent).toBe('HIGH SCORE');
    });
  });

  describe('lives display', () => {
    it('should display correct number of life icons', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 3, level: 1 });
      const lifeIcons = scoreboard.querySelectorAll('.scoreboard__life');
      expect(lifeIcons.length).toBe(3);
    });

    it('should display 1 life icon when lives is 1', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 1, level: 1 });
      const lifeIcons = scoreboard.querySelectorAll('.scoreboard__life');
      expect(lifeIcons.length).toBe(1);
    });

    it('should display 0 life icons when lives is 0', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 0, level: 1 });
      const lifeIcons = scoreboard.querySelectorAll('.scoreboard__life');
      expect(lifeIcons.length).toBe(0);
    });

    it('should display 5 life icons when lives is 5', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 5, level: 1 });
      const lifeIcons = scoreboard.querySelectorAll('.scoreboard__life');
      expect(lifeIcons.length).toBe(5);
    });

    it('should have lives container', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 3, level: 1 });
      const livesContainer = scoreboard.querySelector('.scoreboard__lives');
      expect(livesContainer).toBeTruthy();
    });
  });

  describe('level display', () => {
    it('should display current level', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 3, level: 1 });
      const levelElement = scoreboard.querySelector('.scoreboard__level-value');
      expect(levelElement?.textContent).toBe('1');
    });

    it('should display high level numbers', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 3, level: 99 });
      const levelElement = scoreboard.querySelector('.scoreboard__level-value');
      expect(levelElement?.textContent).toBe('99');
    });

    it('should have level label', () => {
      const scoreboard = createScoreBoard({ score: 100, highScore: 5000, lives: 3, level: 1 });
      const levelLabel = scoreboard.querySelector('.scoreboard__level-label');
      expect(levelLabel?.textContent).toBe('LEVEL');
    });
  });

  describe('DOM structure', () => {
    it('should have score section', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 3, level: 1 });
      const scoreSection = scoreboard.querySelector('.scoreboard__score');
      expect(scoreSection).toBeTruthy();
    });

    it('should have high score section', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 3, level: 1 });
      const highScoreSection = scoreboard.querySelector('.scoreboard__highscore');
      expect(highScoreSection).toBeTruthy();
    });

    it('should have level section', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 3, level: 1 });
      const levelSection = scoreboard.querySelector('.scoreboard__level');
      expect(levelSection).toBeTruthy();
    });

    it('should be appendable to DOM', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 3, level: 1 });
      document.body.appendChild(scoreboard);
      expect(document.querySelector('.scoreboard')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have role="status" for live updates', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 3, level: 1 });
      expect(scoreboard.getAttribute('role')).toBe('status');
    });

    it('should have aria-live="polite"', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 3, level: 1 });
      expect(scoreboard.getAttribute('aria-live')).toBe('polite');
    });

    it('should have aria-label describing the scoreboard', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 3, level: 1 });
      expect(scoreboard.getAttribute('aria-label')).toBe('Game scoreboard');
    });
  });

  describe('data attributes', () => {
    it('should have data-score attribute', () => {
      const scoreboard = createScoreBoard({ score: 1500, highScore: 5000, lives: 3, level: 1 });
      expect(scoreboard.dataset.score).toBe('1500');
    });

    it('should have data-high-score attribute', () => {
      const scoreboard = createScoreBoard({ score: 100, highScore: 5000, lives: 3, level: 1 });
      expect(scoreboard.dataset.highScore).toBe('5000');
    });

    it('should have data-lives attribute', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 2, level: 1 });
      expect(scoreboard.dataset.lives).toBe('2');
    });

    it('should have data-level attribute', () => {
      const scoreboard = createScoreBoard({ score: 0, highScore: 0, lives: 3, level: 5 });
      expect(scoreboard.dataset.level).toBe('5');
    });
  });
});
