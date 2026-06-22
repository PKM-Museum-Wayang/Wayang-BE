-- CreateTable
CREATE TABLE `Wayang` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `daerah` VARCHAR(191) NULL,
    `deskripsi` VARCHAR(191) NULL,
    `cerita` VARCHAR(191) NULL,
    `kondisi` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaWayang` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `jenisMedia` VARCHAR(191) NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `wayangId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MediaWayang` ADD CONSTRAINT `MediaWayang_wayangId_fkey` FOREIGN KEY (`wayangId`) REFERENCES `Wayang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
