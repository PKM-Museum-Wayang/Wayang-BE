import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../guards/jwtguard';
import { PesanKontakController } from './pesan-kontak.controller';
import { PesanKontakService } from './pesan-kontak.service';

describe('PesanKontakController', () => {
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  let controller: PesanKontakController;

  beforeEach(() => {
    jest.resetAllMocks();
    controller = new PesanKontakController(service as unknown as PesanKontakService);
  });

  it('mengizinkan POST publik tetapi melindungi data pribadi pada semua operasi admin', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, PesanKontakController.prototype.create)).toBeUndefined();
    for (const method of ['findAll', 'findOne', 'update', 'remove'] as const) {
      expect(Reflect.getMetadata(GUARDS_METADATA, PesanKontakController.prototype[method])).toContain(JwtAuthGuard);
    }
  });

  it('mengembalikan daftar dan pagination di tingkat respons', async () => {
    service.findAll.mockResolvedValue({ data: [{ id: 1 }], pagination: { total: 1 } });
    const result = await controller.findAll({});
    expect(result.data).toEqual([{ id: 1 }]);
    expect(result.pagination).toEqual({ total: 1 });
  });

  it('mengembalikan hanya ID setelah POST', async () => {
    service.create.mockResolvedValue({ id: 1 });
    expect(await controller.create({})).toEqual({
      success: true, statusCode: 201, message: 'Pesan berhasil dikirim.', data: { id: 1 },
    });
  });
});
