-- DropForeignKey
ALTER TABLE `purchase` DROP FOREIGN KEY `Purchase_purchaseid_fkey`;

-- DropForeignKey
ALTER TABLE `purchaseitem` DROP FOREIGN KEY `PurchaseItem_purchaseitemid_fkey`;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_userid_fkey` FOREIGN KEY (`userid`) REFERENCES `User`(`userid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseItem` ADD CONSTRAINT `PurchaseItem_purchaseid_fkey` FOREIGN KEY (`purchaseid`) REFERENCES `Purchase`(`purchaseid`) ON DELETE RESTRICT ON UPDATE CASCADE;
