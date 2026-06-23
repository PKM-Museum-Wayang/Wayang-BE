/*
  Warnings:

  - A unique constraint covering the columns `[noWayang]` on the table `Wayang` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `noWayang` to the `Wayang` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `wayang` ADD COLUMN `noWayang` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Wayang_noWayang_key` ON `Wayang`(`noWayang`);
