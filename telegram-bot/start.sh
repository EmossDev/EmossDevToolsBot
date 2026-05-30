#!/bin/bash
# PHP bot başlatma — Replit, Render, Termux, Linux hepsinde çalışır
ROOT="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-8000}"
exec php -S 0.0.0.0:"$PORT" -t "$ROOT" "$ROOT/router.php"
