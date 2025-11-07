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

async function updateAgentBookings() {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting update: Add traveler info to agent bookings...\n');

    // First, let's see what clients we have
    console.log('📋 Fetching clients...');
    const clientsResult = await client.query(`
      SELECT id, name, type, email, phone
      FROM clients
      ORDER BY type, id
    `);

    console.log(`Found ${clientsResult.rows.length} clients:`);
    clientsResult.rows.forEach(c => {
      console.log(`  - ${c.name} (${c.type}) - ID: ${c.id}`);
    });
    console.log('');

    // Get agent clients
    const agentClients = clientsResult.rows.filter(c => c.type === 'agent');

    if (agentClients.length === 0) {
      console.log('⚠️  No agent clients found. Creating sample agent client...');

      // Create a sample agent client
      const newAgent = await client.query(`
        INSERT INTO clients (name, email, phone, type, client_code, status)
        VALUES ('Sunrise Travel Agency', 'contact@sunrisetravel.com', '+1234567890', 'agent', 'AGT001', 'active')
        RETURNING id, name, email, phone
      `);

      agentClients.push(newAgent.rows[0]);
      console.log(`✅ Created agent: ${newAgent.rows[0].name} (ID: ${newAgent.rows[0].id})\n`);
    }

    // Get all bookings
    console.log('📋 Fetching bookings...');
    const bookingsResult = await client.query(`
      SELECT b.id, b.booking_code, b.client_id, c.name as client_name, c.type as client_type,
             b.booked_by, b.traveler_name
      FROM bookings b
      LEFT JOIN clients c ON b.client_id = c.id
      ORDER BY b.id
      LIMIT 10
    `);

    console.log(`Found ${bookingsResult.rows.length} bookings:\n`);
    bookingsResult.rows.forEach(b => {
      console.log(`  - ${b.booking_code}: ${b.client_name} (${b.client_type}) - booked_by: ${b.booked_by}`);
    });
    console.log('');

    // Update the first 3 bookings to be agent bookings
    const agentClient = agentClients[0];
    const bookingsToUpdate = bookingsResult.rows.slice(0, 3);

    console.log(`🔄 Updating ${bookingsToUpdate.length} bookings to agent bookings...\n`);

    for (let i = 0; i < bookingsToUpdate.length; i++) {
      const booking = bookingsToUpdate[i];
      const travelerNames = [
        'John Smith',
        'Sarah Johnson',
        'Michael Brown'
      ];
      const travelerEmails = [
        'john.smith@email.com',
        'sarah.johnson@email.com',
        'michael.brown@email.com'
      ];
      const travelerPhones = [
        '+1-555-0101',
        '+1-555-0102',
        '+1-555-0103'
      ];

      await client.query(`
        UPDATE bookings
        SET
          client_id = $1,
          booked_by = 'agent',
          traveler_name = $2,
          traveler_email = $3,
          traveler_phone = $4
        WHERE id = $5
      `, [agentClient.id, travelerNames[i], travelerEmails[i], travelerPhones[i], booking.id]);

      console.log(`✅ Updated booking ${booking.booking_code}:`);
      console.log(`   Agent: ${agentClient.name}`);
      console.log(`   Traveler: ${travelerNames[i]}`);
      console.log(`   Email: ${travelerEmails[i]}`);
      console.log('');
    }

    // Verification
    console.log('📊 Verification - Agent Bookings:');
    const agentBookings = await client.query(`
      SELECT
        b.booking_code,
        c.name as agent_name,
        b.traveler_name,
        b.traveler_email,
        b.booked_by
      FROM bookings b
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE b.booked_by = 'agent'
      ORDER BY b.id
    `);

    console.log(`\nTotal Agent Bookings: ${agentBookings.rows.length}\n`);
    agentBookings.rows.forEach(b => {
      console.log(`📝 ${b.booking_code}`);
      console.log(`   Agent: ${b.agent_name}`);
      console.log(`   Traveler: ${b.traveler_name}`);
      console.log(`   Email: ${b.traveler_email}`);
      console.log('');
    });

    // Show direct bookings too
    const directBookings = await client.query(`
      SELECT
        b.booking_code,
        c.name as client_name,
        b.booked_by
      FROM bookings b
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE b.booked_by = 'direct'
      ORDER BY b.id
    `);

    console.log(`📊 Direct Bookings: ${directBookings.rows.length}`);
    directBookings.rows.forEach(b => {
      console.log(`   - ${b.booking_code}: ${b.client_name}`);
    });

    console.log('\n✅ Update completed successfully!');

  } catch (error) {
    console.error('❌ Update failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateAgentBookings();
