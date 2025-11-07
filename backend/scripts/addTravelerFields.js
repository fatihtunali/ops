const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('Database Config:', {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
});

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addTravelerFields() {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting migration: Add traveler fields to bookings...\n');

    // Add traveler fields
    console.log('Adding traveler information columns...');
    await client.query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS traveler_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS traveler_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS traveler_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS booked_by VARCHAR(20) DEFAULT 'direct';
    `);
    console.log('✅ Columns added successfully\n');

    // Add check constraint
    console.log('Adding check constraint...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'bookings_booked_by_check'
        ) THEN
          ALTER TABLE bookings
          ADD CONSTRAINT bookings_booked_by_check
          CHECK (booked_by IN ('agent', 'direct'));
        END IF;
      END $$;
    `);
    console.log('✅ Check constraint added\n');

    // Add index
    console.log('Adding index...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_booked_by ON bookings(booked_by);
    `);
    console.log('✅ Index created\n');

    // Update existing bookings based on client type
    console.log('Updating existing bookings with booked_by from client type...');
    const updateResult = await client.query(`
      UPDATE bookings b
      SET booked_by = c.type
      FROM clients c
      WHERE b.client_id = c.id
      AND (b.booked_by IS NULL OR b.booked_by = 'direct');
    `);
    console.log(`✅ Updated ${updateResult.rowCount} bookings\n`);

    // Copy client info to traveler info for direct bookings
    console.log('Copying client info to traveler info for direct bookings...');
    const copyResult = await client.query(`
      UPDATE bookings b
      SET
        traveler_name = COALESCE(b.traveler_name, c.name),
        traveler_email = COALESCE(b.traveler_email, c.email),
        traveler_phone = COALESCE(b.traveler_phone, c.phone)
      FROM clients c
      WHERE b.client_id = c.id
      AND c.type = 'direct'
      AND b.booked_by = 'direct';
    `);
    console.log(`✅ Updated ${copyResult.rowCount} direct bookings with traveler info\n`);

    // Verification
    console.log('📊 Verification:');
    const stats = await client.query(`
      SELECT
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN booked_by = 'agent' THEN 1 END) as agent_bookings,
        COUNT(CASE WHEN booked_by = 'direct' THEN 1 END) as direct_bookings,
        COUNT(CASE WHEN traveler_name IS NOT NULL THEN 1 END) as bookings_with_traveler_info
      FROM bookings;
    `);

    const { total_bookings, agent_bookings, direct_bookings, bookings_with_traveler_info } = stats.rows[0];

    console.log(`Total Bookings: ${total_bookings}`);
    console.log(`Agent Bookings: ${agent_bookings}`);
    console.log(`Direct Bookings: ${direct_bookings}`);
    console.log(`Bookings with Traveler Info: ${bookings_with_traveler_info}`);

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addTravelerFields();
