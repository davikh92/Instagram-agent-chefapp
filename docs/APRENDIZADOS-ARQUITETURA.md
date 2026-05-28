# 📚 Aprendizados e Arquitetura — Automação de Conteúdo Instagram

**Projeto de origem:** Luiza na Cozinha (@luizanacozinha) — app de planejamento alimentar  
**Data:** Maio 2026  
**Objetivo deste doc:** Capturar o que funcionou, o que não funcionou e como replicar a arquitetura em outros projetos

---

## 🏗️ Arquitetura Geral (O que foi construído)

```
CONTEÚDO GERADO (Claude Agents)
        │
        ▼
data/briefing.json ──► data/plano.json
        │
        ▼
scripts/screenshot.js        scripts/generate-veo.js
(HTML → PNG via Puppeteer)   (texto → MP4 via Veo API)
        │                           │
        ▼                           ▼
ready-to-post/YYYY-MM/YYYY-MM-DD/[id]/
  ├── slide-01.png / reel.mp4
  ├── caption.txt
  └── post.json / reel.json
        │
        ▼
scripts/publish.js --today
(Cloudinary → Instagram Graph API)
        │
        ▼
Windows Task Scheduler (publicação automática)
```

### Componentes principais

| Componente | Tecnologia | Função |
|---|---|---|
| Geração de texto/plano | Claude Code (Agents) | Briefing, plano quinzenal, captions |
| Geração de posts (imagem) | HTML + Puppeteer | Templates HTML → PNG |
| Geração de reels (vídeo) | Google AI Studio — Veo 3.1 Lite | Texto → MP4 com áudio |
| Hospedagem temporária | Cloudinary | URL pública para Instagram API |
| Publicação | Instagram Graph API | Post/Reel no Instagram |
| Agendamento | Windows Task Scheduler | Publicação automática por horário |

---

## ✅ O QUE FUNCIONOU BEM

### 1. Veo 3.1 Lite via Google AI Studio
- **Chave:** Google API Key (`AIzaSy...`) — simples, sem OAuth
- **Endpoint correto:** `POST /v1beta/models/veo-3.1-lite-generate-preview:predictLongRunning`
- **Método certo:** `predictLongRunning` (não `generateVideo` — esse dá 404)
- **Polling:** `GET /v1beta/{operationName}` com a mesma API key
- **Download:** URL retornada em `response.generateVideoResponse.generatedSamples[0].video.uri` — precisa passar API key no header `x-goog-api-key`
- **Tempo:** ~42 segundos por vídeo de 8s
- **Qualidade:** Photorealism excelente para comida, áudio nativo incluído
- **Custo:** Baixo (testar com sua cota gratuita primeiro)

**Modelos disponíveis (maio 2026):**
```
veo-2.0-generate-001
veo-3.0-generate-001
veo-3.0-fast-generate-001
veo-3.1-generate-preview
veo-3.1-fast-generate-preview
veo-3.1-lite-generate-preview  ← melhor custo-benefício
```

### 2. Estrutura de pastas por data
```
ready-to-post/YYYY-MM/YYYY-MM-DD/[post-id]/
```
- Facilita o `--today` flag no publish.js
- Evita confusão de qual conteúdo publicar
- Permite agendamento antecipado simples (cria pasta com data futura)

### 3. published.json como flag de controle
- Arquivo vazio criado após publicação com sucesso
- Scripts de geração checam esse arquivo e pulam se existir
- Evita regeneração acidental e duplicatas
- **Nunca deletar esse arquivo** — é o que garante idempotência

### 4. Flag --today no publish.js
- Scheduled tasks sempre rodam com `--today`
- Publica APENAS o conteúdo datado para hoje
- Proteção adicional: `seenDates Set` limita a 1 item por data
- Elimina o risco de "flood" de publicações acumuladas

### 5. Templates HTML → PNG (Puppeteer)
- Posts visuais consistentes com identidade visual da marca
- Fácil de iterar (HTML/CSS vs Photoshop)
- Puppeteer headless funciona bem no Windows
- brand.json como fonte única de verdade (cores, fontes, CTAs)

### 6. Ciclo quinzenal com Claude Agents
- /briefing → /quinzena → geração → publicação automática
- ~45 min de trabalho humano por quinzena
- Agents leem brand.json e plano.json — contexto sempre consistente

