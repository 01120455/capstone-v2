-- CreateTable
CREATE TABLE `User` (
    `UserID` INTEGER NOT NULL AUTO_INCREMENT,
    `FirstName` VARCHAR(25) NOT NULL,
    `MiddleName` VARCHAR(25) NULL,
    `LastName` VARCHAR(25) NOT NULL,
    `Role` VARCHAR(50) NOT NULL,
    `Status` ENUM('active', 'inactive') NOT NULL,

    PRIMARY KEY (`UserID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Username` (
    `Username` VARCHAR(50) NOT NULL,
    `UserID` INTEGER NOT NULL,
    `PasswordID` INTEGER NOT NULL,

    UNIQUE INDEX `Username_Username_key`(`Username`),
    PRIMARY KEY (`Username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Password` (
    `PasswordID` INTEGER NOT NULL AUTO_INCREMENT,
    `Password` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`PasswordID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `CustomerID` INTEGER NOT NULL AUTO_INCREMENT,
    `FirstName` VARCHAR(50) NOT NULL,
    `MiddleName` VARCHAR(50) NOT NULL,
    `LastName` VARCHAR(50) NOT NULL,
    `ContactNumber` INTEGER NOT NULL,

    PRIMARY KEY (`CustomerID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sales` (
    `SalesID` INTEGER NOT NULL AUTO_INCREMENT,
    `CustomerID` INTEGER NOT NULL,
    `UserID` INTEGER NOT NULL,
    `InvoiceNo` INTEGER NOT NULL,
    `Date` DATETIME(3) NOT NULL,
    `TotalAmount` DOUBLE NOT NULL,

    PRIMARY KEY (`SalesID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesItem` (
    `SalesItemID` INTEGER NOT NULL AUTO_INCREMENT,
    `SalesID` INTEGER NOT NULL,
    `ItemID` INTEGER NOT NULL,
    `InventoryId` INTEGER NULL,
    `Quantity` INTEGER NOT NULL,
    `Weight` DOUBLE NULL,
    `PricePerUnit` DOUBLE NULL,

    PRIMARY KEY (`SalesItemID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supplier` (
    `SupplierID` INTEGER NOT NULL AUTO_INCREMENT,
    `FirstName` VARCHAR(50) NOT NULL,
    `MiddleName` VARCHAR(50) NOT NULL,
    `LastName` VARCHAR(50) NOT NULL,
    `ContactNumber` INTEGER NOT NULL,

    PRIMARY KEY (`SupplierID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Purchase` (
    `PurchaseID` INTEGER NOT NULL AUTO_INCREMENT,
    `UserID` INTEGER NOT NULL,
    `SupplierID` INTEGER NOT NULL,
    `OfficialReceiptNo` INTEGER NULL,
    `Agent` VARCHAR(50) NULL,
    `Date` DATETIME(3) NOT NULL,
    `TotalAmount` DOUBLE NOT NULL,

    PRIMARY KEY (`PurchaseID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseItem` (
    `PurchaseItemID` INTEGER NOT NULL AUTO_INCREMENT,
    `PurchaseID` INTEGER NOT NULL,
    `itemID` INTEGER NOT NULL,
    `Quantity` INTEGER NOT NULL,
    `Weight` DOUBLE NULL,
    `PricePerUnit` DOUBLE NULL,

    PRIMARY KEY (`PurchaseItemID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `ItemID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(50) NULL,
    `Type` VARCHAR(50) NOT NULL,
    `Quality` VARCHAR(50) NULL,
    `Variety` VARCHAR(50) NULL,

    PRIMARY KEY (`ItemID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory` (
    `InventoryID` INTEGER NOT NULL AUTO_INCREMENT,
    `ItemID` INTEGER NOT NULL,
    `Quantity` INTEGER NOT NULL,
    `Acquisition` ENUM('Bought', 'Processed') NOT NULL,

    PRIMARY KEY (`InventoryID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Username` ADD CONSTRAINT `Username_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Username` ADD CONSTRAINT `Username_PasswordID_fkey` FOREIGN KEY (`PasswordID`) REFERENCES `Password`(`PasswordID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sales` ADD CONSTRAINT `Sales_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sales` ADD CONSTRAINT `Sales_CustomerID_fkey` FOREIGN KEY (`CustomerID`) REFERENCES `Customer`(`CustomerID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesItem` ADD CONSTRAINT `SalesItem_SalesID_fkey` FOREIGN KEY (`SalesID`) REFERENCES `Sales`(`SalesID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesItem` ADD CONSTRAINT `SalesItem_ItemID_fkey` FOREIGN KEY (`ItemID`) REFERENCES `Item`(`ItemID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_SupplierID_fkey` FOREIGN KEY (`SupplierID`) REFERENCES `Supplier`(`SupplierID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseItem` ADD CONSTRAINT `PurchaseItem_PurchaseID_fkey` FOREIGN KEY (`PurchaseID`) REFERENCES `Purchase`(`PurchaseID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseItem` ADD CONSTRAINT `PurchaseItem_itemID_fkey` FOREIGN KEY (`itemID`) REFERENCES `Item`(`ItemID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_ItemID_fkey` FOREIGN KEY (`ItemID`) REFERENCES `Item`(`ItemID`) ON DELETE RESTRICT ON UPDATE CASCADE;
