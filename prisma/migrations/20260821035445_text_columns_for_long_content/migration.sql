-- AlterTable
ALTER TABLE `LogKelola` MODIFY `pesan` TEXT NULL;

-- AlterTable
ALTER TABLE `LogPeminjaman` MODIFY `keterangan` TEXT NULL;

-- AlterTable
ALTER TABLE `MediaWayang` MODIFY `keterangan` TEXT NULL;

-- AlterTable
ALTER TABLE `Wayang` MODIFY `deskripsi` TEXT NULL,
    MODIFY `cerita` TEXT NULL;