---

## ❌ O QUE NÃO FUNCIONOU / ARMADILHAS

### 1. Endpoint Veo errado (perdeu tempo)
- **Problema:** Usamos `generateVideo` → 404
- **Causa:** Google usa `predictLongRunning` para operações longas
- **Solução:** Sempre verificar modelos disponíveis primeiro:
  ```
  GET /v1beta/models?key=API_KEY
  ```
  O campo `supportedGenerationMethods` mostra o método certo.

### 2. Body lido duas vezes no fetch
- **Problema:** `response.json()` falhava, tentava `response.text()` → "Body already read"
- **Solução:** Sempre ler body UMA vez como texto, depois parsear:
  ```js
  const rawBody = await response.text();
  try { data = JSON.parse(rawBody); } catch { data = rawBody; }
  ```

### 3. Download do vídeo sem autenticação
- **Problema:** URL de download retornada pela Veo API → 403
- **Causa:** URL da Files API do Google precisa de autenticação
- **Solução:** Adicionar API key na URL E no header:
  ```js
  const url = videoUri + '?key=' + GOOGLE_API_KEY;
  fetch(url, { headers: { 'x-goog-api-key': GOOGLE_API_KEY } })
  ```

### 4. Publicações duplicadas
- **Problema:** Posts sendo publicados mais de uma vez
- **Causa:** Script sem verificação de publicados + flag `--all` nas tasks
- **Solução:** 
  - published.json como flag
  - Usar `--today` em vez de `--all` nas scheduled tasks
  - `seenDates Set` no publish.js

### 5. Nada publicado por 4 dias
- **Problema:** Sistema parado sem avisar
- **Causa:** Scheduled tasks não criadas no Windows / token expirado
- **Lição:** Configurar monitoramento ou checagem periódica de status

### 6. Chave API exposta em chat
- **Problema:** Usuário compartilhou API key em texto no chat
- **Lição:** Nunca compartilhar secrets em texto. Sempre adicionar ao .env localmente.
- **Ação quando isso acontece:** Revogar a chave imediatamente e gerar nova

