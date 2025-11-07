const { pool } = require('../src/config/database');
const bcrypt = require('bcrypt');

/**
 * Comprehensive Test Data Seeding Script
 *
 * This script populates the database with realistic test data
 * to thoroughly test all backend APIs.
 */

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // 1. Seed Users
    console.log('📝 Seeding users...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);
    const accountantPassword = await bcrypt.hash('accountant123', 10);

    const usersResult = await pool.query(`
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES
        ('admin', 'admin@funnytourism.com', $1, 'System Administrator', 'admin'),
        ('staff1', 'staff1@funnytourism.com', $2, 'John Smith', 'staff'),
        ('staff2', 'staff2@funnytourism.com', $2, 'Sarah Johnson', 'staff'),
        ('accountant', 'accountant@funnytourism.com', $3, 'Michael Brown', 'accountant')
      ON CONFLICT (username) DO NOTHING
      RETURNING id;
    `, [adminPassword, staffPassword, accountantPassword]);
    console.log(`✅ Created ${usersResult.rowCount} users\n`);

    // 2. Seed Clients
    console.log('📝 Seeding clients...');
    const clientsResult = await pool.query(`
      INSERT INTO clients (client_code, name, type, email, phone, address, commission_rate, status)
      VALUES
        ('CL001', 'ABC Travel Agency', 'agent', 'info@abctravel.com', '+90 555 1234567', 'Istanbul, Turkey', 15.00, 'active'),
        ('CL002', 'XYZ Tours', 'agent', 'contact@xyztours.com', '+90 555 2345678', 'Ankara, Turkey', 12.00, 'active'),
        ('CL003', 'Global Traveler Ltd', 'agent', 'global@traveler.com', '+90 555 3456789', 'Izmir, Turkey', 10.00, 'active'),
        ('CL004', 'John Doe', 'direct', 'john.doe@email.com', '+1 555 4567890', 'New York, USA', NULL, 'active'),
        ('CL005', 'Jane Smith', 'direct', 'jane.smith@email.com', '+44 20 1234 5678', 'London, UK', NULL, 'active'),
        ('CL006', 'Emirates Travel Group', 'agent', 'contact@emiratestravel.ae', '+971 4 1234567', 'Dubai, UAE', 18.00, 'active')
      ON CONFLICT (client_code) DO NOTHING
      RETURNING id;
    `);
    console.log(`✅ Created ${clientsResult.rowCount} clients\n`);

    // 3. Seed Hotels
    console.log('📝 Seeding hotels...');
    const hotelsResult = await pool.query(`
      INSERT INTO hotels (name, city, country, contact_person, contact_email, contact_phone, standard_cost_per_night, status)
      VALUES
        ('Hilton Istanbul Bosphorus', 'Istanbul', 'Turkey', 'Mehmet Yilmaz', 'reservations@hiltonistanbul.com', '+90 212 1234567', 150.00, 'active'),
        ('Swissôtel The Bosphorus', 'Istanbul', 'Turkey', 'Ayşe Demir', 'bookings@swissotel.com', '+90 212 2345678', 180.00, 'active'),
        ('Museum Hotel Cappadocia', 'Cappadocia', 'Turkey', 'Ali Kaya', 'info@museumhotel.com', '+90 384 3456789', 200.00, 'active'),
        ('Sultan Cave Suites', 'Cappadocia', 'Turkey', 'Fatma Özdemir', 'info@sultancave.com', '+90 384 4567890', 120.00, 'active'),
        ('Rixos Premium Belek', 'Antalya', 'Turkey', 'Can Arslan', 'reservations@rixos.com', '+90 242 5678901', 250.00, 'active'),
        ('Four Seasons Sultanahmet', 'Istanbul', 'Turkey', 'Zeynep Türk', 'istanbul@fourseasons.com', '+90 212 6789012', 300.00, 'active')
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);
    console.log(`✅ Created ${hotelsResult.rowCount} hotels\n`);

    // 4. Seed Tour Suppliers
    console.log('📝 Seeding tour suppliers...');
    const suppliersResult = await pool.query(`
      INSERT INTO tour_suppliers (name, contact_person, email, phone, services_offered, payment_terms, status)
      VALUES
        ('Cappadocia Adventures', 'Ali Yilmaz', 'info@cappadociaadv.com', '+90 555 1111111', 'Hot air balloon, hiking tours, ATV tours', 'Payment within 7 days', 'active'),
        ('Bosphorus Cruise Tours', 'Mehmet Demir', 'booking@bosphoruscruise.com', '+90 555 2222222', 'Bosphorus cruises, yacht tours', 'Payment before service', 'active'),
        ('Ephesus Expert Tours', 'Ayşe Kaya', 'contact@ephesusexpert.com', '+90 555 3333333', 'Ancient city tours, archaeological tours', 'Payment within 5 days', 'active'),
        ('Pamukkale Daily Tours', 'Can Özdemir', 'info@pamukkaletours.com', '+90 555 4444444', 'Pamukkale tours, thermal pools', 'Payment within 3 days', 'active')
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);
    console.log(`✅ Created ${suppliersResult.rowCount} tour suppliers\n`);

    // 5. Seed Guides
    console.log('📝 Seeding guides...');
    const guidesResult = await pool.query(`
      INSERT INTO guides (name, phone, languages, daily_rate, specialization, availability_status)
      VALUES
        ('Mehmet Demir', '+90 555 1234567', 'English, Turkish, Arabic', 100.00, 'Historical Tours', 'available'),
        ('Ayşe Yılmaz', '+90 555 2345678', 'English, Turkish, German', 120.00, 'Archaeological Sites', 'available'),
        ('Ali Kaya', '+90 555 3456789', 'English, Turkish, French', 110.00, 'Adventure Tours', 'available'),
        ('Fatma Özdemir', '+90 555 4567890', 'English, Turkish, Russian', 100.00, 'Cultural Tours', 'available'),
        ('Can Arslan', '+90 555 5678901', 'English, Turkish, Spanish', 130.00, 'Wine Tours', 'available')
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);
    console.log(`✅ Created ${guidesResult.rowCount} guides\n`);

    // 6. Seed Vehicles
    console.log('📝 Seeding vehicles...');
    const vehiclesResult = await pool.query(`
      INSERT INTO vehicles (vehicle_number, type, capacity, daily_rate, driver_name, driver_phone, status)
      VALUES
        ('34 ABC 123', 'Mercedes Vito', 7, 120.00, 'Ahmet Yıldız', '+90 555 1111111', 'available'),
        ('34 XYZ 456', 'Volkswagen Caravelle', 8, 130.00, 'Mehmet Şahin', '+90 555 2222222', 'available'),
        ('06 DEF 789', 'Mercedes Sprinter', 15, 180.00, 'Ali Çelik', '+90 555 3333333', 'available'),
        ('35 GHI 012', 'Toyota Hiace', 12, 150.00, 'Mustafa Demir', '+90 555 4444444', 'available'),
        ('34 JKL 345', 'Ford Transit', 16, 170.00, 'Hasan Kaya', '+90 555 5555555', 'available')
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);
    console.log(`✅ Created ${vehiclesResult.rowCount} vehicles\n`);

    // 7. Seed Bookings
    console.log('📝 Seeding bookings...');

    // Get client IDs for reference
    const clients = await pool.query('SELECT id FROM clients ORDER BY id LIMIT 6');
    const clientIds = clients.rows.map(r => r.id);

    // Get the next booking code number
    const maxBookingResult = await pool.query(`
      SELECT COALESCE(MAX(CAST(SUBSTRING(booking_code FROM 7) AS INTEGER)), 1045) + 1 as next_num
      FROM bookings
      WHERE booking_code LIKE 'Funny-%'
    `);
    let nextNum = maxBookingResult.rows[0].next_num;

    // Create bookings with different statuses
    const bookingsResult = await pool.query(`
      INSERT INTO bookings (booking_code, client_id, pax_count, travel_date_from, travel_date_to, status, is_confirmed, confirmed_at, notes)
      VALUES
        ($1, $7, 2, '2025-12-10', '2025-12-15', 'confirmed', true, NOW(), 'Honeymoon package'),
        ($2, $8, 4, '2025-12-20', '2025-12-25', 'confirmed', true, NOW(), 'Family vacation'),
        ($3, $9, 6, '2026-01-05', '2026-01-10', 'quoted', false, NULL, 'Group booking inquiry'),
        ($4, $10, 2, '2026-01-15', '2026-01-20', 'inquiry', false, NULL, 'Pending quotation'),
        ($5, $11, 8, '2025-11-25', '2025-11-30', 'completed', true, '2025-11-01', 'Business group tour'),
        ($6, $12, 3, '2025-12-12', '2025-12-18', 'confirmed', true, NOW(), 'Anniversary celebration')
      RETURNING id, booking_code;
    `, [
      `Funny-${nextNum}`, `Funny-${nextNum + 1}`, `Funny-${nextNum + 2}`,
      `Funny-${nextNum + 3}`, `Funny-${nextNum + 4}`, `Funny-${nextNum + 5}`,
      ...clientIds
    ]);
    console.log(`✅ Created ${bookingsResult.rowCount} bookings:`);
    bookingsResult.rows.forEach(r => console.log(`   - ${r.booking_code}`));
    console.log('');

    const bookingIds = bookingsResult.rows.map(r => r.id);

    // 8. Seed Passengers
    console.log('📝 Seeding passengers...');
    const b1 = bookingIds[0];
    const b2 = bookingIds[1];
    const b3 = bookingIds[2];
    const b5 = bookingIds[4];
    const b6 = bookingIds[5];

    const passengersResult = await pool.query(`
      INSERT INTO passengers (booking_id, name, passport_number, nationality, date_of_birth, special_requests)
      VALUES
        ($1, 'John Doe', 'AB1234567', 'USA', '1985-05-15', 'Vegetarian meals'),
        ($1, 'Jane Doe', 'AB1234568', 'USA', '1987-08-20', 'Window seat preferred'),
        ($2, 'Michael Smith', 'CD2345678', 'UK', '1980-03-10', NULL),
        ($2, 'Sarah Smith', 'CD2345679', 'UK', '1982-07-25', NULL),
        ($2, 'Tom Smith', 'CD2345680', 'UK', '2010-12-01', 'Child meal'),
        ($2, 'Emma Smith', 'CD2345681', 'UK', '2012-09-15', 'Child meal'),
        ($3, 'Ahmed Ali', 'EF3456789', 'UAE', '1975-11-30', 'Halal food'),
        ($3, 'Fatima Ali', 'EF3456790', 'UAE', '1978-04-18', 'Halal food'),
        ($4, 'Li Wei', 'GH4567890', 'China', '1990-02-14', NULL),
        ($4, 'Wang Fang', 'GH4567891', 'China', '1992-06-22', NULL),
        ($5, 'Pierre Dubois', 'IJ5678901', 'France', '1965-09-05', 'Wheelchair access needed'),
        ($5, 'Marie Dubois', 'IJ5678902', 'France', '1967-12-12', 'Gluten-free meals')
      RETURNING id;
    `, [b1, b2, b3, b5, b6]);
    console.log(`✅ Created ${passengersResult.rowCount} passengers\n`);

    // 9. Seed Booking Hotels
    console.log('📝 Seeding booking hotels...');
    const hotels = await pool.query('SELECT id, name FROM hotels ORDER BY id LIMIT 6');
    const bookingHotelsResult = await pool.query(`
      INSERT INTO booking_hotels (booking_id, hotel_id, hotel_name, check_in, check_out, nights, room_type, number_of_rooms, cost_per_night, sell_price, payment_due_date, confirmation_number)
      VALUES
        ($1, $7, $8, '2025-12-10', '2025-12-12', 2, 'Deluxe Double', 1, 150.00, 200.00, '2025-12-05', 'H12345'),
        ($1, $9, $10, '2025-12-12', '2025-12-15', 3, 'Cave Suite', 1, 200.00, 280.00, '2025-12-05', 'H12346'),
        ($2, $7, $8, '2025-12-20', '2025-12-23', 3, 'Family Suite', 2, 150.00, 220.00, '2025-12-15', 'H12347'),
        ($2, $11, $12, '2025-12-23', '2025-12-25', 2, 'Deluxe Room', 2, 250.00, 350.00, '2025-12-15', 'H12348'),
        ($5, $7, $8, '2025-11-25', '2025-11-28', 3, 'Executive Room', 4, 150.00, 200.00, '2025-11-20', 'H12349'),
        ($6, $13, $14, '2025-12-12', '2025-12-15', 3, 'Premier Room', 2, 300.00, 400.00, '2025-12-07', 'H12350')
      RETURNING id;
    `, [...bookingIds.slice(0, 3), ...bookingIds.slice(4, 6), hotels.rows[0].id, hotels.rows[0].name, hotels.rows[3].id, hotels.rows[3].name, hotels.rows[4].id, hotels.rows[4].name, hotels.rows[5].id, hotels.rows[5].name]);
    console.log(`✅ Created ${bookingHotelsResult.rowCount} hotel bookings\n`);

    // 10. Seed Booking Tours
    console.log('📝 Seeding booking tours...');
    const tourSuppliers = await pool.query('SELECT id, name FROM tour_suppliers ORDER BY id LIMIT 4');
    const guidesList = await pool.query('SELECT id, name FROM guides ORDER BY id LIMIT 3');
    const vehiclesList = await pool.query('SELECT id FROM vehicles ORDER BY id LIMIT 3');

    const bookingToursResult = await pool.query(`
      INSERT INTO booking_tours (booking_id, tour_name, tour_date, duration, pax_count, operation_type, supplier_id, supplier_cost, sell_price, payment_due_date, confirmation_number)
      VALUES
        ($1, 'Hot Air Balloon Tour', '2025-12-11', 'Full Day', 2, 'supplier', $7, 300.00, 450.00, '2025-12-10', 'T12345'),
        ($2, 'Bosphorus Cruise', '2025-12-21', 'Half Day', 4, 'supplier', $8, 200.00, 320.00, '2025-12-19', 'T12346'),
        ($5, 'Istanbul City Tour', '2025-11-26', 'Full Day', 8, 'self-operated', NULL, NULL, 600.00, '2025-11-24', NULL),
        ($6, 'Ephesus Ancient City', '2025-12-14', 'Full Day', 3, 'supplier', $9, 250.00, 380.00, '2025-12-12', 'T12347')
      RETURNING id;
    `, [...bookingIds.slice(0, 2), bookingIds[4], bookingIds[5], tourSuppliers.rows[0].id, tourSuppliers.rows[1].id, tourSuppliers.rows[2].id]);

    // Update self-operated tour with guide and vehicle details
    await pool.query(`
      UPDATE booking_tours
      SET guide_id = $1, guide_cost = 100.00, vehicle_id = $2, vehicle_cost = 120.00, entrance_fees = 80.00
      WHERE operation_type = 'self-operated'
    `, [guidesList.rows[0].id, vehiclesList.rows[0].id]);

    console.log(`✅ Created ${bookingToursResult.rowCount} tour bookings\n`);

    // 11. Seed Booking Transfers
    console.log('📝 Seeding booking transfers...');
    const bookingTransfersResult = await pool.query(`
      INSERT INTO booking_transfers (booking_id, transfer_type, transfer_date, from_location, to_location, pax_count, vehicle_type, operation_type, vehicle_id, cost_price, sell_price, confirmation_number)
      VALUES
        ($1, 'Airport Pickup', '2025-12-10', 'Istanbul Airport', 'Hilton Istanbul', 2, 'Sedan', 'self-operated', $7, 30.00, 50.00, 'TR12345'),
        ($1, 'Airport Dropoff', '2025-12-15', 'Sultan Cave Suites', 'Cappadocia Airport', 2, 'Sedan', 'self-operated', $7, 35.00, 55.00, 'TR12346'),
        ($2, 'Airport Pickup', '2025-12-20', 'Istanbul Airport', 'Hotel', 4, 'Van', 'self-operated', $8, 40.00, 70.00, 'TR12347'),
        ($2, 'Inter-city Transfer', '2025-12-23', 'Istanbul', 'Antalya', 4, 'Van', 'self-operated', $8, 200.00, 280.00, 'TR12348'),
        ($5, 'Airport Pickup', '2025-11-25', 'Istanbul Airport', 'Hotel', 8, 'Minibus', 'self-operated', $9, 60.00, 100.00, 'TR12349')
      RETURNING id;
    `, [...bookingIds.slice(0, 2), bookingIds[4], vehiclesList.rows[0].id, vehiclesList.rows[1].id, vehiclesList.rows[2].id]);
    console.log(`✅ Created ${bookingTransfersResult.rowCount} transfer bookings\n`);

    // 12. Seed Booking Flights
    console.log('📝 Seeding booking flights...');
    const bookingFlightsResult = await pool.query(`
      INSERT INTO booking_flights (booking_id, airline, flight_number, departure_date, arrival_date, from_airport, to_airport, pax_count, cost_price, sell_price, pnr, ticket_numbers)
      VALUES
        ($2, 'Turkish Airlines', 'TK1980', '2025-12-20 10:00:00', '2025-12-20 14:00:00', 'JFK', 'IST', 4, 800.00, 1000.00, 'ABC123', '2351234567890,2351234567891,2351234567892,2351234567893'),
        ($2, 'Turkish Airlines', 'TK1981', '2025-12-25 15:00:00', '2025-12-25 19:00:00', 'IST', 'JFK', 4, 850.00, 1050.00, 'ABC124', '2351234567894,2351234567895,2351234567896,2351234567897')
      RETURNING id;
    `, [bookingIds[1]]);
    console.log(`✅ Created ${bookingFlightsResult.rowCount} flight bookings\n`);

    // 13. Seed Client Payments
    console.log('📝 Seeding client payments...');
    const clientPaymentsResult = await pool.query(`
      INSERT INTO client_payments (booking_id, payment_date, amount, currency, payment_method, reference_number, notes)
      VALUES
        ($1, '2025-12-01', 500.00, 'USD', 'bank_transfer', 'TXN12345', 'First payment'),
        ($1, '2025-12-05', 500.00, 'USD', 'bank_transfer', 'TXN12346', 'Second payment'),
        ($2, '2025-12-10', 1000.00, 'USD', 'credit_card', 'CC78901', 'Deposit payment'),
        ($5, '2025-11-15', 3000.00, 'USD', 'bank_transfer', 'TXN12347', 'Full payment'),
        ($6, '2025-12-05', 1200.00, 'USD', 'bank_transfer', 'TXN12348', 'Partial payment')
      RETURNING id;
    `, [...bookingIds.slice(0, 2), bookingIds[4], bookingIds[5]]);
    console.log(`✅ Created ${clientPaymentsResult.rowCount} client payments\n`);

    // 14. Seed Supplier Payments
    console.log('📝 Seeding supplier payments...');
    const bookingHotels = await pool.query('SELECT id, booking_id, hotel_name, total_cost FROM booking_hotels ORDER BY id LIMIT 3');
    const supplierPaymentsResult = await pool.query(`
      INSERT INTO supplier_payments (booking_id, supplier_type, supplier_name, service_id, amount, currency, payment_date, due_date, payment_method, status, reference_number)
      VALUES
        ($1, 'hotel', $2, $3, $4, 'USD', '2025-12-05', '2025-12-05', 'bank_transfer', 'paid', 'PAY12345'),
        ($5, 'hotel', $6, $7, $8, 'USD', NULL, '2025-11-23', NULL, 'pending', NULL),
        ($9, 'tour', 'Cappadocia Adventures', NULL, 300.00, 'USD', '2025-12-10', '2025-12-10', 'bank_transfer', 'paid', 'PAY12346')
      RETURNING id;
    `, [
      bookingHotels.rows[0].booking_id, bookingHotels.rows[0].hotel_name, bookingHotels.rows[0].id, bookingHotels.rows[0].total_cost,
      bookingHotels.rows[2].booking_id, bookingHotels.rows[2].hotel_name, bookingHotels.rows[2].id, bookingHotels.rows[2].total_cost,
      bookingIds[0]
    ]);
    console.log(`✅ Created ${supplierPaymentsResult.rowCount} supplier payments\n`);

    // 15. Seed Operational Expenses
    console.log('📝 Seeding operational expenses...');
    const expensesResult = await pool.query(`
      INSERT INTO operational_expenses (expense_date, category, description, amount, currency, payment_method, is_recurring)
      VALUES
        ('2025-11-01', 'rent', 'Office rent for November', 2000.00, 'USD', 'bank_transfer', true),
        ('2025-11-05', 'salaries', 'Staff salaries November', 5000.00, 'USD', 'bank_transfer', true),
        ('2025-11-10', 'utilities', 'Electricity and water', 300.00, 'USD', 'bank_transfer', true),
        ('2025-11-15', 'marketing', 'Facebook ads campaign', 500.00, 'USD', 'credit_card', false),
        ('2025-11-20', 'office_supplies', 'Office stationery and supplies', 150.00, 'USD', 'cash', false),
        ('2025-11-25', 'software', 'Annual software licenses', 800.00, 'USD', 'credit_card', false),
        ('2025-12-01', 'rent', 'Office rent for December', 2000.00, 'USD', 'bank_transfer', true)
      RETURNING id;
    `);
    console.log(`✅ Created ${expensesResult.rowCount} operational expenses\n`);

    // Trigger calculations
    console.log('🔄 Triggering automatic calculations...');
    await pool.query('SELECT id FROM bookings');
    console.log('✅ All database triggers executed\n');

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: 4`);
    console.log(`   - Clients: 6`);
    console.log(`   - Hotels: 6`);
    console.log(`   - Tour Suppliers: 4`);
    console.log(`   - Guides: 5`);
    console.log(`   - Vehicles: 5`);
    console.log(`   - Bookings: 6 (with auto-generated booking codes)`);
    console.log(`   - Passengers: 12`);
    console.log(`   - Hotel Bookings: 6`);
    console.log(`   - Tour Bookings: 4`);
    console.log(`   - Transfer Bookings: 5`);
    console.log(`   - Flight Bookings: 2`);
    console.log(`   - Client Payments: 5`);
    console.log(`   - Supplier Payments: 3`);
    console.log(`   - Operational Expenses: 7`);
    console.log('\n✅ Test data is ready for API testing!\n');

    console.log('🔑 Login Credentials:');
    console.log('   Admin:      username: admin      password: admin123');
    console.log('   Staff:      username: staff1     password: staff123');
    console.log('   Accountant: username: accountant password: accountant123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seeding
seedDatabase()
  .then(() => {
    console.log('\n✅ Seeding script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding script failed:', error);
    process.exit(1);
  });
