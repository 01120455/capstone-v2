/*
  Warnings:

  - You are about to drop the column `frommilling` on the `sales` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `purchase` ADD COLUMN `frommilling` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `updatedby` INTEGER NULL;

-- AlterTable
ALTER TABLE `sales` DROP COLUMN `frommilling`;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_updatedby_fkey` FOREIGN KEY (`updatedby`) REFERENCES `User`(`userid`) ON DELETE SET NULL ON UPDATE CASCADE;
