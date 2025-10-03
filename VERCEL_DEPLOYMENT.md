# 🚀 Vercel Deployment Guide for Logeera

## Prerequisites

- Vercel account
- PostgreSQL database (Vercel Postgres, Supabase, Neon, etc.)
- Google Maps API key

## 1. Database Setup

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Navigate to "Storage" → "Create Database" → "Postgres"
3. Copy the connection string

### Option B: External Database

1. Set up PostgreSQL on Supabase, Neon, or Railway
2. Copy the connection string

## 2. Environment Variables

Add these environment variables in your Vercel project settings:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secrets (generate secure random strings)
JWT_ACCESS_SECRET=your_secure_access_secret_here
JWT_REFRESH_SECRET=your_secure_refresh_secret_here

# App Configuration
NEXT_PUBLIC_API_BASE=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_api_key

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

## 3. Database Migration

### Automatic Migration (Recommended)

The app will automatically run Prisma migrations on deployment if you have the build script configured.

### Manual Migration

If you need to run migrations manually:

```bash
# Connect to your Vercel project
vercel link

# Run migrations
vercel env pull .env.local
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## 4. Deployment

### Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Deploy via GitHub

1. Connect your GitHub repository to Vercel
2. Vercel will automatically deploy on every push to main branch

## 5. Socket.IO Setup

### Current Setup (Serverless)

The app now uses Vercel-compatible Socket.IO implementation via API routes.

### For Production Socket.IO

Consider using external services:

- **Pusher** (recommended)
- **Ably**
- **Socket.IO Cloud**

## 6. Post-Deployment Checklist

- [ ] Database connection working
- [ ] Environment variables set
- [ ] Prisma migrations applied
- [ ] Admin user created
- [ ] Socket.IO connection tested
- [ ] Google Maps integration working
- [ ] Authentication flow working
- [ ] PWA features working

## 7. Admin User Setup

After deployment, create an admin user:

```bash
# Using the seed script
npm run db:seed-api

# Or manually via database
# Set user role to 'ADMIN' in your database
```

## 8. Monitoring

- Monitor logs in Vercel dashboard
- Set up error tracking (Sentry, Bugsnag)
- Monitor database performance
- Track API usage

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify database is accessible from Vercel
   - Check SSL requirements

2. **Build Failures**
   - Ensure all environment variables are set
   - Check Prisma schema compatibility
   - Verify TypeScript compilation

3. **Socket.IO Not Working**
   - Check CORS configuration
   - Verify WebSocket support in your region
   - Consider using external Socket.IO service

4. **Authentication Issues**
   - Verify JWT secrets are set
   - Check token expiration settings
   - Ensure cookies are configured correctly

## Production Recommendations

1. **Security**
   - Use strong JWT secrets
   - Enable HTTPS
   - Set up rate limiting
   - Configure CORS properly

2. **Performance**
   - Enable caching
   - Optimize images
   - Use CDN for static assets
   - Monitor bundle size

3. **Monitoring**
   - Set up error tracking
   - Monitor database performance
   - Track user analytics
   - Set up alerts

## Support

For deployment issues:

- Check Vercel documentation
- Review build logs
- Test locally with production environment variables
- Contact support if needed
