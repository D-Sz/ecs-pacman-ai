/**
 * Core component type definitions for the ECS system
 */

// Direction enum for movement
export type Direction = 'up' | 'down' | 'left' | 'right';

// Ghost types
export type GhostType = 'blinky' | 'pinky' | 'inky' | 'clyde';

// Ghost behavior modes
export type GhostMode = 'chase' | 'scatter' | 'frightened' | 'eaten';

// Game states
export type GameState = 'ready' | 'playing' | 'paused' | 'won' | 'lost' | 'dying';

// Entity ID type
export type EntityId = number;

// Position component
export interface Position {
  gridX: number;
  gridY: number;
  pixelX: number;
  pixelY: number;
}

// Velocity component
export interface Velocity {
  direction: Direction | null;
  speed: number;
  nextDirection: Direction | null;
}

// GhostAI component
export interface GhostAI {
  type: GhostType;
  mode: GhostMode;
  scatterTarget: { x: number; y: number };
}

// Edible component (pellets, power pellets)
export interface Edible {
  points: number;
}

// PowerUp component
export interface PowerUp {
  duration: number;
}

// Vulnerable component (frightened ghosts)
export interface Vulnerable {
  remainingTime: number;
  flashing: boolean;
}

// Respawnable component
export interface Respawnable {
  spawnX: number;
  spawnY: number;
  delay: number;
  timer: number;
}

// Player controlled marker component
export interface PlayerControlled {
  readonly _tag: 'playerControlled';
}

// Collider component
export interface Collider {
  width: number;
  height: number;
}

// Component map for type-safe access
export interface ComponentMap {
  position: Position;
  velocity: Velocity;
  ghostAI: GhostAI;
  edible: Edible;
  powerUp: PowerUp;
  vulnerable: Vulnerable;
  respawnable: Respawnable;
  playerControlled: PlayerControlled;
  collider: Collider;
}

// Component type union
export type ComponentType = keyof ComponentMap;
