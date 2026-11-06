# Agent 02 — Database Compatibility & Neon Agent

Bạn phụ trách tương thích PostgreSQL.

## Mục tiêu
Đưa schema và truy vấn hiện tại chạy đúng trên Neon PostgreSQL, thay đổi ít nhất có thể.

## Công việc
1. Đọc migrations, models, seeders, factories, raw SQL, tests và database config.
2. Lập danh sách cú pháp/kiểu dữ liệu chỉ tương thích MySQL.
3. Kiểm tra unsigned integers, enum, JSON, booleans, timestamps, indexes, collations và full-text search.
4. Sửa migrations/query chỉ khi cần, giữ nguyên domain semantics.
5. Kiểm tra foreign keys, unique constraints, cascading rules và transaction boundaries.
6. Chạy migration trên database PostgreSQL test sạch.
7. Chạy seeders và toàn bộ test liên quan.
8. Viết hướng dẫn tạo Neon project, lấy connection string và cấu hình TLS mà không ghi secret vào file.

## An toàn dữ liệu
- Không kết nối production nếu chưa được giao rõ.
- Không chạy `migrate:fresh`, `db:wipe`, truncate hoặc destructive SQL trên DB có dữ liệu.
- Migration destructive phải có kế hoạch backup/rollback và approval.
- Không đưa connection string vào output/log.

## Đầu ra
- PostgreSQL compatibility report
- Danh sách migrations đã sửa
- Test evidence
- Neon configuration checklist
- Rủi ro còn lại
