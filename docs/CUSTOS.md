# Custos reais — referência para os próximos ciclos

> Números de **fatura**, não estimativa. Fonte: Google Cloud Billing (Gemini API),
> relatórios por SKU exportados em 01/09/2026, cruzados com `generatedAt` de cada
> `reel.json` do repositório.
>
> **Isto substitui a estimativa antiga de "~US$ 1/vídeo"** que circulava no
> `CLAUDE.md` e o "~US$ 10-15/mês" de `docs/APRENDIZADOS-ARQUITETURA.md`.

---

## 1. A régua: quanto custa um vídeo

| Modelo | Custo por vídeo | Como sabemos |
|---|---|---|
| **Gemini Omni Flash** (10s) | **R$ 5,90** | 67 gerações × 5,8958 = R$ 395,02 exatos |
| **Veo 3.1 Lite** 720p c/ áudio | **~R$ 2,92** | R$ 72,99 ÷ 25 vídeos (julho) |
| **Veo Fast** 720p c/ áudio | **~R$ 5,82** por 10s | R$ 18,61 ÷ 32 segundos (teste de agosto) |
| **Veo 1080p** c/ áudio | mais caro que todos | R$ 55,28 em junho, volume baixo |

> ⚠️ **O Veo Lite custa ~metade do Omni.** A anotação do `CLAUDE.md` de que
> "Veo 3.1 Lite/Fast ficam como alavanca de custo" está **certa** — e agora tem
> número. Se um dia a escolha voltar à mesa, é decisão de qualidade, não de preço:
> Veo Lite é mais barato, Veo Fast empata com o Omni.

**Imagens:** Gemini 3 Pro Image ≈ R$ 24,23 por lote de avatares/provas ·
Gemini 3.1 Flash Image (anúncio) ≈ R$ 4,39 · Imagen 4 (julho) R$ 2,83.
**Tokens de texto** (todos os prompts de todos os vídeos): **< R$ 6/mês** — irrelevante.

## 2. Série histórica: o que se gastou e o que saiu disso

| Mês | Fatura Gemini | Vídeos gerados | Modelo dominante | R$/vídeo |
|---|---|---|---|---|
| **Junho** | ~R$ 200 | 21 | Veo Lite + Fast + 1080p | ~R$ 9,00 |
| **Julho** | ~R$ 172 | 38 | 25 Veo Lite + 13 Omni | ~R$ 4,50 |
| **Agosto** | **R$ 448,39** | **65** | Omni Flash | **R$ 6,08** |

**A leitura que importa:** junho foi o mês mais caro por vídeo (R$ 9) porque
misturava três modelos de Veo, incluindo 1080p. Julho ficou barato (R$ 4,50)
porque o Veo Lite carregou o volume. Agosto custou mais no total — mas comprou
**três meses de conteúdo de uma vez**.

### Agosto detalhado (03/08 – 01/09) — R$ 448,39

| Item | SKU | Custo |
|---|---|---|
| **Os 65 reels do Ciclo 01** | Video output · Omni Flash | **R$ 395,02** |
| Avatares de perfil e provas | Gemini 3 Pro Image | R$ 24,23 |
| Teste do Veo (32 segundos) | Veo Fast 720p c/ áudio | R$ 18,61 |
| Prompts dos vídeos | Text output · Omni | R$ 4,95 |
| Imagens do anúncio | Gemini 3.1 Flash Image | R$ 4,39 |
| Resto (tokens de entrada) | vários | R$ 1,19 |

**Os três dias de geração batem exatamente com a linha de vídeo** — todo o gasto
de vídeo do mês foi o Ciclo 01, nada mais:

| Dia | Vídeos | Custo | Por vídeo |
|---|---|---|---|
| 26/08 | 20 | R$ 129,71 | R$ 6,49 |
| 27/08 | 26 | R$ 153,29 | R$ 5,90 |
| 28/08 | 19 | R$ 112,02 | R$ 5,90 |

O dia 26 destoa por um motivo rastreável: R$ 129,71 ÷ R$ 5,8958 = **22 gerações**
para 20 vídeos mantidos. **Foram 2 refeitos** (erros de continuidade pegos na
revisão) e a fatura cobrou os dois. **Retrabalho custa preço cheio** — é o
argumento numérico a favor da revisão pré-geração.

## 3. O Ciclo 01 fechado

| | |
|---|---|
| 65 reels (set + out + nov) | **R$ 395,02** |
| Custo por post publicado | **R$ 6,08** |
| Custo por mês de conteúdo | **~R$ 132** |
| 7 stories de cardápio | **R$ 0** — reaproveitam as capas dos posts |
| 15 pins do Pinterest | **R$ 0** — recompõem capas existentes |
| GitHub Actions | **R$ 0** — repositório público |

**De setembro a novembro a geração está parada.** O custo corrente de Gemini cai
a praticamente zero; sobra só a hospedagem (Cloudinary, ~US$ 10/mês). O próximo
pico de fatura só existe quando houver um Ciclo 02.

## 4. Como orçar o Ciclo 02

Base: **R$ 5,90 por geração**, e conte gerações, não posts — retrabalho paga
preço cheio.

| Cenário | Gerações | Custo |
|---|---|---|
| 65 reels, sem retrabalho | 65 | R$ 383 |
| 65 reels, 5% de retrabalho | ~68 | R$ 401 |
| 65 reels em Veo Lite | 65 | ~R$ 190 |
| 90 reels (cadência maior) | ~95 | R$ 560 |

Some ~R$ 30 de imagens se o ciclo tiver material gráfico novo, e ~R$ 6 de tokens
de texto. **Regra de bolso: R$ 6 por vídeo, arredondando pra cima.**

## 5. Como reproduzir estes números

No Google Cloud Billing → Relatórios:

1. **Intervalo:** o período desejado
2. **Agrupar por:** `SKU` (não `Serviço` — "Gemini API" junta vídeo, imagem e texto)
3. **Projetos:** todos (o filtro de 1 projeto derruba o total para quase zero)
4. Baixar o CSV e cruzar com `generatedAt` dos `reel.json`

O passo 3 é a pegadinha: o primeiro export desta análise veio filtrado e mostrava
R$ 9,57 onde o real era R$ 600,64.
