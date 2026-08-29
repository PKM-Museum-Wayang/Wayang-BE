import { Test, TestingModule } from '@nestjs/testing';
import { KegiatanService } from './kegiatan.service';

describe('KegiatanService', () => {
  let service: KegiatanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KegiatanService],
    }).compile();

    service = module.get<KegiatanService>(KegiatanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
