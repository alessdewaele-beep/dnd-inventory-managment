-- Notification flag: on when someone else (admin, DM send, ...)
-- added the item to the player's inventory. Turns off once the
-- owner hovers over the item (PATCH /items/:id/seen).
ALTER TABLE items ADD COLUMN is_new BOOLEAN NOT NULL DEFAULT FALSE;
