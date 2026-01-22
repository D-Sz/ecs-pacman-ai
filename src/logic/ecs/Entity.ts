/**
 * Entity Manager
 *
 * Manages entity creation, destruction, and component storage.
 * Entities are simple IDs; all data is stored in component maps.
 */

import type { EntityId, ComponentMap, ComponentType } from '../../types';

/**
 * EntityManager interface
 */
export interface EntityManager {
  /** Create a new entity and return its ID */
  createEntity(): EntityId;

  /** Destroy an entity and remove all its components */
  destroyEntity(id: EntityId): void;

  /** Check if an entity is alive (not destroyed) */
  isAlive(id: EntityId): boolean;

  /** Add a component to an entity */
  addComponent<T extends ComponentType>(
    id: EntityId,
    type: T,
    component: ComponentMap[T]
  ): void;

  /** Get a component from an entity */
  getComponent<T extends ComponentType>(
    id: EntityId,
    type: T
  ): ComponentMap[T] | undefined;

  /** Remove a component from an entity */
  removeComponent(id: EntityId, type: ComponentType): void;

  /** Check if an entity has a specific component */
  hasComponent(id: EntityId, type: ComponentType): boolean;

  /** Get all entities that have ALL specified components */
  getEntitiesWithComponents(types: ComponentType[]): EntityId[];

  /** Get all alive entities */
  getAllEntities(): EntityId[];

  /** Clear all entities and components */
  clear(): void;
}

/**
 * Create a new EntityManager instance
 */
export function createEntityManager(): EntityManager {
  let nextId: EntityId = 0;
  const aliveEntities = new Set<EntityId>();

  // Component storage: Map<ComponentType, Map<EntityId, Component>>
  const componentStores = new Map<ComponentType, Map<EntityId, unknown>>();

  // Initialize stores for all component types
  const initComponentStore = (type: ComponentType): Map<EntityId, unknown> => {
    if (!componentStores.has(type)) {
      componentStores.set(type, new Map());
    }
    return componentStores.get(type)!;
  };

  const createEntity = (): EntityId => {
    const id = nextId++;
    aliveEntities.add(id);
    return id;
  };

  const destroyEntity = (id: EntityId): void => {
    if (!aliveEntities.has(id)) {
      return;
    }

    // Remove all components
    for (const store of componentStores.values()) {
      store.delete(id);
    }

    aliveEntities.delete(id);
  };

  const isAlive = (id: EntityId): boolean => {
    return aliveEntities.has(id);
  };

  const addComponent = <T extends ComponentType>(
    id: EntityId,
    type: T,
    component: ComponentMap[T]
  ): void => {
    if (!aliveEntities.has(id)) {
      return;
    }

    const store = initComponentStore(type);
    store.set(id, component);
  };

  const getComponent = <T extends ComponentType>(
    id: EntityId,
    type: T
  ): ComponentMap[T] | undefined => {
    const store = componentStores.get(type);
    if (!store) {
      return undefined;
    }
    return store.get(id) as ComponentMap[T] | undefined;
  };

  const removeComponent = (id: EntityId, type: ComponentType): void => {
    const store = componentStores.get(type);
    if (store) {
      store.delete(id);
    }
  };

  const hasComponent = (id: EntityId, type: ComponentType): boolean => {
    const store = componentStores.get(type);
    if (!store) {
      return false;
    }
    return store.has(id);
  };

  const getEntitiesWithComponents = (types: ComponentType[]): EntityId[] => {
    const result: EntityId[] = [];

    for (const id of aliveEntities) {
      let hasAll = true;
      for (const type of types) {
        if (!hasComponent(id, type)) {
          hasAll = false;
          break;
        }
      }
      if (hasAll) {
        result.push(id);
      }
    }

    return result;
  };

  const getAllEntities = (): EntityId[] => {
    return Array.from(aliveEntities);
  };

  const clear = (): void => {
    aliveEntities.clear();
    for (const store of componentStores.values()) {
      store.clear();
    }
  };

  return {
    createEntity,
    destroyEntity,
    isAlive,
    addComponent,
    getComponent,
    removeComponent,
    hasComponent,
    getEntitiesWithComponents,
    getAllEntities,
    clear,
  };
}
