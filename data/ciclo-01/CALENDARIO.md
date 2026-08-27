# 📅 Ciclo 01 — Calendário · "A Cozinha que Resolve" (set→nov/2026)

> A CASA. Cada linha é um post; preenchemos por blocos (um motor por vez), nunca tudo
> de uma vez. Quando um bloco fica pronto, os posts entram na fila de geração
> (veo-queue.json) e o status vira ✅. Plano: docs/SUBPLANO-01.md.

**Status:** ⬜ vazio · ✍️ escrito (aguardando revisão do Davi) · ✅ na fila · 📤 publicado

---

## O bloco de cada post (template)

Todo post, de qualquer motor, é escrito com estes campos — nada entra sem todos:

```
id:             nv-01 (nv=novela · cd=cardápio-dm · rl=receita-legenda · rd=receita-dm · pt=participação)
data / hora:    2026-09-06 · 18h
motor:          Novela das 18h
funcao:         descoberta | salvamento | trafego   ← papel no funil, obrigatório
gatilho_envio:  "manda pra quem..." — POR QUE alguém envia isso, escrito
titulo:         nome de trabalho do vídeo
descricao:      os beats, segundo a segundo (0-1,5 interrupt / desvio / payoff / entrega)
prompt:         EN, só AÇÃO/câmera/luz/som — consistência vem da imagem de referência
legenda:        PT-BR, com o CTA DENTRO dela (CTA não é campo separado)
hashtags:       mix 12-15 (brand.json → hashtags)
voiceText:      fala curta estilo real, OU "—" (sem voz)
overlay:        (DESCARTADO 27/08 — ver Decisões) texto ficaria pós-geração via ffmpeg
modelo:         Omni Flash ($1) | Veo Lite ($0,40)
ref_imagem:     data/ciclo-01/ref/ref-novela.png (episódios da novela) ou "—"
link_utm:       só se funcao=trafego: {url_canonica}/caminho?utm_source=instagram&utm_campaign=<id>
```

**Assinatura no fim do vídeo:** desejada, ainda NÃO resolvida. Via ffmpeg está descartado (27/08). A testar: pedir na própria geração. Nunca narrada.

---

## Setembro — grade: Dom·Ter·Qua·Sex·Sáb (entra Dom, sai Seg — pior dia medido)

| ID | Data | Dia | Motor | Modelo | Status | Título |
|---|---|---|---|---|---|---|
| `cd-01` | 2026-09-01 | Ter 18h | Cardápio da Semana DM | Omni | ⬜ |  |
| `rl-01` | 2026-09-02 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-01` | 2026-09-04 | Sex 12h | Receita DM | Omni | ⬜ |  |
| `pt-01` | 2026-09-05 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-01` | 2026-09-06 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `cd-02` | 2026-09-08 | Ter 18h | Cardápio da Semana DM | Omni | ⬜ |  |
| `rl-02` | 2026-09-09 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-02` | 2026-09-11 | Sex 12h | Receita DM | Omni | ⬜ |  |
| `pt-02` | 2026-09-12 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-02` | 2026-09-13 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `cd-03` | 2026-09-15 | Ter 18h | Cardápio da Semana DM | Omni | ⬜ |  |
| `rl-03` | 2026-09-16 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-03` | 2026-09-18 | Sex 12h | Receita DM | Omni | ⬜ |  |
| `pt-03` | 2026-09-19 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-03` | 2026-09-20 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `cd-04` | 2026-09-22 | Ter 18h | Cardápio da Semana DM | Omni | ⬜ |  |
| `rl-04` | 2026-09-23 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-04` | 2026-09-25 | Sex 12h | Receita DM | Omni | ⬜ |  |
| `pt-04` | 2026-09-26 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-04` | 2026-09-27 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `cd-05` | 2026-09-29 | Ter 18h | Cardápio da Semana DM | Omni | ⬜ |  |
| `rl-05` | 2026-09-30 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |

## Outubro — grade: Dom·Ter·Qua·Qui·Sáb (testa Qui no lugar de Sex)

