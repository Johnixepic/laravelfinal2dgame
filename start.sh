#!/usr/bin/env bash
# THE LAST CONNECTION — Startup Script
# Usage: ./start.sh [production|development]
#   production  : Build assets and start Laravel (default)
#   development : Start Vite dev server + Laravel with HMR

set -euo pipefail

cd "$(dirname "$0")"

MODE="${1:-production}"

case "$MODE" in
    production|prod)
        echo "=== Production Mode ==="
        echo "1. Building frontend assets..."
        npm run build

        echo "2. Removing stale Vite hot file..."
        rm -f public/hot

        echo "3. Clearing Laravel caches..."
        php artisan config:clear
        php artisan cache:clear
        php artisan view:clear

        echo "4. Starting Laravel development server on http://localhost:8000"
        echo "   Open http://localhost:8000 in your browser."
        php artisan serve --host=0.0.0.0 --port=8000
        ;;

    development|dev)
        echo "=== Development Mode ==="
        echo "1. Ensuring production build exists..."
        if [ ! -f public/build/manifest.json ]; then
            echo "   No production build found. Running initial build..."
            npm run build
        fi

        echo "2. Removing stale Vite hot file..."
        rm -f public/hot

        echo "3. Clearing Laravel caches..."
        php artisan config:clear
        php artisan cache:clear
        php artisan view:clear

        echo "4. Starting Laravel development server on http://localhost:8000"
        php artisan serve --host=0.0.0.0 --port=8000 &
        LARAVEL_PID=$!

        echo "5. Starting Vite dev server..."
        echo "   HMR origin: ${VITE_DEV_SERVER_ORIGIN:-http://localhost:5173}"
        npm run dev -- --host 0.0.0.0
        ;;

    *)
        echo "Unknown mode: $MODE"
        echo "Usage: $0 [production|development]"
        exit 1
        ;;
esac
