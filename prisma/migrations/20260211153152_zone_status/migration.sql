/*
  Warnings:

  - You are about to drop the column `isActive` on the `zone` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ZoneStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PICKING_ONLY', 'STORAGE_ONLY');

-- AlterTable
ALTER TABLE "zone" DROP COLUMN "isActive",
ADD COLUMN     "status" "ZoneStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "statusReason" TEXT,
ADD COLUMN     "statusUpdatedAt" TIMESTAMP(3);
