const pool = require('../../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const { date, nombre, race } = req.body;
      if (!date || !nombre || !race) {
        return res.status(400).json({ error: 'Champs requis : date, nombre, race' });
      }
      const result = await pool.query(
        'UPDATE entries SET date = $1, nombre = $2, race = $3 WHERE id = $4 RETURNING *',
        [date, nombre, race, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Entrée introuvable' });
      }
      return res.json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      const result = await pool.query(
        'DELETE FROM entries WHERE id = $1 RETURNING *', [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Entrée introuvable' });
      }
      return res.json({ message: 'Supprimée' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
