#!/usr/bin/env node
/**
 * record-reel.js — converte template de reel CSS animado em MP4
 *
 * Uso:
 *   node scripts/record-reel.js --template reel-01-relogio --vars data/reels/reel-01.json
 *   node scripts/record-reel.js --all          (processa data/reels-queue.json)
 *
 * Output: ready-to-post/[data]/[reel-id]/reel.mp4
 *
 * Estratégia: Puppeteer abre o HTML, pausa as animações via CSS
 * e faz screenshot de cada frame (30fps). ffmpeg monta o MP4.
 */

const puppeteer    = require('puppeteer');
const ffmpeg       = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const fs           = require('fs');
const path         = require('path');
const os           = require('os');

ffmpeg.setFfmpegPath(ffmpegStatic);

const ROOT      = path.resolve(__dirname, '..');
const TMPL_DIR  = path.join(ROOT, 'templates');
const READY_DIR = path.join(ROOT, 'ready-to-post');

// ── Config ───────────────────────────────────────────────────────────────────
const FPS    = 24;          // frames por segundo (24 = cinema feel, mais leve)
const WIDTH  = 1080;
const HEIGHT = 1920;

// Duração de cada reel (em segundos) — sincronizado com o CSS
const REEL_DURATIONS = {
  'reel-01-relogio':  8.0,
  'reel-02-contagem': 7.0,
  'reel-03-ticker':   6.5,
  'reel-04-split':    7.0,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function renderTemplate(templatePath, vars) {
  let html = fs.readFileSync(templatePath, 'utf8');
  for (const [key, value] of Object.entries(vars)) {
    const rendered = String(value ?? '').replace(/\\n/g, '<br>');
    html = html.replaceAll(`{{${key}}}`, rendered);
  }
  // Remove placeholders não preenchidos
  html = html.replace(/\{\{[^}]+\}\}/g, '');
  return html;
}

/**
 * Captura todos os frames de uma animação CSS.
 * Estratégia: pausa todas as animações e faz seek manual a cada frame.
 */
async function captureFrames(page, durationSec, fps, tmpDir) {
  const totalFrames = Math.ceil(durationSec * fps);
  const framePaths  = [];

  console.log(`  📷 Capturando ${totalFrames} frames a ${fps}fps...`);

  // Fase 1: lê e armazena os delays ORIGINAIS de cada elemento animado
  // (antes de qualquer modificação) em data-orig-delay.
  // O seek correto é: newDelay = originalDelay - currentTime
  // → elementos cujo originalDelay > currentTime ainda não começaram (delay positivo)
  // → elementos cujo originalDelay < currentTime estão em progresso (delay negativo)
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach(el => {
      const style = window.getComputedStyle(el);
      const dur   = style.animationDuration;
      if (dur && dur !== '0s') {
        // Pode ter múltiplas animações separadas por vírgula
        el.dataset.origDelay = style.animationDelay;
        el.style.animationPlayState = 'paused';
      }
    });
  });

  for (let i = 0; i < totalFrames; i++) {
    const currentTime = i / fps;

    // Fase 2: seek — para cada animação, new_delay = originalDelay - currentTime
    await page.evaluate((t) => {
      document.querySelectorAll('*').forEach(el => {
        if (el.dataset.origDelay === undefined) return;
        // Suporta múltiplas animações: "0.4s, 0.6s, 1.2s"
        const delays = el.dataset.origDelay.split(',').map(d => {
          const sec = parseFloat(d.trim()) || 0;
          return `${sec - t}s`;
        });
        el.style.animationDelay    = delays.join(', ');
        el.style.animationPlayState = 'paused';
      });
    }, currentTime);

    // Aguarda um tick de repaint
    await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));

    const framePath = path.join(tmpDir, `frame-${String(i).padStart(5, '0')}.png`);
    await page.screenshot({
      path:    framePath,
      type:    'png',
      clip:    { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });
    framePaths.push(framePath);

    if (i % 30 === 0) {
      process.stdout.write(`\r  ⏳ ${i}/${totalFrames} frames (${(currentTime).toFixed(1)}s)`);
    }
  }

  console.log(`\r  ✓ ${totalFrames} frames capturados                `);
  return framePaths;
}

/**
 * Compila frames PNG → MP4 com ffmpeg
 */
function compilarMP4(tmpDir, outPath, fps) {
  // ffmpeg não lida bem com caminhos Unicode no Windows — compila em temp e move depois
  const tmpOut = path.join(os.tmpdir(), `reel-record-${Date.now()}.mp4`);
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.join(tmpDir, 'frame-%05d.png'))
      .inputFPS(fps)
      .outputOptions([
        '-c:v libx264',
        '-preset fast',
        '-crf 18',
        '-pix_fmt yuv420p',
        '-movflags +faststart',
      ])
      .output(tmpOut)
      .on('progress', (p) => {
        if (p.percent) process.stdout.write(`\r  🎬 Compilando MP4: ${Math.round(p.percent)}%  `);
      })
      .on('end', () => {
        fs.renameSync(tmpOut, outPath);
        console.log(`\r  ✓ reel.mp4 → ${path.relative(ROOT, outPath)}         `);
        resolve();
      })
      .on('error', (err) => {
        if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
        reject(err);
      })
      .run();
  });
}

