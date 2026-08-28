# 🗺️ Roteiro — Estado, Decisões e Próximos Passos

> **Atualizado:** 2026-08-25 · Este é o documento vivo do planejamento.
> Leia no início de qualquer sessão de estratégia. Os planos antigos estão em
> `arquivo/planos/` e **não valem mais** — o que conflitar com este, este manda.

---

## Onde estamos (2026-08-25)

**A máquina funciona.** Faz tempo que não dá problema: 3 reels/semana (Omni Flash) +
3 stories/dia, geração, voz, upload e publicação 100% automáticos. Custo ~$13/mês de
vídeo. Demorou pra ficar redonda, mas ficou.

**A integração com o app está viva.** O produto virou "Tem na Semana", e a automação
lê a verdade direto do Supabase do app (RPC `contexto_do_conteudo`) antes de cada
geração: nome, URL canônica, os 7 cardápios com benefícios prontos, vocabulário
permitido/proibido, novidades liberadas. Nada mais é mantido à mão.

**O resultado ainda não veio.** Diagnóstico do Davi, registrado: os vídeos são bonitos,
mas o acerto é "na sorte" — sem ciclo de métricas, sem padrão identificado. O link na
bio quase não levou gente pro app. O áudio (voz colada por cima) não soa natural.

**Em paralelo (lado do app):** troca de domínio em andamento → novo domínio da marca
Tem na Semana. Aqui não muda nada — a URL vem do contexto. Manual: link na bio + decisão do @.

---

## Decisões já tomadas (não rediscutir sem motivo novo)

| Tema | Decisão | Quando |
|---|---|---|
| Posicionamento | Chef **assina**, não protagoniza. A história é da mesa de quem usa. | ago/2026 |
| Fonte de verdade | Produto = RPC do app (cache em `product-context.json`). Execução = `brand.json`. Nunca duplicar. | ago/2026 |
| Cadência | 3 reels/semana — controle de custo, sem forçar. Mantida até o novo plano dizer o contrário. | ago/2026 |
| Quarta é RECEITA | **Uma das apostas mais importantes.** Legenda com receita completa, passo a passo — utilidade gera salvamento. | jul/2026 |

## Hipóteses de vídeo — testar, não decidir agora (pós-plano)

> Nada aqui é regra. A observação do Davi: emendar 2 clipes sem transições de verdade
> tende a ficar artificial — mas **pode ser que funcione**. Vídeo médio no Instagram é
> ~30s; o desafio é chegar perto disso **sem estourar custo**.

- **Duração:** testar take único esticado ao máximo (12s… 15s seria ótimo) × emenda de
  2 clipes × outros formatos. Comparar naturalidade e custo por segundo.
- **Modelo:** o upgrade é o **Google Omni (tier superior), na MESMA API que já usamos**
  — não é Higgsfield. E também não é permanente: gerar com o modelo melhor, comparar
  resultado × custo com o modelo baratinho. Se o resultado for o mesmo, volta pro barato.
- **Outros modelos:** o Davi tem assinaturas de outros geradores de vídeo — dá pra usar
  na comparação, mais pra frente.
- **Áudio:** com o modelo novo, avaliar primeiro o **áudio nativo** (fala direto do
  vídeo). Só depois decidir: voz nativa × voz colada (Livia) × sem voz.
- **Ideia guardada do Davi (entra no plano):** formato *foto + passo a passo* — como o
  exemplo do salmão: uma imagem gerada de como o prato deve ficar + passos escritos.
  Ele vai detalhar durante a construção do plano.

## Análise ponta a ponta — CONCLUÍDA (26/ago)

Relatório completo no artifact "3,2 Segundos"; dados brutos em `data/metricas/coleta-2026-08-26.json`.
Painel profissional e API **batem** (90d: ~54,4k views, 373 curtidas, 160 shares, 51 salvos, 5 comentários).

**Achados que orientam o plano:**
- **Retenção decide o alcance:** reels ≥4s têm alcance mediano 6,4× maior que reels <3s.
  Mediana da conta: 3,2s — e caindo (jun 3,5 → jul 3,1 → ago 2,8). **META: 3,2s → 5s.**
- **Prompt × performance (57 reels):** topo abre com *ação transformando comida em close*
  (cortar, abrir, fritar); fundo abre com *cena parada e aberta* (mesa posta, ambientação).
  Os 2 piores da conta são os 2 com **celular na tela** (1,4s / 2,2s) — mostrar o app
  literalmente expulsa. Mãos vs. pessoa, vapor, tamanho do prompt: não separam nada.
