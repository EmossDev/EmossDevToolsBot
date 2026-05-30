#!/bin/bash
# PHP bot başlatma — Replit, Render, Termux, Linux hepsinde çalışır
ROOT="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-8000}"

# Garantili yazılabilir tmp dizini (proje içinde — her ortamda çalışır)
TMPD="${PHP_TMPDIR:-$ROOT/.tmp}"
mkdir -p "$TMPD"

# PHP'ye hem ini hem env üzerinden bildir
export TMPDIR="$TMPD"
export TMP="$TMPD"
export TEMP="$TMPD"
# PHP 8.3+ built-in server: tek worker modunda lock dosyası oluşturmaz
export PHP_CLI_SERVER_WORKERS=1

exec php \
  -d sys_temp_dir="$TMPD" \
  -d session.save_path="$TMPD" \
  -d upload_tmp_dir="$TMPD" \
  -S 0.0.0.0:"$PORT" \
  -t "$ROOT" \
  "$ROOT/router.php"
