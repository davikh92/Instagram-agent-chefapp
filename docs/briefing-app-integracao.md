# Pedido de contexto do produto — para o chat do aplicativo

**De:** sistema automatizado de conteúdo do Instagram (produz Reels + Stories sobre o app)
**Para:** o time/chat que desenvolve o aplicativo
**Objetivo:** o conteúdo do Instagram precisa refletir o produto REAL. Hoje ele funciona com suposições. Este documento pede a verdade.

---

## Como responder

Responda em português, do jeito que o produto realmente é — **não tente adivinhar o que o Instagram quer ouvir.** A regra desta integração é: **o produto orienta o conteúdo, nunca o contrário.** Se o conteúdo hoje comunica algo que não bate com o produto, é o conteúdo que está errado.

Quem pergunta (o sistema de conteúdo) não vai te contar as decisões de marca, tom ou estratégia dele — de propósito, pra não enviesar sua resposta. Queremos suas respostas cruas.

Ao final, preencham o **template JSON** (última seção). Ele volta direto pro sistema de conteúdo. Se algo não se aplica, escrevam `null` ou expliquem.

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

### E. O que está mudando
12. Há uma atualização grande prevista (me falaram de ~20/07). O que muda, exatamente?
13. Ouvi que a plataforma deixaria de ser centrada só na chef Luiza e passaria a ter **vários chefs**. Isso procede? Se sim:
    - a marca vira uma plataforma multi-chef, ou a Luiza segue sendo o rosto principal?
    - o Instagram deve continuar como "voz da Luiza", ou virar voz da plataforma?
    - **(esta resposta redefine o posicionamento inteiro do conteúdo — seja específico.)**
14. Datas, fases, o que é público e o que ainda é interno.

### F. Como o produto quer ser comunicado
> Aqui é onde vocês **devem** influenciar o conteúdo.
15. Que percepção o produto quer gerar (ex: confiável, acessível, premium, prático...)?
16. Que palavras/promessas o conteúdo **pode** usar e quais **não pode** (limites legais, claims de saúde/nutrição, etc.)?
17. Tem identidade visual/marca definida (logo, cores, tipografia)? Podem compartilhar?
18. Algo que o conteúdo atual provavelmente comunica errado e vocês querem corrigir?

### G. Integração técnica (futuro)
19. Dá pra o app expor um **endpoint** com esse contexto (um JSON numa URL) pro sistema de conteúdo buscar sozinho quando algo mudar? Se sim, qual seria a URL/forma.
20. Que assets vocês conseguem disponibilizar de forma estável (screenshots de tela, logo, paleta)? Onde?

---

## Template JSON para preencher e devolver

```json
{
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
  "mudanca_grande": {
    "data": "",
    "o_que_muda": "",
    "multi_chef": {
      "procede": null,
      "marca_vira_plataforma_ou_luiza_segue_rosto": "",
      "instagram_voz_da_luiza_ou_da_plataforma": ""
    },
    "o_que_e_publico_vs_interno": ""
  },
  "comunicacao": {
    "percepcao_desejada": "",
    "pode_dizer": [],
    "nao_pode_dizer": [],
    "identidade_visual_disponivel": null,
    "o_que_o_conteudo_comunica_errado_hoje": ""
  },
  "integracao_tecnica": {
    "pode_expor_endpoint": null,
    "url_endpoint": "",
    "assets_disponiveis": ""
  }
}
```
