# Luiza na Cozinha — Agentes de Conteúdo Instagram

## O Projeto
Equipe automatizada de produção de conteúdo para o Instagram da Luiza na Cozinha —
app de planejamento alimentar semanal com IA (luizanacozinha.lovable.app).

**Meta:** 12–16 posts/mês produzidos em ~45 min de trabalho humano.
**Chef protagonista:** Luiza Hoffmann (@luizanacozinha).
**Canal de validação:** Instagram — crescimento orgânico via Reels + Carrosséis.
**Princípio central:** Identificação emocional SEMPRE antes de mostrar o app.

---

## Arquivos de Referência

| Arquivo | Função |
|---|---|
| `brand.json` | Fonte única de verdade — paleta, fontes, templates, CTAs, direção de arte. **Nunca hardcode valores nos templates.** |
| `agents/` | Definição de cada agente especializado |
| `prompts/` | Biblioteca de prompts por tipo de post |
| `templates/` | HTMLs base para cada template visual |
| `data/` | Briefings, planos, filas de geração (json + md) |
| `data/veo-queue.json` | **Fila de reels para Veo 3.1** — prompts + captions (leia `docs/veo-prompt-guide.md`) |
| `data/story-queue.json` | **Fila de Stories** — Imagen 4 (fundo) + overlay HTML (texto), pilares Vitrine/Check-in/Gancho. **Prompts Imagen: cena pura, SEM palavras que induzem texto** (list, notes, handwriting, screen showing, "vertical photo of", "9:16") **e SEMPRE terminar com "absolutely no text, no letters, no writing anywhere in the image"** — Imagen renderiza texto torto se induzido. Telefone aparece SEMPRE virado pra baixo (face down) |
| `ready-to-post/` | Output final organizado por data |
| `docs/veo-prompt-guide.md` | **Guia completo: como escrever prompts para Veo 3.1 Lite** |
| `claude code design/` | Referência visual — posts.html (12 posts editoriais) + reels.html (4 reels animados) |

---

## Comandos Disponíveis

| Comando | Agente | O que faz |
|---|---|---|
| `/briefing` | Agente 0 | Coleta temas da quinzena com 8 perguntas-chave |
| `/quinzena` | Agente 1 (Estrategista) | Gera plano quinzenal completo a partir do briefing |
| `/design [post-id]` | Agente 2 (Designer) | Gera HTML dos slides + exporta PNGs via Puppeteer |
| `/design all` | Agente 2 | Gera todos os posts do plano quinzenal |
| `/reel [post-id]` | Agente 2 | Gera conceito de Reel: cena, prompt de imagem, prompt de animação, música |
| `/reel all` | Agente 2 | Gera todos os Reels do plano |
| `/imagem [cena]` | Agente 2 | Gera prompt completo para Midjourney/Flux Pro para a cena pedida |
| `/animar [arquivo]` | Agente 2 | Gera prompt de animação para Kling 2.0 ou Seedance 2.0 |
| `/publish` | Agente 3 (Publisher) | Organiza ready-to-post + gera relatório de agendamento |
| `/checklist` | — | Verifica todos os posts contra as regras de qualidade |

---

## Arquitetura dos Agentes

```
/briefing
  └─ Agente 0 coleta input → salva em data/briefing-[data].json

/quinzena
  └─ Agente 1 lê briefing.json + brand.json
  └─ gera plano com posts E Reels → data/plano-[data].json + plano-[data].md

/design [post-id]
  └─ Agente 2 lê plano.json + brand.json
  └─ gera templates/generated/post-[id].html
  └─ roda scripts/screenshot.js → ready-to-post/[data]/post-[id]/
     ├─ slide-01.png ... slide-N.png
     └─ caption.txt

/reel [post-id]
  └─ Agente 2 lê plano.json + brand.json
  └─ gera ready-to-post/[data]/reel-[id]/
     ├─ concept.md  (cena, referência visual, duração, tipo de animação)
     ├─ image-prompt.txt   (prompt para Midjourney/Flux Pro)
     ├─ animation-prompt.txt (prompt para Kling 2.0 ou Seedance 2.0)
     └─ caption.txt

/publish
  └─ Agente 3 lista ready-to-post/
  └─ gera PUBLICACAO-[data].md com tabela + instruções Meta Business Suite
```

