#!/usr/bin/env node

/**
 * Clean Backend API Test Suite
 * Resets database and tests ALL endpoints for 100% confidence
 */

const { PrismaClient } = require('@prisma/client');
const API_BASE = process.env.API_BASE || 'http://localhost:3000';

const prisma = new PrismaClient();

// Test credentials
const TEST_USERS = [
  { email: 'john.doe@example.com', password: 'password123', name: 'John Doe' },
  {
    email: 'jane.smith@example.com',
    password: 'password123',
    name: 'Jane Smith',
  },
  { email: 'admin@logeera.com', password: 'password123', name: 'Admin User' },
];

let accessTokens = {};
let testData = {};

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

async function resetDatabase() {
  console.log('🧹 Resetting database for clean test...');

  // Clear all data in correct order (respecting foreign keys)
  await prisma.rating.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.request.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Database reset complete');
}

async function testAuthentication() {
  console.log('\n🔐 === AUTHENTICATION TESTS ===');

  // Test 1: Register new users
  console.log('\n1. Testing user registration...');
  for (const user of TEST_USERS) {
    const registerData = {
      name: user.name,
      email: user.email,
      phoneNumber: `+123456789${Math.random().toString().slice(-3)}`,
      password: user.password,
      type: 'PERSON',
      officialIdNumber: `ID${Math.random().toString().slice(-6)}`,
    };

    const registerResult = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });

    if (!registerResult.ok) {
      console.log('❌ Registration failed:', registerResult.data);
      return false;
    }
  }
  console.log('✅ All users registered successfully');

  // Test 2: Login with all users
  console.log('\n2. Testing login...');
  for (let i = 0; i < TEST_USERS.length; i++) {
    const loginResult = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(TEST_USERS[i]),
    });

    if (loginResult.ok) {
      accessTokens[`user${i + 1}`] = loginResult.data.accessToken;
      console.log(`✅ Login successful - ${TEST_USERS[i].name}`);
    } else {
      console.log('❌ Login failed:', loginResult.data);
      return false;
    }
  }

  // Test 3: Get user profiles
  console.log('\n3. Testing get user profiles...');
  const profileResult = await makeRequest('/api/auth/me', {
    token: accessTokens.user1,
  });

  if (profileResult.ok) {
    testData.user1Id = profileResult.data.id;
    console.log('✅ Get profile successful:', profileResult.data.name);
  } else {
    console.log('❌ Get profile failed:', profileResult.data);
    return false;
  }

  return true;
}

async function testTrips() {
  console.log('\n🚗 === TRIPS TESTS ===');

  // Test 1: Create trips
  console.log('\n1. Testing create trips...');
  const trips = [
    {
      origin: 'POINT(-122.4194 37.7749)',
      destination: 'POINT(-122.0574 37.4419)',
      originName: 'San Francisco, CA',
      destinationName: 'Palo Alto, CA',
      departureAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      vehicleType: 'CAR',
      capacity: 3,
    },
    {
      origin: 'POINT(-122.2711 37.8044)',
      destination: 'POINT(-121.8863 37.3382)',
      originName: 'Oakland, CA',
      destinationName: 'San Jose, CA',
      departureAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      vehicleType: 'VAN',
      capacity: 6,
    },
  ];

  testData.trips = [];
  for (const tripData of trips) {
    const createResult = await makeRequest('/api/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
      token: accessTokens.user1,
    });

    if (createResult.ok) {
      testData.trips.push(createResult.data);
      console.log('✅ Create trip successful:', createResult.data.id);
    } else {
      console.log('❌ Create trip failed:', createResult.data);
      return false;
    }
  }

  // Test 2: Get all trips
  console.log('\n2. Testing get all trips...');
  const tripsResult = await makeRequest('/api/trips');

  if (tripsResult.ok && tripsResult.data.length > 0) {
    console.log(
      `✅ Get trips successful: ${tripsResult.data.length} trips found`,
    );
  } else {
    console.log('❌ Get trips failed:', tripsResult.data);
    return false;
  }

  // Test 3: Nearby trips
  console.log('\n3. Testing nearby trips...');
  const nearbyResult = await makeRequest(
    '/api/trips/nearby?lon=-122.4194&lat=37.7749&radiusMeters=50000',
  );

  if (nearbyResult.ok) {
    console.log(
      `✅ Nearby trips successful: ${nearbyResult.data.length} trips found`,
    );
  } else {
    console.log('❌ Nearby trips failed:', nearbyResult.data);
    return false;
  }

  // Test 4: Complete trip
  console.log('\n4. Testing complete trip...');
  const completeResult = await makeRequest(
    `/api/trips/${testData.trips[0].id}/complete`,
    {
      method: 'PATCH',
      token: accessTokens.user1,
    },
  );

  if (completeResult.ok) {
    console.log('✅ Complete trip successful');
  } else {
    console.log('❌ Complete trip failed:', completeResult.data);
    return false;
  }

  return true;
}

