import { useState, useEffect } from 'react';
import { checkHealth, type HealthCheckResponse } from './api/client';

function App() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Không thể kết nối đến Backend API');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="container py-5">
      <header className="pb-3 mb-4 border-bottom d-flex justify-content-between align-items-center">
        <h1 className="h4 text-primary m-0 fw-bold">
          English Learning Platform
        </h1>
        <span className="badge bg-success-subtle text-success border border-success px-3 py-2">
          MVP Free Tier
        </span>
      </header>

      <div className="p-5 mb-4 bg-light rounded-3 shadow-sm border">
        <div className="container-fluid py-2">
          <h2 className="display-6 fw-bold text-dark">Hệ thống Học Tiếng Anh A1–C2</h2>
          <p className="col-md-9 fs-5 text-secondary">
            Nền tảng hỗ trợ học tiếng Anh đa cấp độ hoàn toàn miễn phí. Kiến trúc vận hành trên hạ tầng đám mây không chi phí:
            React 19 + Vite (Render Static Site), Laravel 12 REST API (Render Web Service) và Neon Serverless PostgreSQL.
          </p>

          <div className="d-flex align-items-center gap-3 mt-4">
            <button
              className="btn btn-primary btn-lg px-4"
              onClick={fetchHealth}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang kiểm tra kết nối...
                </>
              ) : (
                'Kiểm tra kết nối Backend API'
              )}
            </button>
            <span className="text-muted small">
              Endpoint: <code>https://english-learning-backend-s2v4.onrender.com/api/health</code>
            </span>
          </div>

          {error && (
            <div className="alert alert-warning mt-4 mb-0" role="alert">
              <h5 className="alert-heading">⚠️ Lưu ý Cold Start / Lỗi kết nối</h5>
              <p className="mb-0">
                {error}. Trên Render Free tier, backend có thể mất 30–50 giây để khởi động lại nếu đang ở trạng thái ngủ (spin down).
              </p>
            </div>
          )}

          {health && (
            <div className="alert alert-success mt-4 mb-0" role="alert">
              <h5 className="alert-heading">✅ Kết nối Backend thành công!</h5>
              <ul className="mb-0 small">
                <li><strong>Trạng thái:</strong> {health.status}</li>
                <li><strong>Service:</strong> {health.service}</li>
                <li><strong>Database:</strong> {health.database}</li>
                <li><strong>Thời gian phản hồi:</strong> {health.timestamp}</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="row align-items-md-stretch">
        <div className="col-md-4 mb-3">
          <div className="h-100 p-4 text-bg-dark rounded-3">
            <h3>Frontend SPA</h3>
            <p className="text-secondary small">
              Xây dựng bằng React 19, TypeScript và Bootstrap 5. Triển khai dạng Static Site trên Render với cấu hình rewrite fallback <code>/index.html</code>.
            </p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="h-100 p-4 bg-white border rounded-3 shadow-sm">
            <h3>Backend API</h3>
            <p className="text-secondary small">
              Laravel 12 REST API, Laravel Sanctum Bearer tokens, CORS allowlist bảo mật, Docker containerized bind <code>0.0.0.0:$PORT</code>.
            </p>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="h-100 p-4 bg-white border rounded-3 shadow-sm">
            <h3>Neon Database</h3>
            <p className="text-secondary small">
              PostgreSQL 16 serverless, kết nối an toàn qua TLS/SSL, cấu trúc schema chuẩn hóa không phụ thuộc MySQL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
