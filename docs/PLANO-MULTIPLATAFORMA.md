# Plano Multiplataforma — preparação do terreno

> **Escrito em 28/08/2026. Nenhuma linha de código foi escrita — de propósito.**
> Este documento existe pra decidir *o quê* e *em que ordem*, antes de qualquer
> automação. A regra que o Instagram nos ensinou: **plataforma não ganha automação
> antes de provar que merece.** Foi o que aconteceu com os stories — a máquina
> ficou pronta antes de a gente saber que a entrega era baixa.

---

## 1. O que mudou e redefine tudo: o app vai virar app

O desenvolvimento do produto está praticamente concluído. Depois de um período de
transição, o time está agora **ajustando os primeiros pontos de entrada** — onde a
pessoa cai e o que ela vê nos primeiros segundos. **O próximo passo declarado é
publicar como aplicativo Android na Play Store**, porque site converte pouco.

Isso não é detalhe de bastidor: muda três coisas na expansão.

### 1.1 O destino do link muda — e por isso nenhum link pode saber qual é o destino

Hoje todo link aponta pro site. Amanhã aponta pra loja. Se cada plataforma tiver o
destino final escrito na bio, o dia da publicação na loja vira um dia de catar link
em cinco lugares — e o que não for catado vira link **errado**, não link quebrado.

> **Regra pra expansão:** toda bio, todo pin, toda descrição de Short aponta pra
> `fixo.app.url_canonica`. **Quem decide pra onde mandar é o site, não o post.**
> No dia da loja muda um lugar; as cinco plataformas seguem certas sozinhas.

É a mesma regra que já vale aqui dentro ("nunca escreva URL à mão") — só que agora
ela tem uma data marcada pra provar o valor dela.

### 1.2 O funil ganha um degrau

Hoje: `entrou → montou_semana → abriu_lista → assinou`.
Com a loja, **`instalou`** entra no meio, e o clique da rede social passa a ser
medido contra instalação, não contra visita.

Nada a fazer agora — mas tem uma consequência **hoje**: o `utm_source` de cada
plataforma precisa nascer certo desde o primeiro post. Se o TikTok entrar sem
`utm_source=tiktok`, o histórico pré-loja dele não existe, e depois não dá pra
comparar "antes e depois da loja" por origem.

### 1.3 A ficha da Play Store é conteúdo — e a máquina já sabe fazer

Publicar na loja exige ícone, capturas de tela, arte de destaque e (opcional, mas
pesa) um vídeo curto. Seria a primeira vez que este repositório produz material que
**não é post**. A mesma direção de arte, os mesmos templates de tipografia e os
mesmos 65 vídeos servem de matéria-prima.

**Vale reservar essa frente desde já** — quando o time do app pedir a ficha, ela não
deveria começar do zero.

---

## 2. O que cada plataforma custa de verdade

Criar conta é a parte de dez minutos. O custo real está na coluna do meio.

| Plataforma | O que já temos | O que falta de verdade | Esforço |
|---|---|---|---|
| **Pinterest** | 65 capas PNG + pipeline de overlay tipográfico funcionando | conta comercial; definir os boards; título e descrição por pin (é campo de busca) | **baixo** |
| **YouTube Shorts** | 65 vídeos 9:16 prontos | **canal próprio da marca** (hoje é conta pessoal do Davi); título por vídeo | **baixo** |
| **TikTok** | 65 vídeos 9:16 **sem marca d'água** | texto na tela e trilha — ver 2.1 | **alto** |
| **Facebook Reels** | mesma API Graph do Instagram | nada além de vincular a página | ~zero, de carona |
| **Threads** | vinculado ao IG | decidir se tem o que dizer em texto | adiado |
| **X** | — | API de escrita paga | **fora** |

### 2.1 A verdade desconfortável sobre o TikTok

Nossos reels são deliberadamente **sem texto e sem voz** — som ambiente, take único,
a comida carregando a cena. No Instagram isso funciona: o feed é visual e a legenda
carrega o argumento.

No TikTok, o primeiro segundo costuma ser vencido por **texto na tela**. Vídeo lindo
e mudo entra em desvantagem estrutural ali — não por qualidade, por gramática da
plataforma.

> Ou seja: **o item C (assinatura visual + música + texto) não é enfeite — é o
> requisito de entrada do TikTok.** Enquanto ele não existir, TikTok entra sem
> promessa: pra sentir, não pra medir.

Isso não é motivo pra apressar o C. É motivo pra **não começar pelo TikTok**.

### 2.2 A vantagem que a gente tem e não está usando

Vídeo repostado com marca d'água de outra plataforma perde alcance. Os nossos 65 são
**originais e limpos** — nunca passaram por editor de rede social. Isso vale em toda
plataforma, e é um ativo que expira: quanto mais tempo ficam parados, menos frescos
ficam.

