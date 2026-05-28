# 📅 Fluxo Futuro — Depois de 28/05

**Hoje:** 27 de maio, 2026  
**Teste:** 28 de maio (reel-food-03-teste)  
**Próxima quinzena:** 1º de junho, 2026

---

## 🎯 Linha do Tempo

```
27/05 (hoje)
├─ Implementar Veo 3.1
├─ Obter API Key
└─ Testar com reel-food-03-teste

28/05 (amanhã)
├─ node scripts/generate-veo.js --all
├─ Gera reel-food-03-teste/reel.mp4 (com áudio)
├─ Avaliar qualidade
└─ Publicar manualmente ou aguardar publicação automática (12h)

29/05 - 31/05
└─ Sistema roda normalmente (publicações automáticas)

01/06 (quinta-feira, 9h) ⭐ NOVA QUINZENA COMEÇA
├─ Agente Estrategista: /briefing (coleta temas de junho)
├─ Agente Designer: /quinzena (cria plano com posts + 3-4 reels Veo)
├─ Agente Designer: escreve prompts Veo → data/veo-queue.json (NOVO!)
├─ node scripts/screenshot.js --all (gera posts PNG)
├─ node scripts/generate-veo.js --all (gera reels MP4 com áudio)
└─ Publicação automática começa Mon 18h

02/06 - 15/06
└─ Sistema publica automaticamente:
   Mon 18h, Wed 18h, Thu 12h, Fri 12h, Sun 10h
```

---

## 🔄 Procedimento Quinzenal Padrão (a partir de 1º junho)

### Ciclo quinzenal (1º e 15º de cada mês, ~45 min)

#### Passo 1: Briefing (5 min)
```bash
# Execute na sessão Claude Code:
/briefing

# Responda 8 perguntas sobre:
# - Temas da quinzena
# - Pilares (A=identificação, B=solução, C=resultado, D=comunidade)
# - Datas de publicação
# - Receitas/conteúdo em destaque

# Output: data/briefing-2026-06-01.json
```

#### Passo 2: Planejamento (5 min)
```bash
/quinzena

# Agente Estrategista lê briefing
# Gera plano com:
# - 9 posts (carrosséis + estáticos em HTML)
# - 3-4 reels Veo (prompts + captions)

# Output: 
# - data/plano-2026-06-01.json
# - data/plano-2026-06-01.md
```

#### Passo 3: Escrever Prompts Veo (10 min)
```bash
# Você (ou Agente Designer) escreve prompts Veo

# Abrir: data/veo-queue.json
# Limpar: remover reels da quinzena anterior
# Adicionar: 3-4 novos reels (do plano)

# Cada reel:
# - id: reel-TEMA-NUMERO
# - date: YYYY-MM-DD (data de publicação)
# - prompt: (seguindo docs/veo-prompt-guide.md)
# - caption: (pronto para Instagram)
# - hashtags: (sem quebras)

# Exemplo:
{
  "id": "reel-salada-01",
  "date": "2026-06-08",
  "prompt": "Close-up of fresh colorful salad being mixed in a wooden bowl...",
  "caption": "Salada que parece simples mas engana. Fácil de fazer.",
  "hashtags": "#luizanacozinha #salada #receitafacil"
}
```

#### Passo 4: Gerar Posts PNG (10 min)
```bash
node scripts/screenshot.js --all

# Output: 9 posts em PNG
# ready-to-post/2026-06/2026-06-XX/[post-id]/
#   ├─ slide-01.png
#   ├─ slide-02.png ... (múltiplos slides)
#   ├─ caption.txt
#   └─ post.json
```

#### Passo 5: Gerar Reels MP4 com Áudio (5 min)
```bash
node scripts/generate-veo.js --all

# Veo API gera cada reel (~1-2 min por reel)
# Output: MP4s com áudio nativo em:
# ready-to-post/2026-06/2026-06-XX/[reel-id]/
#   ├─ reel.mp4 (com áudio!)
#   ├─ caption.txt
#   └─ reel.json
```

#### Passo 6: Publicação Automática (0 min — não faça nada!)
```
Sistema publica automaticamente nos horários:

Segunda 18h       → publica 1 post/reel (agendado para segunda)
Quarta 18h        → publica 1 post/reel (agendado para quarta)
Quinta 12h        → publica 1 post/reel (agendado para quinta)
Sexta 12h         → publica 1 post/reel (agendado para sexta)
Domingo 10h       → publica 1 post/reel (agendado para domingo)

Você não precisa fazer nada! ✅
```

