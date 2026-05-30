#!/bin/bash
# EmossDev Panel & Bot — Termux / Linux başlatma scripti
# Kullanım: bash start-local.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "========================================"
echo "  EmossDev Panel + Bot"
echo "========================================"
echo ""

# .env dosyası varsa yükle
if [ -f "$ROOT/.env" ]; then
  echo "[*] .env dosyası yükleniyor..."
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

# Termux mu normal Linux mu?
if [ -d "/data/data/com.termux" ]; then
  TERMUX=true
  echo "[*] Ortam: Termux (Android)"
else
  TERMUX=false
  echo "[*] Ortam: Linux"
fi

# ---- PHP kontrolü ----
if ! command -v php &>/dev/null; then
  echo "[*] PHP bulunamadı, kuruluyor..."
  if [ "$TERMUX" = true ]; then
    pkg install php -y
  else
    sudo apt-get install -y php-cli
  fi
fi
echo "[OK] PHP: $(php -r 'echo PHP_VERSION;')"

# ---- Node.js kontrolü ----
if ! command -v node &>/dev/null; then
  echo "[*] Node.js bulunamadı, kuruluyor..."
  if [ "$TERMUX" = true ]; then
    pkg install nodejs -y
  else
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
fi
echo "[OK] Node.js: $(node -v)"

# ---- pnpm kontrolü ----
if ! command -v pnpm &>/dev/null; then
  echo "[*] pnpm kuruluyor..."
  npm install -g pnpm
fi
echo "[OK] pnpm: $(pnpm -v)"

# ---- Build kontrolü ----
DIST="$ROOT/artifacts/api-server/dist/index.mjs"
if [ -f "$DIST" ]; then
  echo "[OK] Derlenmiş panel hazır, build atlanıyor."
else
  echo "[*] dist bulunamadı, derleniyor..."
  if [ ! -d "$ROOT/node_modules" ]; then
    echo "[*] Bağımlılıklar yükleniyor..."
    pnpm install --no-frozen-lockfile
  fi
  pnpm --filter @workspace/api-server run build
  echo "[OK] Build tamamlandı."
fi

# ---- Port ayarları ----
export PORT="${PORT:-3000}"
export BOT_PORT=8000
export NODE_ENV=production

echo ""
LOGDIR="${TMPDIR:-$ROOT/.tmp}"
mkdir -p "$LOGDIR"
mkdir -p "$ROOT/telegram-bot/.tmp"
PHP_LOG="$LOGDIR/emoss-php.log"
NODE_LOG="$LOGDIR/emoss-node.log"

# ── PHP Bot başlatma ───────────────────────────────────────────────────────
echo "[*] PHP Bot başlatılıyor (port 8000)..."

PHP_PID=""

if [ "$TERMUX" = true ]; then
  # Termux: önce php-fpm dene (çok daha hızlı — süreç canlı kalır)
  # Termux'ta php-fpm genellikle /data/data/com.termux/files/usr/sbin/ altındadır
  FPM_BIN="$(command -v php-fpm 2>/dev/null \
    || ls /data/data/com.termux/files/usr/sbin/php-fpm* 2>/dev/null | head -1 \
    || true)"
  if [ -n "$FPM_BIN" ]; then
    echo "[*] php-fpm bulundu — FastCGI modu (hızlı)..."
    FPM_CONF="$ROOT/telegram-bot/.tmp/php-fpm.conf"
    FPM_PID_FILE="$ROOT/telegram-bot/.tmp/php-fpm.pid"
    FPM_SOCK_PORT=9000

    cat > "$FPM_CONF" <<FPMCONF
[global]
pid = $FPM_PID_FILE
error_log = $LOGDIR/php-fpm-error.log
daemonize = yes

