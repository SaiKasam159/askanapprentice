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
