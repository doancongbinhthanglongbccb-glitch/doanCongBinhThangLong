# Kiến trúc tổng quan (`doanCongBinhThangLong`)

## Công nghệ sử dụng

- **Backend**: Node.js, Express 5, MongoDB (Mongoose), JWT + refresh token qua cookie httpOnly, validate bằng Zod.
- **Frontend**: React 18, Vite, TypeScript, React Router 6, TanStack Query, Tailwind + shadcn/ui.
- **Triển khai**: Docker Compose (môi trường dev xem `docker-compose.dev.yml` và `.env.dev.example`).

## Phân lớp (Backend)

Luồng xử lý: `routes` → `middleware` (auth, rate limit, validate, role) → `controller` (mỏng) → `service` (nghiệp vụ) → `repository` (truy cập dữ liệu).

Code tổ chức theo **module** tại `backend/src/modules/<feature>/` (ví dụ: `auth`, `post`, `config`). Phần domain dùng chung đặt ở `backend/src/domain/` (ví dụ: `roles.js`).

## Phân lớp (Frontend)

- **Theo feature**: `frontend/src/features/*` (auth, posts, config, chatbot, ...) đóng gói services, types và component tái sử dụng.
- **App shell**: `frontend/src/app/` (layout, routes, providers).
- **Admin pages**: `frontend/src/apps/admin/pages/` vẫn còn một số màn hình legacy, đang được đưa dần vào `features`.
- **API layer**: `frontend/src/services/api/` (axios client, endpoints, error mapping, ...).

## Contract & chuẩn hóa

- **Error**: Backend chuẩn hóa JSON lỗi theo `{ error: { code, message, details? } }` qua `AppError` + `error.middleware`.
- **Pagination**: Danh sách trả `{ items, total, page, size, pages }` (frontend có normalize để tương thích dần).
- **Site config**: `SiteConfigEntry` dạng key-value theo từng section, tương thích `Config` legacy và có migration (xem `configuration.md`).
