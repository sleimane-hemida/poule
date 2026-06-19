const pool = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const result = await pool.query(
        'SELECT * FROM entries ORDER BY date DESC, created_at DESC'
      );
      return res.json(result.rows);
    }

    if (req.method === 'POST') {
      const { date, nombre, race } = req.body;
      if (!date || !nombre || !race) {
        return res.status(400).json({ error: 'Champs requis : date, nombre, race' });
      }
      const result = await pool.query(
        'INSERT INTO entries (date, nombre, race) VALUES ($1, $2, $3) RETURNING *',
        [date, nombre, race]
      );
      return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM entries');
      return res.json({ message: 'Toutes les entrées ont été supprimées' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
