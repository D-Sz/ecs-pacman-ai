/**
 * EventBus
 *
 * A typed event bus for communication between game systems.
 * Supports subscribe, dispatch, once, and unsubscribe operations.
 */

import type { GameEventType, GameEventPayloads } from '../types';

/**
 * Event handler function type
 */
type EventHandler<T> = (payload: T) => void;

/**
 * EventBus interface
 */
export interface EventBus {
  /**
   * Subscribe to an event
   * @param eventType - The event type to listen for
   * @param handler - The handler function
   * @returns Unsubscribe function
   */
  subscribe<T extends GameEventType>(
    eventType: T,
    handler: EventHandler<GameEventPayloads[T]>
  ): () => void;

  /**
   * Subscribe to an event for one-time handling
   * @param eventType - The event type to listen for
   * @param handler - The handler function (called once then removed)
   * @returns Unsubscribe function
   */
  once<T extends GameEventType>(
    eventType: T,
    handler: EventHandler<GameEventPayloads[T]>
  ): () => void;

  /**
   * Dispatch an event to all subscribers
   * @param eventType - The event type to dispatch
   * @param payload - The event payload
   */
  dispatch<T extends GameEventType>(
    eventType: T,
    payload: GameEventPayloads[T]
  ): void;

  /**
   * Get the number of subscribers for an event type
   * @param eventType - The event type
   * @returns The number of subscribers
   */
  getSubscriberCount(eventType: GameEventType): number;

  /**
   * Clear all subscribers
   */
  clear(): void;
}

/**
 * Create a new EventBus instance
 */
export function createEventBus(): EventBus {
  // Map of event types to arrays of handlers
  const subscribers = new Map<GameEventType, Set<EventHandler<unknown>>>();

  const getHandlers = (eventType: GameEventType): Set<EventHandler<unknown>> => {
    if (!subscribers.has(eventType)) {
      subscribers.set(eventType, new Set());
    }
    return subscribers.get(eventType)!;
  };

  const subscribe = <T extends GameEventType>(
    eventType: T,
    handler: EventHandler<GameEventPayloads[T]>
  ): (() => void) => {
    const handlers = getHandlers(eventType);
    handlers.add(handler as EventHandler<unknown>);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler as EventHandler<unknown>);
    };
  };

  const once = <T extends GameEventType>(
    eventType: T,
    handler: EventHandler<GameEventPayloads[T]>
  ): (() => void) => {
    const wrappedHandler = (payload: GameEventPayloads[T]) => {
      unsubscribe();
      handler(payload);
    };

    const unsubscribe = subscribe(eventType, wrappedHandler);
    return unsubscribe;
  };

  const dispatch = <T extends GameEventType>(
    eventType: T,
    payload: GameEventPayloads[T]
  ): void => {
    const handlers = subscribers.get(eventType);
    if (!handlers) {
      return;
    }

    // Call each handler with the payload
    for (const handler of handlers) {
      handler(payload);
    }
  };

  const getSubscriberCount = (eventType: GameEventType): number => {
    const handlers = subscribers.get(eventType);
    return handlers ? handlers.size : 0;
  };

  const clear = (): void => {
    subscribers.clear();
  };

  return {
    subscribe,
    once,
    dispatch,
    getSubscriberCount,
    clear,
  };
}
