import { GOLONGAN_ORDER, resolveGolonganOrder } from './golongan-order';

describe('Urutan baku golongan', () => {
  it.each([
    ['SIMPINGAN_KIRI', 7],
    ['SIMPINGAN_KANAN', 8],
    ['DUDHAHAN', 14],
  ])('%s memiliki urutan lengkap 1 sampai %s', (tipeGolongan, count) => {
    const orders = GOLONGAN_ORDER.filter(
      (item) => item.tipeGolongan === tipeGolongan,
    ).map((item) => item.order);
    expect(orders).toEqual(Array.from({ length: Number(count) }, (_, i) => i + 1));
  });

  it('tidak bergantung pada urutan data seeder', () => {
    for (const item of [...GOLONGAN_ORDER].reverse()) {
      expect(resolveGolonganOrder(item.namaGolongan, item.tipeGolongan)).toBe(
        item.order,
      );
    }
  });

  it('memakai urutan berbeda untuk nama yang sama di tipe berbeda', () => {
    expect(resolveGolonganOrder('Ringgit Gagahan', 'SIMPINGAN_KIRI')).toBe(3);
    expect(resolveGolonganOrder('Ringgit Gagahan', 'SIMPINGAN_KANAN')).toBe(2);
  });

  it.each([0, -1, 1.5, NaN, '3', null, 2])(
    'menolak order tidak valid atau melanggar urutan baku: %s',
    (order) => {
      expect(() =>
        resolveGolonganOrder('Ringgit Gagahan', 'SIMPINGAN_KIRI', order as number),
      ).toThrow('INVALID_GOLONGAN_ORDER');
    },
  );

  it('mendukung nama lama dan menempatkan golongan tambahan setelah barisan baku', () => {
    expect(resolveGolonganOrder('Ringgit Jenawa Lekapala', 'DUDHAHAN')).toBe(11);
    expect(resolveGolonganOrder('Tambahan', 'DUDHAHAN', 15)).toBe(15);
    expect(() => resolveGolonganOrder('Tambahan', 'DUDHAHAN', 8)).toThrow(
      'INVALID_GOLONGAN_ORDER',
    );
  });
});
