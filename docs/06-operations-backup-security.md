# 06 — Operations, Backup & Security

## 1. Mô hình vận hành miễn phí

Hệ thống được xem là demo/MVP:
- Có thể cold start.
- Có thể bị restart/maintenance.
- Có giới hạn CPU, memory, storage, bandwidth, build minutes và compute hours.
- Không có cam kết uptime/SLA tương đương dịch vụ trả phí.
- Dịch vụ free terms/quotas có thể thay đổi; kiểm tra dashboard và tài liệu chính thức trước mỗi đợt triển khai lớn.

## 2. Bảo mật tối thiểu

- `APP_DEBUG=false`.
- HTTPS cho frontend và backend.
- Secrets chỉ nằm trong Render/GitHub secret settings.
- Hash password bằng Laravel Hash.
- CSRF/cookie policy đúng nếu dùng cookie auth.
- CORS allowlist chính xác.
- Rate limit login, register, password reset, resend verification và API public.
- Validate input server-side.
- Authorization policy cho dữ liệu user-owned.
- Không trả stack trace hoặc SQL errors cho client.
- Không ghi token, password, email verification URL hoặc private content vào logs.
- Cập nhật dependencies và chạy security audit định kỳ.

## 3. Backup

- Tạo database dump định kỳ.
- Lưu ngoài GitHub repository.
- Mã hóa và giới hạn quyền truy cập.
- Đặt retention policy (ví dụ 7 bản gần nhất) tùy dung lượng và chính sách dữ liệu.
- Thử restore ít nhất trước mỗi release có thay đổi schema lớn.
- Backup cả cấu hình quan trọng dưới dạng tài liệu, nhưng không backup secret dạng plaintext vào repo.

## 4. Logging và monitoring

- Laravel log ra stderr/stdout để Render thu thập.
- Log có request ID/correlation ID nếu có.
- Không log dữ liệu cá nhân không cần thiết.
- Theo dõi 4xx/5xx, latency, DB errors, deploy failures và usage quota.
- Health endpoint không được lộ thông tin nội bộ.

## 5. Nâng cấp khi dự án tăng trưởng

Các tín hiệu cần rời free tier:
- Người dùng phản ánh app không truy cập được do sleep/cold start.
- Cần uptime ổn định hoặc SLA.
- Cần worker chạy liên tục, scheduler đáng tin cậy.
- Media vượt quota hoặc cần upload riêng tư.
- Database compute/storage/network chạm giới hạn.
- Cần backup tự động, point-in-time recovery hoặc support.
- Cần xử lý AI/TTS/STT/video dài.

Khi nâng cấp, ưu tiên nâng cấp đúng thành phần nghẽn; không cần viết lại toàn bộ kiến trúc.
