/*
  Warnings:

  - You are about to drop the column `totalamount` on the `transactionitem` table. All the data in the column will be lost.
  - Added the required column `amount` to the `TransactionItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transactionitem` DROP COLUMN `totalamount`,
    ADD COLUMN `amount` DOUBLE NOT NULL;
