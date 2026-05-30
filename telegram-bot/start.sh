#!/bin/bash
# PHP bot başlatma — Replit, Render, Termux, Linux hepsinde çalışır
ROOT="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-8000}"
# Termux'ta /tmp yazılabilir değil — sys_temp_dir ve session.save_path $TMPDIR'a yönlendir
TMPD="${TMPDIR:-/tmp}"
exec php \
  -d sys_temp_dir="$TMPD" \
  -d session.save_path="$TMPD" \
  -S 0.0.0.0:"$PORT" \
  -t "$ROOT" \
  "$ROOT/router.php"
