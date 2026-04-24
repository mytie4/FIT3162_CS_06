-- Up Migration

ALTER TABLE "Tasks"
  ADD COLUMN IF NOT EXISTS "created_by" UUID,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT NOW();

ALTER TABLE "Tasks" DROP CONSTRAINT IF EXISTS "Tasks_created_by_fkey";
ALTER TABLE "Tasks"
  ADD CONSTRAINT "Tasks_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "Users" ("user_id") ON DELETE SET NULL;


-- Down Migration

ALTER TABLE "Tasks" DROP CONSTRAINT IF EXISTS "Tasks_created_by_fkey";
ALTER TABLE "Tasks" DROP COLUMN IF EXISTS "created_at";
ALTER TABLE "Tasks" DROP COLUMN IF EXISTS "created_by";
