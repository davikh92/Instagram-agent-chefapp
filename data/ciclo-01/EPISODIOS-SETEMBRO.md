# 🎬 Novela das 18h — Temporada 1 · "18h, e agora?"

> Episódios `nv-01` a `nv-04` · Domingos 18h · set/2026 · Omni Flash + `ref-novela.png`
> Bíblia: [BIBLIA-NOVELA.md](BIBLIA-NOVELA.md) · Calendário: [CALENDARIO.md](CALENDARIO.md)
>
> **Status: ✍️ escrito (prompts revisados) — aguardando revisão do Davi.**

**Regras aplicadas em todos:**
- Prompt só descreve ação/câmera/luz/som — pessoa e cozinha vêm da referência
- **Take único contínuo**, sem "cut to": os beats mudam por AÇÃO, não por corte (o modelo emenda corte mal)
- **Abre em ação, nunca em relógio** — contexto de horário vai no overlay de texto, que é grátis; o vídeo gasta o primeiro segundo com apetite
- **Money shot declarado** em cada um — o instante em que o espectador quer comer aquilo
- **Backlight no vapor** (vapor sem contraluz some na imagem) + som dominante por beat
- Sem fala do modelo; falas e punchline por overlay ffmpeg; assinatura no último segundo
- Sem voz neste mês (o A/B de voz é a hipótese H5, mês 2)

---

## `nv-01` · 06/09 · "Sete e cinco"

**funcao:** descoberta
**gatilho_envio:** "manda pra quem chega em casa e a casa toda já tá com fome"
**situação:** 19h05, todo mundo com fome, três coisas na geladeira.

**Beats**
| Tempo | O que acontece |
|---|---|
| 0–1,5s | Porta da geladeira aberta com tranco, luz fria estourando. A mão varre a prateleira e pega alho e ovos num movimento só. |
| 1,5–4s | Alho laminado varrido pra dentro do azeite fervendo — *chiado agressivo*, óleo pulando, bordas dourando. |
| 4–7s | Vapor explodindo: macarrão erguido escorrendo da água e jogado na frigideira. |
| 7–9s | **Money shot:** ovo quebrado direto sobre a massa quente, gema rompendo em câmera lenta e escorrendo entre os fios, garfo batendo até virar molho brilhante, vapor dourado em contraluz. |
| 9–10s | Prato na mesa, garfo enrolando uma garfada, brilho pegando a luz. |

**prompt (EN)**
> Single continuous handheld shot, no cuts. Opens mid-action: a fridge door yanked open hard, cold interior light flaring, a hand sweeping across the shelf and grabbing garlic cloves and two eggs in one motion. The camera follows that hand down to a wooden board where garlic is sliced fast and swept into a pan of shimmering hot olive oil — loud aggressive sizzle, oil jumping, golden edges curling. Steam bursts upward as cooked spaghetti is lifted dripping from boiling water and dropped into the pan. Money shot: a raw egg cracked directly over the steaming pasta, the yolk breaking in slow motion and running through the strands while a fork whips it into a glossy silky sauce, backlit steam glowing gold around it. Final beat: the plate set down on the table, a fork twirling one bite, gloss catching the light. Warm 3200K key light at 45 degrees, strong backlight on the steam, deep shadows, macro texture on garlic and yolk, film grain. Dominant sound: the garlic hitting oil, then the whip of the fork. No speech, no voice, no narration, no dialogue, no music.

**overlay (ffmpeg)**
- 0,3s → 1,4s: `19h05` (canto superior, mono, grande)
- 2,2s → 3,8s: `três coisas. só.`
- 8,2s → 9,2s: `jantar: 12 minutos`
- 9,2s → 10s: assinatura `Tem na Semana.`

