-- Up Migration

-- Rewrite generate_club_code() to use a random salt per attempt with a max-attempts guard.
-- The previous FIXED trigger computed the same deterministic hash on every retry, causing
-- an infinite loop on any collision. This version generates a fresh 6-digit candidate
-- each iteration and raises an exception if no free code is found in max_attempts tries.
CREATE OR REPLACE FUNCTION generate_club_code()
RETURNS trigger AS $$
DECLARE
    candidate TEXT;
    max_attempts INT := 20;
    attempts INT := 0;
BEGIN
    LOOP
        attempts := attempts + 1;
        candidate := LPAD(floor(random() * 1000000)::int::text, 6, '0');

        IF NOT EXISTS (SELECT 1 FROM "Clubs" WHERE code = candidate) THEN
            NEW.code := candidate;
            RETURN NEW;
        END IF;

        IF attempts >= max_attempts THEN
            RAISE EXCEPTION 'Could not generate a unique club join code after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_club_code ON "Clubs";

CREATE TRIGGER set_club_code
BEFORE INSERT ON "Clubs"
FOR EACH ROW
EXECUTE FUNCTION generate_club_code();

-- Backfill any existing clubs that somehow still have a NULL code.
-- We generate candidates in a loop, avoiding collisions with existing codes.
DO $$
DECLARE
    club_row RECORD;
    candidate TEXT;
    attempts INT;
BEGIN
    FOR club_row IN SELECT club_id FROM "Clubs" WHERE code IS NULL LOOP
        attempts := 0;
        LOOP
            attempts := attempts + 1;
            candidate := LPAD(floor(random() * 1000000)::int::text, 6, '0');

            IF NOT EXISTS (SELECT 1 FROM "Clubs" WHERE code = candidate) THEN
                UPDATE "Clubs" SET code = candidate WHERE club_id = club_row.club_id;
                EXIT;
            END IF;

            IF attempts >= 20 THEN
                RAISE EXCEPTION 'Could not backfill a unique club join code for club_id %', club_row.club_id;
            END IF;
        END LOOP;
    END LOOP;
END $$;

ALTER TABLE "Clubs" ALTER COLUMN "code" SET NOT NULL;


-- Down Migration

ALTER TABLE "Clubs" ALTER COLUMN "code" DROP NOT NULL;

-- Restore the previous (broken) deterministic trigger exactly as it was in the FIXED migration
CREATE OR REPLACE FUNCTION generate_club_code()
RETURNS trigger AS $$
DECLARE
    candidate TEXT;
BEGIN
    LOOP
        candidate := LPAD(
            (
                abs(('x' || substr(md5(NEW.club_id::text), 1, 8))::bit(32)::int)
                % 1000000
            )::text,
            6,
            '0'
        );

        PERFORM 1 FROM "Clubs" WHERE code = candidate;
        IF NOT FOUND THEN
            NEW.code := candidate;
            RETURN NEW;
        END IF;
        candidate := LPAD(
            (
                abs(('x' || substr(md5(NEW.club_id::text), 1, 8))::bit(32)::int)
                % 1000000
            )::text,
            6,
            '0'
        );
        PERFORM 1 FROM "Clubs" WHERE code = candidate;
        IF NOT FOUND THEN
            NEW.code := candidate;
            RETURN NEW;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_club_code ON "Clubs";

CREATE TRIGGER set_club_code
BEFORE INSERT ON "Clubs"
FOR EACH ROW
EXECUTE FUNCTION generate_club_code();
