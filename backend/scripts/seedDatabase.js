const { query } = require('../src/config/database');

async function seedDatabase() {
  console.log('=== SEEDING DATABASE WITH SAMPLE DATA ===\n');

  try {
    // Get existing counts
    const bookingsCount = await query('SELECT COUNT(*) FROM bookings');
    const hotelsCount = await query('SELECT COUNT(*) FROM booking_hotels');
    const toursCount = await query('SELECT COUNT(*) FROM booking_tours');
    const transfersCount = await query('SELECT COUNT(*) FROM booking_transfers');
    const flightsCount = await query('SELECT COUNT(*) FROM booking_flights');
    const passengersCount = await query('SELECT COUNT(*) FROM passengers');

    console.log('Current database state:');
    console.log(`  Bookings: ${bookingsCount.rows[0].count}`);
    console.log(`  Hotels: ${hotelsCount.rows[0].count}`);
    console.log(`  Tours: ${toursCount.rows[0].count}`);
    console.log(`  Transfers: ${transfersCount.rows[0].count}`);
    console.log(`  Flights: ${flightsCount.rows[0].count}`);
    console.log(`  Passengers: ${passengersCount.rows[0].count}\n`);

    // Get client IDs
    const clientsResult = await query('SELECT id FROM clients LIMIT 7');
    const clientIds = clientsResult.rows.map(r => r.id);

    // Get hotel IDs
    const hotelsResult = await query('SELECT id FROM hotels LIMIT 10');
    const hotelIds = hotelsResult.rows.map(r => r.id);

    // Get supplier IDs
    const suppliersResult = await query('SELECT id FROM tour_suppliers LIMIT 9');
    const supplierIds = suppliersResult.rows.map(r => r.id);

    // Get guide IDs
    const guidesResult = await query('SELECT id FROM guides LIMIT 11');
    const guideIds = guidesResult.rows.map(r => r.id);

    // Get vehicle IDs
    const vehiclesResult = await query('SELECT id FROM vehicles LIMIT 5');
    const vehicleIds = vehiclesResult.rows.map(r => r.id);

    console.log('Resource IDs retrieved');
    console.log(`  Clients: ${clientIds.length}`);
    console.log(`  Hotels: ${hotelIds.length}`);
    console.log(`  Suppliers: ${supplierIds.length}`);
    console.log(`  Guides: ${guideIds.length}`);
    console.log(`  Vehicles: ${vehicleIds.length}\n`);

    // Get the latest booking code number
    const latestBookingResult = await query(`
      SELECT booking_code FROM bookings
      ORDER BY id DESC LIMIT 1
    `);

    let startingCodeNumber = 1046; // default
    if (latestBookingResult.rows.length > 0) {
      const latestCode = latestBookingResult.rows[0].booking_code;
      const codeNumber = parseInt(latestCode.split('-')[1]);
      startingCodeNumber = codeNumber + 1;
    }

    console.log(`Starting booking codes from: Funny-${startingCodeNumber}\n`);

    // Add 10 new bookings with different scenarios
    console.log('Creating bookings...');

    const bookingData = [
      {
        client_id: clientIds[0],
        pax: 2,
        from: '2025-11-15',
        to: '2025-11-20',
        status: 'confirmed',
        confirmed: true,
        sell: 3500.00,
        cost: 2800.00,
        notes: 'Anniversary trip to Istanbul and Cappadocia'
      },
      {
        client_id: clientIds[1],
        pax: 4,
        from: '2025-11-22',
        to: '2025-11-28',
        status: 'confirmed',
        confirmed: true,
        sell: 6800.00,
        cost: 5200.00,
        notes: 'Family vacation - 7 day Turkey tour'
      },
      {
        client_id: clientIds[2],
        pax: 8,
        from: '2025-12-01',
        to: '2025-12-08',
        status: 'confirmed',
        confirmed: true,
        sell: 12500.00,
        cost: 9500.00,
        notes: 'Group tour - Historical sites and coastal areas'
      },
      {
        client_id: clientIds[3],
        pax: 2,
        from: '2025-12-10',
        to: '2025-12-14',
        status: 'quoted',
        confirmed: false,
        sell: 2800.00,
        cost: 0,
        notes: 'Honeymoon package inquiry'
      },
      {
        client_id: clientIds[4],
        pax: 6,
        from: '2025-12-15',
        to: '2025-12-22',
        status: 'confirmed',
        confirmed: true,
        sell: 9600.00,
        cost: 7400.00,
        notes: 'Extended family trip - Christmas vacation'
      },
      {
        client_id: clientIds[0],
        pax: 3,
        from: '2026-01-05',
        to: '2026-01-10',
        status: 'inquiry',
        confirmed: false,
        sell: 0,
        cost: 0,
        notes: 'Initial inquiry for New Year trip'
      },
      {
        client_id: clientIds[2],
        pax: 10,
        from: '2026-01-15',
        to: '2026-01-25',
        status: 'confirmed',
        confirmed: true,
        sell: 18500.00,
        cost: 14200.00,
        notes: 'Large group tour - comprehensive Turkey package'
      },
      {
        client_id: clientIds[1],
        pax: 2,
        from: '2026-02-01',
        to: '2026-02-05',
        status: 'quoted',
        confirmed: false,
        sell: 2400.00,
        cost: 0,
        notes: 'Weekend getaway to Istanbul'
      },
      {
        client_id: clientIds[3],
        pax: 5,
        from: '2026-02-14',
        to: '2026-02-21',
        status: 'confirmed',
        confirmed: true,
        sell: 8200.00,
        cost: 6300.00,
        notes: 'Ski and cultural tour combination'
      },
      {
        client_id: clientIds[4],
        pax: 4,
        from: '2026-03-01',
        to: '2026-03-07',
        status: 'cancelled',
        confirmed: false,
        sell: 0,
        cost: 0,
        notes: 'Cancelled due to schedule conflict'
      }
    ];

    const newBookingIds = [];
    for (const booking of bookingData) {
      const bookingCode = `Funny-${startingCodeNumber + newBookingIds.length}`;
      const confirmedAt = booking.confirmed ? 'NOW()' : 'NULL';
      const grossProfit = booking.sell - booking.cost;

      const result = await query(
        `INSERT INTO bookings (
          booking_code, client_id, pax_count, travel_date_from, travel_date_to,
          status, is_confirmed, total_sell_price, total_cost_price, gross_profit,
          payment_status, amount_received, notes, confirmed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, ${confirmedAt})
        RETURNING id`,
        [
          bookingCode, booking.client_id, booking.pax, booking.from, booking.to,
          booking.status, booking.confirmed, booking.sell, booking.cost, grossProfit,
          'pending', 0, booking.notes
        ]
      );
      newBookingIds.push(result.rows[0].id);
      console.log(`  ✅ Created booking ${bookingCode} (ID: ${result.rows[0].id})`);
    }

    // Add hotel bookings for each confirmed booking
    console.log('\nCreating hotel bookings...');
    let hotelCount = 0;
    for (let i = 0; i < newBookingIds.length; i++) {
      const bookingId = newBookingIds[i];
      const booking = bookingData[i];

      if (booking.confirmed) {
        // Calculate nights
        const from = new Date(booking.from);
        const to = new Date(booking.to);
        const nights = Math.ceil((to - from) / (1000 * 60 * 60 * 24));

        // Add 1-2 hotels per booking
        const numHotels = nights > 4 ? 2 : 1;

        for (let h = 0; h < numHotels; h++) {
          const hotelId = hotelIds[Math.floor(Math.random() * hotelIds.length)];
          const costPerNight = 80 + Math.random() * 120;
          const sellPrice = costPerNight * 1.25;
          const hotelNights = Math.floor(nights / numHotels);

          await query(
            `INSERT INTO booking_hotels (
              booking_id, hotel_id, check_in, check_out, nights,
              room_type, number_of_rooms, cost_per_night, total_cost,
              sell_price, margin, payment_status, paid_amount,
              confirmation_number, voucher_issued
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
            [
              bookingId, hotelId,
              h === 0 ? booking.from : new Date(new Date(booking.from).getTime() + hotelNights * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              h === 0 ? new Date(new Date(booking.from).getTime() + hotelNights * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : booking.to,
              hotelNights,
              ['Standard Double', 'Deluxe Double', 'Suite', 'Family Room'][Math.floor(Math.random() * 4)],
              Math.ceil(booking.pax / 2),
              costPerNight.toFixed(2),
              (costPerNight * hotelNights).toFixed(2),
              (sellPrice * hotelNights).toFixed(2),
              ((sellPrice - costPerNight) * hotelNights).toFixed(2),
              Math.random() > 0.5 ? 'paid' : 'pending',
              Math.random() > 0.5 ? (costPerNight * hotelNights).toFixed(2) : 0,
              `HTL-${Date.now()}-${h}`,
              Math.random() > 0.7
            ]
          );
          hotelCount++;
        }
      }
    }
    console.log(`  ✅ Created ${hotelCount} hotel bookings`);

    // Add tours for each confirmed booking
    console.log('\nCreating tour bookings...');
    let tourCount = 0;
    for (let i = 0; i < newBookingIds.length; i++) {
      const bookingId = newBookingIds[i];
      const booking = bookingData[i];

      if (booking.confirmed) {
        // Add 2-4 tours per booking
        const numTours = 2 + Math.floor(Math.random() * 3);

        const tourNames = [
          'Full Day Istanbul Tour',
          'Cappadocia Hot Air Balloon',
          'Ephesus Ancient City Tour',
          'Pamukkale Travertines',
          'Bosphorus Cruise',
          'Gallipoli Battlefields',
          'Troy Ancient City',
          'Antalya City Tour'
        ];

        for (let t = 0; t < numTours; t++) {
          const tourDate = new Date(new Date(booking.from).getTime() + t * 24 * 60 * 60 * 1000);
          const supplierId = supplierIds[Math.floor(Math.random() * supplierIds.length)];
          const guideId = guideIds[Math.floor(Math.random() * guideIds.length)];
          const vehicleId = vehicleIds[Math.floor(Math.random() * vehicleIds.length)];

          const supplierCost = 200 + Math.random() * 300;
          const guideCost = 80 + Math.random() * 60;
          const vehicleCost = 100 + Math.random() * 100;
          const totalCost = supplierCost + guideCost + vehicleCost;
          const sellPrice = totalCost * 1.35;

          await query(
            `INSERT INTO booking_tours (
              booking_id, tour_name, tour_date, duration, pax_count,
              operation_type, supplier_id, supplier_cost, guide_id, guide_cost,
              vehicle_id, vehicle_cost, entrance_fees, other_costs, total_cost,
              sell_price, margin, payment_status, paid_amount,
              confirmation_number, voucher_issued
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
            [
              bookingId,
              tourNames[Math.floor(Math.random() * tourNames.length)],
              tourDate.toISOString().split('T')[0],
              'Full Day',
              booking.pax,
              'supplier',
              supplierId,
              supplierCost.toFixed(2),
              guideId,
              guideCost.toFixed(2),
              vehicleId,
              vehicleCost.toFixed(2),
              20,
              10,
              totalCost.toFixed(2),
              sellPrice.toFixed(2),
              (sellPrice - totalCost).toFixed(2),
              Math.random() > 0.6 ? 'paid' : 'pending',
              Math.random() > 0.6 ? totalCost.toFixed(2) : 0,
              `TOUR-${Date.now()}-${t}`,
              Math.random() > 0.5
            ]
          );
          tourCount++;
        }
      }
    }
    console.log(`  ✅ Created ${tourCount} tour bookings`);

    // Add transfers for each confirmed booking
    console.log('\nCreating transfer bookings...');
    let transferCount = 0;
    for (let i = 0; i < newBookingIds.length; i++) {
      const bookingId = newBookingIds[i];
      const booking = bookingData[i];

      if (booking.confirmed) {
        // Add airport transfers (arrival and departure)
        const transfers = [
          {
            type: 'Airport Pickup',
            date: booking.from,
            from: 'Istanbul Airport',
            to: 'Hotel in Sultanahmet'
          },
          {
            type: 'Airport Drop-off',
            date: booking.to,
            from: 'Hotel in Sultanahmet',
            to: 'Istanbul Airport'
          },
          {
            type: 'Inter-city Transfer',
            date: new Date(new Date(booking.from).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            from: 'Istanbul',
            to: 'Cappadocia'
          }
        ];

        for (const transfer of transfers) {
          const supplierId = supplierIds[Math.floor(Math.random() * supplierIds.length)];
          const vehicleId = vehicleIds[Math.floor(Math.random() * vehicleIds.length)];
          const cost = 40 + Math.random() * 80;
          const sellPrice = cost * 1.3;

          await query(
            `INSERT INTO booking_transfers (
              booking_id, transfer_type, transfer_date, from_location, to_location,
              pax_count, vehicle_type, operation_type, supplier_id, vehicle_id,
              cost_price, sell_price, margin, payment_status, paid_amount,
              confirmation_number, voucher_issued
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
            [
              bookingId,
              transfer.type,
              transfer.date,
              transfer.from,
              transfer.to,
              booking.pax,
              booking.pax <= 4 ? 'Sedan' : 'Van',
              'supplier',
              supplierId,
              vehicleId,
              cost.toFixed(2),
              sellPrice.toFixed(2),
              (sellPrice - cost).toFixed(2),
              Math.random() > 0.5 ? 'paid' : 'pending',
              Math.random() > 0.5 ? cost.toFixed(2) : 0,
              `TRANS-${Date.now()}-${Math.random()}`,
              Math.random() > 0.6
            ]
          );
          transferCount++;
        }
      }
    }
    console.log(`  ✅ Created ${transferCount} transfer bookings`);

    // Add flights for some confirmed bookings
    console.log('\nCreating flight bookings...');
    let flightCount = 0;
    for (let i = 0; i < newBookingIds.length; i++) {
      const bookingId = newBookingIds[i];
      const booking = bookingData[i];

      if (booking.confirmed && Math.random() > 0.5) {
        // Add arrival and departure flights
        const costPerPax = 150 + Math.random() * 250;
        const sellPerPax = costPerPax * 1.15;

        // Arrival flight
        await query(
          `INSERT INTO booking_flights (
            booking_id, airline, flight_number, departure_date, arrival_date,
            from_airport, to_airport, pax_count, cost_price, sell_price,
            margin, payment_status, paid_amount, pnr, voucher_issued
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            bookingId,
            ['Turkish Airlines', 'Pegasus', 'Lufthansa', 'Emirates'][Math.floor(Math.random() * 4)],
            `TK${Math.floor(Math.random() * 900) + 100}`,
            new Date(new Date(booking.from).getTime() - 2 * 60 * 60 * 1000),
            booking.from,
            ['JFK', 'LHR', 'CDG', 'FRA'][Math.floor(Math.random() * 4)],
            'IST',
            booking.pax,
            (costPerPax * booking.pax).toFixed(2),
            (sellPerPax * booking.pax).toFixed(2),
            ((sellPerPax - costPerPax) * booking.pax).toFixed(2),
            Math.random() > 0.7 ? 'paid' : 'pending',
            Math.random() > 0.7 ? (costPerPax * booking.pax).toFixed(2) : 0,
            `PNR${Math.floor(Math.random() * 900000) + 100000}`,
            Math.random() > 0.5
          ]
        );

        // Departure flight
        await query(
          `INSERT INTO booking_flights (
            booking_id, airline, flight_number, departure_date, arrival_date,
            from_airport, to_airport, pax_count, cost_price, sell_price,
            margin, payment_status, paid_amount, pnr, voucher_issued
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            bookingId,
            ['Turkish Airlines', 'Pegasus', 'Lufthansa', 'Emirates'][Math.floor(Math.random() * 4)],
            `TK${Math.floor(Math.random() * 900) + 100}`,
            booking.to,
            new Date(new Date(booking.to).getTime() + 10 * 60 * 60 * 1000),
            'IST',
            ['JFK', 'LHR', 'CDG', 'FRA'][Math.floor(Math.random() * 4)],
            booking.pax,
            (costPerPax * booking.pax).toFixed(2),
            (sellPerPax * booking.pax).toFixed(2),
            ((sellPerPax - costPerPax) * booking.pax).toFixed(2),
            Math.random() > 0.7 ? 'paid' : 'pending',
            Math.random() > 0.7 ? (costPerPax * booking.pax).toFixed(2) : 0,
            `PNR${Math.floor(Math.random() * 900000) + 100000}`,
            Math.random() > 0.5
          ]
        );
        flightCount += 2;
      }
    }
    console.log(`  ✅ Created ${flightCount} flight bookings`);

    // Add passengers for each confirmed booking
    console.log('\nCreating passengers...');
    let passengerCount = 0;
    for (let i = 0; i < newBookingIds.length; i++) {
      const bookingId = newBookingIds[i];
      const booking = bookingData[i];

      if (booking.confirmed) {
        const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James', 'Maria', 'Robert', 'Anna'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        const nationalities = ['American', 'British', 'German', 'French', 'Canadian', 'Australian'];

        for (let p = 0; p < booking.pax; p++) {
          const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
          const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

          await query(
            `INSERT INTO passengers (
              booking_id, name, passport_number, nationality, date_of_birth, special_requests
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              bookingId,
              `${firstName} ${lastName}`,
              `P${Math.floor(Math.random() * 90000000) + 10000000}`,
              nationalities[Math.floor(Math.random() * nationalities.length)],
              new Date(1960 + Math.random() * 40, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
              p === 0 && Math.random() > 0.7 ? ['Vegetarian meal', 'Wheelchair access', 'Child seat needed'][Math.floor(Math.random() * 3)] : null
            ]
          );
          passengerCount++;
        }
      }
    }
    console.log(`  ✅ Created ${passengerCount} passengers`);

    // Add some client payments
    console.log('\nCreating client payments...');
    let paymentCount = 0;
    for (let i = 0; i < newBookingIds.length; i++) {
      const bookingId = newBookingIds[i];
      const booking = bookingData[i];

      if (booking.confirmed && booking.sell > 0 && Math.random() > 0.3) {
        const paymentAmount = booking.sell * (0.3 + Math.random() * 0.5); // 30-80% deposit

        await query(
          `INSERT INTO client_payments (
            booking_id, payment_date, amount, currency, payment_method, reference_number
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            bookingId,
            booking.from,
            paymentAmount.toFixed(2),
            'USD',
            ['Bank Transfer', 'Credit Card', 'PayPal', 'Cash'][Math.floor(Math.random() * 4)],
            `PAY-${Date.now()}-${Math.random()}`
          ]
        );
        paymentCount++;

        // Update amount_received in booking
        await query(
          'UPDATE bookings SET amount_received = $1 WHERE id = $2',
          [paymentAmount.toFixed(2), bookingId]
        );
      }
    }
    console.log(`  ✅ Created ${paymentCount} client payments`);

    // Add operational expenses
    console.log('\nCreating operational expenses...');
    const expenseCategories = [
      { category: 'Office Rent', amount: 2500, recurring: true },
      { category: 'Utilities', amount: 300, recurring: true },
      { category: 'Internet & Phone', amount: 150, recurring: true },
      { category: 'Marketing', amount: 1200, recurring: false },
      { category: 'Software Subscriptions', amount: 450, recurring: true },
      { category: 'Office Supplies', amount: 200, recurring: false },
      { category: 'Insurance', amount: 800, recurring: true },
      { category: 'Staff Training', amount: 600, recurring: false }
    ];

    for (const expense of expenseCategories) {
      await query(
        `INSERT INTO operational_expenses (
          expense_date, category, description, amount, currency,
          payment_method, is_recurring
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          '2025-11-01',
          expense.category,
          `Monthly ${expense.category.toLowerCase()} payment`,
          expense.amount,
          'USD',
          'Bank Transfer',
          expense.recurring
        ]
      );
    }
    console.log(`  ✅ Created ${expenseCategories.length} operational expenses`);

    console.log('\n=== DATABASE SEEDING COMPLETE ===\n');

    // Show final counts
    const finalBookings = await query('SELECT COUNT(*) FROM bookings');
    const finalHotels = await query('SELECT COUNT(*) FROM booking_hotels');
    const finalTours = await query('SELECT COUNT(*) FROM booking_tours');
    const finalTransfers = await query('SELECT COUNT(*) FROM booking_transfers');
    const finalFlights = await query('SELECT COUNT(*) FROM booking_flights');
    const finalPassengers = await query('SELECT COUNT(*) FROM passengers');
    const finalPayments = await query('SELECT COUNT(*) FROM client_payments');
    const finalExpenses = await query('SELECT COUNT(*) FROM operational_expenses');

    console.log('Final database state:');
    console.log(`  Bookings: ${finalBookings.rows[0].count}`);
    console.log(`  Hotels: ${finalHotels.rows[0].count}`);
    console.log(`  Tours: ${finalTours.rows[0].count}`);
    console.log(`  Transfers: ${finalTransfers.rows[0].count}`);
    console.log(`  Flights: ${finalFlights.rows[0].count}`);
    console.log(`  Passengers: ${finalPassengers.rows[0].count}`);
    console.log(`  Client Payments: ${finalPayments.rows[0].count}`);
    console.log(`  Operational Expenses: ${finalExpenses.rows[0].count}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
