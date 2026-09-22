-- Weekly availability for mentors, and the fields a booking needs to produce
-- a meeting. Safe to run more than once.

-- ============================================================
-- Mentors declare recurring weekly windows in their own timezone.
-- One row per window, e.g. Tuesday 18:00-21:00.
-- ============================================================
CREATE TABLE IF NOT EXISTS availability (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apprentice_id UUID NOT NULL REFERENCES apprentices(id) ON DELETE CASCADE,
  day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  start_minute  SMALLINT NOT NULL CHECK (start_minute BETWEEN 0 AND 1439),
  end_minute    SMALLINT NOT NULL CHECK (end_minute   BETWEEN 1 AND 1440),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT availability_window_valid CHECK (end_minute > start_minute)
);

CREATE INDEX IF NOT EXISTS availability_apprentice_idx ON availability (apprentice_id);

-- Read and written only through the API, using the service role.
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
REVOKE SELECT, INSERT, UPDATE, DELETE ON availability FROM anon, authenticated;

-- ============================================================
-- Mentor timezone: availability windows are wall-clock times in this zone.
-- ============================================================
ALTER TABLE apprentices ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Europe/London';

-- ============================================================
-- Booking: where the call actually happens.
-- ============================================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_url TEXT;

-- Stops two students holding the same slot with the same mentor.
CREATE UNIQUE INDEX IF NOT EXISTS bookings_no_double_booking
  ON bookings (apprentice_id, scheduled_at)
  WHERE status IN ('pending_payment', 'confirmed');
