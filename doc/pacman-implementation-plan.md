# Pacman Game Implementation Plan

## Overview
Classic Pacman game using **TypeScript** with ECS architecture, strict UI/Logic separation, Redux-like selectors, custom events for communication, Storybook for UI development, and TDD workflow.

---

## Architecture: UI/Logic Separation

```
┌─────────────────────────────────────────────────────────────┐
│                         UI LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ MazeView    │  │ PacmanView  │  │ GhostView   │  ...    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│              ┌───────────▼───────────┐                      │
│              │   SELECTORS (read)    │                      │
│              │   getPlayerPosition() │                      │
│              │   getGhostStates()    │                      │
│              │   getScore()          │                      │
│              └───────────┬───────────┘                      │
└──────────────────────────│──────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │    GAME STATE (World)   │
              │    Entities+Components  │
              └────────────▲────────────┘
                           │
┌──────────────────────────│──────────────────────────────────┐
│              ┌───────────┴───────────┐                      │
│              │   EVENT BUS           │                      │
│              │   CustomEvent dispatch │                      │
│              └───────────▲───────────┘                      │
│                          │                                  │
│         ┌────────────────┼────────────────┐                 │
│         │                │                │                 │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐         │
│  │ InputSystem │  │ AISystem    │  │ Movement   │  ...    │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                       LOGIC LAYER                           │
└─────────────────────────────────────────────────────────────┘
```

### Communication Patterns

**UI → Logic**: Custom Events
```typescript
// UI dispatches action
document.dispatchEvent(new CustomEvent('game:input', {
  detail: { direction: 'up' }
}));
```

**Logic → UI**: Selectors (pull-based)
```typescript
// UI reads state via selectors
const position = selectors.getPlayerPosition(world);
const score = selectors.getScore(world);
```

---

## Project Structure

```
ai-pacman/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── .storybook/
│   ├── main.ts
│   └── preview.ts
├── src/
│   ├── ui/                      # UI Layer (presentation only)
│   │   ├── components/
│   │   │   ├── Pacman.ts        # Pacman CSS component
│   │   │   ├── Pacman.stories.ts
│   │   │   ├── Ghost.ts         # Ghost CSS component
│   │   │   ├── Ghost.stories.ts
│   │   │   ├── Pellet.ts        # Pellet component
│   │   │   ├── Pellet.stories.ts
│   │   │   ├── PowerPellet.ts
│   │   │   ├── PowerPellet.stories.ts
│   │   │   ├── MazeCell.ts      # Single maze cell
│   │   │   ├── MazeCell.stories.ts
│   │   │   ├── ScoreBoard.ts
│   │   │   └── ScoreBoard.stories.ts
│   │   ├── layouts/
│   │   │   ├── MazeLayout.ts    # Full maze grid
│   │   │   ├── MazeLayout.stories.ts
│   │   │   ├── GameLayout.ts    # Game + UI chrome
│   │   │   └── GameLayout.stories.ts
│   │   ├── views/
│   │   │   ├── GameView.ts      # Main game renderer
│   │   │   └── GameView.stories.ts
│   │   └── styles/
│   │       ├── characters.css
│   │       ├── maze.css
│   │       └── game.css
│   │
│   ├── logic/                   # Logic Layer (no DOM)
│   │   ├── ecs/
│   │   │   ├── World.ts
│   │   │   ├── World.test.ts
│   │   │   ├── Entity.ts
│   │   │   └── Entity.test.ts
│   │   ├── components/
│   │   │   ├── Position.ts
│   │   │   ├── Position.test.ts
│   │   │   ├── Velocity.ts
│   │   │   ├── Velocity.test.ts
│   │   │   ├── GhostAI.ts
│   │   │   ├── GhostAI.test.ts
│   │   │   └── index.ts
│   │   ├── systems/
│   │   │   ├── InputSystem.ts
│   │   │   ├── InputSystem.test.ts
│   │   │   ├── MovementSystem.ts
│   │   │   ├── MovementSystem.test.ts
│   │   │   ├── GhostAISystem.ts
│   │   │   ├── GhostAISystem.test.ts
│   │   │   ├── CollisionSystem.ts
│   │   │   ├── CollisionSystem.test.ts
│   │   │   ├── EatingSystem.ts
│   │   │   ├── EatingSystem.test.ts
│   │   │   ├── PowerUpSystem.ts
│   │   │   └── PowerUpSystem.test.ts
│   │   └── data/
│   │       ├── maze.ts
│   │       └── maze.test.ts
│   │
│   ├── selectors/               # Redux-like selectors
│   │   ├── playerSelectors.ts
│   │   ├── playerSelectors.test.ts
│   │   ├── ghostSelectors.ts
│   │   ├── ghostSelectors.test.ts
│   │   ├── mazeSelectors.ts
│   │   ├── mazeSelectors.test.ts
│   │   ├── gameSelectors.ts
│   │   ├── gameSelectors.test.ts
│   │   └── index.ts
│   │
│   ├── events/                  # Custom event definitions
│   │   ├── GameEvents.ts
│   │   ├── GameEvents.test.ts
│   │   ├── EventBus.ts
│   │   └── EventBus.test.ts
│   │
│   ├── types/                   # Shared TypeScript types
│   │   ├── components.ts        # Component type definitions
│   │   ├── events.ts            # Event payload types
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── constants.ts
│   │   └── constants.test.ts
│   │
│   └── main.ts                  # Entry point, wiring
│
├── tests/
│   ├── integration/
│   │   ├── playerMovement.test.ts
│   │   ├── ghostBehavior.test.ts
│   │   ├── pelletEating.test.ts
│   │   ├── powerUpFlow.test.ts
│   │   └── gameFlow.test.ts
│   └── setup.ts
│
└── doc/
    ├── pacman-ecs.md
    └── pacman-implementation-plan.md
```

