const { pool } = require('../src/config/database');
const bcrypt = require('bcrypt');

/**
 * Simple Test Data Seeding Script
 */

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // 1. Users
    console.log('📝 Seeding users...');
    await pool.query(`
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES
        ('admin', 'admin@funnytourism.com', $1, 'System Administrator', 'admin'),
        ('staff1', 'staff1@funnytourism.com', $2, 'John Smith', 'staff'),
        ('accountant', 'accountant@funnytourism.com', $3, 'Michael Brown', 'accountant')
      ON CONFLICT (username) DO NOTHING
    `, [await bcrypt.hash('admin123', 10), await bcrypt.hash('staff123', 10), await bcrypt.hash('accountant123', 10)]);
    console.log('✅ Users created\n');

    // 2. Clients
    console.log('📝 Seeding clients...');
    const clientsRes = await pool.query(`
      INSERT INTO clients (client_code, name, type, email, phone, commission_rate, status)
      VALUES
        ('CL001', 'ABC Travel Agency', 'agent', 'info@abctravel.com', '+90 555 1234567', 15.00, 'active'),
        ('CL002', 'John Doe', 'direct', 'john@email.com', '+1 555 1234567', NULL, 'active')
      ON CONFLICT (client_code) DO NOTHING
      RETURNING id
    `);
    const clientIds = clientsRes.rows.map(r => r.id);
    console.log('✅ Clients created\n');

    // 3. Hotels
    console.log('📝 Seeding hotels...');
    const hotelsCheck = await pool.query(`SELECT id, name FROM hotels WHERE name IN ('Hilton Istanbul', 'Museum Hotel')`);
    let hotels = hotelsCheck.rows;

    if (hotels.length === 0) {
      const hotelsRes = await pool.query(`
        INSERT INTO hotels (name, city, country, contact_email, standard_cost_per_night, status)
        VALUES
          ('Hilton Istanbul', 'Istanbul', 'Turkey', 'hilton@email.com', 150.00, 'active'),
          ('Museum Hotel', 'Cappadocia', 'Turkey', 'museum@email.com', 200.00, 'active')
        RETURNING id, name
      `);
      hotels = hotelsRes.rows;
    }
    console.log('✅ Hotels created\n');

    // 4. Tour Suppliers
    console.log('📝 Seeding tour suppliers...');
    const suppliersCheck = await pool.query(`SELECT id FROM tour_suppliers WHERE name = 'Cappadocia Adventures'`);
    let supplierIds = suppliersCheck.rows.map(r => r.id);

    if (supplierIds.length === 0) {
      const suppliersRes = await pool.query(`
        INSERT INTO tour_suppliers (name, email, services_offered, status)
        VALUES
          ('Cappadocia Adventures', 'info@cappadocia.com', 'Hot air balloon tours', 'active')
        RETURNING id
      `);
      supplierIds = suppliersRes.rows.map(r => r.id);
    }
    console.log('✅ Tour suppliers created\n');

    // 5. Guides
    console.log('📝 Seeding guides...');
    const guidesCheck = await pool.query(`SELECT id FROM guides WHERE name = 'Mehmet Demir'`);
    let guideIds = guidesCheck.rows.map(r => r.id);

    if (guideIds.length === 0) {
      const guidesRes = await pool.query(`
        INSERT INTO guides (name, phone, languages, daily_rate, specialization, availability_status)
        VALUES
          ('Mehmet Demir', '+90 555 1234567', 'English, Turkish', 100.00, 'Historical Tours', 'available')
        RETURNING id
      `);
      guideIds = guidesRes.rows.map(r => r.id);
    }
    console.log('✅ Guides created\n');

    // 6. Vehicles
    console.log('📝 Seeding vehicles...');
    const vehiclesCheck = await pool.query(`SELECT id FROM vehicles WHERE vehicle_number = '34 ABC 123'`);
    let vehicleIds = vehiclesCheck.rows.map(r => r.id);

    if (vehicleIds.length === 0) {
      const vehiclesRes = await pool.query(`
        INSERT INTO vehicles (vehicle_number, type, capacity, daily_rate, driver_name, driver_phone, status)
        VALUES
          ('34 ABC 123', 'Mercedes Vito', 7, 120.00, 'Ahmet Yıldız', '+90 555 1111111', 'available')
        RETURNING id
      `);
      vehicleIds = vehiclesRes.rows.map(r => r.id);
    }
    console.log('✅ Vehicles created\n');

    // 7. Bookings
    console.log('📝 Seeding bookings...');
    const maxBooking = await pool.query(`
      SELECT COALESCE(MAX(CAST(SUBSTRING(booking_code FROM 7) AS INTEGER)), 1045) + 1 as next_num
      FROM bookings WHERE booking_code LIKE 'Funny-%'
    `);
    let nextNum = maxBooking.rows[0].next_num;

    const bookingsRes = await pool.query(`
      INSERT INTO bookings (booking_code, client_id, pax_count, travel_date_from, travel_date_to, status, is_confirmed, confirmed_at, notes)
      VALUES
        ($1, $2, 2, '2025-12-10', '2025-12-15', 'confirmed', true, NOW(), 'Honeymoon package'),
        ($3, $4, 4, '2025-12-20', '2025-12-25', 'confirmed', true, NOW(), 'Family vacation')
      RETURNING id, booking_code
    `, [`Funny-${nextNum}`, clientIds[0] || 1, `Funny-${nextNum + 1}`, clientIds[1] || 2]);

    const bookings = bookingsRes.rows;
    bookings.forEach(b => console.log(`   - ${b.booking_code}`));
    console.log('✅ Bookings created\n');

    // 8. Passengers
    console.log('📝 Seeding passengers...');
    await pool.query(`
      INSERT INTO passengers (booking_id, name, passport_number, nationality, date_of_birth)
      VALUES
        ($1, 'John Doe', 'AB1234567', 'USA', '1985-05-15'),
        ($1, 'Jane Doe', 'AB1234568', 'USA', '1987-08-20'),
        ($2, 'Michael Smith', 'CD2345678', 'UK', '1980-03-10')
    `, [bookings[0].id, bookings[1].id]);
    console.log('✅ Passengers created\n');

    // 9. Booking Hotels
    console.log('📝 Seeding booking hotels...');
    await pool.query(`
      INSERT INTO booking_hotels (booking_id, hotel_id, hotel_name, check_in, check_out, nights, room_type, number_of_rooms, cost_per_night, sell_price, payment_due_date)
      VALUES
        ($1, $2, $3, '2025-12-10', '2025-12-12', 2, 'Deluxe Double', 1, 150.00, 200.00, '2025-12-05'),
        ($4, $5, $6, '2025-12-20', '2025-12-23', 3, 'Family Suite', 1, 150.00, 220.00, '2025-12-15')
    `, [bookings[0].id, hotels[0].id, hotels[0].name, bookings[1].id, hotels[1].id, hotels[1].name]);
    console.log('✅ Hotel bookings created\n');

    // 10. Booking Tours
    console.log('📝 Seeding booking tours...');
    await pool.query(`
      INSERT INTO booking_tours (booking_id, tour_name, tour_date, duration, pax_count, operation_type, supplier_id, supplier_cost, sell_price, payment_due_date)
      VALUES
        ($1, 'Hot Air Balloon Tour', '2025-12-11', 'Full Day', 2, 'supplier', $2, 300.00, 450.00, '2025-12-10')
    `, [bookings[0].id, supplierIds[0] || 1]);

    await pool.query(`
      INSERT INTO booking_tours (booking_id, tour_name, tour_date, duration, pax_count, operation_type, guide_id, guide_cost, vehicle_id, vehicle_cost, entrance_fees, sell_price)
      VALUES
        ($1, 'Istanbul City Tour', '2025-12-21', 'Full Day', 4, 'self-operated', $2, 100.00, $3, 120.00, 80.00, 600.00)
    `, [bookings[1].id, guideIds[0] || 1, vehicleIds[0] || 1]);
    console.log('✅ Tour bookings created\n');

    // 11. Booking Transfers
    console.log('📝 Seeding booking transfers...');
    await pool.query(`
      INSERT INTO booking_transfers (booking_id, transfer_type, transfer_date, from_location, to_location, pax_count, vehicle_type, operation_type, vehicle_id, cost_price, sell_price)
      VALUES
        ($1, 'Airport Pickup', '2025-12-10', 'Istanbul Airport', 'Hotel', 2, 'Sedan', 'self-operated', $2, 30.00, 50.00)
    `, [bookings[0].id, vehicleIds[0] || 1]);
    console.log('✅ Transfer bookings created\n');

    // 12. Booking Flights
    console.log('📝 Seeding booking flights...');
    await pool.query(`
      INSERT INTO booking_flights (booking_id, airline, flight_number, departure_date, arrival_date, from_airport, to_airport, pax_count, cost_price, sell_price, pnr)
      VALUES
        ($1, 'Turkish Airlines', 'TK1980', '2025-12-20 10:00:00', '2025-12-20 14:00:00', 'JFK', 'IST', 4, 800.00, 1000.00, 'ABC123')
    `, [bookings[1].id]);
    console.log('✅ Flight bookings created\n');

    // 13. Client Payments
    console.log('📝 Seeding client payments...');
    await pool.query(`
      INSERT INTO client_payments (booking_id, payment_date, amount, currency, payment_method, reference_number)
      VALUES
        ($1, '2025-12-01', 500.00, 'USD', 'bank_transfer', 'TXN12345'),
        ($2, '2025-12-10', 1000.00, 'USD', 'credit_card', 'CC78901')
    `, [bookings[0].id, bookings[1].id]);
    console.log('✅ Client payments created\n');

    // 14. Operational Expenses
    console.log('📝 Seeding operational expenses...');
    await pool.query(`
      INSERT INTO operational_expenses (expense_date, category, description, amount, currency, payment_method, is_recurring)
      VALUES
        ('2025-11-01', 'rent', 'Office rent for November', 2000.00, 'USD', 'bank_transfer', true),
        ('2025-11-05', 'salaries', 'Staff salaries', 5000.00, 'USD', 'bank_transfer', true),
        ('2025-11-10', 'utilities', 'Electricity and water', 300.00, 'USD', 'bank_transfer', true),
        ('2025-11-15', 'marketing', 'Facebook ads', 500.00, 'USD', 'credit_card', false)
    `);
    console.log('✅ Operational expenses created\n');

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('🔑 Login Credentials:');
    console.log('   Admin:      username: admin      password: admin123');
    console.log('   Staff:      username: staff1     password: staff123');
    console.log('   Accountant: username: accountant password: accountant123\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedDatabase()
  .then(() => {
    console.log('✅ Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
