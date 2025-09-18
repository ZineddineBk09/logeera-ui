// const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

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

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `API Error: ${response.status} - ${data.error || 'Unknown error'}`,
    );
  }

  return { data, response };
}

// Helper function to get random element from array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random date in the future
function getRandomFutureDate() {
  const now = new Date();
  const futureDate = new Date(
    now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000,
  ); // Next 30 days
  return futureDate.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Helper function to get random time
function getRandomTime() {
  const hours = Math.floor(Math.random() * 24)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor(Math.random() * 60)
    .toString()
    .padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Helper function to create WKT POINT
function createWKTPoint(lat, lng) {
  return `POINT(${lng} ${lat})`;
}

// Generate user data
function generateUser(index, isAdmin = false) {
  const firstNames = [
    'Ahmed',
    'Fatima',
    'Mohamed',
    'Aisha',
    'Omar',
    'Zainab',
    'Hassan',
    'Mariam',
    'Ali',
    'Khadija',
  ];
  const lastNames = [
    'Hassan',
    'Mohamed',
    'Ali',
    'Ahmed',
    'Ibrahim',
    'Osman',
    'Abdi',
    'Farah',
    'Omar',
    'Said',
  ];

  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`;
  const phone = `+25470${Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, '0')}`;

  return {
    name,
    email,
    phoneNumber: phone,
    password: 'Password123!',
    type: isAdmin ? 'INDIVIDUAL' : getRandomElement(userTypes),
    officialIdNumber: `ID${Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0')}`,
    agreeToTerms: true,
  };
}

// Generate trip data
function generateTrip(cities) {
  const origin = getRandomElement(cities);
  let destination = getRandomElement(cities);

  // Ensure origin and destination are different
  while (destination.name === origin.name) {
    destination = getRandomElement(cities);
  }

  return {
    origin: createWKTPoint(origin.lat, origin.lng),
    destination: createWKTPoint(destination.lat, destination.lng),
    originName: origin.name,
    destinationName: destination.name,
    departureAt: new Date(
      `${getRandomFutureDate()}T${getRandomTime()}:00`,
    ).toISOString(),
    vehicleType: getRandomElement(vehicleTypes),
    capacity: Math.floor(Math.random() * 4) + 2, // 2-5 seats
    pricePerSeat: Math.floor(Math.random() * 50) + 20, // $20-70
  };
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    const users = [];
    const userTokens = [];

    // Step 1: Create admin user (or login if exists)
    console.log('👤 Creating admin user...');
    const adminData = generateUser(0, true);
    adminData.email = 'admin@logeera.com';
    adminData.name = 'Admin User';

    let adminResponse;
    try {
      const { data } = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(adminData),
      });
      adminResponse = data;
      console.log('✅ Admin user created:', adminData.email);
    } catch (error) {
      if (error.message.includes('409')) {
        // User already exists, try to login
        console.log('👤 Admin user exists, logging in...');
        const { data } = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: adminData.email,
            password: adminData.password,
          }),
        });
        adminResponse = data;
        console.log('✅ Admin user logged in:', adminData.email);
      } else {
        throw error;
      }
    }

    users.push({ ...adminData, id: adminResponse.user?.id });
    userTokens.push(adminResponse.accessToken);

    // Note: Admin role needs to be set manually in the database
    console.log(
      "⚠️  Remember to set admin role manually: UPDATE users SET role = 'ADMIN' WHERE email = 'admin@logeera.com';",
    );

    // Step 2: Create 10 regular users
    console.log('👥 Creating 10 regular users...');
    for (let i = 1; i <= 10; i++) {
      const userData = generateUser(i);

      let userResponse;
      try {
        const { data } = await apiRequest('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(userData),
        });
        userResponse = data;
        console.log(`✅ User ${i} created:`, userData.email);
      } catch (error) {
        if (error.message.includes('409')) {
          // User already exists, try to login
          console.log(`👤 User ${i} exists, logging in:`, userData.email);
          const { data } = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
              email: userData.email,
              password: userData.password,
            }),
          });
          userResponse = data;
          console.log(`✅ User ${i} logged in:`, userData.email);
        } else {
          console.log(`❌ User ${i} failed:`, error.message);
          continue;
        }
      }

      users.push({ ...userData, id: userResponse.user?.id });
      userTokens.push(userResponse.accessToken);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Step 3: Create trips for each regular user
    console.log('🚗 Creating trips...');
    const trips = [];

    for (let i = 1; i <= 10; i++) {
      // Skip admin user (index 0)
      const tripData = generateTrip(africanCities);

      const { data: tripResponse } = await apiRequest('/api/trips', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userTokens[i]}`,
        },
        body: JSON.stringify(tripData),
      });

      trips.push({ ...tripResponse, publisherIndex: i });
      console.log(
        `✅ Trip ${i} created: ${tripData.originName} → ${tripData.destinationName}`,
      );

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Step 4: Create requests (each user requests to join other users' trips)
    console.log('📋 Creating trip requests...');
    const requests = [];

    for (let requesterIndex = 1; requesterIndex <= 10; requesterIndex++) {
      // Each user makes 2-3 random requests to other users' trips
      const numRequests = Math.floor(Math.random() * 2) + 2; // 2-3 requests

      for (let j = 0; j < numRequests; j++) {
        // Find a trip from a different user
        const availableTrips = trips.filter(
          (trip) => trip.publisherIndex !== requesterIndex,
        );
        if (availableTrips.length === 0) continue;

        const targetTrip = getRandomElement(availableTrips);

        try {
          const { data: requestResponse } = await apiRequest('/api/requests', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${userTokens[requesterIndex]}`,
            },
            body: JSON.stringify({
              tripId: targetTrip.id,
            }),
          });

          requests.push({
            ...requestResponse,
            tripId: targetTrip.id,
            publisherIndex: targetTrip.publisherIndex,
            requesterIndex,
          });

          console.log(
            `✅ Request created: User ${requesterIndex} → Trip ${targetTrip.publisherIndex}`,
          );
        } catch (error) {
          console.log(`⚠️  Request failed: ${error.message}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Step 5: Process requests (accept 5, reject 3, keep 2 pending)
    console.log('⚖️  Processing requests...');

    // Shuffle requests for random processing
    const shuffledRequests = [...requests].sort(() => Math.random() - 0.5);

    let acceptCount = 0;
    let rejectCount = 0;

    for (const request of shuffledRequests) {
      let status;

      if (acceptCount < 5) {
        status = 'ACCEPTED';
        acceptCount++;
      } else if (rejectCount < 3) {
        status = 'REJECTED';
        rejectCount++;
      } else {
        // Keep remaining as PENDING
        continue;
      }

      try {
        await apiRequest(`/api/requests/${request.id}/status`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${userTokens[request.publisherIndex]}`,
          },
          body: JSON.stringify({ status }),
        });

        console.log(`✅ Request ${status.toLowerCase()}: ${request.id}`);
      } catch (error) {
        console.log(`⚠️  Request processing failed: ${error.message}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👤 Users created: ${users.length} (1 admin + 10 regular)`);
    console.log(`🚗 Trips created: ${trips.length}`);
    console.log(`📋 Requests created: ${requests.length}`);
    console.log(`✅ Requests accepted: ${acceptCount}`);
    console.log(`❌ Requests rejected: ${rejectCount}`);
    console.log(
      `⏳ Requests pending: ${requests.length - acceptCount - rejectCount}`,
    );

    console.log('\n🔐 Admin Login:');
    console.log(`Email: admin@logeera.com`);
    console.log(`Password: Password123!`);

    console.log('\n👥 Sample User Logins:');
    for (let i = 1; i <= 3; i++) {
      console.log(`Email: ${users[i].email}`);
      console.log(`Password: Password123!`);
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding script
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n✨ Seeding script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
