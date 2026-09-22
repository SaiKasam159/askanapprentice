-- Restrict what the public anon key can read. Safe to run more than once.
-- Run in: Supabase Dashboard -> SQL Editor
--
-- The anon key ships inside the browser bundle, so anyone can issue their own
-- PostgREST query with it. Narrowing the SELECT in application code is not a
-- control. These grants are.

-- ============================================================
-- APPRENTICES: public directory data only.
-- email and the cal.com links must never reach the browser, or the paid
-- booking flow can be bypassed by booking the mentor directly.
-- ============================================================
REVOKE SELECT, INSERT, UPDATE, DELETE ON apprentices FROM anon, authenticated;

GRANT SELECT (
  id, name, apprenticeship_name, company, sector,
  linkedin_url, verified, accepts_45min_calls, created_at
) ON apprentices TO anon, authenticated;

-- ============================================================
-- STUDENTS: nothing is public. Rows hold email addresses and, for under-16s,
-- a guardian's email. All access goes through server routes.
-- ============================================================
REVOKE SELECT, INSERT, UPDATE, DELETE ON students FROM anon, authenticated;

-- ============================================================
-- BOOKINGS and RATINGS: server-side only.
-- ============================================================
REVOKE SELECT, INSERT, UPDATE, DELETE ON bookings FROM anon, authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON ratings  FROM anon, authenticated;

-- The service role used by the API routes bypasses these grants entirely.

-- ============================================================
-- VERIFY: anon should see only the nine public apprentice columns.
-- ============================================================
SELECT table_name, column_name
FROM information_schema.column_privileges
WHERE grantee = 'anon' AND privilege_type = 'SELECT'
ORDER BY table_name, column_name;
