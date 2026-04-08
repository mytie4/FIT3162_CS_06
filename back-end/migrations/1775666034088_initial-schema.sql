-- Up Migration

CREATE TABLE "Users" (
  "user_id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "profile_pic_url" VARCHAR(2048),
  "wants_email_reminders" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX "users_email_lower_unique" ON "Users" (LOWER("email"));

CREATE TABLE "Clubs" (
  "club_id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "shared_drive_link" VARCHAR(2048)
);

CREATE TABLE "Club_Members" (
  "club_id" INT NOT NULL,
  "user_id" INT NOT NULL,
  "role" VARCHAR(50) NOT NULL DEFAULT 'member',
  PRIMARY KEY ("club_id", "user_id"),
  FOREIGN KEY ("club_id") REFERENCES "Clubs" ("club_id") DEFERRABLE INITIALLY IMMEDIATE,
  FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE "Club_Members_Contributions" (
  "contribution_id" SERIAL PRIMARY KEY,
  "club_id" INT NOT NULL,
  "user_id" INT NOT NULL,
  "contributions" TEXT,
  "date_logged" TIMESTAMP,
  FOREIGN KEY ("club_id") REFERENCES "Clubs" ("club_id") DEFERRABLE INITIALLY IMMEDIATE,
  FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE "Events" (
  "event_id" SERIAL PRIMARY KEY,
  "club_id" INT NOT NULL,
  "title" VARCHAR(255),
  "type" VARCHAR(100),
  "date" TIMESTAMP,
  "location" VARCHAR(500),
  "budget" DECIMAL,
  "status" VARCHAR(50),
  "is_available_to_all" BOOLEAN DEFAULT FALSE,
  "money_used" INT DEFAULT 0,
  FOREIGN KEY ("club_id") REFERENCES "Clubs" ("club_id") DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE "Event_Logistics" (
  "event_id" INT NOT NULL PRIMARY KEY,
  "health_check_link" VARCHAR(2048),
  "hazards_list" TEXT,
  "emergency_contacts" TEXT,
  "notes" TEXT,
  FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE "Tasks" (
  "task_id" SERIAL PRIMARY KEY,
  "event_id" INT NOT NULL,
  "parent_task_id" INT,
  "title" VARCHAR(255),
  "due_date" TIMESTAMP,
  "priority" VARCHAR(50),
  "status" VARCHAR(50),
  "is_public" BOOLEAN DEFAULT FALSE,
  FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") DEFERRABLE INITIALLY IMMEDIATE,
  FOREIGN KEY ("parent_task_id") REFERENCES "Tasks" ("task_id") DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE "Task_Assignees" (
  "task_id" INT NOT NULL,
  "user_id" INT NOT NULL,
  PRIMARY KEY ("task_id", "user_id"),
  FOREIGN KEY ("task_id") REFERENCES "Tasks" ("task_id") DEFERRABLE INITIALLY IMMEDIATE,
  FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE
);

-- Down Migration

DROP TABLE IF EXISTS "Task_Assignees";
DROP TABLE IF EXISTS "Tasks";
DROP TABLE IF EXISTS "Event_Logistics";
DROP TABLE IF EXISTS "Events";
DROP TABLE IF EXISTS "Club_Members_Contributions";
DROP TABLE IF EXISTS "Club_Members";
DROP TABLE IF EXISTS "Clubs";
DROP INDEX IF EXISTS "users_email_lower_unique";
DROP TABLE IF EXISTS "Users";
