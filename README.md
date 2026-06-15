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

**PHP tabanlı Telegram grup yönetim botu + web admin paneli**  
Termux (Android) üzerinde 7/24 çalışır — tünel, webhook, panel otomatik.

![PHP](https://img.shields.io/badge/PHP-8.x-777BB4?style=flat-square&logo=php&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-26-5FA04E?style=flat-square&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram-Bot_API-26A5E4?style=flat-square&logo=telegram&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Termux%20%2F%20Android-black?style=flat-square)

</div>

---

## Nedir?

**EmossDev Tools Bot**, Telegram gruplarını yönetmek için geliştirilmiş bir araç setidir.  
İki bileşenden oluşur:

| Bileşen | Teknoloji | Adres |
|---------|-----------|-------|
| **Telegram Bot** | PHP 8.x, Webhook | `localhost:8000` |
| **Web Admin Paneli** | Node.js, Express 5, TypeScript | `localhost:3000/admin` |

### Web Admin Paneli

Tarayıcıdan açılan kontrol merkezi. Bot ayarlarını, webhook durumunu ve servis loglarını gösterir. Termux'ta çalışırken `localhost:3000/admin` adresinden veya localhost.run tüneli üzerinden herhangi bir cihazdan erişilebilir.

---

## Bot Komutları

| Kategori | İçerik |
|----------|--------|
| **Kullanıcı** | Instagram bilgi, IP tarama, verify, rapor, online phishing |
| **Admin** | Uyar, kilitle, flood koruma, filtrele, banlı liste, pin, mesaj sil |
| **Bot** | Karakter kontrolleri, font yönetimi, bot ayarları |
| **Geliştirici** | Veritabanı, SMS gönderme, disable, icon yönetimi |

---

## Kurulum

### Gereksinimler

```
Termux (Android)  ·  PHP 8.x  ·  Node.js 20+  ·  pnpm
```

```bash
pkg install php nodejs
npm i -g pnpm
```

### İlk Çalıştırma

```bash
git clone https://github.com/EmossDev/EmossDevToolsBot.git
cd EmossDevToolsBot
bash start-local.sh
```

### Boot Akışı

```
bash start-local.sh
  │
  ├─▶  sistem kontrol  (PHP · Node · pnpm · dist)
  ├─▶  PHP Bot          →  :8000
  ├─▶  Admin Panel      →  :3000/admin
  ├─▶  localhost.run    →  https://xxxx.lhr.life
  ╰─▶  Telegram webhook set  ✓
```

Tünel URL'si değişirse webhook **otomatik güncellenir** — elle müdahale gerekmez.

### Yapılandırma

`telegram-bot/COMMAND_FILES/DATA_FILE/config.json`:

```json
{
  "token": "BOT_TOKEN_BURAYA",
  "webhookUrl": "https://xxxx.lhr.life",
  "databaseUrl": "mongodb+srv://..."
}
```

---

## Mimari

```
EmossDevToolsBot/
├── telegram-bot/
│   ├── index.php              ← Webhook handler
│   ├── router.php             ← Komut yönlendirici
│   ├── php-server.php         ← Lock-free socket sunucusu
│   ├── php-bridge.mjs         ← Node → PHP köprüsü
│   └── COMMAND_FILES/
│       ├── ADMIN_COMMANDS/
│       ├── USER_COMMANDS/
│       ├── BOT_COMMANDS/
│       └── DATA_FILE/         ← config.json
├── artifacts/
│   └── api-server/            ← Web Admin Paneli (Express 5 + TypeScript)
│       └── dist/              ← Pre-built, commit'li
└── start-local.sh             ← Termux başlatma scripti
```

---

## Teknik Notlar

**MIUI `flock()` yasağı** — `php -S`, `php-cgi`, `php-fpm` Android/MIUI'da `Cannot create lock` hatasıyla çöküyor. `php-server.php` bunu `socket_*()` API'siyle (lock gerektirmez) aşıyor.

**`php://input` CLI'da çalışmıyor** — Webhook body temp dosyaya yazılır, `BRIDGE_INPUT_FILE` env var üzerinden PHP'ye iletilir.

**Async 200 OK** — PHP işlemesi bitmeden 200 döner, aksi takdirde Telegram aynı güncellemeyi yeniden gönderir.

**Pre-built dist** — `artifacts/api-server/dist/` commit'li. Termux'ta `npm install` / `build` adımı atlanır, `node dist/index.mjs` direkt çalışır.

---

## Stack

| | |
|-|-|
| **PHP 8.x** | Telegram Bot API, webhook işleme |
| **Node.js 26 + TypeScript 5.9** | Web Admin Paneli (Express 5) |
| **pnpm workspaces** | Monorepo yönetimi |
| **esbuild** | TypeScript build |
| **localhost.run** | Ücretsiz tünel, kayıt gerektirmez |

---

<div align="center">
<sub>EmossDev · Termux'ta çalışır · 7/24</sub>
</div>
