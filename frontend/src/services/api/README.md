# API Layer (Backend-only)

This folder provides a clean API boundary for the frontend.

## Current mode
- Domain APIs are split by responsibility: `postApi.ts`, `cmsApi.ts`.
- All CMS, post, and auth data is loaded from backend APIs.
- Refresh token is cookie-based (`httpOnly` cookie) and never stored in localStorage.
- Components consume only service modules, not storage fallbacks.

## API contract
- Endpoints are centralized in `endpoints.ts`.
- Set `VITE_API_BASE_URL` in environment files.

## Backend endpoints
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/config`
- `PUT /api/config`
- `GET /api/posts`
- `GET /api/posts/cms`
- `GET /api/posts/:slug`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `PUT /api/posts/:id/publish`
- `DELETE /api/posts/:id`
