/**
 * KeyboardHandler Tests
 *
 * Tests for keyboard input handling and event translation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createKeyboardHandler, type KeyboardHandler } from './KeyboardHandler';
import { createEventBus, type EventBus } from '../events';
import { GameEvents } from '../types';

describe('KeyboardHandler', () => {
  let eventBus: EventBus;
  let handler: KeyboardHandler;

  beforeEach(() => {
    eventBus = createEventBus();
  });

  afterEach(() => {
    if (handler) {
      handler.destroy();
    }
  });

  describe('direction input', () => {
    it('should dispatch left direction on ArrowLeft', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_DIRECTION, spy);
      handler = createKeyboardHandler(eventBus);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

      expect(spy).toHaveBeenCalledWith({ direction: 'left' });
    });

    it('should dispatch right direction on ArrowRight', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_DIRECTION, spy);
      handler = createKeyboardHandler(eventBus);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      expect(spy).toHaveBeenCalledWith({ direction: 'right' });
    });

    it('should dispatch up direction on ArrowUp', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_DIRECTION, spy);
      handler = createKeyboardHandler(eventBus);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));

      expect(spy).toHaveBeenCalledWith({ direction: 'up' });
    });

    it('should dispatch down direction on ArrowDown', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_DIRECTION, spy);
      handler = createKeyboardHandler(eventBus);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));

      expect(spy).toHaveBeenCalledWith({ direction: 'down' });
    });
  });

  describe('WASD input', () => {
    it('should dispatch left direction on a key', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_DIRECTION, spy);
      handler = createKeyboardHandler(eventBus);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));

      expect(spy).toHaveBeenCalledWith({ direction: 'left' });
    });

    it('should dispatch right direction on d key', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_DIRECTION, spy);
      handler = createKeyboardHandler(eventBus);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));

      expect(spy).toHaveBeenCalledWith({ direction: 'right' });
    });

    it('should dispatch up direction on w key', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_DIRECTION, spy);
      handler = createKeyboardHandler(eventBus);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));

      expect(spy).toHaveBeenCalledWith({ direction: 'up' });
    });

    it('should dispatch down direction on s key', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_DIRECTION, spy);
      handler = createKeyboardHandler(eventBus);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));

      expect(spy).toHaveBeenCalledWith({ direction: 'down' });
    });
  });

  describe('game control input', () => {
    it('should dispatch start on Enter key', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_START, spy);
      handler = createKeyboardHandler(eventBus);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(spy).toHaveBeenCalled();
    });

    it('should dispatch start on Space key', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_START, spy);
      handler = createKeyboardHandler(eventBus);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

      expect(spy).toHaveBeenCalled();
    });

    it('should dispatch pause on p key', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_PAUSE, spy);
      handler = createKeyboardHandler(eventBus);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));

      expect(spy).toHaveBeenCalled();
    });

    it('should dispatch pause on Escape key', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_PAUSE, spy);
      handler = createKeyboardHandler(eventBus);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(spy).toHaveBeenCalled();
    });

    it('should dispatch restart on r key', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_RESTART, spy);
      handler = createKeyboardHandler(eventBus);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should stop listening to keyboard events after destroy', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_DIRECTION, spy);
      handler = createKeyboardHandler(eventBus);

      handler.destroy();

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('case insensitivity', () => {
    it('should handle uppercase WASD keys', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_DIRECTION, spy);
      handler = createKeyboardHandler(eventBus);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'W' }));

      expect(spy).toHaveBeenCalledWith({ direction: 'up' });
    });

    it('should handle uppercase P for pause', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_PAUSE, spy);
      handler = createKeyboardHandler(eventBus);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'P' }));

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('prevent default', () => {
    it('should prevent default for arrow keys', () => {
      handler = createKeyboardHandler(eventBus);
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        cancelable: true,
      });
      const preventSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventSpy).toHaveBeenCalled();
    });

    it('should prevent default for space key', () => {
      handler = createKeyboardHandler(eventBus);
      const event = new KeyboardEvent('keydown', {
        key: ' ',
        cancelable: true,
      });
      const preventSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventSpy).toHaveBeenCalled();
    });
  });

  describe('key repeat filtering', () => {
    it('should ignore repeated key events (key held down)', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_DIRECTION, spy);
      handler = createKeyboardHandler(eventBus);

      // First press - should dispatch
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', repeat: false }));
      expect(spy).toHaveBeenCalledTimes(1);

      // Repeated key (held down) - should NOT dispatch
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', repeat: true }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', repeat: true }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', repeat: true }));

      // Should still be only 1 call (not 4)
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should dispatch again after key is released and pressed again', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_DIRECTION, spy);
      handler = createKeyboardHandler(eventBus);

      // First press
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', repeat: false }));
      expect(spy).toHaveBeenCalledTimes(1);

      // Repeated keys (ignored)
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', repeat: true }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', repeat: true }));

      // New key press (not repeat)
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', repeat: false }));
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should ignore repeated control keys', () => {
      const spy = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_START, spy);
      handler = createKeyboardHandler(eventBus);

      // First press
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', repeat: false }));
      expect(spy).toHaveBeenCalledTimes(1);

      // Repeated (should be ignored)
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', repeat: true }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', repeat: true }));

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
