import { Test, TestingModule } from '@nestjs/testing';
import { WayangService } from './wayang.service';

describe('WayangService', () => {
  let service: WayangService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WayangService],
    }).compile();

    service = module.get<WayangService>(WayangService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
