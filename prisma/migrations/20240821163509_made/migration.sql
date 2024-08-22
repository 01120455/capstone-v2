/*
  Warnings:

  - You are about to drop the column `priceperunit` on the `purchaseitem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `purchaseitem` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `purchaseitem` table. All the data in the column will be lost.
  - Added the required column `onepercenttax` to the `Sales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `item` MODIFY `unitprice` DOUBLE NULL,
    MODIFY `stock` INTEGER NULL;

-- AlterTable
ALTER TABLE `purchase` ADD COLUMN `updatedat` DATETIME(3) NULL,
    MODIFY `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `purchaseitem` DROP COLUMN `priceperunit`,
    DROP COLUMN `quantity`,
    DROP COLUMN `weight`,
    ADD COLUMN `noofsack` INTEGER NULL,
    ADD COLUMN `totalweight` DOUBLE NULL,
    ADD COLUMN `unitofmeasurement` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `sales` ADD COLUMN `onepercenttax` DOUBLE NOT NULL;
