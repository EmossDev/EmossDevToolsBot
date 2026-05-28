import { Router } from "express";

const router = Router();

const html = String.raw`<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<meta name="mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="theme-color" content="#1a0000"/>
<title>EmossDevToolsBot Panel</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
:root{
  --bg:#0d0000;
  --bg2:#110000;
  --card:#1c0505;
  --card2:#240808;
  --card3:#2e0a0a;
  --accent:#dc2626;
  --accent2:#ef4444;
  --accent3:#ff6b6b;
  --glow:#dc262640;
  --green:#22c55e;
  --red:#dc2626;
  --yellow:#f59e0b;
  --text:#fff1f1;
  --muted:#b07070;
  --border:#3d1010;
  --border2:#4a1515;
}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100dvh;padding-bottom:40px;overflow-x:hidden}

/* HEADER */
header{
  background:linear-gradient(135deg,#1a0000 0%,#2d0505 50%,#1a0000 100%);
  padding:18px 16px 14px;
  display:flex;align-items:center;gap:12px;
  position:sticky;top:0;z-index:20;
  border-bottom:1px solid var(--border2);
  box-shadow:0 4px 24px #dc262620;
}
.logo{
  width:42px;height:42px;border-radius:14px;
  background:linear-gradient(135deg,var(--accent),#7f1d1d);
  display:grid;place-items:center;font-size:22px;
  box-shadow:0 0 16px var(--glow);flex-shrink:0;
}
header h1{font-size:17px;font-weight:700;letter-spacing:.01em}
header p{font-size:11px;color:var(--muted);margin-top:2px}

/* NAV TABS */
.nav{display:flex;gap:0;border-bottom:1px solid var(--border);background:var(--bg2);overflow-x:auto;scrollbar-width:none;position:sticky;top:70px;z-index:19}
.nav::-webkit-scrollbar{display:none}
.nav-tab{flex:1;min-width:70px;padding:11px 6px;text-align:center;font-size:11px;font-weight:600;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:.15s}
.nav-tab.active{color:var(--accent3);border-bottom-color:var(--accent)}

/* PAGES */
.page{display:none;padding:14px;flex-direction:column;gap:12px}
.page.active{display:flex}

/* CARD */
.card{background:var(--card);border-radius:16px;padding:16px;border:1px solid var(--border)}
.card-title{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;display:flex;align-items:center;gap:6px}
.card-title::before{content:'';width:3px;height:12px;background:var(--accent);border-radius:2px;flex-shrink:0}

/* STATUS */
.status-row{display:flex;align-items:center;justify-content:space-between}
.status-badge{display:flex;align-items:center;gap:10px;font-size:16px;font-weight:700}
.dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;transition:.3s}
.dot.online{background:var(--green);box-shadow:0 0 10px #22c55e80}
.dot.offline{background:var(--red);box-shadow:0 0 10px #dc262680}
.dot.loading{background:var(--yellow);box-shadow:0 0 10px #f59e0b80;animation:blink 1.2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.refresh-btn{background:var(--card2);border:1px solid var(--border2);color:var(--muted);border-radius:10px;padding:7px 12px;font-size:13px;cursor:pointer;transition:.1s}
.refresh-btn:active{opacity:.6;transform:scale(.95)}

.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
.info-item{background:var(--card2);border-radius:12px;padding:11px;border:1px solid var(--border)}
.info-item label{font-size:10px;color:var(--muted);display:block;margin-bottom:4px;font-weight:600}
.info-item span{font-size:13px;font-weight:600;word-break:break-all;color:var(--text)}

/* WEBHOOK URL BOX */
.url-box{background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:12px;line-height:1.5}
.url-box strong{display:block;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px}
.url-box span{font-size:12px;color:var(--accent3);word-break:break-all}

/* BUTTONS */
.btn{
  display:flex;align-items:center;justify-content:center;gap:8px;
  width:100%;padding:14px;border-radius:14px;border:none;
  font-size:14px;font-weight:700;cursor:pointer;transition:.15s;
  letter-spacing:.01em;
}
.btn:active{transform:scale(.97)}
.btn-red{background:linear-gradient(135deg,var(--accent),#991b1b);color:#fff;box-shadow:0 4px 16px var(--glow)}
.btn-outline{background:var(--card2);color:var(--accent3);border:1px solid var(--border2)}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border)}
.btn-green{background:linear-gradient(135deg,#166534,#15803d);color:#fff}
.btn-row{display:flex;gap:10px}
.btn-row .btn{flex:1}

/* FORM FIELDS */
.field{margin-bottom:10px}
.field label{display:block;font-size:11px;font-weight:600;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em}
.field input,.field textarea{
  width:100%;background:var(--card2);
  border:1px solid var(--border2);border-radius:12px;
  padding:11px 13px;color:var(--text);font-size:14px;
  outline:none;transition:.2s;font-family:inherit;
}
.field textarea{resize:vertical;min-height:100px;line-height:1.5;font-size:13px}
.field input:focus,.field textarea:focus{border-color:var(--accent);background:var(--card3);box-shadow:0 0 0 3px var(--glow)}

/* FILTER LIST */
.filter-header{display:flex;gap:6px;margin-bottom:12px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none}
.filter-header::-webkit-scrollbar{display:none}
.f-tab{padding:7px 14px;border-radius:20px;border:1px solid var(--border2);background:var(--card2);color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:.15s}
.f-tab.active{background:var(--accent);border-color:var(--accent);color:#fff;box-shadow:0 2px 12px var(--glow)}
.filter-items{display:flex;flex-direction:column;gap:8px}
.filter-item{background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:12px;cursor:pointer;transition:.15s;active:opacity:.8}
.filter-item:active{border-color:var(--accent);background:var(--card3)}
.fi-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
.fi-name{font-size:13px;font-weight:700;color:var(--accent3);font-family:monospace}
.fi-type{font-size:10px;padding:2px 8px;border-radius:20px;font-weight:600}
.fi-type.t1{background:#1e3a2e;color:#4ade80}
.fi-type.t2{background:#1a1e3a;color:#818cf8}
.fi-type.t3{background:#3a1e1e;color:#f87171}
.fi-text{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}

/* MODAL */
.modal-bg{
  display:none;position:fixed;inset:0;background:#00000090;z-index:100;
  align-items:flex-end;backdrop-filter:blur(4px);
}
.modal-bg.open{display:flex}
.modal{
  background:var(--card);border-radius:24px 24px 0 0;
  border-top:1px solid var(--border2);padding:0;
  width:100%;max-height:85dvh;overflow-y:auto;
  animation:slideUp .25s ease;
}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.modal-handle{width:40px;height:4px;border-radius:2px;background:var(--border2);margin:12px auto 0}
.modal-content{padding:16px}
.modal-title{font-size:16px;font-weight:700;margin-bottom:4px}
.modal-sub{font-size:12px;color:var(--muted);margin-bottom:16px}
.modal-actions{display:flex;gap:10px;margin-top:12px}

/* TOAST */
.toast{
  position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
  border-radius:14px;padding:11px 20px;font-size:13px;font-weight:600;
  z-index:200;opacity:0;transition:.3s;pointer-events:none;white-space:nowrap;
  border:1px solid transparent;
}
.toast.show{opacity:1}
.toast.ok{background:#0f2018;border-color:#22c55e40;color:#86efac}
.toast.err{background:#200f0f;border-color:#dc262640;color:#fca5a5}
</style>
</head>
<body>

<header>
  <div class="logo">🤖</div>
  <div>
    <h1>EmossDevToolsBot</h1>
    <p>Kontrol Paneli</p>
  </div>
</header>

<div class="nav">
  <div class="nav-tab active" onclick="switchTab('status')">📊 Durum</div>
  <div class="nav-tab" onclick="switchTab('webhook')">🔗 Webhook</div>
  <div class="nav-tab" onclick="switchTab('config')">⚙️ Ayarlar</div>
  <div class="nav-tab" onclick="switchTab('filters')">📋 Filtreler</div>
</div>

<!-- STATUS PAGE -->
<div class="page active" id="page-status">
  <div class="card">
    <div class="card-title">Bot Durumu</div>
    <div class="status-row">
      <div class="status-badge">
        <div class="dot loading" id="statusDot"></div>
        <span id="statusText">Kontrol ediliyor…</span>
      </div>
      <button class="refresh-btn" onclick="loadStatus()">↻</button>
    </div>
    <div class="info-grid" id="infoGrid"></div>
  </div>
</div>

<!-- WEBHOOK PAGE -->
<div class="page" id="page-webhook">
  <div class="card">
    <div class="card-title">Aktif Webhook</div>
    <div class="url-box" id="webhookBox">
      <strong>URL</strong><span>Yükleniyor…</span>
    </div>
    <div class="btn-row">
      <button class="btn btn-red" onclick="setWebhook()">🔗 Webhook Kur</button>
      <button class="btn btn-outline" onclick="deleteWebhook()">✕ Sil</button>
    </div>
  </div>
  <div class="card">
    <div class="card-title">Bekleyen Güncellemeler</div>
    <div class="info-item" style="border-radius:12px">
      <label>Bekleyen Mesaj</label>
      <span id="pendingCount">—</span>
    </div>
  </div>
</div>

<!-- CONFIG PAGE -->
<div class="page" id="page-config">
  <div class="card">
    <div class="card-title">Bot Yapılandırması</div>
    <div class="field"><label>Grup Chat ID</label><input id="cfg_chat_id" type="text" placeholder="-100…"/></div>
    <div class="field"><label>Özel Chat ID</label><input id="cfg_private_chat_id" type="text" placeholder="-528…"/></div>
    <div class="field"><label>Creator ID</label><input id="cfg_creator_id" type="text" placeholder="757…"/></div>
    <div class="field"><label>Webhook URL</label><input id="cfg_webhookUrl" type="text" placeholder="https://…/bot/"/></div>
    <button class="btn btn-red" onclick="saveConfig()" style="margin-top:4px">💾 Kaydet</button>
  </div>
</div>

<!-- FILTERS PAGE -->
<div class="page" id="page-filters">
  <div class="card">
    <div class="card-title">Filtre Komutları</div>
    <div class="filter-header" id="filterTabs"></div>
    <div class="filter-items" id="filterList"><div style="color:var(--muted);text-align:center;padding:20px;font-size:13px">Yükleniyor…</div></div>
  </div>
</div>

<!-- EDIT MODAL -->
<div class="modal-bg" id="editModal" onclick="closeModal(event)">
  <div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-content">
      <div class="modal-title" id="editTitle">Filtre Düzenle</div>
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
let activeFilterTab = '';
let editingFilter = null;

// ── NAV ──────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.nav-tab').forEach((t,i)=>{
    const tabs = ['status','webhook','config','filters'];
    t.classList.toggle('active', tabs[i] === tab);
  });
  document.querySelectorAll('.page').forEach(p=>{
    p.classList.toggle('active', p.id === 'page-'+tab);
  });
}

// ── TOAST ────────────────────────────────────────────
function toast(msg, ok=true) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + (ok ? 'ok' : 'err');
  clearTimeout(t._t);
  t._t = setTimeout(()=>t.classList.remove('show'), 2600);
}

// ── STATUS ───────────────────────────────────────────
async function loadStatus() {
  const dot = document.getElementById('statusDot');
  const txt = document.getElementById('statusText');
  dot.className = 'dot loading';
  txt.textContent = 'Kontrol ediliyor…';
  document.getElementById('infoGrid').innerHTML = '';
  try {
    const r = await fetch(BASE+'/bot/status');
    const d = await r.json();
    if (d.ok && d.me) {
      dot.className = 'dot online';
      txt.textContent = 'Çevrimiçi';
      const wb = d.webhook ?? {};
      const pending = wb.pending_update_count ?? 0;
      document.getElementById('pendingCount').textContent = pending > 0 ? pending + ' bekleyen' : '0 — temiz';
      const wbUrl = wb.url || '—';
      document.getElementById('webhookBox').innerHTML =
        '<strong>URL</strong><span>' + wbUrl + '</span>';
      document.getElementById('infoGrid').innerHTML =
        '<div class="info-item"><label>Ad</label><span>'+d.me.first_name+'</span></div>' +
        '<div class="info-item"><label>Kullanıcı Adı</label><span>@'+d.me.username+'</span></div>' +
        '<div class="info-item"><label>Bot ID</label><span>'+d.me.id+'</span></div>' +
        '<div class="info-item"><label>Bekleyen</label><span>'+(pending > 0 ? '⚠️ '+pending : '✓ 0')+'</span></div>';
    } else {
      dot.className = 'dot offline';
      txt.textContent = 'Çevrimdışı / Hata';
    }
  } catch(e) {
    dot.className = 'dot offline';
    txt.textContent = 'Bağlantı hatası';
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
const typeLabel = {
  '1': ['Metin', 't1'],
  '2': ['Foto/Belge', 't2'],
  '3': ['Video', 't3'],
};

function renderFilters(cat) {
  activeFilterTab = cat;
  document.querySelectorAll('.f-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.cat === cat);
  });
  const items = filtersData[cat] ?? [];
  const list = document.getElementById('filterList');
  if (!items.length) { list.innerHTML = '<div style="color:var(--muted);padding:16px;text-align:center;font-size:13px">Bu kategoride komut yok</div>'; return; }
  list.innerHTML = items.map(item => {
    const [tlabel, tcls] = typeLabel[item.type] ?? ['Bilinmiyor', 't1'];
    const preview = (item.text || '').replace(/\n/g, ' ').slice(0, 60) + ((item.text || '').length > 60 ? '…' : '');
    return '<div class="filter-item" onclick=\'openEdit('+JSON.stringify(JSON.stringify(item))+','+JSON.stringify(cat)+')\'>' +
      '<div class="fi-top"><span class="fi-name">'+item.name+'</span><span class="fi-type '+tcls+'">'+tlabel+'</span></div>' +
      '<div class="fi-text">'+(preview || '—')+'</div>' +
      '</div>';
  }).join('');
}

async function loadFilters() {
  const r = await fetch(BASE+'/bot/filters-detail');
  filtersData = await r.json();
  const tabs = document.getElementById('filterTabs');
  tabs.innerHTML = Object.keys(filtersData).map(cat =>
    '<div class="f-tab" data-cat="'+cat+'" onclick="renderFilters(\''+cat+'\')">' +
    cat + ' <span style="opacity:.6">('+filtersData[cat].length+')</span></div>'
  ).join('');
  const first = Object.keys(filtersData)[0];
  if (first) renderFilters(first);
}

// ── MODAL ────────────────────────────────────────────
function openEdit(itemJson, cat) {
  const item = JSON.parse(itemJson);
  editingFilter = { item, cat };
  document.getElementById('editTitle').textContent = item.name;
  document.getElementById('editSub').textContent = 'Kategori: ' + cat + ' · Tür: ' + (typeLabel[item.type]?.[0] ?? '?');
  document.getElementById('editText').value = item.text ?? '';
  document.getElementById('editModal').classList.add('open');
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('editModal')) {
    document.getElementById('editModal').classList.remove('open');
    editingFilter = null;
  }
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
    renderFilters(cat);
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
