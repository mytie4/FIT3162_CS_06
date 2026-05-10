-- Up Migration

CREATE TABLE IF NOT EXISTS "Event_Expenses" (
  "expense_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" UUID NOT NULL REFERENCES "Events"("event_id") ON DELETE CASCADE,
  "item" VARCHAR(255) NOT NULL,
  "category" VARCHAR(100),
  "amount" DECIMAL(10,2) NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  "date" TIMESTAMP,
  "created_by" UUID REFERENCES "Users"("user_id"),
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_event_expenses_event" ON "Event_Expenses" ("event_id");

-- Down Migration

DROP INDEX IF EXISTS "idx_event_expenses_event";
DROP TABLE IF EXISTS "Event_Expenses";