# API Layer (Mock-first, Backend-ready)

This folder provides a clean API boundary for the frontend.

## Current mode
- Domain APIs are split by responsibility: `postApi.ts`, `userApi.ts`, `mediaApi.ts`.
- `cmsApi.ts` remains a content aggregate API for CMS sections and shared collections.
- A shared mock store module powers CMS-backed domains in mock mode.
- Public/Admin pages do not read/write global shared context.
- Components only consume app services under `src/apps/*/services`.

## Backend migration plan
1. Keep function signatures unchanged in domain APIs where possible.
2. Replace mock implementation with HTTP requests via `httpClient.ts`.
3. Use endpoint constants in `endpoints.ts` to avoid hard-coded URLs.
4. Set `VITE_API_BASE_URL` in environment files.

## Expected backend endpoints
- `GET /api/cms`
- `PUT /api/cms`
- `POST /api/cms/:collection`
- `PATCH /api/cms/:collection/:id`
- `DELETE /api/cms/:collection/:id`
- `GET /api/posts`
- `GET /api/posts/:id`
- `POST /api/posts`
- `PATCH /api/posts/:id`
- `DELETE /api/posts/:id`
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/media`
- `GET /api/media/:id`
- `POST /api/media`
- `PATCH /api/media/:id`
- `DELETE /api/media/:id`
