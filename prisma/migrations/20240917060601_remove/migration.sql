/*
  Warnings:

  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(30)` to `Enum(EnumId(0))`.

*/
-- DropIndex
DROP INDEX `Entity_contactnumber_key` ON `entity`;

-- AlterTable
ALTER TABLE `entity` MODIFY `contactnumber` VARCHAR(15) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('admin', 'manager', 'sales', 'inventory') NOT NULL;
