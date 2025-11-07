const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

let authToken = '';

/**
 * Comprehensive API Testing Script
 *
 * IMPORTANT: Set ADMIN_PASSWORD in .env file before running:
 * ADMIN_PASSWORD=your_actual_password
 */

// Helper function to log test results
function logTest(testName, passed, response) {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${testName}`);
  if (!passed) {
    console.log(`   Error: ${JSON.stringify(response?.data || response?.message || 'Unknown error')}`);
  }
}

async function testAPIs() {
  console.log('\n🧪 Starting Comprehensive API Testing\n');
  console.log('='+ '='.repeat(50) + '\n');

  let totalTests = 0;
  let passedTests = 0;

  // 1. Health Check
  console.log('📊 Testing Health & System');
  try {
    const health = await axios.get('http://localhost:5000/health');
    totalTests++;
    const passed = health.data.success && health.data.database === 'connected';
    logTest('Health check', passed, health);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Health check', false, error);
  }

  try {
    const apiInfo = await axios.get(`${BASE_URL}`);
    totalTests++;
    const passed = apiInfo.data.success;
    logTest('API info', passed, apiInfo);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('API info', false, error);
  }
  console.log('');

  // 2. Authentication
  console.log('🔐 Testing Authentication');

  // Check if admin password is set
  if (!ADMIN_PASSWORD) {
    console.error('❌ ADMIN_PASSWORD not set in .env file!');
    console.error('   Please add: ADMIN_PASSWORD=your_password to .env');
    process.exit(1);
  }

  try {
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    });
    totalTests++;
    const passed = login.data.success && login.data.token;
    authToken = login.data.token;
    logTest('Login', passed, login);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Login', false, error);
  }

  const headers = { Authorization: `Bearer ${authToken}` };

  try {
    const me = await axios.get(`${BASE_URL}/auth/me`, { headers });
    totalTests++;
    const passed = me.data.success;
    logTest('Get current user', passed, me);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get current user', false, error);
  }
  console.log('');

  // 3. Clients API
  console.log('👥 Testing Clients API');
  let clientId = null;
  try {
    const clients = await axios.get(`${BASE_URL}/clients`, { headers });
    totalTests++;
    const passed = clients.data.success && Array.isArray(clients.data.data);
    if (passed && clients.data.data.length > 0) {
      clientId = clients.data.data[0].id;
    }
    logTest('Get all clients', passed, clients);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get all clients', false, error);
  }

  if (clientId) {
    try {
      const client = await axios.get(`${BASE_URL}/clients/${clientId}`, { headers });
      totalTests++;
      const passed = client.data.success;
      logTest('Get client by ID', passed, client);
      if (passed) passedTests++;
    } catch (error) {
      totalTests++;
      logTest('Get client by ID', false, error);
    }
  }
  console.log('');

  // 4. Hotels API
  console.log('🏨 Testing Hotels API');
  let hotelId = null;
  try {
    const hotels = await axios.get(`${BASE_URL}/hotels`, { headers });
    totalTests++;
    const passed = hotels.data.success && Array.isArray(hotels.data.data);
    if (passed && hotels.data.data.length > 0) {
      hotelId = hotels.data.data[0].id;
    }
    logTest('Get all hotels', passed, hotels);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get all hotels', false, error);
  }

  if (hotelId) {
    try {
      const hotel = await axios.get(`${BASE_URL}/hotels/${hotelId}`, { headers });
      totalTests++;
      const passed = hotel.data.success;
      logTest('Get hotel by ID', passed, hotel);
      if (passed) passedTests++;
    } catch (error) {
      totalTests++;
      logTest('Get hotel by ID', false, error);
    }
  }
  console.log('');

  // 5. Tour Suppliers API
  console.log('🚌 Testing Tour Suppliers API');
  try {
    const suppliers = await axios.get(`${BASE_URL}/tour-suppliers`, { headers });
    totalTests++;
    const passed = suppliers.data.success && Array.isArray(suppliers.data.data);
    logTest('Get all tour suppliers', passed, suppliers);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get all tour suppliers', false, error);
  }
  console.log('');

  // 6. Guides API
  console.log('👨‍🏫 Testing Guides API');
  try {
    const guides = await axios.get(`${BASE_URL}/guides`, { headers });
    totalTests++;
    const passed = guides.data.success && Array.isArray(guides.data.data);
    logTest('Get all guides', passed, guides);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get all guides', false, error);
  }

  try {
    const availableGuides = await axios.get(`${BASE_URL}/guides?status=available`, { headers });
    totalTests++;
    const passed = availableGuides.data.success;
    logTest('Get available guides', passed, availableGuides);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get available guides', false, error);
  }
  console.log('');

  // 7. Vehicles API
  console.log('🚗 Testing Vehicles API');
  try {
    const vehicles = await axios.get(`${BASE_URL}/vehicles`, { headers });
    totalTests++;
    const passed = vehicles.data.success && Array.isArray(vehicles.data.data);
    logTest('Get all vehicles', passed, vehicles);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get all vehicles', false, error);
  }

  try {
    const availableVehicles = await axios.get(`${BASE_URL}/vehicles?status=available`, { headers });
    totalTests++;
    const passed = availableVehicles.data.success;
    logTest('Get available vehicles', passed, availableVehicles);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get available vehicles', false, error);
  }
  console.log('');

  // 8. Bookings API
  console.log('📅 Testing Bookings API');
  let bookingId = null;
  try {
    const bookings = await axios.get(`${BASE_URL}/bookings`, { headers });
    totalTests++;
    const passed = bookings.data.success && Array.isArray(bookings.data.data);
    if (passed && bookings.data.data.length > 0) {
      bookingId = bookings.data.data[0].id;
    }
    logTest('Get all bookings', passed, bookings);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get all bookings', false, error);
  }

  if (bookingId) {
    try {
      const booking = await axios.get(`${BASE_URL}/bookings/${bookingId}`, { headers });
      totalTests++;
      const passed = booking.data.success;
      logTest('Get booking by ID', passed, booking);
      if (passed) passedTests++;
    } catch (error) {
      totalTests++;
      logTest('Get booking by ID', false, error);
    }
  }

  try {
    const confirmedBookings = await axios.get(`${BASE_URL}/bookings?status=confirmed`, { headers });
    totalTests++;
    const passed = confirmedBookings.data.success;
    logTest('Get confirmed bookings', passed, confirmedBookings);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get confirmed bookings', false, error);
  }
  console.log('');

  // 9. Booking Services APIs
  console.log('🛏️ Testing Booking Services APIs');
  try {
    const bookingHotels = await axios.get(`${BASE_URL}/booking-hotels`, { headers });
    totalTests++;
    const passed = bookingHotels.data.success && Array.isArray(bookingHotels.data.data);
    logTest('Get all booking hotels', passed, bookingHotels);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get all booking hotels', false, error);
  }

  try {
    const bookingTours = await axios.get(`${BASE_URL}/booking-tours`, { headers });
    totalTests++;
    const passed = bookingTours.data.success && Array.isArray(bookingTours.data.data);
    logTest('Get all booking tours', passed, bookingTours);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get all booking tours', false, error);
  }

  try {
    const bookingTransfers = await axios.get(`${BASE_URL}/booking-transfers`, { headers });
    totalTests++;
    const passed = bookingTransfers.data.success && Array.isArray(bookingTransfers.data.data);
    logTest('Get all booking transfers', passed, bookingTransfers);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get all booking transfers', false, error);
  }

  try {
    const bookingFlights = await axios.get(`${BASE_URL}/booking-flights`, { headers });
    totalTests++;
    const passed = bookingFlights.data.success && Array.isArray(bookingFlights.data.data);
    logTest('Get all booking flights', passed, bookingFlights);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get all booking flights', false, error);
  }
  console.log('');

  // 10. Payments APIs
  console.log('💰 Testing Payments APIs');
  try {
    const clientPayments = await axios.get(`${BASE_URL}/client-payments`, { headers });
    totalTests++;
    const passed = clientPayments.data.success && Array.isArray(clientPayments.data.data);
    logTest('Get all client payments', passed, clientPayments);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get all client payments', false, error);
  }

  try {
    const supplierPayments = await axios.get(`${BASE_URL}/supplier-payments`, { headers });
    totalTests++;
    const passed = supplierPayments.data.success && Array.isArray(supplierPayments.data.data);
    logTest('Get all supplier payments', passed, supplierPayments);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get all supplier payments', false, error);
  }

  try {
    const paymentStats = await axios.get(`${BASE_URL}/supplier-payments/summary`, { headers });
    totalTests++;
    const passed = paymentStats.data.success;
    logTest('Get supplier payment summary', passed, paymentStats);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get supplier payment summary', false, error);
  }
  console.log('');

  // 11. Operational Expenses API
  console.log('📊 Testing Operational Expenses API');
  try {
    const expenses = await axios.get(`${BASE_URL}/operational-expenses`, { headers });
    totalTests++;
    const passed = expenses.data.success && Array.isArray(expenses.data.data);
    logTest('Get all operational expenses', passed, expenses);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get all operational expenses', false, error);
  }

  try {
    const expensesSummary = await axios.get(`${BASE_URL}/operational-expenses/summary?year=2025`, { headers });
    totalTests++;
    const passed = expensesSummary.data.success;
    logTest('Get expenses summary', passed, expensesSummary);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get expenses summary', false, error);
  }
  console.log('');

  // 12. Reports API
  console.log('📈 Testing Reports API');
  try {
    const dashboardStats = await axios.get(`${BASE_URL}/reports/dashboard-stats`, { headers });
    totalTests++;
    const passed = dashboardStats.data.success;
    logTest('Get dashboard stats', passed, dashboardStats);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get dashboard stats', false, error);
  }

  try {
    const monthlyPL = await axios.get(`${BASE_URL}/reports/monthly-pl?month=2025-11`, { headers });
    totalTests++;
    const passed = monthlyPL.data.success;
    logTest('Get monthly P&L', passed, monthlyPL);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get monthly P&L', false, error);
  }

  if (bookingId) {
    try {
      const profitability = await axios.get(`${BASE_URL}/reports/booking-profitability/${bookingId}`, { headers });
      totalTests++;
      const passed = profitability.data.success;
      logTest('Get booking profitability', passed, profitability);
      if (passed) passedTests++;
    } catch (error) {
      totalTests++;
      logTest('Get booking profitability', false, error);
    }
  }

  try {
    const cashFlow = await axios.get(`${BASE_URL}/reports/cash-flow?from_date=2025-11-01&to_date=2025-11-30`, { headers });
    totalTests++;
    const passed = cashFlow.data.success;
    logTest('Get cash flow report', passed, cashFlow);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get cash flow report', false, error);
  }

  try {
    const salesByClient = await axios.get(`${BASE_URL}/reports/sales-by-client`, { headers });
    totalTests++;
    const passed = salesByClient.data.success;
    logTest('Get sales by client', passed, salesByClient);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get sales by client', false, error);
  }

  try {
    const salesByService = await axios.get(`${BASE_URL}/reports/sales-by-service`, { headers });
    totalTests++;
    const passed = salesByService.data.success;
    logTest('Get sales by service', passed, salesByService);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get sales by service', false, error);
  }

  try {
    const outstanding = await axios.get(`${BASE_URL}/reports/outstanding`, { headers });
    totalTests++;
    const passed = outstanding.data.success;
    logTest('Get outstanding payments', passed, outstanding);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get outstanding payments', false, error);
  }
  console.log('');

  // 13. Users API
  console.log('👤 Testing Users API');
  try {
    const users = await axios.get(`${BASE_URL}/users`, { headers });
    totalTests++;
    const passed = users.data.success && Array.isArray(users.data.data);
    logTest('Get all users (admin only)', passed, users);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get all users (admin only)', false, error);
  }
  console.log('');

  // 14. Vouchers API
  console.log('📄 Testing Vouchers API');
  try {
    const vouchers = await axios.get(`${BASE_URL}/vouchers`, { headers });
    totalTests++;
    const passed = vouchers.data.success && Array.isArray(vouchers.data.data);
    logTest('Get all vouchers', passed, vouchers);
    if (passed) passedTests++;
  } catch (error) {
    totalTests++;
    logTest('Get all vouchers', false, error);
  }
  console.log('');

  // Final Summary
  console.log('='+ '='.repeat(50));
  console.log('\n📊 Test Summary:');
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ✅ ${passedTests}`);
  console.log(`   Failed: ❌ ${totalTests - passedTests}`);
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Backend is fully functional!\n');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
  }
}

// Run tests
testAPIs()
  .then(() => {
    console.log('✅ API testing completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Testing failed:', error.message);
    process.exit(1);
  });