- **Conversão:** 28 cliques na bio em 90d (12/30d, parte do Davi) vs 302 visitas ao
  perfil. CTA "teste grátis na bio" é fraco demais — pede desvio que ninguém faz.
- **Audiência:** conta reaproveitada (hotdogueria, já teve 10k+); ~80% das views são de
  NÃO-seguidores — o conteúdo alcança gente nova, os seguidores herdados são peso morto.
  90d: +73 seguidores ganhos / −76 perdidos. Público: 58% mulheres, núcleo 35–44, 100% BR.
- **Horários de atividade dos seguidores (painel):** Dom 18–21 · Ter 18–21 · Qua 18–21.
- **Contexto assumido:** material 100% IA é punido pelo algoritmo — engajamento menor já
  esperado. A fase de quantidade cumpriu o papel (~80 posts = base de análise suficiente);
  não adianta gerar mais 200 do mesmo.
- **Voz colada soa robótica** (percepção direta do Davi) — provável fator de retenção; a
  humanização dos vídeos (pessoas de verdade na cozinha, não só mãos) entra com o modelo novo.

---

## Direções para o novo plano (visões do Davi — pensar junto, não regras)

1. **Dar algo em troca, JÁ.** Parar com "curte se gostou". Experimentar desde agora:
   - **Receita completa na legenda** (ampliar além da quarta) — pessoa lê enquanto o
     vídeo roda (retenção) e salva pra depois (alcance).
   - **Passo a passo numerado NO vídeo** (Passo 1, 2, 3…) — prende e faz rever.
   - **Comenta → recebe na DM** o link direto da receita/cardápio. O link abre no app →
     login → daí em diante a conversão é problema do app. Instagram = levar gente; app = converter.
   - Já temos os links: 486 receitas em páginas públicas (`/receita/:id`) + 7 cardápios
     com URL própria em `atual.cardapios_da_casa`.
2. **Conhecimento e dor, não só comida bonita.** Perfil de comida ganha seguidor por
   imagem bonita que nunca lê legenda — o desafio é não ser só isso.
3. **Grade e horários: testar, não fixar.** Ter/Sáb performaram melhor mas pode ser
   sorte; seguidores ativos Dom/Ter/Qua 18–21. Rodar experimentos de dia E horário,
   sem ficar preso a nenhum — inclusive testar dias "aleatórios" de vez em quando.
4. **O prompt é o produto.** A melhor tática do mundo morre se o prompt gerar vídeo
   fraco. Lote de 12/jun era mais cinematográfico; depois derivou pra "cara de feira".
   Dar atenção de primeira classe aos prompts usando os padrões achados na análise.
5. **Exemplo do que NÃO fazer** (post de 25/ago): pessoa de cara triste + legenda
   "uma semana no mês" + áudio fraco. Nada entrega, nada pede, nada prende.
6. **Ideia guardada:** formato *foto do prato pronto + passo a passo* (caso do salmão
   no ChatGPT). Davi detalha na construção do plano.
7. **Material orgânico com a chef Luiza:** planejado, mas sem contar com ela agora.

---

## 📍 ATUALIZAÇÃO 26/08 — Ciclo 01 em PRODUÇÃO

O plano virou realidade em um dia: plataforma "A Cozinha que Resolve" aprovada,
65 posts escritos, estrutura antiga aposentada (crons na grade nova, arquétipos fora,
brand.json sem a era carrossel), **20 vídeos já gerados** (~$20). Estado detalhado e
próximos lotes: `data/ciclo-01/CALENDARIO.md § Produção`.

**Pendências pra estreia (01/09):** gerar os 45 restantes (27–28/08) · script de
stories de eco ·
revisão final do Davi nos vídeos. Publicação agenda sozinha (pasta + cron).

---

## 🔴 ACHADO EM 28/08 — renovação do token falha em silêncio

**O workflow `refresh-token` fica VERDE mas não atualiza o secret.** O último passo
morre com `HTTP 403: Resource not accessible by personal access token` — o `GH_PAT`
não tem permissão de escrever secrets. Roda desde 15/06 assim.

Consequência: o `INSTAGRAM_ACCESS_TOKEN` no GitHub está congelado em **23/07**.
O token funciona hoje (verificado: conta `temnasemana`, 4.957 seguidores, 85 posts),
mas quem publica é o GitHub Actions — e ele usa a cópia que não se renova.

**Estado em 28/08 — risco imediato REMOVIDO:** o token foi renovado e gravado no
secret manualmente (o `gh` local tem escopo `repo`, que permite escrever secrets).
Secret agora datado de 28/08, token válido até **27/10/2026**.

