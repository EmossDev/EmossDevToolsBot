#!/bin/bash
set -e

echo "Starting PHP Telegram Bot on port 8000..."
cd telegram-bot
php -S 0.0.0.0:8000 -t . router.php &
PHP_PID=$!
cd ..

echo "Starting Node.js API Server on port ${PORT:-8080}..."
node --enable-source-maps artifacts/api-server/dist/index.mjs &
NODE_PID=$!

wait -n
kill $PHP_PID $NODE_PID 2>/dev/null
