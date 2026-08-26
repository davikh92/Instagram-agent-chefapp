# 📖 Bíblia — "A Novela das 18h"

> Documento-mãe dos 26 episódios (Dom e Ter, 18h em ponto). Define universo, elenco,
> tom e arcos. **Não é roteiro:** os episódios saem daqui, um bloco por vez.
> Ciclo 01 · set→nov/2026 · Subplano: [SUBPLANO-01](../../docs/SUBPLANO-01.md)

---

## 1. A regra técnica que manda em tudo

**Consistência NÃO se escreve no prompt. Consistência vem de imagem de referência.**

Descrever a personagem por extenso ("mulher de 35 anos, cabelo castanho…") em cada
prompt não fixa nada — a cada geração sai uma pessoa diferente, e ainda ocupa o prompt
com texto que atrapalha a ação. O método fiel é um só: gerar **uma vez** as imagens
canônicas e mandá-las como referência em toda geração.

```
data/ciclo-01/ref/
  ref-cozinha.png      ← A Cozinha (ambiente canônico, sem gente)
  ref-protagonista.png ← Ela (a protagonista, na cozinha)
```

**Como o prompt fica, então:**

| ❌ Nunca | ✅ Sempre |
|---|---|
| descrever quem é a pessoa | descrever **o que ela faz** |
| descrever a cozinha | descrever **luz, câmera, som, ação** |
| "a same woman as before" | (a referência resolve; o texto não precisa citar) |

> A API aceita: `input: [{type:"image", data:<base64>, mime_type:"image/png"}, {type:"text", text:<prompt>}]`.
> Imagem **antes** do texto. Requer ajuste no `generate-omni.js` (hoje manda só texto) —
> tarefa técnica antes do primeiro episódio.

**Fluxo de produção de cada episódio:**
1. referência = `ref-protagonista.png` (ou `ref-cozinha.png` nos episódios sem ela)
2. prompt = só ação/câmera/luz/som daquele episódio
3. overlay ffmpeg = falas em texto + assinatura final

---

## 2. O universo

### A Cozinha
Uma cozinha brasileira de verdade, de apartamento — **não é cozinha de revista**.
Madeira gasta, azulejo com uma trinca, ímãs tortos na geladeira, planta que sobrevive no
peitoril. Luz lateral de janela, quente, sombra profunda (direção de arte do
`brand.json`). O mesmo enquadramento volta sempre: **a pessoa reconhece a cozinha no
primeiro frame.** Esse é o hook estrutural — não precisa inventar gancho novo toda vez.

### O horário
São sempre **18h**. O relógio do fogão marca 18h em quase todo episódio. É a hora do
"e agora?" — a dor que o produto resolve, virada em relógio na parede.

### O tom
Comédia doméstica seca, brasileira. Rimos **com** ela, nunca dela. Nada de tom
motivacional, nada de coach, nada de deboche com quem cozinha. A graça vem do
reconhecimento: *"é exatamente isso que acontece aqui em casa"*.

---

## 3. O elenco

| Personagem | O que é | Papel na história |
|---|---|---|
| **Ela** (protagonista) | Mulher brasileira, 30–40, cozinha pra casa todo dia. Cansada mas não derrotada, resolve as coisas. **Nunca tem nome** — assim qualquer pessoa se projeta nela. | Quem vive a dor e encontra a saída |
| **A Geladeira** | Personagem, não objeto. "Julga" — a porta abre e revela sempre o mesmo vazio irônico. Tem *timing* de comédia: abre, pausa, fecha. | A antagonista |
| **A Panela de Segunda** | A que sobrevive a semana inteira. Ganha camadas de história (e de fundo queimado). | A veterana, alívio cômico |
| **O Ovo Sobrevivente** | O último da caixa. Reaparece em episódios inteiros sem ser usado — até o dia em que salva tudo. | Correndo de fundo, piada de longo prazo |
| **O Celular** | **NUNCA aparece em cena.** É a regra dura: os 2 piores reels da história da conta tinham celular na tela. A solução aparece pelo *resultado*, jamais pela tela. | (proibido) |

---

## 4. Os três arcos (26 episódios)

### Arco 1 · SETEMBRO — "O Ciclo" (eps 1–9)
Ela vive a repetição: mesma geladeira, mesma pergunta, mesmo improviso às 18h. A
comédia é o loop. **Nenhuma solução aparece** — o arco existe pra construir a dor com
quem assiste. Fecha com o fundo do poço: a noite em que não tem nada, nem o improviso.

*Ganchos entre episódios:* uma coisa muda de lugar a cada episódio (o ovo, o ímã da
geladeira, a panela) — quem repara, volta.

### Arco 2 · OUTUBRO — "A Virada" (eps 10–18)
Algo muda. Ela começa a semana **antes** da semana começar. Não se diz como; mostra-se
o efeito: a geladeira abre e tem coisa, a panela descansa, as 18h chegam sem susto. A
Geladeira perde o poder — vira coadjuvante. É aqui que o app existe sem aparecer: o
espectador entende que *alguma coisa* organizou aquilo.

*Ponto de virada (ep 14):* o Ovo Sobrevivente finalmente é usado. Pagamento da piada
plantada em setembro.

### Arco 3 · NOVEMBRO — "A Casa Cheia" (eps 19–26)
A rotina resolvida encontra o mundo: visita que chega sem avisar, fim de ano se
aproximando, a família toda no domingo. Agora ela **hospeda** em vez de sobreviver. O
arco prepara dezembro (Natal) e é o mais "enviável" — situações que a pessoa manda pra
quem vai cozinhar junto.

---

## 5. Gramática de cada episódio (10s)

```
0,0–1,5s  ABERTURA   a cozinha reconhecível + o interrupt do dia (física quebrada,
                     som alto — o relógio do fogão, a porta da geladeira batendo)
1,5–4,0s  DESVIO     o beat que muda o eixo — NÃO é continuação do primeiro
4,0–8,0s  PAYOFF     ação em close transformando comida (o que os dados amam)
8,0–10s   GANCHO     a deixa que faz voltar + assinatura "Tem na Semana." (motion)
```

**Falas:** em **texto na tela** (overlay ffmpeg), não narração. Em 10s, narrar a
assinatura mata o áudio útil — e o áudio nativo é personagem (chiado, estalo, a porta
da geladeira). `voiceText` só quando a fala for curtíssima e melhorar o beat.

**Continuidade:** todo episódio termina com uma deixa que abre o próximo. Todo
episódio começa retomando a deixa anterior em 1 frame. É o que faz voltar.

---

## 6. O que a novela NUNCA faz

- Mostrar celular, app, tela, interface
- Prometer emagrecimento/saúde (`fixo.comunicacao.nao_pode_dizer`)
- Usar a chef Luiza como personagem (ela assina cardápio, não atua)
- Dizer "baixe o app" — a solução aparece pelo efeito
- Descrever a protagonista no prompt (é trabalho da imagem de referência)
- Terminar sem gancho

---

## 7. Pendências antes do episódio 1

- [ ] **Gerar as 2 imagens de referência** (Imagen 4) e o Davi aprovar — a cara da
      novela pelos 3 meses depende disso, então vale iterar até ficar certo
- [ ] **Ajustar `generate-omni.js`** pra aceitar imagem de referência (`input` array)
- [ ] **Script de overlay de texto** (ffmpeg drawtext) pras falas e a assinatura
- [ ] Escrever os 9 episódios do Arco 1
