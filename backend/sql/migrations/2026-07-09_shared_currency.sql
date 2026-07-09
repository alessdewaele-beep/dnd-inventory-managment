-- Shared (campaign-wide) coin purse: the party's money, alongside every
-- player's personal purse. One row per campaign; same coins and decimal rate
-- as the per-user `currencies` table. Created lazily (upsert) on first save.
CREATE TABLE IF NOT EXISTS campaign_currencies (
  campaign_id INT PRIMARY KEY,
  pp INT NOT NULL DEFAULT 0,
  gp INT NOT NULL DEFAULT 0,
  sp INT NOT NULL DEFAULT 0,
  cp INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_campaign_currencies_campaign
    FOREIGN KEY (campaign_id)
    REFERENCES campaigns(id)
    ON DELETE CASCADE
);
