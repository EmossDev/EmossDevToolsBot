#!/usr/bin/env node
// PHP CGI köprüsü — php -S ve php-cgi yerine kullanılır (lock mekanizması yok)
// Her HTTP isteğini "php router.php" CLI ile çalıştırır

import http from 'http';
import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '8000');

const server = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks);

    // CGI ortam değişkenlerini ayarla
    const env = {
      ...process.env,
      REQUEST_METHOD:    req.method || 'GET',
      SCRIPT_FILENAME:   resolve(__dir, 'router.php'),
      SCRIPT_NAME:       '/router.php',
      REQUEST_URI:       req.url || '/',
      QUERY_STRING:      req.url?.includes('?') ? req.url.split('?').slice(1).join('?') : '',
      CONTENT_TYPE:      req.headers['content-type'] || '',
      CONTENT_LENGTH:    String(body.length),
      HTTP_HOST:         req.headers['host'] || 'localhost',
      SERVER_NAME:       'localhost',
      SERVER_PORT:       String(PORT),
      SERVER_PROTOCOL:   'HTTP/1.1',
      GATEWAY_INTERFACE: 'CGI/1.1',
      REDIRECT_STATUS:   '200',
      DOCUMENT_ROOT:     __dir,
    };

    for (const [k, v] of Object.entries(req.headers)) {
      env['HTTP_' + k.toUpperCase().replace(/-/g, '_')] = v;
    }

    // Düz php CLI kullan — php-cgi/php-S lock mekanizması yok
    const phpBin = process.env.PHP_BIN || 'php';
    const php = spawn(phpBin, ['router.php'], { cwd: __dir, env });

    if (body.length > 0) php.stdin.write(body);
    php.stdin.end();

    let out = Buffer.alloc(0);
    php.stdout.on('data', c => { out = Buffer.concat([out, c]); });

    php.stdout.on('end', () => {
      const str = out.toString('binary');
      // HTTP header bloğunu bul
      const sep4 = str.indexOf('\r\n\r\n');
      const sep2 = str.indexOf('\n\n');
      const sepIdx = sep4 !== -1 ? sep4 : sep2;

      if (sepIdx === -1) {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(out);
        return;
      }

      const rawHeaders = str.substring(0, sepIdx);
      const bodyStart  = sepIdx + (sep4 !== -1 ? 4 : 2);
      const bodyBuf    = out.slice(bodyStart);

      let status = 200;
      const headers = {};
      for (const line of rawHeaders.split(/\r?\n/)) {
        if (!line.trim()) continue;
        if (/^status:/i.test(line)) {
          status = parseInt(line.split(':')[1]) || 200;
          continue;
        }
        const ci = line.indexOf(':');
        if (ci > 0) {
          headers[line.substring(0, ci).trim().toLowerCase()] = line.substring(ci + 1).trim();
        }
      }

      res.writeHead(status, headers);
      res.end(bodyBuf);
    });

    php.stderr.on('data', d => process.stderr.write(d));
    php.on('error', err => {
      if (!res.headersSent) { res.writeHead(500); res.end('PHP hata: ' + err.message); }
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[php-bridge] port ${PORT} dinleniyor (php-cgi CGI modu)`);
});
