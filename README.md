# English Learning Platform — Free Deployment Update Pack

**Phạm vi:** Bản cập nhật bổ sung cho bộ tài liệu kỹ thuật hiện có. Không thay thế PRD, thiết kế tính năng học tập, nội dung A1–C2, mô hình nghiệp vụ hoặc toàn bộ database spec.

## Quyết định kiến trúc

- Backend: Laravel 12 REST API.
- Frontend: React 19 + TypeScript + Vite.
- Frontend hosting: Render Static Site (free).
- Backend hosting: Render Web Service (free).
- Database: Neon PostgreSQL (free tier).
- Source control / deploy trigger: GitHub.
- Domain: subdomain miễn phí `*.onrender.com`.
- Storage: không dùng local filesystem của Render để lưu dữ liệu bền vững. MVP ưu tiên tài nguyên tĩnh được version-control; upload/audio cá nhân chỉ triển khai sau khi chọn object storage.
- Queue/scheduler: MVP không phụ thuộc background worker trả phí; tác vụ nặng phải hoãn hoặc thiết kế chạy theo request có giới hạn. Không giả định Render Free có cron/background worker miễn phí.

## Cách dùng với bộ tài liệu cũ

1. Giữ nguyên PRD, business requirements, learning content, UX/UI, feature specs và database domain model.
2. Đọc `docs/01-architecture-deployment-addendum.md` để cập nhật topology triển khai.
3. Đọc `docs/02-environment-and-secrets.md` để thống nhất biến môi trường.
4. Đọc `docs/03-database-neon-postgresql.md` trước khi thay đổi DB config/migration.
5. Đọc `docs/04-storage-queue-email.md` để loại bỏ giả định VPS/local disk/SMTP.
6. Dùng `docs/05-deployment-runbook.md` cho deploy thủ công lần đầu.
7. Dùng `docs/06-operations-backup-security.md` cho vận hành và giới hạn free tier.
8. Giao prompt trong `agents/` cho Agent tương ứng.

## Thứ tự triển khai

1. Agent Orchestrator xác nhận repo, nhánh, cấu trúc hiện tại và các tài liệu gốc.
2. Backend Agent kiểm tra Laravel có hỗ trợ `pgsql`, health endpoint, CORS, trusted proxy và config cache.
3. Database Agent rà soát migrations/queries tương thích PostgreSQL.
4. Frontend Agent cấu hình API base URL và SPA routing.
5. DevOps Agent tạo Render Static Site + Web Service, kết nối Neon.
6. QA Agent chạy smoke test trên URL public.
7. Documentation Agent cập nhật README và biến môi trường; không viết lại tài liệu ngoài phạm vi.

## Nguyên tắc không được vi phạm

- Không commit `.env`, API keys, database URLs hoặc credentials.
- Không dùng SQLite/local filesystem trên Render làm nơi lưu dữ liệu production.
- Không chạy `migrate:fresh` trên database có dữ liệu thật.
- Không giả định app luôn online hoặc không có cold start.
- Không bật debug trên môi trường public.
- Không để frontend truy cập trực tiếp database.
- Không đưa secret vào `VITE_*` variables; mọi biến `VITE_*` đều có thể bị lộ ở client.
- Không tuyên bố “production-grade / always-on” với gói free.

## Thông tin cần điền khi deploy

- GitHub repository URL.
- Branch deploy (khuyến nghị `main`).
- Render frontend service name.
- Render backend service name.
- Neon connection string.
- Public frontend URL.
- Public backend URL.
