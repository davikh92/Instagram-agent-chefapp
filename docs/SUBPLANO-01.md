# 🎬 Subplano 01 — set→nov/2026 (90 dias) · "A Cozinha que Resolve"

> Filho do [PLANO-MASTER](PLANO-MASTER.md). **Status: APROVADO pelo Davi em 26/ago**
> (com ceticismo saudável — por isso toda hipótese tem critério de morte).
> Próximo passo: escrever o ciclo inteiro (datas, ideias, legendas, prompts) de uma vez.

---

## A plataforma

A conta deixa de ser "perfil que posta vídeo de comida" e vira uma coisa que
**funciona**: o caos de quem assiste entra, uma solução sai — a engrenagem do app,
virada em conteúdo. Três motores fabricam pauta sem esgotar:

## ⚙️ Motor 1 — PARTICIPAÇÃO · "Fala o que tem na tua geladeira"

O público comenta o caos ("frango, meio brócolis, arroz de ontem") e **o comentário
vira o próximo vídeo**: a gente escolhe 1/semana, gera o prato resolvido daquela
geladeira e marca a pessoa no vídeo.

- Pauta infinita e grátis — o público escreve o roteiro
- Comentário composto: cada episódio pede o próximo; a pessoa volta pra ver se a dela ganhou
- É a demonstração do produto sem celular na tela (input caótico → resolvido)
- Envio embutido: "manda pra fulana comentar a geladeira dela"
- Ataca a pior métrica da conta (3 comentários em 91 posts)
- *Partida a frio:* nas 2 primeiras semanas, a "geladeira" vem de conhecidos/do Davi — o vídeo mostra o mecanismo funcionando até os comentários reais chegarem.

## ⚙️ Motor 2 — IDENTIFICAÇÃO · "A Novela das 18h"

O drama do jantar, serializado como novela, no horário de novela. Universo fixo (a
mesma cozinha; personagens recorrentes: a geladeira que julga, a panela de segunda, o
ovo sobrevivente), episódios com gancho e **continuação — a pessoa volta pra saber o
que acontece**. Humanização e dor: é aqui que a audiência se reconhece e começa a
enxergar o app como solução, sem nunca ouvir "baixe o app".

- Episódios saem das dores reais (as 18h, o mercado, o "de novo isso?")
- Universo fixo = reconhecível no frame 1 (hook estrutural)
- Cliffhanger no fim de cada episódio — continuidade prende
- IA torna uma novela possível a ~$1/episódio

## ⚙️ Motor 3 — UTILIDADE · o catálogo do app virado conteúdo

A fonte é o que o app JÁ tem: **cardápios prontos** (emagrecimento, vegano, massa,
detox/ressaca, pele & intestino, foco, low carb — ler sempre de
`atual.cardapios_da_casa`), 486 receitas com página própria, e a engrenagem principal
(6 perguntas → semana personalizada) como tema demonstrável.

**As duas variantes de receita — NUNCA no mesmo post, SEMPRE ambas na semana:**

| Variante | Legenda | CTA | Papel | Conflito zero |
|---|---|---|---|---|
| **R-LEGENDA** | receita completa (ingredientes + passos + dica) | "salva pra quarta" | salvamento + tempo de leitura | a legenda entrega tudo; DM não faz sentido aqui |
| **R-DM** | fome + ocasião, SEM a receita | "comenta RECEITA que te mando o link" | comentário + tráfego pro app (o mais importante) | a receita só existe no link; a DM tem valor real |

Camada de **calendário** por cima quando a data merecer (Natal, namorados, junina,
véspera de feriado) — ocasional, não pilar: "salva pro dia 12", "manda pra quem vai
cozinhar contigo".

## 🔏 Assinatura transversal — carimbo VISUAL, não falado

Todo vídeo termina no mesmo ~1s: **"Tem na Semana."** como resposta, em MOTION/TEXTO
(kinetic type + som curto de "resolvido" — nunca narração: em 10s, falar a assinatura
mata o resto do áudio). Padrão que capitaliza a cada post.

**Texto em movimento é ferramenta de primeira classe** em todos os motores: palavras
que pulsam no beat, números que contam, e vídeos híbridos — tabela nutricional
aparecendo, painéis, grafismos — tudo descritível no prompt ou aplicado via overlay.
Vídeo não precisa ser 100% "filmado".

