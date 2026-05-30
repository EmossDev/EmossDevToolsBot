# EmossDev Tools Bot

PHP tabanlı Telegram botu — Termux (Android) üzerinde 7/24 çalışır.

## Çalıştırma

### Termux (Ana ortam)
```bash
bash start-local.sh
```
- PHP Bot: `http://localhost:8000`
- Admin Panel: `http://localhost:3000/admin`
- Loglar: `tail -f $TMPDIR/emoss-php.log`

### GitHub'a push
```bash
bash setup-github.sh && git push github main
```

## Mimari

- **PHP Bot** (`telegram-bot/`) — Telegram webhook'larını işler
- **Admin Panel** (`artifacts/api-server/`) — Express 5 API + yönetim arayüzü
- **PHP Sunucu** — `php-server.php` (lock-free socket sunucusu, MIUI uyumlu)
- **Webhook** — localhost.run tüneli üzerinden Telegram'a bağlanır

## Stack

- PHP 8.5 (bot), Node.js 26, TypeScript 5.9
- pnpm workspaces, Express 5, esbuild
- Telegram Bot API (webhook modu)

## Önemli Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `start-local.sh` | Termux başlatma scripti |
| `telegram-bot/php-server.php` | Lock-free PHP HTTP sunucusu |
| `telegram-bot/index.php` | Bot ana dosyası |
| `telegram-bot/COMMAND_FILES/DATA_FILE/config.json` | Bot token, webhook URL |
| `artifacts/api-server/dist/` | Pre-built panel (build atlanır) |

## Gotchas

- **MIUI flock() yasağı**: `php -S`, `php-cgi -b`, `php-fpm` hepsi "Cannot create lock" hatası verir. Çözüm: `php-server.php` (socket_*() kullanır, lock yok)
- **php://input CLI'da çalışmaz**: Body temp dosyaya yazılır, `BRIDGE_INPUT_FILE` env var ile PHP'ye iletilir
- **MongoDB URL**: `config.json`'daki `databaseUrl` HTTP URL değil, mongodb+srv:// — `file_get_contents` ile kullanılamaz; `$onlinePhishing = ""` sabitlenmiş
- **Webhook 200 OK**: PHP işlemesi bitmeden 200 döner (async), aksi halde Telegram retry yapar
- **Pre-built dist**: `artifacts/api-server/dist/` commit'li — Termux'ta build/install atlanır

## User preferences

- Render kullanılmıyor, sadece Termux
- Webhook: localhost.run tüneli
