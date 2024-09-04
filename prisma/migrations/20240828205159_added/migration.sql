-- AlterTable
ALTER TABLE `purchase` ADD COLUMN `purchasedeleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `purchaseitem` ADD COLUMN `purchaseitemdeleted` BOOLEAN NOT NULL DEFAULT false;
