// Foto de perfil com FUNDO FOTOGRÁFICO + wordmark por cima (1080x1080).
// Uso (da raiz do projeto): node avatar-foto.js <pasta-de-saida>
const fs = require('fs');
const path = require('path');
const req = (m) => require(path.join(process.cwd(), 'node_modules', m));
req('dotenv').config();
const puppeteer = req('puppeteer');

const OUT = process.argv[2];
const CACHE = path.join(OUT, 'fundos');
fs.mkdirSync(CACHE, { recursive: true });

const { GOOGLE_API_KEY } = process.env;
if (!GOOGLE_API_KEY) { console.error('❌ GOOGLE_API_KEY não encontrada'); process.exit(1); }

const MODEL = 'gemini-3.1-flash-image';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

const SEM_TEXTO = 'Absolutely no text, no letters, no words, no writing, no logos anywhere in the image.';

// Fundos: direção de arte do brand.json, composição com centro respirável
// (o wordmark vive no meio, então o "assunto" da foto fica nas bordas)
const FUNDOS = {
  ervas: `Overhead shot of a dark worn wooden table, fresh herbs, cherry tomatoes, garlic cloves and a linen cloth scattered around the OUTER EDGES of the frame leaving the center empty and dark, dramatic single-source side lighting, warm golden 3800K, deep shadows, film photography grain, muted palette with vibrant red tomato accents, 4K. ${SEM_TEXTO}`,
  vapor: `Extreme close-up of golden steam rising off a dark cast-iron pan against a near-black background, strong backlight making the vapor glow, warm 3800K, deep shadows filling most of the frame, film photography grain, 4K. ${SEM_TEXTO}`,
  farinha: `A dark worn wooden kitchen counter dusted with flour, a few scattered grains and a soft cloth at the edges, center of the frame calm and empty, dramatic raking side light from one window, deep shadows, warm tones, film photography grain, 4K. ${SEM_TEXTO}`,
  bowls: `Overhead of small rustic ceramic bowls of everyday Brazilian food arranged in a ring around the OUTER EDGE of a dark wooden table, the center of the table empty and dark, dramatic single-source light, deep shadows, steam catching the backlight, film photography grain, one vibrant red element, 4K. ${SEM_TEXTO}`,
};

async function gerarFundo(nome, prompt) {
  const arq = path.join(CACHE, `${nome}.png`);
  if (fs.existsSync(arq)) { console.log(`· fundo ${nome} reaproveitado`); return arq; }

  const r = await fetch(`${BASE_URL}/models/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '1:1' } },
    }),
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`API ${r.status}: ${txt.substring(0, 200)}`);
  const b64 = JSON.parse(txt)?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
  if (!b64) throw new Error(`sem imagem: ${txt.substring(0, 200)}`);
  fs.writeFileSync(arq, Buffer.from(b64, 'base64'));
  console.log(`✓ fundo ${nome}`);
  return arq;
}

const CREME = '#F7F2EA';
const TERRACOTA = '#C8572A';

// tratamento: 'natural' (só escurece) | 'lavagem' (duotone terracota)
function compor(bgB64, { tratamento, wordmarkSize = 176, selo }) {
  const lavagem = tratamento === 'lavagem'
    ? `<div class="wash"></div><div class="wash2"></div>`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1080px;position:relative;overflow:hidden;background:#1E1810}
.bg{position:absolute;inset:0;background-image:url("data:image/png;base64,${bgB64}");
  background-size:cover;background-position:center;
  ${tratamento === 'lavagem' ? 'filter:grayscale(1) contrast(1.15) brightness(.95);' : 'filter:contrast(1.05);'}}
.wash{position:absolute;inset:0;background:${TERRACOTA};mix-blend-mode:multiply;opacity:.92}
.wash2{position:absolute;inset:0;background:${TERRACOTA};mix-blend-mode:color;opacity:.6}
/* vinheta radial: guarda o miolo pro texto e escurece a borda que o círculo corta */
.vinheta{position:absolute;inset:0;background:
  radial-gradient(circle at 50% 48%, rgba(19,16,13,.80) 0%, rgba(19,16,13,.62) 42%, rgba(19,16,13,.34) 68%, rgba(19,16,13,.62) 100%)}
.grao{position:absolute;inset:0;opacity:.5;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='11'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.13 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.miolo{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center;padding:0 110px}
.mark{font-family:'Bebas Neue',sans-serif;font-size:${wordmarkSize}px;line-height:.86;
  color:${CREME};letter-spacing:.02em;text-shadow:0 4px 34px rgba(0,0,0,.6)}
.selo{font-family:'DM Mono',monospace;font-size:26px;letter-spacing:.34em;text-transform:uppercase;
  color:rgba(247,242,234,.8);margin-top:30px}
.risco{width:120px;height:3px;background:${CREME};opacity:.85;margin:34px auto 0;border-radius:2px}
</style></head><body>
<div class="bg"></div>${lavagem}<div class="vinheta"></div><div class="grao"></div>
<div class="miolo">
  <div class="mark">TEM NA<br>SEMANA</div>
  ${selo ? `<div class="selo">${selo}</div>` : '<div class="risco"></div>'}
</div></body></html>`;
}

(async () => {
  const fundos = {};
  for (const [nome, prompt] of Object.entries(FUNDOS)) {
    fundos[nome] = fs.readFileSync(await gerarFundo(nome, prompt)).toString('base64');
  }

  const VARIANTES = {
    'f1-ervas-natural': compor(fundos.ervas, { tratamento: 'natural' }),
    'f2-ervas-lavagem': compor(fundos.ervas, { tratamento: 'lavagem' }),
    'f3-vapor-natural': compor(fundos.vapor, { tratamento: 'natural', selo: 'cardápios' }),
    'f4-farinha-lavagem': compor(fundos.farinha, { tratamento: 'lavagem' }),
    'f5-bowls-natural': compor(fundos.bowls, { tratamento: 'natural' }),
    'f6-bowls-lavagem': compor(fundos.bowls, { tratamento: 'lavagem', selo: 'cardápios' }),
  };

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });

  const nomes = [];
  for (const [nome, html] of Object.entries(VARIANTES)) {
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluateHandle('document.fonts.ready');
    await page.screenshot({ path: path.join(OUT, `${nome}.png`), type: 'png' });
    console.log(`✓ ${nome}.png`);
    nomes.push(nome);
  }

  const cartoes = nomes.map((n) => {
    const b64 = fs.readFileSync(path.join(OUT, `${n}.png`)).toString('base64');
    return `<div class="col">
      <img class="g" src="data:image/png;base64,${b64}">
      <div class="l"><img class="m" src="data:image/png;base64,${b64}"><img class="p" src="data:image/png;base64,${b64}"></div>
      <div class="r">${n}</div></div>`;
  }).join('');

  const prova = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{background:#111;margin:0;padding:36px;display:flex;flex-wrap:wrap;gap:30px;justify-content:center;width:1200px}
    .col{text-align:center}img{border-radius:50%;display:block}
    .g{width:215px;height:215px}
    .l{display:flex;gap:18px;align-items:center;justify-content:center;margin-top:18px}
    .m{width:100px;height:100px}.p{width:32px;height:32px}
    .r{color:#999;font-size:12px;margin-top:12px;font-family:ui-monospace,monospace}
  </style></head><body>${cartoes}</body></html>`;

  await page.setViewport({ width: 1200, height: 820, deviceScaleFactor: 2 });
  await page.setContent(prova, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT, 'PROVA-foto.png'), type: 'png' });
  console.log('✓ PROVA-foto.png');
  await browser.close();
})();
