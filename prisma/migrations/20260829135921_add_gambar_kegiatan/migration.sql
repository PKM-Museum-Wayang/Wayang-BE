/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Kegiatan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Kegiatan` DROP COLUMN `imageUrl`;

-- CreateTable
CREATE TABLE `GambarKegiatan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileUrl` VARCHAR(191) NOT NULL,
    `kegiatanId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GambarKegiatan` ADD CONSTRAINT `GambarKegiatan_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `Kegiatan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
