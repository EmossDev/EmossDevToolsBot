---
name: Telegram webhook async pattern
description: Webhook 200 OK anında dönmeli, işlem arka planda olmalı
---

**Kural:** Telegram webhook handler'ı 200 OK'ı PHP işlemesi bitmeden hemen göndermelidir.

**Why:** PHP bot işlemesi + Telegram API çağrısı 2-4 saniye sürebilir. Eğer 200 OK işlem bittikten sonra dönerse kullanıcı gecikme hisseder ve Telegram retry mekanizması tetiklenebilir.

**How to apply:** `php-server.php`'de bağlantıyı kabul edince önce 200 OK gönder, soketi kapat, sonra `proc_open` ile PHP'yi spawn et:
```php
socket_write($client, "HTTP/1.1 200 OK\r\nContent-Length: 0\r\nConnection: close\r\n\r\n");
socket_close($client);
// Sonra PHP spawn et
$proc = proc_open($phpBin . ' router.php', ...);
```
