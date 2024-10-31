-- AlterTable
ALTER TABLE `user` ADD COLUMN `resettoken` VARCHAR(191) NULL,
    ADD COLUMN `resettokenexpires` DATETIME(3) NULL;
