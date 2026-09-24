-- Cancellation. Safe to run more than once.
-- The partial unique index on (apprentice_id, scheduled_at) only covers
-- pending_payment and confirmed, so a cancelled booking frees its slot
-- without any further change.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at     TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_by     TEXT;  -- 'student' | 'apprentice'
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancel_reason    TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_refund_id TEXT;
