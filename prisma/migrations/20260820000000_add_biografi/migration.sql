-- CreateTable
CREATE TABLE `Biografi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fotoProfil` VARCHAR(255) NOT NULL,
    `namaPemilikKoleksi` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `noWa` VARCHAR(20) NOT NULL,
    `alamat` TEXT NOT NULL,
    `hariMulai` VARCHAR(10) NOT NULL,
    `hariSelesai` VARCHAR(10) NOT NULL,
    `jamBuka` VARCHAR(5) NOT NULL,
    `jamTutup` VARCHAR(5) NOT NULL,
    `instagram` VARCHAR(2048) NULL,
    `facebook` VARCHAR(2048) NULL,
    `youtube` VARCHAR(2048) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
