# Frontend Features Structure - Migration Blueprint

## Target Structure

```
frontend/src/
├── app/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Navigation.tsx
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── ProtectedRoute.tsx
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   ├── QueryProvider.tsx
│   ├── App.tsx
│   ├── main.tsx
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── LogoutButton.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   ├── types/
│   │   │   ├── auth.types.ts
│   │   ├── index.ts
│   │
│   ├── posts/
│   │   ├── components/
│   │   │   ├── PostList.tsx
│   │   │   ├── PostDetail.tsx
│   │   │   ├── PostForm.tsx
│   │   ├── hooks/
│   │   │   ├── usePosts.ts
│   │   │   ├── usePost.ts
│   │   ├── services/
│   │   │   ├── posts.service.ts
│   │   ├── types/
│   │   │   ├── posts.types.ts
│   │   ├── index.ts
│   │
│   ├── config/
│   │   ├── components/
│   │   │   ├── ConfigForm.tsx
│   │   ├── hooks/
│   │   │   ├── useConfig.ts
│   │   ├── services/
│   │   │   ├── config.service.ts
│   │   ├── types/
│   │   │   ├── config.types.ts
│   │   ├── index.ts
│   │
│   ├── chatbot/
│   │   ├── components/
│   │   │   ├── ChatWidget.tsx
│   │   │   ├── ChatMessage.tsx
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   ├── services/
│   │   │   ├── chat.service.ts
│   │   ├── types/
│   │   │   ├── chat.types.ts
│   │   ├── index.ts
│
├── shared/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── BinhDanHocVuSidebar.tsx
│   │   ├── ...existing components
│   ├── hooks/
│   │   ├── useApi.ts
│   ├── lib/
│   │   ├── axios.ts
│   │   ├── utils.ts
│   ├── types/
│   │   ├── common.types.ts
│   ├── constants/
│   │   ├── api.const.ts
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│
├── main.tsx
├── vite-env.d.ts
```

## Migration Phases (Frontend)

### Phase 1: Directory Setup (DONE)
- ✅ Create features/ directory with: auth, posts, config, chatbot
- ✅ Create app/ sub-folders: layout/, routes/, providers/
- TODO: Create feature index files

### Phase 2: Feature Modules (Next)
- TODO: Move components from apps/public/components → features/*/components
- TODO: Move apps/public/services → features/*/services
- TODO: Create feature-level hooks in features/*/hooks
- TODO: Create feature-level types in features/*/types
- TODO: Add feature index exports for clean imports

### Phase 3: App Shell & Shared (Next)
- TODO: Centralize layout components (Header, Footer, Nav) → app/layout/
- TODO: Setup provider pattern in app/providers/
- TODO: Refactor main entry in app/App.tsx to use providers
- TODO: Ensure shared/components remain as truly shared UI atoms

### Phase 4: Routing & Pages (Next)
- TODO: Set up client-side router structure in app/routes/
- TODO: Map public pages → features/posts (post list, detail)
- TODO: Map admin pages → features/posts (CMS) + features/config
- TODO: Keep RequireAuth pattern but co-locate in features/auth/components

### Phase 5: Import Cleanup (Next)
- TODO: Update all imports across components to new paths
- TODO: Use barrel exports (index.ts) for clean feature imports
- TODO: Update integration with backend services (already modularized)

### Phase 6: Testing & Validation
- TODO: Verify app builds with new structure
- TODO: Run lint/type-check on new structure
- TODO: Smoke test key user flows (login, view posts, edit config)

## Key Principles

1. **Feature Isolation**: Each feature (auth, posts, config, chatbot) is self-contained with its own components, hooks, services, types.
2. **Barrel Exports**: Each feature has an index.ts that re-exports public API, enabling clean imports like `import { useAuth } from '@features/auth'`
3. **Shared vs Feature**: Only truly generic UI atoms go in shared/; business logic and domain-specific components live in features/.
4. **Service Layer**: Each feature has its own services/ folder for API calls, separate from shared lib/axios utilities.
5. **Type Safety**: Each feature owns its types/ folder for domain types; common types live in shared/types/.

## File-by-File Mapping (Sample)

### Auth Feature Example
Old → New:
- `frontend/src/apps/*/components/LoginForm.tsx` → `features/auth/components/LoginForm.tsx`
- `frontend/src/services/auth.js` → `features/auth/services/auth.service.ts`
- Custom auth logic → `features/auth/hooks/useAuth.ts`
- TypeScript definitions for User, Token → `features/auth/types/auth.types.ts`

### Posts Feature Example
Old → New:
- `frontend/src/apps/public/pages/Home.jsx` (posts section) → extracted/refactored → `features/posts/components/PostList.tsx`
- `frontend/src/services/post*.js` → `features/posts/services/posts.service.ts`
- Post-related hooks → `features/posts/hooks/use*.ts`
- Post types → `features/posts/types/posts.types.ts`

### App Shell
Old → New:
- `frontend/src/components/Header.tsx` → `app/layout/Header.tsx`
- `frontend/src/components/Footer.tsx` → `app/layout/Footer.tsx`
- `frontend/src/components/NavBar.tsx` → `app/layout/Navigation.tsx`
- Entry App.tsx setup with providers → `app/App.tsx` + `app/providers/`

## Next Steps for Team

1. Create feature index files (e.g., `features/auth/index.ts`) to define public exports
2. Incrementally move components file-by-file (one feature at a time)
3. Update imports in moved components to reference new paths
4. Run type-check and lint after each feature migration
5. Once all features migrated, remove old apps/ directory and update main.tsx routing
