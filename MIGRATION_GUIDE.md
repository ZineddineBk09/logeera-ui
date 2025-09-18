# NestJS to Next.js 15 API Routes Migration Guide

## Overview

This guide provides a comprehensive migration path from the current NestJS backend to Next.js 15 API routes. The backend is a ride-sharing and logistics platform with the following key features:

### Current NestJS Backend Architecture

**Core Modules:**

- **Auth Module**: JWT authentication with refresh tokens, role-based access control (RBAC)
- **Users Module**: User management with individual/company types, ratings system
- **Trips Module**: PostGIS-powered trip publishing with proximity search
- **Requests Module**: Trip request management with publisher approval workflow
- **Chat Module**: Real-time messaging via Socket.IO + REST persistence
- **Ratings Module**: User rating and review system
- **Admin Module**: Administrative CRUD operations and analytics
- **Health Module**: Health checks and Prometheus metrics

**Key Technologies:**

- NestJS framework with TypeScript
- PostgreSQL + PostGIS for geospatial data
- Prisma for database operations
- JWT authentication with httpOnly refresh cookies
- Socket.IO for real-time chat
- Structured logging with PII redaction
- Rate limiting, CORS, security middleware
- Swagger/OpenAPI documentation

## Migration Strategy

### Phase 1: Project Setup & Dependencies

#### 1.1 Initialize Next.js 15 Project

```bash
npx create-next-app@latest logeera-frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd logeera-frontend
```

#### 1.2 Install Required Dependencies

```bash
# Database & ORM
npm install pg @types/pg
npm install Prisma reflect-metadata

# Authentication & Security
npm install jsonwebtoken @types/jsonwebtoken
npm install bcrypt @types/bcrypt
npm install cookie @types/cookie

# Validation
npm install zod

# Real-time Communication
npm install socket.io socket.io-client

# Utilities
npm install pino pino-pretty
npm install prom-client
npm install sharp

# Development
npm install -D @types/node
```

#### 1.3 Environment Configuration

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:55432/logeera"
DB_HOST=localhost
DB_PORT=55432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=logeera

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Phase 2: Database Configuration

#### 2.1 Prisma Configuration

Create `lib/database.ts`:

```typescript
import { DataSource } from 'Prisma';
import { User } from './entities/User';
import { Trip } from './entities/Trip';
import { Request } from './entities/Request';
import { Chat } from './entities/Chat';
import { Message } from './entities/Message';
import { Rating } from './entities/Rating';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Trip, Request, Chat, Message, Rating],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});

export const initializeDatabase = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};
```

#### 2.2 Entity Definitions

Create `lib/entities/User.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'Prisma';
import { Trip } from './Trip';
import { Request } from './Request';
import { Rating } from './Rating';

export enum UserType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
}

export enum UserStatus {
  PENDING = 'pending',
  TRUSTED = 'trusted',
}

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.INDIVIDUAL })
  type: UserType;

  @Column({ nullable: true })
  officialIdNumber: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'float', default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  ratingCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Trip, (trip) => trip.publisher)
  publishedTrips: Trip[];

  @OneToMany(() => Request, (request) => request.applicant)
  requests: Request[];

  @OneToMany(() => Rating, (rating) => rating.ratedUser)
  receivedRatings: Rating[];

  @OneToMany(() => Rating, (rating) => rating.reviewerUser)
  givenRatings: Rating[];
}
```

Create `lib/entities/Trip.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'Prisma';
import { User } from './User';
import { Request } from './Request';

export enum VehicleType {
  CAR = 'car',
  VAN = 'van',
  TRUCK = 'truck',
  BIKE = 'bike',
}

export enum TripStatus {
  PUBLISHED = 'published',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  publisherId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'publisherId' })
  publisher: User;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  originGeom: string;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  destinationGeom: string;

  @Column()
  originName: string;

  @Column()
  destinationName: string;

  @Column({ type: 'timestamp' })
  departureAt: Date;

  @Column({ type: 'enum', enum: VehicleType })
  vehicleType: VehicleType;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'enum', enum: TripStatus, default: TripStatus.PUBLISHED })
  status: TripStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Request, (request) => request.trip)
  requests: Request[];
}
```

### Phase 3: Authentication System

#### 3.1 JWT Utilities

Create `lib/auth/jwt.ts`:

