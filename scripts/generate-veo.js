#!/usr/bin/env node
/**
 * generate-veo.js — gera reels Food Animated via Veo (Google AI Studio)
 *
 * Usa a API do Google AI Studio para gerar vídeos text-to-video com Veo.
 * Resultado: MP4 pronto para publicar.
 *
 * Uso:
 *   node scripts/generate-veo.js --all          (processa data/veo-queue.json)
 *   node scripts/generate-veo.js --folder PASTA (gera um reel específico)
 *
 * Variáveis de ambiente necessárias (.env):
 *   GOOGLE_API_KEY=AIzaSy...
 *   (Obter em https://aistudio.google.com/apikey)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const log = require('./lib/logger');

require('dotenv').config();

// ffmpeg-static já está instalado (usado pelo record-reel.js)
let ffmpegPath;
try {
  ffmpegPath = require('ffmpeg-static');
} catch {
  ffmpegPath = 'ffmpeg'; // fallback para ffmpeg do sistema
}

const ROOT = path.resolve(__dirname, '..');
const READY_DIR = path.join(ROOT, 'ready-to-post');

// ── Config ───────────────────────────────────────────────────────────────────

const { GOOGLE_API_KEY } = process.env;

// Modelos Veo disponíveis nesta chave:
//   veo-2.0-generate-001
//   veo-3.0-generate-001
//   veo-3.0-fast-generate-001
//   veo-3.1-generate-preview
//   veo-3.1-fast-generate-preview
//   veo-3.1-lite-generate-preview  ← usamos este (melhor custo-benefício)
const VEO_MODEL = 'veo-3.1-lite-generate-preview';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

function checkEnv() {
  if (!GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY não encontrada em .env');
    console.error('\nAcesse https://aistudio.google.com/apikey e copie sua chave');
    console.error('Adicione em .env: GOOGLE_API_KEY=AIzaSy...');
    process.exit(1);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Chama Google AI Studio Veo para gerar vídeo a partir de prompt texto.
 * Retorna os bytes do vídeo (Buffer) ou URL de download.
 */
