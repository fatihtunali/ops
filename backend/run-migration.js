const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5432,
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || 'travel_ops',
});

async function runMigration(filename) {
  const filePath = path.join(__dirname, '..', 'database', 'migrations', filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  try {
    console.log(`Running migration: ${filename}`);
    await pool.query(sql);
    console.log(`✅ Migration completed: ${filename}`);
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`);
    console.error(error);
    throw error;
  } finally {
    await pool.end();
  }
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Please provide migration filename as argument');
  process.exit(1);
}

runMigration(migrationFile);
