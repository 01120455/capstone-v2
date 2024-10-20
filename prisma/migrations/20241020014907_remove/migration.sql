/*
  Warnings:

  - You are about to drop the column `criticallevel` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `reorderlevel` on the `item` table. All the data in the column will be lost.
  - Added the required column `sackweight` to the `TransactionItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `TransactionItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Transaction_entityid_fkey` ON `transaction`;

-- AlterTable
ALTER TABLE `item` DROP COLUMN `criticallevel`,
    DROP COLUMN `reorderlevel`;

-- AlterTable
ALTER TABLE `transactionitem` ADD COLUMN `sackweight` ENUM('bag25kg', 'cavan50kg') NOT NULL,
    ADD COLUMN `type` ENUM('bigas', 'palay', 'resico') NOT NULL;