### 7. Register-ScheduledTask exige admin
- **Problema:** `-RunLevel Highest` → Acesso negado
- **Solução:** Usar `-RunLevel Limited` + `-LogonType Interactive`
  ```powershell
  $principal = New-ScheduledTaskPrincipal `
      -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) `
      -LogonType Interactive `
      -RunLevel Limited
  ```

---

## 🔄 Pipeline de Produção Quinzenal (Reproduzível)

### Ciclo padrão (1º e 15º de cada mês, ~45 min)

```
1. /briefing          (5 min)  → coleta temas, datas, pilares
2. /quinzena          (5 min)  → gera plano com posts + reels
3. Escrever prompts   (10 min) → data/veo-queue.json
4. node screenshot.js (10 min) → gera posts em PNG
5. node generate-veo  (5 min)  → gera reels em MP4 (~42s cada)
6. Sistema publica    (0 min)  → automático pelos horários agendados
```

### Horários de publicação (adaptáveis)

| Dia | Horário | Tipo preferencial |
|---|---|---|
| Segunda | 18h | Reel ou Carrossel |
| Quarta | 18h | Reel ou Estático |
| Quinta | 12h | Reel ou Carrossel |
| Sexta | 12h | Reel |
| Domingo | 10h | Estático ou Carrossel |

---

## 🧱 O Que Reutilizar em Novos Projetos

### Código 100% reutilizável (copiar direto):
- `scripts/generate-veo.js` — apenas trocar prompts e captions
- `scripts/publish.js` — funciona para qualquer conta Instagram
- `scripts/screenshot.js` — só mudar os templates HTML
- Estrutura de pastas `ready-to-post/YYYY-MM/YYYY-MM-DD/[id]/`
- Sistema de `published.json` flag
- Scheduled Tasks PowerShell (mudar horários se necessário)

### Código que precisa adaptar:
- `templates/` — criar novos templates HTML com identidade visual do projeto
- `brand.json` — paleta, fontes, CTAs, tom de voz do novo projeto
- `data/veo-queue.json` — prompts específicos para o novo nicho
- `agents/` — personalidade e contexto dos agentes Claude
- `prompts/` — biblioteca de prompts do novo nicho

### Criar do zero:
- `CLAUDE.md` — instruções do novo projeto para Claude Code
- `docs/veo-prompt-guide.md` — guia de prompts para o nicho específico
- `data/briefing-*.json` — briefings do novo nicho

---

## 🎬 Guia de Prompts Veo — Princípios Universais

Funciona para qualquer nicho, não só comida:

### Estrutura do prompt:
```
[PLANO DE CÂMERA], [CONTEXTO/CENÁRIO].
[O QUE ACONTECE].
[ILUMINAÇÃO].
[DETALHES ESPECÍFICOS].
[MOVIMENTO].
[ESTILO DE REFERÊNCIA].
8 seconds, 1080p.
```

### ✅ Sempre usar:
- Plano claro: "Close-up", "Medium shot", "Wide shot"
- Iluminação natural: "natural window light", "warm", "soft"
- Movimento suave: "slow", "gentle", "deliberate", "calm"
- Referência de estilo real: "like a documentary", "like professional corporate video", "like a LinkedIn video"
- Terminar com: "8 seconds, 1080p"

### ❌ Nunca usar:
- "Dramatic", "cinematic", "deep shadows", "film grain"
- "4:5 vertical", "16:9", indicação de aspect ratio
- "Ultra", "extreme", "4K", "bokeh"
- Muitas ações simultâneas (máximo 1-2 por prompt)

### Para consultoria/B2B (diferente de comida):
- Cenários: escritório moderno, sala de reunião, mesa de trabalho, laptop
- Ações: pessoa anotando, apresentação, handshake, gráfico na tela
- Iluminação: "professional office lighting", "modern corporate environment"
- Estilo: "like a corporate brand video", "like a LinkedIn company video"

---

## 💰 Custos (Referência Maio 2026)

| Serviço | Custo | Uso |
|---|---|---|
| Google AI Studio — Veo 3.1 Lite | Cota gratuita / baixo custo | Geração de vídeos |
| Cloudinary | ~$10/mês (plano básico) | Hospedagem temporária para publicação |
| Instagram Graph API | Gratuito | Publicação via API |
| Puppeteer | Gratuito | Geração de PNGs |
| Claude Code | Plano contratado | Geração de conteúdo + agentes |
| **Total operacional** | **~$10-15/mês** | Para ~16 posts/mês |

---

## 🔐 Variáveis de Ambiente Necessárias

```env
# Instagram
INSTAGRAM_ACCESS_TOKEN=   # Token de longa duração (60 dias, renovar)
INSTAGRAM_USER_ID=        # ID do usuário Instagram Business

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Veo / Google
GOOGLE_API_KEY=           # AIzaSy... (Google AI Studio)
```

**Atenção ao token Instagram:** Expira em 60 dias. Configurar lembrete para renovar via `scripts/refresh-token.js`.

---

## 📐 Estrutura de Arquivos Recomendada (Template para Novo Projeto)

```
novo-projeto/
├── CLAUDE.md                    ← instruções do projeto para Claude Code
├── brand.json                   ← fonte única de verdade da marca
├── .env                         ← secrets (nunca commitar)
├── agents/                      ← definição dos agentes Claude
│   ├── agente-0-briefing.md
│   ├── agente-1-estrategista.md
│   └── agente-2-designer.md
├── prompts/                     ← biblioteca de prompts por tipo
├── templates/                   ← HTMLs base para posts visuais
├── scripts/
│   ├── screenshot.js            ← HTML → PNG (reutilizar)
│   ├── generate-veo.js          ← texto → MP4 (reutilizar)
│   ├── publish.js               ← Instagram API (reutilizar)
│   └── refresh-token.js         ← renovação token (reutilizar)
├── data/
│   ├── briefing-YYYY-MM-DD.json
│   ├── plano-YYYY-MM-DD.json
│   └── veo-queue.json
├── ready-to-post/               ← output final (gerado automaticamente)
│   └── YYYY-MM/
│       └── YYYY-MM-DD/
│           └── [post-id]/
│               ├── reel.mp4 / slide-01.png
│               ├── caption.txt
│               └── post.json / reel.json
└── docs/
    ├── veo-prompt-guide.md      ← guia de prompts do nicho
    └── APRENDIZADOS.md          ← este arquivo adaptado
