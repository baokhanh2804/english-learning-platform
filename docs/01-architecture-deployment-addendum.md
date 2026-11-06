# 01 — Architecture & Deployment Addendum

## 1. Mục tiêu và giới hạn

Mục tiêu là đưa MVP của nền tảng học tiếng Anh lên Internet với chi phí hạ tầng bằng 0 trong giới hạn gói miễn phí. Đây là môi trường demo/học tập/kiểm thử có người dùng ít, không phải cam kết SLA.

## 2. Sơ đồ tổng thể

```text
Browser
  |
  | HTTPS
  v
Render Static Site
React 19 + TypeScript + Vite
  |
  | HTTPS JSON REST API
  v
Render Free Web Service
Laravel 12 API
  |
  | PostgreSQL TLS connection
  v
Neon PostgreSQL Free

GitHub repository
  |-- frontend build/deploy --> Render Static Site
  |-- backend build/deploy  --> Render Web Service
```

## 3. Trách nhiệm từng thành phần

### Frontend — Render Static Site
- Build React/Vite thành thư mục `dist`.
- Publish thư mục `dist`.
- Cấu hình SPA fallback để các route phía client không trả 404 khi refresh.
- Đặt `VITE_API_BASE_URL` là URL public của Laravel API.
- Bật HTTPS mặc định do nền tảng cung cấp.

### Backend — Render Web Service
- Chạy Laravel 12 bằng PHP runtime/container phù hợp với repo.
- Expose HTTP server trên `0.0.0.0` và port do biến `PORT` cung cấp.
- Dùng PostgreSQL qua `DB_CONNECTION=pgsql`.
- Cung cấp `/api/health` hoặc `/health` chỉ trả thông tin tối thiểu, không tiết lộ secret.
- Chạy migration theo quy trình kiểm soát, không chạy destructive migration tự động.

### Database — Neon PostgreSQL
- Lưu dữ liệu bền vững: users, courses, lessons, vocabulary, exercises, attempts, learning progress, roles/permissions và các bảng domain hiện có.
- Dùng connection string dạng PostgreSQL.
- Bật TLS/SSL theo hướng dẫn của Neon.
- Dùng migration Laravel; kiểm tra các khác biệt giữa MySQL và PostgreSQL.

## 4. Quy tắc kiến trúc ứng dụng

- Giữ Laravel là backend duy nhất sở hữu business logic và database.
- React chỉ gọi API; không truy cập DB trực tiếp.
- Giữ REST API contract hiện có. Chỉ đổi URL gốc và các cấu hình môi trường cần thiết.
- Không tách microservices, không thêm Kubernetes, không thêm VPS.
- Các integration bên ngoài phải được bọc qua interface/service để thay nhà cung cấp khi cần.

## 5. CORS và cookie/authentication

Ưu tiên mô hình Bearer token nếu hệ thống hiện tại đã dùng token-based auth (ví dụ Laravel Sanctum personal access token). Không tự ý chuyển mô hình xác thực nếu chưa kiểm tra tài liệu gốc.

Nếu dùng cookie-based auth:
- Phải cấu hình domain, `SameSite`, `Secure`, CSRF và CORS credentials đúng cho hai subdomain.
- Không dùng wildcard origin cùng credentials.
- Kiểm tra flow login/logout/refresh trên domain thật, không chỉ localhost.

CORS allowlist chỉ gồm frontend origin chính thức và origin preview cần thiết. Không dùng `*` trong production.

## 6. Health endpoint

Health endpoint:
- Trả `200` khi ứng dụng boot được.
- Có thể kiểm tra database bằng một query nhẹ nếu phù hợp.
- Không trả connection string, stack trace, environment variables, user data.
- Không dùng endpoint health để tạo traffic giả nhằm né cơ chế sleep.

## 7. Quyết định phải giữ mở

- Object storage cho audio/upload: chưa chốt nhà cung cấp trong gói này.
- Email provider: chưa chốt; cần API HTTPS hoặc dịch vụ gửi email tương thích.
- Queue và scheduler: chỉ bật khi xác định được nền tảng thực thi miễn phí, hạn mức và retry semantics.
- Monitoring: bắt đầu bằng Render logs + error reporting miễn phí nếu có, không phụ thuộc dịch vụ trả phí.