**legenda**
> 19h05. Todo mundo com fome. Três coisas na geladeira.
>
> Macarrão, alho e ovo — e sai um prato que ninguém adivinha que foi pressa.
>
> O alho vai no azeite ainda frio e sobe junto com o fogo: é assim que ele doura sem
> queimar. O ovo cru cai direto no macarrão quente e vira molho no braço, sem creme,
> sem nada. Um pouquinho da água do cozimento resolve o resto.
>
> Marca aqui quem chega em casa e a casa toda já tá com fome 👇

**hashtags:** #temnasemana #jantarrapido #macarrao #comidadeverdade #cozinhafacil #receitasfaceis #jantardehoje #comidacaseira #praticidade #cozinhabrasileira #vidapratica #jantarem15minutos #alhoeoleo

**modelo:** Omni Flash · **ref:** `data/ciclo-01/ref/ref-novela.png` · **voiceText:** —

---

## `nv-02` · 13/09 · "Só tem três coisas"

**funcao:** descoberta
**gatilho_envio:** "manda pra amiga que jura que não tem nada em casa"
**situação:** Ovo, tomate e pão amanhecido viram prato de gente grande.

**Beats**
| Tempo | O que acontece |
|---|---|
| 0–1,5s | **Pattern interrupt:** tomate jogado pro alto girando em câmera lenta, cai sobre a faca parada na tábua e se abre em fatias limpas. |
| 1,5–4s | Fatias caindo no azeite quente — *chiado*, pele bolhando e caramelizando. Ao lado, pão grosso escurecendo na grelha. |
| 4–7s | Ovos batidos entrando na panela em fogo baixo, espátula dobrando devagar até virar creme, vapor em contraluz. |
| 7–9s | **Money shot:** torrada montada — creme sobre o pão tostado, tomate bolhado por cima, fio de azeite; faca corta ao meio e o creme escorre pela face do corte em macro. |
| 9–10s | Metade erguida, azeite pingando. |

**prompt (EN)**
> Single continuous shot, no cuts. Opens in mid-air: a ripe tomato tossed high, spinning in slow motion against warm window light, falling onto a waiting knife blade resting on a wooden board and splitting into clean slices as it lands. The camera glides down as those slices hit hot olive oil — loud sizzle, skins blistering and caramelizing, edges wrinkling. Beside them thick slices of bread darken on a griddle, grill marks forming. Beaten eggs are poured into a low-heat pan and a spatula folds them slowly into a glossy soft curd, steam ghosting upward and backlit gold. Money shot: the toast assembled — creamy egg piled on the charred bread, blistered tomato crowning it, olive oil drizzled in a thin golden thread, then a knife cutting it in half as the cream slumps and runs down the cut face in extreme macro. Final beat: one half lifted, oil dripping. Warm 3200K side light, strong backlight on the steam, deep shadows, macro on curd and tomato skin, film grain. Dominant sound: the tomato hitting oil, then the soft drag of the spatula. No speech, no voice, no narration, no dialogue, no music.

**overlay (ffmpeg)**
- 0,4s → 1,5s: `"não tem nada em casa"`
- 4,2s → 5,4s: `ovo. tomate. pão.`
- 8,3s → 9,2s: `isso aqui é jantar`
- 9,2s → 10s: assinatura `Tem na Semana.`

**legenda**
> "Não tem nada em casa" é quase sempre mentira. Tinha ovo, tomate e pão.
>
> O tomate vai pra frigideira com azeite e sal e fica lá até murchar e caramelizar —
> é aí que ele vira outra coisa. O ovo é mexido em fogo BAIXO, mexendo devagar: fogo
> alto vira borracha, fogo baixo vira creme. O pão só precisa dourar.
>
> Marca a amiga que jura que não tem nada em casa 👇

**hashtags:** #temnasemana #ovomexido #comidadeverdade #cozinhafacil #receitasfaceis #jantarrapido #aproveitamento #comidacaseira #cafedanoite #cozinhabrasileira #vidapratica #receitacomovo #semdesperdicio

**modelo:** Omni Flash · **ref:** `data/ciclo-01/ref/ref-novela.png` · **voiceText:** —