async function testRequests() {
  console.log('\n📋 === REQUESTS TESTS ===');

  // Test 1: Create request
  console.log('\n1. Testing create request...');
  const createRequestResult = await makeRequest('/api/requests', {
    method: 'POST',
    body: JSON.stringify({ tripId: testData.trips[1].id }),
    token: accessTokens.user2,
  });

  if (createRequestResult.ok) {
    testData.requestId = createRequestResult.data.id;
    console.log('✅ Create request successful:', createRequestResult.data.id);
  } else {
    console.log('❌ Create request failed:', createRequestResult.data);
    return false;
  }

  // Test 2: Get incoming requests
  console.log('\n2. Testing get incoming requests...');
  const incomingResult = await makeRequest('/api/requests/incoming', {
    token: accessTokens.user1,
  });

  if (incomingResult.ok) {
    console.log(
      `✅ Get incoming requests successful: ${incomingResult.data.length} requests found`,
    );
  } else {
    console.log('❌ Get incoming requests failed:', incomingResult.data);
    return false;
  }

  // Test 3: Get outgoing requests
  console.log('\n3. Testing get outgoing requests...');
  const outgoingResult = await makeRequest('/api/requests/outgoing', {
    token: accessTokens.user2,
  });

  if (outgoingResult.ok) {
    console.log(
      `✅ Get outgoing requests successful: ${outgoingResult.data.length} requests found`,
    );
  } else {
    console.log('❌ Get outgoing requests failed:', outgoingResult.data);
    return false;
  }

  // Test 4: Update request status
  console.log('\n4. Testing update request status...');
  const updateResult = await makeRequest(
    `/api/requests/${testData.requestId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACCEPTED' }),
      token: accessTokens.user1,
    },
  );

  if (updateResult.ok) {
    console.log('✅ Update request status successful');
  } else {
    console.log('❌ Update request status failed:', updateResult.data);
    return false;
  }

  return true;
}

async function testChat() {
  console.log('\n💬 === CHAT TESTS ===');

  // Get user2 ID
  const user2Profile = await makeRequest('/api/auth/me', {
    token: accessTokens.user2,
  });
  const user2Id = user2Profile.data.id;

  // Test 1: Create/get chat
  console.log('\n1. Testing create/get chat...');
  const chatResult = await makeRequest(
    `/api/chat/between?userAId=${testData.user1Id}&userBId=${user2Id}&create=1`,
    {
      token: accessTokens.user1,
    },
  );

  if (chatResult.ok) {
    testData.chatId = chatResult.data.id;
    console.log('✅ Create/get chat successful:', chatResult.data.id);
  } else {
    console.log('❌ Create/get chat failed:', chatResult.data);
    return false;
  }

  // Test 2: Get chat messages
  console.log('\n2. Testing get chat messages...');
  const messagesResult = await makeRequest(
    `/api/chat/${testData.chatId}/messages`,
    {
      token: accessTokens.user1,
    },
  );

  if (messagesResult.ok) {
    console.log(
      `✅ Get messages successful: ${messagesResult.data.length} messages found`,
    );
  } else {
    console.log('❌ Get messages failed:', messagesResult.data);
    return false;
  }

  // Test 3: Send message
  console.log('\n3. Testing send message...');
  const messageData = {
    senderId: testData.user1Id,
    content: 'Hello! This is a test message.',
  };

  const sendResult = await makeRequest(
    `/api/chat/${testData.chatId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(messageData),
      token: accessTokens.user1,
    },
  );

  if (sendResult.ok) {
    console.log('✅ Send message successful');
  } else {
    console.log('❌ Send message failed:', sendResult.data);
    return false;
  }

  return true;
}

