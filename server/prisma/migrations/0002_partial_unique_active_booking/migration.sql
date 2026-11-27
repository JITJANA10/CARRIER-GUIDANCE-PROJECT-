-- Drop the legacy unconditional unique index that prevented re-booking cancelled, rejected, or completed slots
DROP INDEX IF EXISTS "mentor_bookings_mentorId_scheduledTime_key";

-- Add standard composite lookup index matching Prisma @@index([mentorId, scheduledTime])
CREATE INDEX IF NOT EXISTS "mentor_bookings_mentorId_scheduledTime_idx" ON "mentor_bookings"("mentorId", "scheduledTime");

-- Enforce SQLite partial unique index strictly on active reservations (REQUESTED or CONFIRMED)
CREATE UNIQUE INDEX IF NOT EXISTS "one_active_booking_per_mentor_slot"
ON "mentor_bookings"("mentorId", "scheduledTime")
WHERE "status" IN ('REQUESTED', 'CONFIRMED');
