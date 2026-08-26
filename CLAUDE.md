# Tem na Semana — Agentes de Conteúdo Instagram

## O Projeto
Equipe automatizada de produção de conteúdo para o Instagram do **Tem na Semana** —
monta a semana de comida da casa em minutos, e a lista de compras sai junto.

> ⚠️ **O nome do produto é "Tem na Semana", não "Luiza na Cozinha".**
> `luizanacozinha.com` é só o domínio de hoje, e vai mudar. **Nunca escreva URL à mão:**
> leia sempre de `data/product-context.json → fixo.app.url_canonica` e monte o caminho
> a partir de `fixo.links_uteis`. Link congelado vira link quebrado no dia da migração.

**Canal de validação:** Instagram — crescimento orgânico via Reels + Stories.
**Princípio central:** Identificação emocional SEMPRE antes de mostrar o app.
**Fase atual:** máquina rodando sozinha; análise ponta a ponta e novo plano em preparação — ver `docs/ROTEIRO.md`.

### A fronteira: quem manda em quê

> **O produto é do app; a produção é nossa.**
> O que o app **É** — nome, endereço, preço, o que faz, o que pode ser prometido —
> sai de `data/product-context.json`. Como aquilo vira post — cor, fonte, ritmo,
> gancho, hashtag, horário — está no `brand.json` e é decisão nossa.
>
> **Em caso de conflito:** o contexto manda na **afirmação**, a gente manda na
> **execução**. Post que promete o que o produto não faz é o post que está errado.
>
> **Nunca duplique** nome, URL, tagline, quem é a chef, o que pode/não pode ser dito,
> preços — campo que existe nos dois lugares diverge, e a gente só descobre num post
> já publicado. A versão viva desta regra chega em `fixo._contrato` a cada sync.

### Quem é o protagonista (regra que redefine tudo)

**A protagonista é a facilidade — a semana resolvida, a mesa de quem usa.**
A chef Luiza Hoffmann **assina** o cardápio: é a garantia de que aquilo foi pensado por
quem cozinha de verdade. Ela **não** é o rosto da comunicação, não é o assunto do post,
não é personagem.

> **Regra curta: chef assina cardápio; a história é da mesa de quem usa.**

Por quê: marca-pessoa é refém. Se o produto for "o app da Luiza", ele morre no dia em que
a Luiza sair. "Tem na Semana" é a casa; as chefs assinam o que está dentro. Hoje é uma —
por desenho, serão várias. **Escreva desde já de um jeito que sobreviva à entrada de
outras chefs:** fale da comida e da semana resolvida, não da biografia de quem cozinha.

Isso **não** é esconder a chef — a assinatura dela é o que separa o produto de "IA
inventando prato". Ela é a **garantia**, não o **assunto**.

**Duas vozes** (ver `fixo.posicionamento.duas_vozes`): a *plataforma* organiza — impessoal
e calorosa, "a gente", "pode deixar". A *chef* cozinha — primeira pessoa, quente, "vem que
é fácil". Marca na moldura, chef no conteúdo.

---

## Arquivos de Referência

