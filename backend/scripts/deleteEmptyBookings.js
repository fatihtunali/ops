const { query } = require('../src/config/database');

async function deleteEmptyBookings() {
  console.log('=== FINDING AND DELETING BOOKINGS WITH NO SERVICES ===\n');

  try {
    // Find bookings with no services
    const result = await query(`
      SELECT
        b.id,
        b.booking_code,
        b.client_id,
        b.status,
        b.pax_count,
        b.travel_date_from,
        b.travel_date_to,
        b.total_sell_price,
        COALESCE(h.hotel_count, 0) as hotel_count,
        COALESCE(t.tour_count, 0) as tour_count,
        COALESCE(tr.transfer_count, 0) as transfer_count,
        COALESCE(f.flight_count, 0) as flight_count,
        COALESCE(h.hotel_count, 0) + COALESCE(t.tour_count, 0) +
        COALESCE(tr.transfer_count, 0) + COALESCE(f.flight_count, 0) as total_services
      FROM bookings b
      LEFT JOIN (
        SELECT booking_id, COUNT(*) as hotel_count
        FROM booking_hotels
        GROUP BY booking_id
      ) h ON b.id = h.booking_id
      LEFT JOIN (
        SELECT booking_id, COUNT(*) as tour_count
        FROM booking_tours
        GROUP BY booking_id
      ) t ON b.id = t.booking_id
      LEFT JOIN (
        SELECT booking_id, COUNT(*) as transfer_count
        FROM booking_transfers
        GROUP BY booking_id
      ) tr ON b.id = tr.booking_id
      LEFT JOIN (
        SELECT booking_id, COUNT(*) as flight_count
        FROM booking_flights
        GROUP BY booking_id
      ) f ON b.id = f.booking_id
      ORDER BY b.id
    `);

    console.log(`Total bookings in database: ${result.rows.length}\n`);

    // Find bookings with zero services
    const emptyBookings = result.rows.filter(b => b.total_services === '0');

    if (emptyBookings.length === 0) {
      console.log('✅ No empty bookings found. All bookings have at least one service.');
      process.exit(0);
    }

    console.log(`Found ${emptyBookings.length} bookings with NO services:\n`);
    console.log('┌─────────────────┬────────┬───────────┬──────────┬────────────┬──────────┐');
    console.log('│ Booking Code    │ Status │ PAX Count │ Hotels   │ Tours      │ Transfers│');
    console.log('├─────────────────┼────────┼───────────┼──────────┼────────────┼──────────┤');

    emptyBookings.forEach(booking => {
      console.log(
        `│ ${booking.booking_code.padEnd(15)} │ ${booking.status.padEnd(6)} │ ${String(booking.pax_count).padEnd(9)} │ ${booking.hotel_count.padEnd(8)} │ ${booking.tour_count.padEnd(10)} │ ${booking.transfer_count.padEnd(8)} │`
      );
    });
    console.log('└─────────────────┴────────┴───────────┴──────────┴────────────┴──────────┘\n');

    // Delete empty bookings
    console.log('Deleting empty bookings...\n');

    for (const booking of emptyBookings) {
      console.log(`Deleting booking ${booking.booking_code} (ID: ${booking.id})...`);

      // Delete related records first (in case there are any)
      await query('DELETE FROM passengers WHERE booking_id = $1', [booking.id]);
      await query('DELETE FROM client_payments WHERE booking_id = $1', [booking.id]);
      await query('DELETE FROM supplier_payments WHERE booking_id = $1', [booking.id]);

      // Delete the booking
      await query('DELETE FROM bookings WHERE id = $1', [booking.id]);

      console.log(`  ✅ Deleted ${booking.booking_code}\n`);
    }

    console.log('=== DELETION COMPLETE ===\n');

    // Show remaining bookings
    const finalResult = await query(`
      SELECT
        b.id,
        b.booking_code,
        b.status,
        COALESCE(h.hotel_count, 0) + COALESCE(t.tour_count, 0) +
        COALESCE(tr.transfer_count, 0) + COALESCE(f.flight_count, 0) as total_services
      FROM bookings b
      LEFT JOIN (
        SELECT booking_id, COUNT(*) as hotel_count FROM booking_hotels GROUP BY booking_id
      ) h ON b.id = h.booking_id
      LEFT JOIN (
        SELECT booking_id, COUNT(*) as tour_count FROM booking_tours GROUP BY booking_id
      ) t ON b.id = t.booking_id
      LEFT JOIN (
        SELECT booking_id, COUNT(*) as transfer_count FROM booking_transfers GROUP BY booking_id
      ) tr ON b.id = tr.booking_id
      LEFT JOIN (
        SELECT booking_id, COUNT(*) as flight_count FROM booking_flights GROUP BY booking_id
      ) f ON b.id = f.booking_id
      ORDER BY b.id
    `);

    console.log(`Remaining bookings: ${finalResult.rows.length}`);
    console.log(`Deleted bookings: ${emptyBookings.length}\n`);

    // Verify no empty bookings remain
    const remainingEmpty = finalResult.rows.filter(b => b.total_services === '0');
    if (remainingEmpty.length === 0) {
      console.log('✅ All bookings now have at least one service');
    } else {
      console.log(`⚠️  Warning: ${remainingEmpty.length} empty bookings still remain`);
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteEmptyBookings();
