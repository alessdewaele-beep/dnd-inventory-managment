-- Foto van een item, opgeslagen als data-URI (base64) i.p.v. een externe
-- bestandsopslag: werkt op Render (ephemeral filesystem) en past op de
-- bestaande JSON-Client. De frontend verkleint de afbeelding vóór het uploaden,
-- dus de tekst blijft klein; LONGTEXT geeft ruime marge.
ALTER TABLE items ADD COLUMN image LONGTEXT NULL;
