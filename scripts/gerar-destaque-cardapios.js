#!/usr/bin/env node
/**
 * gerar-destaque-cardapios.js — as 7 stories do destaque "Cardápios".
 *
 * Uso:
 *   node scripts/gerar-destaque-cardapios.js
 *   node scripts/gerar-destaque-cardapios.js --saida assets/destaques/cardapios
 *
 * Custo ZERO de API: o fundo de cada story é a capa do post `cd-XX` que já foi
 * gerado para aquele cardápio — o que também deixa a story visualmente irmã do
 * post. Só a tipografia é composta por cima, via Puppeteer.
 *
 * Todo o texto sai de `data/product-context.json` (bloco `atual.cardapios_da_casa`):
 * nome, subtítulo, ficha, público-alvo e benefícios são escritos pelo time do app.
 * Se um cardápio mudar lá, é só rodar de novo — nada aqui é digitado à mão.
 *
 * As stories são publicadas MANUALMENTE pelo Davi, porque o adesivo de link
 * (que leva ao cardápio) não existe na API — só no aplicativo.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const log = require('./lib/logger');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE = path.join(ROOT, 'templates', 'story-cardapio.html');
const CONTEXTO = path.join(ROOT, 'data', 'product-context.json');
const READY_DIR = path.join(ROOT, 'ready-to-post');

// Qual post deu origem a cada cardápio — é de lá que vem a capa de fundo.
// cd-08..13 são segundos ângulos dos mesmos 7, por isso não entram.
const CAPA_DE = {
  'detox-pos-festa': 'cd-01',
  'emagrecimento-consciente': 'cd-02',
  'massa-e-forca': 'cd-03',
  'pele-e-intestino': 'cd-04',
  'vegetariano-pratico': 'cd-05',
  'foco-e-energia': 'cd-06',
  'low-carb-mediterraneo': 'cd-07',
};

// Acento por categoria — dentro da paleta do brand.json
const ACENTO = {
  Detox: '#8FAF91',
  Emagrecimento: '#E8784F',
  Fitness: '#E8784F',
  'Bem-estar': '#C49A3C',
  Vegetariano: '#8FAF91',
  Performance: '#C49A3C',
};
const ACENTO_PADRAO = '#E8784F';

const lerJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));

/** Acha a capa do post cd-XX em qualquer mês de ready-to-post. */
function acharCapa(idPost) {
  let achado = null;
  (function andar(dir) {
    if (achado) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (achado) return;
      const p = path.join(dir, e.name);
      if (!e.isDirectory()) continue;
      if (e.name === idPost) {
        const capa = path.join(p, 'cover.png');
        if (fs.existsSync(capa)) { achado = capa; return; }
      }
      andar(p);
    }
  })(READY_DIR);
  return achado;
}

/** Título longo precisa de corpo menor pra não vazar do quadro. */
function tamanhoTitulo(titulo) {
  const n = titulo.length;
  if (n <= 14) return 128;
  if (n <= 20) return 108;
  if (n <= 26) return 92;
  return 80;
}

function montarHtml(cardapio, capaBase64) {
  const f = cardapio.ficha || {};
  const acento = ACENTO[f.categoria] || ACENTO_PADRAO;

  const valores = {
    BG_BASE64: capaBase64,
    ACCENT: acento,
    TITULO: cardapio.titulo,
    TITULO_SIZE: tamanhoTitulo(cardapio.titulo),
    SUBTITULO: cardapio.subtitulo || '',
    DIAS: f.dias ?? 7,
    RECEITAS: f.receitas ?? '',
    MINUTOS: f.minutos_por_refeicao ?? '',
    PUBLICO: cardapio.publico_alvo || '',
    BENEFICIOS: (cardapio.beneficios || []).map((b) => `<span>${b}</span>`).join(''),
    BADGE_GRATIS: cardapio.gratuito ? '<span class="gratis">grátis</span>' : '',
    CTA: cardapio.gratuito ? 'esse é o cardápio grátis do mês' : 'toca no link pra ver a semana',
  };

  let html = fs.readFileSync(TEMPLATE, 'utf8');
  for (const [chave, valor] of Object.entries(valores)) {
    html = html.replaceAll(`{{${chave}}}`, String(valor ?? ''));
  }
  return html.replace(/\{\{[^}]+\}\}/g, '');
}

async function main() {
  const args = process.argv.slice(2);
  const idxSaida = args.indexOf('--saida');
  const SAIDA = path.join(ROOT, idxSaida !== -1 ? args[idxSaida + 1] : 'assets/destaques/cardapios');
  fs.mkdirSync(SAIDA, { recursive: true });

  const contexto = lerJson(CONTEXTO);
  const cardapios = contexto.atual.cardapios_da_casa;
  console.log(`\n🍽️  ${cardapios.length} cardápios no contexto · saída: ${path.relative(ROOT, SAIDA)}`);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  const feitos = [];
  try {
    for (const [i, c] of cardapios.entries()) {
      const idPost = CAPA_DE[c.slug];
      if (!idPost) { console.warn(`  ⚠️  ${c.slug}: sem post de origem mapeado, pulando`); continue; }

      const capa = acharCapa(idPost);
      if (!capa) { console.warn(`  ⚠️  ${c.slug}: capa de ${idPost} não encontrada, pulando`); continue; }

      const html = montarHtml(c, fs.readFileSync(capa).toString('base64'));
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
      await page.evaluateHandle('document.fonts.ready');

      const nome = `${String(i + 1).padStart(2, '0')}-${c.slug}.png`;
      await page.screenshot({ path: path.join(SAIDA, nome), type: 'png' });
      console.log(`  ✓ ${nome}  (fundo: ${idPost})`);
      feitos.push({ nome, titulo: c.titulo, url: c.url });
    }
  } finally {
    await browser.close();
  }

  // Guia de publicação: a ordem e o link de cada uma
  const guia = ['# Destaque "Cardápios" — ordem de publicação\n',
    '> Publicar como story e salvar no destaque **CARDÁPIOS**.',
    '> Em cada uma, colar o **adesivo de link** com a URL abaixo (o topo da imagem',
    '> foi deixado livre pro adesivo). O link já leva pro cardápio certo.\n',
    '| # | Story | Link do adesivo |', '|---|---|---|',
    ...feitos.map((f, i) => `| ${i + 1} | \`${f.nome}\` — ${f.titulo} | ${f.url} |`),
    '\nRegerar quando o app mudar algum cardápio: `node scripts/gerar-destaque-cardapios.js`\n'];
  fs.writeFileSync(path.join(SAIDA, 'COMO-PUBLICAR.md'), guia.join('\n'), 'utf8');

  console.log(`\n✅ ${feitos.length} stories geradas · guia em COMO-PUBLICAR.md`);
  log.ok('destaque', `Stories de cardápio geradas: ${feitos.length}`);
}

main().catch((err) => {
  log.error('destaque', `Falhou: ${err.message}`);
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});
