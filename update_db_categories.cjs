const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("Updating packages...");
        await pool.query("UPDATE packages SET category = 'wisuda' WHERE category = 'graduation'");
        await pool.query("UPDATE packages SET category = 'prewed' WHERE category = 'prewedding'");
        console.log("Successfully updated package categories in database.");
    } catch (e) {
        console.error("Error updating DB:", e);
    } finally {
        await pool.end();
    }
}
run();
