#!/usr/bin/env node
/**
 * fetch-metrics.js — coleta métricas de TUDO que já foi publicado no Instagram
 *
 * Varre ready-to-post/⁎⁎/published.json, chama a Graph API pra cada mídia e grava
 * o resultado bruto em data/metricas/coleta-AAAA-MM-DD.json. É a matéria-prima da
 * análise ponta a ponta (docs/ROTEIRO.md, passo 1) — este script só COLETA e anota;
 * a análise vem depois, em cima do arquivo gerado.
 *
 * Notas da API:
 *  - Insights são "lifetime": dá pra puxar de post antigo a qualquer momento.
 *  - Stories perdem insights ~24h depois de publicadas — pra elas fica só o registro
 *    básico (a coleta não quebra, anota o motivo).
 *
 * Uso:
 *   node scripts/fetch-metrics.js            (coleta tudo e grava)
 *   node scripts/fetch-metrics.js --limit 5  (teste com poucas)
 */

const fs = require('fs');
const path = require('path');
const log = require('./lib/logger');

require('dotenv').config();

const ROOT      = path.resolve(__dirname, '..');
const READY_DIR = path.join(ROOT, 'ready-to-post');
const OUT_DIR   = path.join(ROOT, 'data', 'metricas');
const API       = 'https://graph.instagram.com/v23.0';

const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

const CAMPOS_MIDIA = 'media_type,media_product_type,timestamp,like_count,comments_count,permalink';
// Conjunto válido pra REELS e FEED no v23; o que a mídia não suportar a API recusa
// e a gente tenta o subconjunto básico.
const METRICAS       = 'reach,likes,comments,shares,saved,views,total_interactions';
const METRICAS_BASE  = 'reach,likes,comments';

function walkPublished(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walkPublished(p));
    else if (e.name === 'published.json') out.push(p);
  }
  return out;
}

async function apiGet(pathAndQuery) {
  const sep = pathAndQuery.includes('?') ? '&' : '?';
  const res = await fetch(`${API}/${pathAndQuery}${sep}access_token=${TOKEN}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.code = body?.error?.code;
    throw err;
  }
  return body;
}

function achatarInsights(data) {
  const out = {};
  for (const m of data?.data || []) out[m.name] = m.values?.[0]?.value ?? null;
  return out;
}

async function coletarMidia(mediaId) {
  const basico = await apiGet(`${mediaId}?fields=${CAMPOS_MIDIA}`);

  let metricas = null;
  let avisoInsights = null;
  try {
    metricas = achatarInsights(await apiGet(`${mediaId}/insights?metric=${METRICAS}`));
  } catch (e1) {
    try {
      metricas = achatarInsights(await apiGet(`${mediaId}/insights?metric=${METRICAS_BASE}`));
      avisoInsights = `conjunto completo recusado (${e1.message}); coletado subconjunto básico`;
    } catch (e2) {
      avisoInsights = `insights indisponíveis: ${e2.message}`;
    }
  }
  return { basico, metricas, avisoInsights };
}

async function main() {
  if (!TOKEN) {
    console.error('❌ INSTAGRAM_ACCESS_TOKEN não encontrado no .env');
    process.exit(1);
  }
  const limitIdx = process.argv.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(process.argv[limitIdx + 1], 10) : Infinity;

  const arquivos = walkPublished(READY_DIR).slice(0, isFinite(limit) ? limit : undefined);
  console.log(`\n📊 Coletando métricas de ${arquivos.length} publicação(ões)...\n`);

  // Contexto da conta no momento da coleta — sem isso os números não têm base
  let conta = null;
  try {
    conta = await apiGet(`me?fields=username,followers_count,follows_count,media_count`);
    console.log(`   Conta: @${conta.username} · ${conta.followers_count} seguidores\n`);
  } catch (e) {
    console.warn(`   ⚠️  Não deu pra ler a conta: ${e.message}\n`);
  }

  const itens = [];
  let ok = 0, semInsights = 0, falhas = 0;

  for (const arq of arquivos) {
    const pasta   = path.basename(path.dirname(arq));
    const dataDia = path.basename(path.dirname(path.dirname(arq)));
    // replace: alguns published.json antigos têm BOM (escritos via PowerShell)
    const pub     = JSON.parse(fs.readFileSync(arq, 'utf8').replace(/^﻿/, ''));

    if (!pub.instagram_media_id) { falhas++; continue; }

    const tipoPasta = pasta.startsWith('story') ? 'story'
                    : pasta.startsWith('reel')  ? 'reel' : 'post';
    try {
      const { basico, metricas, avisoInsights } = await coletarMidia(pub.instagram_media_id);
      itens.push({
        pasta,
        data: dataDia,
        tipo: tipoPasta,
        media_id: pub.instagram_media_id,
        publicado_em: pub.published_at,
        caption_preview: pub.caption_preview || null,
        media_type: basico.media_type,
        media_product_type: basico.media_product_type,
        permalink: basico.permalink,
        metricas,
        aviso: avisoInsights,
      });
      if (metricas) { ok++; process.stdout.write(`  ✓ ${pasta} — alcance ${metricas.reach ?? '?'}\n`); }
      else          { semInsights++; process.stdout.write(`  ○ ${pasta} — sem insights (${tipoPasta})\n`); }
    } catch (e) {
      falhas++;
      itens.push({ pasta, data: dataDia, tipo: tipoPasta, media_id: pub.instagram_media_id, erro: e.message });
      process.stdout.write(`  ✗ ${pasta} — ${e.message}\n`);
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const hoje = new Date().toISOString().slice(0, 10);
  const outPath = path.join(OUT_DIR, `coleta-${hoje}.json`);
  fs.writeFileSync(outPath, JSON.stringify({
    _coletado_em: new Date().toISOString(),
    _conta: conta,
    _totais: { publicacoes: itens.length, com_metricas: ok, sem_insights: semInsights, falhas },
    itens,
  }, null, 2), 'utf8');

  console.log(`\n──────────────────────────────────────`);
  console.log(`✅ ${ok} com métricas · ○ ${semInsights} sem insights · ✗ ${falhas} falhas`);
  console.log(`📁 Salvo em ${path.relative(ROOT, outPath)}`);
  log.ok('metricas', `Coleta concluída: ${ok}/${itens.length}`, { ok, semInsights, falhas });
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
