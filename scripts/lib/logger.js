/**
 * logger.js — log de eventos compartilhado por todos os scripts.
 *
 * Grava eventos estruturados em logs/eventos.jsonl (uma linha JSON por evento).
 * O dashboard lê esse arquivo e mostra erros em vermelho no topo —
 * é assim que você fica sabendo quando algo quebra rodando sozinho.
 *
 * Uso:
 *   const log = require('./lib/logger');
 *   log.ok('publish',  'Reel publicado', { id: 'reel-food-05', mediaId: '123' });
 *   log.warn('veo',    'Caption vazia',  { id: 'reel-x' });
 *   log.error('veo',   'Quota esgotada', { id: 'reel-y', code: 429 });
 */

const fs   = require('fs');
const path = require('path');

const ROOT     = path.resolve(__dirname, '..', '..');
const LOG_DIR  = path.join(ROOT, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'eventos.jsonl');

// Mantém o arquivo enxuto — só os últimos N eventos importam
const MAX_LINES = 500;

/** Timestamp no fuso de Brasília (America/Sao_Paulo), formato ISO-like. */
function brasiliaNow() {
  // sv-SE dá "YYYY-MM-DD HH:mm:ss" — ordenável e legível
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' });
}

function write(level, script, message, extra = {}) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });

    const entry = { ts: brasiliaNow(), level, script, message, ...extra };
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', 'utf8');

    // Rotação simples: se passar de MAX_LINES, mantém só a cauda
    const lines = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(Boolean);
    if (lines.length > MAX_LINES) {
      fs.writeFileSync(LOG_FILE, lines.slice(-MAX_LINES).join('\n') + '\n', 'utf8');
    }
  } catch {
    // Log nunca pode derrubar o script principal — falha silenciosa
  }

  // Espelha no console também (útil quando rodando manualmente)
  const icon = level === 'error' ? '❌' : level === 'warn' ? '⚠️ ' : '✓';
  const detail = extra.id ? ` [${extra.id}]` : '';
  console.log(`${icon} ${message}${detail}`);
}

module.exports = {
  ok:    (script, message, extra) => write('ok',    script, message, extra),
  warn:  (script, message, extra) => write('warn',  script, message, extra),
  error: (script, message, extra) => write('error', script, message, extra),
  LOG_FILE,
};
