const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testAuthService() {
  try {
    // Test 1: Health Check
    console.log('\n1. Testing Health Check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✓ Health:', health.data);

    // Test 2: Register
    console.log('\n2. Testing Register...');
    const register = await axios.post(`${BASE_URL}/api/auth/register`, {
      username: 'testuser' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'password123',
    });
    console.log('✓ Register:', register.data);
    const token = register.data.data.token;

    // Test 3: Login
    console.log('\n3. Testing Login...');
    const login = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: register.data.data.email,
      password: 'password123',
    });
    console.log('✓ Login:', login.data);

    // Test 4: Get Profile
    console.log('\n4. Testing Get Profile...');
    const profile = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('✓ Profile:', profile.data);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
  }
}

testAuthService();
