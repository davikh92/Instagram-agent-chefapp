# 📖 Bíblia — "A Novela das 18h" · v2

> Documento-mãe dos **13 episódios** (Dom 18h, 1 por semana). Revisão de 26/ago após
> feedback do Davi: personagem aspiracional, episódios autossuficientes, arcos pensados
> pra quem assiste — não pro nosso mundo interno.
> Ciclo 01 · set→nov/2026 · Subplano: [SUBPLANO-01](../../docs/SUBPLANO-01.md)

---

## 1. A regra técnica que manda em tudo

**Consistência NÃO se escreve no prompt. Consistência vem de UMA imagem de referência.**

Uma única imagem canônica — **a protagonista NA cozinha** — gerada uma vez, aprovada
pelo Davi, e enviada como referência em toda geração de episódio:

```
data/ciclo-01/ref/ref-novela.png   ← Ela + a cozinha, na mesma imagem
```

O prompt de cada episódio descreve **só ação, câmera, luz e som**. Nunca descreve a
pessoa nem o ambiente — isso é trabalho da referência; texto descritivo só atrapalha.

> API: `input: [{type:"image", data:<base64>, mime_type:"image/png"}, {type:"text", text:<prompt>}]` —
> imagem antes do texto. Requer ajuste no `generate-omni.js` (hoje só manda texto).

**A cozinha:** a descrição final NÃO se fixa em texto — a gente gera variações de
imagem e **itera olhando até ficar boa**. Direção de partida pras gerações: cozinha
brasileira real e bonita (não de revista, mas aconchegante), luz quente lateral,
madeira, plantas — a direção de arte do `brand.json`. O Davi aprova a imagem, e a
imagem vira a lei.

---

## 2. Tom e protagonista

### O tom (mantido — aprovado)
Comédia doméstica seca, brasileira. Rimos **com** ela. Nada de coach, nada de deboche.
A graça vem do reconhecimento: *"é exatamente isso que acontece aqui em casa"*.

### Ela — a mulher que RESOLVE (revisado)
**Instagram é aspiração: as pessoas seguem quem elas gostariam de ser.** Ela não é
cansada, não é vítima da rotina — ela é **rápida, espirituosa, no controle**. O caos
das 18h existe (é a dor real do público), mas ela o atravessa com estilo: em 10
segundos a situação impossível vira jantar bonito na mesa. Quem assiste pensa duas
coisas, nessa ordem: *"queria ser assim"* e *"como ela faz isso?"* — e a resposta
implícita é o que o app vende.

Sem nome (qualquer pessoa se projeta). Rosto aparece — humanização que faltava nos
nossos vídeos de mãos.

## 3. Elenco de apoio (enxuto)

| Elemento | Papel |
|---|---|
| **A Geladeira** | Parceira de cena cômica — a porta abre e a surpresa do episódio está lá (o que tem, o que falta, o que sobrou). Timing de comédia: abre, pausa, revela. Não é "antagonista que julga" — é o baú de onde sai cada história. |
| **A cozinha** | O cenário fixo que faz a conta ser reconhecível no frame 1 |
| **O celular** | Pode aparecer **naturalmente** (na bancada, uma olhada rápida) — só não pode ser o objeto principal nem tela em close. A lição dos dados é "não fazer do celular o foco", não "proibir celular". |

*(Cortados da v1: o Ovo Sobrevivente e as gags de continuidade — com 1 episódio por
semana, ninguém acompanha detalhe escondido. A serialidade vem do universo e da
personagem, não de memória exigida.)*

---

## 4. A regra de ouro dos episódios (a correção mais importante)

**Todo episódio é uma história completa e entrega valor sozinho.** Quem nunca viu
nenhum episódio entende, ri e leva algo. Estrutura fixa:

```
SITUAÇÃO (0–1,5s)   uma dor de jantar 100% reconhecível, no susto
CAOS (1,5–4s)       a tentativa que todo mundo já viveu — comédia
VIRADA (4–8s)       ela resolve COM ESTILO — ação em close, comida de verdade
MESA (8–10s)        o jantar bonito na mesa + punchline em texto + "Tem na Semana."
```

O que faz voltar **não é cliffhanger** — é a fórmula: *"toda semana ela resolve uma
situação que eu vivo"*. Igual quadro fixo de programa de TV: você volta pelo formato,
não pela memória do episódio anterior. Teaser leve no fim ("domingo que vem: visita
avisando às 18h47") é opcional, nunca obrigatório.

## 5. As três temporadas (13 eps · ~4 por mês — pensadas em quem assiste)

### T1 · SETEMBRO — "18h, e agora?" (eps 1–4)
As quatro situações campeãs de identificação, uma por domingo, cada uma RESOLVIDA:
1. **Chegou 19h e todo mundo com fome** — jantar em 15 min sem parecer improviso
2. **"Só tem 3 coisas na geladeira"** — e vira prato de gente grande
3. **Criança que não come nada** — o truque que muda o jogo
4. **Visita avisou que chega às 20h** — de pânico a mesa posta

*Por que assistir:* cada ep é um mini-tutorial emocional — a pessoa ri, se reconhece
E leva uma saída. Enviável por natureza: "manda pra quem vive isso".

### T2 · OUTUBRO — "A semana que obedece" (eps 5–9)
Aspiração pura: a vida com a semana no controle. Mercado numa ida só (nada sobra, nada
falta). Domingo de marmitas que rende a semana. A terça que ninguém teme. O "que dia é
hoje? tanto faz, já sei o jantar". É o arco onde o público **quer a vida dela** — e o
app é a resposta não-dita.

### T3 · NOVEMBRO — "Casa cheia" (eps 10–13)
Ela recebendo: o almoço de família do domingo, o jantar a dois que parece de
restaurante, a amiga que "passou pra um café" e ficou, e o ep 13 fechando com a
preparação de dezembro — gancho natural pro ciclo do Natal. O arco mais enviável do
ano: comida + gente + data chegando.

---

## 6. Regras de conteúdo (alinhadas ao Contexto — não inventadas)

- Cardápios podem ser citados **pelo nome e pra quem são** (inclusive os de
  emagrecimento/objetivo — são produtos reais do app). O que não pode, por regra do
  próprio app (`fixo.comunicacao`): **prometer resultado** ("vai emagrecer", "cura",
  "trata"). Nome e público: sim. Promessa clínica: não.
- A chef Luiza não atua (assina cardápio, não é personagem)
- "Baixe o app" não se fala — a solução aparece pelo efeito; o CTA da legenda faz o resto
- Prompt nunca descreve pessoa/ambiente (é papel da referência)

## 7. Pendências antes do episódio 1 (nv-01 · 06/set)

- [ ] **Gerar opções da imagem de referência** (Ela + cozinha, uma imagem) → Davi
      escolhe/itera até aprovar. É a decisão mais irreversível do ciclo.
- [ ] Ajustar `generate-omni.js` pra aceitar referência (`input` array)
- [ ] Script de overlay ffmpeg (punchline em texto + assinatura)
- [ ] Escrever os 4 episódios de setembro no formato do bloco (CALENDARIO.md)