---

## TypeScript Types

### Core Types (src/types/components.ts)
```typescript
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

// Entity type
export type EntityId = number;

// Component map for type-safe access
export interface ComponentMap {
  position: Position;
  velocity: Velocity;
  ghostAI: GhostAI;
  edible: { points: number };
  powerUp: { duration: number };
  vulnerable: { remainingTime: number; flashing: boolean };
  respawnable: { spawnX: number; spawnY: number; delay: number; timer: number };
  playerControlled: Record<string, never>;
  collider: { width: number; height: number };
}

export type ComponentType = keyof ComponentMap;
```

### Event Types (src/types/events.ts)
```typescript
export interface InputDirectionEvent {
  direction: Direction;
}

export interface PelletEatenEvent {
  entityId: EntityId;
  position: Position;
  points: number;
}

export interface GhostEatenEvent {
  ghostId: EntityId;
  points: number;
}

export type GameEventPayloads = {
  'game:input:direction': InputDirectionEvent;
  'game:pellet:eaten': PelletEatenEvent;
  'game:ghost:eaten': GhostEatenEvent;
  // ... other events
};
```

---

## Selectors (Redux-like)

### Player Selectors
```typescript
// playerSelectors.ts
export const getPlayerEntity = (world: World): EntityId | null => ...
export const getPlayerPosition = (world: World): Position | null => ...
export const getPlayerDirection = (world: World): Direction | null => ...
export const getPlayerNextDirection = (world: World): Direction | null => ...
export const isPlayerAlive = (world: World): boolean => ...
```

### Ghost Selectors
```typescript
// ghostSelectors.ts
export const getGhostEntities = (world: World): EntityId[] => ...
export const getGhostPosition = (world: World, ghostId: EntityId): Position | null => ...
export const getGhostMode = (world: World, ghostId: EntityId): GhostMode | null => ...
export const getGhostType = (world: World, ghostId: EntityId): GhostType | null => ...
export const isGhostVulnerable = (world: World, ghostId: EntityId): boolean => ...
export const isGhostFlashing = (world: World, ghostId: EntityId): boolean => ...
export const getAllGhostsState = (world: World): GhostState[] => ...
```

