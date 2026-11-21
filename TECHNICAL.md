# Battle Todo: developer notes

Implementation detail for the client-only, two-player battle todo game. For the
game itself and how to play it, see [README.md](README.md).

## Stack

Versions below are resolved from `bun.lock` (lockfileVersion 2, `bun.lock:1-2`).
There is no `package-lock.json` or `yarn.lock`. The manifest states minimums, so
the lockfile wins where the two disagree.

| Component | Resolved version | Evidence |
| --- | --- | --- |
| React / React DOM | 19.3.0 | `bun.lock:681`, `bun.lock:683` |
| Vite | 8.3.0 | `bun.lock:815` |
| @vitejs/plugin-react | 6.1.1 | `bun.lock:229` |
| TypeScript | 5.9.3, strict mode | `bun.lock:795`, `tsconfig.json` |
| TailwindCSS / @tailwindcss/vite | 4.3.3 | `bun.lock:777`, `bun.lock:211` |
| lucide-react | 1.47.0 | `bun.lock:555` |
| @biomejs/biome | 2.5.14 | `bun.lock:33` |
| husky | 9.1.7 | `bun.lock:433` |
| commitlint | 21.x | `package.json:19-20` |
| Package manager | bun | `bun.lock:1-2`, `package.json:7-15` |

`package.json:22-23` declares `react`/`react-dom` as `^19.2.8`, but `bun.lock`
resolves both to 19.3.0. The shipped version is 19.3.0. Every other manifest
range resolves to the versions above with no further disagreement.

The Bun runtime itself is not pinned. `Dockerfile:1` uses
`docker.io/oven/bun:1-alpine`, which floats within major version 1. The exact
Bun patch version is **UNKNOWN — requires human input**: no `mise.toml`,
`.tool-versions` or lockfile entry fixes it. `README.md:40` and `AGENTS.md` say
"Bun 1.4+", but nothing pinned in the repo confirms that.

## Architecture

There is one browser route (`/`), no server-side application and no router.
`index.html:11` loads `/src/main.tsx`, which calls `createRoot(#root).render(...)`
with `#root` declared at `index.html:10` and the render at `src/main.tsx:9-13`.
`<App/>` renders the whole arena — two fighter panels, the VS column, the combat
feed and the settings and victory overlays — as in-component state rather than
as routes (`src/App.tsx:53-466`). Every deep link returns the same screen through
the nginx SPA fallback (`.containerize/nginx-spa.conf.template:7-9`).

All state and rules live in the `useGame` hook (`src/hooks/useGame.ts`); the
interfaces are in `src/types.ts`, persistence helpers in `src/utils/helpers.ts`,
the hardcoded initial state in `src/utils/constants.ts`, and sound is
synthesised through WebAudio in `src/utils/sound.ts` with no audio files.
Damage is `10 + 11*min(round,10)` plus `random(0..10)`, where
`round = floor(battleLog.length/2)` (`src/hooks/useGame.ts:16-27`); healing is
`random(10..25)` capped at max HP (`src/hooks/useGame.ts:214-215`). Initial state
is two players at 100 HP with empty quest lists (`src/utils/constants.ts:10-30`).

Two details matter when editing the UI:

- `isWinner` is derived from `state.winner === 1 || state.winner === 2`, so it is
  always a boolean and never null. Controls use `disabled={isWinner}`; the old
  `isWinner !== null` form disabled every input because `false !== null` is true
  (`AGENTS.md`). Floater updates stay outside the `setState` callback and the
  damage value is captured before `setState` to avoid stale closures.
- The HP bar is a two-layer ghost-drain: `.hp-main` snaps to the new value while
  `.hp-ghost` drains slowly behind it (`AGENTS.md`; the bar is rendered in
  `src/components/BattleSide.tsx:65-269`).

## Data model

No database, migrations, SQL dumps or ORM. The model is a set of TypeScript
interfaces serialised to `localStorage`:

- `Player` (`src/types.ts:1-8`): `name`, `hp`, `maxHp`, `color`, `glow` and an
  embedded `Task[]`.
- `Task` (`src/types.ts:10-15`): generated `id`, `text`, `completed`, `damage`.
- `BattleLogEntry` (`src/types.ts:17-23`): `id`, `text`, a `type` of `damage` or
  `heal`, `player`, `timestamp`.
- `GameState` (`src/types.ts:33-39`): `player1`, `player2`, `currentTurn` (1 or 2),
  `winner`, `battleLog`.
