# Prompt — Post Estático Hero Terracota (Pilar A e C)

**Template:** `hero-terracota`
**Slides:** 1
**Dimensão:** `square` (1080×1080) ou `vertical` (1080×1350)

---

## Estrutura do Slide Único

| Campo | Valor |
|---|---|
| `HEIGHT` | 1080 (square) ou 1350 (vertical) |
| `HEADLINE_SIZE` | 80–96 para frases curtas / 60–72 para frases longas |
| `HEADLINE` | Frase principal — use `\n` para quebrar linha. Use `<em>texto</em>` para itálico terracota light |
| `SUBTEXT` | Complemento mais suave, em DM Sans |

---

## Frases Prontas — Copie e use

```json
"HEADLINE": "Você não odeia\ncozinhar.\nVocê odeia não saber\n<em>o que cozinhar.</em>"
"HEADLINE_SIZE": 88
```

```json
"HEADLINE": "Ninguém deveria gastar\n20 minutos pensando\n<em>no que jantar.</em>"
"HEADLINE_SIZE": 80
```

```json
"HEADLINE": "Geladeira cheia.\n<em>Cabeça vazia.</em>"
"HEADLINE_SIZE": 96
```

```json
"HEADLINE": "Semana planejada.\nDelivery evitado.\n<em>Culpa zero.</em>"
"HEADLINE_SIZE": 80
```

```json
"HEADLINE": "Sou chef.\nÀs vezes também\n<em>peço delivery.</em>"
"HEADLINE_SIZE": 88
```

```json
"HEADLINE": "O cardápio da semana\nem 2 minutos.\n<em>Sim, é real.</em>"
"HEADLINE_SIZE": 80
```

---

## Caption Template

```
[Frase do post repetida ou expandida — sem hashtag na primeira linha]

[1–2 parágrafos de contexto — por que essa frase é verdade]

[CTA: "Salva esse post" ou "Comenta aqui" ou "Link na bio"]

[Hashtags]
```

**Hashtags base:**
`#cozinhafacil #planejamentoalimentar #luizanacozinha #comidasaudavel #dicasdecozinha #vidapratica #rotinasaudavel #cardapiosemanal`

---

## Dicas de Uso

- Use `vertical` (1350px) para os posts que querem mais destaque no feed — ocupa mais tela
- `HEADLINE_SIZE` 96px só funciona bem para frases de 1–2 palavras por linha
- O `<em>` cria itálico em terracota light — use apenas na última linha da frase para criar contraste
- `SUBTEXT` deve ser mais curto e suave que o headline — complementa, não repete
