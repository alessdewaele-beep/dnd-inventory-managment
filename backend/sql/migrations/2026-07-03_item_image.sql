-- Photo of an item, stored as a data-URI (base64) instead of external
-- file storage: works on Render (ephemeral filesystem) and fits the
-- existing JSON Client. The frontend shrinks the image before uploading,
-- so the text stays small; LONGTEXT gives ample margin.
ALTER TABLE items ADD COLUMN image LONGTEXT NULL;
