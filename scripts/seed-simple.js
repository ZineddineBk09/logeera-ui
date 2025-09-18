#!/usr/bin/env node

/**
 * Simple database seed script (without PostGIS dependency)
 * Use this if you don't have PostGIS installed
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Sample data with simple coordinate strings (no PostGIS required)
const users = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1234567890',
    type: 'INDIVIDUAL',
    officialIdNumber: 'ID123456789',
    status: 'TRUSTED',
    role: 'USER',
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phoneNumber: '+1234567891',
    type: 'INDIVIDUAL',
    officialIdNumber: 'ID123456790',
    status: 'TRUSTED',
    role: 'USER',
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phoneNumber: '+1234567892',
    type: 'INDIVIDUAL',
    officialIdNumber: 'ID123456791',
    status: 'PENDING',
    role: 'USER',
  },
  {
    name: 'Admin User',
    email: 'admin@logeera.com',
    phoneNumber: '+1234567894',
    type: 'INDIVIDUAL',
    officialIdNumber: 'ADMIN001',
    status: 'TRUSTED',
    role: 'ADMIN',
  },
];

const trips = [
  {
    originGeom: 'POINT(-122.4194 37.7749)', // San Francisco
    destinationGeom: 'POINT(-122.0574 37.4419)', // Palo Alto
    originName: 'San Francisco, CA',
    destinationName: 'Palo Alto, CA',
    departureAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    vehicleType: 'CAR',
    capacity: 3,
    status: 'PUBLISHED',
  },
  {
    originGeom: 'POINT(-122.0574 37.4419)', // Palo Alto
    destinationGeom: 'POINT(-122.4194 37.7749)', // San Francisco
    originName: 'Palo Alto, CA',
    destinationName: 'San Francisco, CA',
    departureAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
    vehicleType: 'VAN',
    capacity: 6,
    status: 'PUBLISHED',
  },
  {
    originGeom: 'POINT(-122.2711 37.8044)', // Oakland
    destinationGeom: 'POINT(-121.8863 37.3382)', // San Jose
    originName: 'Oakland, CA',
    destinationName: 'San Jose, CA',
    departureAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
    vehicleType: 'CAR',
    capacity: 4,
    status: 'PUBLISHED',
  },
];

async function seed() {
  console.log('🌱 Starting simple database seeding...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.rating.deleteMany();
    await prisma.message.deleteMany();
    await prisma.chat.deleteMany();
    await prisma.request.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      const passwordHash = await bcrypt.hash('password123', 12);
      const user = await prisma.user.create({
        data: {
          ...userData,
          passwordHash,
        },
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }

    // Create trips
    console.log('🚗 Creating trips...');
    const createdTrips = [];
    for (let i = 0; i < trips.length; i++) {
      const tripData = trips[i];
      const publisher = createdUsers[i % createdUsers.length];

      const trip = await prisma.trip.create({
        data: {
          ...tripData,
          publisherId: publisher.id,
        },
      });
      createdTrips.push(trip);
      console.log(
        `✅ Created trip: ${trip.originName} → ${trip.destinationName}`,
      );
    }

    // Create a simple chat
    console.log('💬 Creating chat...');
    const chat = await prisma.chat.create({
      data: {
        userAId: createdUsers[0].id,
        userBId: createdUsers[1].id,
      },
    });

    // Add some messages
    const messages = [
      "Hi! I'm interested in your trip.",
      'Great! What time works for you?',
      '8 AM would be perfect.',
    ];

    for (let i = 0; i < messages.length; i++) {
      const senderId = i % 2 === 0 ? createdUsers[0].id : createdUsers[1].id;
      await prisma.message.create({
        data: {
          content: messages[i],
          chatId: chat.id,
          senderId,
        },
      });
    }
    console.log(`✅ Created chat with ${messages.length} messages`);

    // Create a rating
    console.log('⭐ Creating rating...');
    await prisma.rating.create({
      data: {
        ratedUserId: createdUsers[0].id,
        reviewerUserId: createdUsers[1].id,
        value: 5,
        comment: 'Great driver!',
      },
    });

    // Update user's average rating
    await prisma.user.update({
      where: { id: createdUsers[0].id },
      data: {
        averageRating: 5,
        ratingCount: 1,
      },
    });
    console.log('✅ Created rating');

    console.log('\n🎉 Simple database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`🚗 Trips: ${createdTrips.length}`);
    console.log(`💬 Chats: 1`);
    console.log(`⭐ Ratings: 1`);

    console.log('\n🔑 Test Credentials:');
    console.log('Email: john.doe@example.com | Password: password123');
    console.log('Email: jane.smith@example.com | Password: password123');
    console.log('Email: admin@logeera.com | Password: password123');

    console.log('\n🚀 You can now start testing the API endpoints!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seed().catch((error) => {
  console.error('💥 Seed script failed:', error);
  process.exit(1);
});
