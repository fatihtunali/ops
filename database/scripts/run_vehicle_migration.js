const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
  const client = new Client({
    host: 'YOUR_HOST_IP',
    port: 5432,
    database: 'ops',
    user: 'ops',
    password: 'Dlr235672.-Yt'
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', '006_vehicle_types_and_rates.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Running migration: 006_vehicle_types_and_rates.sql');
    console.log('━'.repeat(50));

    // Execute the migration
    await client.query(sql);

    console.log('\n✅ Migration completed successfully!\n');

    // Verify the tables were created
    console.log('🔍 Verifying tables...\n');

    const vehicleTypesResult = await client.query('SELECT * FROM vehicle_types ORDER BY max_capacity');
    console.log('📋 Vehicle Types:');
    console.table(vehicleTypesResult.rows);

    const ratesCountResult = await client.query('SELECT COUNT(*) as count FROM vehicle_rates');
    console.log(`\n📊 Vehicle Rates Count: ${ratesCountResult.rows[0].count}\n`);

    // Test the view
    const viewResult = await client.query('SELECT COUNT(*) as count FROM view_vehicle_rates_detailed');
    console.log(`✅ View created: view_vehicle_rates_detailed (${viewResult.rows[0].count} rows)\n`);

    console.log('━'.repeat(50));
    console.log('✅ All verification checks passed!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

runMigration();
