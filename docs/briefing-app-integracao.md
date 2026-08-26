# Pedido de contexto do produto — para o chat do aplicativo

**De:** sistema automatizado de conteúdo do Instagram (produz Reels + Stories sobre o app)
**Para:** o time/chat que desenvolve o aplicativo
**Objetivo:** o conteúdo do Instagram precisa refletir o produto REAL. Hoje ele funciona com suposições. Este documento pede a verdade — e propõe um jeito de ela se manter atualizada sozinha.

---

## Como responder

Responda em português, do jeito que o produto realmente é — **não tente adivinhar o que o Instagram quer ouvir.** A regra desta integração é: **o produto orienta o conteúdo, nunca o contrário.** Se o conteúdo hoje comunica algo que não bate com o produto, é o conteúdo que está errado.

Quem pergunta (o sistema de conteúdo) não vai te contar as decisões de marca, tom ou estratégia dele — de propósito, pra não enviesar sua resposta. Queremos suas respostas cruas.

Ao final, preencham o **template JSON** (última seção) e gravem ele no local combinado (seção H). Se algo não se aplica, escrevam `null` ou expliquem.

---

## O que vocês NÃO precisam responder

O sistema de conteúdo já lê o banco de dados do app direto (Supabase, projeto `luiza pag projeto`). Ele já enxerga:

- `curated_menus` e `curated_menu_meals` — os cardápios curados e suas refeições
- `base_recipes` e `recipe_stats` — catálogo de receitas e popularidade
- `chefs` — quem assina receita
- `user_subscriptions` — volume de assinantes

**Não percam tempo descrevendo esses dados.** Quando vocês criarem um cardápio curado novo, ele aparece pro conteúdo automaticamente.

O que o banco **não** conta — e é só isso que este documento pede — é **identidade, posicionamento e intenção de comunicação.** Um `curated_menu` chamado "Semana da Massa" não diz se o produto quer ser percebido como prático ou como sofisticado, nem se pode prometer emagrecimento, nem de quem é a voz da marca depois do multi-chef.

---

## Perguntas

### A. Identidade do produto
1. Nome oficial do produto/app hoje.
2. URL real (a antiga `luizanacozinha.lovable.app` não vale mais — qual é a atual?).
3. Onde as pessoas acessam: site, app store, PWA? Tem link único pra bio do Instagram?
4. Em uma frase: o que o produto faz.

### B. Público e problema
5. Pra quem é (quem é o usuário real, não o ideal romântico).
6. Que problema concreto ele resolve.
7. Que problema ele **não** resolve (pra o conteúdo não prometer o que o app não faz).

### C. Funcionalidades
8. Liste as funcionalidades principais. Para cada uma:
   - o que faz, em uma linha;
   - dá pra **mostrar/apontar num post hoje** (existe tela apresentável, fluxo demonstrável)? sim/não;
   - se sim, como (screenshot, link direto, deep link?).
9. Existe algo que o usuário salva/recebe (cardápio, lista, receita)? Em que formato? Esse formato é bonito o suficiente pra virar imagem de post, ou é interface de app?

### D. Modelo de negócio
10. Gratuito, pago, freemium, assinatura? Qual o objetivo de conversão do Instagram — cadastro? teste grátis? assinatura direta?
11. Existe alguma oferta/CTA oficial que o conteúdo deve usar (ex: "teste 7 dias grátis")? Ou o conteúdo tem liberdade?

### E. O que mudou na transição
12. Houve uma atualização grande recente. O que mudou, exatamente?
13. A plataforma deixou de ser centrada só na chef Luiza e passou a ter **vários chefs**? Se sim:
    - a marca virou uma plataforma multi-chef, ou a Luiza segue sendo o rosto principal?
    - o Instagram deve continuar como "voz da Luiza", ou virar voz da plataforma?
    - **(esta resposta redefine o posicionamento inteiro do conteúdo — seja específico.)**
14. O que já é público e o que ainda é interno.

