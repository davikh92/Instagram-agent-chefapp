#!/usr/bin/env node
/**
 * sync-contexto.js — puxa o contexto do produto do app e regrava data/product-context.json
 *
 * O app (Tem na Semana) expõe a verdade sobre o produto num RPC público do Supabase.
 * Este script busca e grava. A partir daqui, product-context.json é CACHE — ninguém
 * edita à mão. Ver docs/DIRECAO_PARA_A_AUTOMACAO.md.
 *
 * Estrutura do retorno:
 *   fixo  — identidade, posicionamento, pode/não pode dizer, planos. Escrito pelo app.
 *   atual — cardápios, receitas, novidades. Gerado do banco a cada chamada.
 *
 * Falha de rede NÃO derruba a geração de conteúdo: mantém o cache anterior e avisa.
 * Só falha de verdade se não houver cache nenhum — aí escrever post é escrever mentira.
 *
 * Uso:
 *   node scripts/sync-contexto.js
 *   node scripts/sync-contexto.js --check   (não grava, só mostra o que veio)
 */

const fs = require('fs');
const path = require('path');
const log = require('./lib/logger');

require('dotenv').config();

const ROOT       = path.resolve(__dirname, '..');
const CACHE_PATH = path.join(ROOT, 'data', 'product-context.json');
const RPC        = 'contexto_do_conteudo';
const TIMEOUT_MS = 15000;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://aywpqorkwewxdqectncu.supabase.co';
const KEY          = process.env.SUPABASE_PUBLISHABLE_KEY;

// Campos que o conteúdo não consegue produzir sem. Se sumirem, o payload é lixo e é
// melhor ficar com o cache velho do que gravar um arquivo pela metade.
const OBRIGATORIOS = [
  ['fixo', 'app', 'nome'],
  ['fixo', 'app', 'url_canonica'],
  ['fixo', 'comunicacao', 'nao_pode_dizer'],
  ['fixo', 'posicionamento', 'protagonista'],
  ['atual', 'cardapios_da_casa'],
];

function buscarCampo(obj, caminho) {
  return caminho.reduce((acc, chave) => (acc == null ? acc : acc[chave]), obj);
}

function validar(payload) {
  const faltando = OBRIGATORIOS
    .filter(caminho => buscarCampo(payload, caminho) == null)
    .map(caminho => caminho.join('.'));

  if (faltando.length) {
    throw new Error(`Payload incompleto — faltam: ${faltando.join(', ')}`);
  }
  const cardapios = payload.atual.cardapios_da_casa;
  if (!Array.isArray(cardapios) || cardapios.length === 0) {
    throw new Error('Payload sem nenhum cardápio — o app não teria publicado zero');
  }
  return payload;
}

async function buscarContexto() {
  const url = `${SUPABASE_URL}/rest/v1/rpc/${RPC}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
      signal: controller.signal,
    });

    const corpo = await response.text();
    if (!response.ok) {
      throw new Error(`RPC ${RPC} respondeu ${response.status}: ${corpo.substring(0, 200)}`);
    }
    return validar(JSON.parse(corpo));

  } finally {
    clearTimeout(timer);
  }
}

function lerCache() {
  if (!fs.existsSync(CACHE_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function resumir(ctx) {
  return {
    nome:      ctx?.fixo?.app?.nome,
    url:       ctx?.fixo?.app?.url_canonica,
    cardapios: ctx?.atual?.cardapios_da_casa?.length ?? 0,
    receitas:  ctx?.atual?.receitas?.total ?? 0,
    novidades: (ctx?.atual?.novidades ?? []).filter(n => n.pode_anunciar).length,
  };
}

async function main() {
  const checkOnly = process.argv.includes('--check');

  if (!KEY) {
    console.error('❌ SUPABASE_PUBLISHABLE_KEY não encontrada no ambiente.');
    console.error('   É a chave publicável do app (nunca a service_role). Ver docs/DIRECAO_PARA_A_AUTOMACAO.md.');
    process.exit(1);
  }

  let contexto;
  try {
    contexto = await buscarContexto();
  } catch (err) {
    const cache = lerCache();
    if (!cache) {
      console.error(`\n❌ Contexto indisponível e não existe cache: ${err.message}`);
      console.error('   Sem isso o conteúdo sairia com nome, URL e cardápios errados. Abortando.');
      log.error('contexto', `Sync falhou sem cache: ${err.message}`, { erro: err.message });
      process.exit(1);
    }
    console.warn(`\n⚠️  Contexto indisponível: ${err.message}`);
    console.warn(`   Seguindo com o cache de ${cache._sincronizado_em || 'data desconhecida'}.`);
    log.warn('contexto', `Sync falhou, usando cache: ${err.message}`, { erro: err.message });
    process.exit(0);
  }

  const antes  = resumir(lerCache());
  const depois = resumir(contexto);

  console.log(`\n📡 Contexto do app — ${depois.nome} (${depois.url})`);
  console.log(`   ${depois.cardapios} cardápios · ${depois.receitas} receitas · ${depois.novidades} novidade(s) anunciável(is)`);

  if (antes.cardapios && depois.cardapios !== antes.cardapios) {
    console.log(`   🔔 cardápios: ${antes.cardapios} → ${depois.cardapios}`);
  }
  contexto.atual.novidades
    ?.filter(n => n.pode_anunciar)
    .forEach(n => console.log(`   🔔 novidade liberada: ${n.titulo} (${n.data})`));

  if (checkOnly) {
    console.log('\n   --check: nada gravado.');
    return;
  }

  // O payload traz o próprio _leia_primeiro. Espalha ele primeiro e põe os campos
  // desta automação por cima, senão o aviso de cache é engolido pelo do app.
  const saida = {
    ...contexto,
    _aviso_de_cache:
      'CACHE — não edite à mão. Gerado por scripts/sync-contexto.js a partir do RPC do app. ' +
      'Para corrigir algo do bloco `fixo`, peça ao time do app; o bloco `atual` sai do banco sozinho.',
    _sincronizado_em: new Date().toISOString(),
    _fonte: `${SUPABASE_URL}/rest/v1/rpc/${RPC}`,
  };

  fs.writeFileSync(CACHE_PATH, JSON.stringify(saida, null, 2), 'utf8');
  console.log('\n✅ data/product-context.json atualizado.');
  log.ok('contexto', 'Contexto do app sincronizado', depois);
}

main().catch(err => {
  console.error('\n❌ Erro fatal no sync de contexto:', err.message);
  process.exit(1);
});
