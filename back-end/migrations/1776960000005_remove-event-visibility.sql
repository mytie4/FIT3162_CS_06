-- Up Migration

ALTER TABLE "Events" DROP CONSTRAINT IF EXISTS "events_visibility_check";
ALTER TABLE "Events" DROP COLUMN IF EXISTS "visibility";

-- Down Migration
ALTER TABLE "Events" ADD COLUMN "visibility" VARCHAR(20) DEFAULT 'public';
ALTER TABLE "Events"
  ADD CONSTRAINT "events_visibility_check"
    CHECK ("visibility" IN ('public', 'members_only'));