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
  --bg:#06000a;
  --card:#100118;--card2:#160220;--card3:#1e0330;
  --r0:#dc2626;--r1:#e53935;--r2:#ff5252;--r3:#ff8a80;
  --p0:#9c27b0;--p1:#ce93d8;
  --o0:#ff6d00;--o1:#ffab40;
  --g0:#00c853;--g1:#69f0ae;
  --b0:#2979ff;--b1:#82b1ff;
  --glow:#dc262640;--glow2:#dc262620;--glow3:#dc262610;
  --text:#fff8ff;--text2:#e8c8e8;--muted:#8050a0;
  --border:#220838;--border2:#30105a;
  --hdr-h:72px;--nav-h:76px;
  --hdr-top:12px;--nav-bot:12px;
}
html,body{height:100%;overflow:hidden;background:var(--bg)}
body{color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;position:relative;display:block}

/* ── ANIMATED BG ── */
body::before{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 70% 45% at 15% 15%,#dc262618 0%,transparent 65%),
    radial-gradient(ellipse 55% 40% at 88% 78%,#9c27b014 0%,transparent 65%),
    radial-gradient(ellipse 40% 55% at 55% 50%,#ff6d000a 0%,transparent 70%);
  animation:bgmove 10s ease-in-out infinite alternate;
}
@keyframes bgmove{
  0%{background:radial-gradient(ellipse 70% 45% at 15% 15%,#dc262618 0%,transparent 65%),radial-gradient(ellipse 55% 40% at 88% 78%,#9c27b014 0%,transparent 65%),radial-gradient(ellipse 40% 55% at 55% 50%,#ff6d000a 0%,transparent 70%)}
  50%{background:radial-gradient(ellipse 70% 45% at 30% 25%,#dc26261c 0%,transparent 65%),radial-gradient(ellipse 55% 40% at 72% 65%,#9c27b018 0%,transparent 65%),radial-gradient(ellipse 40% 55% at 45% 55%,#ff6d000e 0%,transparent 70%)}
  100%{background:radial-gradient(ellipse 70% 45% at 78% 18%,#dc262614 0%,transparent 65%),radial-gradient(ellipse 55% 40% at 20% 82%,#9c27b010 0%,transparent 65%),radial-gradient(ellipse 40% 55% at 62% 40%,#ff6d0008 0%,transparent 70%)}
}

/* ── FLOATING TOP BAR ── */
.top-bar{
  position:fixed;top:var(--hdr-top);left:12px;right:12px;z-index:50;
  height:var(--hdr-h);
  background:rgba(16,1,24,.82);
  backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);
  border-radius:24px;
  border:1px solid rgba(180,80,255,.18);
  box-shadow:0 4px 32px #00000060,0 0 0 .5px rgba(220,38,38,.15),inset 0 1px 0 rgba(255,255,255,.06);
  display:flex;align-items:center;padding:0 14px;gap:12px;overflow:hidden;
}
.top-bar::before{
  content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:linear-gradient(110deg,transparent 30%,rgba(220,38,38,.06) 50%,transparent 70%);
  animation:topscan 4s linear infinite;
}
@keyframes topscan{from{transform:translateX(-120%)}to{transform:translateX(120%)}}

.logo{width:42px;height:42px;border-radius:14px;flex-shrink:0;overflow:hidden;
  box-shadow:0 0 0 1.5px rgba(220,38,38,.3),0 0 20px #dc262630,0 2px 12px #00000060;
  position:relative}
.logo img{width:100%;height:100%;object-fit:cover;display:block}
.logo-fallback{width:100%;height:100%;background:linear-gradient(135deg,#7f0000,#220030);display:grid;place-items:center;font-weight:900;font-size:16px;color:var(--r3)}
.hdr-info{flex:1;min-width:0}
.hdr-title{
  font-size:15px;font-weight:900;letter-spacing:-.02em;
  background:linear-gradient(90deg,#ff8a80,#ff5252,#ce93d8,#ffab40,#ff5252,#ff8a80);
  background-size:300% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:titleflow 5s linear infinite;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
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
  background:linear-gradient(90deg,#69f0ae,#00e676,#69f0ae);
  background-size:200% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:titleflow 2s linear infinite,activepulse 1.6s ease-in-out infinite;
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
  background:linear-gradient(135deg,#dc262612,transparent 55%,#9c27b00a);
  animation:cardbreath 4s ease-in-out infinite alternate;
}
@keyframes cardbreath{from{opacity:.4}to{opacity:1}}
.stat-val{
  font-size:30px;font-weight:900;line-height:1;letter-spacing:-.04em;position:relative;
  background:linear-gradient(135deg,#ff8a80,#ce93d8,#ffab40);
  background-size:200% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:titleflow 4s linear infinite;
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
  background:linear-gradient(135deg,var(--r0),#8b0000 50%,#7f0000);
  background-size:200% auto;color:#fff;
  box-shadow:0 4px 20px var(--glow),0 0 0 1px rgba(220,38,38,.3);
  animation:btnshine 5s linear infinite;
}
@keyframes btnshine{from{background-position:0%}to{background-position:200%}}
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
  background:linear-gradient(90deg,var(--r3),var(--p1));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
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

/* ── FLOATING BOTTOM NAV ── */
.bottom-nav{
  position:fixed;bottom:var(--nav-bot);left:12px;right:12px;z-index:50;
  height:var(--nav-h);
  background:rgba(16,1,24,.88);
  backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);
  border-radius:26px;
  border:1px solid rgba(180,80,255,.18);
  box-shadow:0 4px 32px rgba(0,0,0,.7),0 0 0 .5px rgba(220,38,38,.12),inset 0 1px 0 rgba(255,255,255,.05);
  display:grid;grid-template-columns:repeat(4,1fr);
  overflow:hidden;
}
.bottom-nav::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent 5%,rgba(220,38,38,.5) 30%,rgba(156,39,176,.4) 70%,transparent 95%);
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
  background:linear-gradient(90deg,var(--r3),var(--p1));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
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
</style>
</head>
<body>

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
    <div class="hdr-title">EmossDev Panel</div>
    <div class="hdr-sub">Bot Yönetim Paneli</div>
  </div>
  <div class="status-badge" id="statusBadge">
    <div class="sdot-wrap">
      <div class="sdot-ping" id="sdotPing"></div>
      <div class="sdot" id="sdot"></div>
    </div>
    <span class="sbadge-text" id="sbadgeText">…</span>
  </div>
</div>

<!-- SCROLL AREA -->
<div class="scroll-area" id="scrollArea">

  <!-- DURUM -->
  <div class="page active" id="page-status">
    <div class="stat-row">
      <div class="stat-card"><div class="stat-val" id="statId">—</div><div class="stat-lbl">Bot ID</div></div>
      <div class="stat-card"><div class="stat-val" id="statPend">—</div><div class="stat-lbl">Bekleyen</div></div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="ci blue"><svg><use href="#ic-bot"/></svg></div>
        <span class="card-label">Bot Bilgileri</span>
        <span style="margin-left:auto;font-size:10px;color:var(--muted);font-weight:600" id="lastRef"></span>
      </div>
      <div class="card-body">
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
        <button class="btn btn-red" onclick="switchTab('webhook')">
          <svg><use href="#ic-link"/></svg>Webhook Yönet
        </button>
      </div>
    </div>
  </div>

  <!-- WEBHOOK -->
  <div class="page" id="page-webhook">
    <div class="banner">
      <div class="banner-icon"><svg><use href="#ic-bulb"/></svg></div>
      <p><strong>Ayarlar</strong>'dan URL'i değiştir, sonra <strong>Webhook Kur</strong>'a bas.</p>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="ci orange"><svg><use href="#ic-webhook"/></svg></div>
        <span class="card-label">İşlemler</span>
      </div>
      <div class="card-body">
        <div class="wh-box">
          <div class="wh-lbl">Kayıtlı URL</div>
          <div class="wh-url" id="wbActive">—</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn btn-red" onclick="doSetWebhook()"><svg><use href="#ic-link"/></svg>Webhook Kur / Güncelle</button>
          <button class="btn btn-outline" onclick="doDelWebhook()"><svg><use href="#ic-x"/></svg>Webhook Sil (Polling)</button>
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
          <div class="info-cell"><label>Bekleyen</label><span id="wbPend">—</span></div>
          <div class="info-cell"><label>Mod</label><span id="wbMode">—</span></div>
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
        <div class="field"><label>Webhook URL</label><input id="cfg_wh" type="url" placeholder="https://…/bot/"/></div>
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
        <button class="btn btn-red btn-sm" style="margin-left:auto;width:auto;padding:8px 16px" onclick="openNewFi()">
          <svg><use href="#ic-plus"/></svg>Yeni
        </button>
      </div>
      <div class="card">
        <div class="card-head">
          <div class="ci red" id="listIcon"></div>
          <div>
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
<div class="bottom-nav">
  <div class="nb active" id="nb-status" onclick="switchTab('status')">
    <div class="n-ic"><svg><use href="#ic-pulse"/></svg></div>
    <span class="n-lbl">Durum</span>
  </div>
  <div class="nb" id="nb-webhook" onclick="switchTab('webhook')">
    <div class="n-ic"><svg><use href="#ic-webhook"/></svg></div>
    <span class="n-lbl">Webhook</span>
  </div>
  <div class="nb" id="nb-config" onclick="switchTab('config')">
    <div class="n-ic"><svg><use href="#ic-settings"/></svg></div>
    <span class="n-lbl">Ayarlar</span>
  </div>
  <div class="nb" id="nb-filters" onclick="switchTab('filters')">
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

// ── STATUS ──
function setStatus(state,label){
  const badge=document.getElementById('statusBadge');
  badge.className='status-badge '+state;
  document.getElementById('sbadgeText').textContent=label;
}

// ── TABS ──
function switchTab(tab){
  ['status','webhook','config','filters'].forEach(t=>{
    document.getElementById('page-'+t).classList.toggle('active',t===tab);
    document.getElementById('nb-'+t).classList.toggle('active',t===tab);
  });
  document.getElementById('scrollArea').scrollTop=0;
}

// ── TOAST ──
function toast(msg,ok=true){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast show '+(ok?'ok':'err');
  clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2800);
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
async function loadStatus(){
  try{
    const d=await fetch(API+'/bot/status').then(r=>r.json());
    if(d.ok&&d.me){
      setStatus('st-online','Aktif');
      const wb=d.webhook??{};
      const pend=wb.pending_update_count??0;
      const url=wb.url||'';
      document.getElementById('statId').textContent=d.me.id;
      document.getElementById('statPend').textContent=pend;
      document.getElementById('infoGrid').innerHTML=
        '<div class="info-cell"><label>Ad</label><span>'+esc(d.me.first_name)+'</span></div>'+
        '<div class="info-cell"><label>Kullanıcı Adı</label><span>@'+esc(d.me.username??'—')+'</span></div>';
      document.getElementById('wbDisp').textContent=url||'— (Polling)';
      document.getElementById('wbActive').textContent=url||'— (Polling)';
      document.getElementById('wbPend').textContent=pend>0?'⚠ '+pend:'✓ 0';
      document.getElementById('wbMode').textContent=url?'Webhook':'Polling';
      const now=new Date();
      document.getElementById('lastRef').textContent=
        now.getHours().toString().padStart(2,'0')+':'+
        now.getMinutes().toString().padStart(2,'0')+':'+
        now.getSeconds().toString().padStart(2,'0');
    }else{
      setStatus('st-offline','Çevrimdışı');
    }
  }catch{setStatus('st-offline','Hata');}
  resetBar();
}

function startLoop(){
  clearInterval(refreshTimer);
  refreshTimer=setInterval(loadStatus,INTERVAL);
}

// ── WEBHOOK ──
async function doSetWebhook(){
  toast('Webhook kuruluyor…');
  const d=await fetch(API+'/bot/webhook/set',{method:'POST'}).then(r=>r.json());
  toast(d.ok?'✓ Webhook kuruldu!':'✗ '+d.description,d.ok);
  if(d.ok)loadStatus();
}
async function doDelWebhook(){
  if(!confirm('Webhook silinsin mi?'))return;
  const d=await fetch(API+'/bot/webhook',{method:'DELETE'}).then(r=>r.json());
  toast(d.ok?'✓ Webhook silindi':'✗ '+d.description,d.ok);
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
  filtersData=await fetch(API+'/bot/filters-detail').then(r=>r.json());
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

// Init
setStatus('st-checking','…');
loadStatus();loadConfig();loadFilters();
startLoop();
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
