const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/entries', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM entries ORDER BY date DESC, created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur SELECT:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/entries', async (req, res) => {
  try {
    const { date, nombre, race } = req.body;
    if (!date || !nombre || !race) {
      return res.status(400).json({ error: 'Champs requis : date, nombre, race' });
    }
    const result = await pool.query(
      'INSERT INTO entries (date, nombre, race) VALUES ($1, $2, $3) RETURNING *',
      [date, nombre, race]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur INSERT:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
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
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur UPDATE:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM entries WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entrée introuvable' });
    }
    res.json({ message: 'Supprimée' });
  } catch (err) {
    console.error('Erreur DELETE:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/entries', async (req, res) => {
  try {
    await pool.query('DELETE FROM entries');
    res.json({ message: 'Toutes les entrées ont été supprimées' });
  } catch (err) {
    console.error('Erreur DELETE ALL:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, () => {
  console.log(`API lancée sur http://localhost:${PORT}`);
});
