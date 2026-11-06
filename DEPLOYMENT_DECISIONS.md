# DEPLOYMENT DECISIONS & ARCHITECTURE CONTRACT
**Dự án:** English Learning Platform — Free Deployment Update  
**Điều phối:** Agent 00 — Orchestrator / Technical Lead  
**Trạng thái:** Đã phê duyệt baseline audit  

---

## 1. Bối cảnh & Hiện trạng Audit

### 1.1. Khảo sát cấu trúc thư mục
- **Thư mục làm việc hiện tại:** `c:\Users\ADMIN\Documents\english-learning-platform-free-deploy-update`
- **Cấu trúc thực tế phát hiện:**
  - `english-learning-platform-free-deploy-update/`: Gói cập nhật bổ sung (Free Deploy Update Pack) bao gồm 7 tài liệu hướng dẫn tác nghiệp tại `docs/` và 7 chỉ thị Agent tại `agents/`.
  - `..\english-learning-platform-tech-pack\english-learning-platform-tech-pack\`: Gói tài liệu nền tảng gốc (PRD, ERD Database Spec, API Contract, Security & QA, System Architecture).
  - **Mã nguồn ứng dụng:** Chưa khởi tạo mã nguồn (chưa có code Laravel 12 và React 19 trong repo). Chưa khởi tạo Git repo.
- **Môi trường cục bộ đã kiểm tra:**
  - PHP: `8.2.12` (CLI)
  - Composer: `2.8.9`
  - Node.js: `v24.16.0`, npm: `11.13.0`
  - Git: `2.54.0.windows.1`
  - Extension `pdo_pgsql`: Mặc định chưa kích hoạt trong `php.ini` local của XAMPP, cần bật nếu test PostgreSQL trực tiếp trên máy phát triển.

### 1.2. Bản chất cập nhật (Partial Update Scope)
- Đây là bản cập nhật **chỉ thay đổi tầng hạ tầng và triển khai**:
  - Chuyển đổi từ hạ tầng tự quản (VPS / MySQL / Nginx) sang nền tảng **Free Cloud Tier**:
    - **Frontend:** Render Static Site (Miễn phí)
    - **Backend:** Render Web Service (Miễn phí)
    - **Database:** Neon Serverless PostgreSQL (Miễn phí)
    - **Domain:** Subdomain mặc định `*.onrender.com`
- **Không thay đổi:** PRD, roadmap A1–C2, tính năng nghiệp vụ, bài học, bài tập, thuật toán SRS và logic cốt lõi.

---

## 2. Quyết định kiến trúc & Quy chuẩn kỹ thuật (Contracts)

### 2.1. Contract Mạng & Endpoint
- **Frontend URL:** `https://<frontend-service>.onrender.com`
- **Backend URL:** `https://<backend-service>.onrender.com`
- **API Base URL:** `https://<backend-service>.onrender.com/api` (versioning `/api/v1`)
- **Health Check Endpoint:** `GET /api/health` hoặc `GET /health`
  - Status code: `200 OK`
  - Payload chuẩn:
    ```json
    {
      "status": "ok",
      "service": "english-learning-backend",
      "database": "connected",
      "timestamp": "2026-11-06T09:16:53Z"
    }
    ```
  - **Quy tắc bảo mật:** Tuyệt đối không để lộ connection string, app key, environment variables, hay stack trace trong health response. Không dùng health endpoint để ping giữ awake (vi phạm chính sách free tier).

### 2.2. Contract CORS & Authentication
- **CORS Allowed Origins:** Chỉ định danh domain frontend chính xác:
  ```text
  CORS_ALLOWED_ORIGINS=https://<frontend-service>.onrender.com
  ```
  Không dùng wildcard `*` khi có xác thực hoặc credentials.
- **Mô hình xác thực:** Ưu tiên **Bearer Token (Laravel Sanctum Personal Access Token)** trong header `Authorization: Bearer <token>`.
  - *Lý do:* Render Static Site và Render Web Service là hai subdomain khác nhau (`*.onrender.com`), dùng token-based authentication giúp loại bỏ hoàn toàn rủi ro và sự phức tạp của Cross-Site Cookie, `SameSite=None`, `Secure`, và CSRF token issues trên public subdomains.

