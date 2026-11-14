jest.mock('../database/database.service', () => ({ DatabaseService: class {} }));

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

describe('Nomor urut dalam kotak', () => {
  it('mengunci kotak dan memakai nomor terbesar meskipun ada data yang dihapus', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      wayang: { findMany: jest.fn().mockResolvedValue([
        { noWayang: 'PY 01 KI 3 - 1' },
        { noWayang: 'PY 01 KI 3 - 3' },
      ]) },
    };
    const service = new WayangService({} as DatabaseService);
    await expect(service['nextNumber'](tx, 3)).resolves.toBe(4);
    expect(tx.$queryRaw).toHaveBeenCalled();
    expect(tx.wayang.findMany).toHaveBeenCalledWith({
      where: { penyimpananId: 3 }, select: { noWayang: true },
    });
  });
});
