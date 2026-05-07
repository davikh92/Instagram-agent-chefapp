# Setup — Instagram Graph API + Cloudinary

Guia passo a passo para ativar o auto-post. Feito uma vez, funciona para sempre.

---

## 1. Cloudinary (10 min)

1. Acesse [cloudinary.com](https://cloudinary.com) → **Sign Up Free**
2. Preencha com nome/email — não precisa de cartão
3. No Dashboard, copie:
   - **Cloud Name** (ex: `davi-luiza`)
   - **API Key** (ex: `123456789012345`)
   - **API Secret** (ex: `abcdef...`)
4. Cole no `.env`:
```
CLOUDINARY_CLOUD_NAME=davi-luiza
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdef...
```

---

## 2. Instagram Business Account (5 min se já for Business)

O Instagram da Luiza precisa ser **conta profissional Business** (não Creator).

Para verificar/converter:
- Instagram app → Perfil → ≡ → Configurações → Conta
- Se aparecer "Mudar para conta profissional" → selecionar **Business**
- Categoria: Produto/serviço ou App

---

## 3. Página do Facebook conectada (5 min)

A Graph API exige uma Página do Facebook vinculada ao Instagram.

1. Crie uma página no [facebook.com/pages/create](https://facebook.com/pages/create)
   - Nome: **Luiza na Cozinha**
   - Categoria: App
2. No Instagram: Configurações → Conta → Conta profissional vinculada → vincular à página

---

## 4. Facebook App (15 min)

1. Acesse [developers.facebook.com](https://developers.facebook.com) → **Meus Apps** → **Criar App**
2. Tipo: **Business** → Avançar
3. Nome: `luiza-instagram-publisher` → Criar App
4. No painel do app, clique em **Adicionar produto** → **Instagram** → Configurar
5. Em **Configurações básicas** (menu esquerdo):
   - Copie o **App ID** e o **App Secret** (vão para o `.env` depois, opcional)

---

## 5. Gerar o Access Token (10 min)

### 5a. Token de curta duração (1h)
No [Graph API Explorer](https://developers.facebook.com/tools/explorer/):
1. Selecione seu App no dropdown
2. Clique em **Gerar Access Token**
3. Marque as permissões:
   - `instagram_business_basic`
   - `instagram_business_content_publish`
4. Clique em **Gerar Token** → autorize

### 5b. Converter para longa duração (60 dias)
No terminal, rode:
```bash
curl "https://graph.facebook.com/v21.0/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=SEU_APP_ID&\
client_secret=SEU_APP_SECRET&\
fb_exchange_token=TOKEN_CURTA_DURACAO"
```
Copie o `access_token` da resposta.

### 5c. Pegar o Instagram User ID
```bash
curl "https://graph.instagram.com/v21.0/me?fields=id,username&access_token=SEU_TOKEN"
```
Copie o `id`.

---

## 6. Preencher o .env

Crie o arquivo `.env` na raiz do projeto:
```
CLOUDINARY_CLOUD_NAME=davi-luiza
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdef...

INSTAGRAM_ACCESS_TOKEN=EAABsbCS...
INSTAGRAM_USER_ID=17841400000000
```

---

## 7. Instalar dependências

```bash
npm install cloudinary dotenv
```

---

## 8. Testar

```bash
# Publica um reel específico
node scripts/publish.js --folder ready-to-post/2026-05/2026-05-06/reel-01-relogio

# Publica tudo do dia 06/mai
node scripts/publish.js --date 2026-05-06

# Publica tudo agendado até hoje
node scripts/publish.js --all
```

---

## 9. Renovação automática do token (a cada 30 dias)

O token expira em 60 dias. Para renovar antes de expirar:
```bash
node scripts/refresh-token.js
```

Ou adicione uma tarefa agendada no Windows:
- Abra **Agendador de Tarefas** → Criar tarefa básica
- Disparador: Mensalmente (dia 1 de cada mês)
- Ação: `node "C:\caminho\scripts\refresh-token.js"`

---

## Fluxo do CapCut (opcional, para música)

1. Abra o `reel.mp4` da pasta no CapCut
2. Adicione música → exporte como `reel-final.mp4` na mesma pasta
3. O script `publish.js` detecta `reel-final.mp4` primeiro (se existir), senão usa `reel.mp4`
