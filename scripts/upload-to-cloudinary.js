#!/usr/bin/env node
/**
 * upload-to-cloudinary.js
 * Faz upload de reels.mp4 locais para o Cloudinary e salva cloudinaryUrl no reel.json.
 * Execução única — necessária quando os vídeos foram gerados antes da integração Cloudinary.
 *
 * Uso: node scripts/upload-to-cloudinary.js
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

let cloudinary;
try {
  cloudinary = require('cloudinary').v2;
} catch {
  console.error('❌ npm install cloudinary');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const READY_DIR = path.resolve(__dirname, '..', 'ready-to-post');

async function findReelsWithoutCloudinary(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (!entry.isDirectory()) continue;

    const reelJson   = path.join(full, 'reel.json');
    const reelMp4    = path.join(full, 'reel.mp4');
    const publishedJ = path.join(full, 'published.json');

    if (fs.existsSync(reelJson) && fs.existsSync(reelMp4) && !fs.existsSync(publishedJ)) {
      const reel = JSON.parse(fs.readFileSync(reelJson, 'utf8').replace(/^﻿/, ''));
      if (!reel.cloudinaryUrl) {
        results.push({ dir: full, reelJson, reelMp4, reel });
      }
    } else {
      findReelsWithoutCloudinary(full, results);
    }
  }
  return results;
}

async function uploadReel(entry) {
  const id       = path.basename(entry.dir);
  const coverPng = path.join(entry.dir, 'cover.png');

  console.log(`\n📤 ${id}`);

  // Upload do vídeo
  console.log('  ☁️  Subindo reel.mp4...');
  const videoResult = await cloudinary.uploader.upload(entry.reelMp4, {
    resource_type: 'video',
    public_id:     `luiza-generated/veo/${id}`,
    overwrite:     true,
  });
  console.log(`  ✓ ${videoResult.secure_url}`);

  let coverUrl = null;
  if (fs.existsSync(coverPng)) {
    console.log('  ☁️  Subindo cover.png...');
    const coverResult = await cloudinary.uploader.upload(coverPng, {
      resource_type: 'image',
      public_id:     `luiza-generated/covers/${id}-cover`,
      overwrite:     true,
    });
    coverUrl = coverResult.secure_url;
    console.log(`  ✓ ${coverUrl}`);
  }

  // Atualiza reel.json com as URLs
  const updatedReel = JSON.parse(fs.readFileSync(entry.reelJson, 'utf8').replace(/^﻿/, ''));
  const updated = {
    ...updatedReel,
    cloudinaryUrl:       videoResult.secure_url,
    cloudinaryPublicId:  videoResult.public_id,
    ...(coverUrl ? { cloudinaryCoverUrl: coverUrl } : {}),
  };
  fs.writeFileSync(entry.reelJson, JSON.stringify(updated, null, 2), 'utf8');
  console.log('  ✓ reel.json atualizado');
}

async function main() {
  console.log('🔍 Buscando reels com mp4 local sem cloudinaryUrl...\n');
  const reels = await findReelsWithoutCloudinary(READY_DIR);

  if (!reels.length) {
    console.log('✅ Nenhum reel pendente de upload.');
    return;
  }

  console.log(`📋 ${reels.length} reel(s) para subir:\n`);
  reels.forEach(r => console.log(`  - ${path.relative(READY_DIR, r.dir)}`));

  for (const entry of reels) {
    try {
      await uploadReel(entry);
    } catch (e) {
      console.error(`  ❌ Erro em ${path.basename(entry.dir)}: ${e.message}`);
    }
  }

  console.log('\n✅ Upload concluído! Faça git add + commit + push para ativar publicação.');
}

main();
