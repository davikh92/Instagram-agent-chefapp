# 📡 Direção para a automação de conteúdo

> **De:** o time/chat do aplicativo **Tem na Semana**
> **Para:** a automação de Instagram (`github.com/davikh92/Instagram-agent-chefapp`)
> **Data:** 25/08/2026
>
> Este documento responde o `docs/briefing-app-integracao.md` de vocês, corrige o
> que o conteúdo comunica errado hoje, e entrega um endereço fixo de onde puxar a
> verdade — para nunca mais existir um arquivo preenchido à mão que envelhece.
>
> **Pode ir para o repositório público.** Nada aqui é interno.

---

## 1. Por que não devolvemos o JSON preenchido à mão

O briefing pedia o template preenchido. A gente conferiu o
`data/product-context.json` de vocês contra o banco de produção e achou isto:

| No arquivo de vocês | Na verdade |
|---|---|
| `nome: "Luiza na Cozinha"` | **Tem na Semana** — "luizanacozinha" é só o domínio de hoje, e ele vai mudar |
| `url: "DESCONHECIDA"` | `https://luizanacozinha.com` |
| objetivos: ganho muscular, economizar, vegetariano *(chute assumido)* | **7 cardápios da casa**, publicados, cada um com título, subtítulo, público-alvo e 5 benefícios já escritos |
| "receitas não são linkáveis" | `/receitas` e `/receita/:id` são **páginas públicas**, no sitemap |
| multi-chef previsto para 20/07 | arquitetura existe, **1 chef assinando** — não é notícia ainda |

Cinco de seis campos errados, num arquivo de oito semanas. E o `CLAUDE.md`, que
todo agente de vocês lê antes de escrever qualquer post, abre dizendo que o app é
`luizanacozinha.lovable.app` — endereço que não existe mais.

Isso não é desleixo de ninguém: **é a natureza do arquivo.** Documento que alguém
precisa lembrar de atualizar apodrece, e trocar "o Davi atualiza" por "um agente
atualiza" não muda a causa.

Então em vez de devolver o JSON, a gente devolve **um endereço** de onde ele sai
sempre certo.

---

## 2. O endereço

```
POST https://aywpqorkwewxdqectncu.supabase.co/rest/v1/rpc/contexto_do_conteudo
```

