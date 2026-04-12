-- Up Migration
ALTER TABLE "Clubs" 
ADD COLUMN "code" CHAR(6),
ADD CONSTRAINT code_six_digits CHECK (code ~ '^[0-9]{6}$');

CREATE OR REPLACE FUNCTION generate_club_code()
RETURNS trigger AS $$
BEGIN
    NEW.code := LPAD(
        (
            ('x' || substr(md5(NEW.club_id::text), 1, 8))::bit(32)::int
            % 1000000
        )::text,
        6,
        '0'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_club_code
BEFORE INSERT ON "Clubs"
FOR EACH ROW
EXECUTE FUNCTION generate_club_code();

ALTER TABLE "Clubs"
ADD CONSTRAINT code_unique UNIQUE (code);
-- Down Migration
ALTER TABLE "Clubs" 
DROP CONSTRAINT IF EXISTS code_six_digits,
DROP COLUMN IF EXISTS "code";