#!/bin/bash
# EmossDev Panel & Bot — Termux / Linux başlatma scripti
# Kullanım: bash start-local.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# ── ANSI renkleri ─────────────────────────────────────────────────────────
R='\033[0;31m';  BR='\033[1;31m'
G='\033[0;32m';  BG='\033[1;32m'
Y='\033[1;33m';  C='\033[0;36m'
W='\033[1;37m';  D='\033[2m';  N='\033[0m'
DM='\033[2;37m'; BW='\033[1;37m'; BC='\033[1;36m'

_OK="$(printf "  ${BG}✓${N}")"; _INF="$(printf "  ${C}◆${N}")"
_WRN="$(printf "  ${Y}⚠${N}")"; _ERR="$(printf "  ${BR}✗${N}")"

# ── Efekt fonksiyonları ────────────────────────────────────────────────────

# Logo satırını kırmızı→sarı→beyaz geçişiyle ortaya çıkar (CRT warmup)
_resolve(){
  local s="$1" c="${2:-$W}"
  printf "  ${R}%s${N}\r" "$s"; sleep 0.055
  printf "  ${Y}%s${N}\r" "$s"; sleep 0.04
  printf "  ${c}%s${N}\n" "$s"
}

# Typewriter: karakter karakter yaz
_type(){
  local s="$1" d="${2:-0.028}" c
  printf "  "
  while IFS= read -rn1 c; do printf "%s" "$c"; sleep "$d"; done <<< "$s"
  printf "\n"
}

# Boot-scan satırı: [TAG]  label....... PASS
_scan(){
  local tag="$1" lbl="$2" ok="${3:-PASS}" col="${4:-$BG}"
  printf "  ${DM}[%-4s]${N}  ${DM}%-26s${N}" "$tag" "$lbl"
  local i=0; while [ $i -lt 4 ]; do printf "${DM}.${N}"; sleep 0.07; i=$((i+1)); done
  printf "  ${col}%s${N}\n" "$ok"
}

# Yüzde sayaçlı ░▒▓ degrade progress bar
_countbar(){
  local lbl="$1" n="${2:-20}" dt="${3:-0.05}"
  local i=0 pct bar="" empty="" j k
  while [ $i -le "$n" ]; do
    pct=$(( i * 100 / n ))
    bar=""; j=0; while [ $j -lt $i ]; do
      if   [ $j -lt $(( n / 3 )) ];       then bar="${bar}░"
      elif [ $j -lt $(( n * 2 / 3 )) ];   then bar="${bar}▒"
      else                                      bar="${bar}▓"
      fi
      j=$((j+1))
    done
    empty=""; k=$i; while [ $k -lt "$n" ]; do empty="${empty} "; k=$((k+1)); done
    printf "\r  ${DM}%-12s${N}  ${BR}[${W}%s${DM}%s${BR}]${N}  ${W}%3d%%${N}" "$lbl" "$bar" "$empty" "$pct"
    sleep "$dt"; i=$((i+1))
  done
  printf "  ${BG}✓${N}\n"
}

