#!/usr/bin/env node
/**
 * publicar.js — redistribui pro Pinterest o que JÁ saiu no Instagram.
 *
 * Uso:
 *   node scripts/pinterest/publicar.js --dry-run     (mostra sem publicar)
 *   node scripts/pinterest/publicar.js
 *   node scripts/pinterest/publicar.js --limite 3
 *
 * Princípio, decidido com o Davi: o Pinterest NÃO gera material. Ele
 * redistribui. Vídeo, capa e texto já existem — o vídeo e a capa vêm do
 * Cloudinary (mesmos arquivos do Instagram) e o texto sai da legenda.
 * Nenhuma chamada de modelo, nenhum arquivo novo, custo zero de geração.
 *
 * A fila não é um arquivo que alguém mantém: é derivada de ready-to-post.
 * Entra quem tem `published.json` (ou seja: já estreou no Instagram), tem
 * vídeo no Cloudinary e tem regra de board no config. Fila que se mantém
 * sozinha não desincroniza.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const api = require('./lib/api');
const log = require('../lib/logger');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG = path.join(ROOT, 'data', 'pinterest', 'config.json');
const BOARDS = path.join(ROOT, 'data', 'pinterest', 'boards.json');
const PUBLICADOS = path.join(ROOT, 'data', 'pinterest', 'publicados.json');
const CONTEXTO = path.join(ROOT, 'data', 'product-context.json');
const READY_DIR = path.join(ROOT, 'ready-to-post');

const UTM_SOURCE = 'pinterest';
const DIA_MS = 86400000;

const lerJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));

// ── Fila derivada ─────────────────────────────────────────────────────────────

/** Todo post de ready-to-post que já estreou no Instagram e tem vídeo. */
function varrerPublicados() {
  const achados = [];
  (function andar(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const p = path.join(dir, e.name);
      const reel = path.join(p, 'reel.json');
      const pub = path.join(p, 'published.json');
      if (fs.existsSync(reel) && fs.existsSync(pub)) {
        achados.push({ pasta: p, reel: lerJson(reel), published: lerJson(pub) });
        continue; // pasta de post não contém outra pasta de post
      }
      andar(p);
    }
  })(READY_DIR);
  return achados;
}

const prefixoDe = (id) => String(id).split('-')[0];

/** Troca/insere os UTMs sem nunca reescrever o domínio. */
function comUtm(urlBase, campanha) {
  const u = new URL(urlBase);
  u.searchParams.set('utm_source', UTM_SOURCE);
  u.searchParams.set('utm_campaign', campanha);
  return u.toString();
}

/**
 * O destino do pin. `link_dm` usa o link que o post já carrega; qualquer outro
 * valor é o NOME de uma chave em fixo.links_uteis — nunca uma URL literal.
 * No dia em que o app virar aplicativo na loja, quem redireciona é o site.
 */
function montarLink(regra, item, contexto) {
  const campanha = `pin-${item.reel.id}`;

  if (regra.destino === 'link_dm') {
    if (!item.reel.link_dm) throw new Error(`${item.reel.id}: regra pede link_dm mas o post não tem`);
    return comUtm(item.reel.link_dm, campanha);
  }

  const caminho = contexto.fixo.links_uteis[regra.destino];
  if (!caminho) throw new Error(`${item.reel.id}: "${regra.destino}" não existe em fixo.links_uteis`);
  return comUtm(new URL(caminho, contexto.fixo.app.url_canonica).toString(), campanha);
}

// ── Texto (reaproveitado da legenda, nunca reescrito por modelo) ───────────────

/** Primeira linha da legenda = título. É a frase que já foi revisada. */
function tituloDe(caption) {
  return caption.split('\n')[0].replace(/\s+/g, ' ').trim().slice(0, 100);
}

/**
 * Descrição: o corpo da legenda, sem a primeira linha e sem hashtags —
 * no Pinterest hashtag não ajuda em busca e polui a leitura.
 */
function descricaoDe(caption) {
  return caption
    .split('\n')
    .slice(1)
    .filter((l) => !l.trim().startsWith('#'))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 800);
}

// ── Principal ─────────────────────────────────────────────────────────────────

