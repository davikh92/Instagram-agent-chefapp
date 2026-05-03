# Luiza na Cozinha — Agentes de Conteúdo Instagram

## O Projeto
Equipe automatizada de produção de conteúdo para o Instagram da Luiza na Cozinha —
app de planejamento alimentar semanal com IA (luizanacozinha.lovable.app).

**Meta:** 12–16 posts/mês produzidos em ~30 min de trabalho humano.
**Chef protagonista:** Luiza Hoffmann.
**Canal de validação:** Instagram (@luizanacozinha).

## Arquivos de Referência
- `brand.json` — paleta, fontes, dimensões, CTAs. **Fonte única de verdade — nunca hardcode valores nos templates.**
- `agents/` — definição de cada agente especializado
- `prompts/` — biblioteca de prompts reutilizáveis por tipo de post
- `templates/` — HTML base para cada template visual
- `ready-to-post/` — output final organizado por data

## Comandos Disponíveis

| Comando | Agente | O que faz |
|---|---|---|
| `/briefing` | Agente 0 | Coleta temas da quinzena com 8 perguntas-chave |
| `/quinzena` | Agente 1 (Estrategista) | Gera plano quinzenal completo a partir do briefing |
| `/design [post-id]` | Agente 2 (Designer) | Gera HTML dos slides + exporta PNGs via Puppeteer |
| `/design all` | Agente 2 | Gera todos os posts do plano quinzenal |
| `/checklist` | — | Verifica todos os posts contra as regras de qualidade |

## Regras Absolutas de Visual
- NUNCA usar fontes fora do sistema (Playfair Display, DM Sans, DM Mono)
- NUNCA usar cores fora da paleta definida em brand.json
- NUNCA fundo branco puro #FFFFFF — sempre #FFFDF9 ou #F7F2EA
- SEMPRE incluir 'Luiza na Cozinha' ou 'luizanacozinha.app' em todo post
- SEMPRE contraste alto entre fundo e texto
- Margem lateral mínima: 48px em todos os posts
- Slide 1 de qualquer carrossel deve funcionar como post independente
- Máximo 7 slides por carrossel
- Todo post termina com CTA

## Regras Absolutas de Conteúdo
- Identificação emocional SEMPRE antes de mostrar o app
- Tom conversacional, brasileiro, sem formalidade — nunca jargão de coach
- Humor leve e auto-irônico nos Pilares A e B
- Nunca posts puramente educativos sem elemento de identificação

## Pipeline de Produção

```
/briefing
  └─ coleta input → salva em data/briefing-[data].json

/quinzena
  └─ lê briefing.json + brand.json
  └─ gera plano → salva em data/plano-[data].json + plano-[data].md

/design [post-id]
  └─ lê plano.json + brand.json
  └─ gera templates/generated/post-[id].html
  └─ roda scripts/screenshot.js → ready-to-post/[data]/post-[id]/
     ├─ slide-01.png
     ├─ slide-02.png (se carrossel)
     └─ caption.txt
```

## Ferramentas Disponíveis
- `scripts/screenshot.js` — converte HTML em PNGs via Puppeteer (node scripts/screenshot.js)
- `templates/` — HTMLs base para cada template visual
- `brand.json` — configurações de marca
