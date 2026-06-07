#!/usr/bin/env node
/**
 * publish.js — publica reels e posts no Instagram via Graph API
 *
 * Fluxo para cada item:
 *   1. Sobe o vídeo/imagem para o Cloudinary (URL pública temporária)
 *   2. Cria container no Instagram Graph API com a URL + caption
 *   3. Poll até status FINISHED (vídeos levam 1-3 min)
 *   4. Publica o container
 *   5. Remove o arquivo do Cloudinary
 *
 * Uso:
 *   node scripts/publish.js --folder ready-to-post/2026-05/2026-05-06/reel-01-relogio
 *   node scripts/publish.js --date 2026-05-06          (publica tudo daquela data)
 *   node scripts/publish.js --all                       (publica tudo ainda não publicado)
 *
 * Variáveis de ambiente necessárias (.env):
 *   CLOUDINARY_CLOUD_NAME=
 *   CLOUDINARY_API_KEY=
 *   CLOUDINARY_API_SECRET=
 *   INSTAGRAM_ACCESS_TOKEN=
 *   INSTAGRAM_USER_ID=
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const log  = require('./lib/logger');

// Carrega Cloudinary dinamicamente (instalado separado)
let cloudinary;
try {
  cloudinary = require('cloudinary').v2;
} catch {
  console.error('❌ Instale o cloudinary: npm install cloudinary');
  process.exit(1);
}

const ROOT      = path.resolve(__dirname, '..');
const READY_DIR = path.join(ROOT, 'ready-to-post');

// ── Config ───────────────────────────────────────────────────────────────────

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  INSTAGRAM_ACCESS_TOKEN,
  INSTAGRAM_USER_ID,
} = process.env;

function checkEnv() {
  const missing = [
    'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
    'INSTAGRAM_ACCESS_TOKEN', 'INSTAGRAM_USER_ID',
  ].filter(k => !process.env[k]);

  if (missing.length) {
    console.error('❌ Variáveis de ambiente faltando no .env:');
    missing.forEach(k => console.error(`   ${k}=`));
    console.error('\nVeja o guia de setup: docs/setup-instagram-api.md');
    process.exit(1);
  }
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key:    CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const IG_BASE = 'https://graph.instagram.com/v21.0';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Sobe arquivo para Cloudinary e retorna URL pública.
 * Usa resource_type auto (detecta vídeo vs imagem).
 */
async function uploadToCloudinary(filePath) {
  console.log(`  ☁️  Subindo para Cloudinary...`);
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'auto',
    folder:        'luiza-instagram-temp',
    use_filename:  true,
    unique_filename: true,
  });
  console.log(`  ✓ URL: ${result.secure_url}`);
  return { url: result.secure_url, publicId: result.public_id };
}

/**
 * Remove arquivo do Cloudinary após publicação.
 */
async function deleteFromCloudinary(publicId, resourceType = 'video') {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (e) {
    // Não crítico — falha silenciosa
  }
}

/**
 * Cria container de mídia no Instagram.
 * Para Reels: media_type=REELS + video_url
 * Para imagem única: image_url
 * Para carrossel: cria container filho (sem caption)
 */
async function createMediaContainer(opts) {
  const { mediaType, mediaUrl, caption, isCarouselChild = false, coverUrl = null } = opts;
  const body = new URLSearchParams({ access_token: INSTAGRAM_ACCESS_TOKEN });

  if (!isCarouselChild && caption) body.append('caption', caption);

  if (mediaType === 'REELS' || mediaType === 'VIDEO') {
    body.append('media_type', 'REELS');
    body.append('video_url', mediaUrl);
    // Capa personalizada para o feed grid (cover.png da pasta)
    if (coverUrl) {
      body.append('cover_url', coverUrl);
      console.log(`  🖼️  Capa personalizada: ${coverUrl.split('/').pop()}`);
    }
  } else {
    body.append('image_url', mediaUrl);
    if (isCarouselChild) body.append('is_carousel_item', 'true');
  }

  const res  = await fetch(`${IG_BASE}/${INSTAGRAM_USER_ID}/media`, { method: 'POST', body });
  const data = await res.json();

  if (data.error) throw new Error(`Instagram API: ${data.error.message}`);
  return data.id;
}

/**
 * Cria o container pai de um carrossel com os IDs dos filhos já criados.
 */
