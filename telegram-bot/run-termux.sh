#!/data/data/com.termux/files/usr/bin/bash

cd "$(dirname "$0")"

echo "==============================="
echo "  EmossDevToolsBot - Termux"
echo "==============================="
echo ""

if ! command -v php &>/dev/null; then
    echo "[*] PHP bulunamadi, kuruluyor..."
    pkg install php -y
fi

if ! command -v curl &>/dev/null; then
    echo "[*] curl bulunamadi, kuruluyor..."
    pkg install curl -y
fi

TOKEN=$(php -d display_errors=0 -r "echo json_decode(file_get_contents('COMMAND_FILES/DATA_FILE/config.json'))->bot->token;")

if [ -z "$TOKEN" ]; then
    echo "[HATA] Token alinamadi. config.json dosyasini kontrol et."
    exit 1
fi

echo "[*] Webhook siliniyor..."
curl -s "https://api.telegram.org/bot$TOKEN/deleteWebhook?drop_pending_updates=true" > /dev/null
echo "[OK] Bot polling modunda baslatiliyor..."
echo "[*] Durdurmak icin: Ctrl+C"
echo ""

OFFSET=0

while true; do
    RESPONSE=$(curl -s --max-time 35 "https://api.telegram.org/bot$TOKEN/getUpdates?offset=$OFFSET&timeout=30&allowed_updates=message,callback_query,my_chat_member" 2>/dev/null)

    if [ -z "$RESPONSE" ]; then
        sleep 2
        continue
    fi

    UPDATES=$(echo "$RESPONSE" | php -d display_errors=0 -r "
        \$data = json_decode(file_get_contents('php://stdin'), true);
        if (!empty(\$data['result'])) {
            foreach (\$data['result'] as \$u) {
                echo json_encode(\$u) . PHP_EOL;
            }
        }
    " 2>/dev/null)

    if [ -n "$UPDATES" ]; then
        while IFS= read -r update; do
            [ -z "$update" ] && continue
            OFFSET=$(echo "$update" | php -d display_errors=0 -r "\$u=json_decode(file_get_contents('php://stdin'),true); echo \$u['update_id']+1;" 2>/dev/null)
            echo "$update" | php -d display_errors=0 index.php 2>/dev/null
        done <<< "$UPDATES"
    fi
done
