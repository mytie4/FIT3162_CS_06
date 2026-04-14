-- Up Migration
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
-- Down Migration
DROP TRIGGER IF EXISTS set_club_code on "Clubs";
DROP FUNCTION IF EXISTS generate_club_code;
