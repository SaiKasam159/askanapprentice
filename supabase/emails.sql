-- Needed so a confirmation email can show the student their own local time
-- rather than the server's. Safe to run more than once.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS student_timezone TEXT;
