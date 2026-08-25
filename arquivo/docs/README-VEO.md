# 🎬 Veo 3.1 Lite — Food Animated Reels

**Status:** ✅ Implementação Completa Criada  
**Data:** 27 de maio, 2026  
**Custo:** $0.05/vídeo (~$0.30/mês)  
**Automação:** 100% (text-to-video com áudio nativo)

---

## 📌 O que foi criado

| Arquivo | Propósito |
|---|---|
| **`scripts/generate-veo.js`** | Script que chama Veo API e gera MP4s |
| **`data/veo-queue.json`** | Fila com 3 reels Food Animated prontos |
| **`docs/veo-prompt-guide.md`** | Guia: como escrever prompts Veo (template + exemplos) |
| **`docs/veo-implementation.md`** | Checklist completo de implementação (5 fases) |
| **`docs/PROXIMOS-PASSOS.md`** | Guia rápido: comece por aqui |
| **`.env`** | Adicionado: `VEO_API_KEY` (substitua com sua chave) |
| **`CLAUDE.md`** | Atualizado com referências a Veo |

---

## 🚀 Começo rápido (3 passos)

### 1. Obter API Key

```
Acesse: https://veo.ai
Sign up gratuito
Copie sua chave (formato: sk_...)
```

### 2. Salvar no .env

```bash
# .env já tem placeholder, substitua:
VEO_API_KEY=sk_sua_chave_real_aqui
```

### 3. Gerar primeiro reel

```bash
node scripts/generate-veo.js --all

# Resultado esperado em ~2-5 min:
# ✓ ready-to-post/2026-05/2026-05-15/reel-food-01/reel.mp4 (com áudio)
# ✓ ready-to-post/2026-05/2026-05-22/reel-food-02/reel.mp4 (com áudio)
# ✓ ready-to-post/2026-05/2026-05-28/reel-food-03/reel.mp4 (com áudio)
```

---

## 📖 Referências por Caso de Uso

**"Como escrevo um novo reel Veo?"**  
→ Leia: `docs/veo-prompt-guide.md` (seção "Template padrão")

**"Quero seguir o checklist completo"**  
→ Leia: `docs/veo-implementation.md` (5 fases com tarefas)

**"Só quero começar agora"**  
→ Leia: `docs/PROXIMOS-PASSOS.md` (4 passos diretos)

**"Deu erro na geração"**  
→ Leia: `docs/veo-implementation.md` (seção "Se der problema")

---

## ⚙️ Como integrar no fluxo

### Opção A: Execução Manual

```bash
# Quinzenalmente (1º ou 15º):
1. node scripts/screenshot.js --all         # Gera posts (PNG)
2. node scripts/generate-veo.js --all       # Gera reels (MP4)
3. node scripts/publish.js --today          # Publica (opcional, auto funciona)

# Tempo total: ~30 min
```

### Opção B: Automático (Scheduled Task)

Já tem scheduled tasks configuradas que publicam automaticamente nos horários:
- **Segunda 18h** — publica post/reel do dia
- **Quarta 18h** — publica post/reel do dia
- **Quinta 12h** — publica post/reel do dia
- **Sexta 12h** — publica post/reel do dia
- **Domingo 10h** — publica post/reel do dia

Basta rodar `node scripts/generate-veo.js --all` em qualquer horário no dia anterior ou no mesmo dia até 2h antes do agendado.

---

## 📊 Comparativo: Veo vs Alternativas

| Aspecto | Veo 3.1 Lite | Kling 3.0 | Midjourney+Kling |
|---|---|---|---|
| **Tipo** | Text-to-video | Image-to-video | Image→Animate |
| **Qualidade comida** | Photorealism | Cinematic | Cinematic |
| **Áudio nativo** | ✅ Sim | ✅ Sim (Pro) | ❌ Manual |
| **Custo** | $0.05/vid | $0.07-0.12/vid | $10-30/mês |
| **Automação** | ✅ Total | ✅ Total | ❌ Manual |
| **Fail rate** | ~5% | ~40-60% | Baixo |
| **Tempo** | 1-2 min/vid | 2-3 min/vid | 15+ min manual |

**Recomendação:** Veo é o melhor para **automação + custo** (ideal para agora)

---

## 💬 Perguntas Frequentes

**P: Preciso de Midjourney ainda?**  
R: Não para Food Animated. Veo faz tudo. Use Midjourney só se quiser cinematic extremo (caro e lento).

**P: Áudio sai automático?**  
R: Sim! Veo inclui áudio nativo de fundo. Se quiser adicionar voiceover, edite depois em CapCut.

**P: Posso usar para outros reels (não Food)?**  
R: Sim! Use `docs/veo-prompt-guide.md` como template. Escreva novo prompt, adicione a `veo-queue.json`.

**P: Quanto custa por mês?**  
R: ~$0.30/mês (3 reels × $0.05 cada). Praticamente grátis.

**P: Falhou na geração, o que faço?**  
R: Script detecta `published.json` e pula reels já feitos. Rode novamente: `node scripts/generate-veo.js --all`

---

## 🎯 Próximos Passos

```
HOJE:
1. Obter API Key (5 min)
2. Adicionar a .env (1 min)
3. Rodar teste: node scripts/generate-veo.js --all (5 min)
4. Avaliar qualidade em player local (5 min)

SE OK:
5. Publicar: node scripts/publish.js --today (automático)

PRÓXIMAS QUINZENAS:
1. Agente Designer escreve prompts Veo (seguindo guia)
2. Salva em veo-queue.json
3. Roda: node scripts/generate-veo.js --all
4. Publica automaticamente nos horários agendados
```

---

## 📚 Arquivos de Documentação

- **`docs/veo-prompt-guide.md`** — Guia técnico completo (anatomia do prompt, exemplos, troubleshooting)
- **`docs/veo-implementation.md`** — Plano com checklist (5 fases, testes, integração)
- **`docs/PROXIMOS-PASSOS.md`** — Guia rápido (4 passos diretos)
- **`README-VEO.md`** — Este arquivo (overview)

---

## 🔗 Referências Externas

- **Veo Official:** https://veo.ai
- **API Documentation:** https://veo.ai/docs
- **Community Feedback:** [Veo vs Kling 2026](https://www.veo3ai.io/blog/kling-3-0-vs-veo-3-1-2026)

---

## ✅ Checklist Final

- [ ] API Key obtida em veo.ai
- [ ] `.env` atualizado com `VEO_API_KEY`
- [ ] `node scripts/generate-veo.js --help` executa sem erro
- [ ] Primeiro reel gerado e testado
- [ ] Qualidade aceitável (photorealism + áudio ok)
- [ ] Todos os 3 reels gerados
- [ ] Publicados (automático ou manual)
- [ ] Próxima quinzena agendada

---

**Criado em:** 27 de maio, 2026  
**Automação de:** Luiza na Cozinha · Instagram Food Content

_Pronto para começar? Leia `docs/PROXIMOS-PASSOS.md` para os 4 primeiros passos._
