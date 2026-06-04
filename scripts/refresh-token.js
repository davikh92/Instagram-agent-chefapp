#!/usr/bin/env node
/**
 * refresh-token.js — renova o Instagram Long-Lived Access Token
 *
 * O token dura 60 dias. Este script roda automaticamente via Windows Task Scheduler
 * nos dias 1 e 15 de cada mês — dando ~30 dias de margem antes da expiração.
 *
 * Resultado visível no dashboard (localhost:3333):
 *   - ✅ verde: renovado com sucesso
 *   - 🔴 vermelho: falha — token expirado, exige intervenção manual
 *
 * Uso manual: node scripts/refresh-token.js
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const log  = require('./lib/logger');

const ROOT     = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Lê o token atual do .env (re-lê do disco para pegar o mais recente,
 * mesmo que o dotenv já tenha carregado uma versão antiga).
 */
function readTokenFromEnv() {
  if (!fs.existsSync(ENV_PATH)) return null;
  const content = fs.readFileSync(ENV_PATH, 'utf8');
  const match   = content.match(/^INSTAGRAM_ACCESS_TOKEN=(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Salva o novo token no .env, preservando todas as outras variáveis.
 */
function saveTokenToEnv(newToken) {
  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';

  if (content.includes('INSTAGRAM_ACCESS_TOKEN=')) {
    content = content.replace(
      /^INSTAGRAM_ACCESS_TOKEN=.*/m,
      `INSTAGRAM_ACCESS_TOKEN=${newToken}`
    );
  } else {
    content += `\nINSTAGRAM_ACCESS_TOKEN=${newToken}`;
  }

  fs.writeFileSync(ENV_PATH, content, 'utf8');
}

// ── Renovação ─────────────────────────────────────────────────────────────────

async function refreshToken() {
  // Prefere o token do .env em disco ao invés do já carregado pelo dotenv
  // (garante que renovações anteriores automáticas são lidas corretamente)
  const token = readTokenFromEnv() || process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    const msg = 'INSTAGRAM_ACCESS_TOKEN não encontrado no .env';
    log.error('refresh-token', msg);
    console.error(`❌ ${msg}`);
    console.error('   Gere um token manualmente: docs/setup-instagram-api.md → Seção 5');
    process.exit(1);
  }

  console.log('🔄 Renovando Instagram Access Token...');

  const url = `https://graph.instagram.com/refresh_access_token` +
              `?grant_type=ig_refresh_token&access_token=${token}`;

  let data;
  try {
    const res = await fetch(url);
    data = await res.json();
  } catch (fetchErr) {
    const msg = `Sem conexão com a API do Instagram: ${fetchErr.message}`;
    log.error('refresh-token', msg);
    console.error(`❌ ${msg}`);
    process.exit(1);
  }

  // ── Erro da API ────────────────────────────────────────────────────────────
  if (data.error) {
    const { code, message: apiMsg, type } = data.error;

    // Código 190 = token expirado ou inválido — não dá pra renovar, exige intervenção
    const expired = code === 190 || /expired|invalid/i.test(apiMsg);

    const logMsg = expired
      ? `Token EXPIRADO — renovação automática não é possível. Gere um novo manualmente.`
      : `Erro da API Instagram [${code}]: ${apiMsg}`;

    log.error('refresh-token', logMsg, { code, type });
    console.error(`❌ ${logMsg}`);

    if (expired) {
      console.error('');
      console.error('   ➡️  Siga: docs/setup-instagram-api.md → Seção 5 para gerar novo token');
      console.error('   ➡️  Após gerar, cole no .env: INSTAGRAM_ACCESS_TOKEN=<novo_token>');
    }

    process.exit(1);
  }

  // ── Sucesso ────────────────────────────────────────────────────────────────
  const newToken    = data.access_token;
  const expiresIn   = data.expires_in; // segundos
  const expiresDays = Math.round(expiresIn / 86400);
  const expiresDate = new Date(Date.now() + expiresIn * 1000)
    .toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  saveTokenToEnv(newToken);

  const okMsg = `Token renovado — expira em ${expiresDays} dias (${expiresDate})`;
  log.ok('refresh-token', okMsg, { expires_days: expiresDays, expires_date: expiresDate });
  console.log(`✅ ${okMsg}`);
  console.log('   .env atualizado com o novo token.');

  // Aviso antecipado se o token retornado já vier com prazo curto
  if (expiresDays < 45) {
    log.warn('refresh-token', `Token novo com prazo curto (${expiresDays} dias) — verifique manualmente`, {
      expires_days: expiresDays,
    });
    console.warn(`⚠️  Atenção: o token renovado já vem com apenas ${expiresDays} dias — verifique se a API retornou corretamente.`);
  }
}

// ── Entrypoint ────────────────────────────────────────────────────────────────

refreshToken().catch(err => {
  log.error('refresh-token', `Erro inesperado: ${err.message}`, { erro: err.message });
  console.error(`❌ Erro inesperado: ${err.message}`);
  process.exit(1);
});
