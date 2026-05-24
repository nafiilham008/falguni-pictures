require('dotenv').config({path: '../.env'});
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    const r = await pool.query('SELECT e.id, e.category FROM events e LIMIT 1');
    console.log('Events ok, category column exists');
  } catch (e) {
    console.log('Events error: ', e.message);
  }
  process.exit();
}
run();