# Matrix yağmuru: n satır rastgele hex/blok karakter, sonra temizle
_rain(){
  local rows="${1:-7}" cols="${2:-44}"
  local rc='0123456789ABCDEFabcdef#!|:.~^*%@?<>'
  local rclen=${#rc}
  local i=0 j ci
  while [ $i -lt $rows ]; do
    printf "  ${R}"
    j=0; while [ $j -lt $cols ]; do
      ci=$((RANDOM % rclen))
      printf '%s' "${rc:$ci:1}"
      j=$((j+1))
    done
    printf "${N}\n"
    sleep 0.038
    i=$((i+1))
  done
  sleep 0.1
  # Yukarı çık ve satırları sil
  printf "\033[${rows}A"
  i=0; while [ $i -lt $rows ]; do
    printf "\033[2K\n"
    i=$((i+1))
  done
  printf "\033[${rows}A"
}

# Sinyal çubukları: büyüyen ▁▃▅▇█  READY
_sigbars(){
  local lbl="$1"
  printf "  ${DM}%-14s${N}  " "$lbl"
  sleep 0.20; printf "${DM}▁${N}"
  sleep 0.16; printf "${R}▃${N}"
  sleep 0.13; printf "${Y}▅${N}"
  sleep 0.10; printf "${BG}▇${N}"
  sleep 0.08; printf "${BG}█${N}"
  printf "  ${BG}SIGNAL READY${N}\n"
}

START_TIME="$(date +"%H:%M:%S")"
START_DATE="$(date +"%d.%m.%Y")"

# ── Boot Sequence ──────────────────────────────────────────────────────────
clear 2>/dev/null || true

# Matrix yağmuru: rastgele char sütunları düşüyor, sonra siliniyor
sleep 0.05
_rain 7 44
printf "\n"

# EMOSS ASCII art — CRT warmup
_resolve "  ███████╗███╗   ███╗ ██████╗ ███████╗███████╗" "$BR"
_resolve "  ██╔════╝████╗ ████║██╔═══██╗██╔════╝██╔════╝" "$BR"
_resolve "  █████╗  ██╔████╔██║██║   ██║███████╗███████╗" "$W"
_resolve "  ██╔══╝  ██║╚██╔╝██║██║   ██║╚════██║╚════██║" "$BR"
_resolve "  ███████╗██║ ╚═╝ ██║╚██████╔╝███████║███████║" "$BR"
_resolve "  ╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚══════╝" "$R"

printf "\n"
_type "D E V   T O O L S   B O T   v 2 . 0" 0.022
printf "  ${DM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}\n\n"

# ── Sistem kontrolleri ─────────────────────────────────────────────────────
printf "  ${DM}⟳  starting...${N}"

# .env yükle (sessiz)
if [ -f "$ROOT/.env" ]; then set -a; source "$ROOT/.env" 2>/dev/null; set +a; fi

# Termux tespiti
if [ -d "/data/data/com.termux" ]; then TERMUX=true; else TERMUX=false; fi

# Eski process'leri temizle (sessiz)
pkill -f "php-server.php" 2>/dev/null || true
pkill -f "php-fpm-bridge" 2>/dev/null || true
pkill -f "php-cgi"        2>/dev/null || true
pkill -f "dist/index.mjs" 2>/dev/null || true
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
printf "\r%-40s\r" ""

# PHP
if ! command -v php &>/dev/null; then
  printf "  ${Y}◆${N}  ${DM}installing PHP...${N}\r"
  if [ "$TERMUX" = true ]; then pkg install php -y >/dev/null 2>&1
  else sudo apt-get install -y php-cli >/dev/null 2>&1; fi
  printf "\r%-40s\r" ""
fi
PHP_VER="$(php -r 'echo PHP_VERSION;' 2>/dev/null || echo '?')"

# Node.js
if ! command -v node &>/dev/null; then
  printf "  ${Y}◆${N}  ${DM}installing Node.js...${N}\r"
  if [ "$TERMUX" = true ]; then pkg install nodejs -y >/dev/null 2>&1
  else curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs >/dev/null 2>&1; fi
  printf "\r%-40s\r" ""
fi
NODE_VER="$(node -v 2>/dev/null || echo '?')"

# pnpm
if ! command -v pnpm &>/dev/null; then
  printf "  ${Y}◆${N}  ${DM}installing pnpm...${N}\r"
  npm install -g pnpm >/dev/null 2>&1
  printf "\r%-40s\r" ""
fi
PNPM_VER="$(pnpm -v 2>/dev/null || echo '?')"

# Admin panel build
DIST="$ROOT/artifacts/api-server/dist/index.mjs"
if [ -f "$DIST" ]; then
  DIST_ST="cached"
else
  printf "  ${Y}◆${N}  ${DM}building panel...${N}"
  [ ! -d "$ROOT/node_modules" ] && pnpm install --no-frozen-lockfile >/dev/null 2>&1
  pnpm --filter @workspace/api-server run build >/dev/null 2>&1
  printf "\r%-40s\r" ""
  DIST_ST="built"
fi

# Port ve ortam ayarları
export PORT="${PORT:-3000}"
export BOT_PORT=8000
export NODE_ENV=production
if [ "$TERMUX" = true ]; then OS_STR="Android / Termux"; else OS_STR="Linux"; fi

# ── Sonuçlar: kısa ◆ listesi ──────────────────────────────────────────────
_info(){
  local lbl="$1" val="$2" col="${3:-$W}"
  sleep 0.06
  printf "  ${BG}◆${N}  ${DM}%-10s${N}  ${col}%s${N}\n" "$lbl" "$val"
}
_info "PHP"      "$PHP_VER"
_info "Node"     "$NODE_VER"
_info "pnpm"     "$PNPM_VER"
_info "dist"     "$DIST_ST"   "$C"
_info "ports"    ":${BOT_PORT} + :${PORT}"
_info "platform" "$OS_STR"

# ── Boot bar (yükleme animasyonu) ─────────────────────────────────────────
printf "\n"
sleep 0.12
_countbar "LOADING" 28 0.033
printf "\n"

LOGDIR="${TMPDIR:-$ROOT/.tmp}"
mkdir -p "$LOGDIR"
mkdir -p "$ROOT/telegram-bot/.tmp"
PHP_LOG="$LOGDIR/emoss-php.log"
NODE_LOG="$LOGDIR/emoss-node.log"

# ── SERVİSLER ─────────────────────────────────────────────────────────────
printf "  ${DM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}\n\n"

# ── PHP Bot başlatma ───────────────────────────────────────────────────────

PHP_PID=""

if [ "$TERMUX" = true ]; then
  # Termux: önce php-fpm dene (çok daha hızlı — süreç canlı kalır)
  # Termux'ta php-fpm genellikle /data/data/com.termux/files/usr/sbin/ altındadır
  FPM_BIN="$(command -v php-fpm 2>/dev/null \
    || ls /data/data/com.termux/files/usr/sbin/php-fpm* 2>/dev/null | head -1 \
    || true)"
  if [ -n "$FPM_BIN" ]; then
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
      FPM_PORT=$FPM_SOCK_PORT PORT=8000 node "$ROOT/telegram-bot/php-fpm-bridge.mjs" > "$PHP_LOG" 2>&1 &
      PHP_PID=$!
      USE_FPM=true
    else
      USE_FPM=false
    fi
  else
    USE_FPM=false
  fi

  if [ "$USE_FPM" != true ]; then
    # php-fpm yoksa php-cgi FastCGI modu dene (-b flag — lock sorunu YOK)
    CGI_BIN="$(command -v php-cgi 2>/dev/null \
      || ls /data/data/com.termux/files/usr/bin/php-cgi* 2>/dev/null | head -1 \
      || true)"
    if [ -n "$CGI_BIN" ]; then
      "$CGI_BIN" -b 127.0.0.1:9001 >> "$LOGDIR/php-cgi.log" 2>&1 &
      CGI_PID=$!
      sleep 1
      if kill -0 "$CGI_PID" 2>/dev/null; then
        FPM_PORT=9001 PORT=8000 node "$ROOT/telegram-bot/php-fpm-bridge.mjs" > "$PHP_LOG" 2>&1 &
        PHP_PID=$!
        USE_FPM=true
      fi
    fi
  fi

  if [ "$USE_FPM" != true ]; then
    # Son seçenek: lock-free PHP socket sunucusu (socket_*() flock gerektirmez)
    export PHP_BIN="$(command -v php)"
    PORT=8000 PHP_BIN="$PHP_BIN" php "$ROOT/telegram-bot/php-server.php" > "$PHP_LOG" 2>&1 &
    PHP_PID=$!
  fi

else
  # Linux: php -S normalde çalışır
  PORT=8000 bash "$ROOT/telegram-bot/start.sh" > "$PHP_LOG" 2>&1 &
  PHP_PID=$!
fi

_sigbars "PHP Bot"
if ! kill -0 "$PHP_PID" 2>/dev/null; then
  printf "\r  ${BR}[SVC ]  PHP Bot başlatılamadı!${N}\n"; cat "$PHP_LOG"; exit 1
fi
printf "         ${DM}↳ PID %s${N}\n" "$PHP_PID"

node --enable-source-maps "$ROOT/artifacts/api-server/dist/index.mjs" > "$NODE_LOG" 2>&1 &
NODE_PID=$!

_sigbars "Admin Panel"
if ! kill -0 "$NODE_PID" 2>/dev/null; then
  printf "\r  ${BR}[SVC ]  Admin panel başlatılamadı!${N}\n"; cat "$NODE_LOG"; kill "$PHP_PID" 2>/dev/null; exit 1
fi
printf "         ${DM}↳ PID %s${N}\n\n" "$NODE_PID"

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
      echo "$_OK GitHub webhook güncellendi → $wh_url"
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
    echo "$_OK GitHub webhook güncellendi (mevcut) → $wh_url"
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
    echo "$_OK GitHub webhook oluşturuldu (ID: $nid) → $wh_url"
  else
    echo "$_WRN GitHub webhook oluşturulamadı — GITHUB_TOKEN yetkisini kontrol et"
  fi
}

