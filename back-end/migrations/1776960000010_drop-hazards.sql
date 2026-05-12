-- Up Migration
--
-- Drop the Event_Hazards table. We never wired hazards into the frontend and
-- the simplified Safety tab no longer needs them — the checklist + emergency
-- contacts cover what student-club organisers actually use.

DROP INDEX IF EXISTS "idx_event_hazards_event";
DROP TABLE IF EXISTS "Event_Hazards";


-- Down Migration
--
-- Recreates the original table shape from 1776960000009_safety-module-schema.

CREATE TABLE IF NOT EXISTS "Event_Hazards" (
    "hazard_id"  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id"   UUID NOT NULL,
    "label"      VARCHAR(120) NOT NULL,
    "severity"   VARCHAR(10) NOT NULL DEFAULT 'medium',
    "notes"      TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "event_hazards_severity_check"
        CHECK ("severity" IN ('low', 'medium', 'high')),
    FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") ON DELETE CASCADE,
    FOREIGN KEY ("created_by") REFERENCES "Users" ("user_id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "idx_event_hazards_event"
    ON "Event_Hazards" ("event_id");
