/*
  Warnings:

  - A unique constraint covering the columns `[tipeGolongan,namaGolongan]` on the table `Golongan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Golongan_tipeGolongan_namaGolongan_key` ON `Golongan`(`tipeGolongan`, `namaGolongan`);
