const { query } = require('../src/config/database');

async function getDatabaseSchema() {
  try {
    // Get all tables
    console.log('=== FETCHING DATABASE SCHEMA ===\n');

    const tablesResult = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows;
    console.log(`Found ${tables.length} tables:\n`);

    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`\n${'='.repeat(80)}`);
      console.log(`TABLE: ${tableName}`);
      console.log('='.repeat(80));

      // Get columns for this table
      const columnsResult = await query(`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      console.log('\nColumns:');
      columnsResult.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        const maxLen = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        console.log(`  - ${col.column_name.padEnd(30)} ${col.data_type}${maxLen} ${nullable}${defaultVal}`);
      });

      // Get row count
      const countResult = await query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      console.log(`\nRow count: ${countResult.rows[0].count}`);

      // Get sample data (first 3 rows)
      const sampleResult = await query(`SELECT * FROM "${tableName}" LIMIT 3`);
      if (sampleResult.rows.length > 0) {
        console.log('\nSample data (first 3 rows):');
        console.log(JSON.stringify(sampleResult.rows, null, 2));
      }
    }

    console.log('\n\n=== SCHEMA EXTRACTION COMPLETE ===');
    process.exit(0);

  } catch (error) {
    console.error('Error fetching schema:', error);
    process.exit(1);
  }
}

getDatabaseSchema();
