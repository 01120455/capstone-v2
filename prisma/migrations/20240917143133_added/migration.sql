/*
  Warnings:

  - You are about to drop the column `type` on the `entity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `entity` DROP COLUMN `type`;

-- CreateTable
CREATE TABLE `EntityRole` (
    `roleid` INTEGER NOT NULL AUTO_INCREMENT,
    `entityid` INTEGER NOT NULL,
    `role` ENUM('customer', 'supplier') NOT NULL,

    PRIMARY KEY (`roleid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EntityRole` ADD CONSTRAINT `EntityRole_entityid_fkey` FOREIGN KEY (`entityid`) REFERENCES `Entity`(`entityid`) ON DELETE RESTRICT ON UPDATE CASCADE;
