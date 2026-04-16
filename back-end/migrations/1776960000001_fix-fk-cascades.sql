-- Up Migration

-- Club_Members
ALTER TABLE "Club_Members" DROP CONSTRAINT IF EXISTS "Club_Members_club_id_fkey";
ALTER TABLE "Club_Members" DROP CONSTRAINT IF EXISTS "Club_Members_user_id_fkey";
ALTER TABLE "Club_Members"
  ADD CONSTRAINT "Club_Members_club_id_fkey"
  FOREIGN KEY ("club_id") REFERENCES "Clubs" ("club_id") ON DELETE CASCADE;
ALTER TABLE "Club_Members"
  ADD CONSTRAINT "Club_Members_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") ON DELETE CASCADE;

-- Club_Members_Contributions
ALTER TABLE "Club_Members_Contributions" DROP CONSTRAINT IF EXISTS "Club_Members_Contributions_club_id_fkey";
ALTER TABLE "Club_Members_Contributions" DROP CONSTRAINT IF EXISTS "Club_Members_Contributions_user_id_fkey";
ALTER TABLE "Club_Members_Contributions"
  ADD CONSTRAINT "Club_Members_Contributions_club_id_fkey"
  FOREIGN KEY ("club_id") REFERENCES "Clubs" ("club_id") ON DELETE CASCADE;
ALTER TABLE "Club_Members_Contributions"
  ADD CONSTRAINT "Club_Members_Contributions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") ON DELETE CASCADE;

-- Events
ALTER TABLE "Events" DROP CONSTRAINT IF EXISTS "Events_club_id_fkey";
ALTER TABLE "Events" DROP CONSTRAINT IF EXISTS "events_created_by_fkey";
ALTER TABLE "Events"
  ADD CONSTRAINT "Events_club_id_fkey"
  FOREIGN KEY ("club_id") REFERENCES "Clubs" ("club_id") ON DELETE CASCADE;
ALTER TABLE "Events"
  ADD CONSTRAINT "events_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "Users" ("user_id") ON DELETE SET NULL;

-- Event_Logistics
ALTER TABLE "Event_Logistics" DROP CONSTRAINT IF EXISTS "Event_Logistics_event_id_fkey";
ALTER TABLE "Event_Logistics"
  ADD CONSTRAINT "Event_Logistics_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") ON DELETE CASCADE;

-- Tasks
ALTER TABLE "Tasks" DROP CONSTRAINT IF EXISTS "Tasks_event_id_fkey";
ALTER TABLE "Tasks" DROP CONSTRAINT IF EXISTS "Tasks_parent_task_id_fkey";
ALTER TABLE "Tasks"
  ADD CONSTRAINT "Tasks_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") ON DELETE CASCADE;
ALTER TABLE "Tasks"
  ADD CONSTRAINT "Tasks_parent_task_id_fkey"
  FOREIGN KEY ("parent_task_id") REFERENCES "Tasks" ("task_id") ON DELETE SET NULL;

-- Task_Assignees
ALTER TABLE "Task_Assignees" DROP CONSTRAINT IF EXISTS "Task_Assignees_task_id_fkey";
ALTER TABLE "Task_Assignees" DROP CONSTRAINT IF EXISTS "Task_Assignees_user_id_fkey";
ALTER TABLE "Task_Assignees"
  ADD CONSTRAINT "Task_Assignees_task_id_fkey"
  FOREIGN KEY ("task_id") REFERENCES "Tasks" ("task_id") ON DELETE CASCADE;
ALTER TABLE "Task_Assignees"
  ADD CONSTRAINT "Task_Assignees_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") ON DELETE CASCADE;

-- Event_Attendees
ALTER TABLE "Event_Attendees" DROP CONSTRAINT IF EXISTS "Event_Attendees_event_id_fkey";
ALTER TABLE "Event_Attendees" DROP CONSTRAINT IF EXISTS "Event_Attendees_user_id_fkey";
ALTER TABLE "Event_Attendees"
  ADD CONSTRAINT "Event_Attendees_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") ON DELETE CASCADE;
ALTER TABLE "Event_Attendees"
  ADD CONSTRAINT "Event_Attendees_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") ON DELETE CASCADE;

