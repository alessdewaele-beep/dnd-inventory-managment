-- Hit point tracker per user. Opt-in via the settings page (enabled);
-- max_hp is configured there, current_hp is adjusted from the inventory
-- page with +1/-1 arrows and temp_hp is a user-set buffer that absorbs
-- damage first (D&D rules). One row per user, created lazily (upsert)
-- on the first save, like the currencies table.
CREATE TABLE IF NOT EXISTS user_hp (
  user_id INT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  max_hp INT NOT NULL DEFAULT 10,
  current_hp INT NOT NULL DEFAULT 10,
  temp_hp INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_hp_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
