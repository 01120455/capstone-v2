/*
  Warnings:

  - You are about to drop the column `amount` on the `transactionitem` table. All the data in the column will be lost.
  - Added the required column `totalamount` to the `TransactionItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transactionitem` DROP COLUMN `amount`,
    ADD COLUMN `totalamount` DOUBLE NOT NULL;