### Maze Selectors
```typescript
// mazeSelectors.ts
export const getMazeLayout = (world: World): CellType[][] => ...
export const isWall = (world: World, x: number, y: number): boolean => ...
export const getPelletAt = (world: World, x: number, y: number): EntityId | null => ...
export const getAllPellets = (world: World): EntityId[] => ...
export const getPowerPellets = (world: World): EntityId[] => ...
export const getRemainingPelletCount = (world: World): number => ...
```

### Game Selectors
```typescript
// gameSelectors.ts
export const getScore = (world: World): number => ...
export const getGameState = (world: World): GameState => ...
export const getPowerUpTimeRemaining = (world: World): number => ...
```

---

## Custom Events (UI → Logic)

### Event Types
```typescript
// GameEvents.ts
export const GameEvents = {
  // Input events
  INPUT_DIRECTION: 'game:input:direction',
  INPUT_PAUSE: 'game:input:pause',
  INPUT_START: 'game:input:start',

  // Game flow events
  GAME_START: 'game:start',
  GAME_RESTART: 'game:restart',

  // Internal events (system to system)
  PELLET_EATEN: 'game:pellet:eaten',
  POWER_PELLET_EATEN: 'game:power:eaten',
  GHOST_EATEN: 'game:ghost:eaten',
  PLAYER_DIED: 'game:player:died',
  LEVEL_COMPLETE: 'game:level:complete'
} as const;

export type GameEventType = typeof GameEvents[keyof typeof GameEvents];
```

### EventBus
```typescript
// EventBus.ts
export class EventBus {
  dispatch<T extends GameEventType>(eventType: T, detail: GameEventPayloads[T]): void;
  subscribe<T extends GameEventType>(eventType: T, handler: (detail: GameEventPayloads[T]) => void): void;
  unsubscribe<T extends GameEventType>(eventType: T, handler: (detail: GameEventPayloads[T]) => void): void;
}
```

---

## TDD Workflow

For each feature, we follow this strict order:

### Step 1: Write Failing Tests
Show test code that defines expected behavior. Tests will fail (red).

### Step 2: Review Tests with User
User verifies test cases match requirements.

### Step 3: Implement Feature
Write minimal code to make tests pass.

### Step 4: Run TypeCheck
Verify types with `npm run typecheck`.

### Step 5: Run Linter
Verify code quality with `npm run lint`.

### Step 6: Run Tests
Confirm all tests pass (green) with `npm run test:run`.

### Step 7: Verify with Chrome DevTools
Use MCP to visually verify UI components in Storybook.

### Step 8: User Verification
User confirms interim result before proceeding.

---

## Implementation Phases (TDD)

### Phase 1: Project Setup & Tooling ✅ COMPLETE
- [x] Initialize npm project
- [x] Configure TypeScript
- [x] Configure Vitest for testing
- [x] Configure ESLint for TypeScript
- [x] Configure Storybook for TypeScript
- [x] Create folder structure

### Phase 2: UI Components (Storybook First) ✅ COMPLETE
For each component: Stories → Tests → Implementation → Verify

#### 2.1 Pellet Component ✅
- [x] Write Pellet.stories.ts (small dot, different sizes)
- [x] Write Pellet.test.ts (renders, has correct class) - 12 tests
- [x] Implement Pellet.ts + CSS
- [x] Verify in Storybook via Chrome DevTools

#### 2.2 Power Pellet Component ✅
- [x] Write PowerPellet.stories.ts (larger, pulsing animation)
- [x] Write PowerPellet.test.ts - 13 tests
- [x] Implement PowerPellet.ts + CSS
- [x] Verify in Storybook

#### 2.3 MazeCell Component ✅
- [x] Write MazeCell.stories.ts (wall, path, tunnel variants)
- [x] Write MazeCell.test.ts - 20 tests
- [x] Implement MazeCell.ts + CSS
- [x] Verify in Storybook

