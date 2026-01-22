import { describe, it, expect, beforeEach } from 'vitest';
import { createPowerPellet } from './PowerPellet';

describe('PowerPellet Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('createPowerPellet', () => {
    it('should create a power pellet element', () => {
      const powerPellet = createPowerPellet({});
      expect(powerPellet).toBeInstanceOf(HTMLElement);
    });

    it('should have the base power-pellet class', () => {
      const powerPellet = createPowerPellet({});
      expect(powerPellet.classList.contains('power-pellet')).toBe(true);
    });

    it('should be a div element', () => {
      const powerPellet = createPowerPellet({});
      expect(powerPellet.tagName).toBe('DIV');
    });
  });

  describe('animation', () => {
    it('should have animated class by default', () => {
      const powerPellet = createPowerPellet({});
      expect(powerPellet.classList.contains('power-pellet--animated')).toBe(true);
    });

    it('should have animated class when animated is true', () => {
      const powerPellet = createPowerPellet({ animated: true });
      expect(powerPellet.classList.contains('power-pellet--animated')).toBe(true);
    });

    it('should not have animated class when animated is false', () => {
      const powerPellet = createPowerPellet({ animated: false });
      expect(powerPellet.classList.contains('power-pellet--animated')).toBe(false);
    });

    it('should only have one animation state at a time', () => {
      const powerPellet = createPowerPellet({ animated: true });
      const animationClasses = ['power-pellet--animated', 'power-pellet--static'];
      const appliedClasses = animationClasses.filter(cls => powerPellet.classList.contains(cls));
      expect(appliedClasses.length).toBe(1);
    });
  });

  describe('default props', () => {
    it('should default to animated when no props provided', () => {
      const powerPellet = createPowerPellet({});
      expect(powerPellet.classList.contains('power-pellet--animated')).toBe(true);
    });
  });

  describe('DOM structure', () => {
    it('should be appendable to DOM', () => {
      const powerPellet = createPowerPellet({});
      document.body.appendChild(powerPellet);
      expect(document.querySelector('.power-pellet')).toBeTruthy();
    });

    it('should have no child elements', () => {
      const powerPellet = createPowerPellet({});
      expect(powerPellet.children.length).toBe(0);
    });
  });

  describe('accessibility', () => {
    it('should have role="img" for screen readers', () => {
      const powerPellet = createPowerPellet({});
      expect(powerPellet.getAttribute('role')).toBe('img');
    });

    it('should have aria-label describing the power pellet', () => {
      const powerPellet = createPowerPellet({});
      expect(powerPellet.getAttribute('aria-label')).toBe('power pellet');
    });
  });

  describe('visual distinction from regular pellet', () => {
    it('should have power-pellet class not pellet class', () => {
      const powerPellet = createPowerPellet({});
      expect(powerPellet.classList.contains('power-pellet')).toBe(true);
      expect(powerPellet.classList.contains('pellet')).toBe(false);
    });
  });
});