| ID | Data | Dia | Motor | Modelo | Status | Título |
|---|---|---|---|---|---|---|
| `rd-05` | 2026-10-01 | Qui 19h | Receita DM | Omni | ⬜ |  |
| `pt-05` | 2026-10-03 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-05` | 2026-10-04 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `cd-06` | 2026-10-06 | Ter 18h | Cardápio da Semana DM | Omni | ⬜ |  |
| `rl-06` | 2026-10-07 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-06` | 2026-10-08 | Qui 19h | Receita DM | Omni | ⬜ |  |
| `pt-06` | 2026-10-10 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-06` | 2026-10-11 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `cd-07` | 2026-10-13 | Ter 18h | Cardápio da Semana DM | Omni | ⬜ |  |
| `rl-07` | 2026-10-14 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-07` | 2026-10-15 | Qui 19h | Receita DM | Omni | ⬜ |  |
| `pt-07` | 2026-10-17 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-07` | 2026-10-18 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `cd-08` | 2026-10-20 | Ter 18h | Cardápio da Semana DM | Omni | ⬜ |  |
| `rl-08` | 2026-10-21 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-08` | 2026-10-22 | Qui 19h | Receita DM | Omni | ⬜ |  |
| `pt-08` | 2026-10-24 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-08` | 2026-10-25 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `cd-09` | 2026-10-27 | Ter 18h | Cardápio da Semana DM | Omni | ⬜ |  |
| `rl-09` | 2026-10-28 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-09` | 2026-10-29 | Qui 19h | Receita DM | Omni | ⬜ |  |
| `pt-09` | 2026-10-31 | Sáb 11h | Participação | Veo Lite | ⬜ |  |

## Novembro — grade PROVISÓRIA (definir no checkpoint D+60 com os vencedores + 1 wildcard)

| ID | Data | Dia | Motor | Modelo | Status | Título |
|---|---|---|---|---|---|---|
| `nv-09` | 2026-11-01 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `cd-10` | 2026-11-03 | Ter 18h | Cardápio da Semana DM | Omni | ⬜ |  |
| `rl-10` | 2026-11-04 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-10` | 2026-11-06 | Sex 12h | Receita DM | Omni | ⬜ |  |
| `pt-10` | 2026-11-07 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-10` | 2026-11-08 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `cd-11` | 2026-11-10 | Ter 18h | Cardápio da Semana DM | Omni | ⬜ |  |
| `rl-11` | 2026-11-11 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-11` | 2026-11-13 | Sex 12h | Receita DM | Omni | ⬜ |  |
| `pt-11` | 2026-11-14 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-11` | 2026-11-15 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `cd-12` | 2026-11-17 | Ter 18h | Cardápio da Semana DM | Omni | ⬜ |  |
| `rl-12` | 2026-11-18 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-12` | 2026-11-20 | Sex 12h | Receita DM | Omni | ⬜ |  |
| `pt-12` | 2026-11-21 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-12` | 2026-11-22 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `cd-13` | 2026-11-24 | Ter 18h | Cardápio da Semana DM | Omni | ⬜ |  |
| `rl-13` | 2026-11-25 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-13` | 2026-11-27 | Sex 12h | Receita DM | Omni | ⬜ |  |
| `pt-13` | 2026-11-28 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-13` | 2026-11-29 | Dom 18h | Novela das 18h | Omni | ⬜ |  |

---

## Totais do ciclo

| Motor | Posts | Modelo | Custo |
|---|---|---|---|
| Novela das 18h (Dom) | 13 | Omni | $13.00 |
| Cardápio da Semana DM (Ter) | 13 | Omni | $13.00 |
| Receita LEGENDA (Qua) | 13 | Veo Lite | $5.20 |
| Receita DM (Sex/Qui) | 13 | Omni | $13.00 |
| Participação (Sáb) | 13 | Veo Lite | $5.20 |
| **Total** | **65** | | **$49.40** (trava: $120) |

## Estado dos blocos

1. ✍️ **Novela das 18h** — 13 eps escritos ([T1](EPISODIOS-SETEMBRO.md) · [T2/T3](EPISODIOS-OUT-NOV.md)) · ref aprovada · `nv-01` **gerado e aprovado** ✅
2. ✍️ **Cardápio da Semana DM** — 13 escritos ([CARDAPIOS-DM.md](CARDAPIOS-DM.md))
3. ✍️ **Receita LEGENDA** — 13 escritas ([RECEITAS.md](RECEITAS.md))
4. ✍️ **Receita DM** — 13 receitas REAIS do app selecionadas com uuid+gancho ([RECEITAS.md](RECEITAS.md)); prompts na hora de enfileirar cada mês
5. ✍️ **Participação** — mecânica + partida a frio + 5 reservas ([PARTICIPACAO.md](PARTICIPACAO.md)); `pt-03`+ são reativos por desenho
6. ⬜ Stories de eco (ajuste da story-queue — depois da revisão dos blocos)