# ── localhost.run tüneli ───────────────────────────────────────────────────
TUNNEL_LOG="$LOGDIR/emoss-tunnel.log"
TUNNEL_PID=""
TUNNEL_URL=""

if command -v ssh &>/dev/null; then
  printf "  ${DM}[NET ]  connecting tunnel${N}\r"
  ssh -o StrictHostKeyChecking=no \
      -o ServerAliveInterval=30 \
      -o ServerAliveCountMax=3 \
      -R "80:localhost:$PORT" localhost.run \
      > "$TUNNEL_LOG" 2>&1 &
  TUNNEL_PID=$!

  # URL'nin gelmesini bekle (max 20 saniye)
  _SP=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  _si=0
  for i in $(seq 1 40); do
    sleep 0.5
    TUNNEL_URL=$(grep -oE 'https://[a-zA-Z0-9.-]+\.(lhr\.life|lhrtunnel\.link)' "$TUNNEL_LOG" 2>/dev/null | tail -1 || true)
    [ -n "$TUNNEL_URL" ] && break
    printf "\r  ${C}${_SP[$((_si % 10))]}${N}  Tünel bağlanıyor... [%ds]" "$(( i / 2 + 1 ))"
    _si=$(( _si + 1 ))
  done
  printf "\r%-56s\r" ""

  if [ -n "$TUNNEL_URL" ]; then
    _scan "NET " "tunnel established" "${TUNNEL_URL##https://}" "$BG"
    _setup_github_webhook "$TUNNEL_URL"
    CONFIG_FILE="$ROOT/telegram-bot/COMMAND_FILES/DATA_FILE/config.json"
    BOT_TOKEN=""
    if command -v python3 &>/dev/null; then
      BOT_TOKEN=$(python3 -c "import json,sys; d=json.load(open('$CONFIG_FILE')); print(d['bot']['token'])" 2>/dev/null || true)
    fi
    if [ -n "$BOT_TOKEN" ]; then
      WEBHOOK_RESP=$(curl -sf "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${TUNNEL_URL}" 2>/dev/null || true)
      if echo "$WEBHOOK_RESP" | grep -q '"ok":true'; then
        _scan "HOOK" "Telegram webhook set" "PASS" "$BG"
      else
        _scan "HOOK" "webhook update failed" "WARN" "$Y"
      fi
    else
      _scan "HOOK" "token not found" "SKIP" "$DM"
    fi
  else
    _scan "NET " "tunnel URL timeout" "WARN" "$Y"
  fi
