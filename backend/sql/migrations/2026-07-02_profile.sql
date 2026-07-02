-- Profielpagina: eigen backstory voor spelers + unieke usernames afdwingen.
-- Draai dit één keer op de (Aiven) database.

-- Backstory-kolom (nullable; enkel spelers vullen dit in via hun profiel).
ALTER TABLE users ADD COLUMN backstory TEXT NULL;

-- Username uniek afdwingen. Draai dit enkel als er nog geen unieke index bestaat;
-- MySQL geeft een fout als de constraint al aanwezig is (dan mag je deze regel overslaan).
ALTER TABLE users ADD UNIQUE KEY uq_users_username (username);
