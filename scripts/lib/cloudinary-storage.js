/**
 * cloudinary-storage.js — storage permanente de mídia no Cloudinary
 *
 * Usado por generate-veo.js e generate-image.js para armazenar mídia gerada
 * de forma persistente entre gerações e publicações.
 *
 * Necessário para GitHub Actions (sem disco persistente entre jobs):
 *   Reel gerado no dia 1 → URL no Cloudinary → publicado nos dias seguintes.
 *
 * Também acelera o publish.js localmente: evita re-upload de arquivos já
 * hospedados no Cloudinary (a URL do reel.json é usada diretamente).
 *
 * Estrutura no Cloudinary:
 *   luiza-generated/veo/<id>          → vídeo MP4
 *   luiza-generated/covers/<id>-cover → capa PNG para o feed grid
 *   luiza-generated/images/<id>       → imagem Imagen 4 (posts de domingo)
 *   luiza-generated/images/<id>-slide-NN → slides de carrossel
 */

require('dotenv').config();
const fs = require('fs');

let _cloudinary = null;

function getCloudinary() {
  if (_cloudinary) return _cloudinary;

  const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
  } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return null; // não configurado — graceful degradation
  }

  _cloudinary = require('cloudinary').v2;
  _cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key:    CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  return _cloudinary;
}

// ── Upload de Reel (MP4 + cover opcional) ─────────────────────────────────────

/**
 * Sobe o vídeo MP4 e, opcionalmente, a cover.png para Cloudinary.
 *
 * @param {string} id         - ID do reel (ex: 'reel-food-07-limao')
 * @param {string} mp4Path    - Caminho local do arquivo MP4
 * @param {string|null} coverPath - Caminho local do cover.png (opcional)
 * @returns {{ cloudinaryUrl, cloudinaryPublicId, cloudinaryCoverUrl? } | null}
 */
async function uploadReel(id, mp4Path, coverPath = null) {
  const cld = getCloudinary();
  if (!cld) return null;

  const result = {};

  // Vídeo principal
  console.log(`  ☁️  Cloudinary: subindo vídeo (${(fs.statSync(mp4Path).size / 1024 / 1024).toFixed(1)} MB)...`);
  const videoResult = await cld.uploader.upload(mp4Path, {
    resource_type: 'video',
    folder:        'luiza-generated/veo',
    public_id:     id,
    overwrite:     true,
  });
  result.cloudinaryUrl      = videoResult.secure_url;
  result.cloudinaryPublicId = videoResult.public_id;
  console.log(`  ✓ Vídeo: ${videoResult.secure_url}`);

  // Cover (capa para o feed grid do Instagram)
  if (coverPath && fs.existsSync(coverPath)) {
    const coverResult = await cld.uploader.upload(coverPath, {
      resource_type: 'image',
      folder:        'luiza-generated/covers',
      public_id:     id + '-cover',
      overwrite:     true,
    });
    result.cloudinaryCoverUrl = coverResult.secure_url;
    console.log(`  ✓ Cover: ${coverResult.secure_url}`);
  }

  return result;
}

// ── Upload de Imagem estática (post único) ────────────────────────────────────

/**
 * Sobe uma imagem PNG/JPG para Cloudinary.
 *
 * @param {string} id        - ID do post (ex: 'post-domingo-07jun')
 * @param {string} imagePath - Caminho local do arquivo PNG/JPG
 * @returns {{ cloudinaryUrl, cloudinaryPublicId } | null}
 */
async function uploadImage(id, imagePath) {
  const cld = getCloudinary();
  if (!cld) return null;

  console.log(`  ☁️  Cloudinary: subindo imagem...`);
  const r = await cld.uploader.upload(imagePath, {
    resource_type: 'image',
    folder:        'luiza-generated/images',
    public_id:     id,
    overwrite:     true,
  });
  console.log(`  ✓ Imagem: ${r.secure_url}`);

  return { cloudinaryUrl: r.secure_url, cloudinaryPublicId: r.public_id };
}

// ── Upload de Slides (carrossel) ──────────────────────────────────────────────

/**
 * Sobe múltiplos slides para Cloudinary.
 *
 * @param {string}   id         - ID base do post
 * @param {string[]} slidePaths - Array de caminhos de arquivos PNG/JPG
 * @returns {Array<{ cloudinaryUrl, cloudinaryPublicId }> | null}
 */
async function uploadSlides(id, slidePaths) {
  const cld = getCloudinary();
  if (!cld) return null;

  const results = [];
  for (let i = 0; i < slidePaths.length; i++) {
    const slideId = `${id}-slide-${String(i + 1).padStart(2, '0')}`;
    console.log(`  ☁️  Cloudinary: slide ${i + 1}/${slidePaths.length}...`);
    const r = await cld.uploader.upload(slidePaths[i], {
      resource_type: 'image',
      folder:        'luiza-generated/images',
      public_id:     slideId,
      overwrite:     true,
    });
    results.push({ cloudinaryUrl: r.secure_url, cloudinaryPublicId: r.public_id });
  }

  return results;
}

module.exports = { uploadReel, uploadImage, uploadSlides };
