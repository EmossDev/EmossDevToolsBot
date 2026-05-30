---
name: MIUI PHP lock bypass
description: MIUI flock() syscall'ını engeller — php -S, php-cgi -b, php-fpm hepsi başarısız olur
---

**Kural:** Xiaomi MIUI'da `php -S`, `php-cgi -b 127.0.0.1:9000`, `php-fpm` hepsi `Cannot create lock - Permission denied (13)` hatası verir.

**Why:** MIUI SELinux politikaları `flock()` syscall'ını engeller. PHP'nin built-in sunucusu ve FastCGI process manager'ları worker koordinasyonu için file lock kullanır.

**How to apply:** `telegram-bot/php-server.php` kullan — PHP'nin `socket_create()`, `socket_bind()`, `socket_listen()`, `socket_accept()` fonksiyonları file lock kullanmaz, sadece network socket syscall'ları.
