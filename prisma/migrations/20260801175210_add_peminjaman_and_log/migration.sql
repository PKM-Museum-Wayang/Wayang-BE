/*
  Warnings:

  - You are about to drop the column `jenisMedia` on the `mediawayang` table. All the data in the column will be lost.
  - You are about to drop the column `judul` on the `mediawayang` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[namaGolongan,tipeGolongan]` on the table `Golongan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jenis` to the `MediaWayang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namaFile` to the `MediaWayang` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Golongan_tipeGolongan_namaGolongan_key` ON `golongan`;

-- AlterTable
ALTER TABLE `mediawayang` DROP COLUMN `jenisMedia`,
    DROP COLUMN `judul`,
    ADD COLUMN `jenis` VARCHAR(191) NOT NULL,
    ADD COLUMN `namaFile` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Peminjam` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaPeminjam` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `noHp` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogPeminjaman` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `peminjamId` INTEGER NOT NULL,
    `wayangId` INTEGER NOT NULL,
    `tanggalPinjam` DATETIME(3) NOT NULL,
    `tanggalKembali` DATETIME(3) NULL,
    `keterangan` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,

    INDEX `LogPeminjaman_peminjamId_idx`(`peminjamId`),
    INDEX `LogPeminjaman_wayangId_idx`(`wayangId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogKelola` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adminId` INTEGER NOT NULL,
    `wayangId` INTEGER NOT NULL,
    `pesan` VARCHAR(191) NULL,

    INDEX `LogKelola_adminId_idx`(`adminId`),
    INDEX `LogKelola_wayangId_idx`(`wayangId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Golongan_namaGolongan_tipeGolongan_key` ON `Golongan`(`namaGolongan`, `tipeGolongan`);

-- AddForeignKey
ALTER TABLE `LogPeminjaman` ADD CONSTRAINT `LogPeminjaman_peminjamId_fkey` FOREIGN KEY (`peminjamId`) REFERENCES `Peminjam`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogPeminjaman` ADD CONSTRAINT `LogPeminjaman_wayangId_fkey` FOREIGN KEY (`wayangId`) REFERENCES `Wayang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogKelola` ADD CONSTRAINT `LogKelola_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogKelola` ADD CONSTRAINT `LogKelola_wayangId_fkey` FOREIGN KEY (`wayangId`) REFERENCES `Wayang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
