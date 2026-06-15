#!/bin/bash
# EmossDev Panel & Bot — Termux / Linux başlatma scripti
# Kullanım: bash start-local.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# ── ANSI renkleri ─────────────────────────────────────────────────────────
R='\033[0;31m'; BR='\033[1;31m'
G='\033[0;32m'; BG='\033[1;32m'
Y='\033[1;33m'; C='\033[0;36m'
W='\033[1;37m'; D='\033[2m'; N='\033[0m'

OK_PFX="${BG}  ✓${N}"; INF_PFX="${C}  →${N}"; ERR_PFX="${BR}  ✗${N}"; WRN_PFX="${Y}  !${N}"

clear 2>/dev/null || true
printf "${BR}"
printf '  ╔══════════════════════════════╗\n'
printf '  ║                              ║\n'
printf '  ║   EmossDev  Tools  Bot       ║\n'
printf '  ║   Admin Panel  v2.0          ║\n'
printf '  ║                              ║\n'
printf '  ╚══════════════════════════════╝\n'
printf "${N}\n"

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

# ── Eski process'leri temizle ─────────────────────────────────────────────
echo "[*] Eski process'ler temizleniyor..."
pkill -f "php-server.php"    2>/dev/null || true
pkill -f "php-fpm-bridge"    2>/dev/null || true
pkill -f "php-cgi"           2>/dev/null || true
pkill -f "dist/index.mjs"    2>/dev/null || true
# fuser varsa portları direkt serbest bırak
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
sleep 2
echo "[OK] Temizlik tamamlandı"

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

# ── GitHub webhook yardımcı fonksiyonları ────────────────────────────────
GH_REPO="EmossDev/EmossDevToolsBot"
GH_HOOK_ID_FILE="${TMPDIR:-/tmp}/emoss-gh-hook-id"
_CF="$ROOT/telegram-bot/COMMAND_FILES/DATA_FILE/config.json"

_get_gh_secret(){
  python3 -c "
import json, sys
try:
  d=json.load(open('$_CF'))
  print(d.get('bot',{}).get('githubWebhookSecret',''))
except: print('')
" 2>/dev/null || echo ""
}

