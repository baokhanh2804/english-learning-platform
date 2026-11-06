# Hướng dẫn Thiết lập Neon PostgreSQL cho English Learning Platform
**Phụ trách:** Agent 02 — Database Compatibility & Neon Agent  
**Mục tiêu:** Cung cấp quy trình kết nối an toàn, bảo mật tuyệt đối thông tin xác thực.

---

## 1. Khởi tạo Project trên Neon Console

1. Truy cập [Neon Console](https://console.neon.tech/) và đăng nhập (bằng tài khoản GitHub hoặc Google).
2. Nhấn **Create Project**.
3. Điền thông tin cơ bản:
   * **Project name:** `english-learning-platform` (hoặc tên tùy chọn).
   * **Postgres version:** `16` (khuyến nghị).
   * **Region:** Chọn khu vực gần người dùng chính (ví dụ `Singapore - ap-southeast-1` nếu có, hoặc `Frankfurt / US East`).
4. Nhấn **Create Project**.

---

## 2. Lấy thông tin kết nối an toàn (Không commit vào Git)

Tại Dashboard của Neon:
1. Trong mục **Connection Details**, chọn tab **Parameters** (hoặc chuỗi **Connection String** dạng `postgres://...`).
2. Tách các thành phần biến tương ứng với Laravel:
   * **Host:** `ep-xxxx-xxxx.region.neon.tech`
   * **Port:** `5432`
   * **Database:** `neondb` (mặc định)
   * **Username:** `neondb_owner` (hoặc user đã tạo)
   * **Password:** *(Sao chép mật khẩu - chỉ lưu tạm thời để nhập vào Render Dashboard)*

> [!WARNING]
> Tuyệt đối **không copy password hoặc connection string chứa password vào bất kỳ file nào trong mã nguồn Git** (kể cả `.env.example`, tài liệu markdown, commit history hay issue).

---

## 3. Cấu hình biến môi trường trên Render Web Service

Khi tạo hoặc cấu hình **Render Web Service** cho Laravel Backend:
1. Vào tab **Environment** trên Render Dashboard.
2. Thêm các biến sau:
   ```text
   DB_CONNECTION=pgsql
   DB_HOST=ep-xxxx-xxxx.region.neon.tech
   DB_PORT=5432
   DB_DATABASE=neondb
   DB_USERNAME=neondb_owner
   DB_PASSWORD=<Mật khẩu bí mật của Neon>
   DB_SSLMODE=require
   ```
3. Lưu ý: `DB_SSLMODE=require` là bắt buộc vì Neon chỉ chấp nhận kết nối được mã hóa TLS/SSL.

---

## 4. Quy trình chạy Migration an toàn trên Neon

### 4.1. Khởi tạo cấu trúc bảng ban đầu
Trên môi trường deploy có kiểm soát (Render Build Command, Release Command hoặc qua CI runner an toàn):
```bash
php artisan migrate --force
```
Lệnh này sẽ tạo toàn bộ 15 bảng theo chuẩn PostgreSQL của hệ thống.

### 4.2. Khởi tạo dữ liệu tham chiếu (Seed)
Chỉ chạy seed dữ liệu danh mục, cấp độ CEFR và quyền (KHÔNG seed dữ liệu giả vào môi trường public):
```bash
php artisan db:seed --force
```

### 4.3. Quy tắc an toàn dữ liệu bất khả xâm phạm
* **KHÔNG BAO GIỜ** chạy `php artisan migrate:fresh` hoặc `php artisan db:wipe` trên database Neon đã có dữ liệu.
* Mọi thay đổi schema trong tương lai phải được viết dưới dạng migration bổ sung (`alter table` / add column nullable hoặc có default).
* Định kỳ xuất bản backup bằng lệnh `pg_dump`:
  ```bash
  pg_dump "postgres://user:password@host/neondb?sslmode=require" -Fc > backup_$(date +%Y%m%d).dump
  ```

---

## 5. Đặc tính Serverless & Cách ứng phó

1. **Auto-suspend (Sleep compute):**
   * Neon free tier tự động tạm dừng compute sau 5 phút không có truy vấn để tiết kiệm tài nguyên.
   * Khi có request mới, Neon sẽ mất khoảng 1–2 giây để wake-up.
   * Laravel được cấu hình timeout hợp lý để không bị lỗi `connection refused`.
2. **Giới hạn dung lượng:**
   * Gói free cung cấp dung lượng lưu trữ 0.5 GiB.
   * Tuyệt đối không lưu binary file lớn (ảnh, audio bài nghe) trực tiếp vào bảng PostgreSQL; chỉ lưu metadata và đường dẫn key.
