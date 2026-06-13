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
<meta name="theme-color" content="#0d0d1a"/>
<link rel="manifest" href="/admin/manifest.json"/>
<link rel="apple-touch-icon" href="/admin/icon-512.png"/>
<title>EmossDev Panel</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
:root{
  --bg:#0a0a14;
  --bg2:#0f0f1e;
  --surface:#14142a;
  --surface2:#1a1a33;
  --surface3:#20203d;
  --red:#e53935;
  --red2:#ff5252;
  --red3:#ff8a80;
  --red-glow:#e5393530;
  --red-glow2:#e5393515;
  --green:#00e676;
  --yellow:#ffab40;
  --blue:#448aff;
  --purple:#ce93d8;
  --text:#f0f0ff;
  --text2:#b0b0cc;
  --muted:#6060aa;
  --border:#1e1e3a;
  --border2:#28285a;
  --nav-h:68px;
  --radius:18px;
  --radius-sm:12px;
  --radius-xs:8px;
}
html,body{height:100%;overflow:hidden}
body{
  background:var(--bg);
  color:var(--text);
  font-family:'Inter',system-ui,sans-serif;
  display:flex;flex-direction:column;
}

/* BG GLOW */
body::before{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 60% 40% at 20% 0%, #e5393512 0%, transparent 70%),
    radial-gradient(ellipse 50% 30% at 80% 100%, #7c4dff0a 0%, transparent 70%);
}

/* HEADER */
header{
  position:relative;z-index:1;
  background:linear-gradient(180deg,#12122400,#0a0a1400);
  backdrop-filter:blur(20px);
  -webkit-backdrop-filter:blur(20px);
  padding:16px 18px 14px;
  display:flex;align-items:center;gap:12px;
  border-bottom:1px solid var(--border);
  flex-shrink:0;
}
.logo{
  width:40px;height:40px;border-radius:14px;flex-shrink:0;
  overflow:hidden;
  box-shadow:0 0 0 1.5px var(--border2), 0 0 20px var(--red-glow);
}
.logo img{width:100%;height:100%;object-fit:cover;display:block}
.hdr-info h1{font-size:15px;font-weight:800;letter-spacing:-.02em;color:var(--text)}
.hdr-info p{font-size:11px;color:var(--muted);margin-top:1px;font-weight:500}
.hdr-pill{
  margin-left:auto;display:flex;align-items:center;gap:5px;
  background:var(--surface);border:1px solid var(--border2);
  border-radius:20px;padding:5px 10px 5px 7px;
}
.hdr-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.hdr-dot.on{background:var(--green);box-shadow:0 0 8px #00e67660;animation:gpulse 2s infinite}
.hdr-dot.off{background:var(--red2);box-shadow:0 0 8px var(--red-glow)}
.hdr-dot.checking{background:var(--yellow);animation:blink 1s infinite}
.hdr-status{font-size:11px;font-weight:700;color:var(--text2);letter-spacing:.01em}
@keyframes gpulse{0%,100%{opacity:1;box-shadow:0 0 8px #00e67660}50%{opacity:.6;box-shadow:0 0 4px #00e67630}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

/* SCROLL */
.scroll-area{
  flex:1;overflow-y:auto;overflow-x:hidden;
  -webkit-overflow-scrolling:touch;
  position:relative;z-index:1;
  padding-bottom:12px;
}
.scroll-area::-webkit-scrollbar{display:none}

/* PAGES */
.page{display:none;padding:14px;flex-direction:column;gap:12px}
.page.active{display:flex}

/* CARD */
.card{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--radius);
  overflow:hidden;
  position:relative;
}
.card::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(135deg,#ffffff06 0%,transparent 50%);
  border-radius:inherit;
}
.card-head{
  padding:12px 14px 11px;
  display:flex;align-items:center;gap:9px;
  border-bottom:1px solid var(--border);
  background:linear-gradient(180deg,var(--surface2),var(--surface));
}
.ci{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;flex-shrink:0}
.ci svg{width:16px;height:16px;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ci.red{background:#e5393518}.ci.red svg{stroke:var(--red3)}
.ci.orange{background:#ff6d0018}.ci.orange svg{stroke:#ffab40}
.ci.green{background:#00e67618}.ci.green svg{stroke:#69f0ae}
.ci.blue{background:#448aff18}.ci.blue svg{stroke:#82b1ff}
.ci.purple{background:#ce93d818}.ci.purple svg{stroke:#e1bee7}
.card-label{font-size:12px;font-weight:700;color:var(--text2);letter-spacing:.03em;text-transform:uppercase}
.card-body{padding:14px}

/* STAT CARDS */
.stat-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.stat-card{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);
  padding:14px 12px;text-align:center;position:relative;overflow:hidden;
}
.stat-card::after{
  content:'';position:absolute;inset:0;background:linear-gradient(135deg,#ffffff04,transparent);border-radius:inherit;
}
.stat-val{font-size:26px;font-weight:800;color:var(--red3);line-height:1;letter-spacing:-.02em}
.stat-lbl{font-size:10px;font-weight:600;color:var(--muted);margin-top:5px;text-transform:uppercase;letter-spacing:.05em}

/* INFO CELLS */
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.info-cell{
  background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:11px 12px;
}
.info-cell label{font-size:10px;color:var(--muted);font-weight:600;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em}
.info-cell span{font-size:13px;font-weight:700;word-break:break-all;color:var(--text)}

/* URL BOX */
.url-box{
  background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);
  padding:11px 13px;margin-bottom:12px;
}
.url-lbl{font-size:10px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px}
.url-val{font-size:12px;color:var(--blue);word-break:break-all;line-height:1.5;font-family:'Courier New',monospace}

/* BUTTONS */
.btn{
  display:flex;align-items:center;justify-content:center;gap:7px;
  width:100%;padding:13px 16px;border-radius:var(--radius-sm);
  border:none;font-size:14px;font-weight:700;cursor:pointer;
  transition:transform .12s, opacity .12s, box-shadow .12s;
  font-family:inherit;letter-spacing:-.01em;
  position:relative;overflow:hidden;
}
.btn::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,#ffffff12,transparent);pointer-events:none}
.btn:active{transform:scale(.96);opacity:.85}
.btn svg{width:16px;height:16px;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.btn-primary{
  background:linear-gradient(135deg,var(--red) 0%,#c62828 100%);
  color:#fff;
  box-shadow:0 4px 20px var(--red-glow),0 1px 0 #ff525240 inset;
}
.btn-primary svg{stroke:#fff}
.btn-outline{
  background:var(--surface2);color:var(--red3);
  border:1.5px solid #e5393530;
}
.btn-outline svg{stroke:var(--red3)}
.btn-ghost{background:var(--surface2);color:var(--text2);border:1px solid var(--border2)}
.btn-ghost svg{stroke:var(--text2)}
.btn-danger{
  background:linear-gradient(135deg,#b71c1c,#7f0000);
  color:#ffcdd2;
  box-shadow:0 4px 16px #b71c1c30;
}
.btn-danger svg{stroke:#ffcdd2}
.btn-sm{padding:8px 14px;font-size:13px;border-radius:var(--radius-xs)}
.btn-row{display:flex;gap:8px}
.btn-row .btn{flex:1}
.btn-icon{width:auto;padding:9px}
.btn-icon svg{width:18px;height:18px}

/* FORMS */
.field{margin-bottom:12px}
.field:last-child{margin-bottom:0}
.field label{
  display:block;font-size:10px;font-weight:700;color:var(--muted);
  letter-spacing:.06em;text-transform:uppercase;margin-bottom:7px;
}
.field input,.field textarea,.field select{
  width:100%;
  background:var(--surface2);
  border:1.5px solid var(--border2);
  border-radius:var(--radius-sm);
  padding:11px 14px;
  color:var(--text);
  font-size:14px;
  outline:none;
  transition:border-color .15s, box-shadow .15s, background .15s;
  font-family:inherit;
  appearance:none;
  -webkit-appearance:none;
}
.field textarea{resize:vertical;min-height:110px;line-height:1.6;font-size:13px}
.field input:focus,.field textarea:focus,.field select:focus{
  border-color:var(--red);
  background:var(--surface3);
  box-shadow:0 0 0 3px var(--red-glow2);
}
.field input::placeholder,.field textarea::placeholder{color:var(--muted)}
.select-wrap{position:relative}
.select-wrap::after{
  content:'';position:absolute;right:14px;top:50%;transform:translateY(-50%);
  border-left:5px solid transparent;border-right:5px solid transparent;
  border-top:6px solid var(--muted);pointer-events:none;
}

/* TYPE CHIPS */
.type-chips{display:flex;gap:7px;flex-wrap:wrap}
.type-chip{
  flex:1;min-width:80px;padding:9px 10px;border-radius:var(--radius-xs);
  border:1.5px solid var(--border2);background:var(--surface2);
  color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;
  text-align:center;transition:.15s;font-family:inherit;
}
.type-chip:active{transform:scale(.96)}
.type-chip.sel-1{border-color:#448aff;color:#82b1ff;background:#448aff15}
.type-chip.sel-2{border-color:#00e676;color:#69f0ae;background:#00e67615}
.type-chip.sel-3{border-color:#ce93d8;color:#e1bee7;background:#ce93d815}
.type-chip.sel-4{border-color:#ffab40;color:#ffe0b2;background:#ffab4015}

/* CATEGORY GRID */
.cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.cat-card{
  background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius);
  padding:18px 14px;cursor:pointer;transition:.2s;
  display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;
  position:relative;overflow:hidden;
}
.cat-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#ffffff05,transparent);border-radius:inherit}
.cat-card:active{transform:scale(.95)}
.cat-card.active{border-color:var(--red);box-shadow:0 0 0 1px var(--red-glow),0 0 24px var(--red-glow2)}
.cat-icon{
  width:52px;height:52px;border-radius:16px;
  display:grid;place-items:center;
}
.cat-icon svg{width:26px;height:26px;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.cat-name{font-size:13px;font-weight:800;color:var(--text);letter-spacing:-.01em}
.cat-count{
  font-size:11px;color:var(--muted);font-weight:600;
  background:var(--surface2);border:1px solid var(--border);
  border-radius:20px;padding:2px 9px;
}
.cat-card.active .cat-name{color:var(--red3)}

/* FILTER ITEMS */
.filter-items-wrap{display:flex;flex-direction:column;gap:6px}
.filter-item{
  background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);
  padding:11px 13px;cursor:pointer;display:flex;align-items:center;gap:10px;
  transition:border-color .12s, background .12s;
}
.filter-item:active{border-color:var(--red);background:var(--surface3)}
.fi-left{flex:1;min-width:0}
.fi-name{
  font-size:13px;font-weight:800;color:var(--red3);
  font-family:'Courier New',monospace;margin-bottom:3px;
}
.fi-preview{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.4}
.fi-type{flex-shrink:0}
.fi-type-badge{font-size:10px;padding:3px 8px;border-radius:20px;font-weight:700}
.fi-type-1{background:#448aff18;color:#82b1ff;border:1px solid #448aff30}
.fi-type-2{background:#00e67618;color:#69f0ae;border:1px solid #00e67630}
.fi-type-3{background:#ce93d818;color:#e1bee7;border:1px solid #ce93d830}
.fi-type-0{background:#ffab4018;color:#ffe0b2;border:1px solid #ffab4030}
.fi-arrow{opacity:.35}
.fi-arrow svg{width:15px;height:15px;stroke:var(--muted);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}

/* BACK BTN */
.back-btn{
  display:inline-flex;align-items:center;gap:6px;
  color:var(--red3);background:var(--surface2);
  border:1px solid var(--border2);border-radius:var(--radius-xs);
  padding:8px 13px;font-size:13px;font-weight:700;cursor:pointer;
}
.back-btn:active{opacity:.7}
.back-btn svg{width:15px;height:15px;stroke:var(--red3);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}

/* INFO BANNER */
.banner{
  background:var(--surface2);border:1px solid var(--border2);border-radius:var(--radius-sm);
  padding:12px 14px;display:flex;gap:10px;align-items:flex-start;
}
.banner-icon svg{width:18px;height:18px;stroke:var(--yellow);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;margin-top:1px}
.banner p{font-size:12px;color:var(--text2);line-height:1.6}
.banner strong{color:var(--text);font-weight:700}

/* BOTTOM NAV */
.bottom-nav{
  height:var(--nav-h);flex-shrink:0;
  background:var(--surface);
  border-top:1px solid var(--border);
  display:grid;grid-template-columns:repeat(4,1fr);
  position:relative;z-index:10;
  box-shadow:0 -8px 30px #0000004a;
}
.nav-btn{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:4px;cursor:pointer;padding:8px 4px;position:relative;
  transition:opacity .15s;
}
.nav-btn:active{opacity:.6}
.n-icon{
  width:28px;height:28px;border-radius:9px;
  display:grid;place-items:center;transition:background .2s;
}
.n-icon svg{
  width:21px;height:21px;fill:none;stroke:var(--muted);
  stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;
  transition:stroke .2s;
}
.n-label{font-size:10px;font-weight:600;color:var(--muted);transition:color .2s}
.nav-btn.active .n-icon svg{stroke:var(--red2)}
.nav-btn.active .n-label{color:var(--red3)}
.nav-btn.active .n-icon{background:var(--red-glow2)}
.nav-btn.active::before{
  content:'';position:absolute;top:0;left:25%;right:25%;height:2px;
  background:linear-gradient(90deg,transparent,var(--red),transparent);
  border-radius:0 0 3px 3px;
}

/* MODAL */
.modal-bg{
  display:none;position:fixed;inset:0;
  background:#00000090;z-index:100;
  align-items:flex-end;
  backdrop-filter:blur(8px);
  -webkit-backdrop-filter:blur(8px);
}
.modal-bg.open{display:flex}
.modal{
  background:var(--bg2);
  border-top:1px solid var(--border2);
  border-radius:24px 24px 0 0;
  width:100%;max-height:92dvh;overflow-y:auto;
  animation:slideUp .25s cubic-bezier(.25,.8,.25,1);
  position:relative;
}
.modal::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(180deg,#ffffff06 0%,transparent 30%);
  border-radius:inherit;
}
@keyframes slideUp{from{transform:translateY(100%);opacity:.5}to{transform:translateY(0);opacity:1}}
.modal-pill{width:40px;height:4px;background:var(--border2);border-radius:2px;margin:12px auto 0}
.modal-inner{padding:14px 18px 28px}
.modal-title{font-size:18px;font-weight:800;color:var(--text);letter-spacing:-.02em;margin-bottom:3px}
.modal-sub{font-size:12px;color:var(--muted);margin-bottom:16px;display:flex;gap:7px;flex-wrap:wrap}
.modal-tag{
  background:var(--surface2);border:1px solid var(--border2);
  border-radius:6px;padding:2px 9px;color:var(--text2);font-weight:600;
}
.modal-actions{display:flex;gap:8px;margin-top:16px}

/* TOAST */
.toast{
  position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(10px);
  border-radius:14px;padding:10px 20px;font-size:13px;font-weight:700;
  z-index:300;opacity:0;transition:opacity .25s,transform .25s;
  pointer-events:none;white-space:nowrap;
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.toast.ok{background:#00291499;border:1px solid #00e67650;color:#69f0ae}
.toast.err{background:#2d000099;border:1px solid var(--red-glow);color:#ff8a80}

/* EMPTY STATE */
.empty-state{text-align:center;padding:28px 16px;color:var(--muted);font-size:13px;font-weight:500}
.empty-state svg{width:36px;height:36px;stroke:var(--border2);fill:none;stroke-width:1.5;margin-bottom:10px;display:block;margin-inline:auto}

/* DIVIDER */
.divider{height:1px;background:var(--border);margin:12px 0}

/* SECTION HEADER */
.section-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:0 2px}
.section-hdr-title{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
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
  <symbol id="ic-lock" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></symbol>
  <symbol id="ic-zap" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></symbol>
</svg>

<!-- HEADER -->
<header>
  <div class="logo">
    <img src="/admin/app-icon.jpg" alt="EmossDevToolsBot" onerror="this.style.display='none'"/>
  </div>
  <div class="hdr-info">
    <h1>EmossDev Panel</h1>
    <p>Bot Yönetim Paneli</p>
  </div>
  <div class="hdr-pill">
    <div class="hdr-dot checking" id="hdrDot"></div>
    <span class="hdr-status" id="hdrStatus">…</span>
  </div>
</header>

<div class="scroll-area" id="scrollArea">

  <!-- DURUM -->
  <div class="page active" id="page-status">
    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-val" id="statBotId">—</div>
        <div class="stat-lbl">Bot ID</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" id="statPending">—</div>
        <div class="stat-lbl">Bekleyen</div>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="ci blue"><svg><use href="#ic-bot"/></svg></div>
        <span class="card-label">Bot Bilgileri</span>
        <button style="margin-left:auto" class="btn btn-ghost btn-sm btn-icon" onclick="loadStatus()" title="Yenile">
          <svg><use href="#ic-refresh"/></svg>
        </button>
      </div>
      <div class="card-body">
        <div class="info-grid" id="infoGrid">
          <div class="info-cell"><label>Ad</label><span style="color:var(--muted)">—</span></div>
          <div class="info-cell"><label>Kullanıcı Adı</label><span style="color:var(--muted)">—</span></div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="ci orange"><svg><use href="#ic-webhook"/></svg></div>
        <span class="card-label">Webhook</span>
      </div>
      <div class="card-body">
        <div class="url-box">
          <div class="url-lbl">Aktif URL</div>
          <div class="url-val" id="wbUrlDisplay">Yükleniyor…</div>
        </div>
        <button class="btn btn-primary" onclick="switchTab('webhook');loadStatus()">
          <svg><use href="#ic-link"/></svg>
          Webhook Yönet
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
        <div class="url-box">
          <div class="url-lbl">Kayıtlı Webhook URL</div>
          <div class="url-val" id="wbActiveUrl">Yükleniyor…</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn btn-primary" onclick="setWebhook()">
            <svg><use href="#ic-link"/></svg>
            Webhook Kur / Güncelle
          </button>
          <button class="btn btn-outline" onclick="deleteWebhook()">
            <svg><use href="#ic-x"/></svg>
            Webhook Sil (Polling Modu)
          </button>
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
          <div class="info-cell"><label>Bekleyen Mesaj</label><span id="wbPending">—</span></div>
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
        <button class="btn btn-primary" onclick="saveConfig()">
          <svg><use href="#ic-save"/></svg>
          Ayarları Kaydet
        </button>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="ci red"><svg><use href="#ic-lock"/></svg></div>
        <span class="card-label">Bot Token</span>
      </div>
      <div class="card-body">
        <div class="field" style="margin-bottom:10px">
          <label>Mevcut Token</label>
          <input id="cfg_token_masked" type="text" readonly style="color:var(--muted);font-family:'Courier New',monospace;font-size:13px" placeholder="Yükleniyor…"/>
        </div>
        <div class="field">
          <label>Yeni Token (değiştirmek için)</label>
          <div style="position:relative">
            <input id="cfg_token_new" type="password" placeholder="1234567890:ABCDEF…" style="padding-right:46px;font-family:'Courier New',monospace;font-size:13px"/>
            <button type="button" onclick="toggleTokenVis()" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:4px;color:var(--muted);display:grid;place-items:center">
              <svg id="tokenEyeIcon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#ic-eye"/></svg>
            </button>
          </div>
        </div>
        <button class="btn btn-outline" onclick="saveToken()">
          <svg><use href="#ic-save"/></svg>
          Token Güncelle
        </button>
      </div>
    </div>
  </div>

  <!-- FİLTRELER -->
  <div class="page" id="page-filters">

    <!-- Kategori Görünümü -->
    <div id="filterCatView">
      <div class="section-hdr">
        <span class="section-hdr-title">Kategoriler</span>
        <span style="font-size:11px;color:var(--muted);font-weight:600" id="totalCount"></span>
      </div>
      <div class="cat-grid" id="catGrid"></div>
    </div>

    <!-- Komut Listesi -->
    <div id="filterListView" style="display:none;flex-direction:column;gap:10px">
      <div style="display:flex;align-items:center;gap:8px">
        <div class="back-btn" onclick="showCatView()">
          <svg><use href="#ic-chevron-left"/></svg>
          Kategoriler
        </div>
        <button class="btn btn-primary btn-sm" style="margin-left:auto;width:auto;padding:9px 16px" onclick="openNewFilter()">
          <svg><use href="#ic-plus"/></svg>
          Yeni Ekle
        </button>
      </div>
      <div class="card">
        <div class="card-head">
          <div class="ci red" id="listCatIcon" style="width:30px;height:30px"></div>
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
      <div class="field">
        <label>Gönderilecek Metin / Açıklama</label>
        <textarea id="editText" rows="6" placeholder="Boş bırakılabilir…"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">
          <svg><use href="#ic-x"/></svg>
        </button>
        <button class="btn btn-danger" style="flex:1" onclick="deleteFilter()">
          <svg><use href="#ic-trash"/></svg>
          Sil
        </button>
        <button class="btn btn-primary" style="flex:2" onclick="saveFilter()">
          <svg><use href="#ic-save"/></svg>
          Kaydet
        </button>
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
        <button onclick="closeNewModal()" class="btn btn-ghost btn-sm btn-icon">
          <svg><use href="#ic-x"/></svg>
        </button>
      </div>
      <div class="modal-sub"><span class="modal-tag" id="newFilterCatLabel">—</span></div>

      <div class="field">
        <label>Komut Adı</label>
        <input id="newFilterName" type="text" placeholder="ornek-komut" autocomplete="off" autocorrect="off" autocapitalize="off"/>
      </div>

      <div class="field">
        <label>Tür</label>
        <div class="type-chips" id="typeChips">
          <button type="button" class="type-chip sel-1 active-chip" data-type="1" onclick="selectType(1)">Metin</button>
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
        <button class="btn btn-ghost" onclick="closeNewModal()">
          <svg><use href="#ic-x"/></svg>
        </button>
        <button class="btn btn-primary" style="flex:1" onclick="addFilter()">
          <svg><use href="#ic-plus"/></svg>
          Ekle
        </button>
      </div>
    </div>
  </div>
  <div onclick="closeNewModal()" style="flex:1;min-height:20px"></div>
</div>

<script>
const BASE = '/api';
let filtersData = {};
let editingFilter = null;
let _selectedType = 1;

const catSvgIcon = {
  tools:      '#ic-tool',
  mix:        '#ic-shuffle',
  blog:       '#ic-file-text',
  bashScript: '#ic-terminal',
};
const catGradient = {
  tools:      'linear-gradient(135deg,#ff6d0018,#ff6d0008)',
  mix:        'linear-gradient(135deg,#ce93d818,#ce93d808)',
  blog:       'linear-gradient(135deg,#448aff18,#448aff08)',
  bashScript: 'linear-gradient(135deg,#00e67618,#00e67608)',
};
const catStroke = {
  tools:'#ffab40', mix:'#ce93d8', blog:'#82b1ff', bashScript:'#69f0ae'
};

function switchTab(tab) {
  ['status','webhook','config','filters'].forEach(t => {
    document.getElementById('page-'+t).classList.toggle('active', t===tab);
    document.getElementById('nb-'+t).classList.toggle('active', t===tab);
  });
  document.getElementById('scrollArea').scrollTop = 0;
}

function toast(msg, ok=true) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show '+(ok?'ok':'err');
  clearTimeout(t._h);
  t._h = setTimeout(()=>t.classList.remove('show'), 2800);
}

async function loadStatus() {
  const dot = document.getElementById('hdrDot');
  const hst = document.getElementById('hdrStatus');
  dot.className = 'hdr-dot checking'; hst.textContent = '…';
  try {
    const d = await fetch(BASE+'/bot/status').then(r=>r.json());
    if (d.ok && d.me) {
      dot.className = 'hdr-dot on'; hst.textContent = 'Aktif';
      const wb = d.webhook ?? {};
      const pending = wb.pending_update_count ?? 0;
      const wbUrl = wb.url || '';
      document.getElementById('statBotId').textContent = d.me.id;
      document.getElementById('statPending').textContent = pending;
      document.getElementById('infoGrid').innerHTML =
        '<div class="info-cell"><label>Ad</label><span>'+escHtml(d.me.first_name)+'</span></div>'+
        '<div class="info-cell"><label>Kullanıcı Adı</label><span>@'+escHtml(d.me.username??'')+'</span></div>';
      const disp = wbUrl || '— (Polling)';
      document.getElementById('wbUrlDisplay').textContent = disp;
      document.getElementById('wbActiveUrl').textContent = disp;
      document.getElementById('wbPending').textContent = pending > 0 ? '⚠ '+pending : '✓ 0';
      document.getElementById('wbMode').textContent = wbUrl ? 'Webhook' : 'Polling';
    } else {
      dot.className='hdr-dot off'; hst.textContent='Çevrimdışı';
    }
  } catch(e) {
    dot.className='hdr-dot off'; hst.textContent='Hata';
  }
}

async function setWebhook() {
  toast('Webhook kuruluyor…');
  const d = await fetch(BASE+'/bot/webhook/set',{method:'POST'}).then(r=>r.json());
  toast(d.ok?'✓ Webhook kuruldu!':'✗ '+d.description, d.ok);
  if (d.ok) loadStatus();
}

async function deleteWebhook() {
  if (!confirm('Webhook silinsin mi?')) return;
  const d = await fetch(BASE+'/bot/webhook',{method:'DELETE'}).then(r=>r.json());
  toast(d.ok?'✓ Webhook silindi':'✗ '+d.description, d.ok);
  if (d.ok) loadStatus();
}

async function loadConfig() {
  const d = await fetch(BASE+'/bot/config').then(r=>r.json());
  document.getElementById('cfg_chat_id').value = d.chat_id??'';
  document.getElementById('cfg_private_chat_id').value = d.private_chat_id??'';
  document.getElementById('cfg_creator_id').value = d.creator_id??'';
  document.getElementById('cfg_webhookUrl').value = d.webhookUrl??'';
  document.getElementById('cfg_token_masked').value = d.token??'';
}

async function saveConfig() {
  const body = {
    chat_id: document.getElementById('cfg_chat_id').value,
    private_chat_id: document.getElementById('cfg_private_chat_id').value,
    creator_id: document.getElementById('cfg_creator_id').value,
    webhookUrl: document.getElementById('cfg_webhookUrl').value,
  };
  const d = await fetch(BASE+'/bot/config',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json());
  toast(d.ok?'✓ Ayarlar kaydedildi':'✗ Kaydetme hatası', d.ok);
}

async function saveToken() {
  const newTok = document.getElementById('cfg_token_new').value.trim();
  if (!newTok) { toast('✗ Token boş olamaz', false); return; }
  const d = await fetch(BASE+'/bot/config',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:newTok})}).then(r=>r.json());
  if (d.ok) {
    toast('✓ Token güncellendi');
    document.getElementById('cfg_token_new').value='';
    await loadConfig();
  } else { toast('✗ Token kaydedilemedi', false); }
}

function toggleTokenVis() {
  const inp = document.getElementById('cfg_token_new');
  const icon = document.getElementById('tokenEyeIcon');
  const show = inp.type==='password';
  inp.type = show?'text':'password';
  icon.querySelector('use').setAttribute('href', show?'#ic-eye-off':'#ic-eye');
}

function selectType(t) {
  _selectedType = t;
  document.getElementById('newFilterType').value = String(t);
  document.querySelectorAll('.type-chip').forEach(el => {
    el.classList.remove('sel-0','sel-1','sel-2','sel-3');
    if (Number(el.dataset.type) === t) el.classList.add('sel-'+t);
  });
}

const typeLabel = {'0':'Metin','1':'Metin','2':'Dosya','3':'Video'};
const typeCls   = {'0':'fi-type-0','1':'fi-type-1','2':'fi-type-2','3':'fi-type-3'};

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function loadFilters() {
  filtersData = await fetch(BASE+'/bot/filters-detail').then(r=>r.json());
  const total = Object.values(filtersData).reduce((a,b)=>a+b.length,0);
  document.getElementById('totalCount').textContent = total+' komut';
  document.getElementById('catGrid').innerHTML = Object.keys(filtersData).map(cat=>{
    const href = catSvgIcon[cat]??'#ic-filter';
    const grad = catGradient[cat]??'linear-gradient(135deg,#e5393518,#e5393508)';
    const stroke = catStroke[cat]??'#ff8a80';
    const cnt = filtersData[cat].length;
    return '<div class="cat-card" data-cat="'+cat+'" onclick="showFilterList(\''+cat+'\')">'+
      '<div class="cat-icon" style="background:'+grad+'">'+
        '<svg style="stroke:'+stroke+'" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><use href="'+href+'"/></svg>'+
      '</div>'+
      '<div class="cat-name">'+escHtml(cat)+'</div>'+
      '<div class="cat-count">'+cnt+' komut</div>'+
    '</div>';
  }).join('');
}

function showCatView() {
  document.getElementById('filterCatView').style.display='';
  document.getElementById('filterListView').style.display='none';
  document.querySelectorAll('.cat-card').forEach(c=>c.classList.remove('active'));
}

function showFilterList(cat) {
  document.querySelectorAll('.cat-card').forEach(c=>c.classList.toggle('active',c.dataset.cat===cat));
  document.getElementById('filterCatView').style.display='none';
  const lv = document.getElementById('filterListView');
  lv.style.display='flex';
  const href = catSvgIcon[cat]??'#ic-filter';
  const stroke = catStroke[cat]??'#ff8a80';
  document.getElementById('listCatIcon').innerHTML =
    '<svg style="width:16px;height:16px;stroke:'+stroke+';fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><use href="'+href+'"/></svg>';
  document.getElementById('listCatName').textContent = cat;
  const items = filtersData[cat]??[];
  document.getElementById('listCatCount').textContent = items.length+' komut';
  const wrap = document.getElementById('filterItems');
  if (!items.length) {
    wrap.innerHTML='<div class="empty-state">'+
      '<svg viewBox="0 0 24 24"><use href="#ic-filter"/></svg>'+
      'Bu kategoride henüz komut yok<br><span style="color:var(--red3);font-weight:700;margin-top:6px;display:block">+ Yeni Ekle</span>'+
    '</div>';
    return;
  }
  wrap.innerHTML = items.map(item=>{
    const tl = typeLabel[item.type]??'?';
    const tc = typeCls[item.type]??'fi-type-1';
    const preview = (item.text||'').replace(/\n/g,' ').slice(0,60)+((item.text||'').length>60?'…':'');
    return '<div class="filter-item" onclick=\'openEdit('+JSON.stringify(JSON.stringify(item))+','+JSON.stringify(cat)+')\'>' +
      '<div class="fi-left">'+
        '<div class="fi-name">'+escHtml(item.name)+'</div>'+
        '<div class="fi-preview">'+(escHtml(preview)||'<span style="color:var(--border2)">—</span>')+'</div>'+
      '</div>'+
      '<div class="fi-type"><span class="fi-type-badge '+tc+'">'+tl+'</span></div>'+
      '<div class="fi-arrow"><svg viewBox="0 0 24 24"><use href="#ic-chevron-right"/></svg></div>'+
    '</div>';
  }).join('');
}

function openEdit(itemJson, cat) {
  const item = JSON.parse(itemJson);
  editingFilter = {item, cat};
  document.getElementById('editTitle').textContent = item.name;
  document.getElementById('editSub').innerHTML =
    '<span class="modal-tag">'+escHtml(cat)+'</span>'+
    '<span class="modal-tag">'+(typeLabel[item.type]??'?')+'</span>';
  document.getElementById('editText').value = item.text??'';
  document.getElementById('editModal').classList.add('open');
}

function closeModal() {
  document.getElementById('editModal').classList.remove('open');
  editingFilter = null;
}

function maybeCloseModal(e) {
  if (e.target===document.getElementById('editModal')) closeModal();
}

async function saveFilter() {
  if (!editingFilter) return;
  const {item,cat} = editingFilter;
  const text = document.getElementById('editText').value;
  const d = await fetch(BASE+'/bot/filters/'+cat+'/'+item.key,{
    method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})
  }).then(r=>r.json());
  if (d.ok) {
    toast('✓ '+item.name+' güncellendi');
    item.text = text;
    const idx = filtersData[cat].findIndex(x=>x.key===item.key);
    if (idx>=0) filtersData[cat][idx].text = text;
    showFilterList(cat);
    closeModal();
  } else { toast('✗ Kaydetme hatası',false); }
}

async function deleteFilter() {
  if (!editingFilter) return;
  const {item,cat} = editingFilter;
  if (!confirm('"'+item.name+'" silinsin mi?')) return;
  const d = await fetch(BASE+'/bot/filters/'+cat+'/'+item.key,{method:'DELETE'}).then(r=>r.json());
  if (d.ok) {
    toast('✓ '+item.name+' silindi');
    filtersData[cat] = filtersData[cat].filter(x=>x.key!==item.key);
    closeModal();
    showFilterList(cat);
    const total = Object.values(filtersData).reduce((a,b)=>a+b.length,0);
    document.getElementById('totalCount').textContent = total+' komut';
    document.getElementById('listCatCount').textContent = filtersData[cat].length+' komut';
  } else { toast('✗ Silme hatası',false); }
}

let currentNewCat = null;

function openNewFilter() {
  const cat = document.getElementById('listCatName').textContent;
  currentNewCat = cat;
  document.getElementById('newFilterCatLabel').textContent = cat;
  document.getElementById('newFilterName').value='';
  document.getElementById('newFilterText').value='';
  selectType(1);
  document.getElementById('newFilterModal').classList.add('open');
  setTimeout(()=>document.getElementById('newFilterName').focus(), 300);
}

function closeNewModal() {
  document.getElementById('newFilterModal').classList.remove('open');
  currentNewCat = null;
}

async function addFilter() {
  const cat = currentNewCat;
  const name = document.getElementById('newFilterName').value.trim();
  const type = document.getElementById('newFilterType').value;
  const text = document.getElementById('newFilterText').value;
  if (!name) { toast('✗ Komut adı boş olamaz',false); return; }
  const d = await fetch(BASE+'/bot/filters/'+cat,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name,type,text})
  }).then(r=>r.json());
  if (d.ok) {
    toast('✓ '+name+' eklendi');
    if (!filtersData[cat]) filtersData[cat]=[];
    filtersData[cat].push({key:d.key,name,type,text});
    closeNewModal();
    showFilterList(cat);
    const total = Object.values(filtersData).reduce((a,b)=>a+b.length,0);
    document.getElementById('totalCount').textContent = total+' komut';
  } else { toast('✗ Ekleme hatası',false); }
}

loadStatus(); loadConfig(); loadFilters();
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
  res.sendFile(
    resolve(process.cwd(), "artifacts/api-server/public/app-icon.jpg"),
  );
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
  res.send(`const CACHE='emossdev-v3';
const PRE=['/admin/','/admin/manifest.json','/admin/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRE)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(cache=>cache.put(e.request,c));}return res;})));});`);
});

router.get("/manifest.json", (_req, res) => {
  res.json({
    id: "/admin/",
    name: "EmossDev Panel",
    short_name: "EmossDev",
    description: "EmossDev Bot Yönetim Paneli",
    start_url: "/admin/",
    scope: "/admin/",
    display: "standalone",
    display_override: ["window-controls-overlay", "tabbed", "standalone", "minimal-ui", "browser"],
    background_color: "#0a0a14",
    theme_color: "#e53935",
    orientation: "portrait",
    lang: "tr",
    dir: "ltr",
    categories: ["utilities", "productivity"],
    prefer_related_applications: false,
    related_applications: [],
    launch_handler: {
      client_mode: ["navigate-existing", "auto"],
    },
    shortcuts: [
      {
        name: "Bot Durumu",
        short_name: "Durum",
        description: "Bot durumunu görüntüle",
        url: "/admin/?tab=status",
        icons: [{ src: "/admin/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Filtreler",
        short_name: "Filtreler",
        description: "Filtreleri yönet",
        url: "/admin/?tab=filters",
        icons: [{ src: "/admin/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
    icons: [
      { src: "/admin/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/admin/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  });
});

export default router;
