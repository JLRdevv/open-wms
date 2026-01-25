-- CreateTable
CREATE TABLE "Warehouse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserToWarehouse" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserToWarehouse_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserToWarehouse_B_index" ON "_UserToWarehouse"("B");

-- AddForeignKey
ALTER TABLE "_UserToWarehouse" ADD CONSTRAINT "_UserToWarehouse_A_fkey" FOREIGN KEY ("A") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToWarehouse" ADD CONSTRAINT "_UserToWarehouse_B_fkey" FOREIGN KEY ("B") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
