-- Booking runs on our own availability now, so the cal.com links are dead.
-- Run this BEFORE deploying the change that stops writing them: the column is
-- NOT NULL, so signup would fail in the window between deploy and migration.
ALTER TABLE apprentices DROP COLUMN IF EXISTS calendly_url_30;
ALTER TABLE apprentices DROP COLUMN IF EXISTS calendly_url_45;