else
  _scan "NET " "ssh not found, tunnel skipped" "SKIP" "$DM"
fi

# ── ONLINE kartı ───────────────────────────────────────────────────────────
printf "\n"
# ONLINE kart — satır satır belir
sleep 0.06
printf "  ${BG}╔═══════════════════════════════════════════╗${N}\n"
sleep 0.05; printf "  ${BG}║${N}  ${BG}●${N} ${W}ONLINE${N}                  ${DM}EmossDev v2.0${N}  ${BG}║${N}\n"
sleep 0.04; printf "  ${BG}╠═══════════════════════════════════════════╣${N}\n"
sleep 0.04; printf "  ${BG}║${N}  ${DM}PANEL${N}   ${BC}http://localhost:${PORT}/admin${N}\n"
if [ -n "$TUNNEL_URL" ]; then
  sleep 0.03; printf "  ${BG}║${N}  ${DM}TUNNEL${N}  ${Y}%s${N}\n" "$TUNNEL_URL"
else
  sleep 0.03; printf "  ${BG}║${N}  ${DM}TUNNEL${N}  ${R}not connected${N}\n"
fi
sleep 0.04; printf "  ${BG}╠═══════════════════════════════════════════╣${N}\n"
sleep 0.03; printf "  ${BG}║${N}  ${DM}logs${N}    ${DM}${LOGDIR}/emoss-{node,php}.log${N}\n"
sleep 0.04; printf "  ${BG}╠═══════════════════════════════════════════╣${N}\n"
sleep 0.03; printf "  ${BG}║${N}  ${DM}started ${START_TIME}${N}      ${DM}Ctrl+C → stop${N}\n"
sleep 0.06; printf "  ${BG}╚═══════════════════════════════════════════╝${N}\n"
printf "\n"

# ── Canlı uptime ticker ────────────────────────────────────────────────────
_BOOT_TS=$(date +%s)
(
  while true; do
    sleep 1
    _NOW=$(date +%s)
    _UP=$(( _NOW - _BOOT_TS ))
    _H=$(( _UP / 3600 ))
    _M=$(( (_UP % 3600) / 60 ))
    _S=$(( _UP % 60 ))
    printf "\r  ${BG}●${N} ${DM}running${N}  ${W}%02d:%02d:%02d${N}  ${DM}│${N}  node:${NODE_PID}  php:${PHP_PID}  ${DM}│${N}  ${DM}Ctrl+C → stop${N}   " \
      "$_H" "$_M" "$_S"
  done
) &
_TICKER_PID=$!

