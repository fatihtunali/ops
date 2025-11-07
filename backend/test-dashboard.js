const axios = require('axios');

(async () => {
  try {
    // Login first
    console.log('🔐 Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'Dlr235672.-Yt'
    });
    const token = loginRes.data.token;
    console.log('✅ Login successful\n');

    // Get dashboard stats
    console.log('📊 Fetching dashboard stats...');
    const statsRes = await axios.get('http://localhost:5000/api/reports/dashboard-stats', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('\n📈 Dashboard Stats API Response:');
    console.log('=====================================');
    console.log(JSON.stringify(statsRes.data, null, 2));
    console.log('=====================================\n');

    // Get bookings count
    console.log('📋 Fetching recent bookings...');
    const bookingsRes = await axios.get('http://localhost:5000/api/bookings?limit=5', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('\n✅ Bookings Response:');
    console.log('Type:', typeof bookingsRes.data);
    console.log('Is Array:', Array.isArray(bookingsRes.data));
    console.log('Full response:', JSON.stringify(bookingsRes.data, null, 2));

  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
    console.error('Stack:', err.stack);
  }
})();
