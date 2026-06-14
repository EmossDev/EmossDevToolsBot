import { Router } from "express";
import { resolve } from "node:path";
import { deflateSync } from "node:zlib";

function uint32BE(n: number): Buffer {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}
function crc32(data: Buffer): number {
  let c = 0xffffffff;
  for (const byte of data) {
    c ^= byte;
    for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type: string, data: Buffer): Buffer {
  const t = Buffer.from(type, "ascii");
  return Buffer.concat([uint32BE(data.length), t, data, uint32BE(crc32(Buffer.concat([t, data])))]);
}
function solidColorPNG(size: number, r: number, g: number, b: number): Buffer {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = pngChunk("IHDR", Buffer.concat([uint32BE(size), uint32BE(size), Buffer.from([8, 2, 0, 0, 0])]));
  const rowSize = 1 + size * 3;
  const raw = Buffer.alloc(size * rowSize);
  for (let y = 0; y < size; y++) {
    raw[y * rowSize] = 0;
    for (let x = 0; x < size; x++) {
      const i = y * rowSize + 1 + x * 3;
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b;
    }
  }
  return Buffer.concat([sig, ihdr, pngChunk("IDAT", deflateSync(raw)), pngChunk("IEND", Buffer.alloc(0))]);
}
const ICON_192 = solidColorPNG(192, 220, 38, 38);
const ICON_512 = solidColorPNG(512, 220, 38, 38);

const router = Router();

const html = String.raw`<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<meta name="mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="theme-color" content="#0a0000"/>
<link rel="manifest" href="/admin/manifest.json"/>
<link rel="apple-touch-icon" href="/admin/icon-512.png"/>
<title>EmossDev Panel</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
:root{
  --bg:#0a0000;
  --card:#130005;--card2:#18000a;--card3:#200010;
  --r0:#dc2626;--r1:#e53935;--r2:#ff5252;--r3:#ff8a80;
  --p0:#9c27b0;--p1:#ce93d8;
  --o0:#ff6d00;--o1:#ffab40;
  --g0:#00c853;--g1:#69f0ae;
  --b0:#2979ff;--b1:#82b1ff;
  --glow:#dc262640;--glow2:#dc262620;--glow3:#dc262610;
  --text:#fff8ff;--text2:#ffd0d0;--muted:#905060;
  --border:#280808;--border2:#3f1010;
  --surface-bg:rgba(13,0,0,.88);
  --hdr-h:72px;--nav-h:76px;
  --hdr-top:12px;--nav-bot:12px;
}
html,body{height:100%;overflow:hidden;background:var(--bg)}
body{color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;position:relative;display:block}

/* ── ANIMATED BG ── */
body::before{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 70% 45% at 15% 15%,var(--glow) 0%,transparent 65%),
    radial-gradient(ellipse 40% 55% at 55% 50%,#ff6d000a 0%,transparent 70%);
  transition:background 0.6s ease;
}

/* ── FLOATING TOP BAR ── */
.top-bar{
  position:fixed;top:var(--hdr-top);left:12px;right:12px;z-index:50;
  height:var(--hdr-h);
  background:var(--surface-bg);
  backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);
  border-radius:24px;
  border:1px solid rgba(220,38,38,.18);
  box-shadow:0 4px 32px #00000060,0 0 0 .5px rgba(220,38,38,.15),inset 0 1px 0 rgba(255,255,255,.06);
  display:flex;align-items:center;padding:0 14px;gap:12px;overflow:hidden;
  transition:background .4s,border-color .4s,box-shadow .4s;
}

.logo{width:42px;height:42px;border-radius:14px;flex-shrink:0;overflow:hidden;
  box-shadow:0 0 0 1.5px rgba(220,38,38,.3),0 0 20px #dc262630,0 2px 12px #00000060;
  position:relative}
.logo img{width:100%;height:100%;object-fit:cover;display:block}
.logo-fallback{width:100%;height:100%;background:linear-gradient(135deg,#7f0000,#1a0000);display:grid;place-items:center;font-weight:900;font-size:16px;color:var(--r3)}
.hdr-info{flex:1;min-width:0}
.hdr-title{
  font-size:15px;font-weight:900;letter-spacing:-.02em;
  color:var(--r3);
  text-shadow:0 0 14px var(--r0),0 0 28px var(--glow);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  transition:color .4s,text-shadow .4s;
}
@keyframes titleflow{from{background-position:0%}to{background-position:300%}}
.hdr-sub{font-size:10px;color:var(--muted);margin-top:1px;font-weight:500}

/* STATUS BADGE — "Aktif" animasyonu */
.status-badge{
  display:flex;align-items:center;gap:7px;
  background:rgba(255,255,255,.04);
  border-radius:30px;padding:5px 11px 5px 7px;
  border:1px solid rgba(255,255,255,.08);
  flex-shrink:0;position:relative;overflow:hidden;
}
.status-badge::before{
  content:'';position:absolute;inset:0;border-radius:inherit;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.03),transparent);
  animation:bgsweep 3s ease-in-out infinite;
}
@keyframes bgsweep{0%,100%{transform:translateX(-100%)}50%{transform:translateX(100%)}}

/* dot alanı */
.sdot-wrap{position:relative;width:20px;height:20px;flex-shrink:0;display:grid;place-items:center}
.sdot{width:8px;height:8px;border-radius:50%;position:relative;z-index:1;transition:background .4s}

/* ping halkası */
.sdot-ping{
  position:absolute;inset:0;border-radius:50%;
  border:2px solid currentColor;opacity:0;
  animation:none;
}

/* ONLINE */
.st-online .sdot{background:var(--g0);box-shadow:0 0 8px var(--g0)}
.st-online .sdot-ping{color:var(--g0);animation:ping 1.6s ease-out infinite}
.st-online .sbadge-text{
  font-size:12px;font-weight:800;
  color:#69f0ae;
  text-shadow:0 0 8px #00c853;
  animation:activepulse 1.6s ease-in-out infinite;
  letter-spacing:.04em;text-transform:uppercase;
}
@keyframes ping{0%{opacity:.8;transform:scale(.8)}80%{opacity:0;transform:scale(2.2)}100%{opacity:0;transform:scale(2.2)}}
@keyframes activepulse{0%,100%{filter:drop-shadow(0 0 4px #00c85380)}50%{filter:drop-shadow(0 0 10px #00c853cc)}}

/* OFFLINE */
.st-offline .sdot{background:var(--r0);box-shadow:0 0 6px var(--r0)}
.st-offline .sdot-ping{color:var(--r0);animation:ping 2s ease-out infinite}
.st-offline .sbadge-text{font-size:12px;font-weight:700;color:var(--r3);text-transform:uppercase;letter-spacing:.04em}

/* CHECKING */
.st-checking .sdot{background:var(--o1)}
.st-checking .sdot-wrap::after{content:'';position:absolute;inset:-2px;border-radius:50%;border:2px solid transparent;border-top-color:var(--o1);animation:spinslow 1s linear infinite}
.st-checking .sbadge-text{font-size:12px;font-weight:700;color:var(--o1);text-transform:uppercase;letter-spacing:.04em}
@keyframes spinslow{to{transform:rotate(360deg)}}

/* ── SCROLL AREA ── */
.scroll-area{
  position:fixed;
  top:calc(var(--hdr-top) + var(--hdr-h) + 10px);
  bottom:calc(var(--nav-bot) + var(--nav-h) + 10px);
  left:0;right:0;
  overflow-y:auto;overflow-x:hidden;
  -webkit-overflow-scrolling:touch;
  padding:0 12px;
  z-index:1;
}
.scroll-area::-webkit-scrollbar{display:none}

/* ── PAGES ── */
.page{display:none;flex-direction:column;gap:10px;padding-bottom:4px}
.page.active{display:flex}

/* ── CARDS ── */
.card{background:var(--card);border-radius:18px;border:1px solid var(--border2);overflow:hidden;position:relative}
.card::after{content:'';position:absolute;inset:0;pointer-events:none;border-radius:inherit;
  background:linear-gradient(135deg,rgba(255,255,255,.04) 0%,transparent 50%,rgba(255,255,255,.02) 100%)}
.card-head{padding:11px 14px 10px;display:flex;align-items:center;gap:9px;border-bottom:1px solid var(--border);
  background:linear-gradient(135deg,var(--card2),var(--card))}
.ci{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;flex-shrink:0}
.ci svg{width:16px;height:16px;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ci.red{background:#dc262614;box-shadow:0 0 10px #dc262618}.ci.red svg{stroke:var(--r3)}
.ci.orange{background:#ff6d0014;box-shadow:0 0 10px #ff6d0018}.ci.orange svg{stroke:var(--o1)}
.ci.green{background:#00c85314;box-shadow:0 0 10px #00c85318}.ci.green svg{stroke:var(--g1)}
.ci.blue{background:#2979ff14;box-shadow:0 0 10px #2979ff18}.ci.blue svg{stroke:var(--b1)}
.ci.purple{background:#9c27b014;box-shadow:0 0 10px #9c27b018}.ci.purple svg{stroke:var(--p1)}
.card-label{font-size:11px;font-weight:800;color:var(--text2);letter-spacing:.06em;text-transform:uppercase}
.card-body{padding:12px 14px}

/* ── STAT CARDS ── */
.stat-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.stat-card{
  background:var(--card);border:1px solid var(--border2);border-radius:16px;
  padding:14px 12px;text-align:center;overflow:hidden;position:relative;
}
.stat-card::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(220,38,38,.07),transparent 60%);
  animation:cardbreath 4s ease-in-out infinite alternate;
}
@keyframes cardbreath{from{opacity:.4}to{opacity:1}}
.stat-val{
  font-size:22px;font-weight:900;line-height:1;letter-spacing:-.03em;position:relative;
  color:var(--r3);
  text-shadow:0 0 18px var(--r0),0 0 32px var(--glow);
}
.stat-lbl{font-size:10px;color:var(--muted);font-weight:700;margin-top:5px;text-transform:uppercase;letter-spacing:.06em;position:relative}

/* ── INFO CELLS ── */
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.info-cell{background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:10px 12px}
.info-cell label{font-size:10px;color:var(--muted);font-weight:700;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em}
.info-cell span{font-size:13px;font-weight:700;word-break:break-all}

/* ── REFRESH INDICATOR ── */
.refresh-bar{height:2px;background:var(--border);border-radius:1px;overflow:hidden;margin-top:9px}
.refresh-fill{height:100%;background:linear-gradient(90deg,var(--r0),var(--p0),var(--r0));
  background-size:200% auto;border-radius:1px;width:100%;
  animation:rfprog 5s linear,titleflow 1s linear infinite}
@keyframes rfprog{from{width:100%}to{width:0%}}

/* ── URL BOX ── */
.wh-box{background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:11px 13px;margin-bottom:10px}
.wh-lbl{font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px}
.wh-url{font-size:11px;color:var(--b1);word-break:break-all;line-height:1.5;font-family:'Courier New',monospace}

/* ── BUTTONS ── */
.btn{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;
  padding:13px;border-radius:14px;border:none;font-size:14px;font-weight:700;cursor:pointer;
  transition:.15s;font-family:inherit;position:relative;overflow:hidden}
.btn::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.1),transparent);pointer-events:none}
.btn:active{transform:scale(.95);opacity:.8}
.btn svg{width:16px;height:16px;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.btn-red{
  background:linear-gradient(120deg,#c0392b,#e74c3c,#ff6b6b,#e74c3c,#c0392b);
  background-size:300% auto;color:#fff;
  box-shadow:0 2px 16px rgba(220,38,38,.45),0 0 0 1px rgba(255,120,120,.25),inset 0 1px 0 rgba(255,200,200,.2);
  animation:btnshine 4s ease-in-out infinite;
}
@keyframes btnshine{0%,100%{background-position:0%}50%{background-position:100%}}
.btn-red svg{stroke:#fff}
.btn-outline{background:var(--card2);color:var(--r3);border:1.5px solid rgba(220,38,38,.3)}
.btn-outline svg{stroke:var(--r3)}
.btn-ghost{background:var(--card2);color:var(--muted);border:1px solid var(--border2)}
.btn-ghost svg{stroke:var(--muted)}
.btn-sm{padding:8px 14px;font-size:13px;border-radius:12px}
.btn-row{display:flex;gap:8px}
.btn-row .btn{flex:1}

/* ── FORMS ── */
.field{margin-bottom:10px}
.field label{display:block;font-size:10px;font-weight:700;color:var(--muted);letter-spacing:.07em;text-transform:uppercase;margin-bottom:6px}
.field input,.field textarea,.field select{
  width:100%;background:var(--card2);border:1.5px solid var(--border2);
  border-radius:12px;padding:11px 13px;color:var(--text);font-size:14px;
  outline:none;transition:.2s;font-family:inherit;-webkit-appearance:none}
.field textarea{resize:vertical;min-height:110px;line-height:1.6;font-size:13px}
.field input:focus,.field textarea:focus{
  border-color:var(--r0);background:var(--card3);
  box-shadow:0 0 0 3px rgba(220,38,38,.15),0 0 20px rgba(220,38,38,.08)}
.field input::placeholder,.field textarea::placeholder{color:var(--muted)}

/* ── TYPE CHIPS ── */
.type-chips{display:flex;gap:7px;flex-wrap:wrap}
.type-chip{flex:1;min-width:68px;padding:9px 8px;border-radius:10px;
  border:1.5px solid var(--border2);background:var(--card2);
  color:var(--muted);font-size:12px;font-weight:700;cursor:pointer;
  text-align:center;transition:.15s;font-family:inherit}
.type-chip:active{transform:scale(.94)}
.type-chip.sel-1{border-color:var(--b0);color:var(--b1);background:rgba(41,121,255,.12)}
.type-chip.sel-2{border-color:var(--g0);color:var(--g1);background:rgba(0,200,83,.12)}
.type-chip.sel-3{border-color:var(--p0);color:var(--p1);background:rgba(156,39,176,.12)}
.type-chip.sel-0{border-color:var(--o0);color:var(--o1);background:rgba(255,109,0,.12)}

/* ── CATEGORY GRID ── */
.cat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:10px}
.cat-card{
  background:var(--card);border:1.5px solid var(--border);border-radius:18px;
  padding:18px 12px;cursor:pointer;transition:.2s;
  display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;
  position:relative;overflow:hidden}
.cat-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.03),transparent);pointer-events:none}
.cat-card:active{transform:scale(.95)}
.cat-card.sel{
  border-color:var(--r0);
  box-shadow:0 0 24px rgba(220,38,38,.2),0 0 0 1px rgba(220,38,38,.25);
  background:linear-gradient(135deg,rgba(220,38,38,.1),var(--card))}
.cat-icon{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;position:relative}
.cat-icon svg{width:26px;height:26px;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;position:relative;z-index:1}
.cat-name{font-size:13px;font-weight:800;color:var(--text2);letter-spacing:-.01em}
.cat-card.sel .cat-name{
  background:linear-gradient(90deg,var(--r3),var(--p1));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.cat-count{font-size:11px;color:var(--muted);font-weight:600;
  background:var(--card2);border:1px solid var(--border);border-radius:20px;padding:2px 9px}

/* ── FILTER ITEMS ── */
.fi-wrap{display:flex;flex-direction:column;gap:6px}
.fi{
  background:var(--card2);border:1px solid var(--border);border-radius:13px;
  padding:11px 13px;cursor:pointer;display:flex;align-items:center;gap:10px;
  transition:.15s;position:relative;overflow:hidden}
.fi::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;
  background:linear-gradient(180deg,var(--r0),var(--p0));border-radius:3px 0 0 3px;opacity:.7}
.fi:active{border-color:var(--r0);background:var(--card3)}
.fi-l{flex:1;min-width:0}
.fi-name{font-size:13px;font-weight:800;font-family:'Courier New',monospace;margin-bottom:3px;
  color:var(--r3);text-shadow:0 0 10px var(--r0);}
.fi-prev{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fi-tb{font-size:10px;padding:3px 8px;border-radius:20px;font-weight:700;flex-shrink:0}
.tb-1{background:rgba(41,121,255,.14);color:var(--b1);border:1px solid rgba(41,121,255,.25)}
.tb-2{background:rgba(0,200,83,.14);color:var(--g1);border:1px solid rgba(0,200,83,.25)}
.tb-3{background:rgba(156,39,176,.14);color:var(--p1);border:1px solid rgba(156,39,176,.25)}
.tb-0{background:rgba(255,109,0,.14);color:var(--o1);border:1px solid rgba(255,109,0,.25)}
.fi-chev svg{width:15px;height:15px;stroke:var(--muted);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}

.back-btn{display:inline-flex;align-items:center;gap:6px;color:var(--r3);
  background:var(--card2);border:1px solid var(--border2);border-radius:10px;
  padding:8px 13px;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:10px;width:fit-content}
.back-btn:active{opacity:.7}
.back-btn svg{width:15px;height:15px;stroke:var(--r3);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}

.banner{background:var(--card2);border:1px solid var(--border2);border-radius:14px;
  padding:12px 14px;display:flex;gap:10px;align-items:flex-start}
.banner-icon svg{width:18px;height:18px;stroke:var(--o1);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;margin-top:1px}
.banner p{font-size:12px;color:var(--text2);line-height:1.5}
.banner strong{color:var(--r3)}

.empty{text-align:center;padding:32px 16px;color:var(--muted);font-size:13px}
.empty svg{width:38px;height:38px;stroke:var(--border2);fill:none;stroke-width:1.5;margin:0 auto 10px;display:block}

/* ── BOT POWER CONTROL ── */
.bot-power-scene{display:flex;flex-direction:column;align-items:center;padding:24px 16px 16px;gap:18px}
.bot-power-outer{position:relative;width:168px;height:168px;display:grid;place-items:center}
.bp-ring{position:absolute;border-radius:50%;transition:border-color .5s,box-shadow .5s,opacity .5s;pointer-events:none}
.bp-ring.r1{inset:0;border:2px solid rgba(220,38,38,.25)}
.bp-ring.r2{inset:-16px;border:1.5px solid rgba(220,38,38,.12)}
.bp-ring.r3{inset:-32px;border:1px solid rgba(220,38,38,.06)}
.bot-power-scene.on .bp-ring.r1{border-color:rgba(0,200,83,.7);box-shadow:0 0 18px rgba(0,200,83,.4);animation:bpr1 1.8s ease-in-out infinite}
.bot-power-scene.on .bp-ring.r2{border-color:rgba(0,200,83,.35);animation:bpr2 2.5s ease-in-out infinite}
.bot-power-scene.on .bp-ring.r3{border-color:rgba(0,200,83,.15);animation:bpr3 3.2s ease-in-out infinite}
@keyframes bpr1{0%,100%{box-shadow:0 0 14px rgba(0,200,83,.3)}50%{box-shadow:0 0 28px rgba(0,200,83,.65)}}
@keyframes bpr2{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
@keyframes bpr3{0%,100%{opacity:.4}50%{opacity:.9}}
.bot-power-btn{
  width:116px;height:116px;border-radius:50%;cursor:pointer;z-index:1;
  background:radial-gradient(circle at 38% 32%,#1c0606,#0d0000);
  border:3px solid rgba(220,38,38,.25);
  display:grid;place-items:center;
  transition:all .4s cubic-bezier(.34,1.56,.64,1);
  box-shadow:0 6px 28px #0007,inset 0 1px 0 rgba(255,255,255,.04);
  -webkit-tap-highlight-color:transparent;
}
.bot-power-btn:active{transform:scale(.92)!important}
.bot-power-btn svg{width:44px;height:44px;stroke:var(--muted);fill:none;stroke-width:2.2;stroke-linecap:round;transition:.4s}
.bot-power-scene.on .bot-power-btn{
  border-color:#00c853;
  background:radial-gradient(circle at 38% 32%,#002a10,#000d06);
  box-shadow:0 0 44px rgba(0,200,83,.55),0 6px 28px #0007,inset 0 0 24px rgba(0,200,83,.15),inset 0 1px 0 rgba(255,255,255,.07);
}
.bot-power-scene.on .bot-power-btn svg{stroke:#00c853;filter:drop-shadow(0 0 11px #00c853)}
.bot-power-label{font-size:18px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;transition:.4s;color:var(--r3)}
.bot-power-scene.on .bot-power-label{color:#00c853;text-shadow:0 0 18px rgba(0,200,83,.6)}
.bot-mode-chips{display:flex;gap:8px}
.bchip{padding:4px 14px;border-radius:20px;font-size:11px;font-weight:700;border:1px solid var(--border2);color:var(--muted);background:var(--card2);transition:.4s;letter-spacing:.04em;text-transform:uppercase}
.bchip.on-wh{background:rgba(0,200,83,.12);border-color:rgba(0,200,83,.35);color:#00c853}
.bchip.on-poll{background:rgba(220,38,38,.12);border-color:rgba(220,38,38,.3);color:var(--r3)}
.bot-url-box{width:100%;background:var(--card2);border:1px solid var(--border2);border-radius:12px;padding:11px 14px}
.bot-url-box .bu-lbl{font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px}
.bot-url-box .bu-val{font-size:11px;color:var(--text2);font-family:'Courier New',monospace;word-break:break-all;line-height:1.55;min-height:16px}
.bot-url-box .bu-val.active{color:var(--text1)}

/* ── FLOATING BOTTOM NAV ── */
.bottom-nav{
  position:fixed;bottom:var(--nav-bot);left:12px;right:12px;z-index:50;
  height:var(--nav-h);
  background:var(--surface-bg);
  backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);
  border-radius:26px;
  border:1px solid rgba(220,38,38,.18);
  box-shadow:0 4px 32px rgba(0,0,0,.7),0 0 0 .5px rgba(220,38,38,.12),inset 0 1px 0 rgba(255,255,255,.05);
  display:grid;grid-template-columns:repeat(4,1fr);
  overflow:hidden;
  transition:background .4s;
}
.bottom-nav::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent 5%,rgba(220,38,38,.7) 50%,transparent 95%);
  transition:background .4s;
}
.nb{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;
  cursor:pointer;padding:8px 4px 6px;transition:.15s;position:relative}
.nb:active{opacity:.6}
.n-ic{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;transition:.25s}
.n-ic svg{width:22px;height:22px;fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transition:.25s}
.n-lbl{font-size:10px;font-weight:600;color:var(--muted);transition:.25s;letter-spacing:.01em}

/* active state */
.nb.active .n-ic{background:rgba(220,38,38,.12)}
.nb.active .n-ic svg{stroke:var(--r2);filter:drop-shadow(0 0 6px rgba(220,38,38,.7))}
.nb.active .n-lbl{
  color:var(--r3);
  text-shadow:0 0 8px var(--glow);
  font-weight:700;
}
/* active indicator dot */
.nb.active::after{
  content:'';position:absolute;top:5px;
  width:4px;height:4px;border-radius:50%;
  background:var(--r2);
  box-shadow:0 0 8px var(--r2),0 0 14px rgba(220,38,38,.5);
  animation:dotpop .25s ease;
}
@keyframes dotpop{from{transform:scale(0)}to{transform:scale(1)}}

/* ── MODAL ── */
.modal-bg{display:none;position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:100;
  align-items:flex-end;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.modal-bg.open{display:flex}
.modal{
  background:var(--card);
  border:1px solid var(--border2);
  border-radius:28px 28px 0 0;
  width:100%;max-height:92dvh;overflow-y:auto;
  animation:slideUp .22s cubic-bezier(.25,.8,.25,1);
  position:relative}
.modal::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;border-radius:28px 28px 0 0;
  background:linear-gradient(90deg,transparent 5%,var(--r0) 30%,var(--p0) 70%,transparent 95%)}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.mpill{width:36px;height:4px;background:var(--border2);border-radius:2px;margin:12px auto 0}
.mini{padding:14px 16px 32px}
.mtitle{font-size:17px;font-weight:900;margin-bottom:3px;font-family:monospace;
  background:linear-gradient(90deg,var(--r3),var(--p1));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.msub{font-size:12px;color:var(--muted);margin-bottom:14px;display:flex;gap:7px;flex-wrap:wrap}
.mtag{background:var(--card2);border:1px solid var(--border2);border-radius:7px;padding:2px 9px;color:var(--text2);font-weight:600}
.m-actions{display:flex;gap:8px;margin-top:14px}

/* ── TOAST ── */
.toast{position:fixed;bottom:calc(var(--nav-bot) + var(--nav-h) + 10px);left:50%;
  transform:translateX(-50%) translateY(8px);
  border-radius:14px;padding:10px 18px;font-size:13px;font-weight:700;z-index:300;
  opacity:0;transition:.25s;pointer-events:none;white-space:nowrap;
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.toast.ok{background:rgba(0,20,8,.9);border:1px solid rgba(0,200,83,.4);color:var(--g1)}
.toast.err{background:rgba(20,0,0,.9);border:1px solid rgba(220,38,38,.4);color:var(--r3)}

/* ── PARTICLE CANVAS ── */
#px{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.55}

/* ── AURORA CANVAS ── */
#aurora{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.35}

/* ── MOOD LED ── */
#moodLed{
  position:fixed;inset:0;z-index:0;pointer-events:none;
  transition:background 3s ease;
}

/* ── LIVE CLOCK ── */
.hdr-clock{font-size:11px;font-weight:700;font-family:'Courier New',monospace;
  color:rgba(255,138,128,.6);letter-spacing:.06em;margin-top:2px}

/* ── GLITCH ── */
@keyframes glitch1{
  0%,90%,100%{clip-path:none;transform:none}
  91%{clip-path:inset(20% 0 60% 0);transform:translateX(-3px)}
  93%{clip-path:inset(60% 0 10% 0);transform:translateX(3px)}
  95%{clip-path:inset(40% 0 30% 0);transform:translateX(-2px)}
  97%{clip-path:none;transform:none}
}
.hdr-title.glitch{animation:titleflow 5s linear infinite,glitch1 .15s steps(1) forwards!important}

/* ── NAV SLIDING PILL ── */
.nav-pill{
  position:absolute;bottom:8px;
  width:calc(25% - 16px);height:calc(100% - 16px);
  background:rgba(220,38,38,.1);
  border-radius:18px;
  border:1px solid rgba(220,38,38,.2);
  transition:transform .3s cubic-bezier(.34,1.56,.64,1);
  pointer-events:none;
  left:8px;
  box-shadow:0 0 16px rgba(220,38,38,.1);
}

/* ── RIPPLE ── */
.ripple{
  position:absolute;border-radius:50%;
  background:rgba(255,255,255,.25);
  transform:scale(0);
  animation:rippleout .5s linear;
  pointer-events:none;
}
@keyframes rippleout{to{transform:scale(4);opacity:0}}

/* ── LOGO 3D HOVER ── */
.logo{transform-style:preserve-3d;transition:transform .15s ease,box-shadow .15s ease;cursor:pointer}
.logo:hover{box-shadow:0 0 0 1.5px rgba(220,38,38,.6),0 0 32px #dc262660,0 4px 20px #00000080!important}

/* ── HDR RIGHT COLUMN ── */
.hdr-right{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0}
.ping-badge-sm{
  display:flex;align-items:center;gap:5px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);
  border-radius:20px;padding:3px 8px;font-size:10px;font-weight:700;
  font-family:'Courier New',monospace;color:var(--muted);
}
.ping-badge-sm.fast{color:var(--g1);border-color:rgba(0,200,83,.2)}
.ping-badge-sm.slow{color:var(--o1);border-color:rgba(255,109,0,.2)}

/* ── THEME DRAWER ── */
.theme-handle{
  position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:65;
  width:20px;height:80px;cursor:pointer;
  background:var(--card2);
  border:1px solid var(--border2);border-right:none;
  border-radius:12px 0 0 12px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
  box-shadow:-2px 0 14px #0004;
  transition:background .3s,width .2s;
}
.theme-handle:active{width:16px}
.theme-handle-dot{width:5px;height:5px;border-radius:50%;background:var(--r0);box-shadow:0 0 6px var(--r0);transition:.3s}

.theme-overlay{
  position:fixed;inset:0;z-index:66;background:rgba(0,0,0,.55);
  backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
  opacity:0;pointer-events:none;transition:opacity .25s;
}
.theme-overlay.open{opacity:1;pointer-events:auto}

.theme-drawer{
  position:fixed;top:0;right:0;bottom:0;width:210px;z-index:67;
  background:var(--card2);border-left:1px solid var(--border2);
  transform:translateX(100%);transition:transform .28s cubic-bezier(.4,0,.2,1);
  display:flex;flex-direction:column;padding:20px 14px 24px;gap:0;
  overflow-y:auto;
}
.theme-drawer.open{transform:translateX(0)}
.theme-drawer::-webkit-scrollbar{display:none}
.theme-drawer-title{
  font-size:10px;font-weight:800;color:var(--muted);
  text-transform:uppercase;letter-spacing:.1em;
  padding-bottom:12px;margin-bottom:10px;
  border-bottom:1px solid var(--border);
}
.tc{
  background:var(--card3);border:1px solid var(--border);
  border-radius:14px;padding:13px 14px;cursor:pointer;
  display:flex;align-items:center;gap:12px;transition:.15s;
  margin-bottom:8px;
}
.tc:active{transform:scale(.97)}
.tc.sel{border-color:var(--r0);box-shadow:0 0 16px var(--glow);background:var(--card)}
.tc-blob{width:36px;height:36px;border-radius:50%;flex-shrink:0}
.tc-name{font-size:13px;font-weight:800;color:var(--text);margin-bottom:2px}
.tc-sub{font-size:10px;color:var(--muted);font-weight:600}
.tc-check{margin-left:auto;opacity:0;color:var(--r3);font-size:16px;transition:.2s}
.tc.sel .tc-check{opacity:1}

/* ── SOUND / MUSIC TOGGLE ── */
.sound-btn,.music-btn{
  position:fixed;right:14px;
  width:36px;height:36px;border-radius:50%;
  background:var(--surface-bg);border:1px solid var(--border2);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  display:grid;place-items:center;cursor:pointer;z-index:60;
  box-shadow:0 2px 12px #0004;transition:.2s;
}
.sound-btn{top:calc(var(--hdr-top) + var(--hdr-h) + 14px)}
.music-btn{top:calc(var(--hdr-top) + var(--hdr-h) + 58px)}
.sound-btn:active,.music-btn:active{transform:scale(.88)}
.sound-btn svg,.music-btn svg{width:16px;height:16px;stroke:var(--muted);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:.2s}
.sound-btn.on svg{stroke:var(--g1);filter:drop-shadow(0 0 4px var(--g1))}
.music-btn.on svg{stroke:var(--r2);filter:drop-shadow(0 0 4px var(--r0));animation:musicpulse 1.2s ease-in-out infinite}
@keyframes musicpulse{0%,100%{filter:drop-shadow(0 0 3px var(--r0))}50%{filter:drop-shadow(0 0 9px var(--r0))}}

/* ── MUSIC PANEL ── */
.music-panel{
  position:fixed;
  bottom:calc(var(--nav-bot) + var(--nav-h) + 10px);
  left:12px;right:12px;z-index:55;
  background:var(--surface-bg);
  border:1px solid var(--border2);border-radius:20px;
  backdrop-filter:blur(28px) saturate(180%);-webkit-backdrop-filter:blur(28px) saturate(180%);
  padding:14px 14px 16px;
  transform:translateY(calc(100% + 90px));opacity:0;pointer-events:none;
  transition:transform .38s cubic-bezier(.34,1.56,.64,1),opacity .25s ease;
  box-shadow:0 -4px 32px rgba(0,0,0,.65),0 0 0 .5px rgba(220,38,38,.12);
}
.music-panel.open{transform:translateY(0);opacity:1;pointer-events:auto}
.mp-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.mp-title{font-size:13px;font-weight:800;color:var(--text1);display:flex;align-items:center;gap:7px}
.mp-title-dot{width:8px;height:8px;border-radius:50%;background:var(--r0);animation:musicpulse 1.4s ease-in-out infinite}
.music-panel.playing .mp-title-dot{background:#1db954;box-shadow:0 0 8px #1db95466}
.mp-close-btn{width:26px;height:26px;border-radius:50%;background:var(--card2);border:1px solid var(--border2);display:grid;place-items:center;cursor:pointer;font-size:12px;color:var(--muted);line-height:1}
.mp-presets{display:flex;gap:6px;margin-bottom:11px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none}
.mp-presets::-webkit-scrollbar{display:none}
.mp-preset{padding:5px 13px;border-radius:14px;font-size:11px;font-weight:700;border:1px solid var(--border2);color:var(--muted);background:var(--card2);cursor:pointer;transition:.15s;white-space:nowrap;flex-shrink:0}
.mp-preset:active{opacity:.6}
.mp-preset.active{border-color:var(--r0);color:var(--r3);background:rgba(220,38,38,.12)}
.mp-input-row{display:flex;gap:6px;margin-bottom:10px}
.mp-url-input{flex:1;background:var(--card2);border:1px solid var(--border2);border-radius:10px;padding:9px 11px;color:var(--text1);font-size:11px;font-family:'Courier New',monospace;outline:none;transition:.2s;min-width:0}
.mp-url-input:focus{border-color:var(--r0);box-shadow:0 0 0 2px rgba(220,38,38,.15)}
.mp-url-input::placeholder{color:var(--muted);font-family:system-ui,sans-serif;font-size:11px}
.mp-go-btn{width:36px;height:36px;border-radius:10px;background:var(--r0);border:none;display:grid;place-items:center;cursor:pointer;flex-shrink:0;transition:.15s}
.mp-go-btn:active{transform:scale(.9)}
.mp-go-btn svg{width:14px;height:14px;stroke:#fff;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.mp-player{width:100%;border-radius:12px;overflow:hidden;background:var(--card2);border:1px solid var(--border2)}
.mp-player iframe{width:100%;border:none;display:block}
.mp-empty{font-size:12px;color:var(--muted);text-align:center;padding:22px 10px;line-height:1.6}

/* ── BOT URL INPUT ── */
.bu-input-wrap{display:flex;gap:6px;align-items:center;margin-top:6px}
.bu-input{flex:1;background:transparent;border:none;border-bottom:1px solid var(--border2);padding:4px 2px;color:var(--text1);font-size:11px;font-family:'Courier New',monospace;outline:none;min-width:0;transition:.2s}
.bu-input:focus{border-bottom-color:var(--r0)}
.bu-input::placeholder{color:var(--muted);font-family:system-ui,sans-serif}

/* ── STATUS IDLE (Polling mod) ── */
.st-idle .sdot{background:var(--o1);box-shadow:0 0 6px var(--o1)}
.st-idle .sdot-ping{color:var(--o1);animation:ping 2.5s ease-out infinite}
.st-idle .sbadge-text{font-size:12px;font-weight:700;color:var(--o1);text-transform:uppercase;letter-spacing:.04em}

/* ── UPTIME ── */
.uptime-badge{
  display:inline-flex;align-items:center;gap:5px;
  background:rgba(0,200,83,.08);border:1px solid rgba(0,200,83,.2);
  border-radius:20px;padding:4px 10px;font-size:11px;font-weight:700;
  font-family:'Courier New',monospace;color:var(--g1);margin-top:8px;
}
.uptime-badge::before{content:'⏱';font-size:10px}

/* ── EKG CANVAS ── */
#ekg{width:100%;height:52px;border-radius:10px;margin-top:8px;display:block}

/* ── DRAG HANDLE ── */
.stat-card{cursor:grab;user-select:none;touch-action:none}
.stat-card.dragging{opacity:.5;cursor:grabbing;transform:scale(.96)}
.stat-card.drag-over{outline:2px dashed rgba(220,38,38,.5);outline-offset:2px}

/* ── SHAKE HINT ── */
@keyframes shakehint{0%,100%{transform:none}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}

/* ── THEME OVERRIDES ── */

/* ── PING BADGE ── */
.ping-badge{
  display:flex;align-items:center;gap:5px;
  background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.07);
  border-radius:20px;padding:3px 9px;font-size:10px;font-weight:700;
  color:var(--muted);cursor:default;
}
.ping-dot{width:5px;height:5px;border-radius:50%;background:var(--g0);flex-shrink:0;
  box-shadow:0 0 6px var(--g0);animation:pingpulse 2s ease-in-out infinite;}
@keyframes pingpulse{0%,100%{opacity:1}50%{opacity:.3}}
.ping-badge.slow .ping-dot{background:#ffab40;box-shadow:0 0 6px #ffab40;}
.ping-badge.bad  .ping-dot{background:var(--r2);box-shadow:0 0 6px var(--r2);}


/* ── STAT COUNTER ANIMATION ── */
@keyframes countpop{0%{transform:scale(1.3);opacity:.6}100%{transform:scale(1);opacity:1}}
.stat-val.pop{animation:countpop .3s cubic-bezier(.34,1.56,.64,1)}

/* ── PAGE SLIDE ── */
.page{transform:translateX(0);transition:none}
.page.slide-out-left{animation:slideOutLeft .18s ease forwards}
.page.slide-in-right{animation:slideInRight .18s ease forwards}
.page.slide-out-right{animation:slideOutRight .18s ease forwards}
.page.slide-in-left{animation:slideInLeft .18s ease forwards}
@keyframes slideOutLeft{to{opacity:0;transform:translateX(-24px)}}
@keyframes slideInRight{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideOutRight{to{opacity:0;transform:translateX(24px)}}
@keyframes slideInLeft{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
@keyframes autoBlob{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div id="moodLed"></div>
<canvas id="aurora"></canvas>
<canvas id="px"></canvas>

<!-- THEME HANDLE -->
<div class="theme-handle" id="themeHandle" onclick="openThemeDrawer()">
  <div class="theme-handle-dot" id="thd1"></div>
  <div class="theme-handle-dot" id="thd2"></div>
  <div class="theme-handle-dot" id="thd3"></div>
</div>
<!-- THEME OVERLAY -->
<div class="theme-overlay" id="themeOverlay" onclick="closeThemeDrawer()"></div>
<!-- THEME DRAWER -->
<div class="theme-drawer" id="themeDrawer">
  <div class="theme-drawer-title">Tema Seç</div>
  <div class="tc sel" data-theme="red" onclick="setTheme('red');closeThemeDrawer()">
    <div class="tc-blob" style="background:radial-gradient(circle at 40% 40%,#ff5252,#7f0000);box-shadow:0 0 14px #dc262660"></div>
    <div><div class="tc-name">Standart</div><div class="tc-sub">Kırmızı / Varsayılan</div></div>
    <span class="tc-check">✓</span>
  </div>
  <div class="tc" data-theme="auto" onclick="setTheme('auto');closeThemeDrawer()">
    <div class="tc-blob" id="autoBlobPreview" style="background:conic-gradient(#ff5252,#ffab40,#69f0ae,#82b1ff,#ce93d8,#ff5252);animation:autoBlob 3s linear infinite;box-shadow:0 0 14px rgba(255,100,100,.5)"></div>
    <div><div class="tc-name">Otomatik</div><div class="tc-sub">Renk Geçişi Animasyonu</div></div>
    <span class="tc-check">✓</span>
  </div>
</div>

<!-- SOUND BUTTON -->
<div class="sound-btn on" id="soundBtn" onclick="toggleSound()">
  <svg id="soundIc" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>
</div>
<!-- MUSIC BUTTON -->
<div class="music-btn" id="musicBtn" onclick="toggleMusic()">
  <svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
</div>

<!-- MUSIC PANEL -->
<div class="music-panel" id="musicPanel">
  <div class="mp-head">
    <div class="mp-title">
      <div class="mp-title-dot"></div>
      Müzik Çalar
    </div>
    <div class="mp-close-btn" onclick="toggleMusic()">✕</div>
  </div>
  <div class="mp-presets" id="mpPresets">
    <div class="mp-preset" onclick="playPreset('yoklama',this)">🔫 Yoklama</div>
    <div class="mp-preset" onclick="playPreset('simsek',this)">⚡ Şimşek</div>
    <div class="mp-preset" onclick="playPreset('olay',this)">🎯 Olay</div>
    <div class="mp-preset" onclick="playPreset('wesliye',this)">🗡️ Wesliye</div>
    <div class="mp-preset" onclick="playPreset('gercek',this)">🖤 Gerçek</div>
    <div class="mp-preset" onclick="playPreset('cephe',this)">🔥 Cephe</div>
    <div class="mp-preset" onclick="playPreset('lofi',this)">🎵 Lofi</div>
  </div>
  <div class="mp-input-row">
    <input type="url" id="mpUrlInput" class="mp-url-input" placeholder="YouTube veya Spotify URL yapıştır…" inputmode="url"/>
    <button class="mp-go-btn" onclick="loadMusicUrl()">
      <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
    </button>
  </div>
  <div class="mp-player" id="mpPlayer">
    <div class="mp-empty">▶ Hazır bir seç veya URL yapıştır</div>
  </div>
</div>


<svg style="display:none" xmlns="http://www.w3.org/2000/svg">
  <symbol id="ic-bot" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 8V5"/><circle cx="12" cy="4" r="1"/><path d="M7 13h0m10 0h0M9 17h6"/><path d="M3 14H2m20 0h1"/></symbol>
  <symbol id="ic-pulse" viewBox="0 0 24 24"><polyline points="2,12 6,12 8,5 11,19 13,9 15,15 17,12 22,12"/></symbol>
  <symbol id="ic-link" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></symbol>
  <symbol id="ic-settings" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></symbol>
  <symbol id="ic-filter" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></symbol>
  <symbol id="ic-webhook" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 000-6 3 3 0 00-3 3c0 .24.04.47.09.7L8.04 9.81A3 3 0 005 9a3 3 0 000 6 3 3 0 003.04-.91l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 002.92 2.92 2.92 2.92 0 002.92-2.92A2.92 2.92 0 0018 16.08z"/></symbol>
  <symbol id="ic-save" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></symbol>
  <symbol id="ic-chevron-left" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></symbol>
  <symbol id="ic-chevron-right" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></symbol>
  <symbol id="ic-x" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></symbol>
  <symbol id="ic-bulb" viewBox="0 0 24 24"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1.3.5 2.4 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/></symbol>
  <symbol id="ic-tool" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></symbol>
  <symbol id="ic-shuffle" viewBox="0 0 24 24"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></symbol>
  <symbol id="ic-file-text" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></symbol>
  <symbol id="ic-terminal" viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></symbol>
  <symbol id="ic-plus" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></symbol>
  <symbol id="ic-trash" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></symbol>
  <symbol id="ic-eye" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></symbol>
  <symbol id="ic-eye-off" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></symbol>
  <symbol id="ic-lock" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></symbol>
</svg>

<!-- FLOATING TOP BAR -->
<div class="top-bar">
  <div class="logo">
    <img src="/admin/app-icon.jpg" alt="E"
      onerror="this.outerHTML='<div class=logo-fallback>E</div>'"/>
  </div>
  <div class="hdr-info">
    <div class="hdr-title" id="hdrTitle">EmossDev Panel</div>
    <div class="hdr-clock" id="hdrClock">--:--:--</div>
  </div>
  <div class="hdr-right">
    <div class="status-badge" id="statusBadge">
      <div class="sdot-wrap">
        <div class="sdot-ping" id="sdotPing"></div>
        <div class="sdot" id="sdot"></div>
      </div>
      <span class="sbadge-text" id="sbadgeText">…</span>
    </div>
    <div class="ping-badge-sm" id="pingBadge" title="API gecikme süresi">● <span id="pingMs">— ms</span></div>
  </div>
</div>

<!-- SCROLL AREA -->
<div class="scroll-area" id="scrollArea">

  <!-- DURUM -->
  <div class="page active" id="page-status">
    <div class="stat-row" id="statRow">
      <div class="stat-card" draggable="true" data-idx="0">
        <div class="stat-val" id="statId">—</div>
        <div class="stat-lbl">Bot ID</div>
      </div>
      <div class="stat-card" draggable="true" data-idx="1">
        <div class="stat-val" id="statPend">—</div>
        <div class="stat-lbl">Bekleyen</div>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="ci blue"><svg><use href="#ic-bot"/></svg></div>
        <span class="card-label">Bot Bilgileri</span>
        <span style="margin-left:auto;font-size:10px;color:var(--muted);font-weight:600" id="lastRef"></span>
      </div>
      <div class="card-body">
        <div class="uptime-badge" id="uptimeBadge">00:00:00</div>
        <canvas id="ekg"></canvas>
        <div class="info-grid" id="infoGrid">
          <div class="info-cell"><label>Ad</label><span style="color:var(--muted)">—</span></div>
          <div class="info-cell"><label>Kullanıcı Adı</label><span style="color:var(--muted)">—</span></div>
        </div>
        <div class="refresh-bar"><div class="refresh-fill" id="rfFill"></div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="ci orange"><svg><use href="#ic-webhook"/></svg></div>
        <span class="card-label">Webhook</span>
      </div>
      <div class="card-body">
        <div class="wh-box">
          <div class="wh-lbl">Aktif URL</div>
          <div class="wh-url" id="wbDisp">Yükleniyor…</div>
        </div>
      </div>
    </div>
  </div>

  <!-- BOT KONTROL -->
  <div class="page" id="page-webhook">
    <div class="card" style="overflow:visible">
      <div class="card-head">
        <div class="ci orange"><svg><use href="#ic-webhook"/></svg></div>
        <span class="card-label">Bot Kontrol</span>
        <div style="margin-left:auto;display:flex;align-items:center;gap:6px">
          <div class="info-cell" style="text-align:right;margin:0">
            <label style="font-size:10px">Bekleyen</label>
            <span id="wbPend" style="font-size:12px;font-weight:700">—</span>
          </div>
        </div>
      </div>
      <div class="card-body" style="padding:0 0 4px">
        <div class="bot-power-scene" id="botPowerScene">
          <div class="bot-power-outer">
            <div class="bp-ring r1"></div>
            <div class="bp-ring r2"></div>
            <div class="bp-ring r3"></div>
            <div class="bot-power-btn" id="botPowerBtn" onclick="toggleBot()">
              <svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
            </div>
          </div>
          <div class="bot-power-label" id="botPowerLabel">BOT KAPALI</div>
          <div class="bot-mode-chips">
            <div class="bchip" id="chipWh">Webhook</div>
            <div class="bchip on-poll" id="chipPoll">Polling</div>
          </div>
          <div class="bot-url-box">
            <div class="bu-lbl">Webhook URL</div>
            <div class="bu-input-wrap">
              <input type="url" id="botWhUrl" class="bu-input" placeholder="https://…/bot/" inputmode="url" autocomplete="off" spellcheck="false"/>
            </div>
            <div style="font-size:10px;color:var(--muted);margin-top:5px;line-height:1.4">config.json'dan otomatik yüklenir — değiştirip <strong style="color:var(--r3)">Botu Aç</strong>'a basarsan güncellenir</div>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="ci green"><svg><use href="#ic-pulse"/></svg></div>
        <span class="card-label">İstatistikler</span>
      </div>
      <div class="card-body">
        <div class="info-grid">
          <div class="info-cell"><label>Mod</label><span id="wbMode">—</span></div>
          <div class="info-cell"><label>Son Yenileme</label><span id="wbLastRef">—</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- AYARLAR -->
  <div class="page" id="page-config">
    <div class="card">
      <div class="card-head">
        <div class="ci purple"><svg><use href="#ic-settings"/></svg></div>
        <span class="card-label">Bot Yapılandırması</span>
      </div>
      <div class="card-body">
        <div class="field"><label>Grup Chat ID</label><input id="cfg_chat_id" type="text" placeholder="-100…" inputmode="numeric"/></div>
        <div class="field"><label>Özel Chat ID</label><input id="cfg_pchat" type="text" placeholder="-528…" inputmode="numeric"/></div>
        <div class="field"><label>Creator ID</label><input id="cfg_creator" type="text" placeholder="757…" inputmode="numeric"/></div>
        <input id="cfg_wh" type="hidden"/>
        <button class="btn btn-red" onclick="doSaveConfig()"><svg><use href="#ic-save"/></svg>Ayarları Kaydet</button>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="ci red"><svg><use href="#ic-lock"/></svg></div>
        <span class="card-label">Bot Token</span>
      </div>
      <div class="card-body">
        <div class="field" style="margin-bottom:10px">
          <label>Mevcut Token (gizli)</label>
          <input id="cfg_tokMasked" type="text" readonly style="color:var(--muted);font-family:'Courier New',monospace;font-size:12px"/>
        </div>
        <div class="field">
          <label>Yeni Token</label>
          <div style="position:relative">
            <input id="cfg_tokNew" type="password" placeholder="1234567890:ABCDEF…" style="padding-right:44px;font-family:'Courier New',monospace;font-size:13px"/>
            <button type="button" onclick="toggleTok()" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:4px;color:var(--muted);display:grid;place-items:center">
              <svg id="tokEye" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#ic-eye"/></svg>
            </button>
          </div>
        </div>
        <button class="btn btn-outline" onclick="doSaveToken()"><svg><use href="#ic-save"/></svg>Token Güncelle</button>
      </div>
    </div>
  </div>

  <!-- FİLTRELER -->
  <div class="page" id="page-filters">
    <div id="catView">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:0 2px">
        <span style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">Kategori</span>
        <span style="font-size:11px;color:var(--muted);font-weight:600" id="totalLbl"></span>
      </div>
      <div class="cat-grid" id="catGrid"></div>
    </div>
    <div id="listView" style="display:none">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div class="back-btn" onclick="showCats()" style="margin-bottom:0">
          <svg><use href="#ic-chevron-left"/></svg>Kategoriler
        </div>
        <button onclick="openNewFi()" style="
          margin-left:auto;display:flex;align-items:center;gap:6px;
          background:linear-gradient(120deg,#c0392b,#e74c3c,#ff6b6b,#e74c3c,#c0392b);
          background-size:300% auto;animation:btnshine 4s ease-in-out infinite;
          color:#fff;border:none;border-radius:14px;padding:10px 18px;
          font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;
          box-shadow:0 2px 16px rgba(220,38,38,.4),inset 0 1px 0 rgba(255,200,200,.2)">
          <svg width="15" height="15" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><use href="#ic-plus"/></svg>
          Komut Ekle
        </button>
      </div>
      <div class="card">
        <div class="card-head">
          <div class="ci red" id="listIcon"></div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:800" id="listCatName">—</div>
            <div style="font-size:11px;color:var(--muted)" id="listCatCnt"></div>
          </div>
        </div>
        <div class="card-body" style="padding:10px">
          <div class="fi-wrap" id="fiItems"></div>
        </div>
      </div>
    </div>
  </div>

</div>

<!-- FLOATING BOTTOM NAV -->
<div class="bottom-nav" id="bottomNav">
  <div class="nav-pill" id="navPill"></div>
  <div class="nb active" id="nb-status" onclick="switchTab('status',0,event)">
    <div class="n-ic"><svg><use href="#ic-pulse"/></svg></div>
    <span class="n-lbl">Durum</span>
  </div>
  <div class="nb" id="nb-webhook" onclick="switchTab('webhook',1,event)">
    <div class="n-ic"><svg><use href="#ic-webhook"/></svg></div>
    <span class="n-lbl">Bot</span>
  </div>
  <div class="nb" id="nb-config" onclick="switchTab('config',2,event)">
    <div class="n-ic"><svg><use href="#ic-settings"/></svg></div>
    <span class="n-lbl">Ayarlar</span>
  </div>
  <div class="nb" id="nb-filters" onclick="switchTab('filters',3,event)">
    <div class="n-ic"><svg><use href="#ic-filter"/></svg></div>
    <span class="n-lbl">Filtreler</span>
  </div>
</div>

<div class="toast" id="toast"></div>

<!-- EDIT MODAL -->
<div class="modal-bg" id="editModal" onclick="maybeClose(event)">
  <div class="modal" onclick="event.stopPropagation()">
    <div class="mpill" onclick="closeEdit()" style="cursor:pointer;padding:6px 0"></div>
    <div class="mini">
      <div class="mtitle" id="editName"></div>
      <div class="msub" id="editSub"></div>
      <div class="field"><label>Gönderilecek Metin</label><textarea id="editTxt" rows="6"></textarea></div>
      <div class="m-actions">
        <button class="btn btn-ghost btn-sm" style="width:auto;padding:10px 14px" onclick="closeEdit()"><svg><use href="#ic-x"/></svg></button>
        <button class="btn btn-outline" style="flex:1" onclick="doDelete()"><svg><use href="#ic-trash"/></svg>Sil</button>
        <button class="btn btn-red" style="flex:2" onclick="doSave()"><svg><use href="#ic-save"/></svg>Kaydet</button>
      </div>
    </div>
  </div>
</div>

<!-- NEW FILTER MODAL -->
<div class="modal-bg" id="newModal">
  <div class="modal" onclick="event.stopPropagation()">
    <div class="mpill" onclick="closeNew()" style="cursor:pointer;padding:6px 0"></div>
    <div class="mini">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">
        <div class="mtitle">Yeni Komut Ekle</div>
        <button class="btn btn-ghost btn-sm" style="width:auto;padding:6px 12px" onclick="closeNew()">Kapat</button>
      </div>
      <div class="msub"><span class="mtag" id="newCatLbl">—</span></div>
      <div class="field"><label>Komut Adı</label>
        <input id="newName" type="text" placeholder="ornek-komut" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"/>
      </div>
      <div class="field">
        <label>Tür</label>
        <div class="type-chips">
          <button type="button" class="type-chip sel-1" data-type="1" onclick="selType(1)">Metin</button>
          <button type="button" class="type-chip" data-type="2" onclick="selType(2)">Dosya</button>
          <button type="button" class="type-chip" data-type="3" onclick="selType(3)">Video</button>
          <button type="button" class="type-chip" data-type="0" onclick="selType(0)">Diğer</button>
        </div>
        <input type="hidden" id="newType" value="1"/>
      </div>
      <div class="field"><label>Metin / Açıklama</label>
        <textarea id="newTxt" rows="4" placeholder="İsteğe bağlı…"></textarea>
      </div>
      <div class="m-actions">
        <button class="btn btn-ghost btn-sm" style="width:auto;padding:10px 14px" onclick="closeNew()"><svg><use href="#ic-x"/></svg></button>
        <button class="btn btn-red" style="flex:1" onclick="doAdd()"><svg><use href="#ic-plus"/></svg>Komut Ekle</button>
      </div>
    </div>
  </div>
  <div onclick="closeNew()" style="flex:1;min-height:20px"></div>
</div>

<script>
const API='/api';
let filtersData={};
let editing=null;
let activeCat=null;
let refreshTimer=null;
const INTERVAL=5000;

const CAT_ICON={tools:'#ic-tool',mix:'#ic-shuffle',blog:'#ic-file-text',bashScript:'#ic-terminal'};
const CAT_BG={tools:'rgba(255,109,0,.14)',mix:'rgba(156,39,176,.14)',blog:'rgba(41,121,255,.14)',bashScript:'rgba(0,200,83,.14)'};
const CAT_STR={tools:'#ffab40',mix:'#ce93d8',blog:'#82b1ff',bashScript:'#69f0ae'};

const T_LBL={0:'Metin',1:'Metin',2:'Dosya',3:'Video'};
const T_CLS={0:'tb-0',1:'tb-1',2:'tb-2',3:'tb-3'};

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

// ── THEME ──
const THEMES={
  red:{r0:'#dc2626',r1:'#e53935',r2:'#ff5252',r3:'#ff8a80',glow:'#dc262640',
       bg:'#0a0000',card:'#130005',card2:'#18000a',card3:'#200010',
       border:'#280808',border2:'#3f1010',muted:'#905060',text2:'#ffd0d0',
       surface:'rgba(13,0,0,.88)'},
};
let curTheme='red';
let _autoTid=null;
let _autoHue=0;

function hsl2hex(h,s,l){
  s/=100;l/=100;
  const a=s*Math.min(l,1-l);
  const f=n=>{const k=(n+h/30)%12;const c=l-a*Math.max(-1,Math.min(k-3,9-k,1));return Math.round(255*c).toString(16).padStart(2,'0');};
  return '#'+f(0)+f(8)+f(4);
}
function applyAutoHue(h){
  const s=document.documentElement.style;
  const r0=hsl2hex(h,80,45);
  const r1=hsl2hex((h+12)%360,75,52);
  const r2=hsl2hex((h+24)%360,70,65);
  const r3=hsl2hex((h+36)%360,60,80);
  const glow=r0+'40';
  const bgH=(h+180)%360;
  const bg=hsl2hex(bgH,40,3);
  const card=hsl2hex(bgH,40,6);
  const card2=hsl2hex(bgH,38,8);
  const card3=hsl2hex(bgH,35,11);
  s.setProperty('--r0',r0);s.setProperty('--r1',r1);
  s.setProperty('--r2',r2);s.setProperty('--r3',r3);
  s.setProperty('--glow',glow);
  s.setProperty('--bg',bg);
  s.setProperty('--card',card);s.setProperty('--card2',card2);s.setProperty('--card3',card3);
  s.setProperty('--border',hsl2hex(bgH,30,12));
  s.setProperty('--border2',hsl2hex(bgH,28,18));
  s.setProperty('--muted',hsl2hex(h,30,50));
  s.setProperty('--surface-bg','rgba(0,0,0,.88)');
  document.body.style.background=bg;
  const dots=['thd1','thd2','thd3'];
  dots.forEach((id,i)=>{
    const el=document.getElementById(id);
    const c=hsl2hex((h+i*40)%360,80,55);
    if(el){el.style.background=c;el.style.boxShadow='0 0 6px '+c;}
  });
}
function startAutoTheme(){
  if(_autoTid)return;
  _autoTid=setInterval(()=>{
    _autoHue=(_autoHue+0.6)%360;
    applyAutoHue(_autoHue);
  },50);
}
function stopAutoTheme(){clearInterval(_autoTid);_autoTid=null;}

function applyThemeVars(t,name){
  stopAutoTheme();
  const s=document.documentElement.style;
  s.setProperty('--r0',t.r0);s.setProperty('--r1',t.r1);
  s.setProperty('--r2',t.r2);s.setProperty('--r3',t.r3);
  s.setProperty('--glow',t.glow);
  s.setProperty('--bg',t.bg);
  s.setProperty('--card',t.card);s.setProperty('--card2',t.card2);s.setProperty('--card3',t.card3);
  s.setProperty('--border',t.border);s.setProperty('--border2',t.border2);
  s.setProperty('--muted',t.muted);s.setProperty('--text2',t.text2);
  s.setProperty('--surface-bg',t.surface);
  document.body.style.background=t.bg;
  document.documentElement.setAttribute('data-theme',name);
  document.querySelectorAll('.tc').forEach(d=>d.classList.toggle('sel',d.dataset.theme===name));
  const dots=['thd1','thd2','thd3'];
  dots.forEach(id=>{const el=document.getElementById(id);if(el){el.style.background=t.r0;el.style.boxShadow='0 0 6px '+t.r0;}});
}
function setTheme(name){
  curTheme=name;
  if(name==='auto'){
    document.documentElement.setAttribute('data-theme','auto');
    document.querySelectorAll('.tc').forEach(d=>d.classList.toggle('sel',d.dataset.theme==='auto'));
    startAutoTheme();
  }else{
    const t=THEMES[name];if(!t)return;
    applyThemeVars(t,name);
  }
  playSound('click');
  localStorage.setItem('emoss-theme',name);
}
(function(){
  const saved=localStorage.getItem('emoss-theme');
  if(saved==='auto'){
    curTheme='auto';
    document.documentElement.setAttribute('data-theme','auto');
    document.querySelectorAll('.tc').forEach(d=>d.classList.toggle('sel',d.dataset.theme==='auto'));
    startAutoTheme();
  }else{
    const name=(saved&&THEMES[saved])?saved:'red';
    curTheme=name;
    applyThemeVars(THEMES[name],name);
  }
})();

// ── THEME DRAWER ──
function openThemeDrawer(){
  document.getElementById('themeDrawer').classList.add('open');
  document.getElementById('themeOverlay').classList.add('open');
}
function closeThemeDrawer(){
  document.getElementById('themeDrawer').classList.remove('open');
  document.getElementById('themeOverlay').classList.remove('open');
}

// ── SOUND ──
let soundOn=true;
const AC=window.AudioContext||window.webkitAudioContext;
let ac=null;
function getAC(){if(!ac&&AC){try{ac=new AC();}catch(e){}}return ac;}
function beep(freq=440,dur=0.06,vol=0.08,type='sine'){
  const a=getAC();if(!a||!soundOn)return;
  const o=a.createOscillator();const g=a.createGain();
  o.connect(g);g.connect(a.destination);
  o.type=type;o.frequency.value=freq;
  g.gain.setValueAtTime(vol,a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);
  o.start();o.stop(a.currentTime+dur);
}
function playSound(type){
  if(!soundOn)return;
  if(type==='click')beep(600,0.05,0.06,'sine');
  else if(type==='ok')beep(880,0.08,0.08,'sine');
  else if(type==='err'){beep(200,0.1,0.1,'sawtooth');}
  else if(type==='notify'){beep(1000,0.04,0.06,'sine');setTimeout(()=>beep(1300,0.04,0.06,'sine'),80);}
}
function toggleSound(){
  soundOn=!soundOn;
  const btn=document.getElementById('soundBtn');
  btn.classList.toggle('on',soundOn);
  if(soundOn)playSound('notify');
}

// ── PING MS ──
const pingHistory=[];
async function measurePing(){
  const t0=performance.now();
  try{
    await fetch(API+'/bot/status',{method:'HEAD',cache:'no-store'}).catch(()=>{});
    const ms=Math.round(performance.now()-t0);
    pingHistory.push(ms);
    if(pingHistory.length>20)pingHistory.shift();
    const el=document.getElementById('pingMs');
    const badge=document.getElementById('pingBadge');
    el.textContent=ms+' ms';
    badge.className='ping-badge-sm'+(ms>500?' slow':ms>200?'':' fast');
  }catch{}
}
setInterval(measurePing,4000);
measurePing();


// ── ANIMATED COUNTER ──
function animCount(el,from,to){
  if(from===to){el.textContent=to;return;}
  const dur=600,steps=20,step=(to-from)/steps;
  let cur=from,n=0;
  const t=setInterval(()=>{
    n++;cur+=step;
    el.textContent=Math.round(n>=steps?to:cur);
    if(n>=steps){clearInterval(t);el.textContent=to;el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');}
  },dur/steps);
}

// ── AURORA WALLPAPER ──
(function(){
  const cv=document.getElementById('aurora');
  const ctx=cv.getContext('2d');
  let W,H,t=0;
  function resize(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;}
  resize();window.addEventListener('resize',resize);
  // Flowing wave layers
  function drawWave(y,amp,freq,phase,color,opacity){
    ctx.beginPath();
    ctx.moveTo(0,H);
    for(let x=0;x<=W;x+=3){
      const wy=y+Math.sin(x*freq+phase)*amp+Math.sin(x*freq*.7+phase*1.3)*amp*.5;
      ctx.lineTo(x,wy);
    }
    ctx.lineTo(W,H);ctx.closePath();
    ctx.fillStyle=color.replace('$a',String(opacity));
    ctx.fill();
  }
  // Large orbs
  const orbs=[
    {x:.15,y:.25,r:.55,ox:.14,oy:.13,spd:.00055,spd2:.00073},
    {x:.85,y:.75,r:.45,ox:.12,oy:.16,spd:.00068,spd2:.00048},
    {x:.5, y:.5, r:.38,ox:.18,oy:.10,spd:.00080,spd2:.00090},
    {x:.25,y:.8, r:.3, ox:.10,oy:.14,spd:.00095,spd2:.00062},
  ];
  function getThemeColors(){
    const s=getComputedStyle(document.documentElement);
    return [
      s.getPropertyValue('--r0').trim()||'#dc2626',
      s.getPropertyValue('--glow').trim()||'#dc262640',
    ];
  }
  function hexToRgb(hex){
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return r+','+g+','+b;
  }
  function frame(){
    t++;
    ctx.clearRect(0,0,W,H);
    const [r0]=getThemeColors();
    const rgb=hexToRgb(r0.length>=7?r0:'#dc2626');
    const c='rgba('+rgb+',';
    // Draw flowing background waves from bottom
    drawWave(H*.82+Math.sin(t*.0008)*H*.06, H*.18, .007, t*.003,   'rgba('+rgb+',$a)', .07);
    drawWave(H*.74+Math.sin(t*.001)*H*.07,  H*.22, .009, t*.0025+1,'rgba('+rgb+',$a)', .05);
    drawWave(H*.66+Math.sin(t*.0012)*H*.08, H*.20, .011, t*.002+2, 'rgba('+rgb+',$a)', .04);
    // Draw floating orbs
    orbs.forEach((b,i)=>{
      const px=(b.x+Math.sin(t*b.spd)*b.ox)*W;
      const py=(b.y+Math.cos(t*b.spd2)*b.oy)*H;
      const rr=b.r*Math.min(W,H);
      const grad=ctx.createRadialGradient(px,py,0,px,py,rr);
      const base=(i===1)?'255,109,0':rgb; // accent orb stays orange-ish
      grad.addColorStop(0,'rgba('+base+',.22)');
      grad.addColorStop(.4,'rgba('+base+',.10)');
      grad.addColorStop(.75,'rgba('+base+',.04)');
      grad.addColorStop(1,'rgba('+base+',0)');
      ctx.beginPath();ctx.arc(px,py,rr,0,Math.PI*2);
      ctx.fillStyle=grad;ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  frame();
})();

// ── PARTICLES ──
(function(){
  const cv=document.getElementById('px');
  const ctx=cv.getContext('2d');
  let W,H,pts=[];
  function resize(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;}
  resize();window.addEventListener('resize',resize);
  const N=55;
  const COLORS=['rgba(220,38,38,','rgba(156,39,176,','rgba(255,109,0,'];
  for(let i=0;i<N;i++)pts.push({
    x:Math.random()*1200,y:Math.random()*900,
    vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,
    r:Math.random()*1.8+.6,c:COLORS[Math.floor(Math.random()*COLORS.length)]
  });
  const MAX=120;
  function frame(){
    ctx.clearRect(0,0,W,H);
    for(const p of pts){
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
    }
    for(let i=0;i<pts.length;i++){
      for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<MAX){
          const a=(1-d/MAX)*.4;
          ctx.beginPath();ctx.strokeStyle=pts[i].c+a+')';ctx.lineWidth=.7;
          ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke();
        }
      }
      ctx.beginPath();ctx.arc(pts[i].x,pts[i].y,pts[i].r,0,Math.PI*2);
      ctx.fillStyle=pts[i].c+'.7)';ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

// ── MOOD LED ──
function setMoodLed(online){
  const led=document.getElementById('moodLed');
  if(online){
    led.style.background='radial-gradient(ellipse 60% 40% at 50% 100%,rgba(0,200,83,.07) 0%,transparent 70%)';
  }else{
    led.style.background='radial-gradient(ellipse 60% 40% at 50% 100%,rgba(220,38,38,.09) 0%,transparent 70%)';
  }
}

// ── LOGO 3D HOVER ──
(function(){
  const logo=document.querySelector('.logo');
  if(!logo)return;
  logo.addEventListener('mousemove',e=>{
    const r=logo.getBoundingClientRect();
    const x=((e.clientX-r.left)/r.width-.5)*30;
    const y=((e.clientY-r.top)/r.height-.5)*-30;
    logo.style.transform='perspective(200px) rotateX('+y+'deg) rotateY('+x+'deg) scale(1.08)';
  });
  logo.addEventListener('mouseleave',()=>{logo.style.transform='';});
  logo.addEventListener('touchstart',()=>{
    logo.style.transform='perspective(200px) rotateX(-8deg) rotateY(8deg) scale(1.1)';
    setTimeout(()=>logo.style.transform='',400);
  },{passive:true});
})();

// ── EKG CANVAS ──
(function(){
  const cv=document.getElementById('ekg');
  if(!cv)return;
  const ctx=cv.getContext('2d');
  let botOnline=false;
  let t=0;
  let actLevel=0;   // 0..1, decays over time
  let actDecay=0;   // per-frame decay rate
  let spikeQueued=false;
  const H=52,pts=[];
  function resize(){cv.width=cv.offsetWidth||300;}
  resize();window.addEventListener('resize',resize);
  function getY(){
    if(!botOnline){
      // flat line with tiny noise when offline
      return H/2 + Math.sin(t*0.04)*1.5;
    }
    const amp=10+actLevel*28;   // 10..38px
    const cycle=90;
    const phase=(t%cycle)/cycle;
    if(phase<.08) return H/2;
    if(phase<.13) return H/2-amp*0.5;
    if(phase<.16) return H/2-amp;          // peak spike
    if(phase<.19) return H/2+amp*0.55;     // dip
    if(phase<.24) return H/2;
    return H/2+Math.sin(t*0.25)*(2+actLevel*5);
  }
  function frame(){
    t++;
    if(actLevel>0){actLevel=Math.max(0,actLevel-actDecay);}
    resize();
    const W=cv.width;
    pts.push(getY());
    if(pts.length>W)pts.shift();
    ctx.clearRect(0,0,W,H);
    const color=botOnline?'#00c853':'#dc2626';
    // glow trail
    if(botOnline&&actLevel>0.2){
      ctx.beginPath();
      ctx.strokeStyle='rgba(0,200,83,'+(actLevel*0.35)+')';
      ctx.lineWidth=4;
      ctx.shadowColor='#00c853';ctx.shadowBlur=12*actLevel;
      for(let i=0;i<pts.length;i++){i===0?ctx.moveTo(i,pts[i]):ctx.lineTo(i,pts[i]);}
      ctx.stroke();ctx.shadowBlur=0;
    }
    ctx.beginPath();
    ctx.strokeStyle=color;
    ctx.lineWidth=1.8;
    ctx.shadowColor=color;ctx.shadowBlur=botOnline?6+actLevel*10:3;
    for(let i=0;i<pts.length;i++){i===0?ctx.moveTo(i,pts[i]):ctx.lineTo(i,pts[i]);}
    ctx.stroke();ctx.shadowBlur=0;
    requestAnimationFrame(frame);
  }
  frame();
  window.ekgSetOnline=v=>{botOnline=v;};
  window.ekgActivity=()=>{
    actLevel=1;
    actDecay=0.015;  // ~67 frames to decay fully (~1s at 60fps)
  };
})();

// ── UPTIME COUNTDOWN ──
let uptimeStart=null;
function startUptime(){uptimeStart=Date.now();}
function tickUptime(){
  if(!uptimeStart)return;
  const s=Math.floor((Date.now()-uptimeStart)/1000);
  const h=String(Math.floor(s/3600)).padStart(2,'0');
  const m=String(Math.floor((s%3600)/60)).padStart(2,'0');
  const sc=String(s%60).padStart(2,'0');
  const el=document.getElementById('uptimeBadge');
  if(el)el.textContent=h+':'+m+':'+sc;
}
setInterval(tickUptime,1000);

// ── CLOCK ──
function tickClock(){
  const n=new Date();
  document.getElementById('hdrClock').textContent=
    n.getHours().toString().padStart(2,'0')+':'+
    n.getMinutes().toString().padStart(2,'0')+':'+
    n.getSeconds().toString().padStart(2,'0');
}
setInterval(tickClock,1000);tickClock();

// ── GLITCH ──
setInterval(()=>{
  const el=document.getElementById('hdrTitle');
  el.classList.add('glitch');
  setTimeout(()=>el.classList.remove('glitch'),200);
},7000);

// ── RIPPLE ──
function ripple(e){
  const btn=e.currentTarget;
  const r=document.createElement('span');
  const rect=btn.getBoundingClientRect();
  const size=Math.max(rect.width,rect.height);
  r.className='ripple';
  r.style.cssText='width:'+size+'px;height:'+size+'px;left:'+(e.clientX-rect.left-size/2)+'px;top:'+(e.clientY-rect.top-size/2)+'px';
  btn.appendChild(r);
  setTimeout(()=>r.remove(),500);
  playSound('click');
}
document.querySelectorAll('.btn').forEach(b=>b.addEventListener('click',ripple));

// ── COUNT UP ──
function countUp(el,target,dur=800){
  const start=Date.now();
  const from=parseInt(el.textContent)||0;
  const t=parseInt(target)||0;
  if(from===t)return;
  const tick=()=>{
    const p=Math.min((Date.now()-start)/dur,1);
    const ease=1-Math.pow(1-p,3);
    el.textContent=Math.round(from+(t-from)*ease);
    if(p<1)requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ── DRAG SORT WIDGETS ──
(function(){
  let dragEl=null;
  document.addEventListener('dragstart',e=>{
    const c=e.target.closest('.stat-card');if(!c)return;
    dragEl=c;c.classList.add('dragging');
  });
  document.addEventListener('dragend',e=>{
    const c=e.target.closest('.stat-card');if(!c)return;
    c.classList.remove('dragging');
    document.querySelectorAll('.stat-card').forEach(x=>x.classList.remove('drag-over'));
    dragEl=null;
  });
  document.addEventListener('dragover',e=>{
    e.preventDefault();
    const c=e.target.closest('.stat-card');
    if(!c||!dragEl||c===dragEl)return;
    document.querySelectorAll('.stat-card').forEach(x=>x.classList.remove('drag-over'));
    c.classList.add('drag-over');
  });
  document.addEventListener('drop',e=>{
    e.preventDefault();
    const c=e.target.closest('.stat-card');
    if(!c||!dragEl||c===dragEl)return;
    const row=document.getElementById('statRow');
    const children=[...row.querySelectorAll('.stat-card')];
    const fromI=children.indexOf(dragEl),toI=children.indexOf(c);
    if(fromI<toI)c.after(dragEl);else c.before(dragEl);
    c.classList.remove('drag-over');
    playSound('click');
  });
})();

// ── SHAKE TO REFRESH ──
(function(){
  let lastX=null,lastY=null,lastZ=null,lastShake=0;
  window.addEventListener('devicemotion',e=>{
    const a=e.accelerationIncludingGravity;
    if(!a)return;
    if(lastX===null){lastX=a.x;lastY=a.y;lastZ=a.z;return;}
    const dx=Math.abs(a.x-lastX),dy=Math.abs(a.y-lastY),dz=Math.abs(a.z-lastZ);
    lastX=a.x;lastY=a.y;lastZ=a.z;
    if(dx+dy+dz>35){
      const now=Date.now();
      if(now-lastShake>2000){
        lastShake=now;
        toast('📳 Sallama algılandı — yenileniyor…');
        loadStatus();
        document.querySelector('.scroll-area').style.animation='shakehint .3s ease';
        setTimeout(()=>document.querySelector('.scroll-area').style.animation='',400);
      }
    }
  },{passive:true});
})();

// ── STATUS ──
function setStatus(state,label){
  const badge=document.getElementById('statusBadge');
  badge.className='status-badge '+state;
  document.getElementById('sbadgeText').textContent=label;
  const online=state==='st-online';
  setMoodLed(online);
  if(window.ekgSetOnline)window.ekgSetOnline(online);
  if(online&&window.ekgActivity)window.ekgActivity();
}

// ── NAV PILL ──
const TABS=['status','webhook','config','filters'];
function movePill(idx){
  const pill=document.getElementById('navPill');
  const nav=document.getElementById('bottomNav');
  const w=nav.offsetWidth;
  const slotW=w/4;
  pill.style.transform='translateX('+(idx*slotW)+'px)';
}

// ── TABS ──
let curTabIdx=0;
function switchTab(tab,idx=0,e){
  const prev=curTabIdx;
  const goRight=idx>prev;
  TABS.forEach(t=>{
    const pg=document.getElementById('page-'+t);
    const isNext=t===tab;
    const isCur=pg.classList.contains('active');
    if(isCur&&!isNext){
      pg.classList.add(goRight?'slide-out-left':'slide-out-right');
      setTimeout(()=>{pg.classList.remove('active','slide-out-left','slide-out-right');},180);
    }
    if(isNext){
      pg.classList.add('active',goRight?'slide-in-right':'slide-in-left');
      setTimeout(()=>pg.classList.remove('slide-in-right','slide-in-left'),220);
    }
    document.getElementById('nb-'+t).classList.toggle('active',isNext);
  });
  curTabIdx=idx;
  movePill(idx);
  document.getElementById('scrollArea').scrollTop=0;
  playSound('click');
}

// ── TOAST ──
function toast(msg,ok=true){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast show '+(ok?'ok':'err');
  clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2800);
  playSound(ok?'notify':'err');
}

// ── REFRESH BAR ──
function resetBar(){
  const f=document.getElementById('rfFill');
  if(!f)return;
  f.style.animation='none';
  void f.offsetWidth;
  f.style.animation='rfprog '+INTERVAL+'ms linear,titleflow 1s linear infinite';
}

// ── LOAD STATUS ──
let firstLoad=true;
const prevVals={id:null,pend:null};
async function loadStatus(){
  try{
    const d=await fetch(API+'/bot/status').then(r=>r.json());
    if(d.ok&&d.me){
      if(firstLoad){startUptime();firstLoad=false;}
      const wb=d.webhook??{};
      const pend=wb.pending_update_count??0;
      const url=wb.url||'';
      setStatus(url?'st-online':'st-idle',url?'Aktif':'Devre Dışı');
      const elId=document.getElementById('statId');
      const elPend=document.getElementById('statPend');
      animCount(elId,prevVals.id??0,d.me.id);
      animCount(elPend,prevVals.pend??0,pend);
      prevVals.id=d.me.id;prevVals.pend=pend;
      document.getElementById('infoGrid').innerHTML=
        '<div class="info-cell"><label>Ad</label><span>'+esc(d.me.first_name)+'</span></div>'+
        '<div class="info-cell"><label>Kullanıcı Adı</label><span>@'+esc(d.me.username??'—')+'</span></div>';
      document.getElementById('wbDisp').textContent=url||'— (Polling)';
      document.getElementById('wbPend').textContent=pend>0?'⚠ '+pend:'✓ 0';
      document.getElementById('wbMode').textContent=url?'Webhook':'Polling';
      updateBotPower(!!url,url);
      const now=new Date();
      const ts=now.getHours().toString().padStart(2,'0')+':'+
        now.getMinutes().toString().padStart(2,'0')+':'+
        now.getSeconds().toString().padStart(2,'0');
      document.getElementById('lastRef').textContent=ts;
      const wbLR=document.getElementById('wbLastRef');
      if(wbLR)wbLR.textContent=ts;
    }else{
      setStatus('st-offline','Çevrimdışı');
      firstLoad=true;
    }
  }catch{setStatus('st-offline','Hata');firstLoad=true;}
  resetBar();
  // Kendini yeniden planla — setInterval yerine self-scheduling setTimeout
  clearTimeout(refreshTimer);
  refreshTimer=setTimeout(loadStatus,INTERVAL);
}

function startLoop(){
  clearTimeout(refreshTimer);
  refreshTimer=setTimeout(loadStatus,INTERVAL);
}

// ── BOT POWER ──
let botIsOn=false;
function updateBotPower(isOn,url){
  botIsOn=isOn;
  const scene=document.getElementById('botPowerScene');
  if(!scene)return;
  scene.classList.toggle('on',isOn);
  const lbl=document.getElementById('botPowerLabel');
  if(lbl)lbl.textContent=isOn?'BOT AÇIK':'BOT KAPALI';
  const chipWh=document.getElementById('chipWh');
  const chipPoll=document.getElementById('chipPoll');
  if(chipWh){chipWh.className='bchip'+(isOn?' on-wh':'');}
  if(chipPoll){chipPoll.className='bchip'+(isOn?'':' on-poll');}
  const urlInp=document.getElementById('botWhUrl');
  if(urlInp&&!urlInp.matches(':focus'))urlInp.value=url||'';
  // Header EKG'yi güncelle
  if(window.ekgSetOnline)window.ekgSetOnline(isOn);
}
let botBusy=false;
async function toggleBot(){
  if(botBusy)return;
  botBusy=true;
  const btn=document.getElementById('botPowerBtn');
  if(btn)btn.style.opacity='.5';
  try{
    if(botIsOn) await doDelWebhook();
    else await doSetWebhook();
  }finally{
    botBusy=false;
    if(btn)btn.style.opacity='';
  }
}

// ── WEBHOOK ──
async function doSetWebhook(){
  toast('🟢 Bot açılıyor…');
  // Sunucu kendi tünel log'undan URL'yi alıyor; fallback olarak input'taki değer body'e eklenir
  const urlInp=document.getElementById('botWhUrl');
  const manualUrl=urlInp?urlInp.value.trim():'';
  const body=manualUrl?JSON.stringify({webhookUrl:manualUrl}):'{}';
  const d=await fetch(API+'/bot/webhook/set',{method:'POST',headers:{'Content-Type':'application/json'},body}).then(r=>r.json());
  if(d.ok&&d.webhookUrl){
    // Sunucudan gelen gerçek URL'yi input'a yaz
    const inp=document.getElementById('botWhUrl');
    if(inp&&!inp.matches(':focus'))inp.value=d.webhookUrl;
  }
  toast(d.ok?'✓ Bot aktif — '+d.webhookUrl:'✗ '+(d.description||d.error||'Hata'),d.ok);
  if(d.ok){loadStatus();if(window.ekgActivity)window.ekgActivity();}
}
async function doDelWebhook(){
  toast('🔴 Bot kapatılıyor…');
  const d=await fetch(API+'/bot/webhook',{method:'DELETE'}).then(r=>r.json());
  toast(d.ok?'✓ Bot durduruldu — Polling modunda':'✗ '+(d.description||d.error||'Hata'),d.ok);
  if(d.ok)loadStatus();
}

// ── CONFIG ──
async function loadConfig(){
  const d=await fetch(API+'/bot/config').then(r=>r.json());
  document.getElementById('cfg_chat_id').value=d.chat_id??'';
  document.getElementById('cfg_pchat').value=d.private_chat_id??'';
  document.getElementById('cfg_creator').value=d.creator_id??'';
  document.getElementById('cfg_wh').value=d.webhookUrl??'';
  document.getElementById('cfg_tokMasked').value=d.token??'';
  // Bot Kontrol URL alanını doldur
  const bwu=document.getElementById('botWhUrl');
  if(bwu&&!bwu.matches(':focus')&&!bwu.value)bwu.value=d.webhookUrl??'';
}
async function doSaveConfig(){
  const body={
    chat_id:document.getElementById('cfg_chat_id').value,
    private_chat_id:document.getElementById('cfg_pchat').value,
    creator_id:document.getElementById('cfg_creator').value,
    webhookUrl:document.getElementById('cfg_wh').value
  };
  const d=await fetch(API+'/bot/config',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json());
  toast(d.ok?'✓ Ayarlar kaydedildi':'✗ Kaydetme hatası',d.ok);
}
async function doSaveToken(){
  const tok=document.getElementById('cfg_tokNew').value.trim();
  if(!tok){toast('✗ Token boş olamaz',false);return;}
  const d=await fetch(API+'/bot/config',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:tok})}).then(r=>r.json());
  if(d.ok){toast('✓ Token güncellendi');document.getElementById('cfg_tokNew').value='';await loadConfig();}
  else toast('✗ Token kaydedilemedi',false);
}
function toggleTok(){
  const i=document.getElementById('cfg_tokNew');
  const show=i.type==='password';i.type=show?'text':'password';
  document.getElementById('tokEye').querySelector('use').setAttribute('href',show?'#ic-eye-off':'#ic-eye');
}

// ── FILTERS ──
function selType(t){
  document.getElementById('newType').value=String(t);
  document.querySelectorAll('.type-chip').forEach(el=>{
    el.classList.remove('sel-0','sel-1','sel-2','sel-3');
    if(Number(el.dataset.type)===t)el.classList.add('sel-'+t);
  });
}

async function loadFilters(){
  try{
    const r=await fetch(API+'/bot/filters-detail');
    if(!r.ok)throw new Error('HTTP '+r.status);
    filtersData=await r.json();
  }catch(e){
    document.getElementById('catGrid').innerHTML=
      '<div style="grid-column:1/-1;text-align:center;padding:24px 12px;color:var(--muted);font-size:13px">'+
      '<svg style="width:32px;height:32px;stroke:var(--border2);fill:none;stroke-width:1.5;display:block;margin:0 auto 10px" viewBox="0 0 24 24"><use href="#ic-filter"/></svg>'+
      'Filtre verisi yüklenemedi<br><span style="color:var(--r3);font-size:11px;font-weight:700">data.json bulunamadı — Termux\'ta çalıştır</span></div>';
    document.getElementById('totalLbl').textContent='—';
    return;
  }
  renderCats();
}

function renderCats(){
  const total=Object.values(filtersData).reduce((a,b)=>a+b.length,0);
  document.getElementById('totalLbl').textContent=total+' komut';
  document.getElementById('catGrid').innerHTML=Object.keys(filtersData).map(cat=>{
    const href=CAT_ICON[cat]??'#ic-filter';
    const bg=CAT_BG[cat]??'rgba(220,38,38,.14)';
    const stroke=CAT_STR[cat]??'#ff8a80';
    const cnt=filtersData[cat].length;
    return '<div class="cat-card'+(activeCat===cat?' sel':'')+'" data-cat="'+cat+'" onclick="showList(\''+esc(cat)+'\')">'+
      '<div class="cat-icon" style="background:'+bg+'">'+
        '<svg style="stroke:'+stroke+'" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><use href="'+href+'"/></svg>'+
      '</div>'+
      '<div class="cat-name">'+esc(cat)+'</div>'+
      '<div class="cat-count">'+cnt+'</div>'+
    '</div>';
  }).join('');
}

function showCats(){
  activeCat=null;
  document.getElementById('catView').style.display='';
  document.getElementById('listView').style.display='none';
}

function showList(cat){
  activeCat=cat;
  document.getElementById('catView').style.display='none';
  document.getElementById('listView').style.display='';
  const href=CAT_ICON[cat]??'#ic-filter';
  const stroke=CAT_STR[cat]??'#ff8a80';
  document.getElementById('listIcon').innerHTML=
    '<svg style="width:16px;height:16px;stroke:'+stroke+';fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><use href="'+href+'"/></svg>';
  document.getElementById('listCatName').textContent=cat;
  renderList(cat);
}

function renderList(cat){
  const items=filtersData[cat]??[];
  document.getElementById('listCatCnt').textContent=items.length+' komut';
  const wrap=document.getElementById('fiItems');
  if(!items.length){
    wrap.innerHTML='<div class="empty"><svg viewBox="0 0 24 24"><use href="#ic-filter"/></svg>Bu kategoride komut yok<br><span style="color:var(--r3);font-weight:700;display:block;margin-top:6px">Yukarıdaki + Yeni butonunu kullan</span></div>';
    return;
  }
  wrap.innerHTML=items.map(item=>{
    const tc=T_CLS[item.type]??'tb-1';
    const tl=T_LBL[item.type]??'?';
    const prev=(item.text||'').replace(/\n/g,' ').slice(0,55)+((item.text||'').length>55?'…':'');
    return '<div class="fi" onclick=\'openEdit('+JSON.stringify(JSON.stringify(item))+','+JSON.stringify(cat)+')\'>' +
      '<div class="fi-l">'+
        '<div class="fi-name">'+esc(item.name)+'</div>'+
        '<div class="fi-prev">'+(esc(prev)||'—')+'</div>'+
      '</div>'+
      '<span class="fi-tb '+tc+'">'+tl+'</span>'+
      '<div class="fi-chev"><svg viewBox="0 0 24 24"><use href="#ic-chevron-right"/></svg></div>'+
    '</div>';
  }).join('');
}

// Edit modal
function openEdit(itemJson,cat){
  const item=JSON.parse(itemJson);editing={item,cat};
  document.getElementById('editName').textContent=item.name;
  document.getElementById('editSub').innerHTML='<span class="mtag">'+esc(cat)+'</span><span class="mtag">'+(T_LBL[item.type]??'?')+'</span>';
  document.getElementById('editTxt').value=item.text??'';
  document.getElementById('editModal').classList.add('open');
}
function closeEdit(){document.getElementById('editModal').classList.remove('open');editing=null;}
function maybeClose(e){if(e.target===document.getElementById('editModal'))closeEdit();}

async function doSave(){
  if(!editing)return;
  const{item,cat}=editing;
  const text=document.getElementById('editTxt').value;
  const d=await fetch(API+'/bot/filters/'+cat+'/'+item.key,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})}).then(r=>r.json());
  if(d.ok){
    toast('✓ '+item.name+' güncellendi');
    item.text=text;
    const idx=filtersData[cat].findIndex(x=>x.key===item.key);
    if(idx>=0)filtersData[cat][idx].text=text;
    renderList(cat);closeEdit();
  }else toast('✗ Kaydetme hatası',false);
}
async function doDelete(){
  if(!editing)return;
  const{item,cat}=editing;
  if(!confirm('"'+item.name+'" silinsin mi?'))return;
  const d=await fetch(API+'/bot/filters/'+cat+'/'+item.key,{method:'DELETE'}).then(r=>r.json());
  if(d.ok){
    toast('✓ '+item.name+' silindi');
    filtersData[cat]=filtersData[cat].filter(x=>x.key!==item.key);
    closeEdit();renderList(cat);renderCats();
  }else toast('✗ Silme hatası',false);
}

// New filter modal
let newCat=null;
function openNewFi(){
  newCat=activeCat;
  document.getElementById('newCatLbl').textContent=newCat??'—';
  document.getElementById('newName').value='';
  document.getElementById('newTxt').value='';
  selType(1);
  document.getElementById('newModal').classList.add('open');
  setTimeout(()=>document.getElementById('newName').focus(),350);
}
function closeNew(){document.getElementById('newModal').classList.remove('open');newCat=null;}

async function doAdd(){
  const cat=newCat;
  const name=document.getElementById('newName').value.trim();
  const type=document.getElementById('newType').value;
  const text=document.getElementById('newTxt').value;
  if(!name){toast('✗ Komut adı boş olamaz',false);return;}
  const d=await fetch(API+'/bot/filters/'+cat,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,type,text})}).then(r=>r.json());
  if(d.ok){
    toast('✓ '+name+' eklendi');
    if(!filtersData[cat])filtersData[cat]=[];
    filtersData[cat].push({key:d.key??name,name,type,text});
    closeNew();renderList(cat);renderCats();
  }else toast('✗ '+(d.error||'Ekleme hatası'),false);
}

// ── MUSIC PANEL (YouTube / Spotify) ──
(function(){
  let panelOpen=false;

  // Hazır playlist'ler (sadece YouTube)
  const PRESETS={
    yoklama:{type:'yt',id:'KGeY5ZW42-M'},
    simsek: {type:'yt',id:'eU4hSKU2yuU'},
    olay:   {type:'yt',id:'Df1Ew0s_e5c'},
    wesliye:{type:'yt',id:'WTx6wElGHe4'},
    gercek: {type:'yt',id:'tcUAi-l-h9k'},
    cephe:  {type:'yt',id:'G7e2KlYbFa0'},
    lofi:   {type:'yt-playlist',id:'PLQkQfzsIUwRYZtP0FDKL5HBhX0RL_LmEN'},
  };

  function buildEmbed(parsed){
    if(!parsed)return null;
    switch(parsed.type){
      case 'yt':          return 'https://www.youtube.com/embed/'+parsed.id+'?autoplay=1&loop=1&playlist='+parsed.id;
      case 'yt-playlist': return 'https://www.youtube.com/embed?listType=playlist&list='+parsed.id+'&autoplay=1';
      case 'sp-track':    return 'https://open.spotify.com/embed/track/'+parsed.id+'?utm_source=generator&theme=0';
      case 'sp-playlist': return 'https://open.spotify.com/embed/playlist/'+parsed.id+'?utm_source=generator&theme=0';
      case 'sp-album':    return 'https://open.spotify.com/embed/album/'+parsed.id+'?utm_source=generator&theme=0';
    }
    return null;
  }

  function parseUrl(raw){
    // YouTube watch
    let m=raw.match(/(?:youtube\.com\/watch\?.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if(m)return{type:'yt',id:m[1]};
    // YouTube playlist
    m=raw.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if(m&&raw.includes('youtube'))return{type:'yt-playlist',id:m[1]};
    // Spotify
    m=raw.match(/open\.spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    if(m)return{type:'sp-'+m[1],id:m[2]};
    return null;
  }

  function renderPlayer(parsed){
    const url=buildEmbed(parsed);
    if(!url){toast('✗ Desteklenmeyen URL',false);return;}
    const player=document.getElementById('mpPlayer');
    const panel=document.getElementById('musicPanel');
    if(!player)return;
    const isSpotify=parsed.type.startsWith('sp-');
    const h=isSpotify?152:200;
    player.innerHTML='<iframe src="'+url+'" height="'+h+'" allow="autoplay;clipboard-write;encrypted-media;fullscreen;picture-in-picture" loading="lazy" allowfullscreen></iframe>';
    if(panel)panel.classList.add('playing');
  }

  window.playPreset=function(key,el){
    const preset=PRESETS[key];if(!preset)return;
    document.querySelectorAll('.mp-preset').forEach(p=>p.classList.remove('active'));
    if(el)el.classList.add('active');
    document.getElementById('mpUrlInput').value='';
    renderPlayer(preset);
  };

  window.loadMusicUrl=function(){
    const inp=document.getElementById('mpUrlInput');
    const raw=inp?inp.value.trim():'';
    if(!raw)return;
    const parsed=parseUrl(raw);
    if(!parsed){toast('✗ YouTube veya Spotify linki gir',false);return;}
    document.querySelectorAll('.mp-preset').forEach(p=>p.classList.remove('active'));
    renderPlayer(parsed);
  };

  window.toggleMusic=function(){
    panelOpen=!panelOpen;
    const panel=document.getElementById('musicPanel');
    const btn=document.getElementById('musicBtn');
    if(panel)panel.classList.toggle('open',panelOpen);
    if(btn)btn.classList.toggle('on',panelOpen);
  };

  // Enter tuşuyla URL oynat
  document.addEventListener('DOMContentLoaded',()=>{
    const inp=document.getElementById('mpUrlInput');
    if(inp)inp.addEventListener('keydown',e=>{if(e.key==='Enter')loadMusicUrl();});
  });
})();

// Init
setStatus('st-checking','…');
async function loadTunnelUrl(){
  try{
    const d=await fetch(API+'/bot/tunnel-url').then(r=>r.json());
    if(d.ok&&d.tunnelUrl){
      const inp=document.getElementById('botWhUrl');
      if(inp&&!inp.matches(':focus'))inp.value=d.tunnelUrl;
    }
  }catch(_){}
}
loadStatus();loadConfig();loadFilters();loadTunnelUrl();
startLoop();
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden){loadStatus();startLoop();}
});
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/admin/sw.js',{scope:'/admin/'}).catch(()=>{});
}
</script>
</body>
</html>`;

router.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});
router.get("/app-icon.jpg", (_req, res) => {
  res.sendFile(resolve(process.cwd(), "artifacts/api-server/public/app-icon.jpg"));
});
router.get("/icon-192.png", (_req, res) => {
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(resolve(process.cwd(), "artifacts/api-server/public/appicon.png"));
});
router.get("/icon-512.png", (_req, res) => {
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(resolve(process.cwd(), "artifacts/api-server/public/appicon.png"));
});
router.get("/splashsc.png", (_req, res) => {
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(resolve(process.cwd(), "artifacts/api-server/public/splashsc.png"));
});
router.get("/sw.js", (_req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Service-Worker-Allowed", "/admin/");
  res.send(`const CACHE='emossdev-v5';
const PRE=['/admin/','/admin/manifest.json','/admin/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRE)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(cache=>cache.put(e.request,c));}return res;})));});`);
});
router.get("/manifest.json", (_req, res) => {
  res.json({
    id:"/admin/",name:"EmossDev Panel",short_name:"EmossDev",
    description:"EmossDev Bot Yönetim Paneli",
    start_url:"/admin/",scope:"/admin/",display:"standalone",
    background_color:"#06000a",theme_color:"#dc2626",orientation:"portrait",lang:"tr",
    icons:[
      {src:"/admin/icon-192.png",sizes:"192x192",type:"image/png"},
      {src:"/admin/icon-512.png",sizes:"512x512",type:"image/png",purpose:"any maskable"},
    ],
  });
});

export default router;