### F. Como o produto quer ser comunicado
> Aqui é onde vocês **devem** influenciar o conteúdo.
15. Que percepção o produto quer gerar (ex: confiável, acessível, premium, prático...)?
16. Que palavras/promessas o conteúdo **pode** usar e quais **não pode** (limites legais, claims de saúde/nutrição, etc.)?
17. Tem identidade visual/marca definida (logo, cores, tipografia)? Podem compartilhar?
18. Algo que o conteúdo atual provavelmente comunica errado e vocês querem corrigir?

### G. Assets
19. Que assets vocês conseguem disponibilizar de forma estável (screenshots de tela, logo, paleta)? Onde ficam?

---

## H. O ponto principal: manter isso vivo

Não queremos que este documento seja respondido uma vez e envelheça. A proposta é que ele passe a morar **dentro do Supabase de vocês**, num único registro que vocês atualizam sempre que algo relevante mudar no produto.

**Proposta de tabela** (vocês decidem o desenho final — vocês é que são donos do schema):

```sql
create table public.content_context (
  key         text primary key default 'instagram',
  doc         jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  text
);
```

Uma linha só (`key = 'instagram'`), o JSON abaixo dentro de `doc`.

**Por que aqui e não um arquivo solto:** os dois projetos já alcançam esse banco. Um arquivo no GitHub exigiria commit dos dois lados e dessincroniza. Um endpoint novo exigiria vocês manterem uma rota. A tabela não exige nada além de um `update` quando o produto mudar.

**Sobre permissão:** o sistema de conteúdo precisa apenas de **leitura** dessa linha. Não precisa e não quer escrever. Se preferirem manter RLS fechado e liberar leitura só pra essa tabela, ótimo — é o desejável. Ela não deve conter nada sensível: é descrição de produto, não dado de usuário.

**Perguntas:**
20. Topam esse desenho? Se preferirem outro (Storage, endpoint, view), qual?
21. Quem/o que faz o `update` — vocês manualmente, o chat do app, ou um passo do deploy?

### O campo que faz o conteúdo reagir a lançamentos

Dentro do `doc` existe um array `novidades`. É por ele que o Instagram fica sabendo que tem algo novo pra anunciar, sem ninguém avisar ninguém:

```json
"novidades": [
  {
    "data": "2026-08-25",
    "tipo": "lancamento",
    "titulo": "Nova plataforma no ar",
    "detalhe": "O que mudou, na linguagem de vocês",
    "pode_anunciar": true,
    "ativo": true
  }
]
```

Quando vocês adicionarem cardápios curados novos, lançarem versão, ou mudarem algo que valha post — acrescentem um item aqui com `ativo: true`. O conteúdo lê e produz material daquilo. Quando não fizer mais sentido anunciar, `ativo: false`.

`pode_anunciar: false` serve pra registrar algo que mudou mas ainda é interno.

---

## Template JSON para preencher e gravar

```json
{
  "_atualizado": "",
  "_por": "",

  "app": {
    "nome": "",
    "url": "",
    "onde_acessa": "",
    "proposta_uma_frase": ""
  },
  "publico": {
    "usuario_real": "",
    "problema_que_resolve": "",
    "problema_que_NAO_resolve": ""
  },
  "objetivos_suportados": {
    "_pergunta": "Que objetivos/perfis de cardápio o app realmente oferece? (o conteúdo hoje CHUTA: ganho muscular, economizar, vegetariano — corrijam)",
    "lista_real": []
  },
  "features": [
    { "nome": "", "o_que_faz": "", "mostravel_no_conteudo": null, "como": "" }
  ],
  "saida_para_usuario": {
    "o_que_recebe": "",
    "formato": "",
    "vira_imagem_de_post": null
  },
  "negocio": {
    "modelo": "",
    "objetivo_de_conversao_do_instagram": "",
    "cta_oficial": ""
  },
  "posicionamento": {
    "o_que_mudou_na_transicao": "",
    "multi_chef": {
      "procede": null,
      "marca_e_plataforma_ou_luiza_segue_rosto": "",
      "instagram_voz_da_luiza_ou_da_plataforma": ""
    },
    "publico_vs_interno": ""
  },
  "comunicacao": {
    "percepcao_desejada": "",
    "pode_dizer": [],
    "nao_pode_dizer": [],
    "identidade_visual_disponivel": null,
    "onde_ficam_os_assets": "",
    "o_que_o_conteudo_comunica_errado_hoje": ""
  },
  "novidades": [
    {
      "data": "",
      "tipo": "",
      "titulo": "",
      "detalhe": "",
      "pode_anunciar": null,
      "ativo": null
    }
  ],
  "integracao": {
    "aceita_tabela_content_context": null,
    "desenho_alternativo": "",
    "quem_atualiza": ""
  }
}
```

