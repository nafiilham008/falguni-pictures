require('dotenv').config({path: '.env'});
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function run() {
  try {
    // 1. Add category column if not exists
    await pool.query(`
      ALTER TABLE packages 
      ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'wedding';
    `);
    console.log('Category column added to packages');

    // 2. Set 'Family' to 'Custom & Special Events' and 'custom' category
    await pool.query(`
      UPDATE packages 
      SET name = 'Custom & Special Events', category = 'custom'
      WHERE name ILIKE '%family%';
    `);
    
    // Also, try to categorize some existing portrait packages correctly 
    // e.g. Wisuda -> graduation
    await pool.query(`
      UPDATE packages SET category = 'graduation' WHERE name ILIKE '%wisuda%' OR name ILIKE '%graduation%';
    `);
    
    // Wedding packages
    await pool.query(`
      UPDATE packages SET category = 'wedding' WHERE name ILIKE '%wedding%' OR name ILIKE '%nikah%';
    `);
    
    // Prewed packages
    await pool.query(`
      UPDATE packages SET category = 'prewedding' WHERE name ILIKE '%prewed%';
    `);
    
    // Sport packages
    await pool.query(`
      UPDATE packages SET category = 'sport' WHERE theme = 'sport';
    `);
    
    console.log('Packages updated successfully');
  } catch (e) {
    console.log('Error: ', e.message);
  }
  process.exit();
}
run();
