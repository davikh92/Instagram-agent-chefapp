# 🎬 Subplano 01 — set→nov/2026 (90 dias)

> Filho do [PLANO-MASTER](PLANO-MASTER.md). Testa: retenção não-linear, give-to-get,
> série de cardápios, modelo novo, grade experimental. **Status: RASCUNHO — aguardando
> aprovação do Davi antes de escrever o conteúdo.**

---

## 1. O que este ciclo quer provar (hipóteses com critério)

| # | Hipótese | Como testa | Critério de sucesso em D+90 |
|---|---|---|---|
| H1 | Vídeo não-linear (beat 1 ≠ 2 ≠ 3) segura mais que linear bonito | Todos os reels novos seguem a estrutura de beats (§3) | Retenção mediana ≥ **4,5s** (rumo à meta 5s) |
| H2 | Give-to-get gera comentário e envio | CTAs "comenta X → recebe na DM" + receita completa na legenda | ≥ **30 comentários/mês** (hoje: ~1) e envios/alcance subindo |
| H3 | Modelo tier superior compensa o custo | Calibração §5: mesmos conceitos nos 2 modelos | Retenção do superior ≥ **+1s** vs flash; senão, volta pro flash |
| H4 | Dia/horário importam | Grade rotativa mensal (§6) | Diferença consistente entre grades (não 1 outlier) |
| H5 | Voz colada derruba retenção | Pares A/B mesmo conceito ±voz (mês 2) | Diferença ≥ 0,5s decide o padrão |

## 2. As três séries semanais (3 reels/semana mantidos)

### Série A — "NÃO DEVIA FUNCIONAR" *(descoberta pura — o antigo ESPELHO, refeito)*
Pattern interrupt gastronômico: a cena que a pessoa olha e pensa *"isso não devia dar
certo"* — e dá. Cebola cortada no ar. Massa estatelada na tábua com estrondo. O prato
que se monta de trás pra frente. **Zero menção ao app.** Papel: parar o dedo, ser
enviado ("olha isso"), trazer não-seguidor.
- Legenda: 1 linha de provocação + pergunta que gera comentário genuíno.

### Série B — RECEITA *(quarta, mantida e turbinada)*
O vídeo dá fome; a legenda ensina TUDO (ingredientes + passos + dica de chef); o vídeo
carrega **passos numerados em texto overlay** (§4). CTA: *"quer essa receita no app,
com a lista de compras pronta? Comenta RECEITA que eu te mando o link."* → DM com link
`/receita/:id` + UTM. Papel: salvamento + comentário + tráfego.

### Série C — CARDÁPIO DA SEMANA *(a série dos 7 cardápios — o antigo VIRADA, com entrega)*
1 cardápio da casa por semana, 7 semanas, depois repete com ângulo novo. O vídeo mostra
a comida do cardápio (nunca a tela!); a legenda apresenta o benefício com o vocabulário
permitido; CTA: *"comenta DETOX que te mando o cardápio pronto na DM"* → link
`/cardapio-da-casa/:slug` + UTM `utm_campaign=<id-do-post>`. Papel: tráfego qualificado
— quem clica já sabe o que vai receber.

**Stories (3/dia, mantidas):** viram eco das séries — enquete "já fez compras?", lembrete
do cardápio da semana, repost do reel do dia. Sem mudança estrutural neste ciclo.

## 3. Estrutura de vídeo — pensando como editor (10s, take único)

```
0,0–1,5s  INTERRUPT   física quebrada + SOM alto (o modelo gera áudio — usar!)
1,5–4,0s  DESVIO      2º beat que muda o eixo — não é continuação do 1º
4,0–8,0s  PAYOFF      ação em close transformando comida (o que os dados amam)
8,0–10s   ENTREGA     prato final + texto de CTA (overlay, não do modelo)
```

Regras de direção herdadas dos dados: ação em close sempre; nada de mesa posta parada;
nada de celular em cena; som como personagem (chiado, estalo, baque); um só take —
beats por MUDANÇA DE AÇÃO, não por corte de câmera (o modelo emenda cortes mal).

