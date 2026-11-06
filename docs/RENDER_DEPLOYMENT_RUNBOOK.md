# RENDER & NEON DEPLOYMENT RUNBOOK
**Phụ trách:** Agent 04 — Render + GitHub + Neon DevOps Agent  
**Mục tiêu:** Hướng dẫn triển khai chi tiết từ A–Z cho hệ thống English Learning Platform trên hạ tầng Free Tier (Render + Neon).

---

## 1. Tổng quan Kiến trúc Triển khai (Free Tier)

```
                            [ Trình duyệt Người học ]
                                       │
                        ┌──────────────┴──────────────┐
                        │                             │
                 HTTPS (Giao diện)             HTTPS (API REST)
                        ▼                             ▼
       ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
       │      Render Static Site         │   │       Render Web Service        │
       │    english-learning-frontend    │   │    english-learning-backend     │
       │  (React 19 + TypeScript + Vite) │   │    (Laravel 12 API trên Docker) │
       │     Publish: dist/              │   │   Bind: 0.0.0.0:$PORT           │
       │     Rewrite: /* -> /index.html  │   │   Health: /api/health           │
       └─────────────────────────────────┘   └────────────────┬────────────────┘
                                                              │
                                                        PostgreSQL TLS
                                                              ▼
                                             ┌─────────────────────────────────┐
                                             │      Neon Serverless DB         │
                                             │       PostgreSQL 16             │
                                             │      SSL Mode: require          │
                                             └─────────────────────────────────┘
```

---

## 2. Phương án Triển khai (Lựa chọn 1 trong 2)

