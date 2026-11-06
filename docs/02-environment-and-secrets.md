# 02 — Environment Variables & Secrets

## 1. Backend Laravel

Các biến nền tảng (giá trị thực tế nhập trong Render Dashboard, không commit):

```dotenv
APP_NAME="English Learning Platform"
APP_ENV=production
APP_KEY=<generated Laravel key>
APP_DEBUG=false
APP_URL=https://<backend-service>.onrender.com
LOG_CHANNEL=stderr
LOG_LEVEL=warning

DB_CONNECTION=pgsql
DB_HOST=<from Neon connection details>
DB_PORT=5432
DB_DATABASE=<database>
DB_USERNAME=<username>
DB_PASSWORD=<secret>
DB_SSLMODE=require

FRONTEND_URL=https://<frontend-service>.onrender.com
CORS_ALLOWED_ORIGINS=https://<frontend-service>.onrender.com
```

Lưu ý:
- Laravel config có thể cần `DB_SSLMODE` hoặc cấu hình `options` tùy phiên bản driver/config hiện có. Agent phải kiểm tra `config/database.php`, không tự thêm biến nếu code không đọc biến đó.
- `APP_KEY` tạo bằng `php artisan key:generate --show` ở môi trường an toàn; chỉ đưa kết quả vào secret manager/dashboard.
- `APP_DEBUG=false` bắt buộc trên public deployment.
- `APP_URL` là backend URL, không phải frontend URL.
- Không ghi credentials vào tài liệu, log hoặc prompt Agent.

## 2. Frontend Vite

```dotenv
VITE_API_BASE_URL=https://<backend-service>.onrender.com/api
```

Mọi biến có tiền tố `VITE_` được bundle vào frontend và xem như public. Không đặt secret, private key hoặc database credential ở đây.

## 3. Không commit

Các file phải được ignore:
- `.env`
- `.env.*` ngoại trừ `.env.example`
- `storage/*.key`
- private key/certificates
- export dữ liệu người dùng
- database dump có dữ liệu cá nhân

`.env.example` chỉ chứa placeholder, không chứa secret thật.

## 4. Secret rotation

Khi lộ secret:
1. Rotate secret tại nhà cung cấp (Neon/email/object storage).
2. Cập nhật Render environment variables.
3. Redeploy/restart backend.
4. Kiểm tra logs và xác thực lại chức năng.
5. Xóa secret khỏi Git history nếu đã commit; rotate vẫn là bắt buộc.

## 5. Config cache

Sau khi đổi biến môi trường, redeploy hoặc restart service. Laravel production có thể chạy `php artisan config:cache` trong build/start flow, nhưng chỉ sau khi xác nhận mọi biến cần thiết đã tồn tại. Không cache cấu hình chứa giá trị sai do thiếu env.
