const { Pool } = require('pg');

const pool = new Pool({
  user: 'spring',
  password: 'spring',
  host: 'localhost',
  port: 5432,
  database: 'poule',
});

module.exports = pool;
