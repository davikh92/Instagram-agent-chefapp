# Veo 3.1 Lite — Guia de Prompts para Food Animated

**Versão:** Maio 2026 · Automação Reels Instagram  
**Propósito:** Gerar reels cinematográficos de comida via API text-to-video

---

## 🎯 Visão Geral

**Veo 3.1 Lite** é um gerador de vídeo baseado em **texto** (não precisa de imagem prévia).

### Veo é campeão em:
- ✅ Photorealism (parece vídeo real)
- ✅ Naturalidade de movimento
- ✅ Vídeos "estilo cooking show"
- ✅ Áudio nativo incluído
- ✅ Custo: $0.05/vídeo

### Veo é fraco em:
- ❌ Cinematic dramático (sombras profundas)
- ❌ Composição artística extrema
- ❌ Detalhes micro em close-up
- ❌ Controle de câmera complexo

---

## 🧠 Cérebro Editorial — Arquétipos, Áudio e Narrativa de 8s

> **Adicionado Jul 2026** — após testes confirmarem que Veo gera voz em PT-BR com qualidade.
> Todo reel Veo pertence a UM arquétipo. O arquétipo define a cena, o áudio e o papel no funil.

### Os 3 arquétipos

| Arquétipo | Pilar | Cena | Áudio | Papel |
|---|---|---|---|---|
| **ESPELHO** | A/B | O problema em si — geladeira aberta, hesitação, 18h, cansaço | Voz PT-BR nomeia a dor. **Sem CTA falado** | Parar o scroll, comentar/marcar |
| **IMERSÃO** | A/C | Comida cinematográfica pura | **Só som ambiente** — borbulha, chiado, faca. Sem voz | Alcance frio, salvamento, estética |
| **VIRADA** | C | Mãos confiantes, cozinha resolvida, execução tranquila | Voz PT-BR com a frase de virada. Micro-CTA falado permitido (nem sempre) | Conversão |

### Rotação semanal (6 slots Veo/semana)

**2× ESPELHO · 3× IMERSÃO · 1× VIRADA**
O feed alterna dor → desejo → solução. O app aparece explicitamente 1x/semana no vídeo; o resto converte pela caption.

### Regras de áudio para 8 segundos

- **Máximo 10–12 palavras faladas** — a voz ocupa ~4s, sobra respiro no início e no fim
- Voz entra no segundo 1, nunca no 0 (o hook visual vem primeiro)
- **Uma frase só.** Sem segunda ideia. Se não cabe em uma frase, o reel é IMERSÃO
- Voz feminina brasileira, tom de amiga — nunca locutora de comercial
- Som ambiente SEMPRE presente, mesmo sob a voz
- Formato no prompt: `Audio: a warm Brazilian woman's voice says in Brazilian Portuguese: '[frase]'. Soft kitchen ambience underneath.`
- IMERSÃO: `Audio: rich ambient kitchen sounds only — [sons específicos da cena], no music, no voice.`

### Estrutura dos 8 segundos

```
0–1s  → hook visual (movimento JÁ acontecendo, nunca cena parada)
1–5s  → desenvolvimento + voz (se houver)
5–8s  → assentamento — a cena "termina", frame final segurável
```

### App simulado (VIRADA)

Não temos capturas fiéis da interface. Quando a cena pedir o app:
- Celular na bancada mostrando **um app genérico de cardápio semanal** (lista limpa de refeições, visual clean)
- Nunca prometer que é a interface real — é representação
- Exemplo: `a smartphone propped on the counter displaying a clean weekly meal-planning app with a simple list of dishes`

---

## 📐 Estrutura de Prompt

### Template padrão (copiar e colar)

```
[TIPO DE PLANO], [CONTEXTO]. 
[O QUE ACONTECE]. 
[ILUMINAÇÃO]. 
[DETALHES DA COMIDA]. 
[MOVIMENTO]. 
[ESTILO]. 
8 seconds, 1080p.
```

### Exemplo completo

```
Close-up of steaming dark ceramic bowl filled with golden chicken broth, 
herbs floating on top. Two hands wrap around the warm bowl gently. 
Steam rises continuously from the broth in a natural, organic way. 
Warm, comfortable kitchen atmosphere. Soft professional lighting. 
The golden broth gleams. Realistic, inviting food footage. 
Like comfort food photography. 8 seconds, 1080p, slow calm motion.
```

---

## ✅ FAÇA — O que funciona bem

| Elemento | ✅ Bom | ❌ Evitar |
|---|---|---|
| **Plano** | Close-up, Medium shot | Cinematic composition, Theatrical |
| **Iluminação** | Natural window light, Warm, Soft | Deep shadows, Dramatic, Golden hour |
| **Movimento** | Slow, Gentle, Natural, Deliberate | Dynamic, Fast, Cinematic pan |
| **Detalhes** | "Golden oil gleams", "Steam rises", "Fresh herbs catch light" | "Hero element", "Vibrant color against muted palette" |
| **Contexto** | Like cooking show, Recipe video, Food photography | Moody, Intimate, Cinematic, Theatrical |
| **Qualidade** | 8 seconds, 1080p | 4:5 vertical, Ultra, Extreme, 4K |

---

## 🍳 Exemplos por tipo de comida

### Tipo 1: Mão preparando (cortando, temperando, adicionando)

```
Close-up of fresh ingredients on a light wooden cutting board. 
A hand enters the frame slowly with a knife, slicing fresh tomato. 
The knife motion is smooth and deliberate. 
Warm kitchen lighting from natural window light. 
Clean, realistic food preparation footage. 
Like a cooking tutorial video. 
8 seconds, 1080p, slow motion.
```

