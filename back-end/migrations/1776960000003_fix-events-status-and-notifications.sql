-- Up Migration

-- 1. Dedup Events.status: collapse 'in_progress' into 'ongoing'.
UPDATE "Events" SET "status" = 'ongoing' WHERE "status" = 'in_progress';

ALTER TABLE "Events" DROP CONSTRAINT IF EXISTS "events_status_check";
ALTER TABLE "Events"
  ADD CONSTRAINT "events_status_check"
    CHECK ("status" IN ('draft', 'published', 'ongoing', 'completed', 'cancelled'));

-- 2. Normalize Notifications: add club_id / event_id FKs so they can be joined
-- to the canonical records instead of relying only on the denormalised strings.
ALTER TABLE "Notifications"
  ADD COLUMN IF NOT EXISTS "club_id" UUID,
  ADD COLUMN IF NOT EXISTS "event_id" UUID;

ALTER TABLE "Notifications" DROP CONSTRAINT IF EXISTS "Notifications_club_id_fkey";
ALTER TABLE "Notifications"
  ADD CONSTRAINT "Notifications_club_id_fkey"
  FOREIGN KEY ("club_id") REFERENCES "Clubs" ("club_id") ON DELETE SET NULL;

ALTER TABLE "Notifications" DROP CONSTRAINT IF EXISTS "Notifications_event_id_fkey";
ALTER TABLE "Notifications"
  ADD CONSTRAINT "Notifications_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") ON DELETE SET NULL;


-- Down Migration

ALTER TABLE "Notifications" DROP CONSTRAINT IF EXISTS "Notifications_event_id_fkey";
ALTER TABLE "Notifications" DROP CONSTRAINT IF EXISTS "Notifications_club_id_fkey";
ALTER TABLE "Notifications" DROP COLUMN IF EXISTS "event_id";
ALTER TABLE "Notifications" DROP COLUMN IF EXISTS "club_id";

ALTER TABLE "Events" DROP CONSTRAINT IF EXISTS "events_status_check";
ALTER TABLE "Events"
  ADD CONSTRAINT "events_status_check"
    CHECK ("status" IN ('draft', 'published', 'in_progress', 'ongoing', 'completed', 'cancelled'));