### 2.3 Por que o Pinterest é o melhor primeiro teste

- **O pin é o link.** Não precisa de bio, de DM, de "comenta a palavra" — a mecânica
  mais simples de todas, e a única que já nasce medindo clique.
- **Vida útil de meses**, não de 48 horas. Um pin de terça ainda traz gente em
  novembro. É o oposto do Reels.
- **O material já existe.** As 65 capas estão prontas, e o pipeline que compôs as
  stories de cardápio compõe pin com uma troca de template.
- **É busca, não feed.** "Cardápio da semana", "marmita fácil", "jantar rápido" — a
  persona procura exatamente isso, e a gente tem 7 cardápios com nome, público e
  benefício já escritos pelo time do app.

Custo pra descobrir se funciona: uma conta e uma tarde. Sem código.

### 2.4 YouTube Shorts: o acervo que rende juros

Reels morre em 48h; Short de receita é **buscado**. "Como fazer X" acumula views por
meses. Nosso material de receita tem nome de prato no título — que no YouTube é campo
de busca, não legenda.

Um bloqueio conhecido: **o canal precisa ser da marca.** Publicar Short da marca na
conta pessoal do Davi mistura duas identidades e não constrói acervo transferível.
Criar canal é grátis; a decisão é sobre nome e e-mail dono.

---

## 3. A rotina semanal

O objetivo é que a multiplataforma custe o que o Instagram custa hoje: **quase nada
de tempo humano.** O que não dá pra automatizar cabe numa janela só.

**Uma sessão por semana, mesma hora, ~20 minutos:**

1. **O que subiu** — conferir que cada plataforma publicou o que devia (uma tela só).
2. **O que engajou** — números por plataforma, sem interpretar; interpretar é no
   checkpoint mensal.
3. **Responder** — comentários das plataformas que não têm a nossa automação de DM.
4. **Fim.** Se sobrou trabalho depois desses três passos, é sinal de que alguma coisa
   precisa virar automação — anota e segue.

Tudo que não couber nessa janela é candidato a virar script, nunca a virar hábito.

---

## 4. Ordem proposta

### Fase 0 — decisões, sem produção *(pode começar agora)*
Identidade: mesmo `@` em todas as plataformas, se estiver livre. Avatar e bio já
existem (`assets/perfil/`) e servem em todas. Definir o `utm_source` de cada uma
**antes** do primeiro post: `pinterest`, `youtube`, `tiktok`, `facebook`.

### Fase 1 — Pinterest, na mão *(o teste mais barato)*
10 a 15 pins com as capas que já existem, apontando pra `url_canonica`. Sem código,
sem API, sem aprovação. Duas a três semanas medindo clique. **Se o pin trouxer gente,
aí sim vale automatizar.**

### Fase 2 — YouTube Shorts *(o acervo)*
Canal próprio + subida do acervo em ritmo — não 65 de uma vez, despejo é lido como
spam. Título pensado pra busca.

### Fase 3 — TikTok *(depois do item C)*
Quando a assinatura visual e a trilha existirem. Antes disso, no máximo reservar o
`@` pra não perder o nome.

### Fase 4 — automação do que provou
Só aqui entra código, e só pra plataforma que passou no teste. Pontos a confirmar
**na hora de implementar**, não agora:
- TikTok: a API de publicação exige app auditado; sem auditoria, publica como
  rascunho/privado.
- YouTube: upload consome cota alta da Data API — checar o teto diário.
- Pinterest: acesso de produção da API passa por aprovação.
- Facebook: mesma Graph API do Instagram, o caminho mais curto de todos.

---

## 5. O que **não** fazer agora

- Não escrever código de publicação pra nenhuma plataforma.
- Não pedir auditoria de API antes de saber se a plataforma vale a pena.
- Não replicar "comenta a palavra → DM": é mecânica do Instagram. TikTok é link na
  bio, Pinterest o pin é o link, YouTube é link na descrição.
- Não subir os 65 vídeos de uma vez em lugar nenhum.
- Não deixar o TikTok definir o formato do Instagram. O ciclo atual está em teste;
  mudar o produto pra agradar uma plataforma que ainda não entrou é trocar dado real
  por palpite.

---

## 6. Pendências do Davi — Fase 0

- [ ] Decidir o `@` da marca e checar disponibilidade em Pinterest, YouTube e TikTok
- [ ] Criar o canal do YouTube **da marca** (hoje é conta pessoal)
- [ ] Conta comercial no Pinterest (a pessoal não dá métrica de clique)
- [ ] Avisar quando o time do app tiver data pra Play Store — a ficha da loja é
      material que sai daqui
