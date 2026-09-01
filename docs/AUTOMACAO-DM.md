# Automação de DM — o que trava, o que é grátis, quem faz o quê

> Escrito em 01/09/2026, depois do teste real com ManyChat.
> Registra a descoberta que fecha o assunto: **o problema nunca foi código.**

---

## 1. Por que a nossa automação não funciona (e a do ManyChat funciona)

**Fato observado (01/09):** o Davi comentou DETOX; o ManyChat entregou a DM.
A nossa API, no mesmo instante, via `comments_count: 1` e lista **vazia**.
Mesmo comentário, mesma conta — só o app de acesso muda. O código não é a variável.

O modelo de acesso da Meta tem três camadas (o diagnóstico anterior, "é só
publicar o app", era simples demais — correção após o Davi contestar):

1. **Modo do app** — Development × Live. Um toggle, sem revisão.
2. **Nível por permissão** — *Standard* (só dados de contas com função no app)
   × *Advanced* (dados de qualquer usuário). **É o Advanced que passa por
   revisão da Meta**, permissão a permissão.
3. **Funções** — quem tem papel no app (`Funções` no painel). Hoje:
   `@temnasemana` (Testador do Instagram) e o Davi como admin do painel — mas
   **`@Dav.hoffmann` não está lá**, e foi ele quem comentou.

A hipótese que explica tudo: `instagram_business_manage_comments` está em
Standard, então a API só mostraria comentário **de conta com função no app**.
O ManyChat tem Advanced Access — vantagem regulatória, não técnica.

### O experimento que decide (5 min, pendente)

Adicionar `@Dav.hoffmann` como **Testador do Instagram** em Funções → ele aceita
o convite (Instagram → Configurações → Site e apps) → comenta de novo → rodar
`node scripts/responder-comentarios.js --dry-run`.

- **Comentário aparece** → hipótese confirmada; pra valer pro público é pedir
  Advanced Access nas duas permissões (comments + messages).
- **Não aparece** → tem outra coisa, investigar de novo.

## 2. O limite do plano grátis do ManyChat

Testado na conta real. O gatilho de comentário tem três modos:

| Modo | Plano |
|---|---|
| **publicação específica** (marcar o post na mão) | **grátis** |
| qualquer publicação | PRO |
| próxima publicação | PRO |

Só o primeiro é grátis — e ele é justamente o incompatível com a nossa máquina:
os posts sobem sozinhos por cron, e alguém teria que entrar no ManyChat **depois
de cada publicação** pra marcar o post e a palavra.

**O custo real:** 2 posts por semana pedem DM (cardápio na terça, receita na
sexta/quinta). Dá ~5 minutos por semana. É uma ponte aceitável — não é solução.

**Não existe API pública do ManyChat**, então isso não tem como ser automatizado
por fora. Verificado.

## 3. A divisão que faz sentido

| Mecânica | Quem faz | Por quê |
|---|---|---|
| **Seguiu → DM de boas-vindas** | **ManyChat, grátis** | configura **uma vez** e nunca mais se toca. Zero manutenção, encaixe perfeito no grátis. |
| **Comentou a palavra → DM** | **nossa automação**, depois do App Review | é por post; só faz sentido se for automático. No ManyChat grátis viraria trabalho manual eterno. |

Enquanto o App Review não sai, o comentário→DM fica no ManyChat na mão, 2× por
semana, usando a tabela pronta em `data/ciclo-01/PROGRAMACAO-DM.md` (26 palavras
e links já escritos, é copiar e colar).

**Não assinar** o ManyChat: sem faturamento, não se paga ferramenta por conforto.
Decisão do Davi, 01/09.

## 3b. O caminho do meio (ideia do Davi, 01/09): palavra-chave direto na DM

O gatilho **"pessoa manda a palavra na DM → recebe o link"** é grátis no ManyChat
e — a diferença que importa — **é da conta, não do post**. Dá pra deixar as 26
palavras configuradas **de uma vez, antecipadamente**, sem depender de horário de
publicação. Elimina exatamente a dor do modo grátis por post: ficar de plantão
pra marcar o post depois que ele sai.

Custo do trade-off, nas palavras do Davi: comentário no post engaja mais e a
pessoa não muda de lugar (comentou → DM chega); mandar DM é um passo a mais e
não alimenta o post. **Não substitui o comentário→DM — é a ponte pré-configurável
enquanto ele não existe pro público.**

Se for adotar: legendas futuras ganham a variação *"comenta DETOX **ou me manda
DETOX aqui na DM**"* — o comentário continua existindo pro engajamento, e a DM é
o caminho garantido. As 26 palavras e links já estão prontos em
`data/ciclo-01/PROGRAMACAO-DM.md`.

## 4. Ideias que valem explorar (grátis)

Levantadas fuçando os modelos deles. **Nada disso está decidido.**

- **Responda todas as suas DMs** — resposta automática pra quem manda DM direto,
  sem passar por comentário. Pega gente que hoje se perde.
- **Gere leads com stories / responda perguntas de stories** — resposta de story
  vira DM. Interessante justamente porque as stories entregam pouco: quem responde
  story é gente engajada de verdade.
- **Qualifique leads com enquete** — descobrir qual cardápio a pessoa quer antes de
  mandar. Isso é dado que a gente **não tem** hoje.
- **Venda pelos comentários de Reels** — mesma mecânica do comentário→DM.

**São PRO (fora por ora):** aumentar seguidores com comentários, lista de e-mails,
concurso, reconhecer perguntas com IA.

### A descoberta mais valiosa

O ManyChat **etiqueta todo mundo que interage** — inclusive por story. Isso monta
uma lista de pessoas engajadas, que é exatamente o ativo que a gente não tem e que
nenhum post recupera depois. Vale entender se dá pra reproduzir isso do nosso lado
quando o app estiver publicado.

## 5. O que decide tudo

**Fazer ou não o App Review do `luiza-publisher`.**

- **Fez:** comentário→DM volta a ser automático e grátis pra sempre, sob nosso
  controle, e a etiquetagem de quem interage vira possível.
- **Não fez:** ou paga ManyChat, ou marca post na mão 2× por semana pra sempre.

Sem data. Ver `docs/setup-pinterest.md` para o precedente: lá o mesmo tipo de
revisão é exigido pela Pinterest, e a gravação do fluxo funcionando é o pedido.
