-- Up Migration

-- Defensive cleanup: if any club currently has more than one president,
-- keep the earliest joiner as president and demote the rest to vice_president.
-- This must run before the partial unique index or the CREATE INDEX will fail.
WITH ranked AS (
  SELECT
    "club_id",
    "user_id",
    ROW_NUMBER() OVER (
      PARTITION BY "club_id"
      ORDER BY "joined_at" ASC NULLS LAST, "user_id" ASC
    ) AS rn
  FROM "Club_Members"
  WHERE "role" = 'president'
)
UPDATE "Club_Members" cm
SET "role" = 'vice_president'
FROM ranked r
WHERE cm."club_id" = r."club_id"
  AND cm."user_id" = r."user_id"
  AND r.rn > 1;

-- Enforce at most one president per club at the database level.
CREATE UNIQUE INDEX "club_members_one_president_per_club"
  ON "Club_Members" ("club_id")
  WHERE "role" = 'president';

-- Supporting indexes for the most common lookup paths.
CREATE INDEX "idx_club_members_user" ON "Club_Members" ("user_id");
CREATE INDEX "idx_events_club" ON "Events" ("club_id");
CREATE INDEX "idx_tasks_event" ON "Tasks" ("event_id");
CREATE INDEX "idx_task_assignees_user" ON "Task_Assignees" ("user_id");
CREATE INDEX "idx_event_attendees_user" ON "Event_Attendees" ("user_id");


-- Down Migration

DROP INDEX IF EXISTS "idx_event_attendees_user";
DROP INDEX IF EXISTS "idx_task_assignees_user";
DROP INDEX IF EXISTS "idx_tasks_event";
DROP INDEX IF EXISTS "idx_events_club";
DROP INDEX IF EXISTS "idx_club_members_user";
DROP INDEX IF EXISTS "club_members_one_president_per_club";