cleanup() {
  # Ticker'ı durdur ve satırı temizle
  kill "$_TICKER_PID" 2>/dev/null || true
  printf "\r%-60s\r" ""
  printf "\n\n"
  # Yanıp sönen shutdown animasyonu
  local i=0
  while [ $i -lt 4 ]; do
    printf "\r  ${BR}●${N} ${W}SHUTTING DOWN${N}"; sleep 0.18
    printf "\r  ${R}○${N} ${DM}SHUTTING DOWN${N}"; sleep 0.18
    i=$((i+1))
  done
  printf "\r%-40s\r" ""
  # Uptime hesapla
  local _NOW _UP _H _M _S
  _NOW=$(date +%s); _UP=$(( _NOW - _BOOT_TS ))
  _H=$(( _UP / 3600 )); _M=$(( (_UP % 3600) / 60 )); _S=$(( _UP % 60 ))
  printf "\n"
  printf "  ${BR}╔════════════════════════════════════╗${N}\n"
  printf "  ${BR}║${N}  ${BR}●${N} ${W}OFFLINE${N}            ${DM}EmossDev v2.0${N}  ${BR}║${N}\n"
  printf "  ${BR}╠════════════════════════════════════╣${N}\n"
  printf "  ${BR}║${N}  ${DM}uptime   ${W}%02d:%02d:%02d${N}\n" "$_H" "$_M" "$_S"
  printf "  ${BR}╚════════════════════════════════════╝${N}\n\n"
  kill "$PHP_PID" "$NODE_PID" 2>/dev/null
  [ -n "$TUNNEL_PID" ] && kill "$TUNNEL_PID" 2>/dev/null
  FPM_PID_FILE="$ROOT/telegram-bot/.tmp/php-fpm.pid"
  [ -f "$FPM_PID_FILE" ] && kill "$(cat "$FPM_PID_FILE")" 2>/dev/null || true
  printf "  ${BG}✓${N}  ${DM}bye!${N}\n\n"
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
    echo "$_OK Webhook otomatik güncellendi: ${new_url}"
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
    echo "$_WRN Webhook güncellenemedi: $WEBHOOK_RESP"
  fi
}

_restart_php(){
  echo "$_INF PHP Bot yeniden başlatılıyor..."
  pkill -f "php-server.php" 2>/dev/null || true
  sleep 1
  export PHP_BIN="$(command -v php)"
  PORT=8000 PHP_BIN="$PHP_BIN" php "$ROOT/telegram-bot/php-server.php" > "$PHP_LOG" 2>&1 &
  PHP_PID=$!
  sleep 1
  if kill -0 "$PHP_PID" 2>/dev/null; then
    echo "$_OK PHP Bot yeniden başlatıldı (PID: $PHP_PID)"
  else
    echo "$_WRN PHP Bot yeniden başlatılamadı"
  fi
}

_restart_node(){
  echo "$_INF Admin Panel yeniden başlatılıyor..."
  sleep 1
  node --enable-source-maps "$ROOT/artifacts/api-server/dist/index.mjs" > "$NODE_LOG" 2>&1 &
  NODE_PID=$!
  sleep 1
  if kill -0 "$NODE_PID" 2>/dev/null; then
    echo "$_OK Admin Panel yeniden başlatıldı (PID: $NODE_PID)"
  else
    echo "$_WRN Admin Panel yeniden başlatılamadı"
  fi
}

while true; do
  sleep 5

  # ── Tünel URL izle ───────────────────────────────────────────────────────
  if [ -n "$TUNNEL_PID" ] && [ -f "$TUNNEL_LOG" ]; then
    NEW_URL=$(grep -oE 'https://[a-zA-Z0-9.-]+\.(lhr\.life|lhrtunnel\.link)' "$TUNNEL_LOG" 2>/dev/null | tail -1 || true)
    if [ -n "$NEW_URL" ] && [ "$NEW_URL" != "$_LAST_URL" ]; then
      echo "$_INF Tünel URL'si değişti: $NEW_URL"
      _LAST_URL="$NEW_URL"
      _update_webhook "$NEW_URL"
      _setup_github_webhook "$NEW_URL"
    fi
  fi

  # ── PHP Watchdog ─────────────────────────────────────────────────────────
  if ! kill -0 "$PHP_PID" 2>/dev/null; then
    echo "$_WRN PHP Bot kapandı — watchdog devreye girdi"
    _restart_php
  fi

  # ── Node Watchdog ────────────────────────────────────────────────────────
  if ! kill -0 "$NODE_PID" 2>/dev/null; then
    echo "$_WRN Admin Panel kapandı — watchdog devreye girdi"
    _restart_node
  fi
done
