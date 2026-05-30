# Yerel Kurulum Rehberi (Termux / Linux)

## Gereksinimler

| Araç | Termux | Linux |
|------|--------|-------|
| PHP | `pkg install php` | `sudo apt install php-cli` |
| Node.js 22 | `pkg install nodejs` | NodeSource repo |
| pnpm | `npm install -g pnpm` | `npm install -g pnpm` |

> Script bunları otomatik kurar, elle kurman gerekmiyor.

---

## Hızlı Başlangıç

### 1. Repoyu klonla

```bash
git clone https://github.com/EmossDev/EmossDevToolsBot.git
cd EmossDevToolsBot
```

### 2. (Opsiyonel) `.env` dosyası oluştur

```bash
cp .env.example .env
# nano .env  →  PORT vs. ayarla
```

Zorunlu değil — varsayılan ayarlarla çalışır.

### 3. Başlat

```bash
bash start-local.sh
```

İlk çalıştırmada bağımlılıkları indirir ve derler (~1-2 dakika).

---

## Adresler

| Servis | URL |
|--------|-----|
| Admin Panel | http://localhost:3000/admin |
| PHP Bot (webhook endpoint) | http://localhost:8000 |

---

## Loglar

```bash
tail -f /tmp/emoss-node.log   # Admin Panel logları
tail -f /tmp/emoss-php.log    # PHP Bot logları
```

---

## Bot Token & Config

Bot ayarları `telegram-bot/COMMAND_FILES/DATA_FILE/config.json` dosyasında:

```json
{
  "bot": {
    "token": "BOT_TOKEN_BURAYA",
    "webhookUrl": "https://SENİN_PUBLIC_URL/bot/"
  }
}
```

Yerelde webhook çalışması için public bir URL gerekir.
[ngrok](https://ngrok.com) veya [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) kullanabilirsin:

```bash
# ngrok ile public URL al
ngrok http 8000

# Sonra /admin panelinden webhook'u güncelle
```

---

## Sadece Admin Paneli Çalıştırmak

PHP bot olmadan sadece paneli başlatmak istersen:

```bash
pnpm install --no-frozen-lockfile
pnpm --filter @workspace/api-server run build
PORT=3000 node artifacts/api-server/dist/index.mjs
```

---

## Render.com'a Deploy

Repo'yu GitHub'a push ettikten sonra Render otomatik deploy eder.

```bash
bash setup-github.sh          # Her Replit oturumunda bir kez
git push github main --force
```

---

## Sorun Giderme

**`pnpm: command not found`**
```bash
npm install -g pnpm
```

**PHP bot başlamıyor**
```bash
cat /tmp/emoss-php.log
```

**Node panel başlamıyor**
```bash
cat /tmp/emoss-node.log
```

**Port zaten kullanımda**
```bash
PORT=4000 bash start-local.sh
```
