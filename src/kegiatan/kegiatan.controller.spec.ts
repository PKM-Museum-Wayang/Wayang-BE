import { Test, TestingModule } from '@nestjs/testing';
import { KegiatanController } from './kegiatan.controller';

describe('KegiatanController', () => {
  let controller: KegiatanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KegiatanController],
    }).compile();

    controller = module.get<KegiatanController>(KegiatanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
