const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// African cities with coordinates for realistic trips
const africanCities = [
  { name: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357 },
  { name: 'Lagos, Nigeria', lat: 6.5244, lng: 3.3792 },
  { name: 'Kinshasa, DRC', lat: -4.4419, lng: 15.2663 },
  { name: 'Johannesburg, South Africa', lat: -26.2041, lng: 28.0473 },
  { name: 'Luanda, Angola', lat: -8.839, lng: 13.2894 },
  { name: 'Nairobi, Kenya', lat: -1.2921, lng: 36.8219 },
  { name: 'Casablanca, Morocco', lat: 33.5731, lng: -7.5898 },
  { name: 'Addis Ababa, Ethiopia', lat: 9.145, lng: 40.4897 },
  { name: 'Cape Town, South Africa', lat: -33.9249, lng: 18.4241 },
  { name: 'Tunis, Tunisia', lat: 36.8065, lng: 10.1815 },
  { name: 'Algiers, Algeria', lat: 36.7538, lng: 3.0588 },
  { name: 'Accra, Ghana', lat: 5.6037, lng: -0.187 },
  { name: 'Dakar, Senegal', lat: 14.7167, lng: -17.4677 },
  { name: 'Kampala, Uganda', lat: 0.3476, lng: 32.5825 },
  { name: 'Dar es Salaam, Tanzania', lat: -6.7924, lng: 39.2083 },
];

const vehicleTypes = ['CAR', 'VAN', 'TRUCK', 'BIKE'];
const userTypes = ['INDIVIDUAL', 'COMPANY'];

// Helper function to get random element from array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random date in the future
function getRandomFutureDate() {
  const now = new Date();
  const futureDate = new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // 30 days from now
  return futureDate;
}

// Helper function to generate random phone number
function generatePhoneNumber() {
  const prefixes = ['+234', '+27', '+20', '+212', '+213', '+216', '+220', '+221', '+222', '+223', '+224', '+225', '+226', '+227', '+228', '+229', '+230', '+231', '+232', '+233', '+235', '+236', '+237', '+238', '+239', '+240', '+241', '+242', '+243', '+244', '+245', '+246', '+247', '+248', '+249', '+250', '+251', '+252', '+253', '+254', '+255', '+256', '+257', '+258', '+260', '+261', '+262', '+263', '+264', '+265', '+266', '+267', '+268', '+269', '+290', '+291', '+297', '+298'];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(Math.random() * 900000000) + 100000000;
  return `${prefix}${number}`;
}

// Helper function to generate user data
function generateUser(isAdmin = false) {
  const names = [
    'Ahmed Hassan', 'Fatima Ali', 'Mohamed Ibrahim', 'Aisha Omar', 'Omar Hassan',
    'Khadija Mohamed', 'Yusuf Ali', 'Zainab Ahmed', 'Hassan Mohamed', 'Amina Hassan',
    'Ibrahim Ali', 'Mariam Omar', 'Ali Ahmed', 'Hawa Mohamed', 'Abdullah Hassan',
    'Halima Ali', 'Omar Mohamed', 'Aisha Hassan', 'Mohamed Ali', 'Fatima Omar'
  ];

  const name = isAdmin ? 'Admin User' : getRandomElement(names);
  const email = isAdmin ? 'admin@logeera.com' : `${name.toLowerCase().replace(/\s+/g, '.')}${Math.floor(Math.random() * 1000)}@logeera.com`;
  const userType = isAdmin ? 'INDIVIDUAL' : getRandomElement(userTypes);
  
  return {
    name,
    email,
    password: 'password123', // Default password for all users
    phoneNumber: generatePhoneNumber(),
    type: userType,
    role: isAdmin ? 'ADMIN' : 'USER',
    status: isAdmin ? 'TRUSTED' : getRandomElement(['PENDING', 'TRUSTED']),
  };
}

