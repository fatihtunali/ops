const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// You'll need to replace this with a valid JWT token from your system
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

const testVehicleAPIs = async () => {
  console.log('\n🧪 Testing Vehicle Types and Rates APIs\n');
  console.log('═'.repeat(60));

  try {
    // Test 1: Get all vehicle types
    console.log('\n1️⃣  GET /api/vehicle-types');
    console.log('─'.repeat(60));
    const vehicleTypes = await api.get('/vehicle-types');
    console.log('✅ Success!');
    console.table(vehicleTypes.data.data);

    // Test 2: Get single vehicle type
    console.log('\n2️⃣  GET /api/vehicle-types/1');
    console.log('─'.repeat(60));
    const vehicleType = await api.get('/vehicle-types/1');
    console.log('✅ Success!');
    console.log(vehicleType.data.data);

    // Test 3: Create a vehicle rate
    console.log('\n3️⃣  POST /api/vehicle-rates (Create)');
    console.log('─'.repeat(60));
    const newRate = {
      city: 'Antalya',
      supplier_id: 1, // Make sure this supplier exists
      supplier_name: 'Test Supplier',
      season_name: 'Winter 2025-26',
      start_date: '2025-11-01',
      end_date: '2026-03-14',
      vehicle_type_id: 1, // Mercedes Vito
      currency: 'EUR',
      full_day_price: 70,
      half_day_price: 45,
      airport_to_hotel: 45,
      hotel_to_airport: 45,
      round_trip: 80,
      notes: 'Test rate'
    };

    const createdRate = await api.post('/vehicle-rates', newRate);
    console.log('✅ Created successfully!');
    console.log(createdRate.data.data);
    const rateId = createdRate.data.data.id;

    // Test 4: Get all vehicle rates
    console.log('\n4️⃣  GET /api/vehicle-rates');
    console.log('─'.repeat(60));
    const allRates = await api.get('/vehicle-rates');
    console.log(`✅ Found ${allRates.data.data.length} rates`);
    console.table(allRates.data.data);

    // Test 5: Get vehicle rates filtered by city
    console.log('\n5️⃣  GET /api/vehicle-rates?city=Antalya');
    console.log('─'.repeat(60));
    const antalyaRates = await api.get('/vehicle-rates?city=Antalya');
    console.log(`✅ Found ${antalyaRates.data.data.length} rates in Antalya`);
    console.table(antalyaRates.data.data);

    // Test 6: Get cities
    console.log('\n6️⃣  GET /api/vehicle-rates/cities');
    console.log('─'.repeat(60));
    const cities = await api.get('/vehicle-rates/cities');
    console.log('✅ Cities with rates:');
    console.log(cities.data.data);

    // Test 7: Update vehicle rate
    console.log('\n7️⃣  PUT /api/vehicle-rates/:id (Update)');
    console.log('─'.repeat(60));
    const updatedData = {
      ...newRate,
      full_day_price: 75, // Changed from 70
      notes: 'Test rate (updated)'
    };
    const updatedRate = await api.put(`/vehicle-rates/${rateId}`, updatedData);
    console.log('✅ Updated successfully!');
    console.log(updatedRate.data.data);

    // Test 8: Get single vehicle rate
    console.log('\n8️⃣  GET /api/vehicle-rates/:id');
    console.log('─'.repeat(60));
    const singleRate = await api.get(`/vehicle-rates/${rateId}`);
    console.log('✅ Success!');
    console.log(singleRate.data.data);

    // Test 9: Delete vehicle rate
    console.log('\n9️⃣  DELETE /api/vehicle-rates/:id (Soft delete)');
    console.log('─'.repeat(60));
    await api.delete(`/vehicle-rates/${rateId}`);
    console.log('✅ Deleted successfully!');

    // Test 10: Verify deletion (should not appear in active list)
    console.log('\n🔟 Verify soft delete');
    console.log('─'.repeat(60));
    const ratesAfterDelete = await api.get('/vehicle-rates?city=Antalya');
    console.log(`✅ Active rates in Antalya: ${ratesAfterDelete.data.data.length}`);

    console.log('\n═'.repeat(60));
    console.log('\n✅ All tests passed!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    console.error('\nError details:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
  }
};

// Instructions
console.log('\n📝 INSTRUCTIONS:');
console.log('1. Make sure the backend server is running (npm run dev)');
console.log('2. Login to get a JWT token from /api/auth/login');
console.log('3. Replace AUTH_TOKEN in this file with your JWT token');
console.log('4. Make sure you have at least one supplier in tour_suppliers table');
console.log('5. Run: node test_vehicle_apis.js');
console.log('─'.repeat(60));

// Uncomment this line after setting AUTH_TOKEN
// testVehicleAPIs();

console.log('\n⚠️  Please set AUTH_TOKEN first, then uncomment the testVehicleAPIs() call\n');
