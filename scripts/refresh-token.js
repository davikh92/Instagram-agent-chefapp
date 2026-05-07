#!/usr/bin/env node
/**
 * refresh-token.js — renova o Instagram Long-Lived Access Token
 *
 * O token dura 60 dias. Execute este script a cada 30 dias para renovar.
 * O novo token é salvo automaticamente no .env.
 *
 * Uso: node scripts/refresh-token.js
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..');
const ENV_PATH  = path.join(ROOT, '.env');

async function refreshToken() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    console.error('❌ INSTAGRAM_ACCESS_TOKEN não encontrado no .env');
    process.exit(1);
  }

  console.log('🔄 Renovando Instagram Access Token...');

  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`;
  const res  = await fetch(url);
  const data = await res.json();

  if (data.error) {
    console.error(`❌ Erro ao renovar: ${data.error.message}`);
    console.error('   O token pode ter expirado. Gere um novo manualmente.');
    console.error('   Veja: docs/setup-instagram-api.md → Seção 5');
    process.exit(1);
  }

  const newToken   = data.access_token;
  const expiresIn  = data.expires_in; // segundos
  const expiresDays = Math.round(expiresIn / 86400);
  const expiresDate = new Date(Date.now() + expiresIn * 1000).toLocaleDateString('pt-BR');

  console.log(`✅ Token renovado! Expira em ${expiresDays} dias (${expiresDate})`);

  // Atualiza .env
  let envContent = '';
  if (fs.existsSync(ENV_PATH)) {
    envContent = fs.readFileSync(ENV_PATH, 'utf8');
  }

  if (envContent.includes('INSTAGRAM_ACCESS_TOKEN=')) {
    envContent = envContent.replace(
      /^INSTAGRAM_ACCESS_TOKEN=.*/m,
      `INSTAGRAM_ACCESS_TOKEN=${newToken}`
    );
  } else {
    envContent += `\nINSTAGRAM_ACCESS_TOKEN=${newToken}`;
  }

  fs.writeFileSync(ENV_PATH, envContent, 'utf8');
  console.log('✓ .env atualizado com o novo token');
}

refreshToken().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
