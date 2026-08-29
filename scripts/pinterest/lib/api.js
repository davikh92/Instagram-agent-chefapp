/**
 * api.js — cliente da Pinterest API v5.
 *
 * Só o que a gente usa: token, boards, upload de vídeo e criação de pin.
 *
 * Autenticação: guardamos SÓ o refresh token (vale ~1 ano). O access token
 * (curto) é trocado a cada execução e nunca é gravado em lugar nenhum — foi
 * assim que o token do Instagram nos deu trabalho, e aqui já nasce resolvido.
 *
 * ⚠️ Acesso Trial: pins criados ficam visíveis SÓ pra conta que criou
 * (entidades de sandbox). Pra pin público é preciso Standard access, que a
 * Pinterest concede após revisão. Ver docs/setup-pinterest.md.
 */

const API = 'https://api.pinterest.com/v5';

/** Erro com corpo da resposta — sem isso, depurar 400 da Pinterest é adivinhação. */
class PinterestError extends Error {
  constructor(status, corpo, contexto) {
    const detalhe = typeof corpo === 'string' ? corpo : JSON.stringify(corpo);
    super(`${contexto} → HTTP ${status}: ${String(detalhe).slice(0, 400)}`);
    this.status = status;
    this.corpo = corpo;
  }
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Troca o refresh token por um access token.
 * O par app_id:app_secret vai em Basic auth, como a Pinterest exige.
 */
async function pegarAccessToken() {
  const faltando = ['PINTEREST_APP_ID', 'PINTEREST_APP_SECRET', 'PINTEREST_REFRESH_TOKEN']
    .filter((k) => !process.env[k]);
  if (faltando.length) {
    throw new Error(`Faltam variáveis no .env / secrets: ${faltando.join(', ')}. Ver docs/setup-pinterest.md`);
  }

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
      grant_type: 'refresh_token',
      refresh_token: process.env.PINTEREST_REFRESH_TOKEN,
    }),
  });

  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new PinterestError(r.status, corpo, 'Renovar access token');
  return corpo.access_token;
}

/** Requisição autenticada à API. */
async function req(token, metodo, caminho, corpo) {
  const r = await fetch(`${API}${caminho}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(corpo ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(corpo ? { body: JSON.stringify(corpo) } : {}),
  });

  const texto = await r.text();
  let json;
  try { json = JSON.parse(texto); } catch { json = texto; }
  if (!r.ok) throw new PinterestError(r.status, json, `${metodo} ${caminho}`);
  return json;
}

// ── Boards ────────────────────────────────────────────────────────────────────

async function listarBoards(token) {
  const items = [];
  let cursor = null;
  do {
    const q = new URLSearchParams({ page_size: '25', ...(cursor ? { bookmark: cursor } : {}) });
    const r = await req(token, 'GET', `/boards?${q}`);
    items.push(...(r.items || []));
    cursor = r.bookmark || null;
  } while (cursor);
  return items;
}

async function criarBoard(token, { nome, descricao }) {
  return req(token, 'POST', '/boards', { name: nome, description: descricao });
}

// ── Upload de vídeo ───────────────────────────────────────────────────────────

/**
 * Sobe um MP4 e devolve o media_id pronto pra virar pin.
 *
 * São três etapas porque a Pinterest não aceita o arquivo direto:
 *   1. registra a intenção  → recebe media_id + upload_url + campos do S3
 *   2. manda os bytes pro S3 da Pinterest (sem Authorization: é URL assinada)
 *   3. espera processar     → só então o media_id serve pra criar o pin
 */
async function subirVideo(token, mp4Buffer, { tentativas = 40, intervaloMs = 3000 } = {}) {
  const registro = await req(token, 'POST', '/media', { media_type: 'video' });
  const { media_id: mediaId, upload_url: uploadUrl, upload_parameters: params } = registro;

  // A ordem importa: o S3 exige os campos assinados ANTES do arquivo.
  const form = new FormData();
  for (const [chave, valor] of Object.entries(params || {})) form.append(chave, String(valor));
  form.append('file', new Blob([mp4Buffer], { type: 'video/mp4' }), 'reel.mp4');

  const up = await fetch(uploadUrl, { method: 'POST', body: form });
  if (!up.ok) throw new PinterestError(up.status, await up.text(), 'Upload do MP4 pro S3');

  for (let i = 0; i < tentativas; i++) {
    await dormir(intervaloMs);
    const estado = await req(token, 'GET', `/media/${mediaId}`);
    if (estado.status === 'succeeded') return mediaId;
    if (estado.status === 'failed') {
      throw new Error(`Pinterest recusou o vídeo (media ${mediaId}): ${JSON.stringify(estado).slice(0, 300)}`);
    }
  }
  throw new Error(`Vídeo ainda processando após ${(tentativas * intervaloMs) / 1000}s (media ${mediaId})`);
}

// ── Pins ──────────────────────────────────────────────────────────────────────

/**
 * Cria o video pin. A capa é passada por URL (a nossa já está no Cloudinary),
 * então nenhuma imagem precisa ser gerada nem enviada.
 */
async function criarVideoPin(token, { boardId, titulo, descricao, link, mediaId, capaUrl, altText }) {
  return req(token, 'POST', '/pins', {
    board_id: boardId,
    title: titulo.slice(0, 100),
    description: descricao.slice(0, 800),
    link,
    ...(altText ? { alt_text: altText.slice(0, 500) } : {}),
    media_source: {
      source_type: 'video_id',
      media_id: mediaId,
      cover_image_url: capaUrl,
    },
  });
}

module.exports = {
  PinterestError,
  pegarAccessToken,
  listarBoards,
  criarBoard,
  subirVideo,
  criarVideoPin,
};