```

---

## 🚀 Checklist para Novo Projeto (Do Zero em ~2h)

### Setup inicial
- [ ] Criar conta Instagram Business
- [ ] Criar Facebook App → gerar token Graph API
- [ ] Criar conta Cloudinary
- [ ] Obter Google API Key em aistudio.google.com
- [ ] Criar `.env` com todas as variáveis
- [ ] Copiar scripts: `generate-veo.js`, `publish.js`, `screenshot.js`
- [ ] Testar: `node scripts/generate-veo.js --all` com 1 reel de teste

### Identidade e conteúdo
- [ ] Criar `brand.json` com paleta, fontes, CTAs do novo projeto
- [ ] Criar templates HTML para posts visuais
- [ ] Criar `CLAUDE.md` com contexto do projeto
- [ ] Criar agentes: briefing, estrategista, designer
- [ ] Criar `docs/veo-prompt-guide.md` adaptado para o nicho

### Automação
- [ ] Criar Scheduled Tasks no Windows (usar PowerShell — sem `-RunLevel Highest`)
- [ ] Definir horários de publicação para o novo público-alvo
- [ ] Configurar lembrete para renovar token Instagram (60 dias)
- [ ] Testar ciclo completo com 1 post + 1 reel antes de deixar automático

---

## 🎬 Opções de Conteúdo com Movimento (Comparativo Completo)

Existem três abordagens distintas — cada uma com seu custo, controle e nível de automação:

---

### Abordagem 1 — HTML/CSS Animado (Stage/Sprite)

**O que é:** Reels feitos 100% em código. Sem IA de imagem, sem vídeo real.  
**Como funciona:** Template HTML com animações CSS → `record-reel.js` grava como MP4

**Tipos já implementados no projeto Luiza:**
| Tipo | Descrição | Efeito |
|---|---|---|
| Relógio 18h | Editorial tipográfico | Fade + slide por ato |
| Contagem Regressiva | Números 5→1 | Pop com easeOutBack |
| Ticker da Geladeira | Lista rolando | translateY linear com máscara |
| Antes × Depois | Tela rasgando | Split screen animado |

**Vantagens:**
- ✅ 100% gratuito
- ✅ 100% automático (sem API externa)
- ✅ Identidade visual perfeita (controle total)
- ✅ Instantâneo (sem tempo de geração)

**Limitações:**
- ❌ Não tem imagem/cena real — é tipografia e formas
- ❌ Exige habilidade em HTML/CSS para criar novos tipos
- ❌ Parece "menos orgânico" que vídeo real

**Quando usar:** Hooks de texto, countdowns, listas, dados, antes/depois

---

### Abordagem 2 — Text-to-Video (Veo)

**O que é:** Texto descritivo → vídeo realista com câmera, luz, movimento e áudio.  
**Como funciona:** `generate-veo.js` → Google AI Studio Veo 3.1 Lite API → MP4

**Já implementado e funcionando:**
- Endpoint: `predictLongRunning`
- Modelo: `veo-3.1-lite-generate-preview`
- Tempo: ~42 segundos por vídeo
- Autenticação: `GOOGLE_API_KEY` (AIzaSy...)

**Funciona para QUALQUER nicho** — não só comida:
```
# Food (já testado ✅)
"Close-up of steaming bowl, hands wrapping around it..."

# Consultoria B2B
"Medium shot of a professional at a modern desk, reviewing
documents with a pen. Clean office environment, natural light
from large window. Focused, deliberate motion. Like a corporate
brand video. 8 seconds, 1080p."

# Produto/SaaS
"Close-up of hands typing on a laptop, dashboard visible on
screen with charts and data. Modern workspace, soft lighting.
Like a tech startup video. 8 seconds, 1080p."
```

**Vantagens:**
- ✅ Vídeo realista com áudio nativo
- ✅ Totalmente automatizado via API
- ✅ Sem etapa manual de criação de imagem
- ✅ Custo baixo (cota gratuita + baixo custo por vídeo)

**Limitações:**
- ❌ Menos controle sobre cena exata (prompt → resultado aproximado)
- ❌ Não aceita uma imagem de referência como base
- ❌ Fraco em composições muito específicas ou com pessoas identificáveis

**Quando usar:** Reels de ambiente, produto, mood, lifestyle

---

### Abordagem 3 — Image-to-Video (Imagen → Kling/Seedance)

**O que é:** Gera imagem precisa primeiro → depois adiciona movimento.  
**Como funciona (2 etapas):**

```
Etapa 1: Gerar imagem
  Prompt de texto → Imagen 3 (Google) / Flux Pro / Midjourney
  Output: PNG de alta qualidade

