# content-machine

**An automated content pipeline that generates, renders and publishes short video for Instagram, Stories and Pinterest, with no manual step between idea and post.**

Built for [Tem na Semana](https://temnasemana.com.br), a meal-planning app. In production since May 2026. See the result on Instagram: [@temnasemana](https://www.instagram.com/temnasemana/).

## The problem

A consumer app needed daily short video to bring home cooks to the product. No content team, no creator budget, nobody to press "publish". Every manual attempt stopped within weeks. The constraints I set: no human step between generation and publish; cost per video known before the cycle starts; copy can never contradict the product; each platform isolated so adding one never breaks another.

## Architecture

```
            ┌────────────────────┐
            │ Supabase (app) RPC │  product truth: name, URL, menus, allowed claims
            └─────────┬──────────┘
                      │ scripts/sync-contexto.js (before every run)
                      ▼
  cycle plan ──► prompts ──► generate-omni.js / generate-veo.js ──► add-voice.js ──► HTML overlay (Puppeteer)
   (JSON)                        Gemini video API (retry workflow)                      │
                                                                                        ▼
                                                                            ffmpeg assemble ──► Cloudinary (public URL)
                                                                                                       │
                 dashboard (GitHub Pages) ◄── fetch-metrics.js ◄── Instagram Graph API ◄──────── publish.js
                                                                   Pinterest API ◄────────── scripts/pinterest/publicar.js
                                                                   responder-comentarios.js (keyword → DM)
```

Scheduling: 10 GitHub Actions workflows (`generate-image`, `generate-veo`, their `-retry` twins, `generate-story`, `publish-daily`, `publish-stories`, `pinterest`, `responder-comentarios`, `refresh-token`). State lives in JSON files committed to the repo, so the scheduler is the repo and every run is in the git history.

## Repository layout

```
scripts/            Instagram pipeline (root namespace, see DECISIONS.md)
scripts/lib/        shared: logger, cloudinary-storage
scripts/pinterest/  Pinterest: oauth, boards, pins, publish
templates/          HTML overlays rendered with Puppeteer
data/               queues, cycle plans, product-context.json (cache, never edited by hand)
ready-to-post/      dated output + published.json (publish ledger; videos stay on Cloudinary)
docs/               plan, cost tracking, DM automation notes, project map
.github/workflows/  the 10 workflows
```

## Run it

```bash
cp .env.example .env            # see the file for every variable
npm install
node scripts/sync-contexto.js   # pull product truth
node scripts/generate-omni.js --limit 1
node scripts/publish.js --today --dry-run
```

`--dry-run` renders and uploads but does not publish. The real schedule runs from the workflows; see `.github/workflows/publish-daily.yml`.

## Decisions and trade-offs

- **Product facts come from the app's database, not from prompts.** A domain migration mid-cycle broke nothing because no URL was ever hand-written.
- **Omni Flash over Veo as default.** Veo Lite is roughly half the price; Omni won on consistency for food close-ups. Documented in `docs/CUSTOS.md` with invoice numbers, not estimates.
- **Count generations, not posts.** Re-work is billed at full price; a review step before generation is the cheapest optimization. 2 of 65 videos in cycle 01 were regenerated.
- **One directory per platform.** The Instagram pipeline stays in the root (it runs 7 days a week; there is no quiet window to migrate it). New platforms never write outside their namespace (`docs/MAPA-DO-PROJETO.md`).
- **Comment-to-DM:** reading comments from non-tester accounts needs Meta Advanced Access. Until App Review clears, keyword DMs run through ManyChat's free plan, and the code path is ready. The diagnosis is in `docs/AUTOMACAO-DM.md`.

## Results (cycle 01, Sep–Nov 2026)

| | |
|---|---|
| Videos generated | 65 in 3 days |
| Cadence | 3 reels/week + 3 stories/day, fully automated |
| Cost per video (invoice) | R$ 5.90 (~US$ 1.00) |
| Cost per month of content | ~R$ 132 |
| Reach from non-followers | ~80% |

What did not work: median retention stayed at 3.2 s against a 5 s target, and the bio link sent little traffic to the app. The next cycle tests pattern interrupts, close-up action, and a value exchange in every post. Details in `docs/PLANO-MASTER.md` and `docs/SUBPLANO-01.md`.

## What I'd do differently

Assert outcomes, not actions, in every workflow (post exists, not "request sent"). Add an evaluation set for generated videos before scaling. Move the publish ledger from JSON to a small Postgres table once volume justifies it.

## Security

No secrets in the repository. All keys come from environment variables or GitHub Secrets; `.env.example` lists them. Videos are not versioned (they live on Cloudinary); `ready-to-post/` keeps captions and the ledger.