| Arquivo | Função |
|---|---|
| `data/product-context.json` | Fonte de verdade do **produto** — nome, URL canônica, posicionamento, pode/não pode dizer, os 7 cardápios da casa com benefícios prontos, receitas, novidades liberadas. **Leia antes de escrever qualquer post.** **CACHE — nunca edite à mão:** gerado por `scripts/sync-contexto.js` a partir do RPC do app. Bloco `fixo` = escrito pelo time do app; bloco `atual` = sai do banco sozinho. |
| `brand.json` | Fonte de verdade da **execução** — paleta, fontes, CTAs, direção de arte, hashtags, tom de voz. Não contém nome, URL, tagline nem chef: esses vêm do contexto (ver `brand.json → _fronteira`). |
| `docs/DIRECAO_PARA_A_AUTOMACAO.md` | O contrato vindo do time do app: o que o conteúdo comunicava errado, o endpoint, e como pedir mudança do lado deles. |
| `docs/veo-prompt-guide.md` | **Cérebro editorial** — os 3 arquétipos (ESPELHO/RECEITA/VIRADA) e como escrever prompts de vídeo. |
| `docs/ROTEIRO.md` | **Estado atual + decisões tomadas + próximos passos.** Leia no início de qualquer sessão de planejamento. |
| `data/ciclo-01/fila/*.json` | **Filas de geração do Ciclo 01** (uma por bloco: novela, cardápios…). Consumidas por `generate-omni.js --queue`; os crons de geração iteram todas como rede de auto-cura. Campos extras: `ref` (imagem de referência), `coverAt` (segundo da capa), `link_dm` (link com UTM pra DM). |
| `data/veo-queue.json` | **Legado** — fila da grade antiga, 100% gerada até 31/08. Não recebe itens novos. |
| `data/story-queue.json` | Fila de Stories — Imagen 4 (fundo) + overlay HTML (texto), pilares Vitrine/Check-in/Gancho. **Prompts Imagen: cena pura, SEM palavras que induzem texto** (list, notes, handwriting, screen showing, "vertical photo of", "9:16") **e SEMPRE terminar com "absolutely no text, no letters, no writing anywhere in the image"**. Telefone SEMPRE virado pra baixo (face down). |
| `data/image-queue.json` | Fila de posts estáticos (Imagen). Vazia no momento. |
| `ready-to-post/` | Output final organizado por data — cada pasta ganha `published.json` com o `instagram_media_id` após publicar. |
| `arquivo/` | **Material morto.** Era carrossel HTML (mai/2026), planos antigos, scripts aposentados. Não usar como referência de estratégia — só consulta histórica. |

---

## Como a Máquina Funciona Hoje (100% automática)

```
PLANEJAMENTO (mensal, no chat com o Davi)
  └─ conversa → popula data/veo-queue.json + data/story-queue.json

GERAÇÃO (GitHub Actions, sozinho)
  ├─ sync-contexto.js         → puxa a verdade do produto do Supabase do app
  ├─ generate-omni.js         → reels 10s 9:16 via Gemini Omni Flash (~$1/vídeo)
  ├─ add-voice.js             → voz PT-BR (Livia/ElevenLabs) nos reels com voiceText
  ├─ generate-story.js        → stories: Imagen 4 (fundo) + story-overlay.html (texto)
  └─ upload automático        → Cloudinary

PUBLICAÇÃO (GitHub Actions, sozinho)
  ├─ publish.js --catchup       → reel do dia (+ até 2 atrasados)
  ├─ publish.js --stories-today → 3 slots/dia (repost do feed + story gerada)
  └─ published.json + dashboard.html commitados; falha real = workflow vermelho + email
```

**Trabalho humano:** ~1 sessão de planejamento por mês. O resto roda sozinho.

---

## Regras Absolutas de Conteúdo

- Identificação emocional **SEMPRE** antes de mostrar o app — e **celular nunca é o foco da cena** (os 2 piores reels da história tinham tela em close)
- **Desde set/2026 vale o CICLO 01 — "A Cozinha que Resolve"** (`docs/SUBPLANO-01.md` + `data/ciclo-01/`): 3 motores — Novela das 18h (Dom) · Utilidade (Cardápio DM Ter, Receita LEGENDA Qua, Receita DM Sex/Qui) · Participação A/B (Sáb). *Os 3 arquétipos antigos (ESPELHO/RECEITA/VIRADA) estão aposentados; a parte técnica do `docs/veo-prompt-guide.md` continua valendo.*
- **Gramática de vídeo:** take único sem cortes · abre em ação (nunca em cena parada) · money shot declarado · vapor sempre em contraluz · som dominante por beat · assinatura "Tem na Semana." em motion/texto no último segundo (nunca narrada) · consistência de personagem via **imagem de referência** (`ref` na fila), jamais descrita no prompt
- **Reels são gerados pelo Gemini Omni Flash** (`generate-omni.js`) — 10s, 9:16, ~$1/vídeo, som ambiente (`No speech...`). Veo 3.1 Lite/Fast ficam como alavanca de custo. Falas e punchlines entram por **overlay ffmpeg**, não por narração.
- **Voz:** sem voz no ciclo até o A/B (hipótese H5, outubro). Voz oficial se voltar: Livia (ElevenLabs `UZ8QqWVrz7tMdxiglcLh`, `eleven_multilingual_v2`).
- Cadência: **5 reels/semana** (Dom 18h · Ter 18h · Qua 18h · Sex 12h · Sáb 11h; em out, Sex→Qui 19h) + stories diárias
- Todo post declara `funcao` (descoberta/salvamento/trafego) e `gatilho_envio` — post sem função não entra na fila; "curte se gostou" é proibido
- Tom conversacional, brasileiro, sem formalidade — nunca jargão de coach
- **Metas do ciclo:** retenção mediana 3,2s → 5s · envios/alcance · 30 comentários/mês · cliques UTM → `montou_semana`

