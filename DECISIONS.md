# Decisions

Newest first. Long-form reasoning lives in `docs/` (ROTEIRO, PLANO-MASTER, MAPA-DO-PROJETO, CUSTOS, AUTOMACAO-DM, APRENDIZADOS-ARQUITETURA).

- **2026-09-01 · Comment-to-DM stays on ManyChat free plan until Meta App Review.** The API only returns comments from accounts with a role in the app without Advanced Access; the code path (`responder-comentarios.js`) is ready. No paid tool without revenue.
- **2026-08-28 · Instagram keeps the root namespace, permanently.** The pipeline runs by cron 7 days a week; there is no quiet window to migrate 9 workflows and 12 scripts for symmetry. New platforms get `scripts/<p>`, `data/<p>`, `templates/<p>`, `assets/<p>`.
- **2026-08-28 · Domain migrated to temnasemana.com.br with zero code changes.** Every URL derives from the product context pulled from the app's Supabase.
- **2026-08-26 · Cycle 01 generated in full before the start.** 65 reels in three days: known cost on day zero, execution becomes supervision. Review before generation after two re-works were billed at full price.
- **2026-08 · Omni Flash as default model, Veo 3.1 Lite as cost lever.** Decided on consistency of food close-ups, with invoice-level cost tracking per SKU.
- **2026-08 · Chef signs the menus, the product is the protagonist.** A person-brand is hostage to the person; the product must survive new chefs. Two voices: platform organizes, chef cooks.
- **2026-05 · Veo 3.1 Lite via Google AI Studio over paid video APIs.** `predictLongRunning` + polling; ~42 s per 8 s video; photorealism good enough for food.
- **2026-05 · Cloudinary as the public URL layer.** Instagram Graph API needs a public URL; videos never enter the repository.
