#!/usr/bin/env node
/**
 * generate-image.js — gera posts estáticos (imagem única ou carrossel)
 *
 * Uso:
 *   node scripts/generate-image.js --all        (processa data/image-queue.json)
 *   node scripts/generate-image.js --folder <caminho>
 *
 * Output: ready-to-post/[mes]/[data]/[id]/slide-0N.png + caption.txt
 *
 * Modelo: gemini-3.1-flash-image (o Imagen saiu da API em ago/2026).
 * Resposta síncrona — sem polling, muito mais rápido que vídeo.
 *
 * Texto: o item pode trazer `overlays[]` (um por slide) — aí o fundo gerado
 * recebe a tipografia da marca por cima via templates/post-overlay.html.
 * Sem `overlays`, o slide sai como imagem pura.
 */

const fs   = require('fs');
const path = require('path');
const log  = require('./lib/logger');

require('dotenv').config();

const ROOT      = path.resolve(__dirname, '..');
const READY_DIR = path.join(ROOT, 'ready-to-post');
const BASE_URL  = 'https://generativelanguage.googleapis.com/v1beta';
const TEMPLATE  = path.join(ROOT, 'templates', 'post-overlay.html');
const MODEL     = 'gemini-3.1-flash-image';  // Imagen saiu da API (404) em ago/2026

const { GOOGLE_API_KEY } = process.env;

function checkEnv() {
  if (!GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY não encontrada em .env');
    process.exit(1);
  }
}

// ── Gera imagem via Gemini Image ─────────────────────────────────────────────

