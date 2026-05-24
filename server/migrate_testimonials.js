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
    // Check if table exists
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'testimonials'
      );
    `);

    if (checkTable.rows[0].exists) {
        // Add columns if they don't exist
        await pool.query(`
          ALTER TABLE testimonials 
          ADD COLUMN IF NOT EXISTS booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
          ADD COLUMN IF NOT EXISTS token VARCHAR(100) UNIQUE,
          ADD COLUMN IF NOT EXISTS image_url TEXT,
          ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
        `);
        console.log('Testimonials table updated');
    } else {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS testimonials (
              id SERIAL PRIMARY KEY,
              booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
              token VARCHAR(100) UNIQUE,
              client_name VARCHAR(255) NOT NULL,
              role VARCHAR(255),
              review TEXT NOT NULL,
              rating INTEGER DEFAULT 5,
              image_url TEXT,
              is_approved BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('Testimonials table created');
    }
  } catch (e) {
    console.log('Error: ', e.message);
  }
  process.exit();
}
run();