-- Notifications
ALTER TABLE "Notifications" DROP CONSTRAINT IF EXISTS "Notifications_user_id_fkey";
ALTER TABLE "Notifications"
  ADD CONSTRAINT "Notifications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") ON DELETE CASCADE;


-- Down Migration

-- Notifications
ALTER TABLE "Notifications" DROP CONSTRAINT IF EXISTS "Notifications_user_id_fkey";
ALTER TABLE "Notifications"
  ADD CONSTRAINT "Notifications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

-- Event_Attendees
ALTER TABLE "Event_Attendees" DROP CONSTRAINT IF EXISTS "Event_Attendees_event_id_fkey";
ALTER TABLE "Event_Attendees" DROP CONSTRAINT IF EXISTS "Event_Attendees_user_id_fkey";
ALTER TABLE "Event_Attendees"
  ADD CONSTRAINT "Event_Attendees_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "Event_Attendees"
  ADD CONSTRAINT "Event_Attendees_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

-- Task_Assignees
ALTER TABLE "Task_Assignees" DROP CONSTRAINT IF EXISTS "Task_Assignees_task_id_fkey";
ALTER TABLE "Task_Assignees" DROP CONSTRAINT IF EXISTS "Task_Assignees_user_id_fkey";
ALTER TABLE "Task_Assignees"
  ADD CONSTRAINT "Task_Assignees_task_id_fkey"
  FOREIGN KEY ("task_id") REFERENCES "Tasks" ("task_id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "Task_Assignees"
  ADD CONSTRAINT "Task_Assignees_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

-- Tasks
ALTER TABLE "Tasks" DROP CONSTRAINT IF EXISTS "Tasks_event_id_fkey";
ALTER TABLE "Tasks" DROP CONSTRAINT IF EXISTS "Tasks_parent_task_id_fkey";
ALTER TABLE "Tasks"
  ADD CONSTRAINT "Tasks_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "Tasks"
  ADD CONSTRAINT "Tasks_parent_task_id_fkey"
  FOREIGN KEY ("parent_task_id") REFERENCES "Tasks" ("task_id") DEFERRABLE INITIALLY IMMEDIATE;

-- Event_Logistics
ALTER TABLE "Event_Logistics" DROP CONSTRAINT IF EXISTS "Event_Logistics_event_id_fkey";
ALTER TABLE "Event_Logistics"
  ADD CONSTRAINT "Event_Logistics_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") DEFERRABLE INITIALLY IMMEDIATE;

-- Events
ALTER TABLE "Events" DROP CONSTRAINT IF EXISTS "Events_club_id_fkey";
ALTER TABLE "Events" DROP CONSTRAINT IF EXISTS "events_created_by_fkey";
ALTER TABLE "Events"
  ADD CONSTRAINT "Events_club_id_fkey"
  FOREIGN KEY ("club_id") REFERENCES "Clubs" ("club_id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "Events"
  ADD CONSTRAINT "events_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "Users" ("user_id");

-- Club_Members_Contributions
ALTER TABLE "Club_Members_Contributions" DROP CONSTRAINT IF EXISTS "Club_Members_Contributions_club_id_fkey";
ALTER TABLE "Club_Members_Contributions" DROP CONSTRAINT IF EXISTS "Club_Members_Contributions_user_id_fkey";
ALTER TABLE "Club_Members_Contributions"
  ADD CONSTRAINT "Club_Members_Contributions_club_id_fkey"
  FOREIGN KEY ("club_id") REFERENCES "Clubs" ("club_id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "Club_Members_Contributions"
  ADD CONSTRAINT "Club_Members_Contributions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

-- Club_Members
ALTER TABLE "Club_Members" DROP CONSTRAINT IF EXISTS "Club_Members_club_id_fkey";
ALTER TABLE "Club_Members" DROP CONSTRAINT IF EXISTS "Club_Members_user_id_fkey";
ALTER TABLE "Club_Members"
  ADD CONSTRAINT "Club_Members_club_id_fkey"
  FOREIGN KEY ("club_id") REFERENCES "Clubs" ("club_id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "Club_Members"
  ADD CONSTRAINT "Club_Members_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "Users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;
