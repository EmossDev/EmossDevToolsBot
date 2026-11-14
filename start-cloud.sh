#!/bin/bash

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "=== PHP Bot başlatılıyor (Port 8000) ==="
export PHP_BIN="$(command -v php)"
PORT=8000 php "$ROOT/telegram-bot/php-server.php" &

echo "=== Admin Panel başlatılıyor (Port 3000) ==="
PORT=3000 node --enable-source-maps "$ROOT/artifacts/api-server/dist/index.mjs" &

echo "=== Caddy Proxy başlatılıyor (Port: ${PORT:-10000}) ==="
caddy run --config /app/Caddyfile --adapter caddyfile