Etapa 2: Animar imagem
  PNG → Kling 3.0 / Seedance 2.0 / Veo image-to-video
  Output: MP4 com movimento suave (zoom, parallax, câmera, etc)
```

**APIs relevantes:**
| Ferramenta | Tipo | API? | Custo aprox. |
|---|---|---|---|
| Imagen 3 (Google) | Texto→Imagem | ✅ Sim (mesma chave Google) | Baixo |
| Flux Pro (Black Forest) | Texto→Imagem | ✅ Sim | ~$0.05/imagem |
| Midjourney | Texto→Imagem | ⚠️ API limitada | $10-30/mês |
| Kling 3.0 | Imagem→Vídeo | ✅ Sim | ~$0.07-0.12/vídeo |
| Seedance 2.0 | Imagem→Vídeo | ✅ Sim | Similar ao Kling |
| Veo (image-to-video) | Imagem→Vídeo | ✅ Sim (mesmo endpoint Google) | Baixo |

**Vantagens:**
- ✅ Controle total sobre a imagem gerada antes de animar
- ✅ Resultado mais "cinematográfico" quando bem executado
- ✅ Melhor para cenas muito específicas (produto exato, pessoa etc)

**Limitações:**
- ❌ 2 etapas = 2 APIs = mais complexidade
- ❌ Custo acumulado (imagem + vídeo)
- ❌ Kling tem fail rate ~40-60% vs ~5% do Veo
- ❌ Mais tempo de geração total (3-5 min por reel)

**Quando usar:** Quando o Veo texto-para-vídeo não acerta a cena exata necessária

---

### Resumo de Decisão

```
Precisa de identidade visual perfeita + texto?
  → Abordagem 1 (HTML/CSS Stage)

Precisa de cena realista com ambiente/mood?
  → Abordagem 2 (Veo texto-para-vídeo) ← mais simples, já implementado

Precisa de imagem muito específica com movimento?
  → Abordagem 3 (Imagen → Kling/Seedance)

Melhor estratégia para novo projeto:
  → Começar com Abordagem 1 + 2 (já temos tudo)
  → Adicionar Abordagem 3 só se necessário
```

---

### Implementar Imagen 3 + Veo Image-to-Video (quando quiser)

A mesma `GOOGLE_API_KEY` já usada para Veo funciona para Imagen 3:

```js
// Gerar imagem com Imagen 3
POST https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=API_KEY
Body: {
  "instances": [{ "prompt": "..." }],
  "parameters": { "sampleCount": 1, "aspectRatio": "9:16" }
}

// Animar com Veo (image-to-video) — quando disponível
POST https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-lite-generate-preview:predictLongRunning?key=API_KEY
Body: {
  "instances": [{
    "prompt": "...",
    "image": { "bytesBase64Encoded": "<base64 da imagem>" }
  }],
  "parameters": { "sampleCount": 1, "durationSeconds": 8 }
}
```

**Variável adicional necessária no .env:** nenhuma — mesma `GOOGLE_API_KEY`

---

## 💡 Insights para Consultoria B2B (Diferente de Food/B2C)

### Tom e conteúdo:
- Pilares: Problema do cliente → Solução → Resultado → Autoridade
- Formatos que performam em B2B: carrosséis educativos, cases, dados, bastidores
- Reels B2B: curtos (15-30s), direto ao ponto, fundo clean ou escritório

### Horários diferentes para B2B:
- **Melhor:** Terça-Quinta 7h-9h (antes do trabalho) e 12h (almoço)
- **Evitar:** Fins de semana e depois das 19h

### Métricas diferentes:
- B2C foca em: saves, shares, novos seguidores
- B2B foca em: DMs, cliques no link, visitas ao perfil, leads gerados

### Identidade visual:
- B2B: tipografia mais clean, cores corporativas, menos textura/grain
- Evitar: muito informal, muitos emojis, linguagem de coach

---

_Criado: Maio 2026 · Projeto Luiza na Cozinha_  
_Para usar em: novo projeto de consultoria_
