import { BiografiController } from './biografi.controller';
import { BiografiService } from './biografi.service';

describe('BiografiController singleton', () => {
  const profile = { id: 1, namaPemilikKoleksi: 'Pemilik' };
  const service = {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  let controller: BiografiController;

  beforeEach(() => {
    jest.resetAllMocks();
    service.findOne.mockResolvedValue(profile);
    service.create.mockResolvedValue(profile);
    service.update.mockResolvedValue(profile);
    controller = new BiografiController(service as unknown as BiografiService);
  });

  it('GET mengembalikan satu objek tanpa membutuhkan ID', async () => {
    const result = await controller.findOne();
    expect(result.data).toEqual(profile);
    expect(Array.isArray(result.data)).toBe(false);
    expect(service.findOne).toHaveBeenCalledWith();
  });

  it('POST meneruskan pengisian awal', async () => {
    const body = { namaPemilikKoleksi: 'Pemilik' };
    expect((await controller.create(body)).statusCode).toBe(201);
    expect(service.create).toHaveBeenCalledWith(body, undefined);
  });

  it('PATCH memperbarui profil tanpa parameter ID', async () => {
    const body = { alamat: 'Yogyakarta' };
    expect((await controller.update(body)).data).toEqual(profile);
    expect(service.update).toHaveBeenCalledWith(body, undefined);
  });

  it('DELETE menghapus profil tunggal', async () => {
    const result = await controller.remove();
    expect(service.remove).toHaveBeenCalledWith();
    expect(result.statusCode).toBe(200);
    expect(result).not.toHaveProperty('data');
  });
});
