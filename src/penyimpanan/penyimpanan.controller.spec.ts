import { Test, TestingModule } from '@nestjs/testing';
import { PenyimpananController } from './penyimpanan.controller';

describe('PenyimpananController', () => {
  let controller: PenyimpananController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PenyimpananController],
    }).compile();

    controller = module.get<PenyimpananController>(PenyimpananController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
