import { Router } from "express";

const router = Router();

const html = String.raw`<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<meta name="mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="theme-color" content="#0d0000"/>
<title>EmossDevToolsBot</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
:root{
  --bg:#0a0000;
  --bg2:#110000;
  --card:#1a0404;
  --card2:#220606;
  --card3:#2c0808;
  --accent:#dc2626;
  --accent2:#ef4444;
  --accent3:#ff8080;
  --glow:#dc262640;
  --glow2:#dc262620;
  --green:#22c55e;
  --yellow:#f59e0b;
  --text:#fff0f0;
  --text2:#e0c0c0;
  --muted:#9a6060;
  --border:#2a0a0a;
  --border2:#3d1212;
  --nav-h:64px;
}
html,body{height:100%;overflow:hidden}
body{
  background:var(--bg);color:var(--text);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  display:flex;flex-direction:column;
}

/* ── HEADER ─────────────────────── */
header{
  background:linear-gradient(135deg,#150000,#200404);
  padding:14px 16px 12px;
  display:flex;align-items:center;gap:12px;
  border-bottom:1px solid var(--border2);
  box-shadow:0 2px 20px #dc262618;
  flex-shrink:0;
}
.logo{
  width:38px;height:38px;border-radius:12px;
  background:linear-gradient(135deg,#dc2626,#7f1d1d);
  display:grid;place-items:center;font-size:20px;flex-shrink:0;
  box-shadow:0 0 14px var(--glow);
}
.hdr-info h1{font-size:16px;font-weight:700}
.hdr-info p{font-size:11px;color:var(--muted);margin-top:1px}
.hdr-badge{
  margin-left:auto;display:flex;align-items:center;gap:6px;
  background:var(--card2);border:1px solid var(--border2);
  border-radius:20px;padding:5px 10px;
}
.hdr-dot{width:7px;height:7px;border-radius:50%}
.hdr-dot.on{background:var(--green);box-shadow:0 0 6px #22c55e80;animation:glow-pulse 2s infinite}
.hdr-dot.off{background:var(--accent2);box-shadow:0 0 6px var(--glow)}
.hdr-dot.checking{background:var(--yellow);animation:blink 1s infinite}
.hdr-status{font-size:11px;font-weight:600;color:var(--text2)}
@keyframes glow-pulse{0%,100%{opacity:1}50%{opacity:.6}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

/* ── SCROLL AREA ────────────────── */
.scroll-area{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding-bottom:8px}
.scroll-area::-webkit-scrollbar{display:none}

/* ── PAGES ──────────────────────── */
.page{display:none;padding:12px;flex-direction:column;gap:10px}
.page.active{display:flex}

/* ── CARDS ──────────────────────── */
.card{
  background:var(--card);border-radius:18px;
  border:1px solid var(--border2);overflow:hidden;
}
.card-head{
  padding:12px 14px 8px;
  display:flex;align-items:center;gap:8px;
  border-bottom:1px solid var(--border);
}
.card-icon{
  width:30px;height:30px;border-radius:9px;
  display:grid;place-items:center;font-size:15px;flex-shrink:0;
}
.card-icon.red{background:#dc262620}
.card-icon.green{background:#22c55e18}
.card-icon.blue{background:#3b82f618}
.card-icon.orange{background:#f59e0b18}
.card-label{font-size:12px;font-weight:700;color:var(--text2);letter-spacing:.02em}
.card-body{padding:12px 14px}

/* ── BOT INFO GRID ───────────────── */
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.info-cell{background:var(--card2);border-radius:12px;padding:10px;border:1px solid var(--border)}
.info-cell label{font-size:10px;color:var(--muted);font-weight:600;display:block;margin-bottom:3px}
.info-cell span{font-size:13px;font-weight:700;color:var(--text);word-break:break-all}

/* ── WEBHOOK BOX ────────────────── */
.wh-box{
  background:var(--card2);border:1px solid var(--border);border-radius:12px;
  padding:11px;margin-bottom:10px;
}
.wh-box-lbl{font-size:10px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px}
.wh-box-url{font-size:11px;color:var(--accent3);word-break:break-all;line-height:1.5}

/* ── BUTTONS ────────────────────── */
.btn{
  display:flex;align-items:center;justify-content:center;gap:7px;
  width:100%;padding:13px;border-radius:14px;border:none;
  font-size:14px;font-weight:700;cursor:pointer;transition:.15s;
}
.btn:active{transform:scale(.96);opacity:.85}
.btn-red{background:linear-gradient(135deg,#dc2626,#991b1b);color:#fff;box-shadow:0 3px 14px var(--glow)}
.btn-outline-red{background:var(--card2);color:var(--accent3);border:1.5px solid #dc262640}
.btn-ghost{background:var(--card2);color:var(--muted);border:1px solid var(--border)}
.btn-green{background:linear-gradient(135deg,#15803d,#166534);color:#fff}
.btn-sm{padding:9px 14px;font-size:13px;border-radius:12px}
.btn-row{display:flex;gap:8px}
.btn-row .btn{flex:1}

/* ── FORM ────────────────────────── */
.field{margin-bottom:10px}
.field label{display:block;font-size:10px;font-weight:700;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px}
.field input,.field textarea{
  width:100%;background:var(--card2);
  border:1.5px solid var(--border2);border-radius:12px;
  padding:11px 13px;color:var(--text);font-size:14px;
  outline:none;transition:.2s;font-family:inherit;
}
.field textarea{resize:vertical;min-height:120px;line-height:1.6;font-size:13px}
.field input:focus,.field textarea:focus{
  border-color:var(--accent);
  background:var(--card3);
  box-shadow:0 0 0 3px var(--glow2);
}

/* ── FILTER CATEGORIES ─────────── */
.cat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px}
.cat-card{
  background:var(--card2);border:1.5px solid var(--border);border-radius:14px;
  padding:14px 12px;cursor:pointer;transition:.15s;
  display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;
}
.cat-card:active{transform:scale(.96)}
.cat-card.active{
  background:linear-gradient(135deg,#dc262618,#7f1d1d18);
  border-color:#dc262660;
  box-shadow:0 0 16px var(--glow2);
}
.cat-card-icon{font-size:26px;line-height:1}
.cat-card-name{font-size:13px;font-weight:700;color:var(--text2)}
.cat-card-count{font-size:11px;color:var(--muted);font-weight:600}
.cat-card.active .cat-card-name{color:var(--accent3)}
.cat-card.active .cat-card-count{color:var(--accent2)}

/* ── FILTER ITEMS ───────────────── */
.filter-items-wrap{display:flex;flex-direction:column;gap:7px}
.filter-item{
  background:var(--card2);border:1px solid var(--border);border-radius:13px;
  padding:11px 13px;cursor:pointer;display:flex;align-items:center;gap:10px;
  transition:.15s;
}
.filter-item:active{border-color:var(--accent);background:var(--card3)}
.fi-left{flex:1;min-width:0}
.fi-name{font-size:13px;font-weight:700;color:var(--accent3);font-family:'Courier New',monospace;margin-bottom:3px}
.fi-preview{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fi-badge{flex-shrink:0;font-size:10px;padding:3px 8px;border-radius:20px;font-weight:700}
.fi-badge.t1{background:#1e3a2e;color:#4ade80}
.fi-badge.t2{background:#1a1e3a;color:#818cf8}
.fi-badge.t3{background:#2e1e2e;color:#e879f9}
.fi-arrow{color:var(--muted);font-size:16px;flex-shrink:0}
.back-btn{
  display:flex;align-items:center;gap:8px;color:var(--accent3);
  background:var(--card2);border:1px solid var(--border2);
  border-radius:12px;padding:9px 14px;font-size:13px;font-weight:600;
  cursor:pointer;margin-bottom:10px;width:fit-content;
}
.back-btn:active{opacity:.7}

/* ── MODAL ──────────────────────── */
.modal-bg{
  display:none;position:fixed;inset:0;background:#00000098;z-index:100;
  align-items:flex-end;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
}
.modal-bg.open{display:flex}
.modal{
  background:var(--bg2);border-top:2px solid var(--border2);
  border-radius:24px 24px 0 0;padding:0;
  width:100%;max-height:90dvh;overflow-y:auto;
  animation:slideUp .22s cubic-bezier(.25,.8,.25,1);
}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.modal-pill{width:36px;height:4px;background:var(--border2);border-radius:2px;margin:10px auto 0}
.modal-inner{padding:14px 16px 20px}
.modal-title{font-size:17px;font-weight:800;margin-bottom:2px;font-family:monospace;color:var(--accent3)}
.modal-sub{font-size:12px;color:var(--muted);margin-bottom:14px;display:flex;gap:8px}
.modal-tag{background:var(--card2);border:1px solid var(--border);border-radius:6px;padding:2px 8px}
.modal-actions{display:flex;gap:10px;margin-top:12px}

/* ── BOTTOM NAV ─────────────────── */
.bottom-nav{
  height:var(--nav-h);flex-shrink:0;
  background:linear-gradient(0deg,#150000,#110000);
  border-top:1px solid var(--border2);
  display:grid;grid-template-columns:repeat(4,1fr);
  box-shadow:0 -4px 24px #dc262614;
}
.nav-btn{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:4px;cursor:pointer;transition:.15s;padding:8px 4px;
  position:relative;
}
.nav-btn:active{opacity:.7}
.nav-btn .n-icon{font-size:22px;line-height:1;transition:.15s}
.nav-btn .n-label{font-size:10px;font-weight:600;color:var(--muted);transition:.15s}
.nav-btn.active .n-label{color:var(--accent3)}
.nav-btn.active .n-icon{filter:drop-shadow(0 0 6px var(--accent))}
.nav-btn.active::after{
  content:'';position:absolute;top:0;left:20%;right:20%;height:2px;
  background:linear-gradient(90deg,transparent,var(--accent),transparent);
  border-radius:0 0 4px 4px;
}

/* ── TOAST ──────────────────────── */
.toast{
  position:fixed;bottom:76px;left:50%;transform:translateX(-50%);
  border-radius:14px;padding:10px 18px;font-size:13px;font-weight:600;
  z-index:300;opacity:0;transition:.3s;pointer-events:none;
  white-space:nowrap;border:1px solid transparent;
  backdrop-filter:blur(8px);
}
.toast.show{opacity:1}
.toast.ok{background:#0a1f12d0;border-color:#22c55e50;color:#86efac}
.toast.err{background:#1f0a0ad0;border-color:#dc262650;color:#fca5a5}

/* ── INFO BANNER ────────────────── */
.info-banner{
  background:linear-gradient(135deg,#1a0000,#220808);
  border:1px solid #dc262630;border-radius:14px;padding:12px 14px;
  display:flex;gap:10px;align-items:flex-start;
}
.info-banner .ib-icon{font-size:18px;flex-shrink:0;margin-top:1px}
.info-banner p{font-size:12px;color:var(--text2);line-height:1.5}
.info-banner strong{color:var(--accent3)}

/* ── STAT ROW ────────────────────── */
.stat-row{display:flex;gap:8px;margin-bottom:2px}
.stat-box{
  flex:1;background:var(--card2);border:1px solid var(--border);
  border-radius:12px;padding:11px;text-align:center;
}
.stat-box .sv{font-size:20px;font-weight:800;color:var(--accent3)}
.stat-box .sl{font-size:10px;color:var(--muted);font-weight:600;margin-top:2px}
</style>
</head>
<body>

<!-- HEADER -->
<header>
  <div class="logo">🤖</div>
  <div class="hdr-info">
    <h1>EmossDevToolsBot</h1>
    <p>Kontrol Paneli</p>
  </div>
  <div class="hdr-badge">
    <div class="hdr-dot checking" id="hdrDot"></div>
    <span class="hdr-status" id="hdrStatus">…</span>
  </div>
</header>

<!-- SCROLL AREA -->
<div class="scroll-area" id="scrollArea">

  <!-- ── PAGE: DURUM ── -->
  <div class="page active" id="page-status">
    <div class="stat-row">
      <div class="stat-box"><div class="sv" id="statBotId">…</div><div class="sl">Bot ID</div></div>
      <div class="stat-box"><div class="sv" id="statPending">…</div><div class="sl">Bekleyen</div></div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="card-icon red">🤖</div>
        <span class="card-label">Bot Bilgileri</span>
        <button style="margin-left:auto" class="btn btn-ghost btn-sm" onclick="loadStatus()">↻ Yenile</button>
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
        <div class="card-icon orange">🔗</div>
        <span class="card-label">Webhook Durumu</span>
      </div>
      <div class="card-body">
        <div class="wh-box">
          <div class="wh-box-lbl">Aktif URL</div>
          <div class="wh-box-url" id="wbUrlDisplay">Yükleniyor…</div>
        </div>
        <div class="btn-row">
          <button class="btn btn-red" onclick="switchTab('webhook');loadStatus()">🔗 Webhook Yönet</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── PAGE: WEBHOOK ── -->
  <div class="page" id="page-webhook">
    <div class="info-banner">
      <div class="ib-icon">💡</div>
      <p>Kendi sunucunu kullanmak için <strong>Ayarlar</strong> sekmesinden Webhook URL'ini değiştir, ardından <strong>Webhook Kur</strong>'a bas.</p>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="card-icon orange">🔗</div>
        <span class="card-label">Webhook İşlemleri</span>
      </div>
      <div class="card-body">
        <div class="wh-box" id="webhookBox">
          <div class="wh-box-lbl">Kayıtlı Webhook URL</div>
          <div class="wh-box-url" id="wbActiveUrl">Yükleniyor…</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn btn-red" onclick="setWebhook()">🔗 Webhook Kur / Güncelle</button>
          <button class="btn btn-outline-red" onclick="deleteWebhook()">✕ Webhook Sil (Polling Modu)</button>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="card-icon green">📊</div>
        <span class="card-label">İstatistikler</span>
      </div>
      <div class="card-body">
        <div class="info-grid">
          <div class="info-cell"><label>Bekleyen Mesaj</label><span id="wbPending">—</span></div>
          <div class="info-cell"><label>Webhook Modu</label><span id="wbMode">—</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── PAGE: AYARLAR ── -->
  <div class="page" id="page-config">
    <div class="card">
      <div class="card-head">
        <div class="card-icon red">⚙️</div>
        <span class="card-label">Bot Yapılandırması</span>
      </div>
      <div class="card-body">
        <div class="field"><label>Grup Chat ID</label><input id="cfg_chat_id" type="text" placeholder="-100…"/></div>
        <div class="field"><label>Özel Chat ID</label><input id="cfg_private_chat_id" type="text" placeholder="-528…"/></div>
        <div class="field"><label>Creator ID</label><input id="cfg_creator_id" type="text" placeholder="757…"/></div>
        <div class="field"><label>Webhook URL</label><input id="cfg_webhookUrl" type="text" placeholder="https://…/bot/"/></div>
        <button class="btn btn-red" onclick="saveConfig()">💾 Kaydet</button>
      </div>
    </div>
  </div>

  <!-- ── PAGE: FİLTRELER ── -->
  <div class="page" id="page-filters">
    <!-- Kategori seçim görünümü -->
    <div id="filterCatView">
      <div class="card-head" style="padding:0 0 10px;background:none;border:none">
        <div class="card-icon red">📋</div>
        <span class="card-label">Kategori Seç</span>
        <span style="margin-left:auto;font-size:11px;color:var(--muted)" id="totalCount"></span>
      </div>
      <div class="cat-grid" id="catGrid"></div>
    </div>
    <!-- Filtre listesi görünümü -->
    <div id="filterListView" style="display:none">
      <div class="back-btn" onclick="showCatView()">← Kategoriler</div>
      <div class="card">
        <div class="card-head">
          <div class="card-icon red" id="listCatIcon">📋</div>
          <span class="card-label" id="listCatName">—</span>
          <span style="margin-left:auto;font-size:11px;color:var(--muted)" id="listCatCount"></span>
        </div>
        <div class="card-body" style="padding-top:8px">
          <div class="filter-items-wrap" id="filterItems"></div>
        </div>
      </div>
    </div>
  </div>

</div><!-- /scroll-area -->

<!-- BOTTOM NAV -->
<div class="bottom-nav">
  <div class="nav-btn active" id="nb-status" onclick="switchTab('status')">
    <span class="n-icon">📊</span><span class="n-label">Durum</span>
  </div>
  <div class="nav-btn" id="nb-webhook" onclick="switchTab('webhook')">
    <span class="n-icon">🔗</span><span class="n-label">Webhook</span>
  </div>
  <div class="nav-btn" id="nb-config" onclick="switchTab('config')">
    <span class="n-icon">⚙️</span><span class="n-label">Ayarlar</span>
  </div>
  <div class="nav-btn" id="nb-filters" onclick="switchTab('filters')">
    <span class="n-icon">📋</span><span class="n-label">Filtreler</span>
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
        <textarea id="editText" rows="8"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" style="flex:1" onclick="closeModal()">İptal</button>
        <button class="btn btn-red" style="flex:2" onclick="saveFilter()">💾 Kaydet</button>
      </div>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
const BASE = '/api';
let filtersData = {};
let editingFilter = null;
const catIcons = { tools:'🛠️', mix:'🎲', blog:'📝', bashScript:'💻' };

// ── TAB NAV ──────────────────────────────────────────
function switchTab(tab) {
  ['status','webhook','config','filters'].forEach(t => {
    document.getElementById('page-'+t).classList.toggle('active', t===tab);
    document.getElementById('nb-'+t).classList.toggle('active', t===tab);
  });
  document.getElementById('scrollArea').scrollTop = 0;
}

// ── TOAST ────────────────────────────────────────────
function toast(msg, ok=true) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + (ok ? 'ok' : 'err');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── STATUS ───────────────────────────────────────────
async function loadStatus() {
  const dot = document.getElementById('hdrDot');
  const hst = document.getElementById('hdrStatus');
  dot.className = 'hdr-dot checking';
  hst.textContent = '…';
  try {
    const r = await fetch(BASE+'/bot/status');
    const d = await r.json();
    if (d.ok && d.me) {
      dot.className = 'hdr-dot on';
      hst.textContent = 'Çevrimiçi';
      const wb = d.webhook ?? {};
      const pending = wb.pending_update_count ?? 0;
      const wbUrl = wb.url || '';
      document.getElementById('statBotId').textContent = d.me.id;
      document.getElementById('statPending').textContent = pending;
      document.getElementById('infoGrid').innerHTML =
        '<div class="info-cell"><label>Ad</label><span>'+d.me.first_name+'</span></div>'+
        '<div class="info-cell"><label>Kullanıcı Adı</label><span>@'+d.me.username+'</span></div>';
      const dispUrl = wbUrl || '— (Polling Modu)';
      document.getElementById('wbUrlDisplay').textContent = dispUrl;
      document.getElementById('wbActiveUrl').textContent = dispUrl;
      document.getElementById('wbPending').textContent = pending > 0 ? '⚠️ '+pending : '✓ 0';
      document.getElementById('wbMode').textContent = wbUrl ? '🔗 Webhook' : '🔄 Polling';
    } else {
      dot.className = 'hdr-dot off';
      hst.textContent = 'Çevrimdışı';
    }
  } catch(e) {
    dot.className = 'hdr-dot off';
    hst.textContent = 'Hata';
  }
}

// ── WEBHOOK ──────────────────────────────────────────
async function setWebhook() {
  toast('Webhook kuruluyor…');
  const r = await fetch(BASE+'/bot/webhook/set', {method:'POST'});
  const d = await r.json();
  toast(d.ok ? '✓ Webhook kuruldu!' : '✗ '+d.description, d.ok);
  if (d.ok) loadStatus();
}

async function deleteWebhook() {
  if (!confirm('Webhook silinsin mi? Bot polling moduna geçer.')) return;
  const r = await fetch(BASE+'/bot/webhook', {method:'DELETE'});
  const d = await r.json();
  toast(d.ok ? '✓ Webhook silindi' : '✗ '+d.description, d.ok);
  if (d.ok) loadStatus();
}

// ── CONFIG ───────────────────────────────────────────
async function loadConfig() {
  const r = await fetch(BASE+'/bot/config');
  const d = await r.json();
  document.getElementById('cfg_chat_id').value = d.chat_id ?? '';
  document.getElementById('cfg_private_chat_id').value = d.private_chat_id ?? '';
  document.getElementById('cfg_creator_id').value = d.creator_id ?? '';
  document.getElementById('cfg_webhookUrl').value = d.webhookUrl ?? '';
}

async function saveConfig() {
  const body = {
    chat_id: document.getElementById('cfg_chat_id').value,
    private_chat_id: document.getElementById('cfg_private_chat_id').value,
    creator_id: document.getElementById('cfg_creator_id').value,
    webhookUrl: document.getElementById('cfg_webhookUrl').value,
  };
  const r = await fetch(BASE+'/bot/config', {
    method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)
  });
  const d = await r.json();
  toast(d.ok ? '✓ Ayarlar kaydedildi' : '✗ Kaydetme hatası', d.ok);
}

// ── FILTERS ──────────────────────────────────────────
const typeInfo = { '1':['Metin','t1'], '2':['Dosya','t2'], '3':['Video','t3'] };

async function loadFilters() {
  const r = await fetch(BASE+'/bot/filters-detail');
  filtersData = await r.json();
  const total = Object.values(filtersData).reduce((a,b)=>a+b.length,0);
  document.getElementById('totalCount').textContent = total+' komut';
  const grid = document.getElementById('catGrid');
  grid.innerHTML = Object.keys(filtersData).map(cat => {
    const icon = catIcons[cat] ?? '📁';
    const count = filtersData[cat].length;
    return '<div class="cat-card" data-cat="'+cat+'" onclick="showFilterList(\''+cat+'\')">' +
      '<div class="cat-card-icon">'+icon+'</div>' +
      '<div class="cat-card-name">'+cat+'</div>' +
      '<div class="cat-card-count">'+count+' komut</div>' +
      '</div>';
  }).join('');
}

function showCatView() {
  document.getElementById('filterCatView').style.display = '';
  document.getElementById('filterListView').style.display = 'none';
  document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
}

function showFilterList(cat) {
  document.querySelectorAll('.cat-card').forEach(c => c.classList.toggle('active', c.dataset.cat===cat));
  document.getElementById('filterCatView').style.display = 'none';
  document.getElementById('filterListView').style.display = '';
  document.getElementById('listCatIcon').textContent = catIcons[cat] ?? '📁';
  document.getElementById('listCatName').textContent = cat;
  const items = filtersData[cat] ?? [];
  document.getElementById('listCatCount').textContent = items.length+' komut';
  const wrap = document.getElementById('filterItems');
  if (!items.length) { wrap.innerHTML = '<div style="color:var(--muted);text-align:center;padding:16px;font-size:13px">Bu kategoride komut yok</div>'; return; }
  wrap.innerHTML = items.map(item => {
    const [tlbl, tcls] = typeInfo[item.type] ?? ['?','t1'];
    const preview = (item.text||'').replace(/\n/g,' ').slice(0,55) + ((item.text||'').length>55?'…':'');
    return '<div class="filter-item" onclick=\'openEdit('+JSON.stringify(JSON.stringify(item))+','+JSON.stringify(cat)+')\'>' +
      '<div class="fi-left"><div class="fi-name">'+item.name+'</div><div class="fi-preview">'+(preview||'—')+'</div></div>' +
      '<span class="fi-badge '+tcls+'">'+tlbl+'</span>' +
      '<span class="fi-arrow">›</span>' +
      '</div>';
  }).join('');
}

// ── MODAL ────────────────────────────────────────────
function openEdit(itemJson, cat) {
  const item = JSON.parse(itemJson);
  editingFilter = { item, cat };
  document.getElementById('editTitle').textContent = item.name;
  document.getElementById('editSub').innerHTML =
    '<span class="modal-tag">'+cat+'</span>' +
    '<span class="modal-tag">'+(typeInfo[item.type]?.[0]??'?')+'</span>';
  document.getElementById('editText').value = item.text ?? '';
  document.getElementById('editModal').classList.add('open');
}

function closeModal() {
  document.getElementById('editModal').classList.remove('open');
  editingFilter = null;
}

function maybeCloseModal(e) {
  if (e.target === document.getElementById('editModal')) closeModal();
}

async function saveFilter() {
  if (!editingFilter) return;
  const { item, cat } = editingFilter;
  const text = document.getElementById('editText').value;
  const r = await fetch(BASE+'/bot/filters/'+cat+'/'+item.key, {
    method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ text })
  });
  const d = await r.json();
  if (d.ok) {
    toast('✓ '+item.name+' güncellendi');
    item.text = text;
    const idx = filtersData[cat].findIndex(x => x.key === item.key);
    if (idx >= 0) filtersData[cat][idx].text = text;
    showFilterList(cat);
    closeModal();
  } else {
    toast('✗ Kaydetme hatası', false);
  }
}

// ── INIT ─────────────────────────────────────────────
loadStatus();
loadConfig();
loadFilters();
</script>
</body>
</html>`;

router.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

export default router;
