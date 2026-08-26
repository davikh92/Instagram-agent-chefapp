#!/usr/bin/env node
/**
 * generate-omni.js — gera reels via Gemini Omni Flash (Interactions API)
 *
 * Substitui o generate-veo.js. Diferenças em relação ao Veo 3.1 Lite:
 *   • Interactions API (POST /v1beta/interactions) — síncrona, sem long-running operation
 *   • aspect_ratio 9:16 é parâmetro explícito (no Veo era torcer pelo enquadramento)
 *   • Duração 4–10s controlada pelo PROMPT (não há parâmetro) — usamos 10s
 *   • Áudio: SEM FALAS. Só som ambiente. A voz PT-BR entra depois via ElevenLabs,
 *     porque o áudio do Omni só é avaliado em inglês e PT sai robótico.
 *
 * Uso:
 *   node scripts/generate-omni.js --all                    (data/veo-queue.json → ready-to-post/)
 *   node scripts/generate-omni.js --all --limit 5
 *   node scripts/generate-omni.js --queue data/omni-test-queue.json --out tests/omni
 *
 * Env (.env):
 *   GOOGLE_API_KEY=AIzaSy...
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const log = require('./lib/logger');

require('dotenv').config();

let ffmpegPath;
try {
  ffmpegPath = require('ffmpeg-static');
} catch {
  ffmpegPath = 'ffmpeg';
}

const ROOT = path.resolve(__dirname, '..');
const READY_DIR = path.join(ROOT, 'ready-to-post');

// ── Config ───────────────────────────────────────────────────────────────────

const { GOOGLE_API_KEY } = process.env;

const OMNI_MODEL = 'gemini-omni-flash-preview';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

// Omni Flash suporta 4–10s. 10s é o máximo atual e o que usamos.
const TARGET_DURATION_SEC = 10;

function checkEnv() {
  if (!GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY não encontrada em .env');
    console.error('\nAcesse https://aistudio.google.com/apikey e copie sua chave');
    process.exit(1);
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Geração ──────────────────────────────────────────────────────────────────

/**
 * Chama a Interactions API do Omni Flash.
 * refPath (opcional): PNG/JPG de referência — consistência de personagem/cenário
 * vem DELA, nunca de descrição no prompt (ver data/ciclo-01/BIBLIA-NOVELA.md §1).
 * A API exige a imagem ANTES do texto no array.
 * Retorna { type: 'base64'|'uri', value }.
 */
async function generateOmniVideo(prompt, refPath) {
  console.log(`  ☁️  Chamando Gemini Omni Flash${refPath ? ' (com imagem de referência)' : ''}...`);

  const url = `${BASE_URL}/interactions?key=${GOOGLE_API_KEY}`;

  let input = prompt;
  if (refPath) {
    const absolute = path.isAbsolute(refPath) ? refPath : path.join(ROOT, refPath);
    if (!fs.existsSync(absolute)) {
      throw new Error(`Imagem de referência não encontrada: ${refPath}`);
    }
    const mime = absolute.toLowerCase().endsWith('.jpg') || absolute.toLowerCase().endsWith('.jpeg')
      ? 'image/jpeg' : 'image/png';
    input = [
      { type: 'image', data: fs.readFileSync(absolute).toString('base64'), mime_type: mime },
      { type: 'text', text: prompt },
    ];
  }

  const payload = {
    model: OMNI_MODEL,
    input,
    response_format: {
      type: 'video',
      aspect_ratio: '9:16',
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    let errorBody;
    try { errorBody = JSON.parse(rawBody); } catch { errorBody = rawBody; }
    const msg = typeof errorBody === 'string'
      ? errorBody
      : errorBody?.error?.message || JSON.stringify(errorBody);
    throw new Error(`Omni API error (${response.status}): ${String(msg).substring(0, 300)}`);
  }

  let data;
  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error(`Resposta inválida (não é JSON): ${rawBody.substring(0, 200)}`);
  }

  if (data.status && data.status !== 'completed') {
    throw new Error(`Interaction status inesperado: ${data.status}`);
  }

  return extractVideoFromInteraction(data);
}

/**
 * Extrai o vídeo da resposta da Interactions API.
 * Dois formatos possíveis:
 *   • inline  → steps[].content[] com {type:'video', data:'<base64>'}
 *   • por URI → output_video.uri (usado quando o vídeo passa de 4MB)
 */
function extractVideoFromInteraction(data) {
  // Entrega por URI — comum em 10s/720p, que costuma passar de 4MB
  const uri = data?.output_video?.uri;
  if (uri) {
    return { type: 'uri', value: uri };
  }

  // Entrega inline em base64
  const steps = Array.isArray(data?.steps) ? data.steps : [];
  for (const step of steps) {
    const content = Array.isArray(step?.content) ? step.content : [];
    for (const item of content) {
      if (item?.type === 'video' && item?.data) {
        return { type: 'base64', value: item.data };
      }
    }
  }

  throw new Error(`Sem vídeo na resposta: ${JSON.stringify(data).substring(0, 400)}`);
}