---

## Templates Disponíveis

| Template | Arquivo | Fundo | Uso |
|---|---|---|---|
| `hero_terracota` | `hero-terracota.html` | #C8572A | Frases de impacto, hooks, abertura de semana |
| `dark_carousel` | `dark-carousel.html` | #1E1810 | Carrossel narrativo: capa (espresso) + cenas (charcoal) + CTA (terracota) |
| `cream_editorial` | `cream-editorial.html` | #F7F2EA | Posts editoriais com número grande + anotação Caveat |
| `lista_steps` | `lista-steps.html` | #EDE4D3 | Como funciona o app, processos numerados |
| `depoimento` | `depoimento.html` | #5C7A5E | Social proof, citações, depoimentos |
| `enquete` | `enquete.html` | #EDE4D3 | Perguntas de engajamento, 4 opções |
| `reel_frame` | `reel-frame.html` | #0A0704 | Primeiro frame cinematográfico de Reel (9:16) |
| `antes_depois` | `antes-depois.html` | Split | Antes charcoal / depois creme — Pilar C |
| `big_number` | `big-number.html` | #FFFDF9 | Stat post — número de impacto em terracota |

---

## Regras Absolutas de Visual

- **NUNCA** usar fontes fora do sistema: Bebas Neue, Playfair Display, Instrument Serif, Caveat, DM Sans, DM Mono
- **NUNCA** usar cores fora da paleta definida em `brand.json`
- **NUNCA** fundo branco puro `#FFFFFF` — sempre `#FFFDF9` ou `#F7F2EA`
- **SEMPRE** incluir `Luiza na Cozinha` ou `luizanacozinha.app` em todo post
- **SEMPRE** contraste alto entre fundo e texto — testar legibilidade em tela pequena
- Margem lateral mínima: **72px** em todos os posts
- Slide 1 de qualquer carrossel deve funcionar como **post independente**
- Máximo **7 slides** por carrossel
- Todo post termina com **CTA** (ver `brand.json → ctas`)
- Alternar temperatura no grid: quente → escuro → claro — nunca dois fundos iguais seguidos

---

## Regras Absolutas de Conteúdo

- Identificação emocional **SEMPRE** antes de mostrar o app
- Todo reel segue os **3 arquétipos** (ESPELHO / IMERSÃO / VIRADA) com rotação semanal 1/1/1 — ver seção "Cérebro Editorial" em `docs/veo-prompt-guide.md`
- **Reels são gerados pelo Gemini Omni Flash** (`generate-omni.js`) — 10s, 9:16, ~$1/vídeo. O Veo 3.1 Lite (`generate-veo.js`) fica como fallback.
- **Nenhum prompt pede fala.** Só som ambiente (`No speech, no voice, no narration, no dialogue, no music`). A voz PT-BR entra depois via ElevenLabs — o áudio do Omni só é avaliado em inglês e PT sai robótico.
- Cadência: **3 reels/semana** (Seg 18h, Qua 18h, Sex 12h ≈ 13/mês). Dias sem reel ficam só com stories.
- Tom conversacional, brasileiro, sem formalidade — nunca jargão de coach
- Humor leve e auto-irônico nos Pilares A e B
- Nunca posts puramente educativos sem elemento de identificação
- O **primeiro 0,3 segundo** decide tudo — hook obrigatório em todo formato

---

## Sistema Tipográfico (Técnicas do "Caderno da Luiza")

