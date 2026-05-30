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

  # Bağımlılıkları yükle
  if [ ! -d "$ROOT/node_modules" ]; then
    echo "[*] Bağımlılıklar yükleniyor..."
    pnpm install --no-frozen-lockfile
  fi

  pnpm --filter @workspace/api-server run build
  echo "[OK] Build tamamlandı."
fi

# ---- Port ayarları ----
export PORT="${PORT:-3000}"
export NODE_ENV=production
export RENDER_ENVIRONMENT=true   # PHP proxy aktif olsun diye

echo ""
# Log dizini — Termux'ta /tmp yerine $TMPDIR
LOGDIR="${TMPDIR:-$ROOT/.tmp}"
mkdir -p "$LOGDIR"
PHP_LOG="$LOGDIR/emoss-php.log"
NODE_LOG="$LOGDIR/emoss-node.log"

# PHP sunucu başlatma
echo "[*] PHP Bot başlatılıyor (port 8000)..."
if [ "$TERMUX" = true ]; then
  # Termux: php -S lock sorunu yaşar, lighttpd kullan
  if ! command -v lighttpd &>/dev/null; then
    echo "[*] lighttpd kuruluyor..."
    pkg install lighttpd -y
  fi
  # lighttpd için dinamik config oluştur (TCP FastCGI — socket'ten daha güvenilir)
  LIGHTY_CONF="$LOGDIR/lighttpd.conf"
  PHP_CGI="$(command -v php-cgi)"
  FCG_PORT=9001
  cat > "$LIGHTY_CONF" <<EOF
server.document-root = "$ROOT/telegram-bot"
server.port = 8000
server.modules = ("mod_fastcgi", "mod_rewrite")
server.errorlog = "$LOGDIR/lighttpd-error.log"
index-file.names = ("router.php", "index.php")
url.rewrite-once = ("^/(.*)$" => "/router.php")
fastcgi.server = (
  ".php" => ((
    "host"        => "127.0.0.1",
    "port"        => $FCG_PORT,
    "bin-path"    => "$PHP_CGI",
    "max-procs"   => 1,
    "bin-environment" => (
      "TMPDIR"          => "$LOGDIR",
      "PHP_FCGI_MAX_REQUESTS" => "0"
    )
  ))
)
EOF
  lighttpd -f "$LIGHTY_CONF" -D > "$PHP_LOG" 2>&1 &
  PHP_PID=$!
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

echo ""
echo "========================================"
echo "  Admin Panel : http://localhost:$PORT/admin"
echo "  PHP Bot      : http://localhost:8000"
echo ""
echo "  Loglar:"
echo "    tail -f $NODE_LOG"
echo "    tail -f $PHP_LOG"
echo ""
echo "  Durdurmak için: Ctrl+C"
echo "========================================"
echo ""

# Ctrl+C gelince her ikisini de durdur
cleanup() {
  echo ""
  echo "[*] Durduruluyor..."
  kill "$PHP_PID" "$NODE_PID" 2>/dev/null
  exit 0
}
trap cleanup INT TERM

# Her iki process'i de bekle (bash 3+ uyumlu)
while kill -0 "$PHP_PID" 2>/dev/null && kill -0 "$NODE_PID" 2>/dev/null; do
  sleep 2
done

echo "[!] Bir servis kapandı, diğeri de durduruluyor..."
kill "$PHP_PID" "$NODE_PID" 2>/dev/null
