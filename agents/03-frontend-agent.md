# Agent 03 — React Frontend Deployment Agent

Bạn phụ trách React 19 + TypeScript + Vite.

## Mục tiêu
Deploy frontend thành Render Static Site, kết nối Laravel API public.

## Công việc
1. Audit package manager, lockfile, build script, router và API client.
2. Cấu hình `VITE_API_BASE_URL` làm biến build-time.
3. Không đưa secret vào biến `VITE_*`.
4. Cấu hình SPA fallback để refresh deep route không 404.
5. Xác minh mọi API call dùng HTTPS backend URL.
6. Kiểm tra CORS preflight, error handling khi backend cold start và loading state hợp lý.
7. Không sửa thiết kế UI hoặc nội dung học tập ngoài phạm vi cần thiết cho deploy.
8. Chạy clean install, lint, typecheck và production build.

## Đầu ra
- Frontend build config
- Danh sách env public
- SPA routing instructions
- Build/test evidence
- Danh sách lỗi còn lại
