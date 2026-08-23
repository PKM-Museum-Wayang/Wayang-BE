-- DropForeignKey
ALTER TABLE `logpeminjaman` DROP FOREIGN KEY `LogPeminjaman_wayangId_fkey`;

-- AlterTable
ALTER TABLE `logpeminjaman` ADD COLUMN `penyimpananId` INTEGER NULL,
    MODIFY `wayangId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `LogPeminjaman_penyimpananId_idx` ON `LogPeminjaman`(`penyimpananId`);

-- AddForeignKey
ALTER TABLE `LogPeminjaman` ADD CONSTRAINT `LogPeminjaman_wayangId_fkey` FOREIGN KEY (`wayangId`) REFERENCES `Wayang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogPeminjaman` ADD CONSTRAINT `LogPeminjaman_penyimpananId_fkey` FOREIGN KEY (`penyimpananId`) REFERENCES `Penyimpanan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
