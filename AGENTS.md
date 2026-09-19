# AGENTS.md - Battle Todo Project

## Project Overview

**Battle Todo** is a React + TypeScript 2-player battle todo list game. Players add tasks, check them to deal damage to the opponent, and try to reduce the opponent's HP to zero.

- **Runtime**: Bun 1.4 (via mise)
- **Linter/Formatter**: Biome 2.x (replaces oxlint)
- **Framework**: React 19 + TypeScript via Vite
- **Location**: `~/Documents/Programming/battle-todo`
- **Build command**: `bun run build`
- **Typecheck**: `bun run typecheck` (`tsc --noEmit` — must pass; catches prop-type and state-shape errors that Vite build alone does not)
- **Dev command**: `bun run dev`
- **Lint**: `bun x biome check`
- **Format**: `bun x biome format --write`
- **Format check**: `bun x biome format --check`
- **Package manager**: Bun (`bun install`, `bun add`, `bun x`)

## Architecture

### File Structure

```
src/
├── App.tsx                    # Main App component
├── main.tsx                   # Entry point
├── index.css                  # Global styles, CSS custom properties, keyframes
├── types.ts                   # All TypeScript interfaces (Player, Task, GameState, etc.)
├── utils/
│   ├── helpers.ts             # generateId, saveState, loadState, createPlayer
│   ├── sound.ts               # WebAudio synth SFX (hit, crit, heal, turn, victory), mute persisted in localStorage
│   └── constants.ts           # STORAGE_KEY, initialState, player/HP color constants, timeouts
├── hooks/
│   └── useGame.ts             # Custom hook: all game logic and state management
└── components/
    ├── BattleSide.tsx         # Player panel (input, tasks, heal button)
    ├── TaskItem.tsx           # Individual task with checkbox
    └── Floater.tsx            # Damage/heal floating number animation
```

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
| `src/App.tsx` | Main App component - orchestrates everything |
| `src/hooks/useGame.ts` | Custom hook with all game logic (addTask, toggleTask, healPlayer, etc.) |
| `src/types.ts` | All TypeScript interfaces |
| `src/components/BattleSide.tsx` | Player panel component |
| `src/components/TaskItem.tsx` | Task item with checkbox |
| `src/components/Floater.tsx` | Damage/heal floating number |
| `src/utils/helpers.ts` | Utility functions |
| `src/utils/constants.ts` | Constants |
| `src/index.css` | Global CSS |
| `src/main.tsx` | Entry point |
| `biome.json` | Biome lint/format config |
| `tsconfig.json` | TypeScript config |
| `vite.config.ts` | Vite config |
| `commitlint.config.cjs` | Commitlint config |

### Clean Code Principles

- **Custom Hook**: `useGame()` encapsulates all game state and logic
- **Type Safety**: All interfaces defined in `src/types.ts`
- **Component Separation**: BattleSide, TaskItem, Floater each in their own file
- **Utility Separation**: helpers.ts (functions) and constants.ts (values)
- **Single Responsibility**: Each file has a clear purpose

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
All game state is in `useGame()` custom hook. State includes:
- `player1`, `player2`: Player objects with `{name, hp, maxHp, tasks, color, glow}`
- `currentTurn`: 1 or 2
- `winner`: player number or null
- `battleLog`: array of action objects
- `floaters`: array of damage/heal number objects
- `screenShake`: boolean
- `showSettings`: boolean
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
A `setInterval` in `useGame()` removes floaters older than 1200ms to prevent memory leaks.

### Screen shake
`shakeTimerRef` manages the shake timeout. `resetGame` clears it to avoid state updates after unmount.

### isWinner boolean bug (history)
Previously `isWinner !== null` and `isWinner !== true` were used instead of `isWinner`. This caused all inputs/buttons to be disabled because `false !== null` and `false !== true` are both `true`. Fixed to `disabled={isWinner}`.

### No page-level auto-scroll on mount (history)
A `logEndRef.current?.scrollIntoView()` effect once ran on mount and yanked the whole page down to the combat feed on every load, hiding the header. It was removed entirely: the feed renders newest-first (`.slice().reverse()`), so no scroll pinning is needed. Rule: never `scrollIntoView` a page-level element on mount; if a scrollable panel ever needs pinning, scroll its inner container, not the page. When removing such behavior, also remove its now-dead API (`logEndRef` was dropped from the hook return and `App`) instead of leaving dead code.

## TypeScript Conventions

