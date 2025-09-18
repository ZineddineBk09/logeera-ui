# 🚀 Logeera Setup Guide

## Quick Start (Recommended)

### 1. **Environment Setup**

```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local and set your database URL
DATABASE_URL="postgresql://username:password@localhost:5432/logeera"
```

### 2. **Database Setup (Choose One)**

#### Option A: Full Setup with PostGIS (Recommended)

```bash
# Install dependencies
pnpm install

# Set up database with PostGIS
pnpm run db:setup

# Seed with test data
pnpm run db:seed
```

#### Option B: Simple Setup (No PostGIS)

```bash
# Install dependencies
pnpm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed with simple test data
pnpm run db:seed-simple
```

### 3. **Start Development**

```bash
# Start the development server
pnpm dev

# In another terminal, test the API
node scripts/test-api.js
```

## 🔧 Troubleshooting

### Database Connection Issues

**Error: `DATABASE_URL` not found**

```bash
# Make sure you have a .env.local file with:
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
```

**Error: Connection refused**

```bash
# Make sure PostgreSQL is running
# On macOS with Homebrew:
brew services start postgresql

# On Ubuntu/Debian:
sudo systemctl start postgresql

# On Windows:
# Start PostgreSQL service from Services
```

**Error: Database does not exist**

```bash
# Create the database manually
createdb logeera

# Or connect to PostgreSQL and create it:
psql -U postgres
CREATE DATABASE logeera;
```

### PostGIS Issues

**Error: PostGIS extension not found**

```bash
# Install PostGIS (optional - app works without it)
# On macOS:
brew install postgis

# On Ubuntu/Debian:
sudo apt-get install postgresql-14-postgis-3

# On Windows:
# Install PostGIS from https://postgis.net/install/
```

**If PostGIS installation fails:**

- Use the simple setup option: `pnpm run db:seed-simple`
- The app will work without PostGIS, but geospatial features will be limited

### Migration Issues

**Error: Migration conflicts**

```bash
# Reset the database and start fresh
pnpm run db:reset
```

**Error: Prisma client not generated**

```bash
# Generate the Prisma client
npx prisma generate
```

## 📊 Available Scripts

| Command                   | Description                             |
| ------------------------- | --------------------------------------- |
| `pnpm run db:setup`       | Full database setup with PostGIS        |
| `pnpm run db:seed`        | Seed with full test data                |
| `pnpm run db:seed-simple` | Seed with simple test data (no PostGIS) |
| `pnpm run db:reset`       | Reset database and reseed               |
| `pnpm run db:studio`      | Open Prisma Studio (database GUI)       |
| `pnpm dev`                | Start development server                |
| `pnpm build`              | Build for production                    |

## 🧪 Testing

### Test Credentials

```
Email: john.doe@example.com
Password: password123

Email: jane.smith@example.com
Password: password123

Email: admin@logeera.com
Password: password123
```

### API Testing

```bash
# Test all endpoints
node scripts/test-api.js

# Test specific endpoint
curl http://localhost:3000/api/health
curl http://localhost:3000/api/trips
```

### Database Inspection

```bash
# Open Prisma Studio
pnpm run db:studio

# Or connect directly to PostgreSQL
psql -U postgres -d logeera
```

## 🚀 Production Deployment

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_ACCESS_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
CORS_ORIGIN="https://yourdomain.com"
```

### Database Migration

```bash
# Production migration
npx prisma migrate deploy

# Generate production client
npx prisma generate --no-engine
```

## 📝 Next Steps

1. **✅ Database Setup** - Choose Option A or B above
2. **✅ Seed Data** - Run the appropriate seed command
3. **✅ Start Server** - Run `pnpm dev`
4. **✅ Test API** - Run `node scripts/test-api.js`
5. **✅ Frontend Integration** - Start connecting your frontend components

## 🆘 Still Having Issues?

### Common Solutions

1. **Check PostgreSQL is running**
2. **Verify DATABASE_URL format**
3. **Ensure database exists**
4. **Try the simple setup option**
5. **Check Prisma client is generated**

### Get Help

- Check the console output for specific error messages
- Ensure all dependencies are installed: `pnpm install`
- Try resetting: `pnpm run db:reset`
- Use Prisma Studio to inspect the database: `pnpm run db:studio`

---

**🎉 Once setup is complete, you'll have a fully functional ride-sharing platform backend ready for frontend integration!**
