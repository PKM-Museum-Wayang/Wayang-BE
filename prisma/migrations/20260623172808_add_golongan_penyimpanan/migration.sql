/*
  Warnings:

  - Added the required column `golonganId` to the `Wayang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penyimpananId` to the `Wayang` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `wayang` ADD COLUMN `golonganId` INTEGER NOT NULL,
    ADD COLUMN `penyimpananId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Golongan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaGolongan` VARCHAR(191) NOT NULL,
    `tipeGolongan` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Penyimpanan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaKotak` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Wayang` ADD CONSTRAINT `Wayang_golonganId_fkey` FOREIGN KEY (`golonganId`) REFERENCES `Golongan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wayang` ADD CONSTRAINT `Wayang_penyimpananId_fkey` FOREIGN KEY (`penyimpananId`) REFERENCES `Penyimpanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
