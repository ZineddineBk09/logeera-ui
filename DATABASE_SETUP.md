# Database Setup Guide

## Overview

This project uses **PostgreSQL with PostGIS** for geospatial data handling and **Prisma ORM** for database operations. The schema includes all necessary entities for a ride-sharing platform with real-time chat functionality.

## ✅ **Fixed Issues**

### 1. **PostGIS Integration**

- ✅ Created proper geospatial utilities (`lib/geospatial.ts`)
- ✅ Implemented WKT validation for coordinate data
- ✅ Added PostGIS raw SQL queries for proximity search
- ✅ Created database extension setup script

### 2. **Chat & Message Models**

- ✅ Added proper relations between User, Chat, and Message models
- ✅ Implemented unique constraint on Chat (userAId, userBId)
- ✅ Added sender relation to Message model

### 3. **Database Connection Pooling**

- ✅ Enhanced Prisma client configuration
- ✅ Added connection management utilities
- ✅ Configured proper logging for development/production

## 🗄️ **Database Schema**

### Core Models:

- **User**: Individual/Company users with roles and ratings
- **Trip**: Ride offers with PostGIS geospatial data
- **Request**: Trip requests with status management
- **Chat**: Conversations between users
- **Message**: Individual chat messages
- **Rating**: User rating and review system

### Key Features:

- **PostGIS Support**: Proper geospatial queries for proximity search
- **Real-time Chat**: Socket.IO integration with database persistence
- **Role-based Access**: User roles (USER, MODERATOR, ADMIN)
- **Rating System**: Automatic average calculation
- **Request Management**: Trip request workflow

## 🚀 **Setup Instructions**

### 1. **Environment Configuration**

```bash
# Copy environment template
cp env.example .env.local

# Configure your database URL
DATABASE_URL="postgresql://username:password@localhost:5432/logeera"
```

### 2. **Database Setup**

```bash
# Install dependencies
pnpm install

# Set up database with PostGIS
node scripts/setup-database.js

# Or manually:
npx prisma db execute --file ./lib/database-extensions.sql
npx prisma migrate dev --name init
```

### 3. **Development**

```bash
# Start development server
pnpm dev

# Generate Prisma client (after schema changes)
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

## 🔧 **Geospatial Features**

### WKT Format

Coordinates are stored in WKT (Well-Known Text) format:

```typescript
// Example: "POINT(-122.4194 37.7749)" for San Francisco
const point = { longitude: -122.4194, latitude: 37.7749 };
const wkt = createWKT(point); // "POINT(-122.4194 37.7749)"
```

### Proximity Search

```typescript
// Find trips within 5km of a location
const trips = await findTripsNearby(
  { longitude: -122.4194, latitude: 37.7749 },
  5000, // meters
);
```

### Distance Calculation

```typescript
const distance = await calculateDistance(point1, point2);
// Returns distance in meters
```

## 📡 **API Endpoints**

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/change-password` - Change password

### Trips

- `GET /api/trips` - List trips with filters
- `POST /api/trips` - Create new trip
- `GET /api/trips/nearby` - Find nearby trips (PostGIS)
- `PATCH /api/trips/[id]/complete` - Complete trip

### Requests

- `POST /api/requests` - Create trip request
- `GET /api/requests/incoming` - Get incoming requests
- `GET /api/requests/outgoing` - Get outgoing requests
- `PATCH /api/requests/[id]/status` - Update request status

### Chat

- `GET /api/chat/between` - Get/create chat between users
- `GET /api/chat/[chatId]/messages` - Get chat messages
- `POST /api/chat/[chatId]/messages` - Send message

### Ratings

- `POST /api/ratings` - Create user rating

### System

- `GET /api/health` - Health check
- `GET /api/metrics` - Prometheus metrics

## 🔒 **Security Features**

- **JWT Authentication**: Access tokens (15min) + refresh tokens (7d)
- **Role-based Access Control**: USER, MODERATOR, ADMIN roles
- **Input Validation**: Zod schemas for all endpoints
- **CORS Configuration**: Proper cross-origin setup
- **Rate Limiting**: Built-in protection (can be enhanced)

## 🚀 **Production Deployment**

### Database

```bash
# Production migration
npx prisma migrate deploy

# Generate production client
npx prisma generate --no-engine
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_ACCESS_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
CORS_ORIGIN="https://yourdomain.com"
```

### Connection Pooling

For production, consider using a connection pooler like PgBouncer or Prisma Accelerate for better performance.

## 🧪 **Testing**

```bash
# Run tests (when implemented)
pnpm test

# Test database connection
curl http://localhost:3000/api/health

# Test geospatial query
curl "http://localhost:3000/api/trips/nearby?lon=-122.4194&lat=37.7749&radiusMeters=5000"
```

## 📚 **Additional Resources**

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Socket.IO Documentation](https://socket.io/docs/)

---

**✅ Your ride-sharing platform backend is now fully configured with proper PostGIS support, real-time chat, and all the features from your migration guide!**