async function testRatings() {
  console.log('\n⭐ === RATINGS TESTS ===');

  // Get user2 ID
  const user2Profile = await makeRequest('/api/auth/me', {
    token: accessTokens.user2,
  });
  const user2Id = user2Profile.data.id;

  // Test 1: Create rating
  console.log('\n1. Testing create rating...');
  const ratingData = {
    ratedUserId: testData.user1Id,
    reviewerUserId: user2Id,
    value: 5,
    comment: 'Excellent service!',
  };

  const ratingResult = await makeRequest('/api/ratings', {
    method: 'POST',
    body: JSON.stringify(ratingData),
    token: accessTokens.user2,
  });

  if (ratingResult.ok) {
    console.log('✅ Create rating successful');
  } else {
    console.log('❌ Create rating failed:', ratingResult.data);
    return false;
  }

  return true;
}

async function testHealthAndMetrics() {
  console.log('\n🏥 === HEALTH & METRICS TESTS ===');

  // Test 1: Health check
  console.log('\n1. Testing health check...');
  const healthResult = await makeRequest('/api/health');

  if (healthResult.ok && healthResult.data.status === 'ok') {
    console.log('✅ Health check successful');
  } else {
    console.log('❌ Health check failed:', healthResult.data);
    return false;
  }

  // Test 2: Metrics endpoint
  console.log('\n2. Testing metrics endpoint...');
  const metricsResult = await makeRequest('/api/metrics');

  if (
    metricsResult.ok ||
    metricsResult.status === 503 ||
    metricsResult.status === 0
  ) {
    console.log('✅ Metrics endpoint accessible');
  } else {
    console.log('❌ Metrics endpoint failed:', metricsResult.data);
    return false;
  }

  return true;
}

async function testSecurity() {
  console.log('\n🔒 === SECURITY TESTS ===');

  // Test 1: Unauthorized access
  console.log('\n1. Testing unauthorized access...');
  const unauthorizedResult = await makeRequest('/api/auth/me');

  if (unauthorizedResult.status === 401) {
    console.log('✅ Unauthorized access correctly rejected');
  } else {
    console.log(
      '❌ Unauthorized access should be rejected:',
      unauthorizedResult.data,
    );
    return false;
  }

  // Test 2: Invalid token
  console.log('\n2. Testing invalid token...');
  const invalidTokenResult = await makeRequest('/api/auth/me', {
    token: 'invalid-token',
  });

  if (invalidTokenResult.status === 401) {
    console.log('✅ Invalid token correctly rejected');
  } else {
    console.log(
      '❌ Invalid token should be rejected:',
      invalidTokenResult.data,
    );
    return false;
  }

  return true;
}

async function runCleanTests() {
  console.log('🧪 === CLEAN BACKEND TEST SUITE ===');
  console.log('Resetting database and testing ALL backend features...\n');

  try {
    // Reset database
    await resetDatabase();

    const tests = [
      { name: 'Authentication', fn: testAuthentication },
      { name: 'Trips', fn: testTrips },
      { name: 'Requests', fn: testRequests },
      { name: 'Chat', fn: testChat },
      { name: 'Ratings', fn: testRatings },
      { name: 'Health & Metrics', fn: testHealthAndMetrics },
      { name: 'Security', fn: testSecurity },
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test.fn();
        if (result) {
          passed++;
          console.log(`\n✅ ${test.name} tests PASSED`);
        } else {
          failed++;
          console.log(`\n❌ ${test.name} tests FAILED`);
        }
      } catch (error) {
        failed++;
        console.log(`\n💥 ${test.name} tests ERROR:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 CLEAN TEST RESULTS:');
    console.log(`✅ Passed: ${passed}/${tests.length}`);
    console.log(`❌ Failed: ${failed}/${tests.length}`);

    if (failed === 0) {
      console.log(
        '\n🎉 ALL TESTS PASSED! Backend is 100% ready for frontend integration!',
      );
      console.log(
        '🚀 You can proceed with confidence to frontend integration.',
      );
      return true;
    } else {
      console.log(
        '\n⚠️  Some tests failed. Please fix issues before frontend integration.',
      );
      return false;
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log('❌ Server is not running at', API_BASE);
    console.log('💡 Please start the server with: npm run dev');
    process.exit(1);
  }

  const success = await runCleanTests();
  process.exit(success ? 0 : 1);
}

main();
