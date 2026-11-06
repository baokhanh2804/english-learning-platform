# 05 — Deployment Runbook (Render + Neon)

## 0. Điều kiện trước khi bắt đầu

- Repo có `frontend/` và `backend/` (điều chỉnh nếu monorepo khác).
- Frontend chạy được local bằng `npm ci && npm run build`.
- Backend chạy được local và có `.env.example`.
- Laravel test pass.
- Backend đã có PostgreSQL connection config.
- Không có secrets trong Git.

## 1. Tạo Neon database

1. Tạo tài khoản/project Neon.
2. Chọn region gần người dùng chính (nếu có lựa chọn phù hợp).
3. Tạo database/user.
4. Sao chép connection details an toàn.
5. Ghi các giá trị vào secret manager/Render env, không ghi vào repo.
6. Kiểm tra kết nối từ môi trường local bằng psql hoặc Laravel.

## 2. Deploy Laravel API lên Render

Tạo Web Service:
- Connect GitHub repository.
- Chọn branch `main`.
- Root Directory: `backend` (nếu backend nằm ở thư mục này).
- Runtime: Docker hoặc runtime PHP đã được repo chuẩn bị.
- Build command: cài dependencies production và build/cache các thành phần cần thiết.
- Start command: chạy HTTP server lắng nghe `0.0.0.0:$PORT`.

Nếu dùng Docker:
- Image phải chạy non-root khi có thể.
- Expose port động qua `$PORT`.
- Không chạy `php artisan serve` như giải pháp production lâu dài nếu đã có web server phù hợp.
- Kiểm tra process signal handling và graceful shutdown.

Cấu hình environment variables theo `02-environment-and-secrets.md`.

Sau deploy:
- Mở backend URL.
- Kiểm tra health endpoint.
- Kiểm tra logs.
- Kiểm tra CORS preflight.
- Kiểm tra DB connectivity.

## 3. Deploy React frontend

Tạo Static Site:
- Connect cùng GitHub repository.
- Root Directory: `frontend`.
- Build command: `npm ci && npm run build`.
- Publish directory: `dist`.
- Environment: `VITE_API_BASE_URL=https://<backend-service>.onrender.com/api`.
- Thiết lập rewrite/fallback cho SPA về `/index.html` theo cấu hình Render hiện hành.

Sau deploy:
- Mở URL frontend.
- Refresh một route sâu, ví dụ `/courses`.
- Kiểm tra browser console và network.
- Xác nhận API request đi đúng backend URL HTTPS.

## 4. Database migration

Chạy migration theo quy trình đã được Agent xác nhận cho repo và Render plan hiện tại.
Không chạy destructive command.
Nếu cần workflow CI:
- Dùng GitHub Actions secrets.
- Chỉ cho phép migration trên branch/environment được bảo vệ.
- Không echo connection string.
- Có bước approval cho migration rủi ro.

## 5. Smoke test bắt buộc

- Trang chủ tải được.
- Đăng ký tài khoản.
- Đăng nhập/đăng xuất.
- Email verification nếu provider đã cấu hình.
- Xem danh sách khóa học.
- Xem bài học.
- Làm bài tập.
- Lưu kết quả/tiến độ.
- Refresh route React không 404.
- API từ frontend không bị CORS block.
- Unauthorized request trả status phù hợp.
- Rate limit hoạt động ở endpoint nhạy cảm.

## 6. Rollback

- Frontend: redeploy commit ổn định trước đó.
- Backend: rollback code; không tự rollback migration destructive.
- Database: restore từ backup/snapshot đã xác nhận.
- Nếu schema thay đổi không tương thích ngược, dùng expand-and-contract migration:
  1. Thêm schema mới tương thích code cũ.
  2. Deploy code đọc/ghi tương thích.
  3. Backfill dữ liệu.
  4. Xác minh.
  5. Xóa schema cũ trong release sau.

## 7. Lỗi thường gặp

- 502/503: kiểm tra port binding, start command, logs, cold start.
- DB connection refused: kiểm tra host/port/SSL/credentials/IP policy.
- CORS: kiểm tra origin chính xác gồm scheme và hostname.
- React refresh 404: kiểm tra SPA rewrite.
- API URL sai: kiểm tra `VITE_API_BASE_URL` lúc build; biến Vite được nhúng tại build time.
- File upload mất: đang ghi vào ephemeral filesystem; chuyển sang object storage.
- App chậm lần đầu: có thể do free service spin down hoặc database scale-to-zero.
