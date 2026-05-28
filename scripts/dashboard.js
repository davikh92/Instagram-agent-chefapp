#!/usr/bin/env node
/**
 * dashboard.js — gera painel visual de todos os posts e reels
 *
 * Uso:
 *   node scripts/dashboard.js
 *   → Abre dashboard.html no browser automaticamente
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT      = path.resolve(__dirname, '..');
const READY_DIR = path.join(ROOT, 'ready-to-post');
const OUT_FILE  = path.join(ROOT, 'dashboard.html');

// ── Coleta todos os itens de ready-to-post ───────────────────────────────────

function collectItems() {
  const items = [];
  const today = new Date().toISOString().split('T')[0];
  if (!fs.existsSync(READY_DIR)) return items;

  for (const month of fs.readdirSync(READY_DIR).filter(d => fs.statSync(path.join(READY_DIR,d)).isDirectory()).sort()) {
    const monthDir = path.join(READY_DIR, month);
    for (const date of fs.readdirSync(monthDir).filter(d => fs.statSync(path.join(monthDir,d)).isDirectory()).sort()) {
      const dateDir = path.join(monthDir, date);
      for (const id of fs.readdirSync(dateDir).filter(d => fs.statSync(path.join(dateDir,d)).isDirectory()).sort()) {
        const dir   = path.join(dateDir, id);
        const files = fs.readdirSync(dir);

        const published = files.includes('published.json');
        const hasReel   = files.includes('reel.mp4');
        const hasCover  = files.includes('cover.png');
        const slides    = files.filter(f => f.match(/^slide-\d+\.png$/)).sort();

        let tipo = 'post';
        if (hasReel) tipo = 'reel';
        else if (slides.length > 1) tipo = 'carrossel';

        let status = 'agendado';
        if (published)        status = 'publicado';
        else if (date > today) status = 'futuro';
        else if (date === today) status = 'hoje';

        const captionFile = path.join(dir, 'caption.txt');
        const caption = fs.existsSync(captionFile)
          ? fs.readFileSync(captionFile, 'utf8').trim().substring(0, 300) : '';

        const rel = p => path.relative(ROOT, p).replace(/\\/g, '/');

        let meta = {};
        const jsonFile = files.find(f => f.endsWith('.json') && f !== 'published.json');
        if (jsonFile) { try { meta = JSON.parse(fs.readFileSync(path.join(dir, jsonFile), 'utf8')); } catch {} }

        items.push({
          date, id, tipo, status,
          hasReel, hasCover,
          previewPath : hasCover ? rel(path.join(dir,'cover.png')) : slides.length ? rel(path.join(dir,slides[0])) : null,
          allSlides   : slides.map(s => rel(path.join(dir,s))),
          reelPath    : hasReel ? rel(path.join(dir,'reel.mp4')) : null,
          caption,
          prompt      : meta.prompt || null,
        });
      }
    }
  }
  return items;
}

// ── Gera HTML ────────────────────────────────────────────────────────────────

function generateHTML(items) {
  const today     = new Date().toISOString().split('T')[0];
  const total     = items.length;
  const publicados= items.filter(i => i.status === 'publicado').length;
  const pendentes = items.filter(i => ['agendado','hoje'].includes(i.status)).length;
  const futuros   = items.filter(i => i.status === 'futuro').length;

  const COLOR = { publicado:'#22c55e', hoje:'#f59e0b', agendado:'#3b82f6', futuro:'#8b5cf6' };
  const LABEL = { publicado:'✓ Publicado', hoje:'⚡ Hoje', agendado:'⏳ Agendado', futuro:'📅 Futuro' };
  const ICON  = { reel:'🎬', carrossel:'🖼️', post:'📄' };

  const esc = s => String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const cards = items
    .sort((a,b) => b.date.localeCompare(a.date))
    .map(item => {
      const isToday = item.date === today;
      const dayNum  = new Date(item.date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit'});
      const dayName = new Date(item.date+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'short'});

      let preview = '<div class="no-prev">—</div>';
      if (item.previewPath) {
        preview = `<img src="${item.previewPath}" loading="lazy" onerror="this.style.display='none'">`;
      } else if (item.reelPath) {
        preview = `<video src="${item.reelPath}" muted playsinline preload="metadata" onmouseover="this.play()" onmouseout="this.pause();this.currentTime=0"></video>`;
      }

      const dots = item.allSlides.length > 1
        ? '<div class="dots">' + item.allSlides.map((s,i) =>
            `<span class="dot${i===0?' on':''}" onclick="event.stopPropagation();swapSlide(this,'${s}')"></span>`
          ).join('') + '</div>'
        : '';

      const slidesJson = JSON.stringify(item.allSlides);
      const captionLine = esc(item.caption.split('\n')[0] || item.id);
      const captionFull = esc(item.caption);

      return `<div class="card" data-status="${item.status}" data-tipo="${item.tipo}">
  <div class="thumb" onclick="openModal('${esc(item.id)}','${item.reelPath||''}',${slidesJson},'${item.previewPath||''}','${captionFull}','${esc(item.prompt||'')}')">
    ${preview}
    <span class="lbl-date${isToday?' now':''}">${dayName} ${dayNum}</span>
    <span class="lbl-tipo">${ICON[item.tipo]}</span>
    <span class="lbl-dot" style="background:${COLOR[item.status]}" title="${LABEL[item.status]}"></span>
    ${dots}
  </div>
  <p class="cap" title="${captionFull}">${captionLine}</p>
</div>`;
    }).join('\n');

  const css = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f0f0f;color:#eee;min-height:100vh}

/* header */
.hdr{background:#181818;border-bottom:1px solid #252525;padding:12px 20px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:99}
.hdr h1{font-size:15px;font-weight:600;color:#fff}.hdr h1 b{color:#C8572A}
.stats{display:flex;gap:16px;margin-left:auto}
.stat{display:flex;align-items:center;gap:5px;font-size:11px;color:#888}
.stat i{width:6px;height:6px;border-radius:50%;display:inline-block}
.stat strong{color:#fff}

/* filtros */
.bar{padding:8px 20px;display:flex;gap:5px;border-bottom:1px solid #222;background:#131313;flex-wrap:wrap}
.btn{padding:3px 11px;border-radius:16px;border:1px solid #2e2e2e;background:transparent;color:#777;font-size:11px;cursor:pointer;transition:.12s}
.btn:hover,.btn.on{background:#C8572A;border-color:#C8572A;color:#fff}

/* grid */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:5px;padding:10px}

/* card */
.card{background:#181818;border-radius:7px;overflow:hidden;border:1px solid #232323;cursor:pointer;transition:.12s}
.card:hover{transform:scale(1.025);border-color:#555;z-index:2;position:relative}
.card[data-status=hoje]{border-color:#f59e0b55}
.card[data-status=futuro]{opacity:.65}

/* thumb 4:5 */
.thumb{position:relative;width:100%;aspect-ratio:4/5;background:#111;overflow:hidden}
.thumb img,.thumb video{width:100%;height:100%;object-fit:cover;display:block}
.no-prev{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:22px;color:#2a2a2a}

/* overlays */
.lbl-date{position:absolute;top:5px;left:5px;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);padding:2px 6px;border-radius:4px;font-size:9px;font-weight:600;color:#ccc;text-transform:capitalize}
.lbl-date.now{background:#f59e0b;color:#000}
.lbl-tipo{position:absolute;bottom:5px;left:5px;font-size:13px;filter:drop-shadow(0 1px 3px #000)}
.lbl-dot{position:absolute;top:5px;right:5px;width:7px;height:7px;border-radius:50%;box-shadow:0 0 0 1px rgba(0,0,0,.5)}
.dots{position:absolute;bottom:5px;right:5px;display:flex;gap:3px}
.dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.3);cursor:pointer;display:block}
.dot.on{background:#fff}

/* caption mini */
.cap{padding:4px 7px;font-size:10px;color:#777;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3}

/* modal */
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:999;align-items:center;justify-content:center;backdrop-filter:blur(6px)}
.overlay.open{display:flex}
.modal{background:#1a1a1a;border-radius:14px;border:1px solid #2e2e2e;max-width:90vw;max-height:90vh;display:flex;overflow:hidden;position:relative}
.m-preview{width:320px;min-width:320px;background:#111;border-radius:14px 0 0 14px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.m-preview img,.m-preview video{width:100%;max-height:85vh;object-fit:contain}
.m-info{padding:22px;width:320px;display:flex;flex-direction:column;gap:12px;overflow-y:auto}
.m-title{font-size:14px;font-weight:700;color:#fff}
.m-section label{display:block;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#555;margin-bottom:4px}
.m-section p{font-size:11px;color:#bbb;line-height:1.6;white-space:pre-wrap}
.m-close{position:absolute;top:10px;right:10px;background:#2e2e2e;border:none;color:#aaa;width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center}
.m-nav{display:flex;gap:6px;margin-top:auto}
.m-nav button{flex:1;padding:6px;border-radius:5px;border:1px solid #333;background:transparent;color:#888;cursor:pointer;font-size:11px}
.m-nav button:hover{background:#333;color:#fff}

.footer{text-align:center;padding:16px;font-size:10px;color:#333}`;

  const js = `
function filter(s,btn){
  document.querySelectorAll('.btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  document.querySelectorAll('.card').forEach(c=>{
    c.style.display=(s==='all'||c.dataset.status===s)?'':'none';
  });
}
function filterTipo(t,btn){
  document.querySelectorAll('.btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  document.querySelectorAll('.card').forEach(c=>{
    c.style.display=c.dataset.tipo===t?'':'none';
  });
}
function swapSlide(dot,src){
  const thumb=dot.closest('.thumb');
  const img=thumb.querySelector('img');
  if(img) img.src=src;
  thumb.querySelectorAll('.dot').forEach(d=>d.classList.remove('on'));
  dot.classList.add('on');
}
function openModal(id,reel,slides,cover,caption,prompt){
  const mp=document.getElementById('mp');
  const mi=document.getElementById('mi');
  if(reel){
    mp.innerHTML='<video src="'+reel+'" controls autoplay muted loop style="width:100%;max-height:85vh;object-fit:contain"></video>';
  } else if(cover){
    mp.innerHTML='<img src="'+cover+'" style="width:100%;max-height:85vh;object-fit:contain">';
  } else if(slides&&slides.length){
    window._sl=slides; window._si=0;
    const nav=slides.length>1?'<div class="m-nav"><button onclick="navSlide(-1)">◀</button><span id="sc" style="display:flex;align-items:center;font-size:11px;color:#666">1/'+slides.length+'</span><button onclick="navSlide(1)">▶</button></div>':'';
    mp.innerHTML='<div style="width:100%"><img id="msi" src="'+slides[0]+'" style="width:100%;max-height:70vh;object-fit:contain">'+nav+'</div>';
  } else {
    mp.innerHTML='<div style="color:#444;padding:40px">Sem preview</div>';
  }
  mi.innerHTML='<div class="m-title">'+id+'</div>'
    +(prompt?'<div class="m-section"><label>Prompt Veo</label><p>'+prompt+'</p></div>':'')
    +'<div class="m-section"><label>Caption</label><p>'+caption+'</p></div>';
  document.getElementById('overlay').classList.add('open');
}
function navSlide(d){
  const sl=window._sl||[];
  window._si=(window._si+d+sl.length)%sl.length;
  document.getElementById('msi').src=sl[window._si];
  document.getElementById('sc').textContent=(window._si+1)+'/'+sl.length;
}
function closeModal(){
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('mp').innerHTML='';
}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape') closeModal();
  if(e.key==='ArrowLeft') navSlide(-1);
  if(e.key==='ArrowRight') navSlide(1);
});
document.getElementById('overlay').addEventListener('click',e=>{
  if(e.target===document.getElementById('overlay')) closeModal();
});`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dashboard — Luiza na Cozinha</title>
<style>${css}</style>
</head>
<body>

<div class="hdr">
  <h1>🍳 <b>Luiza na Cozinha</b> — Dashboard</h1>
  <div class="stats">
    <div class="stat"><i style="background:#22c55e"></i>Publicados <strong>${publicados}</strong></div>
    <div class="stat"><i style="background:#3b82f6"></i>Agendados <strong>${pendentes}</strong></div>
    <div class="stat"><i style="background:#8b5cf6"></i>Futuros <strong>${futuros}</strong></div>
    <div class="stat">Total <strong>${total}</strong></div>
  </div>
</div>

<div class="bar">
  <button class="btn on"  onclick="filter('all',this)">Todos (${total})</button>
  <button class="btn" onclick="filter('publicado',this)">✓ Publicados (${publicados})</button>
  <button class="btn" onclick="filter('agendado',this)">⏳ Agendados (${pendentes})</button>
  <button class="btn" onclick="filter('hoje',this)">⚡ Hoje</button>
  <button class="btn" onclick="filter('futuro',this)">📅 Futuros (${futuros})</button>
  <button class="btn" onclick="filterTipo('reel',this)">🎬 Reels</button>
  <button class="btn" onclick="filterTipo('carrossel',this)">🖼️ Carrosseis</button>
  <button class="btn" onclick="filterTipo('post',this)">📄 Posts</button>
</div>

<div class="grid">
${cards}
</div>

<div class="footer">Gerado em ${new Date().toLocaleString('pt-BR')} · ${total} itens</div>

<div class="overlay" id="overlay">
  <div class="modal">
    <button class="m-close" onclick="closeModal()">✕</button>
    <div class="m-preview" id="mp"></div>
    <div class="m-info" id="mi"></div>
  </div>
</div>

<script>${js}</script>
</body>
</html>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const items = collectItems();
const html  = generateHTML(items);
fs.writeFileSync(OUT_FILE, html, 'utf8');

console.log(`✅ Dashboard gerado: dashboard.html`);
console.log(`   ${items.length} itens  |  Publicados: ${items.filter(i=>i.status==='publicado').length}  |  Futuros: ${items.filter(i=>i.status==='futuro').length}`);

try {
  execSync(process.platform === 'win32' ? `start "" "${OUT_FILE}"` : `open "${OUT_FILE}"`);
  console.log(`🌐 Abrindo no browser...`);
} catch {
  console.log(`👉 Abra: ${OUT_FILE}`);
}
