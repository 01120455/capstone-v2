/*
  Warnings:

  - You are about to drop the column `type` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `transactionitem` table. All the data in the column will be lost.
  - Added the required column `transactiontype` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemtype` to the `TransactionItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transaction` DROP COLUMN `type`,
    ADD COLUMN `transactiontype` ENUM('purchase', 'sales') NOT NULL;

-- AlterTable
ALTER TABLE `transactionitem` DROP COLUMN `type`,
    ADD COLUMN `itemtype` ENUM('bigas', 'palay', 'resico') NOT NULL;
