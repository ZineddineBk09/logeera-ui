#!/usr/bin/env node

/**
 * API testing script for Logeera backend
 * Tests all major endpoints with the seeded data
 */

// Using built-in fetch (Node.js 18+)

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

// Test credentials from seed data
const TEST_USER = {
  email: 'john.doe@example.com',
  password: 'password123',
};

let accessToken = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
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

async function testAuth() {
  console.log('🔐 Testing Authentication...');

  // Test login
  const loginResult = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(TEST_USER),
  });

  if (loginResult.ok) {
    accessToken = loginResult.data.accessToken;
    console.log('✅ Login successful');
  } else {
    console.log('❌ Login failed:', loginResult.data);
    return false;
  }

  // Test me endpoint
  const meResult = await makeRequest('/api/auth/me');
  if (meResult.ok) {
    console.log('✅ Get user info successful:', meResult.data.name);
  } else {
    console.log('❌ Get user info failed:', meResult.data);
  }

  return true;
}

async function testTrips() {
  console.log('\n🚗 Testing Trips...');

  // Test get trips
  const tripsResult = await makeRequest('/api/trips');
  if (tripsResult.ok) {
    console.log(
      `✅ Get trips successful: ${tripsResult.data.length} trips found`,
    );
  } else {
    console.log('❌ Get trips failed:', tripsResult.data);
  }

  // Test nearby trips
  const nearbyResult = await makeRequest(
    '/api/trips/nearby?lon=-122.4194&lat=37.7749&radiusMeters=50000',
  );
  if (nearbyResult.ok) {
    console.log(
      `✅ Get nearby trips successful: ${nearbyResult.data.length} trips found`,
    );
  } else {
    console.log('❌ Get nearby trips failed:', nearbyResult.data);
  }

  // Test create trip
  const newTrip = {
    origin: 'POINT(-122.4194 37.7749)',
    destination: 'POINT(-122.0574 37.4419)',
    originName: 'San Francisco, CA',
    destinationName: 'Palo Alto, CA',
    departureAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    vehicleType: 'CAR',
    capacity: 3,
  };

  const createResult = await makeRequest('/api/trips', {
    method: 'POST',
    body: JSON.stringify(newTrip),
  });

  if (createResult.ok) {
    console.log('✅ Create trip successful:', createResult.data.id);
    return createResult.data.id;
  } else {
    console.log('❌ Create trip failed:', createResult.data);
    return null;
  }
}

async function testRequests(tripId) {
  if (!tripId) {
    console.log('\n📋 Skipping requests test (no trip ID)');
    return;
  }

  console.log('\n📋 Testing Requests...');

  // Test create request
  const createRequestResult = await makeRequest('/api/requests', {
    method: 'POST',
    body: JSON.stringify({ tripId }),
  });

  if (createRequestResult.ok) {
    console.log('✅ Create request successful:', createRequestResult.data.id);
  } else {
    console.log('❌ Create request failed:', createRequestResult.data);
  }

  // Test get incoming requests
  const incomingResult = await makeRequest('/api/requests/incoming');
  if (incomingResult.ok) {
    console.log(
      `✅ Get incoming requests successful: ${incomingResult.data.length} requests found`,
    );
  } else {
    console.log('❌ Get incoming requests failed:', incomingResult.data);
  }

  // Test get outgoing requests
  const outgoingResult = await makeRequest('/api/requests/outgoing');
  if (outgoingResult.ok) {
    console.log(
      `✅ Get outgoing requests successful: ${outgoingResult.data.length} requests found`,
    );
  } else {
    console.log('❌ Get outgoing requests failed:', outgoingResult.data);
  }
}

async function testChat() {
  console.log('\n💬 Testing Chat...');

  // Test get/create chat between users (using real user IDs)
  const chatResult = await makeRequest(
    '/api/chat/between?userAId=71467a37-25ab-4f4f-a88f-12e6830e6bec&userBId=ef0c2900-c44b-4524-b9ef-0a3a2707ad6f&create=1',
  );
  if (chatResult.ok) {
    console.log('✅ Get/create chat successful:', chatResult.data.id);
    return chatResult.data.id;
  } else {
    console.log('❌ Get/create chat failed:', chatResult.data);
    return null;
  }
}

async function testRatings() {
  console.log('\n⭐ Testing Ratings...');

  // Test create rating (using real user IDs from seeded data)
  const ratingData = {
    ratedUserId: '71467a37-25ab-4f4f-a88f-12e6830e6bec', // John Doe
    reviewerUserId: 'ef0c2900-c44b-4524-b9ef-0a3a2707ad6f', // Jane Smith
    value: 5,
    comment: 'Great service!',
  };

  const ratingResult = await makeRequest('/api/ratings', {
    method: 'POST',
    body: JSON.stringify(ratingData),
  });

  if (ratingResult.ok) {
    console.log('✅ Create rating successful:', ratingResult.data.id);
  } else {
    console.log('❌ Create rating failed:', ratingResult.data);
  }
}

async function testHealth() {
  console.log('\n🏥 Testing Health...');

  const healthResult = await makeRequest('/api/health');
  if (healthResult.ok) {
    console.log('✅ Health check successful:', healthResult.data.status);
  } else {
    console.log('❌ Health check failed:', healthResult.data);
  }
}

async function runTests() {
  console.log('🧪 Starting API tests...\n');

  try {
    // Test authentication first
    const authSuccess = await testAuth();
    if (!authSuccess) {
      console.log('❌ Authentication failed, stopping tests');
      return;
    }

    // Test other endpoints
    const tripId = await testTrips();
    await testRequests(tripId);
    await testChat();
    await testRatings();
    await testHealth();

    console.log('\n🎉 API tests completed!');
    console.log(
      '\n📝 Note: Some tests may fail if the server is not running or database is not seeded.',
    );
    console.log(
      '💡 Make sure to run: npm run dev (in another terminal) and npm run db:seed',
    );
  } catch (error) {
    console.error('💥 Test suite failed:', error);
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

  await runTests();
}

main();
