-- Profile page: own backstory for players + enforce unique usernames.
-- Run this once on the (Aiven) database.

-- Backstory column (nullable; only players fill this in via their profile).
ALTER TABLE users ADD COLUMN backstory TEXT NULL;

-- Enforce unique usernames. Only run this if no unique index exists yet;
-- MySQL throws an error if the constraint is already present (in which case you may skip this line).
ALTER TABLE users ADD UNIQUE KEY uq_users_username (username);
