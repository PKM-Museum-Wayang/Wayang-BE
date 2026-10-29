import { BadRequestException } from '@nestjs/common';
import {
  createBiografiSchema,
  parseBiografi,
  updateBiografiSchema,
  validateJamBuka,
} from './biografi.dto';

const valid = {
  namaPemilikKoleksi: 'Pemilik Koleksi',
  email: 'pemilik@example.com',
  phoneNumber: '+6281234567890',
  alamat: 'Yogyakarta',
  hariMulai: 'SENIN',
  hariSelesai: 'SABTU',
  jamBuka: '08:00',
  jamTutup: '17:00',
};

describe('Validasi biografi', () => {
  it('menerima data lengkap dan URL sosial opsional', () => {
    expect(parseBiografi(createBiografiSchema, valid)).toEqual(valid);
  });

  it.each([
    { email: 'bukan-email' },
    { phoneNumber: 'nomor-tidak-valid' },
    { hariMulai: 'MONDAY' },
    { jamBuka: '24:00' },
    { jamTutup: '8:00' },
    { namaPemilikKoleksi: '  ' },
    { instagram: 'javascript:alert(1)' },
    { facebook: 'ftp://example.com' },
    { youtube: 'bukan-url' },
    { fotoProfil: '/storage/arbitrary.webp' },
  ])('menolak input tidak valid %j', (changes) => {
    expect(() => parseBiografi(createBiografiSchema, { ...valid, ...changes }))
      .toThrow(BadRequestException);
  });

  it('menerima PATCH phoneNumber', () => {
    expect(parseBiografi(updateBiografiSchema, { phoneNumber: '081234567890' }))
      .toEqual({ phoneNumber: '081234567890' });
  });

  it.each(['noWa', 'phonenumber'])('menolak field lama %s pada POST dan PATCH', (field) => {
    expect(() => parseBiografi(updateBiografiSchema, { [field]: '081234567890' }))
      .toThrow(BadRequestException);
    const { phoneNumber, ...withoutPhone } = valid;
    expect(() => parseBiografi(createBiografiSchema, { ...withoutPhone, [field]: phoneNumber }))
      .toThrow(BadRequestException);
  });

  it('menolak data wajib yang hilang', () => {
    expect(() => parseBiografi(createBiografiSchema, {})).toThrow(BadRequestException);
  });

  it('menerima PATCH parsial dan mengosongkan URL sosial menjadi null', () => {
    expect(parseBiografi(updateBiografiSchema, { instagram: '' }))
      .toEqual({ instagram: null });
    expect(parseBiografi(updateBiografiSchema, { youtube: null }))
      .toEqual({ youtube: null });
  });

  it('menerima URL http dan https', () => {
    const dto = { instagram: 'https://instagram.com/koleksi', facebook: 'http://facebook.com/koleksi' };
    expect(parseBiografi(updateBiografiSchema, dto)).toEqual(dto);
  });

  it('memvalidasi urutan jam', () => {
    expect(() => validateJamBuka('08:00', '17:00')).not.toThrow();
    expect(() => validateJamBuka('17:00', '08:00')).toThrow(BadRequestException);
    expect(() => validateJamBuka('08:00', '08:00')).toThrow(BadRequestException);
  });
});
