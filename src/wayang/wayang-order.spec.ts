import { WayangService } from './wayang.service';
import type { DatabaseService } from '../database/database.service';

describe('Urutan golongan pada nomor wayang', () => {
  it('menggunakan order tersimpan, bukan ID atau posisi hasil query', async () => {
    const db = {
      golongan: {
        findUnique: jest.fn().mockResolvedValue({
          tipeGolongan: 'DUDHAHAN',
          order: 13,
        }),
      },
    };
    const service = new WayangService(db as unknown as DatabaseService);

    await expect(
      service['getUrutanGolongan'](999, 'DUDHAHAN'),
    ).resolves.toBe(13);
    expect(db.golongan.findUnique).toHaveBeenCalledWith({
      where: { id: 999 },
      select: { tipeGolongan: true, order: true },
    });
  });

  it('menolak golongan dari tipe yang tidak sesuai', async () => {
    const db = {
      golongan: {
        findUnique: jest.fn().mockResolvedValue({
          tipeGolongan: 'SIMPINGAN_KIRI',
          order: 3,
        }),
      },
    };
    const service = new WayangService(db as unknown as DatabaseService);
    await expect(
      service['getUrutanGolongan'](999, 'DUDHAHAN'),
    ).rejects.toThrow('GOLONGAN_ORDER_NOT_FOUND');
  });
});
