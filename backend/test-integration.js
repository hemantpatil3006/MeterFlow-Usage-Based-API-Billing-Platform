const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const GATEWAY_URL = 'http://localhost:5000/v1';

async function runTests() {
  let token;
  let apiId;
  let apiKey;

  console.log('--- Starting Integration Tests ---');

  try {
    // 1. Auth: Register/Login
    console.log('1. Testing Auth...');
    try {
      const registerRes = await axios.post(`${API_URL}/auth/register`, {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      });
      token = registerRes.data.token;
      console.log('   User registered successfully.');
    } catch (err) {
      console.error('   Registration failed:', err.response?.data || err.message, err.code);
      return;
    }

    const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Create API Key
    console.log('2. Testing API Creation...');
    try {
      const apiRes = await axios.post(`${API_URL}/apis`, {
        name: 'Integration Test API',
        description: 'Testing the gateway'
      }, axiosConfig);
      apiId = apiRes.data._id;
      apiKey = apiRes.data.apiKey;
      console.log('   API created successfully:', apiKey.substring(0, 8) + '...');
    } catch (err) {
      console.error('   API Creation failed:', err.response?.data || err.message);
      return;
    }

    // 3. Gateway Testing
    console.log('3. Testing Gateway...');
    try {
      const gwRes = await axios.get(`${GATEWAY_URL}/test`, {
        headers: { 'x-api-key': apiKey }
      });
      console.log('   Gateway responded successfully:', gwRes.status);
    } catch (err) {
      console.error('   Gateway failed:', err.response?.data || err.message);
      return;
    }

    // Give the queue a moment to process the usage log
    console.log('   Waiting for usage queue to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Analytics Testing
    console.log('4. Testing Analytics...');
    try {
      const dashboardRes = await axios.get(`${API_URL}/analytics/dashboard`, axiosConfig);
      console.log('   Dashboard Metrics:', JSON.stringify(dashboardRes.data, null, 2));

      const detailedRes = await axios.get(`${API_URL}/analytics/detailed`, axiosConfig);
      console.log('   Detailed Analytics:', JSON.stringify(detailedRes.data, null, 2));
    } catch (err) {
      console.error('   Analytics failed:', err.response?.data || err.message);
      return;
    }

    // 5. Advanced Testing
    console.log('5. Testing Advanced Features...');
    try {
      const webhookRes = await axios.post(`${API_URL}/advanced/webhooks`, {
        endpointUrl: 'http://localhost:5000/dummy',
        events: ['quota_exceeded']
      }, axiosConfig);
      console.log('   Webhook created successfully.');

      const logsRes = await axios.get(`${API_URL}/advanced/audit-logs`, axiosConfig);
      console.log(`   Fetched ${logsRes.data.length} audit logs.`);
    } catch (err) {
      console.error('   Advanced features failed:', err.response?.data || err.message);
      return;
    }

    console.log('--- All Tests Passed Successfully ---');
  } catch (error) {
    console.error('Unhandled test error:', error);
  }
}

runTests();