### Banco de interrupts pra Série A (gerativo-first — impossíveis de filmar barato)
1. Cebola lançada e fatiada no ar, gomos caindo em câmera lenta
2. Massa de pão estatelada na bancada com estrondo e nuvem de farinha
3. Reverso: prato pronto se desmontando ingrediente por ingrediente
4. POV de dentro da panela: o mundo visto pelo refogado
5. Congelamento: tudo para no ar (azeite, sal, vapor) e retoma com estalo
6. Velocidade violenta: semana inteira de panelas em 2 segundos
7. Erro que vira acerto: o ovo que cai... na frigideira perfeitamente
8. Escala errada: colher gigante, panela minúscula — e funciona
9. Corte impossível: a faca atravessa um mês de marmitas empilhadas
10. Chuva de ingredientes montando o prato sozinha, sem mãos

## 4. Prática de produção (o que muda no pipeline)

| Peça | Como faz | Status técnico |
|---|---|---|
| Passos numerados no vídeo | **ffmpeg drawtext** pós-geração (timing por passo) — nunca pedir texto ao modelo, ele renderiza torto | novo script pequeno, mesma base do add-voice |
| CTA em texto no fim | mesmo overlay ffmpeg, 2s finais | idem |
| Comenta→DM | **fase 1 (manual):** notificação → Davi responde com link pronto da fila; **fase 2 (automação):** webhook + private reply da Messaging API — construir DURANTE o ciclo | fase 1 = zero código |
| Receita na legenda | já suportado (caption na fila) | pronto |
| Trial Reels | manual no app: todo conceito novo de interrupt roda como trial ANTES de entrar na grade | processo, não código |
| Links | sempre do Contexto (`url_canonica` + slug) com `utm_source=instagram&utm_campaign=<id>` | pronto |

## 5. Modelo de vídeo — calibração ANTES do volume (semana 1)

Gerar os **mesmos 3 conceitos** (1 de cada série) no Omni Flash (~$1) e no Omni tier
superior (preço a confirmar na 1ª geração). Publicar os 6 alternados como trial reels →
comparar **segundos retidos** (não beleza). Decisão em D+10: qual modelo pra qual série
(pode ser misto: superior na Série A, flash na B/C). Áudio nativo do superior é avaliado
aqui — se a fala PT dele for natural, H5 ganha um braço novo.

> Custo do ciclo: 39 reels. Piso (tudo flash) ≈ $39. Teto provisório (tudo superior) =
> definido na calibração; **trava de orçamento: $120/ciclo** — acima disso, mix desce.

## 6. Grade experimental (rotação mensal — testar sem se prender)

| Mês | Dias/horários | O que testa |
|---|---|---|
| Set | **Ter 19h · Qua 18h · Sáb 11h** | A hipótese Ter/Sáb da análise |
| Out | **Dom 19h · Ter 19h · Qua 19h** | Os horários de atividade do painel (Dom/Ter/Qua 18–21) |
| Nov | 2 slots vencedores + **1 wildcard** rotativo | Confirma vencedor; wildcard evita cegueira |

Quarta continua fixa (RECEITA) nos 3 meses — âncora pra comparação limpa entre grades.

## 7. Medição e checkpoints

- `fetch-metrics.js` **semanal** (acumula histórico de seguidores/cliques de 30d)
- **D+30 / D+60 / D+90:** análise contra os critérios da §1 — mata, mantém ou dobra
- Painel do app: `entrou → montou_semana` por `utm_campaign` (pedir visão ao time do app)

## 8. O que este ciclo NÃO faz (pra não se perder)

- Não muda identidade visual (aguarda bloco `identidade_visual` no Contexto — design vem depois, como o Davi definiu)
- Não aumenta frequência (3/semana até H3 responder)
- Não usa a chef como personagem (material orgânico dela é plano futuro)
- Não automatiza comenta→DM no dia 1 (manual primeiro, automação durante o ciclo)
- O formato *foto + passo a passo* (ideia do salmão) entra como experimento avulso quando o Davi detalhar

## 9. Próximo passo após aprovação

Escrever o conteúdo INTEIRO do ciclo de uma vez: 39 conceitos + legendas + prompts +
CTAs + voiceText (onde houver) → `data/veo-queue.json` e `data/story-queue.json`.
A geração escoa sozinha em lotes de 5; o custo é conhecido no dia zero.
