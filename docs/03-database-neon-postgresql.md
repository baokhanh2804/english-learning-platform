# 03 — Database: Neon PostgreSQL

## 1. Lựa chọn

Dùng Neon PostgreSQL Free cho MVP để tránh dùng database local hoặc phụ thuộc vào database free có thời hạn. Gói miễn phí có giới hạn compute, storage và network; compute có thể scale-to-zero sau thời gian không hoạt động.

## 2. Laravel configuration

Trong `config/database.php`, xác nhận connection `pgsql` tồn tại và đọc đúng env:
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- SSL/TLS options theo hướng dẫn kết nối Neon và phiên bản Laravel/PDO hiện tại.

Không copy connection string có password vào Git. Có thể dùng `DATABASE_URL` nếu project đã hỗ trợ, nhưng không cấu hình đồng thời hai nguồn DB không rõ thứ tự ưu tiên.

## 3. MySQL sang PostgreSQL — checklist tương thích

Agent Database phải rà soát toàn bộ migration, seeders, query builder, raw SQL và tests.

Các điểm cần kiểm tra:
- `unsignedInteger`, `unsignedBigInteger`: PostgreSQL không có unsigned integer tương đương.
- `enum`: kiểm tra cách Laravel migration ánh xạ và cách thay đổi enum; cân nhắc string + validation/check constraint.
- `tinyInteger`, `boolean`: kiểm tra kiểu dữ liệu và giá trị truthy/falsy.
- `json` / `jsonb`: kiểm tra toán tử truy vấn JSON và index.
- `AUTO_INCREMENT`: Laravel big increments/identity handling.
- `LIKE` / case-insensitive search: khác biệt collation; xem xét `ILIKE` nếu cần.
- Raw SQL dùng backticks, `IFNULL`, `DATE_FORMAT`, `GROUP_CONCAT`, `ON DUPLICATE KEY`: phải thay bằng PostgreSQL tương đương.
- Index và unique constraints: kiểm tra tên constraint, thứ tự tạo và rollback.
- Timestamp/timezone: lưu UTC, hiển thị theo timezone người dùng.
- Full-text search: không giả định cú pháp MySQL tương đương PostgreSQL.

Không thay đổi domain schema chỉ vì đổi hosting nếu không cần thiết. Nếu schema gốc thiết kế cho MySQL, lập danh sách migration tương thích và đề xuất thay đổi tối thiểu.

## 4. Quy trình migration

Local/staging:
```bash
php artisan migrate:status
php artisan migrate
php artisan db:seed
php artisan test
```

Production:
1. Sao lưu/đảm bảo có phương án khôi phục dữ liệu.
2. Kiểm tra migration pending.
3. Review migration có destructive change.
4. Chạy `php artisan migrate --force` theo thao tác deploy có kiểm soát.
5. Smoke test các luồng đọc/ghi.
6. Không chạy `migrate:fresh`, `db:wipe` hoặc seed dữ liệu demo trên database thật.

Nếu Render Free không cung cấp SSH/shell cho instance, migration phải được thực thi bằng build/release mechanism đã kiểm chứng hoặc một workflow CI có secret được bảo vệ. Không đặt lệnh migration phá hủy trong startup script.

## 5. Dữ liệu và giới hạn

- Giới hạn kích thước nội dung, ảnh và audio; không lưu binary media lớn trong PostgreSQL.
- Pagination bắt buộc cho danh sách bài học, từ vựng, lịch sử làm bài.
- Index cho foreign keys, lookup phổ biến và unique business keys.
- Dùng transaction cho cập nhật tiến độ/điểm.
- Không ghi password, token, email verification token dạng plaintext hoặc dữ liệu nhạy cảm vào logs.
- Theo dõi storage, compute usage và network transfer trong Neon dashboard.

## 6. Backup/restore

Gói free có thể có lịch sử khôi phục/hạn mức hạn chế. Vì vậy:
- Xuất database định kỳ bằng `pg_dump` từ máy phát triển hoặc CI an toàn.
- Mã hóa file dump nếu có dữ liệu người dùng.
- Lưu backup ngoài repo và giới hạn quyền truy cập.
- Thử restore định kỳ vào database test.
- Không coi backup là hợp lệ cho đến khi đã thử restore.