---

## `nv-03` · 20/09 · "A criança que não come nada"

**funcao:** descoberta
**gatilho_envio:** "manda pra quem tem criança que só come macarrão"
**situação:** A cenoura rejeitada volta escondida dentro do que a criança ama.

**Beats**
| Tempo | O que acontece |
|---|---|
| 0–1,5s | Cenoura ralada com força no ralador grosso — explosão de fios laranja caindo como neve sobre uma tigela de arroz branco, em contraluz. |
| 1,5–4s | Mãos afundando na tigela: arroz, cenoura, ovo e queijo sendo apertados entre os dedos, em macro. |
| 4–7s | Bolinhos moldados rápido, um a um, caindo no óleo quente — *chiado violento*, bolhas explodindo, superfície dourando. |
| 7–9s | **Money shot:** bolinho erguido e partido ao meio em macro, vapor escapando do miolo, pontinhos laranja de cenoura visíveis no arroz. |
| 9–10s | Travessa cheia; uma mãozinha entra no quadro e leva dois. |

**prompt (EN)**
> Single continuous shot, no cuts. Opens mid-action: a carrot grated fast and hard against a coarse grater, bright orange shreds flying and falling like snow into a bowl of cooked white rice, backlit so the shreds glow in the air. The camera pushes in as hands plunge into the bowl, mixing rice, grated carrot, a cracked egg and grated cheese, squeezing the mixture through the fingers in macro. The hands shape small patties quickly, one after another, and drop them into hot oil — violent sizzle, bubbles erupting around each one, surfaces turning deep golden and crisp. Money shot: one fritter lifted from the oil and broken open in extreme macro, steam escaping from the soft interior, flecks of orange carrot visible inside the white rice. Final beat: a plate piled with golden fritters and a small child's hand darting into frame to grab two. Warm 3200K side light, backlight on the frying steam, shallow depth of field, crisp macro texture, film grain. Dominant sound: the rasp of the grater, then the eruption of the frying oil. No speech, no voice, no narration, no dialogue, no music.

**overlay (ffmpeg)**
- 0,3s → 1,5s: `"não gosto"`
- 4,0s → 5,2s: `a cenoura continua aí`
- 8,4s → 9,2s: `sumiu do prato`
- 9,2s → 10s: assinatura `Tem na Semana.`

**legenda**
> A cenoura que ela empurrou pra longe está dentro desses bolinhos. Ela comeu dois.
>
> **Bolinho de arroz que salva a semana**
> 2 xíc. de arroz cozido (aquele de ontem) · 1 cenoura ralada fina · 1 ovo ·
> 3 colheres de queijo ralado · sal · farinha de rosca só se precisar dar liga
>
> Mistura tudo com a mão até virar uma massa que fica em pé. Molda bolinhos do tamanho
> de uma colher. Frita em óleo quente até dourar dos dois lados.
>
> 💡 A cenoura tem que ser ralada FINA. Se aparecer pedaço, o plano acaba.
>
> Marca aqui quem tem criança que só come macarrão 👇

**hashtags:** #temnasemana #bolinhodearroz #comidadecrianca #receitasfaceis #cozinhafacil #maternidadereal #aproveitamento #comidacaseira #comidadeverdade #cozinhabrasileira #vidapratica #receitaparacrianca #semdesperdicio

**modelo:** Omni Flash · **ref:** `data/ciclo-01/ref/ref-novela.png` · **voiceText:** —

---

## `nv-04` · 27/09 · "Chega em vinte minutos"

**funcao:** descoberta
**gatilho_envio:** "manda pro grupo antes de avisar que vocês vão passar lá"
**situação:** Visita chega às 20h. São 19h40. Do pânico à mesa posta.

