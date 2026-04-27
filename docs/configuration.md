# Cấu hình (site / môi trường)

## Biến môi trường runtime (Backend)

- Dùng `dotenv` + `backend/src/config/env.js` để đọc tập trung (ví dụ `MONGO_URI`, `JWT_SECRET`, CORS, rate limit, ...).
- **Không** hardcode secret trong `docker-compose` rồi commit; môi trường dev dùng `env_file: .env.dev` và mẫu `.env.dev.example`.

## Cấu hình CMS của site

- **Mô hình cũ**: `Config` (1 document), chứa các section như `home`, `header`, `footer`, `navItems`, ...
- **Mô hình mới**: `SiteConfigEntry` (key-value), mỗi document là **1 section top-level** (ví dụ `home`, `footer`) với trường `value` kiểu `Mixed`.
- **Đọc**: nếu có dữ liệu KVS thì merge với default trong `default-config.js`; nếu chưa migrate thì fallback về `Config` legacy.
- **Ghi**: `PUT /api/config` sau khi normalize sẽ **upsert** các section vào KVS và **double-write** về `Config` legacy để tương thích/rollback.
- **Query theo section** (tuỳ chọn):
  - `GET /api/config/keys` → `{ keys: string[] }`
  - `GET /api/config/entries/:key` → `{ key, value }`
- **Migration**: `npm run migrate:db` chạy các script trong `backend/src/migrations/`, có migration import từ `Config` legacy sang KVS (chỉ chạy khi KVS đang rỗng).

## Frontend sử dụng

- Admin dùng `useConfig` / `useSiteConfig` để load + update; `getByPath` hỗ trợ đọc theo dot-path.
- Các biến môi trường phía frontend dùng prefix `VITE_` theo cơ chế của Vite (i18n hiện chỉ dùng `vi.json`, không có bật/tắt đa ngôn ngữ).
