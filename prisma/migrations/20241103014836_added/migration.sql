/*
  Warnings:

  - Added the required column `status` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `item` ADD COLUMN `status` ENUM('active', 'inactive') NOT NULL;
