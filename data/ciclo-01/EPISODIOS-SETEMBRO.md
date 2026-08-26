# 🎬 Novela das 18h — Temporada 1 · "18h, e agora?"

> Episódios `nv-01` a `nv-04` · Domingos 18h · set/2026 · Omni Flash + `ref-novela.png`
> Bíblia: [BIBLIA-NOVELA.md](BIBLIA-NOVELA.md) · Calendário: [CALENDARIO.md](CALENDARIO.md)
>
> **Status: ✍️ escrito — aguardando revisão do Davi antes de entrar na fila.**

**Regras aplicadas em todos:** prompt só descreve ação/câmera/luz/som (pessoa e cozinha
vêm da referência) · som nativo é personagem, sem fala do modelo · falas e punchline
entram por overlay ffmpeg · assinatura "Tem na Semana." no último segundo · sem voz
neste mês (o A/B de voz é a hipótese H5, mês 2).

---

## `nv-01` · 06/09 · "Sete e cinco"

**funcao:** descoberta
**gatilho_envio:** "manda pra quem chega em casa e a casa toda já tá com fome"
**situação:** O relógio do fogão marca 19h05. Todo mundo com fome. Ela abre a geladeira.

**Beats**
| Tempo | O que acontece |
|---|---|
| 0–1,5s | Close no relógio do fogão virando 19h05 — *bip* alto. Porta da geladeira abre com tranco, luz fria bate no rosto dela. |
| 1,5–4s | O que tem: meio pacote de macarrão, três dentes de alho, dois ovos. Ela pega os três de uma vez, uma coisa em cada mão, e fecha a porta com o quadril. |
| 4–8s | Alho laminado caindo no azeite quente — *chiado alto*. Macarrão entrando na panela. Ovo quebrado direto por cima da massa fumegante, gema escorrendo, ela mexendo rápido. |
| 8–10s | Prato na mesa, vapor subindo, garfo entrando. Ela olha pra câmera e dá de ombros. |

**prompt (EN)**
> Extreme close-up of a stove clock flipping to 19:05, then a fridge door yanked open, cold light hitting her face. Quick cut to her hands grabbing half a pack of dry spaghetti, three garlic cloves and two eggs in one sweep, hip-closing the fridge. Sliced garlic dropping into shimmering hot olive oil, loud sizzle, golden edges curling. Spaghetti plunged into boiling water, steam bursting upward. A raw egg cracked directly over the steaming pasta, yolk breaking and running through the strands as a fork whips it fast into a glossy sauce. Final beat: the finished plate set on the table, steam rising, a fork twirling a bite. Handheld energy, dramatic warm side light, deep shadows, film grain, decisive-moment motion. No speech, no voice, no narration, no dialogue, no music.

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
**situação:** Geladeira quase vazia — ovo, tomate, pão amanhecido. Vira prato de gente grande.

**Beats**
| Tempo | O que acontece |
|---|---|
| 0–1,5s | A porta da geladeira abre devagar. Prateleira quase vazia: dois ovos, um tomate, meio pão. Silêncio — só o zumbido da geladeira. |
| 1,5–4s | Ela pega o tomate e o joga pro alto; a faca já espera na tábua. O tomate cai em fatias perfeitas. *(pattern interrupt)* |
| 4–8s | Tomate na frigideira com azeite e uma pitada de sal — *chiado*. Pão dourando na grelha ao lado. Ovos batidos entrando numa panela em fogo baixo, mexendo devagar até virar creme. |
| 8–10s | Torrada montada: creme de ovo, tomate confitado por cima, azeite em fio. Corte ao meio — o creme escorre. |