// Helper function to generate trip data
function generateTrip(publisherId) {
  const origin = getRandomElement(africanCities);
  const destination = getRandomElement(africanCities.filter(city => city.name !== origin.name));
  const departureAt = getRandomFutureDate();
  const capacity = Math.floor(Math.random() * 6) + 2; // 2-7 seats
  const pricePerSeat = Math.floor(Math.random() * 200) + 50; // $50-$250
  
  return {
    publisherId,
    originName: origin.name,
    destinationName: destination.name,
    originGeom: `POINT(${origin.lng} ${origin.lat})`,
    destinationGeom: `POINT(${destination.lng} ${destination.lat})`,
    departureAt,
    capacity,
    pricePerSeat,
    vehicleType: getRandomElement(vehicleTypes),
    status: 'PUBLISHED',
    bookedSeats: 0,
  };
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.rating.deleteMany();
    await prisma.request.deleteMany();
    await prisma.message.deleteMany();
    await prisma.chat.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.blockedUser.deleteMany();
    await prisma.contactSubmission.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminData = generateUser(true);
    const adminHashedPassword = await bcrypt.hash(adminData.password, 12);
    
    const { password, ...adminDataWithoutPassword } = adminData;
    const admin = await prisma.user.create({
      data: {
        ...adminDataWithoutPassword,
        passwordHash: adminHashedPassword,
      },
    });
    console.log(`✅ Admin user created: ${admin.email}`);

    // Create regular users
    console.log('👥 Creating regular users...');
    const users = [];
    const userPasswords = [];

    for (let i = 0; i < 10; i++) {
      const userData = generateUser(false);
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const { password, ...userDataWithoutPassword } = userData;
      const user = await prisma.user.create({
        data: {
          ...userDataWithoutPassword,
          passwordHash: hashedPassword,
        },
      });
      
      users.push(user);
      userPasswords.push(userData.password);
      console.log(`✅ User created: ${user.email}`);
    }

    // Create trips for each user
    console.log('🚗 Creating trips...');
    const trips = [];

    for (const user of users) {
      const tripData = generateTrip(user.id);
      const trip = await prisma.trip.create({
        data: tripData,
      });
      trips.push(trip);
      console.log(`✅ Trip created: ${trip.originName} → ${trip.destinationName}`);
    }

    // Create requests (users booking seats in other trips)
    console.log('📋 Creating requests...');
    const requests = [];

    for (const user of users) {
      // Each user makes 2-3 requests to other trips
      const numRequests = Math.floor(Math.random() * 2) + 2;
      const availableTrips = trips.filter(trip => trip.publisherId !== user.id);
      
      for (let i = 0; i < numRequests && i < availableTrips.length; i++) {
        const trip = getRandomElement(availableTrips.filter(t => 
          !requests.some(r => r.tripId === t.id && r.applicantId === user.id)
        ));
        
        if (trip) {
          const request = await prisma.request.create({
            data: {
              tripId: trip.id,
              applicantId: user.id,
              status: getRandomElement(['PENDING', 'ACCEPTED', 'REJECTED']),
            },
          });
          requests.push(request);
          console.log(`✅ Request created: ${user.name} → ${trip.originName} → ${trip.destinationName}`);
        }
      }
    }

    // Update trip booked seats for accepted requests
    console.log('📊 Updating trip booked seats...');
    const acceptedRequests = requests.filter(r => r.status === 'ACCEPTED');
    
    for (const request of acceptedRequests) {
      // For simplicity, assume each accepted request adds 1 seat
      await prisma.trip.update({
        where: { id: request.tripId },
        data: {
          bookedSeats: {
            increment: 1,
          },
        },
      });
    }

    // Create some chats between users
    console.log('💬 Creating chats...');
    const chatPairs = [];
    
    for (let i = 0; i < 5; i++) {
      const user1 = getRandomElement(users);
      const user2 = getRandomElement(users.filter(u => u.id !== user1.id));
      
      // Check if chat already exists
      const existingChat = chatPairs.find(pair => 
        (pair.userAId === user1.id && pair.userBId === user2.id) ||
        (pair.userAId === user2.id && pair.userBId === user1.id)
      );
      
      if (!existingChat) {
        const chat = await prisma.chat.create({
          data: {
            userAId: user1.id,
            userBId: user2.id,
          },
        });
        chatPairs.push({ userAId: user1.id, userBId: user2.id, chatId: chat.id });
        console.log(`✅ Chat created: ${user1.name} ↔ ${user2.name}`);
      }
    }

    // Create some messages in chats
    console.log('💌 Creating messages...');
    const messages = [
      "Hi! I'm interested in your trip. Is it still available?",
      "Yes, it is! How many seats do you need?",
      "I need 2 seats. What time do we leave?",
      "We leave at 8 AM sharp. I'll send you the exact location.",
      "Perfect! Looking forward to the journey.",
      "Great! I'll confirm your booking.",
      "Thank you so much! See you soon.",
      "Safe travels! Let me know if you need anything.",
      "Will do! Thanks again.",
      "You're welcome! Have a great trip!"
    ];

    for (const chatPair of chatPairs) {
      const numMessages = Math.floor(Math.random() * 5) + 3; // 3-7 messages
      
      for (let i = 0; i < numMessages; i++) {
        const isUserA = i % 2 === 0;
        const senderId = isUserA ? chatPair.userAId : chatPair.userBId;
        const messageText = getRandomElement(messages);
        
        await prisma.message.create({
          data: {
            chatId: chatPair.chatId,
            senderId,
            content: messageText,
          },
        });
      }
      console.log(`✅ Messages created for chat between users`);
    }

    // Create some ratings
    console.log('⭐ Creating ratings...');
    const completedTrips = trips.slice(0, 5); // Use first 5 trips as completed
    
    for (const trip of completedTrips) {
      const tripRequests = requests.filter(r => r.tripId === trip.id && r.status === 'ACCEPTED');
      
      for (const request of tripRequests) {
        const rating = await prisma.rating.create({
          data: {
            reviewerUserId: request.applicantId,
            ratedUserId: trip.publisherId,
            tripId: trip.id,
            value: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            comment: getRandomElement([
              'Great trip! Very comfortable and safe.',
              'Excellent driver, highly recommended!',
              'Smooth journey, will definitely book again.',
              'Professional service, on time departure.',
              'Comfortable ride, friendly driver.'
            ]),
          },
        });
        console.log(`✅ Rating created: ${rating.value} stars`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - 1 Admin user`);
    console.log(`   - ${users.length} Regular users`);
    console.log(`   - ${trips.length} Trips`);
    console.log(`   - ${requests.length} Requests`);
    console.log(`   - ${chatPairs.length} Chats`);
    console.log(`   - ${messages.length} Messages`);
    console.log(`   - ${completedTrips.length} Trip ratings`);

    // Display login credentials
    console.log('\n🔑 Login Credentials:');
    console.log(`Admin: admin@logeera.com / password123`);
    console.log(`Regular users: [name]@logeera.com / password123`);
    console.log(`\n🌐 You can view the data at: http://localhost:5555 (Prisma Studio)`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedDatabase()
  .then(() => {
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
