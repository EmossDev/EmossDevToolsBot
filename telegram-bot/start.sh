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
export PHP_CLI_SERVER_WORKERS=1

# -d sys_temp_dir çok geç işleniyor; -c ile erken yüklenen php.ini kullan
PHP_INI="$TMPD/php-local.ini"
cat > "$PHP_INI" <<EOF
sys_temp_dir = $TMPD
session.save_path = $TMPD
upload_tmp_dir = $TMPD
EOF

exec php -c "$PHP_INI" \
  -S 0.0.0.0:"$PORT" \
  -t "$ROOT" \
  "$ROOT/router.php"
