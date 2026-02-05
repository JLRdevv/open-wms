/*
  Warnings:

  - You are about to drop the column `address` on the `address` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "address" DROP COLUMN "address",
ADD COLUMN     "addressLine" TEXT;
