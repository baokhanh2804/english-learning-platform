# 04 — Storage, Queue, Scheduler & Email on Free Hosting

## 1. Filesystem

Render Free Web Service dùng ephemeral filesystem. File tạo trong runtime có thể mất khi service restart, redeploy hoặc spin down.

Do đó:
- Không dùng `storage/app/public` làm kho lưu trữ lâu dài.
- Không lưu avatar, bài nộp, recording, audio generated hoặc file upload của user trên local disk.
- Không lưu SQLite database trên service.
- `public/build` của frontend là static build artifact, không phải user data.

## 2. MVP media policy

Trong MVP:
- Nội dung hình/audio dùng chung có thể được version-control nếu dung lượng nhỏ và giấy phép cho phép.
- Ưu tiên liên kết tới media host ổn định hoặc object storage có adapter.
- Không cho phép upload media cá nhân cho đến khi storage provider và quota được chốt.
- Database chỉ lưu metadata, object key, mime type, byte size, checksum, owner, visibility và timestamps.

Đề xuất abstraction:
```php
interface MediaStorage
{
    public function put(string $key, mixed $stream, array $metadata = []): string;
    public function delete(string $key): void;
    public function url(string $key): string;
}
```
Đây là ví dụ kiến trúc; Agent phải điều chỉnh theo coding conventions hiện tại, không tạo abstraction thừa nếu dự án chưa cần.

## 3. Queue

Không giả định Render Free có Background Worker miễn phí. Với MVP:
- Các request đồng bộ phải ngắn, có timeout và giới hạn payload.
- Không thực hiện video/audio processing, AI generation hoặc batch import trong HTTP request.
- Các tác vụ nặng được đánh dấu `deferred` và chưa bật cho đến khi có worker phù hợp.
- Nếu dùng Laravel database queue, cần có worker chạy liên tục; chỉ cấu hình queue table không có nghĩa job tự chạy.
- Không dùng cron ping để giả lập worker hoặc né sleep.

## 4. Scheduler

Laravel Scheduler cần một scheduler process gọi `schedule:run` mỗi phút hoặc một cơ chế cron bên ngoài. Không giả định có cron miễn phí sẵn trong Render.
- MVP không phụ thuộc tác vụ định kỳ để bảo đảm tính đúng đắn.
- Các tác vụ có thể chạy lazy khi user truy cập thì phải idempotent và có khóa chống chạy trùng.
- Khi bổ sung cron provider, kiểm tra hạn mức, bảo mật endpoint và retry.

## 5. Email verification / password reset

- Không giả định Render Free cho phép gửi SMTP trực tiếp; tài liệu Render nêu outbound SMTP ports phổ biến 25/465/587 bị chặn trên Free web services.
- Ưu tiên nhà cung cấp email có HTTPS API.
- Tách `MAIL_*`/provider credentials thành secrets.
- Có chế độ local log/mail preview trong development.
- Có rate limit cho resend verification và password reset.
- Không log URL chứa token xác thực.
- Nếu chưa có provider miễn phí phù hợp, email verification là integration chưa bật trong public MVP; không âm thầm giả lập email đã gửi.

## 6. Future readiness

Khi có ngân sách hoặc provider free phù hợp:
- Bổ sung S3-compatible object storage.
- Chọn queue worker/cron provider.
- Bổ sung email API.
- Tách tác vụ AI/TTS/STT thành job bất đồng bộ.
