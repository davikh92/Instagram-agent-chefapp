#!/usr/bin/env node
/**
 * screenshot.js — converte HTML de post em PNGs via Puppeteer
 *
 * Uso:
 *   node scripts/screenshot.js --input templates/generated/post-01.json
 *   node scripts/screenshot.js --all            (processa toda a fila em data/queue.json)
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const READY_DIR = path.join(ROOT, 'ready-to-post');
const GENERATED_DIR = path.join(ROOT, 'templates', 'generated');

// Garante que as pastas existem
[READY_DIR, GENERATED_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

/**
 * Lê brand.json uma vez e retorna como objeto.
 */
function loadBrand() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'brand.json'), 'utf8'));
}

/**
 * Substitui todos os placeholders {{KEY}} no HTML pelo valor correspondente
 * vindo do objeto `vars`. Placeholders sem correspondência são removidos.
 */
function renderTemplate(templatePath, vars) {
  let html = fs.readFileSync(templatePath, 'utf8');
  for (const [key, value] of Object.entries(vars)) {
    // Converte \n em <br> para quebras de linha no HTML
    const rendered = String(value ?? '').replace(/\\n/g, '<br>');
    html = html.replaceAll(`{{${key}}}`, rendered);
  }
  // Remove placeholders não preenchidos (mesmo comportamento do record-reel.js)
  html = html.replace(/\{\{[^}]+\}\}/g, '');
  return html;
}

/**
 * Gera a barra de progresso HTML para o dark-carousel.
 * @param {number} slideIndex  - índice 0-based do slide atual
 * @param {number} total       - total de slides
 */
function buildProgressHTML(slideIndex, total) {
  return Array.from({ length: total }, (_, i) => {
    const cls = i < slideIndex ? 'done' : i === slideIndex ? 'current' : '';
    return `<div class="seg ${cls}"></div>`;
  }).join('');
}

/**
 * Injeta variáveis automáticas que todos os templates dark-carousel precisam
 * mas que não precisam ser especificadas manualmente no queue.json.
 */
function injectAutoVars(slideVars, slideIndex, totalSlides) {
  return {
    // Defaults do dark-carousel
    BG_COLOR:       '#1E1810',
    BG_NUMBER_SIZE: '480',
    BG_NUMBER:      String(slideIndex + 1),
    SCENE_NUM:      String(slideIndex + 1),
    LABEL:          'Luiza na Cozinha',
    BODY_BOTTOM:    '200',
    SUBHEADLINE:    '',
    BODY:           '',
    BTN_LABEL:      '',
    SWIPE_LABEL:    '',
    BADGE_TOP:      '',
    BADGE_BIG:      '',
    BADGE_BOTTOM:   '',
    // Progress bar HTML
    PROGRESS_HTML:  buildProgressHTML(slideIndex, totalSlides),
    // big-number defaults
    LIVE_LABEL:     'Luiza na Cozinha',
    STAT_LABEL:     '',
    SUFFIX:         '',
    SOURCE:         '',
    NUMBER_LABEL:   '',
    // hero-terracota defaults
    STAMP:          '',
    STAMP_TOP:      '420',
    // cream-editorial / lista-steps
    FOOTER_RIGHT:   '',
    ANNOTATION:     '',
    NUMBER:         '',
    CTA:            '',
    STEP_NUM:       '',
    // Sobrescreve com os vars reais do slide (tem prioridade)
    ...slideVars,
  };
}

/**
 * Tira screenshot de um HTML string e salva como PNG.
 * @param {string} html      - HTML completo do slide
 * @param {string} outPath   - caminho de saída do PNG
 * @param {object} dims      - { width, height }
 * @param {object} browser   - instância Puppeteer já aberta
 */
async function screenshotSlide(html, outPath, dims, browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: dims.width, height: dims.height, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
  // Aguarda fontes do Google Fonts carregarem
  await page.evaluateHandle('document.fonts.ready');
  await page.screenshot({ path: outPath, type: 'png', clip: { x: 0, y: 0, ...dims } });
  await page.close();
  console.log(`  ✓ ${path.relative(ROOT, outPath)}`);
}

