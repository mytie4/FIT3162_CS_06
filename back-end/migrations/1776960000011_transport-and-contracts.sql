-- Up Migration
--
-- Transport + Contracts modules.
--
-- Transport: per-event driver offers with passenger sign-ups. A driver row is
-- "I'm taking my car, here's my pickup point, I have N seats." Passenger rows
-- claim those seats; one passenger per (driver, user) pair.
--
-- Contracts: per-event lightweight ledger of supplier / venue agreements
-- (title, counterparty, value, status, signed date). Metadata only — file
-- storage is out of scope for now.

-- 1. Event_Transport_Drivers ------------------------------------------------
CREATE TABLE "Event_Transport_Drivers" (
    "driver_id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id"           UUID NOT NULL,
    "driver_user_id"     UUID,
    "driver_name"        VARCHAR(120) NOT NULL,
    "vehicle"            VARCHAR(120),
    "seats_total"        INT NOT NULL,
    "departure_location" VARCHAR(200) NOT NULL,
    "departure_time"     TIMESTAMP NOT NULL,
    "notes"              TEXT,
    "created_by"         UUID,
    "created_at"         TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "transport_drivers_seats_positive"
        CHECK ("seats_total" > 0 AND "seats_total" <= 50),
    FOREIGN KEY ("event_id")       REFERENCES "Events" ("event_id") ON DELETE CASCADE,
    FOREIGN KEY ("driver_user_id") REFERENCES "Users"  ("user_id")  ON DELETE SET NULL,
    FOREIGN KEY ("created_by")     REFERENCES "Users"  ("user_id")  ON DELETE SET NULL
);

CREATE INDEX "idx_transport_drivers_event"
    ON "Event_Transport_Drivers" ("event_id", "departure_time");

-- 2. Event_Transport_Passengers --------------------------------------------
CREATE TABLE "Event_Transport_Passengers" (
    "passenger_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "driver_id"    UUID NOT NULL,
    "user_id"      UUID NOT NULL,
    "created_at"   TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE ("driver_id", "user_id"),
    FOREIGN KEY ("driver_id") REFERENCES "Event_Transport_Drivers" ("driver_id") ON DELETE CASCADE,
    FOREIGN KEY ("user_id")   REFERENCES "Users"                   ("user_id")   ON DELETE CASCADE
);

CREATE INDEX "idx_transport_passengers_driver"
    ON "Event_Transport_Passengers" ("driver_id");

-- 3. Event_Contracts -------------------------------------------------------
CREATE TABLE "Event_Contracts" (
    "contract_id"  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id"     UUID NOT NULL,
    "title"        VARCHAR(200) NOT NULL,
    "counterparty" VARCHAR(200),
    "value_amount" NUMERIC(12, 2),
    "value_currency" VARCHAR(3) NOT NULL DEFAULT 'AUD',
    "status"       VARCHAR(20) NOT NULL DEFAULT 'draft',
    "signed_date"  DATE,
    "notes"        TEXT,
    "created_by"   UUID,
    "created_at"   TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at"   TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "event_contracts_status_check"
        CHECK ("status" IN ('draft', 'sent', 'signed', 'cancelled')),
    FOREIGN KEY ("event_id")   REFERENCES "Events" ("event_id") ON DELETE CASCADE,
    FOREIGN KEY ("created_by") REFERENCES "Users"  ("user_id")  ON DELETE SET NULL
);

CREATE INDEX "idx_event_contracts_event"
    ON "Event_Contracts" ("event_id", "created_at");


-- Down Migration

DROP INDEX IF EXISTS "idx_event_contracts_event";
DROP TABLE IF EXISTS "Event_Contracts";

DROP INDEX IF EXISTS "idx_transport_passengers_driver";
DROP TABLE IF EXISTS "Event_Transport_Passengers";

DROP INDEX IF EXISTS "idx_transport_drivers_event";
DROP TABLE IF EXISTS "Event_Transport_Drivers";