- Strict mode enabled in `tsconfig.json`
- `noUnusedLocals` and `noUnusedParameters` enabled
- All types defined in `src/types.ts`
- Use `type` keyword for type-only imports where applicable
- `export default function App()` pattern
- Custom hooks prefixed with `use`
- React types from `@types/react` and `@types/react-dom`

## CSS Conventions

- CSS custom properties used for theme colors: `--player-color`, `--player-glow`, `--hp-green`, etc.
- Fighter cards set `--player-color`/`--player-glow` inline; children consume them (quest cards, badges, glows)
- HP bar uses a two-layer ghost-drain technique: `.hp-main` snaps fast, `.hp-ghost` (white) drains slowly behind it
- Combat numbers are `.floater` + `.floater-damage` / `.floater-crit` (DMG ≥ 19) / `.floater-heal`; horizontal spread comes from the `index` prop, tilt via `--floater-tilt`
- All keyframe animations are in `src/index.css` (`@layer utilities`); component classes in `@layer components`

## Adding New Features

1. All React component code goes in `src/components/`
2. All game logic goes in `src/hooks/useGame.ts`
3. All types go in `src/types.ts`
4. All utilities go in `src/utils/`
5. All CSS goes in `src/index.css`
6. After changes, run `bun run typecheck`, `bun x biome check`, and `bun run build` to verify
7. For UI bugs, verify visually, not just via DOM: serve with `bun run preview`, screenshot with headless Chromium (`chromium --headless --disable-gpu --no-sandbox --screenshot=...`), and compare. An element present in `--dump-dom` can still paint off-screen or invisible — the missing-header bug was only provable this way.
8. Run `bun x biome format --write` to auto-format code
9. Update this AGENTS.md if architecture changes

## Python (for automation scripts)

Use `uv`, never system `pip` directly. System `pip install --break-system-packages` breaks the Python environment. Always create a virtual environment first:

```bash
uv venv /tmp/opencode/venv-name
uv pip install --python /tmp/opencode/venv-name <package>
/tmp/opencode/venv-name/bin/python script.py
```

This was discovered by accident: installing `pillow` and `websocket-client` via system `pip` corrupted the Python environment (both packages were later uninstalled and reinstalled into a `uv` venv at `/tmp/opencode/readme-shots`). Always use `uv venv` + `uv pip install --python <venv-path>` to keep the system Python clean.

## Git Hooks

Uses **Husky v9** + **commitlint** + **Biome**
- **Husky**: `.husky/` directory with `pre-commit` and `commit-msg` hooks
  - `pre-commit`: Runs `bun x biome check`, blocks commit if lint fails
  - `commit-msg`: Runs `bun x commitlint --edit "$1"`, validates conventional commit format (`type(scope): description`)
- **commitlint config**: `commitlint.config.cjs` (CommonJS due to `"type": "module"` in package.json)
- **Biome config**: `biome.json` (linting + formatting)
- Hooks auto-set up via `bun run prepare` (which runs `husky`)
- Conventional commit types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- **Husky v9 deprecation**: The `_/husky.sh` sourcing line in hooks is deprecated but still works; will be removed in v10.

## Biome

- Uses `@biomejs/biome` v2.x (installed via `bun add --dev @biomejs/biome`)
- Config file: `biome.json`
- `bun x biome check` — lint + format check
- `bun x biome format --write` — auto-format code
- `bun x biome format --check` — check formatting without modifying
- A11y rules `noStaticElementInteractions`, `useKeyWithClickEvents`, `noLabelWithoutControl` are disabled (game UI has interactive divs)
- `assist.source.organizeImports` is enabled (auto-sorts imports)

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
- **Bun not found**: Use `mise run bun --version` or export `PATH="/home/u85/.local/share/mise/installs/bun/latest/bin:$PATH"`. Bun symlinks also available at `~/.local/bin/bun`
- **Bun lockfile**: `bun.lock` is the lockfile (not `package-lock.json`). Commit `bun.lock` to git.
- **commitlint config**: Must be `commitlint.config.cjs` (not `.js`) because package.json has `"type": "module"`
- **TypeScript**: `tsconfig.json` has strict mode. Check `noUnusedLocals` and `noUnusedParameters`.
- **CSS not applied**: `index.html` must reference `/src/main.tsx` (the entry that imports `index.css`). Keep exactly one `vite.config.ts` (with the Tailwind plugin) — a stale `vite.config.js` without the plugin will shadow it and break Tailwind.
- **Callback prop types**: `onAddTask`/`onToggleTask`/`onHeal` use `playerNum: 1 | 2` (not `number`), matching the hook signatures.
- **`initialState` shape**: `src/utils/constants.ts` types it as `GameState`, so new `Player` fields must be added there too.
