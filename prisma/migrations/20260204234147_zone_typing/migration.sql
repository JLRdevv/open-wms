/*
  Warnings:

  - The values [OTHER] on the enum `ZoneTypes` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ZoneTypes_new" AS ENUM ('GENERAL_STORAGE', 'COLD_CHAIN', 'HAZARDOUS', 'HIGH_VALUE');
ALTER TABLE "public"."zone" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "zone" ALTER COLUMN "type" TYPE "ZoneTypes_new" USING ("type"::text::"ZoneTypes_new");
ALTER TYPE "ZoneTypes" RENAME TO "ZoneTypes_old";
ALTER TYPE "ZoneTypes_new" RENAME TO "ZoneTypes";
DROP TYPE "public"."ZoneTypes_old";
ALTER TABLE "zone" ALTER COLUMN "type" SET DEFAULT 'GENERAL_STORAGE';
COMMIT;

-- AlterTable
ALTER TABLE "zone" ALTER COLUMN "type" SET DEFAULT 'GENERAL_STORAGE';