[www]
listen = 127.0.0.1:$FPM_SOCK_PORT
pm = static
pm.max_children = 2
php_admin_value[sys_temp_dir] = $ROOT/telegram-bot/.tmp
php_admin_value[upload_tmp_dir] = $ROOT/telegram-bot/.tmp
php_admin_value[display_errors] = Off
FPMCONF

    # Eski fpm varsa durdur
    if [ -f "$FPM_PID_FILE" ]; then
      kill "$(cat "$FPM_PID_FILE")" 2>/dev/null || true
      rm -f "$FPM_PID_FILE"
      sleep 1
    fi

    "$FPM_BIN" -y "$FPM_CONF" 2>>"$LOGDIR/php-fpm-error.log"
    sleep 1

    if [ -f "$FPM_PID_FILE" ] && kill -0 "$(cat "$FPM_PID_FILE")" 2>/dev/null; then
      echo "[OK] php-fpm çalışıyor (PID: $(cat "$FPM_PID_FILE"))"
      FPM_PORT=$FPM_SOCK_PORT PORT=8000 node "$ROOT/telegram-bot/php-fpm-bridge.mjs" > "$PHP_LOG" 2>&1 &
      PHP_PID=$!
      USE_FPM=true
    else
      echo "[!] php-fpm başlatılamadı, fallback: spawn köprüsü..."
      USE_FPM=false
    fi
  else
    echo "[*] php-fpm yok — spawn köprüsü kullanılıyor..."
    USE_FPM=false
  fi

  if [ "$USE_FPM" != true ]; then
    # php-fpm yoksa php-cgi FastCGI modu dene (-b flag — lock sorunu YOK)
    CGI_BIN="$(command -v php-cgi 2>/dev/null \
      || ls /data/data/com.termux/files/usr/bin/php-cgi* 2>/dev/null | head -1 \
      || true)"
    if [ -n "$CGI_BIN" ]; then
      echo "[*] php-cgi FastCGI modu kullanılıyor (port 9001)..."
      "$CGI_BIN" -b 127.0.0.1:9001 >> "$LOGDIR/php-cgi.log" 2>&1 &
      CGI_PID=$!
      sleep 1
      if kill -0 "$CGI_PID" 2>/dev/null; then
        echo "[OK] php-cgi FastCGI çalışıyor (PID: $CGI_PID)"
        FPM_PORT=9001 PORT=8000 node "$ROOT/telegram-bot/php-fpm-bridge.mjs" > "$PHP_LOG" 2>&1 &
        PHP_PID=$!
        USE_FPM=true
      else
        echo "[!] php-cgi de başlatılamadı, spawn köprüsüne geçiliyor..."
      fi
    fi
  fi

  if [ "$USE_FPM" != true ]; then
    # Son seçenek: lock-free PHP socket sunucusu (socket_*() flock gerektirmez)
    echo "[*] Lock-free PHP socket sunucusu kullanılıyor..."
    export PHP_BIN="$(command -v php)"
    PORT=8000 PHP_BIN="$PHP_BIN" php "$ROOT/telegram-bot/php-server.php" > "$PHP_LOG" 2>&1 &
    PHP_PID=$!
  fi

else
  # Linux: php -S normalde çalışır
  PORT=8000 bash "$ROOT/telegram-bot/start.sh" > "$PHP_LOG" 2>&1 &
  PHP_PID=$!
fi

sleep 1

if ! kill -0 "$PHP_PID" 2>/dev/null; then
  echo "[HATA] PHP bot başlatılamadı! Log:"
  cat "$PHP_LOG"
  exit 1
fi
echo "[OK] PHP Bot çalışıyor (PID: $PHP_PID)"

echo "[*] Admin Panel başlatılıyor (port $PORT)..."
node --enable-source-maps "$ROOT/artifacts/api-server/dist/index.mjs" > "$NODE_LOG" 2>&1 &
NODE_PID=$!

sleep 1

if ! kill -0 "$NODE_PID" 2>/dev/null; then
  echo "[HATA] Admin panel başlatılamadı! Log:"
  cat "$NODE_LOG"
  kill "$PHP_PID" 2>/dev/null
  exit 1
fi
echo "[OK] Admin Panel çalışıyor (PID: $NODE_PID)"

