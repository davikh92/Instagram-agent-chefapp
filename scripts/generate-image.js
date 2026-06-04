#!/usr/bin/env node
/**
 * generate-image.js — gera imagens estáticas via Google Imagen 3
 *
 * Uso:
 *   node scripts/generate-image.js --all        (processa data/image-queue.json)
 *   node scripts/generate-image.js --folder <caminho>
 *
 * Output: ready-to-post/[mes]/[data]/[id]/slide-01.png + caption.txt
 *
 * Modelo: imagen-3.0-generate-002
 * Resposta síncrona — sem polling, muito mais rápido que Veo.
 */

const fs   = require('fs');
const path = require('path');
const log  = require('./lib/logger');

require('dotenv').config();

const ROOT      = path.resolve(__dirname, '..');
const READY_DIR = path.join(ROOT, 'ready-to-post');
const BASE_URL  = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL     = 'imagen-4.0-generate-001';  // ultra: imagen-4.0-ultra-generate-001

const { GOOGLE_API_KEY } = process.env;

function checkEnv() {
  if (!GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY não encontrada em .env');
    process.exit(1);
  }
}

// ── Gera imagem via Imagen 3 ─────────────────────────────────────────────────

// Ratios suportados pelo Imagen 4: 1:1 | 3:4 | 4:3 | 9:16 | 16:9
// Para feed Instagram portrait: 3:4 (mais próximo de 4:5)
async function generateImage(prompt, aspectRatio = '3:4') {
  const url = `${BASE_URL}/models/${MODEL}:predict?key=${GOOGLE_API_KEY}`;

  const payload = {
    instances: [{ prompt }],
    parameters: {
      aspectRatio,
      sampleCount: 1,
      safetyFilterLevel: 'block_some',
      personGeneration: 'dont_allow',
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
    throw new Error(`Imagen API error (${response.status}): ${JSON.stringify(err?.error?.message || err).substring(0, 300)}`);
  }

  let data;
  try { data = JSON.parse(rawBody); } catch {
    throw new Error(`Resposta inválida: ${rawBody.substring(0, 200)}`);
  }

  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) {
    throw new Error(`Sem imagem na resposta: ${JSON.stringify(data).substring(0, 300)}`);
  }

  return Buffer.from(b64, 'base64');
}

// ── Processa um item ─────────────────────────────────────────────────────────

async function processItem(config) {
  const { id, date, prompt, caption, hashtags, aspectRatio = '4:5', slides = [] } = config;

  const month  = date.slice(0, 7);
  const outDir = path.join(READY_DIR, month, date, id);
  fs.mkdirSync(outDir, { recursive: true });

  if (fs.existsSync(path.join(outDir, 'published.json'))) {
    console.log(`  ⏭  ${id} — já publicado, pulando`);
    return;
  }

  // Se já tem slide-01.png, pula
  if (fs.existsSync(path.join(outDir, 'slide-01.png'))) {
    console.log(`  ⏭  ${id} — imagem já existe, pulando`);
    return;
  }

  console.log(`\n🖼️  Gerando ${id} (${date})...`);
  console.log(`   Prompt: "${prompt.substring(0, 80)}..."`);

  try {
    // Imagem principal (prompt da config)
    console.log(`  ☁️  Chamando Imagen 3...`);
    const imgBuffer = await generateImage(prompt, aspectRatio);
    const imgPath   = path.join(outDir, 'slide-01.png');
    fs.writeFileSync(imgPath, imgBuffer);
    const sizeKB = (imgBuffer.length / 1024).toFixed(0);
    console.log(`  ✓ slide-01.png salvo (${sizeKB} KB)`);

    // Slides extras (carrossel multi-imagem)
    for (let i = 0; i < slides.length; i++) {
      const slidePrompt = slides[i];
      console.log(`  ☁️  Slide ${i + 2}/${slides.length + 1}...`);
      const buf  = await generateImage(slidePrompt, aspectRatio);
      const sp   = path.join(outDir, `slide-0${i + 2}.png`);
      fs.writeFileSync(sp, buf);
      console.log(`  ✓ slide-0${i + 2}.png salvo (${(buf.length / 1024).toFixed(0)} KB)`);
    }

    // caption.txt
    const captionContent = `${caption}\n\n${hashtags}`;
    fs.writeFileSync(path.join(outDir, 'caption.txt'), captionContent, 'utf8');

    // post.json (metadados)
    fs.writeFileSync(
      path.join(outDir, 'post.json'),
      JSON.stringify({ ...config, generatedAt: new Date().toISOString(), model: MODEL }, null, 2),
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

  let ok = 0;
  for (const item of items) {
    try {
      await processItem(item);
      ok++;
    } catch {
      console.error(`❌ Falhou: ${item.id}`);
    }
  }

  console.log(`\n──────────────────────────────────────`);
  console.log(`✅ ${ok}/${items.length} imagem(ns) gerada(s)`);
  if (ok > 0) console.log(`\n📌 Próximo: node scripts/publish.js --today`);
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
