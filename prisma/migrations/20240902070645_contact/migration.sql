/*
  Warnings:

  - You are about to alter the column `firstname` on the `entity` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(25)`.
  - You are about to alter the column `middlename` on the `entity` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(25)`.
  - You are about to alter the column `lastname` on the `entity` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(25)`.
  - You are about to alter the column `invoicenumber` on the `invoicenumber` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(30)`.
  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(30)`.
  - A unique constraint covering the columns `[contactnumber]` on the table `Entity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Entity` table without a default value. This is not possible if the table is not empty.
  - Made the column `contactnumber` on table `entity` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `entity` ADD COLUMN `type` ENUM('customer', 'supplier') NOT NULL,
    MODIFY `firstname` VARCHAR(25) NOT NULL,
    MODIFY `middlename` VARCHAR(25) NULL,
    MODIFY `lastname` VARCHAR(25) NOT NULL,
    MODIFY `contactnumber` VARCHAR(15) NOT NULL;

-- AlterTable
ALTER TABLE `invoicenumber` MODIFY `invoicenumber` VARCHAR(30) NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` VARCHAR(30) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Entity_contactnumber_key` ON `Entity`(`contactnumber`);
