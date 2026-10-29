import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PesanKontakService } from './pesan-kontak.service';

const input = {
  namaLengkap: 'Budi Santoso',
  asal: 'Yogyakarta',
  email: 'budi@example.com',
  noTelp: '081234567890',
  jenisTopik: 'KUNJUNGAN',
  pesan: 'Saya ingin berkunjung.',
};

describe('PesanKontakService', () => {
  const pesanKontak = {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  let service: PesanKontakService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new PesanKontakService({ pesanKontak } as unknown as DatabaseService);
    pesanKontak.create.mockResolvedValue({ id: 1 });
    pesanKontak.findMany.mockResolvedValue([{ id: 1, ...input }]);
    pesanKontak.count.mockResolvedValue(1);
    pesanKontak.findUnique.mockResolvedValue({ id: 1, ...input });
    pesanKontak.update.mockImplementation(({ data }) => Promise.resolve({ id: 1, ...input, ...data }));
    pesanKontak.delete.mockResolvedValue({ id: 1, ...input });
  });

  it('menyimpan pesan dan hanya mengembalikan ID kepada pengirim', async () => {
    expect(await service.create({ ...input, namaLengkap: ' Budi Santoso ' })).toEqual({ id: 1 });
    expect(pesanKontak.create).toHaveBeenCalledWith({ data: input, select: { id: true } });
  });

  it.each(['KUNJUNGAN', 'PENELITIAN', 'KERJA_SAMA', 'DONASI_KOLEKSI', 'LAINNYA'])(
    'menerima jenis topik %s', async (jenisTopik) => {
      await service.create({ ...input, jenisTopik });
      expect(pesanKontak.create).toHaveBeenCalledWith(expect.objectContaining({ data: { ...input, jenisTopik } }));
    },
  );

  it.each([
    { ...input, jenisTopik: 'LAINYA' },
    { ...input, email: 'bukan-email' },
    { ...input, noTelp: '0812-1234' },
    { ...input, pesan: '   ' },
    { ...input, asal: '' },
    { ...input, id: 1 },
  ])('menolak data yang tidak valid', async (invalid) => {
    await expect(service.create(invalid)).rejects.toThrow(BadRequestException);
    expect(pesanKontak.create).not.toHaveBeenCalled();
  });

  it('membatasi daftar, mengurutkan terbaru, dan memfilter topik', async () => {
    const result = await service.findAll({ page: '2', limit: '5', jenisTopik: 'PENELITIAN' });
    expect(pesanKontak.findMany).toHaveBeenCalledWith({
      where: { jenisTopik: 'PENELITIAN' },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 5,
      take: 5,
    });
    expect(pesanKontak.count).toHaveBeenCalledWith({ where: { jenisTopik: 'PENELITIAN' } });
    expect(result.pagination).toEqual({ page: 2, limit: 5, total: 1, totalPages: 1 });
  });

  it('menggunakan pagination default', async () => {
    const result = await service.findAll({});
    expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
  });

  it.each([{ page: '0' }, { page: '1.5' }, { limit: '101' }, { jenisTopik: 'lainnya' }, { extra: 'x' }])(
    'menolak query tidak valid', async (query) => {
      await expect(service.findAll(query)).rejects.toThrow(BadRequestException);
    },
  );

  it('mengambil detail dan mengembalikan 404 jika tidak ada', async () => {
    expect(await service.findOne(1)).toEqual({ id: 1, ...input });
    pesanKontak.findUnique.mockResolvedValueOnce(null);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
  });

  it('memperbarui sebagian data', async () => {
    await service.update(1, { jenisTopik: 'KERJA_SAMA' });
    expect(pesanKontak.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { jenisTopik: 'KERJA_SAMA' } });
  });

  it('menolak update kosong dan field tidak dikenal', async () => {
    await expect(service.update(1, {})).rejects.toThrow(BadRequestException);
    await expect(service.update(1, { status: 'dibaca' })).rejects.toThrow(BadRequestException);
    expect(pesanKontak.update).not.toHaveBeenCalled();
  });

  it('menghapus pesan', async () => {
    await service.remove(1);
    expect(pesanKontak.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('mengubah P2025 menjadi 404 pada update dan delete', async () => {
    pesanKontak.update.mockRejectedValueOnce({ code: 'P2025' });
    pesanKontak.delete.mockRejectedValueOnce({ code: 'P2025' });
    await expect(service.update(99, { asal: 'Solo' })).rejects.toThrow(NotFoundException);
    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
  });
});
