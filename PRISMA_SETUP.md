# 🚀 Prisma Setup & Initialization Guide

## Quick Setup (Step-by-Step)

### Step 1: Check Environment Variables

Make sure you have a `.env.local` or `.env` file with your database connection:

```bash
# Check if .env.local exists
cat .env.local

# If not, copy from example
cp env.example .env.local
```

**Required Environment Variable:**
```env
DATABASE_URL="postgresql://username:password@host:port/database_name"
```

### Step 2: Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### Step 3: Generate Prisma Client

This creates the TypeScript types and client based on your schema:

```bash
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client (x.xx.x) to ./node_modules/@prisma/client in xxxms
```

### Step 4: Run Database Migrations

Apply all pending migrations to your database:

```bash
# For development (creates migration history)
npx prisma migrate dev

# OR for production (applies existing migrations)
npx prisma migrate deploy
```

**Expected Output:**
```
✔ Applied migration: 20250912151712_init
✔ Applied migration: 20250913113624_add_blocked_user_status
✔ Applied migration: 20250917095724_add_price_and_booked_seats
✔ Applied migration: 20250919234014_add_missing_tables
✔ Applied migration: 20250929195032_update_user_type_enum
```

### Step 5: Verify Database Connection

Test the connection:

```bash
npx prisma db pull
```

Or open Prisma Studio to view your database:

```bash
npx prisma studio
```

### Step 6: (Optional) Seed Database

If you want test data:

```bash
npm run db:seed-simple
# or
npm run db:seed
```

---

## 🔧 Troubleshooting

### Error: `DATABASE_URL` is not set

**Solution:**
1. Create `.env.local` file in project root
2. Add your database URL:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/logeera"
   ```
3. Restart your development server

### Error: `PrismaClient` is not generated

**Solution:**
```bash
npx prisma generate
```

### Error: Database connection failed

**Check:**
1. Is PostgreSQL running?
   ```bash
   # macOS
   brew services list | grep postgresql
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Is the database URL correct?
   ```bash
   # Test connection manually
   psql "postgresql://username:password@host:port/database_name"
   ```

3. Does the database exist?
   ```bash
   # Create database if needed
   createdb logeera
   # or
   psql -U postgres -c "CREATE DATABASE logeera;"
   ```

### Error: Migration failed

**Solution:**
```bash
# Check migration status
npx prisma migrate status

# If migrations are out of sync, reset (⚠️ WARNING: Deletes all data)
npx prisma migrate reset

# Or manually fix the migration
npx prisma migrate dev --name fix_migration
```

### Error: `@prisma/client` module not found

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

### Error: API requests failing with database errors

**Check:**
1. Is Prisma client generated?
   ```bash
   npx prisma generate
   ```

2. Are migrations applied?
   ```bash
   npx prisma migrate status
   ```

3. Is the database running?
   ```bash
   # Test connection
   npx prisma db pull
   ```

4. Restart your Next.js dev server:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

---

## 📋 Complete Setup Checklist

- [ ] Environment variables configured (`.env.local`)
- [ ] Dependencies installed (`npm install`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Database migrations applied (`npx prisma migrate dev`)
- [ ] Database connection verified (`npx prisma db pull`)
- [ ] Next.js dev server restarted (`npm run dev`)

---

## 🎯 Quick Commands Reference

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (development)
npx prisma migrate dev

# Run migrations (production)
npx prisma migrate deploy

# View database in browser
npx prisma studio

# Check migration status
npx prisma migrate status

# Pull schema from database
npx prisma db pull

# Push schema to database (no migrations)
npx prisma db push

# Reset database (⚠️ Deletes all data)
npx prisma migrate reset

# Seed database
npm run db:seed-simple
```

---

## 🔍 Verify Everything Works

After setup, test your API:

```bash
# Start dev server
npm run dev

# In another terminal, test an API endpoint
curl http://localhost:3000/api/health
# or
curl http://localhost:3000/api/trips/nearby
```

If you see database-related errors, go back to the troubleshooting section.

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js + Prisma Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Database Setup Guide](./DATABASE_SETUP.md)

---

*Last Updated: October 3, 2025*

