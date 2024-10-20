/*
  Warnings:

  - You are about to drop the column `invoicenumberid` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `taxamount` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `taxpercentage` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the `entity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `entityrole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invoicenumber` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `entity` DROP FOREIGN KEY `Entity_lastmodifiedby_fkey`;

-- DropForeignKey
ALTER TABLE `entityrole` DROP FOREIGN KEY `EntityRole_entityid_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_entityid_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `Transaction_invoicenumberid_fkey`;

-- AlterTable
ALTER TABLE `transaction` DROP COLUMN `invoicenumberid`,
    DROP COLUMN `taxamount`,
    DROP COLUMN `taxpercentage`,
    ADD COLUMN `documentnumberid` INTEGER NULL;

-- DropTable
DROP TABLE `entity`;

-- DropTable
DROP TABLE `entityrole`;

-- DropTable
DROP TABLE `invoicenumber`;

-- CreateTable
CREATE TABLE `DocumentNumber` (
    `documentnumberid` INTEGER NOT NULL AUTO_INCREMENT,
    `documentnumber` VARCHAR(30) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `DocumentNumber_documentnumber_key`(`documentnumber`),
    PRIMARY KEY (`documentnumberid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_documentnumberid_fkey` FOREIGN KEY (`documentnumberid`) REFERENCES `DocumentNumber`(`documentnumberid`) ON DELETE SET NULL ON UPDATE CASCADE;
