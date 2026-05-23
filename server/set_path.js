const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_xVthas6wqgu1@ep-bold-morning-ah35j6bg-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

pool.query('ALTER DATABASE neondb SET search_path TO public')
  .then(() => {
    console.log('Database altered');
    return pool.query('ALTER ROLE neondb_owner SET search_path TO public');
  })
  .then(() => {
    console.log('Role altered');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
