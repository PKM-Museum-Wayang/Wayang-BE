import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { unlink, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { DatabaseService } from '../database/database.service';
import { BiografiService } from './biografi.service';

jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

const dto = {
  namaPemilikKoleksi: 'Pemilik',
  email: 'pemilik@example.com',
  phoneNumber: '081234567890',
  alamat: 'Yogyakarta',
  hariMulai: 'SENIN',
  hariSelesai: 'SABTU',
  jamBuka: '08:00',
  jamTutup: '17:00',
};
const existing = {
  id: 1,
  ...dto,
  fotoProfil: '/storage/biografi-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.webp',
  instagram: null,
  facebook: null,
  youtube: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('BiografiService singleton', () => {
  let service: BiografiService;
  let file: Express.Multer.File;
  const biografi = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    service = new BiografiService({ biografi } as unknown as DatabaseService);
    biografi.findUnique.mockResolvedValue(existing);
    biografi.create.mockImplementation(({ data }) => Promise.resolve({ ...existing, ...data }));
    biografi.update.mockImplementation(({ data }) => Promise.resolve({ ...existing, ...data }));
    biografi.delete.mockResolvedValue(existing);
    const buffer = await sharp({
      create: { width: 2, height: 2, channels: 3, background: 'white' },
    }).png().toBuffer();
    file = { buffer, size: buffer.length } as Express.Multer.File;
  });

  it('mengembalikan satu objek owner, bukan daftar', async () => {
    const result = await service.findOne();
    expect(result).toEqual(existing);
    expect(Array.isArray(result)).toBe(false);
    expect(biografi.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).not.toHaveProperty('noWa');
    expect(result).not.toHaveProperty('phonenumber');
  });

  it('mengembalikan 404 jika profil belum diisi', async () => {
    biografi.findUnique.mockResolvedValue(null);
    await expect(service.findOne()).rejects.toThrow(NotFoundException);
  });

  it('menolak pembuatan biografi kedua tanpa menyimpan foto', async () => {
    await expect(service.create(dto, file)).rejects.toThrow(ConflictException);
    expect(biografi.create).not.toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('mewajibkan foto saat pengisian awal', async () => {
    biografi.findUnique.mockResolvedValue(null);
    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    expect(biografi.create).not.toHaveBeenCalled();
  });

  it('membuat biografi dengan ID tetap 1 dan foto WebP', async () => {
    biografi.findUnique.mockResolvedValue(null);
    const result = await service.create(dto, file);
    expect(result.fotoProfil).toMatch(/^\/storage\/biografi-.*\.webp$/);
    expect(biografi.create).toHaveBeenCalledWith({
      data: { id: 1, ...dto, fotoProfil: result.fotoProfil },
    });
    expect(writeFile).toHaveBeenCalled();
  });

  it('menangani create bersamaan sebagai konflik dan membersihkan foto baru', async () => {
    biografi.findUnique.mockResolvedValue(null);
    biografi.create.mockRejectedValueOnce({ code: 'P2002' });
    await expect(service.create(dto, file)).rejects.toThrow(ConflictException);
    expect(unlink).toHaveBeenCalledTimes(1);
  });

  it('menolak isi file yang bukan gambar', async () => {
    biografi.findUnique.mockResolvedValue(null);
    const invalid = { buffer: Buffer.from('not an image'), size: 12 } as Express.Multer.File;
    await expect(service.create(dto, invalid)).rejects.toThrow(BadRequestException);
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('membersihkan foto baru jika database gagal', async () => {
    biografi.findUnique.mockResolvedValue(null);
    biografi.create.mockRejectedValueOnce(new Error('DB failure'));
    await expect(service.create(dto, file)).rejects.toThrow('DB failure');
    expect(unlink).toHaveBeenCalledTimes(1);
  });

  it('memperbarui profil yang sama tanpa ID dari klien', async () => {
    const result = await service.update({ phoneNumber: '+6289876543210' });
    expect(biografi.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { phoneNumber: '+6289876543210' },
    });
    expect(result.phoneNumber).toBe('+6289876543210');
    expect(unlink).not.toHaveBeenCalled();
  });

  it('memvalidasi jam PATCH terhadap data lama', async () => {
    await expect(service.update({ jamBuka: '18:00' })).rejects.toThrow(BadRequestException);
    expect(biografi.update).not.toHaveBeenCalled();
  });

  it('menolak PATCH kosong', async () => {
    await expect(service.update({})).rejects.toThrow(BadRequestException);
  });

  it('tidak membuat data baru lewat PATCH sebelum pengisian awal', async () => {
    biografi.findUnique.mockResolvedValue(null);
    await expect(service.update({ alamat: 'Baru' })).rejects.toThrow(NotFoundException);
    expect(biografi.update).not.toHaveBeenCalled();
  });

  it('mengganti foto dan membersihkan foto lama', async () => {
    await service.update({}, file);
    expect(unlink).toHaveBeenCalledWith(expect.stringContaining('biografi-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.webp'));
  });

  it('tidak menghapus foto lama jika update database gagal', async () => {
    biografi.update.mockRejectedValueOnce(new Error('DB failure'));
    await expect(service.update({}, file)).rejects.toThrow('DB failure');
    expect(unlink).toHaveBeenCalledTimes(1);
    expect(unlink).not.toHaveBeenCalledWith(expect.stringContaining('biografi-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.webp'));
  });

  it('menghapus profil tunggal dan fotonya', async () => {
    await service.remove();
    expect(biografi.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(unlink).toHaveBeenCalledTimes(1);
  });

  it('mengubah P2025 menjadi 404', async () => {
    biografi.delete.mockRejectedValueOnce({ code: 'P2025' });
    await expect(service.remove()).rejects.toThrow(NotFoundException);
    expect(unlink).not.toHaveBeenCalled();
  });
});