**Beats**
| Tempo | O que acontece |
|---|---|
| 0–1,5s | Forno acendendo com sopro de chama azul; batatas partidas ao meio caindo de corte pra cima na assadeira quente. |
| 1,5–4s | Azeite despejado em fio grosso, sal grosso jogado do alto, alecrim caindo. Assadeira entrando no forno, calor tremendo o ar. |
| 4–7s | A câmera desliza pro lado: tábua sendo montada em velocidade — queijo partido na mão, azeitonas rolando, pão rasgado, tomatinhos encaixando nos vãos. |
| 7–9s | **Money shot:** assadeira saindo do forno, batatas douradas com casca estalada, vapor em contraluz; uma batata é pressionada com a colher e racha com estalo audível. |
| 9–10s | Assadeira na mesa ao lado da tábua; avental sendo desamarrado. |

**prompt (EN)**
> Single continuous shot, no cuts. Opens mid-action: an oven igniting with a blue flame whoosh, then hands halving potatoes fast and letting them fall cut-side up onto a hot baking tray. Olive oil is poured over them in a thick golden stream, coarse salt scattered from height, rosemary sprigs dropping in. The camera follows the tray sliding into the oven, heat shimmer rising off it, then glides sideways to a wooden board being built at speed — cheese broken by hand, olives dropping and rolling into place, bread torn into rough pieces, cherry tomatoes rolling into the gaps. Money shot: the tray pulled from the oven, potatoes deep golden with blistered crackling edges, backlit steam pouring off them, one potato pressed with the back of a spoon and audibly shattering open. Final beat: the tray set on the table beside the board, an apron untied. Warm 3200K key light, strong backlight on the oven steam, macro on the crackling crust, urgent handheld energy, film grain. Dominant sound: the oil hitting the hot tray, then the crack of the crust. No speech, no voice, no narration, no dialogue, no music.

**overlay (ffmpeg)**
- 0,3s → 1,4s: `19h40`
- 1,6s → 2,6s: `"tô chegando"`
- 8,4s → 9,2s: `20h00. tá pronto.`
- 9,2s → 10s: assinatura `Tem na Semana.`

**legenda**
> "Tô chegando aí em vinte minutos." Deu tempo.
>
> Batata partida ao meio, azeite generoso, sal grosso e alecrim — forno a 220° por 20
> minutos, camada única. Enquanto assa, monta a tábua com o que tem: queijo, azeitona,
> pão rasgado, tomatinho.
>
> 💡 Camada única é o segredo da batata. Amontoada, ela cozinha no vapor e sai murcha.
> Espalhada, ela estala.
>
> Manda pro grupo antes de avisar que vocês vão passar lá 👇

**hashtags:** #temnasemana #batataassada #receberemcasa #cozinhafacil #receitasfaceis #tabuadefrios #jantarrapido #comidacaseira #comidadeverdade #cozinhabrasileira #vidapratica #petiscos #recebendoemcasa

**modelo:** Omni Flash · **ref:** `data/ciclo-01/ref/ref-novela.png` · **voiceText:** —

---

## Notas de produção

- **Custo:** 4 × $1 = **$4,00**
- **O que mudou na revisão de prompts:** (1) tirados todos os "cut to" — os quatro viraram
  take único contínuo, como a bíblia manda; (2) `nv-01` e `nv-04` não abrem mais em
  relógio — o horário foi pro overlay e o vídeo abre em ação; (3) money shot declarado
  em cada um; (4) contraluz no vapor especificada (vapor sem contraluz some na imagem);
  (5) som dominante por beat, em vez de lista solta de ruídos.
- **Overlay:** os 4 dependem do script de texto (pendência aberta). Dá pra gerar os
  vídeos antes e aplicar o texto depois — não precisa regerar.
- **Hashtags:** `brand.json → hashtags` ainda tem `#luizanacozinha` e `#chefluiza` da
  marca antiga. Usei `#temnasemana` aqui; o `brand.json` precisa ser atualizado.
- **Sem voz nos 4** de propósito: o melhor reel da conta (alho e óleo, 5,2s) era sem
  voz, e o A/B formal de voz é a hipótese H5, prevista pra outubro.
