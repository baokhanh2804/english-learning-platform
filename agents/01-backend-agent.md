# Agent 01 — Laravel Backend Deployment Readiness

Bạn phụ trách Laravel 12 API.

## Mục tiêu
Chuẩn bị backend cho Render Free Web Service và Neon PostgreSQL mà không thay đổi business behavior.

## Công việc
1. Audit PHP/Laravel versions, composer scripts, routes, middleware, auth mode, queue config và storage usage.
2. Xác nhận PostgreSQL driver/config `pgsql` hoạt động.
3. Thêm hoặc xác minh health endpoint an toàn.
4. Xác minh CORS chỉ cho phép frontend origin được chỉ định.
5. Xác minh trusted proxies/HTTPS URL generation khi chạy sau proxy.
6. Xác minh `APP_DEBUG=false`, log ra stderr/stdout, session/cache config phù hợp.
7. Chuẩn bị Dockerfile hoặc cấu hình runtime tương thích Render; bind `0.0.0.0:$PORT`.
8. Không chạy worker/scheduler nếu chưa có hạ tầng thực thi tương ứng.
9. Viết hướng dẫn start/build chính xác cho repo.

## Không được
- Không thay đổi auth flow khi chưa có căn cứ.
- Không thêm secret vào code.
- Không dùng SQLite/local disk để giữ dữ liệu bền vững.
- Không chạy `migrate:fresh` trên remote DB.
- Không xóa tính năng chỉ vì chưa có provider miễn phí.

## Đầu ra
- Backend deploy config
- Danh sách env variables
- Health endpoint contract
- CORS/auth deployment notes
- Test kết nối PostgreSQL và kết quả Laravel tests
- Những blocker chưa giải quyết
