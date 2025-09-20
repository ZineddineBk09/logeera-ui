const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...');
    
    // Try to query each table to see if it exists
    const tables = [
      'User',
      'Trip', 
      'Request',
      'Chat',
      'Message',
      'Rating',
      'BlockedUser',
      'ContactSubmission'
    ];
    
    for (const table of tables) {
      try {
        const count = await prisma[table].count();
        console.log(`✅ ${table}: ${count} records`);
      } catch (error) {
        console.log(`❌ ${table}: Table does not exist (${error.message})`);
      }
    }
    
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
