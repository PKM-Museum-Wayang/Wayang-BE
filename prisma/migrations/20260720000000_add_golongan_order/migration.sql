-- Isi urutan data lama tanpa bergantung pada ID/urutan insert.
-- Golongan di luar daftar baku ditempatkan setelah barisan baku.
ALTER TABLE `Golongan` ADD COLUMN `order` INTEGER NOT NULL DEFAULT 9999;

UPDATE `Golongan`
SET `order` = CASE
  WHEN `tipeGolongan` = 'SIMPINGAN_KIRI' THEN CASE `namaGolongan`
    WHEN 'Ringgit Raton' THEN 1
    WHEN 'Ringgit Raja Sabrang' THEN 2
    WHEN 'Ringgit Gagahan' THEN 3
    WHEN 'Ringgit Katongan' THEN 4
    WHEN 'Ringgit Sabrang Alus' THEN 5
    WHEN 'Ringgit Lanyapan' THEN 6
    WHEN 'Ringgit Putran' THEN 7
    ELSE 9999 END
  WHEN `tipeGolongan` = 'SIMPINGAN_KANAN' THEN CASE `namaGolongan`
    WHEN 'Ringgit Raton' THEN 1
    WHEN 'Ringgit Gagahan' THEN 2
    WHEN 'Ringgit Alus' THEN 3
    WHEN 'Ringgit Bambang Bokongan' THEN 4
    WHEN 'Ringgit Bambang Jangkah' THEN 5
    WHEN 'Ringgit Putren' THEN 6
    WHEN 'Ringgit Bayen' THEN 7
    WHEN 'Ringgit Kayon' THEN 8
    ELSE 9999 END
  WHEN `tipeGolongan` = 'DUDHAHAN' THEN CASE `namaGolongan`
    WHEN 'Ringgit Kurawa' THEN 1
    WHEN 'Ringgit Patih' THEN 2
    WHEN 'Ringgit Bapangan' THEN 3
    WHEN 'Ringgit Bala Sabrang' THEN 4
    WHEN 'Ringgit Prepat' THEN 5
    WHEN 'Ringgit Keparak' THEN 6
    WHEN 'Ringgit Berkasaan Pasetran' THEN 7
    WHEN 'Ringgit Berkasan' THEN 7
    WHEN 'Ringgit Kewanan' THEN 8
    WHEN 'Ringgit Setanan' THEN 9
    WHEN 'Ringgit Wanara' THEN 10
    WHEN 'Ringgit Denawa Lekapala' THEN 11
    WHEN 'Ringgit Jenawa Lekapala' THEN 11
    WHEN 'Ringgit Denawa Pringgodani' THEN 12
    WHEN 'Ringgit Jenawa Pringgodani' THEN 12
    WHEN 'Ringgit Denawa Ngalengka' THEN 13
    WHEN 'Ringgit Kiskenda' THEN 14
    ELSE 9999 END
  ELSE 9999
END;

-- Order wajib diisi secara eksplisit untuk insert berikutnya.
ALTER TABLE `Golongan` ALTER COLUMN `order` DROP DEFAULT;
CREATE INDEX `Golongan_tipeGolongan_order_idx` ON `Golongan`(`tipeGolongan`, `order`);