#### 2.4 Pacman Component ✅
- [x] Write Pacman.stories.ts (all directions, mouth animation)
- [x] Write Pacman.test.ts - 22 tests
- [x] Implement Pacman.ts + CSS (border trick for classic look)
- [x] Verify in Storybook

#### 2.5 Ghost Component ✅
- [x] Write Ghost.stories.ts (4 colors, frightened, flashing, eyes-only)
- [x] Write Ghost.test.ts - 37 tests
- [x] Implement Ghost.ts + CSS (4 types, 4 states, 4 look directions)
- [x] Verify in Storybook

#### 2.6 ScoreBoard Component ✅
- [x] Write ScoreBoard.stories.ts
- [x] Write ScoreBoard.test.ts - 29 tests
- [x] Implement ScoreBoard.ts + CSS
- [x] Verify in Storybook

#### 2.7 MazeLayout ✅
- [x] Write MazeLayout.stories.ts (full 28x31 grid)
- [x] Write MazeLayout.test.ts - 27 tests
- [x] Implement MazeLayout.ts
- [x] Verify in Storybook

#### 2.8 GameLayout ✅
- [x] Write GameLayout.stories.ts (maze + score + lives)
- [x] Write GameLayout.test.ts - 25 tests
- [x] Implement GameLayout.ts
- [x] Verify in Storybook

#### 2.9 Original Maze Data ✅
- [x] Create src/data/originalMaze.ts (28x31 classic arcade layout)
- [x] Add power pellet positions, ghost starting positions
- [x] Add ghost door marker
- [x] Verify maze matches original arcade reference

### Phase 3: ECS Core (Logic Layer) ✅ COMPLETE
#### 3.1 Entity Manager ✅
- [x] Write Entity.test.ts - 37 tests
- [x] Implement Entity.ts
- [x] Run tests

#### 3.2 World Container ✅
- [x] Write World.test.ts - 35 tests
- [x] Implement World.ts
- [x] Run tests

#### 3.3 Components ✅
- [x] Write component tests (Position, Velocity, GhostAI, etc.) - 36 tests
- [x] Implement components with proper types
- [x] Implement entity factory functions
- [x] Run tests

### Phase 4: Selectors ✅ COMPLETE
#### 4.1 Player Selectors ✅
- [x] Write playerSelectors.test.ts - 16 tests
- [x] Implement playerSelectors.ts
- [x] Run tests

#### 4.2 Ghost Selectors ✅
- [x] Write ghostSelectors.test.ts - 23 tests
- [x] Implement ghostSelectors.ts
- [x] Run tests

#### 4.3 Maze Selectors ✅
- [x] Write mazeSelectors.test.ts - 19 tests
- [x] Implement mazeSelectors.ts
- [x] Run tests

#### 4.4 Game Selectors ✅
- [x] Write gameSelectors.test.ts - 25 tests
- [x] Implement gameSelectors.ts
- [x] Run tests

### Phase 5: Event System ✅ COMPLETE
- [x] Write EventBus.test.ts - 18 tests
- [x] Implement EventBus.ts with generics
- [x] Implement GameEvents.ts (event types and payloads in src/types/events.ts)
- [x] Run tests

### Phase 6: Systems (Logic) ✅ COMPLETE
#### 6.1 InputSystem ✅
- [x] Write InputSystem.test.ts - 12 tests
- [x] Implement InputSystem.ts
- [x] Run tests

#### 6.2 MovementSystem ✅
- [x] Write MovementSystem.test.ts - 12 tests
- [x] Implement MovementSystem.ts
- [x] Run tests

#### 6.3 CollisionSystem ✅
- [x] Write CollisionSystem.test.ts - 12 tests
- [x] Implement CollisionSystem.ts
- [x] Run tests

#### 6.4 EatingSystem ✅
- [x] Write EatingSystem.test.ts - 16 tests
- [x] Implement EatingSystem.ts
- [x] Run tests

