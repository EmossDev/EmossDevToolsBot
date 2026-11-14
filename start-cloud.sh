#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "=== Bağımlılıklar yükleniyor ve proje derleniyor ==="
if command -v pnpm &> /dev/null; then
    pnpm install
    # Eğer build komutu gerekiyorsa (örneğin pnpm build)
    pnpm build || true
else
    npm install
    npm run build || true
fi

echo "=== PHP Bot başlatılıyor (Port 8000) ==="
export PHP_BIN="$(command -v php)"
PORT=8000 php "$ROOT/telegram-bot/php-server.php" &

echo "=== Admin Panel başlatılıyor (Port 3000) ==="
# Hataların gizlenmemesi için çıktıyı doğrudan Render loglarına veriyoruz
PORT=3000 node --enable-source-maps "$ROOT/artifacts/api-server/dist/index.mjs" &

echo "=== Caddy Proxy başlatılıyor (Port: ${PORT:-10000}) ==="
caddy run --config /app/Caddyfile --adapter caddyfile
