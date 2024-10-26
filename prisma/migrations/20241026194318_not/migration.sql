/*
  Warnings:

  - Made the column `stock` on table `item` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stock` on table `transactionitem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `item` MODIFY `stock` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `transactionitem` MODIFY `stock` DOUBLE NOT NULL;
