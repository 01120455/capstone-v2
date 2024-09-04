/*
  Warnings:

  - You are about to drop the column `createdat` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `itemdeleted` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `updatedat` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `userdeleted` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchaseitem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sales` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `salesitem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `supplier` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sackweight` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Made the column `unitofmeasurement` on table `item` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `purchase` DROP FOREIGN KEY `Purchase_supplierid_fkey`;

-- DropForeignKey
ALTER TABLE `purchase` DROP FOREIGN KEY `Purchase_updatedby_fkey`;

-- DropForeignKey
ALTER TABLE `purchase` DROP FOREIGN KEY `Purchase_userid_fkey`;

-- DropForeignKey
ALTER TABLE `purchaseitem` DROP FOREIGN KEY `PurchaseItem_itemid_fkey`;

-- DropForeignKey
ALTER TABLE `purchaseitem` DROP FOREIGN KEY `PurchaseItem_purchaseid_fkey`;

-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `Sales_customerid_fkey`;

-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `Sales_salesid_fkey`;

-- DropForeignKey
ALTER TABLE `salesitem` DROP FOREIGN KEY `SalesItem_itemid_fkey`;

-- DropForeignKey
ALTER TABLE `salesitem` DROP FOREIGN KEY `SalesItem_salesitemid_fkey`;

-- AlterTable
ALTER TABLE `item` DROP COLUMN `createdat`,
    DROP COLUMN `itemdeleted`,
    DROP COLUMN `stock`,
    DROP COLUMN `updatedat`,
    ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastmodifiedat` DATETIME(3) NULL,
    ADD COLUMN `lastmodifiedby` INTEGER NULL,
    ADD COLUMN `measurementvalue` DOUBLE NULL,
    ADD COLUMN `sackweight` ENUM('bags25kg', 'cavans50kg') NOT NULL,
    MODIFY `unitofmeasurement` ENUM('quantity', 'weight') NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `userdeleted`,
    ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `customer`;

-- DropTable
DROP TABLE `purchase`;

-- DropTable
DROP TABLE `purchaseitem`;

-- DropTable
DROP TABLE `sales`;

-- DropTable
DROP TABLE `salesitem`;

-- DropTable
DROP TABLE `supplier`;

-- CreateTable
CREATE TABLE `Entity` (
    `entityid` INTEGER NOT NULL AUTO_INCREMENT,
    `firstname` VARCHAR(50) NOT NULL,
    `middlename` VARCHAR(50) NULL,
    `lastname` VARCHAR(50) NOT NULL,
    `contactnumber` INTEGER NULL,
    `lastmodifiedby` INTEGER NULL,
    `lastmodifiedat` DATETIME(3) NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`entityid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoicenumber` (
    `invoicenumberid` INTEGER NOT NULL AUTO_INCREMENT,
    `invoicenumber` VARCHAR(50) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Invoicenumber_invoicenumber_key`(`invoicenumber`),
    PRIMARY KEY (`invoicenumberid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `transactionid` INTEGER NOT NULL AUTO_INCREMENT,
    `entityid` INTEGER NOT NULL,
    `type` ENUM('purchase', 'sales') NOT NULL,
    `status` ENUM('pending', 'paid', 'cancelled') NOT NULL,
    `walkin` BOOLEAN NOT NULL DEFAULT false,
    `frommilling` BOOLEAN NOT NULL DEFAULT false,
    `taxpercentage` INTEGER NULL,
    `totalamount` DOUBLE NULL,
    `createdat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastmodifiedby` INTEGER NULL,
    `lastmodifiedat` DATETIME(3) NULL,
    `invoicenumberid` INTEGER NULL,
    `taxpercentageid` INTEGER NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`transactionid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransactionItem` (
    `transactionitemid` INTEGER NOT NULL AUTO_INCREMENT,
    `transactionid` INTEGER NOT NULL,
    `itemid` INTEGER NOT NULL,
    `unitofmeasurement` ENUM('quantity', 'weight') NOT NULL,
    `measurementvalue` DOUBLE NULL,
    `unitprice` DOUBLE NULL,
    `totalamount` DOUBLE NOT NULL,
    `lastmodifiedby` INTEGER NULL,
    `lastmodifiedat` DATETIME(3) NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`transactionitemid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Entity` ADD CONSTRAINT `Entity_lastmodifiedby_fkey` FOREIGN KEY (`lastmodifiedby`) REFERENCES `User`(`userid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_entityid_fkey` FOREIGN KEY (`entityid`) REFERENCES `Entity`(`entityid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_invoicenumberid_fkey` FOREIGN KEY (`invoicenumberid`) REFERENCES `Invoicenumber`(`invoicenumberid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_lastmodifiedby_fkey` FOREIGN KEY (`lastmodifiedby`) REFERENCES `User`(`userid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionItem` ADD CONSTRAINT `TransactionItem_transactionid_fkey` FOREIGN KEY (`transactionid`) REFERENCES `Transaction`(`transactionid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionItem` ADD CONSTRAINT `TransactionItem_itemid_fkey` FOREIGN KEY (`itemid`) REFERENCES `Item`(`itemid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionItem` ADD CONSTRAINT `TransactionItem_lastmodifiedby_fkey` FOREIGN KEY (`lastmodifiedby`) REFERENCES `User`(`userid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_lastmodifiedby_fkey` FOREIGN KEY (`lastmodifiedby`) REFERENCES `User`(`userid`) ON DELETE SET NULL ON UPDATE CASCADE;
