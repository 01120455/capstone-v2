/*
  Warnings:

  - Made the column `userid` on table `purchase` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `purchase` MODIFY `userid` INTEGER NOT NULL;