⚠️ **Mas o ciclo vai até 29/11.** Sem a correção abaixo, o token expira em 27/10 e a
publicação morre no último mês. A correção recorrente continua pendente.

**Correção definitiva (é do Davi, exige acesso à conta GitHub):**
1. Gerar um PAT novo com permissão de **Secrets: Read and write** neste repositório
   (fine-grained) ou escopo `repo` (clássico)
2. Salvar em `GH_PAT` nos secrets do repo
3. Rodar `refresh-token` manualmente e confirmar a linha
   `✅ Secret INSTAGRAM_ACCESS_TOKEN atualizado no GitHub`

**Correção do meu lado (pendente):** fazer o workflow FALHAR quando esse passo falhar,
em vez de reportar sucesso. Check verde mentindo é pior que erro.

---

## 🗓️ AGENDA DE TRABALHO — revisada em 28/08

### ✅ Fechado

| | O quê | Prova |
|---|---|---|
| 1 | **65 vídeos** do ciclo | auditoria: 64/64 da fila íntegros + `nv-01`, zero pendências |
| 2 | **Teste de texto na geração** | veredito registrado: não serve, salvo numeração 1·2·3 |
| 3 | **Tabela de DM** | 26 regras com link rastreado no domínio novo |
| 4 | **Automação comentário → DM** | + resposta pública no post; janela de 14 dias |
| 5 | **7 stories de cardápio** | agendadas 01–07/09, custo zero de API |
| 6 | **Migração de domínio** | 26 links reescritos a partir do Contexto |
| 7 | **Token renovando sozinho** | falha silenciosa de junho corrigida e comprovada |
| 8 | **Anúncio da nova fase** | carrossel de 3 slides, agendado 31/08 |

### 🎯 Estreia — sem nada pendente do meu lado
`30/08` último reel da era antiga · `31/08` anúncio · `01/09` ciclo começa.
Mídia testada (HTTP 200), publicação saudável, token válido.

### ⬜ O que resta

**A. Primeiro envio real da DM** — terça 01/09, o Davi comenta e confere.
Rodo o modo seco antes. É o único item com data.

**B. Destaque "Começa aqui"** — o Davi grava o app; eu corto, componho e monto.
Sem data, depende só do vídeo dele.

**C. Música + assinatura visual** — **congelado por decisão do Davi (28/08):**
o formato atual entra em teste como está, sem enfeite, pra sentir se funciona.
Mexer agora seria mudar duas variáveis ao mesmo tempo. As duas se resolvem na
mesma ferramenta de edição externa; o PNG transparente da marca sai daqui em
minutos quando a hora chegar. *(Vira requisito no dia em que o TikTok entrar —
ver §2.1 do plano multiplataforma.)*

**D. Expansão multi-plataforma** — ⬅️ **EM PLANEJAMENTO desde 28/08.**
Plano escrito em [`PLANO-MULTIPLATAFORMA.md`](PLANO-MULTIPLATAFORMA.md): nenhum
código, ordem proposta (Pinterest → Shorts → TikTok), rotina semanal de ~20 min,
e o que a ida pra Play Store muda em cada link.

**E. Checkpoint D+30 (fim de setembro)** — o mais importante da lista, e o único
que depende de dado que ainda não existe. Ver hipóteses do SUBPLANO-01:
retenção 3,2s → 5s, envios/alcance, 30 comentários/mês, cliques UTM → `montou_semana`.
É aqui que se decide o que o Ciclo 02 mantém, corta ou dobra — inclusive se a
fila de eco dos stories volta pra mesa.
**Não se constrói nada dele agora:** ferramenta feita hoje pra usar em 30–60 dias
chega desatualizada e sem saber que pergunta responder. Monta-se quando os
números existirem.

### 🔴 Com o Davi
Nada bloqueia a estreia. Pendente: **link da bio com UTM**
(`temnasemana.com.br/?utm_source=instagram&utm_campaign=bio`) — sem ele, quem vem
do perfil entra como "(direto)" e a única medição do perfil se perde.

---

## 📱 Estado do produto (28/08) — o app vai virar app

Informação do Davi, e ela muda o planejamento de conteúdo:

- O **desenvolvimento está praticamente concluído**; o período de transição acabou.
- Agora é fase de **ajustar os primeiros pontos de entrada** — onde a pessoa cai e o
  que ela vê nos primeiros segundos.
- **O próximo passo é a Play Store:** virar aplicativo Android de verdade, não site.
  Motivo declarado: site converte pouco.

