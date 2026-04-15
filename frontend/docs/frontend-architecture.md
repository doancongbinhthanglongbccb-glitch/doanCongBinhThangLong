# Frontend Architecture

## Folder structure

```text
src/
  apps/
    public/
      pages/
      components/
      services/
    admin/
      pages/
      components/
      services/
  shared/
    components/
    types/
    utils/
  services/
    api/
```

## Data flow

### Public website
1. UI pages in `apps/public/pages` call public services.
2. Public services call API layer in `services/api`.
3. API returns content (currently mock storage), pages render unchanged UI.

### Admin CMS
1. UI pages in `apps/admin/pages` call admin services.
2. Admin services call API layer in `services/api` for CRUD.
3. After create/update/delete, Admin refetches to sync latest data.

## Design principles
- No shared global CMS context between Admin and Public.
- No business logic in UI components.
- API boundary is centralized and replaceable.
- Mock mode keeps frontend runnable before backend is ready.

## Backend readiness
- Introduced `httpClient.ts` for fetch-based integration.
- Introduced `endpoints.ts` to standardize route paths.
- Existing page/service signatures can stay stable when switching to real backend.