```typescript
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const signAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: '15m',
  });
};

export const signRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload;
};
```

#### 3.2 Authentication Middleware

Create `lib/auth/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JWTPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export const withAuth = (
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
) => {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const token = authHeader.substring(7);
      const user = verifyAccessToken(token);
      (req as AuthenticatedRequest).user = user;
      return handler(req as AuthenticatedRequest);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  };
};

export const withRole = (roles: string[]) => {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return handler(req);
    });
  };
};
```

### Phase 4: API Routes Implementation

#### 4.1 Authentication Routes

Create `app/api/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { User } from '@/lib/entities/User';
import bcrypt from 'bcrypt';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const response = NextResponse.json({ accessToken });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
```

Create `app/api/auth/register/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { User, UserType } from '@/lib/entities/User';
import bcrypt from 'bcrypt';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
  password: z.string().min(8),
  type: z.nativeEnum(UserType).default(UserType.INDIVIDUAL),
  officialIdNumber: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);

    // Check for existing user
    const existingUser = await userRepository.findOne({
      where: [{ email: data.email }, { phoneNumber: data.phoneNumber }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = userRepository.create({
      ...data,
      passwordHash,
    });

    const savedUser = await userRepository.save(user);

    const payload = {
      userId: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const response = NextResponse.json({
      accessToken,
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
      },
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
```

Create `app/api/auth/me/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { AppDataSource } from '@/lib/database';
import { User } from '@/lib/entities/User';

async function handler(req: NextRequest) {
  try {
    await AppDataSource.initialize();
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: req.user!.userId },
      select: [
        'id',
        'name',
        'email',
        'phoneNumber',
        'type',
        'status',
        'role',
        'averageRating',
        'ratingCount',
      ],
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(handler);
```

#### 4.2 Trips Routes

Create `app/api/trips/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { AppDataSource } from '@/lib/database';
import { Trip } from '@/lib/entities/Trip';
import { z } from 'zod';

const createTripSchema = z.object({
  originGeom: z.string(),
  destinationGeom: z.string(),
  originName: z.string(),
  destinationName: z.string(),
  departureAt: z.string().datetime(),
  vehicleType: z.enum(['car', 'van', 'truck', 'bike']),
  capacity: z.number().int().positive(),
});

async function createTrip(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createTripSchema.parse(body);

    await AppDataSource.initialize();
    const tripRepository = AppDataSource.getRepository(Trip);

    const trip = tripRepository.create({
      ...data,
      publisherId: req.user!.userId,
      departureAt: new Date(data.departureAt),
    });

    const savedTrip = await tripRepository.save(trip);
    return NextResponse.json(savedTrip, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function getTrips(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const departureDate = searchParams.get('departureDate');
    const vehicleType = searchParams.get('vehicleType');

    await AppDataSource.initialize();
    const tripRepository = AppDataSource.getRepository(Trip);

    let query = tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.publisher', 'publisher')
      .where('trip.status = :status', { status: 'published' });

    if (q) {
      query = query.andWhere(
        '(trip.originName ILIKE :q OR trip.destinationName ILIKE :q)',
        { q: `%${q}%` },
      );
    }

    if (departureDate) {
      query = query.andWhere('DATE(trip.departureAt) = :date', {
        date: departureDate,
      });
    }

    if (vehicleType) {
      query = query.andWhere('trip.vehicleType = :vehicleType', {
        vehicleType,
      });
    }

    const trips = await query.getMany();
    return NextResponse.json(trips);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const POST = withAuth(createTrip);
export const GET = getTrips;
```

Create `app/api/trips/nearby/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';
import { Trip } from '@/lib/entities/Trip';
import { z } from 'zod';

const nearbySchema = z.object({
  lon: z.string().transform(Number),
  lat: z.string().transform(Number),
  radiusMeters: z.string().transform(Number).default('5000'),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { lon, lat, radiusMeters } = nearbySchema.parse({
      lon: searchParams.get('lon'),
      lat: searchParams.get('lat'),
      radiusMeters: searchParams.get('radiusMeters'),
    });

    await AppDataSource.initialize();
    const tripRepository = AppDataSource.getRepository(Trip);

    const trips = await tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.publisher', 'publisher')
      .where('trip.status = :status', { status: 'published' })
      .andWhere(
        `ST_DWithin(
          trip.originGeom,
          ST_SetSRID(ST_MakePoint(:lon, :lat), 4326),
          :radius
        )`,
        { lon, lat, radius: radiusMeters },
      )
      .getMany();

    return NextResponse.json(trips);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
```

