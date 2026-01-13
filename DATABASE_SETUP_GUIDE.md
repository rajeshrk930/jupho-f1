# 🔧 Database Setup Guide - SQLite (Dev) + PostgreSQL (Prod)

## Problem
- **Local Development**: Using SQLite (`file:./dev.db`)
- **Production**: Using PostgreSQL
- **Issue**: Can't have two different providers in one `schema.prisma`

---

## ✅ SOLUTION OPTIONS

### **Option 1: 🏆 RECOMMENDED - Use PostgreSQL Everywhere**

**Why?** Same database in dev and production = zero surprises.

#### Setup PostgreSQL Locally with Docker

**Step 1: Create `docker-compose.yml` in backend folder**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: jupho
      POSTGRES_PASSWORD: dev123
      POSTGRES_DB: jupho_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Step 2: Update `backend/.env`**
```env
DATABASE_URL="postgresql://jupho:dev123@localhost:5432/jupho_dev"
```

**Step 3: Start PostgreSQL**
```bash
cd backend
docker-compose up -d
npx prisma db push
```

**Step 4: Stop PostgreSQL when done**
```bash
docker-compose down
```

**Benefits:**
- ✅ Identical to production
- ✅ Tests migrations properly
- ✅ No schema switching
- ✅ One command: `docker-compose up -d`

---

### **Option 2: Multiple Schema Files (If you really need SQLite)**

Keep two separate schema files:
- `schema.prisma` → PostgreSQL (production)
- `schema.dev.prisma` → SQLite (local dev)

#### Setup

**Step 1: Files already created**
- ✅ `backend/prisma/schema.prisma` (PostgreSQL)
- ✅ `backend/prisma/schema.dev.prisma` (SQLite)

**Step 2: Update package.json scripts**
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    
    "db:migrate": "prisma migrate dev --schema=./prisma/schema.dev.prisma",
    "db:generate": "prisma generate --schema=./prisma/schema.dev.prisma",
    "db:push": "prisma db push --schema=./prisma/schema.dev.prisma",
    "db:studio": "prisma studio --schema=./prisma/schema.dev.prisma",
    
    "prod:migrate": "prisma migrate deploy",
    "prod:generate": "prisma generate"
  }
}
```

**Step 3: Update `.env` for SQLite**
```env
DATABASE_URL="file:./prisma/dev.db"
```

**Step 4: Usage**
```bash
# Local development (SQLite)
npm run db:push
npm run db:generate
npm run dev

# Production (PostgreSQL) - automatic via deployment
# Uses schema.prisma by default
```

**Drawbacks:**
- ⚠️ Must maintain two schema files
- ⚠️ Different behavior between dev/prod
- ⚠️ Migration testing not accurate
- ⚠️ Risk of schema drift

---

### **Option 3: Environment Variable for Provider (Advanced)**

Use a script to swap providers dynamically.

**Create `backend/scripts/use-db.js`:**
```javascript
const fs = require('fs');
const path = require('path');

const env = process.argv[2] || 'dev';
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

let schema = fs.readFileSync(schemaPath, 'utf8');

if (env === 'dev') {
  schema = schema.replace(
    /provider = "postgresql"/,
    'provider = "sqlite"'
  );
  console.log('✅ Switched to SQLite for development');
} else {
  schema = schema.replace(
    /provider = "sqlite"/,
    'provider = "postgresql"'
  );
  console.log('✅ Switched to PostgreSQL for production');
}

fs.writeFileSync(schemaPath, schema);
```

**Update package.json:**
```json
{
  "scripts": {
    "db:dev": "node scripts/use-db.js dev && prisma db push",
    "db:prod": "node scripts/use-db.js prod && prisma migrate deploy",
    "predev": "node scripts/use-db.js dev"
  }
}
```

**Drawbacks:**
- ⚠️ Complex to maintain
- ⚠️ Risk of committing wrong provider
- ⚠️ Must remember to run script

---

## 🎯 MY RECOMMENDATION

### **Use Option 1: PostgreSQL Everywhere**

**Why?**
1. **Same behavior** - What you test locally is what runs in prod
2. **Migration safety** - Catch migration issues early
3. **Zero complexity** - No schema switching
4. **Industry standard** - Most teams use same DB everywhere
5. **Easy setup** - One `docker-compose up -d` command

**Setup Time: 2 minutes**

```bash
cd backend

# Create docker-compose.yml (copy from Option 1 above)

# Update .env
DATABASE_URL="postgresql://jupho:dev123@localhost:5432/jupho_dev"

# Start PostgreSQL
docker-compose up -d

# Migrate
npx prisma db push

# Done! Now run dev server
npm run dev
```

---

## 🚀 Quick Start Commands

### Option 1 (PostgreSQL everywhere):
```bash
docker-compose up -d
npm run dev
```

### Option 2 (Multiple schemas):
```bash
npm run db:push        # SQLite locally
npm run dev
```

---

## 📝 Notes

- **Production** always uses `schema.prisma` (PostgreSQL)
- **If you keep SQLite locally**, you must ensure both schemas stay in sync manually
- **Docker PostgreSQL** uses only ~100MB RAM and persists data in a volume

---

## ❓ FAQ

**Q: I don't have Docker, can I use SQLite?**  
A: Yes, use Option 2, but be aware of behavior differences.

**Q: Will SQLite work in production?**  
A: No, production (api.jupho.io) uses PostgreSQL from Railway/Heroku.

**Q: What if schemas go out of sync?**  
A: You'll get runtime errors. Option 1 avoids this entirely.

**Q: How much does Docker PostgreSQL cost?**  
A: Free! It runs on your local machine.

---

## 🎓 Best Practice

> **"Use the same database in development that you use in production."**  
> — Every DevOps engineer ever

Choose Option 1. Your future self will thank you. 🙏