### Tipo 2: Líquido derramando (azeite, molho, óleo)

```
Close-up of dark cast iron pan with roasted vegetables — orange carrots, 
purple onion, dark zucchini. Premium olive oil pours slowly from a bottle 
over the vegetables. Golden oil thread visible, creating small splashes. 
Warm professional kitchen lighting. 
Steam rises slightly from the hot pan. 
Realistic recipe video style footage. 
8 seconds, 1080p.
```

### Tipo 3: Prato finalizado/apresentação

```
Close-up of finished dish in a beautiful ceramic bowl. 
The dish is freshly plated, steam rises gently. 
Soft professional studio lighting, warm temperature. 
The colors of the dish are clear and appetizing. 
No hands in frame, focus on the food itself. 
High-quality food magazine photography style. 
8 seconds, 1080p, no movement.
```

### Tipo 4: Mão envolvendo prato (sopa quente)

```
Close-up of steaming bowl filled with golden broth, fresh herbs floating. 
Two hands wrap around the warm bowl gently from the sides. 
Steam rises continuously from the broth in a natural way. 
Warm, comfortable kitchen atmosphere with soft professional lighting. 
The golden broth gleams in the light. 
Realistic, inviting food footage, like comfort food photography. 
8 seconds, 1080p, slow calm motion.
```

### Tipo 5: Ervas sendo adicionadas

```
Close-up of fresh herbs being sprinkled over a prepared dish. 
A hand enters the frame slowly from the right, sprinkling vibrant 
fresh green herbs (parsley, basil, cilantro) over the food. 
Warm, natural window lighting. 
The herbs catch soft light as they fall and settle. 
Clean, realistic kitchen environment. 
Shallow depth of field, like a cooking show. 
8 seconds, 1080p, calm deliberate motion.
```

---

## 🔍 Checklist antes de submeter

Antes de adicionar um prompt a `data/veo-queue.json`, verifique:

- [ ] Começa com tipo de plano claro (Close-up, Medium shot, Wide shot, Bird's eye)
- [ ] Descreve a ação principal (o que a comida ou mão está fazendo)
- [ ] Iluminação é natural, warm ou soft (NÃO dramática/deep)
- [ ] Inclui 1-2 detalhes específicos de textura/cor/brilho da comida
- [ ] Movimento é descrito como slow, gentle, natural ou deliberate
- [ ] Faz referência a um estilo conhecido (cooking show, recipe video, food photography, etc)
- [ ] Termina com "8 seconds, 1080p"
- [ ] NÃO inclui: "dramatic", "cinematic", "deep shadows", "bokeh", "film grain"
- [ ] NÃO inclui indicação de proporção (4:5, 16:9, vertical)
- [ ] NÃO inclui: "ultra", "extreme", "4K", "hero element", "vibrant color against muted"

---

## 🛠️ Troubleshooting — Se o resultado não ficar bom

| Problema | Solução |
|---|---|
| Resultado muito genérico/flat | Adicione detalhes específicos da receita (tipo de erva, cor exata do ingrediente) |
| Imagem com distorção/glitch | Simplifique o prompt, foque em UMA ação principal |
| Mão fica estranha | Evite close-up extremo de dedos, use descrição genérica ("hand enters") |
| Cores erradas | Nomear cor explicitamente ("golden broth", "orange carrots") |
| Movimento estranho | Reduza ações simultâneas, foco em um movimento por prompt |

---

## 📌 Dicas pro

1. **Repetir palavras boas:** Se "golden" funcionou bem, use em outros prompts (oil = golden, broth = golden)
2. **Especificidade localizada:** Nomear um detalhe específico (cast iron pan, ceramic bowl, wooden board) melhora qualidade
3. **Contexto de vídeo real:** "Like cooking show" e "recipe video" funcionam melhor que "cinematic"
4. **Menos é mais:** Prompts simples e diretos funcionam melhor que descrições longas e complexas
5. **Testar uma variação:** Se um prompt gerou resultado ok, salve uma versão modificada no histórico para testar depois

---

## 📊 Métricas esperadas

- **Taxa de sucesso:** 95%+ dos prompts geram resultado aceitável
- **Tempo de geração:** 30-60 segundos por vídeo (8seg)
- **Qualidade:** 1080p, áudio nativo incluído
- **Custo:** $0.05 por vídeo
- **Tempo de trabalho:** ~5-10 min para escrever 3-4 prompts quinzenais

---

## 🔄 Integração no workflow

```
1. Agente Estrategista cria plano com temas quinzenais

2. Agente Designer escreve prompts Veo (este guia como referência)
   └─ Salva em data/veo-queue.json

3. Script generate-veo.js roda automaticamente
   └─ Chama Veo 3.1 API para cada prompt
   └─ Salva MP4s em ready-to-post/ com áudio nativo

4. Scheduled task publica automaticamente nos dias corretos
   └─ --today flag evita duplicatas
```

---

## 📚 Referências

- [Veo 3.1 Official Docs](https://deepmind.google/models/veo/)
- [Veo Prompt Engineering Guide](https://www.veo3ai.io/blog/veo-3-1-complete-guide)
- [Community Feedback on Veo for Food](https://www.veo3ai.io/blog/kling-3-0-vs-veo-3-1-2026)

---

_Atualizado: Maio 27, 2026 · Luiza na Cozinha_
