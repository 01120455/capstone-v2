/*
  Warnings:

  - You are about to drop the `password` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `username` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `password` DROP FOREIGN KEY `Password_passwordid_fkey`;

-- DropForeignKey
ALTER TABLE `username` DROP FOREIGN KEY `Username_usernameid_fkey`;

-- DropIndex
DROP INDEX `Inventory_ItemID_fkey` ON `inventory`;

-- DropIndex
DROP INDEX `Purchase_UserID_fkey` ON `purchase`;

-- DropIndex
DROP INDEX `PurchaseItem_PurchaseID_fkey` ON `purchaseitem`;

-- DropIndex
DROP INDEX `Sales_UserID_fkey` ON `sales`;

-- DropIndex
DROP INDEX `SalesItem_SalesID_fkey` ON `salesitem`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `username` VARCHAR(50) NOT NULL;

-- DropTable
DROP TABLE `password`;

-- DropTable
DROP TABLE `username`;

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);
