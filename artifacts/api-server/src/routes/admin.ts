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
  --bg:#080008;--bg2:#0d000d;
  --card:#120212;--card2:#1a031a;--card3:#220522;
  --r0:#dc2626;--r1:#e53935;--r2:#ff5252;--r3:#ff8a80;
  --p0:#9c27b0;--p1:#ce93d8;
  --o0:#ff6d00;--o1:#ffab40;
  --g0:#00c853;--g1:#69f0ae;
  --b0:#2979ff;--b1:#82b1ff;
  --glow:#dc262640;--glow2:#dc262620;--glow3:#dc262610;
  --text:#fff8ff;--text2:#e8c8e8;--muted:#9060a0;
  --border:#2a0a3a;--border2:#3d1550;
  --nav-h:64px;
}
html,body{height:100%;overflow:hidden}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;flex-direction:column;position:relative}

/* === ANIMATED BG MESH === */
body::before{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 80% 50% at 10% 10%, #dc262614 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 90% 80%, #9c27b010 0%, transparent 60%),
    radial-gradient(ellipse 40% 60% at 50% 50%, #ff6d0008 0%, transparent 70%);
  animation:bgshift 8s ease-in-out infinite alternate;
}
@keyframes bgshift{
  0%{background:radial-gradient(ellipse 80% 50% at 10% 10%,#dc262614 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 90% 80%,#9c27b010 0%,transparent 60%),radial-gradient(ellipse 40% 60% at 50% 50%,#ff6d0008 0%,transparent 70%)}
  50%{background:radial-gradient(ellipse 80% 50% at 30% 30%,#dc262618 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 70% 60%,#9c27b014 0%,transparent 60%),radial-gradient(ellipse 40% 60% at 50% 50%,#ff6d000c 0%,transparent 70%)}
  100%{background:radial-gradient(ellipse 80% 50% at 80% 20%,#dc262612 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 20% 90%,#9c27b00e 0%,transparent 60%),radial-gradient(ellipse 40% 60% at 60% 40%,#ff6d0008 0%,transparent 70%)}
}

/* === HEADER === */
header{
  position:relative;z-index:2;flex-shrink:0;
  padding:14px 16px 12px;
  display:flex;align-items:center;gap:12px;
  border-bottom:1px solid var(--border2);
  background:linear-gradient(180deg,#1a001a,#0d000d);
  overflow:hidden;
}
header::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,#dc262608,transparent);
  animation:hdrscan 3s linear infinite;
}
@keyframes hdrscan{from{transform:translateX(-100%)}to{transform:translateX(100%)}}

.logo{width:40px;height:40px;border-radius:12px;flex-shrink:0;overflow:hidden;position:relative;z-index:1;
  box-shadow:0 0 0 1.5px var(--border2),0 0 20px var(--glow),0 0 40px var(--glow2)}
.logo img{width:100%;height:100%;object-fit:cover;display:block}
.hdr-info{position:relative;z-index:1}
.hdr-info h1{font-size:16px;font-weight:800;letter-spacing:-.02em;
  background:linear-gradient(90deg,#ff8a80,#ff5252,#ce93d8,#ff8a80);
  background-size:200% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:gradshift 4s linear infinite}
@keyframes gradshift{from{background-position:0%}to{background-position:200%}}
.hdr-info p{font-size:11px;color:var(--muted);margin-top:1px}

/* STATUS BADGE */
.hdr-badge{margin-left:auto;position:relative;z-index:1;display:flex;align-items:center;gap:6px;
  background:var(--card2);border:1px solid var(--border2);border-radius:20px;padding:5px 11px 5px 8px}
.status-ring{position:relative;width:18px;height:18px;flex-shrink:0}
.status-ring svg{width:18px;height:18px;transform:rotate(-90deg)}
.status-ring .ring-bg{fill:none;stroke:#ffffff10;stroke-width:2}
.status-ring .ring-fill{fill:none;stroke-width:2;stroke-linecap:round;stroke-dasharray:50;stroke-dashoffset:50;transition:stroke-dashoffset 1s ease,stroke .5s}
.status-ring .ring-dot{transition:fill .5s}
.hdr-status-text{font-size:12px;font-weight:700;color:var(--text2)}

/* states */
.st-online .ring-fill{stroke:var(--g0);stroke-dashoffset:0;animation:ringpulse 2s ease-in-out infinite}
.st-online .ring-dot{fill:var(--g0)}
.st-online .hdr-status-text{color:var(--g1);animation:textglow-g 2s ease-in-out infinite}
.st-offline .ring-fill{stroke:var(--r0);stroke-dashoffset:15}
.st-offline .ring-dot{fill:var(--r2)}
.st-offline .hdr-status-text{color:var(--r3)}
.st-checking .ring-fill{stroke:var(--o0);stroke-dashoffset:25;animation:ringspin 1.5s linear infinite}
.st-checking .ring-dot{fill:var(--o1);animation:dotblink 1s ease-in-out infinite}
.st-checking .hdr-status-text{color:var(--o1)}
@keyframes ringpulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes ringspin{from{stroke-dashoffset:50}to{stroke-dashoffset:-50}}
@keyframes dotblink{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes textglow-g{0%,100%{text-shadow:0 0 8px #00c85380}50%{text-shadow:0 0 16px #00c853c0}}

/* === SCROLL === */
.scroll-area{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding-bottom:8px;position:relative;z-index:1}
.scroll-area::-webkit-scrollbar{display:none}

/* === PAGES === */
.page{display:none;padding:12px;flex-direction:column;gap:10px}
.page.active{display:flex}

/* === CARDS === */
.card{background:var(--card);border-radius:18px;border:1px solid var(--border2);overflow:hidden;position:relative}
.card::after{content:'';position:absolute;inset:0;pointer-events:none;border-radius:inherit;
  background:linear-gradient(135deg,#ffffff06 0%,transparent 50%,#ffffff03 100%)}
.card-head{padding:12px 14px 10px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border);
  background:linear-gradient(135deg,var(--card2),var(--card))}
.ci{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;flex-shrink:0}
.ci svg{width:16px;height:16px;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ci.red{background:#dc262618;box-shadow:0 0 8px #dc262620}.ci.red svg{stroke:var(--r3)}
.ci.orange{background:#ff6d0018;box-shadow:0 0 8px #ff6d0020}.ci.orange svg{stroke:var(--o1)}
.ci.green{background:#00c85318;box-shadow:0 0 8px #00c85320}.ci.green svg{stroke:var(--g1)}
.ci.blue{background:#2979ff18;box-shadow:0 0 8px #2979ff20}.ci.blue svg{stroke:var(--b1)}
.ci.purple{background:#9c27b018;box-shadow:0 0 8px #9c27b020}.ci.purple svg{stroke:var(--p1)}
.card-label{font-size:12px;font-weight:700;color:var(--text2);letter-spacing:.03em;text-transform:uppercase}
.card-body{padding:12px 14px}

/* === STAT CARDS === */
.stat-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.stat-card{
  background:var(--card);border:1px solid var(--border2);border-radius:16px;
  padding:14px 12px;text-align:center;position:relative;overflow:hidden;cursor:default;
}
.stat-card::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(135deg,#dc262610,transparent 50%,#9c27b008);
  animation:cardglow 3s ease-in-out infinite alternate;
}
@keyframes cardglow{from{opacity:.5}to{opacity:1}}
.stat-val{font-size:28px;font-weight:900;line-height:1;letter-spacing:-.03em;
  background:linear-gradient(135deg,var(--r3),var(--p1),var(--r2));
  background-size:200% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:gradshift 3s linear infinite}
.stat-lbl{font-size:10px;color:var(--muted);font-weight:600;margin-top:5px;text-transform:uppercase;letter-spacing:.05em}

/* === INFO CELLS === */
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.info-cell{background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:10px 12px;position:relative;overflow:hidden}
.info-cell::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#ffffff04,transparent);pointer-events:none}
.info-cell label{font-size:10px;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em}
.info-cell span{font-size:13px;font-weight:700;word-break:break-all}

/* === URL BOX === */
.wh-box{background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:11px 13px;margin-bottom:10px}
.wh-lbl{font-size:10px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px}
.wh-url{font-size:11px;color:var(--b1);word-break:break-all;line-height:1.5;font-family:'Courier New',monospace}

/* === BUTTONS === */
.btn{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;
  padding:13px;border-radius:14px;border:none;font-size:14px;font-weight:700;cursor:pointer;
  transition:.15s;font-family:inherit;position:relative;overflow:hidden}
.btn::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,#ffffff14,transparent);pointer-events:none}
.btn:active{transform:scale(.96);opacity:.85}
.btn svg{width:16px;height:16px;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}

.btn-red{
  background:linear-gradient(135deg,var(--r0),#7f0000 50%,var(--r0));
  background-size:200% auto;
  color:#fff;
  box-shadow:0 4px 20px var(--glow),0 0 0 1px #dc262630;
  animation:btnshine 4s linear infinite;
}
.btn-red svg{stroke:#fff}
@keyframes btnshine{0%{background-position:0%}100%{background-position:200%}}

.btn-outline-red{background:var(--card2);color:var(--r3);border:1.5px solid #dc262640}
.btn-outline-red svg{stroke:var(--r3)}
.btn-ghost{background:var(--card2);color:var(--muted);border:1px solid var(--border2)}
.btn-ghost svg{stroke:var(--muted)}
.btn-sm{padding:8px 13px;font-size:13px;border-radius:12px}
.btn-row{display:flex;gap:8px}
.btn-row .btn{flex:1}

/* === FORMS === */
.field{margin-bottom:10px}
.field label{display:block;font-size:10px;font-weight:700;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px}
.field input,.field textarea,.field select{
  width:100%;background:var(--card2);border:1.5px solid var(--border2);
  border-radius:12px;padding:11px 13px;color:var(--text);font-size:14px;
  outline:none;transition:.2s;font-family:inherit;appearance:none;-webkit-appearance:none}
.field textarea{resize:vertical;min-height:110px;line-height:1.6;font-size:13px}
.field input:focus,.field textarea:focus,.field select:focus{
  border-color:var(--r0);background:var(--card3);
  box-shadow:0 0 0 3px var(--glow2),0 0 20px var(--glow3)}
.field input::placeholder,.field textarea::placeholder{color:var(--muted)}

/* === TYPE CHIPS === */
.type-chips{display:flex;gap:7px;flex-wrap:wrap}
.type-chip{flex:1;min-width:70px;padding:9px 8px;border-radius:10px;
  border:1.5px solid var(--border2);background:var(--card2);
  color:var(--muted);font-size:12px;font-weight:700;cursor:pointer;
  text-align:center;transition:.15s;font-family:inherit}
.type-chip:active{transform:scale(.95)}
.type-chip.sel-1{border-color:var(--b0);color:var(--b1);background:#2979ff18;box-shadow:0 0 10px #2979ff20}
.type-chip.sel-2{border-color:var(--g0);color:var(--g1);background:#00c85318;box-shadow:0 0 10px #00c85320}
.type-chip.sel-3{border-color:var(--p0);color:var(--p1);background:#9c27b018;box-shadow:0 0 10px #9c27b020}
.type-chip.sel-0{border-color:var(--o0);color:var(--o1);background:#ff6d0018;box-shadow:0 0 10px #ff6d0020}

/* === CATEGORY GRID === */
.cat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px}
.cat-card{
  background:var(--card);border:1.5px solid var(--border);border-radius:16px;
  padding:18px 12px;cursor:pointer;transition:.2s;
  display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;
  position:relative;overflow:hidden}
.cat-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#ffffff05,transparent);pointer-events:none}
.cat-card:active{transform:scale(.95)}
.cat-card.active{border-color:var(--r0);
  box-shadow:0 0 20px var(--glow2),0 0 0 1px var(--r0)40;
  background:linear-gradient(135deg,#dc262610,var(--card))}
.cat-icon{width:50px;height:50px;border-radius:14px;display:grid;place-items:center;position:relative}
.cat-icon::after{content:'';position:absolute;inset:0;border-radius:inherit;opacity:.6;
  animation:iconpulse 3s ease-in-out infinite}
@keyframes iconpulse{0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 12px 2px currentColor}}
.cat-icon svg{width:26px;height:26px;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;position:relative;z-index:1}
.cat-card-name{font-size:13px;font-weight:800;color:var(--text2);letter-spacing:-.01em}
.cat-card-count{font-size:11px;color:var(--muted);font-weight:600;
  background:var(--card2);border:1px solid var(--border);border-radius:20px;padding:2px 9px}
.cat-card.active .cat-card-name{
  background:linear-gradient(90deg,var(--r3),var(--p1));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

/* === FILTER ITEMS === */
.filter-items-wrap{display:flex;flex-direction:column;gap:6px}
.filter-item{
  background:var(--card2);border:1px solid var(--border);border-radius:13px;
  padding:11px 13px;cursor:pointer;display:flex;align-items:center;gap:10px;
  transition:.15s;position:relative;overflow:hidden}
.filter-item::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;
  background:linear-gradient(180deg,var(--r0),var(--p0));border-radius:3px 0 0 3px;opacity:.6}
.filter-item:active{border-color:var(--r0);background:var(--card3)}
.fi-left{flex:1;min-width:0}
.fi-name{font-size:13px;font-weight:800;font-family:'Courier New',monospace;margin-bottom:3px;
  background:linear-gradient(90deg,var(--r3),var(--p1));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.fi-preview{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fi-type-badge{font-size:10px;padding:3px 8px;border-radius:20px;font-weight:700;flex-shrink:0}
.tb-1{background:#2979ff18;color:var(--b1);border:1px solid #2979ff30}
.tb-2{background:#00c85318;color:var(--g1);border:1px solid #00c85330}
.tb-3{background:#9c27b018;color:var(--p1);border:1px solid #9c27b030}
.tb-0{background:#ff6d0018;color:var(--o1);border:1px solid #ff6d0030}
.fi-chevron{flex-shrink:0;opacity:.4}
.fi-chevron svg{width:15px;height:15px;stroke:var(--muted);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}

.back-btn{display:inline-flex;align-items:center;gap:6px;color:var(--r3);
  background:var(--card2);border:1px solid var(--border2);border-radius:10px;
  padding:8px 13px;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:10px;width:fit-content}
.back-btn:active{opacity:.7}
.back-btn svg{width:15px;height:15px;stroke:var(--r3);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}

/* === INFO BANNER === */
.banner{background:var(--card2);border:1px solid var(--border2);border-radius:14px;
  padding:12px 14px;display:flex;gap:10px;align-items:flex-start}
.banner-icon svg{width:18px;height:18px;stroke:var(--o1);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;margin-top:1px}
.banner p{font-size:12px;color:var(--text2);line-height:1.5}
.banner strong{color:var(--r3)}

/* === BOTTOM NAV === */
.bottom-nav{
  height:var(--nav-h);flex-shrink:0;
  background:linear-gradient(0deg,#120012,#0d000d);
  border-top:1px solid var(--border2);
  display:grid;grid-template-columns:repeat(4,1fr);
  box-shadow:0 -4px 30px #dc262618;
  position:relative;z-index:2;
}
.bottom-nav::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,#dc262640,#9c27b030,transparent)}
.nav-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
  cursor:pointer;padding:8px 4px;transition:.15s;position:relative}
.nav-btn:active{opacity:.6}
.n-icon{width:26px;height:26px;border-radius:8px;display:grid;place-items:center;transition:.2s}
.n-icon svg{width:22px;height:22px;fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transition:.2s}
.n-label{font-size:10px;font-weight:600;color:var(--muted);transition:.2s}
.nav-btn.active .n-icon svg{stroke:var(--r3);filter:drop-shadow(0 0 6px var(--r0))}
.nav-btn.active .n-label{
  background:linear-gradient(90deg,var(--r3),var(--p1));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.nav-btn.active .n-icon{background:var(--glow3)}
.nav-btn.active::before{content:'';position:absolute;top:0;left:15%;right:15%;height:2px;
  background:linear-gradient(90deg,transparent,var(--r0),var(--p0),transparent);
  border-radius:0 0 4px 4px}

/* === MODAL === */
.modal-bg{display:none;position:fixed;inset:0;background:#00000098;z-index:100;
  align-items:flex-end;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.modal-bg.open{display:flex}
.modal{background:var(--bg2);border-top:2px solid var(--border2);border-radius:24px 24px 0 0;
  width:100%;max-height:92dvh;overflow-y:auto;animation:slideUp .22s cubic-bezier(.25,.8,.25,1);
  position:relative}
.modal::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,var(--r0),var(--p0),var(--r0),transparent)}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.modal-pill{width:36px;height:4px;background:var(--border2);border-radius:2px;margin:10px auto 0}
.modal-inner{padding:14px 16px 24px}
.modal-title{font-size:17px;font-weight:800;margin-bottom:2px;font-family:monospace;
  background:linear-gradient(90deg,var(--r3),var(--p1));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.modal-sub{font-size:12px;color:var(--muted);margin-bottom:14px;display:flex;gap:8px}
.modal-tag{background:var(--card2);border:1px solid var(--border2);border-radius:6px;padding:2px 8px;color:var(--text2);font-weight:600}
.modal-actions{display:flex;gap:8px;margin-top:12px}

/* === TOAST === */
.toast{position:fixed;bottom:76px;left:50%;transform:translateX(-50%) translateY(10px);
  border-radius:14px;padding:10px 18px;font-size:13px;font-weight:700;z-index:300;
  opacity:0;transition:.25s;pointer-events:none;white-space:nowrap;
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.toast.ok{background:#001a0899;border:1px solid #00c85340;color:var(--g1)}
.toast.err{background:#1a000099;border:1px solid #dc262640;color:var(--r3)}

/* === AUTO REFRESH INDICATOR === */
.refresh-bar{height:2px;background:var(--border);border-radius:1px;margin-top:8px;overflow:hidden}
.refresh-fill{height:100%;background:linear-gradient(90deg,var(--r0),var(--p0),var(--r0));
  background-size:200% auto;border-radius:1px;
  animation:refreshprogress 30s linear,gradshift 2s linear infinite}
@keyframes refreshprogress{from{width:100%}to{width:0%}}

/* === EMPTY STATE === */
.empty-state{text-align:center;padding:28px 16px;color:var(--muted);font-size:13px;font-weight:500}
.empty-state svg{width:36px;height:36px;stroke:var(--border2);fill:none;stroke-width:1.5;margin-bottom:10px;display:block;margin-inline:auto}
</style>
</head>
<body>

<svg style="display:none" xmlns="http://www.w3.org/2000/svg">
  <symbol id="ic-bot" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 8V5"/><circle cx="12" cy="4" r="1"/><path d="M7 13h0m10 0h0M9 17h6"/><path d="M3 14h-1m19 0h1"/></symbol>
  <symbol id="ic-pulse" viewBox="0 0 24 24"><polyline points="2,12 6,12 8,5 11,19 13,9 15,15 17,12 22,12"/></symbol>
  <symbol id="ic-link" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></symbol>
  <symbol id="ic-settings" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></symbol>
  <symbol id="ic-filter" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></symbol>
  <symbol id="ic-refresh" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></symbol>
  <symbol id="ic-save" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></symbol>
  <symbol id="ic-chevron-right" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></symbol>
  <symbol id="ic-chevron-left" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></symbol>
  <symbol id="ic-x" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></symbol>
  <symbol id="ic-bulb" viewBox="0 0 24 24"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1.3.5 2.4 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/></symbol>
  <symbol id="ic-tool" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></symbol>
  <symbol id="ic-shuffle" viewBox="0 0 24 24"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></symbol>
  <symbol id="ic-file-text" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></symbol>
  <symbol id="ic-terminal" viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></symbol>
  <symbol id="ic-telegram" viewBox="0 0 24 24"><path d="M21.19 3.25L2.05 10.55c-1.3.52-1.29 1.26-.24 1.59l4.85 1.51 1.89 5.75c.23.65.12.9.83.9.54 0 .78-.25 1.08-.54l2.6-2.52 5.41 3.99c1 .55 1.71.27 1.96-.93l3.55-16.7c.36-1.47-.56-2.13-1.89-1.45z"/></symbol>
  <symbol id="ic-webhook" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 000-6 3 3 0 00-3 3c0 .24.04.47.09.7L8.04 9.81A3 3 0 005 9a3 3 0 000 6 3 3 0 003.04-.91l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 002.92 2.92 2.92 2.92 0 002.92-2.92A2.92 2.92 0 0018 16.08z"/></symbol>
  <symbol id="ic-plus" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></symbol>
  <symbol id="ic-trash" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></symbol>
  <symbol id="ic-eye" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></symbol>
  <symbol id="ic-eye-off" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></symbol>
  <symbol id="ic-lock" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></symbol>
</svg>

<!-- HEADER -->
<header>
  <div class="logo">
    <img src="/admin/app-icon.jpg" alt="E" onerror="this.style.display='none'"/>
  </div>
  <div class="hdr-info">
    <h1>EmossDev Panel</h1>
    <p>Bot Yönetim Paneli</p>
  </div>
  <div class="hdr-badge" id="hdrBadge">
    <div class="status-ring">
      <svg viewBox="0 0 18 18">
        <circle class="ring-bg" cx="9" cy="9" r="7"/>
        <circle class="ring-fill" id="ringFill" cx="9" cy="9" r="7"/>
        <circle class="ring-dot" id="ringDot" cx="9" cy="9" r="3"/>
      </svg>
    </div>
    <span class="hdr-status-text" id="hdrStatus">…</span>
  </div>
</header>

<div class="scroll-area" id="scrollArea">

  <!-- DURUM -->
  <div class="page active" id="page-status">
    <div class="stat-row">
      <div class="stat-card"><div class="stat-val" id="statBotId">—</div><div class="stat-lbl">Bot ID</div></div>
      <div class="stat-card"><div class="stat-val" id="statPending">—</div><div class="stat-lbl">Bekleyen</div></div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="ci blue"><svg><use href="#ic-bot"/></svg></div>
        <span class="card-label">Bot Bilgileri</span>
        <span style="margin-left:auto;font-size:10px;color:var(--muted)" id="lastRefreshLbl"></span>
      </div>
      <div class="card-body">
        <div class="info-grid" id="infoGrid">
          <div class="info-cell"><label>Ad</label><span style="color:var(--muted)">—</span></div>
          <div class="info-cell"><label>Kullanıcı Adı</label><span style="color:var(--muted)">—</span></div>
        </div>
        <div class="refresh-bar"><div class="refresh-fill" id="refreshFill"></div></div>
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
          <div class="wh-url" id="wbUrlDisplay">Yükleniyor…</div>
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
          <div class="wh-url" id="wbActiveUrl">Yükleniyor…</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn btn-red" onclick="setWebhook()"><svg><use href="#ic-link"/></svg>Webhook Kur / Güncelle</button>
          <button class="btn btn-outline-red" onclick="deleteWebhook()"><svg><use href="#ic-x"/></svg>Webhook Sil (Polling)</button>
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
          <div class="info-cell"><label>Bekleyen</label><span id="wbPending">—</span></div>
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
        <div class="field"><label>Özel Chat ID</label><input id="cfg_private_chat_id" type="text" placeholder="-528…" inputmode="numeric"/></div>
        <div class="field"><label>Creator ID</label><input id="cfg_creator_id" type="text" placeholder="757…" inputmode="numeric"/></div>
        <div class="field"><label>Webhook URL</label><input id="cfg_webhookUrl" type="url" placeholder="https://…/bot/"/></div>
        <button class="btn btn-red" onclick="saveConfig()"><svg><use href="#ic-save"/></svg>Ayarları Kaydet</button>
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
          <input id="cfg_token_masked" type="text" readonly style="color:var(--muted);font-family:'Courier New',monospace;font-size:13px"/>
        </div>
        <div class="field">
          <label>Yeni Token</label>
          <div style="position:relative">
            <input id="cfg_token_new" type="password" placeholder="1234567890:ABCDEF…" style="padding-right:44px;font-family:'Courier New',monospace;font-size:13px"/>
            <button type="button" onclick="toggleTokenVis()" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:4px;color:var(--muted);display:grid;place-items:center">
              <svg id="tokenEyeIcon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#ic-eye"/></svg>
            </button>
          </div>
        </div>
        <button class="btn btn-outline-red" onclick="saveToken()"><svg><use href="#ic-save"/></svg>Token Güncelle</button>
      </div>
    </div>
  </div>

  <!-- FİLTRELER -->
  <div class="page" id="page-filters">
    <div id="filterCatView">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:0 2px">
        <span style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">Kategori Seç</span>
        <span style="font-size:11px;color:var(--muted);font-weight:600" id="totalCount"></span>
      </div>
      <div class="cat-grid" id="catGrid"></div>
    </div>
    <div id="filterListView" style="display:none">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div class="back-btn" onclick="showCatView()" style="margin-bottom:0">
          <svg><use href="#ic-chevron-left"/></svg>Kategoriler
        </div>
        <button class="btn btn-red btn-sm" style="margin-left:auto;width:auto;padding:8px 16px" onclick="openNewFilter()">
          <svg><use href="#ic-plus"/></svg>Yeni Ekle
        </button>
      </div>
      <div class="card">
        <div class="card-head">
          <div class="ci red" id="listCatIcon"></div>
          <div>
            <div style="font-size:13px;font-weight:800;color:var(--text)" id="listCatName">—</div>
            <div style="font-size:11px;color:var(--muted);font-weight:600" id="listCatCount"></div>
          </div>
        </div>
        <div class="card-body" style="padding:10px">
          <div class="filter-items-wrap" id="filterItems"></div>
        </div>
      </div>
    </div>
  </div>

</div>

<!-- BOTTOM NAV -->
<div class="bottom-nav">
  <div class="nav-btn active" id="nb-status" onclick="switchTab('status')">
    <div class="n-icon"><svg><use href="#ic-pulse"/></svg></div>
    <span class="n-label">Durum</span>
  </div>
  <div class="nav-btn" id="nb-webhook" onclick="switchTab('webhook')">
    <div class="n-icon"><svg><use href="#ic-webhook"/></svg></div>
    <span class="n-label">Webhook</span>
  </div>
  <div class="nav-btn" id="nb-config" onclick="switchTab('config')">
    <div class="n-icon"><svg><use href="#ic-settings"/></svg></div>
    <span class="n-label">Ayarlar</span>
  </div>
  <div class="nav-btn" id="nb-filters" onclick="switchTab('filters')">
    <div class="n-icon"><svg><use href="#ic-filter"/></svg></div>
    <span class="n-label">Filtreler</span>
  </div>
</div>

<div class="toast" id="toast"></div>

<!-- EDIT MODAL -->
<div class="modal-bg" id="editModal" onclick="maybeCloseModal(event)">
  <div class="modal">
    <div class="modal-pill"></div>
    <div class="modal-inner">
      <div class="modal-title" id="editTitle"></div>
      <div class="modal-sub" id="editSub"></div>
      <div class="field"><label>Gönderilecek Metin</label><textarea id="editText" rows="6"></textarea></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()"><svg><use href="#ic-x"/></svg></button>
        <button class="btn btn-outline-red" style="flex:1" onclick="deleteFilter()"><svg><use href="#ic-trash"/></svg>Sil</button>
        <button class="btn btn-red" style="flex:2" onclick="saveFilter()"><svg><use href="#ic-save"/></svg>Kaydet</button>
      </div>
    </div>
  </div>
</div>

<!-- NEW FILTER MODAL -->
<div class="modal-bg" id="newFilterModal">
  <div class="modal" onclick="event.stopPropagation()">
    <div class="modal-pill" onclick="closeNewModal()" style="cursor:pointer;padding:8px 0"></div>
    <div class="modal-inner">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <div class="modal-title">Yeni Komut Ekle</div>
        <button onclick="closeNewModal()" class="btn btn-ghost btn-sm" style="width:auto;padding:6px 12px">Kapat</button>
      </div>
      <div class="modal-sub"><span class="modal-tag" id="newFilterCatLabel">—</span></div>
      <div class="field">
        <label>Komut Adı</label>
        <input id="newFilterName" type="text" placeholder="ornek-komut" autocomplete="off" autocorrect="off" autocapitalize="off"/>
      </div>
      <div class="field">
        <label>Tür</label>
        <div class="type-chips">
          <button type="button" class="type-chip sel-1" data-type="1" onclick="selectType(1)">Metin</button>
          <button type="button" class="type-chip" data-type="2" onclick="selectType(2)">Dosya</button>
          <button type="button" class="type-chip" data-type="3" onclick="selectType(3)">Video</button>
          <button type="button" class="type-chip" data-type="0" onclick="selectType(0)">Diğer</button>
        </div>
        <input type="hidden" id="newFilterType" value="1"/>
      </div>
      <div class="field">
        <label>Metin / Açıklama</label>
        <textarea id="newFilterText" rows="4" placeholder="İsteğe bağlı…"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeNewModal()"><svg><use href="#ic-x"/></svg></button>
        <button class="btn btn-red" style="flex:1" onclick="addFilter()"><svg><use href="#ic-plus"/></svg>Ekle</button>
      </div>
    </div>
  </div>
  <div onclick="closeNewModal()" style="flex:1;min-height:20px"></div>
</div>

<script>
const BASE='/api';
let filtersData={};
let editingFilter=null;
let _autoRefreshTimer=null;
let _autoRefreshInterval=30000;

const catSvgIcon={tools:'#ic-tool',mix:'#ic-shuffle',blog:'#ic-file-text',bashScript:'#ic-terminal'};
const catBg={tools:'linear-gradient(135deg,#ff6d0020,#ff6d0008)',mix:'linear-gradient(135deg,#9c27b020,#9c27b008)',blog:'linear-gradient(135deg,#2979ff20,#2979ff08)',bashScript:'linear-gradient(135deg,#00c85320,#00c85308)'};
const catStroke={tools:'#ffab40',mix:'#ce93d8',blog:'#82b1ff',bashScript:'#69f0ae'};
const catGlow={tools:'#ff6d00',mix:'#9c27b0',blog:'#2979ff',bashScript:'#00c853'};

const typeLabel={'0':'Metin','1':'Metin','2':'Dosya','3':'Video'};
const typeCls={'0':'tb-0','1':'tb-1','2':'tb-2','3':'tb-3'};

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

function setStatus(state,label){
  const badge=document.getElementById('hdrBadge');
  badge.className='hdr-badge '+state;
  document.getElementById('hdrStatus').textContent=label;
}

function switchTab(tab){
  ['status','webhook','config','filters'].forEach(t=>{
    document.getElementById('page-'+t).classList.toggle('active',t===tab);
    document.getElementById('nb-'+t).classList.toggle('active',t===tab);
  });
  document.getElementById('scrollArea').scrollTop=0;
}

function toast(msg,ok=true){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast show '+(ok?'ok':'err');
  clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2800);
}

function restartRefreshBar(){
  const fill=document.getElementById('refreshFill');
  if(!fill)return;
  fill.style.animation='none';
  void fill.offsetWidth;
  fill.style.animation='refreshprogress '+(_autoRefreshInterval/1000)+'s linear, gradshift 2s linear infinite';
}

async function loadStatus(auto=false){
  if(!auto) setStatus('st-checking','Kontrol…');
  try{
    const d=await fetch(BASE+'/bot/status').then(r=>r.json());
    if(d.ok&&d.me){
      setStatus('st-online','Aktif');
      const wb=d.webhook??{};
      const pending=wb.pending_update_count??0;
      const wbUrl=wb.url||'';
      document.getElementById('statBotId').textContent=d.me.id;
      document.getElementById('statPending').textContent=pending;
      document.getElementById('infoGrid').innerHTML=
        '<div class="info-cell"><label>Ad</label><span>'+esc(d.me.first_name)+'</span></div>'+
        '<div class="info-cell"><label>Kullanıcı Adı</label><span>@'+esc(d.me.username??'')+'</span></div>';
      const disp=wbUrl||'— (Polling)';
      document.getElementById('wbUrlDisplay').textContent=disp;
      document.getElementById('wbActiveUrl').textContent=disp;
      document.getElementById('wbPending').textContent=pending>0?'⚠ '+pending:'✓ 0';
      document.getElementById('wbMode').textContent=wbUrl?'Webhook':'Polling';
      const now=new Date();
      document.getElementById('lastRefreshLbl').textContent=
        now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0')+':'+now.getSeconds().toString().padStart(2,'0')+'\'de yenilendi';
    }else{
      setStatus('st-offline','Çevrimdışı');
    }
  }catch(e){setStatus('st-offline','Hata');}
  restartRefreshBar();
}

function startAutoRefresh(){
  clearInterval(_autoRefreshTimer);
  _autoRefreshTimer=setInterval(()=>loadStatus(true),_autoRefreshInterval);
}

async function setWebhook(){
  toast('Webhook kuruluyor…');
  const d=await fetch(BASE+'/bot/webhook/set',{method:'POST'}).then(r=>r.json());
  toast(d.ok?'✓ Webhook kuruldu!':'✗ '+d.description,d.ok);
  if(d.ok)loadStatus();
}
async function deleteWebhook(){
  if(!confirm('Webhook silinsin mi?'))return;
  const d=await fetch(BASE+'/bot/webhook',{method:'DELETE'}).then(r=>r.json());
  toast(d.ok?'✓ Webhook silindi':'✗ '+d.description,d.ok);
  if(d.ok)loadStatus();
}

async function loadConfig(){
  const d=await fetch(BASE+'/bot/config').then(r=>r.json());
  document.getElementById('cfg_chat_id').value=d.chat_id??'';
  document.getElementById('cfg_private_chat_id').value=d.private_chat_id??'';
  document.getElementById('cfg_creator_id').value=d.creator_id??'';
  document.getElementById('cfg_webhookUrl').value=d.webhookUrl??'';
  document.getElementById('cfg_token_masked').value=d.token??'';
}
async function saveConfig(){
  const body={chat_id:document.getElementById('cfg_chat_id').value,private_chat_id:document.getElementById('cfg_private_chat_id').value,creator_id:document.getElementById('cfg_creator_id').value,webhookUrl:document.getElementById('cfg_webhookUrl').value};
  const d=await fetch(BASE+'/bot/config',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json());
  toast(d.ok?'✓ Ayarlar kaydedildi':'✗ Kaydetme hatası',d.ok);
}
async function saveToken(){
  const newTok=document.getElementById('cfg_token_new').value.trim();
  if(!newTok){toast('✗ Token boş olamaz',false);return;}
  const d=await fetch(BASE+'/bot/config',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:newTok})}).then(r=>r.json());
  if(d.ok){toast('✓ Token güncellendi');document.getElementById('cfg_token_new').value='';await loadConfig();}
  else toast('✗ Token kaydedilemedi',false);
}
function toggleTokenVis(){
  const inp=document.getElementById('cfg_token_new');
  const icon=document.getElementById('tokenEyeIcon');
  const show=inp.type==='password';
  inp.type=show?'text':'password';
  icon.querySelector('use').setAttribute('href',show?'#ic-eye-off':'#ic-eye');
}

function selectType(t){
  document.getElementById('newFilterType').value=String(t);
  document.querySelectorAll('.type-chip').forEach(el=>{
    el.classList.remove('sel-0','sel-1','sel-2','sel-3');
    if(Number(el.dataset.type)===t)el.classList.add('sel-'+t);
  });
}

async function loadFilters(){
  filtersData=await fetch(BASE+'/bot/filters-detail').then(r=>r.json());
  const total=Object.values(filtersData).reduce((a,b)=>a+b.length,0);
  document.getElementById('totalCount').textContent=total+' komut';
  document.getElementById('catGrid').innerHTML=Object.keys(filtersData).map(cat=>{
    const href=catSvgIcon[cat]??'#ic-filter';
    const bg=catBg[cat]??'linear-gradient(135deg,#dc262618,#dc262608)';
    const stroke=catStroke[cat]??'#ff8a80';
    const glow=catGlow[cat]??'#dc2626';
    const cnt=filtersData[cat].length;
    return '<div class="cat-card" data-cat="'+cat+'" onclick="showFilterList(\''+cat+'\')">'+
      '<div class="cat-icon" style="background:'+bg+';color:'+glow+'">'+
        '<svg style="stroke:'+stroke+'" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><use href="'+href+'"/></svg>'+
      '</div>'+
      '<div class="cat-card-name">'+esc(cat)+'</div>'+
      '<div class="cat-card-count">'+cnt+' komut</div>'+
    '</div>';
  }).join('');
}

function showCatView(){
  document.getElementById('filterCatView').style.display='';
  document.getElementById('filterListView').style.display='none';
  document.querySelectorAll('.cat-card').forEach(c=>c.classList.remove('active'));
}
function showFilterList(cat){
  document.querySelectorAll('.cat-card').forEach(c=>c.classList.toggle('active',c.dataset.cat===cat));
  document.getElementById('filterCatView').style.display='none';
  document.getElementById('filterListView').style.display='';
  const href=catSvgIcon[cat]??'#ic-filter';
  const stroke=catStroke[cat]??'#ff8a80';
  document.getElementById('listCatIcon').innerHTML='<svg style="width:16px;height:16px;stroke:'+stroke+';fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><use href="'+href+'"/></svg>';
  document.getElementById('listCatName').textContent=cat;
  const items=filtersData[cat]??[];
  document.getElementById('listCatCount').textContent=items.length+' komut';
  const wrap=document.getElementById('filterItems');
  if(!items.length){
    wrap.innerHTML='<div class="empty-state"><svg viewBox="0 0 24 24"><use href="#ic-filter"/></svg>Bu kategoride komut yok<br><span style="color:var(--r3);font-weight:700;margin-top:6px;display:block">+ Yeni Ekle butonunu kullan</span></div>';
    return;
  }
  wrap.innerHTML=items.map(item=>{
    const tl=typeLabel[item.type]??'?';
    const tc=typeCls[item.type]??'tb-1';
    const preview=(item.text||'').replace(/\n/g,' ').slice(0,60)+((item.text||'').length>60?'…':'');
    return '<div class="filter-item" onclick=\'openEdit('+JSON.stringify(JSON.stringify(item))+','+JSON.stringify(cat)+')\'>' +
      '<div class="fi-left"><div class="fi-name">'+esc(item.name)+'</div><div class="fi-preview">'+(esc(preview)||'—')+'</div></div>'+
      '<span class="fi-type-badge '+tc+'">'+tl+'</span>'+
      '<div class="fi-chevron"><svg viewBox="0 0 24 24"><use href="#ic-chevron-right"/></svg></div>'+
    '</div>';
  }).join('');
}

function openEdit(itemJson,cat){
  const item=JSON.parse(itemJson);editingFilter={item,cat};
  document.getElementById('editTitle').textContent=item.name;
  document.getElementById('editSub').innerHTML='<span class="modal-tag">'+esc(cat)+'</span><span class="modal-tag">'+(typeLabel[item.type]??'?')+'</span>';
  document.getElementById('editText').value=item.text??'';
  document.getElementById('editModal').classList.add('open');
}
function closeModal(){document.getElementById('editModal').classList.remove('open');editingFilter=null;}
function maybeCloseModal(e){if(e.target===document.getElementById('editModal'))closeModal();}

async function saveFilter(){
  if(!editingFilter)return;
  const{item,cat}=editingFilter;
  const text=document.getElementById('editText').value;
  const d=await fetch(BASE+'/bot/filters/'+cat+'/'+item.key,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})}).then(r=>r.json());
  if(d.ok){toast('✓ '+item.name+' güncellendi');item.text=text;const idx=filtersData[cat].findIndex(x=>x.key===item.key);if(idx>=0)filtersData[cat][idx].text=text;showFilterList(cat);closeModal();}
  else toast('✗ Kaydetme hatası',false);
}
async function deleteFilter(){
  if(!editingFilter)return;
  const{item,cat}=editingFilter;
  if(!confirm('"'+item.name+'" silinsin mi?'))return;
  const d=await fetch(BASE+'/bot/filters/'+cat+'/'+item.key,{method:'DELETE'}).then(r=>r.json());
  if(d.ok){toast('✓ '+item.name+' silindi');filtersData[cat]=filtersData[cat].filter(x=>x.key!==item.key);closeModal();showFilterList(cat);
    const total=Object.values(filtersData).reduce((a,b)=>a+b.length,0);
    document.getElementById('totalCount').textContent=total+' komut';
    document.getElementById('listCatCount').textContent=filtersData[cat].length+' komut';}
  else toast('✗ Silme hatası',false);
}

let currentNewCat=null;
function openNewFilter(){
  const cat=document.getElementById('listCatName').textContent;currentNewCat=cat;
  document.getElementById('newFilterCatLabel').textContent=cat;
  document.getElementById('newFilterName').value='';document.getElementById('newFilterText').value='';
  selectType(1);document.getElementById('newFilterModal').classList.add('open');
  setTimeout(()=>document.getElementById('newFilterName').focus(),300);
}
function closeNewModal(){document.getElementById('newFilterModal').classList.remove('open');currentNewCat=null;}
async function addFilter(){
  const cat=currentNewCat;
  const name=document.getElementById('newFilterName').value.trim();
  const type=document.getElementById('newFilterType').value;
  const text=document.getElementById('newFilterText').value;
  if(!name){toast('✗ Komut adı boş olamaz',false);return;}
  const d=await fetch(BASE+'/bot/filters/'+cat,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,type,text})}).then(r=>r.json());
  if(d.ok){toast('✓ '+name+' eklendi');if(!filtersData[cat])filtersData[cat]=[];filtersData[cat].push({key:d.key,name,type,text});closeNewModal();showFilterList(cat);
    document.getElementById('totalCount').textContent=Object.values(filtersData).reduce((a,b)=>a+b.length,0)+' komut';}
  else toast('✗ Ekleme hatası',false);
}

// Başlat
setStatus('st-checking','…');
loadStatus();loadConfig();loadFilters();
startAutoRefresh();
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
  res.send(`const CACHE='emossdev-v4';
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
    background_color:"#080008",theme_color:"#dc2626",orientation:"portrait",lang:"tr",
    icons:[
      {src:"/admin/icon-192.png",sizes:"192x192",type:"image/png"},
      {src:"/admin/icon-512.png",sizes:"512x512",type:"image/png",purpose:"any maskable"},
    ],
    shortcuts:[
      {name:"Bot Durumu",url:"/admin/?tab=status",icons:[{src:"/admin/icon-192.png",sizes:"192x192"}]},
      {name:"Filtreler",url:"/admin/?tab=filters",icons:[{src:"/admin/icon-192.png",sizes:"192x192"}]},
    ],
  });
});

export default router;
