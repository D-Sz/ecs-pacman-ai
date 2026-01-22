import { describe, it, expect, beforeEach } from 'vitest';
import { createPellet } from './Pellet';

describe('Pellet Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('createPellet', () => {
    it('should create a pellet element', () => {
      const pellet = createPellet({ size: 'small' });
      expect(pellet).toBeInstanceOf(HTMLElement);
    });

    it('should have the base pellet class', () => {
      const pellet = createPellet({ size: 'small' });
      expect(pellet.classList.contains('pellet')).toBe(true);
    });

    it('should be a div element', () => {
      const pellet = createPellet({ size: 'small' });
      expect(pellet.tagName).toBe('DIV');
    });
  });

  describe('sizes', () => {
    it('should apply small size class by default', () => {
      const pellet = createPellet({ size: 'small' });
      expect(pellet.classList.contains('pellet--small')).toBe(true);
    });

    it('should apply medium size class when specified', () => {
      const pellet = createPellet({ size: 'medium' });
      expect(pellet.classList.contains('pellet--medium')).toBe(true);
    });

    it('should apply large size class when specified', () => {
      const pellet = createPellet({ size: 'large' });
      expect(pellet.classList.contains('pellet--large')).toBe(true);
    });

    it('should only have one size class at a time', () => {
      const pellet = createPellet({ size: 'medium' });
      const sizeClasses = ['pellet--small', 'pellet--medium', 'pellet--large'];
      const appliedSizes = sizeClasses.filter(cls => pellet.classList.contains(cls));
      expect(appliedSizes.length).toBe(1);
      expect(appliedSizes[0]).toBe('pellet--medium');
    });
  });

  describe('default props', () => {
    it('should default to small size when no size provided', () => {
      const pellet = createPellet({});
      expect(pellet.classList.contains('pellet--small')).toBe(true);
    });
  });

  describe('DOM structure', () => {
    it('should be appendable to DOM', () => {
      const pellet = createPellet({ size: 'small' });
      document.body.appendChild(pellet);
      expect(document.querySelector('.pellet')).toBeTruthy();
    });

    it('should have no child elements', () => {
      const pellet = createPellet({ size: 'small' });
      expect(pellet.children.length).toBe(0);
    });
  });

  describe('accessibility', () => {
    it('should have role="img" for screen readers', () => {
      const pellet = createPellet({ size: 'small' });
      expect(pellet.getAttribute('role')).toBe('img');
    });

    it('should have aria-label describing the pellet', () => {
      const pellet = createPellet({ size: 'small' });
      expect(pellet.getAttribute('aria-label')).toBe('pellet');
    });
  });
});
