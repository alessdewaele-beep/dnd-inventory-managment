-- Shared (campaign-wide) inventory.
-- Until now every item belonged to exactly one player (items.userId NOT NULL).
-- An item now belongs EITHER to a single player (userId set, campaign_id NULL)
-- OR to a whole campaign's shared inventory (campaign_id set, userId NULL).
ALTER TABLE items MODIFY userId INT NULL;
ALTER TABLE items ADD COLUMN campaign_id INT NULL;
ALTER TABLE items
  ADD CONSTRAINT fk_items_campaign
  FOREIGN KEY (campaign_id)
  REFERENCES campaigns(id)
  ON DELETE CASCADE;
