-- DropForeignKey
ALTER TABLE `MediaWayang` DROP FOREIGN KEY `MediaWayang_wayangId_fkey`;

-- DropIndex
DROP INDEX `MediaWayang_wayangId_fkey` ON `MediaWayang`;

-- AddForeignKey
ALTER TABLE `MediaWayang` ADD CONSTRAINT `MediaWayang_wayangId_fkey` FOREIGN KEY (`wayangId`) REFERENCES `Wayang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