#### 6.5 GhostAISystem ✅
- [x] Write GhostAISystem.test.ts - 24 tests (all 4 behaviors)
- [x] Implement GhostAISystem.ts
- [x] Run tests

#### 6.6 PowerUpSystem ✅
- [x] Write PowerUpSystem.test.ts - 10 tests
- [x] Implement PowerUpSystem.ts
- [x] Run tests

### Phase 7: Integration Tests (Headless - No UI)

These tests verify game logic without any UI attached. They use:
- **EventBus** to dispatch input/game events (simulating UI actions)
- **Selectors** to query game state (simulating UI reads)
- **World + Systems** to run game logic

This allows full game flow testing in a fast, deterministic environment.

```typescript
// Example integration test pattern
describe('Player Movement Integration', () => {
  it('should move player when direction event dispatched', () => {
    const world = createWorld();
    const eventBus = createEventBus();
    setupGame(world); // Create entities, pellets, etc.

    // Dispatch event (simulates UI input)
    eventBus.dispatch('game:input:direction', { direction: 'right' });

    // Run game systems
    runSystems(world, eventBus, deltaTime);

    // Query state via selectors (how UI would read)
    const position = getPlayerPosition(world);
    expect(position.gridX).toBe(initialX + 1);
  });
});
```

#### 7.1 Player Movement Integration ✅
- [x] Write playerMovement.test.ts - 10 tests
  - Direction input → position change
  - Wall collision → blocked movement
  - Queued direction at intersections
  - Pause/resume state handling

#### 7.2 Ghost Behavior Integration ✅
- [x] Write ghostBehavior.test.ts - 10 tests
  - Scatter mode → move to corner
  - Chase mode → target player
  - Mode switching on events
  - Vulnerability state management

#### 7.3 Pellet Eating Integration ✅
- [x] Write pelletEating.test.ts - 10 tests
  - Player on pellet → pellet destroyed
  - Score increases by pellet value
  - All pellets eaten → level complete

#### 7.4 Power-Up Flow Integration ✅
- [x] Write powerUpFlow.test.ts - 13 tests
  - Power-up activates → ghosts vulnerable
  - Frightened ghost collision → ghost eaten
  - Ghost eaten → points (200, 400, 800, 1600)
  - Power-up timer expires → ghosts normal

#### 7.5 Game Flow Integration ✅
- [x] Write gameFlow.test.ts - 18 tests
  - Game start event → game state 'playing'
  - Player dies → lose life
  - Lives = 0 → game over
  - All pellets eaten → level complete
  - Pause/resume game
  - Restart game

### Phase 8: Wire Up & Final Integration ✅ COMPLETE
- [x] Create GameView.ts (connects UI to logic)
- [x] Connect UI to Logic via selectors (render loop)
- [x] Connect keyboard input to EventBus (KeyboardHandler.ts)
- [x] Game loop implementation (requestAnimationFrame)
- [x] Full game test with Chrome DevTools MCP
- [x] GameView.test.ts - 18 tests

### Phase 9: Death & Respawn System ✅ COMPLETE
- [x] Add 'dying' game state type
- [x] Implement PLAYER_DIED event handling in GameController
- [x] Reset Pacman and ghost positions on respawn
- [x] Preserve score after death
- [x] Clear power-up state on respawn
- [x] Add respawn delay (1.5s) with "Oops!" overlay
- [x] Death/respawn integration tests - 8 tests

---

## Verification Checklist (per step)

1. **Tests written** - Test file exists with meaningful test cases
2. **Tests fail** - Running tests shows failures (no implementation yet)
3. **Implementation done** - Feature code written
4. **TypeCheck passes** - `npm run typecheck` has no errors
5. **Linter passes** - `npm run lint` has no errors
6. **Tests pass** - `npm run test:run` shows green
7. **Storybook verified** - UI components look correct (Chrome DevTools MCP)
8. **User approved** - User confirms before next step

