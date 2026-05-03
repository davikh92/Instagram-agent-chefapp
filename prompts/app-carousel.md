# Prompt — Carrossel do App (Pilar C)

**Template:** `lista-steps`
**Slides:** 6 (capa + 4 steps + resultado)
**Dimensão:** `square` (1080×1080)

---

## Estrutura de Slides

### Slide 1 — Capa
Use `CONTENT_BLOCK` com o HTML:
```html
<div class="cover-title" style="font-size:{{HEADLINE_SIZE}}px">Do zero ao cardápio<br>em 2 minutos.</div>
<div class="cover-sub">Veja como funciona →</div>
```

### Slides 2–5 — Um step por slide
Use `CONTENT_BLOCK` com o HTML:
```html
<div class="step-row">
  <div class="step-circle"><span class="step-number">01</span></div>
  <div class="step-content">
    <div class="step-title">Análise de perfil</div>
    <div class="step-desc">Você conta seus objetivos e restrições alimentares. Leva menos de 30 segundos.</div>
    <div class="step-time">Leva ~30 segundos</div>
  </div>
</div>
```

**4 steps padrão:**

| Step | Título | Descrição | Tempo |
|---|---|---|---|
| 01 | Análise de perfil | Você conta seus objetivos e restrições alimentares | ~30 segundos |
| 02 | IA gera o cardápio | 7 dias completos: café, almoço, jantar e lanches | automático |
| 03 | Lista de compras | Organizada por categoria, com checkbox — gerada automaticamente | instantâneo |
| 04 | Receitas detalhadas | Com dicas da Chef Luiza, substituições e harmonizações | quando quiser |

### Slide 6 — Resultado/CTA
Use `CONTENT_BLOCK` com o HTML:
```html
<div style="background:#5C7A5E; margin:-64px -72px; padding:64px 72px; height:100%; display:flex; flex-direction:column; justify-content:center;">
  <div style="font-family:'Playfair Display',serif; font-weight:700; font-size:56px; color:#FFFDF9; line-height:1.1; margin-bottom:24px;">Semana planejada.<br>Geladeira abastecida.<br><em style="font-style:italic; font-weight:400;">Culpa zero.</em></div>
  <div style="display:inline-block; background:#FFFDF9; color:#C8572A; font-family:'DM Sans',sans-serif; font-weight:500; font-size:18px; padding:14px 28px; border-radius:100px; margin-top:16px;">✨ Começar grátis — luizanacozinha.app</div>
</div>
```

---

## Caption Template

```
[Dado ou afirmação direta sobre o problema]

[O que o app faz especificamente — sem jargão técnico]

[O que a pessoa vai sentir/conseguir depois]

[CTA: "Link na bio pra testar grátis"]

[Hashtags]
```

**Hashtags base:**
`#planejamentoalimentar #cardapiosemanal #cozinhainteligente #luizanacozinha #alimentacaosaudavel #organizacaoalimentar #comidasaudavel #receitasfaceis #dicasnutricao #vidapratica`

---

## Variação: Antes × Depois

**Template:** `cream-sage` (alternando com `dark-carousel`)
**Slides:** 3 | **Dimensão:** `vertical` (1080×1350)

Slide 1 (ANTES) — fundo dark, lista de dores
Slide 2 (DEPOIS) — fundo creme, lista de benefícios
Slide 3 (CTA) — fundo terracota
