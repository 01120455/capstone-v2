/*
  Warnings:

  - You are about to drop the column `measurementvalue` on the `item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `item` DROP COLUMN `measurementvalue`,
    ADD COLUMN `stock` DOUBLE NULL;
