-- Up Migration
--
-- Outdoor Safety Module: pre-publish checklist + hazards + emergency contacts.
-- Added to support the FIT3162 outdoor-trip brief (sailing / rock-climbing /
-- bushwalking) where every published event must clear a safety gate. Weather
-- data is fetched live from BOM and is not persisted here.

-- 1. Event_Safety_Checks — per-event checklist items.
--    Seeded on event create from a template at the service layer (not here)
--    so future template changes don't need a migration.
CREATE TABLE "Event_Safety_Checks" (
    "check_id"     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id"     UUID NOT NULL,
    "label"        VARCHAR(200) NOT NULL,
    "description"  TEXT,
    "required"     BOOLEAN NOT NULL DEFAULT TRUE,
    "completed"    BOOLEAN NOT NULL DEFAULT FALSE,
    "completed_at" TIMESTAMP,
    "completed_by" UUID,
    "sort_order"   INT NOT NULL DEFAULT 0,
    "created_at"   TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") ON DELETE CASCADE,
    FOREIGN KEY ("completed_by") REFERENCES "Users" ("user_id") ON DELETE SET NULL
);

CREATE INDEX "idx_safety_checks_event"
    ON "Event_Safety_Checks" ("event_id", "sort_order");

-- 2. Event_Hazards — free-text hazard chips with severity.
CREATE TABLE "Event_Hazards" (
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

CREATE INDEX "idx_event_hazards_event"
    ON "Event_Hazards" ("event_id");

-- 3. Event_Emergency_Contacts — name/role/phone per event.
CREATE TABLE "Event_Emergency_Contacts" (
    "contact_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id"   UUID NOT NULL,
    "name"       VARCHAR(120) NOT NULL,
    "role"       VARCHAR(60),
    "phone"      VARCHAR(30) NOT NULL,
    "notes"      TEXT,
    "sort_order" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") ON DELETE CASCADE
);

CREATE INDEX "idx_emergency_contacts_event"
    ON "Event_Emergency_Contacts" ("event_id", "sort_order");


-- Down Migration

DROP INDEX IF EXISTS "idx_emergency_contacts_event";
DROP TABLE IF EXISTS "Event_Emergency_Contacts";

DROP INDEX IF EXISTS "idx_event_hazards_event";
DROP TABLE IF EXISTS "Event_Hazards";

DROP INDEX IF EXISTS "idx_safety_checks_event";
DROP TABLE IF EXISTS "Event_Safety_Checks";
