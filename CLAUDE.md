# AI Pacman - Project Instructions

## Documentation

For detailed information, see:
- @doc/pacman-implementation-plan.md - Full implementation plan, progress tracking, test counts
- @doc/pacman-ecs.md - Entity Component System architecture
- @doc/implementation-rules.md - Development workflow rules

## Architecture

This project uses **strict UI/Logic separation**:

```
UI Layer (src/ui/)          →  Selectors (read state)  →  World (game state)
                            ←  EventBus (dispatch)     ←  Systems (logic)
```

- **UI components** are pure presentation (no game logic)
- **Selectors** query game state (Redux-like pattern)
- **EventBus** handles UI → Logic communication
- **Systems** contain all game logic (ECS pattern)

## Key Rules

### Development Workflow
1. **TDD**: Write tests first, verify they fail, then implement
2. **Storybook first**: Create stories for UI components before implementation
3. **Update progress**: After completing tasks, update `doc/pacman-implementation-plan.md`
4. **Run tests**: Always verify with `npm test` before committing

### Code Organization
| Layer | Location | Purpose |
|-------|----------|---------|
| UI Components | `src/ui/components/` | Visual elements |
| Game Logic | `src/logic/systems/` | ECS systems |
| State Queries | `src/selectors/` | Redux-like selectors |
| Events | `src/events/` | EventBus + event types |
| Types | `src/types/` | TypeScript definitions |

### System Execution Order
```
Input → GhostAI → Movement → Eating → PowerUp → Collision
```
This order is critical - Eating must run before Collision so power pellets protect the player.

## Common Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm test             # Run tests in watch mode
npm run test:run     # Run tests once
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npm run storybook    # Storybook UI development
```

## Current State

- **643 tests** passing
- All 9 phases complete (see implementation plan)
- Features: Movement, Ghost AI, Power pellets, Score, Lives, Death/Respawn

## Game Constants

Key values in `src/utils/constants.ts`:
- `TILE_SIZE`: 20px
- `PLAYER_SPEED`: 1.6 (BASE_SPEED * 0.8)
- `GHOST_SPEED`: 1.5 (BASE_SPEED * 0.75)
- `POWER_DURATION`: 6000ms
- `RESPAWN_DELAY`: 1500ms

## Testing Patterns

Integration tests use helpers from `tests/integration/setup.ts`:
```typescript
const game = setupGame(playerX, playerY);
const game = setupGameWithGhosts(playerX, playerY, ghostPositions);
const game = setupGameWithPellets(playerX, playerY, pelletPositions);
runSystems(world, systems);
runFrames(world, systems, frameCount);
```

## Debugging

Use Chrome DevTools MCP to:
- Take snapshots of the game
- Check console for `[EATING]`, `[POWERUP]`, `[COLLISION]` logs (if enabled)
- Inspect element positions and states
