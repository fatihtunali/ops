const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

async function runMigration(migrationFile) {
  const client = await pool.connect();

  try {
    const migrationPath = path.join(__dirname, '../../database/migrations', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log(`Running migration: ${migrationFile}`);
    await client.query(sql);
    console.log(`Migration completed successfully: ${migrationFile}`);
  } catch (error) {
    console.error(`Error running migration ${migrationFile}:`, error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Please provide a migration file name');
  console.error('Usage: node runMigration.js <migration-file.sql>');
  process.exit(1);
}

runMigration(migrationFile);
