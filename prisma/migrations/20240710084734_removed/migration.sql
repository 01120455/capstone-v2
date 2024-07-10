/*
  Warnings:

  - You are about to drop the column `quality` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `variety` on the `item` table. All the data in the column will be lost.
  - You are about to alter the column `type` on the `item` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(3))`.
  - You are about to drop the column `officialreceiptno` on the `purchase` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerUnit` on the `purchaseitem` table. All the data in the column will be lost.
  - You are about to drop the `inventory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `quantity` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitprice` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frommilling` to the `Sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Sales` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `inventory` DROP FOREIGN KEY `Inventory_inventoryid_fkey`;

-- AlterTable
ALTER TABLE `item` DROP COLUMN `quality`,
    DROP COLUMN `variety`,
    ADD COLUMN `quantity` INTEGER NOT NULL,
    ADD COLUMN `unitprice` DOUBLE NOT NULL,
    MODIFY `type` ENUM('bigas', 'palay', 'resico') NOT NULL;

-- AlterTable
ALTER TABLE `purchase` DROP COLUMN `officialreceiptno`,
    ADD COLUMN `status` ENUM('pending', 'paid', 'cancelled') NOT NULL;

-- AlterTable
ALTER TABLE `purchaseitem` DROP COLUMN `pricePerUnit`,
    ADD COLUMN `priceperkg` DOUBLE NULL,
    ADD COLUMN `priceperunit` DOUBLE NULL,
    ADD COLUMN `quality` VARCHAR(50) NULL,
    ADD COLUMN `variety` VARCHAR(50) NULL,
    MODIFY `quantity` INTEGER NULL;

-- AlterTable
ALTER TABLE `sales` ADD COLUMN `frommilling` BOOLEAN NOT NULL,
    ADD COLUMN `status` ENUM('pending', 'paid', 'cancelled') NOT NULL;

-- DropTable
DROP TABLE `inventory`;

-- CreateTable
CREATE TABLE `ItemImage` (
    `ImageID` INTEGER NOT NULL AUTO_INCREMENT,
    `itemid` INTEGER NOT NULL,
    `imageurl` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`ImageID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ItemImage` ADD CONSTRAINT `ItemImage_ImageID_fkey` FOREIGN KEY (`ImageID`) REFERENCES `Item`(`itemid`) ON DELETE RESTRICT ON UPDATE CASCADE;