Se a tabela ainda não existir quando vocês responderem, tudo bem: devolvam o JSON preenchido em texto mesmo, e a gente combina a criação depois.

---

# ADENDO (26/ago) — Identidade visual: pedido de referência

> **Contexto do pedido:** o app ganhou identidade nova na transição pra Tem na Semana,
> completamente diferente da antiga. O conteúdo do Instagram ainda roda com a estética
> da era anterior (terracota, Playfair, "caderno de chef"). Pela regra do `_contrato`,
> **como o post fica é decisão nossa** — isso não muda. Mas a gente decide melhor
> **sabendo como o app se veste**: o mínimo é não parecer que post e app são de marcas
> diferentes quando a pessoa clica.
>
> Portanto: nada aqui vira regra de design automática. É **referência**. Quanto mais
> completo, melhor.

**Pedido:** acrescentem um bloco `identidade_visual` ao `fixo` do Contexto
(`contexto_do_conteudo`), respondendo o que der. Sugestão de formato no fim.

### Perguntas

**Tipografia**
1. Quais fontes o app usa hoje (títulos, texto corrido, botões/UI)? Nomes exatos e pesos.
2. São fontes livres (Google Fonts)? Se não, existe alternativa aprovada?
3. Alguma regra de uso (título sempre em caixa alta? itálico? tracking?)

**Cor**
4. Paleta completa com hex: primárias, secundárias, fundos, texto.
5. Qual é A cor da marca — a que não pode faltar?
6. Cores que a identidade antiga usava e a nova **abandonou** (pra gente parar de usar).
7. O app é claro, escuro, ou os dois?

**Logo e marca**
8. Logo novo: onde baixar (SVG/PNG em fundo transparente)?
9. Variações (símbolo sozinho, horizontal, monocromático)? Regras de área de respiro?
10. Existe wordmark/lettering do "Tem na Semana"? Como se escreve a marca (Tem na Semana, TEM NA SEMANA, tem na semana)?

**Estilo visual geral**
11. Cantos arredondados ou retos? Sombras? Bordas? Qual o "jeito" dos componentes?
12. Fotografia/ilustração: o app usa fotos de comida? Em que estilo? Usa ilustração ou ícones — quais?
13. Existe um mood (aconchegante, clean, vibrante...)? Em uma frase: como a identidade nova
    é DIFERENTE da antiga?

**Assets e referência viva**
14. Tem brand book, Figma, ou página de styleguide? Link.
15. Screenshots atuais das telas principais (home, cardápio, lista) — onde ficam de forma estável?
16. Quando a identidade mudar de novo, esse bloco será atualizado por quem?

### Formato sugerido pro bloco

```json
"identidade_visual": {
  "tipografia": { "titulos": "", "texto": "", "ui": "", "regras": "" },
  "cores": { "principal": "#", "paleta": {}, "fundos": {}, "abandonadas": [] },
  "logo": { "url_download": "", "variacoes": "", "como_escrever_a_marca": "" },
  "estilo": { "componentes": "", "fotografia": "", "mood_em_uma_frase": "" },
  "referencias": { "styleguide_url": "", "screenshots_url": "" }
}
```

Quando entrar no Contexto, o sync do Instagram puxa sozinho — não precisa avisar.
