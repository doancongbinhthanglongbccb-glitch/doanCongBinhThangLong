# Patterns & quy ước trong dự án

## i18n (Frontend)

- Dự án hiện **chỉ dùng tiếng Việt**: `frontend/src/i18n/locales/vi.json`.
- Trong component dùng `useTranslation()` + `t('path.to.key')`.
- Với key là mảng (ví dụ checklist), dùng `t('...', { returnObjects: true })`.
- App load i18n ở entry `main.tsx` qua `import "./i18n"`. Vitest cũng import i18n trong `src/test/setup.ts` để test không thiếu context.

## Route & API constants

- Client routes + API paths gom tại `frontend/src/lib/constants.ts` (`ROUTES`, `API_ROUTES`) để tránh hardcode string rải rác.
- Axios endpoints dùng `frontend/src/services/api/endpoints.ts`; hai nơi nên giữ nhất quán về ý nghĩa.

## Authentication

- Access token dùng ở phía client theo luồng hiện tại; refresh token qua cookie httpOnly, rotate tại `/api/auth/refresh`.
- Các route admin được bảo vệ bằng `RequireAuth` / `ProtectedRoute` + yêu cầu role.

## Testing

- Backend: Jest + Supertest (`backend` → `npm test`).
- Frontend: Vitest + Testing Library (`frontend` → `npm test`).

## Accessibility

- Form giữ `htmlFor`/`id` và `aria-label` (ví dụ toggle show/hide password, checkbox chọn dòng) để đảm bảo a11y và test (`getByLabelText`) ổn định.