#### 4.3 Requests Routes

Create `app/api/requests/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { AppDataSource } from '@/lib/database';
import { Request } from '@/lib/entities/Request';
import { Trip } from '@/lib/entities/Trip';
import { z } from 'zod';

const createRequestSchema = z.object({
  tripId: z.string().uuid(),
});

async function createRequest(req: NextRequest) {
  try {
    const body = await req.json();
    const { tripId } = createRequestSchema.parse(body);

    await AppDataSource.initialize();
    const requestRepository = AppDataSource.getRepository(Request);
    const tripRepository = AppDataSource.getRepository(Trip);

    const trip = await tripRepository.findOne({ where: { id: tripId } });
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (trip.publisherId === req.user!.userId) {
      return NextResponse.json(
        { error: 'Cannot request your own trip' },
        { status: 400 },
      );
    }

    const existingRequest = await requestRepository.findOne({
      where: { tripId, applicantId: req.user!.userId },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Request already exists' },
        { status: 409 },
      );
    }

    const request = requestRepository.create({
      tripId,
      applicantId: req.user!.userId,
      status: 'pending',
    });

    const savedRequest = await requestRepository.save(request);
    return NextResponse.json(savedRequest, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function getRequests(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'incoming' or 'outgoing'

    await AppDataSource.initialize();
    const requestRepository = AppDataSource.getRepository(Request);

    let query = requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.trip', 'trip')
      .leftJoinAndSelect('request.applicant', 'applicant')
      .leftJoinAndSelect('trip.publisher', 'publisher');

    if (type === 'incoming') {
      query = query.where('trip.publisherId = :userId', {
        userId: req.user!.userId,
      });
    } else if (type === 'outgoing') {
      query = query.where('request.applicantId = :userId', {
        userId: req.user!.userId,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter' },
        { status: 400 },
      );
    }

    const requests = await query.getMany();
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const POST = withAuth(createRequest);
export const GET = withAuth(getRequests);
```

### Phase 5: Real-time Communication

#### 5.1 Socket.IO Integration

Create `lib/socket/server.ts`:

```typescript
import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};
```

Create `app/api/socket/route.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { NextApiResponseServerIO } from '@/lib/socket/server';
import { Server as SocketIOServer } from 'socket.io';
import { verifyAccessToken } from '@/lib/auth/jwt';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO,
) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const user = verifyAccessToken(token);
        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.data.user?.userId);

      socket.on('join-chat', (chatId: string) => {
        socket.join(`chat-${chatId}`);
      });

      socket.on(
        'message',
        async (data: { chatId: string; content: string }) => {
          // Save message to database
          // Broadcast to chat room
          socket.to(`chat-${data.chatId}`).emit('message', {
            id: Date.now().toString(),
            chatId: data.chatId,
            senderId: socket.data.user.userId,
            content: data.content,
            createdAt: new Date(),
          });
        },
      );

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
```

### Phase 6: Security & Middleware

#### 6.1 Global Middleware

Create `middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // CORS headers
  const response = NextResponse.next();

  response.headers.set(
    'Access-Control-Allow-Origin',
    process.env.CORS_ORIGIN || 'http://localhost:3000',
  );
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

#### 6.2 Rate Limiting

Create `lib/rate-limit.ts`:

```typescript
import { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000,
) {
  const now = Date.now();
  const windowStart = now - windowMs;

  const record = rateLimitMap.get(identifier);

  if (!record || record.resetTime < now) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

export function getRateLimitIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown';
  return ip;
}
```

### Phase 7: Health & Monitoring

#### 7.1 Health Check

Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/database';

export async function GET() {
  try {
    await AppDataSource.initialize();
    await AppDataSource.query('SELECT 1');

    return NextResponse.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: 'Database connection failed' },
      { status: 503 },
    );
  }
}
```

#### 7.2 Metrics

Create `app/api/metrics/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { register, collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics();

export async function GET() {
  const metrics = await register.metrics();
  return new NextResponse(metrics, {
    headers: {
      'Content-Type': register.contentType,
    },
  });
}
```