/**
 * Aguarda o arquivo ficar ACTIVE antes de baixar (entrega por URI).
 * A Files API expõe state=PROCESSING até o vídeo estar pronto.
 */
async function waitForFileActive(uri, maxWaitSec = 180) {
  // A uri vem como .../v1beta/files/<id>:download?alt=media — o metadata está em .../files/<id>
  const match = uri.match(/\/files\/([^:/?]+)/);
  if (!match) return; // formato inesperado — tenta baixar direto

  const metaUrl = `${BASE_URL}/files/${match[1]}?key=${GOOGLE_API_KEY}`;
  const start = Date.now();

  while (Date.now() - start < maxWaitSec * 1000) {
    const res = await fetch(metaUrl);
    if (!res.ok) return; // sem metadata acessível — tenta baixar direto

    const meta = await res.json();
    if (meta.state === 'ACTIVE' || !meta.state) return;
    if (meta.state === 'FAILED') throw new Error('Processamento do vídeo falhou (state=FAILED)');

    const elapsed = Math.round((Date.now() - start) / 1000);
    process.stdout.write(`\r  ⏳ Processando vídeo (${elapsed}s)...   `);
    await sleep(5000);
  }

  throw new Error(`Timeout aguardando vídeo ficar ACTIVE (>${maxWaitSec}s)`);
}

