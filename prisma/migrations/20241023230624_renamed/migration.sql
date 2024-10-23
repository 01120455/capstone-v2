/*
  Warnings:

  - You are about to drop the column `recentlydelete` on the `documentnumber` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `documentnumber` DROP COLUMN `recentlydelete`,
    ADD COLUMN `recentdelete` BOOLEAN NOT NULL DEFAULT false;
