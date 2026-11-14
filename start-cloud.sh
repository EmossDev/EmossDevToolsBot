#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "=== PHP Bot başlatılıyor ==="
export PHP_BIN="$(command -v php)"
PORT=8000 php "$ROOT/telegram-bot/php-server.php" > /tmp/php.log 2>&1 &

echo "=== Admin Panel başlatılıyor ==="
PORT=3000 node --enable-source-maps "$ROOT/artifacts/api-server/dist/index.mjs" > /tmp/node.log 2>&1 &

echo "=== Caddy Proxy başlatılıyor (Port: ${PORT:-10000}) ==="
caddy run --config /app/Caddyfile --adapter caddyfile
