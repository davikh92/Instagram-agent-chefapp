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

## Ideias aprovadas para o futuro (não implementar agora)

1. **Comment-to-DM com entrega de valor** — o CTA não é "comenta pra receber o link",
   é *"comenta DETOX que eu te mando o cardápio pronto na sua DM"*. A pessoa recebe o
   cardápio da casa (link direto, com UTM do post). Combina com a série de cardápios:
   cada um tem benefício e URL próprios. Tecnicamente: webhook de comentários +
   private reply da Messaging API. **Entra depois do novo plano.**
2. **Análise recorrente autoperfeiçoante** — a cada 15–30 dias, uma rotina puxa as
   métricas de tudo que foi publicado, compara arquétipo × dia × formato e realimenta
   o planejamento. **Depois que o novo plano estiver rodando.**
3. **Série "1 semana = 1 cardápio"** — 7 cardápios = 7 semanas de pauta encadeada,
   cada uma com destino de clique específico. **Matéria-prima do novo plano.**

---

## Próximos passos, em ordem

### 1. Análise ponta a ponta do Instagram ⬅️ PRÓXIMO
Puxar via API as métricas de **tudo** que já foi publicado (cada `published.json`
guarda o `instagram_media_id`): alcance, curtidas, salvamentos, compartilhamentos,
comentários. Cruzar com o que sabemos de cada post — arquétipo, dia, horário, com/sem
voz, tema. Sai um relatório: o que funcionou, o que não, e por quê.
*Fato já conhecido: link na bio quase não converteu — o plano novo precisa atacar isso.*

### 2. Novo plano de comunicação
Com a análise na mão + o material novo de perfil/identidade + posicionamento
"chef assina" + os 7 cardápios como série. Decide: temas, formatos, CTAs, se/como
usa voz, e o papel do comment-to-DM.

### 3. Troca de modelo de vídeo
Qualidade pra cima, frequência pra baixo, custo controlado. Testar candidatos
(Omni atual × Higgsfield × outros), avaliar áudio nativo, duração máxima em take
único. Decidir com os números da análise, não por impressão.

### 4. Rodar e medir
Publicar o novo plano, deixar rodar, e aí sim ligar a análise recorrente (ideia 2)
e o comment-to-DM (ideia 1).

---

## Pendências do Davi

- [ ] Trocar **link na bio** quando o domínio novo estiver no ar (com `?utm_source=instagram&utm_campaign=bio`)
- [ ] Decidir o **@ da conta** (`@luizanacozinha` × handle da marca — trocar custa alcance, manter amarra a marca a um nome)
- [ ] Avisar quando a troca de domínio estiver concluída (o campo `url_canonica` do app atualiza tudo aqui sozinho)
- [ ] Trazer o material novo de perfil/identidade pra sessão do novo plano

## Histórico de fases (contexto rápido)

| Fase | Período | O que era |
|---|---|---|
| Carrossel HTML | mai/2026 | Posts em HTML → PNG via Puppeteer. **Morta** — material em `arquivo/`. |
| Veo diário | jun–jul/2026 | 1 reel/dia via Veo 3.1 Lite + voz Livia. Caro demais no volume. |
| Omni 3×/semana | ago/2026– | Atual: qualidade maior, 3 reels/semana + stories diárias. |
| Integração app | 2026-08-25 | Contexto vivo via Supabase; marca vira Tem na Semana. |