---

## 📋 Checklist Quinzenal

```
SEGUNDA-FEIRA DO CICLO (1º ou 15º):

[ ] 9h00 — /briefing (responde 8 perguntas)
[ ] 9h10 — /quinzena (agente cria plano)
[ ] 9h20 — Escrever prompts Veo em data/veo-queue.json
[ ] 9h35 — node scripts/screenshot.js --all
[ ] 9h45 — node scripts/generate-veo.js --all
[ ] 9h50 — Verificar saída em ready-to-post/

PRONTO! Sistema publica automaticamente a partir de segunda 18h.
```

---

## 🎬 Estrutura de veo-queue.json (Referência)

Sempre comece assim:

```json
[
  {
    "id": "reel-TEMA-01",
    "date": "2026-06-DD",
    "prompt": "Close-up de... [seguir docs/veo-prompt-guide.md]",
    "caption": "Primeira linha impactante.\n\nDescrição do app.",
    "hashtags": "#luizanacozinha #tema #outro"
  },
  {
    "id": "reel-TEMA-02",
    "date": "2026-06-DD",
    "prompt": "...",
    "caption": "...",
    "hashtags": "..."
  }
]
```

**IMPORTANTE:** Cada reel precisa de:
- ✅ `id` único
- ✅ `date` válida (YYYY-MM-DD, não passada)
- ✅ `prompt` seguindo template Veo (leia `docs/veo-prompt-guide.md`)
- ✅ `caption` completa com CTA
- ✅ `hashtags` relevantes

---

## 🚀 Otimizações para Próximas Quinzenas

### Depois que testar e aprovar Veo:

1. **Adicionar ao scheduling automático (opcional):**
   ```bash
   # Na scheduled task "luiza-ciclo-quinzenal" (1º/15º 9h):
   node scripts/generate-veo.js --all
   ```

2. **Template de prompt (salvar como referência):**
   - Copiar `docs/veo-prompt-guide.md` template
   - Usar em cada novo reel (apenas adaptar descrição)

3. **Histórico de prompts:**
   - Manter backup de `veo-queue.json` por quinzena
   - Reutilizar prompts que funcionaram bem

---

## 📊 Métricas a Acompanhar

Depois de 3-4 semanas usando Veo, medir:

- **Taxa de sucesso:** % de reels gerados sem erro
- **Tempo de geração:** tempo médio por reel
- **Engagement:** clicks, saves, shares nos reels Veo vs posts
- **Qualidade:** feedback visual (photorealism ok? Áudio ok?)
- **Custo:** total gasto em API Veo

---

## ⚡ Troubleshooting Futuro

**Se um reel falhar:**
```bash
# Script detecta published.json e pula já feitos
# Corrija o prompt em veo-queue.json e rode novamente:
node scripts/generate-veo.js --all

# Ele tenta só os que faltam
```

**Se quiser gerar um reel específico:**
```bash
node scripts/generate-veo.js --folder ready-to-post/2026-06/2026-06-15/reel-TEMA-01
```

**Se mudar a data de publicação:**
```bash
# Edite a pasta de data:
mv ready-to-post/2026-06/2026-06-15/reel-TEMA-01 \
   ready-to-post/2026-06/2026-06-22/reel-TEMA-01

# (Scheduled task --today ainda funciona)
```

---

## 📖 Documentação de Referência Rápida

| Momento | Leia |
|---|---|
| Escrever novo prompt Veo | `docs/veo-prompt-guide.md` |
| Dúvida sobre implementação | `docs/veo-implementation.md` |
| Erro na geração | `docs/veo-implementation.md` (seção Problemas) |
| Overview do sistema | `README-VEO.md` |
| Fila atual de reels | `data/veo-queue.json` |

---

## ✅ Resumo Pós-28/05

**Pré-01/06:**
- Sistema roda normalmente
- Publicações automáticas funcionam
- Você não precisa fazer nada

**01/06 em diante (todas as quinzenas):**
- /briefing → /quinzena → escrever prompts → node scripts
- 45 min de trabalho humano
- Resto automático

**Custo mensal:** ~$0.30 (Veo) + ~$10 (Cloudinary) = ~$10.30

---

_Documentado: 27 de maio, 2026 · Luiza na Cozinha_