**prompt (EN)**
> A fridge door opening slowly on a nearly empty shelf holding two eggs, one tomato and half a loaf of bread, only the low hum of the appliance. Then a tomato tossed high into the air in slow motion and falling onto a waiting knife on a wooden board, splitting into perfect slices as it lands. Tomato slices hitting hot olive oil with a loud sizzle, edges blistering and caramelizing. Thick bread slices toasting on a griddle beside it, grill marks forming. Beaten eggs poured into a low-heat pan, a spatula folding them slowly into a glossy soft curd. Final beat: the toast assembled — creamy eggs, blistered tomato on top, olive oil drizzled in a thin golden thread, then sliced in half as the cream runs down. Dramatic warm side lighting, deep shadows, macro detail, film grain. No speech, no voice, no narration, no dialogue, no music.

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
**situação:** A criança rejeita tudo. O truque: o legume some dentro de uma coisa que ela ama.

**Beats**
| Tempo | O que acontece |
|---|---|
| 0–1,5s | Close num pratinho infantil sendo empurrado pra longe na mesa, cenoura intacta. *Som seco do prato deslizando.* |
| 1,5–4s | Ela pega a cenoura rejeitada e a rala grosso — a cenoura desaparece numa nuvem de laranja dentro de uma tigela de arroz. |
| 4–8s | Arroz, cenoura ralada, ovo e queijo sendo misturados com a mão. Bolinhos moldados rápido, um a um, e caindo no óleo quente — *chiado forte*, borbulhando dourado. |
| 8–10s | Bolinhos dourados numa travessa. Uma mãozinha entra no quadro e pega dois. |

**prompt (EN)**
> Close-up of a small child's plate being pushed away across a table, an untouched carrot on it, dry scraping sound. Then a hand grating that same carrot fast on a coarse grater, orange shreds falling like snow into a bowl of cooked rice. Hands mixing rice, grated carrot, a cracked egg and grated cheese together, squeezing the mixture between fingers. Small patties shaped quickly one by one and dropped into hot oil, loud sizzle, bubbles erupting, surfaces turning deep golden. Final beat: golden fritters piled on a plate, and a small child's hand entering the frame to grab two of them. Warm dramatic side lighting, shallow depth of field, macro texture, film grain. No speech, no voice, no narration, no dialogue, no music.

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
**situação:** Visita avisou que chega às 20h. São 19h40. Do pânico à mesa posta.

**Beats**
| Tempo | O que acontece |
|---|---|
| 0–1,5s | Relógio marcando 19h40. Ela olha o relógio, olha a cozinha vazia. *Batida seca.* |
| 1,5–4s | Sequência veloz: forno acendendo, batatas sendo partidas ao meio direto sobre a assadeira, azeite despejado por cima em fio grosso, alecrim caindo. |
| 4–8s | Assadeira entrando no forno. Corte: tábua sendo montada em velocidade — queijo partido com a mão, azeitonas caindo, pão rasgado, tomatinhos rolando pra encaixar nos vãos. |
| 8–10s | A batata sai do forno, dourada e estalando. Vai pra mesa ao lado da tábua. Campainha toca — ela sorri e tira o avental. |

**prompt (EN)**
> A wall clock reading 19:40, then a fast pan across an empty kitchen counter. Rapid sequence: an oven igniting with a blue flame whoosh, potatoes being halved fast directly onto a baking tray, olive oil poured over them in a thick golden stream, rosemary sprigs falling. The tray sliding into the oven. Cut to a wooden board being built at speed — cheese broken by hand, olives dropping and rolling, bread torn into rough pieces, cherry tomatoes rolling into the gaps. Final beat: the tray pulled from the oven, potatoes deep golden and audibly crackling, carried to the table beside the board; a doorbell rings and an apron is untied. Warm dramatic lighting, urgent handheld camera, steam and crackle, film grain. No speech, no voice, no narration, no dialogue, no music.

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
- **Overlay:** os 4 dependem do script de texto (pendência aberta). Dá pra gerar os
  vídeos antes e aplicar o texto depois — não precisa regerar.
- **Hashtags:** `brand.json → hashtags` ainda tem `#luizanacozinha` e `#chefluiza` da
  marca antiga. Usei `#temnasemana` aqui; o `brand.json` precisa ser atualizado.
- **Sem voz nos 4** de propósito: o melhor reel da conta (alho e óleo, 5,2s) era sem
  voz, e o A/B formal de voz é a hipótese H5, prevista pra outubro.
