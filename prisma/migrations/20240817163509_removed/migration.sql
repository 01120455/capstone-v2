/*
  Warnings:

  - You are about to drop the column `quality` on the `purchaseitem` table. All the data in the column will be lost.
  - You are about to drop the column `variety` on the `purchaseitem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `purchaseitem` DROP COLUMN `quality`,
    DROP COLUMN `variety`;
