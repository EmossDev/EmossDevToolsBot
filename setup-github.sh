#!/bin/bash
# GitHub push kurulumu - her Replit oturumunda bir kez çalıştır

if [ -z "$GITHUB_TOKEN" ]; then
  echo "[HATA] GITHUB_TOKEN secret'ı bulunamadı."
  echo "Replit'te Secrets sekmesinden GITHUB_TOKEN'ı ekle."
  exit 1
fi

git remote set-url github "https://EmossDev:${GITHUB_TOKEN}@github.com/EmossDev/EmossDevToolsBot.git"
git config user.email "bot@emossdev.com"
git config user.name "EmossDev"

echo "[OK] GitHub bağlantısı hazır!"
echo "[*] Artık 'git push github main --force' komutunu kullanabilirsin."
