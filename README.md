# doanCongBinhThangLong

Production-ready CMS stack with:
- Frontend: React + Vite
- Backend: Express + MongoDB (Mongoose)
- Auth: JWT access token + httpOnly refresh cookie

## Runtime Workflow

This repository is standardized around isolated Docker environments with dual development modes.

### Production (single entrypoint)

Use only:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml -p prod up -d --build
```

Or with npm shortcuts:

```bash
npm run prod:start
```

Stop and logs:

```bash
npm run prod:stop
npm run prod:logs
```

Do not run plain `docker compose up` and do not mix `-p dev` with `-p prod` in the same workflow.

## Development Modes

### Mode A: Full Docker (default)

Command:

```bash
npm run dev:full
```

What it does:
- Starts `mongo`, `backend`, `frontend`, `nginx` in compose project `dev`.
- Frontend is accessed through Nginx: `http://localhost:${DEV_HTTP_PORT}`.
- Frontend API target is `/api` (proxied by Nginx).
- Guards against mode mixing by failing fast if local Vite (`5173`) is already running.

### Mode B: Vite Local (fast UI dev)

Commands:

```bash
npm run dev:backend
npm run dev:ui
```

What it does:
- `dev:backend` starts only `mongo` + `backend` and stops docker `frontend` + `nginx`.
- `dev:ui` ensures `mongo` + `backend` are up, then runs local Vite on `5173`.
- Local Vite receives `VITE_API_URL=http://localhost:${DEV_API_PORT}` automatically.

### Conflict Prevention Rules (critical)

- Do not run Mode A and Mode B at the same time.
- Mode A blocks start when `5173` is occupied.
- Mode B explicitly stops docker `frontend` and `nginx`.

## Development Commands

- `npm run dev:full`: Start full Docker mode (`mongo`, `backend`, `frontend`, `nginx`) with preflight conflict checks.
- `npm run dev:start`: Alias of `npm run dev:full`.
- `npm run dev:backend`: Start backend-only docker mode (`mongo`, `backend`) and stop docker `frontend`/`nginx`.
- `npm run dev:ui`: Run local Vite mode (port `5173`) with API auto-bound to `http://localhost:${DEV_API_PORT}`.
- `npm run dev:stop`: Stop dev stack and remove dev containers/networks from compose.
- `npm run dev:restart`: Stop then start full Docker mode and run health checks.
- `npm run dev:logs`: Stream logs from all dev services.
- `npm run dev:check`: Full Docker mode health check (expects `mongo`, `backend`, `frontend`, `nginx`).
- `npm run dev:reset`: Safe cleanup for the `dev` project only (`down -v --remove-orphans` plus project-labeled leftovers). It does not delete unrelated Docker projects.

Examples:

```bash
npm run dev:full
npm run dev:check
npm run dev:logs
npm run dev:reset
```

Mode B example:

```bash
npm run dev:backend
npm run dev:ui
```

If `npm run dev:start` reports a port conflict:

```env
# .env.dev
DEV_HTTP_PORT=8081
```

Then rerun full mode:

```bash
npm run dev:full
```

## Test

Backend:

```bash
cd backend && npm test
```

Frontend:

```bash
cd frontend && npm test
```

## Endpoints

- Dev entrypoint (Nginx): `http://localhost:${DEV_HTTP_PORT}` (default `http://localhost:8081`)
- Dev backend direct: `http://localhost:${DEV_API_PORT}` (default `http://localhost:5005`)
- Dev health through Nginx: `GET /health`
- Backend health: `GET /api/health`

## CI

GitHub Actions workflow is defined in `.github/workflows/ci.yml` and runs:
- Backend tests
- Frontend tests
- Frontend production build

## Production

Deployment details, Nginx config, Sentry setup, backups, and migration guidance live in [docs/production-deployment.md](docs/production-deployment.md).

