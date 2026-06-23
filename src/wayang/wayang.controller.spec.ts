import { Test, TestingModule } from '@nestjs/testing';
import { WayangController } from './wayang.controller';

describe('WayangController', () => {
  let controller: WayangController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WayangController],
    }).compile();

    controller = module.get<WayangController>(WayangController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
