#!/usr/bin/env node
/**
 * responder-comentarios.js — comentou a palavra-chave, recebe o link na DM.
 *
 * Uso:
 *   node scripts/responder-comentarios.js --dry-run     (mostra o que faria, NÃO envia)
 *   node scripts/responder-comentarios.js               (envia de verdade)
 *   node scripts/responder-comentarios.js --janela 21   (muda a validade, padrão 14 dias)
 *
 * Como funciona: para cada post publicado que tem `link_dm`, lê os comentários,
 * acha quem escreveu a palavra-chave e responde em privado com o link.
 *
 * VALIDADE (decisão do Davi): um post só fica "ativo" por JANELA_PADRAO dias.
 * Sem isso, os 26 posts do ciclo seriam relidos para sempre e a cada rodada o
 * trabalho cresceria. Um post recebe quase todo comentário nos primeiros dias —
 * passada a janela, a regra dele morre e sai da varredura.
 *
 * Cada comentário respondido fica registrado em data/dm-enviadas.json, então
 * ninguém recebe a mesma DM duas vezes, mesmo o cron rodando a cada 10 minutos.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const log = require('./lib/logger');

const ROOT = path.resolve(__dirname, '..');
const READY_DIR = path.join(ROOT, 'ready-to-post');
const ESTADO = path.join(ROOT, 'data', 'dm-enviadas.json');
const API = 'https://graph.instagram.com/v21.0';

const JANELA_PADRAO = 14;        // dias que um post continua sendo vigiado
const PAUSA_ENTRE_ENVIOS = 1500; // ms — respiro entre DMs

const { INSTAGRAM_ACCESS_TOKEN: TOKEN, INSTAGRAM_USER_ID: IG_ID } = process.env;

// ── Textos da DM ─────────────────────────────────────────────────────────────
// O item pode trazer `dm_texto` para sobrescrever; senão usa o padrão do motor.
// {titulo} e {link} são substituídos.
const MODELOS = {
  cd: 'Oi! 🍳 Aqui está o cardápio {titulo}, completo:\n\n{link}\n\n'
    + 'É a semana inteira montada — café, almoço e jantar — e a lista de compras sai junto.\n\n'
    + 'Qualquer dúvida, é só me chamar por aqui!',
  rd: 'Oi! 👩‍🍳 Aqui está a receita completa:\n\n{link}\n\n'
    + 'Tem o passo a passo inteiro, e dá pra jogar os ingredientes direto na sua lista de compras.\n\n'
    + 'Depois me conta se fez!',
};

// ── Utilidades ───────────────────────────────────────────────────────────────
const lerJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));

/** Tira acento e caixa: "Comenta FORÇA" e "forca" viram a mesma coisa. */
const normalizar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * A palavra precisa aparecer inteira — "leve" não casa dentro de "levemente".
 * Aceita o plural simples ("receitas" vale por "receita"), porque muita gente
 * escreve assim: deixar essa pessoa sem resposta é pior do que responder demais.
 */
function contemPalavra(texto, palavra) {
  const alvo = normalizar(palavra);
  return normalizar(texto)
    .split(/[^a-z0-9]+/)
    .some((p) => p === alvo || p === `${alvo}s`);
}

function carregarEstado() {
  if (!fs.existsSync(ESTADO)) return { enviadas: [] };
  try { return lerJson(ESTADO); } catch { return { enviadas: [] }; }
}

function salvarEstado(estado) {
  fs.mkdirSync(path.dirname(ESTADO), { recursive: true });
  fs.writeFileSync(ESTADO, JSON.stringify(estado, null, 2) + '\n', 'utf8');
}

function checarAmbiente() {
  const faltando = [];
  if (!TOKEN) faltando.push('INSTAGRAM_ACCESS_TOKEN');
  if (!IG_ID) faltando.push('INSTAGRAM_USER_ID');
  if (faltando.length) {
    console.error(`❌ Faltando no .env: ${faltando.join(', ')}`);
    process.exit(1);
  }
}

// ── Posts ativos ─────────────────────────────────────────────────────────────
/**
 * Um post entra na varredura quando tem os três: já foi publicado (media_id),
 * tem link_dm, e está dentro da janela de validade.
 */
function postsAtivos(janelaDias) {
  const limite = Date.now() - janelaDias * 24 * 60 * 60 * 1000;
  const ativos = [];

  (function andar(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { andar(p); continue; }
      if (e.name !== 'published.json') continue;

      const pasta = path.dirname(p);
      const pub = lerJson(p);
      if (!pub.instagram_media_id) continue;

      const publicadoEm = new Date(pub.published_at).getTime();
      if (!publicadoEm || publicadoEm < limite) continue;   // fora da validade

      const metaPath = ['reel.json', 'post.json'].map((f) => path.join(pasta, f)).find(fs.existsSync);
      if (!metaPath) continue;

      const meta = lerJson(metaPath);
      if (!meta.link_dm) continue;                          // post sem DM: ignora

      const achou = (meta.caption || '').match(/[Cc]omenta\s+([A-ZÇÃÕÁÉÍÓÚÂÊÔ]{3,})/);
      if (!achou) {
        log.warn('dm', `${meta.id}: tem link_dm mas não achei a palavra na legenda`, { id: meta.id });
        continue;
      }

      ativos.push({
        id: meta.id,
        mediaId: pub.instagram_media_id,
        publicadoEm: pub.published_at,
        palavra: achou[1],
        link: meta.link_dm,
        texto: meta.dm_texto || MODELOS[meta.id.slice(0, 2)] || MODELOS.rd,
        titulo: meta.titulo_dm || '',
      });
    }
  })(READY_DIR);

  return ativos.sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm));
}

