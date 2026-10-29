CREATE TABLE `PesanKontak` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaLengkap` VARCHAR(255) NOT NULL,
    `asal` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `noTelp` VARCHAR(20) NOT NULL,
    `jenisTopik` VARCHAR(20) NOT NULL,
    `pesan` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PesanKontak_createdAt_id_idx` (`createdAt`, `id`),
    INDEX `PesanKontak_jenisTopik_idx` (`jenisTopik`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
