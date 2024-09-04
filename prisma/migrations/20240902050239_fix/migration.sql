/*
  Warnings:

  - The values [bags25kg,cavans50kg] on the enum `Item_sackweight` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `item` MODIFY `sackweight` ENUM('bag25kg', 'cavan50kg') NOT NULL;
