import { Router } from "express";

const router = Router();

const html = String.raw`<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<meta name="mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<title>EmossDevToolsBot Panel</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0f0f13;--card:#1a1a22;--card2:#22222e;
  --accent:#6c63ff;--accent2:#ff6584;
  --green:#22c55e;--red:#ef4444;--yellow:#f59e0b;
  --text:#f1f1f5;--muted:#9090a8;--border:#2e2e3e;
}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100dvh;padding-bottom:32px}
header{background:linear-gradient(135deg,#1e1b4b,#312e81);padding:20px 16px 16px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:10;box-shadow:0 2px 12px #0008}
header .logo{width:40px;height:40px;border-radius:12px;background:var(--accent);display:grid;place-items:center;font-size:22px}
header h1{font-size:17px;font-weight:700}
header p{font-size:12px;color:#a5b4fc;margin-top:2px}
.container{padding:16px;display:flex;flex-direction:column;gap:14px}
.card{background:var(--card);border-radius:16px;padding:16px;border:1px solid var(--border)}
.card-title{font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px}
.status-row{display:flex;align-items:center;justify-content:space-between}
.status-badge{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600}
.dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.dot.green{background:var(--green);box-shadow:0 0 8px var(--green)}
.dot.red{background:var(--red);box-shadow:0 0 8px var(--red)}
.dot.yellow{background:var(--yellow);box-shadow:0 0 8px var(--yellow)}
.dot.pulse{animation:pulse 1.4s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.refresh-btn{background:var(--card2);border:1px solid var(--border);color:var(--muted);border-radius:8px;padding:6px 10px;font-size:13px;cursor:pointer}
.refresh-btn:active{opacity:.7}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
.info-item{background:var(--card2);border-radius:10px;padding:10px}
.info-item label{font-size:10px;color:var(--muted);display:block;margin-bottom:3px}
.info-item span{font-size:13px;font-weight:500;word-break:break-all}
.btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:13px;border-radius:12px;border:none;font-size:14px;font-weight:600;cursor:pointer;transition:.15s}
.btn:active{transform:scale(.97)}
.btn-primary{background:var(--accent);color:#fff}
.btn-danger{background:var(--card2);color:var(--red);border:1px solid var(--red)40}
.btn-row{display:flex;gap:10px}
.btn-row .btn{flex:1}
.webhook-url{background:var(--card2);border-radius:10px;padding:10px;font-size:11px;color:var(--muted);word-break:break-all;margin-bottom:12px;line-height:1.5}
.webhook-url strong{color:var(--text);display:block;margin-bottom:4px;font-size:12px}
.field{margin-bottom:10px}
.field label{display:block;font-size:12px;color:var(--muted);margin-bottom:6px}
.field input{width:100%;background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;color:var(--text);font-size:14px;outline:none}
.field input:focus{border-color:var(--accent)}
.save-btn{background:var(--accent);color:#fff;border:none;border-radius:12px;padding:12px;width:100%;font-size:14px;font-weight:600;cursor:pointer;margin-top:4px}
.save-btn:active{opacity:.8}
.filter-tabs{display:flex;gap:6px;margin-bottom:12px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}
.filter-tabs::-webkit-scrollbar{display:none}
.tab{padding:6px 14px;border-radius:20px;border:1px solid var(--border);background:var(--card2);color:var(--muted);font-size:13px;cursor:pointer;white-space:nowrap;flex-shrink:0}
.tab.active{background:var(--accent);border-color:var(--accent);color:#fff}
.filter-list{display:flex;flex-wrap:wrap;gap:6px}
.filter-tag{background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:5px 10px;font-size:12px;font-family:monospace;color:#a5b4fc}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1e1e2e;border:1px solid var(--border);border-radius:12px;padding:10px 18px;font-size:13px;color:var(--text);z-index:100;opacity:0;transition:.3s;pointer-events:none;white-space:nowrap}
.toast.show{opacity:1}
.pending-badge{background:var(--yellow)20;color:var(--yellow);border-radius:6px;padding:2px 8px;font-size:12px;font-weight:600}
.section-empty{color:var(--muted);font-size:13px;text-align:center;padding:16px 0}
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
<div class="container">

  <!-- STATUS CARD -->
  <div class="card">
    <div class="card-title">Bot Durumu</div>
    <div class="status-row">
      <div class="status-badge">
        <div class="dot yellow pulse" id="statusDot"></div>
        <span id="statusText">Kontrol ediliyor…</span>
      </div>
      <button class="refresh-btn" onclick="loadStatus()">↻ Yenile</button>
    </div>
    <div class="info-grid" id="infoGrid"></div>
  </div>

  <!-- WEBHOOK CARD -->
  <div class="card">
    <div class="card-title">Webhook Kontrolü</div>
    <div class="webhook-url" id="webhookUrl"><strong>Webhook URL</strong>Yükleniyor…</div>
    <div class="btn-row">
      <button class="btn btn-primary" onclick="setWebhook()">🔗 Webhook Kur</button>
      <button class="btn btn-danger" onclick="deleteWebhook()">✕ Sil</button>
    </div>
  </div>

  <!-- CONFIG CARD -->
  <div class="card">
    <div class="card-title">Yapılandırma</div>
    <div class="field"><label>Grup Chat ID (chat_id)</label><input id="cfg_chat_id" type="text" placeholder="-1001234567890"/></div>
    <div class="field"><label>Özel Chat ID (private_chat_id)</label><input id="cfg_private_chat_id" type="text" placeholder="-5289129879"/></div>
    <div class="field"><label>Creator ID</label><input id="cfg_creator_id" type="text" placeholder="7578325376"/></div>
    <div class="field"><label>Webhook URL</label><input id="cfg_webhookUrl" type="text" placeholder="https://…/bot/"/></div>
    <button class="save-btn" onclick="saveConfig()">💾 Kaydet</button>
  </div>

  <!-- FILTERS CARD -->
  <div class="card">
    <div class="card-title">Filtre Komutları</div>
    <div class="filter-tabs" id="filterTabs"></div>
    <div class="filter-list" id="filterList"><div class="section-empty">Yükleniyor…</div></div>
  </div>

</div>
<div class="toast" id="toast"></div>

<script>
const BASE = '/api';
let filtersData = {};
let activeTab = '';

function showToast(msg, ok=true) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = ok ? '#1a2e1a' : '#2e1a1a';
  t.style.borderColor = ok ? '#22c55e40' : '#ef444440';
  t.style.color = ok ? '#86efac' : '#fca5a5';
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2500);
}

async function loadStatus() {
  document.getElementById('statusDot').className = 'dot yellow pulse';
  document.getElementById('statusText').textContent = 'Kontrol ediliyor…';
  document.getElementById('infoGrid').innerHTML = '';
  try {
    const r = await fetch(BASE+'/bot/status');
    const d = await r.json();
    if(d.ok && d.me) {
      document.getElementById('statusDot').className = 'dot green';
      document.getElementById('statusText').textContent = 'Çevrimiçi';
      const wb = d.webhook;
      const pending = wb?.pending_update_count || 0;
      document.getElementById('infoGrid').innerHTML = \`
        <div class="info-item"><label>Bot Adı</label><span>\${d.me.first_name}</span></div>
        <div class="info-item"><label>Kullanıcı Adı</label><span>@\${d.me.username}</span></div>
        <div class="info-item"><label>Bot ID</label><span>\${d.me.id}</span></div>
        <div class="info-item"><label>Bekleyen</label><span>\${pending > 0 ? '<span class="pending-badge">'+pending+'</span>' : '—'}</span></div>
      \`;
      const wbUrl = wb?.url || '—';
      document.getElementById('webhookUrl').innerHTML = \`<strong>Webhook URL</strong>\${wbUrl}\`;
    } else {
      document.getElementById('statusDot').className = 'dot red';
      document.getElementById('statusText').textContent = 'Çevrimdışı';
    }
  } catch(e) {
    document.getElementById('statusDot').className = 'dot red';
    document.getElementById('statusText').textContent = 'Bağlantı hatası';
  }
}

async function setWebhook() {
  showToast('Webhook kuruluyor…');
  const r = await fetch(BASE+'/bot/webhook/set', {method:'POST'});
  const d = await r.json();
  showToast(d.ok ? '✓ Webhook kuruldu' : '✗ '+d.description, d.ok);
  loadStatus();
}

async function deleteWebhook() {
  if(!confirm('Webhook silinsin mi?')) return;
  const r = await fetch(BASE+'/bot/webhook', {method:'DELETE'});
  const d = await r.json();
  showToast(d.ok ? '✓ Webhook silindi (Polling modu)' : '✗ '+d.description, d.ok);
  loadStatus();
}

async function loadConfig() {
  const r = await fetch(BASE+'/bot/config');
  const d = await r.json();
  document.getElementById('cfg_chat_id').value = d.chat_id || '';
  document.getElementById('cfg_private_chat_id').value = d.private_chat_id || '';
  document.getElementById('cfg_creator_id').value = d.creator_id || '';
  document.getElementById('cfg_webhookUrl').value = d.webhookUrl || '';
}

async function saveConfig() {
  const body = {
    chat_id: document.getElementById('cfg_chat_id').value,
    private_chat_id: document.getElementById('cfg_private_chat_id').value,
    creator_id: document.getElementById('cfg_creator_id').value,
    webhookUrl: document.getElementById('cfg_webhookUrl').value,
  };
  const r = await fetch(BASE+'/bot/config', {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const d = await r.json();
  showToast(d.ok ? '✓ Kaydedildi' : '✗ Hata', d.ok);
}

function renderFilters(cat) {
  activeTab = cat;
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.cat===cat));
  const names = filtersData[cat] || [];
  document.getElementById('filterList').innerHTML = names.length
    ? names.map(n=>\`<div class="filter-tag">\${n}</div>\`).join('')
    : '<div class="section-empty">Komut yok</div>';
}

async function loadFilters() {
  const r = await fetch(BASE+'/bot/filters');
  filtersData = await r.json();
  const tabs = document.getElementById('filterTabs');
  tabs.innerHTML = Object.keys(filtersData).map(cat=>
    \`<div class="tab" data-cat="\${cat}" onclick="renderFilters('\${cat}')">\${cat} (\${filtersData[cat].length})</div>\`
  ).join('');
  const first = Object.keys(filtersData)[0];
  if(first) renderFilters(first);
}

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
