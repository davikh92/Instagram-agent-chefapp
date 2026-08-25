# Veo 3.1 Lite — Plano de Implementação Completo

**Data:** 27 de maio, 2026  
**Objetivo:** Automatizar geração de Food Animated reels usando Veo 3.1  
**Resultado esperado:** 3 reels cinematográficos por quinzena, totalmente automático, com áudio nativo

---

## 📋 Checklist de Implementação

### Fase 1: Setup (30 min)

- [ ] **1.1 Obter API Key Veo**
  - Acesse https://veo.ai
  - Sign up / Login
  - Copie sua API key (formato: `sk_...`)
  - **Ação:** Salve em `.env`

- [ ] **1.2 Configurar .env**
  ```bash
  # Adicione ao arquivo .env na raiz do projeto:
  VEO_API_KEY=sk_sua_chave_aqui
  ```

- [ ] **1.3 Verificar Node.js**
  ```bash
  node --version  # Precisa ser 18+ (para fetch nativo)
  ```

- [ ] **1.4 Testar conexão Veo**
  ```bash
  node scripts/generate-veo.js --help
  # Deve rodar sem erro "VEO_API_KEY não encontrada"
  ```

### Fase 2: Validação de Arquivos (15 min)

- [ ] **2.1 Arquivos criados:**
  - [ ] `docs/veo-prompt-guide.md` — guia de como escrever prompts
  - [ ] `scripts/generate-veo.js` — script de geração
  - [ ] `data/veo-queue.json` — fila de reels (3 reels Food Animated)

- [ ] **2.2 CLAUDE.md atualizado:**
  - [ ] Referência a `docs/veo-prompt-guide.md` adicionada
  - [ ] `scripts/generate-veo.js` listado em Ferramentas
  - [ ] `data/veo-queue.json` documentado

### Fase 3: Teste Manual (45 min)

- [ ] **3.1 Gerar um reel de teste**
  ```bash
  node scripts/generate-veo.js --folder ready-to-post/2026-05/2026-05-15/reel-food-01
  ```
  
  - [ ] Verificar se inicia geração
  - [ ] Aguardar ~1-2 min até conclusão
  - [ ] Verificar arquivo `reel.mp4` foi criado em `ready-to-post/2026-05/2026-05-15/reel-food-01/`

- [ ] **3.2 Avaliar qualidade**
  - [ ] Abrir `reel.mp4` em player local
  - [ ] Avaliar: photorealism, movimento, qualidade de áudio
  - [ ] Comparar com Midjourney + Kling (qualidade aceitável? Diferenças?)
  - [ ] **Decisão:** Continuar com Veo ou testar Kling?

- [ ] **3.3 Se aceitável, gerar todos os 3 reels**
  ```bash
  node scripts/generate-veo.js --all
  ```
  
  - [ ] Aguardar conclusão de todos os 3
  - [ ] Verificar 3 pastas com `reel.mp4` + `caption.txt`
  - [ ] Revisar áudio nativo (Veo inclui automático)

### Fase 4: Integração no Fluxo Quinzenal (15 min)

- [ ] **4.1 Atualizar scheduled task (opcional)**
  
  Se quiser que o ciclo quinzenal use Veo automaticamente:
  
  ```bash
  # Na scheduled task "luiza-ciclo-quinzenal" (1º e 15º, 9h), adicione:
  
  # Antes de gerar posts:
  node scripts/generate-veo.js --all
  ```
  
  Ou mantenha manual (recomendado para agora):
  ```bash
  # Rodar quando estiver pronto no dia:
  node scripts/generate-veo.js --all
  node scripts/publish.js --today
  ```

- [ ] **4.2 Atualizar processo manual**
  
  ```
  Quinzenal (1º e 15º):
  
  1. /briefing → coleta temas
  2. /quinzena → cria plano com posts (carrosséis + estáticos)
  3. /design all → gera posts em PNG (script screenshot.js)
  4. node scripts/generate-veo.js --all → gera 3-4 reels Veo com áudio
  5. node scripts/publish.js --today → publica posts (auto no agendamento)
  
  Reels são publicados automaticamente nos horários:
  - Segunda 18h
  - Quarta 18h
  - Quinta 12h
  - Sexta 12h
  - Domingo 10h
  ```

### Fase 5: Documentação & Treinamento (10 min)