- **Playfair 900 massivo** (160–480px): número ou palavra ocupa o frame como elemento gráfico
- **Caveat rotacionado** (-4° a -8°): anotação pessoal da chef — sempre com seta, cor sage ou terracota
- **Grain texture** (SVG feTurbulence): sensação de papel/película — presente em todos os templates escuros
- **Gold kicker** (DM Mono + linha #C49A3C): abre seções editoriais com elegância
- **Instrument Serif italic**: sub-títulos literários, leves, femininos
- **Bold+italic mix**: Playfair 700 + Playfair italic em linhas alternadas — tensão visual que para o scroll

---

## Regras Absolutas de Direção de Arte (Imagens de Comida)

Toda imagem fotográfica gerada para Reels ou posts segue estes princípios (ver `brand.json → art_direction`):

1. **Luz dramática e direcional** — fonte única, sombras profundas, temperatura quente 3200–4500K
2. **Movimento capturado** — ingredientes caindo, vapor subindo, mão em ação, instante decisivo
3. **Enquadramento teatral** — ângulos inesperados, corte de corpo, mãos sem rosto
4. **Atmosfera antes de informação** — fundo contextual real, madeira, plantas, imperfeições
5. **Contraste cromático intencional** — um elemento vibrante em ambiente de baixa saturação

**Nunca:** foto overhead fundo branco, iluminação flat, flat lay perfeito, cozinha de revistinha.

**Prompt base obrigatório:**
> dramatic single-source side lighting, warm golden hour 3800K, deep shadows composing the frame, hands entering frame without showing face, dark moody kitchen background, worn wooden surfaces, lush green plants out of focus, motion captured at decisive moment, film photography grain, one vibrant color hero element against muted palette, 4K, 4:5 vertical

---

## Mix de Conteúdo Mensal

> **Fase atual: Crescimento (conta nova)** — prioridade é descoberta orgânica via alcance.
> Revisar após 60 dias ou quando base superar 1.000 seguidores.

| Formato | % | Posts/mês | Papel |
|---|---|---|---|
| **Reel Veo Food** | 50% | 6–7 | Motor principal de descoberta — cinematográfico, para público frio |
| **Reel HTML/CSS** | 15% | 2 | Editorial tipográfico — barato, hooks de texto e copywriting |
| **Carrossel** | 25% | 3–4 | Motor de salvamento — converte quem chegou pelo Reel |
| **Estático** | 10% | 1–2 | Âncora visual do feed — identidade do perfil |

**Quando usar Reel Veo Food:**
- Sempre que o conteúdo for emoção, comida, atmosfera, identificação (Pilares A, B, C)
- Dias de alta audiência: segunda 18h e sexta 12h são os slots prioritários

**Quando usar Reel HTML/CSS:**
- Conteúdo 100% tipográfico sem imagem de comida (relógio 18h, contagem regressiva, ticker)
- Quando o hook é puramente textual e visual limpo é mais forte que vídeo real
- Máximo 2 por quinzena

---

## Tipos de Reel a Gerar

### Tipo 1 — O Relógio das 18h (Editorial animado)
Relógio em Playfair italic + cenas como atos de teatro. Hook → cena → solução.
- **Animação:** Stage/Sprite — fade+slide, wipe circular na transição final
- **Duração:** 8s | **Pilar:** B

### Tipo 2 — Contagem Regressiva (Tipografia gigante)
Números 5→1 pulsando com fundo trocando a cada beat. Entrega a promessa no final.
- **Animação:** Stage/Sprite — background flip, easeOutBack para "pop"
- **Duração:** 6s | **Pilar:** C

### Tipo 3 — Ticker da Geladeira (Scroll absurdo)
Lista de improvisações rolando como bolsa de valores até freiar em "chega."
- **Animação:** Stage/Sprite — translateY linear, mask-image gradiente nas bordas
- **Duração:** 7s | **Pilar:** A

### Tipo 4 — Antes × Depois (Split visual)
Tela rasga ao meio. Esquerda caótica, direita serena. Fusão em CTA terracota.
- **Animação:** Stage/Sprite — splitProgress animando height, wipe transition
- **Duração:** 7s | **Pilar:** B/C

### Tipo 5 — Food Animated (Imagem cinematográfica)
Imagem de comida gerada (Midjourney/Flux Pro) + movimento (Kling 2.0/Seedance 2.0) + música trend.
- **Duração:** 8–15s | **Pilar:** A/C

### Tipo 6 — Kinetic Typography
Texto palavra por palavra no ritmo da música. Fundo em movimento sutil.
- **Ferramenta:** Higgsfield Vibe Motion ou CapCut
- **Duração:** 10–20s | **Pilar:** A/B

---

## Cenas de Comida para Gerar (Referência)

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

## Pipeline de Produção — Sessão Quinzenal (~45 min)

```
1. /briefing          → 5 min — informar temas e datas da quinzena
2. /quinzena          → 5 min — revisar e aprovar plano gerado
3. /design all        → 10 min — gerar carrosséis e estáticos, revisar
4. /reel all          → 10 min — gerar conceitos de Reels com prompts
5. Gerar imagens      → Midjourney/Flux (externo) — usar prompts gerados
6. Animar             → Kling 2.0/CapCut (externo) — usar prompts gerados
7. /publish           → 5 min — organizar ready-to-post, gerar relatório
8. Meta Business Suite → 10 min — subir posts e Reels, agendar datas
```

---

## Horários de Publicação — 3 reels/semana + stories diárias

> **Vigente desde agosto/2026.** Julho publicou 7 dias/semana com Veo; agosto em diante
> são 3 reels/semana com Omni Flash. Motivo: ~$1/vídeo — a troca qualidade × quantidade
> só fecha em ~13 reels/mês. Os outros dias ficam por conta das stories.

| Dia | Horário | Arquétipo | Formato | Geração |
|---|---|---|---|---|
| **Segunda** | 18h | ESPELHO | **Reel Omni** | Automático (veo-queue) |
| **Quarta** | 18h | IMERSÃO | **Reel Omni** | Automático (veo-queue) |
| **Sexta** | 12h | VIRADA | **Reel Omni** | Automático (veo-queue) |
| Ter/Qui/Sáb/Dom | — | — | Só stories | Automático (story-queue) |

> Os crons do `publish-daily.yml` seguem rodando 7 dias/semana **de propósito**: nos dias
> sem reel eles viram no-op (nada pendente na fila), e servem de rede de catchup se uma
> publicação falhar. Não cortar.

**Stories** — 3 slots/dia, todos os dias: 09h30 · 13h30 · 19h30 BRT
(1 repost do feed do dia + 1 story gerada por slot)

---

## Ferramentas Disponíveis

| Ferramenta | Tipo | Função |
|---|---|---|
| `scripts/screenshot.js` | Local | Converte HTML em PNGs via Puppeteer |
| `scripts/generate-omni.js` | Local | **Gera reels via Gemini Omni Flash (10s, 9:16, som ambiente)** — padrão desde jul/2026 |
| `scripts/generate-veo.js` | Local | Gera reels via Veo 3.1 Lite — **fallback**, não usado nos workflows |
| `scripts/generate-story.js` | Local | **Gera Stories: Imagen 4 (fundo) + overlay HTML (texto) via Puppeteer** |
| `templates/story-overlay.html` | Local | Template único de Story — fundo fotográfico + kicker/headline/CTA |
| `templates/` | Local | HTMLs base para cada template visual |
| `brand.json` | Local | Fonte única de verdade de marca |
| `claude code design/posts.html` | Referência | 12 posts editoriais para inspiração de layout |
| `claude code design/reels.html` | Referência | 4 reels animados com sistema Stage/Sprite |
| **Veo 3.1 Lite** | **Externo** | **Text-to-video cinematográfico com áudio nativo · $0.05/vídeo** |
| Midjourney v7 | Externo | Geração de imagens de comida cinematográficas |
| Flux Pro | Externo | Alternativa ao Midjourney — pay-per-use |
| Kling 3.0 | Externo | Animação de imagens — vapor, zoom, movimento |
| Meta Business Suite | Externo | Agendamento e publicação no Instagram |
