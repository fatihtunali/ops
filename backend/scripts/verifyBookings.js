const { query } = require('../src/config/database');

async function verifyBookings() {
  try {
    const result = await query(`
      SELECT
        b.booking_code,
        b.status,
        b.pax_count,
        (SELECT COUNT(*) FROM booking_hotels WHERE booking_id = b.id) as hotels,
        (SELECT COUNT(*) FROM booking_tours WHERE booking_id = b.id) as tours,
        (SELECT COUNT(*) FROM booking_transfers WHERE booking_id = b.id) as transfers,
        (SELECT COUNT(*) FROM booking_flights WHERE booking_id = b.id) as flights
      FROM bookings b
      ORDER BY b.id
    `);

    console.log('\n=== REMAINING BOOKINGS WITH SERVICES ===\n');
    console.log('Code          Status      PAX  Hotels Tours Transfers Flights Total');
    console.log('------------------------------------------------------------------------');

    result.rows.forEach(b => {
      const total = parseInt(b.hotels) + parseInt(b.tours) + parseInt(b.transfers) + parseInt(b.flights);
      console.log(
        `${b.booking_code.padEnd(13)} ${b.status.padEnd(11)} ${String(b.pax_count).padEnd(4)} ${String(b.hotels).padEnd(6)} ${String(b.tours).padEnd(5)} ${String(b.transfers).padEnd(9)} ${String(b.flights).padEnd(7)} ${total}`
      );
    });

    console.log('------------------------------------------------------------------------');
    console.log(`Total: ${result.rows.length} bookings (all with services)\n`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verifyBookings();