```bash
curl -s -X POST "https://aywpqorkwewxdqectncu.supabase.co/rest/v1/rpc/contexto_do_conteudo" \
  -H "apikey: $SUPABASE_PUBLISHABLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_PUBLISHABLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Devolve ~9 KB de JSON. Só leitura; não existe escrita deste lado.

**Sobre a chave:** é a chave *publicável* do Supabase — a mesma que já viaja no
JavaScript do site e que qualquer pessoa consegue ler abrindo o app. Ela não é
segredo, e por isso pode ficar no repositório de vocês sem problema. **Não peçam
nem usem a `service_role`**: aquela abre o banco inteiro (e-mail de usuário,
assinatura, preferência alimentar) e não tem nada a ver com conteúdo. O Davi
passa a chave publicável.

Conferido hoje: a função responde com a chave publicável, e a tabela por trás
dela continua fechada — ninguém lê nada além do que a função escolhe mostrar.

---

## 3. O que vem dentro — e a divisão que importa

```jsonc
{
  "fixo":  { /* escrito à mão pela gente, muda raramente */ },
  "atual": { /* gerado do banco a cada chamada, nunca envelhece */ }
}
```

### `fixo` — identidade, e só a gente sabe

`app` (nome, **url_canonica**, onde acessa, proposta em uma frase) ·
`publico` (usuário real, o que resolve, **o que NÃO resolve**) ·
`posicionamento` (protagonista, papel da chef, multi-chef, as duas vozes) ·
`comunicacao` (percepção desejada, **pode_dizer**, **nao_pode_dizer**, cuidado com
nomes de cardápio) · `negocio` (modelo, planos, preços, objetivo de conversão) ·
`features` (com `mostravel_no_conteudo`) · `links_uteis`.

### `atual` — fatos do produto, derivados

- **`cardapios_da_casa`** — os 7, com `titulo`, `subtitulo`, `publico_alvo`,
  `beneficios[]`, `gratuito` e a **URL já montada**. É material de post pronto:
  não precisa inventar benefício, já está escrito e revisado.
- **`receitas`** — total (486 hoje) e a URL da estante.
- **`novidades`** — o que a gente liberou para anunciar (hoje: vazio).
- **`entrou_nos_ultimos_45_dias`** — cardápios e receitas novas **por data**.
  Isto não é anúncio: é a automação conseguindo perceber sozinha que existe
  material novo, sem depender de alguém escrever um aviso.

> **Regra da URL:** nunca escrevam endereço à mão. Montem sempre a partir de
> `fixo.app.url_canonica` + os caminhos de `fixo.links_uteis`. **O domínio vai
> mudar** — quando mudar, esse campo muda e todo conteúdo novo já sai certo. Link
> congelado em arquivo vira link quebrado no dia da migração.

---

## 4. A correção grande: a chef assina, não protagoniza

Esta é a resposta à pergunta 13 do briefing de vocês, e ela **redefine o
posicionamento**, como vocês mesmos previram.

O `CLAUDE.md` de vocês diz hoje: *"Chef protagonista: Luiza Hoffmann"*, e a
automação trata o Instagram como voz dela. **Inverte.**

> **A protagonista é a facilidade — a semana resolvida, a mesa de quem usa.
> A chef ASSINA o cardápio: é a garantia de que aquilo foi pensado por quem
> cozinha de verdade e vai dar certo. Ela não é o rosto da comunicação, não é o
> assunto do post, não é personagem.**
>
> Regra curta: **chef assina cardápio; a história é da mesa de quem usa.**

Por quê, em uma linha: **marca-pessoa é refém.** Se o produto for "o app da
Luiza", ele morre no dia em que a Luiza sair. "Tem na Semana" é a casa; as chefs
assinam o que está dentro. Hoje é uma; por desenho, serão várias — a arquitetura
já existe no banco.

**Consequência prática para o conteúdo:** escrevam desde já de um jeito que
sobreviva à entrada de outras chefs. Falem da comida e da semana resolvida, não
da biografia de quem cozinha. A chef aparece assinando receita e dando dica —
não contando a vida dela.

Isso **não** significa esconder a chef. A assinatura dela é o que diferencia o
produto de "IA inventando prato". Significa que ela é a **garantia**, não o
**assunto**.

---

## 5. O que muda no código de vocês

1. **`data/product-context.json` deixa de ser escrito à mão** e passa a ser
   *cache* da chamada acima. Sugestão: um `scripts/lib/contexto.js` que busca,
   grava o arquivo e devolve o objeto; se a rede falhar, usa o cache anterior e
   avisa — conteúdo não pode parar por causa disso.
2. **Rodar o refresh antes de cada geração**, nos workflows que já existem
   (`generate-veo`, `generate-image`, `generate-story`). É um passo, não um
   workflow novo.
3. **Corrigir o `CLAUDE.md`**: nome do produto, URL (do campo, não fixa), e o
   papel da chef conforme §4.
4. **Apagar as suposições**: a lista de objetivos inventada sai; quem manda é
   `atual.cardapios_da_casa`.
5. **`pode_dizer` / `nao_pode_dizer` viram regra de checklist**, não sugestão.
   Atenção especial: os cardápios se chamam *Emagrecimento Consciente*, *Detox
   Pós-Festa*, *Pele & Intestino* — são **nomes de cardápio, não promessas
   clínicas**. Pode dizer o nome e para quem é; não pode prometer resultado nem
   falar como tratamento.

---

## 6. Como pedir mudança do lado da gente

- **Novidade para anunciar** (lançamos algo, querem post): peçam. A gente
  acrescenta em `novidades` com `pode_anunciar: true` e aparece na chamada
  seguinte. O que estiver embargado entra com `false` e **não sai** da função.
- **Cardápio novo**: não precisa pedir nada — aparece sozinho em
  `atual.cardapios_da_casa` e em `entrou_nos_ultimos_45_dias`.
- **Erro ou buraco no `fixo`**: avisem que a gente corrige na fonte.

---

## 7. O que continua em aberto (decisão do Davi, não nossa)

- **O @ da conta.** A conta é `@luizanacozinha` — nome de pessoa, para uma marca
  que decidiu não ser marca-pessoa. Trocar handle custa alcance; não trocar
  mantém a marca amarrada a um nome. Não é decisão de engenharia.
- **Cadência de menção ao app.** A regra atual de vocês (app só no reel de
  sexta) é de vocês; a gente não mexe. Só um dado que ajuda: o app mede
  `entrou → montou_semana → abriu_lista → assinou`, então dá para saber **qual
  post trouxe gente que montou semana** — desde que o link leve
  `?utm_source=instagram&utm_campaign=<nome-do-post>`.

---

## 8. Uma coisa que a gente pede de volta

Coloquem **utm em todo link publicado**. Sem isso, a medição do app registra a
pessoa como "(direto)" e nenhum dos dois lados descobre o que funcionou.

```
https://luizanacozinha.com/?utm_source=instagram&utm_campaign=bio
https://luizanacozinha.com/cardapios-da-casa?utm_source=instagram&utm_campaign=post-detox
```

A origem é gravada no **primeiro** toque e vale para sempre naquele aparelho —
então link marcado desde o começo é o que separa "o Instagram trouxe gente" de
"o Instagram trouxe gente que montou a semana".
