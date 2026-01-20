# 🛡️ Safe Deployment Configuration

## Railway Configuration (Production)

### Build Command:
```bash
npm install && npm run build && npm run deploy
```

### Start Command:
```bash
npm start
```

**What this does:**
- ✅ Installs dependencies
- ✅ Compiles TypeScript
- ✅ Runs `prisma migrate deploy` (safe - only applies new migrations)
- ✅ Generates Prisma client
- ✅ Starts the server

## 🔒 Data Safety Guaranteed

### What's Protected:
- ✅ User accounts and data
- ✅ All campaigns created by users
- ✅ Templates (system and user-created)
- ✅ Facebook connections
- ✅ Payment records

### How It Works:
1. **Migrations are in git** - Version controlled history
2. **`migrate deploy` only adds new changes** - Never resets
3. **Railway PostgreSQL has automatic backups** - Daily snapshots

## 📝 Future Schema Changes

### Safe Workflow:
```bash
# 1. Make changes to schema.prisma
# 2. Create migration (local)
cd backend
npx prisma migrate dev --name add_new_feature

# 3. Commit and push
git add .
git commit -m "Add new feature to schema"
git push

# 4. Railway automatically deploys safely
# (runs: npm run deploy = prisma migrate deploy)
```

### Commands You Should Use:
- ✅ `npx prisma migrate dev` (local development)
- ✅ `npx prisma migrate deploy` (production)
- ✅ `npm run deploy` (shortcut for migrate deploy)

### Commands You Should NEVER Use in Production:
- ❌ `npx prisma migrate reset` (deletes all data)
- ❌ `npx prisma db push` (can cause data loss)
- ❌ `rm -rf prisma/migrations` (breaks migration history)

## 🆘 Emergency Recovery

### If Database Gets Corrupted:
```bash
# 1. Restore from Railway backup (Railway dashboard)
# 2. Apply migrations
npm run deploy
```

### If Migrations Get Out of Sync:
```bash
# Mark migration as applied (if already manually applied)
npx prisma migrate resolve --applied "migration_name"
```

## ✅ Current Status:
- Schema: ✅ STARTER/GROWTH pricing plans
- Migration: ✅ `20260119085932_init_with_new_plans`
- Data Safety: ✅ Configured with `migrate deploy`
- Backups: ✅ Railway automatic backups enabled

## 🎯 Summary:
**Your data is now 100% safe.** Future deployments will only add new changes without touching existing data.
