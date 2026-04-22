#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MODE="${1:-build}"

COMPOSE=(docker compose --env-file .env.docker)

log() {
    printf '\n[%s] %s\n' "$1" "$2"
}

fail() {
    printf '\n[error] %s\n' "$1" >&2
    exit 1
}

usage() {
    cat <<'EOF'
Usage:
  scripts/deploy-docker.sh build
  scripts/deploy-docker.sh sync

Modes:
  build  Standard deploy. Rebuild image, run migrations, clear cache, optimize.
  sync   Fast fallback. Sync current checkout into running containers, then run
         migrations and restart services. Use only when Docker image/dependency
         layers are unchanged.
EOF
}

require_cmd() {
    command -v "$1" >/dev/null 2>&1 || fail "Required command not found: $1"
}

ensure_file() {
    [ -f "$1" ] || fail "Missing required file: $1"
}

container_id() {
    local service="$1"
    "${COMPOSE[@]}" ps -q "$service"
}

sync_service_code() {
    local service="$1"
    local include_public="${2:-false}"
    local id

    id="$(container_id "$service")"
    [ -n "$id" ] || fail "Service '$service' is not running"

    if [ "$include_public" = "true" ]; then
        tar \
            --exclude=.git \
            --exclude=node_modules \
            --exclude=vendor \
            --exclude=storage \
            --exclude=bootstrap/cache \
            --exclude=public/hot \
            -C "$ROOT_DIR" \
            -cf - . \
            | docker exec -i "$id" tar -xf - -C /var/www/html
    else
        tar \
            --exclude=.git \
            --exclude=node_modules \
            --exclude=vendor \
            --exclude=storage \
            --exclude=bootstrap/cache \
            --exclude=public \
            --exclude=public/hot \
            -C "$ROOT_DIR" \
            -cf - . \
            | docker exec -i "$id" tar -xf - -C /var/www/html
    fi
}

run_healthcheck() {
    local app_port="${APP_PORT:-8080}"

    log info "Checking app response on http://127.0.0.1:${app_port}/"
    curl -I -m 10 "http://127.0.0.1:${app_port}/"
}

require_cmd docker
require_cmd git
require_cmd tar
require_cmd curl

case "$MODE" in
    help|-h|--help)
        usage
        exit 0
        ;;
    build)
        ensure_file compose.yaml
        ensure_file .env.docker

        set -a
        # shellcheck disable=SC1091
        . ./.env.docker
        set +a

        log info "Deploy mode: ${MODE}"
        log info "Current revision: $(git rev-parse --short HEAD)"

        log step "Building and starting Docker services"
        "${COMPOSE[@]}" up -d --build

        log step "Running database migrations"
        "${COMPOSE[@]}" exec -T app php artisan migrate --force

        log step "Refreshing Laravel caches"
        "${COMPOSE[@]}" exec -T app php artisan optimize:clear
        "${COMPOSE[@]}" exec -T app php artisan optimize

        log step "Listing running services"
        "${COMPOSE[@]}" ps

        run_healthcheck
        ;;
    sync)
        ensure_file compose.yaml
        ensure_file .env.docker

        set -a
        # shellcheck disable=SC1091
        . ./.env.docker
        set +a

        log info "Deploy mode: ${MODE}"
        log info "Current revision: $(git rev-parse --short HEAD)"

        log step "Ensuring services are running"
        "${COMPOSE[@]}" up -d app queue scheduler nginx db

        log step "Syncing current checkout into running containers"
        sync_service_code app true
        sync_service_code queue
        sync_service_code scheduler

        log step "Running database migrations"
        "${COMPOSE[@]}" exec -T app php artisan migrate --force

        log step "Refreshing Laravel caches"
        "${COMPOSE[@]}" exec -T app php artisan optimize:clear

        log step "Restarting application services"
        "${COMPOSE[@]}" restart app queue scheduler nginx

        log step "Listing running services"
        "${COMPOSE[@]}" ps

        run_healthcheck
        ;;
    *)
        usage
        fail "Unknown mode: ${MODE}"
        ;;
esac
