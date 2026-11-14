jest.mock('../database/database.service', () => ({ DatabaseService: class {} }));

import { PeminjamanService } from './peminjaman.service';
import type { DatabaseService } from '../database/database.service';

describe('Ketersediaan peminjaman', () => {
  beforeEach(() => jest.useFakeTimers().setSystemTime(new Date('2026-06-10T12:00:00Z')));
  afterEach(() => jest.useRealTimers());

  const date = (day: number) => new Date(`2026-06-${String(day).padStart(2, '0')}T00:00:00Z`);

  function setup(loan: { wayangId: number | null; penyimpananId: number | null; start: Date; end: Date; status: string }) {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 1 }]),
      wayang: { findUnique: jest.fn().mockResolvedValue({ id: 2, penyimpananId: 1 }) },
      logPeminjaman: {
        findFirst: jest.fn(async ({ where }) => {
          const dateRules = where.AND[0].OR;
          const targets = where.AND[1].OR;
          const datesMatch = loan.end >= dateRules[0].tanggalKembali.gte || loan.end < dateRules[1].tanggalKembali.lt;
          const targetMatches = targets.some((target: any) =>
            target.wayangId === loan.wayangId && loan.wayangId !== null ||
            target.penyimpananId === loan.penyimpananId && loan.penyimpananId !== null ||
            target.wayang?.penyimpananId === 1 && loan.wayangId === 2,
          );
          return loan.status === where.status && loan.start <= where.tanggalPinjam.lte && datesMatch && targetMatches ? loan : null;
        }),
      },
    };
    const service = new PeminjamanService({} as DatabaseService);
    return { tx, check: (wayangId: number | null, kotakId: number | null, start: number, end: number) =>
      service['checkAvailability'](tx as never, wayangId, kotakId, date(start), date(end)) };
  }

  it('menolak wayang yang belum dikembalikan setelah jatuh tempo', async () => {
    const { check } = setup({ wayangId: 2, penyimpananId: null, start: date(1), end: date(5), status: 'DIPINJAM' });
    await expect(check(2, null, 12, 13)).rejects.toThrow('WAYANG_UNAVAILABLE');
    await expect(check(null, 1, 12, 13)).rejects.toThrow('PENYIMPANAN_UNAVAILABLE');
  });

  it('menolak wayang dalam kotak yang terlambat dikembalikan', async () => {
    const { check } = setup({ wayangId: null, penyimpananId: 1, start: date(1), end: date(5), status: 'DIPINJAM' });
    await expect(check(2, null, 12, 13)).rejects.toThrow('WAYANG_UNAVAILABLE');
  });

  it('tetap mengizinkan jadwal yang tidak bertabrakan dan menolak yang bertabrakan', async () => {
    const { check } = setup({ wayangId: 2, penyimpananId: null, start: date(12), end: date(14), status: 'DIPINJAM' });
    await expect(check(2, null, 15, 16)).resolves.toBeUndefined();
    await expect(check(2, null, 13, 15)).rejects.toThrow('WAYANG_UNAVAILABLE');
  });

  it('mengizinkan peminjaman setelah barang dikembalikan', async () => {
    const { check } = setup({ wayangId: 2, penyimpananId: null, start: date(1), end: date(5), status: 'DIKEMBALIKAN' });
    await expect(check(2, null, 12, 13)).resolves.toBeUndefined();
  });
});
