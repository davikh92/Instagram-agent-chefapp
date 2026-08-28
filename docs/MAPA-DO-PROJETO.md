# Mapa do Projeto — onde cada coisa mora

> Escrito em 28/08/2026, a pedido do Davi, **antes** de construir a automação do
> Pinterest — porque organizar depois de construir custa o dobro e quebra o que
> já roda. Este arquivo é o contrato: toda sessão futura decide "onde põe isso?"
> olhando aqui, não improvisando.

---

## O contrato: um diretório por plataforma

Toda plataforma nova nasce com seus quatro cantos, e **nunca** escreve fora deles:

```
scripts/<plataforma>/     código daquela plataforma
data/<plataforma>/        filas, estado e registros daquela plataforma
templates/<plataforma>/   tipografia/HTML daquela plataforma
assets/<plataforma>/      material exportado daquela plataforma
```

O que é de todos fica em um lugar só:

```
scripts/lib/              compartilhado de verdade (logger, cloudinary-storage)
scripts/sync-contexto.js  a verdade do produto — serve a todas as plataformas
data/product-context.json cache do Contexto (nunca editar à mão)
brand.json                identidade de execução — vale pra todas as plataformas
docs/                     decisões e planos
arquivo/                  material morto (só consulta histórica)
```

**Regra de bolso:** mexendo no TikTok, você só toca `*/tiktok/`. Mexendo no
Pinterest, só `*/pinterest/`. Se uma mudança precisa tocar o diretório de outra
plataforma, ou ela pertence ao `lib/`, ou está no lugar errado.

## Endereços já reservados

| Plataforma | Status | Endereço |
|---|---|---|
| Pinterest | Fase 1 em andamento | `scripts/pinterest/` · `data/pinterest/` · `templates/pinterest/` · `assets/pinterest/` |
| TikTok | futuro (pós item C) | `scripts/tiktok/` · `data/tiktok/` … |
| YouTube Shorts | futuro | `scripts/youtube/` · `data/youtube/` … |
| Facebook Reels | futuro (de carona) | `scripts/facebook/` … |

---

## O Instagram: o legado que roda na raiz

O Instagram nasceu quando era a única plataforma, então vive **solto na raiz**:

- `scripts/*.js` (12 scripts: generate-omni, publish, responder-comentarios…)
- `data/*.json` + `data/ciclo-01/` (filas e programação do Ciclo 01)
- `templates/*.html` (story-overlay, post-overlay, story-cardapio)
- `ready-to-post/` (saída datada + `published.json`)

**Por que não foi movido junto com esta organização:** os 9 workflows do GitHub
Actions apontam pros caminhos exatos desses scripts, e a estreia do Ciclo 01 é
em 2 dias (30/08 → 01/09). Mover a máquina viva às vésperas do lançamento é o
único jeito de a organização causar o problema que ela existe pra evitar.

### Migração agendada — primeira semana de setembro (~04–05/09)

Quando a estreia estiver estável, numa janela calma:

1. `git mv` dos 12 scripts → `scripts/instagram/` (ajustando `__dirname` e requires)
2. Filas → `data/instagram/` (`veo-queue`, `story-queue`, `image-queue`, `dm-enviadas`, `ciclo-01/`)
3. Templates → `templates/instagram/`
4. Editar os 9 workflows **no mesmo commit**: `generate-veo(-retry)`,
   `generate-image(-retry)`, `generate-story`, `publish-daily`, `publish-stories`,
   `refresh-token`, `responder-comentarios`
5. Verificar com `workflow_dispatch` (dry-run do responder-comentarios + um
   publish manual) antes de deixar o cron encontrar os caminhos novos
6. Atualizar CLAUDE.md e os docs que citam caminhos

**O que NÃO se move nem depois:**

- `ready-to-post/` — fica na raiz. O histórico de `published.json` está acoplado
  a esses caminhos e o dashboard lê dali. Renomear quebraria histórico por estética.
  Documentado como "saída do Instagram".
- `dashboard.html` + `index.html` — raiz, porque o GitHub Pages serve dali.
- `brand.json` — raiz, porque não é do Instagram: é da marca.

---

## O resto da raiz, explicado

| Item | O que é |
|---|---|
| `arquivo/` | Material morto (era carrossel, planos antigos). Não usar como referência. |
| `videos-para-mostrar/` | Cópias locais pra apresentar (gitignored, índice versionado). |
| `tests/` | Saída de testes de modelo (gitignored, fica no Cloudinary). |
| `logs/` | Runtime (gitignored). |
| `dashboard.html` / `index.html` | GitHub Pages — gerados por `build-dashboard.js`. |

Diretórios vazios `agents/` e `prompts/` foram removidos em 28/08 (as versões
com conteúdo vivem em `arquivo/`).

---

## Regras que acompanham o contrato

1. **Plataforma nova não ganha automação antes de provar que merece** — primeiro
   o teste manual, depois o código (`docs/PLANO-MULTIPLATAFORMA.md`).
2. **Nenhuma URL escrita à mão** em nenhum namespace — tudo deriva de
   `fixo.app.url_canonica` / Contexto. Cada plataforma tem seu `utm_source` fixo:
   `instagram` · `pinterest` · `youtube` · `tiktok` · `facebook`.
3. **Material não se duplica entre plataformas** — vídeo e capa moram no
   Cloudinary/`ready-to-post` e as plataformas *referenciam*. `assets/<p>/` é só
   pro que foi recomposto (ex.: pins 2:3).
4. **Segredos por plataforma** seguem o padrão dos atuais: variáveis no GitHub
   Secrets (`PINTEREST_*`, `TIKTOK_*`…), lidas de `.env` localmente, nunca
   commitadas.
