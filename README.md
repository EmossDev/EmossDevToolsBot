```
  ███████╗███╗   ███╗ ██████╗ ███████╗███████╗
  ██╔════╝████╗ ████║██╔═══██╗██╔════╝██╔════╝
  █████╗  ██╔████╔██║██║   ██║███████╗███████╗
  ██╔══╝  ██║╚██╔╝██║██║   ██║╚════██║╚════██║
  ███████╗██║ ╚═╝ ██║╚██████╔╝███████║███████║
  ╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚══════╝
              D E V   T O O L S   B O T
```

<div align="center">

**PHP tabanlı Telegram grup yönetim botu — Termux (Android) üzerinde 7/24 çalışır.**

![PHP](https://img.shields.io/badge/PHP-8.x-777BB4?style=flat-square&logo=php&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-26-5FA04E?style=flat-square&logo=node.js&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram-Bot_API-26A5E4?style=flat-square&logo=telegram&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Termux%20%2F%20Android-black?style=flat-square)

</div>

---

## Özellikler

| Kategori | Komutlar |
|----------|----------|
| **Kullanıcı** | Instagram, IP tarama, bilgi sorgulama, verify, rapor |
| **Admin** | Uyar, kilitle, filtrele, flood koruma, banlı liste, pin |
| **Bot** | Ayarlar, karakter kontrolleri, font yönetimi |
| **Geliştirici** | Veritabanı, SMS gönderme, disable, mesaj silme |

## Mimari

```
EmossDevToolsBot/
├── telegram-bot/
│   ├── index.php            ← Bot ana dosyası (webhook handler)
│   ├── router.php           ← Komut yönlendirici
│   ├── php-server.php       ← Lock-free socket sunucusu (MIUI uyumlu)
│   ├── php-bridge.mjs       ← Node→PHP köprüsü
│   └── COMMAND_FILES/       ← Komut modülleri
│       ├── ADMIN_COMMANDS/
│       ├── USER_COMMANDS/
│       ├── BOT_COMMANDS/
│       └── DATA_FILE/       ← config.json (token, webhook URL)
├── artifacts/
│   └── api-server/          ← Express 5 Admin Panel (TypeScript)
│       └── dist/            ← Pre-built, commit'li
└── start-local.sh           ← Termux başlatma scripti
```

## Kurulum & Çalıştırma

### Gereksinimler

- Termux (Android)
- PHP 8.x (`pkg install php`)
- Node.js 20+ (`pkg install nodejs`)
- pnpm (`npm i -g pnpm`)

### Başlatma

```bash
# Repoyu klonla
git clone https://github.com/EmossDev/EmossDevToolsBot.git
cd EmossDevToolsBot

# Çalıştır
bash start-local.sh
```

Boot sırasında şunlar otomatik yapılır:

- PHP Bot başlatılır → `:8000`
- Admin Panel başlatılır → `:3000/admin`
- localhost.run tüneli açılır
- Telegram webhook otomatik güncellenir

### Yapılandırma

`telegram-bot/COMMAND_FILES/DATA_FILE/config.json` dosyasını düzenle:

```json
{
  "token": "BOT_TOKEN_BURAYA",
  "webhookUrl": "https://xxxx.lhr.life",
  "databaseUrl": "mongodb+srv://..."
}
```

## Teknik Notlar

**MIUI `flock()` yasağı** — `php -S`, `php-cgi -b`, `php-fpm` hepsi `Cannot create lock` hatasıyla çöküyor. `php-server.php` bu sorunu `socket_*()` API'si kullanarak (lock gerektirmez) çözüyor.

**`php://input` CLI'da çalışmıyor** — Webhook body'si temp dosyaya yazılır, `BRIDGE_INPUT_FILE` env var ile PHP'ye iletilir.

**Async 200 OK** — PHP işlemesi bitmeden 200 döner, aksi takdirde Telegram aynı güncellemeyi tekrar gönderir.

**Pre-built dist** — `artifacts/api-server/dist/` repo'da commit'li. Termux'ta `npm install` / `build` adımı atlanır.

## Stack

- **PHP 8.x** — Telegram Bot API, webhook işleme
- **Node.js 26 + TypeScript 5.9** — Admin Panel (Express 5)
- **pnpm workspaces** — monorepo yönetimi
- **esbuild** — hızlı TypeScript build
- **localhost.run** — tünel (ücretsiz, kayıt gerektirmez)

---

<div align="center">
<sub>EmossDev · Termux'ta çalışır · 7/24</sub>
</div>
