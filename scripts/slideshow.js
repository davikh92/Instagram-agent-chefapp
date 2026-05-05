#!/usr/bin/env node
/**
 * slideshow.js — converte PNGs de carrossel em MP4 (Reel Tipo 3)
 *
 * Uso:
 *   node scripts/slideshow.js --post ready-to-post/2026-05-05/post-01
 *   node scripts/slideshow.js --all          (processa toda fila em data/queue.json)
 *
 * Output: ready-to-post/[data]/[post-id]/reel.mp4
 *
 * Cada slide dura SLIDE_DURATION segundos.
 * Transição crossfade de FADE_DURATION segundos entre slides.
 * Fundo preto nos primeiros/últimos frames (opcional).
 */

const ffmpeg       = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const fs           = require('fs');
const path         = require('path');
const { glob }     = require('fs');

ffmpeg.setFfmpegPath(ffmpegStatic);

const ROOT         = path.resolve(__dirname, '..');
const READY_DIR    = path.join(ROOT, 'ready-to-post');

// ── Configurações ────────────────────────────────────────────────────────────
const SLIDE_DURATION = 2.5;   // segundos por slide
const FADE_DURATION  = 0.4;   // segundos do crossfade entre slides
const FPS            = 30;    // frames por segundo
const WIDTH          = 1080;
const HEIGHT         = 1080;  // 1080 = square | 1350 = vertical

// ── Helpers ──────────────────────────────────────────────────────────────────

function getPNGs(postDir) {
  return fs.readdirSync(postDir)
    .filter(f => f.match(/^slide-\d+\.png$/))
    .sort()
    .map(f => path.join(postDir, f));
}

/**
 * Monta o filtro ffmpeg para slideshow com crossfade entre slides.
 * Usa filtergraph xfade para transições suaves.
 */
function buildXfadeFilter(pngs, slideDur, fadeDur) {
  const n = pngs.length;
  if (n === 1) return { inputs: '[0:v]', filter: '', output: '[v]' };

  // Cada input precisa de um loop para durar slideDur segundos
  let filterParts = [];
  let lastLabel = '[v0]';

  // Setup: para cada input, criar um stream com fps e scale corretos
  for (let i = 0; i < n; i++) {
    filterParts.push(
      `[${i}:v]fps=${FPS},scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,` +
      `pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2,` +
      `loop=${Math.ceil(slideDur * FPS)}:${Math.ceil(slideDur * FPS)}:0[vs${i}]`
    );
  }

  // Chain xfades
  for (let i = 0; i < n - 1; i++) {
    const offset = (i + 1) * slideDur - fadeDur;
    const inA = i === 0 ? `[vs${i}]` : `[xf${i - 1}]`;
    const inB = `[vs${i + 1}]`;
    const out = i === n - 2 ? '[v]' : `[xf${i}]`;
    filterParts.push(
      `${inA}${inB}xfade=transition=fade:duration=${fadeDur}:offset=${offset}${out}`
    );
  }

  return {
    inputs: pngs.map((_, i) => `[${i}:v]`).join(''),
    filter: filterParts.join(';'),
    output: '[v]'
  };
}

async function makeSlideshowMP4(postDir) {
  const pngs = getPNGs(postDir);
  if (pngs.length === 0) {
    console.log(`  ✗ Nenhum slide PNG encontrado em ${postDir}`);
    return;
  }

  const postId  = path.basename(postDir);
  const outPath = path.join(postDir, 'reel.mp4');
  console.log(`\n🎬 Gerando reel.mp4 para ${postId} (${pngs.length} slides)...`);

  return new Promise((resolve, reject) => {
    const cmd = ffmpeg();

    // Adiciona cada PNG como input com duração
    pngs.forEach(png => {
      cmd.input(png).inputOptions([`-loop 1`, `-t ${SLIDE_DURATION}`]);
    });

    // Filtros: scale + pad + xfade
    const n = pngs.length;
    const filterParts = [];

    pngs.forEach((_, i) => {
      filterParts.push(
        `[${i}:v]fps=${FPS},` +
        `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,` +
        `pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2,` +
        `setsar=1[vs${i}]`
      );
    });

    if (n === 1) {
      filterParts.push(`[vs0]copy[v]`);
    } else {
      for (let i = 0; i < n - 1; i++) {
        const offset = parseFloat(((i + 1) * SLIDE_DURATION - FADE_DURATION).toFixed(3));
        const inA = i === 0 ? `[vs0]` : `[xf${i - 1}]`;
        const inB = `[vs${i + 1}]`;
        const out = i === n - 2 ? `[v]` : `[xf${i}]`;
        filterParts.push(
          `${inA}${inB}xfade=transition=fade:duration=${FADE_DURATION}:offset=${offset}${out}`
        );
      }
    }

    cmd
      .complexFilter(filterParts.join(';'), 'v')
      .outputOptions([
        '-map [v]',
        '-c:v libx264',
        '-preset fast',
        '-crf 18',
        '-pix_fmt yuv420p',
        `-t ${n * SLIDE_DURATION}`,
        '-movflags +faststart',
      ])
      .output(outPath)
      .on('start', (cmdLine) => {
        if (process.env.DEBUG) console.log('  ffmpeg:', cmdLine);
      })
      .on('progress', (p) => {
        if (p.percent) process.stdout.write(`\r  ⏳ ${Math.round(p.percent)}%  `);
      })
      .on('end', () => {
        console.log(`\r  ✓ reel.mp4 → ${path.relative(ROOT, outPath)}`);
        resolve(outPath);
      })
      .on('error', (err) => {
        console.error(`\r  ✗ Erro: ${err.message}`);
        reject(err);
      })
      .run();
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args      = process.argv.slice(2);
  const postFlag  = args.indexOf('--post');
  const allFlag   = args.includes('--all');

  let dirs = [];

  if (postFlag !== -1 && args[postFlag + 1]) {
    dirs = [path.resolve(args[postFlag + 1])];

  } else if (allFlag) {
    // Processa todos os posts em ready-to-post/ que tenham slides mas não tenham reel.mp4
    const dateDirs = fs.readdirSync(READY_DIR).map(d => path.join(READY_DIR, d));
    for (const dateDir of dateDirs) {
      if (!fs.statSync(dateDir).isDirectory()) continue;
      const postDirs = fs.readdirSync(dateDir).map(d => path.join(dateDir, d));
      for (const postDir of postDirs) {
        if (!fs.statSync(postDir).isDirectory()) continue;
        const hasPNGs = fs.readdirSync(postDir).some(f => f.match(/^slide-\d+\.png$/));
        const hasMP4  = fs.existsSync(path.join(postDir, 'reel.mp4'));
        if (hasPNGs && !hasMP4) dirs.push(postDir);
      }
    }
    console.log(`📋 ${dirs.length} post(s) sem reel.mp4 encontrado(s).`);

  } else {
    console.error('Uso: node scripts/slideshow.js --post <pasta-do-post>');
    console.error('       node scripts/slideshow.js --all');
    process.exit(1);
  }

  for (const dir of dirs) {
    await makeSlideshowMP4(dir).catch(err => {
      console.error(`Erro em ${dir}:`, err.message);
    });
  }

  console.log('\n✅ Pronto!');
}

main();
