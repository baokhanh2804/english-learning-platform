#!/bin/sh
set -e

PORT=${PORT:-10000}
echo "Starting container on port $PORT..."

# Substitute port in nginx config
sed -i "s/\${PORT}/$PORT/g" /etc/nginx/http.d/default.conf

# Fallback APP_KEY if not configured in Render environment variables
if [ -z "$APP_KEY" ]; then
    echo "APP_KEY is not set. Generating fallback key..."
    export APP_KEY="base64:7vF8r+jP9Wf2Z3K1mH6uT8yC4gE7aX9oQ3lM1bN2kP4="
fi

# Ensure storage directories exist with correct permissions
mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs
chmod -R 775 storage bootstrap/cache

# Auto-run database migrations if DB is configured
if [ -n "$DB_HOST" ]; then
    echo "Running database migrations..."
    php artisan migrate --force || echo "Migration notice: continuing..."
fi

# Cache configuration if APP_KEY is provided
if [ -n "$APP_KEY" ]; then
    echo "Caching Laravel configuration and routes..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

# Start PHP-FPM in background
echo "Starting PHP-FPM..."
php-fpm -D

# Start Nginx in foreground
echo "Starting Nginx..."
exec nginx -g "daemon off;"
