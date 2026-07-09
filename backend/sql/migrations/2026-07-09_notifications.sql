-- Player notification feed. One row per notification, addressed to a single
-- recipient (user_id). Types: item_added, item_updated, item_deleted,
-- currency_removed (DM took coins), shared_item_added (party inventory).
-- The message is pre-rendered (English) for the notifications page.
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

CREATE INDEX idx_notifications_user ON notifications (user_id, is_read);
