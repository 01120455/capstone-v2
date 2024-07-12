/*
  Warnings:

  - You are about to drop the column `imageurl` on the `itemimage` table. All the data in the column will be lost.
  - Added the required column `imagepath` to the `ItemImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `itemimage` DROP COLUMN `imageurl`,
    ADD COLUMN `imagepath` VARCHAR(191) NOT NULL;
