-- DropForeignKey
ALTER TABLE `itemimage` DROP FOREIGN KEY `ItemImage_imageid_fkey`;

-- AddForeignKey
ALTER TABLE `ItemImage` ADD CONSTRAINT `ItemImage_itemid_fkey` FOREIGN KEY (`itemid`) REFERENCES `Item`(`itemid`) ON DELETE RESTRICT ON UPDATE CASCADE;
