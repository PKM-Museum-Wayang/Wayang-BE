import { GolonganService } from './golongan.service';
import { DatabaseService } from '../database/database.service';

describe('GolonganService', () => {
  const db = {
    golongan: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  let service: GolonganService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new GolonganService(db as unknown as DatabaseService);
    db.golongan.findMany.mockResolvedValue([]);
    db.golongan.count.mockResolvedValue(0);
  });

  it('mengurutkan dropdown berdasarkan tipe dan order, bukan nama/ID', async () => {
    await service.findAllWithoutPagination('SIMPINGAN_KIRI');
    expect(db.golongan.findMany).toHaveBeenCalledWith({
      where: { tipeGolongan: 'SIMPINGAN_KIRI' },
      select: { id: true, namaGolongan: true, tipeGolongan: true, order: true },
      orderBy: [{ tipeGolongan: 'asc' }, { order: 'asc' }, { id: 'asc' }],
    });
  });

  it('mengurutkan sebelum pagination', async () => {
    await service.findAll({ page: 2, limit: 5, tipeGolongan: 'DUDHAHAN' });
    expect(db.golongan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tipeGolongan: 'DUDHAHAN' },
        skip: 5,
        take: 5,
        orderBy: [{ tipeGolongan: 'asc' }, { order: 'asc' }, { id: 'asc' }],
      }),
    );
  });

  it('mengisi order baku saat create tanpa order', async () => {
    await service.create({
      namaGolongan: 'Ringgit Kewanan',
      tipeGolongan: 'DUDHAHAN',
    });
    expect(db.golongan.create).toHaveBeenCalledWith({
      data: {
        namaGolongan: 'Ringgit Kewanan',
        tipeGolongan: 'DUDHAHAN',
        order: 8,
      },
    });
  });

  it('menolak perubahan order baku', async () => {
    db.golongan.findUnique.mockResolvedValue({
      id: 99,
      namaGolongan: 'Ringgit Kewanan',
      tipeGolongan: 'DUDHAHAN',
      order: 8,
    });
    await expect(service.update(99, { order: 1 })).rejects.toThrow(
      'INVALID_GOLONGAN_ORDER',
    );
    expect(db.golongan.update).not.toHaveBeenCalled();
  });

  it('menghitung ulang order ketika tipe berubah', async () => {
    db.golongan.findUnique.mockResolvedValue({
      id: 42,
      namaGolongan: 'Ringgit Gagahan',
      tipeGolongan: 'SIMPINGAN_KIRI',
      order: 3,
    });
    await service.update(42, { tipeGolongan: 'SIMPINGAN_KANAN' });
    expect(db.golongan.update).toHaveBeenCalledWith({
      where: { id: 42 },
      data: {
        namaGolongan: 'Ringgit Gagahan',
        tipeGolongan: 'SIMPINGAN_KANAN',
        order: 2,
      },
    });
  });
});
