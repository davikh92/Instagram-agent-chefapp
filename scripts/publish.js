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
 * Para carrossel: media_type=CAROUSEL (implementação futura)
 */
async function createMediaContainer(opts) {
  const { mediaType, mediaUrl, caption } = opts;
  const body = new URLSearchParams({
    access_token: INSTAGRAM_ACCESS_TOKEN,
    caption,
  });

  if (mediaType === 'REELS' || mediaType === 'VIDEO') {
    body.append('media_type', 'REELS');
    body.append('video_url', mediaUrl);
  } else {
    body.append('image_url', mediaUrl);
  }

  const res  = await fetch(`${IG_BASE}/${INSTAGRAM_USER_ID}/media`, { method: 'POST', body });
  const data = await res.json();

  if (data.error) throw new Error(`Instagram API: ${data.error.message}`);
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

  // Detecta tipo: reel-final.mp4 (CapCut) > reel.mp4 > slide-01.png (estático)
  const reelFinal = path.join(folderPath, 'reel-final.mp4'); // exportado do CapCut com música
  const reelOrig  = path.join(folderPath, 'reel.mp4');
  const hasReel   = fs.existsSync(reelFinal) || fs.existsSync(reelOrig);
  const hasSlide  = fs.existsSync(path.join(folderPath, 'slide-01.png'));

  if (!hasReel && !hasSlide) {
    console.log(`  ✗ ${name} — sem reel.mp4 nem slide-01.png, pulando`);
    return;
  }

  // Lê caption (legenda Instagram)
  const captionFile = path.join(folderPath, 'caption.txt');
  const caption = fs.existsSync(captionFile)
    ? fs.readFileSync(captionFile, 'utf8').trim()
    : '';

  if (!caption) {
    console.warn(`  ⚠️  ${name} — caption.txt vazio`);
  }

  console.log(`\n📤 Publicando ${name}...`);

  let cloudPublicId;
  let mediaId;

  try {
    // 1. Upload para Cloudinary
    // Prefere reel-final.mp4 (com música do CapCut) se existir
    const mediaFile = hasReel
      ? (fs.existsSync(reelFinal) ? reelFinal : reelOrig)
      : path.join(folderPath, 'slide-01.png');

    if (hasReel && fs.existsSync(reelFinal)) {
      console.log(`  🎵 Usando reel-final.mp4 (editado no CapCut)`);
    }

    const { url, publicId } = await uploadToCloudinary(mediaFile);
    cloudPublicId = publicId;

    // 2. Cria container no Instagram
    const mediaType  = hasReel ? 'REELS' : 'IMAGE';
    const containerId = await createMediaContainer({ mediaType, mediaUrl: url, caption });
    console.log(`  ✓ Container criado: ${containerId}`);

    // 3. Aguarda processamento (só necessário para vídeo)
    if (hasReel) {
      await waitForContainer(containerId);
    }

    // 4. Publica
    mediaId = await publishContainer(containerId);
    console.log(`  ✅ Publicado! Instagram media ID: ${mediaId}`);

    // 5. Salva flag de publicado
    fs.writeFileSync(publishedFlag, JSON.stringify({
      instagram_media_id: mediaId,
      published_at: new Date().toISOString(),
      caption_preview: caption.slice(0, 100),
    }, null, 2));

  } finally {
    // Limpa Cloudinary independente de sucesso/falha
    if (cloudPublicId) {
      const resourceType = hasReel ? 'video' : 'image';
      await deleteFromCloudinary(cloudPublicId, resourceType);
    }
  }
}

// ── Varredura de pastas ───────────────────────────────────────────────────────

function findPublishableFolders(targetDate = null) {
  const folders = [];

  const monthDirs = fs.readdirSync(READY_DIR)
    .map(d => path.join(READY_DIR, d))
    .filter(d => fs.statSync(d).isDirectory());

  for (const monthDir of monthDirs) {
    const dateDirs = fs.readdirSync(monthDir)
      .map(d => path.join(monthDir, d))
      .filter(d => fs.statSync(d).isDirectory());

    for (const dateDir of dateDirs) {
      // Filtra por data se especificada
      if (targetDate && !dateDir.endsWith(targetDate)) continue;

      // Só publica se a data já chegou ou passou
      const dirDate  = path.basename(dateDir);
      const today    = new Date().toISOString().split('T')[0];
      if (dirDate > today) {
        console.log(`  📅 ${path.relative(READY_DIR, dateDir)} — agendado para ${dirDate}, ainda não chegou`);
        continue;
      }

      const contentDirs = fs.readdirSync(dateDir)
        .map(d => path.join(dateDir, d))
        .filter(d => fs.statSync(d).isDirectory());

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

  let folders = [];

  if (folderFlag !== -1 && args[folderFlag + 1]) {
    folders = [path.resolve(args[folderFlag + 1])];

  } else if (dateFlag !== -1 && args[dateFlag + 1]) {
    folders = findPublishableFolders(args[dateFlag + 1]);
    console.log(`📋 ${folders.length} item(s) encontrado(s) para ${args[dateFlag + 1]}`);

  } else if (allFlag) {
    folders = findPublishableFolders();
    console.log(`📋 ${folders.length} item(s) prontos para publicar`);

  } else {
    console.log('Uso:');
    console.log('  node scripts/publish.js --folder ready-to-post/2026-05/2026-05-06/reel-01-relogio');
    console.log('  node scripts/publish.js --date 2026-05-06');
    console.log('  node scripts/publish.js --all');
    process.exit(1);
  }

  for (const folder of folders) {
    await publishFolder(folder).catch(err => {
      console.error(`  ✗ Erro em ${path.relative(READY_DIR, folder)}: ${err.message}`);
    });
  }

  console.log('\n✅ Publicação concluída!');
}

main();
