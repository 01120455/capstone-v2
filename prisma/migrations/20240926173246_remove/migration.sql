/*
  Warnings:

  - You are about to drop the column `firstname` on the `entity` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `entity` table. All the data in the column will be lost.
  - You are about to drop the column `middlename` on the `entity` table. All the data in the column will be lost.
  - Added the required column `name` to the `Entity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `entity` DROP COLUMN `firstname`,
    DROP COLUMN `lastname`,
    DROP COLUMN `middlename`,
    ADD COLUMN `name` VARCHAR(50) NOT NULL;
