#!/usr/bin/env node
/**
 * build-dashboard.js — gera dashboard.html com todos os posts
 * Uso: node scripts/build-dashboard.js
 * Roda automaticamente via GitHub Actions após publicação/geração.
 */

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..');
const READY_DIR = path.join(ROOT, 'ready-to-post');
const OUT_PATH  = path.join(ROOT, 'dashboard.html');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^﻿/, ''));
}

// ── Coleta posts ──────────────────────────────────────────────────────────────

function collectPosts() {
  const posts = [];

  if (!fs.existsSync(READY_DIR)) return posts;

  for (const monthDir of fs.readdirSync(READY_DIR).sort()) {
    const monthPath = path.join(READY_DIR, monthDir);
    if (!fs.statSync(monthPath).isDirectory()) continue;

    for (const dateDir of fs.readdirSync(monthPath).sort()) {
      const datePath = path.join(monthPath, dateDir);
      if (!fs.statSync(datePath).isDirectory()) continue;

      for (const postDir of fs.readdirSync(datePath).sort()) {
        const postPath = path.join(datePath, postDir);
        if (!fs.statSync(postPath).isDirectory()) continue;

        const reelJson      = path.join(postPath, 'reel.json');
        const storyJson     = path.join(postPath, 'story.json');
        const publishedJson = path.join(postPath, 'published.json');
        const captionTxt    = path.join(postPath, 'caption.txt');
        const coverPng      = path.join(postPath, 'cover.png');
        const slidePng      = path.join(postPath, 'slide-01.png');
        const skipMarker    = path.join(postPath, '.skip');

        let reel      = fs.existsSync(reelJson)      ? readJson(reelJson)      : {};
        let story     = fs.existsSync(storyJson)     ? readJson(storyJson)     : {};
        let published = fs.existsSync(publishedJson) ? readJson(publishedJson) : null;
        let caption   = fs.existsSync(captionTxt)     ? fs.readFileSync(captionTxt, 'utf8').trim()
                          : (reel.caption || story.headline || '');
        let skip      = fs.existsSync(skipMarker);

        // Detecta tipo pelo conteúdo da pasta
        const files = fs.readdirSync(postPath);
        const hasSlides = files.some(f => f.startsWith('slide-'));
        const isStory = fs.existsSync(storyJson) || postDir.startsWith('story-');
        const type = isStory ? 'story' : hasSlides ? 'carousel' : (fs.existsSync(reelJson) ? 'reel' : 'post');

        // Imagem de capa — ordem de prioridade
        let coverUrl = reel.cloudinaryCoverUrl || reel.coverUrl || story.cloudinaryUrl || null;
        const hasCoverLocal = fs.existsSync(coverPng) || fs.existsSync(slidePng);

        // Data efetiva — prefere reel.json/story.json, fallback para nome da pasta
        const date = reel.date || story.date || dateDir;

        const today = new Date().toISOString().slice(0, 10);
        let status;
        if (skip)                       status = 'skip';
        else if (published)             status = 'published';
        else if (date < today)          status = 'overdue';
        else if (date === today)        status = 'today';
        else                            status = 'scheduled';

        posts.push({
          id:          postDir,
          date,
          type,
          status,
          coverUrl,
          hasCoverLocal,
          caption:     caption.slice(0, 200),
          mediaId:     published?.instagram_media_id || null,
          publishedAt: published?.published_at || null,
          hasVideo:    !!(reel.cloudinaryUrl),
        });
      }
    }
  }

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

// ── Gera HTML ──────────────────────────────────────────────────────────────────

function buildHtml(posts) {
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const counts = {
    published:  posts.filter(p => p.status === 'published').length,
    scheduled:  posts.filter(p => p.status === 'scheduled').length,
    today:      posts.filter(p => p.status === 'today').length,
    overdue:    posts.filter(p => p.status === 'overdue').length,
    total:      posts.length,
  };

  // Agrupa por mês
  const byMonth = {};
  for (const p of posts) {
    const m = p.date.slice(0, 7);
    if (!byMonth[m]) byMonth[m] = [];
    byMonth[m].push(p);
  }

  const monthNames = {
    '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março',
    '04': 'Abril',   '05': 'Maio',      '06': 'Junho',
    '07': 'Julho',   '08': 'Agosto',    '09': 'Setembro',
    '10': 'Outubro', '11': 'Novembro',  '12': 'Dezembro',
  };
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  function statusBadge(p) {
    const map = {
      published: ['✅', '#2d6a4f', 'Publicado'],
      scheduled: ['📅', '#1d4e89', 'Agendado'],
      today:     ['⚡', '#7b2d00', 'Hoje'],
      overdue:   ['⚠️', '#9b1c1c', 'Atrasado'],
      skip:      ['⏭️', '#555',    'Ignorado'],
    };
    const [icon, color, label] = map[p.status] || ['?', '#666', p.status];
    return `<span class="badge" style="background:${color}">${icon} ${label}</span>`;
  }

  function typeIcon(t) {
    return t === 'reel' ? '🎬' : t === 'story' ? '📱' : t === 'carousel' ? '🖼️' : '📄';
  }

  function coverImg(p) {
    if (p.coverUrl) {
      return `<img src="${p.coverUrl}" alt="capa" loading="lazy">`;
    }
    return `<div class="no-cover">${typeIcon(p.type)}<br><small>${p.hasCoverLocal ? 'cover local' : 'sem capa'}</small></div>`;
  }

  function renderCards(monthPosts) {
    return monthPosts.map(p => {
      const d = new Date(p.date + 'T12:00:00');
      const dow = weekDays[d.getDay()];
      const day = d.getDate();
      return `
        <div class="card status-${p.status}" title="${p.id}">
          <div class="card-cover">${coverImg(p)}</div>
          <div class="card-info">
            <div class="card-date">${dow} ${day} ${typeIcon(p.type)}</div>
            ${statusBadge(p)}
            ${p.hasVideo ? '<span class="has-video">▶ vídeo</span>' : ''}
            <p class="card-caption">${p.caption.replace(/</g,'&lt;').replace(/\n/g,' ')}</p>
          </div>
        </div>`;
    }).join('');
  }

  const monthSections = Object.entries(byMonth)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, mPosts]) => {
      const [year, mm] = month.split('-');
      return `
      <section class="month">
        <h2>${monthNames[mm]} ${year} <small>(${mPosts.length} posts)</small></h2>
        <div class="grid">${renderCards(mPosts)}</div>
      </section>`;
    }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Luiza na Cozinha — Dashboard</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #0d0d0d; color: #e8e0d5; min-height: 100vh; }

  header { padding: 20px 24px 16px; border-bottom: 1px solid #222; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  header h1 { font-size: 18px; font-weight: 700; color: #C8572A; }
  header .meta { font-size: 12px; color: #777; margin-left: auto; }

  .stats { display: flex; gap: 12px; flex-wrap: wrap; padding: 16px 24px; border-bottom: 1px solid #222; }
  .stat { padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: opacity .15s; }
  .stat:hover { opacity: .8; }
  .stat-all       { background: #333; color: #e8e0d5; }
  .stat-published { background: #1a3d2b; color: #6fcf97; }
  .stat-scheduled { background: #1a2a4a; color: #7eb8f7; }
  .stat-today     { background: #3d1a00; color: #f7a26a; }
  .stat-overdue   { background: #3d0a0a; color: #f76a6a; }

  .month { padding: 24px; border-bottom: 1px solid #1a1a1a; }
  .month h2 { font-size: 15px; font-weight: 700; color: #C8572A; margin-bottom: 16px; text-transform: uppercase; letter-spacing: .05em; }
  .month h2 small { font-size: 12px; color: #666; font-weight: 400; text-transform: none; }

  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }

  .card { background: #1a1512; border-radius: 8px; overflow: hidden; border: 1px solid #2a2520; transition: transform .15s; }
  .card:hover { transform: translateY(-2px); border-color: #444; }
  .card.status-published { border-color: #1d4d35; }
  .card.status-overdue   { border-color: #4d1d1d; }
  .card.status-today     { border-color: #C8572A; box-shadow: 0 0 0 1px #C8572A; }
  .card.status-skip      { opacity: .45; }

  .card-cover { aspect-ratio: 9/16; background: #111; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .card-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .no-cover { text-align: center; font-size: 28px; color: #444; padding: 20px; line-height: 1.6; }
  .no-cover small { font-size: 10px; color: #555; display: block; margin-top: 4px; }

  .card-info { padding: 10px 10px 12px; }
  .card-date { font-size: 13px; font-weight: 700; color: #d4c5b0; margin-bottom: 6px; }
  .badge { display: inline-block; padding: 2px 7px; border-radius: 10px; font-size: 10px; font-weight: 600; color: #fff; margin-bottom: 4px; }
  .has-video { display: inline-block; margin-left: 4px; font-size: 10px; color: #C8572A; font-weight: 600; }
  .card-caption { font-size: 10px; color: #777; line-height: 1.4; margin-top: 6px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

  .hidden { display: none !important; }
</style>
</head>
<body>

<header>
  <h1>🍳 Luiza na Cozinha</h1>
  <div class="meta">Atualizado ${now}</div>
</header>

<div class="stats">
  <button class="stat stat-all"       onclick="filter('all')">Todos (${counts.total})</button>
  <button class="stat stat-published" onclick="filter('published')">✅ Publicados (${counts.published})</button>
  <button class="stat stat-scheduled" onclick="filter('scheduled')">📅 Agendados (${counts.scheduled})</button>
  ${counts.today   ? `<button class="stat stat-today"   onclick="filter('today')">⚡ Hoje (${counts.today})</button>` : ''}
  ${counts.overdue ? `<button class="stat stat-overdue" onclick="filter('overdue')">⚠️ Atrasados (${counts.overdue})</button>` : ''}
</div>

${monthSections}

<script>
function filter(status) {
  document.querySelectorAll('.card').forEach(c => {
    c.classList.toggle('hidden', status !== 'all' && !c.classList.contains('status-' + status));
  });
  document.querySelectorAll('.month').forEach(m => {
    const visible = [...m.querySelectorAll('.card')].some(c => !c.classList.contains('hidden'));
    m.classList.toggle('hidden', !visible);
  });
}
</script>
</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const posts = collectPosts();
const html  = buildHtml(posts);
fs.writeFileSync(OUT_PATH, html, 'utf8');
console.log(`✅ dashboard.html gerado — ${posts.length} posts`);
