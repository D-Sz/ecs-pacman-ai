/**
 * EventBus Tests
 *
 * Tests for the typed event bus system.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEventBus, type EventBus } from './EventBus';
import { GameEvents } from '../types';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = createEventBus();
  });

  describe('subscribe', () => {
    it('should allow subscribing to an event', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_DIRECTION, handler);

      eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'up' });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should pass event payload to handler', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_DIRECTION, handler);

      eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'right' });

      expect(handler).toHaveBeenCalledWith({ direction: 'right' });
    });

    it('should allow multiple handlers for same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.subscribe(GameEvents.INPUT_START, handler1);
      eventBus.subscribe(GameEvents.INPUT_START, handler2);

      eventBus.dispatch(GameEvents.INPUT_START, undefined);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should return unsubscribe function', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.subscribe(GameEvents.INPUT_PAUSE, handler);

      eventBus.dispatch(GameEvents.INPUT_PAUSE, undefined);
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();

      eventBus.dispatch(GameEvents.INPUT_PAUSE, undefined);
      expect(handler).toHaveBeenCalledTimes(1); // Still 1, not called again
    });
  });

  describe('dispatch', () => {
    it('should not throw when dispatching with no subscribers', () => {
      expect(() => {
        eventBus.dispatch(GameEvents.INPUT_START, undefined);
      }).not.toThrow();
    });

    it('should dispatch to correct event type only', () => {
      const startHandler = vi.fn();
      const pauseHandler = vi.fn();

      eventBus.subscribe(GameEvents.INPUT_START, startHandler);
      eventBus.subscribe(GameEvents.INPUT_PAUSE, pauseHandler);

      eventBus.dispatch(GameEvents.INPUT_START, undefined);

      expect(startHandler).toHaveBeenCalledTimes(1);
      expect(pauseHandler).not.toHaveBeenCalled();
    });

    it('should handle pellet eaten event with payload', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.PELLET_EATEN, handler);

      const payload = {
        entityId: 42,
        position: { gridX: 5, gridY: 10, pixelX: 100, pixelY: 200 },
        points: 10,
      };

      eventBus.dispatch(GameEvents.PELLET_EATEN, payload);

      expect(handler).toHaveBeenCalledWith(payload);
    });

    it('should handle ghost eaten event with payload', () => {
      const handler = vi.fn();
      eventBus.subscribe(GameEvents.GHOST_EATEN, handler);

      const payload = {
        ghostId: 5,
        ghostType: 'blinky',
        points: 200,
        streak: 1,
        position: { gridX: 14, gridY: 14, pixelX: 280, pixelY: 280 },
      };

      eventBus.dispatch(GameEvents.GHOST_EATEN, payload);

      expect(handler).toHaveBeenCalledWith(payload);
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe specific handler', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.subscribe(GameEvents.INPUT_START, handler1);
      const unsub2 = eventBus.subscribe(GameEvents.INPUT_START, handler2);

      unsub2();

      eventBus.dispatch(GameEvents.INPUT_START, undefined);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should handle unsubscribing same handler multiple times', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.subscribe(GameEvents.INPUT_START, handler);

      unsubscribe();
      unsubscribe(); // Should not throw

      eventBus.dispatch(GameEvents.INPUT_START, undefined);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should remove all subscribers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.subscribe(GameEvents.INPUT_START, handler1);
      eventBus.subscribe(GameEvents.INPUT_PAUSE, handler2);

      eventBus.clear();

      eventBus.dispatch(GameEvents.INPUT_START, undefined);
      eventBus.dispatch(GameEvents.INPUT_PAUSE, undefined);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should allow new subscriptions after clear', () => {
      const handler = vi.fn();

      eventBus.subscribe(GameEvents.INPUT_START, handler);
      eventBus.clear();

      const newHandler = vi.fn();
      eventBus.subscribe(GameEvents.INPUT_START, newHandler);

      eventBus.dispatch(GameEvents.INPUT_START, undefined);

      expect(handler).not.toHaveBeenCalled();
      expect(newHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('once', () => {
    it('should only trigger handler once', () => {
      const handler = vi.fn();
      eventBus.once(GameEvents.INPUT_START, handler);

      eventBus.dispatch(GameEvents.INPUT_START, undefined);
      eventBus.dispatch(GameEvents.INPUT_START, undefined);
      eventBus.dispatch(GameEvents.INPUT_START, undefined);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should pass payload to once handler', () => {
      const handler = vi.fn();
      eventBus.once(GameEvents.INPUT_DIRECTION, handler);

      eventBus.dispatch(GameEvents.INPUT_DIRECTION, { direction: 'left' });

      expect(handler).toHaveBeenCalledWith({ direction: 'left' });
    });

    it('should return unsubscribe function for once', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.once(GameEvents.INPUT_START, handler);

      unsubscribe();

      eventBus.dispatch(GameEvents.INPUT_START, undefined);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('getSubscriberCount', () => {
    it('should return 0 for event with no subscribers', () => {
      expect(eventBus.getSubscriberCount(GameEvents.INPUT_START)).toBe(0);
    });

    it('should return correct count after subscribing', () => {
      eventBus.subscribe(GameEvents.INPUT_START, vi.fn());
      eventBus.subscribe(GameEvents.INPUT_START, vi.fn());

      expect(eventBus.getSubscriberCount(GameEvents.INPUT_START)).toBe(2);
    });

    it('should decrease count after unsubscribing', () => {
      const unsub1 = eventBus.subscribe(GameEvents.INPUT_START, vi.fn());
      eventBus.subscribe(GameEvents.INPUT_START, vi.fn());

      unsub1();

      expect(eventBus.getSubscriberCount(GameEvents.INPUT_START)).toBe(1);
    });
  });
});
