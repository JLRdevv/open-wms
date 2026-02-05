/*
  Warnings:

  - Added the required column `createdBy` to the `location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `zone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "location" ADD COLUMN     "createdBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "zone" ADD COLUMN     "createdBy" TEXT NOT NULL;
