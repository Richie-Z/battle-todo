# AGENTS.md - Battle Todo Project

## Project Overview

**Battle Todo** is a React-based 2-player battle todo list game. Players add tasks, check them to deal damage to the opponent, and try to reduce the opponent's HP to zero.

- **Runtime**: Bun 1.4 (via mise)
- **Framework**: React 19 via Vite
- **Location**: `~/Documents/Programming/battle-todo`
- **Build command**: `bun run build`
- **Dev command**: `bun run dev`
- **Lint**: `bun x oxlint`
- **Package manager**: Bun (`bun install`, `bun add`, `bun x`)

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
| `commitlint.config.cjs` | Commitlint configuration |

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
`isWinner` comes from `state.winner === 1` or `state.winner === 2`. It is always boolean (`true` or `false`). Use `disabled={isWinner}` NOT `disabled={isWinner !== null}`.

### `setFloaters` must NOT be inside `setState` callback
`setFloaters` is called outside the `setState` callback in `toggleTask` and `healPlayer`. React's `setState` callback must be pure.

### `damage` is captured before `setState`
In `toggleTask`, `damage` is extracted from the task before `setState`, then used in `setFloaters` after. This avoids stale closures.

### Floater cleanup
A `setInterval` in a `useEffect` removes floaters older than 1200ms to prevent memory leaks.

### Screen shake
`shakeTimerRef` manages the shake timeout. `resetGame` clears it to avoid state updates after unmount.

### isWinner boolean bug (history)
Previously `isWinner !== null` and `isWinner !== true` were used instead of `isWinner`. This caused all inputs/buttons to be disabled because `false !== null` and `false !== true` are both `true`. Fixed to `disabled={isWinner}`.

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
4. After changes, run `bun x oxlint` and `bun run build` to verify
5. Update this AGENTS.md if architecture changes

## Git Hooks

Uses **Husky v9** + **commitlint**
- **Husky**: `.husky/` directory with `pre-commit` and `commit-msg` hooks
  - `pre-commit`: Runs `bun x oxlint`, blocks commit if lint fails
  - `commit-msg`: Runs `bun x commitlint --edit "$1"`, validates conventional commit format (`type(scope): description`)
- **commitlint config**: `commitlint.config.cjs` (CommonJS due to `"type": "module"` in package.json)
- Hooks auto-set up via `bun run prepare` (which runs `husky`)
- Conventional commit types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- **Husky v9 deprecation**: The `_/husky.sh` sourcing line in hooks is deprecated but still works; will be removed in v10. To upgrade, replace hook files with: `#!/usr/bin/env sh\nbun x oxlint` (pre-commit) / `#!/usr/bin/env sh\nbun x commitlint --edit "$1"` (commit-msg)

## Updating Dependencies

- Run `bun run update-deps` to update all deps to latest versions
- Uses `npm-check-updates` (NCU) to bump versions in package.json, then `bun install`
- Also run `bun install` after any package.json changes

## Common Issues

- **Input disabled**: Check that `disabled={isWinner}` (not `!== null`) on all inputs/buttons
- **Cannot add task**: Ensure `addTask` reads `newTask1`/`newTask2` from closure (not stale)
- **Floaters not showing**: Check that `setFloaters` is called outside `setState` callback
- **Turn not switching**: Verify `currentTurn` is updated in the `setState` return object
- **Heal not working**: Check `hasPendingTasks` - can only heal if all tasks are completed. Button text shows pending task count.
- **Bun not found**: Use `mise run bun --version` or export `PATH="/home/u85/.local/share/mise/installs/bun/latest/bin:$PATH"`
- **Bun lockfile**: `bun.lock` is the lockfile (not `package-lock.json`). Commit `bun.lock` to git.
- **commitlint config**: Must be `commitlint.config.cjs` (not `.js`) because package.json has `"type": "module"`
