// Gera variantes de foto de perfil (1080x1080) + prévia recortada em círculo.
// Uso: node gera-avatar.js <pasta-de-saida>
const fs = require('fs');
const path = require('path');
// script mora no scratchpad: resolve o puppeteer no node_modules do projeto
const puppeteer = require(path.join(process.cwd(), 'node_modules', 'puppeteer'));

const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

// Paleta e fontes do brand.json
const C = {
  terracota: '#C8572A',
  terracotaDark: '#9E3D18',
  creme: '#F7F2EA',
  charcoal: '#1E1810',
  gold: '#C49A3C',
};

const GRAO = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='11'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.12 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

// A "semana": 7 marcas, a última cheia — o dia resolvido
const semana = (cor, ativa) => `<div class="semana">${
  Array.from({ length: 7 }, (_, i) =>
    `<span style="background:${i === 6 ? ativa : cor};${i === 6 ? 'width:52px;border-radius:26px;' : ''}"></span>`).join('')
}</div>`;

const base = (corpo, fundo) => `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital,wght@0,900;1,400&family=DM+Mono:wght@400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1080px;position:relative;overflow:hidden;background:${fundo};
  display:flex;align-items:center;justify-content:center;text-align:center}
.grao{position:absolute;inset:0;opacity:.55;mix-blend-mode:overlay;background-image:${GRAO}}
.miolo{position:relative;z-index:2;padding:0 90px}
.semana{display:flex;gap:16px;justify-content:center;align-items:center;margin-bottom:52px}
.semana span{width:26px;height:26px;border-radius:50%;display:block}
.bebas{font-family:'Bebas Neue',sans-serif;line-height:.88;letter-spacing:.01em}
.playfair{font-family:'Playfair Display',serif;font-weight:900;line-height:.92;letter-spacing:-.02em}
.mono{font-family:'DM Mono',monospace;letter-spacing:.3em;text-transform:uppercase}
</style></head><body><div class="grao"></div><div class="miolo">${corpo}</div></body></html>`;

const VARIANTES = {
  // 1 — Wordmark em Bebas sobre terracota: máximo contraste no feed
  'a-wordmark-terracota': base(`
    ${semana('rgba(247,242,234,.45)', C.creme)}
    <div class="bebas" style="font-size:210px;color:${C.creme}">TEM NA<br>SEMANA</div>`,
    `radial-gradient(circle at 30% 25%, ${C.terracota} 0%, ${C.terracotaDark} 100%)`),

  // 2 — Wordmark creme, terracota no texto: mais claro, ar editorial
  'b-wordmark-creme': base(`
    ${semana('rgba(200,87,42,.32)', C.terracota)}
    <div class="bebas" style="font-size:210px;color:${C.terracota}">TEM NA<br>SEMANA</div>`,
    C.creme),

  // 3 — Monograma: legível até em 32px
  'c-monograma': base(`
    <div class="playfair" style="font-size:430px;color:${C.creme}">TnS</div>
    <div class="mono" style="font-size:34px;color:rgba(247,242,234,.72);margin-top:34px">tem na semana</div>`,
    `radial-gradient(circle at 30% 25%, ${C.terracota} 0%, ${C.terracotaDark} 100%)`),

  // 4 — Escuro com a semana em destaque
  'd-charcoal': base(`
    ${semana('rgba(247,242,234,.30)', C.gold)}
    <div class="bebas" style="font-size:210px;color:${C.creme}">TEM NA<br>SEMANA</div>`,
    `radial-gradient(circle at 35% 20%, #2A231A 0%, ${C.charcoal} 100%)`),
};

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });

  const nomes = [];
  for (const [nome, html] of Object.entries(VARIANTES)) {
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluateHandle('document.fonts.ready');
    const arquivo = path.join(OUT, `${nome}.png`);
    await page.screenshot({ path: arquivo, type: 'png' });
    console.log(`✓ ${nome}.png`);
    nomes.push(nome);
  }

  // Prova real: as 4 recortadas em círculo, no tamanho em que aparecem de verdade
  const cartoes = nomes.map((n) => {
    const b64 = fs.readFileSync(path.join(OUT, `${n}.png`)).toString('base64');
    return `<div class="col">
      <img class="grande" src="data:image/png;base64,${b64}">
      <div class="linha">
        <img class="med" src="data:image/png;base64,${b64}">
        <img class="peq" src="data:image/png;base64,${b64}">
      </div>
      <div class="rot">${n}</div>
    </div>`;
  }).join('');

  const prova = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{background:#111;margin:0;padding:40px;font-family:system-ui;display:flex;gap:38px;justify-content:center}
    .col{text-align:center}
    img{border-radius:50%;display:block}
    .grande{width:230px;height:230px}
    .linha{display:flex;gap:20px;align-items:center;justify-content:center;margin-top:22px}
    .med{width:110px;height:110px}
    .peq{width:32px;height:32px}
    .rot{color:#999;font-size:13px;margin-top:16px;font-family:ui-monospace,monospace}
  </style></head><body>${cartoes}</body></html>`;

  await page.setViewport({ width: 1180, height: 470, deviceScaleFactor: 2 });
  await page.setContent(prova, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT, 'PROVA-circulo.png'), type: 'png' });
  console.log('✓ PROVA-circulo.png (230px · 110px real do perfil · 32px do feed)');

  await browser.close();
})();
