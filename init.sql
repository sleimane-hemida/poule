-- Script d'initialisation de la base "poule"
-- Exécuter avant de lancer le serveur :
--   1. Créer la base : CREATE DATABASE poule;
--   2. Lancer ce script : psql -d poule -f init.sql

CREATE TABLE IF NOT EXISTS sorties (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  nombre INTEGER NOT NULL CHECK (nombre > 0),
  race TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Optionnel : quelques exemples
INSERT INTO sorties (id, date, nombre, race) VALUES
  ('ex1', '2026-06-01', 5, 'Marans'),
  ('ex2', '2026-06-10', 8, 'Gauloise'),
  ('ex3', '2026-06-15', 3, 'Brahma')
ON CONFLICT (id) DO NOTHING;
