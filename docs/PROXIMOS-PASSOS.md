# 🚀 Próximos Passos — Veo 3.1 Implementation

**Data:** 27 de maio, 2026  
**Status:** 4 arquivos criados, pronto para implementação

---

## Arquivos Criados

✅ `docs/veo-prompt-guide.md` — Guia completo de prompts Veo  
✅ `scripts/generate-veo.js` — Script de geração automática  
✅ `data/veo-queue.json` — Fila de 3 reels (Food Animated)  
✅ `docs/veo-implementation.md` — Plano de implementação (checklist)  
✅ `.env.example` — Template com VEO_API_KEY

---

## Ordem de Execução

### 1️⃣ Setup (30 min)

```bash
# 1. Obter API Key
# Acesse https://veo.ai → Sign up → Copie SK_...

# 2. Adicionar ao .env
echo "VEO_API_KEY=sk_sua_chave" >> .env

# 3. Testar conexão
node scripts/generate-veo.js --help
# Deve executar sem erro
```

### 2️⃣ Teste Manual (45 min)

```bash
# Gerar um reel de teste (o mais rápido)
node scripts/generate-veo.js --folder ready-to-post/2026-05/2026-05-15/reel-food-01

# Aguardar 1-2 minutos...
# ✓ Arquivo criado em: ready-to-post/2026-05/2026-05-15/reel-food-01/reel.mp4

# Avaliar qualidade em player local
# → Photorealism ok? Áudio ok? Continuar com Veo?
```

### 3️⃣ Gerar Todos os 3 Reels (30 min)

```bash
# Se passou no teste:
node scripts/generate-veo.js --all

# Aguardar 3-5 minutos total
# ✓ Todos os 3 reels em ready-to-post/
```

### 4️⃣ Publicar (automático ou manual)

```bash
# Opção A: Agora mesmo (manual)
node scripts/publish.js --today

# Opção B: Deixar scheduled task fazer (automático em horário agendado)
# Mon 18h, Wed 18h, Thu 12h, Fri 12h, Sun 10h

# Scheduled tasks já estão configuradas com --today flag
```

---

## Referências Rápidas

| Necessidade | Arquivo |
|---|---|
| Como escrever prompts Veo | `docs/veo-prompt-guide.md` |
| Checklist completo | `docs/veo-implementation.md` |
| Fila de reels atual | `data/veo-queue.json` |
| Script de geração | `scripts/generate-veo.js` |
| Config VEO_API_KEY | `.env` |
| Integração com fluxo | `CLAUDE.md` |

---

## Próxima Quinzena

Quando chegar o próximo ciclo (1º ou 15º de junho):

```bash
# 1. Agente escreve novos prompts Veo (seguindo veo-prompt-guide.md)
# 2. Salva em data/veo-queue.json
# 3. Roda: node scripts/generate-veo.js --all
# 4. Publica: automático pelos scheduled tasks
```

---

## Dúvidas?

1. **Como escrever um bom prompt?** → Leia `docs/veo-prompt-guide.md` (seção Template)
2. **Deu erro na geração?** → Veja `docs/veo-implementation.md` (seção Problemas)
3. **Qual é o custo?** → ~$0.05/vídeo = $0.15 por 3 reels = $0.30/mês
4. **Quando publica?** → Horários agendados OR você roda `publish.js --today` manualmente

---

## Começa agora!

```bash
# Passo 1: Obter API Key em veo.ai
# Passo 2: Salvar em .env (VEO_API_KEY=sk_...)
# Passo 3: Testar: node scripts/generate-veo.js --help
# Passo 4: Gerar teste: node scripts/generate-veo.js --folder ...

# Em ~2 min terá seu primeiro reel gerado com Veo 3.1!
```

_Plano criado: 27 de maio, 2026_
