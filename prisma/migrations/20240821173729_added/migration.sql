/*
  Warnings:

  - A unique constraint covering the columns `[suppliername,contactnumber]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Supplier_suppliername_contactnumber_key` ON `Supplier`(`suppliername`, `contactnumber`);
