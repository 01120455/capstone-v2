/*
  Warnings:

  - The primary key for the `itemimage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Imageid` on the `itemimage` table. All the data in the column will be lost.
  - Added the required column `imageid` to the `ItemImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `itemimage` DROP FOREIGN KEY `ItemImage_Imageid_fkey`;

-- AlterTable
ALTER TABLE `itemimage` DROP PRIMARY KEY,
    DROP COLUMN `Imageid`,
    ADD COLUMN `imageid` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`imageid`);

-- AddForeignKey
ALTER TABLE `ItemImage` ADD CONSTRAINT `ItemImage_imageid_fkey` FOREIGN KEY (`imageid`) REFERENCES `Item`(`itemid`) ON DELETE RESTRICT ON UPDATE CASCADE;
