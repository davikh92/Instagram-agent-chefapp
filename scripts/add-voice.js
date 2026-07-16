#!/usr/bin/env node
/**
 * add-voice.js — cola voz PT-BR (ElevenLabs) sobre reels já gerados
 *
 * Roda DEPOIS do generate-omni.js, no mesmo job. Motivo de ser script separado
 * e não parte do generate-omni.js: o skip de lá é "se reel.mp4 existe, pular".
 * Se a dublagem morasse lá e falhasse, o MP4 de ~$1 já existiria e a voz nunca
 * mais entraria. Separado, o retry custa só centavos de TTS.
 *
 * Processa apenas itens da fila que têm `voiceText`. IMERSÃO não tem — é
 * ambiente puro por definição (ver "Cérebro Editorial" em docs/veo-prompt-guide.md).
 *
 * Idempotente: pula quem já tem `voiceAddedAt` no reel.json.
 * Se o MP4 não estiver em disco (runner efêmero), baixa do Cloudinary.
 * Re-sobe com o mesmo public_id → a URL do reel.json não muda.
 *
 * Uso:
 *   node scripts/add-voice.js --all
 *   node scripts/add-voice.js --queue data/x.json --out tests/omni
 *
 * Env (.env): ELEVENLABS_API_KEY, CLOUDINARY_*
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const log = require('./lib/logger');

require('dotenv').config();

let ffmpegPath;
try {
  ffmpegPath = require('ffmpeg-static');
} catch {
  ffmpegPath = 'ffmpeg';
}

const ROOT = path.resolve(__dirname, '..');
const READY_DIR = path.join(ROOT, 'ready-to-post');

// ── Config ───────────────────────────────────────────────────────────────────

const { ELEVENLABS_API_KEY } = process.env;

// Voz oficial definida em jul/2026 — ver CLAUDE.md § Regras Absolutas de Conteúdo
const VOICE_ID = 'UZ8QqWVrz7tMdxiglcLh';   // Livia - Warm, Expressive and Calm
const TTS_MODEL = 'eleven_multilingual_v2';

// A voz entra no segundo 1, nunca no 0 — o hook visual vem primeiro
const VOICE_DELAY_SEC = 1.0;

// Ambiente abaixa para 30% enquanto a voz fala, volta a 100% depois
const DUCK_LEVEL = 0.3;

function checkEnv() {
  if (!ELEVENLABS_API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY não encontrada em .env');
    console.error('\nObtenha em https://elevenlabs.io/app/settings/api-keys');
    process.exit(1);
  }
}

// ── ElevenLabs ───────────────────────────────────────────────────────────────

/**
 * Gera o áudio da fala via ElevenLabs TTS.
 * @param {string} text
 * @returns {Promise<Buffer>} bytes do MP3
 */
async function generateSpeech(text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, model_id: TTS_MODEL }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs API (${res.status}): ${body.substring(0, 200)}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

// ── ffmpeg ───────────────────────────────────────────────────────────────────

/**
 * Duração de um arquivo de áudio/vídeo em segundos.
 * Usa ffmpeg (não ffprobe) porque só ffmpeg-static está instalado —
 * lê o "Duration: HH:MM:SS.ms" que o ffmpeg imprime no stderr.
 */
function getDuration(filePath) {
  let out = '';
  try {
    execFileSync(ffmpegPath, ['-i', filePath], { stdio: 'pipe' });
  } catch (err) {
    out = String(err.stderr || '');
  }
  const m = out.match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/);
  if (!m) throw new Error(`Não foi possível ler a duração de ${path.basename(filePath)}`);
  return (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]);
}

/**
 * Mixa a voz sobre o áudio ambiente do vídeo.
 * O ambiente abaixa só na janela da fala e volta ao normal depois — o som
 * ambiente do Omni é bom demais pra ficar abafado os 10 segundos inteiros.
 * O vídeo é copiado sem re-encode (-c:v copy): sem perda de qualidade.
 */
function mixVoiceIntoVideo(videoPath, voicePath, outPath) {
  const voiceDur = getDuration(voicePath);
  const duckStart = Math.max(0, VOICE_DELAY_SEC - 0.2);
  const duckEnd = VOICE_DELAY_SEC + voiceDur + 0.2;
  const delayMs = Math.round(VOICE_DELAY_SEC * 1000);

  const filter = [
    `[0:a]volume=${DUCK_LEVEL}:enable='between(t,${duckStart.toFixed(2)},${duckEnd.toFixed(2)})'[amb]`,
    `[1:a]adelay=${delayMs}|${delayMs}[voz]`,
    `[amb][voz]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[aout]`,
  ].join(';');

  execFileSync(ffmpegPath, [
    '-i', videoPath,
    '-i', voicePath,
    '-filter_complex', filter,
    '-map', '0:v',
    '-map', '[aout]',
    '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '192k',
    '-y', outPath,
  ], { stdio: 'pipe' });

  return voiceDur;
}

// ── Processamento ────────────────────────────────────────────────────────────

async function downloadFromCloudinary(url, destPath) {
  console.log(`  ☁️  MP4 não está em disco — baixando do Cloudinary...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download do Cloudinary falhou (${res.status})`);
  fs.writeFileSync(destPath, Buffer.from(await res.arrayBuffer()));
}

