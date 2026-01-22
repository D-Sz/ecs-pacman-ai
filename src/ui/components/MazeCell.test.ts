import { describe, it, expect, beforeEach } from 'vitest';
import { createMazeCell, type MazeCellType } from './MazeCell';

describe('MazeCell Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('createMazeCell', () => {
    it('should create a maze cell element', () => {
      const cell = createMazeCell({ type: 'path' });
      expect(cell).toBeInstanceOf(HTMLElement);
    });

    it('should have the base maze-cell class', () => {
      const cell = createMazeCell({ type: 'path' });
      expect(cell.classList.contains('maze-cell')).toBe(true);
    });

    it('should be a div element', () => {
      const cell = createMazeCell({ type: 'path' });
      expect(cell.tagName).toBe('DIV');
    });
  });

  describe('cell types', () => {
    const cellTypes: MazeCellType[] = ['wall', 'path', 'tunnel', 'ghost-house', 'ghost-door'];

    cellTypes.forEach(type => {
      it(`should apply maze-cell--${type} class for ${type} type`, () => {
        const cell = createMazeCell({ type });
        expect(cell.classList.contains(`maze-cell--${type}`)).toBe(true);
      });
    });

    it('should only have one type class at a time', () => {
      const cell = createMazeCell({ type: 'wall' });
      const typeClasses = cellTypes.map(t => `maze-cell--${t}`);
      const appliedTypes = typeClasses.filter(cls => cell.classList.contains(cls));
      expect(appliedTypes.length).toBe(1);
      expect(appliedTypes[0]).toBe('maze-cell--wall');
    });
  });

  describe('default props', () => {
    it('should default to path type when no type provided', () => {
      const cell = createMazeCell({});
      expect(cell.classList.contains('maze-cell--path')).toBe(true);
    });
  });

  describe('DOM structure', () => {
    it('should be appendable to DOM', () => {
      const cell = createMazeCell({ type: 'wall' });
      document.body.appendChild(cell);
      expect(document.querySelector('.maze-cell')).toBeTruthy();
    });

    it('should have no child elements by default', () => {
      const cell = createMazeCell({ type: 'path' });
      expect(cell.children.length).toBe(0);
    });

    it('should allow child elements to be appended', () => {
      const cell = createMazeCell({ type: 'path' });
      const pellet = document.createElement('div');
      pellet.className = 'pellet';
      cell.appendChild(pellet);
      expect(cell.children.length).toBe(1);
    });
  });

  describe('dimensions', () => {
    it('should have maze-cell class which applies dimensions via CSS', () => {
      const cell = createMazeCell({ type: 'path' });
      // CSS applies width: 20px, height: 20px, position: relative
      // We verify the class is present; CSS is tested visually in Storybook
      expect(cell.classList.contains('maze-cell')).toBe(true);
    });
  });

  describe('wall type specifics', () => {
    it('should have wall class for wall type', () => {
      const cell = createMazeCell({ type: 'wall' });
      expect(cell.classList.contains('maze-cell--wall')).toBe(true);
    });
  });

  describe('ghost door type specifics', () => {
    it('should have ghost-door class', () => {
      const cell = createMazeCell({ type: 'ghost-door' });
      expect(cell.classList.contains('maze-cell--ghost-door')).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have appropriate role for wall (presentation)', () => {
      const cell = createMazeCell({ type: 'wall' });
      expect(cell.getAttribute('role')).toBe('presentation');
    });

    it('should have appropriate role for path (presentation)', () => {
      const cell = createMazeCell({ type: 'path' });
      expect(cell.getAttribute('role')).toBe('presentation');
    });
  });

  describe('data attributes', () => {
    it('should have data-cell-type attribute', () => {
      const cell = createMazeCell({ type: 'wall' });
      expect(cell.dataset.cellType).toBe('wall');
    });

    it('should set correct data-cell-type for each type', () => {
      const types: MazeCellType[] = ['wall', 'path', 'tunnel', 'ghost-house', 'ghost-door'];
      types.forEach(type => {
        const cell = createMazeCell({ type });
        expect(cell.dataset.cellType).toBe(type);
      });
    });
  });
});
