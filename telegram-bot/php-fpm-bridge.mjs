#!/usr/bin/env node
// FastCGI köprüsü — php-fpm ile konuşur, her istekte yeni süreç YOK
// Kullanım: FPM_HOST=127.0.0.1 FPM_PORT=9000 PORT=8000 node php-fpm-bridge.mjs

import http from 'http';
import net  from 'net';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, unlinkSync } from 'fs';
import { randomBytes } from 'crypto';

const __dir   = dirname(fileURLToPath(import.meta.url));
const PORT    = parseInt(process.env.PORT    || '8000');
const FPM_HOST = process.env.FPM_HOST       || '127.0.0.1';
const FPM_PORT = parseInt(process.env.FPM_PORT || '9000');

// ── FastCGI sabitleri ──────────────────────────────────────────────────────
const FCGI_VERSION      = 1;
const FCGI_BEGIN_REQUEST = 1;
const FCGI_PARAMS       = 4;
const FCGI_STDIN        = 5;
const FCGI_STDOUT       = 6;
const FCGI_END_REQUEST  = 3;
const FCGI_RESPONDER    = 1;
const REQ_ID            = 1;

function fcgiRecord(type, body) {
  const hdr = Buffer.alloc(8);
  hdr[0] = FCGI_VERSION;
  hdr[1] = type;
  hdr.writeUInt16BE(REQ_ID, 2);
  hdr.writeUInt16BE(body.length, 4);
  hdr[6] = 0; // padding
  hdr[7] = 0;
  return Buffer.concat([hdr, body]);
}

function encodeLen(n) {
  if (n <= 127) { const b = Buffer.alloc(1); b[0] = n; return b; }
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n | 0x80000000, 0);
  return b;
}

function encodeParams(params) {
  const parts = [];
  for (const [k, v] of Object.entries(params)) {
    const kb = Buffer.from(k), vb = Buffer.from(String(v));
    parts.push(encodeLen(kb.length), encodeLen(vb.length), kb, vb);
  }
  return Buffer.concat(parts);
}

function buildFcgiRequest(params, body) {
  // BEGIN_REQUEST
  const beginBody = Buffer.alloc(8);
  beginBody.writeUInt16BE(FCGI_RESPONDER, 0);
  beginBody[2] = 0; // flags: 0 = kapat

  const frames = [fcgiRecord(FCGI_BEGIN_REQUEST, beginBody)];

  // PARAMS (1 veya birden fazla çerçeve)
  const paramBuf = encodeParams(params);
  if (paramBuf.length > 0) frames.push(fcgiRecord(FCGI_PARAMS, paramBuf));
  frames.push(fcgiRecord(FCGI_PARAMS, Buffer.alloc(0))); // params bitti

  // STDIN
  if (body.length > 0) frames.push(fcgiRecord(FCGI_STDIN, body));
  frames.push(fcgiRecord(FCGI_STDIN, Buffer.alloc(0))); // stdin bitti

  return Buffer.concat(frames);
}

function parseFcgiResponse(data) {
  let stdout = Buffer.alloc(0);
  let i = 0;
  while (i + 8 <= data.length) {
    const type    = data[1 + i];
    const cLen    = data.readUInt16BE(4 + i);
    const pLen    = data[6 + i];
    const content = data.slice(i + 8, i + 8 + cLen);
    i += 8 + cLen + pLen;
    if (type === FCGI_STDOUT) stdout = Buffer.concat([stdout, content]);
    if (type === FCGI_END_REQUEST) break;
  }
  return stdout;
}

// ── HTTP → FastCGI köprüsü ────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks);

    // Request body'yi temp dosyaya yaz (BRIDGE_INPUT_FILE ile PHP okur)
    const tmpFile = resolve(__dir, '.tmp', 'req_' + randomBytes(8).toString('hex') + '.json');
    try { writeFileSync(tmpFile, body); } catch(e) {}

    const scriptPath = resolve(__dir, 'router.php');
    const params = {
      GATEWAY_INTERFACE: 'CGI/1.1',
      SERVER_PROTOCOL:   'HTTP/1.1',
      REQUEST_METHOD:    req.method || 'GET',
      SCRIPT_FILENAME:   scriptPath,
      SCRIPT_NAME:       '/router.php',
      REQUEST_URI:       req.url || '/',
      QUERY_STRING:      (req.url || '').includes('?') ? req.url.split('?').slice(1).join('?') : '',
      CONTENT_TYPE:      req.headers['content-type'] || '',
      CONTENT_LENGTH:    String(body.length),
      HTTP_HOST:         req.headers['host'] || 'localhost',
      SERVER_NAME:       'localhost',
      SERVER_PORT:       String(PORT),
      REDIRECT_STATUS:   '200',
      DOCUMENT_ROOT:     __dir,
      BRIDGE_INPUT_FILE: tmpFile,
    };
    for (const [k, v] of Object.entries(req.headers)) {
      params['HTTP_' + k.toUpperCase().replace(/-/g, '_')] = v;
    }

    const fcgiData = buildFcgiRequest(params, body);
    const sock = net.connect(FPM_PORT, FPM_HOST);
    let rawResp = Buffer.alloc(0);

    sock.on('data', d => { rawResp = Buffer.concat([rawResp, d]); });
    sock.on('end', () => {
      try { unlinkSync(tmpFile); } catch(e) {}
      const out = parseFcgiResponse(rawResp);
      const str = out.toString('binary');
      const sep4 = str.indexOf('\r\n\r\n');
      const sep2 = str.indexOf('\n\n');
      const sepIdx = sep4 !== -1 ? sep4 : sep2;

      if (sepIdx === -1) {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(out);
        return;
      }
      const rawHeaders = str.substring(0, sepIdx);
      const bodyBuf    = out.slice(sepIdx + (sep4 !== -1 ? 4 : 2));

      let status = 200;
      const headers = {};
      for (const line of rawHeaders.split(/\r?\n/)) {
        if (!line.trim()) continue;
        if (/^status:/i.test(line)) { status = parseInt(line.split(':')[1]) || 200; continue; }
        const ci = line.indexOf(':');
        if (ci > 0) headers[line.substring(0, ci).trim().toLowerCase()] = line.substring(ci + 1).trim();
      }
      res.writeHead(status, headers);
      res.end(bodyBuf);
    });
    sock.on('error', err => {
      try { unlinkSync(tmpFile); } catch(e) {}
      if (!res.headersSent) { res.writeHead(502); res.end('FPM bağlantı hatası: ' + err.message); }
    });
    sock.write(fcgiData);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[fpm-bridge] port ${PORT} → php-fpm ${FPM_HOST}:${FPM_PORT}`);
});
