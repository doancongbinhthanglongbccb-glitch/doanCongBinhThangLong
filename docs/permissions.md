# Phân quyền & vai trò

## Định nghĩa vai trò

Backend định nghĩa `UserRole` (ví dụ: `admin`, `editor`, `viewer`) và thứ bậc `ROLE_RANK` trong `backend/src/domain/roles.js`.

Hàm `hasRole(userRole, minRole)` dùng để kiểm tra “role hiện tại có đạt mức tối thiểu hay không”.

- **admin**: quản trị toàn hệ thống (cấu hình hệ thống, publish, thao tác nhạy cảm… tuỳ theo từng route `requireRole`).
- **editor**: biên tập nội dung (bài viết… tuỳ theo route/logic).
- **viewer** (nếu dùng): chỉ xem hoặc giới hạn quyền.

## Middleware

- `auth.middleware`: parse JWT và gắn `req.user`.
- `role.middleware` với `requireRole(minRole)`: sau khi auth ok thì check role theo thứ bậc.

## Frontend

- Frontend có logic mirror ở `frontend/src/features/auth/domain/roles.ts` + `hasRoleAccess` để ẩn/hiện menu, disable nút, v.v.
- **Lưu ý**: frontend chỉ phục vụ UX, **không thay thế** kiểm tra quyền ở backend.

## Gợi ý an toàn

- Mọi thao tác “chỉ admin” bắt buộc phải được bảo vệ ở backend bằng `requireRole(UserRole.ADMIN)` (hoặc tương đương). Frontend `canManageConfig` chỉ là hỗ trợ trải nghiệm.
