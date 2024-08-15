/*
  Warnings:

  - You are about to drop the column `firstname` on the `supplier` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `supplier` table. All the data in the column will be lost.
  - You are about to drop the column `middlename` on the `supplier` table. All the data in the column will be lost.
  - Added the required column `criticallevel` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reorderlevel` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `suppliername` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `customer` MODIFY `contactnumber` INTEGER NULL,
    MODIFY `middlename` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `item` ADD COLUMN `criticallevel` INTEGER NOT NULL,
    ADD COLUMN `reorderlevel` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `supplier` DROP COLUMN `firstname`,
    DROP COLUMN `lastname`,
    DROP COLUMN `middlename`,
    ADD COLUMN `suppliername` VARCHAR(150) NOT NULL;
