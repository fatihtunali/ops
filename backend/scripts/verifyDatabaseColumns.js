const { query } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

// Define what we expect to use in our controllers
const CONTROLLER_EXPECTATIONS = {
  bookings: [
    'id', 'booking_code', 'client_id', 'pax_count',
    'travel_date_from', 'travel_date_to', 'status', 'is_confirmed',
    'total_sell_price', 'total_cost_price', 'gross_profit',
    'payment_status', 'amount_received', 'notes',
    'created_at', 'confirmed_at', 'completed_at'
  ],
  booking_hotels: [
    'id', 'booking_id', 'hotel_id', 'hotel_name',
    'check_in', 'check_out', 'nights', 'room_type', 'number_of_rooms',
    'cost_per_night', 'total_cost', 'sell_price', 'margin',
    'payment_status', 'paid_amount', 'payment_due_date',
    'confirmation_number', 'voucher_issued', 'notes', 'created_at'
  ],
  booking_tours: [
    'id', 'booking_id', 'tour_name', 'tour_date', 'duration', 'pax_count',
    'operation_type', 'supplier_id', 'supplier_cost',
    'guide_id', 'guide_cost', 'vehicle_id', 'vehicle_cost',
    'entrance_fees', 'other_costs', 'total_cost', 'sell_price', 'margin',
    'payment_status', 'paid_amount', 'payment_due_date',
    'confirmation_number', 'voucher_issued', 'notes', 'created_at'
  ],
  booking_transfers: [
    'id', 'booking_id', 'transfer_type', 'transfer_date',
    'from_location', 'to_location', 'pax_count', 'vehicle_type',
    'operation_type', 'supplier_id', 'vehicle_id',
    'cost_price', 'sell_price', 'margin',
    'payment_status', 'paid_amount', 'confirmation_number',
    'voucher_issued', 'notes', 'created_at'
  ],
  booking_flights: [
    'id', 'booking_id', 'airline', 'flight_number',
    'departure_date', 'arrival_date', 'from_airport', 'to_airport',
    'pax_count', 'cost_price', 'sell_price', 'margin',
    'payment_status', 'paid_amount', 'pnr', 'ticket_numbers',
    'voucher_issued', 'notes', 'created_at'
  ],
  passengers: [
    'id', 'booking_id', 'name', 'passport_number',
    'nationality', 'date_of_birth', 'special_requests'
  ],
  clients: [
    'id', 'client_code', 'name', 'type', 'email', 'phone',
    'address', 'commission_rate', 'status', 'notes', 'created_at'
  ],
  hotels: [
    'id', 'name', 'city', 'country', 'contact_person',
    'contact_email', 'contact_phone', 'standard_cost_per_night',
    'status', 'notes', 'created_at'
  ],
  guides: [
    'id', 'name', 'phone', 'languages', 'daily_rate',
    'specialization', 'availability_status', 'notes', 'created_at'
  ],
  vehicles: [
    'id', 'vehicle_number', 'type', 'capacity', 'daily_rate',
    'driver_name', 'driver_phone', 'status', 'notes', 'created_at'
  ],
  tour_suppliers: [
    'id', 'name', 'contact_person', 'email', 'phone',
    'services_offered', 'payment_terms', 'status', 'notes', 'created_at'
  ],
  client_payments: [
    'id', 'booking_id', 'payment_date', 'amount', 'currency',
    'payment_method', 'reference_number', 'notes', 'created_at'
  ],
  supplier_payments: [
    'id', 'booking_id', 'supplier_type', 'supplier_id', 'supplier_name',
    'service_id', 'amount', 'currency', 'payment_date', 'due_date',
    'payment_method', 'status', 'reference_number', 'notes', 'created_at'
  ],
  operational_expenses: [
    'id', 'expense_date', 'category', 'description', 'amount',
    'currency', 'payment_method', 'reference_number',
    'is_recurring', 'notes', 'created_at'
  ],
  users: [
    'id', 'username', 'email', 'password_hash', 'full_name',
    'role', 'is_active', 'created_at', 'last_login'
  ]
};

// Critical JOIN references we use
const JOIN_EXPECTATIONS = {
  'booking_tours -> tour_suppliers': 'ts.name',
  'booking_tours -> guides': 'g.name',
  'booking_tours -> vehicles': 'v.vehicle_number',
  'booking_transfers -> tour_suppliers': 'ts.name',
  'booking_transfers -> vehicles': 'v.vehicle_number',
  'booking_hotels -> hotels': 'h.name',
  'bookings -> clients': 'c.name'
};

async function verifyDatabaseColumns() {
  console.log('=== DATABASE COLUMN VERIFICATION ===\n');

  let allPassed = true;

  for (const [tableName, expectedColumns] of Object.entries(CONTROLLER_EXPECTATIONS)) {
    console.log(`\nChecking table: ${tableName}`);
    console.log('-'.repeat(80));

    try {
      // Get actual columns from database
      const result = await query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      const actualColumns = result.rows.map(row => row.column_name);

      // Check for missing columns
      const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));

      // Check for extra columns we're not using (informational only)
      const unusedColumns = actualColumns.filter(col => !expectedColumns.includes(col));

      if (missingColumns.length > 0) {
        console.log(`❌ MISSING COLUMNS IN DATABASE:`);
        missingColumns.forEach(col => console.log(`   - ${col}`));
        allPassed = false;
      } else {
        console.log(`✅ All expected columns exist in database`);
      }

      if (unusedColumns.length > 0) {
        console.log(`ℹ️  Columns in DB but not in expectations (may be unused):`);
        unusedColumns.forEach(col => console.log(`   - ${col}`));
      }

      // Show column count
      console.log(`   Expected: ${expectedColumns.length} columns`);
      console.log(`   Actual: ${actualColumns.length} columns`);

    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      allPassed = false;
    }
  }

  // Verify JOIN expectations
  console.log('\n\n=== JOIN COLUMN VERIFICATION ===\n');
  console.log('-'.repeat(80));

  const joinChecks = [
    { table: 'tour_suppliers', column: 'name', used_as: 'supplier_name' },
    { table: 'guides', column: 'name', used_as: 'guide_name' },
    { table: 'vehicles', column: 'vehicle_number', used_as: 'vehicle_plate/vehicle_number' },
    { table: 'hotels', column: 'name', used_as: 'hotel_name' },
    { table: 'clients', column: 'name', used_as: 'client_name' }
  ];

  for (const check of joinChecks) {
    const result = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
    `, [check.table, check.column]);

    if (result.rows.length > 0) {
      console.log(`✅ ${check.table}.${check.column} exists (used as ${check.used_as})`);
    } else {
      console.log(`❌ ${check.table}.${check.column} MISSING (used as ${check.used_as})`);
      allPassed = false;
    }
  }

  console.log('\n\n=== VERIFICATION SUMMARY ===\n');
  if (allPassed) {
    console.log('✅ ALL VERIFICATIONS PASSED');
    console.log('   Database schema matches controller expectations');
  } else {
    console.log('❌ VERIFICATION FAILED');
    console.log('   There are mismatches between database and controllers');
    console.log('   Please review the errors above');
  }

  process.exit(allPassed ? 0 : 1);
}

verifyDatabaseColumns();