async function processReel(config, outRoot) {
  const { id, date, voiceText } = config;

  if (!voiceText) return { status: 'sem-voz' };

  const outDir = outRoot === READY_DIR
    ? path.join(outRoot, date.slice(0, 7), date, id)
    : path.join(outRoot, id);

  const reelJsonPath = path.join(outDir, 'reel.json');
  if (!fs.existsSync(reelJsonPath)) {
    console.log(`  ⏭  ${id} — ainda não gerado, pulando`);
    return { status: 'nao-gerado' };
  }

  const meta = JSON.parse(fs.readFileSync(reelJsonPath, 'utf8').replace(/^﻿/, ''));

  if (meta.voiceAddedAt) {
    console.log(`  ⏭  ${id} — voz já adicionada, pulando`);
    return { status: 'ja-tem' };
  }

  if (fs.existsSync(path.join(outDir, 'published.json'))) {
    console.log(`  ⏭  ${id} — já publicado, não mexer`);
    return { status: 'publicado' };
  }

  console.log(`\n🎙️  ${id} — "${voiceText}"`);

  const mp4Path = path.join(outDir, 'reel.mp4');
  if (!fs.existsSync(mp4Path)) {
    if (!meta.cloudinaryUrl) {
      console.log(`  ✗ ${id} — sem MP4 local nem cloudinaryUrl`);
      return { status: 'sem-midia' };
    }
    await downloadFromCloudinary(meta.cloudinaryUrl, mp4Path);
  }

  // TTS
  const voicePath = path.join(outDir, 'voice.mp3');
  const audio = await generateSpeech(voiceText);
  fs.writeFileSync(voicePath, audio);
  console.log(`  ✓ Voz gerada (${(audio.length / 1024).toFixed(0)} KB)`);

  // Mix
  const mixedPath = path.join(outDir, 'reel-voiced.mp4');
  const voiceDur = mixVoiceIntoVideo(mp4Path, voicePath, mixedPath);
  console.log(`  ✓ Mix: voz de ${voiceDur.toFixed(1)}s entrando no ${VOICE_DELAY_SEC}s, ambiente a ${DUCK_LEVEL * 100}% durante a fala`);

  // O arquivo com voz passa a ser o reel oficial
  fs.rmSync(mp4Path);
  fs.renameSync(mixedPath, mp4Path);

  // Re-sobe com o mesmo public_id → a URL não muda, o publish.js nem percebe
  let cloudinaryMeta = {};
  try {
    const storage = require('./lib/cloudinary-storage');
    const coverPath = path.join(outDir, 'cover.png');
    const result = await storage.uploadReel(id, mp4Path, fs.existsSync(coverPath) ? coverPath : null);
    if (result) cloudinaryMeta = result;
  } catch (err) {
    // Sem re-upload o Cloudinary segue com a versão muda, que é a que o
    // publish.js usa — melhor falhar e deixar o retry tentar de novo.
    console.warn(`  ⚠️  Re-upload falhou: ${err.message} — Cloudinary ainda tem a versão MUDA`);
    throw err;
  }

  fs.writeFileSync(reelJsonPath, JSON.stringify({
    ...meta,
    ...cloudinaryMeta,
    voiceText,
    voiceId: VOICE_ID,
    voiceModel: TTS_MODEL,
    voiceDurationSec: Number(voiceDur.toFixed(2)),
    voiceAddedAt: new Date().toISOString(),
  }, null, 2), 'utf8');

  console.log(`  ✅ ${id} dublado`);
  log.ok('voz', `Voz adicionada: ${id}`, { id, voiceText });
  return { status: 'ok' };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  checkEnv();

  const args = process.argv.slice(2);
  const allFlag = args.includes('--all');
  const queueIdx = args.indexOf('--queue');
  const outIdx = args.indexOf('--out');

  if (!allFlag && queueIdx === -1) {
    console.log('\nUso:');
    console.log('  node scripts/add-voice.js --all');
    console.log('  node scripts/add-voice.js --queue <arquivo.json> [--out <dir>]');
    process.exit(0);
  }

  const queuePath = queueIdx !== -1
    ? path.resolve(args[queueIdx + 1])
    : path.join(ROOT, 'data', 'veo-queue.json');

  const outRoot = outIdx !== -1 ? path.resolve(args[outIdx + 1]) : READY_DIR;

  if (!fs.existsSync(queuePath)) {
    console.error(`❌ Fila não encontrada: ${queuePath}`);
    process.exit(1);
  }

  const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8').replace(/^﻿/, ''));
  const comVoz = queue.filter(r => r.voiceText);

  console.log(`\n🎙️  ${comVoz.length} de ${queue.length} item(ns) têm voz (IMERSÃO é ambiente puro)`);
  console.log(`   Voz: Livia (${VOICE_ID}) · ${TTS_MODEL}`);

  let ok = 0, erros = 0;
  for (const item of comVoz) {
    try {
      const r = await processReel(item, outRoot);
      if (r.status === 'ok') ok++;
    } catch (err) {
      erros++;
      console.error(`  ✗ ${item.id}: ${err.message}`);
      log.error('voz', `Falha ao dublar ${item.id}: ${err.message}`, { id: item.id, erro: err.message });
    }
  }

  console.log(`\n──────────────────────────────────────`);
  console.log(`✅ ${ok} dublado(s)${erros ? ` · ${erros} falha(s)` : ''}`);
}

main().catch(err => {
  log.error('voz', `Erro fatal: ${err.message}`, { erro: err.message });
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
