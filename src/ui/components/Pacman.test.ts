import { describe, it, expect, beforeEach } from 'vitest';
import { createPacman, type PacmanDirection } from './Pacman';

describe('Pacman Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('createPacman', () => {
    it('should create a pacman element', () => {
      const pacman = createPacman({ direction: 'right' });
      expect(pacman).toBeInstanceOf(HTMLElement);
    });

    it('should have the base pacman class', () => {
      const pacman = createPacman({ direction: 'right' });
      expect(pacman.classList.contains('pacman')).toBe(true);
    });

    it('should be a div element', () => {
      const pacman = createPacman({ direction: 'right' });
      expect(pacman.tagName).toBe('DIV');
    });
  });

  describe('directions', () => {
    const directions: PacmanDirection[] = ['right', 'left', 'up', 'down'];

    directions.forEach(direction => {
      it(`should apply pacman--${direction} class for ${direction} direction`, () => {
        const pacman = createPacman({ direction });
        expect(pacman.classList.contains(`pacman--${direction}`)).toBe(true);
      });
    });

    it('should only have one direction class at a time', () => {
      const pacman = createPacman({ direction: 'left' });
      const directionClasses = directions.map(d => `pacman--${d}`);
      const appliedDirections = directionClasses.filter(cls => pacman.classList.contains(cls));
      expect(appliedDirections.length).toBe(1);
      expect(appliedDirections[0]).toBe('pacman--left');
    });
  });

  describe('eating animation', () => {
    it('should not have eating class by default', () => {
      const pacman = createPacman({ direction: 'right' });
      expect(pacman.classList.contains('pacman--eating')).toBe(false);
    });

    it('should have eating class when eating is true', () => {
      const pacman = createPacman({ direction: 'right', eating: true });
      expect(pacman.classList.contains('pacman--eating')).toBe(true);
    });

    it('should not have eating class when eating is false', () => {
      const pacman = createPacman({ direction: 'right', eating: false });
      expect(pacman.classList.contains('pacman--eating')).toBe(false);
    });
  });

  describe('default props', () => {
    it('should default to right direction when no direction provided', () => {
      const pacman = createPacman({});
      expect(pacman.classList.contains('pacman--right')).toBe(true);
    });

    it('should default to not eating when eating not provided', () => {
      const pacman = createPacman({ direction: 'right' });
      expect(pacman.classList.contains('pacman--eating')).toBe(false);
    });
  });

  describe('DOM structure', () => {
    it('should be appendable to DOM', () => {
      const pacman = createPacman({ direction: 'right' });
      document.body.appendChild(pacman);
      expect(document.querySelector('.pacman')).toBeTruthy();
    });

    it('should have no child elements', () => {
      const pacman = createPacman({ direction: 'right' });
      expect(pacman.children.length).toBe(0);
    });
  });

  describe('accessibility', () => {
    it('should have role="img" for screen readers', () => {
      const pacman = createPacman({ direction: 'right' });
      expect(pacman.getAttribute('role')).toBe('img');
    });

    it('should have aria-label describing pacman', () => {
      const pacman = createPacman({ direction: 'right' });
      expect(pacman.getAttribute('aria-label')).toBe('Pacman');
    });
  });

  describe('data attributes', () => {
    it('should have data-direction attribute', () => {
      const pacman = createPacman({ direction: 'up' });
      expect(pacman.dataset.direction).toBe('up');
    });

    it('should have data-eating attribute when eating', () => {
      const pacman = createPacman({ direction: 'right', eating: true });
      expect(pacman.dataset.eating).toBe('true');
    });

    it('should have data-eating attribute as false when not eating', () => {
      const pacman = createPacman({ direction: 'right', eating: false });
      expect(pacman.dataset.eating).toBe('false');
    });
  });

  describe('combined states', () => {
    it('should support direction and eating together', () => {
      const pacman = createPacman({ direction: 'down', eating: true });
      expect(pacman.classList.contains('pacman')).toBe(true);
      expect(pacman.classList.contains('pacman--down')).toBe(true);
      expect(pacman.classList.contains('pacman--eating')).toBe(true);
    });

    it('should support all four directions with eating', () => {
      const directions: PacmanDirection[] = ['right', 'left', 'up', 'down'];
      directions.forEach(direction => {
        const pacman = createPacman({ direction, eating: true });
        expect(pacman.classList.contains(`pacman--${direction}`)).toBe(true);
        expect(pacman.classList.contains('pacman--eating')).toBe(true);
      });
    });
  });
});
