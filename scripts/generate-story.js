#!/usr/bin/env node
/**
 * generate-story.js — gera Stories via Imagen 4 (fundo) + overlay HTML (texto)
 *
 * Fluxo:
 *   1. Imagen 4 gera a foto de fundo (9:16, sem texto — Imagen não escreve texto legível)
 *   2. templates/story-overlay.html recebe o fundo como background embutido em base64
 *      e sobrepõe kicker/headline/subtexto/CTA (Puppeteer renderiza e tira screenshot)
 *   3. Upload da imagem final para Cloudinary
 *
 * Itens do tipo "repost" NÃO passam por este script — são resolvidos em
 * tempo de publicação (publish.js reaproveita a mídia do feed do dia).
 *
 * Uso:
 *   node scripts/generate-story.js --all         (processa data/story-queue.json)
 *   node scripts/generate-story.js --folder PASTA
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const log = require('./lib/logger');

require('dotenv').config();

const ROOT      = path.resolve(__dirname, '..');
const READY_DIR = path.join(ROOT, 'ready-to-post');
const TEMPLATE  = path.join(ROOT, 'templates', 'story-overlay.html');
const BASE_URL  = 'https://generativelanguage.googleapis.com/v1beta';
// Migrado em ago/2026: os modelos Imagen saíram da API (404) — a família atual é
// gemini-*-image via generateContent. Flash = papel de fundo barato das stories.
const MODEL     = 'gemini-3.1-flash-image';

const { GOOGLE_API_KEY } = process.env;

function checkEnv() {
  if (!GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY não encontrada em .env');
    process.exit(1);
  }
}

// ── Imagen 4 — gera fundo fotográfico 9:16 ────────────────────────────────────

async function generateBackground(prompt) {
  const url = `${BASE_URL}/models/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`;
  const payload = {
    // Sem pessoas nos fundos de story (regra antiga do personGeneration) — mantida
    // via prompt, já que o generateContent não tem o parâmetro.
    contents: [{ parts: [{ text: `${prompt} No people, no faces, no hands.` }] }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio: '9:16' },
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const rawBody = await response.text();
  if (!response.ok) {
    let err;
    try { err = JSON.parse(rawBody); } catch { err = rawBody; }
    throw new Error(`Image API error (${response.status}): ${JSON.stringify(err?.error?.message || err).substring(0, 300)}`);
  }

  let data;
  try { data = JSON.parse(rawBody); } catch {
    throw new Error(`Resposta inválida: ${rawBody.substring(0, 200)}`);
  }

  const b64 = data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
  if (!b64) throw new Error(`Sem imagem na resposta: ${JSON.stringify(data).substring(0, 300)}`);

  return b64; // já em base64 — usado direto no template
}

// ── Renderiza overlay HTML e tira screenshot ──────────────────────────────────

function renderOverlay(vars) {
  let html = fs.readFileSync(TEMPLATE, 'utf8');
  for (const [key, value] of Object.entries(vars)) {
    html = html.replaceAll(`{{${key}}}`, String(value ?? ''));
  }
  html = html.replace(/\{\{[^}]+\}\}/g, '');
  return html;
}

async function screenshotStory(html, outPath, browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluateHandle('document.fonts.ready');
  await page.screenshot({ path: outPath, type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  await page.close();
}

// Cores de acento por pilar — mantém dentro da paleta do brand.json
const ACCENT_BY_PILLAR = {
  vitrine: '#E8784F',
  checkin: '#8FAF91',
  gancho:  '#C49A3C',
};

// ── Processa um item da fila ──────────────────────────────────────────────────

async function processItem(config, browser) {
  const { id, date, pillar, imagePrompt, kicker, headline, subtext, ctaLabel, headlineSize = 92 } = config;

  const month  = date.slice(0, 7);
  const outDir = path.join(READY_DIR, month, date, id);
  fs.mkdirSync(outDir, { recursive: true });

  if (fs.existsSync(path.join(outDir, 'published.json'))) {
    console.log(`  ⏭  ${id} — já publicado, pulando`);
    return;
  }
  if (fs.existsSync(path.join(outDir, 'slide-01.png'))) {
    console.log(`  ⏭  ${id} — imagem já existe, pulando`);
    return;
  }
  const storyJsonPath = path.join(outDir, 'story.json');
  if (fs.existsSync(storyJsonPath)) {
    const existing = JSON.parse(fs.readFileSync(storyJsonPath, 'utf8'));
    if (existing.cloudinaryUrl) {
      console.log(`  ⏭  ${id} — já no Cloudinary, pulando geração`);
      return;
    }
  }

  console.log(`\n📱 Gerando story ${id} (${date}) — pilar: ${pillar}`);
  console.log(`   Fundo: "${imagePrompt.substring(0, 80)}..."`);

  try {
    // 1. Fundo via Imagen
    const bgBase64 = await generateBackground(imagePrompt);
    console.log(`  ✓ Fundo gerado`);

    // 2. Overlay HTML + screenshot
    const html = renderOverlay({
      BG_IMAGE_BASE64: bgBase64,
      ACCENT_COLOR: ACCENT_BY_PILLAR[pillar] || '#C49A3C',
      KICKER: kicker || '',
      HEADLINE: headline,
      HEADLINE_SIZE: headlineSize,
      SUBTEXT: subtext || '',
      CTA_LABEL: ctaLabel || 'Arrasta pra cima',
    });

    const imgPath = path.join(outDir, 'slide-01.png');
    await screenshotStory(html, imgPath, browser);
    console.log(`  ✓ slide-01.png salvo`);

    // 3. Upload Cloudinary
    let cloudinaryMeta = {};
    try {
      const storage = require('./lib/cloudinary-storage');
      const result = await storage.uploadImage(id, imgPath);
      if (result) cloudinaryMeta = result;
      if (cloudinaryMeta.cloudinaryUrl) console.log(`  ✓ Cloudinary: story salva`);
    } catch (cloudErr) {
      console.warn(`  ⚠️  Cloudinary upload falhou: ${cloudErr.message} (arquivo local mantido)`);
    }

    // story.json — metadados (sem caption.txt: Stories não usam caption na API)
    fs.writeFileSync(
      path.join(outDir, 'story.json'),
      JSON.stringify({ ...config, generatedAt: new Date().toISOString(), model: MODEL, ...cloudinaryMeta }, null, 2),
      'utf8'
    );

    console.log(`  ✅ ${id} gerado com sucesso!`);
    log.ok('story', `Story gerada: ${id}`, { id, date, pillar });

  } catch (err) {
    console.error(`\n  ✗ Erro ao gerar ${id}: ${err.message}`);
    const isQuota = /429|quota|RESOURCE_EXHAUSTED/i.test(err.message);
    log.error('story', `Falha ao gerar ${id}: ${err.message}`, { id, erro: err.message, ...(isQuota ? { code: 429 } : {}) });
    throw err;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  checkEnv();

  const args      = process.argv.slice(2);
  const allFlag   = args.includes('--all');
  const folderIdx = args.indexOf('--folder');
  const limitIdx  = args.indexOf('--limit');
  const limit     = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;

  let items = [];

  if (allFlag) {
    const queuePath = path.join(ROOT, 'data', 'story-queue.json');
    if (!fs.existsSync(queuePath)) {
      console.error('❌ data/story-queue.json não encontrado');
      process.exit(1);
    }
    const allItems = JSON.parse(fs.readFileSync(queuePath, 'utf8'))
      .filter(it => it.type !== 'repost'); // repost não passa por geração

    items = allItems.filter(it => {
      const dir = path.join(READY_DIR, it.date.slice(0, 7), it.date, it.id);
      if (fs.existsSync(path.join(dir, 'published.json'))) return false;
      if (fs.existsSync(path.join(dir, 'slide-01.png'))) return false;
      return true;
    });
    if (isFinite(limit)) items = items.slice(0, limit);
    console.log(`\n📋 ${allItems.length} story(s) geráveis na fila — processando ${items.length}${isFinite(limit) ? ` (--limit ${limit})` : ''}`);
    items.forEach(r => console.log(`   • ${r.id} (${r.date}) — ${r.pillar}`));

  } else if (folderIdx !== -1 && args[folderIdx + 1]) {
    const folderPath = path.resolve(args[folderIdx + 1]);
    const storyJsonPath = path.join(folderPath, 'story.json');
    if (!fs.existsSync(storyJsonPath)) {
      console.error(`❌ story.json não encontrado em ${folderPath}`);
      process.exit(1);
    }
    items = [JSON.parse(fs.readFileSync(storyJsonPath, 'utf8'))];

  } else {
    console.log('\nUso:');
    console.log('  node scripts/generate-story.js --all [--limit N]');
    console.log('  node scripts/generate-story.js --folder <caminho>');
    process.exit(0);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  let ok = 0;
  try {
    for (const item of items) {
      try {
        await processItem(item, browser);
        ok++;
      } catch {
        console.error(`❌ Falhou: ${item.id}`);
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\n──────────────────────────────────────`);
  console.log(`✅ ${ok}/${items.length} story(s) gerada(s)`);
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