async function processReel(reelConfig) {
  const { id, date, template, vars, caption, hashtags } = reelConfig;

  const templatePath = path.join(TMPL_DIR, `${template}.html`);
  if (!fs.existsSync(templatePath)) {
    console.error(`  ✗ Template não encontrado: ${templatePath}`);
    return;
  }

  const duration  = REEL_DURATIONS[template] ?? 8.0;
  const month     = date.slice(0, 7);                        // "2026-05"
  const outDir    = path.join(READY_DIR, month, date, id);   // ready-to-post/2026-05/2026-05-06/reel-01-relogio
  fs.mkdirSync(outDir, { recursive: true });

  // Pula reels já publicados — evita duplicatas se o ciclo rodar novamente
  if (fs.existsSync(path.join(outDir, 'published.json'))) {
    console.log(`  ⏭  ${id} — já publicado, pulando regeneração`);
    return;
  }

  console.log(`\n🎬 Gerando ${id} (template: ${template}, ${duration}s)...`);

  // Renderiza HTML com variáveis
  const html = renderTemplate(templatePath, vars);
  const htmlPath = path.join(outDir, 'reel-preview.html');
  fs.writeFileSync(htmlPath, html);

  // Pasta temporária para frames
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `reel-${id}-`));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--font-render-hinting=none',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluateHandle('document.fonts.ready');

    // Captura frames
    const framePaths = await captureFrames(page, duration, FPS, tmpDir);
    await page.close();

    // Compila MP4
    const outPath = path.join(outDir, 'reel.mp4');
    await compilarMP4(tmpDir, outPath, FPS);

    // Salva cover.png — frame de capa para o feed grid do Instagram
    // Usa o frame em 60% da duração (geralmente a cena mais impactante / CTA)
    const coverFrameTime = duration * 0.6;
    const coverFrameIdx  = Math.floor(coverFrameTime * FPS);
    const coverSrcPath   = path.join(tmpDir, `frame-${String(coverFrameIdx).padStart(5, '0')}.png`);
    const coverDstPath   = path.join(outDir, 'cover.png');
    if (fs.existsSync(coverSrcPath)) {
      fs.copyFileSync(coverSrcPath, coverDstPath);
      console.log(`  🖼️  cover.png salvo (frame ${coverFrameIdx} @ ${coverFrameTime.toFixed(1)}s)`);
    }

    // Salva caption
    const captionContent = `${caption}\n\n${hashtags}`;
    fs.writeFileSync(path.join(outDir, 'caption.txt'), captionContent, 'utf8');

    // Salva metadados
    fs.writeFileSync(path.join(outDir, 'reel.json'), JSON.stringify(reelConfig, null, 2), 'utf8');

  } finally {
    await browser.close();
    // Limpa frames temporários
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args         = process.argv.slice(2);
  const templateFlag = args.indexOf('--template');
  const varsFlag     = args.indexOf('--vars');
  const allFlag      = args.includes('--all');

  let reels = [];

  if (allFlag) {
    const queuePath = path.join(ROOT, 'data', 'reels-queue.json');
    if (!fs.existsSync(queuePath)) {
      console.error('Nenhuma fila encontrada em data/reels-queue.json');
      process.exit(1);
    }
    reels = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
    console.log(`📋 Processando ${reels.length} reel(s) da fila...`);

  } else if (templateFlag !== -1) {
    const template = args[templateFlag + 1];
    const varsPath = varsFlag !== -1 ? args[varsFlag + 1] : null;
    const vars     = varsPath ? JSON.parse(fs.readFileSync(path.resolve(varsPath), 'utf8')) : {};

    reels = [{
      id:       `${template}-${Date.now()}`,
      date:     new Date().toISOString().split('T')[0],
      template,
      vars,
      caption:  vars.caption ?? '',
      hashtags: vars.hashtags ?? '#luizanacozinha',
    }];

  } else {
    console.error('Uso: node scripts/record-reel.js --template reel-01-relogio --vars data/reels/reel-01.json');
    console.error('       node scripts/record-reel.js --all');
    process.exit(1);
  }

  for (const reel of reels) {
    await processReel(reel).catch(err => {
      console.error(`Erro em ${reel.id}:`, err.message);
    });
  }

  console.log('\n✅ Todos os reels gerados!');
}

main();
