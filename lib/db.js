const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        nombre INTEGER NOT NULL,
        race VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Table entries OK');
  } catch (err) {
    console.error('Erreur init table:', err.message);
  }
}

initTable();

module.exports = { pool };