async function generateVeoVideo(prompt) {
  console.log(`  ☁️  Chamando Google AI Studio (Veo)...`);

  const url = `${BASE_URL}/models/${VEO_MODEL}:predictLongRunning?key=${GOOGLE_API_KEY}`;

  const payload = {
    instances: [
      { prompt }
    ],
    parameters: {
      aspectRatio: '9:16',
      sampleCount: 1,
      durationSeconds: 8,
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  // Lê body UMA vez como texto, depois tenta parsear
  const rawBody = await response.text();

  if (!response.ok) {
    let errorBody;
    try { errorBody = JSON.parse(rawBody); } catch { errorBody = rawBody; }
    console.error(`  ✗ Resposta da API (${response.status}):`, JSON.stringify(errorBody, null, 2));
    throw new Error(`Google API error (${response.status}): ${typeof errorBody === 'string' ? errorBody : errorBody?.error?.message || JSON.stringify(errorBody)}`);
  }

  let data;
  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error(`Resposta inválida (não é JSON): ${rawBody.substring(0, 200)}`);
  }

  console.log(`  📨 Resposta OK:`, JSON.stringify(data).substring(0, 150));

  // Google retorna uma operação assíncrona (Long Running Operation)
  if (data.name) {
    console.log(`  📝 Operação: ${data.name}`);
    return await pollOperation(data.name);
  }

  throw new Error(`Resposta inesperada (sem campo 'name'): ${JSON.stringify(data).substring(0, 300)}`);
}

/**
 * Poll da operação Google até estar completa.
 * Retorna Buffer com bytes do vídeo ou URL de download.
 */
async function pollOperation(operationName, maxWaitSec = 300) {
  const startTime = Date.now();
  const maxWait = maxWaitSec * 1000;

  // operationName é o nome completo retornado pela API, ex:
  // "projects/.../operations/xxx" OU apenas "operations/xxx"
  // A URL de poll usa o path completo retornado
  const pollUrl = `${BASE_URL}/${operationName}?key=${GOOGLE_API_KEY}`;

  while (Date.now() - startTime < maxWait) {
    await sleep(8000); // Google leva ~30-120s — poll a cada 8s

    const response = await fetch(pollUrl, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Poll error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    if (data.error) {
      throw new Error(`Operação falhou: ${JSON.stringify(data.error)}`);
    }

    if (data.done) {
      console.log(`\n  ✓ Vídeo pronto (${elapsed}s)`);
      return extractVideoFromResponse(data);
    }

    process.stdout.write(`\r  ⏳ Gerando vídeo (${elapsed}s)...   `);
  }

  throw new Error(`Timeout aguardando geração Veo (>${maxWaitSec}s)`);
}

/**
 * Extrai o vídeo da resposta da operação.
 * Pode ser base64, URI de download, ou outro formato.
 */
function extractVideoFromResponse(data) {
  const resp = data.response;

  if (!resp) {
    throw new Error('Resposta da operação sem campo "response"');
  }

  // Formato Vertex AI / Google AI Studio para Veo
  const samples = resp?.generateVideoResponse?.generatedSamples
    || resp?.generatedSamples
    || [];

  if (samples.length === 0) {
    throw new Error(`Nenhum sample gerado. Resposta: ${JSON.stringify(resp)}`);
  }

  const sample = samples[0];

  // Vídeo como URI de download (gcs:// ou https://)
  if (sample?.video?.uri) {
    return { type: 'uri', value: sample.video.uri };
  }

  // Vídeo como base64
  if (sample?.video?.videoBytes || sample?.videoBytes) {
    const b64 = sample?.video?.videoBytes || sample?.videoBytes;
    return { type: 'base64', value: b64 };
  }

  throw new Error(`Formato de vídeo desconhecido: ${JSON.stringify(sample)}`);
}

/**
 * Salva o vídeo no disco a partir de URI ou base64
 */
async function saveVideo(videoResult, outputPath) {
  console.log(`  📥 Salvando vídeo...`);

  if (videoResult.type === 'base64') {
    const buffer = Buffer.from(videoResult.value, 'base64');
    fs.writeFileSync(outputPath, buffer);
    const sizeKB = (buffer.length / 1024).toFixed(2);
    console.log(`  ✓ MP4 salvo (${sizeKB} KB)`);
    return;
  }

  if (videoResult.type === 'uri') {
    const uri = videoResult.value;

    // GCS URI — precisa de autenticação diferente
    if (uri.startsWith('gs://')) {
      throw new Error(`Vídeo em GCS (${uri}) — use 'gsutil cp ${uri} ${outputPath}' ou configure GOOGLE_APPLICATION_CREDENTIALS`);
    }

    // HTTPS URL — download com autenticação Google
    // Adiciona API key ao URL se for generativelanguage.googleapis.com
    let downloadUrl = uri;
    if (uri.includes('generativelanguage.googleapis.com') && !uri.includes('key=')) {
      downloadUrl = `${uri}${uri.includes('?') ? '&' : '?'}key=${GOOGLE_API_KEY}`;
    }

    const response = await fetch(downloadUrl, {
      headers: { 'x-goog-api-key': GOOGLE_API_KEY }
    });
    if (!response.ok) {
      throw new Error(`Download falhou (${response.status}): ${uri}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(outputPath, buffer);
    const sizeKB = (buffer.length / 1024).toFixed(2);
    console.log(`  ✓ MP4 salvo (${sizeKB} KB)`);
    return;
  }

  throw new Error(`Tipo de vídeo desconhecido: ${videoResult.type}`);
}

/**
 * Extrai um frame do MP4 como cover.png para o feed do Instagram.
 * Usa ffmpeg para capturar o frame no tempo indicado (padrão: 1.5s).
 * O frame do meio costuma ser o mais bonito em vídeos de comida.
 */
function extractCoverFrame(mp4Path, coverPath, timeSeconds = 1.5) {
  try {
    // ffmpeg -ss 1.5 -i input.mp4 -frames:v 1 -q:v 2 cover.png
    const cmd = `"${ffmpegPath}" -ss ${timeSeconds} -i "${mp4Path}" -frames:v 1 -q:v 2 -y "${coverPath}"`;
    execSync(cmd, { stdio: 'pipe' });
    const sizeKB = (fs.statSync(coverPath).size / 1024).toFixed(0);
    console.log(`  🖼️  cover.png extraído no ${timeSeconds}s (${sizeKB} KB)`);
    return true;
  } catch (err) {
    console.warn(`  ⚠️  Não foi possível extrair cover.png: ${err.message}`);
    return false;
  }
}

/**
 * Processa um reel: gera vídeo + salva metadata + caption
 */
async function processReel(reelConfig) {
  const { id, date, prompt, caption, hashtags } = reelConfig;

  const month = date.slice(0, 7);
  const outDir = path.join(READY_DIR, month, date, id);
  fs.mkdirSync(outDir, { recursive: true });

  // Verifica se já foi publicado — nunca regenerar
  const publishedFlag = path.join(outDir, 'published.json');
  if (fs.existsSync(publishedFlag)) {
    console.log(`  ⏭  ${id} — já publicado, pulando`);
    return;
  }

  // Verifica se MP4 já existe localmente (gerado mas não publicado)
  const mp4Path = path.join(outDir, 'reel.mp4');
  if (fs.existsSync(mp4Path)) {
    console.log(`  ⏭  ${id} — MP4 já existe, pulando geração`);
    return;
  }

  // Verifica se já foi gerado e está no Cloudinary (modo GitHub Actions)
  const reelJsonPath = path.join(outDir, 'reel.json');
  if (fs.existsSync(reelJsonPath)) {
    const existing = JSON.parse(fs.readFileSync(reelJsonPath, 'utf8'));
    if (existing.cloudinaryUrl) {
      console.log(`  ⏭  ${id} — já no Cloudinary, pulando geração`);
      return;
    }
  }

  console.log(`\n🎬 Gerando ${id}...`);
  console.log(`   Prompt: "${prompt.substring(0, 80)}..."`);

  try {
    // Gera vídeo via Google AI Studio Veo
    const videoResult = await generateVeoVideo(prompt);

    // Salva MP4
    await saveVideo(videoResult, mp4Path);

    // Extrai frame como cover.png (aparece no feed grid do Instagram)
    const coverPath = path.join(outDir, 'cover.png');
    extractCoverFrame(mp4Path, coverPath, 1.5);

    // ── Upload permanente para Cloudinary ─────────────────────────────────────
    // Necessário para GitHub Actions (sem disco persistente entre jobs).
    // Localmente: evita re-upload no publish.js — usa a URL direto.
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

    // Salva caption.txt
    const captionContent = `${caption}\n\n${hashtags}`;
    fs.writeFileSync(path.join(outDir, 'caption.txt'), captionContent, 'utf8');
    console.log(`  ✓ caption.txt salvo`);

    // Salva metadata (inclui URLs do Cloudinary se disponíveis)
    fs.writeFileSync(
      path.join(outDir, 'reel.json'),
      JSON.stringify({
        ...reelConfig,
        generatedAt: new Date().toISOString(),
        model: VEO_MODEL,
        ...cloudinaryMeta,   // cloudinaryUrl, cloudinaryPublicId, cloudinaryCoverUrl
      }, null, 2),
      'utf8'
    );
    console.log(`  ✓ reel.json salvo`);

    console.log(`  ✅ ${id} gerado com sucesso!`);
    console.log(`     📁 ${outDir}`);
    log.ok('veo', `Reel gerado: ${id}`, { id, date });

  } catch (err) {
    console.error(`\n  ✗ Erro ao gerar ${id}: ${err.message}`);
    throw err;
  }
}

/**
 * Ponto de entrada principal
 */
async function main() {
  checkEnv();

  const args = process.argv.slice(2);
  const allFlag = args.includes('--all');
  const folderIdx = args.indexOf('--folder');

  let reels = [];

  if (allFlag) {
    const queuePath = path.join(ROOT, 'data', 'veo-queue.json');
    if (!fs.existsSync(queuePath)) {
      console.error('❌ data/veo-queue.json não encontrado');
      process.exit(1);
    }
    reels = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
    console.log(`\n📋 ${reels.length} reel(s) na fila`);
    reels.forEach(r => console.log(`   • ${r.id} (${r.date})`));

  } else if (folderIdx !== -1 && args[folderIdx + 1]) {
    const folderPath = path.resolve(args[folderIdx + 1]);
    const reelJsonPath = path.join(folderPath, 'reel.json');

    if (fs.existsSync(reelJsonPath)) {
      const config = JSON.parse(fs.readFileSync(reelJsonPath, 'utf8'));
      reels = [config];
      console.log(`\n📋 Processando ${path.basename(folderPath)}...`);
    } else {
      // Tenta ler da queue pelo nome da pasta
      console.error(`❌ reel.json não encontrado em ${folderPath}`);
      process.exit(1);
    }

  } else {
    console.log('\nUso:');
    console.log('  node scripts/generate-veo.js --all');
    console.log('  node scripts/generate-veo.js --folder <caminho/para/reel>');
    console.log('\nExemplo:');
    console.log('  node scripts/generate-veo.js --all');
    console.log('  node scripts/generate-veo.js --folder ready-to-post/2026-05/2026-05-28/reel-food-03-teste');
    process.exit(0);
  }

  // Processa cada reel em sequência com pausa entre gerações
  // Evita rate limit da API (quota por minuto/hora do Google AI Studio)
  const DELAY_BETWEEN_MS = 90_000; // 90s entre cada geração

  let successCount = 0;
  for (let i = 0; i < reels.length; i++) {
    const reel = reels[i];
    try {
      await processReel(reel);
      successCount++;

      // Aguarda antes do próximo — só se houver próximo e ele ainda precisar gerar
      if (i < reels.length - 1) {
        const next    = reels[i + 1];
        const nextDir = path.join(READY_DIR, next.date.slice(0, 7), next.date, next.id);
        const nextDone = fs.existsSync(path.join(nextDir, 'reel.mp4'))
                      || fs.existsSync(path.join(nextDir, 'published.json'));
        if (!nextDone) {
          const secs = DELAY_BETWEEN_MS / 1000;
          process.stdout.write(`\n  ⏸  Aguardando ${secs}s (rate limit)...`);
          await new Promise(r => setTimeout(r, DELAY_BETWEEN_MS));
          process.stdout.write(`\r  ✓  Seguindo.                          \n`);
        }
      }
    } catch (err) {
      console.error(`\n❌ Falhou: ${reel.id}`);
      const isQuota = /429|quota|RESOURCE_EXHAUSTED/i.test(err.message);
      if (isQuota) {
        console.error(`   ⛔ Quota da API esgotada — interrompendo lote. Os restantes geram no próximo ciclo.`);
        log.error('veo', `Quota esgotada ao gerar ${reel.id} — lote interrompido`, {
          id: reel.id, code: 429, restantes: reels.length - i - 1,
        });
        break; // Não adianta insistir — para o lote e deixa o resto para depois
      }
      console.error(`   Corrija o prompt em data/veo-queue.json e rode novamente.`);
      log.error('veo', `Falha ao gerar ${reel.id}: ${err.message}`, { id: reel.id, erro: err.message });
    }
  }

  console.log(`\n──────────────────────────────────────`);
  console.log(`✅ ${successCount}/${reels.length} reel(s) gerados`);
  if (successCount > 0) {
    console.log(`\n📌 Próximo: node scripts/publish.js --today`);
  }
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