async function createCarouselContainer(childrenIds, caption) {
  const body = new URLSearchParams({
    access_token: INSTAGRAM_ACCESS_TOKEN,
    media_type:   'CAROUSEL',
    children:     childrenIds.join(','),
    caption,
  });
  const res  = await fetch(`${IG_BASE}/${INSTAGRAM_USER_ID}/media`, { method: 'POST', body });
  const data = await res.json();
  if (data.error) throw new Error(`Carousel container: ${data.error.message}`);
  return data.id;
}

/**
 * Poll até o container ficar pronto (status FINISHED).
 * Timeout: 5 minutos.
 */
async function waitForContainer(containerId) {
  const maxWait = 5 * 60 * 1000; // 5 min
  const interval = 10_000;       // 10s
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    const res  = await fetch(
      `${IG_BASE}/${containerId}?fields=status_code&access_token=${INSTAGRAM_ACCESS_TOKEN}`
    );
    const data = await res.json();

    if (data.error) throw new Error(`Poll error: ${data.error.message}`);

    process.stdout.write(`\r  ⏳ Status: ${data.status_code}   `);

    if (data.status_code === 'FINISHED') {
      console.log(`\r  ✓ Container pronto              `);
      return;
    }
    if (data.status_code === 'ERROR') {
      throw new Error('Instagram rejeitou o vídeo (ERROR). Verifique formato e codec.');
    }

    await sleep(interval);
  }
  throw new Error('Timeout aguardando processamento do Instagram (>5min)');
}

/**
 * Publica o container já processado.
 */
async function publishContainer(containerId) {
  const body = new URLSearchParams({
    creation_id:  containerId,
    access_token: INSTAGRAM_ACCESS_TOKEN,
  });
  const res  = await fetch(`${IG_BASE}/${INSTAGRAM_USER_ID}/media_publish`, { method: 'POST', body });
  const data = await res.json();

  if (data.error) throw new Error(`Publish error: ${data.error.message}`);
  return data.id; // Instagram media ID do post publicado
}

// ── Publicação de um item ─────────────────────────────────────────────────────

async function publishFolder(folderPath) {
  const name = path.relative(READY_DIR, folderPath);

  // Verifica se já foi publicado
  const publishedFlag = path.join(folderPath, 'published.json');
  if (fs.existsSync(publishedFlag)) {
    console.log(`  ⏭  ${name} — já publicado, pulando`);
    return;
  }

  // Detecta tipo: reel-final.mp4 (CapCut) > reel.mp4 > slides PNG
  const reelFinal  = path.join(folderPath, 'reel-final.mp4');
  const reelOrig   = path.join(folderPath, 'reel.mp4');
  const hasReel    = fs.existsSync(reelFinal) || fs.existsSync(reelOrig);

  // Coleta todos os slides em ordem
  const slides = fs.readdirSync(folderPath)
    .filter(f => /^slide-\d+\.png$/.test(f))
    .sort()
    .map(f => path.join(folderPath, f));

  const isCarousel = !hasReel && slides.length > 1;
  const isImage    = !hasReel && slides.length === 1;

  if (!hasReel && slides.length === 0) {
    console.log(`  ✗ ${name} — sem reel.mp4 nem slides PNG, pulando`);
    return;
  }

  // Lê caption
  const captionFile = path.join(folderPath, 'caption.txt');
  const caption = fs.existsSync(captionFile)
    ? fs.readFileSync(captionFile, 'utf8').trim()
    : '';

  if (!caption) console.warn(`  ⚠️  ${name} — caption.txt vazio`);

  const tipo = hasReel ? '🎬 Reel' : isCarousel ? `🖼️  Carrossel (${slides.length} slides)` : '📄 Post';
  console.log(`\n📤 Publicando ${name}... ${tipo}`);

  const uploadedIds = []; // { publicId, resourceType }
  let mediaId;

  try {
    if (hasReel) {
      // ── REEL ────────────────────────────────────────────────────────────────
      const mediaFile = fs.existsSync(reelFinal) ? reelFinal : reelOrig;
      if (fs.existsSync(reelFinal)) console.log(`  🎵 Usando reel-final.mp4 (CapCut)`);

      const { url, publicId } = await uploadToCloudinary(mediaFile);
      uploadedIds.push({ publicId, resourceType: 'video' });

      // Capa personalizada: sobe cover.png se existir na pasta
      let coverUrl = null;
      const coverFile = path.join(folderPath, 'cover.png');
      if (fs.existsSync(coverFile)) {
        console.log(`  🖼️  Subindo cover.png para Cloudinary...`);
        const { url: cUrl, publicId: cId } = await uploadToCloudinary(coverFile);
        uploadedIds.push({ publicId: cId, resourceType: 'image' });
        coverUrl = cUrl;
      }

      const containerId = await createMediaContainer({ mediaType: 'REELS', mediaUrl: url, caption, coverUrl });
      console.log(`  ✓ Container reel: ${containerId}`);
      await waitForContainer(containerId);
      mediaId = await publishContainer(containerId);

    } else if (isCarousel) {
      // ── CARROSSEL ───────────────────────────────────────────────────────────
      console.log(`  ☁️  Subindo ${slides.length} slides para Cloudinary...`);
      const childIds = [];

      for (let i = 0; i < slides.length; i++) {
        const { url, publicId } = await uploadToCloudinary(slides[i]);
        uploadedIds.push({ publicId, resourceType: 'image' });
        const childId = await createMediaContainer({
          mediaType: 'IMAGE',
          mediaUrl: url,
          isCarouselChild: true,
        });
        childIds.push(childId);
        console.log(`  ✓ Slide ${i + 1}/${slides.length} container: ${childId}`);
      }

      const carouselId = await createCarouselContainer(childIds, caption);
      console.log(`  ✓ Carousel container: ${carouselId}`);
      // Instagram precisa de alguns segundos para processar os containers filhos
      console.log(`  ⏳ Aguardando Instagram processar os slides...`);
      await sleep(8000);
      mediaId = await publishContainer(carouselId);

    } else {
      // ── IMAGEM ÚNICA ────────────────────────────────────────────────────────
      const { url, publicId } = await uploadToCloudinary(slides[0]);
      uploadedIds.push({ publicId, resourceType: 'image' });

      const containerId = await createMediaContainer({ mediaType: 'IMAGE', mediaUrl: url, caption });
      console.log(`  ✓ Container imagem: ${containerId}`);
      mediaId = await publishContainer(containerId);
    }

    console.log(`  ✅ Publicado! Instagram media ID: ${mediaId}`);

    fs.writeFileSync(publishedFlag, JSON.stringify({
      instagram_media_id: mediaId,
      published_at: new Date().toISOString(),
      type: hasReel ? 'reel' : isCarousel ? 'carousel' : 'image',
      slides_count: isCarousel ? slides.length : 1,
      caption_preview: caption.slice(0, 100),
    }, null, 2));

    log.ok('publish', `Publicado: ${path.basename(folderPath)}`, {
      id: path.basename(folderPath),
      tipo: hasReel ? 'reel' : isCarousel ? 'carousel' : 'image',
      mediaId,
    });

  } finally {
    for (const { publicId, resourceType } of uploadedIds) {
      await deleteFromCloudinary(publicId, resourceType);
    }
  }
}