### Phương án A: Dùng Render Blueprint (`render.yaml`) — Tự động & Khuyến nghị
1. Đẩy mã nguồn dự án lên repository GitHub (nhánh `main`).
2. Mở [Render Dashboard](https://dashboard.render.com/) -> Chọn **Blueprints** -> **New Blueprint Instance**.
3. Chọn repo GitHub của dự án.
4. Render sẽ tự động đọc file `render.yaml` và phát hiện 2 dịch vụ:
   * `english-learning-backend` (Web Service Docker)
   * `english-learning-frontend` (Static Site)
5. Nhập các giá trị bí mật chưa được đồng bộ (`sync: false`) theo hướng dẫn ở Mục 3 bên dưới.
6. Nhấn **Apply**.

---

### Phương án B: Thiết lập thủ công qua Render Dashboard

#### Bước B1: Tạo Web Service cho Backend (Laravel 12 API)
1. Trên Render Dashboard -> Nhấn **New +** -> **Web Service**.
2. Chọn repo GitHub của dự án.
3. Cấu hình thông số:
   * **Name:** `english-learning-backend`
   * **Region:** `Singapore` (khuyến nghị cho Việt Nam)
   * **Branch:** `main`
   * **Root Directory:** `backend`
   * **Runtime:** `Docker`
   * **Dockerfile Path:** `./Dockerfile`
   * **Instance Type:** `Free` (0.5 CPU, 512 MB RAM)
   * **Health Check Path:** `/api/health`
4. Cấu hình **Environment Variables** (xem Bảng ở Mục 3).
5. Nhấn **Create Web Service**.
6. Lưu lại URL được cấp: ví dụ `https://english-learning-backend.onrender.com`.

#### Bước B2: Tạo Static Site cho Frontend (React 19 + Vite)
1. Trên Render Dashboard -> Nhấn **New +** -> **Static Site**.
2. Chọn cùng repo GitHub của dự án.
3. Cấu hình thông số:
   * **Name:** `english-learning-frontend`
   * **Branch:** `main`
   * **Root Directory:** `frontend`
   * **Build Command:** `npm ci && npm run build`
   * **Publish Directory:** `dist`
4. Cấu hình **Redirects/Rewrites (Cực kỳ quan trọng để tránh lỗi 404 khi F5)**:
   * Vào mục **Redirects/Rewrites** của Static Site.
   * Thêm rule:
     * **Type:** `Rewrite`
     * **Source:** `/*`
     * **Destination:** `/index.html`
5. Cấu hình **Environment Variables**:
   * `VITE_API_BASE_URL` = `https://english-learning-backend.onrender.com/api`
6. Nhấn **Create Static Site**.
7. Lưu lại URL được cấp: ví dụ `https://english-learning-frontend.onrender.com`.

---

## 3. Ma trận Biến môi trường (Environment Variables Matrix)

### 3.1. Backend Web Service (`english-learning-backend`)
| Tên biến | Giá trị cấu hình | Nguồn gốc | Ghi chú |
| :--- | :--- | :--- | :--- |
| `APP_NAME` | `English Learning Platform` | Blueprint / Cố định | Tên dự án |
| `APP_ENV` | `production` | Cố định | Bắt buộc production |
| `APP_KEY` | `base64:xxxx...` | Bí mật | Tạo qua `php artisan key:generate --show` |
| `APP_DEBUG` | `false` | Cố định | **Bắt buộc false** để không lộ stack trace |
| `APP_URL` | `https://english-learning-backend.onrender.com` | URL Render backend | URL chính thức của Backend API |
| `LOG_CHANNEL` | `stderr` | Cố định | Đẩy log ra stream để Render thu thập |
| `LOG_LEVEL` | `warning` | Cố định | Mức độ cảnh báo |
| `DB_CONNECTION` | `pgsql` | Cố định | Driver PostgreSQL |
| `DB_HOST` | `ep-xxxx.region.neon.tech` | Neon Console | Host của Neon |
| `DB_PORT` | `5432` | Cố định | Cổng kết nối PostgreSQL |
| `DB_DATABASE` | `neondb` | Neon Console | Database mặc định |
| `DB_USERNAME` | `neondb_owner` | Neon Console | User kết nối |
| `DB_PASSWORD` | `<secret>` | Neon Console | Mật khẩu database bí mật |
| `DB_SSLMODE` | `require` | Cố định | Bắt buộc TLS với Neon |
| `FRONTEND_URL` | `https://english-learning-frontend.onrender.com` | URL Render frontend | Phục vụ redirect và liên kết |
| `CORS_ALLOWED_ORIGINS` | `https://english-learning-frontend.onrender.com` | URL Render frontend | Cho phép frontend gọi API qua CORS |

### 3.2. Frontend Static Site (`english-learning-frontend`)
| Tên biến | Giá trị cấu hình | Ghi chú |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://english-learning-backend.onrender.com/api` | Nhúng tại thời điểm build |

---

## 4. Quy trình chạy Database Migration & Seed an toàn

Sau khi Backend deploy thành công và kết nối được với Neon:
1. Mở Render Dashboard của Backend Service.
2. Chọn tab **Shell** (nếu khả dụng) hoặc sử dụng GitHub Actions / máy phát triển cục bộ có kết nối an toàn với Neon.
3. Chạy lệnh migrate khởi tạo cấu trúc bảng:
   ```bash
   php artisan migrate --force
   ```
4. Chạy lệnh seed khởi tạo cấp độ CEFR A1-C2, danh mục và vai trò:
   ```bash
   php artisan db:seed --force
   ```
5. **Cấm tuyệt đối:** Không bao giờ chạy `php artisan migrate:fresh` hoặc `php artisan db:wipe`.

---

## 5. Checklist Kiểm tra Sau Deploy (Smoke Test Checklist)

* [ ] **1. Health Check:** Truy cập `https://english-learning-backend.onrender.com/api/health` -> Trả về JSON status `ok` và database `connected`.
* [ ] **2. Trang chủ Frontend:** Truy cập `https://english-learning-frontend.onrender.com` -> Giao diện tải mượt mà.
* [ ] **3. SPA Routing Refresh:** Truy cập route sâu bất kỳ hoặc bấm nút Refresh trình duyệt -> Trang không bị lỗi 404.
* [ ] **4. Kết nối Frontend - Backend:** Nhấn nút **"Kiểm tra kết nối Backend API"** trên giao diện frontend -> Báo thành công, hiển thị timestamp.
* [ ] **5. CORS Headers:** Mở DevTools Network tab -> Request preflight `OPTIONS` trả status `200` / `204` với header `Access-Control-Allow-Origin` chính xác.
* [ ] **6. Bảo mật Debug:** Cố tình gọi URL API không tồn tại `GET /api/non-existent-route` -> Nhận JSON `404 Not Found`, không lộ stack trace hay cấu trúc file.

---

## 6. Quy trình Rollback khi có sự cố

1. **Rollback Frontend:**
   * Trong Render Dashboard của `english-learning-frontend` -> Tab **Deploys**.
   * Chọn commit ổn định trước đó -> Nhấn **Rollback to this deploy**.
2. **Rollback Backend Code:**
   * Trong Render Dashboard của `english-learning-backend` -> Tab **Deploys**.
   * Chọn bản build thành công trước đó -> Nhấn **Rollback to this deploy**.
3. **Rollback Database Schema:**
   * Nếu có lỗi migration vừa chạy:
     ```bash
     php artisan migrate:rollback --step=1
     ```
   * Nếu dữ liệu bị hỏng: Khôi phục từ bản sao lưu `pg_dump` gần nhất bằng lệnh:
     ```bash
     pg_restore -d "postgres://user:pass@host/neondb?sslmode=require" --clean backup.dump
     ```

---

## 7. Sổ tay Rủi ro & Giới hạn Free Tier (Risk Register)

| Rủi ro kỹ thuật | Biểu hiện | Giải pháp ứng phó |
| :--- | :--- | :--- |
| **Cold Start (Ngủ đông)** | Lần truy cập đầu sau 15 phút không dùng mất 30–50s tải API. | Giao diện frontend đã tích hợp sẵn thông báo Cold Start thân thiện, hướng dẫn người dùng chờ kết nối. |
| **Mất file tải lên (Ephemeral Disk)** | File ghi vào ổ cứng container bị biến mất khi restart. | Tuyệt đối không lưu file người dùng lên ổ đĩa máy chủ; chỉ dùng tài nguyên tĩnh và liên kết ngoài. |
| **Chặn SMTP Port** | Lỗi kết nối khi gửi email qua cổng 25, 465, 587. | Sử dụng HTTPS API (Resend / Brevo API) thay vì SMTP thông thường. |
| **Hạn mức Compute 750 giờ/tháng** | Dịch vụ bị tạm dừng nếu vượt 750 giờ chạy. | Cơ chế tự động sleep sau 15 phút không dùng giúp tiết kiệm tới 70% hạn mức giờ miễn phí mỗi tháng. |
| **Neon Compute Auto-suspend** | Truy vấn đầu tiên sau 5 phút không dùng mất thêm 1–2 giây. | Laravel đã cấu hình timeout và reconnect tự động. |
