/*
  Warnings:

  - You are about to drop the column `deleted` on the `documentnumber` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `transactionitem` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `documentnumber` DROP COLUMN `deleted`,
    ADD COLUMN `recentlydelete` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `item` DROP COLUMN `deleted`,
    ADD COLUMN `recentdelete` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `transaction` DROP COLUMN `deleted`,
    ADD COLUMN `recentdelete` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `transactionitem` DROP COLUMN `deleted`,
    ADD COLUMN `recentdelete` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `deleted`,
    ADD COLUMN `createdat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `recentdelete` BOOLEAN NOT NULL DEFAULT false;
