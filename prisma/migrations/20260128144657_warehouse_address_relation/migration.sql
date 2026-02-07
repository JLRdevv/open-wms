/*
  Warnings:

  - You are about to drop the `adress` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[addressId]` on the table `warehouse` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `addressId` to the `warehouse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "warehouse" ADD COLUMN     "addressId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "adress";

-- CreateTable
CREATE TABLE "address" (
    "id" SERIAL NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_addressId_key" ON "warehouse"("addressId");

-- AddForeignKey
ALTER TABLE "warehouse" ADD CONSTRAINT "warehouse_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
