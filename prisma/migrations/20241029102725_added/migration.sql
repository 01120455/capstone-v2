/*
  Warnings:

  - You are about to drop the column `name` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `item` table. All the data in the column will be lost.
  - You are about to drop the `itemimage` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `itemname` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemtype` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdby` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Made the column `unitprice` on table `transactionitem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `itemimage` DROP FOREIGN KEY `ItemImage_itemid_fkey`;

-- AlterTable
ALTER TABLE `item` DROP COLUMN `name`,
    DROP COLUMN `type`,
    ADD COLUMN `imagepath` VARCHAR(191) NULL,
    ADD COLUMN `itemname` VARCHAR(50) NOT NULL,
    ADD COLUMN `itemtype` ENUM('bigas', 'palay', 'resico') NOT NULL;

-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `createdby` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `transactionitem` MODIFY `unitprice` DOUBLE NOT NULL;

-- DropTable
DROP TABLE `itemimage`;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_createdby_fkey` FOREIGN KEY (`createdby`) REFERENCES `User`(`userid`) ON DELETE RESTRICT ON UPDATE CASCADE;
