const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon cloud database connection
  }
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL Database (Neon)');
});

module.exports = pool;
