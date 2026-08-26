# 🧭 Plano Master — Instagram do Tem na Semana

> O permanente. Muda raramente, e só com decisão explícita do Davi.
> O que muda a cada ciclo vive nos **subplanos** (`docs/SUBPLANO-*.md`), que testam,
> validam e alimentam este documento de volta.

---

## A ideia, em um parágrafo

O Instagram existe pra **levar gente que cozinha em casa até o app** — não pra acumular
seguidor, não pra ser vitrine bonita. A conversão acontece dentro do app; aqui a gente
entrega valor de verdade (receita completa, cardápio pronto) e cria o caminho mais curto
possível até lá. Todo o conteúdo é gerado por IA — isso não é vergonha nem segredo, é a
nossa vantagem: **o absurdo custa o mesmo que o banal**, e o absurdo é o que para o dedo.

## O funil (cada lado com seu papel)

```
vídeo segura (retenção) → pessoa manda pra alguém (envio) → recebe algo em troca
(receita/cardápio via DM ou legenda) → clica com UTM → app converte (login → monta semana)
─────────── INSTAGRAM (nosso) ───────────┼────────── APP (deles) ──────────
```

## Metas norte (por que ordem essa)

| # | Métrica | Por quê | Base (ago/2026) |
|---|---|---|---|
| 1 | **Retenção mediana** | Sinal nº 1 do algoritmo; nosso maior déficit | 3,2s → **meta 5s** |
| 2 | **Envios por alcance** | Pesa 3–5× a curtida pra chegar em não-seguidor; o único vídeo com envios em massa foi o único que explodiu | 140 envios = 1 vídeo |
| 3 | **Cliques com UTM → `montou_semana`** | A conversão real, medida do lado do app | ~28 cliques/90d |
| — | Seguidores | **Métrica de vaidade.** Base herdada de hotdogueria distorce tudo; o que vale é alcance de não-seguidor (~80% hoje) | ignorar |

## Princípios (o que aprendemos com dados, não com achismo)

1. **Não-linearidade.** Segundo 1 ≠ segundo 2 ≠ segundo 3. Se a pessoa já sabe o que
   vem, ela pula. Pattern interrupt que **conecta** com o resto — susto solto perde no meio.
2. **Ação em close vence cena parada.** Topo da conta: cortar, abrir, fritar em close.
   Fundo: mesa posta, ambientação, plano aberto. E **celular na tela = morte** (os 2
   piores reels da história da conta). O app nunca aparece literalmente; aparece o resultado.
3. **Todo post entrega algo.** Receita completa, cardápio pronto, passo a passo. "Curte
   se gostou" está proibido pra sempre. A pergunta de todo CTA: *o que a pessoa ganha?*
4. **Todo post responde: quem manda isso pra quem?** ("faz esse sábado" → grupo da casa;
   "isso é a sua cara" → amiga). Enviabilidade se projeta, não se torce.
5. **O prompt é o produto.** A tática mais genial morre num prompt fraco. Prompts são
   material de primeira classe: escritos com técnica de direção, versionados, medidos.
6. **Pensar como editor de vídeo, não como social media.** Beats, som, ritmo, texto em
   tela com timing. O que o modelo não faz bem (texto legível), o ffmpeg faz depois.
   Texto em movimento é ferramenta de primeira classe; vídeo pode ser híbrido (tabelas,
   painéis, grafismos descritos no prompt). **Assinatura de marca é visual/motion,
   nunca falada** — em 10s, narrar a assinatura mata o áudio útil.
7. **Testar sem se prender.** Dias, horários, formatos — experimentos com prazo e
   critério, nunca fé. Trial Reels (manual, no app) testa conceito pulando a base morta.
8. **Regras do produto são invioláveis:** o que pode/não pode dizer vem do Contexto
   (`fixo.comunicacao`) — promessa de saúde nunca; nome de cardápio não é promessa clínica.

## Posicionamento (herdado do Contexto — não se rediscute aqui)

Chef **assina**, não protagoniza. A história é da mesa de quem usa. Duas vozes:
plataforma organiza ("a gente resolve"), chef cozinha ("vem que é fácil").

## O ciclo

```
SUBPLANO (90 dias) → roda → fetch-metrics semanal → checkpoints D30/D60/D90
   → análise → o que provou vira princípio AQUI → próximo subplano
```

Cada subplano nasce **inteiro**: ideias, legendas, prompts e CTAs escritos antes de
começar. Só a geração é escalonada no tempo (limite de lote da IA). Assim o custo é
conhecido no dia zero e a execução vira só acompanhamento.

## Subplanos

| Ciclo | Período | Tema | Status |
|---|---|---|---|
| [SUBPLANO-01](SUBPLANO-01.md) | set–nov/2026 | "A Cozinha que Resolve" — 3 motores: Participação · Novela das 18h · Utilidade | **aprovado 26/ago** |
