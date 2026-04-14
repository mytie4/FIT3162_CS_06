-- Up Migration

-- 1. Extend Clubs table (join_code already added in previous migration)
ALTER TABLE "Clubs"
  ADD COLUMN "type" VARCHAR(50),
  ADD COLUMN "banner_url" VARCHAR(2048),
  ADD COLUMN "logo_url" VARCHAR(2048),
  ADD COLUMN "discord_link" VARCHAR(2048),
  ADD COLUMN "instagram_link" VARCHAR(2048),
  ADD COLUMN "website_link" VARCHAR(2048),
  ADD COLUMN "created_at" TIMESTAMP DEFAULT NOW();

-- 2. Extend Club_Members table
ALTER TABLE "Club_Members"
  ADD COLUMN "joined_at" TIMESTAMP DEFAULT NOW();

-- Normalize existing role values to the canonical set before adding constraint
UPDATE "Club_Members"
  SET role = CASE
    WHEN LOWER(role) = 'president' THEN 'president'
    WHEN LOWER(role) = 'vice_president' THEN 'vice_president'
    WHEN LOWER(role) IN ('admin', 'administrator') THEN 'president'
    ELSE 'member'
  END;

ALTER TABLE "Club_Members"
  ADD CONSTRAINT "club_members_role_check"
    CHECK (role IN ('president', 'vice_president', 'member'));

-- 3. Extend Events table
ALTER TABLE "Events"
  ADD COLUMN "end_date" TIMESTAMP,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "banner_url" VARCHAR(2048),
  ADD COLUMN "visibility" VARCHAR(20) DEFAULT 'public',
  ADD COLUMN "created_by" UUID,
  ADD COLUMN "created_at" TIMESTAMP DEFAULT NOW();

ALTER TABLE "Events"
  ADD CONSTRAINT "events_visibility_check"
    CHECK ("visibility" IN ('public', 'members_only'));

ALTER TABLE "Events"
  ADD CONSTRAINT "events_status_check"
    CHECK ("status" IN ('draft', 'published', 'in_progress', 'ongoing', 'completed', 'cancelled'));

ALTER TABLE "Events"
  ADD CONSTRAINT "events_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "Users" ("user_id");

ALTER TABLE "Events" DROP COLUMN IF EXISTS "is_available_to_all";

-- 4. Extend Tasks table (for CreateTaskModal + Kanban tags)
ALTER TABLE "Tasks"
  ADD COLUMN "tag" VARCHAR(50),
  ADD COLUMN "description" TEXT;

-- 5. Create Event_Attendees table
CREATE TABLE "Event_Attendees" (
  "event_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "rsvp_status" VARCHAR(20) DEFAULT 'going'
    CHECK ("rsvp_status" IN ('going', 'interested', 'not_going')),
  "registered_at" TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY ("event_id", "user_id"),
  FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") DEFERRABLE INITIALLY IMMEDIATE,
  FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE
);

-- 6. Create Notifications table (for NotificationsPage)
CREATE TABLE "Notifications" (
  "notification_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "type" VARCHAR(50) NOT NULL
    CHECK ("type" IN ('invite', 'task', 'reminder')),
  "title" VARCHAR(255),
  "message" TEXT,
  "sender_name" VARCHAR(255),
  "club_name" VARCHAR(255),
  "event_name" VARCHAR(255),
  "read" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE
);

CREATE INDEX "idx_notifications_user_read"
  ON "Notifications" ("user_id", "read", "created_at" DESC);

-- Down Migration

DROP INDEX IF EXISTS "idx_notifications_user_read";
DROP TABLE IF EXISTS "Notifications";
DROP TABLE IF EXISTS "Event_Attendees";

ALTER TABLE "Tasks"
  DROP COLUMN IF EXISTS "tag",
  DROP COLUMN IF EXISTS "description";

ALTER TABLE "Events" DROP CONSTRAINT IF EXISTS "events_created_by_fkey";
ALTER TABLE "Events" DROP CONSTRAINT IF EXISTS "events_status_check";
ALTER TABLE "Events" DROP CONSTRAINT IF EXISTS "events_visibility_check";
ALTER TABLE "Events" DROP COLUMN IF EXISTS "end_date";
ALTER TABLE "Events" DROP COLUMN IF EXISTS "description";
ALTER TABLE "Events" DROP COLUMN IF EXISTS "banner_url";
ALTER TABLE "Events" DROP COLUMN IF EXISTS "visibility";
ALTER TABLE "Events" DROP COLUMN IF EXISTS "created_by";
ALTER TABLE "Events" DROP COLUMN IF EXISTS "created_at";
ALTER TABLE "Events" ADD COLUMN "is_available_to_all" BOOLEAN DEFAULT FALSE;

ALTER TABLE "Club_Members" DROP CONSTRAINT IF EXISTS "club_members_role_check";
ALTER TABLE "Club_Members" DROP COLUMN IF EXISTS "joined_at";

ALTER TABLE "Clubs" DROP COLUMN IF EXISTS "type";
ALTER TABLE "Clubs" DROP COLUMN IF EXISTS "banner_url";
ALTER TABLE "Clubs" DROP COLUMN IF EXISTS "logo_url";
ALTER TABLE "Clubs" DROP COLUMN IF EXISTS "discord_link";
ALTER TABLE "Clubs" DROP COLUMN IF EXISTS "instagram_link";
ALTER TABLE "Clubs" DROP COLUMN IF EXISTS "website_link";
ALTER TABLE "Clubs" DROP COLUMN IF EXISTS "created_at";
