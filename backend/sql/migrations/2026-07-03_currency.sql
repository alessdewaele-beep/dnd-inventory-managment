-- Coin purse per user (D&D currency). One row per user; the coins
-- are tracked as separate integer amounts. The exchange rate is decimal:
-- 1 pp = 10 gp, 1 gp = 10 sp, 1 sp = 10 cp. The row is created lazily
-- (upsert) as soon as a user saves their money for the first time.
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
