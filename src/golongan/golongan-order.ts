// Nomor tetap dalam setiap tipe, tidak bergantung pada ID atau urutan insert.
export const GOLONGAN_ORDER = [
  { tipeGolongan: 'SIMPINGAN_KIRI', namaGolongan: 'Ringgit Raton', order: 1 },
  { tipeGolongan: 'SIMPINGAN_KIRI', namaGolongan: 'Ringgit Raja Sabrang', order: 2 },
  { tipeGolongan: 'SIMPINGAN_KIRI', namaGolongan: 'Ringgit Gagahan', order: 3 },
  { tipeGolongan: 'SIMPINGAN_KIRI', namaGolongan: 'Ringgit Katongan', order: 4 },
  { tipeGolongan: 'SIMPINGAN_KIRI', namaGolongan: 'Ringgit Sabrang Alus', order: 5 },
  { tipeGolongan: 'SIMPINGAN_KIRI', namaGolongan: 'Ringgit Lanyapan', order: 6 },
  { tipeGolongan: 'SIMPINGAN_KIRI', namaGolongan: 'Ringgit Putran', order: 7 },
  { tipeGolongan: 'SIMPINGAN_KANAN', namaGolongan: 'Ringgit Raton', order: 1 },
  { tipeGolongan: 'SIMPINGAN_KANAN', namaGolongan: 'Ringgit Gagahan', order: 2 },
  { tipeGolongan: 'SIMPINGAN_KANAN', namaGolongan: 'Ringgit Alus', order: 3 },
  { tipeGolongan: 'SIMPINGAN_KANAN', namaGolongan: 'Ringgit Bambang Bokongan', order: 4 },
  { tipeGolongan: 'SIMPINGAN_KANAN', namaGolongan: 'Ringgit Bambang Jangkah', order: 5 },
  { tipeGolongan: 'SIMPINGAN_KANAN', namaGolongan: 'Ringgit Putren', order: 6 },
  { tipeGolongan: 'SIMPINGAN_KANAN', namaGolongan: 'Ringgit Bayen', order: 7 },
  { tipeGolongan: 'SIMPINGAN_KANAN', namaGolongan: 'Ringgit Kayon', order: 8 },
  { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Kurawa', order: 1 },
  { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Patih', order: 2 },
  { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Bapangan', order: 3 },
  { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Bala Sabrang', order: 4 },
  { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Prepat', order: 5 },
  { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Keparak', order: 6 },
  { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Berkasaan Pasetran', order: 7 },
  { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Kewanan', order: 8 },
  { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Setanan', order: 9 },
  { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Wanara', order: 10 },
  { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Denawa Lekapala', order: 11 },
  { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Denawa Pringgodani', order: 12 },
  { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Denawa Ngalengka', order: 13 },
  { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Kiskenda', order: 14 },
] as const;

export const LEGACY_GOLONGAN_NAMES: Record<string, string> = {
  'Ringgit Berkasan': 'Ringgit Berkasaan Pasetran',
  'Ringgit Jenawa Lekapala': 'Ringgit Denawa Lekapala',
  'Ringgit Jenawa Pringgodani': 'Ringgit Denawa Pringgodani',
};

export function resolveGolonganOrder(
  namaGolongan: string,
  tipeGolongan: string,
  order?: number,
): number {
  const canonicalName = LEGACY_GOLONGAN_NAMES[namaGolongan] ?? namaGolongan;
  const fixed = GOLONGAN_ORDER.find(
    (item) =>
      item.tipeGolongan === tipeGolongan &&
      item.namaGolongan.toLowerCase() === canonicalName.toLowerCase(),
  );

  if (order !== undefined && (!Number.isInteger(order) || order < 1)) {
    throw new Error('INVALID_GOLONGAN_ORDER');
  }
  if (fixed) {
    if (order !== undefined && order !== fixed.order) {
      throw new Error('INVALID_GOLONGAN_ORDER');
    }
    return fixed.order;
  }

  // Golongan tambahan hanya boleh ditempatkan setelah barisan baku.
  const lastOrder = Math.max(
    0,
    ...GOLONGAN_ORDER.filter((item) => item.tipeGolongan === tipeGolongan).map(
      (item) => item.order,
    ),
  );
  if (order === undefined || order <= lastOrder) {
    throw new Error('INVALID_GOLONGAN_ORDER');
  }
  return order;
}