---

## Cadência e custo (5 reels/semana ≈ 22/mês)

| Slot | Motor | Modelo | Custo |
|---|---|---|---|
| 2×/sem | Novela das 18h | Omni Flash (10s, $1) | $2,00 |
| 1×/sem | R-LEGENDA | **Veo 3.1 Lite** (8s, $0,40) | $0,40 |
| 1×/sem | R-DM / Cardápio | Omni Flash | $1,00 |
| 1×/sem | Participação | Veo 3.1 Lite | $0,40 |

**≈ $16,50/mês** (hoje: $13) — 70% mais volume por +27% de custo. O mix
barato/melhor por slot é o "abaixa um, sobe outro" do Davi, implementável hoje:
`generate-veo.js` já existe como gerador Lite. Se um motor provar valor, o modelo dele
sobe; se decepcionar, desce ou morre — decisão por checkpoint, dentro da trava de
**$120/ciclo**.

Stories (3/dia) continuam como eco: enquete da geladeira, lembrete do episódio,
repost do dia.

## Hipóteses e critérios de morte (D+90)

| # | Hipótese | Critério |
|---|---|---|
| H1 | Estrutura não-linear + universo fixo seguram mais | Retenção mediana ≥ **4,5s** (meta master: 5s) |
| H2 | Participação gera comentário real | ≥ **30 comentários/mês** orgânicos (hoje ~1) |
| H3 | R-DM converte mais que R-LEGENDA em tráfego; R-LEGENDA vence em salvamento | UTM + salvos por variante decidem o mix do ciclo 2 |
| H4 | Novela gera retorno (continuidade) | Retenção dos eps 2+ ≥ ep 1; alcance de seguidor crescendo nos eps |
| H5 | Dia/horário importam | Grade rotativa mensal — diferença consistente, não outlier |

*Voz:* segue a regra atual (ambiente + Livia onde couber); o A/B formal de voz e os
testes de edição (frame-chaining pra >10s, motion avançado) ficam pra fase de
produção — são edição, não plano.

## Grade experimental (rotação mensal)

| Mês | Dias | Nota |
|---|---|---|
| Set | Seg · Ter · **Qua (R-LEGENDA fixa)** · Sex · Sáb | Ter/Sáb testam a hipótese da análise |
| Out | Dom · Ter · **Qua** · Qui · Sáb | Dom/Ter/Qua 18–21 = atividade do painel |
| Nov | 4 vencedores + 1 wildcard | wildcard evita cegueira |

Novela sempre às **18h em ponto** (o horário é parte da piada e da marca).
Trial Reels (manual, no app): conceitos novos de interrupt/episódio-piloto rodam como
trial antes de entrar na grade.

## Medição

- `fetch-metrics.js` semanal · checkpoints **D+30 / D+60 / D+90** contra as hipóteses
- Funil do app por `utm_campaign=<id-do-post>` (pedir visão `entrou→montou_semana` ao time do app)
- **Todo item da fila declara** `funcao` (descoberta/salvamento/tráfego) e `gatilho_envio` — post sem função não entra

## O que este ciclo NÃO faz

- Não mexe em identidade visual (aguarda `identidade_visual` no Contexto)
- Não usa a chef como personagem (material orgânico é plano futuro)
- Não automatiza comenta→DM no dia 1 (manual primeiro; webhook durante o ciclo)
- Não decide edição avançada agora (frame-chaining, motion pesado = fase de produção)
- Formato *foto + passo a passo* (salmão) entra quando o Davi detalhar

## Banco de ideias pra fase de escrita dos vídeos

"A Semana em 10 Segundos" (take impossível pelos 7 jantares — episódio especial de
lançamento de cardápio) · cebola no ar · massa estatelada · reverso · POV de dentro da
panela · congelamento · velocidade violenta · erro-que-acerta · escala errada · chuva
de ingredientes · tabela nutricional que se monta · contagem de preço no mercado.

## Próximo passo

Escrever o ciclo INTEIRO de uma vez: ~66 reels (22/mês × 3) com data, ideia, legenda,
prompt, CTA, `funcao` e `gatilho_envio` → filas. Geração escoa em lotes de 5; custo
conhecido no dia zero.