// ── Instagram ────────────────────────────────────────────────────────────────
async function lerComentarios(mediaId) {
  const url = `${API}/${mediaId}/comments?fields=id,text,username,timestamp,from&limit=50&access_token=${TOKEN}`;
  const r = await fetch(url);
  const corpo = await r.json();
  if (!r.ok) throw new Error(`comentários (${r.status}): ${JSON.stringify(corpo?.error?.message || corpo).slice(0, 200)}`);
  return corpo.data || [];
}

/**
 * Resposta privada: manda DM para quem escreveu o comentário, usando o id do
 * comentário como destinatário. É a via oficial do Instagram pra esse fluxo.
 */
async function responderNaDm(commentId, texto) {
  const r = await fetch(`${API}/${IG_ID}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { comment_id: commentId },
      message: { text: texto },
      access_token: TOKEN,
    }),
  });
  const corpo = await r.json();
  if (!r.ok) throw new Error(`envio (${r.status}): ${JSON.stringify(corpo?.error?.message || corpo).slice(0, 250)}`);
  return corpo;
}

// ── Principal ────────────────────────────────────────────────────────────────
async function main() {
  checarAmbiente();

  const args = process.argv.slice(2);
  const seco = args.includes('--dry-run');
  const idxJanela = args.indexOf('--janela');
  const janela = idxJanela !== -1 ? parseInt(args[idxJanela + 1], 10) : JANELA_PADRAO;

  const estado = carregarEstado();
  const jaEnviadas = new Set(estado.enviadas.map((x) => x.comment_id));

  const ativos = postsAtivos(janela);
  console.log(`\n📬 ${ativos.length} post(s) ativo(s) — janela de ${janela} dias${seco ? '  [MODO SECO: nada será enviado]' : ''}`);
  ativos.forEach((p) => console.log(`   • ${p.id} · palavra "${p.palavra}" · publicado ${p.publicadoEm.slice(0, 10)}`));

  if (!ativos.length) { console.log('\nNada a fazer.'); return; }

  let enviadas = 0;
  let ignoradas = 0;

  for (const post of ativos) {
    let comentarios;
    try {
      comentarios = await lerComentarios(post.mediaId);
    } catch (err) {
      log.error('dm', `Falha ao ler comentários de ${post.id}: ${err.message}`, { id: post.id });
      console.error(`  ✗ ${post.id}: ${err.message}`);
      continue;
    }

    for (const c of comentarios) {
      if (jaEnviadas.has(c.id)) { ignoradas++; continue; }
      if (c.from?.id === IG_ID) continue;                     // comentário da própria conta
      if (!contemPalavra(c.text || '', post.palavra)) continue;

      const texto = post.texto
        .replace('{titulo}', post.titulo || post.palavra)
        .replace('{link}', post.link);

      if (seco) {
        console.log(`\n  [SECO] responderia @${c.username || '?'} em ${post.id}`);
        console.log(`         comentário: "${(c.text || '').slice(0, 60)}"`);
        console.log(`         mandaria:   ${post.link}`);
        enviadas++;
        continue;
      }

      try {
        await responderNaDm(c.id, texto);
        estado.enviadas.push({
          comment_id: c.id,
          media_id: post.mediaId,
          post: post.id,
          palavra: post.palavra,
          username: c.username || null,
          enviado_em: new Date().toISOString(),
        });
        salvarEstado(estado);
        jaEnviadas.add(c.id);
        enviadas++;
        console.log(`  ✓ DM enviada para @${c.username || '?'} (${post.id})`);
        log.ok('dm', `DM enviada: ${post.id} → @${c.username || '?'}`, { post: post.id, palavra: post.palavra });
        await new Promise((r) => setTimeout(r, PAUSA_ENTRE_ENVIOS));
      } catch (err) {
        console.error(`  ✗ @${c.username || '?'} (${post.id}): ${err.message}`);
        log.error('dm', `Falha ao enviar para @${c.username || '?'}: ${err.message}`, { post: post.id });
      }
    }
  }

  console.log('\n──────────────────────────────────────');
  console.log(`${seco ? 'Enviaria' : 'Enviadas'}: ${enviadas} · já respondidos antes: ${ignoradas}`);
}

main().catch((err) => {
  log.error('dm', `Erro geral: ${err.message}`);
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});
