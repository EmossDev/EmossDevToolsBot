---
name: PHP CLI stdin sorunu
description: PHP CLI modunda php://input stdin'den okumaz — body kaybolur
---

**Kural:** `file_get_contents('php://input')` PHP CLI SAPI'sinde güvenilir çalışmaz; body boş döner.

**Why:** CLI SAPI'de `php://input` web server SAPI'sinden farklı davranır. Node.js bridge veya socket server üzerinden spawn edilen PHP süreçlerinde stdin pipe'dan okuma çalışmaz.

**How to apply:** Body'yi temp dosyaya yaz, `BRIDGE_INPUT_FILE` env var'ı ile PHP'ye ilet:
```php
$_bridge_file = getenv('BRIDGE_INPUT_FILE');
$update_all = ($_bridge_file && file_exists($_bridge_file))
    ? file_get_contents($_bridge_file)
    : file_get_contents('php://input');
```