### Phase 8: Frontend Integration

#### 8.1 API Client

Create `lib/api-client.ts`:

```typescript
class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry the original request
        return this.request(endpoint, options);
      }
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        this.setAccessToken(data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Trip methods
  async createTrip(tripData: any) {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  async getTrips(params?: Record<string, string>) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/trips?${searchParams}`);
  }

  async getNearbyTrips(lon: number, lat: number, radiusMeters = 5000) {
    return this.request(
      `/trips/nearby?lon=${lon}&lat=${lat}&radiusMeters=${radiusMeters}`,
    );
  }

  // Request methods
  async createRequest(tripId: string) {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify({ tripId }),
    });
  }

  async getRequests(type: 'incoming' | 'outgoing') {
    return this.request(`/requests?type=${type}`);
  }
}

export const apiClient = new ApiClient();
```

#### 8.2 Socket.IO Client

Create `lib/socket/client.ts`:

```typescript
import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;
  private accessToken: string | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.accessToken = token;
    this.socket = io(process.env.NEXT_PUBLIC_API_BASE || '', {
      path: '/api/socket',
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChat(chatId: string) {
    if (this.socket) {
      this.socket.emit('join-chat', chatId);
    }
  }

  sendMessage(chatId: string, content: string) {
    if (this.socket) {
      this.socket.emit('message', { chatId, content });
    }
  }

  onMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('message', callback);
    }
  }
}

export const socketManager = new SocketManager();
```

### Phase 9: Deployment Configuration

#### 9.1 Next.js Configuration

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['Prisma'],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.CORS_ORIGIN || 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

#### 9.2 Docker Configuration

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Phase 10: Migration Checklist

#### 10.1 Pre-Migration

- [ ] Backup current NestJS database
- [ ] Document all current API endpoints and their behavior
- [ ] Test all current functionality with existing frontend
- [ ] Set up PostgreSQL with PostGIS extension
- [ ] Configure environment variables

#### 10.2 Core Migration

- [ ] Set up Next.js 15 project with TypeScript
- [ ] Install and configure Prisma with PostgreSQL
- [ ] Create entity definitions matching current schema
- [ ] Implement JWT authentication system
- [ ] Create authentication middleware and guards
- [ ] Migrate all API endpoints to Next.js API routes
- [ ] Implement real-time communication with Socket.IO
- [ ] Add security middleware (CORS, rate limiting, etc.)

#### 10.3 Testing & Validation

- [ ] Test all authentication flows
- [ ] Verify database operations work correctly
- [ ] Test real-time chat functionality
- [ ] Validate PostGIS proximity search
- [ ] Test role-based access control
- [ ] Verify rate limiting works
- [ ] Test health checks and metrics

#### 10.4 Deployment

- [ ] Configure production environment variables
- [ ] Set up database migrations
- [ ] Configure reverse proxy (if needed)
- [ ] Set up monitoring and logging
- [ ] Deploy to production environment
- [ ] Update frontend to use new API endpoints

### Key Differences & Considerations

#### NestJS vs Next.js API Routes

1. **Module System**: NestJS uses decorators and dependency injection; Next.js uses file-based routing
2. **Middleware**: NestJS has global guards and interceptors; Next.js uses middleware functions
3. **Validation**: NestJS uses class-validator; Next.js typically uses Zod
4. **Database**: Both can use Prisma, but configuration differs
5. **Real-time**: NestJS has built-in WebSocket support; Next.js requires Socket.IO setup

#### Performance Considerations

1. **Cold Starts**: Next.js API routes may have cold start latency
2. **Database Connections**: Consider connection pooling for production
3. **Caching**: Implement Redis for session storage and caching
4. **Rate Limiting**: Use Redis-based rate limiting for production

#### Security Considerations

1. **JWT Secrets**: Use strong, unique secrets for production
2. **CORS**: Configure CORS properly for your domain
3. **Rate Limiting**: Implement proper rate limiting
4. **Input Validation**: Validate all inputs with Zod schemas
5. **SQL Injection**: Use parameterized queries with Prisma

This migration guide provides a comprehensive path from your current NestJS backend to Next.js 15 API routes while maintaining all the functionality and security features of your ride-sharing platform.
