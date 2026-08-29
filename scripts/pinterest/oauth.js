#!/usr/bin/env node
/**
 * oauth.js — pega o refresh token da Pinterest. Roda UMA vez, na sua máquina.
 *
 * Uso:
 *   node scripts/pinterest/oauth.js
 *
 * O que acontece:
 *   1. sobe um servidor local em http://localhost:8412/callback
 *   2. imprime a URL de autorização da Pinterest
 *   3. você aprova no navegador, logado na conta comercial
 *   4. o código volta pro servidor local e é trocado por um refresh token
 *   5. o token é impresso AQUI no seu terminal
 *
 * ⚠️ O refresh token é credencial. Ele aparece só no seu terminal:
 *    cole no .env e no GitHub Secret. Não cole em chat, não commite.
 *    O .gitignore já cobre .env e .env.*
 *
 * Pré-requisito: no app em developers.pinterest.com, cadastre exatamente
 * esta URL de redirect:  http://localhost:8412/callback
 */

require('dotenv').config();

const http = require('http');
const crypto = require('crypto');

const PORTA = 8412;
const REDIRECT = `http://localhost:${PORTA}/callback`;
const API = 'https://api.pinterest.com/v5';

// Escopos: ler e escrever pins e boards. Nada de anúncios.
const ESCOPOS = ['boards:read', 'boards:write', 'pins:read', 'pins:write', 'user_accounts:read'];

function exigirEnv(chave) {
  if (!process.env[chave]) {
    console.error(`\n❌ Falta ${chave} no .env.`);
    console.error('   Crie o app em https://developers.pinterest.com/apps/ e copie as credenciais.');
    console.error('   Ver docs/setup-pinterest.md\n');
    process.exit(1);
  }
  return process.env[chave];
}

async function trocarCodigoPorToken(codigo) {
  const basic = Buffer.from(
    `${process.env.PINTEREST_APP_ID}:${process.env.PINTEREST_APP_SECRET}`
  ).toString('base64');

  const r = await fetch(`${API}/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: codigo,
      redirect_uri: REDIRECT,
    }),
  });

  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${JSON.stringify(corpo).slice(0, 400)}`);
  return corpo;
}

function main() {
  const appId = exigirEnv('PINTEREST_APP_ID');
  exigirEnv('PINTEREST_APP_SECRET');

  // O state protege contra alguém devolver um código que não foi você que pediu.
  const state = crypto.randomBytes(16).toString('hex');

  const urlAutorizacao = `https://www.pinterest.com/oauth/?${new URLSearchParams({
    client_id: appId,
    redirect_uri: REDIRECT,
    response_type: 'code',
    scope: ESCOPOS.join(','),
    state,
  })}`;

  const servidor = http.createServer(async (reqHttp, res) => {
    const url = new URL(reqHttp.url, `http://localhost:${PORTA}`);
    if (url.pathname !== '/callback') { res.writeHead(404).end(); return; }

    const responder = (texto) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<body style="font-family:system-ui;padding:60px;background:#1E1810;color:#F7F2EA">
        <h2>${texto}</h2><p>Pode fechar esta aba e voltar pro terminal.</p></body>`);
    };

    if (url.searchParams.get('state') !== state) {
      responder('❌ State não confere — tentativa recusada.');
      console.error('\n❌ State não confere. Rode de novo.\n');
      servidor.close(); process.exit(1);
    }

    const erro = url.searchParams.get('error');
    if (erro) {
      responder(`❌ Pinterest recusou: ${erro}`);
      console.error(`\n❌ Pinterest recusou: ${erro}\n`);
      servidor.close(); process.exit(1);
    }

    try {
      const token = await trocarCodigoPorToken(url.searchParams.get('code'));
      responder('✅ Autorizado. Volte pro terminal.');

      console.log('\n══════════════════════════════════════════════════════════');
      console.log('  ✅ REFRESH TOKEN — cole nos dois lugares abaixo');
      console.log('══════════════════════════════════════════════════════════\n');
      console.log(`PINTEREST_REFRESH_TOKEN=${token.refresh_token}\n`);
      console.log('  1) no arquivo .env (nunca commitado)');
      console.log('  2) no GitHub: Settings → Secrets → Actions → New secret');
      console.log('     nome: PINTEREST_REFRESH_TOKEN\n');
      console.log(`  Validade: ~${Math.round((token.refresh_token_expires_in || 31536000) / 86400)} dias.`);
      console.log('  ⚠️  Não cole esse token em chat nenhum.\n');

      servidor.close();
      process.exit(0);
    } catch (e) {
      responder('❌ Falhou a troca do código. Veja o terminal.');
      console.error(`\n❌ ${e.message}\n`);
      servidor.close(); process.exit(1);
    }
  });

  servidor.listen(PORTA, () => {
    console.log('\n🔗 Abra esta URL no navegador (logado na conta comercial):\n');
    console.log(`${urlAutorizacao}\n`);
    console.log(`Esperando o retorno em ${REDIRECT} …`);
    console.log('(cadastre exatamente essa URL de redirect no app da Pinterest)\n');
  });
}

main();
