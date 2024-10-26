/*
  Warnings:

  - You are about to drop the column `stock` on the `item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `item` DROP COLUMN `stock`,
    ADD COLUMN `stock` DOUBLE NULL;
