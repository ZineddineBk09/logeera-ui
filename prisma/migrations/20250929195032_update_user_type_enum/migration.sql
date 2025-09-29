-- Update UserType enum values from INDIVIDUAL/COMPANY to PERSON/BUSINESS

-- First, update existing data
UPDATE "users" SET type = 'PERSON' WHERE type = 'INDIVIDUAL';
UPDATE "users" SET type = 'BUSINESS' WHERE type = 'COMPANY';

-- Now alter the enum type
ALTER TYPE "UserType" RENAME TO "UserType_old";

CREATE TYPE "UserType" AS ENUM ('PERSON', 'BUSINESS');

ALTER TABLE "users" ALTER COLUMN type TYPE "UserType" USING type::text::"UserType";

-- Update the default value
ALTER TABLE "users" ALTER COLUMN type SET DEFAULT 'PERSON';

-- Drop the old enum
DROP TYPE "UserType_old";
