#!/usr/bin/env node
/**
 * gerar-pins.js — os pins do teste de Pinterest.
 *
 * Uso:
 *   node scripts/pinterest/gerar-pins.js
 *   node scripts/pinterest/gerar-pins.js --saida assets/pinterest
 *
 * Custo ZERO de API: o fundo de cada pin é a `cover.png` do post que já foi
 * gerado — a mesma capa que rodou no Instagram, recomposta em 2:3.
 *
 * Por que recompor em vez de subir a capa direto: nossas capas são 9:16
 * (720×1280). O Pinterest corta o que passa de 2:3 no feed, e recomenda pelo
 * menos 1000px de largura. Recompondo aqui, o corte é decisão nossa.
 *
 * Nenhuma URL é escrita à mão. Cardápio: sai de `atual.cardapios_da_casa[].url`.
 * Receita: sai do `link_dm` da fila de receitas-DM, trocando o utm_source.
 * Se o domínio mudar de novo, este script continua certo sem tocar em nada.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const log = require('../lib/logger');

const ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE = path.join(ROOT, 'templates', 'pinterest', 'pin.html');
const PINS = path.join(ROOT, 'data', 'pinterest', 'pins.json');
const CONTEXTO = path.join(ROOT, 'data', 'product-context.json');
const FILA_RECEITAS = path.join(ROOT, 'data', 'ciclo-01', 'fila', 'fila-receitas-dm.json');
const READY_DIR = path.join(ROOT, 'ready-to-post');

const UTM_SOURCE = 'pinterest';

const lerJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));

/** Acha a cover.png de um post em qualquer mês de ready-to-post. */
function acharCapa(idPost) {
  let achado = null;
  (function andar(dir) {
    if (achado) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (achado) return;
      if (!e.isDirectory()) continue;
      const p = path.join(dir, e.name);
      if (e.name === idPost) {
        const capa = path.join(p, 'cover.png');
        if (fs.existsSync(capa)) { achado = capa; return; }
      }
      andar(p);
    }
  })(READY_DIR);
  return achado;
}

/** Troca/insere os UTMs de uma URL sem nunca reescrever o domínio. */
function comUtm(urlBase, campanha) {
  const u = new URL(urlBase);
  u.searchParams.set('utm_source', UTM_SOURCE);
  u.searchParams.set('utm_campaign', campanha);
  return u.toString();
}

/**
 * O destino do pin. Nunca o destino final do usuário — sempre a página que o
 * site controla. Quando o app virar aplicativo na loja, quem redireciona é o
 * site, e nenhum pin precisa ser editado.
 */
function montarLink(pin, contexto, receitas) {
  if (pin.tipo === 'cardapio') {
    const c = contexto.atual.cardapios_da_casa.find((x) => x.slug === pin.slug);
    if (!c) throw new Error(`${pin.id}: cardápio "${pin.slug}" não existe no Contexto`);
    return comUtm(c.url, pin.id);
  }
  const r = receitas.find((x) => x.id === pin.origem);
  if (!r || !r.link_dm) throw new Error(`${pin.id}: receita ${pin.origem} sem link_dm na fila`);
  return comUtm(r.link_dm, pin.id);
}

/** Título longo precisa de corpo menor pra não vazar do quadro. */
function tamanhoTitulo(titulo) {
  const n = titulo.length;
  if (n <= 22) return 116;
  if (n <= 30) return 98;
  if (n <= 40) return 84;
  return 74;
}

function montarHtml(pin, capaBase64, marca) {
  const valores = {
    BG_BASE64: capaBase64,
    ACCENT: pin.accent,
    EYEBROW: pin.eyebrow,
    TITULO: pin.titulo,
    TITULO_SIZE: tamanhoTitulo(pin.titulo),
    LINHA: pin.linha,
    SELO: pin.selo ? `<span class="selo">${pin.selo}</span>` : '',
    MARCA: marca,
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
  const SAIDA = path.join(ROOT, idxSaida !== -1 ? args[idxSaida + 1] : 'assets/pinterest');
  fs.mkdirSync(SAIDA, { recursive: true });

  const pins = lerJson(PINS);
  const contexto = lerJson(CONTEXTO);
  const receitas = lerJson(FILA_RECEITAS);

  // A marca impressa no pin é o domínio do Contexto, sem protocolo — nunca digitado.
  const marca = new URL(contexto.fixo.app.url_canonica).host.replace(/^www\./, '');

  // O selo "grátis" não é decisão nossa: sai do Contexto, como tudo do produto.
  for (const pin of pins) {
    if (pin.tipo !== 'cardapio') continue;
    const c = contexto.atual.cardapios_da_casa.find((x) => x.slug === pin.slug);
    if (c && c.gratuito) pin.selo = 'grátis';
  }

  console.log(`\n📌 ${pins.length} pins · saída: ${path.relative(ROOT, SAIDA)}`);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 1500, deviceScaleFactor: 1 });

  const feitos = [];
  try {
    for (const [i, pin] of pins.entries()) {
      const capa = acharCapa(pin.origem);
      if (!capa) { console.warn(`  ⚠️  ${pin.id}: capa de ${pin.origem} não encontrada, pulando`); continue; }

      const link = montarLink(pin, contexto, receitas);
      const html = montarHtml(pin, fs.readFileSync(capa).toString('base64'), marca);

      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
      await page.evaluateHandle('document.fonts.ready');

      const nome = `${String(i + 1).padStart(2, '0')}-${pin.id}.png`;
      await page.screenshot({ path: path.join(SAIDA, nome), type: 'png' });

      console.log(`  ✓ ${nome}  (fundo: ${pin.origem})`);
      feitos.push({ ...pin, nome, link });
    }
  } finally {
    await browser.close();
  }

  // Guia de publicação: é o que o Davi vai ter aberto do lado enquanto sobe os pins.
  const boards = [...new Set(feitos.map((f) => f.board))];
  const guia = [
    '# Pinterest — Fase 1 (teste na mão)\n',
    '> Nenhuma API, nenhuma aprovação. Sobe na mão, mede duas ou três semanas,',
    '> e só automatiza se trouxer gente. Regra do plano: **plataforma não ganha**',
    '> **automação antes de provar que merece.**\n',
    `**Boards a criar (${boards.length}):** ${boards.map((b) => `\`${b}\``).join(' · ')}\n`,
    'Nome do board é campo de busca no Pinterest — não renomeie pra algo bonitinho.\n',
    ...boards.flatMap((board) => [
      `\n## ${board}\n`,
      ...feitos.filter((f) => f.board === board).flatMap((f) => [
        `### ${f.nome}`,
        `**Título:** ${f.titulo}`,
        `**Descrição:** ${f.descricao}`,
        `**Link:** ${f.link}`,
        '',
      ]),
    ]),
    '---\n',
    '**O que medir:** cliques no link (só a conta comercial mostra), salvamentos,',
    'e no nosso lado o `utm_source=pinterest` chegando no app.\n',
    'Regerar quando um cardápio ou uma receita mudar: `node scripts/pinterest/gerar-pins.js`\n',
  ];
  fs.writeFileSync(path.join(SAIDA, 'COMO-PUBLICAR.md'), guia.join('\n'), 'utf8');

  console.log(`\n✅ ${feitos.length} pins · guia em COMO-PUBLICAR.md`);
  log.ok('pinterest', `Pins gerados: ${feitos.length}`);
}

main().catch((err) => {
  log.error('pinterest', `Falhou: ${err.message}`);
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});
