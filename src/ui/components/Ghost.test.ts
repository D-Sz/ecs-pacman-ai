import { describe, it, expect, beforeEach } from 'vitest';
import { createGhost, type GhostType, type GhostLookDirection } from './Ghost';

describe('Ghost Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('createGhost', () => {
    it('should create a ghost element', () => {
      const ghost = createGhost({ type: 'blinky' });
      expect(ghost).toBeInstanceOf(HTMLElement);
    });

    it('should have the base ghost class', () => {
      const ghost = createGhost({ type: 'blinky' });
      expect(ghost.classList.contains('ghost')).toBe(true);
    });

    it('should be a div element', () => {
      const ghost = createGhost({ type: 'blinky' });
      expect(ghost.tagName).toBe('DIV');
    });
  });

  describe('ghost types', () => {
    const types: GhostType[] = ['blinky', 'pinky', 'inky', 'clyde'];

    types.forEach(type => {
      it(`should apply ghost--${type} class for ${type} type`, () => {
        const ghost = createGhost({ type });
        expect(ghost.classList.contains(`ghost--${type}`)).toBe(true);
      });
    });

    it('should only have one type class at a time', () => {
      const ghost = createGhost({ type: 'pinky' });
      const typeClasses = types.map(t => `ghost--${t}`);
      const appliedTypes = typeClasses.filter(cls => ghost.classList.contains(cls));
      expect(appliedTypes.length).toBe(1);
      expect(appliedTypes[0]).toBe('ghost--pinky');
    });
  });

  describe('ghost states', () => {
    it('should be in normal state by default', () => {
      const ghost = createGhost({ type: 'blinky' });
      expect(ghost.classList.contains('ghost--frightened')).toBe(false);
      expect(ghost.classList.contains('ghost--flashing')).toBe(false);
      expect(ghost.classList.contains('ghost--eyes-only')).toBe(false);
    });

    it('should apply ghost--frightened class when state is frightened', () => {
      const ghost = createGhost({ type: 'blinky', state: 'frightened' });
      expect(ghost.classList.contains('ghost--frightened')).toBe(true);
    });

    it('should apply ghost--flashing class when state is flashing', () => {
      const ghost = createGhost({ type: 'blinky', state: 'flashing' });
      expect(ghost.classList.contains('ghost--flashing')).toBe(true);
    });

    it('should apply ghost--eyes-only class when state is eyes-only', () => {
      const ghost = createGhost({ type: 'blinky', state: 'eyes-only' });
      expect(ghost.classList.contains('ghost--eyes-only')).toBe(true);
    });

    it('should have frightened class when flashing (flashing implies frightened)', () => {
      const ghost = createGhost({ type: 'blinky', state: 'flashing' });
      expect(ghost.classList.contains('ghost--frightened')).toBe(true);
      expect(ghost.classList.contains('ghost--flashing')).toBe(true);
    });
  });

  describe('eye direction', () => {
    const directions: GhostLookDirection[] = ['right', 'left', 'up', 'down'];

    directions.forEach(direction => {
      it(`should apply ghost--look-${direction} class for ${direction} look direction`, () => {
        const ghost = createGhost({ type: 'blinky', lookDirection: direction });
        expect(ghost.classList.contains(`ghost--look-${direction}`)).toBe(true);
      });
    });

    it('should default to looking right', () => {
      const ghost = createGhost({ type: 'blinky' });
      expect(ghost.classList.contains('ghost--look-right')).toBe(true);
    });
  });

  describe('DOM structure', () => {
    it('should have a ghost body element', () => {
      const ghost = createGhost({ type: 'blinky' });
      const body = ghost.querySelector('.ghost__body');
      expect(body).toBeTruthy();
    });

    it('should have a ghost skirt element', () => {
      const ghost = createGhost({ type: 'blinky' });
      const skirt = ghost.querySelector('.ghost__skirt');
      expect(skirt).toBeTruthy();
    });

    it('should have 3 skirt waves', () => {
      const ghost = createGhost({ type: 'blinky' });
      const waves = ghost.querySelectorAll('.ghost__skirt-wave');
      expect(waves.length).toBe(3);
    });

    it('should have ghost eyes container', () => {
      const ghost = createGhost({ type: 'blinky' });
      const eyes = ghost.querySelector('.ghost__eyes');
      expect(eyes).toBeTruthy();
    });

    it('should have 2 eye elements', () => {
      const ghost = createGhost({ type: 'blinky' });
      const eyes = ghost.querySelectorAll('.ghost__eye');
      expect(eyes.length).toBe(2);
    });

    it('should have 2 pupil elements', () => {
      const ghost = createGhost({ type: 'blinky' });
      const pupils = ghost.querySelectorAll('.ghost__pupil');
      expect(pupils.length).toBe(2);
    });

    it('should be appendable to DOM', () => {
      const ghost = createGhost({ type: 'blinky' });
      document.body.appendChild(ghost);
      expect(document.querySelector('.ghost')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have role="img" for screen readers', () => {
      const ghost = createGhost({ type: 'blinky' });
      expect(ghost.getAttribute('role')).toBe('img');
    });

    it('should have aria-label describing the ghost', () => {
      const ghost = createGhost({ type: 'blinky' });
      expect(ghost.getAttribute('aria-label')).toBe('Blinky ghost');
    });

    it('should include state in aria-label when frightened', () => {
      const ghost = createGhost({ type: 'blinky', state: 'frightened' });
      expect(ghost.getAttribute('aria-label')).toBe('Blinky ghost (frightened)');
    });

    it('should capitalize ghost name in aria-label', () => {
      const ghost = createGhost({ type: 'pinky' });
      expect(ghost.getAttribute('aria-label')).toBe('Pinky ghost');
    });
  });

  describe('data attributes', () => {
    it('should have data-type attribute', () => {
      const ghost = createGhost({ type: 'inky' });
      expect(ghost.dataset.type).toBe('inky');
    });

    it('should have data-state attribute', () => {
      const ghost = createGhost({ type: 'blinky', state: 'frightened' });
      expect(ghost.dataset.state).toBe('frightened');
    });

    it('should have data-state as normal by default', () => {
      const ghost = createGhost({ type: 'blinky' });
      expect(ghost.dataset.state).toBe('normal');
    });

    it('should have data-look-direction attribute', () => {
      const ghost = createGhost({ type: 'blinky', lookDirection: 'up' });
      expect(ghost.dataset.lookDirection).toBe('up');
    });
  });

  describe('default props', () => {
    it('should default to normal state', () => {
      const ghost = createGhost({ type: 'blinky' });
      expect(ghost.dataset.state).toBe('normal');
    });

    it('should default to looking right', () => {
      const ghost = createGhost({ type: 'blinky' });
      expect(ghost.dataset.lookDirection).toBe('right');
    });
  });

  describe('combined states', () => {
    it('should support type and state together', () => {
      const ghost = createGhost({ type: 'clyde', state: 'frightened' });
      expect(ghost.classList.contains('ghost')).toBe(true);
      expect(ghost.classList.contains('ghost--clyde')).toBe(true);
      expect(ghost.classList.contains('ghost--frightened')).toBe(true);
    });

    it('should support all props together', () => {
      const ghost = createGhost({ type: 'inky', state: 'eyes-only', lookDirection: 'down' });
      expect(ghost.classList.contains('ghost--inky')).toBe(true);
      expect(ghost.classList.contains('ghost--eyes-only')).toBe(true);
      expect(ghost.classList.contains('ghost--look-down')).toBe(true);
    });
  });
});
