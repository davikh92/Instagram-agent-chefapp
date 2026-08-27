# Foto de perfil — Tem na Semana

1080×1080 (o Instagram recorta em círculo). Duas famílias:

**Com fundo fotográfico** — `gera-avatar-foto.js` · fundo gerado por IA + wordmark por cima
| Arquivo | Leitura |
|---|---|
| `f5-bowls-natural.png` | **recomendada** — anel de pratos ao redor da marca; a "semana" virou imagem |
| `f6-bowls-lavagem.png` | mesmo anel em lavagem terracota — cor de marca dominante |
| `f3-vapor-natural.png` | vapor dourado em fundo quase preto, o mais dramático |
| `f1-ervas-natural.png` | ervas e tomate na borda, apetitoso |
| `f2` e `f4` | descartadas — lavagem apaga o verde/vermelho e a farinha ficou vazia |

**Fundo chapado** — `gera-avatar.js` · `c-monograma` (TnS) é a única legível em 32px

## Como regerar (da raiz do projeto)
```
node assets/perfil/gera-avatar-foto.js assets/perfil    # fundos ficam em cache
node assets/perfil/gera-avatar.js assets/perfil
```
Apagar `assets/perfil/fundos/` força novos fundos (custa ~$0,05 cada).

`PROVA-foto.png` e `PROVA-circulo.png` mostram tudo recortado em 215px, 100px
(perfil) e 32px (feed) — o tamanho de 32px é o que decide.

Fontes e cores saem do `brand.json`: Bebas Neue, Playfair Display, DM Mono ·
terracota `#C8572A`, creme `#F7F2EA`, charcoal `#1E1810`.
