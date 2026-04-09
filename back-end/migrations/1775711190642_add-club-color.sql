-- Up Migration
ALTER TABLE "Clubs" ADD COLUMN "club_color" VARCHAR(7);

-- Down Migration
ALTER TABLE "Clubs" DROP COLUMN "club_color";