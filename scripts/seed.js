#!/usr/bin/env node

/**
 * Database seed script for Logeera ride-sharing platform
 * Populates all tables with realistic test data
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Sample data
const users = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1234567890',
    type: 'PERSON',
    officialIdNumber: 'ID123456789',
    status: 'TRUSTED',
    role: 'USER',
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phoneNumber: '+1234567891',
    type: 'PERSON',
    officialIdNumber: 'ID123456790',
    status: 'TRUSTED',
    role: 'USER',
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phoneNumber: '+1234567892',
    type: 'PERSON',
    officialIdNumber: 'ID123456791',
    status: 'PENDING',
    role: 'USER',
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    phoneNumber: '+1234567893',
    type: 'BUSINESS',
    officialIdNumber: 'COMP123456',
    status: 'TRUSTED',
    role: 'USER',
  },
  {
    name: 'Admin User',
    email: 'admin@logeera.com',
    phoneNumber: '+1234567894',
    type: 'PERSON',
    officialIdNumber: 'ADMIN001',
    status: 'TRUSTED',
    role: 'ADMIN',
  },
  {
    name: 'Moderator User',
    email: 'moderator@logeera.com',
    phoneNumber: '+1234567895',
    type: 'PERSON',
    officialIdNumber: 'MOD001',
    status: 'TRUSTED',
    role: 'MODERATOR',
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
  {
    originGeom: 'POINT(-121.8863 37.3382)', // San Jose
    destinationGeom: 'POINT(-122.2711 37.8044)', // Oakland
    originName: 'San Jose, CA',
    destinationName: 'Oakland, CA',
    departureAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // In 4 days
    vehicleType: 'TRUCK',
    capacity: 2,
    status: 'PUBLISHED',
  },
  {
    originGeom: 'POINT(-122.4194 37.7749)', // San Francisco
    destinationGeom: 'POINT(-121.8863 37.3382)', // San Jose
    originName: 'San Francisco, CA',
    destinationName: 'San Jose, CA',
    departureAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday (completed)
    vehicleType: 'CAR',
    capacity: 3,
    status: 'COMPLETED',
  },
];

const requests = [
  {
    status: 'PENDING',
  },
  {
    status: 'ACCEPTED',
  },
  {
    status: 'REJECTED',
  },
  {
    status: 'PENDING',
  },
];

const ratings = [
  {
    value: 5,
    comment: 'Great driver, very punctual and friendly!',
  },
  {
    value: 4,
    comment: 'Good trip, would ride again.',
  },
  {
    value: 5,
    comment: 'Excellent service, highly recommended.',
  },
  {
    value: 3,
    comment: 'Average experience, could be better.',
  },
  {
    value: 5,
    comment: 'Perfect ride, very professional.',
  },
];

const messages = [
  {
    content:
      "Hi! I'm interested in your trip to Palo Alto. What time are you planning to leave?",
  },
  {
    content: 'I can leave around 8 AM. Does that work for you?',
  },
  {
    content: 'Perfect! That works great for me. Where should I meet you?',
  },
  {
    content:
      "I can pick you up at the BART station. I'll send you the exact location.",
  },
  {
    content: "Sounds good! I'll be there at 7:45 AM. Thanks!",
  },
  {
    content: 'Great! See you tomorrow morning.',
  },
];

async function seed() {
  console.log('🌱 Starting database seeding...');

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
      const publisher = createdUsers[i % createdUsers.length]; // Distribute trips among users

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

    // Create requests
    console.log('📋 Creating requests...');
    const createdRequests = [];
    for (let i = 0; i < requests.length; i++) {
      const requestData = requests[i];
      const trip = createdTrips[i % createdTrips.length];
      const applicant = createdUsers[(i + 1) % createdUsers.length]; // Different user as applicant

      // Don't create request if applicant is the same as publisher
      if (applicant.id === trip.publisherId) {
        continue;
      }

      const request = await prisma.request.create({
        data: {
          ...requestData,
          tripId: trip.id,
          applicantId: applicant.id,
        },
      });
      createdRequests.push(request);
      console.log(`✅ Created request: ${request.status} for trip ${trip.id}`);
    }

    // Create chats and messages
    console.log('💬 Creating chats and messages...');
    const createdChats = [];

    // Create chat between first two users
    const chat1 = await prisma.chat.create({
      data: {
        userAId: createdUsers[0].id,
        userBId: createdUsers[1].id,
      },
    });
    createdChats.push(chat1);

    // Add messages to first chat
    for (let i = 0; i < messages.length; i++) {
      const messageData = messages[i];
      const senderId = i % 2 === 0 ? createdUsers[0].id : createdUsers[1].id; // Alternate senders

      await prisma.message.create({
        data: {
          ...messageData,
          chatId: chat1.id,
          senderId,
        },
      });
    }
    console.log(`✅ Created chat with ${messages.length} messages`);

    // Create another chat between different users
    const chat2 = await prisma.chat.create({
      data: {
        userAId: createdUsers[1].id,
        userBId: createdUsers[2].id,
      },
    });
    createdChats.push(chat2);

    // Add a few messages to second chat
    const chat2Messages = [
      'Hello! Are you still going to San Jose tomorrow?',
      'Yes, I am. Would you like to join?',
      'That would be great! What time?',
    ];

    for (let i = 0; i < chat2Messages.length; i++) {
      const senderId = i % 2 === 0 ? createdUsers[1].id : createdUsers[2].id;

      await prisma.message.create({
        data: {
          content: chat2Messages[i],
          chatId: chat2.id,
          senderId,
        },
      });
    }
    console.log(`✅ Created second chat with ${chat2Messages.length} messages`);

    // Create ratings
    console.log('⭐ Creating ratings...');
    for (let i = 0; i < ratings.length; i++) {
      const ratingData = ratings[i];
      const ratedUser = createdUsers[i % createdUsers.length];
      const reviewerUser = createdUsers[(i + 1) % createdUsers.length];

      // Don't create rating if reviewer is the same as rated user
      if (reviewerUser.id === ratedUser.id) {
        continue;
      }

      const rating = await prisma.rating.create({
        data: {
          ...ratingData,
          ratedUserId: ratedUser.id,
          reviewerUserId: reviewerUser.id,
        },
      });

      // Update user's average rating
      const userRatings = await prisma.rating.findMany({
        where: { ratedUserId: ratedUser.id },
      });
      const averageRating =
        userRatings.reduce((sum, r) => sum + r.value, 0) / userRatings.length;

      await prisma.user.update({
        where: { id: ratedUser.id },
        data: {
          averageRating,
          ratingCount: userRatings.length,
        },
      });

      console.log(
        `✅ Created rating: ${rating.value}/5 stars for ${ratedUser.name}`,
      );
    }

    // Create some additional test data
    console.log('🔧 Creating additional test data...');

    // Create a few more trips with different statuses
    const additionalTrips = [
      {
        originGeom: 'POINT(-122.4194 37.7749)',
        destinationGeom: 'POINT(-122.0574 37.4419)',
        originName: 'San Francisco, CA',
        destinationName: 'Palo Alto, CA',
        departureAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        vehicleType: 'BIKE',
        capacity: 1,
        status: 'PUBLISHED',
        publisherId: createdUsers[3].id,
      },
      {
        originGeom: 'POINT(-122.2711 37.8044)',
        destinationGeom: 'POINT(-121.8863 37.3382)',
        originName: 'Oakland, CA',
        destinationName: 'San Jose, CA',
        departureAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        vehicleType: 'CAR',
        capacity: 4,
        status: 'CANCELLED',
        publisherId: createdUsers[4].id,
      },
    ];

    for (const tripData of additionalTrips) {
      await prisma.trip.create({ data: tripData });
      console.log(
        `✅ Created additional trip: ${tripData.originName} → ${tripData.destinationName} (${tripData.status})`,
      );
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`🚗 Trips: ${createdTrips.length + additionalTrips.length}`);
    console.log(`📋 Requests: ${createdRequests.length}`);
    console.log(`💬 Chats: ${createdChats.length}`);
    console.log(`⭐ Ratings: ${ratings.length}`);

    console.log('\n🔑 Test Credentials:');
    console.log('Email: john.doe@example.com | Password: password123');
    console.log('Email: jane.smith@example.com | Password: password123');
    console.log('Email: admin@logeera.com | Password: password123');
    console.log('Email: moderator@logeera.com | Password: password123');

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
