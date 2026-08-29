# Setup do Pinterest — do zero ao pin automático

> A conta comercial já existe (Davi, 28/08/2026). Faltam o app de desenvolvedor,
> o token e a aprovação de acesso público. Este guia é a ordem exata.

---

## O muro que define tudo: Trial × Standard

A Pinterest tem dois níveis de acesso, e a diferença decide o que a automação
vale:

| | **Trial** | **Standard** |
|---|---|---|
| Pins criados pela API | **visíveis só pra própria conta** (sandbox) | públicos |
| Como consegue | na hora | revisão da Pinterest |
| Limite | por dia/por app | por minuto/por usuário |

**Automatizar em Trial é publicar pra ninguém.** Por isso o pedido de Standard
não é uma etapa posterior: é o objetivo do primeiro dia de código funcionando.

E a boa notícia: a revisão pede **um vídeo do app rodando de verdade**. O código
deste diretório não é preparação pro pedido — ele *é* o pedido.

---

## Passo 1 — criar o app de desenvolvedor

1. Entre em <https://developers.pinterest.com/apps/> logado **na conta comercial**
2. Crie um app (nome sugerido: `Tem na Semana — redistribuição`)
3. Em **Redirect URIs**, cadastre exatamente:

```
http://localhost:8412/callback
```

4. Copie o **App ID** e o **App secret**

> ⚠️ Não cole essas credenciais em chat nenhum. Elas vão direto do site pro seu
> `.env` e pros secrets do GitHub.

## Passo 2 — colocar no `.env`

```
PINTEREST_APP_ID=...
PINTEREST_APP_SECRET=...
```

O `.gitignore` já cobre `.env` e `.env.*` — não tem risco de commit.

## Passo 3 — autorizar e pegar o refresh token

```bash
node scripts/pinterest/oauth.js
```

O script sobe um servidor local, imprime a URL de autorização, e depois que você
aprova no navegador ele imprime o `PINTEREST_REFRESH_TOKEN` **no seu terminal**.

Cole em dois lugares:
1. no `.env` local
2. no GitHub: **Settings → Secrets and variables → Actions → New secret**

Guardamos só o refresh token (vale ~1 ano). O access token, que é curto, é
trocado a cada execução e nunca fica gravado — foi exatamente o descuido oposto
que fez o token do Instagram expirar em silêncio por dois meses.

## Passo 4 — secrets no GitHub

Três, com estes nomes exatos:

```
PINTEREST_APP_ID
PINTEREST_APP_SECRET
PINTEREST_REFRESH_TOKEN
```

## Passo 5 — criar os boards

```bash
node scripts/pinterest/criar-boards.js --dry-run
```

```bash
node scripts/pinterest/criar-boards.js
```

Cria os três boards de `data/pinterest/config.json` e grava os ids em
`data/pinterest/boards.json`. É idempotente: board que já existe é reaproveitado.

**Nome de board é campo de busca no Pinterest** — por isso vem do config e não
deve ser "melhorado" na interface depois.

## Passo 6 — conferir a fila antes de publicar

```bash
node scripts/pinterest/publicar.js --dry-run --limite 5
```

Mostra qual post viraria pin, com título, link e as URLs de vídeo e capa. Não
toca na conta.

## Passo 7 — o primeiro pin de verdade

```bash
node scripts/pinterest/publicar.js --limite 1
```

**Grave a tela enquanto roda** — esse vídeo é o que a Pinterest pede na revisão
de Standard access.

## Passo 8 — pedir Standard access

No painel do app, peça o upgrade e anexe a gravação. A revisão verifica que o
fluxo OAuth está implementado corretamente e que o app não guarda dado sensível.

## Passo 9 — ligar o automático

O workflow `📌 Pinterest — redistribuir` roda **todo dia às 11h30 BRT**, um pin
por vez. Enquanto o Standard não sair, ele funciona — só que os pins ficam
visíveis apenas pra própria conta.

Rodar sob demanda: aba **Actions** → o workflow → **Run workflow** (tem campo de
modo seco e de limite).

---

## Como a máquina decide o que vira pin

**Nada é gerado.** Vídeo e capa saem do Cloudinary (os mesmos arquivos do
Instagram) e o texto sai da legenda que já foi revisada.

A fila **não é um arquivo que alguém mantém** — é derivada de `ready-to-post/`.
Entra o post que:

1. já tem `published.json` (ou seja: **já estreou no Instagram**)
2. estreou há pelo menos **2 dias** (`cadencia.dias_apos_instagram`)
3. tem vídeo e capa no Cloudinary
4. tem regra de board pro seu prefixo

| Prefixo | Board | Link do pin |
|---|---|---|
| `cd` | Cardápio da Semana | a página do próprio cardápio |
| `rd` | Jantar Rápido de Semana | a página pública da receita |
| `rl` | Jantar Rápido de Semana | a estante de receitas |
| `nv` | Cozinha do Dia a Dia | montar a semana |
| `pt` | — | **pulado de propósito** |

`pt` fica de fora porque participação A/B é mecânica de comentário do Instagram.
No Pinterest, onde o pin **é** o link, pedir comentário não faz sentido.

Nenhum link é escrito à mão: ou vem do `link_dm` do próprio post, ou é montado a
partir de `fixo.links_uteis` + `fixo.app.url_canonica`. Todos ganham
`utm_source=pinterest` e `utm_campaign=pin-<id>`. **Quando o app virar aplicativo
na Play Store, quem redireciona é o site — nenhum pin precisa ser editado.**

---

## O acervo antigo: 60 vídeos que NÃO entram

Existem 60 reels da era anterior com vídeo e capa no Cloudinary. Todos os 60
carregam **"Luiza na Cozinha"** na legenda — a marca aposentada.

Eles estão fora da fila porque o prefixo `reel` não tem regra no config. É
proposital: republicar hoje colocaria a marca morta no Pinterest, com vida útil
de meses.

Se um dia valer a pena aproveitá-los, o trabalho é **reescrever as legendas** —
não regravar nada. Decisão em aberto, sem data.

---

## Quando alguma coisa quebrar

- **`Faltam variáveis no .env / secrets`** — passos 2 a 4.
- **`boards.json não existe`** — passo 5.
- **HTTP 401 ao renovar token** — refresh token expirado ou revogado: rode o
  passo 3 de novo.
- **`Pinterest recusou o vídeo`** — o MP4 não passou no processamento. Nossos
  reels são 10s, 9:16, MP4. Se o problema for a proporção, a saída é recortar
  pra 4:5 — **nunca gerar material novo.**
- **Workflow vermelho sem pin criado** — é de propósito: o script sai com erro
  quando não publica nada, pra falha não passar despercebida.
