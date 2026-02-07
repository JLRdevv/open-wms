/*
  Warnings:

  - You are about to drop the `Warehouse` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserToWarehouse" DROP CONSTRAINT "_UserToWarehouse_B_fkey";

-- DropTable
DROP TABLE "Warehouse";

-- CreateTable
CREATE TABLE "warehouse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adress" (
    "id" SERIAL NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,

    CONSTRAINT "adress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_code_key" ON "warehouse"("code");

-- AddForeignKey
ALTER TABLE "_UserToWarehouse" ADD CONSTRAINT "_UserToWarehouse_B_fkey" FOREIGN KEY ("B") REFERENCES "warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