async function baixar(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Baixar ${url} → HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const idxLimite = args.indexOf('--limite');

  const config = lerJson(CONFIG);
  const contexto = lerJson(CONTEXTO);
  const publicados = fs.existsSync(PUBLICADOS) ? lerJson(PUBLICADOS) : {};

  // Em modo seco dá pra conferir a fila antes mesmo de os boards existirem —
  // é justamente assim que se confere o plano antes de tocar na conta.
  if (!fs.existsSync(BOARDS) && !dryRun) {
    throw new Error('data/pinterest/boards.json não existe. Rode antes: node scripts/pinterest/criar-boards.js');
  }
  const boards = fs.existsSync(BOARDS) ? lerJson(BOARDS) : {};

  const limite = idxLimite !== -1
    ? Number(args[idxLimite + 1])
    : config.cadencia.pins_por_execucao;

  const carencia = config.cadencia.dias_apos_instagram * DIA_MS;
  const agora = Date.now();

  // Monta a fila: já estreou no Instagram, cumpriu a carência, tem vídeo e regra.
  const fila = [];
  for (const item of varrerPublicados()) {
    const id = item.reel.id;
    if (!id || publicados[id]) continue;

    const prefixo = prefixoDe(id);
    if ((config.pular?.prefixos || []).includes(prefixo)) continue;

    const regra = config.regras.find((r) => r.prefixo === prefixo);
    if (!regra) continue;

    if (!item.reel.cloudinaryUrl || !item.reel.cloudinaryCoverUrl) continue;

    const publicadoEm = Date.parse(item.published.published_at || '');
    if (!Number.isFinite(publicadoEm) || agora - publicadoEm < carencia) continue;

    fila.push({ ...item, id, regra, publicadoEm });
  }

  fila.sort((a, b) => a.publicadoEm - b.publicadoEm); // mais antigo primeiro
  const lote = fila.slice(0, Math.max(0, limite));

  console.log(`\n📌 Pinterest · ${fila.length} na fila · publicando ${lote.length}${dryRun ? ' (modo seco)' : ''}`);
  if (!lote.length) {
    console.log('   Nada a fazer.\n');
    return;
  }

  const token = dryRun ? null : await api.pegarAccessToken();
  let feitos = 0;

  for (const item of lote) {
    const boardId = boards[item.regra.board];
    if (!boardId && !dryRun) {
      console.warn(`  ⚠️  ${item.id}: board "${item.regra.board}" não está em boards.json — pulando`);
      continue;
    }

    const titulo = tituloDe(item.reel.caption);
    const descricao = descricaoDe(item.reel.caption);
    const link = montarLink(item.regra, item, contexto);

    if (dryRun) {
      console.log(`\n  ▸ ${item.id} → ${item.regra.board}`);
      console.log(`    título: ${titulo}`);
      console.log(`    link:   ${link}`);
      console.log(`    vídeo:  ${item.reel.cloudinaryUrl}`);
      console.log(`    capa:   ${item.reel.cloudinaryCoverUrl}`);
      continue;
    }

    try {
      const mp4 = await baixar(item.reel.cloudinaryUrl);
      const mediaId = await api.subirVideo(token, mp4);
      const pin = await api.criarVideoPin(token, {
        boardId,
        titulo,
        descricao,
        link,
        mediaId,
        capaUrl: item.reel.cloudinaryCoverUrl,
        altText: titulo,
      });

      publicados[item.id] = {
        pin_id: pin.id,
        board: item.regra.board,
        publicado_em: new Date().toISOString(),
        link,
      };
      feitos++;
      console.log(`  ✓ ${item.id} → ${item.regra.board} (pin ${pin.id})`);
      log.ok('pinterest', `Pin criado: ${item.id}`, { pinId: pin.id, board: item.regra.board });
    } catch (err) {
      // Um pin que falha não derruba o lote — o próximo dia tenta de novo,
      // porque a fila é derivada e ele continua sem registro em publicados.
      console.error(`  ❌ ${item.id}: ${err.message}`);
      log.error('pinterest', `Falhou: ${item.id}`, { erro: err.message });
    }
  }

  if (dryRun) {
    console.log('\n🔍 Modo seco — nada foi publicado.\n');
    return;
  }

  fs.writeFileSync(PUBLICADOS, `${JSON.stringify(publicados, null, 2)}\n`, 'utf8');
  console.log(`\n✅ ${feitos} pin(s) · ${Object.keys(publicados).length} no total\n`);

  // Falha real precisa pintar o workflow de vermelho — silêncio já nos custou
  // dois meses de token do Instagram expirando sem ninguém saber.
  if (feitos === 0) process.exit(1);
}

main().catch((err) => {
  log.error('pinterest', `publicar falhou: ${err.message}`);
  console.error(`\n❌ ${err.message}\n`);
  process.exit(1);
});
