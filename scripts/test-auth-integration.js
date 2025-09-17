#!/usr/bin/env node

/**
 * Test Authentication Integration
 * Tests the complete authentication flow from frontend to backend
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

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

async function testAuthIntegration() {
  console.log('🔐 === AUTHENTICATION INTEGRATION TEST ===\n');
  
  // Test 1: Register new user
  console.log('1. Testing user registration...');
  const timestamp = Date.now();
  const registerData = {
    name: 'Test User',
    email: `testuser${timestamp}@example.com`,
    phoneNumber: `+1234567${timestamp.toString().slice(-3)}`,
    password: 'password123',
    type: 'INDIVIDUAL',
    officialIdNumber: `TEST${timestamp}`,
  };
  
  const registerResult = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(registerData),
  });
  
  if (registerResult.ok) {
    console.log('✅ Registration successful');
    const { accessToken } = registerResult.data;
    
    // Test 2: Get user profile with token
    console.log('\n2. Testing get user profile...');
    const profileResult = await makeRequest('/api/auth/me', {
      token: accessToken
    });
    
    if (profileResult.ok) {
      console.log('✅ Get profile successful:', profileResult.data.name);
      
      // Test 3: Login with same credentials
      console.log('\n3. Testing login...');
      const loginResult = await makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
        }),
      });
      
      if (loginResult.ok) {
        console.log('✅ Login successful');
        
        // Test 4: Test token refresh
        console.log('\n4. Testing token refresh...');
        const refreshResult = await makeRequest('/api/auth/refresh', {
          method: 'POST',
        });
        
        if (refreshResult.ok) {
          console.log('✅ Token refresh successful');
        } else {
          console.log('❌ Token refresh failed:', refreshResult.data);
        }
        
      } else {
        console.log('❌ Login failed:', loginResult.data);
      }
      
    } else {
      console.log('❌ Get profile failed:', profileResult.data);
    }
    
  } else {
    console.log('❌ Registration failed:', registerResult.data);
  }
  
  // Test 5: Test protected route access
  console.log('\n5. Testing protected route access...');
  const protectedResult = await makeRequest('/api/trips');
  
  if (protectedResult.status === 401) {
    console.log('✅ Protected route correctly requires authentication');
  } else {
    console.log('❌ Protected route should require authentication:', protectedResult.data);
  }
  
  console.log('\n🎉 Authentication integration test completed!');
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

  await testAuthIntegration();
}

main();
