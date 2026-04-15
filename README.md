# Frontend CMS - Doan Cong Binh Thang Long

This repository contains a React + Vite frontend with:
- Public website pages
- Admin CMS pages
- Domain-based API layer (mock-first, backend-ready)

## Tech Stack

- React 18
- Vite 5
- TypeScript + JavaScript (mixed, incremental migration)
- Tailwind CSS + shadcn/ui
- React Router
- React Query
- React Markdown (for rich content preview/render)

## Quick Start

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Quality checks:

```bash
npm run lint
npm run test
```

## Environment

Copy values from `.env.example`:

```env
VITE_API_BASE_URL=
VITE_API_MODE=mock
```

`VITE_API_MODE=mock` keeps the app fully functional without backend.

## App Routes

- `/` -> Public home page
- `/:section` -> Public section page
- `/:section/:subsection` -> Public subsection page
- `/admin` -> Admin CMS

Main router: `src/App.tsx`

## Current Folder Structure

```text
frontend/
	docs/
		frontend-architecture.md
	public/
	src/
		apps/
			admin/
				components/
					ActionBar.tsx
					MarkdownEditor.jsx
					PostForm.tsx
					PostPreview.tsx
				pages/
					Admin.tsx
					Dashboard.jsx
					GioiThieuManager.jsx
					GuongBacManager.jsx
					HoatDongManager.jsx
					SidebarManager.jsx
					ThuVienManager.jsx
					TrangChuManager.jsx
				services/ (currently empty)
			public/
				components/ (currently empty)
				pages/
					Home.jsx
					NotFound.tsx
					SectionPage.jsx
				services/ (currently empty)
		services/
			api/
				cmsApi.ts
				postApi.ts
				userApi.ts
				mediaApi.ts
				httpClient.ts
				endpoints.ts
				store/
					cmsStore.ts
		shared/
			components/
				BinhDanHocVuSidebar.jsx
				Chatbot.tsx
				Footer.tsx
				MarkdownContent.tsx
				NavBar.tsx
			types/
				cms.ts
				media.ts
				post.ts
				user.ts
			utils/
```

## Architecture Summary

### Public flow

1. Public pages load data from `src/services/api/*`.
2. Content is rendered with shared components.
3. Rich text content is rendered through `MarkdownContent`.

### Admin flow

1. Admin pages load/update data through `src/services/api/*`.
2. Edit forms use local component state.
3. Save operations trigger API calls, then refetch.
4. Post editor uses:
	 - `ActionBar`
	 - `PostForm`
	 - `PostPreview`
	 - `MarkdownEditor`

## API Layer

Domain APIs are separated:

- `postApi.ts`
- `userApi.ts`
- `mediaApi.ts`
- `cmsApi.ts` (aggregated CMS content + collection CRUD)

Current storage mode:

- Mock storage in browser localStorage (`store/cmsStore.ts`)
- Async simulation for request-like behavior

Backend migration notes:

1. Keep API function signatures stable.
2. Replace internals with `httpClient.ts` calls.
3. Use `endpoints.ts` for backend route paths.
4. Set `VITE_API_BASE_URL` to backend host.

## Editor and Content Behavior

`MarkdownEditor` supports:

- Bold, italic
- H1/H2/H3
- Bullet and numbered list
- Link insertion
- Image insertion from URL or device
- Live preview

Rendered output is markdown-driven, so existing saved content remains compatible.

## Notes for Contributors

- Keep UI behavior stable when refactoring architecture.
- Route changes should be reviewed against `src/App.tsx`.
- Prefer domain APIs over direct store mutation.
- Avoid introducing shared global CMS context again.

## Additional Docs

- High-level architecture: `docs/frontend-architecture.md`
- API migration details: `src/services/api/README.md`
