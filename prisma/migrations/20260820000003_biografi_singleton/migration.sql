-- Simpan snapshot sebelum normalisasi agar seluruh biografi lama tetap dapat dipulihkan.
CREATE TABLE `BiografiBackupBeforeSingleton` LIKE `Biografi`;
INSERT INTO `BiografiBackupBeforeSingleton` SELECT * FROM `Biografi`;

-- Pertahankan ID terbesar, sesuai urutan profil utama pada API sebelumnya.
DELETE older FROM `Biografi` AS older
INNER JOIN `Biografi` AS newer ON older.`id` < newer.`id`;

-- Hapus AUTO_INCREMENT sebelum menambahkan batasan singleton.
ALTER TABLE `Biografi` MODIFY `id` INTEGER NOT NULL DEFAULT 1;
UPDATE `Biografi` SET `id` = 1;
ALTER TABLE `Biografi`
    ADD CONSTRAINT `Biografi_singleton_id` CHECK (`id` = 1);