## 📍 Produção — estado em 27/08 (dia 2)

**43/65 gerados (~$43) — auditoria de 27/08: zero problemas nos 43:**
- ✅ **SETEMBRO COMPLETO — 22/22** + anúncio de 30/08 (carrossel)
- ✅ Novela 13/13 · rl 10/13 · Cardápios 9/13 · rd 6/13 · pt 5/13
- ⏳ Faltam 22: `cd-10..13` · `rl-11..13` · `rd-07..13` · `pt-06..13`
- Auditoria checou: cloudinaryUrl, mp4, capa, legenda, hashtags, prompt
  atual da fila, ref da novela e UTM nos links de DM — item a item.

**Etapa nova — revisão de continuidade antes de gerar (decisão do Davi, 27/08):**
todo prompt passa por leitura crítica antes da geração, procurando contradição entre
o que a legenda promete e o que o vídeo mostra. A primeira rodada pegou 4:
`rl-03` (creme × "sem creme de leite") · `pt-02` (mel × "sem açúcar") ·
`pt-13` (4º ingrediente num desafio de 3) · `rd-09` (azeitona ausente da receita real).
Sai mais barato do que refazer vídeo.


**Limites da API descobertos na prática (importante pros lotes):**
1. *Spend-rate*: ~$10 gastos em sequência → 429 temporário (esfria em ~1h)
2. *Cota diária de requisições* → 429 até a virada do dia (fuso da conta Google)
→ Regra prática: lotes de ~5, respiro entre eles, ~15–20 vídeos/dia no máximo.

**Rajada medida em 27/08:** 16 vídeos seguidos antes do 429 de spend-rate (ontem foram ~10).
Continuação automática armada em background: espera 90 min, depois 3 lotes de 5 com 20 min
de respiro entre eles. Sobra pro dia seguinte o que não couber.
**Publicação NÃO precisa de agendamento manual:** pasta gerada + cron na grade nova =
publicado sozinho no dia/hora. O "agendar tudo" já está feito por desenho.

## Decisões de produção (26/ago)

- **Modelo: Omni Flash em TUDO neste ciclo** — decisão de qualidade do Davi ("testar
  mais qualidade pra ver impacto real; depois ajusta"). Veo Lite/Fast ficam como
  alavanca de custo pro checkpoint D+30. Custo do ciclo all-Omni 10s: **$65** (trava $120).
- **Sem cota grátis em nenhum modelo** (verificado ago/2026) → geração pode ser
  antecipada à vontade; espaçamento é **por minutos entre chamadas** (gerador já é
  sequencial), não por dias. Rajada controlada com `--limit` por rodada.
- **Colchão:** todo post gerado com 4+ dias de antecedência da publicação.
- **Economia pontual aberta:** stories via batch API (metade do preço) · duração 8s
  nos slots que não precisam de 10 (exige campo `duration` por item — tarefa pequena).
- **Texto no vídeo — DECISÃO DO DAVI (27/08):** o **overlay ffmpeg foi descartado**.
  Ele já conhece o resultado desse tipo de edição: estraga o vídeo. Assinatura no fim
  e passos numerados continuam desejáveis, mas o caminho é **pedir na própria geração**
  (Omni) — 1 vídeo de teste decide. Enquanto isso os reels publicam sem texto, e isso
  **não é bloqueio de publicação** (não existe prazo de 01/09 — foi engano meu).

## 🔁 Refações por erro de geração (27/08)

| Post | Erro visto pelo Davi | Causa | Correção no prompt |
|---|---|---|---|
| `nv-11` | Duas mãos ao provar o prato | Beat final pedia `two forks twirling side by side` (2 pessoas) com ref de 1 pessoa só → modelo duplicou membros | Beat final virou uma mão deslizando a 2ª tigela + trava explícita: *"only one hand is ever visible... no tasting from a spoon"* |
| `cd-03` | Bate os ovos mas entrega ovo frito | **Prompt contraditório:** pedia `whisked fast` E `fried egg, yolk catching backlight` — impossível | Ovo quebrado inteiro direto na frigideira + trava: *"never beaten or whisked; the yolk stays whole from pan to plate"* |

**Lição pro resto da fila:** todo prompt precisa passar no teste de continuidade —
o que acontece com o ingrediente no meio tem que bater com o que aparece no money shot.
Vídeos com erro guardados em `data/ciclo-01/refazer-backup/` (não apagados).
