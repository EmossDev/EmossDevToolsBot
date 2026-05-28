#!/data/data/com.termux/files/usr/bin/bash

echo "================================"
echo "  EmossDevToolsBot - Kurulum"
echo "================================"
echo ""

echo "[1/3] Paketler guncelleniyor..."
pkg update -y 2>/dev/null

echo "[2/3] PHP ve curl kuruluyor..."
pkg install php curl -y

echo "[3/3] Izinler ayarlaniyor..."
chmod +x run-termux.sh

echo ""
echo "[OK] Kurulum tamamlandi!"
echo ""
echo "Botu baslatmak icin:"
echo "  bash run-termux.sh"
echo ""
