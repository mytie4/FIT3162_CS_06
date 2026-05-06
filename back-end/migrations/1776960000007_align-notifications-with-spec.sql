-- Up Migration

-- 1. Add the spec'd JSONB metadata column for flexible payloads
--    (e.g. { task_id, event_id, club_id, sender_id, ... }).
ALTER TABLE "Notifications"
  ADD COLUMN IF NOT EXISTS "metadata" JSONB NOT NULL DEFAULT '{}';

-- 2. Replace the restrictive 3-value type CHECK with the spec'd 5 values.
--    Keep the legacy 3 values as well so already-seeded dev DBs do not fail
--    the constraint on existing rows.
ALTER TABLE "Notifications" DROP CONSTRAINT IF EXISTS "Notifications_type_check";
ALTER TABLE "Notifications"
  ADD CONSTRAINT "Notifications_type_check"
  CHECK ("type" IN (
    'club_invite',
    'task_assigned',
    'event_reminder',
    'role_changed',
    'event_update',
    'invite',
    'task',
    'reminder'
  ));

-- 3. Enforce title NOT NULL per the spec. Backfill any existing NULLs first
--    so the constraint can be added safely.
UPDATE "Notifications" SET "title" = 'Notification' WHERE "title" IS NULL;
ALTER TABLE "Notifications" ALTER COLUMN "title" SET NOT NULL;

-- 4. Add the spec-named composite index. The existing
--    idx_notifications_user_read index covers the same columns and is left
--    in place so this migration is purely additive.
CREATE INDEX IF NOT EXISTS "idx_notifications_user"
  ON "Notifications" ("user_id", "read", "created_at" DESC);


-- Down Migration

DROP INDEX IF EXISTS "idx_notifications_user";

ALTER TABLE "Notifications" ALTER COLUMN "title" DROP NOT NULL;

ALTER TABLE "Notifications" DROP CONSTRAINT IF EXISTS "Notifications_type_check";
ALTER TABLE "Notifications"
  ADD CONSTRAINT "Notifications_type_check"
  CHECK ("type" IN ('invite', 'task', 'reminder'));

ALTER TABLE "Notifications" DROP COLUMN IF EXISTS "metadata";
