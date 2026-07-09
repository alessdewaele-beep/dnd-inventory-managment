CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'player',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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

-- Shared party purse: one row per campaign. The campaign_id FK
-- (fk_campaign_currencies_campaign) is added in the matching migration,
-- since the campaigns table is not defined in this (partial) schema file.
CREATE TABLE IF NOT EXISTS campaign_currencies (
  campaign_id INT PRIMARY KEY,
  pp INT NOT NULL DEFAULT 0,
  gp INT NOT NULL DEFAULT 0,
  sp INT NOT NULL DEFAULT 0,
  cp INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Player notification feed (see migrations/2026-07-09_notifications.sql).
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  message VARCHAR(500) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100),
  quantity INT NOT NULL DEFAULT 1,
  favourite BOOLEAN NOT NULL DEFAULT FALSE,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  image LONGTEXT NULL,
  -- An item belongs EITHER to a single player (userId) OR to a whole
  -- campaign's shared inventory (campaign_id); exactly one is set.
  userId INT NULL,
  campaign_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_items_user
    FOREIGN KEY (userId)
    REFERENCES users(id)
    ON DELETE CASCADE
);
