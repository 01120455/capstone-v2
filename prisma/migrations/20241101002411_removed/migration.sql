/*
  Warnings:

  - You are about to drop the column `recentdelete` on the `documentnumber` table. All the data in the column will be lost.
  - You are about to drop the column `recentdelete` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `recentdelete` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `recentdelete` on the `transactionitem` table. All the data in the column will be lost.
  - You are about to drop the column `recentdelete` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `documentnumber` DROP COLUMN `recentdelete`;

-- AlterTable
ALTER TABLE `item` DROP COLUMN `recentdelete`;

-- AlterTable
ALTER TABLE `transaction` DROP COLUMN `recentdelete`;

-- AlterTable
ALTER TABLE `transactionitem` DROP COLUMN `recentdelete`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `recentdelete`;
