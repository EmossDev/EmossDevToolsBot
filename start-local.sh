#!/bin/bash
# EmossDev Panel & Bot - Termux / Linux başlatma scripti

set -e
cd "$(dirname "$0")"

echo "========================================"
echo "  EmossDev Panel + Bot Başlatılıyor"
echo "========================================"
echo ""

# Termux mu normal Linux mu?
if [ -d "/data/data/com.termux" ]; then
  TERMUX=true
  echo "[*] Ortam: Termux (Android)"
else
  TERMUX=false
  echo "[*] Ortam: Linux"
fi

# PHP kontrolü
if ! command -v php &>/dev/null; then
  echo "[*] PHP kuruluyor..."
  if [ "$TERMUX" = true ]; then
    pkg install php -y
  else
    sudo apt-get install -y php-cli
  fi
fi

# Node.js kontrolü
if ! command -v node &>/dev/null; then
  echo "[*] Node.js kuruluyor..."
  if [ "$TERMUX" = true ]; then
    pkg install nodejs -y
  else
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
fi

# pnpm kontrolü
if ! command -v pnpm &>/dev/null; then
  echo "[*] pnpm kuruluyor..."
  npm install -g pnpm
fi

# Bağımlılıkları yükle
if [ ! -d "node_modules" ]; then
  echo "[*] Bağımlılıklar yükleniyor..."
  pnpm install --no-frozen-lockfile
fi

# Build
echo "[*] Proje derleniyor..."
pnpm --filter @workspace/api-server run build

# Port ayarı
export PORT="${PORT:-3000}"
export NODE_ENV=production
export RENDER_ENVIRONMENT=true

echo ""
echo "[OK] PHP Bot başlatılıyor (port 8000)..."
cd telegram-bot
php -S 0.0.0.0:8000 -t . router.php > /tmp/php-bot.log 2>&1 &
PHP_PID=$!
cd ..

echo "[OK] Admin Panel başlatılıyor (port $PORT)..."
node --enable-source-maps artifacts/api-server/dist/index.mjs > /tmp/node-panel.log 2>&1 &
NODE_PID=$!

echo ""
echo "========================================"
echo "  Admin Panel: http://localhost:$PORT/admin"
echo "  PHP Bot:     http://localhost:8000"
echo "  Panel logu:  tail -f /tmp/node-panel.log"
echo "  Bot logu:    tail -f /tmp/php-bot.log"
echo "  Durdurmak:   Ctrl+C"
echo "========================================"
echo ""

# İkisi de çalışırken bekle, biri ölürse diğerini de kapat
trap "echo ''; echo 'Durduruluyor...'; kill $PHP_PID $NODE_PID 2>/dev/null; exit 0" INT TERM

wait -n
echo "[!] Bir servis durdu, diğeri kapatılıyor..."
kill $PHP_PID $NODE_PID 2>/dev/null