/**
 * Processa um post completo — pode ter 1 ou N slides.
 *
 * Estrutura esperada do postConfig JSON:
 * {
 *   "id": "post-01",
 *   "date": "2026-05-05",
 *   "template": "dark-carousel",        // nome do arquivo em templates/
 *   "dimension": "square",              // square | vertical | story
 *   "caption": "Texto da caption...",
 *   "hashtags": "#tag1 #tag2 ...",
 *   "slides": [
 *     { "HEADLINE": "Texto", "EMOJI": "😅", "SLIDE_NUM": "01", ... },
 *     { ... }
 *   ]
 * }
 */
async function processPost(postConfig, browser) {
  const brand = loadBrand();
  const dims = brand.dimensions[postConfig.dimension] ?? brand.dimensions.square;
  const templateFile = path.join(ROOT, 'templates', `${postConfig.template}.html`);

  if (!fs.existsSync(templateFile)) {
    console.error(`  ✗ Template não encontrado: ${templateFile}`);
    return;
  }

  // Pasta de saída: ready-to-post/[YYYY-MM]/[data]/[post-id]/
  const month  = postConfig.date.slice(0, 7);
  const outDir = path.join(READY_DIR, month, postConfig.date, postConfig.id);
  fs.mkdirSync(outDir, { recursive: true });

  // Pula posts já publicados — evita duplicatas se o ciclo rodar novamente
  if (fs.existsSync(path.join(outDir, 'published.json'))) {
    console.log(`  ⏭  ${postConfig.id} — já publicado, pulando regeneração`);
    return;
  }

  console.log(`\n📸 Gerando ${postConfig.id} (${postConfig.slides.length} slide(s))...`);

  // Gera cada slide
  for (let i = 0; i < postConfig.slides.length; i++) {
    const slideVars = injectAutoVars(
      {
        HEIGHT: dims.height,
        HEADLINE_SIZE: postConfig.headline_size ?? 72,
        TOTAL_SLIDES: postConfig.slides.length,
        ...postConfig.slides[i],
      },
      i,
      postConfig.slides.length
    );

    const html = renderTemplate(templateFile, slideVars);
    const slideNum = String(i + 1).padStart(2, '0');
    const outPath = path.join(outDir, `slide-${slideNum}.png`);

    // Salva o HTML gerado para debug
    fs.writeFileSync(path.join(GENERATED_DIR, `${postConfig.id}-slide-${slideNum}.html`), html);

    await screenshotSlide(html, outPath, dims, browser);
  }

  // Salva caption.txt
  const captionPath = path.join(outDir, 'caption.txt');
  const captionContent = `${postConfig.caption}\n\n${postConfig.hashtags}`;
  fs.writeFileSync(captionPath, captionContent, 'utf8');
  console.log(`  ✓ caption.txt salvo`);

  // Salva metadados do post
  fs.writeFileSync(
    path.join(outDir, 'post.json'),
    JSON.stringify(postConfig, null, 2),
    'utf8'
  );
}

/**
 * Ponto de entrada principal
 */
async function main() {
  const args = process.argv.slice(2);
  const inputFlag = args.indexOf('--input');
  const allFlag = args.includes('--all');

  let posts = [];

  if (allFlag) {
    const queuePath = path.join(ROOT, 'data', 'queue.json');
    if (!fs.existsSync(queuePath)) {
      console.error('Nenhuma fila encontrada em data/queue.json');
      process.exit(1);
    }
    posts = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
    console.log(`📋 Processando ${posts.length} post(s) da fila...`);
  } else if (inputFlag !== -1 && args[inputFlag + 1]) {
    const inputPath = path.resolve(args[inputFlag + 1]);
    posts = [JSON.parse(fs.readFileSync(inputPath, 'utf8'))];
  } else {
    console.error('Uso: node scripts/screenshot.js --input <post.json>');
    console.error('       node scripts/screenshot.js --all');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  try {
    for (const post of posts) {
      await processPost(post, browser);
    }
    console.log('\n✅ Todos os posts gerados em ready-to-post/');
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