_setup_github_webhook(){
  local panel_url="$1"
  [ -z "${GITHUB_TOKEN:-}" ] && return
  [ -z "$panel_url" ] && return
  local wh_url="${panel_url}/api/github-webhook"
  local secret
  secret=$(_get_gh_secret)
  local hook_id=""

  # Kaydedilmiş ID ile PATCH dene
  if [ -f "$GH_HOOK_ID_FILE" ]; then
    hook_id=$(cat "$GH_HOOK_ID_FILE")
    local pr
    pr=$(curl -sf -X PATCH \
      -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"config\":{\"url\":\"$wh_url\",\"content_type\":\"json\",\"secret\":\"$secret\",\"insecure_ssl\":\"0\"}}" \
      "https://api.github.com/repos/$GH_REPO/hooks/$hook_id" 2>/dev/null || true)
    if echo "$pr" | grep -q '"id"'; then
      echo "[OK] GitHub webhook güncellendi → $wh_url"
      return
    fi
    rm -f "$GH_HOOK_ID_FILE"; hook_id=""
  fi

  # Mevcut webhook'u listele, github-webhook içereni bul
  local lr
  lr=$(curl -sf \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    "https://api.github.com/repos/$GH_REPO/hooks" 2>/dev/null || true)
  hook_id=$(echo "$lr" | python3 -c "
import json,sys
try:
  for h in json.load(sys.stdin):
    if 'github-webhook' in h.get('config',{}).get('url',''):
      print(h['id']); break
except: pass
" 2>/dev/null || true)

  if [ -n "$hook_id" ]; then
    echo "$hook_id" > "$GH_HOOK_ID_FILE"
    curl -sf -X PATCH \
      -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"config\":{\"url\":\"$wh_url\",\"content_type\":\"json\",\"secret\":\"$secret\",\"insecure_ssl\":\"0\"}}" \
      "https://api.github.com/repos/$GH_REPO/hooks/$hook_id" > /dev/null 2>&1 || true
    echo "[OK] GitHub webhook güncellendi (mevcut) → $wh_url"
    return
  fi

  # Hiç webhook yok → yeni oluştur
  local cr
  cr=$(curl -sf -X POST \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"web\",\"active\":true,\"events\":[\"push\"],\"config\":{\"url\":\"$wh_url\",\"content_type\":\"json\",\"secret\":\"$secret\",\"insecure_ssl\":\"0\"}}" \
    "https://api.github.com/repos/$GH_REPO/hooks" 2>/dev/null || true)
  local nid
  nid=$(echo "$cr" | python3 -c "
import json,sys
try: print(json.load(sys.stdin)['id'])
except: pass
" 2>/dev/null || true)
  if [ -n "$nid" ]; then
    echo "$nid" > "$GH_HOOK_ID_FILE"
    echo "[OK] GitHub webhook oluşturuldu (ID: $nid) → $wh_url"
  else
    echo "[!] GitHub webhook oluşturulamadı — GITHUB_TOKEN yetkisini kontrol et"
  fi
}

# ── localhost.run tüneli ───────────────────────────────────────────────────
TUNNEL_LOG="$LOGDIR/emoss-tunnel.log"
TUNNEL_PID=""
TUNNEL_URL=""

if command -v ssh &>/dev/null; then
  echo "[*] localhost.run tüneli başlatılıyor..."
  ssh -o StrictHostKeyChecking=no \
      -o ServerAliveInterval=30 \
      -o ServerAliveCountMax=3 \
      -R "80:localhost:$PORT" localhost.run \
      > "$TUNNEL_LOG" 2>&1 &
  TUNNEL_PID=$!

  # URL'nin gelmesini bekle (max 20 saniye)
  for i in $(seq 1 40); do
    sleep 0.5
    TUNNEL_URL=$(grep -oE 'https://[a-zA-Z0-9.-]+\.(lhr\.life|lhrtunnel\.link)' "$TUNNEL_LOG" 2>/dev/null | tail -1 || true)
    [ -n "$TUNNEL_URL" ] && break
  done

  if [ -n "$TUNNEL_URL" ]; then
    echo "[OK] Tünel: $TUNNEL_URL"
    _setup_github_webhook "$TUNNEL_URL"

    # Webhook'u otomatik Telegram'a kaydet
    CONFIG_FILE="$ROOT/telegram-bot/COMMAND_FILES/DATA_FILE/config.json"
    BOT_TOKEN=""
    if command -v python3 &>/dev/null; then
      BOT_TOKEN=$(python3 -c "import json,sys; d=json.load(open('$CONFIG_FILE')); print(d['bot']['token'])" 2>/dev/null || true)
    fi
    if [ -n "$BOT_TOKEN" ]; then
      WEBHOOK_RESP=$(curl -sf "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${TUNNEL_URL}" 2>/dev/null || true)
      if echo "$WEBHOOK_RESP" | grep -q '"ok":true'; then
        echo "[OK] Webhook güncellendi: ${TUNNEL_URL}"
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

printf "\n${BG}"
printf '  ╔══════════════════════════════════╗\n'
printf "  ║${W}  Sistem Hazir                   ${BG}║${N}\n"
printf "${BG}  ╠══════════════════════════════════╣${N}\n"
printf "  ║${N}  Panel   ${D}→${N}  ${C}http://localhost:${PORT}/admin${N}\n"
printf "${BG}  ║${N}\n"
if [ -n "$TUNNEL_URL" ]; then
  printf "  ║${N}  Tunel   ${D}→${N}  ${Y}${TUNNEL_URL}${N}\n"
else
  printf "  ║${N}  Tunel   ${D}→${N}  ${R}Baslatilmadi${N}\n"
fi
printf "${BG}  ╠══════════════════════════════════╣${N}\n"
printf "  ║${N}  ${D}tail -f${N} NODE: ${D}$NODE_LOG${N}\n"
printf "  ║${N}  ${D}tail -f${N} PHP : ${D}$PHP_LOG${N}\n"
printf "${BG}  ╠══════════════════════════════════╣${N}\n"
printf "  ║${N}  Durdurmak icin: ${W}Ctrl+C${N}\n"
printf "${BG}  ╚══════════════════════════════════╝${N}\n\n"

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

# ── Tünel URL izleyici: değişince webhook'u otomatik güncelle ─────────────
_LAST_URL="$TUNNEL_URL"

_update_webhook() {
  local new_url="$1"
  CONFIG_FILE="$ROOT/telegram-bot/COMMAND_FILES/DATA_FILE/config.json"
  BOT_TOKEN=""
  if command -v python3 &>/dev/null; then
    BOT_TOKEN=$(python3 -c "import json; d=json.load(open('$CONFIG_FILE')); print(d['bot']['token'])" 2>/dev/null || true)
  fi
  if [ -z "$BOT_TOKEN" ]; then return; fi

  WEBHOOK_RESP=$(curl -sf "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${new_url}" 2>/dev/null || true)
  if echo "$WEBHOOK_RESP" | grep -q '"ok":true'; then
    echo "[OK] Webhook otomatik güncellendi: ${new_url}"
    # config.json'daki webhookUrl'i de güncelle
    if command -v python3 &>/dev/null; then
      python3 - "$CONFIG_FILE" "${new_url}" <<'PYEOF'
import json, sys
path, url = sys.argv[1], sys.argv[2]
d = json.load(open(path))
d['bot']['webhookUrl'] = url
open(path, 'w').write(json.dumps(d, indent=4, ensure_ascii=False))
PYEOF
    fi
  else
    echo "[!] Webhook güncellenemedi: $WEBHOOK_RESP"
  fi
}

_restart_php(){
  echo "[*] PHP Bot yeniden başlatılıyor..."
  pkill -f "php-server.php" 2>/dev/null || true
  sleep 1
  export PHP_BIN="$(command -v php)"
  PORT=8000 PHP_BIN="$PHP_BIN" php "$ROOT/telegram-bot/php-server.php" > "$PHP_LOG" 2>&1 &
  PHP_PID=$!
  sleep 1
  if kill -0 "$PHP_PID" 2>/dev/null; then
    echo "[OK] PHP Bot yeniden başlatıldı (PID: $PHP_PID)"
  else
    echo "[!] PHP Bot yeniden başlatılamadı"
  fi
}

_restart_node(){
  echo "[*] Admin Panel yeniden başlatılıyor..."
  sleep 1
  node --enable-source-maps "$ROOT/artifacts/api-server/dist/index.mjs" > "$NODE_LOG" 2>&1 &
  NODE_PID=$!
  sleep 1
  if kill -0 "$NODE_PID" 2>/dev/null; then
    echo "[OK] Admin Panel yeniden başlatıldı (PID: $NODE_PID)"
  else
    echo "[!] Admin Panel yeniden başlatılamadı"
  fi
}

while true; do
  sleep 5

  # ── Tünel URL izle ───────────────────────────────────────────────────────
  if [ -n "$TUNNEL_PID" ] && [ -f "$TUNNEL_LOG" ]; then
    NEW_URL=$(grep -oE 'https://[a-zA-Z0-9.-]+\.(lhr\.life|lhrtunnel\.link)' "$TUNNEL_LOG" 2>/dev/null | tail -1 || true)
    if [ -n "$NEW_URL" ] && [ "$NEW_URL" != "$_LAST_URL" ]; then
      echo "[*] Tünel URL'si değişti: $NEW_URL"
      _LAST_URL="$NEW_URL"
      _update_webhook "$NEW_URL"
      _setup_github_webhook "$NEW_URL"
    fi
  fi

  # ── PHP Watchdog ─────────────────────────────────────────────────────────
  if ! kill -0 "$PHP_PID" 2>/dev/null; then
    echo "[!] PHP Bot kapandı — watchdog devreye girdi"
    _restart_php
  fi

  # ── Node Watchdog ────────────────────────────────────────────────────────
  if ! kill -0 "$NODE_PID" 2>/dev/null; then
    echo "[!] Admin Panel kapandı — watchdog devreye girdi"
    _restart_node
  fi
done
