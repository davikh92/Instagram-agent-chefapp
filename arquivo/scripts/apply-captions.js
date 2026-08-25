#!/usr/bin/env node
/**
 * apply-captions.js — aplica a nova arquitetura de caption (item 5 da auditoria)
 *
 * Reescreve as captions seguindo a disciplina de crescimento:
 *   - Hook de identificação na linha 1 (nunca começa pelo app)
 *   - CTA rotacionado por intenção (salvar/comentar/marcar/seguir/app)
 *   - App ("link na bio") em no máximo 1/3 das captions
 *
 * Atualiza de forma consistente:
 *   1. data/veo-queue.json e data/image-queue.json (caption do item)
 *   2. ready-to-post/.../[id]/caption.txt (o que o publish.js realmente posta)
 *
 * Pula itens já publicados (published.json presente).
 *
 * Uso: node scripts/apply-captions.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..');
const READY_DIR = path.join(ROOT, 'ready-to-post');

// ── Novas captions (corpo, sem hashtags) — keyed por id ──────────────────────
// Cada uma: HOOK de identificação → corpo → CTA rotacionado.
// Quinta-feira = dia de CTA do app. Resto puxa salvar/comentar/marcar/seguir.

const CAPTIONS = {
  // ── 1ª quinzena ────────────────────────────────────────────────────────────
  'reel-food-06-massa':
    "Sexta-feira tem cara de massa. Sempre teve. 🍝\n\nAquela que você faz sem pensar muito — porque a semana já foi pensada antes.\n\nSalva pra sexta que vem 🔖",

  'reel-food-11-feira':
    "Sábado de feira é o melhor tipo de sábado. 🥬\n\nSacola cheia, cabeça leve, semana já resolvida na cabeça.\n\nSegue pra mais ideia de comida de verdade 🍳",

  'reel-food-07-mesa':
    "Segunda-feira podia ser sempre assim: jantar pronto, todo mundo na mesa. 🕯️\n\nSem aquele branco das 18h encarando a geladeira aberta.\n\nSalva pra quando bater o branco das 18h 🔖",

  'reel-food-12-salada':
    "Almoço de terça sem ideia? Já fui rainha disso. 🥗\n\nHoje é só montar e comer — a decisão difícil já foi tomada antes.\n\nComenta aqui: salada salva ou enjoa rápido? 👇",

  'reel-food-09-ervas':
    "Você não odeia cozinhar. Você odeia não saber o que cozinhar. 🌿\n\nÉ outra história quando o que fazer já tá decidido — aí sobra só a parte boa.\n\nMarca aquela amiga que vive o perrengue das 18h 👇",

  'reel-food-10-massa-quinta':
    "Amanhã é sexta. Hoje já merece uma massa também, né? 🍝\n\nSem receita decorada, sem stress — só seguir o cardápio que já tá pronto.\n\nLink na bio pra testar grátis →",

  'reel-food-08-limao':
    "O segredo da comida boa às vezes cabe num limão espremido na hora. 🍋\n\nDetalhe pequeno, diferença gigante. O resto é seguir o plano da semana.\n\nSalva esse pra sexta 🔖",

  'reel-food-13-marmita':
    "Sábado de marmita é o que segura a semana inteira. 🫙\n\nDuas horas hoje, cinco jantares sem pensar depois.\n\nSegue pra mais ideia de preparo da semana 🍳",

  // ── 2ª quinzena ────────────────────────────────────────────────────────────
  'reel-food-14-pao':
    "Segunda começa diferente quando o café da manhã já é uma vitória. 🍞\n\nPão quentinho, cabeça tranquila — porque a semana já tá planejada.\n\nSalva pra segunda que vem 🔖",

  'reel-food-15-bowl':
    "Esse bowl parece difícil. Não é. É só ter os ingredientes certos em casa. 🥣\n\nE ter em casa é justo a parte que a gente sempre esquece, né?\n\nComenta: o que SEMPRE falta na sua geladeira? 👇",

  'reel-food-16-feira':
    "Quarta-feira: metade da semana, geladeira pela metade. 🥕\n\nQuando a lista de compras já saiu pronta, nem isso vira problema.\n\nMarca quem precisa organizar a feira 👇",

  'reel-food-17-ovos':
    "Às vezes a receita mais inteligente é a mais simples. 🍳\n\nDois ovos, cebolinha, cinco minutos. Comida de verdade não precisa ser complicada.\n\nLink na bio pra testar grátis →",

  'reel-food-18-suco':
    "Sexta-feira fechando a semana — e fechando bem. 🥤\n\nVerde, gelado, sem culpa. Igual a semana que sai do jeito que você planejou.\n\nSalva pra começar a semana que vem 🔖",

  'reel-food-19-mesa-cafe':
    "Sábado de manhã sem pressa é um luxo subestimado. ☕\n\nMesa posta, café passado, ninguém correndo. Isso acontece quando a semana foi planejada.\n\nSegue pra mais café da manhã de fim de semana 🍳",

  'reel-food-20-sopa':
    "Segunda de inverno só pede uma coisa: sopa quente e fim de papo. 🍲\n\nAquele conforto que faz a segunda parecer um pouco menos segunda.\n\nSalva pro próximo dia frio 🔖",

  'reel-food-21-compras':
    "Lista de compras sem esquecer nada e sem comprar repetido. Existe? 🛒\n\nExiste quando ela já sai pronta — você só pega no mercado.\n\nComenta: você faz lista ou vai no improviso? 👇",

  'reel-food-22-temperos':
    "A diferença entre 'tá bom' e 'que delícia' cabe numa pitada. 🌶️\n\nTempero na medida certa não é dom — é receita bem feita.\n\nMarca quem cozinha sempre no susto 👇",

  'reel-food-23-mesa-jantar':
    "Mesa posta, todo mundo em volta. É disso que a semana se trata. 🍽️\n\nE dá pra chegar aqui todo dia quando o cardápio já está decidido.\n\nLink na bio pra testar grátis →",

  'reel-food-24-macarrao':
    "Sexta com gosto de conquista: a semana foi cumprida. 🍝\n\nVocê planejou, você executou. Esse macarrão é o troféu.\n\nSalva pra fechar a próxima semana assim 🔖",

  'reel-food-25-cafe':
    "Sábado começa devagar. Do jeito que sábado merece. ☕\n\nSem pressa porque a semana inteira já foi resolvida antes.\n\nSegue pra mais momento de cozinha boa 🍳",

  'reel-food-26-geladeira':
    "Segunda-feira começa no domingo. Geladeira pronta = semana resolvida. 🥡\n\nAbrir a geladeira e já saber o que tem é um pequeno grande luxo.\n\nSalva pra organizar a sua 🔖",

  'reel-food-27-fruta':
    "Última terça do mês. Julho chegando com cara de recomeço. 🥭\n\nMês novo, cardápio novo, mesma vontade de comer bem sem complicar.\n\nComenta: qual fruta não pode faltar na sua casa? 👇",

  // ── Posts estáticos de domingo (Imagen) ──────────────────────────────────────
  'post-domingo-07jun':
    "Domingo é dia de decidir a semana inteira em 2 minutos. 🗓️\n\nCardápio montado, lista pronta, segunda-feira sem drama.\n\nComenta: você planeja a semana ou improvisa todo dia? 👇",

  'post-domingo-14jun':
    "Domingo de recomeço. Semana nova, cardápio novo. 🌿\n\nVocê não precisa reinventar a roda toda semana — só ter um ponto de partida.\n\nComenta: qual prato não pode faltar na sua semana? 👇",

  'post-domingo-21jun':
    "Domingo de receita nova. Qual vai ser a novidade da semana? 🌿\n\nTestar prato diferente é mais fácil quando alguém já sugeriu por você.\n\nComenta: qual receita você quer aprender? 👇",

  'post-domingo-28jun':
    "Domingo preparado, semana conquistada. 🫙\n\nDuas horas de preparo hoje valem cinco jantares tranquilos depois.\n\nComenta: você é time meal prep ou cozinha na hora? 👇",
};

// ── Aplicação ─────────────────────────────────────────────────────────────────

function loadQueue(file) {
  const p = path.join(ROOT, 'data', file);
  if (!fs.existsSync(p)) return null;
  return { path: p, items: JSON.parse(fs.readFileSync(p, 'utf8')) };
}

function findFolder(id, date) {
  const month = date.slice(0, 7);
  const dir   = path.join(READY_DIR, month, date, id);
  return fs.existsSync(dir) ? dir : null;
}

let updatedQueue = 0, updatedTxt = 0, skipped = 0;

for (const file of ['veo-queue.json', 'image-queue.json']) {
  const queue = loadQueue(file);
  if (!queue) continue;

  let dirty = false;
  for (const item of queue.items) {
    const novo = CAPTIONS[item.id];
    if (!novo) continue;

    // Atualiza caption na fila
    if (item.caption !== novo) {
      item.caption = novo;
      dirty = true;
      updatedQueue++;
    }

    // Atualiza caption.txt na pasta (se existir e não publicado)
    const folder = findFolder(item.id, item.date);
    if (folder) {
      if (fs.existsSync(path.join(folder, 'published.json'))) {
        console.log(`  ⏭  ${item.id} — já publicado, caption.txt preservado`);
        skipped++;
        continue;
      }
      const captionTxt = `${novo}\n\n${item.hashtags || ''}`.trim() + '\n';
      fs.writeFileSync(path.join(folder, 'caption.txt'), captionTxt, 'utf8');
      updatedTxt++;
      console.log(`  ✓ ${item.id} — caption.txt atualizado`);
    }
  }

  if (dirty) {
    fs.writeFileSync(queue.path, JSON.stringify(queue.items, null, 2) + '\n', 'utf8');
    console.log(`  💾 ${file} salvo`);
  }
}

console.log(`\n──────────────────────────────────────`);
console.log(`✅ Captions na fila: ${updatedQueue} | caption.txt: ${updatedTxt} | pulados (publicados): ${skipped}`);
