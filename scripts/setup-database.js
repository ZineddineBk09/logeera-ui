#!/usr/bin/env node

/**
 * Database setup script for PostGIS and initial schema
 * Run this before your first migration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🚀 Setting up database with PostGIS...');
  
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      console.log('💡 Please set DATABASE_URL in your .env file');
      console.log('   Example: DATABASE_URL="postgresql://user:password@localhost:5432/logeera"');
      process.exit(1);
    }

    console.log('📋 DATABASE_URL found:', process.env.DATABASE_URL.replace(/\/\/.*@/, '//***:***@'));

    // Generate Prisma client first
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Check if this is a fresh database or existing one
    console.log('🔍 Checking database state...');
    try {
      // Try to run migrations first
      console.log('🗄️ Running database migrations...');
      execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    } catch (migrationError) {
      console.log('⚠️  Migration failed, likely due to existing schema...');
      console.log('🔄 Resetting database to start fresh...');
      
      // Reset the database and start fresh
      execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
      
      // Run migrations again
      console.log('🗄️ Running fresh migrations...');
      execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    }

    // Run PostGIS extension setup after migration
    console.log('📦 Installing PostGIS extension...');
    try {
      execSync(`npx prisma db execute --file ./lib/database-extensions.sql --schema ./prisma/schema.prisma`, {
        stdio: 'inherit',
        env: { ...process.env }
      });
    } catch (postgisError) {
      console.log('⚠️  PostGIS extension setup failed, but continuing...');
      console.log('   This might be because PostGIS is already installed or not available');
      console.log('   The app will still work, but geospatial features may be limited');
    }

    console.log('✅ Database setup completed successfully!');
    console.log('🎉 Your ride-sharing platform is ready to go!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run db:seed (to populate with test data)');
    console.log('   2. Run: npm run dev (to start the development server)');
    console.log('   3. Run: npm run db:studio (to view the database)');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check your DATABASE_URL in .env file');
    console.log('   3. Ensure the database exists and is accessible');
    console.log('   4. Try running: npx prisma migrate reset --force');
    process.exit(1);
  }
}

setupDatabase();
