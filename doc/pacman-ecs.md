# Simple Entity Component System for Pac-Man Style Game

## Entities (just IDs)
- Player
- Ghosts (4 instances)
- Pellets (many)
- Power Pellets (4)
- Fruit
- Maze/Walls

## Components (pure data)

| Component        | Data                                      |
|------------------|-------------------------------------------|
| Position         | grid x, y                                 |
| Velocity         | direction, speed                          |
| Sprite           | texture/animation reference               |
| Collider         | hitbox bounds                             |
| PlayerControlled | (tag - no data)                           |
| GhostAI          | behavior type (chase, scatter, frightened)|
| Edible           | point value                               |
| PowerUp          | duration, effect type                     |
| Vulnerable       | remaining time                            |
| Respawnable      | spawn position, delay                     |

## Systems (logic)

1. **InputSystem** - reads player input → sets player velocity direction
2. **GhostAISystem** - evaluates ghost behavior → sets ghost velocity direction
3. **MovementSystem** - applies velocity to position, handles wall collision
4. **CollisionSystem** - detects entity overlaps, emits collision events
5. **EatingSystem** - handles player eating pellets/ghosts
6. **PowerUpSystem** - manages power pellet effects and timers
7. **ScoreSystem** - tracks and updates score
8. **RenderSystem** - draws all entities with Sprite + Position

## Data Flow

```
Input → AI → Movement → Collision → Eating/PowerUp → Score → Render
```

## Key Design Points

- Ghosts share components but differ in **GhostAI** behavior data
- Power pellet temporarily adds **Vulnerable** component to ghosts
- Eaten ghosts get **Respawnable** added, **Vulnerable** removed
- Walls only need **Position** + **Collider** (no movement/AI)
