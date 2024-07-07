/*
  Warnings:

  - The primary key for the `customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ContactNumber` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `CustomerID` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `FirstName` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `LastName` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `MiddleName` on the `customer` table. All the data in the column will be lost.
  - The primary key for the `inventory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Acquisition` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `InventoryID` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `ItemID` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `Quantity` on the `inventory` table. All the data in the column will be lost.
  - The primary key for the `item` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ItemID` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `Quality` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `Type` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `Variety` on the `item` table. All the data in the column will be lost.
  - The primary key for the `password` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Password` on the `password` table. All the data in the column will be lost.
  - You are about to drop the column `PasswordID` on the `password` table. All the data in the column will be lost.
  - The primary key for the `purchase` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Agent` on the `purchase` table. All the data in the column will be lost.
  - You are about to drop the column `Date` on the `purchase` table. All the data in the column will be lost.
  - You are about to drop the column `OfficialReceiptNo` on the `purchase` table. All the data in the column will be lost.
  - You are about to drop the column `PurchaseID` on the `purchase` table. All the data in the column will be lost.
  - You are about to drop the column `SupplierID` on the `purchase` table. All the data in the column will be lost.
  - You are about to drop the column `TotalAmount` on the `purchase` table. All the data in the column will be lost.
  - You are about to drop the column `UserID` on the `purchase` table. All the data in the column will be lost.
  - The primary key for the `purchaseitem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `PricePerUnit` on the `purchaseitem` table. All the data in the column will be lost.
  - You are about to drop the column `PurchaseID` on the `purchaseitem` table. All the data in the column will be lost.
  - You are about to drop the column `PurchaseItemID` on the `purchaseitem` table. All the data in the column will be lost.
  - You are about to drop the column `Quantity` on the `purchaseitem` table. All the data in the column will be lost.
  - You are about to drop the column `Weight` on the `purchaseitem` table. All the data in the column will be lost.
  - You are about to drop the column `itemID` on the `purchaseitem` table. All the data in the column will be lost.
  - The primary key for the `sales` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `CustomerID` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `Date` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `InvoiceNo` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `SalesID` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `TotalAmount` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `UserID` on the `sales` table. All the data in the column will be lost.
  - The primary key for the `salesitem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `InventoryId` on the `salesitem` table. All the data in the column will be lost.
  - You are about to drop the column `ItemID` on the `salesitem` table. All the data in the column will be lost.
  - You are about to drop the column `PricePerUnit` on the `salesitem` table. All the data in the column will be lost.
  - You are about to drop the column `Quantity` on the `salesitem` table. All the data in the column will be lost.
  - You are about to drop the column `SalesID` on the `salesitem` table. All the data in the column will be lost.
  - You are about to drop the column `SalesItemID` on the `salesitem` table. All the data in the column will be lost.
  - You are about to drop the column `Weight` on the `salesitem` table. All the data in the column will be lost.
  - The primary key for the `supplier` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ContactNumber` on the `supplier` table. All the data in the column will be lost.
  - You are about to drop the column `FirstName` on the `supplier` table. All the data in the column will be lost.
  - You are about to drop the column `LastName` on the `supplier` table. All the data in the column will be lost.
  - You are about to drop the column `MiddleName` on the `supplier` table. All the data in the column will be lost.
  - You are about to drop the column `SupplierID` on the `supplier` table. All the data in the column will be lost.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `FirstName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `LastName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `MiddleName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `Role` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `UserID` on the `user` table. All the data in the column will be lost.
  - The primary key for the `username` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `PasswordID` on the `username` table. All the data in the column will be lost.
  - You are about to drop the column `UserID` on the `username` table. All the data in the column will be lost.
  - You are about to drop the column `Username` on the `username` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `Username` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contactnumber` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerid` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstname` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `middlename` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inventoryid` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemid` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemid` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Password` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordid` to the `Password` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchaseid` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierid` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalamount` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userid` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemid` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchaseid` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchaseitemid` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerid` to the `Sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceno` to the `Sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salesid` to the `Sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalamount` to the `Sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userid` to the `Sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemid` to the `SalesItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `SalesItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salesid` to the `SalesItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salesitemid` to the `SalesItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactnumber` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstname` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `middlename` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierid` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userid` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Username` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usernameid` to the `Username` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `inventory` DROP FOREIGN KEY `Inventory_ItemID_fkey`;

-- DropForeignKey
ALTER TABLE `purchase` DROP FOREIGN KEY `Purchase_SupplierID_fkey`;

-- DropForeignKey
ALTER TABLE `purchase` DROP FOREIGN KEY `Purchase_UserID_fkey`;

-- DropForeignKey
ALTER TABLE `purchaseitem` DROP FOREIGN KEY `PurchaseItem_PurchaseID_fkey`;

-- DropForeignKey
ALTER TABLE `purchaseitem` DROP FOREIGN KEY `PurchaseItem_itemID_fkey`;

-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `Sales_CustomerID_fkey`;

-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `Sales_UserID_fkey`;

-- DropForeignKey
ALTER TABLE `salesitem` DROP FOREIGN KEY `SalesItem_ItemID_fkey`;

-- DropForeignKey
ALTER TABLE `salesitem` DROP FOREIGN KEY `SalesItem_SalesID_fkey`;

-- DropForeignKey
ALTER TABLE `username` DROP FOREIGN KEY `Username_PasswordID_fkey`;

-- DropForeignKey
ALTER TABLE `username` DROP FOREIGN KEY `Username_UserID_fkey`;

-- DropIndex
DROP INDEX `Username_Username_key` ON `username`;

-- AlterTable
ALTER TABLE `customer` DROP PRIMARY KEY,
    DROP COLUMN `ContactNumber`,
    DROP COLUMN `CustomerID`,
    DROP COLUMN `FirstName`,
    DROP COLUMN `LastName`,
    DROP COLUMN `MiddleName`,
    ADD COLUMN `contactnumber` INTEGER NOT NULL,
    ADD COLUMN `customerid` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `firstname` VARCHAR(50) NOT NULL,
    ADD COLUMN `lastname` VARCHAR(50) NOT NULL,
    ADD COLUMN `middlename` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`customerid`);

-- AlterTable
ALTER TABLE `inventory` DROP PRIMARY KEY,
    DROP COLUMN `Acquisition`,
    DROP COLUMN `InventoryID`,
    DROP COLUMN `ItemID`,
    DROP COLUMN `Quantity`,
    ADD COLUMN `inventoryid` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `itemid` INTEGER NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD PRIMARY KEY (`inventoryid`);

-- AlterTable
ALTER TABLE `item` DROP PRIMARY KEY,
    DROP COLUMN `ItemID`,
    DROP COLUMN `Name`,
    DROP COLUMN `Quality`,
    DROP COLUMN `Type`,
    DROP COLUMN `Variety`,
    ADD COLUMN `itemid` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `name` VARCHAR(50) NULL,
    ADD COLUMN `quality` VARCHAR(50) NULL,
    ADD COLUMN `type` VARCHAR(50) NOT NULL,
    ADD COLUMN `variety` VARCHAR(50) NULL,
    ADD PRIMARY KEY (`itemid`);

-- AlterTable
ALTER TABLE `password` DROP PRIMARY KEY,
    DROP COLUMN `Password`,
    DROP COLUMN `PasswordID`,
    ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `passwordid` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`passwordid`);

-- AlterTable
ALTER TABLE `purchase` DROP PRIMARY KEY,
    DROP COLUMN `Agent`,
    DROP COLUMN `Date`,
    DROP COLUMN `OfficialReceiptNo`,
    DROP COLUMN `PurchaseID`,
    DROP COLUMN `SupplierID`,
    DROP COLUMN `TotalAmount`,
    DROP COLUMN `UserID`,
    ADD COLUMN `agent` VARCHAR(50) NULL,
    ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `officialreceiptno` INTEGER NULL,
    ADD COLUMN `purchaseid` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `supplierid` INTEGER NOT NULL,
    ADD COLUMN `totalamount` DOUBLE NOT NULL,
    ADD COLUMN `userid` INTEGER NOT NULL,
    ADD PRIMARY KEY (`purchaseid`);

-- AlterTable
ALTER TABLE `purchaseitem` DROP PRIMARY KEY,
    DROP COLUMN `PricePerUnit`,
    DROP COLUMN `PurchaseID`,
    DROP COLUMN `PurchaseItemID`,
    DROP COLUMN `Quantity`,
    DROP COLUMN `Weight`,
    DROP COLUMN `itemID`,
    ADD COLUMN `itemid` INTEGER NOT NULL,
    ADD COLUMN `pricePerUnit` DOUBLE NULL,
    ADD COLUMN `purchaseid` INTEGER NOT NULL,
    ADD COLUMN `purchaseitemid` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD COLUMN `weight` DOUBLE NULL,
    ADD PRIMARY KEY (`purchaseitemid`);

-- AlterTable
ALTER TABLE `sales` DROP PRIMARY KEY,
    DROP COLUMN `CustomerID`,
    DROP COLUMN `Date`,
    DROP COLUMN `InvoiceNo`,
    DROP COLUMN `SalesID`,
    DROP COLUMN `TotalAmount`,
    DROP COLUMN `UserID`,
    ADD COLUMN `customerid` INTEGER NOT NULL,
    ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `invoiceno` INTEGER NOT NULL,
    ADD COLUMN `salesid` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `totalamount` DOUBLE NOT NULL,
    ADD COLUMN `userid` INTEGER NOT NULL,
    ADD PRIMARY KEY (`salesid`);

-- AlterTable
ALTER TABLE `salesitem` DROP PRIMARY KEY,
    DROP COLUMN `InventoryId`,
    DROP COLUMN `ItemID`,
    DROP COLUMN `PricePerUnit`,
    DROP COLUMN `Quantity`,
    DROP COLUMN `SalesID`,
    DROP COLUMN `SalesItemID`,
    DROP COLUMN `Weight`,
    ADD COLUMN `inventoryid` INTEGER NULL,
    ADD COLUMN `itemid` INTEGER NOT NULL,
    ADD COLUMN `priceperunit` DOUBLE NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD COLUMN `salesid` INTEGER NOT NULL,
    ADD COLUMN `salesitemid` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `weight` DOUBLE NULL,
    ADD PRIMARY KEY (`salesitemid`);

-- AlterTable
ALTER TABLE `supplier` DROP PRIMARY KEY,
    DROP COLUMN `ContactNumber`,
    DROP COLUMN `FirstName`,
    DROP COLUMN `LastName`,
    DROP COLUMN `MiddleName`,
    DROP COLUMN `SupplierID`,
    ADD COLUMN `contactnumber` INTEGER NOT NULL,
    ADD COLUMN `firstname` VARCHAR(50) NOT NULL,
    ADD COLUMN `lastname` VARCHAR(50) NOT NULL,
    ADD COLUMN `middlename` VARCHAR(50) NOT NULL,
    ADD COLUMN `supplierid` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`supplierid`);

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    DROP COLUMN `FirstName`,
    DROP COLUMN `LastName`,
    DROP COLUMN `MiddleName`,
    DROP COLUMN `Role`,
    DROP COLUMN `Status`,
    DROP COLUMN `UserID`,
    ADD COLUMN `firstname` VARCHAR(25) NOT NULL,
    ADD COLUMN `lastname` VARCHAR(25) NOT NULL,
    ADD COLUMN `middlename` VARCHAR(25) NULL,
    ADD COLUMN `role` VARCHAR(50) NOT NULL,
    ADD COLUMN `status` ENUM('active', 'inactive') NOT NULL,
    ADD COLUMN `userid` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`userid`);

-- AlterTable
ALTER TABLE `username` DROP PRIMARY KEY,
    DROP COLUMN `PasswordID`,
    DROP COLUMN `UserID`,
    DROP COLUMN `Username`,
    ADD COLUMN `username` VARCHAR(50) NOT NULL,
    ADD COLUMN `usernameid` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`usernameid`);

-- CreateIndex
CREATE UNIQUE INDEX `Username_username_key` ON `Username`(`username`);

-- AddForeignKey
ALTER TABLE `Username` ADD CONSTRAINT `Username_usernameid_fkey` FOREIGN KEY (`usernameid`) REFERENCES `User`(`userid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Password` ADD CONSTRAINT `Password_passwordid_fkey` FOREIGN KEY (`passwordid`) REFERENCES `Username`(`usernameid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sales` ADD CONSTRAINT `Sales_salesid_fkey` FOREIGN KEY (`salesid`) REFERENCES `User`(`userid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sales` ADD CONSTRAINT `Sales_customerid_fkey` FOREIGN KEY (`customerid`) REFERENCES `Customer`(`customerid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesItem` ADD CONSTRAINT `SalesItem_salesitemid_fkey` FOREIGN KEY (`salesitemid`) REFERENCES `Sales`(`salesid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesItem` ADD CONSTRAINT `SalesItem_itemid_fkey` FOREIGN KEY (`itemid`) REFERENCES `Item`(`itemid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_purchaseid_fkey` FOREIGN KEY (`purchaseid`) REFERENCES `User`(`userid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_supplierid_fkey` FOREIGN KEY (`supplierid`) REFERENCES `Supplier`(`supplierid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseItem` ADD CONSTRAINT `PurchaseItem_purchaseitemid_fkey` FOREIGN KEY (`purchaseitemid`) REFERENCES `Purchase`(`purchaseid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseItem` ADD CONSTRAINT `PurchaseItem_itemid_fkey` FOREIGN KEY (`itemid`) REFERENCES `Item`(`itemid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_inventoryid_fkey` FOREIGN KEY (`inventoryid`) REFERENCES `Item`(`itemid`) ON DELETE RESTRICT ON UPDATE CASCADE;
