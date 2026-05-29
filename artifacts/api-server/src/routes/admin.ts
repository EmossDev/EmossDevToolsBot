import { Router } from "express";
import { resolve } from "node:path";

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
<link rel="apple-touch-icon" href="/admin/app-icon.jpg"/>
<title>EmossDev Panel</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
:root{
  --bg:#0a0000;--bg2:#110000;--card:#1a0404;--card2:#220606;--card3:#2c0808;
  --accent:#dc2626;--accent2:#ef4444;--accent3:#ff8080;
  --glow:#dc262640;--glow2:#dc262620;
  --green:#22c55e;--yellow:#f59e0b;
  --text:#fff0f0;--text2:#e0c0c0;--muted:#9a6060;
  --border:#2a0a0a;--border2:#3d1212;
  --nav-h:64px;
}
html,body{height:100%;overflow:hidden}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;flex-direction:column}

/* HEADER */
header{background:linear-gradient(135deg,#150000,#200404);padding:14px 16px 12px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border2);box-shadow:0 2px 20px #dc262618;flex-shrink:0}
.logo{width:42px;height:42px;border-radius:12px;flex-shrink:0;box-shadow:0 0 14px var(--glow),0 0 0 2px #dc262660;overflow:hidden}
.logo img{width:100%;height:100%;object-fit:cover;display:block}
.hdr-info h1{font-size:16px;font-weight:700}
.hdr-info p{font-size:11px;color:var(--muted);margin-top:1px}
.hdr-badge{margin-left:auto;display:flex;align-items:center;gap:6px;background:var(--card2);border:1px solid var(--border2);border-radius:20px;padding:5px 10px}
.hdr-dot{width:7px;height:7px;border-radius:50%}
.hdr-dot.on{background:var(--green);box-shadow:0 0 6px #22c55e80;animation:gpulse 2s infinite}
.hdr-dot.off{background:var(--accent2);box-shadow:0 0 6px var(--glow)}
.hdr-dot.checking{background:var(--yellow);animation:blink 1s infinite}
.hdr-status{font-size:11px;font-weight:600;color:var(--text2)}
@keyframes gpulse{0%,100%{opacity:1}50%{opacity:.55}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

/* SCROLL */
.scroll-area{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding-bottom:8px}
.scroll-area::-webkit-scrollbar{display:none}

/* PAGES */
.page{display:none;padding:12px;flex-direction:column;gap:10px}
.page.active{display:flex}

/* CARDS */
.card{background:var(--card);border-radius:18px;border:1px solid var(--border2);overflow:hidden}
.card-head{padding:12px 14px 10px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border)}
.ci{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;flex-shrink:0}
.ci svg{width:17px;height:17px;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ci.red{background:#dc262620}.ci.red svg{stroke:#ff8080}
.ci.orange{background:#f59e0b18}.ci.orange svg{stroke:#fbbf24}
.ci.green{background:#22c55e18}.ci.green svg{stroke:#4ade80}
.ci.blue{background:#3b82f618}.ci.blue svg{stroke:#818cf8}
.card-label{font-size:12px;font-weight:700;color:var(--text2);letter-spacing:.02em}
.card-body{padding:12px 14px}

/* INFO CELLS */
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.info-cell{background:var(--card2);border-radius:12px;padding:10px;border:1px solid var(--border)}
.info-cell label{font-size:10px;color:var(--muted);font-weight:600;display:block;margin-bottom:3px}
.info-cell span{font-size:13px;font-weight:700;word-break:break-all}
.wh-box{background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:11px;margin-bottom:10px}
.wh-box-lbl{font-size:10px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px}
.wh-box-url{font-size:11px;color:var(--accent3);word-break:break-all;line-height:1.5}

/* BUTTONS */
.btn{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;padding:13px;border-radius:14px;border:none;font-size:14px;font-weight:700;cursor:pointer;transition:.15s}
.btn svg{width:16px;height:16px;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.btn:active{transform:scale(.96);opacity:.85}
.btn-red{background:linear-gradient(135deg,#dc2626,#991b1b);color:#fff;box-shadow:0 3px 14px var(--glow)}
.btn-red svg{stroke:#fff}
.btn-outline-red{background:var(--card2);color:var(--accent3);border:1.5px solid #dc262640}
.btn-outline-red svg{stroke:var(--accent3)}
.btn-ghost{background:var(--card2);color:var(--muted);border:1px solid var(--border)}
.btn-ghost svg{stroke:var(--muted)}
.btn-sm{padding:8px 13px;font-size:13px;border-radius:12px}
.btn-row{display:flex;gap:8px}
.btn-row .btn{flex:1}

/* FORM */
.field{margin-bottom:10px}
.field label{display:block;font-size:10px;font-weight:700;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px}
.field input,.field textarea{width:100%;background:var(--card2);border:1.5px solid var(--border2);border-radius:12px;padding:11px 13px;color:var(--text);font-size:14px;outline:none;transition:.2s;font-family:inherit}
.field textarea{resize:vertical;min-height:120px;line-height:1.6;font-size:13px}
.field input:focus,.field textarea:focus{border-color:var(--accent);background:var(--card3);box-shadow:0 0 0 3px var(--glow2)}

/* CATEGORY GRID */
.cat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px}
.cat-card{background:var(--card2);border:1.5px solid var(--border);border-radius:16px;padding:16px 12px;cursor:pointer;transition:.15s;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}
.cat-card:active{transform:scale(.96)}
.cat-card.active{background:linear-gradient(135deg,#dc262618,#7f1d1d18);border-color:#dc262660;box-shadow:0 0 16px var(--glow2)}
.cat-icon{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;margin-bottom:2px}
.cat-icon svg{width:26px;height:26px;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.cat-card-name{font-size:13px;font-weight:700;color:var(--text2)}
.cat-card-count{font-size:11px;color:var(--muted);font-weight:600}
.cat-card.active .cat-card-name{color:var(--accent3)}
.cat-card.active .cat-card-count{color:var(--accent2)}

/* FILTER ITEMS */
.filter-items-wrap{display:flex;flex-direction:column;gap:7px}
.filter-item{background:var(--card2);border:1px solid var(--border);border-radius:13px;padding:11px 13px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:.15s}
.filter-item:active{border-color:var(--accent);background:var(--card3)}
.fi-left{flex:1;min-width:0}
.fi-name{font-size:13px;font-weight:700;color:var(--accent3);font-family:'Courier New',monospace;margin-bottom:3px}
.fi-preview{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fi-badge{flex-shrink:0;font-size:10px;padding:3px 8px;border-radius:20px;font-weight:700}
.fi-badge.t1{background:#1e3a2e;color:#4ade80}
.fi-badge.t2{background:#1a1e3a;color:#818cf8}
.fi-badge.t3{background:#2e1e2e;color:#e879f9}
.fi-chevron{flex-shrink:0;opacity:.4}
.fi-chevron svg{width:16px;height:16px;stroke:var(--muted);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.back-btn{display:flex;align-items:center;gap:8px;color:var(--accent3);background:var(--card2);border:1px solid var(--border2);border-radius:12px;padding:9px 14px;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:10px;width:fit-content}
.back-btn:active{opacity:.7}
.back-btn svg{width:16px;height:16px;stroke:var(--accent3);fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}

/* MODAL */
.modal-bg{display:none;position:fixed;inset:0;background:#00000098;z-index:100;align-items:flex-end;backdrop-filter:blur(6px)}
.modal-bg.open{display:flex}
.modal{background:var(--bg2);border-top:2px solid var(--border2);border-radius:24px 24px 0 0;width:100%;max-height:90dvh;overflow-y:auto;animation:slideUp .22s cubic-bezier(.25,.8,.25,1)}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.modal-pill{width:36px;height:4px;background:var(--border2);border-radius:2px;margin:10px auto 0}
.modal-inner{padding:14px 16px 20px}
.modal-title{font-size:17px;font-weight:800;margin-bottom:2px;font-family:monospace;color:var(--accent3)}
.modal-sub{font-size:12px;color:var(--muted);margin-bottom:14px;display:flex;gap:8px}
.modal-tag{background:var(--card2);border:1px solid var(--border);border-radius:6px;padding:2px 8px}
.modal-actions{display:flex;gap:10px;margin-top:12px}

/* BOTTOM NAV */
.bottom-nav{height:var(--nav-h);flex-shrink:0;background:linear-gradient(0deg,#150000,#110000);border-top:1px solid var(--border2);display:grid;grid-template-columns:repeat(4,1fr);box-shadow:0 -4px 24px #dc262614}
.nav-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;transition:.15s;padding:8px 4px;position:relative}
.nav-btn:active{opacity:.7}
.nav-btn .n-icon{width:26px;height:26px;display:grid;place-items:center;transition:.15s;border-radius:8px}
.nav-btn .n-icon svg{width:22px;height:22px;fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transition:.15s}
.nav-btn .n-label{font-size:10px;font-weight:600;color:var(--muted);transition:.15s}
.nav-btn.active .n-icon svg{stroke:var(--accent3);filter:drop-shadow(0 0 5px var(--accent))}
.nav-btn.active .n-label{color:var(--accent3)}
.nav-btn.active .n-icon{background:var(--glow2)}
.nav-btn.active::after{content:'';position:absolute;top:0;left:22%;right:22%;height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);border-radius:0 0 4px 4px}

/* TOAST */
.toast{position:fixed;bottom:76px;left:50%;transform:translateX(-50%);border-radius:14px;padding:10px 18px;font-size:13px;font-weight:600;z-index:300;opacity:0;transition:.3s;pointer-events:none;white-space:nowrap;border:1px solid transparent;backdrop-filter:blur(8px)}
.toast.show{opacity:1}
.toast.ok{background:#0a1f12d0;border-color:#22c55e50;color:#86efac}
.toast.err{background:#1f0a0ad0;border-color:#dc262650;color:#fca5a5}

/* INFO BANNER */
.info-banner{background:linear-gradient(135deg,#1a0000,#220808);border:1px solid #dc262630;border-radius:14px;padding:12px 14px;display:flex;gap:10px;align-items:flex-start}
.ib-icon{flex-shrink:0;margin-top:1px;width:20px;height:20px}
.ib-icon svg{width:20px;height:20px;stroke:#fbbf24;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.info-banner p{font-size:12px;color:var(--text2);line-height:1.5}
.info-banner strong{color:var(--accent3)}

/* STATS */
.stat-row{display:flex;gap:8px;margin-bottom:2px}
.stat-box{flex:1;background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:11px;text-align:center}
.stat-box .sv{font-size:20px;font-weight:800;color:var(--accent3)}
.stat-box .sl{font-size:10px;color:var(--muted);font-weight:600;margin-top:2px}
</style>
</head>
<body>

<!-- SVG ICON DEFS (hidden) -->
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
</svg>

<header>
  <div class="logo">
    <img src="/admin/app-icon.jpg" alt="EmossDevToolsBot"/>
  </div>
  <div class="hdr-info">
    <h1>EmossDev Panel</h1>
    <p>Bot Yönetim Paneli</p>
  </div>
  <div class="hdr-badge">
    <div class="hdr-dot checking" id="hdrDot"></div>
    <span class="hdr-status" id="hdrStatus">…</span>
  </div>
</header>

<div class="scroll-area" id="scrollArea">

  <!-- DURUM -->
  <div class="page active" id="page-status">
    <div class="stat-row">
      <div class="stat-box"><div class="sv" id="statBotId">…</div><div class="sl">Bot ID</div></div>
      <div class="stat-box"><div class="sv" id="statPending">…</div><div class="sl">Bekleyen</div></div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="ci red"><svg><use href="#ic-bot"/></svg></div>
        <span class="card-label">Bot Bilgileri</span>
        <button style="margin-left:auto;display:flex;align-items:center;gap:5px" class="btn btn-ghost btn-sm" onclick="loadStatus()">
          <svg style="width:13px;height:13px;stroke:var(--muted);fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round"><use href="#ic-refresh"/></svg>
          Yenile
        </button>
      </div>
      <div class="card-body">
        <div class="info-grid" id="infoGrid">
          <div class="info-cell"><label>Ad</label><span>—</span></div>
          <div class="info-cell"><label>Kullanıcı Adı</label><span>—</span></div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="ci orange"><svg><use href="#ic-webhook"/></svg></div>
        <span class="card-label">Webhook Durumu</span>
      </div>
      <div class="card-body">
        <div class="wh-box">
          <div class="wh-box-lbl">Aktif URL</div>
          <div class="wh-box-url" id="wbUrlDisplay">Yükleniyor…</div>
        </div>
        <button class="btn btn-red" onclick="switchTab('webhook');loadStatus()">
          <svg><use href="#ic-link"/></svg>
          Webhook Yönet
        </button>
      </div>
    </div>
  </div>

  <!-- WEBHOOK -->
  <div class="page" id="page-webhook">
    <div class="info-banner">
      <div class="ib-icon"><svg><use href="#ic-bulb"/></svg></div>
      <p>Kendi sunucunu kullanmak için <strong>Ayarlar</strong>'dan Webhook URL'ini değiştir, sonra <strong>Webhook Kur</strong>'a bas.</p>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="ci orange"><svg><use href="#ic-webhook"/></svg></div>
        <span class="card-label">Webhook İşlemleri</span>
      </div>
      <div class="card-body">
        <div class="wh-box">
          <div class="wh-box-lbl">Kayıtlı Webhook URL</div>
          <div class="wh-box-url" id="wbActiveUrl">Yükleniyor…</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn btn-red" onclick="setWebhook()">
            <svg><use href="#ic-link"/></svg>
            Webhook Kur / Güncelle
          </button>
          <button class="btn btn-outline-red" onclick="deleteWebhook()">
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
        <div class="ci red"><svg><use href="#ic-settings"/></svg></div>
        <span class="card-label">Bot Yapılandırması</span>
      </div>
      <div class="card-body">
        <div class="field"><label>Grup Chat ID</label><input id="cfg_chat_id" type="text" placeholder="-100…"/></div>
        <div class="field"><label>Özel Chat ID</label><input id="cfg_private_chat_id" type="text" placeholder="-528…"/></div>
        <div class="field"><label>Creator ID</label><input id="cfg_creator_id" type="text" placeholder="757…"/></div>
        <div class="field"><label>Webhook URL</label><input id="cfg_webhookUrl" type="text" placeholder="https://…/bot/"/></div>
        <button class="btn btn-red" onclick="saveConfig()">
          <svg><use href="#ic-save"/></svg>
          Kaydet
        </button>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="ci red"><svg><use href="#ic-telegram"/></svg></div>
        <span class="card-label">Bot Token</span>
      </div>
      <div class="card-body">
        <div style="background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:10px 13px;margin-bottom:10px;font-size:12px;color:var(--muted);line-height:1.5">
          Mevcut token gizli gösterilir. Değiştirmek için yeni token gir ve kaydet.
        </div>
        <div class="field" style="margin-bottom:6px">
          <label>Mevcut Token (Gizli)</label>
          <div style="position:relative">
            <input id="cfg_token_masked" type="text" readonly style="color:var(--muted);padding-right:44px;letter-spacing:.05em" placeholder="Yükleniyor…"/>
          </div>
        </div>
        <div class="field">
          <label>Yeni Token (değiştirmek için gir)</label>
          <div style="position:relative">
            <input id="cfg_token_new" type="password" placeholder="1234567890:ABCDEFGHijklmnop…" style="padding-right:44px"/>
            <button type="button" onclick="toggleTokenVis()" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:4px;color:var(--muted)">
              <svg id="tokenEyeIcon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#ic-eye"/></svg>
            </button>
          </div>
        </div>
        <button class="btn btn-outline-red" onclick="saveToken()">
          <svg><use href="#ic-save"/></svg>
          Token Güncelle
        </button>
      </div>
    </div>
  </div>

  <!-- FİLTRELER -->
  <div class="page" id="page-filters">
    <div id="filterCatView">
      <div class="card-head" style="padding:0 0 10px;background:none;border:none">
        <div class="ci red"><svg><use href="#ic-filter"/></svg></div>
        <span class="card-label">Kategori Seç</span>
        <span style="margin-left:auto;font-size:11px;color:var(--muted)" id="totalCount"></span>
      </div>
      <div class="cat-grid" id="catGrid"></div>
    </div>
    <div id="filterListView" style="display:none">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div class="back-btn" onclick="showCatView()" style="margin-bottom:0">
          <svg><use href="#ic-chevron-left"/></svg>
          Kategoriler
        </div>
        <button class="btn btn-red btn-sm" style="margin-left:auto;width:auto;padding:8px 14px" onclick="openNewFilter()">
          <svg><use href="#ic-plus"/></svg>
          Yeni Komut
        </button>
      </div>
      <div class="card">
        <div class="card-head">
          <div class="ci red" id="listCatIcon"></div>
          <span class="card-label" id="listCatName">—</span>
          <span style="margin-left:auto;font-size:11px;color:var(--muted)" id="listCatCount"></span>
        </div>
        <div class="card-body" style="padding-top:8px">
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

<!-- EDIT MODAL -->
<div class="modal-bg" id="editModal" onclick="maybeCloseModal(event)">
  <div class="modal">
    <div class="modal-pill"></div>
    <div class="modal-inner">
      <div class="modal-title" id="editTitle"></div>
      <div class="modal-sub" id="editSub"></div>
      <div class="field">
        <label>Gönderilecek Metin</label>
        <textarea id="editText" rows="6"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" style="flex:1" onclick="closeModal()">
          <svg><use href="#ic-x"/></svg>İptal
        </button>
        <button class="btn btn-outline-red" style="flex:1" onclick="deleteFilter()">
          <svg><use href="#ic-trash"/></svg>Sil
        </button>
        <button class="btn btn-red" style="flex:2" onclick="saveFilter()">
          <svg><use href="#ic-save"/></svg>Kaydet
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
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div class="modal-title" style="margin-bottom:0">Yeni Komut Ekle</div>
        <button onclick="closeNewModal()" style="background:var(--card2);border:1px solid var(--border2);border-radius:10px;padding:5px 10px;color:var(--muted);font-size:12px;cursor:pointer">Kapat</button>
      </div>
      <div class="modal-sub"><span class="modal-tag" id="newFilterCatLabel">—</span></div>
      <div class="field">
        <label>Komut Adı (örn: /merhaba)</label>
        <input id="newFilterName" type="text" placeholder="/komutadi" autocomplete="off"/>
      </div>
      <div class="field">
        <label>Tip</label>
        <select id="newFilterType" style="width:100%;background:var(--card2);border:1.5px solid var(--border2);border-radius:12px;padding:11px 13px;color:var(--text);font-size:14px;outline:none;font-family:inherit">
          <option value="1">1 — Metin</option>
          <option value="2">2 — Dosya</option>
          <option value="3">3 — Video</option>
        </select>
      </div>
      <div class="field">
        <label>Gönderilecek Metin</label>
        <textarea id="newFilterText" rows="4" placeholder="İsteğe bağlı…"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" style="flex:1" onclick="closeNewModal()">
          <svg><use href="#ic-x"/></svg>İptal
        </button>
        <button class="btn btn-red" style="flex:2" onclick="addFilter()">
          <svg><use href="#ic-plus"/></svg>Ekle
        </button>
      </div>
    </div>
  </div>
  <div onclick="closeNewModal()" style="flex:1;min-height:20px"></div>
</div>

<div class="toast" id="toast"></div>

<script>
const BASE = '/api';
let filtersData = {};
let editingFilter = null;

const catSvgIcon = {
  tools:   '#ic-tool',
  mix:     '#ic-shuffle',
  blog:    '#ic-file-text',
  bashScript: '#ic-terminal',
};
const catColors = {
  tools:   '#f59e0b18',
  mix:     '#a855f718',
  blog:    '#3b82f618',
  bashScript: '#22c55e18',
};
const catStroke = {
  tools: '#fbbf24', mix: '#c084fc', blog: '#818cf8', bashScript: '#4ade80'
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
      dot.className = 'hdr-dot on'; hst.textContent = 'Çevrimiçi';
      const wb = d.webhook ?? {};
      const pending = wb.pending_update_count ?? 0;
      const wbUrl = wb.url || '';
      document.getElementById('statBotId').textContent = d.me.id;
      document.getElementById('statPending').textContent = pending;
      document.getElementById('infoGrid').innerHTML =
        '<div class="info-cell"><label>Ad</label><span>'+d.me.first_name+'</span></div>'+
        '<div class="info-cell"><label>Kullanıcı Adı</label><span>@'+d.me.username+'</span></div>';
      const disp = wbUrl || '— (Polling Modu)';
      document.getElementById('wbUrlDisplay').textContent = disp;
      document.getElementById('wbActiveUrl').textContent = disp;
      document.getElementById('wbPending').textContent = pending > 0 ? '⚠ '+pending : '✓ 0';
      document.getElementById('wbMode').textContent = wbUrl ? 'Webhook' : 'Polling';
    } else { dot.className='hdr-dot off'; hst.textContent='Çevrimdışı'; }
  } catch(e) { dot.className='hdr-dot off'; hst.textContent='Hata'; }
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

const typeInfo = {'1':['Metin','t1'],'2':['Dosya','t2'],'3':['Video','t3']};

async function loadFilters() {
  filtersData = await fetch(BASE+'/bot/filters-detail').then(r=>r.json());
  const total = Object.values(filtersData).reduce((a,b)=>a+b.length,0);
  document.getElementById('totalCount').textContent = total+' komut';
  document.getElementById('catGrid').innerHTML = Object.keys(filtersData).map(cat=>{
    const href = catSvgIcon[cat]??'#ic-filter';
    const bg = catColors[cat]??'#dc262618';
    const stroke = catStroke[cat]??'#ff8080';
    return '<div class="cat-card" data-cat="'+cat+'" onclick="showFilterList(\''+cat+'\')">'+
      '<div class="cat-icon" style="background:'+bg+'">'+
        '<svg style="stroke:'+stroke+'" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><use href="'+href+'"/></svg>'+
      '</div>'+
      '<div class="cat-card-name">'+cat+'</div>'+
      '<div class="cat-card-count">'+filtersData[cat].length+' komut</div>'+
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
  document.getElementById('filterListView').style.display='';
  const href = catSvgIcon[cat]??'#ic-filter';
  const stroke = catStroke[cat]??'#ff8080';
  document.getElementById('listCatIcon').innerHTML =
    '<svg style="width:17px;height:17px;stroke:'+stroke+';fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><use href="'+href+'"/></svg>';
  document.getElementById('listCatName').textContent = cat;
  const items = filtersData[cat]??[];
  document.getElementById('listCatCount').textContent = items.length+' komut';
  const wrap = document.getElementById('filterItems');
  if (!items.length) { wrap.innerHTML='<div style="color:var(--muted);text-align:center;padding:16px;font-size:13px">Bu kategoride komut yok</div>'; return; }
  wrap.innerHTML = items.map(item=>{
    const [tlbl,tcls] = typeInfo[item.type]??['?','t1'];
    const preview = (item.text||'').replace(/\n/g,' ').slice(0,55)+((item.text||'').length>55?'…':'');
    return '<div class="filter-item" onclick=\'openEdit('+JSON.stringify(JSON.stringify(item))+','+JSON.stringify(cat)+')\'>' +
      '<div class="fi-left"><div class="fi-name">'+item.name+'</div><div class="fi-preview">'+(preview||'—')+'</div></div>'+
      '<span class="fi-badge '+tcls+'">'+tlbl+'</span>'+
      '<div class="fi-chevron"><svg viewBox="0 0 24 24"><use href="#ic-chevron-right"/></svg></div>'+
    '</div>';
  }).join('');
}

function openEdit(itemJson, cat) {
  const item = JSON.parse(itemJson);
  editingFilter = {item, cat};
  document.getElementById('editTitle').textContent = item.name;
  document.getElementById('editSub').innerHTML =
    '<span class="modal-tag">'+cat+'</span><span class="modal-tag">'+(typeInfo[item.type]?.[0]??'?')+'</span>';
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
  if (!confirm('"'+item.name+'" komutunu silmek istediğinize emin misiniz?')) return;
  const d = await fetch(BASE+'/bot/filters/'+cat+'/'+item.key,{method:'DELETE'}).then(r=>r.json());
  if (d.ok) {
    toast('✓ '+item.name+' silindi');
    filtersData[cat] = filtersData[cat].filter(x=>x.key!==item.key);
    closeModal();
    showFilterList(cat);
    document.getElementById('totalCount').textContent =
      Object.values(filtersData).reduce((a,b)=>a+b.length,0)+' komut';
    document.getElementById('listCatCount').textContent = filtersData[cat].length+' komut';
  } else { toast('✗ Silme hatası',false); }
}

let currentNewCat = null;

function openNewFilter() {
  const cat = document.getElementById('listCatName').textContent;
  currentNewCat = cat;
  document.getElementById('newFilterCatLabel').textContent = cat;
  document.getElementById('newFilterName').value='';
  document.getElementById('newFilterType').value='1';
  document.getElementById('newFilterText').value='';
  document.getElementById('newFilterModal').classList.add('open');
}

function closeNewModal() {
  document.getElementById('newFilterModal').classList.remove('open');
  currentNewCat = null;
}

function maybeCloseNewModal(e) {
  if (e.target===document.getElementById('newFilterModal')) closeNewModal();
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
    document.getElementById('totalCount').textContent =
      Object.values(filtersData).reduce((a,b)=>a+b.length,0)+' komut';
  } else { toast('✗ Ekleme hatası',false); }
}

loadStatus(); loadConfig(); loadFilters();
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

router.get("/manifest.json", (_req, res) => {
  res.json({
    name: "EmossDev Panel",
    short_name: "EmossDev",
    description: "EmossDev Bot Yönetim Paneli",
    start_url: "/admin/",
    display: "standalone",
    background_color: "#0a0000",
    theme_color: "#dc2626",
    orientation: "portrait",
    icons: [
      { src: "/admin/app-icon.jpg", sizes: "192x192", type: "image/jpeg" },
      { src: "/admin/app-icon.jpg", sizes: "512x512", type: "image/jpeg" },
      {
        src: "/admin/app-icon.jpg",
        sizes: "1024x1024",
        type: "image/jpeg",
        purpose: "any maskable",
      },
    ],
  });
});

export default router;
