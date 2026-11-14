jest.mock('../database/database.service', () => ({ DatabaseService: class {} }));

import { BadRequestException } from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';
import type { DatabaseService } from '../database/database.service';

describe('Filter tanggal kegiatan', () => {
  const db = {
    kegiatan: { count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]), groupBy: jest.fn().mockResolvedValue([]) },
    admin: { findMany: jest.fn().mockResolvedValue([]) },
  };
  const service = new KegiatanService(db as unknown as DatabaseService);
  beforeEach(() => jest.clearAllMocks());

  it('menerapkan batas awal inklusif dan akhir eksklusif bersama pencarian', async () => {
    await service.findAll({ search: 'wayang', tanggalMulai: '2026-05-31T17:00:00.000Z', tanggalSampai: '2026-06-02T17:00:00.000Z' });
    expect(db.kegiatan.count.mock.calls[0][0].where).toMatchObject({
      tanggal: { gte: new Date('2026-05-31T17:00:00.000Z'), lt: new Date('2026-06-02T17:00:00.000Z') },
      OR: [{ nama: { contains: 'wayang' } }, { lokasi: { contains: 'wayang' } }, { deskripsi: { contains: 'wayang' } }],
    });
  });

  it('mendukung batas tunggal dan menolak rentang atau tanggal yang tidak valid', async () => {
    await service.findAll({ tanggalSampai: '2026-06-02T17:00:00.000Z' });
    expect(db.kegiatan.count.mock.calls[0][0].where.tanggal).toEqual({ lt: new Date('2026-06-02T17:00:00.000Z') });
    await expect(service.findAll({ tanggalMulai: '2026-06-03T00:00:00.000Z', tanggalSampai: '2026-06-02T00:00:00.000Z' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.findAll({ tanggalMulai: '2026-02-30T00:00:00.000Z' })).rejects.toBeInstanceOf(BadRequestException);
  });
});
