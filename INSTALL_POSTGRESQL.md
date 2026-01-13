# 🐘 PostgreSQL Installation Guide - macOS

## Quick Setup (Choose ONE option)

### Option A: Postgres.app (Easiest - GUI)

1. **Download**: [Postgres.app](https://postgresapp.com/)
2. **Install**: Drag to Applications folder
3. **Launch**: Click "Initialize" 
4. **Done!** PostgreSQL is running on port 5432

### Option B: Homebrew (Command Line)

```bash
# 1. Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install PostgreSQL
brew install postgresql@15

# 3. Start PostgreSQL
brew services start postgresql@15

# 4. Create database
createdb jupho_dev
```

### Option C: Docker Desktop (Recommended for consistency)

```bash
# 1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop

# 2. After Docker is installed, run:
cd ~/jupho-f1/backend
docker-compose up -d

# That's it! PostgreSQL will start automatically.
```

---

## After Installation - Complete Setup

Once PostgreSQL is running, apply your database schema:

```bash
cd ~/jupho-f1/backend

# Apply schema to PostgreSQL
npx prisma db push

# Verify connection
npx prisma studio
```

---

## Current Status

✅ Your `.env` is already configured for PostgreSQL:
```env
DATABASE_URL="postgresql://localhost:5432/jupho_dev"
```

✅ Your `schema.prisma` is already set to `postgresql`

⏳ **Next Step:** Install PostgreSQL using one of the options above

---

## Verification

After installation, test the connection:

```bash
# Test if PostgreSQL is running
psql -d jupho_dev -c "SELECT version();"

# Or just start your app:
cd ~/jupho-f1/backend
npm run dev
```

If you see "Prisma Client connected", you're good to go! 🎉

---

## Troubleshooting

**Error: "database jupho_dev does not exist"**
```bash
createdb jupho_dev
```

**Error: "connection refused on port 5432"**
- PostgreSQL isn't running. Start it with `brew services start postgresql@15` or launch Postgres.app

**Want to use SQLite instead for now?**
Just change `.env` back to:
```env
DATABASE_URL="file:./prisma/dev.db"
```

And you're back to SQLite. But remember: production uses PostgreSQL, so testing with PostgreSQL locally is strongly recommended.
