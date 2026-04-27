# Migration Blueprint: website_lu_doan-style structure

## Goal
Adopt a clearer fullstack architecture inspired by website_lu_doan while preserving existing API behavior and deployment stability.

## Strategy
Use incremental refactors with compatibility layers.

- No big-bang rewrite
- Keep route contracts stable in early phases
- Move one domain slice at a time
- Leave re-export wrappers in legacy paths until all imports are migrated

## Target Backend Shape

backend/src/
- core/
- modules/
  - auth/
    - controller/
    - service/
    - repository/
    - routes/
    - domain/
  - post/
    - controller/
    - service/
    - repository/
    - routes/
    - domain/
  - config/
    - controller/
    - service/
    - repository/
    - routes/
    - domain/
- middleware/
- utils/
- validation/
- app.js
- server.js

## Target Frontend Shape

frontend/src/
- app/
  - providers/
  - routes/
- features/
  - auth/
  - posts/
  - config/
  - chatbot/
- shared/
  - components/
  - hooks/
  - lib/
  - types/
  - constants/

## Completed In This PR

Backend `config` slice migrated to modular structure:
- modules/config/domain/default-config.js
- modules/config/repository/config.repository.js
- modules/config/service/config.service.js
- modules/config/controller/config.controller.js
- modules/config/routes/config.routes.js

Compatibility wrappers kept:
- src/services/config.service.js
- src/controllers/config.controller.js
- src/routes/config.routes.js

## Completed Phases

### Phase 1: Backend Config Slice ✅
- ✅ modules/config with domain, repository, service, controller, routes
- ✅ Compatibility wrappers in src/services, src/controllers, src/routes
- ✅ Tests passing

### Phase 2: Backend Auth & Post Slices ✅
- ✅ modules/auth: domain/token.js, repository, service, controller, routes
- ✅ modules/post: domain/post-utils.js, repository, service, controller, routes
- ✅ Compatibility wrappers for both
- ✅ 5 core tests passing

### Phase 3: Frontend Structure Blueprint ✅
- ✅ Created features/ directory: auth, posts, config, chatbot
- ✅ Created app/ sub-structure: layout/, routes/, providers/
- ✅ Documented FRONTEND_REFACTOR_BLUEPRINT.md with mapping and phases
- ⏳ Next: Incremental feature migration (one feature at a time)

## Next PR Queue

1. (Optional) Introduce `core/` backend for shared runtime concerns (errors, security policy).
2. Frontend Phase 2: Move auth feature components/services/hooks to features/auth.
3. Frontend Phase 3: Move posts feature components/services/hooks to features/posts.
4. Frontend Phase 4: Centralize layout and providers in app/layout/ and app/providers/.
5. Frontend Phase 5: Update routing and entry point to use new structure.
6. Add test matrix:
   - Backend unit/integration tests by module (currently basic smoke)
   - Frontend component/integration tests by feature
   - E2e smoke path (login → view post → edit config)

## DoD Per Slice

- Existing endpoint behavior unchanged
- Legacy path imports still work
- Sanity require checks pass
- Relevant tests pass
- New files follow module boundary conventions
