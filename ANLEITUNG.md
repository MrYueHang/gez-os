# GEZY OS - KOMPLETTE ANLEITUNG

## 1. LOKAL STARTEN
```bash
cd ~/Downloads/gezy_os
npx pnpm install
npx pnpm dev
```
Dann: http://localhost:3000

---

## 2. GITHUB
https://github.com/MrYueHang/gez-os

---

## 3. VPS SSH EINRICHTEN (Webgo 147.93.58.99)

### Deinen SSH Key anzeigen:
```bash
cat ~/.ssh/id_ed25519.pub
```

### Falls keiner existiert:
```bash
ssh-keygen -t ed25519
cat ~/.ssh/id_ed25519.pub
```

### Key eintragen:
1. Webgo Panel einloggen
2. SSH Keys -> Neuen Key hinzufuegen
3. Public Key reinkopieren

---

## 4. VPS DEPLOYMENT (nach SSH-Fix)
```bash
ssh root@147.93.58.99
git clone https://github.com/MrYueHang/gez-os.git
cd gez-os

# Docker installieren:
curl -fsSL https://get.docker.com | sh

# MySQL starten:
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=gezy123 -e MYSQL_DATABASE=gezy_os -p 3306:3306 mysql:8

# .env erstellen:
cat > .env << 'EOF'
DATABASE_URL=mysql://root:gezy123@localhost:3306/gezy_os
JWT_SECRET=dein-geheimer-schluessel-hier
NODE_ENV=production
PORT=3000
STRIPE_SECRET_KEY=sk_live_xxx
EOF

# App starten:
npm install -g pnpm
pnpm install
pnpm db:push
pnpm build
pnpm start
```

---

## 5. API KEYS (lokal gespeichert)
```
~/GEZY_OPERATIONS_CENTER/05_DUE_DILIGENCE/00_API_KEYS.env
```

| Service | Status |
|---------|--------|
| Grok | OK |
| E2B | OK |
| Pinecone | OK |
| Supabase | OK |
| Gemini | FEHLT |
| OpenAI | FEHLT |
| DeepSeek | FEHLT |

---

## 6. TECH STACK
- Frontend: React 19 + Tailwind 4 + shadcn/ui
- Backend: Node.js + Express + tRPC
- Database: MySQL/TiDB + Drizzle ORM
- Auth: JWT + Manus OAuth
- Payments: Stripe
- Storage: S3

---

## 7. WICHTIGE BEFEHLE
```bash
# Entwicklung:
npx pnpm dev

# Build:
npx pnpm build

# Datenbank migrieren:
npx pnpm db:push

# Produktion:
npx pnpm start
```

---

Stand: 2025-12-24
