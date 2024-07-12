/*
  Warnings:

  - The primary key for the `itemimage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ImageID` on the `itemimage` table. All the data in the column will be lost.
  - Added the required column `Imageid` to the `ItemImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `itemimage` DROP FOREIGN KEY `ItemImage_ImageID_fkey`;

-- AlterTable
ALTER TABLE `itemimage` DROP PRIMARY KEY,
    DROP COLUMN `ImageID`,
    ADD COLUMN `Imageid` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`Imageid`);

-- AddForeignKey
ALTER TABLE `ItemImage` ADD CONSTRAINT `ItemImage_Imageid_fkey` FOREIGN KEY (`Imageid`) REFERENCES `Item`(`itemid`) ON DELETE RESTRICT ON UPDATE CASCADE;
