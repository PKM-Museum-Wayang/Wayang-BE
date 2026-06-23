import { Test, TestingModule } from '@nestjs/testing';
import { PenyimpananService } from './penyimpanan.service';

describe('PenyimpananService', () => {
  let service: PenyimpananService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PenyimpananService],
    }).compile();

    service = module.get<PenyimpananService>(PenyimpananService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