### Vocabulário — checklist, não sugestão

Antes de publicar qualquer legenda, confira contra `fixo.comunicacao` no
`product-context.json`. Resumo do que está lá hoje:

**Pode dizer:** comida de verdade de todo dia · sem complicação, resolvido · testado,
assinado, vai dar certo · sua semana resolvida · a lista sai junto · o jantar de terça,
resolvido.

**NUNCA dizer:** gourmet, sofisticado, alta cozinha, elevado · segredos de chef, técnica
profissional · "as melhores chefs" (tom de ranking).

> **Decisão do Davi (2026-08-26):** a restrição de "promessa de saúde/emagrecimento"
> foi **descartada** — cardápios podem ser comunicados com nome, público e benefício
> livremente. Pendente: o time do app atualizar `fixo.comunicacao` no Contexto (a
> fonte ainda traz a regra antiga; até lá, esta decisão local prevalece sobre ela).

### Os 7 cardápios reais (nunca invente objetivo)

Detox Pós-Festa *(gratuito)* · Emagrecimento Consciente · Massa & Força ·
Pele & Intestino · Vegetariano Prático · Foco & Energia · Low Carb Mediterrâneo.

Cada um já vem com `subtitulo`, `publico_alvo` e 5 `beneficios` escritos e revisados
pelo time do app — **material de post pronto, não precisa inventar.** Lista sempre
atualizada em `atual.cardapios_da_casa`.

### UTM obrigatório em todo link publicado

Sem UTM o app registra a pessoa como "(direto)" e nenhum dos dois lados descobre o que
funcionou. A origem é gravada no **primeiro** toque e vale para sempre naquele aparelho.

```
{url_canonica}/cardapios-da-casa?utm_source=instagram&utm_campaign=<id-do-post>
```

O objetivo de conversão **não é criar conta** — é trazer gente que **monta a semana**.
O app mede `entrou → montou_semana → abriu_lista → assinou`.

---

## Regras de Visual (Stories e imagens)

- **NUNCA** usar fontes fora do sistema: Bebas Neue, Playfair Display, Instrument Serif, Caveat, DM Sans, DM Mono
- **NUNCA** usar cores fora da paleta definida em `brand.json`
- **NUNCA** fundo branco puro `#FFFFFF` — sempre `#FFFDF9` ou `#F7F2EA`
- **SEMPRE** assinar todo post com `Tem na Semana` (a marca) ou a URL lida de `fixo.app.url_canonica` — **nunca digitada à mão**
- **SEMPRE** contraste alto entre fundo e texto — testar legibilidade em tela pequena
- Todo post termina com **CTA** (ver `brand.json → ctas`)

---

## Direção de Arte (Imagens e Vídeos de Comida)

Toda imagem/vídeo gerado segue estes princípios (ver `brand.json → art_direction`):

1. **Luz dramática e direcional** — fonte única, sombras profundas, temperatura quente 3200–4500K
2. **Movimento capturado** — ingredientes caindo, vapor subindo, mão em ação, instante decisivo
3. **Enquadramento teatral** — ângulos inesperados, corte de corpo, mãos sem rosto
4. **Atmosfera antes de informação** — fundo contextual real, madeira, plantas, imperfeições
5. **Contraste cromático intencional** — um elemento vibrante em ambiente de baixa saturação

**Nunca:** foto overhead fundo branco, iluminação flat, flat lay perfeito, cozinha de revistinha.

