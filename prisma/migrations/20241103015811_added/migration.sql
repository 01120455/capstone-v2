-- AlterTable
ALTER TABLE `item` MODIFY `sackweight` ENUM('bag5kg', 'bag10kg', 'bag25kg', 'cavan50kg') NOT NULL;

-- AlterTable
ALTER TABLE `transactionitem` MODIFY `sackweight` ENUM('bag5kg', 'bag10kg', 'bag25kg', 'cavan50kg') NOT NULL;
