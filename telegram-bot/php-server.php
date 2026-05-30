<?php
/**
 * Lock-free PHP HTTP sunucusu — MIUI flock() sorunu bypass
 * php -S ve php-cgi -b yerine kullanılır; socket_*() lock gerektirmez
 * Her istek için proc_open ile php CLI spawn eder (mevcut bridge mantığı)
 * ama Node.js overhead olmadan, daha hafif
 */

$port = (int)(getenv('PORT') ?: 8000);
$root = __DIR__;
$tmpDir = $root . '/.tmp';

if (!is_dir($tmpDir)) mkdir($tmpDir, 0755, true);

// PHP yolu
$phpBin = getenv('PHP_BIN') ?: trim(shell_exec('command -v php 2>/dev/null') ?: '');
if (!$phpBin) $phpBin = 'php';

// Socket oluştur — lock YOK, sadece ağ soketi
$sock = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
if ($sock === false) {
    fwrite(STDERR, "[php-server] socket_create başarısız: " . socket_strerror(socket_last_error()) . "\n");
    exit(1);
}
socket_set_option($sock, SOL_SOCKET, SO_REUSEADDR, 1);
if (!socket_bind($sock, '0.0.0.0', $port)) {
    fwrite(STDERR, "[php-server] Bind hatası: " . socket_strerror(socket_last_error()) . "\n");
    exit(1);
}
socket_listen($sock, 10);

fwrite(STDOUT, "[php-server] port $port dinleniyor (lock-free)\n");

// ── Ana döngü ─────────────────────────────────────────────────────────────
while (true) {
    $client = @socket_accept($sock);
    if ($client === false) { usleep(1000); continue; }

    // İsteği oku
    $raw = '';
    socket_set_option($client, SOL_SOCKET, SO_RCVTIMEO, ['sec' => 0, 'usec' => 500000]); // 500ms
    $contentLength = -1;
    $headerDone = false;

    while (true) {
        $buf = @socket_read($client, 8192, PHP_BINARY_READ);
        if ($buf === false || $buf === '') break;
        $raw .= $buf;

        if (!$headerDone && ($p = strpos($raw, "\r\n\r\n")) !== false) {
            $headerDone = true;
            $headerPart = substr($raw, 0, $p);
            if (preg_match('/content-length:\s*(\d+)/i', $headerPart, $m)) {
                $contentLength = (int)$m[1];
            } else {
                $contentLength = 0;
            }
        }

        if ($headerDone) {
            $bodyStart = strpos($raw, "\r\n\r\n") + 4;
            $bodyRead  = strlen($raw) - $bodyStart;
            if ($bodyRead >= $contentLength) break;
        }
    }

    if (!$headerDone) { socket_close($client); continue; }

    $headerEnd = strpos($raw, "\r\n\r\n");
    $body = substr($raw, $headerEnd + 4);

    // Request bilgileri çıkar
    $firstLine = strtok(substr($raw, 0, $headerEnd), "\r\n");
    $parts = explode(' ', $firstLine, 3);
    $method = $parts[0] ?? 'GET';
    $uri    = $parts[1] ?? '/';
    $qs     = strpos($uri, '?') !== false ? substr($uri, strpos($uri, '?') + 1) : '';
    $contentType = '';
    if (preg_match('/content-type:\s*([^\r\n]+)/i', $raw, $m)) {
        $contentType = trim($m[1]);
    }

    // Body'yi temp dosyaya yaz
    $tmpFile = $tmpDir . '/req_' . bin2hex(random_bytes(8)) . '.json';
    file_put_contents($tmpFile, $body);

    // CGI ortam değişkenleri
    $env = array_merge(getenv() ?: [], [
        'REQUEST_METHOD'    => $method,
        'REQUEST_URI'       => $uri,
        'QUERY_STRING'      => $qs,
        'CONTENT_TYPE'      => $contentType,
        'CONTENT_LENGTH'    => (string)strlen($body),
        'SCRIPT_FILENAME'   => $root . '/router.php',
        'SCRIPT_NAME'       => '/router.php',
        'DOCUMENT_ROOT'     => $root,
        'SERVER_NAME'       => 'localhost',
        'SERVER_PORT'       => (string)$port,
        'SERVER_PROTOCOL'   => 'HTTP/1.1',
        'GATEWAY_INTERFACE' => 'CGI/1.1',
        'REDIRECT_STATUS'   => '200',
        'BRIDGE_INPUT_FILE' => $tmpFile,
        'TMPDIR'            => $tmpDir,
        'TMP'               => $tmpDir,
        'TEMP'              => $tmpDir,
    ]);

    // php-cgi/php-fpm gibi header parse etmek için header'ları env'e ekle
    foreach (explode("\r\n", substr($raw, 0, $headerEnd)) as $line) {
        if (strpos($line, ':') === false) continue;
        [$k, $v] = explode(':', $line, 2);
        $envKey = 'HTTP_' . strtoupper(str_replace('-', '_', trim($k)));
        $env[$envKey] = trim($v);
    }

    // ── 200 OK HEMEN dön ──────────────────────────────────────────────────
    $ack = "HTTP/1.1 200 OK\r\nContent-Length: 0\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\n";
    socket_write($client, $ack, strlen($ack));
    socket_close($client);

    // ── İşleme: fork varsa fork, yoksa proc_open ──────────────────────────
    if (function_exists('pcntl_fork')) {
        // Zombie reap — önceki tamamlanmış çocukları temizle
        pcntl_waitpid(-1, $_st, WNOHANG);

        $pid = pcntl_fork();
        if ($pid === -1) {
            // Fork başarısız → proc_open'a düş
            goto spawn;
        }
        if ($pid === 0) {
            // ── ÇOCUK süreç ───────────────────────────────────────────────
            socket_close($sock); // sunucu soketini kapat
            // Env'i yükle — putenv + $_SERVER + $_ENV hepsini doldur
            foreach ($env as $k => $v) {
                putenv("$k=$v");
                $_SERVER[$k] = $v;
                $_ENV[$k]    = $v;
            }
            chdir($root);
            $errLog = $root . '/.tmp/php-error.log';
            ini_set('error_log', $errLog);
            ini_set('display_errors', '0');
            error_reporting(E_ALL);
            file_put_contents($errLog, date('[H:i:s] ') . "fork child başladı, tmpFile=$tmpFile\n", FILE_APPEND);
            // Çıktıyı sustur (bot() zaten Telegram API'yi kendisi çağırır)
            ob_start();
            include $root . '/router.php';
            ob_end_clean();
            file_put_contents($errLog, date('[H:i:s] ') . "fork child bitti\n", FILE_APPEND);
            @unlink($tmpFile);
            exit(0);
        }
        // ── ANA süreç — sonraki bağlantıya geç ───────────────────────────
        continue;
    }

    spawn:
    // proc_open fallback (fork yoksa)
    $descriptor = [['pipe', 'r'], ['pipe', 'w'], STDERR];
    $proc = proc_open(
        $phpBin . ' -d display_errors=Off ' . escapeshellarg($root . '/router.php'),
        $descriptor, $pipes, $root, $env
    );
    fclose($pipes[0]);
    stream_get_contents($pipes[1]);
    fclose($pipes[1]);
    proc_close($proc);
    @unlink($tmpFile);
}
