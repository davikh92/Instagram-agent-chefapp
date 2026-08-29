#!/usr/bin/env node
/**
 * criar-boards.js — cria (ou reconhece) os boards do config e guarda os ids.
 *
 * Uso:
 *   node scripts/pinterest/criar-boards.js
 *   node scripts/pinterest/criar-boards.js --dry-run
 *
 * Idempotente: board que já existe com o mesmo nome é reaproveitado, nunca
 * duplicado. Pode rodar quantas vezes quiser.
 *
 * O resultado vai pra data/pinterest/boards.json, que é o que o publicar.js
 * consulta pra saber onde cada pin entra. Nome de board é campo de busca no
 * Pinterest — por isso ele vem do config, não é inventado aqui.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const api = require('./lib/api');
const log = require('../lib/logger');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG = path.join(ROOT, 'data', 'pinterest', 'config.json');
const BOARDS = path.join(ROOT, 'data', 'pinterest', 'boards.json');

const lerJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const config = lerJson(CONFIG);

  const token = await api.pegarAccessToken();
  const existentes = await api.listarBoards(token);
  console.log(`\n📋 ${existentes.length} board(s) já na conta.`);

  const mapa = fs.existsSync(BOARDS) ? lerJson(BOARDS) : {};

  for (const board of config.boards) {
    const achado = existentes.find(
      (b) => b.name.trim().toLowerCase() === board.nome.trim().toLowerCase()
    );

    if (achado) {
      mapa[board.nome] = achado.id;
      console.log(`  = ${board.nome}  (já existe · ${achado.id})`);
      continue;
    }

    if (dryRun) {
      console.log(`  + ${board.nome}  (criaria)`);
      continue;
    }

    const criado = await api.criarBoard(token, { nome: board.nome, descricao: board.descricao });
    mapa[board.nome] = criado.id;
    console.log(`  ✓ ${board.nome}  (criado · ${criado.id})`);
  }

  if (dryRun) {
    console.log('\n🔍 Modo seco — nada foi criado nem gravado.\n');
    return;
  }

  fs.mkdirSync(path.dirname(BOARDS), { recursive: true });
  fs.writeFileSync(BOARDS, `${JSON.stringify(mapa, null, 2)}\n`, 'utf8');

  console.log(`\n✅ ${Object.keys(mapa).length} board(s) mapeados em data/pinterest/boards.json\n`);
  log.ok('pinterest', `Boards prontos: ${Object.keys(mapa).length}`);
}

main().catch((err) => {
  log.error('pinterest', `criar-boards falhou: ${err.message}`);
  console.error(`\n❌ ${err.message}\n`);
  process.exit(1);
});
