# Multi-stage Dockerfile for Laravel 12 API on Render (Free Tier Optimized)
FROM composer:2.8 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

FROM php:8.2-fpm-alpine

# Install system dependencies & PostgreSQL client libraries
RUN apk add --no-cache \
    nginx \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    curl

# Install PHP extensions required by Laravel 12 & PostgreSQL
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    bcmath \
    pcntl \
    opcache

WORKDIR /var/www/html

# Copy application files
COPY . .

# Copy vendor from composer stage
COPY --from=vendor /app/vendor /var/www/html/vendor

# Copy Nginx and PHP configuration
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh && \
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 10000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
