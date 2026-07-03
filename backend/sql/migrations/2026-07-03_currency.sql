-- Muntenbeurs per gebruiker (D&D-valuta). Eén rij per gebruiker; de munten
-- worden als losse gehele aantallen bijgehouden. Koers is decimaal:
-- 1 pp = 10 gp, 1 gp = 10 sp, 1 sp = 10 cp. De rij wordt lui aangemaakt
-- (upsert) zodra een gebruiker zijn geld voor het eerst opslaat.
CREATE TABLE IF NOT EXISTS currencies (
  user_id INT PRIMARY KEY,
  pp INT NOT NULL DEFAULT 0,
  gp INT NOT NULL DEFAULT 0,
  sp INT NOT NULL DEFAULT 0,
  cp INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_currencies_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
