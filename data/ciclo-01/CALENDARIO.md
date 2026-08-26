# 📅 Ciclo 01 — Calendário · "A Cozinha que Resolve" (set→nov/2026)

> A CASA. Cada linha é um post; preenchemos por blocos (um motor por vez), nunca tudo
> de uma vez. Quando um bloco fica pronto, os posts entram na fila de geração
> (veo-queue.json) e o status vira ✅. Plano: docs/SUBPLANO-01.md.

**Status:** ⬜ vazio · ✍️ escrito (aguardando revisão do Davi) · ✅ na fila · 📤 publicado

---

## O bloco de cada post (template)

Todo post, de qualquer motor, é escrito com estes campos — nada entra sem todos:

```
id:             nv-01 (nv=novela · rl=receita-legenda · rd=receita-dm · pt=participação)
data / hora:    2026-09-01 · 18h
motor:          Novela das 18h
funcao:         descoberta | salvamento | trafego   ← papel no funil, obrigatório
gatilho_envio:  "manda pra quem..." — POR QUE alguém envia isso, escrito
titulo:         nome de trabalho do vídeo
descricao:      os beats, segundo a segundo (0-1,5 interrupt / desvio / payoff / entrega)
prompt:         EN, direção completa (luz, câmera, ação, som) — regras do PLANO-MASTER
legenda:        PT-BR, com o CTA DENTRO dela (CTA não é campo separado)
hashtags:       mix 12-15 (brand.json → hashtags)
voiceText:      fala curta estilo real, OU "—" (sem voz)
overlay:        texto pós-geração via ffmpeg: passos numerados / assinatura final
modelo:         Omni Flash ($1) | Veo Lite ($0,40)
link_utm:       só se funcao=trafego: {url_canonica}/caminho?utm_source=instagram&utm_campaign=<id>
```

**Assinatura em TODO vídeo:** último ~1s, "Tem na Semana." em motion/texto — nunca narrada.

---

## Setembro — grade: Dom·Ter·Qua·Sex·Sáb (entra Dom, sai Seg — pior dia medido)

| ID | Data | Dia | Motor | Modelo | Status | Título |
|---|---|---|---|---|---|---|
| `nv-01` | 2026-09-01 | Ter 18h | Novela das 18h | Omni | ⬜ |  |
| `rl-01` | 2026-09-02 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-01` | 2026-09-04 | Sex 12h | Receita/Cardápio DM | Omni | ⬜ |  |
| `pt-01` | 2026-09-05 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-02` | 2026-09-06 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `nv-03` | 2026-09-08 | Ter 18h | Novela das 18h | Omni | ⬜ |  |
| `rl-02` | 2026-09-09 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-02` | 2026-09-11 | Sex 12h | Receita/Cardápio DM | Omni | ⬜ |  |
| `pt-02` | 2026-09-12 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-04` | 2026-09-13 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `nv-05` | 2026-09-15 | Ter 18h | Novela das 18h | Omni | ⬜ |  |
| `rl-03` | 2026-09-16 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-03` | 2026-09-18 | Sex 12h | Receita/Cardápio DM | Omni | ⬜ |  |
| `pt-03` | 2026-09-19 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-06` | 2026-09-20 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `nv-07` | 2026-09-22 | Ter 18h | Novela das 18h | Omni | ⬜ |  |
| `rl-04` | 2026-09-23 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-04` | 2026-09-25 | Sex 12h | Receita/Cardápio DM | Omni | ⬜ |  |
| `pt-04` | 2026-09-26 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-08` | 2026-09-27 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `nv-09` | 2026-09-29 | Ter 18h | Novela das 18h | Omni | ⬜ |  |
| `rl-05` | 2026-09-30 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |

## Outubro — grade: Dom·Ter·Qua·Qui·Sáb (testa Qui no lugar de Sex)