Consequência pra cá: **o destino dos nossos links vai mudar.** Por isso nenhuma bio
de plataforma nova pode ter o destino final escrito — todas apontam pra
`fixo.app.url_canonica`, e quem redireciona é o site. Detalhado no §1 do
[`PLANO-MULTIPLATAFORMA.md`](PLANO-MULTIPLATAFORMA.md).

---

## 💡 Ideia registrada (27/08): expandir pra outras plataformas — PÓS-Instagram

> **Atualização 28/08:** saiu de "ideia" e virou plano —
> [`PLANO-MULTIPLATAFORMA.md`](PLANO-MULTIPLATAFORMA.md). A tabela de decisões
> abaixo continua valendo; o plano diz *em que ordem* e *quanto custa cada uma*.

**Decisão do Davi: só depois que o Instagram estiver 100%** (65 vídeos gerados
e agendados). O material caro já existe; distribuir é barato.

**Decidido com o Davi (27/08):**

| Plataforma | Decisão | Observação |
|---|---|---|
| **TikTok** | ✅ vai | maior alcance de comida no BR; formato idêntico ao nosso |
| **YouTube Shorts** | ✅ vai | **só Shorts, sem vídeo longo** — não entra na programação. Receita é BUSCADA: acumula em vez de morrer em 48h |
| **Pinterest** | ✅ testar | o pin É link (486 receitas com página pública); vida útil de meses |
| **Facebook Reels** | 🟡 oportunista | Davi acha datado, mas é a MESMA API Graph — custo marginal zero, então entra de carona |
| **Threads** | 🟡 depois | vinculado ao IG, custo baixo; sem pressa |
| **X** | ❌ fora | API de escrita paga — "nada que a gente tem que pagar pra fazer" |

**Pendências pra checar quando chegar a hora:**
- Existe canal no YouTube da marca? O Davi acha que hoje usa a conta pessoal dele — Shorts exige canal próprio (criar é grátis).
- A API de publicação do TikTok exige app aprovado em auditoria; sem auditoria, publica só como rascunho/privado. Verificar antes de prometer automação completa.

**Atenção na adaptação:** não é só tom de texto — a arquitetura de CTA muda.
"Comenta X → DM" é mecânica do Instagram; TikTok = link só na bio; Pinterest = o
pin é o link; YouTube = link na descrição. Cada plataforma ganha seu `utm_source`.

---

## Próximos passos, em ordem

### 1. Novo plano de comunicação ⬅️ EM EXECUÇÃO (virou o Ciclo 01)
Com a análise na mão + as direções acima + o material novo de perfil/identidade que o
Davi vai trazer. Decide: temas, formatos, CTAs give-to-get, prompts-padrão por tipo,
grade de experimentos de dia/horário, papel da voz.

### 2. Troca de modelo de vídeo
Google Omni tier superior, na MESMA API (não é regra permanente — gerar, comparar
resultado × custo com o barato). Avaliar áudio nativo antes de decidir voz. Critério
de julgamento: **segundos retidos**, não beleza. Duração: testar take único esticado
E emenda — nada decidido.

### 3. Rodar e medir
Publicar o novo plano, rodar experimentos, e ligar a análise recorrente (15–30 dias,
`fetch-metrics.js` já coleta tudo, incluindo seguidores/dia e cliques na bio).

---

## Pendências do Davi

- [x] ~~Domínio novo no ar~~ — **`temnasemana.com.br`** desde 28/08/2026. Os 26 links de DM
      dos posts futuros já foram reescritos a partir do Contexto.
- [ ] Trocar o **link na bio** para `temnasemana.com.br/?utm_source=instagram&utm_campaign=bio`
- [ ] Decidir o **@ da conta** (`@luizanacozinha` × handle da marca — trocar custa alcance, manter amarra a marca a um nome)
- [x] ~~Avisar quando a troca de domínio estiver concluída~~ — feito 28/08
- [ ] Trazer o material novo de perfil/identidade pra sessão do novo plano

## Histórico de fases (contexto rápido)

| Fase | Período | O que era |
|---|---|---|
| Carrossel HTML | mai/2026 | Posts em HTML → PNG via Puppeteer. **Morta** — material em `arquivo/`. |
| Veo diário | jun–jul/2026 | 1 reel/dia via Veo 3.1 Lite + voz Livia. Caro demais no volume. |
| Omni 3×/semana | ago/2026– | Atual: qualidade maior, 3 reels/semana + stories diárias. |
| Integração app | 2026-08-25 | Contexto vivo via Supabase; marca vira Tem na Semana. |
