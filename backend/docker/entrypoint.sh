#!/bin/sh
set -e

PORT=${PORT:-10000}
echo "Starting container on port $PORT..."

# Substitute port in nginx config
sed -i "s/\${PORT}/$PORT/g" /etc/nginx/http.d/default.conf

# Cache configuration if APP_KEY is provided
if [ -n "$APP_KEY" ]; then
    echo "Caching Laravel configuration and routes..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

# Ensure storage directories exist with correct permissions
mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs
chmod -R 775 storage bootstrap/cache

# Start PHP-FPM in background
echo "Starting PHP-FPM..."
php-fpm -D

# Start Nginx in foreground
echo "Starting Nginx..."
exec nginx -g "daemon off;"