---

## NPM Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeCheck + Build for production
npm run test         # Run Vitest in watch mode
npm run test:run     # Run Vitest once
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
npm run storybook    # Start Storybook dev server
```

---

## Files Summary

| Layer | File Count | Purpose |
|-------|------------|---------|
| UI Components | 8 | Visual elements (Pellet, Ghost, Pacman, etc.) |
| UI Stories | 8 | Storybook stories for visual testing |
| Logic ECS | 3 | Entity/World management |
| Logic Components | 2 | Component factories + entity factories |
| Logic Systems | 6 | Game logic (Input, Movement, Collision, etc.) |
| Selectors | 4 | State queries (player, ghost, maze, game) |
| Events | 2 | EventBus + GameEvents definitions |
| Types | 2 | TypeScript type definitions |
| Unit Tests | 16+ | Individual component/system tests |
| Integration Tests | 5 | Headless game flow tests (no UI) |

---

## Current Progress

**Last Updated:** 2026-01-22

### Completed Phases
| Phase | Status | Tests |
|-------|--------|-------|
| Phase 1: Project Setup & Tooling | ✅ Complete | 8 tests (constants) |
| Phase 2: UI Components | ✅ Complete | 185 tests |
| Phase 3: ECS Core | ✅ Complete | 108 tests |
| Phase 4: Selectors | ✅ Complete | 83 tests |
| Phase 5: Event System | ✅ Complete | 18 tests |
| Phase 6: Systems | ✅ Complete | 86 tests |
| Phase 7: Integration Tests | ✅ Complete | 69 tests |
| Phase 8: Wire Up & Final Integration | ✅ Complete | 39 tests |
| Phase 9: Death & Respawn System | ✅ Complete | 8 tests |

### Test Summary
| Component | Test Count | Status |
|-----------|------------|--------|
| Pellet | 12 | ✅ |
| PowerPellet | 13 | ✅ |
| MazeCell | 20 | ✅ |
| Pacman | 22 | ✅ |
| Ghost | 37 | ✅ |
| ScoreBoard | 29 | ✅ |
| MazeLayout | 27 | ✅ |
| GameLayout | 25 | ✅ |
| GameView | 18 | ✅ |
| KeyboardHandler | 21 | ✅ |
| Constants | 8 | ✅ |
| Entity | 37 | ✅ |
| World | 35 | ✅ |
| Components | 36 | ✅ |
| Player Selectors | 16 | ✅ |
| Ghost Selectors | 23 | ✅ |
| Maze Selectors | 19 | ✅ |
| Game Selectors | 25 | ✅ |
| EventBus | 18 | ✅ |
| InputSystem | 12 | ✅ |
| MovementSystem | 12 | ✅ |
| CollisionSystem | 12 | ✅ |
| EatingSystem | 16 | ✅ |
| GhostAISystem | 24 | ✅ |
| PowerUpSystem | 10 | ✅ |
| Player Movement Integration | 10 | ✅ |
| Ghost Behavior Integration | 10 | ✅ |
| Pellet Eating Integration | 10 | ✅ |
| Power-Up Flow Integration | 15 | ✅ |
| Game Flow Integration | 29 | ✅ |
| Starting Positions | 12 | ✅ |
| Movement Collision | 13 | ✅ |
| Visual State | 10 | ✅ |
| Ghost Movement | 7 | ✅ |
| **Total** | **643** | ✅ |

### Features Implemented
- Full Pac-Man game with classic maze
- Pacman movement with wall collision
- Ghost AI with chase/scatter/frightened modes
- Power pellets make ghosts vulnerable
- Score system (pellets: 10, power: 50, ghosts: 200-1600)
- Lives system with death/respawn
- Pause/resume functionality
- Game restart functionality
- Pacman direction rotation
- Ghost eyes follow movement direction

### Next Up
- Sound effects
- High score persistence
- Level progression (faster ghosts, shorter power-up)
