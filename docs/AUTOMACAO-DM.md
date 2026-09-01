# Automação de DM — o que trava, o que é grátis, quem faz o quê

> Escrito em 01/09/2026, depois do teste real com ManyChat.
> Registra a descoberta que fecha o assunto: **o problema nunca foi código.**

---

## 1. Por que a nossa automação não funciona (e a do ManyChat funciona)

Não é bug, não é falta de permissão, não é jeito de chamar a API.

O app `luiza-publisher` está **em modo de desenvolvimento** no painel da Meta.
Nesse modo a Meta só devolve dados de contas que têm função no app. A conta
`@temnasemana` tem — por isso publicar funciona. Qualquer seguidor real **não
tem** — por isso o comentário dele existe (`comments_count` conta) mas a API se
recusa a mostrar o objeto.

O ManyChat funciona porque **o app deles já passou pelo App Review da Meta**. É a
única diferença. A vantagem deles é regulatória, não técnica.

> **Consequência prática:** copiar o desenho dos fluxos deles não resolve nada.
> Nosso `responder-comentarios.js` está correto e passaria a funcionar sozinho no
> dia em que o app for publicado. O trabalho que falta é burocrático — política de
> privacidade, termos de uso, gravação do fluxo, revisão da Meta.

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
