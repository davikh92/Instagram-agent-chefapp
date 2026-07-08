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
  } else if (mediaType === 'STORIES') {
    // Stories aceitam imagem ou vídeo — a API ignora caption nesse tipo
    body.delete('caption');
    body.append('media_type', 'STORIES');
    if (/\.mp4($|\?)/i.test(mediaUrl)) {
      body.append('video_url', mediaUrl);
    } else {
      body.append('image_url', mediaUrl);
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

  // Lock file — previne corrida entre duas tasks rodando ao mesmo tempo
  // flag 'wx' = O_CREAT | O_EXCL → lança EEXIST se já existe (operação atômica no SO)
  const lockFile = path.join(folderPath, '.publishing');
  try {
    fs.writeFileSync(lockFile, String(process.pid), { flag: 'wx' });
  } catch (e) {
    if (e.code === 'EEXIST') {
      console.log(`  ⏭  ${name} — publicação já em andamento em outro processo, pulando`);
      log.warn('publish', `Lock detectado — ${path.basename(folderPath)} já está sendo publicado`, {
        id: path.basename(folderPath),
      });
      return;
    }
    throw e; // outro erro inesperado — propaga
  }

  // Lê metadados de Cloudinary antes da detecção de tipo
  // (cloudinaryUrl no reel.json conta como "tem reel" mesmo sem mp4 local)
  let reelCloudinaryUrl     = null;
  let reelCloudinaryCoverUrl = null;
  let imageCloudinaryUrl    = null;

  const reelJsonPath = path.join(folderPath, 'reel.json');
  if (fs.existsSync(reelJsonPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(reelJsonPath, 'utf8').replace(/^﻿/, ''));
      reelCloudinaryUrl      = meta.cloudinaryUrl      || null;
      reelCloudinaryCoverUrl = meta.cloudinaryCoverUrl || null;
    } catch { /* json inválido — ignora */ }
  }

  const postJsonPath = path.join(folderPath, 'post.json');
  if (fs.existsSync(postJsonPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(postJsonPath, 'utf8').replace(/^﻿/, ''));
      imageCloudinaryUrl = meta.cloudinaryUrl || null;
    } catch { /* json inválido — ignora */ }
  }

  // Detecta tipo: reel-final.mp4 (CapCut) > reel.mp4 > cloudinaryUrl no reel.json > slides PNG
  const reelFinal  = path.join(folderPath, 'reel-final.mp4');
  const reelOrig   = path.join(folderPath, 'reel.mp4');
  const hasReel    = fs.existsSync(reelFinal) || fs.existsSync(reelOrig) || !!reelCloudinaryUrl;

  // Coleta todos os slides em ordem
  const slides = fs.readdirSync(folderPath)
    .filter(f => /^slide-\d+\.png$/.test(f))
    .sort()
    .map(f => path.join(folderPath, f));

  const isCarousel = !hasReel && slides.length > 1;
  const isImage    = !hasReel && slides.length === 1;

  if (!hasReel && slides.length === 0) {
    console.log(`  ✗ ${name} — sem reel.mp4, cloudinaryUrl nem slides PNG, pulando`);
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

  // reelCloudinaryUrl, reelCloudinaryCoverUrl e imageCloudinaryUrl
  // já foram lidos acima (antes da detecção de tipo)

  try {
    if (hasReel) {
      // ── REEL ────────────────────────────────────────────────────────────────
      let reelUrl;
      if (reelCloudinaryUrl) {
        // Modo cloud: usa URL do Cloudinary já armazenada — zero re-upload
        console.log(`  ☁️  Usando vídeo permanente do Cloudinary`);
        reelUrl = reelCloudinaryUrl;
      } else {
        // Modo local: sobe o arquivo para Cloudinary como antes
        const mediaFile = fs.existsSync(reelFinal) ? reelFinal : reelOrig;
        if (fs.existsSync(reelFinal)) console.log(`  🎵 Usando reel-final.mp4 (CapCut)`);
        const { url, publicId } = await uploadToCloudinary(mediaFile);
        uploadedIds.push({ publicId, resourceType: 'video' }); // deletar depois
        reelUrl = url;
      }

      // Capa: usa do Cloudinary se disponível, senão sobe cover.png local
      let coverUrl = reelCloudinaryCoverUrl || null;
      if (!coverUrl) {
        const coverFile = path.join(folderPath, 'cover.png');
        if (fs.existsSync(coverFile)) {
          console.log(`  🖼️  Subindo cover.png para Cloudinary...`);
          const { url: cUrl, publicId: cId } = await uploadToCloudinary(coverFile);
          uploadedIds.push({ publicId: cId, resourceType: 'image' }); // deletar depois
          coverUrl = cUrl;
        }
      } else {
        console.log(`  🖼️  Usando cover permanente do Cloudinary`);
      }

      const containerId = await createMediaContainer({ mediaType: 'REELS', mediaUrl: reelUrl, caption, coverUrl });
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
      let imgUrl;
      if (imageCloudinaryUrl) {
        console.log(`  ☁️  Usando imagem permanente do Cloudinary`);
        imgUrl = imageCloudinaryUrl;
      } else {
        const { url, publicId } = await uploadToCloudinary(slides[0]);
        uploadedIds.push({ publicId, resourceType: 'image' });
        imgUrl = url;
      }

      const containerId = await createMediaContainer({ mediaType: 'IMAGE', mediaUrl: imgUrl, caption });
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
    // Remove lock — sempre, mesmo em caso de erro
    try { fs.unlinkSync(lockFile); } catch { /* se já foi removido, ok */ }

    for (const { publicId, resourceType } of uploadedIds) {
      await deleteFromCloudinary(publicId, resourceType);
    }
  }
}

// ── Stories ────────────────────────────────────────────────────────────────────

/**
 * Publica uma pasta de story gerada (story.json + slide-01.png).
 * Sempre media_type=STORIES, sempre imagem única, sem caption na API.
 */
async function publishStoryFolder(folderPath) {
  const name = path.relative(READY_DIR, folderPath);

  const publishedFlag = path.join(folderPath, 'published.json');
  if (fs.existsSync(publishedFlag)) {
    console.log(`  ⏭  ${name} — já publicado, pulando`);
    return;
  }

  const storyJsonPath = path.join(folderPath, 'story.json');
  if (!fs.existsSync(storyJsonPath)) {
    console.log(`  ✗ ${name} — sem story.json, pulando`);
    return;
  }
  const meta = JSON.parse(fs.readFileSync(storyJsonPath, 'utf8').replace(/^﻿/, ''));

  let imgUrl = meta.cloudinaryUrl || null;
  const uploadedIds = [];

  console.log(`\n📤 Publicando story ${name} (${meta.pillar})...`);

  try {
    if (!imgUrl) {
      const slidePath = path.join(folderPath, 'slide-01.png');
      if (!fs.existsSync(slidePath)) {
        console.log(`  ✗ ${name} — sem cloudinaryUrl nem slide-01.png, pulando`);
        return;
      }
      const { url, publicId } = await uploadToCloudinary(slidePath);
      uploadedIds.push({ publicId, resourceType: 'image' });
      imgUrl = url;
    } else {
      console.log(`  ☁️  Usando imagem permanente do Cloudinary`);
    }

    const containerId = await createMediaContainer({ mediaType: 'STORIES', mediaUrl: imgUrl });
    console.log(`  ✓ Container story: ${containerId}`);
    // Meta precisa buscar a imagem no Cloudinary antes do container ficar pronto —
    // publicar sem esperar dá "Media ID is not available" (causa da falha em 07/07).
    await waitForContainer(containerId);
    const mediaId = await publishContainer(containerId);
    console.log(`  ✅ Story publicada! Instagram media ID: ${mediaId}`);

    fs.writeFileSync(publishedFlag, JSON.stringify({
      instagram_media_id: mediaId,
      published_at: new Date().toISOString(),
      type: 'story',
      pillar: meta.pillar,
    }, null, 2));

    log.ok('publish', `Story publicada: ${path.basename(folderPath)}`, { id: path.basename(folderPath), pillar: meta.pillar, mediaId });

  } finally {
    for (const { publicId, resourceType } of uploadedIds) {
      await deleteFromCloudinary(publicId, resourceType);
    }
  }
}

/**
 * Reposta como Story a mídia do feed já publicada hoje (mesma pasta-data).
 * Usa a cloudinaryUrl já armazenada — sem custo extra de geração.
 * Marca com .story-repost-done para não repostar 2x no mesmo dia.
 */
async function repostFeedAsStory(dateDir) {
  const repostMarker = path.join(dateDir, '.story-repost-done');
  if (fs.existsSync(repostMarker)) {
    console.log(`  ⏭  Repost do feed já feito hoje`);
    return;
  }

  // Encontra o item do feed já publicado hoje (reel ou post, não story-*)
  const contentDirs = fs.readdirSync(dateDir)
    .map(d => path.join(dateDir, d))
    .filter(d => fs.statSync(d).isDirectory())
    .filter(d => !path.basename(d).startsWith('story-'))
    .filter(d => fs.existsSync(path.join(d, 'published.json')));

  if (contentDirs.length === 0) {
    console.log(`  ⏭  Nenhum post de feed publicado hoje ainda — repost adiado`);
    return;
  }

  const sourceDir = contentDirs[0];
  const reelJsonPath = path.join(sourceDir, 'reel.json');
  const postJsonPath = path.join(sourceDir, 'post.json');

  let mediaUrl = null;
  if (fs.existsSync(reelJsonPath)) {
    const meta = JSON.parse(fs.readFileSync(reelJsonPath, 'utf8').replace(/^﻿/, ''));
    mediaUrl = meta.cloudinaryUrl || null;
  } else if (fs.existsSync(postJsonPath)) {
    const meta = JSON.parse(fs.readFileSync(postJsonPath, 'utf8').replace(/^﻿/, ''));
    mediaUrl = meta.cloudinaryUrl || null;
  }

  if (!mediaUrl) {
    console.log(`  ⏭  ${path.basename(sourceDir)} — sem cloudinaryUrl, não dá pra repostar como story`);
    return;
  }

  console.log(`\n📤 Repostando feed como story: ${path.basename(sourceDir)}...`);
  const containerId = await createMediaContainer({ mediaType: 'STORIES', mediaUrl });
  console.log(`  ✓ Container story (repost): ${containerId}`);
  await waitForContainer(containerId);
  const mediaId = await publishContainer(containerId);
  console.log(`  ✅ Repost publicado! Instagram media ID: ${mediaId}`);

  fs.writeFileSync(repostMarker, JSON.stringify({
    instagram_media_id: mediaId,
    published_at: new Date().toISOString(),
    source: path.basename(sourceDir),
  }, null, 2));

  log.ok('publish', `Repost de feed como story: ${path.basename(sourceDir)}`, { source: path.basename(sourceDir), mediaId });
}

/**
 * Encontra pastas story-* pendentes (sem published.json) com data <= hoje,
 * em qualquer mês, ordenadas da mais antiga pra mais nova.
 * Isso dá catchup pra stories que perderam o slot do próprio dia — sem isso
 * elas ficam órfãs para sempre e o --catchup do FEED acaba as publicando
 * como post normal (bug corrigido em jul/2026).
 */
function findPendingStoryFolders() {
  const today = new Date().toISOString().split('T')[0];
  const pending = [];

  const monthDirs = fs.readdirSync(READY_DIR)
    .map(d => path.join(READY_DIR, d))
    .filter(d => fs.statSync(d).isDirectory());

  for (const monthDir of monthDirs) {
    const dateDirs = fs.readdirSync(monthDir)
      .map(d => path.join(monthDir, d))
      .filter(d => fs.statSync(d).isDirectory())
      .filter(d => path.basename(d) <= today);

    for (const dateDir of dateDirs) {
      const storyDirs = fs.readdirSync(dateDir)
        .map(d => path.join(dateDir, d))
        .filter(d => fs.statSync(d).isDirectory())
        .filter(d => path.basename(d).startsWith('story-'))
        .filter(d => !fs.existsSync(path.join(d, 'published.json')));
      pending.push(...storyDirs);
    }
  }

  return pending.sort(); // ordem cronológica (YYYY-MM-DD no path)
}

/**
 * Publica stories do slot de hoje: repost do feed + uma story gerada (story-*)
 * pendente mais antiga (hoje ou atrasada), se ainda não publicada.
 *
 * O repost é tentado em TODO slot (não só de manhã) porque o feed publica em
 * horários variáveis (10h/12h/18h BRT conforme o dia) — o marker
 * .story-repost-done garante que só acontece uma vez por dia, mesmo tentando
 * em múltiplos slots.
 */
async function publishStoriesToday(slot) {
  const today = new Date().toISOString().split('T')[0];
  const month = today.slice(0, 7);
  const dateDir = path.join(READY_DIR, month, today);

  if (fs.existsSync(dateDir)) {
    await repostFeedAsStory(dateDir).catch(err => {
      console.error(`  ✗ Erro no repost: ${err.message}`);
      log.error('publish', `Falha no repost de story: ${err.message}`, { erro: err.message });
    });
  } else {
    console.log(`  ⏭  Nenhuma pasta para hoje (${today}) — pulando repost`);
  }

  // Stories geradas (story-*) pendentes — hoje ou atrasadas (catchup)
  const storyDirs = findPendingStoryFolders();

  if (storyDirs.length === 0) {
    console.log(`  ⏭  Nenhuma story gerada pendente`);
    return;
  }

  if (storyDirs.length > 1) {
    console.log(`  ⚠️  ${storyDirs.length} stories pendentes — publicando a mais antiga, resto fica pra próximos slots`);
  }

  // Publica só 1 por slot — mantém distribuição ao longo do dia
  await publishStoryFolder(storyDirs[0]).catch(err => {
    console.error(`  ✗ Erro ao publicar story: ${err.message}`);
    log.error('publish', `Falha ao publicar story: ${err.message}`, { erro: err.message });
  });
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
        .filter(d => !path.basename(d).startsWith('story-')) // stories são publicadas só por publishStoriesToday
        .filter(d => !fs.existsSync(path.join(d, 'published.json'))); // pula já publicados

      folders.push(...contentDirs);
    }
  }

  return folders;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  checkEnv();

  // Sincroniza com o remoto antes de checar published.json
  // Evita que tarefas locais publiquem conteúdo já publicado pelo GitHub Actions
  if (!process.env.GITHUB_ACTIONS) {
    try {
      const { execSync } = require('child_process');
      console.log('🔄 Sincronizando git com remoto...');
      execSync('git pull --rebase origin main', { cwd: path.resolve(__dirname, '..'), stdio: 'pipe' });
      console.log('  ✓ Git atualizado');
    } catch (e) {
      console.warn('  ⚠️  git pull falhou (offline ou conflito) — continuando com estado local');
    }
  }

  // Remove locks órfãos de runs que crasharam antes de limpar
  // (crash entre writeFileSync do lock e unlinkSync no finally)
  try {
    const { globSync } = require('fs');
    // Node 18+ tem globSync nativo, senão usa readdirSync recursivo
  } catch { /* ignora — limpeza é best-effort */ }

  // Limpeza simples: encontra .publishing em toda a árvore ready-to-post
  function cleanStaleLocks(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) cleanStaleLocks(full);
      else if (entry.name === '.publishing') {
        try { fs.unlinkSync(full); console.log(`  🔓 Lock órfão removido: ${path.relative(READY_DIR, full)}`); }
        catch { /* ignorar */ }
      }
    }
  }
  cleanStaleLocks(READY_DIR);

  const args         = process.argv.slice(2);
  const folderFlag   = args.indexOf('--folder');
  const dateFlag     = args.indexOf('--date');
  const allFlag      = args.includes('--all');
  const todayFlag    = args.includes('--today');
  const catchupFlag  = args.includes('--catchup');
  const storiesFlag  = args.includes('--stories-today');
  const slotIdx      = args.indexOf('--slot');
  const slot         = slotIdx !== -1 ? args[slotIdx + 1] : 'manha';

  if (storiesFlag) {
    console.log(`📱 Publicando stories — slot: ${slot}`);
    await publishStoriesToday(slot);
    console.log('\n✅ Stories concluídas!');
    return;
  }

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
    console.log('  node scripts/publish.js --stories-today --slot manha|tarde|noite (stories do dia)');
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