async function saveVideo(videoResult, outputPath) {
  console.log(`  📥 Salvando vídeo...`);

  if (videoResult.type === 'base64') {
    const buffer = Buffer.from(videoResult.value, 'base64');
    fs.writeFileSync(outputPath, buffer);
    console.log(`  ✓ MP4 salvo (${(buffer.length / 1024).toFixed(0)} KB)`);
    return;
  }

  const uri = videoResult.value;
  await waitForFileActive(uri);

  let downloadUrl = uri;
  if (uri.includes('generativelanguage.googleapis.com') && !uri.includes('key=')) {
    downloadUrl = `${uri}${uri.includes('?') ? '&' : '?'}key=${GOOGLE_API_KEY}`;
  }

  const response = await fetch(downloadUrl, {
    headers: { 'x-goog-api-key': GOOGLE_API_KEY },
  });
  if (!response.ok) {
    throw new Error(`Download falhou (${response.status}): ${uri}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  console.log(`\r  ✓ MP4 salvo (${(buffer.length / 1024).toFixed(0)} KB)          `);
}

/**
 * Extrai um frame do MP4 como cover.png para o feed do Instagram.
 */
function extractCoverFrame(mp4Path, coverPath, timeSeconds = 2) {
  try {
    const cmd = `"${ffmpegPath}" -ss ${timeSeconds} -i "${mp4Path}" -frames:v 1 -q:v 2 -y "${coverPath}"`;
    execSync(cmd, { stdio: 'pipe' });
    console.log(`  🖼️  cover.png extraído no ${timeSeconds}s (${(fs.statSync(coverPath).size / 1024).toFixed(0)} KB)`);
    return true;
  } catch (err) {
    console.warn(`  ⚠️  Não foi possível extrair cover.png: ${err.message}`);
    return false;
  }
}

// ── Processamento de um reel ─────────────────────────────────────────────────

async function processReel(reelConfig, outRoot) {
  const { id, date, prompt, caption, hashtags } = reelConfig;

  // ready-to-post usa árvore por mês/data; pasta de teste é plana
  const outDir = outRoot === READY_DIR
    ? path.join(outRoot, date.slice(0, 7), date, id)
    : path.join(outRoot, id);

  fs.mkdirSync(outDir, { recursive: true });

  if (fs.existsSync(path.join(outDir, 'published.json'))) {
    console.log(`  ⏭  ${id} — já publicado, pulando`);
    return;
  }

  const mp4Path = path.join(outDir, 'reel.mp4');
  if (fs.existsSync(mp4Path)) {
    console.log(`  ⏭  ${id} — MP4 já existe, pulando geração`);
    return;
  }

  const reelJsonPath = path.join(outDir, 'reel.json');
  if (fs.existsSync(reelJsonPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(reelJsonPath, 'utf8').replace(/^﻿/, ''));
      if (existing.cloudinaryUrl) {
        console.log(`  ⏭  ${id} — já no Cloudinary, pulando geração`);
        return;
      }
    } catch { /* json inválido — regenera */ }
  }

  console.log(`\n🎬 Gerando ${id} (${reelConfig.archetype || 'sem arquétipo'})...`);
  console.log(`   Prompt: "${prompt.substring(0, 80)}..."`);

  if (reelConfig.ref) console.log(`   Ref: ${reelConfig.ref}`);

  const started = Date.now();
  const videoResult = await generateOmniVideo(prompt, reelConfig.ref);
  await saveVideo(videoResult, mp4Path);
  console.log(`  ⏱️  ${Math.round((Date.now() - started) / 1000)}s`);

  const coverPath = path.join(outDir, 'cover.png');
  // Capa no MONEY SHOT (~6,5s), não na abertura: com imagem de referência fixa
  // (novela), o segundo 2 é igual em todo episódio e o feed viraria 13 thumbnails
  // idênticas. coverAt por item permite afinar.
  extractCoverFrame(mp4Path, coverPath, reelConfig.coverAt ?? 6.5);

  let cloudinaryMeta = {};
  try {
    const storage = require('./lib/cloudinary-storage');
    const result = await storage.uploadReel(
      id,
      mp4Path,
      fs.existsSync(coverPath) ? coverPath : null
    );
    if (result) {
      cloudinaryMeta = result;
      console.log(`  ✓ Cloudinary: vídeo e cover salvos`);
    }
  } catch (cloudErr) {
    console.warn(`  ⚠️  Cloudinary upload falhou: ${cloudErr.message} (arquivo local mantido)`);
  }

  if (caption) {
    fs.writeFileSync(path.join(outDir, 'caption.txt'), `${caption}\n\n${hashtags || ''}`.trim(), 'utf8');
  }

  fs.writeFileSync(
    reelJsonPath,
    JSON.stringify({
      ...reelConfig,
      generatedAt: new Date().toISOString(),
      model: OMNI_MODEL,
      durationSec: TARGET_DURATION_SEC,
      ...cloudinaryMeta,
    }, null, 2),
    'utf8'
  );

  console.log(`  ✅ ${id} gerado!`);
  if (cloudinaryMeta.cloudinaryUrl) console.log(`     ▶ ${cloudinaryMeta.cloudinaryUrl}`);
  log.ok('omni', `Reel gerado: ${id}`, { id, date });
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  checkEnv();

  const args = process.argv.slice(2);
  const allFlag = args.includes('--all');
  const queueIdx = args.indexOf('--queue');
  const outIdx = args.indexOf('--out');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;

  if (!allFlag && queueIdx === -1) {
    console.log('\nUso:');
    console.log('  node scripts/generate-omni.js --all [--limit N]');
    console.log('  node scripts/generate-omni.js --queue <arquivo.json> [--out <dir>] [--limit N]');
    process.exit(0);
  }

  const queuePath = queueIdx !== -1
    ? path.resolve(args[queueIdx + 1])
    : path.join(ROOT, 'data', 'veo-queue.json');

  const outRoot = outIdx !== -1
    ? path.resolve(args[outIdx + 1])
    : READY_DIR;

  if (!fs.existsSync(queuePath)) {
    console.error(`❌ Fila não encontrada: ${queuePath}`);
    process.exit(1);
  }

  const allReels = JSON.parse(fs.readFileSync(queuePath, 'utf8').replace(/^﻿/, ''));

  // Filtra já concluídos antes de aplicar --limit
  let reels = allReels.filter(r => {
    const dir = outRoot === READY_DIR
      ? path.join(outRoot, r.date.slice(0, 7), r.date, r.id)
      : path.join(outRoot, r.id);
    if (fs.existsSync(path.join(dir, 'published.json'))) return false;
    if (fs.existsSync(path.join(dir, 'reel.mp4'))) return false;
    const rj = path.join(dir, 'reel.json');
    if (fs.existsSync(rj)) {
      try { if (JSON.parse(fs.readFileSync(rj, 'utf8').replace(/^﻿/, '')).cloudinaryUrl) return false; } catch {}
    }
    return true;
  });

  if (isFinite(limit)) reels = reels.slice(0, limit);

  console.log(`\n📋 ${allReels.length} na fila — processando ${reels.length}${isFinite(limit) ? ` (--limit ${limit})` : ''}`);
  console.log(`   Modelo: ${OMNI_MODEL} · 9:16 · ${TARGET_DURATION_SEC}s · som ambiente (sem falas)`);
  reels.forEach(r => console.log(`   • ${r.id} (${r.date})`));

  let ok = 0;
  for (let i = 0; i < reels.length; i++) {
    try {
      await processReel(reels[i], outRoot);
      ok++;
    } catch (err) {
      console.error(`\n  ✗ Falhou ${reels[i].id}: ${err.message}`);
      const isQuota = /429|quota|RESOURCE_EXHAUSTED/i.test(err.message);
      log.error('omni', `Falha ao gerar ${reels[i].id}: ${err.message}`, {
        id: reels[i].id, erro: err.message, ...(isQuota ? { code: 429 } : {}),
      });
      if (isQuota) {
        console.error(`\n🛑 Quota estourada — parando o lote.`);
        break;
      }
    }
  }

  console.log(`\n──────────────────────────────────────`);
  console.log(`✅ ${ok}/${reels.length} reel(s) gerado(s)`);
}

main().catch(err => {
  log.error('omni', `Erro fatal: ${err.message}`, { erro: err.message });
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
