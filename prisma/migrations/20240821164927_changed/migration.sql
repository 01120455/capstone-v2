/*
  Warnings:

  - You are about to drop the column `priceperkg` on the `purchaseitem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `purchaseitem` DROP COLUMN `priceperkg`,
    ADD COLUMN `priceperunit` DOUBLE NULL;
