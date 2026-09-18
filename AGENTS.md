# AGENTS.md - Battle Todo Project

## Project Overview

**Battle Todo** is a React-based 2-player battle todo list game. Players add tasks, check them to deal damage to the opponent, and try to reduce the opponent's HP to zero.

- **Framework**: React 19 via Vite
- **Location**: `~/Documents/Programming/battle-todo`
- **Build command**: `npm run build`
- **Dev command**: `npm run dev`
- **Lint**: `npx oxlint`

## Architecture

### Component Hierarchy

```
App
├── BattleSide (player 1 panel)
│   ├── TaskItem
│   └── Floater (damage/heal animations)
├── BattleSide (player 2 panel)
│   ├── TaskItem
│   └── Floater (damage/heal animations)
├── VictoryOverlay
└── BattleLog
```

### Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main game logic, all state management, all components |
| `src/App.css` | All styling (~750 lines) |
| `src/index.css` | Global styles, CSS custom properties, keyframe animations |
| `src/main.jsx` | Entry point |
| `index.html` | HTML template |
| `vite.config.js` | Vite configuration |
| `package.json` | Dependencies and scripts |

### All code is in App.jsx

Everything (App, BattleSide, TaskItem, Floater components) is in a single file `src/App.jsx`. No separate component files.

## Game Mechanics

### Rules
- 2 players start with 100 HP each
- Players take turns (Player 1 starts)
- Add a task → check its checkbox → deals random 10-20 DMG to opponent
- **Heal only works if you have NO pending tasks** (prevents heal stall)
- Heal restores 10-25 HP and ends the turn
- First player to reduce opponent HP to 0 wins

### Turn System
- Only the current player can add tasks, check tasks, or heal
- `state.currentTurn` (1 or 2) determines whose turn it is
- Turn switches after any valid action (task check or heal)
- Heal requires no pending tasks (prevents heal stall)

### State Management
All game state is in `useState` in `App`. State includes:
- `player1`, `player2`: objects with `{name, hp, maxHp, tasks, color, glow}`
- `currentTurn`: 1 or 2
- `winner`: player number or null
- `battleLog`: array of action objects
- `floaters`: array of damage/heal number objects
- `screenShake`: boolean
- `player1Name`, `player2Name`: separate state for settings

### LocalStorage Persistence
- `saveState()` serializes essential state to `localStorage` under key `battle-todo-state`
- `loadState()` deserializes on app init
- Only saves: players, turn, winner, battleLog, names (NOT floaters or screenShake)

## Important Patterns & Gotchas

### `isWinner` is a boolean, NOT null
`isWinner` comes from `state.winner === 1` or `state.winner === 2`. It is always a boolean (`true` or `false`). Use `disabled={isWinner}` NOT `disabled={isWinner !== null}`.

### `setFloaters` must NOT be inside `setState` callback
`setFloaters` is called outside the `setState` callback in `toggleTask` and `healPlayer`. React's `setState` callback must be pure.

### `damage` is captured before `setState`
In `toggleTask`, `damage` is extracted from the task before `setState`, then used in `setFloaters` after. This avoids stale closures.

### Floater cleanup
A `setInterval` in a `useEffect` removes floaters older than 1200ms to prevent memory leaks.

### Screen shake
`shakeTimerRef` manages the shake timeout. `resetGame` clears it to avoid state updates after unmount.

## CSS Conventions

- CSS custom properties used for theme colors: `--player-color`, `--player-glow`, `--hp-green`, etc.
- `.player-panel` styles use `::before` pseudo-element for the colored top border
- `.flipped` class on Player 2 panel adds a left border (not a flip)
- `.effects-layer` has `overflow: hidden` to clip flying number animations
- All keyframe animations are in `src/index.css`

## Adding New Features

1. All React component code goes in `src/App.jsx`
2. All CSS goes in `src/App.css` (keyframes in `src/index.css`)
3. Never create new component files - keep everything in App.jsx
4. After changes, run `npx oxlint` and `npm run build` to verify
5. Update this AGENTS.md if architecture changes

## Common Issues

- **Input disabled**: Check that `disabled={isWinner}` (not `!== null`) on all inputs/buttons
- **Cannot add task**: Ensure `addTask` reads `newTask1`/`newTask2` from closure (not stale)
- **Floaters not showing**: Check that `setFloaters` is called outside `setState` callback
- **Turn not switching**: Verify `currentTurn` is updated in the `setState` return object
- **Heal not working**: Check `hasPendingTasks` - can only heal if all tasks are completed. Button text shows pending task count.
