-- Notificatievlag: staat aan wanneer iemand anders (admin, DM-verzending, ...)
-- het item aan de inventory van de speler toevoegde. Gaat uit zodra de
-- eigenaar over het item hovert (PATCH /items/:id/seen).
ALTER TABLE items ADD COLUMN is_new BOOLEAN NOT NULL DEFAULT FALSE;
