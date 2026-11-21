# CONTAINERIZE - Solo/battle-todo

Archetype: react-spa. Generated 2026-11-20T22:42:21+07:00 by .opencode/scripts/render.sh on branch chore/containerize (uncommitted).

## Generated files
- Dockerfile (template: Dockerfile.spa)
- Jenkinsfile (CI only; parameters REGISTRY, HARBOR_PROJECT, HARBOR_CRED_ID)
- .dockerignore
- .containerize/nginx-spa.conf.template

## Local run
```sh
bash .opencode/scripts/build.sh Solo/battle-todo
bash .opencode/scripts/smoke.sh Solo/battle-todo
```
Manual run: podman run --rm --network=host --env-file /home/richie/Documents/Programming/Projects/.smoke.env -e PORT=<free-port> containerize/battle-todo:local

## Required env var NAMES (values never stored here)
unknown - inspect app config (do not print secret values)

## DB smoke
boot + healthcheck only (DB not smoke-tested). db_driver: unknown. Never migrate/seed/modify; DBs are live.

## Flags

Smoke results: 2026-11-20T23:07:56+07:00 boot=PASS http=200 db=not verified (no read-only CLI for react-spa; health endpoint only)
Smoke results: 2026-11-21T21:26:28+07:00 boot=PASS http=200 db=skipped (legacy mysqli app; pgsql not supported without a code rewrite)