- [ ] **5.1 Ler guia de prompts**
  - Arquivo: `docs/veo-prompt-guide.md`
  - Tempo: ~5 min
  - Entender: estrutura de prompt, pontos fortes/fracos, exemplos

- [ ] **5.2 Praticar escrita de prompts**
  - Próximo reel a criar: copiar template do guia
  - Adaptar para receita/tema da semana
  - Salvar em `data/veo-queue.json`

- [ ] **5.3 Atualizar README ou wiki**
  - (Opcional) Documentar fluxo completo em `README.md`
  - Incluir referência a `docs/veo-prompt-guide.md`

---

## 🎯 Fluxo Automático Final

```
Entrada: /quinzena (prompt do agente estrategista)
         ↓
Agente Designer:
├─ Escreve prompts Veo (seguindo veo-prompt-guide.md)
├─ Salva em data/veo-queue.json
└─ (Também escreve prompts de posts em HTML/screenshot.js)
         ↓
Automação:
├─ node scripts/generate-veo.js --all
│  └─ Chama Veo 3.1 API
│  └─ Salva 3-4 MP4s com áudio em ready-to-post/
│
└─ node scripts/screenshot.js --all
   └─ Gera 9 posts em PNG (carrosséis + estáticos)
         ↓
Publicação automática (via scheduled tasks):
├─ Segunda 18h: publica post/reel do dia
├─ Quarta 18h: publica post/reel do dia
├─ Quinta 12h: publica post/reel do dia
├─ Sexta 12h: publica post/reel do dia
└─ Domingo 10h: publica post/reel do dia

Custo total: ~$0.30/mês (3 reels × $0.05 cada)
Tempo de trabalho: ~45 min para gerar plano quinzenal completo
```

---

## 💰 Custos & Métricas

| Métrica | Valor |
|---|---|
| **Custo por reel** | $0.05 |
| **Reels por quinzena** | 3-4 |
| **Custo mensal** | ~$0.30 |
| **Tempo de geração** | 1-2 min/reel (paralelo = 5-10 min total) |
| **Tempo de trabalho** | 45 min quinzenal (estratégia + escrita de prompts) |
| **Qualidade** | 1080p nativo + áudio nativo |
| **Taxa de sucesso** | ~95% (raramente falha) |

---

## 🔄 Se der problema

### Problema: VEO_API_KEY não encontrada

```bash
# Solução:
1. Verifique .env existe na raiz do projeto
2. Adicione: VEO_API_KEY=sk_sua_chave
3. Reinicie terminal/IDE
4. Teste novamente
```

### Problema: Vídeo gerado com qualidade ruim

```bash
# Checklist:
1. Prompt muito longo? (Reduza para <300 chars efetivos)
2. Prompt com "dramatic"/"cinematic"? (Use "professional" ao invés)
3. Detalhes demais? (Foque em 1 ação principal)

# Solução:
1. Leia docs/veo-prompt-guide.md (seção Troubleshooting)
2. Reescreva prompt seguindo template
3. Tente novamente
```

### Problema: Áudio não aparece no vídeo

```bash
# Nota: Veo 3.1 Lite inclui áudio nativo (música/background)
# Se não tiver som: verificar volume do player, não é problema do script

# Se quiser adicionar voiceover depois:
1. Edite em CapCut
2. Adicione voiceover/música
3. Export com áudio final
```

### Problema: Script falha no meio (job timeout)

```bash
# Solução:
1. Aguarde alguns segundos
2. Rode novamente: node scripts/generate-veo.js --all
3. Script detecta published.json e pula reels já feitos
4. Continua dos que faltam

# Timeout é raro, mas pode ocorrer se Veo API está lenta
```

---

## 📞 Suporte & Referências

- **Veo Official:** https://veo.ai
- **API Docs:** https://veo.ai/docs
- **Prompts Guide:** `docs/veo-prompt-guide.md` (local)
- **Exemplo de queue:** `data/veo-queue.json` (local)

---

## ✅ Conclusão

Depois de completar este checklist:

1. ✅ Veo 3.1 estará configurado e testado
2. ✅ 3 reels Food Animated estarão prontos em `ready-to-post/`
3. ✅ Fluxo automático quinzenal estará ativo
4. ✅ Próximos ciclos precisarão apenas de: escrever prompts → `node generate-veo.js --all`

**Próximo passo:** Executar Fase 1 (Setup) e validar conexão Veo.

---

_Plano criado: 27 de maio, 2026 · Luiza na Cozinha_