// ── Varredura de pastas ───────────────────────────────────────────────────────

/**
 * Retorna pastas publicáveis.
 * - targetDate: publica só essa data específica (YYYY-MM-DD)
 * - todayOnly: publica só o que está agendado para HOJE (padrão das tasks)
 * - sem flags: publica tudo vencido (uso manual apenas)
 */
function findPublishableFolders(targetDate = null, todayOnly = false) {
  const folders = [];
  const today   = new Date().toISOString().split('T')[0];

  const monthDirs = fs.readdirSync(READY_DIR)
    .map(d => path.join(READY_DIR, d))
    .filter(d => fs.statSync(d).isDirectory());

  for (const monthDir of monthDirs) {
    const dateDirs = fs.readdirSync(monthDir)
      .map(d => path.join(monthDir, d))
      .filter(d => fs.statSync(d).isDirectory());

    for (const dateDir of dateDirs) {
      const dirDate = path.basename(dateDir);

      if (targetDate && !dateDir.endsWith(targetDate)) continue;
      if (todayOnly  && dirDate !== today) continue;

      if (dirDate > today) {
        console.log(`  📅 ${path.relative(READY_DIR, dateDir)} — agendado para ${dirDate}, ainda não chegou`);
        continue;
      }

      const contentDirs = fs.readdirSync(dateDir)
        .map(d => path.join(dateDir, d))
        .filter(d => fs.statSync(d).isDirectory())
        .filter(d => !fs.existsSync(path.join(d, 'published.json'))); // pula já publicados

      folders.push(...contentDirs);
    }
  }

  return folders;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  checkEnv();

  const args        = process.argv.slice(2);
  const folderFlag  = args.indexOf('--folder');
  const dateFlag    = args.indexOf('--date');
  const allFlag     = args.includes('--all');
  const todayFlag   = args.includes('--today');
  const catchupFlag = args.includes('--catchup');

  let folders = [];

  if (folderFlag !== -1 && args[folderFlag + 1]) {
    folders = [path.resolve(args[folderFlag + 1])];

  } else if (dateFlag !== -1 && args[dateFlag + 1]) {
    folders = findPublishableFolders(args[dateFlag + 1]);
    console.log(`📋 ${folders.length} item(s) encontrado(s) para ${args[dateFlag + 1]}`);

  } else if (todayFlag) {
    // Publica SÓ o que está agendado para hoje — usado pelas scheduled tasks
    const today = new Date().toISOString().split('T')[0];
    const allToday = findPublishableFolders(null, true);
    console.log(`📋 ${allToday.length} item(s) agendados para hoje (${today})`);

    // Proteção anti-duplicata: agrupa por data-pai e limita a 1 item por data
    // (caso o ciclo de geração tenha criado entradas extras para o mesmo dia)
    const seenDates = new Set();
    folders = [];
    for (const folder of allToday) {
      // Pasta-pai é o nível de data: ready-to-post/YYYY-MM/YYYY-MM-DD
      const dateKey = path.basename(path.dirname(folder));
      if (seenDates.has(dateKey)) {
        console.warn(`⚠️  Múltiplos itens para ${dateKey} — pulando ${path.basename(folder)} (já tem 1 agendado hoje)`);
        continue;
      }
      seenDates.add(dateKey);
      folders.push(folder);
    }

  } else if (catchupFlag) {
    // Publica o de hoje + atrasados não publicados — usado pelas scheduled tasks
    // Garante resiliência quando o PC fica desligado no horário agendado:
    //   • published.json previne republicar o que já foi
    //   • MAX_CATCHUP_PER_RUN evita spam no feed se o PC ficou off por vários dias
    const MAX_CATCHUP_PER_RUN = 2;

    const allPending = findPublishableFolders(); // tudo com data <= hoje sem published.json

    // 1 item por data, ordem cronológica (mais antigo primeiro → publica na sequência correta)
    const seenDates = new Set();
    const sorted = allPending
      .map(f => ({ path: f, dateKey: path.basename(path.dirname(f)) }))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    const candidates = [];
    for (const { path: f, dateKey } of sorted) {
      if (!seenDates.has(dateKey)) {
        seenDates.add(dateKey);
        candidates.push(f);
      }
    }

    folders = candidates.slice(0, MAX_CATCHUP_PER_RUN);

    const adiados = candidates.length - folders.length;
    const today = new Date().toISOString().split('T')[0];
    console.log(`📋 ${candidates.length} item(s) pendente(s) → publicando ${folders.length} agora` +
      (adiados > 0 ? ` (${adiados} adiado(s) para próxima rodada)` : ''));

    if (adiados > 0) {
      log.warn('publish', `${adiados} item(s) atrasado(s) serão publicados nas próximas rodadas`, {
        total_pendentes: candidates.length, publicando: folders.length,
      });
      console.warn(`⚠️  Muitos itens pendentes (${candidates.length}). Próximas tasks vão publicar o restante.`);
    } else if (candidates.length === 0) {
      console.log(`  ✓ Nada para publicar hoje (${today})`);
    }

  } else if (allFlag) {
    // Publica tudo vencido — uso manual apenas
    folders = findPublishableFolders();
    console.log(`📋 ${folders.length} item(s) vencidos para publicar`);
    if (folders.length > 3) {
      console.warn(`⚠️  Muitos itens de uma vez (${folders.length}). Use --date YYYY-MM-DD para publicar por dia.`);
    }

  } else {
    console.log('Uso:');
    console.log('  node scripts/publish.js --catchup                  (hoje + atrasados — tasks automáticas)');
    console.log('  node scripts/publish.js --today                    (só o de hoje — legado)');
    console.log('  node scripts/publish.js --date 2026-05-27          (data específica)');
    console.log('  node scripts/publish.js --folder ready-to-post/... (pasta específica)');
    console.log('  node scripts/publish.js --all                      (tudo vencido — uso manual)');
    process.exit(1);
  }

  let erros = 0;
  for (const folder of folders) {
    await publishFolder(folder).catch(err => {
      erros++;
      console.error(`  ✗ Erro em ${path.relative(READY_DIR, folder)}: ${err.message}`);
      log.error('publish', `Falha ao publicar: ${err.message}`, {
        id: path.basename(folder),
        erro: err.message,
      });
    });
  }

  if (erros > 0) {
    log.error('publish', `${erros} item(ns) falharam na publicação de hoje`, { total: erros });
  }
  console.log('\n✅ Publicação concluída!');
}

main().catch(err => {
  log.error('publish', `Erro fatal: ${err.message}`, { erro: err.message });
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