- `GameData` (`src/types.ts:41-49`): all `GameState` fields plus `player1Name`
  and `player2Name`.

The persisted blob lives under `battle-todo-state` (`src/utils/constants.ts:3`,
`src/utils/helpers.ts:8-40`): an effect writes it (`src/hooks/useGame.ts:68-78`),
init reads it (`src/hooks/useGame.ts:30-54`) and reset removes it
(`src/hooks/useGame.ts:259`). It holds players, turn, winner, battle log and both
names; transient UI state such as floaters and screen shake is deliberately not
saved (`AGENTS.md`). Sound mute is stored separately under `battle-todo-muted`
as a `"1"`/`"0"` string (`src/utils/sound.ts:6-20`).

No table is queried without a migration and no schema was reconstructed, because
there is no backend to query. That is the app's actual shape, not a gap in this
document.

## Auth

None. There is no login, guard, middleware or token handling, and `src/` contains
no auth, login, token or session logic. The nginx `location /` is open
(`.containerize/nginx-spa.conf.template:7-9`) and every overlay is reachable.
Nothing is deliberately protected because there is no user identity to protect.

## External services

None. There are no HTTP calls anywhere in `src/` (no `fetch`, `axios` or
`XMLHttpRequest`), and no cache, session, queue, mail, file storage or
third-party API. There are no env var names to configure: no `.env.example`, no
`import.meta.env` and no `VITE_*` or `REACT_APP_*` in source or `vite.config.ts`.

## Operational risks

- The Bun build image floats on major version 1 (`Dockerfile:1`), so builds are
  not byte-reproducible over time; the exact patch is the UNKNOWN noted above.
- `ENV NODE_OPTIONS=--openssl-legacy-provider` is set in the build stage
  (`Dockerfile:6`) as a build-tool compatibility flag. It does not affect the
  runtime image.
- `PORT` is baked to `8080` (`Dockerfile:13-14`) and read by the nginx template
  through `${PORT}` (`.containerize/nginx-spa.conf.template:2`). The two
  currently agree; a change to one without the other breaks readiness.
- The repo also ships a standalone `nginx.conf` listening on `80` (`nginx.conf:8`)
  that the image does not use. `Dockerfile:12` copies the `.containerize`
  template instead, so treat that template as the live config.
- No DB, seed step, queue, scheduler or jobs exist, so nothing silently fails to
  start. There are no writable paths at runtime beyond nginx's own temp dirs and
  no volume is needed: game progress is per-browser `localStorage`, unaffected
  by pod restarts. Nothing breaks above one replica because there is no shared
  server state.
- Browser boot reads `localStorage` in `loadState()` (`src/hooks/useGame.ts:30-54`)
  and in sound init (`src/utils/sound.ts:8-14`), both wrapped in try/catch.
- No hardcoded credentials were found.

## Container layout

Multi-stage static SPA image. The build stage uses `docker.io/oven/bun:1-alpine`,
runs `bun install --frozen-lockfile` (`Dockerfile:4`), sets the legacy OpenSSL
flag (`Dockerfile:6`) and runs `bun run build` (`Dockerfile:8`) to produce `dist/`.
The runtime stage is `docker.io/nginxinc/nginx-unprivileged:1.27-alpine`
(`Dockerfile:10`), serving `dist/` from `/usr/share/nginx/html` with an SPA
fallback (`Dockerfile:11-12`, `.containerize/nginx-spa.conf.template:7-9`).
There is no process manager, application server or Node runtime in the final
image; nginx runs in the foreground on port 8080.

Repo-local details that must survive any regeneration: the build-time
`NODE_OPTIONS=--openssl-legacy-provider` flag and the `.containerize` nginx
template copied over nginx's default with `${PORT}` substitution, not the
standalone `nginx.conf`. `Solo/battle-todo` is not one of the six never-re-render
repos and is marked re-render = yes in the archetype matrix. DB smoke is boot and
healthcheck only, with an empty `db_driver` (`CONTAINERIZE.md:21-22`), so no DB
check applies.

## Open questions

- UNKNOWN — requires human input: the exact Bun runtime patch version
  (`Dockerfile:1` pins only major 1; `README.md:40` and `AGENTS.md` claim 1.4+).
- UNKNOWN — requires human input: whether the older `docs/` assets
  (`arena.png`, `strike.png`, `gameplay.gif`) still match the current UI. They
  are documentation assets and were not verified against source in the report.