### 2.3. Quy chuẩn Database: Neon PostgreSQL
- Hệ quản trị: **PostgreSQL 16+ (Neon Serverless)**.
- Kết nối: Bắt buộc bật SSL (`DB_SSLMODE=require` hoặc `sslmode=require`).
- **Checklist tương thích MySQL -> PostgreSQL:**
  - Thay thế toàn bộ `unsignedInteger` / `unsignedBigInteger` bằng kiểu số nguyên có dấu tiêu chuẩn của PostgreSQL (`integer`, `bigint`).
  - Cột `enum`: Sử dụng kiểu `string` kết hợp validation cấp ứng dụng và DB `check constraint` để dễ bảo trì và mở rộng hơn enum thuần PostgreSQL.
  - Cột `boolean` / `tinyInteger(1)`: Chuyển sang kiểu `boolean` chuẩn của PostgreSQL (`true`/`false`).
  - Cột JSON: Sử dụng `jsonb` thay vì `json` để hỗ trợ index và truy vấn tối ưu.
  - Tìm kiếm chuỗi: Sử dụng toán tử `ILIKE` cho tìm kiếm không phân biệt chữ hoa/thường thay vì `LIKE` mặc định của MySQL collation.
  - Loại bỏ hoàn toàn các hàm riêng của MySQL trong raw SQL: `IFNULL()` -> `COALESCE()`, `NOW()` / `CURRENT_TIMESTAMP`, không dùng backticks (`` ` ``) bao tên bảng/cột.
  - Nguyên tắc migration: **Không bao giờ chạy `migrate:fresh` hoặc `db:wipe` trên môi trường deploy thật**.

### 2.4. Quy chuẩn Filesystem, Queue & Email trên Free Tier
- **Ephemeral Filesystem:** Hệ thống file trên Render Web Service là tạm thời và sẽ bị xóa sạch khi container restart/spin-down.
  - Tuyệt đối không lưu avatar, audio ghi âm người học, file upload vào `storage/app/public` hoặc ổ đĩa cục bộ.
  - MVP: Tài nguyên học tập tĩnh (hình ảnh bài học, audio chuẩn A1-C2) được version-control trong repo hoặc host trên CDN tĩnh bên ngoài.
  - Việc upload của người dùng cá nhân sẽ được hoãn (deferred) cho đến khi tích hợp S3-compatible object storage (Cloudflare R2 / AWS S3).
- **Queue & Scheduler:**
  - Render Free không cung cấp Background Worker hay cron job miễn phí chạy ngầm liên tục.
  - Tất cả tác vụ nghiệp vụ cốt lõi trong MVP phải xử lý đồng bộ gọn nhẹ, có timeout ngắn.
  - Các tác vụ nặng (tổng hợp báo cáo lớn, AI scoring, phát sinh audio hàng loạt) phải đánh dấu `deferred` và chưa kích hoạt trong bản free này.
- **Email:**
  - Render chặn các cổng outbound SMTP trực tiếp (cổng 25, 465, 587) trên gói Free Web Service.
  - Mọi luồng gửi email (xác thực email, đặt lại mật khẩu) phải sử dụng **HTTPS REST API** (Resend, Brevo, SendGrid API) hoặc tạm thời tắt/log ra stderr trong giai đoạn thử nghiệm ban đầu.

---

## 3. Bảng biến môi trường chuẩn (Environment Matrix - No Secrets)

### 3.1. Backend (Laravel 12 API)
| Tên biến | Kiểu giá trị mẫu | Mô tả / Ghi chú |
| :--- | :--- | :--- |
| `APP_NAME` | `English Learning Platform` | Tên ứng dụng |
| `APP_ENV` | `production` | Bắt buộc `production` trên Render |
| `APP_KEY` | `base64:...` | Khởi tạo qua `artisan key:generate --show` |
| `APP_DEBUG` | `false` | **Bắt buộc false** để tránh lộ cấu trúc code |
| `APP_URL` | `https://<backend-service>.onrender.com` | URL chính thức của Backend API |
| `LOG_CHANNEL` | `stderr` | Đẩy log ra stream để Render dashboard thu thập |
| `LOG_LEVEL` | `warning` | Mức log khuyến nghị cho production |
| `DB_CONNECTION` | `pgsql` | Driver kết nối PostgreSQL |
| `DB_HOST` | `ep-xyz.region.neon.tech` | Endpoint host từ Neon |
| `DB_PORT` | `5432` | Cổng mặc định PostgreSQL |
| `DB_DATABASE` | `neondb` | Tên database trên Neon |
| `DB_USERNAME` | `<db-user>` | Tên tài khoản database |
| `DB_PASSWORD` | `<db-password-secret>` | Mật khẩu kết nối database (chỉ lưu trong Render env) |
| `DB_SSLMODE` | `require` | Yêu cầu TLS kết nối Neon |
| `FRONTEND_URL` | `https://<frontend-service>.onrender.com` | URL frontend phục vụ redirect/email |
| `CORS_ALLOWED_ORIGINS` | `https://<frontend-service>.onrender.com` | Origin được phép gọi API |
| `PORT` | `10000` (Render tự inject) | Cổng do Render cấp phát runtime |

### 3.2. Frontend (React 19 + TypeScript + Vite)
| Tên biến | Kiểu giá trị mẫu | Mô tả / Ghi chú |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://<backend-service>.onrender.com/api` | Base URL trỏ vào Laravel API |

*Cảnh báo bảo mật:* Mọi biến `VITE_*` đều được nhúng trực tiếp vào JavaScript bundle tại thời điểm build và công khai 100% trên trình duyệt người dùng. Không được đặt API key bí mật, password hay token quản trị vào đây.

---

## 4. Phân công nhiệm vụ chi tiết cho các Agent (Task Assignments)

```
                       ┌──────────────────────────────┐
                       │   Agent 00 - Orchestrator    │
                       └──────────────┬───────────────┘
                                      │
         ┌──────────────┬─────────────┼─────────────┬──────────────┐
         ▼              ▼             ▼             ▼              ▼
   ┌───────────┐  ┌───────────┐ ┌───────────┐ ┌───────────┐  ┌───────────┐
   │ Agent 01  │  │ Agent 02  │ │ Agent 03  │ │ Agent 04  │  │ Agent 05  │
   │  Backend  │  │ Database  │ │ Frontend  │ │  DevOps   │  │    QA     │
   └───────────┘  └───────────┘ └───────────┘ └───────────┘  └───────────┘
                                      │
                                      ▼
                                ┌───────────┐
                                │ Agent 06  │
                                │   Docs    │
                                └───────────┘
```

### Task 1: Agent 01 — Laravel Backend Deployment Readiness
- **Phạm vi sở hữu file:** `backend/`, `Dockerfile` (hoặc buildpack config backend).
- **Mục tiêu:**
  1. Thiết lập bootstrap Laravel 12 API tối ưu cho containerized / stateless environment.
  2. Bổ sung `GET /api/health` trả về trạng thái kết nối DB và trạng thái app.
  3. Cấu hình middleware Trusted Proxies (`TrustProxies.php`) để nhận diện chính xác giao thức HTTPS và IP từ Render Reverse Proxy.
  4. Cấu hình CORS chặt chẽ đọc biến `CORS_ALLOWED_ORIGINS`.
  5. Đảm bảo server bind `0.0.0.0:$PORT` theo biến môi trường Render cung cấp.
  6. Tinh chỉnh log channel `stderr` và vô hiệu hóa các giả định về lưu trữ local.

### Task 2: Agent 02 — Database Compatibility & Neon PostgreSQL
- **Phạm vi sở hữu file:** `backend/database/migrations/`, `backend/database/seeders/`, `backend/config/database.php`.
- **Mục tiêu:**
  1. Kiểm tra và chuẩn hóa cấu hình kết nối `pgsql` hỗ trợ đầy đủ SSL mode (`require`).
  2. Rà soát toàn bộ các file migration từ tech-pack gốc để đảm bảo tương thích 100% với PostgreSQL (chuyển đổi unsigned, enum, boolean, jsonb).
  3. Đảm bảo cấu trúc index, foreign key constraints và cascading rules chạy mượt mà trên PostgreSQL.
  4. Chuẩn bị file seeder dữ liệu khung học tập mẫu (khóa học A1-C2) kiểm tra tính toàn vẹn dữ liệu.
  5. Quy định rõ ràng: Tuyệt đối không chạy lệnh `migrate:fresh` trên môi trường có dữ liệu thật.

### Task 3: Agent 03 — React Frontend Deployment Agent
- **Phạm vi sở hữu file:** `frontend/`, `frontend/vite.config.ts`, `frontend/src/api/`.
- **Mục tiêu:**
  1. Thiết lập cấu hình Vite đọc biến `VITE_API_BASE_URL`.
  2. Xây dựng Axios/Fetch API client tập trung, có interceptor xử lý Bearer Token và quản lý timeout/cold-start state.
  3. Cấu hình router React Router v6+ và SPA rewrite config (chuyển hướng tất cả route về `/index.html`) để khi người dùng F5 tại deep link (ví dụ `/courses/a1/lesson-1`) không bị lỗi 404.
  4. Xử lý UI gracefully khi backend Render rơi vào trạng thái cold start (spin-up mất 30–50 giây).

### Task 4: Agent 04 — DevOps Agent (Render + GitHub + Neon)
- **Phạm vi sở hữu file:** `.github/workflows/`, `render.yaml` (hoặc tài liệu hướng dẫn tạo service Render).
- **Mục tiêu:**
  1. Xây dựng cấu hình Blueprint `render.yaml` hoặc checklist thiết lập dịch vụ:
     - 1 Static Site cho Frontend (`dist` output, SPA fallback).
     - 1 Web Service cho Backend (PHP/Docker runtime, bind `$PORT`).
  2. Hướng dẫn thiết lập liên kết cơ sở dữ liệu Neon qua biến môi trường bí mật trên Render Dashboard.
  3. Xây dựng quy trình chạy migration an toàn trong release command hoặc qua GitHub Actions có bảo vệ secret.
  4. Tài liệu hóa các thông số free-tier và hướng dẫn rollback nhanh.

### Task 5: Agent 05 — QA & Deployment Verification Agent
- **Phạm vi sở hữu file:** `tests/`, test scenarios và checklist kiểm thử.
- **Mục tiêu:**
  1. Xây dựng kịch bản Smoke Test trên URL Render public:
     - Test 1: Truy cập trang chủ frontend và kiểm tra SPA deep refresh.
     - Test 2: Gọi `/api/health` xác nhận 200 OK và kết nối DB.
     - Test 3: CORS preflight request từ trình duyệt.
     - Test 4: Đăng ký tài khoản mới, nhận Bearer token.
     - Test 5: Đăng nhập, lưu session token và đăng xuất.
     - Test 6: Truy vấn danh mục khóa học A1–C2.
     - Test 7: Làm bài tập và gửi kết quả tiến độ học tập.
     - Test 8: Kiểm tra dữ liệu vẫn được bảo toàn sau khi backend restart/redeploy.
     - Test 9: Quét bảo mật (xác nhận không lộ stack trace hay secret khi request lỗi).

### Task 6: Agent 06 — Documentation & Patch Agent
- **Phạm vi sở hữu file:** `README.md`, các tài liệu hướng dẫn cập nhật.
- **Mục tiêu:**
  1. Đồng bộ toàn bộ tài liệu hướng dẫn vận hành, runbook triển khai.
  2. Bổ sung các lưu ý kỹ thuật về hạn chế của gói Free (Cold start, không có background worker, ephemeral disk).
  3. Đảm bảo tài liệu không chứa bất kỳ secret hay chuỗi kết nối nhạy cảm nào.

---

## 5. Danh sách rủi ro & Giới hạn Free Tier (Risk & Limitations)

| Rủi ro / Giới hạn | Nguyên nhân kỹ thuật | Giải pháp kiểm soát / Khắc phục |
| :--- | :--- | :--- |
| **Cold Start (Độ trễ khởi động)** | Render Free Web Service tự động tắt sau 15 phút không có request. Neon tự suspend compute. | Frontend thiết kế màn hình loading/skeleton và thông báo thân thiện: "Hệ thống đang khởi động lại máy chủ (30s)...". |
| **Mất dữ liệu file tải lên** | Ephemeral filesystem trên Render Web Service xóa sạch ổ đĩa khi restart. | Tuyệt đối không lưu file người dùng trên đĩa cục bộ. Chỉ dùng metadata và lưu nội dung tĩnh có sẵn trong Git. |
| **Chặn gửi Email qua SMTP** | Render Free chặn các cổng SMTP ra ngoài (25, 465, 587). | Sử dụng API HTTPS (Resend, Brevo REST API) hoặc tắt xác thực email bằng mã OTP trong bản MVP thử nghiệm ban đầu. |
| **Không có Cron / Queue Worker** | Render Free không hỗ trợ background worker chạy ngầm độc lập miễn phí. | Thực hiện logic đồng bộ nhẹ; hoãn các tác vụ AI/batch processing phức tạp cho đến khi có hạ tầng worker. |
| **Hết hạn mức Compute Giờ (750h)** | Gói Render Free cấp 750 giờ hoạt động mỗi tháng cho toàn bộ tài khoản. | Khai thác cơ chế tự động sleep để tiết kiệm quota; dịch vụ demo chỉ hoạt động khi có tương tác. |

---

## 6. Kế hoạch Triển khai (Execution Roadmap)

1. **Giai đoạn 1 (Hiện tại):** Hoàn thành Audit tổng thể và thống nhất Architecture Contract (`DEPLOYMENT_DECISIONS.md`).
2. **Giai đoạn 2:** Agent 02 rà soát, chuyển đổi schema tương thích PostgreSQL và chuẩn bị migration.
3. **Giai đoạn 3:** Agent 01 hoàn thiện backend API readiness (health check, CORS, trusted proxies, Docker/runtime).
4. **Giai đoạn 4:** Agent 03 hoàn thiện frontend SPA (Vite config, API client, fallback routing).
5. **Giai đoạn 5:** Agent 04 cấu hình Render + Neon và thực hiện deploy.
6. **Giai đoạn 6:** Agent 05 thực hiện Smoke Test trên URL live public và phê duyệt kết quả.
7. **Giai đoạn 7:** Agent 06 hoàn thiện tài liệu bàn giao.