// aspectRatio suportado: 1:1 | 3:4 | 4:3 | 4:5 | 9:16 | 16:9
// Feed Instagram portrait: 4:5 (ocupa a maior área possível no scroll)
async function generateImage(prompt, aspectRatio = '4:5') {
  const url = `${BASE_URL}/models/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio },
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
  if (!b64) {
    throw new Error(`Sem imagem na resposta: ${JSON.stringify(data).substring(0, 300)}`);
  }

  return Buffer.from(b64, 'base64');
}

// ── Overlay de texto (Puppeteer) ─────────────────────────────────────────────
//
// O gerador de imagem NÃO escreve texto legível — letra de IA sai torta. Então o
// fundo é gerado e a tipografia da marca entra por cima, igual às stories.
// Só roda quando o item traz `overlays`; post sem overlay continua imagem pura.

function montarNumeros(numeros) {
  if (!numeros || !numeros.length) return '';
  const itens = numeros
    .map(n => `<div class="numero"><div class="valor">${n.valor}</div><div class="rotulo">${n.rotulo}</div></div>`)
    .join('');
  return `<div class="numeros">${itens}</div>`;
}

async function comporSlide(bgBuffer, vars, browser) {
  const valores = {
    BG_BASE64: bgBuffer.toString('base64'),
    ACCENT: vars.accent || '#E8784F',
    HEADLINE_SIZE: vars.headlineSize || 92,
    PASSO: vars.passo || '',
    KICKER: vars.kicker || '',
    HEADLINE: vars.headline || '',
    SUBTEXT: vars.subtext || '',
    NUMEROS: montarNumeros(vars.numeros),
    RODAPE: vars.rodape || '',
    SETA: vars.seta || '',
  };

  let html = fs.readFileSync(TEMPLATE, 'utf8');
  for (const [chave, valor] of Object.entries(valores)) {
    html = html.replaceAll(`{{${chave}}}`, String(valor ?? ''));
  }
  html = html.replace(/\{\{[^}]+\}\}/g, '');

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluateHandle('document.fonts.ready');
  const buf = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  await page.close();
  return buf;
}

// ── Processa um item ─────────────────────────────────────────────────────────

// Hashtags podem vir como lista (filas do Ciclo 01) ou como texto (filas antigas).
// Lista interpolada direto virava "#a,#b" — o Instagram quer separado por espaço.
function juntarHashtags(hashtags) {
  if (!hashtags) return '';
  return Array.isArray(hashtags) ? hashtags.join(' ') : String(hashtags);
}

async function processItem(config, browser = null) {
  const { id, date, prompt, caption, hashtags, aspectRatio = '4:5', slides = [], overlays = [] } = config;

  const month  = date.slice(0, 7);
  const outDir = path.join(READY_DIR, month, date, id);
  fs.mkdirSync(outDir, { recursive: true });

  if (fs.existsSync(path.join(outDir, 'published.json'))) {
    console.log(`  ⏭  ${id} — já publicado, pulando`);
    return;
  }

  // Se já tem slide-01.png localmente, pula
  if (fs.existsSync(path.join(outDir, 'slide-01.png'))) {
    console.log(`  ⏭  ${id} — imagem já existe, pulando`);
    return;
  }

  // Verifica se já está no Cloudinary (modo GitHub Actions)
  const postJsonPath = path.join(outDir, 'post.json');
  if (fs.existsSync(postJsonPath)) {
    const existing = JSON.parse(fs.readFileSync(postJsonPath, 'utf8'));
    if (existing.cloudinaryUrl) {
      console.log(`  ⏭  ${id} — já no Cloudinary, pulando geração`);
      return;
    }
  }

  console.log(`\n🖼️  Gerando ${id} (${date})...`);
  console.log(`   Prompt: "${prompt.substring(0, 80)}..."`);

  try {
    // Um prompt por slide: o principal + os do carrossel
    const prompts = [prompt, ...slides];
    const caminhos = [];

    for (let i = 0; i < prompts.length; i++) {
      console.log(`  ☁️  Slide ${i + 1}/${prompts.length}...`);
      let buf = await generateImage(prompts[i], aspectRatio);

      if (overlays[i]) {
        if (!browser) throw new Error('item tem overlays mas o navegador não foi aberto');
        // Guarda o fundo cru: trocar o TEXTO depois não exige regerar a imagem
        fs.writeFileSync(path.join(outDir, `bg-0${i + 1}.png`), buf);
        buf = await comporSlide(buf, overlays[i], browser);
        console.log(`     ✎ overlay aplicado (fundo cru em bg-0${i + 1}.png)`);
      }

      const sp = path.join(outDir, `slide-0${i + 1}.png`);
      fs.writeFileSync(sp, buf);
      caminhos.push(sp);
      console.log(`  ✓ slide-0${i + 1}.png salvo (${(buf.length / 1024).toFixed(0)} KB)`);
    }

    const imgPath = caminhos[0];
    const extraSlidePaths = caminhos.slice(1);

    // ── Upload permanente para Cloudinary ─────────────────────────────────────
    let cloudinaryMeta = {};
    try {
      const storage = require('./lib/cloudinary-storage');
      if (slides.length === 0) {
        // Post único
        const result = await storage.uploadImage(id, imgPath);
        if (result) cloudinaryMeta = result;
      } else {
        // Carrossel: sobe todos os slides
        const allPaths = [imgPath, ...extraSlidePaths];
        const results  = await storage.uploadSlides(id, allPaths);
        if (results) cloudinaryMeta = { cloudinarySlides: results, cloudinaryUrl: results[0].cloudinaryUrl };
      }
      if (cloudinaryMeta.cloudinaryUrl) console.log(`  ✓ Cloudinary: imagem(ns) salva(s)`);
    } catch (cloudErr) {
      console.warn(`  ⚠️  Cloudinary upload falhou: ${cloudErr.message} (arquivo local mantido)`);
    }

    // caption.txt
    const captionContent = `${caption}\n\n${juntarHashtags(hashtags)}`;
    fs.writeFileSync(path.join(outDir, 'caption.txt'), captionContent, 'utf8');

    // post.json (metadados + URLs Cloudinary se disponíveis)
    fs.writeFileSync(
      path.join(outDir, 'post.json'),
      JSON.stringify({
        ...config,
        generatedAt: new Date().toISOString(),
        model: MODEL,
        ...cloudinaryMeta,
      }, null, 2),
      'utf8'
    );

    console.log(`  ✅ ${id} gerado com sucesso!`);
    console.log(`     📁 ${outDir}`);
    log.ok('imagem', `Imagem gerada: ${id}`, { id, date });

  } catch (err) {
    console.error(`\n  ✗ Erro ao gerar ${id}: ${err.message}`);
    const isQuota = /429|quota|RESOURCE_EXHAUSTED/i.test(err.message);
    log.error('imagem', `Falha ao gerar ${id}: ${err.message}`, {
      id, erro: err.message, ...(isQuota ? { code: 429 } : {}),
    });
    throw err;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  checkEnv();

  const args      = process.argv.slice(2);
  const allFlag   = args.includes('--all');
  const folderIdx = args.indexOf('--folder');

  let items = [];

  if (allFlag) {
    const queuePath = path.join(ROOT, 'data', 'image-queue.json');
    if (!fs.existsSync(queuePath)) {
      console.error('❌ data/image-queue.json não encontrado');
      process.exit(1);
    }
    items = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
    console.log(`\n📋 ${items.length} imagem(ns) na fila`);
    items.forEach(r => console.log(`   • ${r.id} (${r.date})`));

  } else if (folderIdx !== -1 && args[folderIdx + 1]) {
    const folderPath  = path.resolve(args[folderIdx + 1]);
    const postJsonPath = path.join(folderPath, 'post.json');
    if (!fs.existsSync(postJsonPath)) {
      console.error(`❌ post.json não encontrado em ${folderPath}`);
      process.exit(1);
    }
    items = [JSON.parse(fs.readFileSync(postJsonPath, 'utf8'))];

  } else {
    console.log('\nUso:');
    console.log('  node scripts/generate-image.js --all');
    console.log('  node scripts/generate-image.js --folder ready-to-post/2026-06/2026-06-07/post-domingo-01');
    process.exit(0);
  }

  // Navegador só sobe se algum item precisar de overlay de texto
  const precisaOverlay = items.some(i => (i.overlays || []).length > 0);
  const browser = precisaOverlay
    ? await require('puppeteer').launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    : null;

  let ok = 0;
  try {
    for (const item of items) {
      try {
        await processItem(item, browser);
        ok++;
      } catch (err) {
        console.error(`❌ Falhou: ${item.id} — ${err.message}`);
      }
    }
  } finally {
    if (browser) await browser.close();
  }

  console.log(`\n──────────────────────────────────────`);
  console.log(`✅ ${ok}/${items.length} imagem(ns) gerada(s)`);
  if (ok > 0) console.log(`\n📌 Próximo: node scripts/publish.js --today`);
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
