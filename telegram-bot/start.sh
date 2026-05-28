#!/bin/bash
cd /home/runner/workspace/telegram-bot
PORT=${PORT:-8000}
exec php -S 0.0.0.0:$PORT -t /home/runner/workspace/telegram-bot router.php
