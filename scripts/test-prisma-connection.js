#!/usr/bin/env node

/**
 * Quick Prisma Connection Test
 * Run this to verify your database connection is working
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('🔍 Testing Prisma connection...\n');

    // Test 1: Basic connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connected successfully!\n');

    // Test 2: Query users table
    console.log('2️⃣ Testing User model...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ User model works! (${userCount} users found)\n`);

    // Test 3: Query trips table
    console.log('3️⃣ Testing Trip model...');
    const tripCount = await prisma.trip.count();
    console.log(`   ✅ Trip model works! (${tripCount} trips found)\n`);

    // Test 4: Query requests table
    console.log('4️⃣ Testing Request model...');
    const requestCount = await prisma.request.count();
    console.log(`   ✅ Request model works! (${requestCount} requests found)\n`);

    // Test 5: Test a complex query
    console.log('5️⃣ Testing complex query (trips with publisher)...');
    const trips = await prisma.trip.findMany({
      take: 1,
      include: {
        publisher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    console.log(`   ✅ Complex queries work! (found ${trips.length} trip(s))\n`);

    console.log('🎉 All tests passed! Prisma is working correctly.\n');
    console.log('💡 If API requests are still failing, try:');
    console.log('   1. Restart your Next.js dev server (Ctrl+C, then npm run dev)');
    console.log('   2. Clear Next.js cache: rm -rf .next');
    console.log('   3. Check your API route handlers for errors\n');

  } catch (error) {
    console.error('❌ Error testing Prisma connection:\n');
    console.error(error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your DATABASE_URL in .env.local');
    console.error('   2. Make sure PostgreSQL is running');
    console.error('   3. Run: npx prisma generate');
    console.error('   4. Run: npx prisma migrate deploy');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

