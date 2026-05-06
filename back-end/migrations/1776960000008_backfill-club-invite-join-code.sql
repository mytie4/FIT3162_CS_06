-- Up Migration
--
-- Backfills `metadata.join_code` for any existing `club_invite` notifications
-- that pre-date the change which started stamping the club's join code into
-- the JSONB metadata payload. Without this, older invites render in the UI
-- but the "Accept Invitation" button stays disabled because the front-end
-- has no code to feed into POST /api/clubs/join.
--
-- Strategy: for each invite missing `metadata.join_code`, look up the club's
-- current `code` and merge it into the metadata. We also stamp `club_id`
-- when missing so the UI's fallback path can recover gracefully.
--
-- Idempotent: running it again after new rows arrive only fills gaps; rows
-- that already have a `join_code` in metadata are left alone.

UPDATE "Notifications" n
SET    "metadata" = COALESCE(n."metadata", '{}'::jsonb)
                    || jsonb_strip_nulls(jsonb_build_object(
                         'join_code', c."code",
                         'club_id',   c."club_id"::text
                       ))
FROM   "Clubs" c
WHERE  n."type" = 'club_invite'
  AND  c."club_id" = n."club_id"
  AND  c."code" IS NOT NULL
  AND  COALESCE(n."metadata"->>'join_code', '') = ''
  AND  COALESCE(n."metadata"->>'welcome', '') <> 'true'
  AND  n."title" NOT LIKE 'Welcome to %';

-- 2. Tag legacy welcome notifications with `metadata.welcome = true` so the
--    UI can distinguish them from real invites. Without this flag, welcome
--    rows render as "you have been invited" and show a misleading
--    Accept/Decline button on a club the user already joined.
UPDATE "Notifications"
SET    "metadata" = COALESCE("metadata", '{}'::jsonb)
                    || jsonb_build_object('welcome', true)
WHERE  "type" = 'club_invite'
  AND  "title" LIKE 'Welcome to %'
  AND  COALESCE("metadata"->>'welcome', '') <> 'true';


-- Down Migration
--
-- We don't strip the backfilled keys on rollback because (a) the data is
-- not lossy — anyone with the club_id can re-derive the code — and (b)
-- removing them might break notifications created after this migration ran.
SELECT 1;
