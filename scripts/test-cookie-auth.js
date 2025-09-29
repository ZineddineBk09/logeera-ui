#!/usr/bin/env node

/**
 * Test Cookie-Based Authentication
 * Tests the complete authentication flow using cookies
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3001';

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
      cookies: response.headers.get('set-cookie'),
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

async function testCookieAuth() {
  console.log('🍪 === COOKIE-BASED AUTHENTICATION TEST ===\n');

  let cookies = '';

  // Test 1: Register new user
  console.log('1. Testing user registration...');
  const timestamp = Date.now();
  const registerData = {
    name: 'Cookie Test User',
    email: `cookietest${timestamp}@example.com`,
    phoneNumber: `+1234567${timestamp.toString().slice(-3)}`,
    password: 'password123',
    type: 'PERSON',
    officialIdNumber: `COOKIE${timestamp}`,
  };

  const registerResult = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(registerData),
  });

  if (registerResult.ok) {
    console.log('✅ Registration successful');
    console.log('📋 Response cookies:', registerResult.cookies);

    // Extract cookies from response
    if (registerResult.cookies) {
      cookies = registerResult.cookies;
    }

    // Test 2: Get user profile with cookies
    console.log('\n2. Testing get user profile with cookies...');
    const profileResult = await makeRequest('/api/auth/me', {
      headers: {
        Cookie: cookies,
      },
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
        console.log('📋 Login cookies:', loginResult.cookies);

        // Update cookies
        if (loginResult.cookies) {
          cookies = loginResult.cookies;
        }

        // Test 4: Test protected route with cookies
        console.log('\n4. Testing protected route with cookies...');
        const protectedResult = await makeRequest('/api/trips', {
          headers: {
            Cookie: cookies,
          },
        });

        if (protectedResult.ok) {
          console.log('✅ Protected route accessible with cookies');
        } else {
          console.log('❌ Protected route failed:', protectedResult.data);
        }

        // Test 5: Test token refresh
        console.log('\n5. Testing token refresh...');
        const refreshResult = await makeRequest('/api/auth/refresh', {
          method: 'POST',
          headers: {
            Cookie: cookies,
          },
        });

        if (refreshResult.ok) {
          console.log('✅ Token refresh successful');
          console.log('📋 Refresh cookies:', refreshResult.cookies);
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

  // Test 6: Test without cookies (should fail)
  console.log('\n6. Testing protected route without cookies...');
  const noAuthResult = await makeRequest('/api/trips');

  if (noAuthResult.status === 401) {
    console.log('✅ Protected route correctly requires authentication');
  } else {
    console.log(
      '❌ Protected route should require authentication:',
      noAuthResult.data,
    );
  }

  console.log('\n🎉 Cookie-based authentication test completed!');
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

  await testCookieAuth();
}

main();