# ── localhost.run tüneli ───────────────────────────────────────────────────
TUNNEL_LOG="$LOGDIR/emoss-tunnel.log"
TUNNEL_PID=""
TUNNEL_URL=""

if command -v ssh &>/dev/null; then
  echo "[*] localhost.run tüneli başlatılıyor..."
  ssh -o StrictHostKeyChecking=no \
      -o ServerAliveInterval=30 \
      -o ServerAliveCountMax=3 \
      -R "80:localhost:$PORT" nokey@localhost.run \
      > "$TUNNEL_LOG" 2>&1 &
  TUNNEL_PID=$!

  # URL'nin gelmesini bekle (max 8 saniye)
  for i in $(seq 1 16); do
    sleep 0.5
    TUNNEL_URL=$(grep -oE 'https://[a-zA-Z0-9.-]+\.(lhr\.life|lhrtunnel\.link)' "$TUNNEL_LOG" 2>/dev/null | head -1 || true)
    [ -n "$TUNNEL_URL" ] && break
  done

  if [ -n "$TUNNEL_URL" ]; then
    echo "[OK] Tünel: $TUNNEL_URL"

    # Webhook'u otomatik Telegram'a kaydet
    CONFIG_FILE="$ROOT/telegram-bot/COMMAND_FILES/DATA_FILE/config.json"
    BOT_TOKEN=""
    if command -v python3 &>/dev/null; then
      BOT_TOKEN=$(python3 -c "import json,sys; d=json.load(open('$CONFIG_FILE')); print(d['bot']['token'])" 2>/dev/null || true)
    fi
    if [ -n "$BOT_TOKEN" ]; then
      WEBHOOK_RESP=$(curl -sf "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${TUNNEL_URL}/bot/" 2>/dev/null || true)
      if echo "$WEBHOOK_RESP" | grep -q '"ok":true'; then
        echo "[OK] Webhook güncellendi: ${TUNNEL_URL}/bot/"
      else
        echo "[!] Webhook güncellenemedi: $WEBHOOK_RESP"
      fi
    else
      echo "[!] Bot token okunamadı, webhook elle güncelle."
    fi
  else
    echo "[!] Tünel URL'si alınamadı — log: $TUNNEL_LOG"
  fi
else
  echo "[!] ssh bulunamadı, tünel atlandı. Manuel: ssh -R 80:localhost:$PORT nokey@localhost.run"
fi

echo ""
echo "========================================"
echo "  Admin Panel : http://localhost:$PORT/admin"
echo "  Bot Webhook  : ${TUNNEL_URL:-<tünel-url>}/bot/"
echo ""
echo "  Loglar:"
echo "    tail -f $NODE_LOG"
echo "    tail -f $PHP_LOG"
echo "    tail -f $TUNNEL_LOG"
echo ""
echo "  Durdurmak için: Ctrl+C"
echo "========================================"
echo ""

cleanup() {
  echo ""
  echo "[*] Durduruluyor..."
  kill "$PHP_PID" "$NODE_PID" 2>/dev/null
  [ -n "$TUNNEL_PID" ] && kill "$TUNNEL_PID" 2>/dev/null
  FPM_PID_FILE="$ROOT/telegram-bot/.tmp/php-fpm.pid"
  if [ -f "$FPM_PID_FILE" ]; then
    kill "$(cat "$FPM_PID_FILE")" 2>/dev/null || true
  fi
  exit 0
}
trap cleanup INT TERM

while kill -0 "$PHP_PID" 2>/dev/null && kill -0 "$NODE_PID" 2>/dev/null; do
  sleep 2
done

echo "[!] Bir servis kapandı, diğerleri de durduruluyor..."
kill "$PHP_PID" "$NODE_PID" 2>/dev/null
[ -n "$TUNNEL_PID" ] && kill "$TUNNEL_PID" 2>/dev/null
FPM_PID_FILE="$ROOT/telegram-bot/.tmp/php-fpm.pid"
if [ -f "$FPM_PID_FILE" ]; then
  kill "$(cat "$FPM_PID_FILE")" 2>/dev/null || true
fi