| ID | Data | Dia | Motor | Modelo | Status | Título |
|---|---|---|---|---|---|---|
| `rd-05` | 2026-10-01 | Qui 19h | Receita/Cardápio DM | Omni | ⬜ |  |
| `pt-05` | 2026-10-03 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-10` | 2026-10-04 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `nv-11` | 2026-10-06 | Ter 18h | Novela das 18h | Omni | ⬜ |  |
| `rl-06` | 2026-10-07 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-06` | 2026-10-08 | Qui 19h | Receita/Cardápio DM | Omni | ⬜ |  |
| `pt-06` | 2026-10-10 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-12` | 2026-10-11 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `nv-13` | 2026-10-13 | Ter 18h | Novela das 18h | Omni | ⬜ |  |
| `rl-07` | 2026-10-14 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-07` | 2026-10-15 | Qui 19h | Receita/Cardápio DM | Omni | ⬜ |  |
| `pt-07` | 2026-10-17 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-14` | 2026-10-18 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `nv-15` | 2026-10-20 | Ter 18h | Novela das 18h | Omni | ⬜ |  |
| `rl-08` | 2026-10-21 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-08` | 2026-10-22 | Qui 19h | Receita/Cardápio DM | Omni | ⬜ |  |
| `pt-08` | 2026-10-24 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-16` | 2026-10-25 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `nv-17` | 2026-10-27 | Ter 18h | Novela das 18h | Omni | ⬜ |  |
| `rl-09` | 2026-10-28 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-09` | 2026-10-29 | Qui 19h | Receita/Cardápio DM | Omni | ⬜ |  |
| `pt-09` | 2026-10-31 | Sáb 11h | Participação | Veo Lite | ⬜ |  |

## Novembro — grade PROVISÓRIA (definir no checkpoint D+60 com os vencedores + 1 wildcard)

| ID | Data | Dia | Motor | Modelo | Status | Título |
|---|---|---|---|---|---|---|
| `nv-18` | 2026-11-01 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `nv-19` | 2026-11-03 | Ter 18h | Novela das 18h | Omni | ⬜ |  |
| `rl-10` | 2026-11-04 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-10` | 2026-11-06 | Sex 12h | Receita/Cardápio DM | Omni | ⬜ |  |
| `pt-10` | 2026-11-07 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-20` | 2026-11-08 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `nv-21` | 2026-11-10 | Ter 18h | Novela das 18h | Omni | ⬜ |  |
| `rl-11` | 2026-11-11 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-11` | 2026-11-13 | Sex 12h | Receita/Cardápio DM | Omni | ⬜ |  |
| `pt-11` | 2026-11-14 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-22` | 2026-11-15 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `nv-23` | 2026-11-17 | Ter 18h | Novela das 18h | Omni | ⬜ |  |
| `rl-12` | 2026-11-18 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-12` | 2026-11-20 | Sex 12h | Receita/Cardápio DM | Omni | ⬜ |  |
| `pt-12` | 2026-11-21 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-24` | 2026-11-22 | Dom 18h | Novela das 18h | Omni | ⬜ |  |
| `nv-25` | 2026-11-24 | Ter 18h | Novela das 18h | Omni | ⬜ |  |
| `rl-13` | 2026-11-25 | Qua 18h | Receita LEGENDA | Veo Lite | ⬜ |  |
| `rd-13` | 2026-11-27 | Sex 12h | Receita/Cardápio DM | Omni | ⬜ |  |
| `pt-13` | 2026-11-28 | Sáb 11h | Participação | Veo Lite | ⬜ |  |
| `nv-26` | 2026-11-29 | Dom 18h | Novela das 18h | Omni | ⬜ |  |

---

## Totais do ciclo

| Motor | Posts | Modelo | Custo |
|---|---|---|---|
| Novela das 18h | 26 | Omni | $26.00 |
| Receita LEGENDA | 13 | Veo Lite | $5.20 |
| Receita/Cardápio DM | 13 | Omni | $13.00 |
| Participação | 13 | Veo Lite | $5.20 |
| **Total** | **65** | | **$49.40** (trava: $120) |

## Ordem de preenchimento (um bloco por vez)

1. ⬜ **Novela das 18h** — primeiro porque precisa da bíblia (universo, personagens, arcos) antes dos episódios
2. ⬜ Participação — mecânica + 2 primeiras "geladeiras" de partida a frio
3. ⬜ Receita LEGENDA — 13 receitas com ocasião
4. ⬜ Receita/Cardápio DM — 13 destinos com link+UTM
5. ⬜ Stories de eco (ajuste da story-queue)
