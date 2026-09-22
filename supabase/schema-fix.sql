-- ApprentaCall schema fix. Safe to run more than once.
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run

-- ============================================================
-- 1. STUDENTS
-- ============================================================
ALTER TABLE students ADD COLUMN IF NOT EXISTS email           TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS name            TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS linkedin_url    TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS sectors         TEXT[];
ALTER TABLE students ADD COLUMN IF NOT EXISTS age_verified    BOOLEAN DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_email  TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS first_call_used BOOLEAN DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS created_at      TIMESTAMPTZ DEFAULT NOW();

-- ============================================================
-- 2. APPRENTICES (mentors)
-- ============================================================
ALTER TABLE apprentices ADD COLUMN IF NOT EXISTS email               TEXT;
ALTER TABLE apprentices ADD COLUMN IF NOT EXISTS name                TEXT;
ALTER TABLE apprentices ADD COLUMN IF NOT EXISTS apprenticeship_name TEXT;
ALTER TABLE apprentices ADD COLUMN IF NOT EXISTS company             TEXT;
ALTER TABLE apprentices ADD COLUMN IF NOT EXISTS sector              TEXT;
ALTER TABLE apprentices ADD COLUMN IF NOT EXISTS linkedin_url        TEXT;
ALTER TABLE apprentices ADD COLUMN IF NOT EXISTS calendly_url_30     TEXT;
ALTER TABLE apprentices ADD COLUMN IF NOT EXISTS calendly_url_45     TEXT;
ALTER TABLE apprentices ADD COLUMN IF NOT EXISTS accepts_45min_calls BOOLEAN DEFAULT FALSE;
ALTER TABLE apprentices ADD COLUMN IF NOT EXISTS verified            BOOLEAN DEFAULT FALSE;
ALTER TABLE apprentices ADD COLUMN IF NOT EXISTS created_at          TIMESTAMPTZ DEFAULT NOW();

-- ============================================================
-- 3. One account per email
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS students_email_key    ON students (email);
CREATE UNIQUE INDEX IF NOT EXISTS apprentices_email_key ON apprentices (email);

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- Signup/login run server-side with the service role, which bypasses RLS.
-- These policies exist so the browser pages (directory, dashboard, profile)
-- can still read and write via the anon key.
-- ============================================================
ALTER TABLE students    ENABLE ROW LEVEL SECURITY;
ALTER TABLE apprentices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read verified apprentices" ON apprentices;
CREATE POLICY "public read verified apprentices" ON apprentices
  FOR SELECT USING (verified = TRUE);

DROP POLICY IF EXISTS "apprentices read own row" ON apprentices;
CREATE POLICY "apprentices read own row" ON apprentices
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "apprentices update own row" ON apprentices;
CREATE POLICY "apprentices update own row" ON apprentices
  FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "students read own row" ON students;
CREATE POLICY "students read own row" ON students
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "students update own row" ON students;
CREATE POLICY "students update own row" ON students
  FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- 5. VERIFY (check `id` is uuid on both tables)
-- ============================================================
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('students', 'apprentices')
ORDER BY table_name, ordinal_position;

-- ============================================================
-- 6. BOOKINGS: payment tracking
-- ============================================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_at                  TIMESTAMPTZ;
-- status values used by the app:
--   pending_payment | confirmed | completed | cancelled
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'pending_payment';

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bookings readable" ON bookings;
CREATE POLICY "bookings readable" ON bookings FOR SELECT USING (TRUE);

-- ============================================================
-- 7. RATINGS (table was missing entirely)
-- ============================================================
CREATE TABLE IF NOT EXISTS ratings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    UUID REFERENCES bookings(id) ON DELETE CASCADE,
  student_id    UUID REFERENCES students(id) ON DELETE SET NULL,
  apprentice_id UUID REFERENCES apprentices(id) ON DELETE CASCADE,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ratings_apprentice_idx ON ratings (apprentice_id);
CREATE UNIQUE INDEX IF NOT EXISTS ratings_one_per_booking ON ratings (booking_id);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ratings readable" ON ratings;
CREATE POLICY "ratings readable" ON ratings FOR SELECT USING (TRUE);

-- ============================================================
-- 8. LinkedIn is optional on the signup form, so the column must allow NULL
-- ============================================================
ALTER TABLE apprentices ALTER COLUMN linkedin_url DROP NOT NULL;