**Prompt base obrigatório:**
> dramatic single-source side lighting, warm golden hour 3800K, deep shadows composing the frame, hands entering frame without showing face, dark moody kitchen background, worn wooden surfaces, lush green plants out of focus, motion captured at decisive moment, film photography grain, one vibrant color hero element against muted palette, 4K

### Cenas de comida (repertório de referência)

1. Ervas frescas sobre bowl escuro — contraluz pela janela, partículas no ar
2. Prato finalizado com garfos entrando pelo frame — spotlight no prato, fundo escuro
3. Azeite sendo regado sobre legumes — fio dourado contra fundo de madeira escura
4. Mão temperando com sal — partículas caindo, luz lateral dramática
5. Bowl de massa sendo sovado — farinha no ar, ambiente quente
6. Prato servido de lado — vapor subindo, luz quente de janela ao fundo
7. Ingredientes frescos sobre tábua rústica — tomate, ervas, alho
8. Colher de pau mexendo panela — vapor e reflexo de chama no fundo
9. Limão sendo espremido — respingo capturado, luz dramática
10. Mesa posta — vela acesa, plantas, clima de refeição especial

---

## Horários de Publicação — Ciclo 01 (5 reels/semana + stories diárias)

> **Vigente desde 01/09/2026.** Grade da plataforma "A Cozinha que Resolve" —
> calendário completo com os 65 posts em `data/ciclo-01/CALENDARIO.md`.

| Dia | Horário | Motor | Bloco |
|---|---|---|---|
| **Domingo** | 18h | Novela das 18h | `nv-*` (com `ref-novela.png`) |
| **Terça** | 18h | Cardápio da Semana DM | `cd-*` (trafego, comenta→DM) |
| **Quarta** | 18h | Receita LEGENDA | `rl-*` (salvamento) |
| **Sexta** (set/nov) · **Quinta 19h** (out) | 12h | Receita DM | `rd-*` (trafego, receitas reais do app) |
| **Sábado** | 11h | Participação A/B | `pt-*` (comentários) |
| Segunda | — | catchup | último post da grade antiga: 31/08 |

> Os crons do `publish-daily.yml` seguem 7 dias/semana **de propósito**: dias sem post
> viram no-op e servem de rede de catchup. Não cortar.

**Stories** — 3 slots/dia, todos os dias: 09h30 · 13h30 · 19h30 BRT
(1 repost do feed do dia + 1 story gerada por slot)

---

## Ferramentas (todas em `scripts/`)

| Script | Função |
|---|---|
| `sync-contexto.js` | **Puxa a verdade do produto do Supabase do app** → regrava `data/product-context.json`. Roda antes de toda geração. |
| `generate-omni.js` | **Gera reels via Gemini Omni Flash** (10s, 9:16, som ambiente) — padrão desde jul/2026 |
| `add-voice.js` | **Cola voz PT-BR (Livia)** nos reels com `voiceText` — roda após generate-omni |
| `generate-story.js` | **Gera Stories:** Imagen 4 (fundo) + `templates/story-overlay.html` (texto) via Puppeteer |
| `generate-image.js` | Gera posts estáticos via Imagen (fila vazia no momento) |
| `generate-veo.js` | Fallback: reels via Veo 3.1 Lite — não usado nos workflows |
| `publish.js` | Publica no Instagram via Graph API (reels, stories, catchup, marcador de falha) |
| `build-dashboard.js` | Gera `dashboard.html` com tudo que foi publicado |
| `refresh-token.js` | Renovação do token do Instagram |

**Workflows** (`.github/workflows/`): `generate-veo` (ímpares) · `generate-veo-retry` (pares) ·
`generate-story` · `generate-image(-retry)` · `publish-daily` (7/7 com catchup) ·
`publish-stories` (3 slots/dia) · `refresh-token`.

**Segredos no GitHub:** `INSTAGRAM_ACCESS_TOKEN` (IGAA…, renovar se trocar senha!),
`INSTAGRAM_USER_ID`, `GOOGLE_API_KEY`, `CLOUDINARY_*`, `ELEVENLABS_API_KEY`,
`SUPABASE_PUBLISHABLE_KEY` (chave anon do app — **nunca** pedir a service_role).
